/**
 * stepBuilders - Helper functions for creating EffectResolutionStep objects
 *
 * Provides reusable builder functions for common card effect operations.
 * Eliminates code duplication across card implementations by providing
 * standardized step creation for:
 * - Drawing cards (createDrawStep)
 * - Sending cards to graveyard (createSendToGraveyardStep)
 * - Card selection (createCardSelectionStep)
 * - Life point changes (createGainLifeStep, createDamageStep)
 * - Deck manipulation (createShuffleStep, createReturnToDeckStep)
 *
 * All functions return EffectResolutionStep objects that can be used
 * in createResolutionSteps() methods of ChainableAction implementations.
 *
 * @module domain/effects/builders/stepBuilders
 * @see ADR-0008: 効果モデルの導入とClean Architectureの完全実現
 */

import type { EffectResolutionStep, CardSelectionConfig } from "../../models/EffectResolutionStep";
import type { GameState } from "../../models/GameState";
import type { GameStateUpdateResult } from "../../models/GameStateUpdate";
import type { CardInstance } from "../../models/Card";
import { drawCards, sendToGraveyard, moveCard, shuffleDeck } from "../../models/Zone";
import { getCardData } from "../../registries/CardDataRegistry";

/**
 * デッキから指定枚数のカードをドローします
 *
 * Handles deck size validation and victory condition check after drawing.
 *
 * @example
 * ```typescript
 * // Pot of Greed: Draw 2 cards
 * createDrawStep(2)
 *
 * // With custom description
 * createDrawStep(1, { description: "デッキから1枚ドローし、相手は1000LP獲得" })
 * ```
 */
export function createDrawStep(
  count: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  return {
    id: options?.id ?? `draw-${count}`,
    summary: options?.summary ?? "カードをドロー",
    description: options?.description ?? `デッキから${count}枚ドローします`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      // デッキに十分なカード枚数があるかバリデーション
      if (currentState.zones.deck.length < count) {
        return {
          success: false,
          updatedState: currentState,
          error: `Cannot draw ${count} cards. Not enough cards in deck.`,
        };
      }

      // カードをドロー（不変性を保った新しいゾーンオブジェクトを返す）
      const newZones = drawCards(currentState.zones, count);

      // ドロー後の新しいゲーム状態を作成
      const updatedState: GameState = {
        ...currentState,
        zones: newZones,
      };

      return {
        success: true,
        updatedState,
        message: `Draw ${count} card${count > 1 ? "s" : ""}`,
      };
    },
  };
}

/**
 * カードを墓地へ送ります
 *
 * Used for sending spell cards to graveyard after resolution, or discarding cards from hand.
 * Falls back to "レジストリ未登録カード" if card is not registered in CardDataRegistry.
 *
 * @example
 * ```typescript
 * // Send Pot of Greed to graveyard
 * createSendToGraveyardStep(instanceId, 55144522)
 * ```
 */
export function createSendToGraveyardStep(
  instanceId: string,
  cardId: number,
  options?: { id?: string },
): EffectResolutionStep {
  // CardDataRegistryからカード名を取得（未登録の場合はフォールバック）
  // getCardDataが例外をスローする作りになっているためtry-catchで対応
  // TODO: そもそも例外をスローしない設計に変更することを検討
  let cardName: string;
  try {
    const cardData = getCardData(cardId);
    cardName = cardData.jaName;
  } catch {
    cardName = "レジストリ未登録カード";
  }

  return {
    id: options?.id ?? `${instanceId}-graveyard`,
    summary: "墓地へ送る",
    description: `${cardName}を墓地に送ります`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      // カードを墓地へ送る
      const newZones = sendToGraveyard(currentState.zones, instanceId);

      const updatedState: GameState = {
        ...currentState,
        zones: newZones,
      };

      return {
        success: true,
        updatedState,
        message: `Sent ${cardName} to graveyard`,
      };
    },
  };
}

/**
 * カード選択モーダルを開き、ユーザーの選択を受け付けます
 *
 * Used for discarding cards (Graceful Charity), returning cards to deck (Magical Mallet), etc.
 * availableCards が空配列の場合は現在の手札を候補として使用します。
 *
 * @example
 * ```typescript
 * // Graceful Charity: Discard 2 cards
 * createCardSelectionStep({
 *   id: "graceful-charity-discard",
 *   summary: "手札を捨てる",
 *   description: "手札から2枚選んで捨ててください",
 *   availableCards: [],
 *   minCards: 2,
 *   maxCards: 2,
 *   cancelable: false,
 *   onSelect: (state, selectedIds) => {
 *     // Discard logic...
 *   }
 * })
 * ```
 */
export function createCardSelectionStep(config: {
  id: string;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | [];
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
  onSelect: (state: GameState, selectedIds: string[]) => GameStateUpdateResult;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: config.availableCards,
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    } satisfies CardSelectionConfig,
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // カードが選択されていない場合（minCards = 0の場合に発生しうる）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return config.onSelect(currentState, []);
      }
      // 選択されたカードIDを使ってonSelectコールバックを実行
      return config.onSelect(currentState, selectedInstanceIds);
    },
  };
}

/**
 * ライフポイントを増加させます
 *
 * Used for opponent gaining LP (Upstart Goblin), player gaining LP (healing effects), etc.
 * Default target is "opponent".
 *
 * @example
 * ```typescript
 * // Upstart Goblin: Opponent gains 1000 LP
 * createGainLifeStep(1000, { target: "opponent" })
 *
 * // Player gains 500 LP
 * createGainLifeStep(500, { target: "player", description: "プレイヤーのLPが500回復" })
 * ```
 */
export function createGainLifeStep(
  amount: number,
  options?: {
    id?: string;
    target?: "player" | "opponent";
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const target = options?.target ?? "opponent";
  const targetJa = target === "player" ? "プレイヤー" : "相手";

  return {
    id: options?.id ?? `gain-lp-${target}-${amount}`,
    summary: options?.summary ?? `${targetJa}のLPを増加`,
    description: options?.description ?? `${targetJa}のLPが${amount}増加します`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...currentState,
        lp: {
          ...currentState.lp,
          [target]: currentState.lp[target] + amount,
        },
      };

      return {
        success: true,
        updatedState,
        message: `${target === "player" ? "Player" : "Opponent"} gained ${amount} LP`,
      };
    },
  };
}

/**
 * ダメージを与えます（ライフポイントを減少させます）
 *
 * Note: Victory conditions are NOT checked here (will be checked at end of phase).
 * Default target is "player".
 *
 * @example
 * ```typescript
 * // Player takes 1000 damage
 * createDamageStep(1000, { target: "player" })
 *
 * // Opponent takes 500 damage
 * createDamageStep(500, { target: "opponent", description: "相手に500ダメージ" })
 * ```
 */
export function createDamageStep(
  amount: number,
  options?: {
    id?: string;
    target?: "player" | "opponent";
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const target = options?.target ?? "player";
  const targetJa = target === "player" ? "プレイヤー" : "相手";

  return {
    id: options?.id ?? `damage-${target}-${amount}`,
    summary: options?.summary ?? `${targetJa}にダメージ`,
    description: options?.description ?? `${targetJa}は${amount}ダメージを受けます`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...currentState,
        lp: {
          ...currentState.lp,
          [target]: currentState.lp[target] - amount,
        },
      };

      return {
        success: true,
        updatedState,
        message: `${target === "player" ? "Player" : "Opponent"} took ${amount} damage`,
      };
    },
  };
}

/**
 * デッキをシャッフルします
 *
 * Used after returning cards to deck (Magical Mallet), after deck search (Terraforming), etc.
 *
 * @example
 * ```typescript
 * // Standard shuffle notification
 * createShuffleStep()
 *
 * // Custom description
 * createShuffleStep({ description: "カードを戻してデッキをシャッフルします" })
 * ```
 */
export function createShuffleStep(options?: {
  id?: string;
  summary?: string;
  description?: string;
}): EffectResolutionStep {
  return {
    id: options?.id ?? "shuffle-deck",
    summary: options?.summary ?? "デッキシャッフル",
    description: options?.description ?? "デッキをシャッフルします",
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      // デッキをシャッフル
      const newZones = shuffleDeck(currentState.zones);

      const updatedState: GameState = {
        ...currentState,
        zones: newZones,
      };

      return {
        success: true,
        updatedState,
        message: "Deck shuffled",
      };
    },
  };
}

/**
 * 手札からデッキにカードを戻します
 *
 * Note: Does NOT shuffle automatically. Use createShuffleStep() after this if shuffling is required.
 * Used for Magical Mallet, bouncing cards to deck, etc.
 *
 * @example
 * ```typescript
 * // Return 3 cards to deck
 * createReturnToDeckStep(["hand-0", "hand-2", "hand-4"])
 *
 * // With custom description
 * createReturnToDeckStep(selectedIds, {
 *   description: "選択したカードをデッキに戻します"
 * })
 * ```
 */
export function createReturnToDeckStep(
  instanceIds: string[],
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const count = instanceIds.length;

  return {
    id: options?.id ?? `return-to-deck-${count}`,
    summary: options?.summary ?? "デッキに戻す",
    description: options?.description ?? `${count}枚のカードをデッキに戻します`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      if (instanceIds.length === 0) {
        return {
          success: true,
          updatedState: currentState,
          message: "No cards to return",
        };
      }

      // 指定されたカードを手札からデッキに戻す（各カードごとに不変性を保ちながら処理）
      let updatedZones = currentState.zones;
      for (const instanceId of instanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "hand", "deck");
      }

      const updatedState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        updatedState,
        message: `Returned ${count} card${count > 1 ? "s" : ""} to deck`,
      };
    },
  };
}

/**
 * 墓地から条件に合うカードを選択し、手札に加えます
 *
 * Used for Magical Stone Excavation (select 1 spell from graveyard), etc.
 *
 * @example
 * ```typescript
 * // Magical Stone Excavation: Select 1 spell card from graveyard
 * createSearchFromGraveyardStep({
 *   id: "magical-stone-excavation-search",
 *   summary: "墓地から魔法カードを選択",
 *   description: "墓地の魔法カード1枚を選んで手札に加えてください",
 *   filter: (card) => card.type === "spell",
 *   minCards: 1,
 *   maxCards: 1,
 * })
 * ```
 */
export function createSearchFromGraveyardStep(config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): EffectResolutionStep {
  // 注: availableCardsは実行時に動的に設定される
  // _sourceZone: "graveyard" マーカーにより、effectResolutionStoreが墓地から候補カードを設定する
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // 実行時に墓地から動的に設定される
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      // 参照元ゾーンを示すメタデータ
      _sourceZone: "graveyard",
      _filter: config.filter,
    },
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // 墓地のカードをフィルタリング
      const availableCards = currentState.zones.graveyard.filter(config.filter);

      // 条件に合うカードが墓地に存在しない場合はエラー
      if (availableCards.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards available in graveyard matching the criteria",
        };
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards selected",
        };
      }

      // 選択されたカードを墓地から手札に移動
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "graveyard", "hand");
      }

      const updatedState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        updatedState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from graveyard to hand`,
      };
    },
  };
}

/**
 * デッキの上から指定枚数を確認し、1枚を選んで手札に加えます
 *
 * Used for Pot of Duality (excavate top 3, select 1), etc.
 * Remaining cards stay in deck (no shuffle).
 *
 * @example
 * ```typescript
 * // Pot of Duality: Excavate top 3 cards, select 1
 * createSearchFromDeckTopStep({
 *   id: "pot-of-duality-search",
 *   summary: "デッキの上から3枚を確認",
 *   description: "デッキの上から3枚を確認し、1枚を選んで手札に加えてください",
 *   count: 3,
 *   minCards: 1,
 *   maxCards: 1,
 * })
 * ```
 */
export function createSearchFromDeckTopStep(config: {
  id: string;
  summary: string;
  description: string;
  count: number;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // Will be populated dynamically from deck top
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      _sourceZone: "deck",
      _filter: (_card, index) => index !== undefined && index < config.count,
    },
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // デッキの上からN枚を取得
      const topCards = currentState.zones.deck.slice(0, config.count);

      // デッキに十分なカード枚数がない場合はエラー
      if (topCards.length < config.count) {
        return {
          success: false,
          updatedState: currentState,
          error: `Cannot excavate ${config.count} cards. Deck has only ${topCards.length} cards.`,
        };
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards selected",
        };
      }

      // 選択されたカードを手札に移動
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "deck", "hand");
      }

      // 残りのカードはデッキに残る（シャッフルなし - 元の位置に戻る）
      const updatedState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        updatedState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand`,
      };
    },
  };
}

/**
 * エンドフェイズに実行される効果を登録します
 *
 * Used for Into the Void (discard all hand at end phase), Card of Demise, etc.
 *
 * @example
 * ```typescript
 * // Into the Void: Add end phase discard effect
 * createAddEndPhaseEffectStep(
 *   {
 *     id: "into-the-void-end-phase-discard",
 *     summary: "手札を全て捨てる",
 *     description: "エンドフェイズに手札を全て捨てます",
 *     notificationLevel: "info",
 *     action: (state) => {
 *       // Discard all hand logic...
 *     }
 *   },
 *   { summary: "エンドフェイズ効果を登録" }
 * )
 * ```
 */
export function createAddEndPhaseEffectStep(
  effectStep: EffectResolutionStep,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  return {
    id: options?.id ?? `add-end-phase-effect-${effectStep.id}`,
    summary: options?.summary ?? "エンドフェイズ効果を登録",
    description: options?.description ?? "エンドフェイズに実行される効果を登録します",
    notificationLevel: "silent",
    action: (currentState: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...currentState,
        pendingEndPhaseEffects: [...currentState.pendingEndPhaseEffects, effectStep],
      };

      return {
        success: true,
        updatedState,
        message: `Added end phase effect: ${effectStep.summary}`,
      };
    },
  };
}

/**
 * 手札が指定枚数になるまでドローします
 *
 * Used for Card of Demise (draw until hand = 3), etc.
 * If hand already has >= target count, no cards are drawn.
 *
 * @example
 * ```typescript
 * // Card of Demise: Draw until hand = 3
 * createDrawUntilCountStep(3, {
 *   description: "手札が3枚になるようにデッキからドローします"
 * })
 * ```
 */
export function createDrawUntilCountStep(
  targetCount: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  return {
    id: options?.id ?? `draw-until-${targetCount}`,
    summary: options?.summary ?? `手札が${targetCount}枚になるようにドロー`,
    description: options?.description ?? `手札が${targetCount}枚になるようにデッキからドローします`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const currentHandCount = currentState.zones.hand.length;
      const drawCount = Math.max(0, targetCount - currentHandCount);

      // すでに目標枚数以上の手札がある場合はドロー不要
      if (drawCount === 0) {
        return {
          success: true,
          updatedState: currentState,
          message: `Hand already has ${currentHandCount} cards (target: ${targetCount})`,
        };
      }

      // デッキに十分なカード枚数があるかバリデーション
      if (currentState.zones.deck.length < drawCount) {
        return {
          success: false,
          updatedState: currentState,
          error: `Cannot draw ${drawCount} cards to reach target. Deck has only ${currentState.zones.deck.length} cards.`,
        };
      }

      // 目標枚数に達するまでカードをドロー
      const newZones = drawCards(currentState.zones, drawCount);

      const updatedState: GameState = {
        ...currentState,
        zones: newZones,
      };

      return {
        success: true,
        updatedState,
        message: `Draw ${drawCount} card${drawCount > 1 ? "s" : ""} (hand now: ${targetCount})`,
      };
    },
  };
}

/**
 * デッキから条件に合うカードを検索し、手札に加えます
 *
 * Used for Toon Table of Contents (search "トゥーン" cards), Terraforming (field spells), etc.
 * Deck is shuffled after search.
 *
 * @example
 * ```typescript
 * // Toon Table of Contents: Search for "トゥーン" cards
 * createSearchFromDeckByNameStep({
 *   id: "toon-table-search",
 *   summary: "デッキからトゥーンカードを検索",
 *   description: "デッキから「トゥーン」カード1枚を選んで手札に加えてください",
 *   filter: (card) => card.jaName.includes("トゥーン") || card.name.includes("Toon"),
 *   minCards: 1,
 *   maxCards: 1,
 * })
 * ```
 */
export function createSearchFromDeckByNameStep(config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: [], // Will be populated dynamically from deck
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
      _sourceZone: "deck",
      _filter: config.filter,
    },
    action: (currentState: GameState, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // デッキのカードをフィルタリング
      const availableCards = currentState.zones.deck.filter(config.filter);

      // 条件に合うカードがデッキに存在しない場合はエラー
      if (availableCards.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards available in deck matching the criteria",
        };
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return {
          success: false,
          updatedState: currentState,
          error: "No cards selected",
        };
      }

      // 選択されたカードをデッキから手札に移動
      let updatedZones = currentState.zones;
      for (const instanceId of selectedInstanceIds) {
        updatedZones = moveCard(updatedZones, instanceId, "deck", "hand");
      }

      // デッキサーチ後はデッキをシャッフル
      updatedZones = shuffleDeck(updatedZones);

      const updatedState: GameState = {
        ...currentState,
        zones: updatedZones,
      };

      return {
        success: true,
        updatedState,
        message: `Added ${selectedInstanceIds.length} card${selectedInstanceIds.length > 1 ? "s" : ""} from deck to hand and shuffled`,
      };
    },
  };
}

/**
 * ライフポイントを支払います
 *
 * Used for card activation costs (Toon World - pay 1000 LP), etc.
 * Default target is "player".
 *
 * @example
 * ```typescript
 * // Toon World: Pay 1000 LP
 * createLPPaymentStep(1000, {
 *   description: "1000LPを払って発動します"
 * })
 * ```
 */
export function createLPPaymentStep(
  amount: number,
  options?: {
    id?: string;
    target?: "player" | "opponent";
    summary?: string;
    description?: string;
  },
): EffectResolutionStep {
  const target = options?.target ?? "player";
  const targetJa = target === "player" ? "プレイヤー" : "相手";

  return {
    id: options?.id ?? `pay-lp-${target}-${amount}`,
    summary: options?.summary ?? `${targetJa}がLPを支払う`,
    description: options?.description ?? `${targetJa}が${amount}LPを支払います`,
    notificationLevel: "info",
    action: (currentState: GameState): GameStateUpdateResult => {
      const updatedState: GameState = {
        ...currentState,
        lp: {
          ...currentState.lp,
          [target]: currentState.lp[target] - amount,
        },
      };

      return {
        success: true,
        updatedState,
        message: `${target === "player" ? "Player" : "Opponent"} paid ${amount} LP`,
      };
    },
  };
}
