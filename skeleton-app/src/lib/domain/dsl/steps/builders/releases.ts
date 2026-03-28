/**
 * releases.ts - リリース系ステップビルダー
 *
 * StepBuilder:
 * - selectAndReleaseStepBuilder: RELEASE - モンスターを選択して墓地へ送る
 * - selectAndReleaseForBurnStepBuilder: RELEASE_FOR_BURN - リリースしてダメージをコンテキストに保存
 *
 * 公開関数:
 * - selectAndReleaseStep: フィールドのモンスターを選択してリリース（共通処理）
 */

import { Card, type CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { moveCardFromFieldOverride } from "$lib/domain/dsl/overrides/handlers/fieldDepartureDestination";
import { selectCardsStep } from "../primitives/userInteractions";

// ===========================
// 共通リリース処理
// ===========================

/**
 * リリース処理の結果
 */
export type ReleaseResult = {
  space: CardSpace;
  events: GameEvent[];
};

/** 指定されたモンスターをリリース（墓地へ送る）する共通処理
 *
 * ActionOverrideルール（フィールド離脱時の移動先置換）を適用する。
 */
function releaseMonsters(state: GameSnapshot, instanceIds: string[]): ReleaseResult {
  let updatedSpace = state.space;
  const events: GameEvent[] = [];

  for (const instanceId of instanceIds) {
    const card = GameState.Space.findCard(updatedSpace, instanceId);
    if (card) {
      // ActionOverrideルールを適用して移動
      const currentState: GameSnapshot = { ...state, space: updatedSpace };
      updatedSpace = moveCardFromFieldOverride(currentState, card, "graveyard");
      events.push({
        type: "sentToGraveyard",
        sourceCardId: card.id,
        sourceInstanceId: card.instanceId,
      });
    }
  }

  return { space: updatedSpace, events };
}

// ===========================
// 選択＋リリース共通ステップ
// ===========================

/**
 * selectAndReleaseStep の設定
 */
type SelectAndReleaseConfig = {
  /** ステップID生成用のカードID */
  cardId: number;
  /** リリースするモンスターの数 */
  count: number;
  /** カスタムサマリー（省略時はデフォルト） */
  summary?: string;
  /** カスタム説明（省略時はデフォルト） */
  description?: string;
  /** モンスターのフィルター条件（省略時は全モンスター） */
  filter?: (card: CardInstance) => boolean;
  /** リリース完了後のコールバック */
  onReleased: (
    state: GameSnapshot,
    releasedCards: readonly CardInstance[],
    releaseEvents: GameEvent[],
  ) => GameStateUpdateResult;
};

/**
 * フィールドのモンスターを選択してリリースする共通ステップ
 *
 * 処理:
 * 1. フィールドからモンスターを選択（UI表示）
 * 2. 選択したモンスターをリリース（墓地へ送る）
 * 3. onReleased コールバックを実行
 */
export const selectAndReleaseStep = (config: SelectAndReleaseConfig): AtomicStep => {
  const defaultFilter = (_card: CardInstance): boolean => true; // デフォルトは全てのカードを対象
  const filter = config.filter ?? defaultFilter;
  const summary = config.summary ?? "リリース対象を選択";
  const description = config.description ?? `フィールドのモンスター${config.count}体をリリースします`;

  return selectCardsStep({
    id: `${config.cardId}-select-release`,
    summary,
    description,
    availableCards: null,
    _sourceZone: "mainMonsterZone",
    _filter: filter,
    minCards: config.count,
    maxCards: config.count,
    cancelable: false,
    onSelect: (currentState: GameSnapshot, selectedIds: string[]): GameStateUpdateResult => {
      // リリース前にカード情報を取得（ダメージ計算等に使用）
      const releasedCards = selectedIds.map((id) => GameState.Space.findCard(currentState.space, id)!);

      // リリース実行（ActionOverrideルールを適用）
      const { space, events } = releaseMonsters(currentState, selectedIds);

      const updatedState: GameSnapshot = { ...currentState, space };

      // 後続処理をコールバックに委譲
      return config.onReleased(updatedState, releasedCards, events);
    },
  });
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * RELEASE - フィールドのモンスターを選択して墓地へ送る
 * args: {
 *   count?: number (デフォルト: 1),
 *   excludeEffect?: boolean (デフォルト: false) - trueの場合、効果モンスターを除外
 * }
 */
export const selectAndReleaseStepBuilder: StepBuilderFn = (args, context) => {
  const count = ArgValidators.optionalPositiveInt(args, "count") ?? 1;
  const excludeEffect = ArgValidators.optionalBoolean(args, "excludeEffect", false);

  const filter = (card: CardInstance): boolean => {
    // 表側表示モンスターのみ
    if (card.type !== "monster" || !Card.Instance.isFaceUp(card)) return false;
    // excludeEffectがtrueの場合、効果モンスター以外のみ（monsterTypeListで判定）
    if (excludeEffect && Card.isEffectMonster(card)) return false;
    return true;
  };

  const filterDesc = excludeEffect ? "効果モンスター以外の" : "";

  return selectAndReleaseStep({
    cardId: context.cardId,
    count,
    summary: "リリース対象を選択",
    description: `フィールドの${filterDesc}モンスター${count}体をリリースします`,
    filter,
    onReleased: (state, releasedCards, releaseEvents) => {
      const names = releasedCards.map((c) => c.jaName).join("、");
      return GameProcessing.Result.success(state, `${names}をリリースしました`, releaseEvents);
    },
  });
};

/**
 * RELEASE_FOR_BURN - activations用: リリースしてダメージをコンテキストに保存
 * args: { damageMultiplier?: number }
 *
 * activationsでリリースを行い、計算したダメージをActivationContextに保存。
 * resolutionsでBURN_FROM_CONTEXTと組み合わせて使用。
 */
export const selectAndReleaseForBurnStepBuilder: StepBuilderFn = (args, context) => {
  const damageMultiplier = (args.damageMultiplier as number | undefined) ?? 0.5;
  const multiplierPercent = Math.round(damageMultiplier * 100);

  if (typeof damageMultiplier !== "number" || damageMultiplier <= 0) {
    throw new Error("RELEASE_FOR_BURN step requires damageMultiplier to be a positive number");
  }

  if (!context.effectId) {
    throw new Error("RELEASE_FOR_BURN step requires effectId in context");
  }

  const effectId = context.effectId;

  return selectAndReleaseStep({
    cardId: context.cardId,
    count: 1,
    summary: "リリース対象を選択",
    description: `フィールドのモンスター1体をリリースし、攻撃力の${multiplierPercent}%のダメージを与えます`,
    onReleased: (state, releasedCards, releaseEvents) => {
      const monster = releasedCards[0];
      const monsterAtk = monster.attack ?? 0;
      const damage = Math.floor(monsterAtk * damageMultiplier);

      // ダメージをコンテキストに保存（resolutionsで使用）
      const updatedState: GameSnapshot = {
        ...state,
        activationContexts: GameState.ActivationContext.setDamage(state.activationContexts, effectId, damage),
      };

      return GameProcessing.Result.success(
        updatedState,
        `Released ${monster.jaName} (ATK ${monsterAtk}, ${damage} damage stored)`,
        releaseEvents,
      );
    },
  });
};
