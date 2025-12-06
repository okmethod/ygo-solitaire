---
description: "Task list for Card Effect Execution System implementation"
---

# Tasks: Card Effect Execution System

**Feature**: 004-card-effect-execution
**Input**: Design documents from `/specs/004-card-effect-execution/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: E2Eテストのみ含む（spec.mdのAcceptance Scenariosに基づく）

**Organization**: タスクはUser Story優先度順（P1→P2→P3）に整理され、各ストーリーが独立して実装・テスト可能

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するUser Story（US1, US2, US3）
- ファイルパスを含む具体的な説明

## Path Conventions

- **プロジェクト構造**: `skeleton-app/src/lib/` がメインのソースディレクトリ
- **テスト**: `skeleton-app/tests/` 配下（単体テスト、E2Eテスト）
- Clean Architecture 3層構造:
  - Domain Layer: `skeleton-app/src/lib/domain/`
  - Application Layer: `skeleton-app/src/lib/application/`
  - Presentation Layer: `skeleton-app/src/lib/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ブランチ作成と開発環境セットアップ

- [ ] T001 ブランチ`feature/004-card-effect-execution`を作成済み確認（既に作成済み）
- [ ] T002 [P] 依存関係インストール確認: `cd skeleton-app && npm install`
- [ ] T003 [P] 開発サーバー起動確認: `npm run dev` でアプリケーション起動

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのUser Storyで共通利用するコアインフラ（既存コンポーネントの確認）

**⚠️ CRITICAL**: このフェーズが完了するまで、User Story実装を開始できません

- [ ] T004 既存の`DrawCardCommand`を確認: `skeleton-app/src/lib/application/commands/DrawCardCommand.ts` が複数枚ドロー対応済みか確認
- [ ] T005 既存の`ActivateSpellCommand`の拡張ポイント確認: `skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts` 行73-75のTODOコメント確認
- [ ] T006 既存の`effectResolutionStore`インターフェース確認: `skeleton-app/src/lib/stores/effectResolutionStore.ts` の`EffectResolutionStep`型確認
- [ ] T007 既存のDomain関数確認: `skeleton-app/src/lib/domain/models/Zone.ts` の`drawCards()`, `sendToGraveyard()`, `moveCard()`確認

**Checkpoint**: 既存アーキテクチャ確認完了 - User Story実装を開始可能

---

## Phase 3: User Story 1 - Activate "Pot of Greed" (Priority: P1) 🎯 MVP

**Goal**: プレイヤーがメインフェイズ1で「強欲な壺」を手札から発動すると、デッキから2枚カードをドローできる

**Independent Test**: シミュレーターで「強欲な壺」を手札に持ち、メインフェイズ1で発動すると、手札が2枚増えることを確認できる

### Implementation for User Story 1

- [ ] T008 [US1] `ActivateSpellCommand.ts`にカードID判定ロジック追加: `skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts` 行73-75を修正し、カードID 55144522（強欲な壺）の効果処理を追加
- [ ] T009 [US1] 強欲な壺の`EffectResolutionStep`配列作成: 1ステップ（2枚ドロー）のステップ定義をActivateSpellCommand内に実装
- [ ] T010 [US1] `effectResolutionStore.startResolution()`呼び出し: 強欲な壺発動時にステップ配列を渡して効果解決フロー開始
- [ ] T011 [US1] デッキ枚数チェック追加: `ActivateSpellCommand.canExecute()`で`deck.length >= 2`を検証
- [ ] T012 [US1] カード発動後の墓地送り処理確認: 強欲な壺が効果解決後に墓地に送られることを確認（既存処理の検証）

### E2E Tests for User Story 1

- [ ] T013 [P] [US1] E2Eテスト作成（正常系）: `skeleton-app/tests/e2e/pot-of-greed.spec.ts` を作成し、強欲な壺発動→2枚ドロー→手札増加を検証
- [ ] T014 [P] [US1] E2Eテスト作成（エラー系）: デッキ1枚の状態で強欲な壺発動→エラーメッセージ表示を検証
- [ ] T015 [US1] E2Eテスト実行: `npm run test:e2e -- pot-of-greed.spec.ts` で全テスト通過確認

**Checkpoint**: User Story 1完了 - 強欲な壺が正しく動作し、独立してテスト可能

---

## Phase 4: User Story 2 - Activate "Graceful Charity" (Priority: P2)

**Goal**: プレイヤーがメインフェイズ1で「天使の施し」を手札から発動すると、まず3枚ドローし、その後手札から2枚を選択して捨てることができる

**Independent Test**: シミュレーターで「天使の施し」を発動し、(1) 3枚ドロー後に手札選択モーダルが表示される、(2) 2枚選択して確定すると墓地に送られる、という一連のフローを実行できることで独立してテスト可能

### Implementation for User Story 2 - Part 1: Core Command

- [ ] T016 [P] [US2] `DiscardCardsCommand`作成: `skeleton-app/src/lib/application/commands/DiscardCardsCommand.ts` を新規作成し、`GameCommand`インターフェースを実装
- [ ] T017 [US2] `DiscardCardsCommand.canExecute()`実装: すべてのカードIDが手札に存在するか検証
- [ ] T018 [US2] `DiscardCardsCommand.execute()`実装: `sendToGraveyard()`を複数回呼び出し、Immer.jsで不変更新
- [ ] T019 [P] [US2] `DiscardCardsCommand`単体テスト作成: `skeleton-app/src/lib/application/commands/__tests__/DiscardCardsCommand.test.ts` で破棄処理を検証

### Implementation for User Story 2 - Part 2: Selection Store

- [ ] T020 [P] [US2] `cardSelectionStore`作成: `skeleton-app/src/lib/stores/cardSelectionStore.ts` を新規作成し、Svelte Storeとして実装
- [ ] T021 [US2] `CardSelectionState`型定義: `isActive`, `selectedCards`, `maxSelection`フィールドを含む
- [ ] T022 [US2] `startSelection(maxCount)`実装: 選択モードを有効化し、maxSelectionを設定
- [ ] T023 [US2] `toggleSelection(cardInstanceId)`実装: カード選択/解除をトグル、maxSelection制限チェック
- [ ] T024 [US2] `getSelectedCards()`実装: 選択中のカードID配列を返す
- [ ] T025 [US2] `reset()`実装: 選択状態を初期化
- [ ] T026 [P] [US2] `cardSelectionStore`単体テスト作成: `skeleton-app/src/lib/stores/__tests__/cardSelectionStore.test.ts` で状態管理を検証

### Implementation for User Story 2 - Part 3: UI Component

- [ ] T027 [US2] `CardSelectionModal.svelte`作成: `skeleton-app/src/lib/components/CardSelectionModal.svelte` を新規作成
- [ ] T028 [US2] 手札カード一覧表示: `gameStateStore.zones.hand`からカードを取得し、一覧表示
- [ ] T029 [US2] カード選択/解除機能実装: クリックで`toggleSelection()`呼び出し、選択状態をハイライト表示
- [ ] T030 [US2] 確定ボタン実装: `selectedCards.length === maxSelection`で有効化、クリックで`DiscardCardsCommand`実行
- [ ] T031 [US2] モーダル表示制御: `cardSelectionStore.isActive`を購読し、trueの時のみ表示
- [ ] T032 [US2] モーダルスタイリング: TailwindCSSとSkeleton UIを使用してUI実装

### Implementation for User Story 2 - Part 4: Integration

- [ ] T033 [US2] `GameFacade.discardCards()`追加: `skeleton-app/src/lib/application/GameFacade.ts` に新規メソッド追加し、`DiscardCardsCommand`を実行
- [ ] T034 [US2] 天使の施しの`EffectResolutionStep`配列作成: `ActivateSpellCommand.ts`にカードID 79571449の処理追加、2ステップ（3枚ドロー→2枚選択）定義
- [ ] T035 [US2] Step 1実装: `DrawCardCommand(3).execute()`を呼び出すaction定義
- [ ] T036 [US2] Step 2実装: `cardSelectionStore.startSelection(2)`を呼び出すaction定義
- [ ] T037 [US2] カード選択→破棄フロー統合: `CardSelectionModal`の確定ボタンで`GameFacade.discardCards()`呼び出し、その後`effectResolutionStore.confirmCurrentStep()`実行
- [ ] T038 [US2] デッキ枚数チェック追加: `ActivateSpellCommand.canExecute()`で`deck.length >= 3`を検証

### E2E Tests for User Story 2

- [ ] T039 [P] [US2] E2Eテスト作成（正常系）: `skeleton-app/tests/e2e/graceful-charity.spec.ts` を作成し、天使の施し発動→3枚ドロー→モーダル表示→2枚選択→墓地送りを検証
- [ ] T040 [P] [US2] E2Eテスト作成（選択UI）: カード選択モーダルで2枚選択するまで確定ボタンが無効化されることを検証
- [ ] T041 [P] [US2] E2Eテスト作成（エラー系）: デッキ2枚の状態で天使の施し発動→エラーメッセージ表示を検証
- [ ] T042 [US2] E2Eテスト実行: `npm run test:e2e -- graceful-charity.spec.ts` で全テスト通過確認

**Checkpoint**: User Story 2完了 - 天使の施しが正しく動作し、独立してテスト可能

---

## Phase 5: User Story 3 - Effect Resolution Progress Display (Priority: P3)

**Goal**: 効果解決中は、プレイヤーに現在の解決ステップが視覚的に表示される

**Independent Test**: 「天使の施し」を発動し、(1) 「3枚ドローします」というメッセージが表示される、(2) ドロー後に「手札から2枚選択してください」というメッセージが表示される、という表示切り替えを確認できる

### Implementation for User Story 3

- [ ] T043 [US3] `EffectResolutionModal`活用確認: 既存の`EffectResolutionModal.svelte`（または類似コンポーネント）が存在するか確認
- [ ] T044 [US3] メッセージ表示実装: `effectResolutionStore`の現在のステップの`title`と`message`をモーダルに表示
- [ ] T045 [US3] ステップ進行表示: 現在のステップインデックスとTotal Steps数を表示（例: "Step 1 / 2"）
- [ ] T046 [US3] モーダル外クリック無効化: 効果解決中はモーダルが閉じられないように設定
- [ ] T047 [US3] スタイリング調整: TailwindCSSで視覚的に見やすいデザイン適用

### E2E Tests for User Story 3

- [ ] T048 [P] [US3] E2Eテスト作成（表示確認）: 天使の施し発動時に「デッキから3枚ドローします」メッセージが表示されることを検証
- [ ] T049 [P] [US3] E2Eテスト作成（ステップ遷移）: ドロー後に「手札から2枚選択して捨ててください」メッセージに更新されることを検証
- [ ] T050 [US3] E2Eテスト実行: `npm run test:e2e` で全User Storyのテスト通過確認

**Checkpoint**: User Story 3完了 - 効果解決の進行状況が視覚的に表示される

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数のUser Storyに影響する改善とドキュメント整備

- [ ] T051 [P] コードレビュー: すべてのCommandクラスとStoreのコード品質確認
- [ ] T052 [P] リンター・フォーマッター実行: `npm run lint && npm run format` でコード整形
- [ ] T053 [P] 型チェック実行: `npm run check` でTypeScriptエラーがないことを確認
- [ ] T054 [P] 全テストスイート実行: `npm run test:run && npm run test:e2e` で全テスト通過確認
- [ ] T055 [P] 不要なコメント削除: `ActivateSpellCommand.ts`のTODOコメント（行73-75）削除
- [ ] T056 [P] ドキュメント更新: `docs/architecture/overview.md`にカード効果実行システムの説明追加（オプション）
- [ ] T057 コミット: すべての変更をコミット、コミットメッセージはConventional Commits形式
- [ ] T058 リモートブランチにpush: `git push origin feature/004-card-effect-execution`
- [ ] T059 PR作成: GitHub上でPR作成、spec.mdのUser Storiesを参照

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setupに依存 - すべてのUser Storyをブロック
- **User Stories (Phase 3-5)**: Foundationalに依存
  - User Story 1 (P1): Foundational完了後に開始可能、他のストーリーに依存しない
  - User Story 2 (P2): Foundational完了後に開始可能、User Story 1とは独立（ただし、EffectResolutionStoreパターンはUS1で確立）
  - User Story 3 (P3): Foundational完了後に開始可能、User Story 2とは独立（ただし、天使の施しを使用）
- **Polish (Phase 6)**: 実装完了した全User Storyに依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他のストーリーに依存しない
- **User Story 2 (P2)**: Foundational完了後に開始可能 - User Story 1のパターンを参考にするが、独立してテスト可能
- **User Story 3 (P3)**: Foundational完了後に開始可能 - User Story 2の天使の施しを使用するため、実質的にUS2完了後が望ましい

### Within Each User Story

**User Story 1**:
- T008 → T009 → T010 → T011 → T012（順次実行）
- T013, T014（並列実行可能）→ T015

**User Story 2**:
- Part 1 (T016-T019): 順次実行、T019は並列可
- Part 2 (T020-T026): 順次実行、T026は並列可
- Part 3 (T027-T032): 順次実行
- Part 4 (T033-T038): 順次実行
- Tests (T039-T042): T039, T040, T041並列実行可 → T042

**User Story 3**:
- T043 → T044 → T045 → T046 → T047（順次実行）
- T048, T049（並列実行可能）→ T050

### Parallel Opportunities

- **Phase 1**: T002, T003並列実行可能
- **Phase 2**: すべてのタスクが確認作業のため並列実行可能
- **User Story 1**: T013, T014並列実行可能
- **User Story 2**:
  - Part 1とPart 2は並列実行可能（異なるファイル）
  - T019（テスト）とT026（テスト）は他の実装と並列実行可能
  - T039, T040, T041並列実行可能
- **User Story 3**: T048, T049並列実行可能
- **Phase 6**: T051, T052, T053, T054, T055, T056すべて並列実行可能

---

## Parallel Example: User Story 2

```bash
# Part 1とPart 2を並列実行（異なるファイル）:
Task: "T016-T018: DiscardCardsCommand実装"
Task: "T020-T025: cardSelectionStore実装"

# テストタスクを並列実行:
Task: "T039: E2Eテスト（正常系）作成"
Task: "T040: E2Eテスト（選択UI）作成"
Task: "T041: E2Eテスト（エラー系）作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational（既存コンポーネント確認）
3. Complete Phase 3: User Story 1（強欲な壺）
4. **STOP and VALIDATE**: User Story 1を独立してテスト
5. デモ・レビュー可能

### Incremental Delivery

1. Setup + Foundational → 既存アーキテクチャ確認完了
2. User Story 1実装 → 独立してテスト → デモ（MVP!）
3. User Story 2実装 → 独立してテスト → デモ
4. User Story 3実装 → 独立してテスト → デモ
5. 各ストーリーが価値を追加し、以前のストーリーを壊さない

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全員でSetup + Foundationalを完了
2. Foundational完了後:
   - Developer A: User Story 1（強欲な壺）
   - Developer B: User Story 2（天使の施し）- Part 1 & Part 2を先行
   - Developer C: User Story 3のUI設計検討
3. 各ストーリーが独立して完成・統合

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベル = タスクを特定のUser Storyにマッピング（トレーサビリティ）
- 各User Storyは独立して完成・テスト可能
- E2Eテストを先に実装してから機能実装を推奨（TDD）
- 各タスクまたは論理的なグループ後にコミット
- 各チェックポイントでストーリーを独立して検証
- 避けるべきこと: 曖昧なタスク、同じファイルの競合、ストーリーの独立性を壊す依存関係
