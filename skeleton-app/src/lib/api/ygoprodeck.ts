// YGOPRODeck API のレスポンス型定義
export interface YGOProDeckCardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface YGOProDeckCardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

export interface YGOProDeckCardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  archetype?: string;
  ygoprodeck_url: string;
  card_sets?: YGOProDeckCardSet[];
  card_images: YGOProDeckCardImage[];
  card_prices?: YGOProDeckCardPrice[];
}

export interface YGOProDeckResponse {
  data: YGOProDeckCard[];
}

// YGOPRODeck API 呼び出し関数
const API_BASE_URL = "https://db.ygoprodeck.com/api/v7";

export async function getCardById(id: number): Promise<YGOProDeckCard | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cardinfo.php?id=${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: YGOProDeckResponse = await response.json();
    return data.data[0] || null;
  } catch (error) {
    console.error(`Error fetching card ${id}:`, error);
    return null;
  }
}

export async function getCardsByIds(ids: number[]): Promise<YGOProDeckCard[]> {
  if (ids.length === 0) return [];

  try {
    const idsString = ids.join(",");
    const response = await fetch(`${API_BASE_URL}/cardinfo.php?id=${idsString}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: YGOProDeckResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching cards ${ids.join(",")}:`, error);
    return [];
  }
}

export async function searchCardsByName(name: string): Promise<YGOProDeckCard[]> {
  try {
    const encodedName = encodeURIComponent(name);
    const response = await fetch(`${API_BASE_URL}/cardinfo.php?fname=${encodedName}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: YGOProDeckResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error searching cards by name "${name}":`, error);
    return [];
  }
}
