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
   * 全てのカード効果をEffectRegistryに登録（後方互換性のため）
   * @deprecated registerEffectsFromDeck を使用してください
   */
  static registerAllEffects(): void {
    console.log("[CardEffectRegistrar] 全効果の一括登録（非推奨）を開始します...");

    // 強欲な壺のみを登録（後方互換性のため）
    EffectRegistry.register(55144522, () => [new PotOfGreedEffect()]);

    const stats = EffectRegistry.getStats();
    console.log(`[CardEffectRegistrar] ${stats.totalRegistered}個のカード効果を登録しました`);
    console.log(`[CardEffectRegistrar] 登録されたカードID: ${stats.cardIds.join(", ")}`);
  }

  /**
   * 効果クラス名に基づいて効果ファクトリーを取得
   * デッキレシピの effectClass フィールドを使用した新しい方式
   */
  private static getEffectFactoryByClass(
    cardId: number,
    effectClass?: string,
  ): (() => import("$lib/types/effect").Effect[]) | null {
    if (!effectClass) {
      // 効果クラスが指定されていない場合、従来の方式にフォールバック
      return this.getEffectFactory(cardId);
    }

    switch (effectClass) {
      case "PotOfGreedEffect":
        return () => [new PotOfGreedEffect()];

      // TODO: 今後追加予定の効果クラス
      // case "ModestPotEffect":
      //   return () => [new ModestPotEffect()];

      // case "JarOfGreedEffect":
      //   return () => [new JarOfGreedEffect()];

      // case "ExodiaWinEffect":
      //   return () => [new ExodiaWinEffect()];

      default:
        console.warn(`[CardEffectRegistrar] 不明な効果クラス: ${effectClass} (カードID: ${cardId})`);
        return null;
    }
  }

  /**
   * カードIDに対応する効果ファクトリーを取得（従来方式）
   * 新しいカード効果を追加する際はここに追加する
   * @deprecated getEffectFactoryByClass を使用してください
   */
  private static getEffectFactory(cardId: number): (() => import("$lib/types/effect").Effect[]) | null {
    switch (cardId) {
      case 55144522: // 強欲な壺
        return () => [new PotOfGreedEffect()];

      // TODO: 今後追加予定の効果
      // case 70278545: // 謙虚な壺
      //   return () => [new ModestPotEffect()];

      // case 83968380: // 強欲な瓶
      //   return () => [new JarOfGreedEffect()];

      // case 33396948: // 封印されしエクゾディア
      //   return () => [new ExodiaWinEffect()];

      default:
        return null;
    }
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
