import { error } from "@sveltejs/kit";
import type {
  RecipeCardEntry,
  LoadedCardEntry,
  DeckData,
  DeckStats,
  MainDeckData,
  ExtraDeckData,
} from "$lib/types/deck";
import { convertYGOProDeckCardToCardData, type YGOProDeckCard } from "$lib/types/ygoprodeck";
import { getCardsByIds } from "$lib/api/ygoprodeck";
import { sampleDeckRecipes } from "$lib/data/sampleDeckRecipes";

// デッキエントリーからカードタイプ別に分類したMainDeckDataを作成する内部関数
function buildMainDeckData(ygoCardMap: Map<number, YGOProDeckCard>, entries: RecipeCardEntry[]): MainDeckData {
  const monsters: LoadedCardEntry[] = [];
  const spells: LoadedCardEntry[] = [];
  const traps: LoadedCardEntry[] = [];

  for (const entry of entries) {
    const ygoCard = ygoCardMap.get(entry.id);
    if (ygoCard) {
      const cardData = convertYGOProDeckCardToCardData(ygoCard);
      const loadedEntry: LoadedCardEntry = {
        cardData: cardData,
        quantity: entry.quantity,
      };

      // カードタイプ別に分類
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
function buildExtraDeckData(ygoCardMap: Map<number, YGOProDeckCard>, entries: RecipeCardEntry[]): ExtraDeckData {
  const fusion: LoadedCardEntry[] = [];
  const synchro: LoadedCardEntry[] = [];
  const xyz: LoadedCardEntry[] = [];

  for (const entry of entries) {
    const ygoCard = ygoCardMap.get(entry.id);
    if (ygoCard) {
      const cardData = convertYGOProDeckCardToCardData(ygoCard);
      const loadedEntry: LoadedCardEntry = {
        cardData: cardData,
        quantity: entry.quantity,
      };

      // frameTypeでエクストラデッキモンスターを分類
      const frameType = ygoCard.frameType?.toLowerCase() || "";
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
  // 各カードタイプの枚数を直接計算（フィルタリング不要）
  const monsterCount = mainDeck.monsters.reduce((sum, entry) => sum + entry.quantity, 0);
  const spellCount = mainDeck.spells.reduce((sum, entry) => sum + entry.quantity, 0);
  const trapCount = mainDeck.traps.reduce((sum, entry) => sum + entry.quantity, 0);

  const extraCount =
    extraDeck.fusion.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.synchro.reduce((sum, entry) => sum + entry.quantity, 0) +
    extraDeck.xyz.reduce((sum, entry) => sum + entry.quantity, 0);

  const totalCards = monsterCount + spellCount + trapCount + extraCount;

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
 * RecipeCardEntry のバリデーション（T032）
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
        `RecipeCardEntry must have a valid positive integer ID (YGOPRODeck API compatible).`
    );
  }

  if (typeof entry.quantity !== "number" || !Number.isInteger(entry.quantity) || entry.quantity <= 0) {
    throw new Error(
      `Invalid quantity: ${entry.quantity} for card ID ${entry.id}. ` + `Quantity must be a positive integer.`
    );
  }
}

/**
 * デッキレシピからデッキデータを生成する
 */
export async function loadDeckData(deckId: string, fetch: typeof window.fetch): Promise<DeckData> {
  const recipe = sampleDeckRecipes[deckId];
  if (!recipe) {
    throw error(404, "デッキが見つかりません");
  }

  // メインデッキとエクストラデッキの全カード ID を取得
  const allCardEntries = [...recipe.mainDeck, ...recipe.extraDeck];

  // RecipeCardEntry のバリデーション（T032）
  for (const entry of allCardEntries) {
    validateRecipeCardEntry(entry);
  }

  const uniqueCardIds = Array.from(new Set(allCardEntries.map((entry) => entry.id)));

  // API でカード情報を取得
  let ygoCards: YGOProDeckCard[];
  try {
    ygoCards = await getCardsByIds(fetch, uniqueCardIds);
  } catch (err) {
    console.error("カード情報のAPI取得に失敗しました:", err);
    throw error(500, "カード情報の取得に失敗しました");
  }

  // カード情報をマップに変換
  const ygoCardMap = new Map(ygoCards.map((card) => [card.id, card]));

  // メインデッキをカードタイプ別に分類
  const mainDeckData = buildMainDeckData(ygoCardMap, recipe.mainDeck);

  // エクストラデッキをモンスタータイプ別に分類
  const extraDeckData = buildExtraDeckData(ygoCardMap, recipe.extraDeck);

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
