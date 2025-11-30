# Research: データモデルのYGOPRODeck API互換化とレイヤー分離

**Feature**: 002-data-model-refactoring | **Date**: 2025-11-24
**Plan**: [plan.md](./plan.md#phase-0-research--technical-discovery)

このドキュメントは、実装前の技術調査と意思決定の記録です。

---

## 1. テストモック戦略

### 疑問

Vitestでのモック実装パターンとフィクスチャ管理方法はどうすべきか？

### 調査結果

#### Vitestのモックパターン

**決定**: `vi.mock()`を使用したモジュールレベルモック + テストフィクスチャファイル

**実装パターン**:
```typescript
// tests/fixtures/ygoprodeck-cards.ts
export const mockYGOProDeckCards = {
  33396948: { // Exodia the Forbidden One
    id: 33396948,
    name: "Exodia the Forbidden One",
    type: "Effect Monster",
    desc: "...",
    // ... その他のフィールド
  },
  // ... 他のカード
};

// tests/unit/api/ygoprodeck.test.ts
import { vi } from 'vitest';
import { mockYGOProDeckCards } from '../../fixtures/ygoprodeck-cards';

vi.mock('$lib/api/ygoprodeck', () => ({
  getCardsByIds: vi.fn((fetch, ids) => {
    return Promise.resolve(ids.map(id => mockYGOProDeckCards[id]));
  }),
}));
```

**根拠**:
- ✅ テストフィクスチャを一元管理できる
- ✅ モックの振る舞いをテストケースごとにカスタマイズ可能
- ✅ 既存のVitest + Testing Libraryパターンと整合

#### E2EテストでのPlaywright intercept

**決定**: `page.route()`を使用したネットワークインターセプト

**実装パターン**:
```typescript
// tests/e2e/fixtures/api-mock.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  mockYGOProDeckAPI: async ({ page }, use) => {
    await page.route('**/api.ygoprodeck.com/**', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockYGOProDeckCards }),
      });
    });
    await use(page);
  },
});

// tests/e2e/deck-load.spec.ts
test('デッキロードテスト', async ({ mockYGOProDeckAPI, page }) => {
  await page.goto('/');
  // テスト実行 - 実APIは呼ばれない
});
```

**根拠**:
- ✅ E2Eテスト実行時にYGOPRODeck APIへの実リクエストを完全に防止
- ✅ Playwrightの標準機能で追加ライブラリ不要
- ✅ テスト速度向上（ネットワークI/O削減）

#### フィクスチャ配置場所

**決定**:
```
tests/
├── fixtures/
│   ├── ygoprodeck-cards.ts    # YGOPRODeck APIレスポンスのモック
│   └── deck-recipes.ts         # デッキレシピのテストデータ
├── unit/
│   └── domain/
└── e2e/
    ├── fixtures/
    │   └── api-mock.ts         # Playwright用APIモック
    └── *.spec.ts
```

**根拠**:
- ✅ テストフィクスチャを一元管理
- ✅ Unit/E2Eテストで共有可能
- ✅ 保守性向上（データ変更は1箇所のみ）

### 代替案と棄却理由

| 代替案 | 棄却理由 |
|--------|---------|
| MSW (Mock Service Worker) | 追加ライブラリ導入コスト、既存Vitestパターンと異なる |
| 実APIを叩く | YGOPRODeck APIへの過剰負荷、テスト速度低下、外部依存 |
| テストデータをハードコード | 保守性が低い、データ変更時の影響範囲が大きい |

### 結論

- **Unit tests**: `vi.mock()` + `tests/fixtures/ygoprodeck-cards.ts`
- **E2E tests**: `page.route()` + `tests/e2e/fixtures/api-mock.ts`
- **フィクスチャ管理**: 一元管理ファイル、TypeScript型定義で保守性確保

---

## 2. キャッシュ実装戦略

### 疑問

メモリキャッシュの実装方法とライフサイクルはどうすべきか？

### 調査結果

#### シングルトンキャッシュ実装パターン

**決定**: Moduleスコープの`Map`を使用したシンプルなメモリキャッシュ

**実装パターン**:
```typescript
// lib/api/ygoprodeck.ts
const cardCache = new Map<number, YGOProDeckCard>();

export async function getCardsByIds(
  fetchFunction: typeof fetch,
  ids: number[]
): Promise<YGOProDeckCard[]> {
  // キャッシュから取得可能なカードを抽出
  const cached: YGOProDeckCard[] = [];
  const uncachedIds: number[] = [];

  for (const id of ids) {
    if (cardCache.has(id)) {
      cached.push(cardCache.get(id)!);
    } else {
      uncachedIds.push(id);
    }
  }

  // 未キャッシュのカードのみAPIリクエスト
  if (uncachedIds.length > 0) {
    const fetched = await fetchYGOProDeckAPI(fetchFunction, `cardinfo.php?id=${uncachedIds.join(',')}`);
    if (fetched?.data) {
      for (const card of fetched.data) {
        cardCache.set(card.id, card);
      }
      return [...cached, ...fetched.data];
    }
  }

  return cached;
}

// キャッシュクリア機能（テスト用）
export function clearCardCache() {
  cardCache.clear();
}
```

**根拠**:
- ✅ 実装がシンプル（外部ライブラリ不要）
- ✅ SvelteKitのクライアントサイドで動作
- ✅ テスト時のキャッシュクリアが容易
- ✅ リクエスト削減効果が高い（バッチリクエストと組み合わせ）

#### キャッシュライフサイクル

**決定**: ページセッション単位（ブラウザリロードでクリア）

**根拠**:
- ✅ 実装がシンプル（明示的なクリア不要）
- ✅ メモリリーク防止（ページリロードで自動クリア）
- ✅ 1セッション内での重複リクエスト防止には十分

**将来的な拡張（Out of Scope）**:
- localStorage/IndexedDBへの永続化
- TTL（Time To Live）付きキャッシュ
- キャッシュサイズ制限

#### キャッシュクリア戦略

**決定**:
- **本番環境**: 自動クリア不要（ページリロードで自然に消える）
- **開発環境**: Hot Module Replacement時も維持（開発効率向上）
- **テスト環境**: `beforeEach()`で`clearCardCache()`を実行

**実装パターン**:
```typescript
// tests/unit/api/ygoprodeck.test.ts
import { beforeEach } from 'vitest';
import { clearCardCache } from '$lib/api/ygoprodeck';

beforeEach(() => {
  clearCardCache(); // 各テスト前にキャッシュクリア
});
```

### 代替案と棄却理由

| 代替案 | 棄却理由 |
|--------|---------|
| localStorage | 永続化は今回のスコープ外、実装複雑化 |
| IndexedDB | オーバースペック、実装コスト高 |
| LRU Cache | 追加ライブラリ、今回のスコープではシンプルなMapで十分 |
| Svelte Store | レイヤー境界の混乱（APIレイヤーにSvelte依存を避ける） |

### 結論

- **実装**: Moduleスコープの`Map<number, YGOProDeckCard>`
- **ライフサイクル**: ページセッション単位
- **クリア戦略**: テスト環境のみ明示的クリア
- **拡張性**: 将来的にlocalStorage等に切り替え可能な設計

---

## 3. 型定義の移行パス

### 疑問

既存コードの段階的移行方法はどうすべきか？

### 調査結果

#### 移行戦略

**決定**: 3段階の段階的移行アプローチ

**Phase 1: 新型定義の作成（競合なし）**
```typescript
// domain/models/Card.ts (Domain Layer)
export interface DomainCardData {
  readonly id: number;
  readonly type: 'monster' | 'spell' | 'trap';
  readonly frameType?: string;
}

// types/card.ts (Presentation Layer)
export interface CardDisplayData {
  readonly id: number;
  readonly name: string;
  readonly type: CardType;
  readonly description: string;
  readonly images?: CardImageProperties;
  readonly monster?: MonsterCardProperties;
}

// 既存のCardData型は一時的に保持（deprecated扱い）
/** @deprecated Use DomainCardData or CardDisplayData */
export type CardData = CardDisplayData;
```

**Phase 2: 段階的移行**
```typescript
// Step 1: Domain Layer を DomainCardData に移行
// domain/models/GameState.ts
import type { DomainCardData } from './Card';

// Step 2: Presentation Layer を CardDisplayData に移行
// components/atoms/Card.svelte
import type { CardDisplayData } from '$lib/types/card';

// Step 3: 各ファイルで型エイリアスを段階的に削除
```

**Phase 3: 旧型定義の削除**
```typescript
// 全ファイルの移行完了後、@deprecatedを削除
// export type CardData = ...  ← 削除
```

**根拠**:
- ✅ コンパイルエラーが発生しない段階的移行
- ✅ 既存テストが継続的にパス
- ✅ 最終的な型定義が明確（DomainCardData / CardDisplayData）

#### TypeScriptコンパイラエラー対処

**決定**: 型エイリアスと`@ts-expect-error`の組み合わせ

**実装パターン**:
```typescript
// 移行中の一時的な型互換性確保
import type { CardData, DomainCardData } from '$lib/types/card';

// 旧型を使用しているコード（段階的に修正予定）
function legacyFunction(card: CardData) {
  // ...
}

// 新型を使用する新しいコード
function newFunction(card: DomainCardData) {
  // 一時的な変換（移行完了後に削除）
  // @ts-expect-error: Migration in progress - CardData will be removed
  legacyFunction(card);
}
```

**根拠**:
- ✅ コンパイラエラーを一時的に抑制
- ✅ `@ts-expect-error`で移行中であることを明示
- ✅ 移行完了後にコメントを削除すればエラーが復活（移行漏れ防止）

### 代替案と棄却理由

| 代替案 | 棄却理由 |
|--------|---------|
| 一括移行（ビッグバンアプローチ） | リスクが高い、テストが一斉に壊れる可能性 |
| 型エイリアスなし（直接書き換え） | コンパイルエラーが大量発生、段階的移行が困難 |
| 新ファイル作成（CardV2.ts等） | ファイルが乱立、最終的な削除漏れリスク |

### 結論

- **移行方法**: 3段階の段階的移行（新型作成 → 移行 → 旧型削除）
- **型エイリアス**: `@deprecated` + `CardData = CardDisplayData`
- **エラー対処**: `@ts-expect-error`で一時的な型不整合を明示
- **最終形**: DomainCardData（Domain Layer）/ CardDisplayData（Presentation Layer）

---

## 4. YGOPRODeck API実装の妥当性検証

### 疑問

既存のYGOPRODeck API統合コード（`api/ygoprodeck.ts`, `types/ygoprodeck.ts`）にデータスキーマの誤りや最適ではない実装が含まれていないか？

### 調査結果

#### 既存実装のレビュー

**調査対象**:
- `lib/api/ygoprodeck.ts`: API通信ロジック
- `lib/types/ygoprodeck.ts`: 型定義とデータ変換

**確認項目**:
1. YGOProDeck APIの公式スキーマとの整合性
2. 型定義の完全性（必須フィールド vs オプショナルフィールド）
3. エラーハンドリングの適切性
4. データ変換ロジックの正確性

#### 発見された問題点と改善案

**1. 型定義の検証が必要**

**現状**:
```typescript
// types/ygoprodeck.ts
export interface YGOProDeckCard {
  id: number;
  name: string;
  type: string;
  frameType: string;  // ⚠️ 必須フィールドとして定義されている
  desc: string;
  // ...
}
```

**調査タスク**:
- YGOProDeck API公式ドキュメント（https://ygoprodeck.com/api-guide/）で必須フィールドを確認
- 実際のAPIレスポンスで`frameType`が常に存在するか検証
- 他のフィールド（`archetype`, `card_sets`等）のオプショナリティ確認

**決定の基準**:
- API仕様との完全な整合性
- ランタイムエラーの防止（存在しないフィールドへのアクセス）

**2. エラーハンドリングの改善**

**現状**:
```typescript
// api/ygoprodeck.ts
const response = await fetchApi(fetchFunction, url, requestConfig);
if (!response.ok) return null;  // ⚠️ エラー情報が失われる
return await response.json();
```

**問題点**:
- エラー詳細がログに残らない
- 呼び出し元でエラー原因が判別不可
- リトライ可能なエラー（429 Too Many Requests）の判別不可

**改善案**:
```typescript
// api/ygoprodeck.ts
const response = await fetchApi(fetchFunction, url, requestConfig);
if (!response.ok) {
  console.error(`YGOPRODeck API Error: ${response.status} ${response.statusText} - ${url}`);

  // 429エラーの場合は明示的に処理
  if (response.status === 429) {
    throw new Error('YGOPRODeck API rate limit exceeded');
  }

  return null;
}
return await response.json();
```

**根拠**:
- デバッグ容易性向上
- Rate limitエラーの明示的な検出
- 将来的なリトライロジック追加の基盤

**3. データ変換ロジックの検証**

**現状**:
```typescript
// types/ygoprodeck.ts
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  return "monster"; // ⚠️ デフォルト値がmonster
}
```

**問題点**:
- 不明なカードタイプがmonsterとして扱われる（誤分類）
- エラーが静かに無視される

**改善案**:
```typescript
function normalizeType(type: string): CardType {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("monster")) return "monster";
  if (lowerType.includes("spell")) return "spell";
  if (lowerType.includes("trap")) return "trap";

  // 不明なタイプはエラーログを出力
  console.error(`Unknown card type: ${type}`);
  throw new Error(`Unable to normalize card type: ${type}`);
}
```

**根拠**:
- データ整合性の保証
- 予期しないAPIレスポンスの早期検出
- デバッグ容易性向上

**4. APIスキーマの実際の検証**

**調査タスク**:
- YGOPRODeck APIに実リクエストを送信し、実際のレスポンススキーマを確認
- 既存のデッキレシピで使用されているカードID（33396948等）でテスト
- オプショナルフィールドの存在パターンを確認

**実施方法**:
```bash
# 実際のAPIレスポンスを確認
curl "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=33396948" | jq .

# 複数カードのバッチ取得
curl "https://db.ygoprodeck.com/api/v7/cardinfo.php?id=33396948,19613556" | jq .
```

**検証ポイント**:
- `frameType`の存在パターン
- `card_images`配列の要素数（常に1つ以上か）
- エラーレスポンスの形式

### 決定事項

**Phase 1（Design & Contracts）で実施**:

1. **YGOPRODeck API公式スキーマ確認**
   - 公式ドキュメントと実際のレスポンスを照合
   - 型定義の正確性を検証

2. **型定義の修正**
   - オプショナルフィールドを正確に`?`で定義
   - 必須フィールドの欠落時のエラーハンドリング

3. **エラーハンドリング強化**
   - エラーログの追加
   - Rate limit対応の基盤整備
   - データ変換エラーの明示的な処理

4. **テストカバレッジ追加**
   - 異常系テスト（不明なカードタイプ、欠落フィールド）
   - エラーレスポンスのハンドリングテスト

### 代替案と棄却理由

| 代替案 | 棄却理由 |
|--------|---------|
| 既存実装をそのまま信頼 | データスキーマの誤りでランタイムエラーのリスク |
| 完全なAPI仕様書作成 | 過剰なドキュメント、実装との乖離リスク |
| Zodによるランタイムバリデーション | 追加ライブラリ導入コスト、今回のスコープでは過剰 |

### 結論

- **検証範囲**: YGOPRODeck API型定義、エラーハンドリング、データ変換ロジック
- **実施タイミング**: Phase 1（data-model.md作成時）
- **アプローチ**: 公式ドキュメント + 実APIレスポンス確認
- **成果物**: 修正された型定義とエラーハンドリングコード + テストケース追加

---

## ベストプラクティスのまとめ

### テスト戦略

1. **Unit tests**: Vitestの`vi.mock()`でモジュールモック
2. **E2E tests**: Playwrightの`page.route()`でネットワークインターセプト
3. **Fixtures**: `tests/fixtures/`に一元管理、TypeScript型定義で保守性確保

### キャッシュ戦略

1. **実装**: Moduleスコープの`Map`でシンプルに
2. **ライフサイクル**: ページセッション単位（リロードでクリア）
3. **テスト**: `beforeEach()`で明示的クリア

### 型移行戦略

1. **段階的移行**: 新型作成 → 移行 → 旧型削除の3段階
2. **型エイリアス**: `@deprecated`で移行中を明示
3. **エラー対処**: `@ts-expect-error`で一時的な不整合を記録

---

## 決定事項の技術的な根拠

| 決定 | 技術的根拠 | トレードオフ |
|------|-----------|------------|
| Vitest mock | Vitestの標準機能、既存テストパターンと整合 | MSW等の高度なツールは不使用 |
| Playwright route | E2Eテストでの標準パターン、追加ライブラリ不要 | より柔軟なMSWは不使用 |
| Moduleスコープ Map | 実装がシンプル、外部ライブラリ不要 | 永続化なし（Out of Scope） |
| 段階的型移行 | コンパイルエラーを最小化、既存テストが継続的にパス | 移行期間中の型定義の複雑さ |

---

## 次のステップ

Phase 0の調査が完了しました。Phase 1（Design & Contracts）に進みます。

**Phase 1の成果物**:
1. data-model.md - 型定義の詳細設計
2. contracts/domain-types.ts - Domain Layer型のコントラクト
3. quickstart.md - 開発者向けガイド
