/**
 * tokens.ts - トークン生成系ステップビルダー
 *
 * StepBuilder:
 * - createTokenMonsterStepBuilder: トークンモンスターを生成して特殊召喚
 */

import type { CardInstance, BattlePosition } from "$lib/domain/models/Card";
import { createInitialStateOnField } from "$lib/domain/models/Card/StateOnField";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { canSpecialSummon } from "$lib/domain/rules/SummonRule";
import { CardDataRegistry } from "$lib/domain/cards";
import type { CardSpace } from "$lib/domain/models/GameState/CardSpace";
import type { StepBuilderFn } from "$lib/domain/dsl/types";
import { ArgValidators } from "$lib/domain/dsl/core/argValidators";

// ===========================
// AtomicStep 生成関数
// ===========================

/**
 * トークンモンスターを生成してフィールドに特殊召喚するステップ
 *
 * 処理:
 * 1. トークンカードデータをレジストリから取得
 * 2. 新しいCardInstanceを生成（ユニークなinstanceIdを付与）
 * 3. メインモンスターゾーンに特殊召喚
 *
 * @param sourceCardId - このステップを発動するカードのID
 * @param tokenCardId - 生成するトークンのカードID
 * @param battlePosition - 表示形式（デフォルト: 攻撃表示）
 */
export const createTokenMonsterStep = (
  sourceCardId: number,
  tokenCardId: number,
  battlePosition: BattlePosition = "attack",
): AtomicStep => {
  const tokenData = CardDataRegistry.getOrUndefined(tokenCardId);
  const tokenName = tokenData?.jaName ?? `トークン(${tokenCardId})`;
  const summary = `${tokenName}を特殊召喚`;

  return {
    id: `${sourceCardId}-create-token-${tokenCardId}`,
    summary,
    description: `${tokenName}を特殊召喚します`,
    notificationLevel: "silent",
    action: (state: GameSnapshot): GameStateUpdateResult => {
      // 1. 特殊召喚可能かチェック
      const validation = canSpecialSummon(state);
      if (!validation.isValid) {
        return GameProcessing.Result.failure(state, GameProcessing.Validation.errorMessage(validation));
      }

      // 2. トークンカードデータを取得
      const tokenCardData = CardDataRegistry.get(tokenCardId);

      // 3. ユニークなinstanceIdを生成
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const instanceId = `token-${tokenCardId}-${timestamp}-${random}`;

      // 4. CardInstanceを生成（フィールドに配置）
      const tokenInstance: CardInstance = {
        ...tokenCardData,
        instanceId,
        location: "mainMonsterZone",
        stateOnField: createInitialStateOnField({
          position: "faceUp",
          battlePosition,
          placedThisTurn: true,
        }),
      };

      // 5. フィールドに追加
      const updatedSpace: CardSpace = {
        ...state.space,
        mainMonsterZone: [...state.space.mainMonsterZone, tokenInstance],
      };

      return GameProcessing.Result.success(
        { ...state, space: updatedSpace },
        `${tokenName}を${battlePosition === "attack" ? "攻撃" : "守備"}表示で特殊召喚しました`,
      );
    },
  };
};

// ===========================
// StepBuilder（DSL用ファクトリ）
// ===========================

/**
 * CREATE_TOKEN_MONSTER - トークンモンスターを生成して特殊召喚
 * args: {
 *   tokenCardId: number,
 *   battlePosition?: BattlePosition
 * }
 */
export const createTokenMonsterStepBuilder: StepBuilderFn = (args, context) => {
  const tokenCardId = ArgValidators.positiveInt(args, "tokenCardId");
  const battlePosition = ArgValidators.optionalOneOf(args, "battlePosition", ["attack", "defense"] as const, "attack");
  return createTokenMonsterStep(context.cardId, tokenCardId, battlePosition);
};
