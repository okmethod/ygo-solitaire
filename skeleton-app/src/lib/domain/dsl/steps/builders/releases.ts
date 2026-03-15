/**
 * releases.ts - リリース系ステップビルダー
 *
 * StepBuilder:
 * - releaseAndBurnStepBuilder: フィールドのモンスターをリリースし攻撃力に応じたダメージ
 *
 * 公開関数:
 * - selectAndReleaseStep: フィールドのモンスターを選択してリリース
 *
 * @module domain/effects/steps/builders/releases
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, Player, CardSpace } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";
import { selectCardsStep } from "./userInteractions";

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

/** 指定されたモンスターをリリース（墓地へ送る）する共通処理 */
function releaseMonsters(space: CardSpace, instanceIds: string[]): ReleaseResult {
  let updatedSpace = space;
  const events: GameEvent[] = [];

  for (const instanceId of instanceIds) {
    const card = GameState.Space.findCard(updatedSpace, instanceId);
    if (card) {
      updatedSpace = GameState.Space.moveCard(updatedSpace, card, "graveyard");
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

      // リリース実行
      const { space, events } = releaseMonsters(currentState.space, selectedIds);
      const updatedState: GameSnapshot = { ...currentState, space };

      // 後続処理をコールバックに委譲
      return config.onReleased(updatedState, releasedCards, events);
    },
  });
};

// ===========================
// ステップビルダー（DSL用ファクトリ）
// ===========================

/**
 * フィールドのモンスターを選択してリリースし、攻撃力の指定倍率でダメージを与えるステップ
 *
 * 処理:
 * 1. フィールドからモンスターを選択（UI表示）
 * 2. 選択したモンスターをリリース（墓地へ送る）
 * 3. リリースしたモンスターの攻撃力×倍率のダメージを相手に与える
 */
export const releaseAndBurnStep = (
  cardId: number,
  damageMultiplier: number = 0.5,
  damageTarget: Player = "opponent",
): AtomicStep => {
  const multiplierPercent = Math.round(damageMultiplier * 100);

  return selectAndReleaseStep({
    cardId,
    count: 1,
    summary: "モンスターをリリースしてダメージ",
    description: `フィールドのモンスター1体をリリースし、攻撃力の${multiplierPercent}%のダメージを与えます`,
    onReleased: (state, releasedCards, releaseEvents) => {
      const monster = releasedCards[0];
      const monsterAtk = monster.attack ?? 0;
      const damage = Math.floor(monsterAtk * damageMultiplier);

      // ダメージを適用
      const updatedLp = {
        ...state.lp,
        [damageTarget]: state.lp[damageTarget] - damage,
      };

      const updatedState: GameSnapshot = {
        ...state,
        lp: updatedLp,
      };

      return GameProcessing.Result.success(
        updatedState,
        `Released ${monster.jaName} (ATK ${monsterAtk}) and dealt ${damage} damage`,
        releaseEvents,
      );
    },
  });
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * RELEASE_AND_BURN - フィールドのモンスターをリリースし攻撃力ベースでダメージ
 * args: { damageMultiplier?: number, damageTarget?: "player" | "opponent" }
 *
 * デフォルト: 攻撃力の50%を相手にダメージ
 */
export const releaseAndBurnStepBuilder: StepBuilderFn = (args, context) => {
  const damageMultiplier = (args.damageMultiplier as number | undefined) ?? 0.5;
  const damageTarget = ArgValidators.optionalPlayer(args, "damageTarget", "opponent");

  if (typeof damageMultiplier !== "number" || damageMultiplier <= 0) {
    throw new Error("RELEASE_AND_BURN step requires damageMultiplier to be a positive number");
  }

  return releaseAndBurnStep(context.cardId, damageMultiplier, damageTarget);
};
