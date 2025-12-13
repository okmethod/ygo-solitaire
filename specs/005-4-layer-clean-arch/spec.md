# Feature Specification: 4層Clean Architectureへのリファクタリングとドキュメント整備

**Feature Branch**: `005-4-layer-clean-arch`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "4層構造 かつドメイン中心の Clean Architecture で、ドキュメントを見直し、コードをリファクタリングしたい"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ドキュメント構造の明確化 (Priority: P1)

開発者が新規参加または既存機能を拡張する際、どのドキュメントを読めば何が理解できるかが明確になっている状態を実現する。

**Why this priority**: ドキュメント整備は実装作業の前提条件であり、アーキテクチャの理解を促進する最も重要な要素。コードリファクタリングの前に、目指すべきアーキテクチャを明文化する必要がある。

**Independent Test**: 新規参加者が「データモデルの実装方法を知りたい」「カード効果システムの設計を理解したい」といった質問に対し、適切なドキュメントを5分以内に見つけられることで検証可能。

**Acceptance Scenarios**:

1. **Given** 開発者が「アーキテクチャ全体像」を理解したい、**When** `docs/architecture/overview.md` を開く、**Then** 4層構造の概要・責任境界・データフローがインターフェース定義レベルのコード例とともに記載されている
2. **Given** 開発者が「データモデルの実装方法」を知りたい、**When** `docs/architecture/data-model-design.md` を開く、**Then** 3層データモデル・API統合・カード効果アーキテクチャの詳細が具体的なコード例とともに記載されている
3. **Given** 開発者が「実装済み機能の一覧」を確認したい、**When** `docs/domain/overview.md` を開く、**Then** ドメイン知識→コード対応表と実装状況マッピングが表形式で記載されている
4. **Given** 3つのドキュメントを読んだ、**When** 内容を比較する、**Then** 重複記載がなく、各ドキュメントの役割が明確に区別されている

---

### User Story 2 - Infrastructure Layerの責任明確化 (Priority: P2)

外部リソースアクセス（API、ストレージ、外部サービス）がInfrastructure Layerに集約され、Domain/Application Layerが外部依存から完全に分離されている状態を実現する。

**Why this priority**: Clean Architectureの中核原則である「外部依存の逆転」を実現するための必須要件。テスタビリティと保守性を大幅に向上させる。

**Independent Test**: Domain/Application Layer内のすべてのファイルが、Infrastructure Layer（`src/lib/infrastructure/`）への直接importを持たず、抽象インターフェース経由でのみ外部リソースにアクセスしていることを静的解析で検証可能。

**Acceptance Scenarios**:

1. **Given** YGOPRODeck APIクライアントが存在する、**When** ディレクトリ構造を確認する、**Then** `src/lib/infrastructure/api/ygoprodeck.ts` に配置されている
2. **Given** Application Layerがカードデータを取得する、**When** コードを確認する、**Then** `src/lib/application/ports/ICardDataRepository.ts` などの抽象インターフェース経由でアクセスしている
3. **Given** Infrastructure Layerの実装を変更する、**When** Domain/Application Layerのテストを実行する、**Then** モックを使用しているためテストが影響を受けない

---

### User Story 3 - Storesの配置統一 (Priority: P2)

現在混在している `src/lib/stores/` と `src/lib/application/stores/` のstoreファイルを、責任に応じて適切なレイヤーに配置し直す。

**Why this priority**: レイヤー境界の曖昧さを解消し、アーキテクチャの一貫性を保つ。開発者が「どこに何を配置すべきか」を迷わなくなる。

**Independent Test**: 全storeファイルが正しいレイヤーに配置され、import pathが更新され、全テストがpassすることで検証可能。

**Acceptance Scenarios**:

1. **Given** ゲーム状態管理のstoreが存在する、**When** ディレクトリを確認する、**Then** `src/lib/application/stores/gameStateStore.ts` に配置されている
2. **Given** UI状態管理のstoreが存在する、**When** ディレクトリを確認する、**Then** `src/lib/presentation/stores/` に配置されている（例: `cardSelectionStore`、`effectResolutionStore`）
3. **Given** すべてのstoreを移動した、**When** アプリケーションをビルドする、**Then** import pathエラーが発生しない

---

### User Story 4 - ディレクトリ構造の4層化 (Priority: P3)

`src/lib/` 配下のディレクトリ構造を4層Clean Architectureに準拠した形に整理する。

**Why this priority**: ファイル配置の一貫性を保ち、新規開発者が直感的にコードを見つけられるようにする。P3としたのは、ドキュメント整備とInfrastructure Layer分離が完了してから着手すべきため。

**Independent Test**: `src/lib/` 配下のディレクトリが `domain/`, `application/`, `infrastructure/`, `presentation/` の4つに明確に分かれており、各ディレクトリが対応するレイヤーのコードのみを含んでいることを確認可能。

**Acceptance Scenarios**:

1. **Given** 現在の `src/lib/` ディレクトリを確認する、**When** ディレクトリ一覧を見る、**Then** トップレベルに `domain/`, `application/`, `infrastructure/`, `presentation/` の4ディレクトリが存在する
2. **Given** ユーティリティファイル（`utils/`）が存在する、**When** 配置を確認する、**Then** レイヤー横断的なものは `shared/utils/` に、特定レイヤー専用のものは各レイヤー内に配置されている
3. **Given** 型定義ファイル（`types/`）が存在する、**When** 配置を確認する、**Then** Domain型は `domain/models/`、Presentation型は `presentation/types/` に配置されている

---

### Edge Cases

- **ドキュメント更新時の整合性**: 3つのドキュメント（`overview.md`, `data-model-design.md`, `domain/overview.md`）を更新する際、相互に矛盾する記載が発生しないか？ → 各ドキュメントの責任範囲を明確に定義し、相互参照を活用する
- **Infrastructure Layer導入時の既存コード影響**: 既存の直接API呼び出しをすべてPort/Adapter経由に変更する際、テストが一時的に壊れないか？ → 段階的移行戦略を採用し、各ステップでテストを維持する
- **Stores移動時のimport path破損**: 大量のimport文を書き換える際、見落としが発生しないか？ → 自動検索置換ツールとTypeScriptコンパイラエラーで検出する
- **ドキュメントとコードの乖離**: リファクタリング後、ドキュメントが実際のコードと一致しなくなる可能性 → リファクタリング完了後に必ずドキュメントレビューを実施する

## Requirements *(mandatory)*

### Functional Requirements

#### ドキュメント整備

- **FR-001**: `docs/architecture/overview.md` は、4層Clean Architectureの全体像を簡潔に（300-400行程度）記載し、詳細ドキュメントへのリンクを含むこと
- **FR-002**: `docs/architecture/data-model-design.md` は、3層データモデル・YGOPRODeck API統合・カード効果アーキテクチャの詳細を記載すること（1000-1500行程度）
- **FR-003**: `docs/domain/overview.md` は、実装状況マッピングを表形式で記載し、コード例を含まないこと
- **FR-004**: 3つのドキュメント間で重複する内容を排除し、相互参照リンクで補完すること
- **FR-005**: `docs/architecture/overview.md` 内の削除済みファイル参照（`cardDatabase.ts`等）を削除すること
- **FR-006**: `docs/architecture/data-model-design.md` 内のファイル構造記載（CardEffectRegistry.tsの位置等）を実際のコードと一致させること
- **FR-007**: コード例は、インターフェース定義やデータフロー図など「構造を理解するため」のものに限定し、具体的な実装例は最小限にすること

#### Infrastructure Layer分離

- **FR-008**: `src/lib/infrastructure/` ディレクトリを作成し、外部リソースアクセスコードをすべて移動すること
- **FR-009**: YGOPRODeck APIクライアント（`api/ygoprodeck.ts`）を `infrastructure/api/ygoprodeck.ts` に移動すること
- **FR-010**: Application LayerにPort（抽象インターフェース）を定義すること（例: `ICardDataRepository`）
- **FR-011**: Infrastructure LayerでPortを実装するAdapter（具象クラス）を作成すること（例: `YGOProDeckCardRepository implements ICardDataRepository`）
- **FR-012**: Domain/Application Layer内のコードがInfrastructure Layerへの直接importを持たないこと

#### Stores配置統一

- **FR-013**: ゲーム状態管理に関するstoreは `src/lib/application/stores/` に配置すること（例: `gameStateStore`, `cardDisplayStore`, `derivedStores`）
- **FR-014**: UI状態管理に関するstoreは `src/lib/presentation/stores/` に配置すること（例: `cardSelectionStore`, `effectResolutionStore`, `theme`, `audio`）
- **FR-015**: すべてのstoreの移動後、import pathを更新し、全テストがpassすること

#### ディレクトリ構造4層化

- **FR-016**: `src/lib/` 配下のトップレベルディレクトリを `domain/`, `application/`, `infrastructure/`, `presentation/` の4つに整理すること
- **FR-017**: レイヤー横断的なユーティリティは `src/lib/shared/utils/` に配置すること
- **FR-018**: Domain層の型は `domain/models/`、Presentation層の型は `presentation/types/` に配置すること
- **FR-019**: ファイル移動後、全テスト（Unit/Integration/E2E）がpassすること

### Key Entities

- **ドキュメント構造**: 3つのドキュメント（`overview.md`, `data-model-design.md`, `domain/overview.md`）の役割分担と相互関係
- **Port（抽象インターフェース）**: Application Layerが定義する外部リソースアクセスの契約（例: `ICardDataRepository`, `ICardImageProvider`）
- **Adapter（具象実装）**: Infrastructure LayerがPortを実装する具体的なクラス（例: `YGOProDeckCardRepository`）
- **レイヤー**: Domain, Application, Infrastructure, Presentation の4層とその責任境界

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 新規参加者が、3つのドキュメントの役割分担を理解し、必要な情報を5分以内に見つけられる（ユーザーテストで90%以上が成功）
- **SC-002**: Domain/Application Layer内のファイルがInfrastructure Layerへの直接importを持たない（静的解析で0件）
- **SC-003**: 全テスト（Unit/Integration/E2E）が、リファクタリング前後で100%passする（現在312テスト）
- **SC-004**: `src/lib/` 配下のディレクトリ構造が4層に明確に分かれており、開発者が「どこに何を配置すべきか」を迷わない（レビューで全員が合意）
- **SC-005**: ドキュメントとコードの乖離が0件（リファクタリング完了後のレビューで確認）
- **SC-006**: ファイル移動によるimport path破損が0件（TypeScriptコンパイラエラー0件、全テストpass）

## Scope & Boundaries *(mandatory)*

### In Scope

- `docs/architecture/overview.md`, `docs/architecture/data-model-design.md`, `docs/domain/overview.md` の3ドキュメント整備
- Infrastructure Layerの新設と外部リソースアクセスコードの移行
- Port/Adapterパターンの導入（YGOPRODeck API統合を最初の対象とする）
- Storesの配置統一（`application/stores/` と `presentation/stores/` への振り分け）
- `src/lib/` 配下のディレクトリ構造の4層化
- 全テストの維持（リファクタリング中も全テストがpassする状態を保つ）

### Out of Scope

- 新機能の追加（あくまでリファクタリングとドキュメント整備）
- テストカバレッジの向上（現在のカバレッジを維持することが目標）
- パフォーマンス最適化
- UI/UXの変更
- 他のドキュメント（`yugioh-rules.md`, `testing-strategy.md`等）の改訂（必要に応じて別タスクとする）

## Assumptions *(mandatory)*

- 現在のアーキテクチャは3層構造（Domain, Application, Presentation）として実装されており、Infrastructure Layerの責任が不明確である
- YGOPRODeck APIが現時点で唯一の外部リソースであり、Port/Adapterパターンの最初の適用対象として適切である
- 全テスト（312テスト）が現在passしており、リファクタリング後もpassすることが品質基準となる
- ドキュメント整備は日本語で行う（コードコメントも日本語）
- 段階的移行戦略を採用し、各ステップでテストを維持することで、リスクを最小化できる
- Infrastructure Layerの導入により、将来的に別のカードAPIやローカルストレージへの切り替えが容易になる
- Stores配置判断基準は「そのstoreに依存しているものは何か？」で行う。ゲームロジックに依存する場合はApplication Layer、UIフローのみに依存する場合はPresentation Layerに配置

## Dependencies *(mandatory)*

- 既存のアーキテクチャドキュメント（`docs/architecture/overview.md`, `docs/architecture/data-model-design.md`, `docs/domain/overview.md`）
- 既存のコードベース（`skeleton-app/src/lib/`）
- TypeScriptコンパイラ（型チェックとimport path検証）
- テストスイート（Vitest + Playwright、現在312テスト）
- Git履歴（`git mv` によるファイル移動でhistoryを保持）

## Design Decisions *(resolved clarifications)*

### Decision 1: Infrastructure Layerへの移行優先度

**Decision**: YGOPRODeck APIのみを移行対象とする（Option A）

**Rationale**:
- 現状、他の外部アクセス要件は存在しない
- 範囲を限定し、早期にPort/Adapterパターンの効果を検証できる
- 将来的に外部リソースが必要になった際、Infrastructure Layerに追加できる状態を確保する
- 他の外部リソースは別タスクで段階的に移行する

**Implications**:
- Infrastructure Layer初回実装は `src/lib/infrastructure/api/ygoprodeck.ts` と対応するPort/Adapterのみ
- 将来的なIndexedDBやFastAPIアクセスは別タスクとして管理

---

### Decision 2: Stores配置基準の詳細

**Decision**: ゲームロジックに直接関わるものはApplication Layer、UIフローのみに関わるものはPresentation Layer（Option A）

**Rationale**:
- そのstoreに依存しているものが何か？で判断する
- `effectResolutionStore` はゲームロジック（効果解決）を含むため、Application Layerに配置
- レイヤー分離の原則に従い、ゲームロジックとUI状態を明確に区別

**Implications**:
- **Application Layer stores** (`src/lib/application/stores/`):
  - `gameStateStore`: ゲーム状態管理
  - `cardDisplayStore`: カード表示データ管理
  - `derivedStores`: ゲーム状態派生値
  - `effectResolutionStore`: 効果解決フロー（ゲームロジック含む）
- **Presentation Layer stores** (`src/lib/presentation/stores/`):
  - `cardSelectionStore`: カード選択UI状態
  - `theme`: テーマ切り替え
  - `audio`: 音声設定
  - `cardDetailDisplayStore`: カード詳細表示UI

---

### Decision 3: ディレクトリ移行戦略

**Decision**: レイヤーごとに段階的に移行（Infrastructure → Stores → 全体整理）（Option A）

**Rationale**:
- 各ステップでテストを100%維持することで、リスクを最小化
- 段階的な移行により、問題発生時の影響範囲を限定できる
- 作業が長期化するが、品質を優先する

**Implications**:
- **Phase 1**: Infrastructure Layer新設（YGOPRODeck API移行）
- **Phase 2**: Stores配置統一（Application/Presentation振り分け）
- **Phase 3**: 全体ディレクトリ整理（4層構造完成）
- 各Phaseの完了時に全テスト（312テスト）がpassすることを確認
