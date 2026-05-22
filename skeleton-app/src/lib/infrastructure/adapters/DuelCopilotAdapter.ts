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
import type { ILLMChatRepository } from "$lib/application/ports/ILLMChatRepository";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { DeckData } from "$lib/application/types/deck";
import { buildDuelCopilotPrompt } from "./DuelCopilotContextBuilder";
import { getDefaultLLMChatRepository, getDefaultLLMProvider } from "./LLMProxyRepository";

class DuelCopilotAdapterImpl implements IDuelCopilotClient {
  constructor(private readonly chatRepo: ILLMChatRepository) {}

  async requestHint(deckData: DeckData, snapshot: GameSnapshot, onChunk: (text: string) => void): Promise<void> {
    const prompt = buildDuelCopilotPrompt(deckData, snapshot);
    await this.chatRepo.streamChat(
      fetch,
      {
        appId: "ygo-solitaire",
        systemPrompt: prompt.systemPrompt,
        message: prompt.message,
        history: [],
        provider: getDefaultLLMProvider(),
      },
      onChunk,
    );
  }
}

let instance: IDuelCopilotClient | null = null;

/** DuelCopilotAdapter の Singleton getter */
export function getDuelCopilotClient(): IDuelCopilotClient {
  if (!instance) instance = new DuelCopilotAdapterImpl(getDefaultLLMChatRepository());
  return instance;
}
