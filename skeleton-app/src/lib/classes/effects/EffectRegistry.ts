import type { Effect } from "$lib/types/effect";

/**
 * Effect Factory 関数の型定義
 */
export type EffectFactory = () => Effect[];

/**
 * カードIDに対応する効果を管理するレジストリ
 * 効果のファクトリパターンを実装し、メモリ効率とパフォーマンスを向上
 */
export class EffectRegistry {
  private static effects = new Map<number, EffectFactory>();

  /**
   * カードIDに効果ファクトリを登録する
   * @param cardId カードのID
   * @param factory 効果を生成するファクトリ関数
   */
  static register(cardId: number, factory: EffectFactory): void {
    this.effects.set(cardId, factory);
    console.log(`[EffectRegistry] カードID ${cardId} の効果を登録しました`);
  }

  /**
   * カードIDに対応する効果を取得する
   * @param cardId カードのID
   * @returns 効果の配列（効果がない場合は空配列）
   */
  static getEffects(cardId: number): Effect[] {
    const factory = this.effects.get(cardId);
    if (!factory) {
      return [];
    }

    try {
      return factory();
    } catch (error) {
      console.error(`[EffectRegistry] カードID ${cardId} の効果生成に失敗:`, error);
      return [];
    }
  }

  /**
   * カードに効果が登録されているかチェック
   * @param cardId カードのID
   * @returns 効果が登録されている場合はtrue
   */
  static hasEffects(cardId: number): boolean {
    return this.effects.has(cardId);
  }

  /**
   * 登録されている全てのカードIDを取得
   * @returns 効果が登録されているカードIDの配列
   */
  static getRegisteredCardIds(): number[] {
    return Array.from(this.effects.keys());
  }

  /**
   * 特定のカードの効果登録を削除
   * @param cardId カードのID
   * @returns 削除に成功した場合はtrue
   */
  static unregister(cardId: number): boolean {
    const result = this.effects.delete(cardId);
    if (result) {
      console.log(`[EffectRegistry] カードID ${cardId} の効果登録を削除しました`);
    }
    return result;
  }

  /**
   * 全ての効果登録をクリア
   * 主にテスト用途で使用
   */
  static clear(): void {
    this.effects.clear();
    console.log(`[EffectRegistry] 全ての効果登録をクリアしました`);
  }

  /**
   * 登録されている効果の統計情報を取得
   * @returns 登録統計
   */
  static getStats(): {
    totalRegistered: number;
    cardIds: number[];
  } {
    return {
      totalRegistered: this.effects.size,
      cardIds: this.getRegisteredCardIds(),
    };
  }
}
