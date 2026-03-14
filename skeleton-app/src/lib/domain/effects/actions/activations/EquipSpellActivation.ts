/**
 * EquipSpellActivation - 装備魔法カード発動の抽象基底クラス
 *
 * BaseSpellActivation を拡張し、装備魔法に共通するプロパティとメソッドを提供する。
 *
 * Implementation using ChainableAction model:
 * - CONDITIONS: メインフェイズのみ + 対象候補の存在チェック
 * - ACTIVATION: 発動通知のみ（対象選択はRESOLUTIONで実施）
 * - RESOLUTION: 対象選択 → カード固有処理 → 装備関係確立
 *
 * Note: 対象選択の情報伝達
 * - 対象選択結果は GameSnapshot.activationContext に effectId をキーとして保存
 * - RESOLUTION 時に activationContext から対象を取得して使用
 * - 効果解決後に activationContext をクリア
 *
 * @module domain/effects/actions/spells/EquipSpellActivation
 */

import type { CardInstance } from "$lib/domain/models/Card";
import { Card } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import { GameState } from "$lib/domain/models/GameState";
import type { AtomicStep, ValidationResult } from "$lib/domain/models/GameProcessing";
import { GameProcessing } from "$lib/domain/models/GameProcessing";
import { BaseSpellActivation } from "$lib/domain/effects/actions/activations/BaseSpellActivation";
import type { LocationName } from "$lib/domain/models/Location";
import { selectCardsStep } from "$lib/domain/effects/steps/builders/userInteractions";

/**
 * 装備対象の設定
 *
 * 各装備魔法カードが対象を取るゾーンとフィルター条件を定義する。
 */
export interface EquipTargetConfig {
  /** 対象を取るゾーン */
  readonly sourceZone: LocationName;
  /** 対象の追加フィルター条件（省略時は全モンスター） */
  readonly filter?: (card: CardInstance) => boolean;
}

/**
 * EquipSpellActivation - 装備魔法カードの抽象基底クラス
 *
 * @abstract
 */
export abstract class EquipSpellActivation extends BaseSpellActivation {
  /** スペルスピード1（装備魔法） */
  readonly spellSpeed = 1 as const;

  /**
   * 装備対象の設定を取得する
   *
   * サブクラスでオーバーライドして、対象を取るゾーンとフィルターを指定する。
   * デフォルト: メインモンスターゾーンの全モンスター
   */
  protected getEquipTargetConfig(): EquipTargetConfig {
    return {
      sourceZone: "mainMonsterZone",
    };
  }

  /**
   * 装備対象候補のカードを取得する
   */
  protected getEquipTargetCandidates(state: GameSnapshot): CardInstance[] {
    const config = this.getEquipTargetConfig();
    const zone = state.space[config.sourceZone] as readonly CardInstance[];

    return zone.filter((card) => {
      // モンスターカードのみ
      if (card.type !== "monster") return false;
      // フィールドの場合は表側表示のみ
      if (config.sourceZone === "mainMonsterZone" && !Card.Instance.isFaceUp(card)) return false;
      // 追加フィルター
      if (config.filter && !config.filter(card)) return false;
      return true;
    });
  }

  /**
   * CONDITIONS: 発動条件チェック（装備魔法共通）
   *
   * チェック項目:
   * 1. メインフェイズであること
   * 2. 装備対象のモンスターが存在すること
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypeConditions(state: GameSnapshot, _sourceInstance: CardInstance): ValidationResult {
    // 1. メインフェイズであること
    if (!GameState.Phase.isMain(state.phase)) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    }

    // 2. 装備対象のモンスターが存在すること
    const candidates = this.getEquipTargetCandidates(state);
    if (candidates.length === 0) {
      return GameProcessing.Validation.failure(GameProcessing.Validation.ERROR_CODES.NO_VALID_TARGET);
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
   * ACTIVATION: 発動前処理（装備魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  /**
   * ACTIVATION: 発動処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualActivationSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * ACTIVATION: 発動後処理（装備魔法共通）
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostActivationSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    return [];
  }

  /**
   * RESOLUTION: 効果解決前処理（装備魔法共通）
   *
   * 対象選択ステップを生成する。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePreResolutionSteps(_state: GameSnapshot, _sourceInstance: CardInstance): AtomicStep[] {
    const config = this.getEquipTargetConfig();
    const filter = (card: CardInstance) => {
      if (card.type !== "monster") return false;
      if (config.sourceZone === "mainMonsterZone" && !Card.Instance.isFaceUp(card)) return false;
      if (config.filter && !config.filter(card)) return false;
      return true;
    };

    return [
      selectCardsStep({
        id: `${this.cardId}-select-equip-target`,
        summary: "装備対象を選択",
        description: "装備するモンスターを1体選択してください",
        availableCards: null, // 動的に取得
        _sourceZone: config.sourceZone,
        _filter: filter,
        minCards: 1,
        maxCards: 1,
        onSelect: (state, selectedIds) => {
          if (selectedIds.length === 0) {
            return GameProcessing.Result.failure(state, "No target selected");
          }
          // 選択結果を activationContext に保存（後続のステップで使用）
          const targetInstanceId = selectedIds[0];
          const updatedState: GameSnapshot = {
            ...state,
            activationContexts: GameState.ActivationContext.setTargets(state.activationContexts, this.effectId, [
              targetInstanceId,
            ]),
          };
          return GameProcessing.Result.success(updatedState, `Selected equip target: ${targetInstanceId}`);
        },
      }),
    ];
  }

  /**
   * RESOLUTION: 効果解決処理（カード固有）
   *
   * @protected
   * @abstract
   */
  protected abstract individualResolutionSteps(state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[];

  /**
   * RESOLUTION: 効果解決後処理（装備魔法共通）
   *
   * 装備関係を確立する。
   *
   * @protected
   * @final このメソッドはオーバーライドしない
   */
  protected subTypePostResolutionSteps(_state: GameSnapshot, sourceInstance: CardInstance): AtomicStep[] {
    const effectId = this.effectId;

    return [
      {
        id: `${this.cardId}-establish-equip`,
        summary: "装備関係確立",
        description: "装備魔法をモンスターに装備します",
        notificationLevel: "silent",
        action: (currentState: GameSnapshot) => {
          // activationContext から対象を取得
          const targets = GameState.ActivationContext.getTargets(currentState.activationContexts, effectId);
          if (targets.length === 0) {
            return GameProcessing.Result.failure(currentState, "No equip target found");
          }
          const targetInstanceId = targets[0];

          // 装備魔法カードを見つける
          const equipCard = GameState.Space.findCard(currentState.space, sourceInstance.instanceId);
          if (!equipCard || !equipCard.stateOnField) {
            return GameProcessing.Result.failure(currentState, "Equip spell card not found on field");
          }

          // 装備魔法カードの stateOnField.equippedTo を更新
          const updatedSpace = GameState.Space.updateCardStateInPlace(currentState.space, equipCard, {
            equippedTo: targetInstanceId,
          });

          // activationContext をクリア
          const updatedState: GameSnapshot = {
            ...currentState,
            space: updatedSpace,
            activationContexts: GameState.ActivationContext.clear(currentState.activationContexts, effectId),
          };

          return GameProcessing.Result.success(updatedState, `Equipped to ${targetInstanceId}`);
        },
      },
    ];
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

  /**
   * 装備魔法発動効果を設定付きで生成する
   *
   * DSLから呼び出され、対象設定とカード固有処理を持つ装備魔法を生成する。
   */
  static createWithConfig(
    cardId: number,
    targetConfig: EquipTargetConfig,
    individualResolutionSteps: AtomicStep[] = [],
  ): EquipSpellActivation {
    return new ConfigurableEquipSpellActivation(cardId, targetConfig, individualResolutionSteps);
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

/** 設定可能な装備魔法発動効果クラス（DSL用） */
class ConfigurableEquipSpellActivation extends EquipSpellActivation {
  private readonly targetConfig: EquipTargetConfig;
  private readonly resolutionSteps: AtomicStep[];

  constructor(cardId: number, targetConfig: EquipTargetConfig, resolutionSteps: AtomicStep[]) {
    super(cardId);
    this.targetConfig = targetConfig;
    this.resolutionSteps = resolutionSteps;
  }

  protected override getEquipTargetConfig(): EquipTargetConfig {
    return this.targetConfig;
  }

  protected individualConditions(): ValidationResult {
    return GameProcessing.Validation.success();
  }

  protected individualActivationSteps(): AtomicStep[] {
    return [];
  }

  protected individualResolutionSteps(): AtomicStep[] {
    return this.resolutionSteps;
  }
}
