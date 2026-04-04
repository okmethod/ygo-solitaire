/**
 * EquipSpellActivation - 装備魔法カード発動の抽象基底クラス
 *
 * BaseSpellActivation を拡張し、装備魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズのみ + 対象候補の存在チェック
 * - ACTIVATIONS: 対象選択（発動時に対象を取る）
 * - RESOLUTIONS: カード固有処理 → 装備関係確立
 *
 * Note: 対象選択の情報伝達
 * - 対象選択結果は GameSnapshot.activationContext に effectId をキーとして保存
 * - RESOLUTIONS 時に activationContext から対象を取得して使用
 * - 効果解決後に activationContext をクリア
 *
 * Note: 装備対象のデフォルト
 * - デフォルト: mainMonsterZoneの表側表示モンスターを対象に取る
 * - 装備モンスターの条件や、墓地や除外ゾーンから対象を取る場合は、SELECT_TARGET_* ステップで明示的に選択する
 *
 * @module domain/effects/actions/activations/EquipSpellActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { selectCardsStep } from "$lib/domain/dsl/steps/primitives/userInteractions";
import { saveTargetsToContextStep } from "$lib/domain/dsl/steps/builders/contextOperations";
import { establishEquipStep } from "$lib/domain/dsl/steps/builders/equips";
import { BaseSpellActivation } from "./BaseSpellActivation";

/**
 * EquipSpellActivation - 装備魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class EquipSpellActivation extends BaseSpellActivation {
  /** スペルスピード1（装備魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * デフォルトの装備対象選択機能を使用するかどうか
   *
   * サブクラスでオーバーライドして、デフォルト対象選択機能の使用を制御する。
   * - true: mainMonsterZone の表側表示モンスターから自動選択
   * - false: SELECT_TARGET_* ステップで明示的に対象選択
   *
   * @protected
   * @returns true: デフォルト機能を使用（デフォルト）, false: 明示的に選択
   */
  protected useDefaultEquipTargetSelection(): boolean {
    return true;
  }

  /**
   * CONDITIONS: 発動条件チェック（装備魔法共通）
   *
   * チェック項目:
   * 1. メインフェイズであること
   * 2. 装備対象のモンスターが存在すること（フックで制御可能）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // 1. メインフェイズであること
    if (!GameState.Phase.isMain(state.phase)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    }

    // 2. 装備対象のモンスターが存在すること（フックで制御可能）
    if (this.useDefaultEquipTargetSelection()) {
      // mainMonsterZone の表側表示モンスターをチェック
      const candidates = state.space.mainMonsterZone.filter(
        (card) => card.type === "monster" && Card.Instance.isFaceUp(card),
      );
      if (candidates.length === 0) {
        return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NO_VALID_TARGET);
      }
    }

    return GameProcessing.Validation.success();
  }

  /**
   * CONDITIONS: 発動条件チェック（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualConditions(state: GameSnapshot, sourceInstance: CardInstance): ValidationResult;

  /**
   * ACTIVATIONS: 発動前処理（装備魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  /**
   * ACTIVATIONS: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATIONS: 発動後処理（装備魔法共通）
   *
   * 対象選択ステップを生成する（発動時に対象を取る）。
   * フックで制御可能: DSL定義で明示的な対象選択を行う場合はスキップ。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    // デフォルト対象選択を使用しない場合は空配列を返す
    if (!this.useDefaultEquipTargetSelection()) {
      return [];
    }

    const effectId = this.effectId;
    const filter = (card: CardInstance) => {
      if (card.type !== "monster") return false;
      if (!Card.Instance.isFaceUp(card)) return false;
      return true;
    };

    return [
      selectCardsStep({
        id: `${this.cardId}-select-equip-target`,
        sourceCardId: this.cardId,
        summary: "装備対象を選択",
        description: "装備するモンスターを1体選択してください",
        availableCards: null, // 動的に取得
        _sourceZone: "mainMonsterZone",
        _filter: filter,
        minCards: 1,
        maxCards: 1,
        onSelect: (state, selectedIds) => {
          if (selectedIds.length === 0) {
            return GameProcessing.Result.failure(state, "No target selected");
          }
          return saveTargetsToContextStep(effectId, "装備対象を保存").action(state, selectedIds);
        },
      }),
    ];
  }

  /**
   * RESOLUTIONS: 効果解決前処理（装備魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  /**
   * RESOLUTIONS: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTIONS: 効果解決後処理（装備魔法共通）
   *
   * 装備関係を確立する。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    return [establishEquipStep(this.effectId, sourceInstance.instanceId)];
  }

  /**
   * 装備魔法発動効果の空実装クラスを生成する
   *
   * 発動時に固有の処理を持たないカード用（折れ竹光など）。
   * 対象選択と装備関係確立のみ行う。
   */
  static createNoOp(cardId: number): EquipSpellActivation {
    return new NoOpEquipSpellActivation(cardId);
  }
}

/** 装備魔法発動効果の空実装クラス */
class NoOpEquipSpellActivation extends EquipSpellActivation {
  constructor(cardId: number) {
    super(cardId);
  }

  protected individualConditions(): ValidationResult {
    return GameProcessing.Validation.success();
  }

  protected individualActivationSteps(): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(): AtomicStep[] {
    return [];
  }
}
