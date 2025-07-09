import type { Card } from "$lib/types/card";
import type { EffectResult, Effect } from "$lib/types/effect";
import type { DuelState } from "$lib/classes/DuelState";
import { EffectType } from "$lib/types/effect";
import { BaseEffect } from "$lib/classes/effects/bases/BaseEffect";

/**
 * 複数の効果を組み合わせて実行するコンポジションベースの効果クラス
 *
 * 設計思想:
 * - 継承ではなくコンポジションを使用
 * - 複数のprimitives効果を順次実行
 * - 効果の組み合わせの柔軟性を提供
 *
 * 利点:
 * 1. 複雑な効果を小さな効果の組み合わせで表現
 * 2. primitives効果の再利用性向上
 * 3. 新しい効果の組み合わせが容易
 * 4. テストの独立性確保
 */
export class EffectComposer extends BaseEffect {
  private effects: Effect[] = [];

  constructor(id: string, name: string, description: string, cardId: number, effects: Effect[]) {
    super(id, name, EffectType.ACTIVATE, description, cardId);
    this.effects = effects;
  }

  /**
   * 全ての効果が発動可能かどうかを判定
   * 一つでも発動不可能な効果があれば全体として発動不可
   */
  canActivate(state: DuelState): boolean {
    // EffectComposer自体の基本発動条件チェック
    if (state.gameResult !== "ongoing") {
      return false;
    }

    // 通常魔法として適切なフェイズかチェック
    if (!["メインフェイズ1", "メインフェイズ2"].includes(state.currentPhase)) {
      return false;
    }

    // 全ての効果が発動可能かチェック
    return this.effects.every((effect) => effect.canActivate(state));
  }

  /**
   * 効果を順次実行
   * 一つでも失敗した場合は全体として失敗
   */
  execute(state: DuelState): EffectResult {
    const executedEffects: string[] = [];
    const allDrawnCards: Card[] = [];
    let totalStateChanged = false;

    console.log(`[${this.name}] 複合効果の実行を開始します (${this.effects.length}個の効果)`);

    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i];
      console.log(`[${this.name}] 効果 ${i + 1}/${this.effects.length}: ${effect.name} を実行中...`);

      const result = effect.execute(state);

      if (!result.success) {
        console.error(`[${this.name}] 効果「${effect.name}」の実行に失敗: ${result.message}`);
        return this.createErrorResult(`効果実行に失敗: ${effect.name} - ${result.message}`);
      }

      executedEffects.push(effect.name);

      if (result.stateChanged) {
        totalStateChanged = true;
      }

      // ドローしたカードがあれば記録
      if (result.drawnCards && result.drawnCards.length > 0) {
        allDrawnCards.push(...result.drawnCards);
      }

      console.log(`[${this.name}] 効果「${effect.name}」が正常に実行されました: ${result.message}`);
    }

    const successMessage = `${executedEffects.join(" → ")} の順で実行完了`;
    console.log(`[${this.name}] 全ての効果が正常に実行されました: ${successMessage}`);

    return this.createSuccessResult(
      successMessage,
      totalStateChanged,
      allDrawnCards.length > 0 ? allDrawnCards : undefined,
    );
  }
}
