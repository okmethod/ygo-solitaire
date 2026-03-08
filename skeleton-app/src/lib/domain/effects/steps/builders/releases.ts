/**
 * releases.ts - リリース系ステップビルダー
 *
 * StepBuilder:
 * - releaseAndBurnStepBuilder: フィールドのモンスターをリリースし攻撃力の半分をダメージ
 */

import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot, Player } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import type { StepBuilder } from "../AtomicStepRegistry";

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
  const summary = `モンスターをリリースしてダメージ`;
  const description = `フィールドのモンスター1体をリリースし、攻撃力の${multiplierPercent}%のダメージを与えます`;

  const filter = (card: CardInstance): boolean => {
    return card.type === "monster";
  };

  return {
    id: `${cardId}-release-and-burn`,
    summary,
    description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: 1,
      maxCards: 1,
      summary,
      description,
      cancelable: false,
      _sourceZone: "mainMonsterZone",
      _filter: filter,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // フィールドからフィルター条件に合うカードを取得
      const availableCards = currentState.space.mainMonsterZone.filter(filter);

      // 条件に合うカードが存在しない場合はエラー
      if (availableCards.length === 0) {
        return GameProcessing.Result.failure(currentState, "No monsters available on field to release");
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No monster selected");
      }

      // 選択されたモンスターを取得
      const instanceId = selectedInstanceIds[0];
      const monster = GameState.Space.findCard(currentState.space, instanceId)!;
      const monsterAtk = monster.attack ?? 0;
      const damage = Math.floor(monsterAtk * damageMultiplier);

      // モンスターを墓地へ送る（リリース）
      const updatedSpace = GameState.Space.moveCard(currentState.space, monster, "graveyard");

      // ダメージを適用
      const updatedLp = {
        ...currentState.lp,
        [damageTarget]: currentState.lp[damageTarget] - damage,
      };

      const updatedState: GameSnapshot = {
        ...currentState,
        space: updatedSpace,
        lp: updatedLp,
      };

      return GameProcessing.Result.success(
        updatedState,
        `Released ${monster.jaName} (ATK ${monsterAtk}) and dealt ${damage} damage`,
        [
          {
            type: "sentToGraveyard",
            sourceCardId: monster.id,
            sourceInstanceId: monster.instanceId,
          },
        ],
      );
    },
  };
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
export const releaseAndBurnStepBuilder: StepBuilder = (args, context) => {
  const damageMultiplier = (args.damageMultiplier as number) ?? 0.5;
  const damageTarget = (args.damageTarget as Player) ?? "opponent";

  if (typeof damageMultiplier !== "number" || damageMultiplier <= 0) {
    throw new Error("RELEASE_AND_BURN step requires damageMultiplier to be a positive number");
  }
  if (damageTarget !== "player" && damageTarget !== "opponent") {
    throw new Error('RELEASE_AND_BURN step requires damageTarget to be "player" or "opponent"');
  }

  return releaseAndBurnStep(context.cardId, damageMultiplier, damageTarget);
};
