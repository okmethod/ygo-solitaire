/**
 * DuelCopilotService - デュエルコパイロットのユースケースサービス
 *
 * プロンプト組み立て・LLM呼び出し・会話履歴管理を担うアプリ層サービス。
 * インフラへの依存は ILLMChatRepository / ICopilotConversationRepository の Port 経由のみ。
 *
 * @architecture アプリ層 (Service)
 * - ROLE: コパイロット機能のユースケース実装
 * - ALLOWED: ドメイン層への依存、アプリ層 Port への依存
 * - FORBIDDEN: インフラ層への依存、プレゼン層への依存
 *
 * @module application/copilot/DuelCopilotService
 */

import type { ILLMChatRepository, ChatMessage, LLMProvider } from "$lib/application/ports/ILLMChatRepository";
import type { ICopilotConversationRepository } from "$lib/application/ports/ICopilotConversationRepository";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { DeckData } from "$lib/application/types/deck";
import { buildDuelCopilotPrompt, buildStateUpdatePrefix } from "./contextBuilder";

export class DuelCopilotService {
  private history: ChatMessage[] = [];
  private systemPrompt = "";

  constructor(
    private readonly chatRepo: ILLMChatRepository,
    private readonly storage: ICopilotConversationRepository,
    private readonly llmProvider: LLMProvider,
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
        provider: this.llmProvider,
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

  async sendMessage(message: string, snapshot: GameSnapshot, onChunk: (text: string) => void): Promise<void> {
    // requestHint が未実行の場合はコンテキストがないため何もしない
    if (this.history.length === 0) return;

    const messageWithContext = `${buildStateUpdatePrefix(snapshot)}\n\n## 質問\n${message}`;

    let fullResponse = "";
    await this.chatRepo.streamChat(
      fetch,
      {
        appId: "ygo-solitaire",
        systemPrompt: this.systemPrompt,
        message: messageWithContext,
        history: this.history,
        provider: this.llmProvider,
      },
      (chunk) => {
        fullResponse += chunk;
        onChunk(chunk);
      },
    );

    this.history = [
      ...this.history,
      { role: "user", content: messageWithContext },
      { role: "model", content: fullResponse },
    ];
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
