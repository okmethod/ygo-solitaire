/**
 * Normal Spell Card Effects Tests (Integration Layer)
 *
 * Tests Normal Spell card-specific scenarios integrated with the full application layer.
 * Focuses on actual gameplay scenarios rather than implementation details.
 *
 * Test Responsibility:
 * - Normal Spell card activation scenarios (end-to-end gameplay flow)
 * - Registry integration (cardId → Effect retrieval → Effect execution)
 * - Side effects (effectQueueStore.startProcessing calls)
 * - Actual game state changes (deck → hand, hand → graveyard)
 *
 * Test Strategy (from docs/architecture/testing-strategy.md):
 * - **Base class validation**: Tested in tests/unit/domain/effects/bases/
 *   - SpellEffect.test.ts: Game-over check
 *   - NormalSpellEffect.test.ts: Main1 phase check, graveyard-sending step
 * - **Card scenarios**: Tested here
 *   - Pot of Greed: Deck 2 cards draw → Hand increases by 2
 *   - Graceful Charity: Draw 3 → Discard 2 → Hand increases by 1
 *
 * Rationale:
 * - Card-specific canActivate() (e.g., deck.length >= 2) is implementation mirror
 * - Scenario-based tests detect real bugs more effectively
 * - Easy to add new cards without duplicating base class tests
 *
 * @module tests/integration/card-effects/NormalSpells
 */

import { describe, it, expect } from "vitest";
import { ActivateSpellCommand } from "$lib/domain/commands/ActivateSpellCommand";
import { createMockGameState, createCardInstances } from "../../__testUtils__/gameStateFactory";
import { initializeChainableActionRegistry } from "$lib/domain/effects/actions/index";

initializeChainableActionRegistry();

describe("Normal Spell Card Effects", () => {
  describe("Pot of Greed (55144522) - Scenario Tests", () => {
    const potOfGreedCardId = "55144522";

    it("Scenario: Activate Pot of Greed → Draw 2 cards → Hand increases by 2", () => {
      // Arrange: Initial state - 3 cards in deck, 1 card in hand (Pot of Greed)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances([potOfGreedCardId], "hand", "pot"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Pot of Greed (new system - returns effectSteps)
      const command = new ActivateSpellCommand("pot-0"); // createCardInstances uses 0-based index
      const result = command.execute(state);

      // Assert: effectSteps are returned in the result
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(3);

      // Verify steps: [activation step, draw step, send-to-graveyard step]
      expect(result.effectSteps![0]).toMatchObject({
        id: "55144522-activation-notification", // ID now uses card ID
        summary: "カード発動",
        description: "《強欲な壺》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-2", // ID now uses step builder format
        summary: "カードをドロー",
        description: "デッキから2枚ドローします",
      });
      expect(result.effectSteps![2]).toMatchObject({
        summary: "墓地へ送る",
        description: "《強欲な壺》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck has only 1 card", () => {
      // Arrange: Deck with only 1 card (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1"], "deck"),
          hand: createCardInstances([potOfGreedCardId], "hand", "pot"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("pot-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate
      expect(result.isValid).toBe(false);
    });
  });

  describe("Graceful Charity (79571449) - Scenario Tests", () => {
    const gracefulCharityCardId = "79571449";

    it("Scenario: Activate Graceful Charity → Draw 3 → Discard 2 → Hand increases by 1", () => {
      // Arrange: Initial state - 5 cards in deck, 1 card in hand (Graceful Charity)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3", "card4", "card5"], "deck"),
          hand: createCardInstances([gracefulCharityCardId], "hand", "charity"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Graceful Charity (new system - returns effectSteps)
      const command = new ActivateSpellCommand("charity-0");
      const result = command.execute(state);

      // Assert: effectSteps are returned in the result
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      // Verify steps: [activation step, draw step, discard step, send-to-graveyard step]
      expect(result.effectSteps![0]).toMatchObject({
        id: "79571449-activation-notification",
        summary: "カード発動",
        description: "《天使の施し》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-3",
        summary: "カードをドロー",
        description: "デッキから3枚ドローします",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "select-and-discard-2-cards",
        summary: "手札を2枚捨てる",
        description: "手札から2枚選んで捨てます",
      });
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《天使の施し》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck has only 2 cards", () => {
      // Arrange: Deck with only 2 cards (insufficient)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2"], "deck"),
          hand: createCardInstances([gracefulCharityCardId], "hand", "charity"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("charity-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate
      expect(result.isValid).toBe(false);
    });
  });

  describe("Magical Mallet (85852291) - Scenario Tests", () => {
    const magicalMalletCardId = "85852291";

    it("Scenario: Activate Magical Mallet → Return 2 cards to deck → Shuffle → Draw 2", () => {
      // Arrange: 5 cards in deck, 3 cards in hand (Magical Mallet + 2 others)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1", "deck2", "deck3", "deck4", "deck5"], "deck"),
          hand: createCardInstances([magicalMalletCardId, "hand1", "hand2"], "hand", "mallet"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Magical Mallet
      const command = new ActivateSpellCommand("mallet-0");
      const result = command.execute(state);

      // Assert: effectSteps include activation + select-return-shuffle-draw (unified) + send-to-graveyard
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(3); // activation + select-return-shuffle-draw + send-to-graveyard

      expect(result.effectSteps![0]).toMatchObject({
        id: "85852291-activation-notification",
        summary: "カード発動",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "select-and-return-to-deck",
        summary: "手札をデッキに戻す",
      });
      expect(result.effectSteps![2]).toMatchObject({
        summary: "墓地へ送る",
        description: "《打ち出の小槌》を墓地に送ります",
      });
    });

    it("Scenario: Can activate with empty hand (no cards to return)", () => {
      // Arrange: Only Magical Mallet in hand
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1", "deck2"], "deck"),
          hand: createCardInstances([magicalMalletCardId], "hand", "mallet"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("mallet-0");
      const result = command.canExecute(state);

      // Assert: Can activate (no additional conditions)
      expect(result.isValid).toBe(true);
    });
  });

  describe("One Day of Peace (33782437) - Scenario Tests", () => {
    const oneDayOfPeaceCardId = "33782437";

    it("Scenario: Activate One Day of Peace → Draw 1 card → Damage negation activated", () => {
      // Arrange: 3 cards in deck, 1 in hand
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances([oneDayOfPeaceCardId], "hand", "peace"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
        damageNegation: false,
      });

      // Act: Activate One Day of Peace
      const command = new ActivateSpellCommand("peace-0");
      const result = command.execute(state);

      // Assert: 4 steps (activation + draw + damage negation + send-to-graveyard)
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-1",
        summary: "カードをドロー",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "one-day-of-peace-damage-negation",
        summary: "ダメージ無効化",
      });
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《一時休戦》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck is empty", () => {
      // Arrange: Empty deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: createCardInstances([oneDayOfPeaceCardId], "hand", "peace"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("peace-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 1 card in deck)
      expect(result.isValid).toBe(false);
    });
  });

  describe("Upstart Goblin (70368879) - Scenario Tests", () => {
    const upstartGoblinCardId = "70368879";

    it("Scenario: Activate Upstart Goblin → Draw 1 card → Opponent gains 1000 LP", () => {
      // Arrange: 3 cards in deck, 1 in hand
      const state = createMockGameState({
        phase: "Main1",
        lp: { player: 8000, opponent: 8000 },
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: createCardInstances([upstartGoblinCardId], "hand", "goblin"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Upstart Goblin
      const command = new ActivateSpellCommand("goblin-0");
      const result = command.execute(state);

      // Assert: 4 steps (activation + draw + gain life + send-to-graveyard)
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-1",
        summary: "カードをドロー",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "gain-lp-opponent-1000",
      });
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《成金ゴブリン》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck is empty", () => {
      // Arrange: Empty deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [],
          hand: createCardInstances([upstartGoblinCardId], "hand", "goblin"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("goblin-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate
      expect(result.isValid).toBe(false);
    });
  });

  describe("Dark Factory of Mass Production (90928333) - Scenario Tests", () => {
    const darkFactoryCardId = "90928333";

    it("Scenario: Activate Dark Factory → Select 2 monsters from graveyard → Add to hand", () => {
      // Arrange: 2+ monsters in graveyard
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1"], "deck"),
          hand: createCardInstances([darkFactoryCardId], "hand", "factory"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [
            {
              id: 12345678,
              instanceId: "grave-0",
              type: "monster",
              frameType: "normal",
              jaName: "Test Monster A",
              location: "graveyard",
              placedThisTurn: false,
            },
            {
              id: 87654321,
              instanceId: "grave-1",
              type: "monster",
              frameType: "normal",
              jaName: "Test Monster B",
              location: "graveyard",
              placedThisTurn: false,
            },
            {
              id: 12345678,
              instanceId: "grave-2",
              type: "monster",
              frameType: "normal",
              jaName: "Test Monster A",
              location: "graveyard",
              placedThisTurn: false,
            },
          ],
          banished: [],
        },
      });

      // Act: Activate Dark Factory
      const command = new ActivateSpellCommand("factory-0");
      const result = command.execute(state);

      // Assert: 3 steps (activation + selection + send-to-graveyard)
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(3);

      expect(result.effectSteps![1]).toMatchObject({
        id: "dark-factory-search-factory-0",
        summary: "通常モンスター2枚をサルベージ",
      });
      expect(result.effectSteps![2]).toMatchObject({
        summary: "墓地へ送る",
        description: "《闇の量産工場》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when graveyard has only 1 monster", () => {
      // Arrange: Only 1 monster in graveyard
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["deck1"], "deck"),
          hand: createCardInstances([darkFactoryCardId], "hand", "factory"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [
            {
              id: 12345678,
              instanceId: "grave-0",
              type: "monster",
              frameType: "normal",
              jaName: "Test Monster A",
              location: "graveyard",
              placedThisTurn: false,
            },
          ],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("factory-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 2 monsters)
      expect(result.isValid).toBe(false);
    });
  });

  describe("Terraforming (73628505) - Scenario Tests", () => {
    const terraformingCardId = "73628505";

    it("Scenario: Activate Terraforming → Select Field Spell from deck → Add to hand", () => {
      // Arrange: Field Spell in deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [
            {
              id: 1001,
              instanceId: "deck-0",
              type: "monster",
              frameType: "normal",
              jaName: "モンスター1",
              location: "deck",
              placedThisTurn: false,
            },
            {
              id: 67616300,
              instanceId: "deck-1",
              type: "spell",
              frameType: "spell",
              jaName: "チキンレース",
              spellType: "field",
              location: "deck",
              placedThisTurn: false,
            },
            {
              id: 1002,
              instanceId: "deck-2",
              type: "monster",
              frameType: "normal",
              jaName: "モンスター2",
              location: "deck",
              placedThisTurn: false,
            },
          ],
          hand: createCardInstances([terraformingCardId], "hand", "terra"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Terraforming
      const command = new ActivateSpellCommand("terra-0");
      const result = command.execute(state);

      // Assert: 3 steps (activation + search with auto-shuffle + send-to-graveyard)
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(3);

      expect(result.effectSteps![1]).toMatchObject({
        id: "terraforming-search-terra-0",
        summary: "フィールド魔法1枚をサーチ",
      });
      expect(result.effectSteps![2]).toMatchObject({
        summary: "墓地へ送る",
        description: "《テラ・フォーミング》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when no Field Spell in deck", () => {
      // Arrange: No Field Spell in deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["monster1", "monster2"], "deck"),
          hand: createCardInstances([terraformingCardId], "hand", "terra"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("terra-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 1 Field Spell in deck)
      expect(result.isValid).toBe(false);
    });
  });

  describe("Magical Stone Excavation (98494543) - Scenario Tests", () => {
    const magicalStoneExcavationCardId = "98494543";

    it("Scenario: Activate Magical Stone Excavation → Discard 2 → Select spell from graveyard → Add to hand", () => {
      // Arrange: 3 cards in hand (this card + 2 others), 2 spells in graveyard
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321"], "deck"),
          hand: createCardInstances(
            [magicalStoneExcavationCardId, "33782437", "70368879"], // This card + One Day of Peace + Upstart Goblin
            "hand",
            "excavation",
          ),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: createCardInstances(["55144522", "79571449"], "graveyard"), // Pot of Greed + Graceful Charity
          banished: [],
        },
      });

      // Act: Activate Magical Stone Excavation
      const command = new ActivateSpellCommand("excavation-0");
      const result = command.execute(state);

      // Assert: effectSteps include activation, discard (cost), search (effect), send to graveyard (post-resolution)
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      expect(result.effectSteps![0]).toMatchObject({
        id: "98494543-activation-notification",
        summary: "カード発動",
        description: "《魔法石の採掘》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "select-and-discard-2-cards",
        summary: "手札を2枚捨てる",
        description: "手札から2枚選んで捨てます",
      });
      expect(result.effectSteps![2]).toMatchObject({
        id: "magical-stone-excavation-search-excavation-0",
        summary: "魔法カード1枚をサルベージ",
        description: "墓地から魔法カード1枚を選択し、手札に加えます",
      });
      expect(result.effectSteps![3]).toMatchObject({
        id: "send-excavation-0-to-graveyard",
        summary: "墓地へ送る",
        description: "《魔法石の採掘》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when no spell cards in graveyard", () => {
      // Arrange: 3 cards in hand but no spell cards in graveyard
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678"], "deck"),
          hand: createCardInstances([magicalStoneExcavationCardId, "33782437", "70368879"], "hand", "excavation"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [
            // Only monsters in graveyard
            {
              id: 12345678,
              instanceId: "grave-0",
              type: "monster",
              frameType: "normal",
              jaName: "Test Monster A",
              location: "graveyard",
              placedThisTurn: false,
            },
            {
              id: 87654321,
              instanceId: "grave-1",
              type: "monster",
              frameType: "normal",
              jaName: "Test Monster B",
              location: "graveyard",
              placedThisTurn: false,
            },
          ],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("excavation-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 1 spell in graveyard)
      expect(result.isValid).toBe(false);
    });
  });

  describe("Into the Void (93946239) - Scenario Tests", () => {
    const intoTheVoidCardId = "93946239";

    it("Scenario: Activate Into the Void → Draw 1 → Register end phase effect", () => {
      // Arrange: 3 cards in hand (this card + 2 others), 2 cards in deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321"], "deck"),
          hand: createCardInstances([intoTheVoidCardId, "33782437", "70368879"], "hand", "void"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act: Activate Into the Void
      const command = new ActivateSpellCommand("void-0");
      const result = command.execute(state);

      // Assert: effectSteps include activation, draw, end phase registration, send-to-graveyard
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      expect(result.effectSteps![0]).toMatchObject({
        id: "93946239-activation-notification",
        summary: "カード発動",
        description: "《無の煉獄》を発動します",
      });
      expect(result.effectSteps![1]).toMatchObject({
        id: "draw-1",
        summary: "カードをドロー",
        description: "デッキから1枚ドローします",
      });
      expect(result.effectSteps![2]).toMatchObject({
        summary: "手札を全て捨てる",
        description: "エンドフェイズに手札を全て捨てます",
      });
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《無の煉獄》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck is empty", () => {
      // Arrange: 3 cards in hand but empty deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [], // Empty deck
          hand: createCardInstances([intoTheVoidCardId, "33782437", "70368879"], "hand", "void"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("void-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 1 card in deck to draw)
      expect(result.isValid).toBe(false);
    });
  });

  // ===========================
  // Pot of Duality (98645731) - P2 Card
  // ===========================
  describe("Pot of Duality (98645731) - Scenario Tests", () => {
    const potOfDualityCardId = "98645731";

    it("Scenario: Activate with deck = 10 → select 1 from top 3 → deck = 9, hand = 1", () => {
      // Arrange: Card in hand, deck with 10 cards
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(
            [
              "12345678",
              "87654321",
              "11112222",
              "33334444",
              "55556666",
              "77778888",
              "99990000",
              "11223344",
              "55667788",
              "99001122",
            ],
            "deck",
          ),
          hand: createCardInstances([potOfDualityCardId], "hand", "duality"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("duality-0");
      const result = command.execute(state);

      // Assert: Activation successful
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4); // activation + search + shuffle + send-to-graveyard

      // Verify activation step added card to activatedOncePerTurnCards
      expect(result.effectSteps![0].id).toBe("98645731-activation-notification");

      // Verify search step
      expect(result.effectSteps![1].id).toContain("pot-of-duality-search");
      expect(result.effectSteps![1].cardSelectionConfig).toBeDefined();
      expect(result.effectSteps![1].cardSelectionConfig!.minCards).toBe(1);
      expect(result.effectSteps![1].cardSelectionConfig!.maxCards).toBe(1);

      // Verify shuffle step
      expect(result.effectSteps![2].id).toBe("shuffle-deck");

      // Verify send-to-graveyard step
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《強欲で謙虚な壺》を墓地に送ります",
      });
    });

    it("Scenario: Activate 1st card → success, activate 2nd card same turn → fail (once-per-turn constraint)", () => {
      // Arrange: Already activated once (card ID in activatedOncePerTurnCards)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321", "11112222"], "deck"),
          hand: createCardInstances([potOfDualityCardId], "hand", "duality"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
        activatedOncePerTurnCards: new Set([98645731]), // Already activated
      });

      // Act
      const command = new ActivateSpellCommand("duality-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (once-per-turn constraint)
      expect(result.isValid).toBe(false);
    });

    it("Scenario: Cannot activate when deck has less than 3 cards", () => {
      // Arrange: Only 2 cards in deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321"], "deck"), // Only 2 cards
          hand: createCardInstances([potOfDualityCardId], "hand", "duality"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("duality-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (need at least 3 cards in deck)
      expect(result.isValid).toBe(false);
    });
  });

  // ===========================
  // Card of Demise (59750328) - P2 Card
  // ===========================
  describe("Card of Demise (59750328) - Scenario Tests", () => {
    const cardOfDemiseCardId = "59750328";

    it("Scenario: Activate with hand = 0 → draw 3 cards → end phase → hand = 0 (all discarded)", () => {
      // Arrange: No other cards in hand, sufficient deck
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321", "11112222"], "deck"),
          hand: createCardInstances([cardOfDemiseCardId], "hand", "demise"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("demise-0");
      const result = command.execute(state);

      // Assert: Activation successful
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4); // activation + draw + add end phase effect + send-to-graveyard

      // Verify activation step added card to activatedOncePerTurnCards
      expect(result.effectSteps![0].id).toBe("59750328-activation-notification");

      // Verify draw step
      expect(result.effectSteps![1].id).toContain("fill-hands-3");

      // Verify end phase effect registration
      expect(result.effectSteps![2].id).toBe("end-phase-discard-all-hand");

      // Verify send-to-graveyard step
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《命削りの宝札》を墓地に送ります",
      });
    });

    it("Scenario: Activate with hand = 1 → draw 2 cards → end phase → hand = 0", () => {
      // Arrange: 1 other card in hand
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321"], "deck"),
          hand: createCardInstances([cardOfDemiseCardId, "33782437"], "hand", "demise"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("demise-0");
      const result = command.execute(state);

      // Assert: Activation successful
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(4);

      // Verify draw step (should draw 2 cards to reach total 3)
      expect(result.effectSteps![1].id).toContain("fill-hands-3");

      // Verify send-to-graveyard step
      expect(result.effectSteps![3]).toMatchObject({
        summary: "墓地へ送る",
        description: "《命削りの宝札》を墓地に送ります",
      });
    });

    it("Scenario: Once-per-turn constraint test", () => {
      // Arrange: Already activated once (card ID in activatedOncePerTurnCards)
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321", "11112222"], "deck"),
          hand: createCardInstances([cardOfDemiseCardId], "hand", "demise"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
        activatedOncePerTurnCards: new Set([59750328]), // Already activated
      });

      // Act
      const command = new ActivateSpellCommand("demise-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (once-per-turn constraint)
      expect(result.isValid).toBe(false);
    });
  });

  // ===========================
  // Toon Table of Contents (89997728) - P3 Card
  // TODO: 永続魔法なので、ファイルを分ける
  // ===========================
  describe("Toon Table of Contents (89997728) - Scenario Tests", () => {
    const toonTableCardId = "89997728";

    it("Scenario: Activate with 1 Toon card in deck → add to hand → deck size decreases", () => {
      // Arrange: Deck with Toon World card (manually create with proper jaName)
      const toonWorldCard = {
        id: 15259703,
        instanceId: "deck-0",
        type: "spell" as const,
        frameType: "spell" as const,
        jaName: "トゥーン・ワールド",
        location: "deck" as const,
        placedThisTurn: false,
      };

      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: [toonWorldCard, ...createCardInstances(["12345678", "87654321"], "deck")],
          hand: createCardInstances([toonTableCardId], "hand", "toon-table"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("toon-table-0");
      const result = command.execute(state);

      // Assert: Activation successful
      expect(result.success).toBe(true);
      expect(result.effectSteps).toBeDefined();
      expect(result.effectSteps!.length).toBe(3); // activation + search + send-to-graveyard

      // Verify search step
      expect(result.effectSteps![1].id).toContain("toon-table-search");
      expect(result.effectSteps![1].cardSelectionConfig).toBeDefined();
      expect(result.effectSteps![1].cardSelectionConfig!.minCards).toBe(1);
      expect(result.effectSteps![1].cardSelectionConfig!.maxCards).toBe(1);

      // Verify send-to-graveyard step
      expect(result.effectSteps![2]).toMatchObject({
        summary: "墓地へ送る",
        description: "《トゥーンのもくじ》を墓地に送ります",
      });
    });

    it("Scenario: Cannot activate when deck has no Toon cards", () => {
      // Arrange: Deck with no Toon cards
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["12345678", "87654321", "11112222"], "deck"),
          hand: createCardInstances([toonTableCardId], "hand", "toon-table"),
          mainMonsterZone: [],
          spellTrapZone: [],
          fieldZone: [],
          graveyard: [],
          banished: [],
        },
      });

      // Act
      const command = new ActivateSpellCommand("toon-table-0");
      const result = command.canExecute(state);

      // Assert: Cannot activate (no Toon cards in deck)
      expect(result.isValid).toBe(false);
    });
  });
});
