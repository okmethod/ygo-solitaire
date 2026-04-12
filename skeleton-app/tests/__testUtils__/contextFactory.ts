/**
 * テスト用ステップビルドコンテキスト ファクトリ
 *
 * 効果処理ステップに引き渡す動的情報を表す StepBuildContext を生成するユーティリティ関数群
 */

import type { StepBuildContext } from "$lib/domain/dsl/types";
import type { EffectId } from "$lib/domain/models/Effect";
import { DUMMY_CARD_IDS } from "./constants";

export const createStepBuildContext = (options?: {
  cardId?: number;
  effectId?: EffectId;
  sourceInstanceId?: string;
}): StepBuildContext => ({
  cardId: options?.cardId ?? DUMMY_CARD_IDS.NORMAL_MONSTER,
  sourceInstanceId: options?.sourceInstanceId,
  effectId: options?.effectId,
});
