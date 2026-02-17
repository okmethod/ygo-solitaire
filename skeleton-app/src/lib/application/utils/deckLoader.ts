/**
 * deckLoader - 指定したデッキIDから、デッキレシピとデッキデータを読み込むユーティリティ
 *
 * DeckRecipe をベースに、CardDataRegistry から CardData を取得し、デッキデータを構築する。
 * 表示用データ（CardDisplayData）への変換は Presentation Layer で行う。
 *
 * @architecture レイヤー間依存ルール - Application Layer (Store)
 * - ROLE: ゲーム進行制御、Presentation Layer へのデータ提供
 * - ALLOWED: Domain Layer への依存
 * - FORBIDDEN: Infrastructure Layer への依存、Presentation Layer への依存
 *
 * @module application/utils/deckLoader
 */

import type {
  DeckRecipe,
  RecipeCardEntry,
  LoadedCardEntry,
  DeckData,
  DeckStats,
  MainDeckData,
  ExtraDeckData,
} from "$lib/application/types/deck";
import type { CardData, ExtraMonsterSubType } from "$lib/application/types/card";
import { presetDeckRecipes } from "$lib/application/data/presetDeckRecipes";
import { CardDataRegistry } from "$lib/domain/registries/CardDataRegistry";

/**
 * カードエントリーを指定したキーで分類する汎用ヘルパー
 *
 * @param cardDataMap - カードID → CardData のマップ
 * @param entries - レシピのカードエントリー
 * @param getKey - CardData から分類キーを取得する関数（null を返すと無視）
 * @returns キー → LoadedCardEntry[] のマップ
 */
function classifyEntries<K extends string>(
  cardDataMap: Map<number, CardData>,
  entries: RecipeCardEntry[],
  getKey: (cardData: CardData) => K | null,
): Map<K, LoadedCardEntry[]> {
  const result = new Map<K, LoadedCardEntry[]>();

  for (const entry of entries) {
    const cardData = cardDataMap.get(entry.id);
    if (!cardData) continue;

    const key = getKey(cardData);
    if (!key) continue;

    const list = result.get(key) ?? [];
    list.push({ cardData, quantity: entry.quantity });
    result.set(key, list);
  }

  return result;
}

// デッキをカードタイプ別に分類した MainDeckData を作成する
function buildMainDeckData(cardDataMap: Map<number, CardData>, entries: RecipeCardEntry[]): MainDeckData {
  const classified = classifyEntries(cardDataMap, entries, (card) => card.type);
  return {
    monsters: classified.get("monster") ?? [],
    spells: classified.get("spell") ?? [],
    traps: classified.get("trap") ?? [],
  };
}

// エクストラデッキをモンスタータイプ別に分類した ExtraDeckData を作成する
function buildExtraDeckData(cardDataMap: Map<number, CardData>, entries: RecipeCardEntry[]): ExtraDeckData {
  const extraFrameTypes: ExtraMonsterSubType[] = ["fusion", "synchro", "xyz", "link"];
  const classified = classifyEntries(cardDataMap, entries, (card) =>
    extraFrameTypes.includes(card.frameType as ExtraMonsterSubType) ? (card.frameType as ExtraMonsterSubType) : null,
  );

  return {
    fusion: classified.get("fusion") ?? [],
    synchro: classified.get("synchro") ?? [],
    xyz: classified.get("xyz") ?? [],
    link: classified.get("link") ?? [],
  };
}

// デッキ統計情報を計算する
function calculateDeckStats(mainDeck: MainDeckData, extraDeck: ExtraDeckData): DeckStats {
  // メインデッキ各タイプの総枚数を算出（quantityの合計）
  const monsterCount = mainDeck.monsters.reduce((sum, entry) => sum + entry.quantity, 0);
  const spellCount = mainDeck.spells.reduce((sum, entry) => sum + entry.quantity, 0);
  const trapCount = mainDeck.traps.reduce((sum, entry) => sum + entry.quantity, 0);

  // エクストラデッキの総枚数を算出（全タイプの合計）
  const extraCount =
    extraDeck.fusion.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.synchro.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.xyz.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.link.reduce((sum, entry) => sum + entry.quantity, 0);

  // デッキ全体の総枚数
  const totalCards = monsterCount + spellCount + trapCount + extraCount;

  // ユニークカード種類数（配列の長さ = 異なるカードの種類数）
  const uniqueCards =
    mainDeck.monsters.length +
    mainDeck.spells.length +
    mainDeck.traps.length +
    extraDeck.fusion.length +
    extraDeck.synchro.length +
    extraDeck.xyz.length +
    extraDeck.link.length;

  return {
    totalCards,
    uniqueCards,
    monsterCount,
    spellCount,
    trapCount,
  };
}

/**
 * RecipeCardEntry のバリデーション
 *
 * カードIDが有効な数値であることを確認。
 *
 * @throws Error カードIDが無効な場合
 */
function validateRecipeCardEntry(entry: RecipeCardEntry): void {
  if (typeof entry.id !== "number" || !Number.isInteger(entry.id) || entry.id <= 0) {
    throw new Error(`Invalid card ID: ${entry.id}. ` + `RecipeCardEntry must have a valid positive integer ID.`);
  }

  if (typeof entry.quantity !== "number" || !Number.isInteger(entry.quantity) || entry.quantity <= 0) {
    throw new Error(
      `Invalid quantity: ${entry.quantity} for card ID ${entry.id}. ` + `Quantity must be a positive integer.`,
    );
  }
}

/**
 * デッキレシピからデッキデータを生成する
 *
 * CardDataRegistry から CardData を取得し、カードタイプ別に分類する。
 *
 * @param deckId - プリセットデッキのID
 * @returns デッキレシピ、デッキデータ、ユニークカードIDリスト
 * @throws Error デッキが見つからない場合、またはカードがレジストリにない場合
 */
export function loadDeck(deckId: string): {
  deckRecipe: DeckRecipe;
  deckData: DeckData;
  uniqueCardIds: number[];
} {
  const deckRecipe = presetDeckRecipes[deckId];
  if (!deckRecipe) {
    throw new Error(`Deck not found: ${deckId}`);
  }

  // メインデッキとエクストラデッキの全カードIDを取得
  const allCardEntries = [...deckRecipe.mainDeck, ...deckRecipe.extraDeck];

  // RecipeCardEntryのバリデーション（IDと枚数の妥当性チェック）
  for (const entry of allCardEntries) {
    validateRecipeCardEntry(entry);
  }

  // 重複を除いたユニークなカードIDリストを作成
  const uniqueCardIds = Array.from(new Set(allCardEntries.map((entry) => entry.id)));

  // CardDataRegistry から CardData を取得
  const cardDataList: CardData[] = uniqueCardIds.map((id) => CardDataRegistry.get(id));

  // カード情報をID→CardDataのマップに変換（高速検索用）
  const cardDataMap = new Map(cardDataList.map((card) => [card.id, card]));

  // メインデッキをカードタイプ別に分類
  const mainDeckData = buildMainDeckData(cardDataMap, deckRecipe.mainDeck);

  // エクストラデッキをモンスタータイプ別に分類
  const extraDeckData = buildExtraDeckData(cardDataMap, deckRecipe.extraDeck);

  // 統計情報を計算
  const stats = calculateDeckStats(mainDeckData, extraDeckData);

  const deckData: DeckData = {
    name: deckRecipe.name,
    description: deckRecipe.description,
    category: deckRecipe.category,
    mainDeck: mainDeckData,
    extraDeck: extraDeckData,
    stats,
  };

  return { deckRecipe, deckData, uniqueCardIds };
}
