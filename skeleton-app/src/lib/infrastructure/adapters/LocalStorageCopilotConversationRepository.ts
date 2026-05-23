/**
 * LocalStorageCopilotConversationRepository - コパイロット会話履歴の localStorage 永続化
 *
 * @architecture インフラ層 (Adapter)
 * - ROLE: ICopilotConversationRepository を localStorage で実装する
 * - ALLOWED: アプリ層の Port への依存
 * - FORBIDDEN: プレゼン層への依存
 *
 * @module infrastructure/adapters/LocalStorageCopilotConversationRepository
 */

import type {
  ICopilotConversationRepository,
  CopilotConversationData,
} from "$lib/application/ports/ICopilotConversationRepository";

/** ICopilotConversationRepository の localStorage 実装 */
export class LocalStorageCopilotConversationRepository implements ICopilotConversationRepository {
  private static readonly KEY = "ygo_copilot_conversation";

  save(data: CopilotConversationData): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LocalStorageCopilotConversationRepository.KEY, JSON.stringify(data));
  }

  load(): CopilotConversationData | null {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(LocalStorageCopilotConversationRepository.KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CopilotConversationData;
    } catch {
      // 破損データは削除して null を返す
      localStorage.removeItem(LocalStorageCopilotConversationRepository.KEY);
      return null;
    }
  }

  clear(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(LocalStorageCopilotConversationRepository.KEY);
  }
}
