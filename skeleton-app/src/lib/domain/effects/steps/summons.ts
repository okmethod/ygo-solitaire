/**
 * summons.ts - 特殊召喚系ステップビルダー
 *
 * 公開関数:
 * - specialSummonFromDeckStep: デッキから条件に合うモンスターを特殊召喚
 *
 * @module domain/effects/steps/summons
 */

import type { CardInstance, BattlePosition } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, GameStateUpdateResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

/**
 * デッキから条件に合うモンスターを選択し、フィールドに特殊召喚するステップ
 *
 * 処理:
 * 1. デッキから条件に合うカードを選択（UI表示）
 * 2. 選択したカードをメインモンスターゾーンに特殊召喚
 * 3. デッキをシャッフル
 *
 * TODO: 攻撃表示or守備表示を選択できるようにする
 */
export const specialSummonFromDeckStep = (config: {
  id: string;
  summary: string;
  description: string;
  filter: (card: CardInstance) => boolean;
  battlePosition?: BattlePosition;
}): AtomicStep => {
  const battlePosition = config.battlePosition ?? "attack";

  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: null, // 動的指定: 実行時に_sourceZoneから取得
      minCards: 1,
      maxCards: 1,
      summary: config.summary,
      description: config.description,
      cancelable: false,
      _sourceZone: "mainDeck",
      _filter: config.filter,
    },
    action: (currentState: GameSnapshot, selectedInstanceIds?: string[]): GameStateUpdateResult => {
      // デッキからフィルター条件に合うカードを取得
      const availableCards = currentState.space.mainDeck.filter(config.filter);

      // 条件に合うカードが存在しない場合はエラー
      if (availableCards.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards available in deck matching the criteria");
      }

      // モンスターゾーンに空きがあるかチェック
      if (GameState.Space.isMainMonsterZoneFull(currentState.space)) {
        return GameProcessing.Result.failure(currentState, "Monster zone is full");
      }

      // まだ選択が行われていない場合（UIが選択モーダルを表示する）
      if (!selectedInstanceIds || selectedInstanceIds.length === 0) {
        return GameProcessing.Result.failure(currentState, "No cards selected");
      }

      // 選択されたカードをデッキからモンスターゾーンへ移動
      const instanceId = selectedInstanceIds[0];
      const card = GameState.Space.findCard(currentState.space, instanceId)!;

      let updatedSpace = GameState.Space.moveCard(currentState.space, card, "mainMonsterZone", {
        position: "faceUp",
        battlePosition: battlePosition,
      });

      // デッキをシャッフル
      updatedSpace = GameState.Space.shuffleMainDeck(updatedSpace);

      const updatedState: GameSnapshot = { ...currentState, space: updatedSpace };
      return GameProcessing.Result.success(
        updatedState,
        `Special summoned ${card.jaName} from deck in ${battlePosition} position`,
      );
    },
  };
};
