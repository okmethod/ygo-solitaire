# クイックスタートガイド: データモデルのYGOPRODeck API互換化とレイヤー分離

**Feature**: 002-data-model-refactoring
**対象**: 開発者（このfeatureの実装・レビュー・保守を行う方）
**目的**: データモデル設計の全体像を素早く理解し、実装作業を開始できるようにする

---

## 📋 このガイドの使い方

1. **背景と目的の理解**: [なぜこの変更が必要か？](#なぜこの変更が必要か) を読む（5分）
2. **全体像の把握**: [データモデルの全体像](#データモデルの全体像) を確認（5分）
3. **実装開始**: [実装の進め方](#実装の進め方) に従って作業開始（10分〜）
4. **詳細設計の参照**: 必要に応じて [data-model.md](./data-model.md) を参照

---

## なぜこの変更が必要か？

### 現状の問題

1. **Domain LayerがYGOPRODeck APIに依存している**
   - カードデータに表示用プロパティ（name, description, images等）が含まれている
   - ユニットテストがネットワーク接続を必要とする（テスタビリティ低下）

2. **カードID型の不統一**
   - `types/card.ts` は `number` 型
   - `domain/models/Card.ts` は `string` 型
   - YGOPRODeck API互換性が損なわれている

3. **2つのCardData型が競合**
   - `types/card.ts` と `domain/models/Card.ts` の両方に `CardData` 型が存在
   - レイヤー境界が曖昧

### 目指す姿

```
┌──────────────────────────────────────────────────────┐
│ Presentation Layer (UI Components)                  │
│ - CardDisplayData（表示用データ）                     │
│ - YGOPRODeck APIから動的取得                          │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ カードIDで紐付け
                 │
┌────────────────▼─────────────────────────────────────┐
│ Domain Layer (Game Logic)                           │
│ - DomainCardData（最小限データ）                      │
│ - id: number, type: CardType, frameType?: string    │
│ - YGOPRODeck APIに依存しない                          │
└──────────────────────────────────────────────────────┘
```

**メリット**:
- ✅ Domain Layerのユニットテストがネットワーク不要で高速実行
- ✅ YGOPRODeck API互換性の保証（外部ツール連携が容易）
- ✅ レイヤー間の責務が明確（Clean Architecture準拠）

---

## データモデルの全体像

### Domain Layer型定義

**場所**: `skeleton-app/src/lib/domain/models/Card.ts`

```typescript
/**
 * Domain Layer用カードデータ（最小限の情報のみ）
 */
export interface DomainCardData {
  id: number;           // YGOPRODeck API互換のカードID（例: 33396948）
  type: CardType;       // "monster" | "spell" | "trap"
  frameType?: string;   // モンスターのフレームタイプ（オプショナル）
}

export type CardType = "monster" | "spell" | "trap";
```

**使用例**:
```typescript
// Exodia the Forbidden Oneのドメインデータ
const exodia: DomainCardData = {
  id: 33396948,
  type: "monster",
  frameType: "normal"
};

// ゲームロジックで使用
if (card.type === "monster") {
  // モンスターゾーンに配置可能
}
```

### Presentation Layer型定義

**場所**: `skeleton-app/src/lib/types/card.ts`

```typescript
/**
 * Presentation Layer用カードデータ（UI表示用）
 */
export interface CardDisplayData {
  id: number;                            // YGOPRODeck API互換のカードID
  name: string;                          // カード名（表示用）
  type: CardType;                        // カードタイプ
  description?: string;                  // カード効果テキスト
  images?: CardImages;                   // カード画像URL群
  monsterAttributes?: MonsterAttributes; // モンスター属性
  isSelected?: boolean;                  // UI選択状態
}
```

**使用例**:
```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { CardDisplayData } from "$lib/types/card";
  let { card }: { card?: CardDisplayData } = $props();
</script>

{#if card?.images?.imageCropped}
  <img src={card.images.imageCropped} alt={card.name} />
{/if}
<div>{card.name}</div>
```

### レイヤー間のデータフロー

```typescript
// 1. デッキレシピからカードIDのリストを抽出
const cardIds = deckRecipe.map(entry => entry.id);

// 2. YGOPRODeck APIからバッチ取得（Presentation Layer）
const displayCards: CardDisplayData[] = await getCardsByIds(fetch, cardIds);

// 3. Domain Layer用に変換
const domainCards: DomainCardData[] = displayCards.map(card => ({
  id: card.id,
  type: card.type,
  frameType: card.monsterAttributes?.frameType
}));

// 4. ゲームロジックに渡す（Domain Layer）
duelState.loadDeck(domainCards);
```

---

## 実装の進め方

### Phase 1: 型定義の追加（後方互換性維持）

**タスク1**: Domain Layer型定義の追加

```bash
# 編集ファイル: skeleton-app/src/lib/domain/models/Card.ts
```

```typescript
// 新しい型定義を追加
export interface DomainCardData {
  id: number;
  type: CardType;
  frameType?: string;
}

export type CardType = "monster" | "spell" | "trap";

// 既存の型に @deprecated マーカーを追加
/**
 * @deprecated Use `DomainCardData` instead (Domain Layer).
 * This type will be removed in Phase 3.
 */
export type CardData = DomainCardData;
```

**タスク2**: Presentation Layer型定義の追加

```bash
# 編集ファイル: skeleton-app/src/lib/types/card.ts
```

```typescript
// 新しい型定義を追加
export interface CardDisplayData {
  id: number;
  name: string;
  type: CardType;
  description?: string;
  images?: CardImages;
  monsterAttributes?: MonsterAttributes;
  isSelected?: boolean;
}

// 既存の型に @deprecated マーカーを追加
/**
 * @deprecated Use `CardDisplayData` instead (Presentation Layer).
 * This type will be removed in Phase 3.
 */
export type Card = CardDisplayData;
```

**テスト**:
```bash
cd skeleton-app
npm run check  # TypeScriptコンパイルエラーがないことを確認
```

### Phase 2: YGOPRODeck API型定義の修正

**タスク3**: YGOProDeckCard型の修正

```bash
# 編集ファイル: skeleton-app/src/lib/types/ygoprodeck.ts
```

```typescript
export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;
  frameType?: string;  // ✅ 必須 → オプショナルに変更
  desc: string;
  // ...
}
```

**タスク4**: エラーハンドリングの改善

```bash
# 編集ファイル: skeleton-app/src/lib/api/ygoprodeck.ts
```

```typescript
async function fetchYGOProDeckAPI<T>(
  fetchFunction: typeof fetch,
  path: string
): Promise<T | null> {
  const url = `${BASE_URL}/${path}`;
  const response = await fetchApi(fetchFunction, url, requestConfig);

  if (!response.ok) {
    // エラー詳細をログ出力
    console.error(
      `YGOPRODeck API Error: ${response.status} ${response.statusText} - ${url}`
    );

    // Rate limit検出
    if (response.status === 429) {
      throw new Error('YGOPRODeck API rate limit exceeded');
    }

    return null;
  }

  return await response.json();
}
```

**タスク5**: データ変換ロジックの改善

```typescript
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();

  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  // 未知のカードタイプはエラーをスロー
  console.error(`Unknown card type: ${type}`);
  throw new Error(
    `Unable to normalize card type: "${type}". ` +
    `Expected type containing "monster", "spell", or "trap".`
  );
}
```

**テスト**:
```bash
cd skeleton-app
npm run test:run -- src/lib/api/__tests__/ygoprodeck.test.ts
```

### Phase 3: キャッシュ実装

**タスク6**: メモリキャッシュの追加

```bash
# 編集ファイル: skeleton-app/src/lib/api/ygoprodeck.ts
```

```typescript
// モジュールスコープにキャッシュを追加
const cardCache = new Map<number, YGOProDeckCard>();

export function clearCache(): void {
  cardCache.clear();
}

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
      for (const card of fetchedCards) {
        cardCache.set(card.id, card);
      }
    }
  }

  return [...cachedCards, ...fetchedCards];
}
```

**テスト**:
```bash
cd skeleton-app
npm run test:run -- src/lib/api/__tests__/ygoprodeck.test.ts
```

### Phase 4: テストモックの実装

**タスク7**: Vitestモック用フィクスチャの作成

```bash
# ディレクトリ作成
mkdir -p skeleton-app/tests/fixtures/ygoprodeck

# フィクスチャファイル作成
# skeleton-app/tests/fixtures/ygoprodeck/exodia.json
```

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
      "image_url_cropped": "https://images.ygoprodeck.com/images/cards_cropped/33396948.jpg"
    }
  ]
}
```

**タスク8**: Vitestユニットテストの作成

```bash
# 編集ファイル: skeleton-app/tests/unit/api/ygoprodeck.test.ts
```

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCardsByIds, clearCache } from "$lib/api/ygoprodeck";
import exodiaFixture from "../../fixtures/ygoprodeck/exodia.json";

describe("getCardsByIds - with mock", () => {
  beforeEach(() => {
    clearCache();
  });

  it("should fetch cards from mocked API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [exodiaFixture] }),
    });

    const cards = await getCardsByIds(mockFetch, [33396948]);

    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe("Exodia the Forbidden One");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should use cache for duplicate requests", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [exodiaFixture] }),
    });

    await getCardsByIds(mockFetch, [33396948]);
    const cards = await getCardsByIds(mockFetch, [33396948]);

    expect(cards).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1); // キャッシュヒット
  });
});
```

**テスト**:
```bash
cd skeleton-app
npm run test:run -- tests/unit/api/ygoprodeck.test.ts
```

**タスク9**: Playwright E2Eテストの更新

```bash
# 編集ファイル: skeleton-app/tests/e2e/playwright/specs/deck-loading.spec.ts
```

```typescript
import { test, expect } from "@playwright/test";
import exodiaFixture from "../../../fixtures/ygoprodeck/exodia.json";

test.describe("Deck Loading with mocked API", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api.ygoprodeck.com/api/v7/**", async (route) => {
      const url = route.request().url();

      if (url.includes("id=33396948")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [exodiaFixture] }),
        });
      } else {
        await route.abort("failed");
      }
    });

    await page.goto("/");
  });

  test("should display card name from mocked API", async ({ page }) => {
    const cardName = await page.locator('[data-testid="card-name"]').textContent();
    expect(cardName).toBe("Exodia the Forbidden One");
  });
});
```

### Phase 5: 既存コードの移行

**タスク10〜15**: Domain Layerファイルの移行

```bash
# 対象ファイル一覧
skeleton-app/src/lib/domain/models/Card.ts
skeleton-app/src/lib/domain/models/GameState.ts
skeleton-app/src/lib/domain/rules/
```

**移行パターン**:
```typescript
// 移行前
import type { CardData } from "./Card";

function draw(): CardData | null {
  // ...
}

// 移行後
import type { DomainCardData } from "./Card";

function draw(): DomainCardData | null {
  // ...
}
```

**各ファイル移行後にテスト実行**:
```bash
npm run test:run -- tests/unit/domain/models/Card.test.ts
```

**タスク16〜20**: Presentation Layerファイルの移行

```bash
# 対象ファイル一覧
skeleton-app/src/lib/types/card.ts
skeleton-app/src/lib/utils/deckLoader.ts
skeleton-app/src/lib/components/atoms/Card.svelte
skeleton-app/src/lib/components/atoms/CardDetailDisplay.svelte
```

**移行パターン**:
```svelte
<!-- 移行前 -->
<script lang="ts">
  import type { Card } from "$lib/types/card";
  let { card }: { card?: Card } = $props();
</script>

<!-- 移行後 -->
<script lang="ts">
  import type { CardDisplayData } from "$lib/types/card";
  let { card }: { card?: CardDisplayData } = $props();
</script>
```

### Phase 6: 旧型定義の削除

**タスク21**: `@deprecated` 型の削除

```typescript
// skeleton-app/src/lib/types/card.ts

// 削除対象
/**
 * @deprecated Use `CardDisplayData` instead (Presentation Layer).
 */
export type Card = CardDisplayData;
```

**最終テスト**:
```bash
cd skeleton-app

# すべてのユニットテスト
npm run test:run

# TypeScriptコンパイルチェック
npm run check

# Linter/Formatter
npm run lint

# E2Eテスト
cd tests/e2e
npx playwright test
```

---

## 完了条件

### Success Criteria（成功基準）

- ✅ **SC-001**: Domain Layerの全ユニットテスト（204 tests）が、ネットワーク接続なしで実行完了できる
- ✅ **SC-002**: Presentation Layerの全E2Eテスト（16 tests）が、YGOPRODeck APIから動的にデータ取得して正常動作する
- ✅ **SC-003**: 既存のデッキレシピが、変更なしで新しいデータモデルで読み込み可能である
- ✅ **SC-004**: Domain LayerのCardData型から、表示用プロパティ（name, description, images等）が完全に削除されている
- ✅ **SC-005**: `docs/architecture/` に、データモデル設計方針とYGOPRODeck API統合パターンが文書化されている
- ✅ **SC-006**: E2Eテスト実行時、YGOPRODeck APIへの実リクエスト数が最小化されている（モック/キャッシュ使用）

### 確認コマンド

```bash
# すべての確認を一括実行
cd skeleton-app

# 1. ユニットテスト（ネットワーク不要）
npm run test:run

# 2. TypeScriptコンパイル
npm run check

# 3. Linter/Formatter
npm run lint

# 4. E2Eテスト（モック使用）
cd tests/e2e
npx playwright test

# 5. ドキュメント確認
ls -la docs/architecture/data-model-design.md
```

---

## トラブルシューティング

### Q1: TypeScriptコンパイルエラーが発生する

**症状**: `npm run check` でエラーが出る

**原因**: 型の移行が不完全

**解決策**:
```bash
# エラー箇所を特定
npm run check

# エラーメッセージから該当ファイルを特定し、型を修正
# 例: CardData → DomainCardData または CardDisplayData
```

### Q2: ユニットテストが失敗する

**症状**: `npm run test:run` でテストが失敗する

**原因**: モックデータの不整合

**解決策**:
```bash
# 失敗したテストファイルを特定
npm run test:run -- --reporter=verbose

# フィクスチャデータの内容を確認
cat tests/fixtures/ygoprodeck/exodia.json

# モックの戻り値を修正
```

### Q3: E2Eテストでカード表示が出ない

**症状**: Playwrightテストでカード名が表示されない

**原因**: APIモックのルーティング設定ミス

**解決策**:
```typescript
// tests/e2e/playwright/specs/deck-loading.spec.ts

test.beforeEach(async ({ page }) => {
  await page.route("**/api.ygoprodeck.com/api/v7/**", async (route) => {
    // URLパターンを確認
    console.log("Intercepted URL:", route.request().url());

    // ...
  });
});
```

### Q4: YGOPRODeck APIのRate Limitエラー

**症状**: `YGOPRODeck API rate limit exceeded` エラー

**原因**: テスト実行時に実APIを叩いている

**解決策**:
```bash
# モックが正しく設定されているか確認
grep -r "page.route" tests/e2e/playwright/specs/

# キャッシュクリアを確認
grep -r "clearCache()" tests/unit/
```

---

## 参考資料

### 詳細設計ドキュメント

- **[data-model.md](./data-model.md)**: データモデルの詳細設計
- **[contracts/domain-types.ts](./contracts/domain-types.ts)**: Domain Layer型定義のTypeScriptコントラクト
- **[spec.md](./spec.md)**: Feature specification（要件定義）
- **[research.md](./research.md)**: 技術調査結果
- **[plan.md](./plan.md)**: 実装計画

### プロジェクト全体のドキュメント

- **[constitution.md](../../.specify/memory/constitution.md)**: プロジェクト憲法（開発原則）
- **[CLAUDE.md](../../CLAUDE.md)**: Claude Codeとの作業ガイド
- **[README.md](../../README.md)**: プロジェクト概要

### 外部リソース

- **[YGOPRODeck API Documentation](https://ygoprodeck.com/api-guide/)**: YGOPRODeck公式APIガイド
- **[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)**: Robert C. Martinによる解説
- **[Vitest Documentation](https://vitest.dev/)**: Vitestユニットテストフレームワーク
- **[Playwright Documentation](https://playwright.dev/)**: Playwright E2Eテストフレームワーク

---

## 次のステップ

このquickstartを完了したら、次のアクションに進んでください：

1. **実装作業の開始**: `/speckit.tasks` コマンドでタスク分解を実施
2. **実装の実行**: `/speckit.implement` コマンドで実装フェーズに移行
3. **レビュー**: PRを作成し、チームレビューを依頼
4. **ドキュメント化**: ADR作成（データモデル分離戦略の記録）
5. **次のfeature**: `003-ui-card-display` でUI改善に着手

---

**Happy Coding! 🎉**
