/**
 * Unit tests for GameFacade
 */

import { describe, it, expect, beforeEach } from "vitest";
import { GameFacade } from "$lib/application/GameFacade";
import type { DeckRecipe } from "$lib/application/types/deck";
import { gameStateStore } from "$lib/application/stores/gameStateStore";
import { currentPhase } from "$lib/application/stores/derivedStores";
import { get } from "svelte/store";

// テスト用ヘルパー: カードID配列からDeckRecipeを生成
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

// テスト用ヘルパー: デッキから手札へカードを直接移動する
function drawCards(count: number): void {
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

// テスト用ヘルパー: Main1フェーズまで進める
function advanceToMain1Phase(facade: GameFacade): void {
  facade.advancePhase(); // Draw → Standby
  facade.advancePhase(); // Standby → Main1
}

// テスト用デッキパターン
const SIX_ANY_CARDS = [1001, 1002, 1003, 12345678, 87654321, 1001] as const;
const FIVE_DUMMY_MONSTERS = [12345678, 87654321, 12345678, 87654321, 12345678] as const;
const FIVE_DUMMY_SPELLS = [1001, 1002, 1003, 1001, 1002] as const;
const FIVE_NORMAL_SPELLS = [70368879, 70368879, 70368879, 70368879, 70368879] as const; // Upstart Goblin
const FIVE_FIELD_SPELLS = [67616300, 67616300, 67616300, 67616300, 67616300] as const; // Chicken Game

describe("GameFacade", () => {
  let facade: GameFacade;

  beforeEach(() => {
    facade = new GameFacade();
  });

  describe("initializeGame", () => {
    it("should initialize game with given deck", () => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));

      const state = get(gameStateStore);
      expect(state.zones.hand.length).toBe(5); // 初期手札5枚
      expect(state.zones.deck.length).toBe(1); // 残りデッキ1枚 (6 - 5 = 1)
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
    });

    it("should reset state when called multiple times", () => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));
      expect(get(gameStateStore).zones.deck.length).toBe(1);

      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS, SIX_ANY_CARDS[0]])); // もう1枚追加した別のデッキ
      expect(get(gameStateStore).zones.deck.length).toBe(2);
    });
  });

  describe("getGameState", () => {
    it("should return current state snapshot", () => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));

      const state = facade.getGameState();
      expect(state.zones.deck.length).toBe(1);
      expect(state.phase).toBe("Draw");
      expect(state.turn).toBe(1);
    });
  });

  describe("advancePhase", () => {
    beforeEach(() => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));
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
  });

  describe("canSummonMonster", () => {
    it("should return true when monster can be summoned", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSummon = facade.canSummonMonster(monsterInstanceId);
      expect(canSummon).toBe(true);
    });

    it("should return false when summon limit reached", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      facade.summonMonster(firstMonsterInstanceId); // 召喚1体目
      const canSummon = facade.canSummonMonster(secondMonsterInstanceId); // 召喚2体目
      expect(canSummon).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      // ドローフェイズのまま

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSummon = facade.canSummonMonster(monsterInstanceId);
      expect(canSummon).toBe(false);
    });
  });

  describe("summonMonster", () => {
    it("should successfully summon monster from hand", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const initialHandSize = state.zones.hand.length; // 5 initial + 1 moved = 6
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.summonMonster(monsterInstanceId);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Monster summoned");

      const updatedState = get(gameStateStore);
      expect(updatedState.zones.hand.length).toBe(initialHandSize - 1); // 1 card summoned
      expect(updatedState.zones.mainMonsterZone.length).toBe(1);

      const summonedCard = updatedState.zones.mainMonsterZone[0];
      expect(summonedCard.instanceId).toBe(monsterInstanceId);
      expect(summonedCard.position).toBe("faceUp");
      expect(summonedCard.battlePosition).toBe("attack");
      expect(summonedCard.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;
      expect(state.normalSummonUsed).toBe(0);

      facade.summonMonster(monsterInstanceId);
      const updatedState = get(gameStateStore);
      expect(updatedState.normalSummonUsed).toBe(1);
    });

    it("should fail if summon limit reached", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      facade.summonMonster(firstMonsterInstanceId); // 召喚1体目
      const result = facade.summonMonster(secondMonsterInstanceId); // 召喚2体目
      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("should fail if not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      // ドローフェイズのまま

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.summonMonster(monsterInstanceId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("should not update store on failure", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const initialHandSize = state.zones.hand.length;
      const initialMonsterZoneSize = state.zones.mainMonsterZone.length;

      facade.summonMonster("non-existent-id");
      const updatedState = get(gameStateStore);
      expect(updatedState.zones.hand.length).toBe(initialHandSize);
      expect(updatedState.zones.mainMonsterZone.length).toBe(initialMonsterZoneSize);
    });
  });

  describe("canSetMonster", () => {
    it("should return true when monster can be set", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const canSet = facade.canSetMonster(monsterInstanceId);
      expect(canSet).toBe(true);
    });

    it("should return false when summon limit reached", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      facade.setMonster(firstMonsterInstanceId); // セット1体目
      const canSet = facade.canSetMonster(secondMonsterInstanceId); // セット2体目
      expect(canSet).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      // ドローフェイズのまま

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;
      const canSet = facade.canSetMonster(monsterInstanceId);
      expect(canSet).toBe(false);
    });
  });

  describe("setMonster", () => {
    it("should successfully set monster from hand to mainMonsterZone face-down", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const initialHandSize = state.zones.hand.length;
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setMonster(monsterInstanceId);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Monster set");

      const updatedState = get(gameStateStore);
      expect(updatedState.zones.hand.length).toBe(initialHandSize - 1);
      expect(updatedState.zones.mainMonsterZone.length).toBe(1);

      const setCard = updatedState.zones.mainMonsterZone[0];
      expect(setCard.instanceId).toBe(monsterInstanceId);
      expect(setCard.position).toBe("faceDown");
      expect(setCard.battlePosition).toBe("defense");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should increment normalSummonUsed when setting a monster", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;
      expect(state.normalSummonUsed).toBe(0);

      facade.setMonster(monsterInstanceId);
      const updatedState = get(gameStateStore);
      expect(updatedState.normalSummonUsed).toBe(1);
    });

    it("should fail if summon limit reached", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const firstMonsterInstanceId = state.zones.hand[0].instanceId;
      const secondMonsterInstanceId = state.zones.hand[1].instanceId;

      facade.setMonster(firstMonsterInstanceId); // セット1体目
      const result = facade.setMonster(secondMonsterInstanceId); // セット2体目
      expect(result.success).toBe(false);
      expect(result.error).toBe("召喚権がありません");
    });

    it("should fail if not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_MONSTERS]));
      // ドローフェイズのまま

      const state = get(gameStateStore);
      const monsterInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setMonster(monsterInstanceId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });
  });

  describe("canSetSpellTrap", () => {
    it("should return true when spell/trap can be set", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      const canSet = facade.canSetSpellTrap(spellInstanceId);
      expect(canSet).toBe(true);
    });
  });

  describe("setSpellTrap", () => {
    it("should successfully set normal spell to spellTrapZone face-down", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const initialHandSize = state.zones.hand.length;
      const spellInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setSpellTrap(spellInstanceId);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Card set");

      const updatedState = get(gameStateStore);
      expect(updatedState.zones.hand.length).toBe(initialHandSize - 1);
      expect(updatedState.zones.spellTrapZone.length).toBe(1);

      const setCard = updatedState.zones.spellTrapZone[0];
      expect(setCard.instanceId).toBe(spellInstanceId);
      expect(setCard.position).toBe("faceDown");
      expect(setCard.placedThisTurn).toBe(true);
    });

    it("should set field spell to fieldZone", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_FIELD_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const fieldSpellInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setSpellTrap(fieldSpellInstanceId);
      expect(result.success).toBe(true);

      const updatedState = get(gameStateStore);
      expect(updatedState.zones.fieldZone.length).toBe(1); // フィールドゾーンに置かれる
      expect(updatedState.zones.spellTrapZone.length).toBe(0); // 魔法・罠ゾーンには置かれない
      expect(updatedState.zones.fieldZone[0].instanceId).toBe(fieldSpellInstanceId);
    });

    it("should replace existing field spell when setting a new one", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_FIELD_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const firstFieldSpellId = state.zones.hand[0].instanceId;
      const secondFieldSpellId = state.zones.hand[1].instanceId;

      facade.setSpellTrap(firstFieldSpellId); // フィールド魔法セット1枚目

      const stateAfterFirst = get(gameStateStore);
      expect(stateAfterFirst.zones.fieldZone.length).toBe(1);
      expect(stateAfterFirst.zones.fieldZone[0].instanceId).toBe(firstFieldSpellId);

      const result = facade.setSpellTrap(secondFieldSpellId); // フィールド魔法セット2枚目
      expect(result.success).toBe(true);

      const updatedState = get(gameStateStore);
      expect(updatedState.zones.fieldZone.length).toBe(1);
      expect(updatedState.zones.fieldZone[0].instanceId).toBe(secondFieldSpellId); // フィールドにある
      expect(updatedState.zones.graveyard.length).toBe(1);
      expect(updatedState.zones.graveyard[0].instanceId).toBe(firstFieldSpellId); // 墓地にある
    });

    it("should NOT consume normalSummonUsed when setting spell", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;
      expect(state.normalSummonUsed).toBe(0);

      facade.setSpellTrap(spellInstanceId);
      const updatedState = get(gameStateStore);
      expect(updatedState.normalSummonUsed).toBe(0); // 変化なし
    });

    it("should fail if not in Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));
      // ドローフェイズのまま

      const state = get(gameStateStore);
      const spellInstanceId = state.zones.hand[0].instanceId;

      const result = facade.setSpellTrap(spellInstanceId);
      expect(result.success).toBe(false);
      expect(result.error).toBe("メインフェイズではありません");
    });
  });

  it("should return false when spellTrapZone is full", () => {
    facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS, FIVE_NORMAL_SPELLS[0]])); // 6枚デッキ
    advanceToMain1Phase(facade);
    drawCards(1); // 6枚目が必要

    const state = get(gameStateStore);

    // 5枚セットして魔法・罠ゾーンを埋める
    for (let i = 0; i < 5; i++) {
      facade.setSpellTrap(state.zones.hand[i].instanceId);
    }

    const updatedState = get(gameStateStore);
    const sixthSpellId = updatedState.zones.hand[0].instanceId;

    const canSet = facade.canSetSpellTrap(sixthSpellId); // 6枚目をセット
    expect(canSet).toBe(false);
  });

  it("should return false when not in Main1 phase", () => {
    facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));
    // ドローフェイズのまま

    const state = get(gameStateStore);
    const spellInstanceId = state.zones.hand[0].instanceId;

    const canSet = facade.canSetSpellTrap(spellInstanceId);
    expect(canSet).toBe(false);
  });

  describe("canActivateSpell", () => {
    it("should return true for spell card in hand during Main1 phase", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_DUMMY_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;
      expect(facade.canActivateSpell(cardInstanceId)).toBe(true);
    });

    it("should return false for card not in hand", () => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));

      expect(facade.canActivateSpell("non-existent-id")).toBe(false);
    });

    it("should return false for card in wrong phase", () => {
      // 登録済みカード（Upstart Goblin）を使用してメインフェイズチェックを行う
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;
      // ドローフェイズでは発動不可
      expect(facade.canActivateSpell(cardInstanceId)).toBe(false);
    });
  });

  describe("activateSpell", () => {
    it("should successfully activate spell card from hand", () => {
      // Use registered spell cards (Upstart Goblin) for proper effect processing
      // Need 6 cards: 5 for initial hand + 1 for Upstart Goblin's draw condition
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS, 70368879]));
      facade.advancePhase(); // Draw → Standby
      facade.advancePhase(); // Standby → Main1

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;
      const initialHandSize = state.zones.hand.length;

      const result = facade.activateSpell(cardInstanceId);
      expect(result.success).toBe(true);
      expect(result.message).toContain("Spell card activated");

      const updatedState = get(gameStateStore);
      // Card is removed from hand and placed on spellTrapZone
      expect(updatedState.zones.hand.length).toBe(initialHandSize - 1);
      expect(updatedState.zones.spellTrapZone.length).toBe(1);
      // Note: Graveyard step is in effectSteps, processed asynchronously by effectQueueStore
    });

    it("should fail when not in Main1 phase", () => {
      // 登録済みカード（Upstart Goblin）を使用してメインフェイズチェックを行う
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS]));

      const state = get(gameStateStore);
      const cardInstanceId = state.zones.hand[0].instanceId;

      const result = facade.activateSpell(cardInstanceId);
      expect(result.success).toBe(false);
      // Note: ValidationResult により具体的なエラーメッセージが返されるようになった
      expect(result.error).toBe("メインフェイズではありません");
    });

    it("should fail when card is not in hand", () => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));
      advanceToMain1Phase(facade);

      const result = facade.activateSpell("non-existent-card-id");
      expect(result.success).toBe(false);
      expect(result.error).toBe("カードが見つかりません");
    });

    it("should not update store on failed activation", () => {
      facade.initializeGame(createTestDeckRecipe([...SIX_ANY_CARDS]));

      const initialState = get(gameStateStore);
      facade.activateSpell("non-existent-card-id");

      const updatedState = get(gameStateStore);
      expect(updatedState).toEqual(initialState);
    });
  });

  describe("canActivateIgnitionEffect", () => {
    it("should return true when ignition effect can be activated", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_FIELD_SPELLS]));
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const chickenGameId = state.zones.hand[0].instanceId;

      facade.activateSpell(chickenGameId);
      const updatedState = get(gameStateStore);
      const activatedChickenGameId = updatedState.zones.fieldZone[0].instanceId;

      const canActivate = facade.canActivateIgnitionEffect(activatedChickenGameId);
      expect(canActivate).toBe(true);
    });

    it("should return false when card has no ignition effect", () => {
      facade.initializeGame(createTestDeckRecipe([...FIVE_NORMAL_SPELLS])); // no ignition effect
      advanceToMain1Phase(facade);

      const state = get(gameStateStore);
      const upstartId = state.zones.hand[0].instanceId;

      const canActivate = facade.canActivateIgnitionEffect(upstartId);
      expect(canActivate).toBe(false);
    });
  });

  // TODO: activateIgnitionEffect のテストケースを追加する
});
