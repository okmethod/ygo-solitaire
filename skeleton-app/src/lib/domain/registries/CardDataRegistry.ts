/**
 * CardDataRegistry - カードデータレジストリ
 *
 * ゲームロジック向けにカードデータを提供する。
 *
 * Registry Pattern
 * - カードデータの一元管理
 * - Map による O(1) 高速ルックアップ
 * - ドメイン層をインフラ層（YGOPRODeck API）から分離
 *
 * @module domain/registries/CardDataRegistry
 */

import type { CardData } from "$lib/domain/models/Card";

/**
 * カードデータレジストリ（辞書）
 *
 * カードIDとドメインカードデータをマッピングする。
 * ゲームで使用されるカードプールのみを含む。
 */
const CARD_DATA_REGISTRY: Record<number, CardData> = {
  // モンスター
  33396948: { id: 33396948, jaName: "封印されしエクゾディア", type: "monster", frameType: "effect" },
  7902349: { id: 7902349, jaName: "封印されし者の右腕", type: "monster", frameType: "normal" },
  70903634: { id: 70903634, jaName: "封印されし者の左腕", type: "monster", frameType: "normal" },
  44519536: { id: 44519536, jaName: "封印されし者の左足", type: "monster", frameType: "normal" },
  8124921: { id: 8124921, jaName: "封印されし者の右足", type: "monster", frameType: "normal" },
  70791313: { id: 70791313, jaName: "王立魔法図書館", type: "monster", frameType: "effect" },

  // 通常魔法
  55144522: { id: 55144522, jaName: "強欲な壺", type: "spell", frameType: "spell", spellType: "normal" },
  79571449: { id: 79571449, jaName: "天使の施し", type: "spell", frameType: "spell", spellType: "normal" },
  70368879: { id: 70368879, jaName: "成金ゴブリン", type: "spell", frameType: "spell", spellType: "normal" },
  33782437: { id: 33782437, jaName: "一時休戦", type: "spell", frameType: "spell", spellType: "normal" },
  85852291: { id: 85852291, jaName: "打ち出の小槌", type: "spell", frameType: "spell", spellType: "normal" },
  90928333: { id: 90928333, jaName: "闇の量産工場", type: "spell", frameType: "spell", spellType: "normal" },
  73628505: { id: 73628505, jaName: "テラ・フォーミング", type: "spell", frameType: "spell", spellType: "normal" },
  98494543: { id: 98494543, jaName: "魔法石の採掘", type: "spell", frameType: "spell", spellType: "normal" },
  93946239: { id: 93946239, jaName: "無の煉獄", type: "spell", frameType: "spell", spellType: "normal" },
  98645731: { id: 98645731, jaName: "強欲で謙虚な壺", type: "spell", frameType: "spell", spellType: "normal" },
  59750328: { id: 59750328, jaName: "命削りの宝札", type: "spell", frameType: "spell", spellType: "normal" },
  89997728: { id: 89997728, jaName: "トゥーンのもくじ", type: "spell", frameType: "spell", spellType: "normal" },

  // 速攻魔法
  74519184: { id: 74519184, jaName: "手札断札", type: "spell", frameType: "spell", spellType: "quick-play" },

  // 永続魔法
  15259703: { id: 15259703, jaName: "トゥーン・ワールド", type: "spell", frameType: "spell", spellType: "continuous" },

  // フィールド魔法
  67616300: { id: 67616300, jaName: "チキンレース", type: "spell", frameType: "spell", spellType: "field" },

  // トラップカード
  83968380: { id: 83968380, jaName: "強欲な瓶", type: "trap", frameType: "trap", trapType: "normal" },

  // テスト用
  1001: { id: 1001, jaName: "Test Spell 1", type: "spell", frameType: "spell", spellType: "normal" },
  1002: { id: 1002, jaName: "Test Spell 2", type: "spell", frameType: "spell", spellType: "normal" },
  1003: { id: 1003, jaName: "Test Spell 3", type: "spell", frameType: "spell", spellType: "normal" },
  12345678: { id: 12345678, jaName: "Test Monster A", type: "monster", frameType: "normal" },
  87654321: { id: 87654321, jaName: "Test Monster B", type: "monster", frameType: "normal" },
};

/**
 * レジストリからカードデータを取得する
 *
 * @throws Error if card not found in registry
 */
export function getCardData(cardId: number): CardData {
  const card = CARD_DATA_REGISTRY[cardId];
  if (!card) {
    throw new Error(
      `Card data not found in registry: ${cardId}. ` +
        `Please add this card to CARD_DATA_REGISTRY in CardDataRegistry.ts`,
    );
  }
  return card;
}

/**
 * 《》付きでカード名を取得する
 *
 * @example
 * getCardNameWithBrackets(55144522) // "《強欲な壺》"
 */
export function getCardNameWithBrackets(cardId: number): string {
  const card = getCardData(cardId);
  return `《${card.jaName}》`;
}
