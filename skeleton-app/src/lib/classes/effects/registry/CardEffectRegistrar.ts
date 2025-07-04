import { EffectRegistry } from "../EffectRegistry";
import { PotOfGreedEffect } from "../cards/PotOfGreedEffect";
import type { DeckRecipe } from "$lib/types/deck";

/**
 * カード効果の動的登録を管理するクラス
 * デッキレシピに基づいて必要な効果のみを登録する
 */
export class CardEffectRegistrar {
  /**
   * デッキレシピに基づいて効果を登録
   * デッキに含まれるカードの効果のみを登録する
   */
  static registerEffectsFromDeck(deck: DeckRecipe): void {
    console.log(`[CardEffectRegistrar] デッキ「${deck.name}」の効果登録を開始します...`);

    // 登録前に既存の効果をクリア
    EffectRegistry.clear();

    // メインデッキとエクストラデッキの全カードを取得
    const allCards = [...deck.mainDeck, ...deck.extraDeck];

    // 重複を除去（IDベース）
    const uniqueCards = new Map<number, string | undefined>();
    for (const card of allCards) {
      uniqueCards.set(card.id, card.effectClass);
    }

    let registeredCount = 0;

    for (const [cardId, effectClass] of uniqueCards) {
      const effectFactory = this.getEffectFactoryByClass(cardId, effectClass);
      if (effectFactory) {
        EffectRegistry.register(cardId, effectFactory);
        registeredCount++;
        console.log(`[CardEffectRegistrar] カードID ${cardId} (${effectClass}) の効果を登録しました`);
      }
    }

    console.log(`[CardEffectRegistrar] ${registeredCount}個のカード効果を登録しました`);
    console.log(
      `[CardEffectRegistrar] 登録されたカードID: ${Array.from(uniqueCards.keys())
        .filter((id) => this.getEffectFactoryByClass(id, uniqueCards.get(id)) !== null)
        .join(", ")}`,
    );
  }

  /**
   * 効果クラス名に基づいて効果ファクトリーを取得
   * デッキレシピの effectClass フィールドを使用した新しい方式
   */
  /**
   * 効果クラスのレジストリ
   * クラス名とコンストラクタのマッピング
   *
   * この方式の利点:
   * 1. 新しい効果クラスを動的に登録可能
   * 2. テスト時のモック効果の注入が容易
   * 3. プラグインシステムとして拡張可能
   * 4. switch文よりも保守性が高い
   */
  private static effectClassRegistry = new Map<string, new () => import("$lib/types/effect").Effect>([
    ["PotOfGreedEffect", PotOfGreedEffect],
    // TODO: 今後追加予定の効果クラス
    // ["ModestPotEffect", ModestPotEffect],
    // ["JarOfGreedEffect", JarOfGreedEffect],
    // ["ExodiaWinEffect", ExodiaWinEffect],
  ]);

  private static getEffectFactoryByClass(
    cardId: number,
    effectClass?: string,
  ): (() => import("$lib/types/effect").Effect[]) | null {
    if (!effectClass) {
      // 効果クラスが指定されていない場合は null を返す
      return null;
    }

    const EffectClass = this.effectClassRegistry.get(effectClass);
    if (!EffectClass) {
      console.warn(`[CardEffectRegistrar] 不明な効果クラス: ${effectClass} (カードID: ${cardId})`);
      return null;
    }

    return () => [new EffectClass()];
  }

  /**
   * 新しい効果クラスをレジストリに登録
   * テストや動的な効果追加で使用
   */
  static registerEffectClass(className: string, effectClass: new () => import("$lib/types/effect").Effect): void {
    this.effectClassRegistry.set(className, effectClass);
    console.log(`[CardEffectRegistrar] 効果クラス「${className}」を登録しました`);
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
