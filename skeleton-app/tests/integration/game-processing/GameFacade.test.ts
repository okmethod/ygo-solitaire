/**
 * Unit tests for GameFacade
 */

import { describe, it, expect, beforeEach } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import type { DeckRecipe } from "$lib/application/types/deck";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { currentPhase } from "$lib/application/stores/derivedStores";
import { get } from "svelte/store";
import { ExodiaNonEffect } from "$lib/domain/effects/rules/monster/ExodiaNonEffect";

/**
 * テスト用ヘルパー: カードID配列からDeckRecipeを生成
 *
 * テストでは簡易的なDeckRecipeを作成するため、
 * カードIDのみを持つmainDeckエントリーとして扱う。
 */
function createTestDeckRecipe(cardIds: number[]): DeckRecipe {
  return {
    name: "Test Deck",
    mainDeck: cardIds.map((id) => ({
      id,
      quantity: 1,
    })),
    extraDeck: [],
  };
}

/**
 * テスト用ヘルパー: デッキから手札へカードを直接移動する
 *
 * GameFacade.drawCard()が削除されたため、テストで手札にカードを配置する際に使用。
 * ゲーム状態を直接操作してカードを移動する。
 */
function moveCardsToHand(count: number): void {
  const state = get(gameStateStore);
  const cardsToMove = state.zones.deck.slice(-count);
  const remainingDeck = state.zones.deck.slice(0, -count);

  gameStateStore.set({
    ...state,
    zones: {
      ...state.zones,
      deck: remainingDeck,
      hand: [
        ...state.zones.hand,
        ...cardsToMove.map((card) => ({
          ...card,
          location: "hand" as const,
        })),
      ],
    },
  });
}

describe("GameFacade", () => {
  let facade: GameFacade;

  beforeEach(() => {
    facade = new GameFacade();
  });

  describe("initializeGame", () => {
    it("should initialize game with given deck", () => {
      const deckCardIds = [12345678, 87654321, 12345678]; // 数値ID

      facade.initializeGame(createTestDeckRecipe(deckCardIds));

      const state = get(gameStateStore);
      expect(state.zones.deck.length).toBe(3);
      expect(state.zones.hand.length).toBe(0);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
    });

    it("should reset state when called multiple times", () => {
      facade.initializeGame(createTestDeckRecipe([12345678])); // 数値ID
      expect(get(gameStateStore).zones.deck.length).toBe(1);

      facade.initializeGame(createTestDeckRecipe([12345678, 87654321])); // 数値ID
      expect(get(gameStateStore).zones.deck.length).toBe(2);
    });
  });

  describe("advancePhase", () => {
    beforeEach(() => {
      facade.initializeGame(createTestDeckRecipe([1001, 1002, 1003]));
    });

    it("should advance from Draw to Standby", () => {
      expect(get(currentPhase)).toBe("Draw");

      const result = facade.advancePhase();

      expect(result.success).toBe(true);
      expect(result.message).toContain("スタンバイフェイズ");
      expect(get(currentPhase)).toBe("Standby");
    });

    it("should advance through all phases", () => {
      facade.advancePhase(); // Draw → Standby
      expect(get(currentPhase)).toBe("Standby");

      facade.advancePhase(); // Standby → Main1
      expect(get(currentPhase)).toBe("Main1");

      facade.advancePhase(); // Main1 → End
      expect(get(currentPhase)).toBe("End");

      facade.advancePhase(); // End → End (循環)
      expect(get(currentPhase)).toBe("End");
    });

    it("should fail when deck is empty in Draw phase", () => {
      facade.initializeGame(createTestDeckRecipe([])); // Empty deck

      const result = facade.advancePhase();

      expect(result.success).toBe(false);
      expect(result.error).toBe("ゲームは終了しています");
    });
  });

  describe("currentPhase store", () => {
    it("should return current phase via derivedStore", () => {
      facade.initializeGame(createTestDeckRecipe([1001]));

      expect(get(currentPhase)).toBe("Draw");

      facade.advancePhase();
      expect(get(currentPhase)).toBe("Standby");
    });
  });

  describe("getGameState", () => {
    it("should return current state snapshot", () => {
      facade.initializeGame(createTestDeckRecipe([1001, 1002]));

      const state = facade.getGameState();

      expect(state.zones.deck.length).toBe(2);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
    });
  });

  describe("activateSpell", () => {
    it("should successfully activate spell card from hand", () => {
      facade.initializeGame(createTestDeckRecipe([1001, 1002, 1003, 1001]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;
      const initialHandSize = state.zones.hand.length;

      const result = facade.activateSpell(cardInstanceId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Spell card activated");

      const newState = get(gameStateStore);
      expect(newState.zones.hand.length).toBe(initialHandSize - 1);
      expect(newState.zones.graveyard.length).toBe(1);
    });

    it("should fail when not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([1001, 1002])); // Need 2 cards: 1 for initial hand, 1 to draw
      moveCardsToHand(1);
      // Still in Draw phase

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = facade.activateSpell(cardInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("should fail when card is not in hand", () => {
      facade.initializeGame(createTestDeckRecipe([1001, 1002, 1003]));
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      const result = facade.activateSpell("non-existent-card-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("should not update store on failed activation", () => {
      facade.initializeGame(createTestDeckRecipe([1001]));
      const initialState = get(gameStateStore);

      facade.activateSpell("non-existent-card-id");

      const newState = get(gameStateStore);
      expect(newState).toEqual(initialState);
    });
  });

  describe("canActivateSpell", () => {
    it("should return true for spell card in hand during Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([1001, 1002, 1003])); // Need multiple cards
      moveCardsToHand(1);
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      // Verify we're in Main1 phase
      expect(get(currentPhase)).toBe("Main1");

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      expect(facade.canActivateSpell(cardInstanceId)).toBe(true);
    });

    it("should return false for card not in hand", () => {
      facade.initializeGame(createTestDeckRecipe([1001]));

      expect(facade.canActivateSpell("non-existent-id")).toBe(false);
    });

    it("should return false for card in wrong phase", () => {
      facade.initializeGame(createTestDeckRecipe([1001]));
      moveCardsToHand(1);
      // Still in Draw phase

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      expect(facade.canActivateSpell(cardInstanceId)).toBe(false);
    });
  });

  describe("summonMonster", () => {
    it("should successfully summon monster from hand", () => {
      // Use Exodia pieces (monster cards)
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]])); // Need extra cards in deck to avoid deck-out
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.summonMonster(monsterInstanceId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Monster summoned");

      const newState = get(gameStateStore);
      expect(newState.zones.hand.length).toBe(0);
      expect(newState.zones.mainMonsterZone.length).toBe(1);

      const summonedCard = newState.zones.mainMonsterZone[0];
      expect(summonedCard.instanceId).toBe(monsterInstanceId);
      expect(summonedCard.position).toBe("faceUp");
      expect(summonedCard.battlePosition).toBe("attack");
      expect(summonedCard.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      expect(state.normalSummonUsed).toBe(0);

      facade.summonMonster(monsterInstanceId);

      const newState = get(gameStateStore);
      expect(newState.normalSummonUsed).toBe(1);
    });

    it("should fail if summon limit reached", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]])); // Need extra cards
      moveCardsToHand(2);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      // First summon
      facade.summonMonster(firstMonsterInstanceId);

      // Second summon should fail (no summon rights left)
      const result = facade.summonMonster(secondMonsterInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("should fail if not in Main1 phase", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1]]));
      moveCardsToHand(1);
      // Don't advance phase - stay in Draw phase

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.summonMonster(monsterInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("should not update store on failure", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const initialHandSize = state.zones.hand.length;
      const initialMonsterZoneSize = state.zones.mainMonsterZone.length;

      // Try to summon non-existent card
      facade.summonMonster("non-existent-id");

      const newState = get(gameStateStore);
      expect(newState.zones.hand.length).toBe(initialHandSize);
      expect(newState.zones.mainMonsterZone.length).toBe(initialMonsterZoneSize);
    });
  });

  describe("setMonster", () => {
    it("should successfully set monster from hand to mainMonsterZone face-down", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setMonster(monsterInstanceId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Monster set");

      const newState = get(gameStateStore);
      expect(newState.zones.hand.length).toBe(0);
      expect(newState.zones.mainMonsterZone.length).toBe(1);

      const setCard = newState.zones.mainMonsterZone[0];
      expect(setCard.instanceId).toBe(monsterInstanceId);
      expect(setCard.position).toBe("faceDown");
      expect(setCard.battlePosition).toBe("defense");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed when setting a monster", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      expect(state.normalSummonUsed).toBe(0);

      facade.setMonster(monsterInstanceId);

      const newState = get(gameStateStore);
      expect(newState.normalSummonUsed).toBe(1);
    });

    it("should fail if summon limit reached", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(2);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      // First set
      facade.setMonster(firstMonsterInstanceId);

      // Second set should fail (no summon rights left)
      const result = facade.setMonster(secondMonsterInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("should fail if not in Main1 phase", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1]]));
      moveCardsToHand(1);
      // Don't advance phase - stay in Draw phase

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setMonster(monsterInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });
  });

  describe("setSpellTrap", () => {
    it("should successfully set normal spell to spellTrapZone face-down", () => {
      facade.initializeGame(createTestDeckRecipe([70368879, 70368879, 70368879])); // Upstart Goblin (spell)
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setSpellTrap(spellInstanceId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Card set");

      const newState = get(gameStateStore);
      expect(newState.zones.hand.length).toBe(0);
      expect(newState.zones.spellTrapZone.length).toBe(1);

      const setCard = newState.zones.spellTrapZone[0];
      expect(setCard.instanceId).toBe(spellInstanceId);
      expect(setCard.position).toBe("faceDown");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should set field spell to fieldZone", () => {
      facade.initializeGame(createTestDeckRecipe([67616300, 67616300, 67616300])); // Chicken Game (field spell)
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const fieldSpellInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setSpellTrap(fieldSpellInstanceId);

      expect(result.success).toBe(true);

      const newState = get(gameStateStore);
      expect(newState.zones.fieldZone.length).toBe(1);
      expect(newState.zones.spellTrapZone.length).toBe(0); // Should NOT go to spellTrapZone
      expect(newState.zones.fieldZone[0].instanceId).toBe(fieldSpellInstanceId);
    });

    it("should replace existing field spell when setting a new one", () => {
      facade.initializeGame(createTestDeckRecipe([67616300, 67616300, 67616300])); // Two Chicken Games
      moveCardsToHand(2);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const firstFieldSpellId = state.zones.hand[0].instanceId;
      const secondFieldSpellId = state.zones.hand[1].instanceId;

      // Set first field spell
      facade.setSpellTrap(firstFieldSpellId);

      const stateAfterFirst = get(gameStateStore);
      expect(stateAfterFirst.zones.fieldZone.length).toBe(1);
      expect(stateAfterFirst.zones.fieldZone[0].instanceId).toBe(firstFieldSpellId);

      // Set second field spell (should replace first)
      const result = facade.setSpellTrap(secondFieldSpellId);

      expect(result.success).toBe(true);

      const newState = get(gameStateStore);
      expect(newState.zones.fieldZone.length).toBe(1);
      expect(newState.zones.fieldZone[0].instanceId).toBe(secondFieldSpellId);
      expect(newState.zones.graveyard.length).toBe(1);
      expect(newState.zones.graveyard[0].instanceId).toBe(firstFieldSpellId);
    });

    it("should NOT consume normalSummonUsed when setting spell", () => {
      facade.initializeGame(createTestDeckRecipe([70368879, 70368879, 70368879])); // Upstart Goblin
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      expect(state.normalSummonUsed).toBe(0);

      facade.setSpellTrap(spellInstanceId);

      const newState = get(gameStateStore);
      expect(newState.normalSummonUsed).toBe(0); // Should NOT increment
    });

    it("should fail if not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([70368879, 70368879, 70368879])); // Upstart Goblin
      moveCardsToHand(1);
      // Don't advance phase - stay in Draw phase

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setSpellTrap(spellInstanceId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });
  });

  describe("canActivateIgnitionEffect", () => {
    it("should return true when ignition effect can be activated", () => {
      facade.initializeGame(createTestDeckRecipe([67616300, 67616300, 67616300])); // Chicken Game
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const chickenGameId = state.zones.hand[0].instanceId;

      // Activate Chicken Game (field spell)
      facade.activateSpell(chickenGameId);

      const newState = get(gameStateStore);
      const activatedChickenGameId = newState.zones.fieldZone[0].instanceId;

      // Check if ignition effect can be activated
      const canActivate = facade.canActivateIgnitionEffect(activatedChickenGameId);
      expect(canActivate).toBe(true);
    });

    it("should return false when card has no ignition effect", () => {
      facade.initializeGame(createTestDeckRecipe([70368879, 70368879, 70368879])); // Upstart Goblin (no ignition effect)
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const upstartId = state.zones.hand[0].instanceId;

      const canActivate = facade.canActivateIgnitionEffect(upstartId);
      expect(canActivate).toBe(false);
    });
  });

  describe("canSummonMonster", () => {
    it("should return true when monster can be summoned", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSummon = facade.canSummonMonster(monsterInstanceId);
      expect(canSummon).toBe(true);
    });

    it("should return false when summon limit reached", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(2);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      // First summon
      facade.summonMonster(firstMonsterInstanceId);

      // Check second summon (should be false - no summon rights left)
      const canSummon = facade.canSummonMonster(secondMonsterInstanceId);
      expect(canSummon).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1]]));
      moveCardsToHand(1);
      // Don't advance phase - stay in Draw phase

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSummon = facade.canSummonMonster(monsterInstanceId);
      expect(canSummon).toBe(false);
    });
  });

  describe("canSetMonster", () => {
    it("should return true when monster can be set", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSet = facade.canSetMonster(monsterInstanceId);
      expect(canSet).toBe(true);
    });

    it("should return false when summon limit reached", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1], exodiaIds[2]]));
      moveCardsToHand(2);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      // First set
      facade.setMonster(firstMonsterInstanceId);

      // Check second set (should be false - no summon rights left)
      const canSet = facade.canSetMonster(secondMonsterInstanceId);
      expect(canSet).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      const exodiaIds = ExodiaNonEffect.getExodiaPieceIds();
      facade.initializeGame(createTestDeckRecipe([exodiaIds[0], exodiaIds[1]]));
      moveCardsToHand(1);
      // Don't advance phase - stay in Draw phase

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSet = facade.canSetMonster(monsterInstanceId);
      expect(canSet).toBe(false);
    });
  });

  describe("canSetSpellTrap", () => {
    it("should return true when spell/trap can be set", () => {
      facade.initializeGame(createTestDeckRecipe([70368879, 70368879, 70368879])); // Upstart Goblin
      moveCardsToHand(1);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      const canSet = facade.canSetSpellTrap(spellInstanceId);
      expect(canSet).toBe(true);
    });

    it("should return false when spellTrapZone is full", () => {
      facade.initializeGame(
        createTestDeckRecipe([70368879, 70368879, 70368879, 70368879, 70368879, 70368879, 70368879]),
      ); // Upstart Goblin x7
      moveCardsToHand(6);
      facade.advancePhase(); // Draw -> Standby
      facade.advancePhase(); // Standby -> Main1

      const state = get(gameStateStore);

      // Set 5 spells (fill the zone)
      for (let i = 0; i < 5; i++) {
        facade.setSpellTrap(state.zones.hand[i].instanceId);
      }

      const newState = get(gameStateStore);
      const sixthSpellId = newState.zones.hand[0].instanceId;

      // Check if 6th spell can be set (should be false - zone is full)
      const canSet = facade.canSetSpellTrap(sixthSpellId);
      expect(canSet).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([70368879, 70368879, 70368879]));
      moveCardsToHand(1);
      // Don't advance phase - stay in Draw phase

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      const canSet = facade.canSetSpellTrap(spellInstanceId);
      expect(canSet).toBe(false);
    });
  });
});
