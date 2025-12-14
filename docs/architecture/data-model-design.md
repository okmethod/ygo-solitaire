# データモデル設計ドキュメント

## 概要

YGO Solitaire アプリケーションのデータモデルは、Clean Architecture の原則に基づいた3層構造を採用しています。

- **Domain Layer**: ゲームロジックとルールを管理する最小限のカードデータ
- **Application Layer**: ビジネスロジックとデータ変換
- **Presentation Layer**: UIコンポーネントに必要な完全な表示データ

この設計により、以下を実現しています：

1. **YGOPRODeck API互換性**: 外部APIとのシームレスな統合
2. **型安全性**: TypeScriptによる厳密な型チェック
3. **レイヤー分離**: 各層の責務を明確化し、保守性を向上
4. **段階的移行**: 既存コードへの影響を最小化

---

## Domain Layer (ドメイン層)

### 目的
ゲームロジックとルールエンジンを管理する最小限のカードデータを提供します。

### 主要型定義

#### `DomainCardData`
ゲーム状態管理に必要な最小限のカード情報。

```typescript
/**
 * ドメインレイヤーのカードデータ（US1-Domain層の基盤）
 * ゲーム状態管理に必要な最小限のカード情報のみを保持
 */
export interface DomainCardData {
  readonly id: number;                // YGOPRODeck API互換のカードID
  readonly type: SimpleCardType;      // "monster" | "spell" | "trap"
  readonly frameType?: string;        // 効果判定用（例: "effect", "fusion"）
  readonly spellType?: SpellSubType;  // 魔法カード種別（"normal", "quick-play", etc.）
  readonly trapType?: TrapSubType;    // 罠カード種別（"normal", "continuous", "counter"）
}
```

**設計原則**:
- **最小限のデータ**: ゲームロジックに必要なプロパティのみ
- **数値ID**: YGOPRODeck API との互換性を確保
- **型安全性**: SimpleCardType で厳密な型チェック
- **サブタイプ拡張**: `spellType`/`trapType`で詳細なルール判定が可能（PR#50で追加）

#### `SimpleCardType`
3種類のカードタイプを厳密に定義。

```typescript
export type SimpleCardType = "monster" | "spell" | "trap";
export type SpellSubType = "normal" | "quick-play" | "continuous" | "field" | "equip" | "ritual";
export type TrapSubType = "normal" | "continuous" | "counter";
```

### ファイル構成

```
src/lib/domain/
├── models/
│   ├── Card.ts             # Domain Layer型定義と型ガード
│   └── __tests__/
│       └── Card.test.ts    # 型ガード関数のテスト (T026, T027)
└── data/
    └── exodiaPartNames.ts  # ドメインデータ（Exodia勝利判定用）
```

### 型ガード関数

```typescript
/**
 * DomainCardData 型ガード（T026）
 */
export function isDomainCardData(data: unknown): data is DomainCardData {
  if (!data || typeof data !== "object") return false;
  const card = data as Record<string, unknown>;

  return (
    typeof card.id === "number" &&
    typeof card.type === "string" &&
    ["monster", "spell", "trap"].includes(card.type) &&
    (card.frameType === undefined || typeof card.frameType === "string")
  );
}

/**
 * モンスターカード判定（T027）
 */
export function isDomainMonsterCard(card: DomainCardData): boolean {
  return card.type === "monster";
}
```

### テストカバレッジ

- **T026**: `isDomainCardData()` の検証（15テストケース）
- **T027**: カードタイプ判定関数の検証（9テストケース）

---

## Presentation Layer (プレゼンテーション層)

### 目的
UIコンポーネントに必要な完全なカード表示データを提供します。

### 主要型定義

#### `CardDisplayData`
UI表示に必要な全情報を含むカードデータ。

```typescript
/**
 * UI表示用カードデータ（T037）
 * Presentation Layerで使用する完全なカード情報
 */
export interface CardDisplayData {
  id: number;
  name: string;
  type: CardType;           // "monster" | "spell" | "trap"
  description: string;
  frameType?: string;
  archetype?: string;
  monsterAttributes?: MonsterAttributes;
  images?: CardImages;
}
```

#### `CardImages`
カード画像URL情報（T038）。

```typescript
export interface CardImages {
  image: string;            // 通常サイズ画像URL
  imageSmall: string;       // 小サイズ画像URL
  imageCropped: string;     // クロップ画像URL
}
```

#### `MonsterAttributes`
モンスターカード固有の属性情報（T039）。

```typescript
export interface MonsterAttributes {
  attack: number;
  defense: number;
  level: number;
  attribute: string;        // 例: "DARK", "LIGHT"
  race: string;             // 例: "Spellcaster", "Dragon"
}
```

### ファイル構成

```
src/lib/presentation/types/
├── card.ts                 # UI表示用型（Application Layerから再エクスポート）
├── deck.ts                 # デッキ関連型（Application Layerから再エクスポート）
├── effect.ts               # UI効果表示用型
└── phase.ts                # フェーズUI表示用型
```

---

## Application Layer (アプリケーション層)

### 目的
YGOPRODeck APIからのデータ取得と、Domain/Presentation Layer間の変換を担当します。

### データ変換フロー

```
YGOPRODeck API Response
        ▼
  YGOProDeckCard (API型)
        ▼
convertToCardDisplayData()  ← 新規実装 (T041)
        ▼
  CardDisplayData (Presentation Layer)
```

### 主要関数

#### `convertToCardDisplayData()`
YGOPRODeck API レスポンスを Presentation Layer 型に変換（T041）。

```typescript
/**
 * YGOPRODeck API カードデータをCardDisplayDataに変換（T041）
 */
export function convertToCardDisplayData(apiCard: YGOProDeckCard): CardDisplayData {
  const cardType = normalizeType(apiCard.type);
  const cardImage = apiCard.card_images[0];

  // 画像データの変換
  const images: CardImages | undefined = cardImage
    ? {
        image: cardImage.image_url,
        imageSmall: cardImage.image_url_small,
        imageCropped: cardImage.image_url_cropped,
      }
    : undefined;

  // モンスター属性の変換
  const monsterAttributes: MonsterAttributes | undefined =
    cardType === "monster" &&
    apiCard.atk !== undefined &&
    apiCard.def !== undefined &&
    apiCard.level !== undefined
      ? {
          attack: apiCard.atk,
          defense: apiCard.def,
          level: apiCard.level,
          attribute: apiCard.attribute ?? "",
          race: apiCard.race ?? "",
        }
      : undefined;

  return {
    id: apiCard.id,
    name: apiCard.name,
    type: cardType,
    description: apiCard.desc,
    frameType: apiCard.frameType,
    archetype: apiCard.archetype,
    monsterAttributes,
    images,
  };
}
```

#### `getCardsByIds()`
バッチリクエストとキャッシング機能を持つカードデータ取得関数（T010）。

```typescript
/**
 * カードIDのリストから複数のカードデータを取得（T010: キャッシュ対応）
 */
export async function getCardsByIds(
  fetchFunction: typeof fetch,
  ids: number[]
): Promise<YGOProDeckCard[]> {
  if (ids.length === 0) return [];

  // キャッシュヒット/ミスを分離
  const cachedCards: YGOProDeckCard[] = [];
  const uncachedIds: number[] = [];

  for (const id of ids) {
    const cached = cardCache.get(id);
    if (cached) {
      cachedCards.push(cached);
    } else {
      uncachedIds.push(id);
    }
  }

  // 未キャッシュのカードのみAPIリクエスト
  let fetchedCards: YGOProDeckCard[] = [];
  if (uncachedIds.length > 0) {
    const idsString = uncachedIds.join(",");
    const path = `cardinfo.php?id=${idsString}`;
    const data = await fetchYGOProDeckAPI(fetchFunction, path);

    if (data?.data) {
      fetchedCards = data.data;
      // 取得したカードをキャッシュに保存
      for (const card of fetchedCards) {
        cardCache.set(card.id, card);
      }
    }
  }

  return [...cachedCards, ...fetchedCards];
}
```

### キャッシング戦略

```typescript
/**
 * YGOPRODeck APIレスポンスのメモリキャッシュ（T008）
 * セッション単位でカードデータをキャッシュし、重複リクエストを防ぐ
 */
const cardCache = new Map<number, YGOProDeckCard>();
```

**特徴**:
- **ライフサイクル**: ページリロードまで（メモリ上のみ）
- **自動クリーン**: 15分のTTL（自己クリーニング機能）
- **テスタビリティ**: `clearCache()` 関数でテスト用にクリア可能

---

## YGOPRODeck API 統合

### API仕様

- **ベースURL**: `https://db.ygoprodeck.com/api/v7`
- **エンドポイント**: `cardinfo.php?id={card_ids}`
- **レスポンス形式**: JSON

### API型定義

```typescript
export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;              // "Effect Monster", "Spell Card", etc.
  frameType?: string;        // "effect", "fusion", "normal", etc.
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  archetype?: string;
  ygoprodeck_url: string;
  card_images: YGOProDeckCardImage[];
  card_prices?: YGOProDeckCardPrice[];
}
```

### エラーハンドリング

```typescript
/**
 * YGOPRODeck APIへのリクエストを実行（T006改善）
 * @throws {Error} Rate limit exceeded (429)
 */
async function fetchYGOProDeckAPI(
  fetchFunction: typeof fetch,
  path: string
): Promise<YGOProDeckResponseJson | null> {
  try {
    const response = await fetchApi(fetchFunction, url, requestConfig);

    if (!response.ok) {
      console.error(`YGOPRODeck API Error: ${response.status} ${response.statusText}`);

      // Rate limit検出（429 Too Many Requests）
      if (response.status === 429) {
        throw new Error("YGOPRODeck API rate limit exceeded.");
      }

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("YGOPRODeck API fetch failed:", error);
    throw error;
  }
}
```

---

## デッキローダー実装

### `loadDeckData()` 関数

デッキレシピからカードデータを読み込み、Presentation Layer 型に変換します（T042）。

```typescript
/**
 * デッキレシピからデッキデータを生成する
 */
export async function loadDeckData(
  deckId: string,
  fetch: typeof window.fetch
): Promise<DeckData> {
  const recipe = sampleDeckRecipes[deckId];
  if (!recipe) {
    throw error(404, "デッキが見つかりません");
  }

  // 全カードIDを取得
  const allCardEntries = [...recipe.mainDeck, ...recipe.extraDeck];

  // RecipeCardEntry のバリデーション（T032）
  for (const entry of allCardEntries) {
    validateRecipeCardEntry(entry);
  }

  const uniqueCardIds = Array.from(new Set(allCardEntries.map(e => e.id)));

  // API でカード情報を取得（バッチリクエスト）
  const ygoCards = await getCardsByIds(fetch, uniqueCardIds);

  // カード情報をマップに変換
  const ygoCardMap = new Map(ygoCards.map(card => [card.id, card]));

  // メインデッキ・エクストラデッキを構築
  const mainDeckData = buildMainDeckData(ygoCardMap, recipe.mainDeck);
  const extraDeckData = buildExtraDeckData(ygoCardMap, recipe.extraDeck);

  // 統計情報を計算
  const stats = calculateDeckStats(mainDeckData, extraDeckData);

  return {
    name: recipe.name,
    description: recipe.description,
    category: recipe.category,
    mainDeck: mainDeckData,
    extraDeck: extraDeckData,
    stats,
  };
}
```

### デッキ構築フロー

```typescript
function buildMainDeckData(
  ygoCardMap: Map<number, YGOProDeckCard>,
  entries: RecipeCardEntry[]
): MainDeckData {
  const monsters: LoadedCardEntry[] = [];
  const spells: LoadedCardEntry[] = [];
  const traps: LoadedCardEntry[] = [];

  for (const entry of entries) {
    const ygoCard = ygoCardMap.get(entry.id);
    if (ygoCard) {
      const cardData = convertToCardDisplayData(ygoCard); // Presentation Layer変換
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
```

---

## 型の互換性と移行戦略

### 非推奨型のマーキング

既存の `Card` 型には `@deprecated` タグを付与し、段階的な移行を促進（T040）。

```typescript
/**
 * @deprecated Use CardDisplayData for new code (T040)
 *
 * この型は後方互換性のために残されています。
 * 新しいコードでは CardDisplayData を使用してください。
 */
export interface Card extends CardData {
  instanceId?: string;
  isSelected?: boolean;
  position?: "attack" | "defense" | "facedown";
}
```

### 移行パス

```
旧型 (Card, CardData)
        ▼
  @deprecated マーカー追加
        ▼
新型 (CardDisplayData) への移行
        ▼
  旧型の削除（全移行完了後）
```

### DEFERRED タスク

以下のタスクは段階的移行として延期されています：

- **T023-T025**: GameState/Rules の DomainCardData 移行（文字列ID → 数値ID）
- **T043-T046**: UI/Application Layer の CardDisplayData 移行
- **T059-T060**: 旧型の削除（移行完了後）

**延期理由**:
- **破壊的変更**: 204以上のテストファイルに影響
- **段階的移行**: 既存機能への影響を最小化
- **テスト安定性**: 全移行完了後に旧型を削除

---

## テスト戦略

### 単体テスト

#### Domain Layer (T026, T027)
```typescript
describe("isDomainCardData (T026)", () => {
  it("should return true for valid DomainCardData - monster", () => {
    const validData: DomainCardData = {
      id: 33396948,
      type: "monster",
    };
    expect(isDomainCardData(validData)).toBe(true);
  });

  it("should return false for invalid type value", () => {
    const invalidData = {
      id: 33396948,
      type: "invalid-type",
    };
    expect(isDomainCardData(invalidData)).toBe(false);
  });
});
```

#### Presentation Layer (T033)
```typescript
describe("loadDeckData - Deck Recipe Loading Integration Test (T033)", () => {
  it("should load deck recipe with YGOPRODeck API compatible card IDs", async () => {
    vi.mocked(ygoprodeckApi.getCardsByIds).mockResolvedValue([
      exodiaFixture,
      potOfGreedFixture,
      gracefulCharityFixture,
    ]);

    const deckData = await loadDeckData("greedy-exodia-deck", mockFetch);

    expect(deckData).toBeDefined();
    expect(deckData.name).toBeDefined();
    expect(deckData.mainDeck).toBeDefined();
    expect(deckData.stats).toBeDefined();

    // YGOPRODeck API互換のカードIDが正しく解決されたことを確認
    expect(ygoprodeckApi.getCardsByIds).toHaveBeenCalledOnce();
    expect(ygoprodeckApi.getCardsByIds).toHaveBeenCalledWith(
      mockFetch,
      expect.arrayContaining([expect.any(Number)]),
    );
  });
});
```

### E2Eテスト (T013)

```typescript
test("should load greedy exodia deck and display cards correctly", async ({ page }) => {
  // YGOPRODeck APIのモック
  await page.route("**/db.ygoprodeck.com/api/v7/**", async (route) => {
    await route.fulfill({ json: mockApiResponse });
  });

  await page.goto("/decks/greedy-exodia-deck");

  // デッキ名の確認
  await expect(page.getByText("Greedy Exodia Deck")).toBeVisible();

  // カードが表示されていることを確認
  const monsterSection = page.locator('[data-testid="monster-cards"]');
  await expect(monsterSection).toBeVisible();
});
```

### テストカバレッジ

- **単体テスト**: 239テスト（全パス）
- **E2Eテスト**: デッキローディング、カード表示、API統合
- **型チェック**: TypeScript strict mode
- **リンター**: ESLint + Prettier

---

## 参考資料

### 関連仕様書

- **Feature Spec**: `specs/002-data-model-refactoring/spec.md`
- **Implementation Plan**: `specs/002-data-model-refactoring/plan.md`
- **Task List**: `specs/002-data-model-refactoring/tasks.md`

### 外部API

- **YGOPRODeck API**: https://db.ygoprodeck.com/api-guide/
- **API Rate Limits**: 20 requests/second

### コードベース

- **Domain Layer**: `src/lib/domain/models/Card.ts`, `src/lib/domain/effects/`
- **Application Layer**: `src/lib/application/types/`, `src/lib/application/utils/deckLoader.ts`, `src/lib/application/effects/`
- **Infrastructure Layer**: `src/lib/infrastructure/types/ygoprodeck.ts`, `src/lib/infrastructure/api/ygoprodeck.ts`
- **Presentation Layer**: `src/lib/presentation/types/` (再エクスポート)

---

## 変更履歴

| バージョン | 日付 | 著者 | 変更内容 |
|----------|------|------|---------|
| 1.1.0 | 2025-12-07 | Claude Code | Card Effect Architectureセクション追加（T008） |
| 1.0.0 | 2025-11-29 | Claude Code | 初版作成（T065） |

---

## まとめ

YGO Solitaire のデータモデルは、Clean Architecture の原則に基づいた3層構造により、以下を実現しています：

1. **明確な責務分離**: Domain/Application/Presentation の各層が独立
2. **型安全性**: TypeScript による厳密な型チェック
3. **API互換性**: YGOPRODeck API とのシームレスな統合
4. **段階的移行**: 既存コードへの影響を最小化
5. **パフォーマンス**: バッチリクエストとキャッシング戦略

この設計により、保守性・拡張性・テスタビリティの高いコードベースを実現しています。
