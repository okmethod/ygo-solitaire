/**
 * banishments.ts - 除外系ステップビルダー
 *
 * StepBuilder:
 * - selectAndBanishFromGraveyardStepBuilder: 墓地からカードを選んで除外する
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { EffectId } from "$lib/domain/models/Effect";
import { ArgValidators } from "$lib/domain/effects/shared/argValidators";
import type { StepBuilder } from "../AtomicStepRegistry";
import { selectCardsStep } from "./userInteractions";

// ===========================
// 内部ヘルパー
// ===========================

/**
 * 指定した複数カードを除外ゾーンに移動した後のゲーム状態
 *
 * EffectActivationContext.paidCosts に除外枚数を記録する。
 */
const banishMultipleFromGraveyardResult = (
  state: GameSnapshot,
  instanceIds: string[],
  _faceDown: boolean,
  effectId?: EffectId,
): GameStateUpdateResult => {
  let updatedSpace = state.space;
  const banishedCards: CardInstance[] = [];

  for (const instanceId of instanceIds) {
    const card = GameState.Space.findCard(updatedSpace, instanceId)!;
    updatedSpace = GameState.Space.moveCard(updatedSpace, card, "banished");
    banishedCards.push(card);
  }

  // EffectActivationContext に除外枚数を記録
  const updatedActivationContexts = effectId
    ? GameState.ActivationContext.setPaidCosts(state.activationContexts, effectId, instanceIds.length)
    : state.activationContexts;

  const updatedState: GameSnapshot = {
    ...state,
    space: updatedSpace,
    activationContexts: updatedActivationContexts,
  };

  const cardNames = banishedCards.map((c) => c.jaName).join("、");
  return GameProcessing.Result.success(
    updatedState,
    `Banished ${instanceIds.length} card(s) from graveyard: ${cardNames}`,
  );
};

// ===========================
// AtomicStep 生成関数
// ===========================

/** カードタイプフィルター */
type BanishFilterType = "spell" | "trap" | "spell_or_trap" | "monster";

const filterTypeToJapanese: Record<BanishFilterType, string> = {
  spell: "魔法",
  trap: "罠",
  spell_or_trap: "魔法・罠",
  monster: "モンスター",
};

const createTypeFilter = (filterType?: BanishFilterType): ((card: CardInstance) => boolean) | undefined => {
  if (!filterType) return undefined;
  switch (filterType) {
    case "spell":
      return (card) => card.type === "spell";
    case "trap":
      return (card) => card.type === "trap";
    case "spell_or_trap":
      return (card) => card.type === "spell" || card.type === "trap";
    case "monster":
      return (card) => card.type === "monster";
    default:
      return undefined;
  }
};

/**
 * 墓地から指定枚数のカードを選択して除外するステップ
 *
 * 処理:
 * 1. 墓地から条件に合うカードを選択（UI表示）
 * 2. 選択したカードを除外ゾーンに移動
 * 3. EffectActivationContext.paidCosts に除外枚数を記録
 */
export const selectAndBanishFromGraveyardStep = (
  minCount: number,
  maxCount: number,
  filterType?: BanishFilterType,
  faceDown: boolean = false,
  effectId?: EffectId,
): AtomicStep => {
  const filterTypeJa = filterType ? filterTypeToJapanese[filterType] : "";
  const countDesc = minCount === maxCount ? `${minCount}枚` : `${minCount}〜${maxCount}枚`;
  const faceDesc = faceDown ? "裏側" : "";
  const summary = `墓地の${filterTypeJa}を${faceDesc}除外`;
  const description = `墓地から${filterTypeJa}カードを${countDesc}選んで${faceDesc}除外します`;

  return selectCardsStep({
    id: `select-and-banish-from-graveyard-${minCount}-${maxCount}-${filterType ?? "any"}`,
    summary,
    description,
    availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
    _sourceZone: "graveyard",
    _filter: createTypeFilter(filterType),
    minCards: minCount,
    maxCards: maxCount,
    cancelable: false,
    onSelect: (currentState: GameSnapshot, selectedInstanceIds: string[]) => {
      // 最低枚数が選択されていない場合はエラー
      if (selectedInstanceIds.length < minCount) {
        return GameProcessing.Result.failure(currentState, `Must select at least ${minCount} card(s) to banish`);
      }
      return banishMultipleFromGraveyardResult(currentState, selectedInstanceIds, faceDown, effectId);
    },
  });
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * SELECT_AND_BANISH_FROM_GRAVEYARD - 墓地からカードを選んで除外
 * args: { minCount: number, maxCount: number, filterType?: BanishFilterType, faceDown?: boolean }
 */
export const selectAndBanishFromGraveyardStepBuilder: StepBuilder = (args, context) => {
  const minCount = ArgValidators.positiveInt(args, "minCount");
  const maxCount = ArgValidators.positiveInt(args, "maxCount");
  const filterType = ArgValidators.optionalString(args, "filterType") as BanishFilterType | undefined;
  const faceDown = ArgValidators.optionalBoolean(args, "faceDown", false);

  if (maxCount < minCount) {
    throw new Error("SELECT_AND_BANISH_FROM_GRAVEYARD step requires maxCount >= minCount");
  }

  return selectAndBanishFromGraveyardStep(minCount, maxCount, filterType, faceDown, context.effectId);
};
