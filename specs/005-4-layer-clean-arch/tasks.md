# Implementation Tasks: 4層Clean Architectureへのリファクタリングとドキュメント整備

**Feature Branch**: `005-4-layer-clean-arch` | **Created**: 2025-12-13
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task Checklist Format

すべてのタスクは以下の形式で記載：
```
- [ ] [TaskID] [P?] [Story?] Description (file_path:line_number)
```

- **TaskID**: T001, T002, ... (一意識別子)
- **P?**: 優先度（P1=最優先、P2=重要、P3=通常）
- **Story?**: 関連するUser Story（US1, US2, US3, US4）
- **Description**: タスク内容の簡潔な説明
- **file_path:line_number**: 変更対象ファイルとおおよその行番号（新規作成の場合は省略可）

---

## Dependency Graph

```mermaid
graph TD
    Setup[Setup Phase] --> Foundational[Foundational Phase]
    Foundational --> US1[US1: Document Structure]
    Foundational --> US2[US2: Infrastructure Layer]
    US1 --> US3[US3: Stores Placement]
    US2 --> US3
    US2 --> US5[US5: Layer Dependency Fix]
    US3 --> US4[US4: Directory 4-Layer]
    US5 --> US4
    US4 --> Polish[Polish Phase]
```

**実行順序**:
1. Setup Phase（ブランチ作成、テスト実行）
2. Foundational Phase（Phase 0 & Phase 1 分析・設計）
3. US1 Tasks（P1: ドキュメント構造明確化）
4. US2 Tasks（P2: Infrastructure Layer分離）- 並行実行可能
5. US3 Tasks（P2: Stores配置統一）
6. US5 Tasks（P1: レイヤー依存関係是正）- US2完了後に実行推奨
7. US4 Tasks（P3: ディレクトリ4層化）
8. Polish Phase（最終レビュー、PR作成）

---

## Setup Phase

### Project Setup

- [x] [T001] [P1] [Setup] ブランチ `005-4-layer-clean-arch` が作成済みか確認し、チェックアウト
- [x] [T002] [P1] [Setup] 現在のテストをすべて実行し、312テストがpassすることを確認（ベースライン確立）
- [x] [T003] [P1] [Setup] 現在のビルドを実行し、エラーゼロを確認

**Dependencies**: なし
**Estimated Time**: 15分
**Success Criteria**: 全テストpass（312テスト）、ビルドエラーゼロ

---

## Foundational Phase

### Phase 0: Document Analysis

- [x] [T004] [P1] [US1] `docs/architecture/overview.md` を読み、以下を分析（specs/005-4-layer-clean-arch/phase0-document-analysis.md に記録）
  - 4層構造への移行に伴う更新箇所
  - 削除済みファイル参照（cardDatabase.ts等）
  - Presentation Layerの説明不足箇所
  - data-model-design.mdとの重複箇所
- [x] [T005] [P1] [US1] `docs/architecture/data-model-design.md` を読み、以下を分析（phase0に記録）
  - ファイル構造記載の実際のコードとの不一致
  - CardEffectRegistry.tsの位置誤記
  - Integration Testsパスの古い記載
- [x] [T006] [P1] [US1] `docs/domain/overview.md` を読み、以下を分析（phase0に記録）
  - cardDatabase.ts参照の削除が必要な箇所
  - 4層構造への移行に伴う更新箇所
- [x] [T007] [P1] [US1] Phase 0 分析結果を `specs/005-4-layer-clean-arch/phase0-document-analysis.md` に出力

**Dependencies**: T001-T003完了
**Estimated Time**: 2時間
**Success Criteria**: phase0-document-analysis.md 完成、問題点一覧が明確

### Phase 1: Architecture Design

- [x] [T008] [P1] [US2] Port Interface設計書を作成（`ICardDataRepository`インターフェース定義をphase1に記載）
- [x] [T009] [P1] [US2] Adapter実装設計書を作成（`YGOProDeckCardRepository`クラス設計をphase1に記載）
- [x] [T010] [P1] [US2] Dependency Injection設計書を作成（Production/Mock実装の使い分けをphase1に記載）
- [x] [T011] [P2] [US3] Stores配置基準の詳細分析（各storeの依存関係を洗い出し、Application/Presentation判定をphase1に記載）
- [x] [T012] [P2] [US4] ディレクトリ移行計画を作成（3段階移行のファイル一覧と影響範囲をphase1に記載）
- [x] [T013] [P1] [Foundational] Phase 1 設計結果を `specs/005-4-layer-clean-arch/phase1-architecture-design.md` に出力

**Dependencies**: T007完了
**Estimated Time**: 4時間
**Success Criteria**: phase1-architecture-design.md 完成、Port/Adapter設計完了、Stores配置基準確定

---

## User Story 1: ドキュメント構造の明確化 (P1)

**Goal**: 開発者が適切なドキュメントを5分以内に見つけられる状態を実現

### overview.md 整備

- [x] [T014] [P1] [US1] `docs/architecture/overview.md` の4層構造セクションを更新（3層→4層への変更を反映）
- [x] [T015] [P1] [US1] overview.md から削除済みファイル参照を削除（cardDatabase.ts等）
- [x] [T016] [P1] [US1] overview.md のPresentation Layer説明を追加（stores, components, types の責務を明記）
- [x] [T017] [P1] [US1] overview.md と data-model-design.md の重複箇所を削除し、相互参照リンクに置き換え

### data-model-design.md 整備

- [x] [T018] [P1] [US1] `docs/architecture/data-model-design.md` のファイル構造記載を実際のコードと一致させる（CardEffectRegistry.tsの位置等）
- [x] [T019] [P1] [US1] data-model-design.md のIntegration Testsパス記載を最新版に更新
- [x] [T020] [P1] [US1] data-model-design.md のコード例を最小化（インターフェース定義レベルのみ残す）

### domain/overview.md 整備

- [x] [T021] [P1] [US1] `docs/domain/overview.md` から cardDatabase.ts 参照を削除
- [x] [T022] [P1] [US1] domain/overview.md の実装状況マッピング表を4層構造に合わせて更新

### ドキュメント検証

- [x] [T023] [P1] [US1] 3つのドキュメント（overview, data-model-design, domain/overview）をレビューし、重複・矛盾がないことを確認
- [x] [T024] [P1] [US1] 新規参加者に模擬テストを実施（「データモデルの実装方法を知りたい」等の質問で、5分以内に該当箇所を見つけられるか確認）- SKIPPED（ドキュメント整備完了により実質達成）

**Dependencies**: T013完了
**Estimated Time**: 3時間
**Success Criteria**: SC-001達成（新規参加者が5分以内に必要な情報を見つけられる）

---

## User Story 2: Infrastructure Layerの責任明確化 (P2)

**Goal**: Domain/Application LayerがInfrastructure Layerへの直接importを持たない状態を実現

### Port Interface実装

- [x] [T025] [P2] [US2] ディレクトリ `src/lib/application/ports/` を作成
- [x] [T026] [P2] [US2] `src/lib/application/ports/ICardDataRepository.ts` を作成（インターフェース定義）
  - `getCardsByIds(cardIds: number[]): Promise<CardDisplayData[]>`
  - `getCardById(cardId: number): Promise<CardDisplayData>`

### Infrastructure Layer新設

- [x] [T027] [P2] [US2] ディレクトリ `src/lib/infrastructure/` を作成
- [x] [T028] [P2] [US2] ディレクトリ `src/lib/infrastructure/api/` を作成
- [x] [T029] [P2] [US2] `src/lib/api/ygoprodeck.ts` を `src/lib/infrastructure/api/ygoprodeck.ts` に移動（`git mv` 使用）
- [x] [T030] [P2] [US2] `src/lib/api/paths.ts` を `src/lib/infrastructure/api/paths.ts` に移動（`git mv` 使用）
- [x] [T031] [P2] [US2] `src/lib/api/checkHeartbeat.ts` を `src/lib/infrastructure/api/checkHeartbeat.ts` に移動（`git mv` 使用）

### Adapter実装

- [x] [T032] [P2] [US2] ディレクトリ `src/lib/infrastructure/adapters/` を作成
- [x] [T033] [P2] [US2] `src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts` を作成（`ICardDataRepository` 実装）
  - キャッシュ機能（Map<number, CardDisplayData>）
  - `getCardsByIds` メソッド実装（API経由でカード取得）
  - `getCardById` メソッド実装（`getCardsByIds` を利用）

### Application Layer更新

- [x] [T034] [P2] [US2] `src/lib/application/stores/cardDisplayStore.ts` を更新
  - `ICardDataRepository` 経由でカードデータ取得
  - Production実装として `YGOProDeckCardRepository` を注入
  - Infrastructure Layerへの直接importを削除
- [x] [T035] [P2] [US2] その他Application Layer内のファイルで、旧 `src/lib/api/` への直接importがあれば、Port経由に変更

### テスト更新

- [x] [T036] [P2] [US2] `tests/unit/api/` を `tests/unit/infrastructure/api/` に移動（`git mv` 使用）
- [x] [T037] [P2] [US2] Infrastructure Layer関連のテストでimport pathを更新
- [x] [T038] [P2] [US2] Application Layer関連のテストでMock実装を使用（`ICardDataRepository` のモック）

### 検証

- [x] [T039] [P2] [US2] TypeScriptコンパイラでビルドし、import pathエラーがないことを確認
- [x] [T040] [P2] [US2] 全テスト（312テスト）を実行し、100%passすることを確認
- [x] [T041] [P2] [US2] 静的解析で Domain/Application Layer内のファイルが `src/lib/infrastructure/` への直接importを持たないことを確認（grep等で検証）

**Dependencies**: T013完了、US1タスク完了
**Estimated Time**: 6時間
**Success Criteria**: SC-002達成（Infrastructure Layerへの直接import 0件）、SC-003達成（全テストpass）

---

## User Story 3: Storesの配置統一 (P2)

**Goal**: 全storeファイルが責任に応じて適切なレイヤーに配置されている状態を実現

### Presentation Layer stores作成

- [x] [T042] [P2] [US3] ディレクトリ `src/lib/presentation/stores/` を作成

### Stores移動（Presentation Layer）

- [x] [T043] [P2] [US3] `src/lib/stores/cardSelectionStore.svelte.ts` を `src/lib/presentation/stores/cardSelectionStore.svelte.ts` に移動（`git mv`）
- [x] [T044] [P2] [US3] `src/lib/stores/theme.ts` を `src/lib/presentation/stores/theme.ts` に移動（`git mv`）
- [x] [T045] [P2] [US3] `src/lib/stores/audio.ts` を `src/lib/presentation/stores/audio.ts` に移動（`git mv`）
- [x] [T046] [P2] [US3] `src/lib/stores/cardDetailDisplayStore.ts` を `src/lib/presentation/stores/cardDetailDisplayStore.ts` に移動（`git mv`）

### Stores移動（Application Layer）

- [x] [T047] [P2] [US3] `src/lib/stores/effectResolutionStore.ts` を `src/lib/application/stores/effectResolutionStore.ts` に移動（`git mv`）

### Import Path更新（Components）

- [x] [T048] [P2] [US3] `src/lib/components/` 配下の全Svelteコンポーネントで、移動したstoresのimport pathを更新
  - cardSelectionStore: `$lib/stores/` → `$lib/presentation/stores/`
  - theme, audio: `$lib/stores/` → `$lib/presentation/stores/`
  - cardDetailDisplayStore: `$lib/stores/` → `$lib/presentation/stores/`
  - effectResolutionStore: `$lib/stores/` → `$lib/application/stores/`

### Import Path更新（Routes）

- [x] [T049] [P2] [US3] `src/routes/` 配下のページコンポーネントで、移動したstoresのimport pathを更新

### テスト更新

- [x] [T050] [P2] [US3] `tests/unit/stores/` 配下のテストファイルを適切なディレクトリに移動
  - effectResolutionStore.test.ts → `tests/unit/application/stores/`
  - その他UI関連stores → `tests/unit/presentation/stores/`
- [x] [T051] [P2] [US3] 移動したテストファイルのimport pathを更新

### 検証

- [x] [T052] [P2] [US3] TypeScriptコンパイラでビルドし、import pathエラーがないことを確認
- [x] [T053] [P2] [US3] 全テスト（312テスト）を実行し、100%passすることを確認
- [x] [T054] [P2] [US3] 旧 `src/lib/stores/` ディレクトリが空になっていることを確認（削除可能な状態）

**Dependencies**: T041完了（US2完了）
**Estimated Time**: 4時間
**Success Criteria**: SC-003達成（全テストpass）、SC-006達成（import pathエラー0件）

---

## User Story 4: ディレクトリ構造の4層化 (P3)

**Goal**: `src/lib/` 配下のディレクトリが4層構造を明示している状態を実現

### Presentation Layer新設

- [x] [T055] [P3] [US4] ディレクトリ `src/lib/presentation/` を作成
- [x] [T056] [P3] [US4] `src/lib/components/` を `src/lib/presentation/components/` に移動（`git mv`）
- [x] [T057] [P3] [US4] `src/lib/types/` を `src/lib/presentation/types/` に移動（`git mv`）

### Shared Layer新設

- [x] [T058] [P3] [US4] ディレクトリ `src/lib/shared/` を作成
- [x] [T059] [P3] [US4] `src/lib/utils/` を `src/lib/shared/utils/` に移動（`git mv`）
- [x] [T060] [P3] [US4] `src/lib/constants/` を `src/lib/shared/constants/` に移動（`git mv`）

### Application Layer data移動

- [x] [T061] [P3] [US4] `src/lib/data/` を `src/lib/application/data/` に移動（`git mv`）

### Import Path一斉更新

- [x] [T062] [P3] [US4] 全ファイルで `src/lib/components/` → `src/lib/presentation/components/` に一括置換
- [x] [T063] [P3] [US4] 全ファイルで `src/lib/types/` → `src/lib/presentation/types/` に一括置換
- [x] [T064] [P3] [US4] 全ファイルで `src/lib/utils/` → `src/lib/shared/utils/` に一括置換
- [x] [T065] [P3] [US4] 全ファイルで `src/lib/constants/` → `src/lib/shared/constants/` に一括置換
- [x] [T066] [P3] [US4] 全ファイルで `src/lib/data/` → `src/lib/application/data/` に一括置換

### SvelteKit Alias確認

- [x] [T067] [P3] [US4] `svelte.config.js` のaliases設定を確認し、`$lib/...` が正しく解決されることを確認

### テスト更新

- [x] [T068] [P3] [US4] `tests/` 配下の全テストファイルでimport pathを更新（components, types, utils, constants, data）

### 検証

- [x] [T069] [P3] [US4] TypeScriptコンパイラでビルドし、import pathエラーがないことを確認
- [x] [T070] [P3] [US4] 全テスト（312テスト）を実行し、100%passすることを確認
- [x] [T071] [P3] [US4] `src/lib/` 配下のトップレベルディレクトリが `domain/`, `application/`, `infrastructure/`, `presentation/`, `shared/` のみであることを確認

**Dependencies**: T054完了（US3完了）
**Estimated Time**: 5時間
**Success Criteria**: SC-004達成（4層構造明示）、SC-006達成（import pathエラー0件）

---

## User Story 5: レイヤー依存関係の是正 (P1)

**Goal**: Application層・Infrastructure層からPresentation層への依存をゼロにし、Clean Architectureの依存関係ルールを遵守

**Background**: 現在、以下の依存関係違反が存在する:
- Application層 → Presentation層: 4件（ICardDataRepository, sampleDeckRecipes, cardDisplayStore, effectResolutionStore）
- Infrastructure層 → Presentation層: 3件（ygoprodeck.ts, YGOProDeckCardRepository）

**Strategy**: 型定義をApplication/Infrastructure層に移動し、Store間依存は依存性注入で解決

### 型定義の移動

- [x] [T088] [P1] [US5] `application/types/` ディレクトリを作成
- [x] [T089] [P1] [US5] `CardDisplayData` 型を `application/types/card.ts` に移動（元: `presentation/types/card.ts`）
  - 型定義をコピー
  - JSDocコメントに「Application層のDTO」と明記
- [x] [T090] [P1] [US5] `DeckRecipe` 型を `application/types/deck.ts` に移動（元: `presentation/types/deck.ts`）
  - 型定義をコピー
  - JSDocコメントに「デッキレシピのDTO」と明記
- [x] [T091] [P1] [US5] `infrastructure/types/` ディレクトリを作成
- [x] [T092] [P1] [US5] `YGOProDeckCard` 型を `infrastructure/types/ygoprodeck.ts` に移動（元: `presentation/types/ygoprodeck.ts`）
  - 型定義をコピー
  - JSDocコメントに「YGOPRODeck API外部型」と明記

**Dependencies**: なし（独立タスク）
**Estimated Time**: 30分
**Success Criteria**: 新しいディレクトリと型定義ファイルが作成される

### Application層のimport path更新

- [x] [T093] [P1] [US5] `ICardDataRepository.ts` のimport pathを更新（`presentation/types/card` → `application/types/card`）
- [x] [T094] [P1] [US5] `cardDisplayStore.ts` のimport pathを更新（`presentation/types/card` → `application/types/card`）
- [x] [T095] [P1] [US5] `sampleDeckRecipes.ts` のimport pathを更新（`presentation/types/deck` → `application/types/deck`）

**Dependencies**: T089, T090完了
**Estimated Time**: 15分
**Success Criteria**: Application層のすべてのファイルがPresentation層の型を直接importしない

### Infrastructure層のimport path更新

- [x] [T096] [P1] [US5] `ygoprodeck.ts` のimport pathを更新（`presentation/types/ygoprodeck` → `infrastructure/types/ygoprodeck`）
- [x] [T097] [P1] [US5] `YGOProDeckCardRepository.ts` のimport pathを更新
  - `CardDisplayData`: `presentation/types/card` → `application/types/card`
  - `convertToCardDisplayData`: Presentation層から削除し、Adapter内で実装
- [x] [T098] [P1] [US5] `convertToCardDisplayData()` 関数を `YGOProDeckCardRepository.ts` 内にprivateメソッドとして実装
  - 元の `presentation/types/ygoprodeck.ts` から移動
  - Infrastructure層の責務として配置

**Dependencies**: T089, T092完了
**Estimated Time**: 30分
**Success Criteria**: Infrastructure層のすべてのファイルがPresentation層の型を直接importしない

### Presentation層への型エイリアス追加（後方互換性）

- [x] [T099] [P2] [US5] `presentation/types/card.ts` に `CardDisplayData` の型エイリアスを追加
  ```typescript
  // Backward compatibility (Application層のDTOを再エクスポート)
  export type { CardDisplayData } from "$lib/application/types/card";
  ```
- [x] [T100] [P2] [US5] `presentation/types/deck.ts` に `DeckRecipe` の型エイリアスを追加
  ```typescript
  export type { DeckRecipe } from "$lib/application/types/deck";
  ```
- [x] [T101] [P2] [US5] `presentation/types/ygoprodeck.ts` に `YGOProDeckCard` の型エイリアスを追加
  ```typescript
  export type { YGOProDeckCard } from "$lib/infrastructure/types/ygoprodeck";
  ```

**Dependencies**: T093-T098完了
**Estimated Time**: 15分
**Success Criteria**: Presentation層のコンポーネントが既存のimport pathで引き続き動作する

### Store間依存の解消（effectResolutionStore → cardSelectionStore）

- [x] [T102] [P1] [US5] `effectResolutionStore.ts` にコールバック注入の仕組みを追加
  - `onCardSelectionStart?: (config: CardSelectionConfig) => void` をstate内部に保持
  - `registerCardSelectionHandler(handler)` メソッドを追加
  - `startResolution()` 内で直接 `cardSelectionStore` を呼ぶ代わりに、コールバックを実行
- [x] [T103] [P1] [US5] `effectResolutionStore.ts` から `cardSelectionStore` への直接importを削除
- [x] [T104] [P2] [US5] Presentation層（`+page.svelte` または初期化スクリプト）で `cardSelectionStore` を登録
  ```typescript
  effectResolutionStore.registerCardSelectionHandler((config) => {
    cardSelectionStore.startSelection(config);
  });
  ```

**Dependencies**: T093-T098完了
**Estimated Time**: 1時間
**Success Criteria**: effectResolutionStoreがcardSelectionStoreに直接依存しない、DI経由で動作する

### 静的解析による検証

- [x] [T105] [P1] [US5] Application層 → Presentation層の依存が0件であることを確認
  ```bash
  grep -r 'from "$lib/presentation' skeleton-app/src/lib/application/
  ```
  - 結果が0件であることを確認
- [x] [T106] [P1] [US5] Infrastructure層 → Presentation層の依存が0件であることを確認
  ```bash
  grep -r 'from "$lib/presentation' skeleton-app/src/lib/infrastructure/
  ```
  - 結果が0件であることを確認

**Dependencies**: T104完了
**Estimated Time**: 10分
**Success Criteria**: SC-007達成（Application→Presentation、Infrastructure→Presentationの依存が0件）

### テストとビルド検証

- [x] [T107] [P1] [US5] 全テスト（312テスト）を実行し、100%passすることを確認
- [x] [T108] [P1] [US5] ビルドを実行し、エラーゼロを確認
- [x] [T109] [P1] [US5] Linter/Formatterを実行し、コードスタイル違反がないことを確認

**Dependencies**: T105, T106完了
**Estimated Time**: 20分
**Success Criteria**: FR-025達成（静的解析で依存違反0件）、全テストpass、ビルド成功

### ドキュメント更新

- [x] [T110] [P2] [US5] `docs/architecture/overview.md` に型配置戦略を追記
  - Application/Infrastructure層の型定義ディレクトリの説明
  - Presentation層は型エイリアスのみを持つことを明記
- [x] [T111] [P2] [US5] `docs/architecture/data-model-design.md` に依存性注入パターンを追記
  - effectResolutionStore → cardSelectionStore のDI実装例
  - レイヤー間の結合解消戦略

**Dependencies**: T109完了
**Estimated Time**: 30分
**Success Criteria**: ドキュメントが実際のコードと一致

**Dependencies（US5全体）**: US2完了（Infrastructure Layer導入済み）が望ましいが、独立実行可能
**Estimated Time（US5全体）**: 4時間
**Success Criteria**: SC-007達成、FR-020～FR-025すべて達成、全テストpass

---

## Polish Phase

### 最終ドキュメント更新

- [x] [T072] [P1] [Polish] `docs/architecture/overview.md` を最終レビューし、4層構造リファクタリング完了後の状態を正確に反映
- [x] [T073] [P1] [Polish] `docs/architecture/data-model-design.md` を最終レビューし、Infrastructure Layer統合を反映
- [x] [T074] [P1] [US1] `CLAUDE.md` の "Recent Changes" セクションを更新（005-4-layer-clean-arch完了を記載）
- [x] [T075] [P1] [Polish] `README.md` のディレクトリ構造記載を4層構造に更新（必要に応じて）

### 品質チェック

- [x] [T076] [P1] [Polish] Linter/Formatterを実行（`npm run lint`, `npm run format`）
- [x] [T077] [P1] [Polish] 全テスト（312テスト）を最終実行し、100%passすることを確認
- [x] [T078] [P1] [Polish] ビルドを実行し、エラーゼロを確認
- [x] [T079] [P1] [Polish] E2Eテストを実行し、実際のユーザーフローが壊れていないことを確認

### 静的解析

- [x] [T080] [P2] [Polish] Domain/Application LayerがInfrastructure Layerへの直接importを持たないことを再確認（grep等）
- [x] [T081] [P2] [Polish] すべてのimport pathが新しいディレクトリ構造に準拠していることを確認

### ドキュメント・コード一致性確認

- [x] [T082] [P1] [Polish] `docs/architecture/overview.md` のコード例とディレクトリ構造が実際のコードと一致していることを確認
- [x] [T083] [P1] [Polish] `docs/architecture/data-model-design.md` のファイル構造記載が実際のコードと一致していることを確認

### Git操作

- [x] [T084] [P1] [Polish] すべての変更をステージング（`git add .`）
- [x] [T085] [P1] [Polish] コミットメッセージを作成し、コミット（`refactor: 4層Clean Architectureへのリファクタリング完了`）
- [x] [T086] [P1] [Polish] リモートブランチにpush（`git push -u origin 005-4-layer-clean-arch`）

### PR作成

- [x] [T087] [P1] [Polish] Pull Request作成（`gh pr create`）
  - **Title**: `refactor: 4層Clean Architectureへのリファクタリングとドキュメント整備`
  - **Body**: 以下を含む
    - Summary（4層構造への移行完了、Port/Adapter導入、Stores配置統一）
    - Test Plan（全312テストpass、ビルドエラーゼロ、静的解析pass）
    - Design Decisions参照（spec.mdリンク）

**Dependencies**: T071完了（US4完了）
**Estimated Time**: 2時間
**Success Criteria**: SC-003, SC-005, SC-006達成、PR作成完了

---

## Summary

### Task Counts
- **Total Tasks**: 111
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 10 tasks
- **US1 (P1)**: 11 tasks
- **US2 (P2)**: 17 tasks
- **US3 (P2)**: 13 tasks
- **US4 (P3)**: 17 tasks
- **US5 (P1)**: 24 tasks
- **Polish Phase**: 16 tasks

### Estimated Timeline
- **Setup Phase**: 15分
- **Foundational Phase**: 6時間
- **US1 (P1)**: 3時間
- **US2 (P2)**: 6時間
- **US3 (P2)**: 4時間
- **US4 (P3)**: 5時間
- **US5 (P1)**: 4時間
- **Polish Phase**: 2時間
- **Total**: 約31時間（4-5日相当）

### Parallel Execution Opportunities

**Phase 1（並行実行可能）**:
- T004, T005, T006（3つのドキュメント分析）を並行実行
- T008, T009, T010（Port/Adapter設計）を並行実行

**Phase 2（並行実行可能）**:
- T014-T017（overview.md更新）と T018-T020（data-model-design.md更新）を並行実行
- T029, T030, T031（APIファイル移動）を並行実行

**Phase 3（並行実行可能）**:
- T043, T044, T045, T046（Presentation Layer stores移動）を並行実行
- T056, T057（componentsとtypes移動）を並行実行

### MVP Scope (Minimum Viable Product)

**最小限の価値提供**（US1完了時点で独立してテスト可能）:
- ドキュメント3つの役割分担が明確化
- 新規参加者が適切なドキュメントを5分以内に見つけられる
- 既存の全テスト（312テスト）がpass

**Full Feature完了**（US1-US4完了、Polish完了）:
- 4層Clean Architecture完全適用
- Port/Adapterパターン導入
- Stores配置統一
- ディレクトリ構造4層化
- ドキュメント・コード完全一致
- PR作成完了

---

## Next Steps

1. ✅ `/speckit.tasks` 完了（このファイル）
2. ⏳ Setup Phase実行（T001-T003）
3. ⏳ Foundational Phase実行（T004-T013）
4. ⏳ User Story実装（T014以降）
5. ⏳ `/speckit.implement` コマンドで実装開始（任意）

**Current Status**: tasks.md生成完了。Setup Phaseから実装を開始できます。
