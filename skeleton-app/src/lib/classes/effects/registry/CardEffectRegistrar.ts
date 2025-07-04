import { EffectRegistry } from "../EffectRegistry";
import type { DeckRecipe } from "$lib/types/deck";
import type { Effect } from "$lib/types/effect";
import { EFFECT_CLASS_REGISTRY, isRegisteredEffectClass } from "./effectsConfig";

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
   * 設定ファイルベースの効果クラス取得
   * 新しい効果を追加する際は effectsConfig.ts に追加するだけでOK
   */
  private static getEffectFactoryByClass(cardId: number, effectClass?: string): (() => Effect[]) | null {
    if (!effectClass) {
      // 効果クラスが指定されていない場合は null を返す
      return null;
    }

    const EffectClass = this.getEffectClass(effectClass);
    if (!EffectClass) {
      console.warn(`[CardEffectRegistrar] 未登録の効果クラス: ${effectClass} (カードID: ${cardId})`);
      console.info(`効果クラスを追加するには effectsConfig.ts に追加してください`);
      return null;
    }

    return () => [new EffectClass()];
  }

  /**
   * 実行時に効果クラスを一時的に登録
   * 主にテスト用途で使用（本番では effectsConfig.ts を使用）
   */
  private static runtimeEffectRegistry = new Map<string, new () => Effect>();

  static registerEffectClass(className: string, effectClass: new () => Effect): void {
    this.runtimeEffectRegistry.set(className, effectClass);
    console.log(`[CardEffectRegistrar] 実行時効果クラス「${className}」を登録しました`);
  }

  /**
   * 実行時登録とコンフィグ登録の両方をチェック
   */
  private static getEffectClass(effectClassName: string): (new () => Effect) | null {
    // まず実行時登録をチェック（テスト用途）
    if (this.runtimeEffectRegistry.has(effectClassName)) {
      return this.runtimeEffectRegistry.get(effectClassName)!;
    }

    // 次にコンフィグファイルの登録をチェック
    if (isRegisteredEffectClass(effectClassName)) {
      return EFFECT_CLASS_REGISTRY[effectClassName];
    }

    return null;
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
