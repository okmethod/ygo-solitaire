/**
 * LLMProxyRepository - Port/Adapter パターンの Adapter (具象実装)
 *
 * multi-ai-gateway の /api/chat エンドポイントとの統合を提供する。
 *
 * @architecture インフラ層 (Adapter)
 * - ROLE: Port に従った具体的な技術実装（API 通信・SSE パース）
 * - ALLOWED: アプリ層の Port への依存
 * - FORBIDDEN: ドメイン層への直接依存
 *
 * @module infrastructure/adapters/LLMProxyRepository
 */

import { z } from "zod";
import type {
  IAuthCheckRepository,
  ILLMChatRepository,
  LLMProvider,
  StreamChatParams,
} from "$lib/application/ports/ILLMChatRepository";
import { getAppSecret } from "$lib/application/stores/appSecretStore";
import { constructRequestInit, fetchApi } from "$lib/infrastructure/utils/request";
import { getStubLLMChatRepository } from "./StubLLMChatRepository";

// ローカル開発時は Vite プロキシが "/api/*" を転送するため空文字のまま
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const pathAuth = `${BASE_URL}/api/auth`;
const pathChat = `${BASE_URL}/api/chat`;

const AuthResponseSchema = z.object({ authorized: z.boolean() });

// プロバイダー別 SSE テキスト抽出用スキーマ
const StubChunkSchema = z.object({ text: z.string() });
const ClaudeDeltaSchema = z.object({
  type: z.string(),
  delta: z.object({ type: z.string(), text: z.string() }).optional(),
});
const GeminiChunkSchema = z.object({
  candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string() })) }) })).min(1),
});
const GroqChunkSchema = z.object({
  choices: z.array(z.object({ delta: z.object({ content: z.string().nullable() }) })).min(1),
});

const LLM_PROVIDERS: readonly LLMProvider[] = ["stub", "gemini", "claude", "groq"];

/** 環境変数から LLMProvider を解決する。未設定または不正値の場合は "stub" を返す */
export function getDefaultLLMProvider(): LLMProvider {
  const value = import.meta.env.VITE_DEFAULT_LLM_PROVIDER as string | undefined;
  return LLM_PROVIDERS.includes(value as LLMProvider) ? (value as LLMProvider) : "stub";
}

/**
 * デフォルトプロバイダーに応じた ILLMChatRepository を返す
 *
 * stub の場合はバックエンド不要の StubLLMChatRepository を返す。
 */
export function getDefaultLLMChatRepository(): ILLMChatRepository {
  return getDefaultLLMProvider() === "stub" ? getStubLLMChatRepository() : getLLMChatRepository();
}

/** チャットエンドポイントの具象実装 */
class LLMChatRepository implements ILLMChatRepository {
  async streamChat(fetchFn: typeof fetch, params: StreamChatParams, onChunk: (text: string) => void): Promise<void> {
    const requestConfig: RequestInit = {
      ...constructRequestInit(),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Secret": getAppSecret(),
      },
      body: JSON.stringify({
        app_id: params.appId,
        system_prompt: params.systemPrompt,
        message: params.message,
        history: params.history,
        provider: params.provider,
      }),
    };

    const response = await fetchApi(fetchFn, pathChat, requestConfig);

    if (!response.body) {
      throw new Error(`LLM API error: HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.replace(/^event:\s*/, "").trim();
            continue;
          }
          if (line.trim() === "") {
            currentEvent = "";
            continue;
          }
          if (!line.startsWith("data:")) continue;

          if (currentEvent === "error") {
            const jsonStr = line.replace(/^data:\s*/, "").trim();
            let detail = "Stream error";
            try {
              const err = JSON.parse(jsonStr) as { detail?: string };
              detail = err.detail ?? detail;
            } catch {
              // ignore
            }
            // 429 レート制限を呼び出し元が識別できるよう正規化する
            throw new Error(detail.includes("429") ? "RATE_LIMIT" : detail);
          }

          const text = extractText(params.provider, line);
          if (text) onChunk(text);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/** SSE の `data:` 行から各プロバイダーのテキストチャンクを zod で抽出する */
function extractText(provider: LLMProvider, line: string): string | null {
  const jsonStr = line.replace(/^data:\s*/, "").trim();
  if (!jsonStr || jsonStr === "[DONE]") return null;

  try {
    const json: unknown = JSON.parse(jsonStr);
    switch (provider) {
      case "stub": {
        const parsed = StubChunkSchema.safeParse(json);
        return parsed.success ? parsed.data.text : null;
      }
      case "claude": {
        const parsed = ClaudeDeltaSchema.safeParse(json);
        if (!parsed.success) return null;
        // content_block_delta の text デルタのみを対象にする
        if (parsed.data.type === "content_block_delta" && parsed.data.delta?.type === "text_delta") {
          return parsed.data.delta.text;
        }
        return null;
      }
      case "gemini": {
        const parsed = GeminiChunkSchema.safeParse(json);
        return parsed.success ? (parsed.data.candidates[0]?.content.parts[0]?.text ?? null) : null;
      }
      case "groq": {
        const parsed = GroqChunkSchema.safeParse(json);
        return parsed.success ? (parsed.data.choices[0]?.delta.content ?? null) : null;
      }
    }
  } catch {
    // malformed JSON は無視
  }
  return null;
}

/** 認証エンドポイントの具象実装 */
class AuthCheckRepository implements IAuthCheckRepository {
  /** あいことばをサーバーで検証する。通信失敗時は false を返す */
  async verifyAppSecret(fetchFn: typeof fetch, secret: string): Promise<boolean> {
    try {
      const url = `${pathAuth}?secret=${encodeURIComponent(secret)}`;
      const requestConfig = { ...constructRequestInit(), method: "GET" };
      const response = await fetchApi(fetchFn, url, requestConfig);
      const data = AuthResponseSchema.parse(await response.json());
      return data.authorized;
    } catch {
      return false;
    }
  }
}

let chatInstance: ILLMChatRepository | null = null;
let authInstance: IAuthCheckRepository | null = null;

/** LLMChatRepository の Singleton getter */
export function getLLMChatRepository(): ILLMChatRepository {
  if (!chatInstance) chatInstance = new LLMChatRepository();
  return chatInstance;
}

/** AuthCheckRepository の Singleton getter */
export function getAuthCheckRepository(): IAuthCheckRepository {
  if (!authInstance) authInstance = new AuthCheckRepository();
  return authInstance;
}
