/**
 * ChainableActionRegistry - チェーン可能な処理のレジストリ
 *
 * Card ID → CardEffectEntry のマッピングを管理
 * 1つのカードIDに対して複数の効果（activation/ignition）を登録・取得できる。
 *
 * Registry Pattern + Strategy Pattern
 * - 効果の一元管理と、交換しやすい実装
 * - Map による O(1) 高速ルックアップ
 */

import type { ChainableAction } from "$lib/domain/models/Effect";
import type { CardInstance } from "$lib/domain/models/Card";
import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { GameEvent, AtomicStep } from "$lib/domain/models/GameProcessing";
import type { ChainBlockParams } from "$lib/domain/models/Chain";
import { Card } from "$lib/domain/models/Card";
import { isTriggerEffect } from "$lib/domain/effects/actions/triggers/BaseTriggerEffect";

/**
 * 1つのカードが持つ効果群を表現するインターフェース
 *
 * - activation: カードの発動時効果（1つのカードに1つ）
 * - ignitionEffects: 起動効果（1つのカードに複数）
 * - triggerEffects: 誘発効果（1つのカードに複数）
 *
 * 将来拡張: quickEffects
 */
interface CardEffectEntry {
  activation?: ChainableAction;
  ignitionEffects: ChainableAction[];
  triggerEffects: ChainableAction[];
}

/** collectTriggerSteps の任意効果エントリ */
interface TriggerOptionalEffect {
  instance: CardInstance;
  action: ChainableAction;
  activationSteps: AtomicStep[];
  resolutionSteps: AtomicStep[];
}

/**
 * チェーン可能な処理のレジストリ（クラス）
 *
 * カードIDをキーとして CardEffectEntry を管理する。
 * Strategy Pattern により、カード効果を交換可能に実装する。
 */
export class ChainableActionRegistry {
  /** チェーン可能な処理のマップ (Card ID → CardEffectEntry) */
  private static effects = new Map<number, CardEffectEntry>();

  // ===========================
  // 登録API
  // ===========================

  /** 発動時効果（activation）を登録する */
  static registerActivation(cardId: number, action: ChainableAction): void {
    const entry = this.getOrCreateEntry(cardId);
    entry.activation = action;
  }

  /** 起動効果（ignition）を登録する */
  static registerIgnition(cardId: number, action: ChainableAction): void {
    const entry = this.getOrCreateEntry(cardId);
    entry.ignitionEffects.push(action);
  }

  /** 誘発効果（trigger）を登録する */
  static registerTrigger(cardId: number, action: ChainableAction): void {
    const entry = this.getOrCreateEntry(cardId);
    entry.triggerEffects.push(action);
  }

  // ===========================
  // 取得API
  // ===========================

  /** 発動時効果（activation）を取得する */
  static getActivation(cardId: number): ChainableAction | undefined {
    return this.effects.get(cardId)?.activation;
  }

  /** 起動効果（ignition）の一覧を取得する */
  static getIgnitionEffects(cardId: number): ChainableAction[] {
    return this.effects.get(cardId)?.ignitionEffects ?? [];
  }

  /** 起動効果（ignition）が登録されているかを判定する */
  static hasIgnitionEffects(cardId: number): boolean {
    const entry = this.effects.get(cardId);
    return entry !== undefined && entry.ignitionEffects.length > 0;
  }

  /** 誘発効果（trigger）の一覧を取得する */
  static getTriggerEffects(cardId: number): ChainableAction[] {
    return this.effects.get(cardId)?.triggerEffects ?? [];
  }

  /** 誘発効果（trigger）が登録されているかを判定する */
  static hasTriggerEffects(cardId: number): boolean {
    const entry = this.effects.get(cardId);
    return entry !== undefined && entry.triggerEffects.length > 0;
  }

  // ===========================
  // 収集API
  // ===========================

  /**
   * イベントに反応する誘発効果のトリガーステップを収集する
   *
   * - 強制効果（isMandatory: true）: mandatorySteps に追加し、チェーンブロックも作成
   * - 任意効果（isMandatory: false）: optionalEffects に追加（確認UI経由で発動）
   */
  static collectTriggerSteps(
    state: GameSnapshot,
    event: GameEvent,
  ): {
    mandatorySteps: AtomicStep[];
    mandatoryChainBlocks: ChainBlockParams[];
    optionalEffects: TriggerOptionalEffect[];
  } {
    const mandatorySteps: AtomicStep[] = [];
    const mandatoryChainBlocks: ChainBlockParams[] = [];
    const optionalEffects: TriggerOptionalEffect[] = [];

    // Helper: カードから誘発効果を収集
    const collectFromCards = (cards: readonly CardInstance[], requireFaceUp: boolean) => {
      for (const card of cards) {
        if (requireFaceUp && !Card.Instance.isFaceUp(card)) continue;

        const triggerEffects = this.getTriggerEffects(card.id);
        for (const effect of triggerEffects) {
          // 型ガードで BaseTriggerEffect であることを確認
          if (!isTriggerEffect(effect)) continue;

          // triggers プロパティチェック
          if (!effect.triggers.includes(event.type)) continue;

          // selfOnly チェック
          if (effect.selfOnly && event.sourceInstanceId !== card.instanceId) continue;

          // excludeSelf チェック
          if (effect.excludeSelf && event.sourceInstanceId === card.instanceId) continue;

          // 発動条件チェック
          const canActivate = effect.canActivate(state, card);
          if (!canActivate.isValid) continue;

          // ActivationSteps と ResolutionSteps を生成
          const activationSteps = effect.createActivationSteps(state, card);
          const resolutionSteps = effect.createResolutionSteps(state, card);

          if (effect.isMandatory) {
            // 強制効果: チェーンブロックを収集してステップを追加
            mandatoryChainBlocks.push({
              sourceInstanceId: card.instanceId,
              sourceCardId: card.id,
              effectId: effect.effectId,
              spellSpeed: effect.spellSpeed,
              resolutionSteps,
              isNegated: false,
            });
            mandatorySteps.push(...activationSteps);
          } else {
            // 任意効果: 確認UI経由で発動するため optionalEffects に追加
            optionalEffects.push({ instance: card, action: effect, activationSteps, resolutionSteps });
          }
        }
      }
    };

    // 手札: 表裏判定不要
    collectFromCards(state.space.hand, false);
    // モンスターゾーン: 表側表示のみ
    collectFromCards(state.space.mainMonsterZone, true);
    // 魔法罠ゾーン: 表側表示のみ
    collectFromCards(state.space.spellTrapZone, true);
    // フィールドゾーン: 表側表示のみ
    collectFromCards(state.space.fieldZone, true);
    // 墓地: 表裏判定不要
    collectFromCards(state.space.graveyard, false);
    // 除外: 表裏判定不要
    collectFromCards(state.space.banished, false);

    return { mandatorySteps, mandatoryChainBlocks, optionalEffects };
  }

  /**
   * チェーン可能なカードと効果を収集する
   *
   * 探索対象:
   * - 手札: 速攻魔法カードの発動、モンスターの手札誘発効果の発動
   * - モンスターゾーン（表側表示）: 起動効果、誘発効果、誘発即時効果の発動
   * - 魔法罠ゾーン（セット状態）: 罠カード・速攻魔法カードの発動
   * - 魔法罠ゾーン（表側表示）: 永続魔法・罠の効果の発動
   * - フィールドゾーン（表側表示）: フィールド魔法の効果の発動
   * - 墓地: 墓地発動効果
   * - 除外: 除外状態で発動できる効果
   *
   * 発動可否の判定は spellSpeed と canActivate に委譲する。
   * 既にチェーンスタックに積まれているカードは除外される。
   */
  static collectChainableActions(
    state: GameSnapshot,
    requiredSpellSpeed: 1 | 2 | 3,
    excludeInstanceIds: Set<string> = new Set(),
  ): { instance: CardInstance; action: ChainableAction }[] {
    const result: { instance: CardInstance; action: ChainableAction }[] = [];

    // 手札: カードの発動 + 効果の発動
    for (const card of state.space.hand) {
      if (excludeInstanceIds.has(card.instanceId)) continue;
      this.collectActivation(result, card, state, requiredSpellSpeed);
      this.collectEffects(result, card, state, requiredSpellSpeed);
    }

    // モンスターゾーン: 表側表示の効果の発動
    for (const card of state.space.mainMonsterZone) {
      if (excludeInstanceIds.has(card.instanceId)) continue;
      if (!Card.Instance.isFaceUp(card)) continue;
      this.collectEffects(result, card, state, requiredSpellSpeed);
    }

    // 魔法罠ゾーン: 裏側表示のカードの発動、表側表示の効果の発動
    for (const card of state.space.spellTrapZone) {
      if (excludeInstanceIds.has(card.instanceId)) continue;
      if (Card.Instance.isFaceDown(card)) {
        this.collectActivation(result, card, state, requiredSpellSpeed);
      } else {
        this.collectEffects(result, card, state, requiredSpellSpeed);
      }
    }

    // フィールドゾーン: 表側表示の効果の発動
    for (const card of state.space.fieldZone) {
      if (excludeInstanceIds.has(card.instanceId)) continue;
      if (!Card.Instance.isFaceUp(card)) continue;
      this.collectEffects(result, card, state, requiredSpellSpeed);
    }

    // 墓地: 効果の発動
    for (const card of state.space.graveyard) {
      if (excludeInstanceIds.has(card.instanceId)) continue;
      this.collectEffects(result, card, state, requiredSpellSpeed);
    }

    // 除外: 効果の発動
    for (const card of state.space.banished) {
      if (excludeInstanceIds.has(card.instanceId)) continue;
      this.collectEffects(result, card, state, requiredSpellSpeed);
    }

    return result;
  }

  /**
   * カードの発動（activation）を収集する
   */
  private static collectActivation(
    result: { instance: CardInstance; action: ChainableAction }[],
    card: CardInstance,
    state: GameSnapshot,
    requiredSpellSpeed: 1 | 2 | 3,
  ): void {
    const activation = this.getActivation(card.id);
    if (activation) {
      this.tryAddAction(result, card, activation, state, requiredSpellSpeed);
    }
  }

  /**
   * 効果の発動（ignition/trigger/quick）を収集する
   */
  private static collectEffects(
    result: { instance: CardInstance; action: ChainableAction }[],
    card: CardInstance,
    state: GameSnapshot,
    requiredSpellSpeed: 1 | 2 | 3,
  ): void {
    // ignitionEffects（起動効果）
    for (const ignition of this.getIgnitionEffects(card.id)) {
      this.tryAddAction(result, card, ignition, state, requiredSpellSpeed);
    }
    // triggerEffects（誘発効果）
    for (const trigger of this.getTriggerEffects(card.id)) {
      this.tryAddAction(result, card, trigger, state, requiredSpellSpeed);
    }
    // TODO: quickEffects（誘発即時効果）
  }

  /**
   * 発動可能な効果を結果配列に追加する
   */
  private static tryAddAction(
    result: { instance: CardInstance; action: ChainableAction }[],
    card: CardInstance,
    action: ChainableAction,
    state: GameSnapshot,
    requiredSpellSpeed: 1 | 2 | 3,
  ): void {
    if (action.spellSpeed < requiredSpellSpeed) return;

    const validation = action.canActivate(state, card);
    if (validation.isValid) {
      result.push({ instance: card, action });
    }
  }

  // ===========================
  // ユーティリティAPI
  // ===========================

  /** レジストリをクリアする（テスト用） */
  static clear(): void {
    this.effects.clear();
  }

  /** 登録済みカードIDの一覧を取得する（デバッグ用） */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.effects.keys());
  }

  // ===========================
  // Private Helpers
  // ===========================

  /** CardEffectEntryを取得または新規作成する */
  private static getOrCreateEntry(cardId: number): CardEffectEntry {
    let entry = this.effects.get(cardId);
    if (!entry) {
      entry = { ignitionEffects: [], triggerEffects: [] };
      this.effects.set(cardId, entry);
    }
    return entry;
  }
}
