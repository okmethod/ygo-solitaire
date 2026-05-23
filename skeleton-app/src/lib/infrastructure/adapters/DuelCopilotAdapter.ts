/**
 * DuelCopilotAdapter - Port/Adapter パターンの Adapter (具象実装)
 *
 * IDuelCopilotClient を実装し、コンテキスト組み立てと LLM チャットリポジトリへの委譲を担う。
 *
 * @architecture インフラ層 (Adapter)
 * - ROLE: Port に従った具体的な技術実装
 * - ALLOWED: アプリ層の Port への依存、ドメイン層への依存
 * - FORBIDDEN: プレゼン層への依存
 *
 * @module infrastructure/adapters/DuelCopilotAdapter
 */

import type { IDuelCopilotClient } from "$lib/application/ports/IDuelCopilotClient";
import type { ILLMChatRepository, ChatMessage } from "$lib/application/ports/ILLMChatRepository";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { DeckData } from "$lib/application/types/deck";
import type { ICopilotConversationRepository } from "$lib/application/ports/ICopilotConversationRepository";
import { buildDuelCopilotPrompt } from "./DuelCopilotContextBuilder";
import { getDefaultLLMChatRepository, getDefaultLLMProvider } from "./LLMProxyRepository";
import { LocalStorageCopilotConversationRepository } from "./LocalStorageCopilotConversationRepository";

class DuelCopilotAdapterImpl implements IDuelCopilotClient {
  private history: ChatMessage[] = [];
  private systemPrompt = "";

  constructor(
    private readonly chatRepo: ILLMChatRepository,
    private readonly storage: ICopilotConversationRepository,
  ) {}

  async requestHint(deckData: DeckData, snapshot: GameSnapshot, onChunk: (text: string) => void): Promise<void> {
    this.history = [];
    const prompt = buildDuelCopilotPrompt(deckData, snapshot);
    this.systemPrompt = prompt.systemPrompt;

    let fullResponse = "";
    await this.chatRepo.streamChat(
      fetch,
      {
        appId: "ygo-solitaire",
        systemPrompt: this.systemPrompt,
        message: prompt.message,
        history: [],
        provider: getDefaultLLMProvider(),
      },
      (chunk) => {
        fullResponse += chunk;
        onChunk(chunk);
      },
    );

    this.history = [
      { role: "user", content: prompt.message },
      { role: "model", content: fullResponse },
    ];
    this.persist();
  }

  async sendMessage(message: string, onChunk: (text: string) => void): Promise<void> {
    // requestHint が未実行の場合はコンテキストがないため何もしない
    if (this.history.length === 0) return;

    let fullResponse = "";
    await this.chatRepo.streamChat(
      fetch,
      {
        appId: "ygo-solitaire",
        systemPrompt: this.systemPrompt,
        message,
        history: this.history,
        provider: getDefaultLLMProvider(),
      },
      (chunk) => {
        fullResponse += chunk;
        onChunk(chunk);
      },
    );

    this.history = [...this.history, { role: "user", content: message }, { role: "model", content: fullResponse }];
    this.persist();
  }

  getHistory(): ChatMessage[] {
    return this.history;
  }

  restoreHistory(): void {
    const data = this.storage.load();
    if (!data) return;
    this.systemPrompt = data.systemPrompt;
    this.history = data.history;
  }

  clearHistory(): void {
    this.history = [];
    this.systemPrompt = "";
    this.storage.clear();
  }

  private persist(): void {
    this.storage.save({ systemPrompt: this.systemPrompt, history: this.history });
  }
}

let instance: IDuelCopilotClient | null = null;

/** DuelCopilotAdapter の Singleton getter */
export function getDuelCopilotClient(): IDuelCopilotClient {
  if (!instance) {
    instance = new DuelCopilotAdapterImpl(
      getDefaultLLMChatRepository(),
      new LocalStorageCopilotConversationRepository(),
    );
  }
  return instance;
}
