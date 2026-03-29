/**
 * excavations.ts - デッキめくり系ステップビルダー
 *
 * StepBuilder:
 * - excavateUntilMonsterStepBuilder: EXCAVATE_UNTIL_MONSTER - モンスターが出るまでデッキをめくり特殊召喚
 */

import type { CardInstance, BattlePosition } from "$lib/domain/models/Card";
import type { EffectId } from "$lib/domain/models/Effect";
import type { CardSpace, GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { GameEvents } from "$lib/domain/models/GameProcessing/GameEvent";
import { canSpecialSummon, executeSpecialSummon } from "$lib/domain/rules/SummonRule";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";

/**
 * デッキからモンスターを探し、そのインデックスを返す
 * モンスターが見つからない場合は -1 を返す
 */
const findFirstMonsterIndex = (deck: readonly CardInstance[]): number => {
  return deck.findIndex((card) => card.type === "monster");
};

/**
 * 複数カードを墓地に送り、イベントを発行する
 */
const sendCardsToGraveyard = (
  space: CardSpace,
  cards: readonly CardInstance[],
): { space: CardSpace; events: GameEvent[] } => {
  let updatedSpace = space;
  const events: GameEvent[] = [];

  for (const card of cards) {
    updatedSpace = GameState.Space.moveCard(updatedSpace, card, "graveyard");
    events.push(...GameEvents.sentToGraveyard(card));
  }

  return { space: updatedSpace, events };
};

/**
 * EXCAVATE_UNTIL_MONSTER ステップ
 *
 * 処理:
 * 1. デッキトップからモンスターが出るまでカードをめくる
 * 2. モンスターをモーダルで表示（確認用）
 * 3. 確定でモンスターを特殊召喚、残りを墓地へ送る
 *
 * @param cardId - カードID（ステップID生成用）
 * @param battlePosition - 特殊召喚時の表示形式（デフォルト: 攻撃表示）
 */
export const excavateUntilMonsterStep = (cardId: number, battlePosition: BattlePosition = "attack"): AtomicStep => {
  const summary = "めくったカードを確認";

  return {
    id: `${cardId}-excavate-until-monster`,
    summary,
    description: "モンスターが出るまでデッキをめくり、そのモンスターを特殊召喚します。残りは墓地へ送ります。",
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定
      minCards: 1,
      maxCards: 1,
      summary: "めくったカードを確認",
      description: "特殊召喚するモンスターを選択してください。残りのカードは墓地へ送られます。",
      cancelable: false,
      _sourceZone: "mainDeck",
      // デッキトップからモンスターまでのカード全てを表示
      _filter: (_card: CardInstance, index?: number, _context?, sourceZone?: readonly CardInstance[]): boolean => {
        if (index === undefined || !sourceZone) return false;
        // 最初のモンスターのインデックスを計算
        const firstMonsterIndex = sourceZone.findIndex((c) => c.type === "monster");
        if (firstMonsterIndex === -1) return false;
        // インデックス0〜firstMonsterIndexのカードを全て表示
        return index <= firstMonsterIndex;
      },
      // モンスター1体が選択されている場合のみ確定可能
      canConfirm: (selectedCards: readonly CardInstance[]): boolean => {
        if (selectedCards.length !== 1) return false;
        return selectedCards[0].type === "monster";
      },
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      const deck = currentState.space.mainDeck;

      // デッキからモンスターを探す
      const monsterIndex = findFirstMonsterIndex(deck);
      if (monsterIndex === -1) {
        return GameProcessing.Result.failure(currentState, "デッキにモンスターが存在しません");
      }

      // めくったカード（インデックス0からmonsterIndexまで）
      const excavatedCards = deck.slice(0, monsterIndex + 1);
      const monsterCard = excavatedCards[excavatedCards.length - 1];
      const cardsToGraveyard = excavatedCards.slice(0, -1); // モンスター以外

      // UIが選択モーダルを表示するまで待機
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      // 選択されたモンスターを確認
      const selectedInstanceId = selectedInstanceIds[0];
      if (selectedInstanceId !== monsterCard.instanceId) {
        return GameProcessing.Result.failure(currentState, "Invalid selection");
      }

      // 特殊召喚可能かチェック
      const validation = canSpecialSummon(currentState);
      if (!validation.isValid) {
        return GameProcessing.Result.failure(currentState, GameProcessing.Validation.errorMessage(validation));
      }

      // 1. 墓地送り処理
      const { space: spaceAfterGraveyard, events: graveyardEvents } = sendCardsToGraveyard(
        currentState.space,
        cardsToGraveyard,
      );
      const stateAfterGraveyard: GameSnapshot = { ...currentState, space: spaceAfterGraveyard };

      // 2. 特殊召喚を実行
      const { state: finalState, event: summonEvent } = executeSpecialSummon(
        stateAfterGraveyard,
        selectedInstanceId,
        battlePosition,
      );

      // メッセージ生成
      const graveyardNames = cardsToGraveyard.map((c) => c.jaName).join("、");
      const message =
        cardsToGraveyard.length > 0
          ? `${graveyardNames}を墓地へ送り、${monsterCard.jaName}を特殊召喚しました`
          : `${monsterCard.jaName}を特殊召喚しました`;

      return GameProcessing.Result.success(finalState, message, [...graveyardEvents, summonEvent]);
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * EXCAVATE_UNTIL_MONSTER - モンスターが出るまでデッキをめくり特殊召喚
 * args: {
 *   battlePosition?: BattlePosition (デフォルト: "attack")
 * }
 */
export const excavateUntilMonsterStepBuilder: StepBuilderFn = (args, context) => {
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  return excavateUntilMonsterStep(context.cardId, battlePosition);
};

/**
 * EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK ステップ
 *
 * 処理（名推理）:
 * 1. コンテキストから宣言されたレベルを取得（DECLARE_RANDOM_INTEGER で事前に設定）
 * 2. デッキトップからモンスターが出るまでカードをめくる
 * 3. モンスターのレベルが宣言レベルと異なれば特殊召喚、同じなら墓地へ送る
 * 4. 残りのめくったカードは墓地へ送る
 *
 * @param cardId - カードID（ステップID生成用）
 * @param effectId - 効果ID（コンテキスト参照用）
 * @param battlePosition - 特殊召喚時の表示形式（デフォルト: 攻撃表示）
 */
export const excavateUntilMonsterWithLevelCheckStep = (
  cardId: number,
  effectId: EffectId,
  battlePosition: BattlePosition = "attack",
): AtomicStep => {
  const summary = "めくったカードを確認";

  return {
    id: `${cardId}-excavate-until-monster-level-check`,
    summary,
    description: "モンスターが出るまでデッキをめくります。宣言と異なるレベルなら特殊召喚、同じなら墓地へ送ります。",
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null,
      minCards: 1,
      maxCards: 1,
      summary: "めくったカードを確認",
      description: "モンスターを選択してください。残りのカードは墓地へ送られます。",
      cancelable: false,
      _sourceZone: "mainDeck",
      _filter: (_card: CardInstance, index?: number, _context?, sourceZone?: readonly CardInstance[]): boolean => {
        if (index === undefined || !sourceZone) return false;
        const firstMonsterIndex = sourceZone.findIndex((c) => c.type === "monster");
        if (firstMonsterIndex === -1) return false;
        return index <= firstMonsterIndex;
      },
      canConfirm: (selectedCards: readonly CardInstance[]): boolean => {
        if (selectedCards.length !== 1) return false;
        return selectedCards[0].type === "monster";
      },
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      const deck = currentState.space.mainDeck;

      const monsterIndex = findFirstMonsterIndex(deck);
      if (monsterIndex === -1) {
        return GameProcessing.Result.failure(currentState, "デッキにモンスターが存在しません");
      }

      const excavatedCards = deck.slice(0, monsterIndex + 1);
      const monsterCard = excavatedCards[excavatedCards.length - 1];
      const cardsToGraveyard = excavatedCards.slice(0, -1);

      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      const selectedInstanceId = selectedInstanceIds[0];
      if (selectedInstanceId !== monsterCard.instanceId) {
        return GameProcessing.Result.failure(currentState, "Invalid selection");
      }

      // コンテキストから宣言レベルを取得
      const declaredLevel = GameState.ActivationContext.getDeclaredInteger(currentState.activationContexts, effectId);
      if (declaredLevel === undefined) {
        return GameProcessing.Result.failure(currentState, "宣言レベルが設定されていません");
      }

      const monsterLevel = monsterCard.level ?? 0;
      const levelMatches = monsterLevel === declaredLevel;

      // 墓地送り処理（めくったカード）
      const { space: spaceAfterGraveyard, events: graveyardEvents } = sendCardsToGraveyard(
        currentState.space,
        cardsToGraveyard,
      );
      let stateAfterGraveyard: GameSnapshot = { ...currentState, space: spaceAfterGraveyard };

      let message: string;
      const graveyardNames = cardsToGraveyard.map((c) => c.jaName).join("、");
      const graveyardPart = graveyardNames ? `${graveyardNames}を墓地へ送り、` : "";

      if (levelMatches) {
        // 宣言レベルと同じ → モンスターも墓地へ送る
        const { space: spaceWithMonster, events: monsterEvents } = sendCardsToGraveyard(stateAfterGraveyard.space, [
          monsterCard,
        ]);
        stateAfterGraveyard = { ...stateAfterGraveyard, space: spaceWithMonster };
        graveyardEvents.push(...monsterEvents);
        message = `${graveyardPart}${monsterCard.jaName}（レベル${monsterLevel}）は宣言と同じため墓地へ送りました`;
      } else {
        // 宣言レベルと異なる → 特殊召喚
        const validation = canSpecialSummon(stateAfterGraveyard);
        if (!validation.isValid) {
          return GameProcessing.Result.failure(stateAfterGraveyard, GameProcessing.Validation.errorMessage(validation));
        }
        const { state: summonedState, event: summonEvent } = executeSpecialSummon(
          stateAfterGraveyard,
          selectedInstanceId,
          battlePosition,
        );
        stateAfterGraveyard = summonedState;
        graveyardEvents.push(summonEvent);
        message = `${graveyardPart}${monsterCard.jaName}（レベル${monsterLevel}）を特殊召喚しました`;
      }

      return GameProcessing.Result.success(stateAfterGraveyard, message, graveyardEvents);
    },
  };
};

/**
 * EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK - レベル宣言付きデッキめくり
 * args: {
 *   battlePosition?: BattlePosition (デフォルト: "attack")
 *   effectId?: string (省略時: context.effectId)
 * }
 */
export const excavateUntilMonsterWithLevelCheckStepBuilder: StepBuilderFn = (args, context) => {
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  const effectIdFromArgs = ArgValidators.optionalString(args, "effectId");
  const effectId = effectIdFromArgs ? (effectIdFromArgs as EffectId) : context.effectId;
  if (!effectId) {
    throw new Error("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK step requires effectId (via args or context)");
  }
  return excavateUntilMonsterWithLevelCheckStep(context.cardId, effectId, battlePosition);
};
