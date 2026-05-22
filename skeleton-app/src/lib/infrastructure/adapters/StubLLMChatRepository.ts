/**
 * StubLLMChatRepository - ネットワーク不要のスタブ実装
 *
 * バックエンドを起動せずにローカル開発・テストを可能にする。
 * VITE_DEFAULT_LLM_PROVIDER=stub のとき getDefaultLLMChatRepository が選択する。
 *
 * @architecture インフラ層 (Adapter)
 * @module infrastructure/adapters/StubLLMChatRepository
 */

import type { ILLMChatRepository, StreamChatParams } from "$lib/application/ports/ILLMChatRepository";

const STUB_CHUNKS = [
  "（スタブ応答）",
  "現在の",
  "盤面を",
  "確認しました。",
  "手札の",
  "ドローカードを",
  "優先的に",
  "発動して",
  "手札を",
  "増やし、",
  "勝利条件に",
  "必要な",
  "パーツを",
  "揃えてください。",
];

class StubLLMChatRepository implements ILLMChatRepository {
  async streamChat(_fetchFn: typeof fetch, _params: StreamChatParams, onChunk: (text: string) => void): Promise<void> {
    for (const text of STUB_CHUNKS) {
      await new Promise((r) => setTimeout(r, 80));
      onChunk(text);
    }
  }
}

let instance: ILLMChatRepository | null = null;

/** StubLLMChatRepository の Singleton getter */
export function getStubLLMChatRepository(): ILLMChatRepository {
  if (!instance) instance = new StubLLMChatRepository();
  return instance;
}
