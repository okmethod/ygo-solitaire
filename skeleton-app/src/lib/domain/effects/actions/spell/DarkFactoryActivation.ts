/**
 * DarkFactoryActivation - 《闇の量産工場》(Dark Factory of Mass Production)
 *
 * Card ID: 90928333 | Type: Spell | Subtype: Normal
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: ゲーム続行中、メインフェイズ、墓地に通常モンスターが2体以上
 * - ACTIVATION: 発動通知のみ
 * - RESOLUTION: 墓地から通常モンスター2体を選択し手札に加える
 *
 * @module domain/effects/actions/spell/DarkFactoryActivation
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { NormalSpellAction } from "$lib/domain/effects/base/spell/NormalSpellAction";
import { salvageFromGraveyardStep } from "$lib/domain/effects/steps/searches";

/**
 * DarkFactoryActivation
 *
 * Implements ChainableAction for Dark Factory of Mass Production implementation.
 */
export class DarkFactoryActivation extends NormalSpellAction {
  constructor() {
    super(90928333);
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * チェック項目:
   * 1. 墓地に通常モンスターが2体以上いること
   */
  protected individualConditions(state: GameState): boolean {
    // 1. 墓地に通常モンスターが2体以上いること
    const normalMonsters = state.zones.graveyard.filter(
      (card) => card.type === "monster" && card.frameType === "normal",
    );
    return normalMonsters.length >= 2;
  }

  /**
   * RESOLUTION: 効果解決時の処理
   *
   * 1. 墓地から通常モンスター2体を選択
   * 2. 選択したモンスターを手札に加える
   * 3. このカードを墓地に送る
   *
   * @param state - 現在のゲーム状態
   * @param activatedCardInstanceId - 発動したカードのインスタンスID
   * @returns 効果解決ステップ配列
   */
  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // Step 1: Select 2 Normal Monsters from graveyard
      salvageFromGraveyardStep({
        id: `dark-factory-search-${activatedCardInstanceId}`,
        summary: "通常モンスター2枚をサルベージ",
        description: "墓地から通常モンスター2体を選択し、手札に加えます",
        filter: (card) => card.type === "monster" && card.frameType === "normal",
        minCards: 2,
        maxCards: 2,
        cancelable: false,
      }),
    ];
  }
}
