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

import type { ChainableAction } from "$lib/domain/models/ChainableAction";

/**
 * 1つのカードが持つ効果群を表現するインターフェース
 *
 * - activation: カードの発動時効果（1つのカードに1つ）
 * - ignitionEffects: 起動効果（1つのカードに複数）
 *
 * 将来拡張: triggerEffects, quickEffects
 */
interface CardEffectEntry {
  activation?: ChainableAction;
  ignitionEffects: ChainableAction[];
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
      entry = { ignitionEffects: [] };
      this.effects.set(cardId, entry);
    }
    return entry;
  }
}
