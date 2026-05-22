/**
 * ILLMChatRepository - LLM チャット用 Port 定義
 *
 * @architecture レイヤー間依存ルール - アプリ層 (Port)
 * - ROLE: インフラ層が実装すべき抽象インターフェース（契約）の定義
 * - ALLOWED: アプリ層の DTO 定義への依存
 * - FORBIDDEN: インフラ層への依存
 *
 * @module application/ports/ILLMChatRepository
 */

/** サポートする LLM プロバイダー */
export type LLMProvider = "stub" | "gemini" | "claude" | "groq";

/** チャット履歴の 1 件分のメッセージ */
export interface ChatMessage {
  readonly role: "user" | "model";
  readonly content: string;
}

/** streamChat のパラメータ */
export interface StreamChatParams {
  readonly appId: string;
  readonly systemPrompt?: string;
  readonly message: string;
  readonly history: ChatMessage[];
  readonly provider: LLMProvider;
}

/** あいことば（APIシークレット）の検証インターフェース */
export interface IAuthCheckRepository {
  /**
   * あいことばをサーバーで検証する。通信失敗時は false を返す
   *
   * @returns 認証成功なら true
   */
  verifyAppSecret(fetchFn: typeof fetch, secret: string): Promise<boolean>;
}

/** チャットストリーミング取得の抽象インターフェース */
export interface ILLMChatRepository {
  /**
   * チャットメッセージを送信し、SSE ストリームをチャンク単位で受信する
   *
   * @param onChunk - テキストチャンクを受け取るコールバック
   */
  streamChat(fetchFn: typeof fetch, params: StreamChatParams, onChunk: (text: string) => void): Promise<void>;
}
