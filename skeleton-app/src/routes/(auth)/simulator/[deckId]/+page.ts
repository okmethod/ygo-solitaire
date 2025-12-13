import type { PageLoad } from "./$types";
import { loadDeckData } from "$lib/shared/utils/deckLoader";
import { gameFacade } from "$lib/application/GameFacade";

/**
 * New architecture page loader using GameFacade
 */
export const load: PageLoad = async ({ params, fetch }) => {
  const { deckId } = params;

  // Load deck data from API
  const deckData = await loadDeckData(deckId, fetch);

  // Extract card IDs from deck (数値ID対応)（T025）
  const deckCardIds: number[] = [];

  // Main deck monsters
  deckData.mainDeck.monsters.forEach((entry) => {
    for (let i = 0; i < entry.quantity; i++) {
      deckCardIds.push(entry.cardData.id); // 数値IDをそのまま使用
    }
  });

  // Main deck spells
  deckData.mainDeck.spells.forEach((entry) => {
    for (let i = 0; i < entry.quantity; i++) {
      deckCardIds.push(entry.cardData.id); // 数値IDをそのまま使用
    }
  });

  // Main deck traps
  deckData.mainDeck.traps.forEach((entry) => {
    for (let i = 0; i < entry.quantity; i++) {
      deckCardIds.push(entry.cardData.id); // 数値IDをそのまま使用
    }
  });

  console.log(`[PageLoad-V2] Initializing game with ${deckCardIds.length} cards`);

  // Initialize game with GameFacade
  gameFacade.initializeGame(deckCardIds);

  // Draw initial hand (5 cards)
  const drawResult = gameFacade.drawCard(5);
  if (!drawResult.success) {
    console.error("[PageLoad-V2] Failed to draw initial hand:", drawResult.error);
  }

  console.log("[PageLoad-V2] Initial state:", gameFacade.getGameState());

  return {
    deckId,
    deckName: deckData.name,
  };
};
