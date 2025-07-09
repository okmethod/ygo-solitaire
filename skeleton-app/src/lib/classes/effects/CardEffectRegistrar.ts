import type { DeckRecipe } from "$lib/types/deck";
import type { Effect } from "$lib/types/effect";
import { EffectRepository } from "$lib/classes/effects/EffectRepository";
import { CARD_EFFECTS, isRegisteredCardEffect } from "$lib/classes/effects/cards/cardEffects";

/**
 * カード固有効果の動的登録を管理するクラス
 * デッキレシピに基づいてカード固有効果のみを登録する
 *
 * 設計思想:
 * - cards/ ディレクトリのカード固有効果のみを対象
 * - atoms/ の再利用可能効果は継承により使用される
 * - デッキレシピのeffectClassフィールドで指定されるのはカード固有効果のみ
 */
export class CardEffectRegistrar {
  /**
   * デッキレシピに基づいてカード固有効果を登録
   * デッキに含まれるカードのカード固有効果のみを登録する
   */
  static registerEffectsFromDeck(deck: DeckRecipe): void {
    console.log(`[CardEffectRegistrar] デッキ「${deck.name}」の効果登録を開始します...`);

    // 登録前に既存の効果をクリア
    EffectRepository.clear();

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
        EffectRepository.register(cardId, effectFactory);
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
   * カード固有効果クラスの取得
   * 新しいカード効果を追加する際は cardEffectsRegistry.ts に追加するだけでOK
   */
  private static getEffectFactoryByClass(cardId: number, effectClass?: string): (() => Effect[]) | null {
    if (!effectClass) {
      // 効果クラスが指定されていない場合は null を返す
      return null;
    }

    const EffectClass = this.getCardEffectClass(effectClass);
    if (!EffectClass) {
      console.warn(`[CardEffectRegistrar] 未登録のカード効果クラス: ${effectClass} (カードID: ${cardId})`);
      console.info(`カード効果クラスを追加するには cardEffectsRegistry.ts に追加してください`);
      return null;
    }

    return () => [new EffectClass()];
  }

  /**
   * 実行時にカード効果クラスを一時的に登録
   * 主にテスト用途で使用（本番では cardEffectsRegistry.ts を使用）
   */
  private static runtimeEffectRegistry = new Map<string, new () => Effect>();

  static registerEffectClass(className: string, effectClass: new () => Effect): void {
    this.runtimeEffectRegistry.set(className, effectClass);
    console.log(`[CardEffectRegistrar] 実行時カード効果クラス「${className}」を登録しました`);
  }

  /**
   * 実行時登録とレジストリ登録の両方をチェック
   * カード固有効果クラスのみを対象とする
   */
  private static getCardEffectClass(effectClassName: string): (new () => Effect) | null {
    // まず実行時登録をチェック（テスト用途）
    if (this.runtimeEffectRegistry.has(effectClassName)) {
      return this.runtimeEffectRegistry.get(effectClassName)!;
    }

    // 次にカード効果レジストリの登録をチェック
    if (isRegisteredCardEffect(effectClassName)) {
      return CARD_EFFECTS[effectClassName];
    }

    return null;
  }

  /**
   * 特定のカードIDのカード固有効果登録状況を確認
   */
  static checkRegistration(cardId: number): {
    isRegistered: boolean;
    effectCount: number;
    effectNames: string[];
  } {
    const effects = EffectRepository.getEffects(cardId);
    return {
      isRegistered: EffectRepository.hasEffects(cardId),
      effectCount: effects.length,
      effectNames: effects.map((effect) => effect.name),
    };
  }

  /**
   * 登録済みカード固有効果の一覧を取得（デバッグ用）
   */
  static getRegistrationSummary(): {
    totalCards: number;
    registeredCards: {
      cardId: number;
      effectNames: string[];
    }[];
  } {
    const stats = EffectRepository.getStats();
    const registeredCards = stats.cardIds.map((cardId) => ({
      cardId,
      effectNames: EffectRepository.getEffects(cardId).map((effect) => effect.name),
    }));

    return {
      totalCards: stats.totalRegistered,
      registeredCards,
    };
  }
}
