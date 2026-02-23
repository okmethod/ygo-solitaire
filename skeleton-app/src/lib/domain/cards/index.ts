/**
 * Card Data Library - カードデータライブラリ
 *
 * @module domain/cards
 */

import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry";
export { CardDataRegistry };

// ===========================
// マップエントリ生成ヘルパー
// ===========================

import type { FrameSubType, SpellSubType, TrapSubType } from "$lib/domain/models/Card";

type RegistrationEntry = [number, () => void];

/** モンスターカードのエントリを生成 */
const monster = (frameType: FrameSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "monster", frameType }),
];

/** 魔法カードのエントリを生成 */
const spell = (spellType: SpellSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "spell", frameType: "spell", spellType }),
];

/** 罠カードのエントリを生成 */
const trap = (trapType: TrapSubType, id: number, jaName: string): RegistrationEntry => [
  id,
  () => CardDataRegistry.register(id, { jaName, type: "trap", frameType: "trap", trapType }),
];

// ===========================
// 定義マップ
// ===========================

/** カードID → 登録関数のマッピング */
const cardDataRegistrations = new Map<number, () => void>([
  // モンスターカード
  monster("effect", 33396948, "封印されしエクゾディア"),
  monster("normal", 7902349, "封印されし者の右腕"),
  monster("normal", 70903634, "封印されし者の左腕"),
  monster("normal", 44519536, "封印されし者の左足"),
  monster("normal", 8124921, "封印されし者の右足"),
  monster("effect", 70791313, "王立魔法図書館"),

  // 魔法カード
  spell("normal", 55144522, "強欲な壺"),
  spell("normal", 79571449, "天使の施し"),
  spell("normal", 70368879, "成金ゴブリン"),
  spell("normal", 33782437, "一時休戦"),
  spell("normal", 85852291, "打ち出の小槌"),
  spell("normal", 90928333, "闇の量産工場"),
  spell("normal", 73628505, "テラ・フォーミング"),
  spell("normal", 98494543, "魔法石の採掘"),
  spell("normal", 93946239, "無の煉獄"),
  spell("normal", 98645731, "強欲で謙虚な壺"),
  spell("normal", 59750328, "命削りの宝札"),
  spell("normal", 89997728, "トゥーンのもくじ"),
  spell("quick-play", 74519184, "手札断殺"),
  spell("continuous", 15259703, "トゥーン・ワールド"),
  spell("field", 67616300, "チキンレース"),

  // 罠カード
  trap("normal", 83968380, "強欲な瓶"),
]);

// ===========================
// 登録関数
// ===========================

/** レジストリをクリアし、指定されたカードIDの CardData を登録する */
export function registerCardDataByIds(cardIds: number[]): void {
  CardDataRegistry.clear();

  for (const cardId of cardIds) {
    const register = cardDataRegistrations.get(cardId);
    if (register) {
      register();
    }
  }
}
