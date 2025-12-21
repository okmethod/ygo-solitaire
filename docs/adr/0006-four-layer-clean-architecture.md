# ADR-0006: 4 層 Clean Architecture へのリファクタリング

## Status

✅ Accepted (2024-12-15)

## Context

spec/005-4-layer-clean-arch（4 層 Clean Architecture リファクタリング）の実装において、既存の 3 層構造（Domain/Application/Presentation）をより明確な 4 層構造（Domain/Application/Infrastructure/Presentation）に再編する必要がありました。

### 従来の実装（3 層構造）

```
src/lib/
├── domain/              # ドメインロジック
├── application/         # ユースケース・stores
├── api/                 # YGOPRODeck API（Infrastructure的な役割だが独立）
├── components/          # UIコンポーネント（Presentation）
├── types/               # 型定義（全層で共有）
├── utils/               # ユーティリティ（全層で共有）
└── stores/              # UI状態管理（配置が曖昧）
```

### 問題点

1. **Infrastructure Layer の欠如**:

   - `src/lib/api/` が独立ディレクトリとして存在
   - Application Layer が外部 API に直接依存（Port/Adapter パターン未適用）
   - テスト時のモック差し替えが困難

2. **Stores 配置の不統一**:

   - Application 層の stores: `src/lib/application/stores/`
   - Presentation 層の stores: `src/lib/stores/`
   - 責任に応じた配置基準が不明確

3. **レイヤー依存関係の違反**:

   - Application 層 → Presentation 層: 4 件（型定義の不適切な配置）
   - Infrastructure 層 → Presentation 層: 3 件（データ変換処理の配置ミス）

4. **型定義の配置問題**:

   - すべての型が`presentation/types/`に集約
   - Application/Infrastructure 層が Presentation 層の型に依存
   - レイヤー境界が曖昧

5. **ドキュメントとコードの乖離**:
   - `docs/architecture/overview.md` が 3 層構造を前提
   - 削除済みファイル（`cardDatabase.ts`）への参照が残存
   - 新規参加者が正しい情報を得られない

## Decision

**4 層 Clean Architecture へのリファクタリングを実施し、レイヤー境界を明確化する**

### アーキテクチャ概要

```
┌─────────────────────────────────────────┐
│     Presentation Layer                  │
│  - UI Components (Svelte)               │
│  - UI State Stores                      │
│  - Type Aliases (re-exports)            │
└─────────────────────────────────────────┘
              ▲
              │ 依存
              │
┌─────────────────────────────────────────┐
│     Application Layer                   │
│  - Use Cases (Commands)                 │
│  - Application State Stores             │
│  - Ports (Interfaces)                   │
│  - DTOs (CardDisplayData, DeckRecipe)   │
└─────────────────────────────────────────┘
       ▲                          ▲
       │ 依存                     │ 実装
       │                          │
┌──────────────────┐    ┌─────────────────┐
│   Domain Layer   │    │ Infrastructure  │
│  - Entities      │    │  - Adapters     │
│  - Value Objects │    │  - API Clients  │
│  - Domain Rules  │    │  - External DTOs│
└──────────────────┘    └─────────────────┘
```

### 実装方法

#### 1. Infrastructure Layer 新設

```
src/lib/infrastructure/
├── adapters/
│   └── YGOProDeckCardRepository.ts    # ICardDataRepository実装
├── api/
│   ├── ygoprodeck.ts                  # API Client
│   ├── paths.ts                       # API Endpoints
│   └── checkHeartbeat.ts              # Health Check
└── types/
    └── ygoprodeck.ts                  # YGOProDeckCard型
```

**主要な設計判断**:

- Port/Adapter パターン適用
- `ICardDataRepository`インターフェースを Application 層に定義
- `YGOProDeckCardRepository`実装を Infrastructure 層に配置
- データ変換処理（`convertToCardDisplayData`）を Adapter 内に実装

#### 2. Stores 配置の統一

**Presentation Layer Stores** (`src/lib/presentation/stores/`):

- `cardSelectionStore.svelte.ts` - カード選択 UI 状態
- `theme.ts` - テーマ設定
- `audio.ts` - オーディオ設定
- `cardDetailDisplayStore.ts` - カード詳細表示 UI 状態

**Application Layer Stores** (`src/lib/application/stores/`):

- `gameStateStore.ts` - ゲーム状態管理
- `effectResolutionStore.ts` - 効果解決フロー
- `cardDisplayStore.ts` - カード表示データキャッシュ

**配置基準**:

- UI 固有の状態 → Presentation Layer
- ビジネスロジック・ユースケース状態 → Application Layer

#### 3. 型定義の再配置

**Application Layer** (`src/lib/application/types/`):

- `card.ts` - `CardDisplayData`（Application 層の DTO）
- `deck.ts` - `DeckRecipe`（デッキレシピ DTO）

**Infrastructure Layer** (`src/lib/infrastructure/types/`):

- `ygoprodeck.ts` - `YGOProDeckCard`（外部 API 型）

**Presentation Layer** (`src/lib/presentation/types/`):

- 型エイリアス（後方互換性のための再エクスポート）
  ```typescript
  export type { CardDisplayData } from "$lib/application/types/card";
  export type { DeckRecipe } from "$lib/application/types/deck";
  ```

**設計判断**:

- Application/Infrastructure 層が独自の型定義を持つ
- Presentation 層は型エイリアスのみ（既存コンポーネントの変更を最小化）

#### 4. ディレクトリ構造の 4 層化

```
src/lib/
├── domain/                    # Domain Layer
│   ├── models/
│   ├── commands/
│   └── effects/
├── application/               # Application Layer
│   ├── GameFacade.ts
│   ├── stores/
│   ├── ports/                # 新設: Port Interfaces
│   ├── data/
│   └── types/                # 新設: Application DTOs
├── infrastructure/            # 新設: Infrastructure Layer
│   ├── adapters/
│   ├── api/
│   └── types/
├── presentation/              # 新設: Presentation Layer
│   ├── components/
│   ├── stores/
│   └── types/
└── shared/                    # 新設: Shared Layer
    ├── utils/
    └── constants/
```

#### 5. レイヤー依存関係の是正

**違反ケース 1: Application 層 → Presentation 層**

```typescript
// ❌ Before
// src/lib/application/ports/ICardDataRepository.ts
import type { CardDisplayData } from "$lib/presentation/types/card";

// ✅ After
import type { CardDisplayData } from "$lib/application/types/card";
```

**違反ケース 2: Infrastructure 層 → Presentation 層**

```typescript
// ❌ Before
// src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts
import { convertToCardDisplayData } from "$lib/presentation/types/ygoprodeck";

// ✅ After
// convertToCardDisplayData()をAdapter内にprivateメソッドとして実装
private convertToCardDisplayData(apiCard: YGOProDeckCard): CardDisplayData {
  // Infrastructure層の責務として配置
}
```

**違反ケース 3: Store 間依存（effectResolutionStore → cardSelectionStore）**

```typescript
// ❌ Before
// src/lib/application/stores/effectResolutionStore.ts
import { cardSelectionStore } from "$lib/presentation/stores/cardSelectionStore.svelte";

effectResolutionStore.startResolution(() => {
  cardSelectionStore.startSelection(config); // 直接呼び出し
});

// ✅ After
// 依存性注入パターン
effectResolutionStore.registerCardSelectionHandler((config) => {
  cardSelectionStore.startSelection(config);
});
```

## Consequences

### Positive

✅ **レイヤー境界の明確化**

- 4 層構造（Domain/Application/Infrastructure/Presentation）が明示的
- 新規参加者がコードの配置を理解しやすい
- レイヤー間の依存方向が統一（上位層から下位層へ）

✅ **Port/Adapter パターンの導入**

- Infrastructure 層への直接依存を排除
- テスト時のモック差し替えが容易
- 外部 API 変更時の影響範囲が限定的

✅ **テスト容易性の向上**

- Application 層のテストで Mock Repository を使用可能
- Infrastructure 層のテストが独立して実行可能
- 全テスト（312 テスト）が引き続き 100%pass

✅ **Stores 配置の統一**

- 責任に応じた配置基準の確立
- UI 状態とビジネスロジック状態の分離
- コードレビュー時の判断基準が明確

✅ **型定義の適切な配置**

- Application/Infrastructure 層が独自の型を持つ
- レイヤー依存違反が静的解析で検出可能
- Presentation 層は型エイリアスで後方互換性を維持

✅ **ドキュメントとコードの一致**

- `docs/architecture/overview.md` が 4 層構造を正確に反映
- 削除済みファイル参照の除去
- 新規参加者が正しい情報を得られる

### Negative

❌ **ディレクトリ階層の深化**

- import path が長くなる（`$lib/presentation/components/atoms/Card.svelte`）
- ファイル移動が大規模（`git mv`使用により履歴は保持）

**対策**:

- SvelteKit の aliases 機能（`$lib/...`）で緩和
- IDE の自動補完で実用上の問題は小さい

❌ **一時的な学習コスト**

- 新しいディレクトリ構造への慣れが必要
- Port/Adapter パターンの理解が必要

**対策**:

- `docs/architecture/overview.md`にディレクトリマップを記載
- ADR-0006 で設計判断を明文化

❌ **既存コンポーネントの import path 更新**

- 約 100 ファイルの import path 変更が必要
- `git mv`で履歴保持、一括置換で対応

**対策**:

- 段階的な移行（User Story 単位）
- 各段階でテスト実行とビルド確認

### Neutral

⚖️ **ADR-0001 との整合性**

- ADR-0001（Clean Architecture 採用）の自然な発展
- 3 層 →4 層への進化は設計意図の明確化

⚖️ **ファイル数の変化**

- 削除: 旧配置のファイル（移動により）
- 追加: Port Interfaces, 型定義ファイル
- 実質的なファイル数は同等

## Alternatives Considered

### Alternative 1: 3 層構造を維持し、api/を infrastructure/配下に移動のみ

```
src/lib/
├── domain/
├── application/
├── infrastructure/api/      # apiディレクトリを移動するだけ
├── components/
└── stores/
```

**却下理由**:

- Presentation Layer が依然として暗黙的
- Stores 配置の不統一が解消されない
- レイヤー依存違反（型定義）が残存

### Alternative 2: feature-based ディレクトリ構造

```
src/lib/features/
├── game-state/
│   ├── domain/
│   ├── application/
│   └── presentation/
└── card-effects/
    ├── domain/
    ├── application/
    └── presentation/
```

**却下理由**:

- Clean Architecture の原則（レイヤー分離）との乖離
- 小規模プロジェクトでは過剰な複雑化
- クロスカッティングコンサーン（例: GameState）の配置が困難

### Alternative 3: Presentation 層の型エイリアス廃止

```typescript
// Presentation層コンポーネントで直接Application層の型をimport
import type { CardDisplayData } from "$lib/application/types/card";
```

**却下理由**:

- 既存コンポーネント（約 50 ファイル）の大規模変更が必要
- Presentation 層が Application 層の型構造に強く依存
- 後方互換性を保つ方が段階的移行に有利

## Implementation

### 実装ステップ（User Story 単位）

#### User Story 1: ドキュメント構造の明確化

- T014-T024: `docs/architecture/` 配下のドキュメント整備
- 削除済みファイル参照の除去
- 4 層構造の説明追加

#### User Story 2: Infrastructure Layer の責任明確化

- T025-T041: Port/Adapter パターン導入
- `ICardDataRepository`インターフェース定義
- `YGOProDeckCardRepository`実装
- Application 層からの Infrastructure 層直接 import 排除

#### User Story 3: Stores の配置統一

- T042-T054: Stores 移動と import path 更新
- Presentation/Application 層への適切な配置
- テスト更新とビルド確認

#### User Story 4: ディレクトリ構造の 4 層化

- T055-T071: 大規模ディレクトリ移動
- `components/`, `types/`, `utils/`の移動
- 全ファイルの import path 一括更新

#### User Story 5: レイヤー依存関係の是正

- T088-T111: 型定義の再配置と依存性注入
- Application/Infrastructure 層の型定義作成
- effectResolutionStore → cardSelectionStore の依存解消

#### Polish Phase

- T072-T087: 最終レビューと PR 作成
- Linter/Formatter 実行
- 全テスト・ビルド確認
- 静的解析でレイヤー依存違反 0 件確認

### 検証方法

#### 静的解析

```bash
# Application層 → Presentation層の依存チェック
grep -r 'from "$lib/presentation' skeleton-app/src/lib/application/
# 結果: 0件

# Infrastructure層 → Presentation層の依存チェック
grep -r 'from "$lib/presentation' skeleton-app/src/lib/infrastructure/
# 結果: 0件
```

#### テスト実行

```bash
# Unit Tests + Integration Tests
npm test
# 結果: 312/312 tests passing

# E2E Smoke Test
npx playwright test
# 結果: 1/1 test passing
```

#### ビルド確認

```bash
npm run build
# 結果: No errors
```

## Validation

### テスト戦略

#### 1. Unit Tests

- Domain Layer: 既存テスト（変更なし）
- Application Layer: Mock Repository 使用
- Infrastructure Layer: 独立した API Client Tests

#### 2. Integration Tests

- Port/Adapter 統合テスト
- Store 間連携テスト

#### 3. E2E Smoke Test

- 基本的なアプリケーション読み込み確認
- YGOPRODeck API モック使用
- 1 件のスモークテストに絞り込み（従来の 33 件から削減）

### パフォーマンス検証

- **ビルドサイズ**: 変更なし（ディレクトリ移動のみ）
- **実行速度**: 変更なし（ロジック変更なし）
- **テスト実行時間**: 312 tests < 10 秒（従来と同等）

## Future Considerations

### Shared Layer の拡張

現在は utils/constants のみだが、将来的に以下を追加可能:

- `shared/validators/` - 汎用バリデーション
- `shared/errors/` - カスタムエラークラス

### Feature-based Structure への移行検討

プロジェクト規模が大きくなった場合、feature-based 構造への部分移行を検討:

```
src/lib/features/
├── game-simulation/       # ゲームシミュレーション機能
│   ├── domain/
│   ├── application/
│   └── presentation/
└── deck-builder/          # デッキビルダー機能（将来）
    ├── domain/
    ├── application/
    └── presentation/
```

### E2E テスト戦略の見直し

- 現在: 1 件のスモークテストのみ
- 将来: 主要ユーザーフロー（2-3 件）への拡張を検討
- テストピラミッドの維持（Unit > Integration > E2E）

## Related Documents

- [ADR-0001: Clean Architecture の採用](./0001-adopt-clean-architecture.md)
- [ADR-0002: Immer.js による不変性保証](./0002-use-immer-for-immutability.md)
- [ADR-0003: Effect System 廃止と Command Pattern 統一](./0003-abolish-effect-system.md)
- [Architecture Overview](../architecture/overview.md)
- [Data Model Design](../architecture/data-model-design.md)
- [Testing Strategy](../architecture/testing-strategy.md)
- [spec/005-4-layer-clean-arch/spec.md](../../specs/005-4-layer-clean-arch/spec.md)
- [spec/005-4-layer-clean-arch/plan.md](../../specs/005-4-layer-clean-arch/plan.md)
- [spec/005-4-layer-clean-arch/tasks.md](../../specs/005-4-layer-clean-arch/tasks.md)

## References

- **Clean Architecture**: Robert C. Martin - Clean Architecture 書籍
- **Hexagonal Architecture**: Alistair Cockburn - Ports and Adapters
- **SOLID Principles**: Open/Closed Principle, Dependency Inversion Principle
- **Discussion**: spec/005 設計レビュー（2024-12-14 ~ 2024-12-15 セッション）
- **Git commits**:
  - 040984f: test: E2E テストを 1 件のスモークテストに絞り込み
  - 3cdd6a5: refactor: 4 層 Clean Architecture へのリファクタリング完了
- **PR**: #52（予定）
