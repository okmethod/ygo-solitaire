/**
 * cardPredicates.ts - カードフィルタリングのプリミティブ関数
 *
 * 条件チェッカーで共通して使われるカードフィルタリングパターンを提供する。
 *
 * @module domain/dsl/conditions/primitives/cardPredicates
 */

import type { CardInstance, CardType, SpellSubType, FrameSubType } from "$lib/domain/models/Card";

// ===========================
// 型定義
// ===========================

/** カードの述語関数 */
export type CardPredicate = (card: CardInstance) => boolean;

// ===========================
// 基本フィルター
// ===========================

/** カードタイプでフィルター */
export const byType =
  (type: CardType): CardPredicate =>
  (card) =>
    card.type === type;

/** 魔法カードサブタイプでフィルター */
export const bySpellType =
  (spellType: SpellSubType): CardPredicate =>
  (card) =>
    card.spellType === spellType;

/** フレームタイプでフィルター */
export const byFrameType =
  (frameType: FrameSubType): CardPredicate =>
  (card) =>
    card.frameType === frameType;

/** カード名に指定文字列を含むかでフィルター */
export const byNameIncludes =
  (pattern: string): CardPredicate =>
  (card) =>
    card.jaName.includes(pattern);

/** 指定インスタンスIDを除外 */
export const excludingInstance =
  (instanceId: string): CardPredicate =>
  (card) =>
    card.instanceId !== instanceId;

// ===========================
// 組み合わせユーティリティ
// ===========================

/** 複数の述語をANDで結合 */
export const and =
  (...predicates: CardPredicate[]): CardPredicate =>
  (card) =>
    predicates.every((p) => p(card));

/** 複数の述語をORで結合 */
export const or =
  (...predicates: CardPredicate[]): CardPredicate =>
  (card) =>
    predicates.some((p) => p(card));

// ===========================
// カウントユーティリティ
// ===========================

/** ゾーン内のカードをフィルタしてカウント */
export const countMatching = (cards: readonly CardInstance[], predicate: CardPredicate): number =>
  cards.filter(predicate).length;

/** ゾーン内に条件を満たすカードが指定枚数以上あるか */
export const hasAtLeast = (cards: readonly CardInstance[], predicate: CardPredicate, minCount: number): boolean =>
  countMatching(cards, predicate) >= minCount;

// ===========================
// よく使う組み合わせ（プリセット）
// ===========================

/** 魔法カード */
export const isSpell = byType("spell");

/** モンスターカード */
export const isMonster = byType("monster");

/** 罠カード */
export const isTrap = byType("trap");

/** 魔法または罠カード */
export const isSpellOrTrap = or(isSpell, isTrap);
