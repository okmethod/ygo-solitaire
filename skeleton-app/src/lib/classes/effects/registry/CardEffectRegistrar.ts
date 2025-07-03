import { EffectRegistry } from "../EffectRegistry";
import { PotOfGreedEffect } from "../cards/PotOfGreedEffect";

/**
 * カード効果の一括登録を管理するクラス
 * アプリケーション初期化時に全てのカード効果をEffectRegistryに登録する
 */
export class CardEffectRegistrar {
  /**
   * 全てのカード効果をEffectRegistryに登録
   * アプリ起動時に一度だけ実行される
   */
  static registerAllEffects(): void {
    console.log("[CardEffectRegistrar] カード効果の一括登録を開始します...");

    // エクゾディアデッキのカード効果を登録
    this.registerExodiaEffects();

    const stats = EffectRegistry.getStats();
    console.log(`[CardEffectRegistrar] ${stats.totalRegistered}個のカード効果を登録しました`);
    console.log(`[CardEffectRegistrar] 登録されたカードID: ${stats.cardIds.join(", ")}`);
  }

  /**
   * エクゾディアデッキ関連の効果を登録
   */
  private static registerExodiaEffects(): void {
    // 強欲な壺 (ID: 55144522)
    EffectRegistry.register(55144522, () => [new PotOfGreedEffect()]);

    // TODO: 今後追加予定の効果
    // 謙虚な壺 (ID: 70278545)
    // EffectRegistry.register(70278545, () => [new ModestPotEffect()]);

    // 強欲な瓶 (ID: 83968380)
    // EffectRegistry.register(83968380, () => [new JarOfGreedEffect()]);

    // エクゾディア勝利条件 (ID: 33396948)
    // EffectRegistry.register(33396948, () => [new ExodiaWinEffect()]);
  }

  /**
   * 特定のカードIDの効果登録状況を確認
   */
  static checkRegistration(cardId: number): {
    isRegistered: boolean;
    effectCount: number;
    effectNames: string[];
  } {
    const effects = EffectRegistry.getEffects(cardId);
    return {
      isRegistered: EffectRegistry.hasEffects(cardId),
      effectCount: effects.length,
      effectNames: effects.map((effect) => effect.name),
    };
  }

  /**
   * 登録済み効果の一覧を取得（デバッグ用）
   */
  static getRegistrationSummary(): {
    totalCards: number;
    registeredCards: {
      cardId: number;
      effectNames: string[];
    }[];
  } {
    const stats = EffectRegistry.getStats();
    const registeredCards = stats.cardIds.map((cardId) => ({
      cardId,
      effectNames: EffectRegistry.getEffects(cardId).map((effect) => effect.name),
    }));

    return {
      totalCards: stats.totalRegistered,
      registeredCards,
    };
  }
}
