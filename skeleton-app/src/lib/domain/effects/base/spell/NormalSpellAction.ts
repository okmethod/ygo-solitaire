/**
 * NormalSpellAction - 通常魔法カード発動の抽象基底クラス
 *
 * BaseSpellAction を拡張し、通常魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズのみ
 * - ACTIVATION: 特になし（サブクラスで実装）
 * - RESOLUTION: 効果解決後に墓地に送られる
 *
 * @module domain/effects/base/spell/NormalSpellAction
 */

import type { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep } from "$lib/domain/models/AtomicStep";
import { BaseSpellAction } from "$lib/domain/effects/base/spell/BaseSpellAction";
import { isMainPhase } from "$lib/domain/models/Phase";

/**
 * NormalSpellAction - 通常魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class NormalSpellAction extends BaseSpellAction {
  /** スペルスピード1（通常魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * CONDITIONS: 発動条件チェック（通常魔法共通）
   *
   * チェック項目:
   * 1. メインフェイズであること
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(state: GameState): boolean {
    // 1. メインフェイズであること
    if (!isMainPhase(state.phase)) {
      return false;
    }

    return true;
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameState): boolean;

  /**
   * ACTIVATION: 発動前処理（通常魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameState): AtomicStep[] {
    return []; // 通常魔法は発動前処理なし
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   */
  protected abstract individualActivationSteps(_state: GameState): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（通常魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameState): AtomicStep[] {
    return []; // 通常魔法は発動後処理なし
  }

  /**
   * RESOLUTION: 効果解決前処理（通常魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameState, _activatedCardInstanceId: string): AtomicStep[] {
    return []; // 通常魔法は効果解決前処理なし
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameState, activatedCardInstanceId: string): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（通常魔法共通）
   *
   * 通常魔法は効果解決後に墓地へ送られる。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameState, activatedCardInstanceId: string): AtomicStep[] {
    return [
      // TODO: sendToGraveyardStep を使うように修正したいので、CardInstance を引数で受け取るように変更する必要がある
      {
        id: `${activatedCardInstanceId}-send-to-graveyard`,
        summary: "墓地へ送る",
        description: "通常魔法カードを墓地へ送ります",
        notificationLevel: "info",
        action: (currentState: GameState) => {
          // カードを魔法・罠ゾーンから墓地へ移動
          const card = currentState.zones.spellTrapZone.find((c) => c.instanceId === activatedCardInstanceId);
          if (!card) {
            return {
              success: false,
              updatedState: currentState,
              message: `Card not found in spell/trap zone: ${activatedCardInstanceId}`,
            };
          }

          const updatedState: GameState = {
            ...currentState,
            zones: {
              ...currentState.zones,
              spellTrapZone: currentState.zones.spellTrapZone.filter((c) => c.instanceId !== activatedCardInstanceId),
              graveyard: [...currentState.zones.graveyard, card],
            },
          };

          return {
            success: true,
            updatedState,
            message: `Normal spell sent to graveyard: ${activatedCardInstanceId}`,
          };
        },
      },
    ];
  }
}
