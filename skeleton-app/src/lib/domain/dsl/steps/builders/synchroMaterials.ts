/**
 * synchroMaterials.ts - シンクロ素材選択ステップビルダー
 *
 * 公開関数:
 * - selectSynchroMaterialsStep: シンクロ素材を選択するステップ
 */

import { Card, type CardInstance } from "$lib/domain/models/Card";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameEvent } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { selectCardsStep } from "../primitives/userInteractions";

// ===========================
// 設定型
// ===========================

/**
 * selectSynchroMaterialsStep の設定
 */
export type SelectSynchroMaterialsConfig = {
  synchroMonsterId: number;
  synchroMonsterInstanceId: string;
  synchroMonsterName: string;
  targetLevel: number;
};

// ===========================
// 内部ヘルパー
// ===========================

/**
 * 選択中のカードがシンクロ召喚条件を満たすかチェック
 *
 * 条件:
 * - チューナー1体以上
 * - 非チューナー1体以上
 * - レベル合計がシンクロモンスターのレベルと一致
 */
function isValidSynchroMaterialSelection(selectedCards: readonly CardInstance[], targetLevel: number): boolean {
  if (selectedCards.length < 2) return false;

  const hasTuner = selectedCards.some((c) => Card.isTuner(c));
  const hasNonTuner = selectedCards.some((c) => Card.isNonTuner(c));

  if (!hasTuner || !hasNonTuner) return false;

  const totalLevel = selectedCards.reduce((sum, c) => sum + (c.level ?? 0), 0);
  return totalLevel === targetLevel;
}

// ===========================
// ステップ生成関数
// ===========================

/**
 * シンクロ素材を選択するステップ（1ステップ選択）
 *
 * 処理:
 * 1. フィールドのモンスターから素材を選択（チューナー+非チューナー）
 * 2. canConfirm で条件チェック（条件を満たすまで確定ボタン無効）
 * 3. 素材を墓地へ送る
 * 4. シンクロモンスターを特殊召喚
 */
export const selectSynchroMaterialsStep = (config: SelectSynchroMaterialsConfig): AtomicStep => {
  return selectCardsStep({
    id: `${config.synchroMonsterId}-select-synchro-materials`,
    summary: "シンクロ素材を選択",
    description: `チューナー＋非チューナーを選び、レベル合計が ${config.targetLevel} になるようにしてください`,
    availableCards: null,
    _sourceZone: "mainMonsterZone",
    _filter: (card) => Card.Instance.isFaceUp(card),
    minCards: 2,
    maxCards: 5, // 最大5体まで選択可能
    cancelable: true,
    canConfirm: (selectedCards) => isValidSynchroMaterialSelection(selectedCards, config.targetLevel),
    onSelect: (currentState, selectedIds) => {
      if (selectedIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "シンクロ召喚をキャンセルしました");
      }

      // 素材を墓地へ送る
      let updatedSpace = currentState.space;
      const releaseEvents: GameEvent[] = [];

      for (const instanceId of selectedIds) {
        const card = GameState.Space.findCard(updatedSpace, instanceId);
        if (card) {
          updatedSpace = GameState.Space.moveCard(updatedSpace, card, "graveyard");
          releaseEvents.push({
            type: "sentToGraveyard",
            sourceCardId: card.id,
            sourceInstanceId: card.instanceId,
          });
        }
      }

      // シンクロモンスターを特殊召喚
      const synchroMonster = GameState.Space.findCard(updatedSpace, config.synchroMonsterInstanceId)!;
      updatedSpace = GameState.Space.moveCard(updatedSpace, synchroMonster, "mainMonsterZone", {
        position: "faceUp",
        battlePosition: "attack",
      });

      const emittedEvents: GameEvent[] = [
        ...releaseEvents,
        {
          type: "monsterSummoned" as const,
          sourceCardId: synchroMonster.id,
          sourceInstanceId: synchroMonster.instanceId,
        },
      ];

      return GameProcessing.Result.success(
        { ...currentState, space: updatedSpace },
        `${Card.nameWithBrackets(synchroMonster)}をシンクロ召喚しました`,
        emittedEvents,
      );
    },
  });
};
