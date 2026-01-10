import type {
  RecipeCardEntry,
  LoadedCardEntry,
  DeckData,
  DeckStats,
  MainDeckData,
  ExtraDeckData,
} from "$lib/application/types/deck";
import type { CardDisplayData } from "$lib/application/types/card";
import { getCardRepository } from "$lib/infrastructure/adapters/YGOProDeckCardRepository";
import { sampleDeckRecipes } from "$lib/application/data/sampleDeckRecipes";

// デッキエントリーからカードタイプ別に分類したMainDeckDataを作成する内部関数
function buildMainDeckData(cardDataMap: Map<number, CardDisplayData>, entries: RecipeCardEntry[]): MainDeckData {
  const monsters: LoadedCardEntry[] = [];
  const spells: LoadedCardEntry[] = [];
  const traps: LoadedCardEntry[] = [];

  // 各エントリーをカードデータと紐付けて分類
  for (const entry of entries) {
    const cardData = cardDataMap.get(entry.id);
    if (cardData) {
      const loadedEntry: LoadedCardEntry = {
        cardData: cardData,
        quantity: entry.quantity,
      };

      // カードタイプ（monster/spell/trap）に応じて配列に振り分け
      switch (cardData.type) {
        case "monster":
          monsters.push(loadedEntry);
          break;
        case "spell":
          spells.push(loadedEntry);
          break;
        case "trap":
          traps.push(loadedEntry);
          break;
      }
    }
  }

  return { monsters, spells, traps };
}

// エクストラデッキをモンスタータイプ別に分類したExtraDeckDataを作成する内部関数
function buildExtraDeckData(cardDataMap: Map<number, CardDisplayData>, entries: RecipeCardEntry[]): ExtraDeckData {
  const fusion: LoadedCardEntry[] = [];
  const synchro: LoadedCardEntry[] = [];
  const xyz: LoadedCardEntry[] = [];

  // 各エントリーをカードデータと紐付けて分類
  for (const entry of entries) {
    const cardData = cardDataMap.get(entry.id);
    if (cardData) {
      const loadedEntry: LoadedCardEntry = {
        cardData: cardData,
        quantity: entry.quantity,
      };

      // frameTypeの文字列を小文字化して部分一致判定（例: "fusion" → 融合モンスター）
      const frameType = cardData.frameType?.toLowerCase() || "";
      if (frameType.includes("fusion")) {
        fusion.push(loadedEntry);
      } else if (frameType.includes("synchro")) {
        synchro.push(loadedEntry);
      } else if (frameType.includes("xyz")) {
        xyz.push(loadedEntry);
      }
      // その他のエクストラデッキモンスター（リンク、ペンデュラムなど）は無視
    }
  }

  return { fusion, synchro, xyz };
}

// デッキ統計情報を計算する内部関数（新しい構造対応）
function calculateDeckStats(mainDeck: MainDeckData, extraDeck: ExtraDeckData): DeckStats {
  // メインデッキ各タイプの総枚数を算出（quantityの合計）
  const monsterCount = mainDeck.monsters.reduce((sum, entry) => sum + entry.quantity, 0);
  const spellCount = mainDeck.spells.reduce((sum, entry) => sum + entry.quantity, 0);
  const trapCount = mainDeck.traps.reduce((sum, entry) => sum + entry.quantity, 0);

  // エクストラデッキの総枚数を算出（全タイプの合計）
  const extraCount =
    extraDeck.fusion.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.synchro.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.xyz.reduce((sum, entry) => sum + entry.quantity, 0);

  // デッキ全体の総枚数
  const totalCards = monsterCount + spellCount + trapCount + extraCount;

  // ユニークカード種類数（配列の長さ = 異なるカードの種類数）
  const uniqueCards =
    mainDeck.monsters.length +
    mainDeck.spells.length +
    mainDeck.traps.length +
    extraDeck.fusion.length +
    extraDeck.synchro.length +
    extraDeck.xyz.length;

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
 * YGOPRODeck API互換性を保証する。
 *
 * @param entry - RecipeCardEntry オブジェクト
 * @throws Error カードIDが無効な場合
 */
function validateRecipeCardEntry(entry: RecipeCardEntry): void {
  if (typeof entry.id !== "number" || !Number.isInteger(entry.id) || entry.id <= 0) {
    throw new Error(
      `Invalid card ID: ${entry.id}. ` +
        `RecipeCardEntry must have a valid positive integer ID (YGOPRODeck API compatible).`,
    );
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
 * @param deckId - デッキID
 * @param _fetch - (未使用) SvelteKitのfetch関数（シグネチャ互換性のため保持）
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loadDeckData(deckId: string, _fetch?: typeof window.fetch): Promise<DeckData> {
  const recipe = sampleDeckRecipes[deckId];
  if (!recipe) {
    throw new Error(`Deck not found: ${deckId}`);
  }

  // メインデッキとエクストラデッキの全カードIDを取得
  const allCardEntries = [...recipe.mainDeck, ...recipe.extraDeck];

  // RecipeCardEntryのバリデーション（IDと枚数の妥当性チェック）
  for (const entry of allCardEntries) {
    validateRecipeCardEntry(entry);
  }

  // 重複を除いたユニークなカードIDリストを作成
  const uniqueCardIds = Array.from(new Set(allCardEntries.map((entry) => entry.id)));

  // Singleton Repository経由でカード情報を取得（変換済みのCardDisplayData）
  const repository = getCardRepository();
  let cardDataList: CardDisplayData[];
  try {
    cardDataList = await repository.getCardsByIds(uniqueCardIds);
  } catch (err) {
    console.error("カード情報のAPI取得に失敗しました:", err);
    throw new Error(`Failed to fetch card data: ${err instanceof Error ? err.message : String(err)}`);
  }

  // カード情報をID→CardDisplayDataのマップに変換（高速検索用）
  const cardDataMap = new Map(cardDataList.map((card) => [card.id, card]));

  // メインデッキをカードタイプ別に分類
  const mainDeckData = buildMainDeckData(cardDataMap, recipe.mainDeck);

  // エクストラデッキをモンスタータイプ別に分類
  const extraDeckData = buildExtraDeckData(cardDataMap, recipe.extraDeck);

  // 統計情報を計算
  const stats = calculateDeckStats(mainDeckData, extraDeckData);

  const deckData: DeckData = {
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    mainDeck: mainDeckData,
    extraDeck: extraDeckData,
    stats,
  };

  return deckData;
}
