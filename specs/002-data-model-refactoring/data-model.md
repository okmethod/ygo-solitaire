# データモデル詳細設計

**Feature**: データモデルのYGOPRODeck API互換化とレイヤー分離
**Branch**: `002-data-model-refactoring`
**Status**: Phase 1 Design Document
**Prerequisites**: [research.md](./research.md) 完了済み

---

## 目次

1. [概要](#概要)
2. [Domain Layer型定義](#domain-layer型定義)
3. [Presentation Layer型定義](#presentation-layer型定義)
4. [YGOPRODeck API型定義の検証と改善](#ygoprodeck-api型定義の検証と改善)
5. [レイヤー間のデータフロー](#レイヤー間のデータフロー)
6. [型の移行戦略](#型の移行戦略)
7. [キャッシュ実装設計](#キャッシュ実装設計)
8. [テストモック戦略](#テストモック戦略)
9. [実装チェックリスト](#実装チェックリスト)

---

## 概要

この設計書は、Domain LayerとPresentation Layerのデータ責務を明確に分離し、YGOPRODeck API互換性を保証するデータモデルの詳細設計を定義します。

### 設計原則

**憲法原則の適用**:
- **IV. 関心の分離**: Domain Layer（ゲームロジック）とPresentation Layer（UI表示）の責務を明確に分離
- **VI. 理解しやすさ最優先**: 型名を明確化（`DomainCardData` vs `CardDisplayData`）
- **VIII. テスト可能性を意識する**: Domain LayerがYGOPRODeck APIに依存しない設計

### データモデル分離の根拠

**Why（目的）**:
- Domain Layerの独立性とテスタビリティを保証する
- YGOPRODeck APIとの互換性を保ち、将来的な外部ツール連携を容易にする
- 外部API変更の影響を局所化する

**What（実現方法）**:
- Domain Layer: カードID（number）とカードタイプのみを保持
- Presentation Layer: YGOPRODeck APIから表示データを動的取得

---

## Domain Layer型定義

### DomainCardData

**場所**: `skeleton-app/src/lib/domain/models/Card.ts`

**責務**: ゲームロジックに必要な最小限のカード情報を保持

```typescript
/**
 * Domain Layer用カードデータ（最小限の情報のみ）
 *
 * ゲームロジックに必要なプロパティのみを含む。
 * 表示用データ（カード名、画像、テキスト等）は含まない。
 *
 * @property {number} id - YGOPRODeck API互換のカードID（例: 33396948）
 * @property {CardType} type - カードの基本タイプ（"monster" | "spell" | "trap"）
 * @property {string} [frameType] - モンスターのフレームタイプ（"fusion", "synchro", "xyz" 等）
 *
 * @example
 * const exodia: DomainCardData = {
 *   id: 33396948,
 *   type: "monster",
 *   frameType: "normal"
 * };
 */
export interface DomainCardData {
  /** YGOPRODeck API互換のカードID（例: 33396948 = Exodia the Forbidden One） */
  id: number;

  /** カードの基本タイプ（ゲームロジックで使用） */
  type: CardType;

  /** モンスターのフレームタイプ（オプショナル：モンスターカードのみ） */
  frameType?: string;
}

/**
 * カードの基本タイプ（Domain Layer用）
 */
export type CardType = "monster" | "spell" | "trap";
```

**設計判断の根拠**:

| プロパティ | 必須/任意 | 根拠 |
|-----------|----------|------|
| `id` | 必須 | YGOPRODeck API互換性（FR-004）、カード識別に必須 |
| `type` | 必須 | ゲームロジックで頻繁に参照（例: フィールド配置判定） |
| `frameType` | 任意 | モンスターカードのみで使用（融合/シンクロ/エクシーズ判定） |

**除外したプロパティ**:
- `name`, `description`: Presentation Layerで取得（FR-002）
- `images`: Presentation Layerで取得（FR-002）
- `atk`, `def`, `level`: ゲームロジックで未使用（YAGNI原則）

---

## Presentation Layer型定義

### CardDisplayData

**場所**: `skeleton-app/src/lib/types/card.ts`

**責務**: UI表示に必要なカード情報を保持（YGOPRODeck APIから取得）

```typescript
/**
 * Presentation Layer用カードデータ（UI表示用）
 *
 * YGOPRODeck APIから取得したデータを保持。
 * UI表示に必要なすべての情報を含む。
 *
 * @property {number} id - YGOPRODeck API互換のカードID
 * @property {string} name - カード名（表示用）
 * @property {CardType} type - カードの基本タイプ
 * @property {string} [description] - カード効果テキスト
 * @property {CardImages} [images] - カード画像URL群
 * @property {MonsterAttributes} [monsterAttributes] - モンスター属性（モンスターカードのみ）
 * @property {boolean} [isSelected] - UI選択状態（UIのみで使用）
 *
 * @example
 * const exodiaDisplay: CardDisplayData = {
 *   id: 33396948,
 *   name: "Exodia the Forbidden One",
 *   type: "monster",
 *   description: "If you have ...",
 *   images: {
 *     imageCropped: "https://images.ygoprodeck.com/images/cards_cropped/33396948.jpg"
 *   },
 *   monsterAttributes: {
 *     atk: 1000,
 *     def: 1000,
 *     level: 3,
 *     race: "Spellcaster",
 *     attribute: "DARK"
 *   }
 * };
 */
export interface CardDisplayData {
  /** YGOPRODeck API互換のカードID */
  id: number;

  /** カード名（UI表示用） */
  name: string;

  /** カードの基本タイプ */
  type: CardType;

  /** カード効果テキスト（UI表示用） */
  description?: string;

  /** カード画像URL群 */
  images?: CardImages;

  /** モンスター属性（モンスターカードのみ） */
  monsterAttributes?: MonsterAttributes;

  /** UI選択状態（UI表示制御用） */
  isSelected?: boolean;
}

/**
 * カード画像URL群
 */
export interface CardImages {
  /** クロップ済み画像URL（推奨） */
  imageCropped?: string;

  /** フル画像URL */
  image?: string;

  /** 小サイズ画像URL */
  imageSmall?: string;
}

/**
 * モンスター属性（モンスターカードのみ）
 */
export interface MonsterAttributes {
  /** 攻撃力 */
  atk?: number;

  /** 守備力 */
  def?: number;

  /** レベル/ランク */
  level?: number;

  /** 種族（例: "Spellcaster", "Dragon"） */
  race?: string;

  /** 属性（例: "DARK", "LIGHT"） */
  attribute?: string;

  /** フレームタイプ（例: "fusion", "synchro", "xyz"） */
  frameType?: string;
}

/**
 * カードの基本タイプ（Presentation Layer用）
 *
 * Domain Layer の CardType と互換性を保つ。
 */
export type CardType = "monster" | "spell" | "trap";
```

**設計判断の根拠**:

| プロパティ | 必須/任意 | 根拠 |
|-----------|----------|------|
| `id` | 必須 | Domain Layerとの紐付けに必須 |
| `name` | 必須 | UI表示に必須 |
| `type` | 必須 | UI表示（背景色等）に必須 |
| `description` | 任意 | カード詳細表示で使用 |
| `images` | 任意 | カード画像表示で使用 |
| `monsterAttributes` | 任意 | モンスターカードのみで使用 |
| `isSelected` | 任意 | UI状態管理（ビジネスロジック外） |

---

## YGOPRODeck API型定義の検証と改善

### 問題点と改善案

[research.md](./research.md#4-ygoprodeck-api実装の妥当性検証) で特定した問題に対する改善を実施します。

#### 1. YGOProDeckCard型の修正

**場所**: `skeleton-app/src/lib/types/ygoprodeck.ts`

**問題**: `frameType` が必須フィールドとして定義されているが、実APIではオプショナル

**修正前**:
```typescript
export interface YGOProDeckCard {
  frameType: string;  // ⚠️ 必須フィールドとして定義
}
```

**修正後**:
```typescript
export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;
  frameType?: string;  // ✅ オプショナルフィールドに修正
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  archetype?: string;
  card_images: YGOProDeckCardImage[];
  card_sets?: YGOProDeckCardSet[];
  card_prices?: YGOProDeckCardPrice[];
}
```

#### 2. エラーハンドリングの改善

**場所**: `skeleton-app/src/lib/api/ygoprodeck.ts`

**問題**: エラー時に詳細情報が失われる

**修正前**:
```typescript
async function fetchYGOProDeckAPI(fetchFunction: typeof fetch, path: string) {
  const response = await fetchApi(fetchFunction, url, requestConfig);
  if (!response.ok) return null;  // ⚠️ エラー情報が失われる
  return await response.json();
}
```

**修正後**:
```typescript
/**
 * YGOPRODeck APIへのリクエストを実行
 *
 * @throws {Error} Rate limit exceeded (429)
 * @returns {Promise<T | null>} APIレスポンス（エラー時はnull）
 */
async function fetchYGOProDeckAPI<T>(
  fetchFunction: typeof fetch,
  path: string
): Promise<T | null> {
  const url = `${BASE_URL}/${path}`;
  const requestConfig = createRequestConfig();

  try {
    const response = await fetchApi(fetchFunction, url, requestConfig);

    if (!response.ok) {
      // エラー詳細をログ出力
      console.error(
        `YGOPRODeck API Error: ${response.status} ${response.statusText} - ${url}`
      );

      // Rate limit検出（429 Too Many Requests）
      if (response.status === 429) {
        throw new Error(
          'YGOPRODeck API rate limit exceeded. Please reduce request frequency.'
        );
      }

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('YGOPRODeck API fetch failed:', error);
    throw error;
  }
}
```

#### 3. データ変換ロジックの改善

**場所**: `skeleton-app/src/lib/types/ygoprodeck.ts`

**問題**: 未知のカードタイプを `"monster"` にデフォルト設定（誤分類の恐れ）

**修正前**:
```typescript
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";
  return "monster"; // ⚠️ デフォルト値がmonster（誤分類）
}
```

**修正後**:
```typescript
/**
 * YGOPRODeck APIのtype文字列をCardTypeに変換
 *
 * @param {string} type - YGOPRODeck APIのtype文字列
 * @returns {CardType} 正規化されたカードタイプ
 * @throws {Error} 未知のカードタイプ
 *
 * @example
 * normalizeType("Effect Monster") // => "monster"
 * normalizeType("Spell Card") // => "spell"
 * normalizeType("Trap Card") // => "trap"
 * normalizeType("Unknown") // => throws Error
 */
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();

  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  // 未知のカードタイプはエラーとして扱う
  console.error(`Unknown card type: ${type}`);
  throw new Error(
    `Unable to normalize card type: "${type}". ` +
    `Expected type containing "monster", "spell", or "trap".`
  );
}
```

**代替案**: デフォルト値を許容する場合

プロジェクト憲法の「VII. シンプルに問題を解決する」原則に基づき、未知のタイプが実運用で発生しない場合は、エラーをスローせずにデフォルト値を返す選択肢もあります。

```typescript
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();

  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  // 未知のカードタイプは警告のみ（エラーをスローしない）
  console.warn(
    `Unknown card type: "${type}". Defaulting to "monster". ` +
    `This may indicate a YGOPRODeck API schema change.`
  );
  return "monster";
}
```

**決定**: 初回実装ではエラーをスローし、テスト実行で未知のタイプが検出されるか確認する。実運用で問題がなければ、警告のみに変更する。

---

## レイヤー間のデータフロー

### アーキテクチャダイアグラム

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (UI Components)                         │
│                                                             │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │ Card.svelte     │◄────────┤ CardDisplayData  │          │
│  └─────────────────┘         └──────────────────┘          │
│         │                             ▲                     │
│         │                             │                     │
│         │                    ┌────────┴────────┐            │
│         │                    │ deckLoader.ts   │            │
│         │                    │ (Adapter)       │            │
│         │                    └────────┬────────┘            │
│         │                             │                     │
└─────────┼─────────────────────────────┼─────────────────────┘
          │                             │
          │                    ┌────────▼────────┐
          │                    │ ygoprodeck.ts   │
          │                    │ (API Client)    │
          │                    └────────┬────────┘
          │                             │
          │                    ┌────────▼────────────────┐
          │                    │ YGOPRODeck API          │
          │                    │ (External Service)      │
          │                    └─────────────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────────┐
│ Application Layer (Commands, Stores)                         │
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │ GameFacade       │◄───────┤ Svelte Stores    │            │
│  └────────┬─────────┘        └──────────────────┘            │
│           │                                                   │
└───────────┼───────────────────────────────────────────────────┘
            │
┌───────────▼───────────────────────────────────────────────────┐
│ Domain Layer (Game Logic)                                    │
│                                                               │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │ DuelState        │◄───────┤ DomainCardData   │            │
│  └──────────────────┘        └──────────────────┘            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### データフローシナリオ

#### シナリオ1: デッキレシピのロード

```typescript
// 1. Presentation Layer: デッキレシピを読み込む
// File: skeleton-app/src/lib/utils/deckLoader.ts

import type { RecipeCardEntry } from "$lib/types/deck";
import { getCardsByIds } from "$lib/api/ygoprodeck";

/**
 * デッキレシピからカード表示データを取得
 *
 * @param {RecipeCardEntry[]} recipe - デッキレシピ
 * @returns {Promise<CardDisplayData[]>} カード表示データ
 */
export async function loadDeckRecipe(
  recipe: RecipeCardEntry[]
): Promise<CardDisplayData[]> {
  // カードIDのリストを抽出
  const cardIds = recipe.map(entry => entry.id);

  // YGOPRODeck APIからバッチ取得（NFR-001）
  const cards = await getCardsByIds(fetch, cardIds);

  // CardDisplayDataに変換
  return cards.map(card => convertToCardDisplayData(card));
}

// 2. Domain Layer: ゲーム状態に最小限のデータを保持
// File: skeleton-app/src/lib/domain/models/Card.ts

/**
 * RecipeCardEntryからDomainCardDataに変換
 */
export function createDomainCardData(entry: RecipeCardEntry): DomainCardData {
  return {
    id: entry.id,
    type: inferCardTypeFromId(entry.id), // 型推論ロジック
    frameType: entry.frameType,
  };
}
```

#### シナリオ2: カード表示（UI）

```svelte
<!-- File: skeleton-app/src/lib/components/atoms/Card.svelte -->

<script lang="ts">
  import type { CardDisplayData } from "$lib/types/card";

  interface CardComponentProps {
    card?: CardDisplayData;  // Presentation Layer型を使用
    size?: ComponentSize;
    clickable?: boolean;
  }

  let { card, size = "medium", clickable = false }: CardComponentProps = $props();
</script>

<!-- カード画像表示 -->
{#if card?.images?.imageCropped}
  <img src={card.images.imageCropped} alt={card.name} />
{/if}

<!-- カード名表示 -->
{#if card}
  <div class="card-name">{card.name}</div>
{/if}
```

#### シナリオ3: ゲームロジック（Domain Layer）

```typescript
// File: skeleton-app/src/lib/domain/models/GameState.ts

import type { DomainCardData } from "./Card";

export class DuelState {
  private deck: DomainCardData[] = [];
  private hand: DomainCardData[] = [];

  /**
   * カードをドローする（Domain Layerのロジック）
   */
  draw(): DomainCardData | null {
    if (this.deck.length === 0) return null;

    const card = this.deck.shift()!;
    this.hand.push(card);

    return card;  // DomainCardDataを返す
  }

  /**
   * カードタイプによる判定（Domain Layerのロジック）
   */
  canSummon(card: DomainCardData): boolean {
    return card.type === "monster";  // typeプロパティのみ使用
  }
}
```

---

## 型の移行戦略

### 3段階の段階的移行

[research.md](./research.md#3-型定義の移行パス) で決定した移行戦略を実施します。

#### Phase 1: 新しい型定義の導入（後方互換性維持）

**期間**: タスク1〜3

**作業内容**:
1. `DomainCardData` を `domain/models/Card.ts` に追加
2. `CardDisplayData` を `types/card.ts` に追加
3. 既存の `CardData` 型に `@deprecated` マーカーを追加

**コード例**:
```typescript
// File: skeleton-app/src/lib/types/card.ts

/**
 * @deprecated Use `CardDisplayData` instead (Presentation Layer).
 * This type will be removed in the next phase.
 */
export type CardData = CardDisplayData;

/**
 * Presentation Layer用カードデータ（UI表示用）
 */
export interface CardDisplayData {
  id: number;
  name: string;
  type: CardType;
  // ...
}
```

#### Phase 2: コードベースの段階的移行

**期間**: タスク4〜8

**作業内容**:
1. Domain Layerのファイルを `DomainCardData` に移行
2. Presentation Layerのファイルを `CardDisplayData` に移行
3. 各ファイルの移行後、ユニットテストでリグレッション確認

**移行優先順位**:
1. Domain Layer (`domain/models/`, `domain/rules/`)
2. Application Layer (`application/commands/`, `application/stores/`)
3. Presentation Layer (`components/`, `utils/deckLoader.ts`)

#### Phase 3: 旧型定義の削除

**期間**: タスク9〜10

**作業内容**:
1. `@deprecated` マーカーがついた型定義を削除
2. 全テストスイート実行（204 unit + 16 E2E）
3. TypeScriptコンパイルエラーがゼロであることを確認

---

## キャッシュ実装設計

### メモリキャッシュの実装

[research.md](./research.md#2-キャッシュ実装戦略) で決定したシングルトンキャッシュを実装します。

**場所**: `skeleton-app/src/lib/api/ygoprodeck.ts`

**実装コード**:
```typescript
/**
 * YGOPRODeck APIレスポンスのメモリキャッシュ
 *
 * セッション単位でカードデータをキャッシュし、重複リクエストを防ぐ。
 * ライフサイクル: ページリロードまで（メモリ上のみ）
 */
const cardCache = new Map<number, YGOProDeckCard>();

/**
 * キャッシュをクリアする（テスト用）
 *
 * @internal
 */
export function clearCache(): void {
  cardCache.clear();
}

/**
 * カードIDのリストから複数のカードデータを取得
 *
 * キャッシュを優先的に使用し、未キャッシュのカードのみAPIリクエスト。
 *
 * @param {typeof fetch} fetchFunction - fetchインスタンス
 * @param {number[]} ids - カードIDのリスト
 * @returns {Promise<YGOProDeckCard[]>} カードデータのリスト
 *
 * @example
 * // キャッシュヒット率の向上（バッチリクエスト）
 * const cards = await getCardsByIds(fetch, [33396948, 70903634, 7902349]);
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
    const data = await fetchYGOProDeckAPI<{ data: YGOProDeckCard[] }>(
      fetchFunction,
      path
    );

    if (data?.data) {
      fetchedCards = data.data;

      // 取得したカードをキャッシュに保存
      for (const card of fetchedCards) {
        cardCache.set(card.id, card);
      }
    }
  }

  // キャッシュカード + 新規取得カードを結合
  return [...cachedCards, ...fetchedCards];
}
```

**設計判断の根拠**:

| 設計項目 | 選択 | 根拠 |
|---------|------|------|
| キャッシュスコープ | モジュールスコープ | SvelteKit環境でのシンプルなシングルトン実装 |
| キャッシュライフサイクル | セッション単位 | ページリロードまで有効（YGOPRODeck APIデータは静的） |
| キャッシュクリア | テスト用APIのみ | 本番環境では自動クリア不要（NFR-003） |
| キャッシュキー | カードID（number） | YGOPRODeck API互換のユニークキー |

---

## テストモック戦略

### Vitestモック（Unit Tests）

[research.md](./research.md#1-テストモック戦略) で決定したモック実装を行います。

**場所**: `skeleton-app/tests/unit/api/ygoprodeck.test.ts`

**実装コード**:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCardsByIds, clearCache } from "$lib/api/ygoprodeck";
import type { YGOProDeckCard } from "$lib/types/ygoprodeck";

// モックフィクスチャ
const mockExodia: YGOProDeckCard = {
  id: 33396948,
  name: "Exodia the Forbidden One",
  type: "Effect Monster",
  frameType: "normal",
  desc: "If you have ...",
  atk: 1000,
  def: 1000,
  level: 3,
  race: "Spellcaster",
  attribute: "DARK",
  card_images: [
    {
      id: 33396948,
      image_url: "https://images.ygoprodeck.com/images/cards/33396948.jpg",
      image_url_cropped: "https://images.ygoprodeck.com/images/cards_cropped/33396948.jpg",
      image_url_small: "https://images.ygoprodeck.com/images/cards_small/33396948.jpg",
    },
  ],
};

describe("getCardsByIds - with mock", () => {
  beforeEach(() => {
    clearCache(); // テスト前にキャッシュクリア
  });

  it("should fetch cards from mocked API", async () => {
    // fetchのモック
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia] }),
    });

    const cards = await getCardsByIds(mockFetch, [33396948]);

    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe("Exodia the Forbidden One");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should use cache for duplicate requests", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mockExodia] }),
    });

    // 1回目のリクエスト
    await getCardsByIds(mockFetch, [33396948]);

    // 2回目のリクエスト（キャッシュヒット）
    const cards = await getCardsByIds(mockFetch, [33396948]);

    expect(cards).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1); // APIリクエストは1回のみ
  });
});
```

### Playwrightモック（E2E Tests）

**場所**: `skeleton-app/tests/e2e/playwright/specs/deck-loading.spec.ts`

**実装コード**:
```typescript
import { test, expect } from "@playwright/test";
import type { YGOProDeckCard } from "$lib/types/ygoprodeck";

// フィクスチャファイル
import exodiaFixture from "../fixtures/exodia.json";

test.describe("Deck Loading with mocked API", () => {
  test.beforeEach(async ({ page }) => {
    // YGOPRODeck APIをモック
    await page.route("**/api.ygoprodeck.com/api/v7/**", async (route) => {
      const url = route.request().url();

      if (url.includes("id=33396948")) {
        // フィクスチャデータを返す
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [exodiaFixture] }),
        });
      } else {
        // 未定義のカードIDはエラー
        await route.abort("failed");
      }
    });

    await page.goto("/");
  });

  test("should display card name from mocked API", async ({ page }) => {
    // カード表示を確認
    const cardName = await page.locator('[data-testid="card-name"]').textContent();
    expect(cardName).toBe("Exodia the Forbidden One");
  });
});
```

### フィクスチャファイル構造

**場所**: `skeleton-app/tests/fixtures/ygoprodeck/`

```
tests/fixtures/ygoprodeck/
├── exodia.json          # Exodia the Forbidden One
├── pot-of-greed.json    # 強欲な壺
└── graceful-charity.json # 天使の施し
```

**フィクスチャ例** (`exodia.json`):
```json
{
  "id": 33396948,
  "name": "Exodia the Forbidden One",
  "type": "Effect Monster",
  "frameType": "normal",
  "desc": "If you have \"Right Leg of the Forbidden One\", \"Left Leg of the Forbidden One\", \"Right Arm of the Forbidden One\" and \"Left Arm of the Forbidden One\" in addition to this card in your hand, you win the Duel.",
  "atk": 1000,
  "def": 1000,
  "level": 3,
  "race": "Spellcaster",
  "attribute": "DARK",
  "card_images": [
    {
      "id": 33396948,
      "image_url": "https://images.ygoprodeck.com/images/cards/33396948.jpg",
      "image_url_cropped": "https://images.ygoprodeck.com/images/cards_cropped/33396948.jpg",
      "image_url_small": "https://images.ygoprodeck.com/images/cards_small/33396948.jpg"
    }
  ]
}
```

---

## 実装チェックリスト

### Domain Layer型定義

- [ ] `DomainCardData` インターフェースを `domain/models/Card.ts` に追加
- [ ] `CardType` 型を定義
- [ ] `createDomainCardData()` 変換関数を実装
- [ ] Domain Layerのユニットテストが `DomainCardData` のみを使用することを確認

### Presentation Layer型定義

- [ ] `CardDisplayData` インターフェースを `types/card.ts` に追加
- [ ] `CardImages` インターフェースを定義
- [ ] `MonsterAttributes` インターフェースを定義
- [ ] `convertToCardDisplayData()` 変換関数を実装

### YGOPRODeck API型定義の修正

- [ ] `YGOProDeckCard.frameType` をオプショナルに変更
- [ ] `fetchYGOProDeckAPI()` のエラーハンドリングを改善
- [ ] `normalizeType()` の未知タイプ処理を改善
- [ ] Rate limit検出（429エラー）を実装

### 型の移行

- [ ] 既存の `CardData` 型に `@deprecated` マーカーを追加
- [ ] Domain Layerファイルを `DomainCardData` に移行
- [ ] Presentation Layerファイルを `CardDisplayData` に移行
- [ ] 旧型定義を削除

### キャッシュ実装

- [ ] `cardCache: Map<number, YGOProDeckCard>` をモジュールスコープに追加
- [ ] `getCardsByIds()` でキャッシュヒット/ミス判定を実装
- [ ] `clearCache()` テスト用APIを実装

### テストモック

- [ ] Vitestモック用のフィクスチャを作成
- [ ] `tests/unit/api/ygoprodeck.test.ts` を実装
- [ ] Playwrightモック用のフィクスチャを作成
- [ ] `tests/e2e/playwright/specs/deck-loading.spec.ts` を更新

### テスト実行

- [ ] Domain Layerの204 testsがパスすることを確認（ネットワーク接続なし）
- [ ] Presentation Layerの16 E2E testsがパスすることを確認（モック使用）
- [ ] TypeScriptコンパイルエラーがゼロであることを確認

### ドキュメント

- [ ] `docs/architecture/data-model-design.md` を作成
- [ ] `CLAUDE.md` を更新（agent context更新スクリプト実行）

---

## 参考資料

- [spec.md](./spec.md) - Feature specification
- [research.md](./research.md) - Technical research
- [plan.md](./plan.md) - Implementation plan
- [constitution.md](../../.specify/memory/constitution.md) - Project constitution
- [YGOPRODeck API Documentation](https://ygoprodeck.com/api-guide/)
