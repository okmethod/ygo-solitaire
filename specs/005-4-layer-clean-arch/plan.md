# Implementation Plan: 4層Clean Architectureへのリファクタリングとドキュメント整備

**Branch**: `005-4-layer-clean-arch` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-4-layer-clean-arch/spec.md`

## Summary

現在の3層構造（Domain, Application, Presentation）から、Infrastructure Layerを明確に分離した4層Clean Architectureへリファクタリングする。同時に、アーキテクチャドキュメント（`overview.md`, `data-model-design.md`, `domain/overview.md`）を整備し、役割分担を明確化する。

**リファクタリングの目的**:
- ゲームロジックを外部リソース（YGOPRODeck API等）から完全に分離
- Port/Adapterパターンによるテスタビリティ向上
- Storesの配置基準明確化（ゲームロジック依存→Application、UIフロー→Presentation）
- ディレクトリ構造の4層化による保守性向上

**段階的移行戦略**:
- Phase 1: Infrastructure Layer新設（YGOPRODeck API移行）
- Phase 2: Stores配置統一（Application/Presentation振り分け）
- Phase 3: 全体ディレクトリ整理（4層構造完成）

各Phaseで全テスト（312テスト）がpassすることを確認する。

## Technical Context

**プロジェクト種別**: リファクタリング（既存コードベースの構造改善）

**言語/バージョン**:
- TypeScript 5.x（SvelteKit環境）
- Svelte 5（Runes: `$state`, `$derived`, `$effect`）

**主要依存関係**:
- **フレームワーク**: SvelteKit + Svelte 5
- **UIライブラリ**: Skeleton UI v3
- **CSS**: TailwindCSS v4
- **状態管理**: Svelte Stores + Immer.js
- **テスト**: Vitest（Unit/Integration）+ Playwright（E2E）
- **外部API**: YGOPRODeck API v7（カードデータ取得）

**現在のアーキテクチャ**: 3層構造
- Domain Layer: `src/lib/domain/` (models, rules, effects)
- Application Layer: `src/lib/application/` (commands, stores, GameFacade, CardEffectRegistry)
- Presentation Layer: `src/lib/components/`, `src/lib/stores/` (UI関連)

**リファクタリング対象**:
- Infrastructure Layer: 現在 `src/lib/api/` に存在するが、責任範囲が不明確
- Stores配置: `src/lib/stores/` と `src/lib/application/stores/` が混在
- ドキュメント: `docs/architecture/overview.md`, `docs/architecture/data-model-design.md`, `docs/domain/overview.md` に重複と不整合

**テスト**:
- 現在のテスト数: 312テスト（すべてpass）
- テストフレームワーク: Vitest（Unit/Integration）+ Playwright（E2E）
- カバレッジ目標: 現在のカバレッジを維持（リファクタリング後も100%pass）

**ターゲットプラットフォーム**: Webブラウザ（SPA）

**パフォーマンス目標**:
- テスト実行: 全312テストが2分以内（現状維持）
- ビルド時間: 現状と同等または改善
- ランタイム: リファクタリングによるパフォーマンス劣化なし

**制約**:
- リファクタリング中も全テストがpassすることを維持
- 既存機能の動作を変更しない（純粋なリファクタリング）
- Git履歴を保持（`git mv` 使用）

**スコープ**:
- 既存コードベース: `skeleton-app/src/lib/` 配下の53ファイル
- 既存ドキュメント: 3つのアーキテクチャドキュメント
- 対象外: 新機能追加、パフォーマンス最適化、UI/UX変更

## Constitution Check

*GATE: Must pass before Phase 0. Re-check after Phase 1 design.*

### Principle I: 目的と手段の分離

**✅ PASS**

**Why（目的）**: ゲームロジックを外部依存から分離し、テスタビリティと保守性を向上させる

**What/How（手段）**:
- Infrastructure Layerの新設
- Port/Adapterパターンの導入
- Storesのレイヤー別配置

目的が明確であり、手段は目的達成のための合理的な選択。

### Principle III: 最適解の選択と記録

**✅ PASS**

**設計判断の記録**: spec.mdの「Design Decisions」セクションで以下を記録済み
1. Infrastructure Layer移行優先度（YGOPRODeck APIのみ）
2. Stores配置基準（ゲームロジック依存 vs UIフロー）
3. ディレクトリ移行戦略（段階的移行）

すべての選択肢のトレードオフを評価し、根拠を記載している。

### Principle IV: 関心の分離（Separation of Concerns）

**✅ PASS**

このリファクタリングは、関心の分離を**強化**するもの：

**現状の問題**:
- Infrastructure Layerが不明確（`src/lib/api/` の責任範囲曖昧）
- Storesが混在（ゲームロジックとUI状態が同居）

**リファクタリング後**:
- **Domain Layer**: ゲームルール（完全にフレームワーク非依存）
- **Application Layer**: ユースケース・状態管理（ゲームロジック依存stores）
- **Infrastructure Layer**: 外部リソースアクセス（Port/Adapter経由）
- **Presentation Layer**: UI表示・操作トリガー（UIフロー専用stores）

依存の方向: Presentation → Application → Domain ← Infrastructure (Port経由)

### Principle V: 変更に対応できる設計

**✅ PASS**

このリファクタリングは、**変更しやすい構造**を実現：

- Port/Adapterパターンにより、YGOPRODeck API→別API切り替えが容易
- Storesのレイヤー分離により、ゲームロジック変更がUI影響を最小化
- ディレクトリ4層化により、「どこに何を配置すべきか」が明確

### Principle VI: 理解しやすさ最優先

**✅ PASS**

**ドキュメント整備**:
- 3つのドキュメントの役割分担を明確化
- 重複排除、相互参照リンクの活用
- コード例の最小化（構造理解に必要なもののみ）

**ディレクトリ構造**:
- トップレベルに4層が明示される
- ファイル配置の一貫性が向上

### Principle VII: シンプルに問題を解決する

**✅ PASS**

**過剰な抽象化を避ける**:
- Port/Adapterは最初YGOPRODeck APIのみ（将来的に必要になったら追加）
- Storesの配置基準はシンプル（ゲームロジック依存 vs UIフロー）
- 段階的移行（一度にすべて変更しない）

### Principle VIII: テスト可能性を意識する

**✅ PASS**

このリファクタリングは、**テスト可能性を向上**:

- Infrastructure Layerの分離により、外部API依存をモック可能
- Domain/Application LayerがInfrastructure Layerへの直接importを持たない
- 全テスト（312テスト）を維持し、リファクタリング後も100%pass

### Principle IX: 技術スタック（現時点の選択）

**✅ PASS**

既存の技術スタック（TypeScript + Svelte + TailwindCSS）を変更しない。リファクタリングは構造改善のみ。

### ⚠️ 特記事項: Complexity Tracking

リファクタリングによる一時的な複雑性増加なし。むしろ、関心の分離が明確化され、複雑性が**減少**する。

## Project Structure

### Documentation (this feature)

```text
specs/005-4-layer-clean-arch/
├── spec.md                  # Feature specification (/speckit.specify output)
├── plan.md                  # This file (/speckit.plan output)
├── checklists/
│   └── requirements.md      # Spec quality checklist (✅ All passed)
├── phase0-document-analysis.md  # Phase 0 output (document issues analysis)
├── phase1-architecture-design.md # Phase 1 output (4-layer architecture & Port/Adapter design)
└── tasks.md                 # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code - Current Structure (Before Refactoring)

```text
skeleton-app/src/lib/
├── domain/                    # Domain Layer
│   ├── models/                # GameState, Card, Phase, Zone
│   ├── rules/                 # VictoryRule, PhaseRule, SpellActivationRule
│   ├── effects/               # CardEffect (Strategy Pattern)
│   │   ├── CardEffect.ts
│   │   ├── EffectResolutionStep.ts
│   │   ├── bases/             # SpellEffect, NormalSpellEffect
│   │   └── cards/             # PotOfGreedEffect, GracefulCharityEffect
│   ├── commands/              # CommandResult
│   └── data/                  # cardDatabase.ts
│
├── application/               # Application Layer
│   ├── commands/              # GameCommand, DrawCardCommand, ActivateSpellCommand, etc.
│   ├── stores/                # gameStateStore, cardDisplayStore, derivedStores
│   ├── effects/               # CardEffectRegistry
│   └── GameFacade.ts
│
├── api/                       # ⚠️ Infrastructure Layer (責任範囲不明確)
│   ├── paths.ts
│   ├── checkHeartbeat.ts
│   └── ygoprodeck.ts          # YGOPRODeck APIクライアント
│
├── stores/                    # ⚠️ Presentation Layer (storesが混在)
│   ├── audio.ts
│   ├── theme.ts
│   ├── cardDetailDisplayStore.ts
│   ├── cardSelectionStore.svelte.ts
│   └── effectResolutionStore.ts  # ← ゲームロジック含む（Application Layerに移動すべき）
│
├── components/                # Presentation Layer
│   ├── organisms/
│   │   └── board/             # DuelField, HandArea, FieldArea
│   └── molecules/             # CardView
│
├── types/                     # Presentation Layer types
│   ├── card.ts                # CardDisplayData
│   ├── deck.ts
│   └── ygoprodeck.ts
│
├── utils/                     # Shared utilities (レイヤー横断)
│   ├── navigation.ts
│   ├── beep.ts
│   ├── toaster.ts
│   └── deckLoader.ts
│
├── constants/                 # Shared constants
│   ├── common.ts
│   ├── sizes.ts
│   └── cardTypes.ts
│
└── data/                      # Application Layer data
    └── sampleDeckRecipes.ts
```

**現状の問題点**:
1. Infrastructure Layer（`api/`）の責任範囲が不明確
2. Storesが `stores/` と `application/stores/` に混在
3. `effectResolutionStore.ts` はゲームロジックを含むがPresentation Layerに配置
4. トップレベルディレクトリが4層構造を反映していない

### Source Code - Target Structure (After Refactoring)

```text
skeleton-app/src/lib/
├── domain/                    # Domain Layer (不変)
│   ├── models/
│   ├── rules/
│   ├── effects/
│   │   ├── CardEffect.ts
│   │   ├── EffectResolutionStep.ts
│   │   ├── bases/
│   │   └── cards/
│   └── commands/              # CommandResult
│
├── application/               # Application Layer
│   ├── commands/
│   ├── stores/                # ✅ ゲーム状態管理stores（統合）
│   │   ├── gameStateStore.ts
│   │   ├── cardDisplayStore.ts
│   │   ├── derivedStores.ts
│   │   └── effectResolutionStore.ts  # ← stores/ から移動
│   ├── effects/               # CardEffectRegistry
│   ├── ports/                 # ✅ Port interfaces (新設)
│   │   └── ICardDataRepository.ts
│   ├── GameFacade.ts
│   └── data/
│       └── sampleDeckRecipes.ts
│
├── infrastructure/            # ✅ Infrastructure Layer (新設)
│   ├── api/
│   │   ├── paths.ts
│   │   ├── checkHeartbeat.ts
│   │   └── ygoprodeck.ts      # ← api/ から移動
│   └── adapters/              # ✅ Adapter implementations (新設)
│       └── YGOProDeckCardRepository.ts  # implements ICardDataRepository
│
├── presentation/              # ✅ Presentation Layer (新設)
│   ├── components/
│   │   ├── organisms/
│   │   └── molecules/
│   ├── stores/                # ✅ UI状態管理stores
│   │   ├── audio.ts
│   │   ├── theme.ts
│   │   ├── cardDetailDisplayStore.ts
│   │   └── cardSelectionStore.svelte.ts
│   └── types/                 # UI表示用型定義
│       ├── card.ts            # CardDisplayData
│       ├── deck.ts
│       └── ygoprodeck.ts
│
└── shared/                    # ✅ Shared utilities (新設)
    ├── utils/                 # レイヤー横断ユーティリティ
    │   ├── navigation.ts
    │   ├── beep.ts
    │   ├── toaster.ts
    │   └── deckLoader.ts
    └── constants/             # レイヤー横断定数
        ├── common.ts
        ├── sizes.ts
        └── cardTypes.ts
```

**リファクタリング後の改善点**:
1. ✅ Infrastructure Layerが明確に分離
2. ✅ Storesがレイヤー別に整理（Application vs Presentation）
3. ✅ Port/Adapterパターンによる依存性逆転
4. ✅ トップレベルディレクトリが4層構造を明示

**Structure Decision**:

既存の単一プロジェクト構造（`skeleton-app/src/lib/`）を維持し、配下のディレクトリを4層Clean Architectureに準拠した形に整理する。バックエンド（`fast-api-server/`）は本番環境では不要（開発時のカードデータAPI提供のみ）なため、フロントエンドの構造改善に焦点を当てる。

### Tests Structure - No Changes

```text
skeleton-app/tests/
├── unit/                      # Unit Tests (src/lib配下の構成に準拠)
│   ├── api/
│   ├── application/
│   ├── domain/
│   ├── stores/
│   └── utils/
│
├── integration/               # Integration Tests
│   ├── card-effects/
│   │   └── NormalSpells.test.ts
│   └── game-processing/
│       └── GameFacade.test.ts
│
└── e2e/                       # E2E Tests
    └── *.spec.ts
```

**テスト構造**: 既存のテストディレクトリ構造は維持。リファクタリング後、import pathの更新のみ実施。

## Complexity Tracking

> **GATE: Constitution Checkにより、違反なし。このセクションは空欄。**

すべての憲法原則に準拠しており、正当化が必要な違反は存在しない。

---

## Phase 0: Document Analysis

**Prerequisites**: Constitution Check passed

**Goal**: 既存ドキュメントの問題点を洗い出し、リファクタリングの方向性を明確化する

### 対象ドキュメント

1. **docs/architecture/overview.md** (301行)
   - 役割: アーキテクチャ全体像
   - 現状: 3層構造の説明、一部に4層構造の記述が混在

2. **docs/architecture/data-model-design.md** (1196行)
   - 役割: データモデル詳細設計
   - 現状: 3層データモデル、API統合、カード効果アーキテクチャを網羅

3. **docs/domain/overview.md** (190行)
   - 役割: ドメイン実装状況マッピング
   - 現状: 表形式で実装状況を可視化

### 分析タスク

1. **overview.md 分析**:
   - 4層構造への移行に伴う更新箇所の特定
   - 削除済みファイル参照（`cardDatabase.ts`等）の洗い出し
   - Presentation Layerの説明不足を特定
   - data-model-design.mdとの重複箇所を特定

2. **data-model-design.md 分析**:
   - ファイル構造記載の実際のコードとの不一致を特定
   - CardEffectRegistry.tsの位置誤記
   - Integration Testsパスの古い記載を特定

3. **domain/overview.md 分析**:
   - `cardDatabase.ts` 参照の削除が必要な箇所を特定
   - 4層構造への移行に伴う更新箇所

**Output**: `phase0-document-analysis.md` にドキュメント問題点一覧を記載

---

## Phase 1: Architecture Design

**Prerequisites**: Phase 0 complete

**Goal**: 4層Clean Architectureの詳細設計とPort/Adapterパターンの設計

### 1.1 Port Interface Design

**Application Layerに定義するPort（抽象インターフェース）**:

```typescript
// src/lib/application/ports/ICardDataRepository.ts

/**
 * Port: カードデータ取得の抽象インターフェース
 *
 * Application Layerが依存する契約を定義。
 * Infrastructure Layerが具象実装を提供。
 */
export interface ICardDataRepository {
  /**
   * カードIDリストから複数のカードデータを取得
   * @param cardIds カードIDの配列
   * @returns Promise<CardDisplayData[]> カード表示データの配列
   */
  getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]>;

  /**
   * 単一のカードデータを取得
   * @param cardId カードID
   * @returns Promise<CardDisplayData> カード表示データ
   */
  getCardById(cardId: number): Promise<CardDisplayData>;
}
```

**設計根拠**:
- Application LayerがInfrastructure Layerに直接依存しない（依存性逆転原則）
- テスト時にモック実装を注入可能
- 将来的に別のカードAPI（ローカルストレージ、FastAPI等）への切り替えが容易

### 1.2 Adapter Implementation Design

**Infrastructure Layerに実装するAdapter（具象クラス）**:

```typescript
// src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts

import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';
import type { CardDisplayData } from '$lib/presentation/types/card';
import { getCardsByIds as apiGetCardsByIds } from '$lib/infrastructure/api/ygoprodeck';

/**
 * Adapter: YGOPRODeck APIを使用したカードデータ取得実装
 *
 * ICardDataRepositoryインターフェースの具象実装。
 * YGOPRODeck API v7との統合を提供。
 */
export class YGOProDeckCardRepository implements ICardDataRepository {
  private cache: Map<number, CardDisplayData> = new Map();

  async getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]> {
    // キャッシュチェック
    const uncachedIds = cardIds.filter(id => !this.cache.has(id));

    if (uncachedIds.length > 0) {
      // API経由で取得
      const cards = await apiGetCardsByIds(uncachedIds);
      // キャッシュに保存
      cards.forEach(card => this.cache.set(card.id, card));
    }

    // キャッシュから返却
    return cardIds.map(id => this.cache.get(id)!);
  }

  async getCardById(cardId: number): Promise<CardDisplayData> {
    const cards = await this.getCardsByIds([cardId]);
    return cards[0];
  }
}
```

### 1.3 Dependency Injection Design

**Application Layerでの利用**:

```typescript
// src/lib/application/stores/cardDisplayStore.ts

import { writable } from 'svelte/store';
import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';
import { YGOProDeckCardRepository } from '$lib/infrastructure/adapters/YGOProDeckCardRepository';

// Dependency Injection: Production実装を注入
const cardRepository: ICardDataRepository = new YGOProDeckCardRepository();

export const cardDisplayStore = writable<Map<number, CardDisplayData>>(new Map());

export async function loadCardsForDisplay(cardIds: number[]) {
  const cards = await cardRepository.getCardsByIds(cardIds);
  cardDisplayStore.update(store => {
    cards.forEach(card => store.set(card.id, card));
    return store;
  });
}
```

**テスト時のモック実装**:

```typescript
// tests/unit/application/stores/cardDisplayStore.test.ts

import { vi } from 'vitest';
import type { ICardDataRepository } from '$lib/application/ports/ICardDataRepository';

// モック実装
class MockCardDataRepository implements ICardDataRepository {
  async getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]> {
    return cardIds.map(id => ({ id, name: `Mock Card ${id}`, /* ... */ }));
  }

  async getCardById(cardId: number): Promise<CardDisplayData> {
    return { id: cardId, name: `Mock Card ${cardId}`, /* ... */ };
  }
}

// テスト時にモックを注入
const cardRepository: ICardDataRepository = new MockCardDataRepository();
```

### 1.4 Stores配置基準の詳細設計

**判断基準**: 「そのstoreに依存しているものは何か？」

**Application Layer stores** (`src/lib/application/stores/`):
| Store | 判断根拠 |
|-------|---------|
| `gameStateStore.ts` | ゲーム状態管理（Domain Layerの`GameState`型に依存） |
| `cardDisplayStore.ts` | カードデータ管理（`ICardDataRepository`経由でゲームロジックに依存） |
| `derivedStores.ts` | ゲーム状態派生値（`gameStateStore`に依存） |
| `effectResolutionStore.ts` | 効果解決フロー（`EffectResolutionStep`型に依存、ゲームロジック含む） |

**Presentation Layer stores** (`src/lib/presentation/stores/`):
| Store | 判断根拠 |
|-------|---------|
| `cardSelectionStore.svelte.ts` | カード選択UI状態（Svelte Runes使用、UIフローのみ） |
| `theme.ts` | テーマ切り替え（UI設定） |
| `audio.ts` | 音声設定（UI設定） |
| `cardDetailDisplayStore.ts` | カード詳細表示UI（プレゼンテーション責務） |

### 1.5 ディレクトリ移行計画

**Phase 1: Infrastructure Layer新設**
```
移動対象:
  src/lib/api/ygoprodeck.ts → src/lib/infrastructure/api/ygoprodeck.ts
  src/lib/api/paths.ts → src/lib/infrastructure/api/paths.ts
  src/lib/api/checkHeartbeat.ts → src/lib/infrastructure/api/checkHeartbeat.ts

新規作成:
  src/lib/application/ports/ICardDataRepository.ts
  src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts

影響範囲:
  - application/stores/cardDisplayStore.ts (import path更新)
  - テスト: tests/unit/api/ → tests/unit/infrastructure/api/
```

**Phase 2: Stores配置統一**
```
移動対象（Application Layer）:
  src/lib/stores/effectResolutionStore.ts → src/lib/application/stores/effectResolutionStore.ts

移動対象（Presentation Layer）:
  src/lib/stores/audio.ts → src/lib/presentation/stores/audio.ts
  src/lib/stores/theme.ts → src/lib/presentation/stores/theme.ts
  src/lib/stores/cardDetailDisplayStore.ts → src/lib/presentation/stores/cardDetailDisplayStore.ts
  src/lib/stores/cardSelectionStore.svelte.ts → src/lib/presentation/stores/cardSelectionStore.svelte.ts

影響範囲:
  - 全コンポーネントのimport path更新
  - テスト: tests/unit/stores/ → tests/unit/application/stores/ + tests/unit/presentation/stores/
```

**Phase 3: 全体ディレクトリ整理**
```
移動対象:
  src/lib/components/ → src/lib/presentation/components/
  src/lib/types/ → src/lib/presentation/types/
  src/lib/utils/ → src/lib/shared/utils/
  src/lib/constants/ → src/lib/shared/constants/
  src/lib/data/ → src/lib/application/data/

影響範囲:
  - 全ファイルのimport path更新
  - SvelteKit alias設定（$lib/...）の動作確認
```

**Output**: `phase1-architecture-design.md` に詳細設計を記載

---

## Phase 2: Task Generation

**Prerequisites**: Phase 1 complete

**Note**: このPhaseは `/speckit.tasks` コマンドで実行される。`/speckit.plan` では実施しない。

**Output**: `tasks.md` (別コマンドで生成)

---

## Risks & Mitigation

### Risk 1: Import Path一斉変更によるビルドエラー

**Probability**: Medium
**Impact**: High（一時的にアプリケーション全体が壊れる）

**Mitigation**:
- 各Phaseで段階的に移行（一度にすべて変更しない）
- 各ファイル移動後、TypeScriptコンパイラエラーを即座に確認
- 各Phaseの完了時に全テスト（312テスト）を実行

### Risk 2: Stores移動による状態管理の破損

**Probability**: Low
**Impact**: High（ゲーム状態が正しく管理されなくなる）

**Mitigation**:
- Stores移動はPhase 2として独立実施
- 移動後、Integration Testsで状態管理の動作を確認
- E2E Testsで実際のユーザーフローを検証

### Risk 3: Port/Adapter導入によるパフォーマンス劣化

**Probability**: Low
**Impact**: Medium（API呼び出しのオーバーヘッド）

**Mitigation**:
- Adapter内部でキャッシング実装（既存の`cardDisplayStore`と同等）
- パフォーマンステスト実施（リファクタリング前後で比較）

### Risk 4: ドキュメントとコードの乖離

**Probability**: Medium
**Impact**: Low（開発効率低下）

**Mitigation**:
- リファクタリング完了後、ドキュメントレビューを必ず実施
- 各Phaseの完了時にドキュメント更新

---

## Success Criteria

### SC-001: ドキュメント理解性
**Target**: 新規参加者が3つのドキュメントの役割分担を理解し、必要な情報を5分以内に見つけられる

**Validation Method**: ユーザーテスト（90%以上が成功）

### SC-002: Infrastructure Layer分離
**Target**: Domain/Application Layer内のファイルがInfrastructure Layerへの直接importを持たない

**Validation Method**: 静的解析（TypeScript import graph分析）

**Expected Result**: 0件

### SC-003: テスト維持
**Target**: 全テスト（Unit/Integration/E2E）が、リファクタリング前後で100%pass

**Validation Method**: CI/CDパイプライン実行

**Expected Result**: 312テストすべてpass

### SC-004: ディレクトリ構造明確化
**Target**: `src/lib/` 配下のディレクトリ構造が4層に明確に分かれている

**Validation Method**: コードレビュー

**Expected Result**: 全員が合意

### SC-005: ドキュメント・コード一致
**Target**: ドキュメントとコードの乖離が0件

**Validation Method**: リファクタリング完了後のレビュー

**Expected Result**: 乖離0件

### SC-006: Import Path整合性
**Target**: ファイル移動によるimport path破損が0件

**Validation Method**: TypeScriptコンパイラエラー確認

**Expected Result**: コンパイラエラー0件、全テストpass

---

## Timeline & Phases

### Phase 0: Document Analysis (0.5日)
- Task: 既存ドキュメント3つの問題点洗い出し
- Output: `phase0-document-analysis.md`
- Deliverables: 問題点一覧、修正方針

### Phase 1: Architecture Design (1日)
- Task: Port/Adapter設計、Stores配置設計、ディレクトリ移行計画
- Output: `phase1-architecture-design.md`
- Deliverables: インターフェース定義、移行計画、影響範囲分析

### Phase 2: Task Generation (1時間) - `/speckit.tasks`コマンドで実施
- Task: 実装タスクの分解と依存関係整理
- Output: `tasks.md`
- Deliverables: 実装タスク一覧、優先順位付き

### Phase 3: Implementation (5-7日) - `/speckit.implement`コマンドで実施
- Subphase 1: Infrastructure Layer新設（2日）
- Subphase 2: Stores配置統一（2日）
- Subphase 3: 全体ディレクトリ整理（1-2日）
- Subphase 4: ドキュメント整備（1日）

**Total Estimate**: 8-10日（リファクタリングのみ、テスト含む）

---

## Next Steps

1. ✅ `/speckit.plan` 完了（このファイル）
2. 🔄 Phase 0: `phase0-document-analysis.md` 生成
3. 🔄 Phase 1: `phase1-architecture-design.md` 生成
4. ⏳ `/speckit.tasks` 実行（タスク分解）
5. ⏳ `/speckit.implement` 実行（実装開始）

**Current Status**: Phase 0 & Phase 1 の詳細ドキュメント生成を開始します。
