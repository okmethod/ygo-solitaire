# Phase 1: アーキテクチャ設計詳細

**作成日**: 2025-12-13
**対象**: [spec.md](./spec.md) Feature "4層Clean Architectureへのリファクタリングとドキュメント整備"
**ステータス**: ✅ 完了

---

## 目次

1. [Port Interface設計](#1-port-interface設計)
2. [Adapter実装設計](#2-adapter実装設計)
3. [Dependency Injection設計](#3-dependency-injection設計)
4. [Stores配置基準の詳細分析](#4-stores配置基準の詳細分析)
5. [ディレクトリ移行計画](#5-ディレクトリ移行計画)

---

## 1. Port Interface設計

### 1.1 概要

**Port/Adapterパターン（Hexagonal Architecture）の適用**:
- **Port**: Application Layerに定義する抽象インターフェース
- **Adapter**: Infrastructure Layerに実装する具象クラス
- **目的**: Application LayerがInfrastructure Layerに直接依存しない（依存性逆転原則）

### 1.2 ICardDataRepository インターフェース定義

**ファイルパス**: `src/lib/application/ports/ICardDataRepository.ts`

```typescript
/**
 * Port: カードデータ取得の抽象インターフェース
 *
 * Application Layerが依存する契約を定義。
 * Infrastructure Layerが具象実装を提供。
 *
 * @remarks
 * - テスト時にモック実装を注入可能
 * - 将来的に別のカードAPI（ローカルストレージ、FastAPI等）への切り替えが容易
 * - YGOPRODeck APIの実装詳細から完全に分離
 */
export interface ICardDataRepository {
  /**
   * カードIDリストから複数のカードデータを取得
   *
   * @param cardIds - カードIDの配列（YGOPRODeck API互換の数値ID）
   * @returns Promise<CardDisplayData[]> - カード表示データの配列
   *
   * @remarks
   * - バッチリクエストにより複数カードを一度に取得
   * - 実装側でキャッシングを行う想定
   * - 存在しないIDがあった場合のエラーハンドリングは実装に委ねる
   */
  getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]>;

  /**
   * 単一のカードデータを取得
   *
   * @param cardId - カードID（YGOPRODeck API互換の数値ID）
   * @returns Promise<CardDisplayData> - カード表示データ
   *
   * @remarks
   * - 内部的には getCardsByIds([cardId]) を呼び出す想定
   */
  getCardById(cardId: number): Promise<CardDisplayData>;
}
```

### 1.3 設計根拠

#### 依存性逆転原則（DIP）の実現

```
Before (直接依存):
Application Layer → Infrastructure Layer (YGOProDeckAPI)

After (依存性逆転):
Application Layer → ICardDataRepository (Port)
                         ↑
                         |
Infrastructure Layer: YGOProDeckCardRepository (Adapter)
```

#### メリット

1. **テスタビリティ向上**: モック実装を注入してApplication Layerを独立テスト可能
2. **拡張性**: 別のAPI（FastAPI、ローカルストレージ等）への切り替えが容易
3. **疎結合**: Application Layerが外部APIの実装詳細を知らない

---

## 2. Adapter実装設計

### 2.1 YGOProDeckCardRepository クラス設計

**ファイルパス**: `src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts`

```typescript
import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';
import type { CardDisplayData } from '$lib/presentation/types/card';
import { getCardsByIds as apiGetCardsByIds } from '$lib/infrastructure/api/ygoprodeck';

/**
 * Adapter: YGOPRODeck APIを使用したカードデータ取得実装
 *
 * ICardDataRepositoryインターフェースの具象実装。
 * YGOPRODeck API v7との統合を提供。
 *
 * @remarks
 * - セッション単位のメモリキャッシュを実装
 * - 既存の `src/lib/api/ygoprodeck.ts` を内部的に利用
 */
export class YGOProDeckCardRepository implements ICardDataRepository {
  private cache: Map<number, CardDisplayData> = new Map();

  /**
   * カードIDリストから複数のカードデータを取得
   *
   * @param cardIds - カードIDの配列
   * @returns Promise<CardDisplayData[]> - カード表示データの配列
   *
   * @remarks
   * - キャッシュチェックを優先
   * - 未キャッシュIDのみAPIリクエスト（バッチ最適化）
   * - 取得後にキャッシュに保存
   */
  async getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]> {
    // Step 1: キャッシュチェック
    const uncachedIds = cardIds.filter(id => !this.cache.has(id));

    // Step 2: 未キャッシュIDをAPI経由で取得
    if (uncachedIds.length > 0) {
      const cards = await apiGetCardsByIds(uncachedIds);

      // Step 3: キャッシュに保存
      cards.forEach(card => this.cache.set(card.id, card));
    }

    // Step 4: キャッシュから返却（全IDがキャッシュにある状態）
    return cardIds.map(id => this.cache.get(id)!);
  }

  /**
   * 単一のカードデータを取得
   *
   * @param cardId - カードID
   * @returns Promise<CardDisplayData> - カード表示データ
   */
  async getCardById(cardId: number): Promise<CardDisplayData> {
    const cards = await this.getCardsByIds([cardId]);
    return cards[0];
  }

  /**
   * キャッシュをクリア（テスト用）
   *
   * @remarks
   * - 通常のプロダクションコードでは使用しない
   * - テストの各ケース間でキャッシュをリセットする用途
   */
  clearCache(): void {
    this.cache.clear();
  }
}
```

### 2.2 既存APIコードとの統合

**既存のファイル**: `src/lib/api/ygoprodeck.ts`
**移動先**: `src/lib/infrastructure/api/ygoprodeck.ts`

**変更点**: ファイル移動のみ（コード変更なし）

**理由**:
- 既存の `getCardsByIds()` 関数は正常動作している
- Adapterクラス内部で利用するため、公開APIとして変更不要
- Infrastructure Layerに移動することで、レイヤー責務が明確化

---

## 3. Dependency Injection設計

### 3.1 Production環境での注入

**ファイル**: `src/lib/application/stores/cardDisplayStore.ts`

```typescript
import { writable } from 'svelte/store';
import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';
import { YGOProDeckCardRepository } from '$lib/infrastructure/adapters/YGOProDeckCardRepository';
import type { CardDisplayData } from '$lib/presentation/types/card';

// Dependency Injection: Production実装を注入
const cardRepository: ICardDataRepository = new YGOProDeckCardRepository();

export const cardDisplayStore = writable<Map<number, CardDisplayData>>(new Map());

/**
 * カードデータをロードしてストアに保存
 *
 * @param cardIds - ロードするカードIDの配列
 */
export async function loadCardsForDisplay(cardIds: number[]): Promise<void> {
  const cards = await cardRepository.getCardsByIds(cardIds);

  cardDisplayStore.update(store => {
    cards.forEach(card => store.set(card.id, card));
    return store;
  });
}
```

### 3.2 Test環境でのモック注入

**ファイル**: `tests/unit/application/stores/cardDisplayStore.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';
import type { CardDisplayData } from '$lib/presentation/types/card';

/**
 * モック実装: テスト用のカードデータリポジトリ
 */
class MockCardDataRepository implements ICardDataRepository {
  private mockData: Map<number, CardDisplayData> = new Map();

  constructor(mockCards: CardDisplayData[]) {
    mockCards.forEach(card => this.mockData.set(card.id, card));
  }

  async getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]> {
    return cardIds.map(id => this.mockData.get(id)!);
  }

  async getCardById(cardId: number): Promise<CardDisplayData> {
    return this.mockData.get(cardId)!;
  }
}

describe('cardDisplayStore with Mock Repository', () => {
  let mockRepository: ICardDataRepository;

  beforeEach(() => {
    // テスト用のモックデータを準備
    const mockCards: CardDisplayData[] = [
      { id: 1, name: 'Mock Card 1', /* ... */ },
      { id: 2, name: 'Mock Card 2', /* ... */ },
    ];

    // モックリポジトリを注入
    mockRepository = new MockCardDataRepository(mockCards);
  });

  it('should load cards from mock repository', async () => {
    const cards = await mockRepository.getCardsByIds([1, 2]);

    expect(cards).toHaveLength(2);
    expect(cards[0].name).toBe('Mock Card 1');
  });
});
```

### 3.3 DI戦略のまとめ

| 環境 | 実装クラス | 目的 |
|------|----------|------|
| **Production** | `YGOProDeckCardRepository` | YGOPRODeck API v7からカードデータ取得 |
| **Test (Unit)** | `MockCardDataRepository` | APIに依存しない高速テスト実行 |
| **Test (Integration)** | `YGOProDeckCardRepository` | 実際のAPI統合テスト |
| **Future** | `FastAPICardRepository` | 自前バックエンドAPIへの切り替え（将来拡張） |

---

## 4. Stores配置基準の詳細分析

### 4.1 判断基準

**基本原則**: 「そのstoreに依存しているものは何か？」

- **Application Layer stores**: ゲームロジック・ビジネスルールに依存
- **Presentation Layer stores**: UI状態・表示制御のみ（ゲームロジック非依存）

### 4.2 依存関係の詳細分析

#### Application Layer Stores

| Store | 現在のパス | 移動先パス | 依存関係分析 | 判定根拠 |
|-------|-----------|-----------|-------------|---------|
| `gameStateStore.ts` | `application/stores/` | 移動不要 | Domain Layer (`GameState`型) | ゲーム状態管理のコア。Domain Layerの型に直接依存。 |
| `cardDisplayStore.ts` | `application/stores/` | 移動不要 | `ICardDataRepository` (Port) | Application Layerのビジネスロジック。カードデータ取得をPort経由で実行。 |
| `derivedStores.ts` | `application/stores/` | 移動不要 | `gameStateStore` | ゲーム状態の派生値（手札枚数、ライフポイント等）。ゲームロジックに依存。 |
| `effectResolutionStore.ts` | `stores/` | `application/stores/` | `EffectResolutionStep` (Domain), `gameStateStore`, `cardSelectionStore` | **重要**: 効果解決フロー管理。Domain Layer型(`EffectResolutionStep`)に依存し、ゲームロジックを含む。現在の配置は誤り。 |

**effectResolutionStore.ts の詳細分析**:

```typescript
// 依存関係:
import { gameStateStore } from "$lib/application/stores/gameStateStore";  // Application Layer
import { cardSelectionStore } from "./cardSelectionStore.svelte";         // Presentation Layer
import type { EffectResolutionStep } from "$lib/domain/effects/EffectResolutionStep";  // Domain Layer

// 主要な責務:
// 1. 効果解決ステップの管理（Domain Layerの型に依存）
// 2. GameStateの更新（Application Layerのstoreに依存）
// 3. カード選択モーダルのトリガー（Presentation Layerのstoreに依存）
```

**判定**:
- Domain Layer型に依存 → **Application Layer**に配置すべき
- Presentation Layer storeへの依存は許容（上位レイヤーから下位レイヤーへの依存）

#### Presentation Layer Stores

| Store | 現在のパス | 移動先パス | 依存関係分析 | 判定根拠 |
|-------|-----------|-----------|-------------|---------|
| `cardSelectionStore.svelte.ts` | `stores/` | `presentation/stores/` | `CardInstance` (Domain型のみ), Svelte 5 Runes (`$state`) | UI状態管理。Svelte Runesを使用。ゲームロジックを含まない純粋なUI制御。 |
| `theme.ts` | `stores/` | `presentation/stores/` | なし（UI設定のみ） | テーマ切り替え。完全にUI層の責務。 |
| `audio.ts` | `stores/` | `presentation/stores/` | なし（UI設定のみ） | 音声設定。完全にUI層の責務。 |
| `cardDetailDisplayStore.ts` | `stores/` | `presentation/stores/` | `Card` (CardDisplayDataのエイリアス) | カード詳細モーダルの表示制御。UI状態のみ。ゲームロジックを含まない。 |

**cardSelectionStore.svelte.ts の詳細分析**:

```typescript
// 依存関係:
import type { CardInstance } from "$lib/domain/models/Card";  // Domain Layer型（データ型のみ）

// 主要な責務:
// 1. カード選択UIの状態管理（選択中のカードID Set）
// 2. 選択可能性のバリデーション（minCards, maxCards制約）
// 3. 選択確定/キャンセルのコールバック実行

// ゲームロジック非依存:
// - GameStateを直接操作しない
// - カード効果の実装を含まない
// - コールバック経由で上位レイヤー（effectResolutionStore）に処理を委譲
```

**判定**:
- Domain Layer型への依存は型定義のみ（許容範囲）
- ゲームロジックを含まない → **Presentation Layer**に配置

### 4.3 配置基準の明文化

**Application Layer Stores の条件**（以下のいずれかを満たす）:
1. Domain Layer型（`GameState`, `EffectResolutionStep`等）に依存
2. ゲームルール・ビジネスロジックを実装
3. Application Layer Port（`ICardDataRepository`等）に依存

**Presentation Layer Stores の条件**（すべてを満たす）:
1. UI状態のみを管理（モーダル表示、選択状態等）
2. ゲームロジックを含まない
3. Svelte固有機能（Runes等）を利用している場合が多い

**境界ケースの判定**:
- **Domain Layer型への依存が型定義のみ** → Presentation Layer OK
  - 例: `cardSelectionStore.svelte.ts` は `CardInstance` 型を使うが、ゲームロジックは含まない
- **Domain Layer型を使ってゲームロジックを実装** → Application Layer
  - 例: `effectResolutionStore.ts` は `EffectResolutionStep` 型を使い、効果解決フローを実装

---

## 5. ディレクトリ移行計画

### 5.1 移行戦略の概要

**3段階の段階的移行**:
1. **Phase 1**: Infrastructure Layer新設（Port/Adapter導入）
2. **Phase 2**: Stores配置統一（Application/Presentation分離）
3. **Phase 3**: 全体ディレクトリ整理（完全な4層構造）

**各Phaseの完了時**:
- TypeScriptコンパイラエラーを即座に確認
- 全テスト（312テスト）を実行
- ビルド成功を確認

### 5.2 Phase 1: Infrastructure Layer新設

#### ファイル移動

**APIファイル群の移動**:
```
Before:
  src/lib/api/ygoprodeck.ts
  src/lib/api/paths.ts
  src/lib/api/checkHeartbeat.ts

After:
  src/lib/infrastructure/api/ygoprodeck.ts
  src/lib/infrastructure/api/paths.ts
  src/lib/infrastructure/api/checkHeartbeat.ts
```

**新規作成ファイル**:
```
src/lib/application/ports/ICardDataRepository.ts       (Port Interface)
src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts  (Adapter Implementation)
```

#### Import Path更新

**影響を受けるファイル**:
```
src/lib/application/stores/cardDisplayStore.ts
  Before: import { getCardsByIds } from '$lib/api/ygoprodeck';
  After:  import { YGOProDeckCardRepository } from '$lib/infrastructure/adapters/YGOProDeckCardRepository';
          import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';
```

**テストファイルの移動**:
```
Before:
  tests/unit/api/ygoprodeck.test.ts
  tests/unit/api/checkHeartbeat.test.ts

After:
  tests/unit/infrastructure/api/ygoprodeck.test.ts
  tests/unit/infrastructure/api/checkHeartbeat.test.ts
  tests/unit/infrastructure/adapters/YGOProDeckCardRepository.test.ts  (新規)
```

#### 作成タスク（US2対応）

| タスクID | 内容 | 所要時間 |
|---------|------|---------|
| T023 | `src/lib/infrastructure/` ディレクトリ作成 | 5分 |
| T024 | API関連ファイルを移動（ygoprodeck.ts, paths.ts, checkHeartbeat.ts） | 30分 |
| T025 | `ICardDataRepository.ts` Port作成 | 30分 |
| T026 | `YGOProDeckCardRepository.ts` Adapter実装 | 1時間 |
| T027 | `cardDisplayStore.ts` のDI対応 | 45分 |
| T028 | テストファイル移動と新規テスト作成 | 1時間 |
| T029 | 全テスト実行・ビルド確認 | 15分 |

**合計所要時間**: 約4時間

### 5.3 Phase 2: Stores配置統一

#### ファイル移動（Application Layer）

```
Before:
  src/lib/stores/effectResolutionStore.ts

After:
  src/lib/application/stores/effectResolutionStore.ts
```

**Import Path更新の影響範囲**:
```
- src/lib/components/organisms/board/DuelFieldBoard.svelte
- src/lib/components/modals/EffectResolutionModal.svelte  (存在する場合)
- tests/unit/stores/effectResolutionStore.test.ts
```

#### ファイル移動（Presentation Layer）

```
Before:
  src/lib/stores/audio.ts
  src/lib/stores/theme.ts
  src/lib/stores/cardDetailDisplayStore.ts
  src/lib/stores/cardSelectionStore.svelte.ts

After:
  src/lib/presentation/stores/audio.ts
  src/lib/presentation/stores/theme.ts
  src/lib/presentation/stores/cardDetailDisplayStore.ts
  src/lib/presentation/stores/cardSelectionStore.svelte.ts
```

**Import Path更新の影響範囲**:
```
全Svelteコンポーネント:
  src/lib/components/**/*.svelte

テストファイル:
  tests/unit/stores/ → 以下に分割
    tests/unit/application/stores/
    tests/unit/presentation/stores/
```

#### 作成タスク（US3対応）

| タスクID | 内容 | 所要時間 |
|---------|------|---------|
| T030 | `effectResolutionStore.ts` をApplication Layerに移動 | 30分 |
| T031 | `src/lib/presentation/stores/` ディレクトリ作成 | 5分 |
| T032 | Presentation Layer stores移動（4ファイル） | 45分 |
| T033 | 全コンポーネントのimport path更新 | 2時間 |
| T034 | テストファイルの移動と分割 | 1時間 |
| T035 | 全テスト実行・ビルド確認 | 15分 |

**合計所要時間**: 約4.5時間

### 5.4 Phase 3: 全体ディレクトリ整理

#### Components移動

```
Before:
  src/lib/components/

After:
  src/lib/presentation/components/
```

**既存のサブディレクトリ構造を保持**:
```
src/lib/presentation/components/
  ├── atoms/
  ├── buttons/
  ├── modals/
  └── organisms/
      └── board/
```

#### Types移動

```
Before:
  src/lib/types/

After:
  src/lib/presentation/types/
```

**理由**: `CardDisplayData`等のPresentation層専用型

#### Shared Layer新設

**Utils移動**:
```
Before:
  src/lib/utils/

After:
  src/lib/shared/utils/
```

**Constants移動**:
```
Before:
  src/lib/constants/

After:
  src/lib/shared/constants/
```

**理由**: 全レイヤーから参照される共通ユーティリティ

#### Data移動

```
Before:
  src/lib/data/

After:
  src/lib/application/data/
```

**理由**: アプリケーション固有のデータ定義

#### 作成タスク（US4対応）

| タスクID | 内容 | 所要時間 |
|---------|------|---------|
| T036 | `src/lib/presentation/components/` に移動 | 1時間 |
| T037 | `src/lib/presentation/types/` に移動 | 30分 |
| T038 | `src/lib/shared/` ディレクトリ作成 | 5分 |
| T039 | `utils/` と `constants/` を shared に移動 | 45分 |
| T040 | `src/lib/application/data/` に移動 | 30分 |
| T041 | 全ファイルのimport path更新（一斉変更） | 3時間 |
| T042 | SvelteKit alias設定（`$lib/...`）の動作確認 | 30分 |
| T043 | 全テスト実行・ビルド確認 | 15分 |

**合計所要時間**: 約6.5時間

### 5.5 最終的なディレクトリ構造

```
src/lib/
├── domain/                    # Domain Layer（ゲームルール）
│   ├── commands/
│   ├── data/
│   ├── effects/
│   ├── models/
│   └── rules/
├── application/               # Application Layer（ユースケース）
│   ├── commands/
│   ├── data/                  ← Phase 3で移動
│   ├── effects/
│   ├── ports/                 ← Phase 1で新規作成
│   │   └── ICardDataRepository.ts
│   └── stores/
│       ├── cardDisplayStore.ts
│       ├── derivedStores.ts
│       ├── effectResolutionStore.ts  ← Phase 2で移動
│       └── gameStateStore.ts
├── infrastructure/            # Infrastructure Layer（外部アクセス）
│   ├── adapters/              ← Phase 1で新規作成
│   │   └── YGOProDeckCardRepository.ts
│   └── api/                   ← Phase 1で移動
│       ├── checkHeartbeat.ts
│       ├── paths.ts
│       └── ygoprodeck.ts
├── presentation/              # Presentation Layer（UI）
│   ├── components/            ← Phase 3で移動
│   │   ├── atoms/
│   │   ├── buttons/
│   │   ├── modals/
│   │   └── organisms/
│   ├── stores/                ← Phase 2で移動
│   │   ├── audio.ts
│   │   ├── cardDetailDisplayStore.ts
│   │   ├── cardSelectionStore.svelte.ts
│   │   └── theme.ts
│   └── types/                 ← Phase 3で移動
│       └── card.ts
├── shared/                    # Shared Layer（全レイヤー共通）
│   ├── constants/             ← Phase 3で移動
│   └── utils/                 ← Phase 3で移動
├── assets/                    # 静的アセット（移動不要）
└── __testUtils__/             # テストユーティリティ（移動不要）
```

### 5.6 リスク管理

| リスク | 確率 | 影響度 | 対策 |
|-------|------|-------|------|
| Import Path一斉変更によるビルドエラー | Medium | High | 各Phase完了時に TypeScript コンパイラエラーを即座に確認。段階的移行により影響範囲を限定。 |
| Stores移動による状態管理の破損 | Low | High | Phase 2として独立実施。移動後に Integration Tests で状態管理を検証。 |
| Port/Adapter導入によるパフォーマンス劣化 | Low | Medium | Adapter内部でキャッシング実装。リファクタリング前後でパフォーマンステスト実施。 |
| テストファイルのインポートパス更新漏れ | Medium | Medium | 各Phase完了時に全テスト（312テスト）を実行し、エラーを即座に検出。 |

### 5.7 完了条件

各Phase完了時に以下を確認:

1. **TypeScriptコンパイル成功**: `npm run check` がエラーゼロ
2. **全テスト合格**: `npm run test:run` で312テストが全てPASS
3. **ビルド成功**: `npm run build` が正常終了
4. **Linter/Formatter**: `npm run lint` がエラーゼロ

---

## 次のステップ

✅ **Phase 1完了**: アーキテクチャ設計詳細が明確化されました。

⏳ **Phase 2へ**: 実装フェーズ（US1: Document Structure）から順次実行します。
