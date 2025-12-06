---
description: "Task list for Card Effect Execution System implementation"
---

# Tasks: Card Effect Execution System

**Feature**: 004-card-effect-execution
**Input**: Design documents from `/specs/004-card-effect-execution/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Vitest中心、E2Eは最小限（.specify/templates/testing-guidelines.md参照）

**Organization**: タスクはフェーズ順に整理され、アーキテクチャ設計→実装→マイグレーション→機能追加の順序で進行

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するUser Story（US1, US2, US3）
- ファイルパスを含む具体的な説明

## Path Conventions

- **プロジェクト構造**: `skeleton-app/src/lib/` がメインのソースディレクトリ
- **テスト**: `skeleton-app/tests/` 配下（単体テスト、E2Eテスト）
- **ドキュメント**: `docs/` 配下（architecture/, adr/）
- Clean Architecture 3層構造:
  - Domain Layer: `skeleton-app/src/lib/domain/`
  - Application Layer: `skeleton-app/src/lib/application/`
  - Presentation Layer: `skeleton-app/src/lib/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ブランチ作成と開発環境セットアップ

- [x] T001 ブランチ`feature/004-card-effect-execution`を作成済み確認（既に作成済み）
- [x] T002 [P] 依存関係インストール確認: `cd skeleton-app && npm install`
- [x] T003 [P] 開発サーバー起動確認: `npm run dev` でアプリケーション起動

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのUser Storyで共通利用するコアインフラ（既存コンポーネントの確認）

**⚠️ CRITICAL**: このフェーズが完了するまで、User Story実装を開始できません

- [x] T004 既存の`DrawCardCommand`を確認: `skeleton-app/src/lib/application/commands/DrawCardCommand.ts` が複数枚ドロー対応済みか確認
- [x] T005 既存の`ActivateSpellCommand`の拡張ポイント確認: `skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts` 行103-120のカードID分岐確認
- [x] T006 既存の`effectResolutionStore`インターフェース確認: `skeleton-app/src/lib/stores/effectResolutionStore.ts` の`EffectResolutionStep`型確認
- [x] T007 既存のDomain関数確認: `skeleton-app/src/lib/domain/models/Zone.ts` の`drawCards()`, `sendToGraveyard()`, `moveCard()`確認

**Checkpoint**: 既存アーキテクチャ確認完了 - Card Effect Architecture設計フェーズを開始可能

---

## Phase 2.5: Card Effect Architecture - Design & Documentation

**Purpose**: アーキテクチャ設計をドキュメント化し、実装の指針を確立する

**⚠️ IMPORTANT**: 実装前にドキュメント化することで、設計の穴や矛盾を早期発見し、実装の手戻りを防ぐ

### Documentation Tasks

- [ ] T008 [P] [Design] Card Effect Architectureをdata-model.mdに追記
  - `docs/architecture/data-model-design.md` を更新
  - CardEffect / SpellEffect / NormalSpellEffect の型定義追加
  - Strategy Patternの階層構造を図示
  - CardEffectRegistry の責務を説明
  - 既存のDomainCardData / CardDisplayData との関係を明記

- [ ] T009 [P] [Design] ADR-0005作成: Card Effect Architecture採用
  - `docs/adr/0005-card-effect-architecture.md` を新規作成
  - **Problem**: ActivateSpellCommandでカードID分岐を増やすとOpen/Closed Principle違反
  - **Decision**: Strategy Patternによる階層設計を採用
  - **ADR-0003との関係**: Effect System廃止後、カード数増加に対応する設計
  - **Alternatives**: Registry Pattern（関数ベース）との比較
  - **Consequences**: Open/Closed Principle遵守、遊戯王ルール体系に忠実

- [ ] T010 [P] [Design] テスト戦略をtesting-strategy.mdに反映
  - `docs/architecture/testing-strategy.md` を更新
  - Card Effect Architectureのテスト方針を追加
  - CardEffects.test.ts の責務明確化（カード固有ロジックのみ）
  - ActivateSpellCommand.test.ts の責務明確化（Commandフローのみ）
  - Strategy Patternのテスト階層（interface → base class → concrete class）

- [ ] T011 [P] [Design] Testing Guidelinesテンプレート更新
  - `.specify/templates/testing-guidelines.md` を更新
  - Card Effect testingの例を追加（PotOfGreedEffect.test.ts）
  - Strategy Patternのテスト方針を反映
  - Test Responsibility Separationセクションに CardEffect Architecture を追加

- [ ] T012 [Design] 既存CardEffects.test.tsの更新計画作成
  - `skeleton-app/tests/unit/CardEffects.test.ts` にコメント追加
  - 新アーキテクチャに対応したテスト構造を設計
  - PotOfGreedEffect クラスのテスト方針を明記
  - 実装フェーズ（T019）で参照する TODO コメントを追加

**Checkpoint**: ドキュメント化完了 - アーキテクチャ実装を開始可能

---

## Phase 3: Card Effect Architecture - Implementation

**Purpose**: Strategy Patternベースのカード効果システムを実装する

**⚠️ IMPORTANT**: Phase 2.5のドキュメントを参照しながら実装する

### Base Architecture Implementation

- [ ] T013 [P] CardEffect interface作成
  - `skeleton-app/src/lib/domain/effects/CardEffect.ts` を新規作成
  - `cardId: number`, `canActivate(state: GameState): boolean`, `createSteps(state: GameState): EffectResolutionStep[]` を定義

- [ ] T014 [P] SpellEffect base class作成
  - `skeleton-app/src/lib/domain/effects/SpellEffect.ts` を新規作成
  - `CardEffect` インターフェースを実装
  - `canActivate()`: ゲーム継続中チェック + `canActivateSpell()` 呼び出し
  - `abstract canActivateSpell(state: GameState): boolean` を定義

- [ ] T015 [P] NormalSpellEffect base class作成
  - `skeleton-app/src/lib/domain/effects/NormalSpellEffect.ts` を新規作成
  - `SpellEffect` を継承
  - `spellType = "normal"` を定義
  - `canActivate()`: Main1フェーズチェック追加

- [ ] T016 CardEffectRegistry作成
  - `skeleton-app/src/lib/domain/effects/CardEffectRegistry.ts` を新規作成
  - `private static effects: CardEffect[]` 配列を定義
  - `static get(cardId: number): CardEffect | undefined` メソッド実装
  - 初期状態では空配列（T023でPotOfGreedEffectを登録）

- [ ] T017 [P] CardEffectRegistry Unit Test作成
  - `skeleton-app/tests/unit/CardEffectRegistry.test.ts` を新規作成
  - `get()` メソッドのテスト
  - 存在しないカードIDでundefinedを返すテスト

### Pot of Greed Effect Implementation

- [ ] T018 PotOfGreedEffect実装
  - `skeleton-app/src/lib/domain/effects/cards/PotOfGreedEffect.ts` を新規作成
  - `NormalSpellEffect` を継承
  - `cardId = 55144522` を定義
  - `canActivateSpell()`: `state.zones.deck.length >= 2` チェック
  - `createSteps()`: DrawCardCommand(2)を実行するステップを返す

- [ ] T019 CardEffects.test.ts 更新: PotOfGreedEffect テスト追加
  - `skeleton-app/tests/unit/CardEffects.test.ts` を更新
  - T012で作成した計画に基づいて実装
  - `new PotOfGreedEffect()` でインスタンス化
  - `effect.canActivate()` のテスト（デッキ枚数チェック）
  - `effect.createSteps()` のテスト（ステップ構造確認）
  - 既存テスト（ActivateSpellCommand経由）は残す

- [ ] T020 全テスト通過確認
  - `npm run test:run` で254 tests passing維持
  - 新規テスト: CardEffectRegistry.test.ts, PotOfGreedEffect（CardEffects.test.ts内）

**Checkpoint**: Card Effect Architecture実装完了 - ActivateSpellCommandリファクタリングを開始可能

---

## Phase 4: Migrate Pot of Greed to New Architecture

**Purpose**: 既存のPot of Greedロジックを新アーキテクチャに移行する

**⚠️ IMPORTANT**: リファクタリング後も既存テストがすべて通過することを確認

### Refactoring Tasks

- [ ] T021 ActivateSpellCommand リファクタリング: execute()メソッド
  - `skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts` を更新
  - 行103-120のカードID分岐（`if (cardId === 55144522)`）を削除
  - CardEffectRegistry.get(cardId)を使用する実装に変更
  - `const effect = CardEffectRegistry.get(cardId);`
  - `if (effect) { const steps = effect.createSteps(state); effectResolutionStore.startResolution(steps); }`

- [ ] T022 ActivateSpellCommand リファクタリング: canExecute()メソッド
  - `skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts` を更新
  - 行62-71のカード固有チェック（`if (cardId === 55144522 && state.zones.deck.length < 2)`）を削除
  - CardEffect.canActivate()に委譲: `const effect = CardEffectRegistry.get(cardId); if (effect && !effect.canActivate(state)) { return false; }`

- [ ] T023 CardEffectRegistry にPotOfGreedEffect登録
  - `skeleton-app/src/lib/domain/effects/CardEffectRegistry.ts` を更新
  - `import { PotOfGreedEffect } from "./cards/PotOfGreedEffect";`
  - `private static effects: CardEffect[] = [new PotOfGreedEffect()];`

### Test Updates

- [ ] T024 既存テスト修正
  - `skeleton-app/tests/unit/ActivateSpellCommand.test.ts`: Commandフローのみテスト（カード固有ロジックは削除）
  - `skeleton-app/tests/unit/CardEffects.test.ts`: 新アーキテクチャに完全対応

- [ ] T025 E2Eテスト実行確認
  - `npm run test:e2e` で既存E2Eテスト通過確認
  - `card-activation.spec.ts` で統合動作確認（手札→発動→墓地）

- [ ] T026 全テスト通過確認（リファクタリング完了）
  - `npm run test:run` で254 tests passing維持
  - `npm run lint` で静的解析通過確認
  - `npm run check` でTypeScriptコンパイル確認

**Checkpoint**: User Story 1完了 - 強欲な壺が新アーキテクチャで動作確認済み、既存テストもすべて通過

---

## Phase 5: User Story 2 - Activate "Graceful Charity" (Priority: P2)

**Goal**: プレイヤーがメインフェイズ1で「天使の施し」を手札から発動すると、まず3枚ドローし、その後手札から2枚を選択して捨てることができる

**Independent Test**: シミュレーターで「天使の施し」を発動し、(1) 3枚ドロー後に手札選択モーダルが表示される、(2) 2枚選択して確定すると墓地に送られる、という一連のフローを実行できることで独立してテスト可能

### Implementation for User Story 2 - Part 1: Core Command

- [ ] T027 [P] [US2] `DiscardCardsCommand`作成: `skeleton-app/src/lib/application/commands/DiscardCardsCommand.ts` を新規作成し、`GameCommand`インターフェースを実装
- [ ] T028 [US2] `DiscardCardsCommand.canExecute()`実装: すべてのカードIDが手札に存在するか検証
- [ ] T029 [US2] `DiscardCardsCommand.execute()`実装: `sendToGraveyard()`を複数回呼び出し、Immer.jsで不変更新
- [ ] T030 [P] [US2] `DiscardCardsCommand`単体テスト作成: `skeleton-app/tests/unit/DiscardCardsCommand.test.ts` で破棄処理を検証

### Implementation for User Story 2 - Part 2: Selection Store

- [ ] T031 [P] [US2] `cardSelectionStore`作成: `skeleton-app/src/lib/application/stores/cardSelectionStore.ts` を新規作成
- [ ] T032 [US2] `cardSelectionStore`メソッド実装: `startSelection()`, `toggleCard()`, `confirmSelection()`, `reset()`
- [ ] T033 [P] [US2] `cardSelectionStore`単体テスト作成: `skeleton-app/tests/unit/cardSelectionStore.test.ts` で選択ロジック検証

### Implementation for User Story 2 - Part 3: Graceful Charity Effect

- [ ] T034 [US2] GracefulCharityEffect実装
  - `skeleton-app/src/lib/domain/effects/cards/GracefulCharityEffect.ts` を新規作成
  - `NormalSpellEffect` を継承
  - `cardId = 79571449` を定義
  - `canActivateSpell()`: `state.zones.deck.length >= 3` チェック
  - `createSteps()`: 2ステップ（3枚ドロー + 2枚選択）

- [ ] T035 [US2] CardEffectRegistry にGracefulCharityEffect登録
  - `skeleton-app/src/lib/domain/effects/CardEffectRegistry.ts` を更新
  - `effects` 配列に `new GracefulCharityEffect()` を追加

- [ ] T036 [P] [US2] CardEffects.test.ts 更新: GracefulCharityEffect テスト追加
  - `effect.canActivate()` のテスト（デッキ枚数チェック >= 3）
  - `effect.createSteps()` のテスト（2ステップ構造確認）

### Implementation for User Story 2 - Part 4: Selection UI

- [ ] T037 [P] [US2] `CardSelectionModal.svelte`作成: `skeleton-app/src/lib/components/modals/CardSelectionModal.svelte` を新規作成
- [ ] T038 [US2] CardSelectionModal ロジック実装: cardSelectionStoreと連携し、選択状態を表示
- [ ] T039 [US2] CardSelectionModal UI実装: Skeleton UI v3のModalコンポーネントを使用、TailwindCSSでスタイリング
- [ ] T040 [US2] Card.svelte 選択モード対応: `skeleton-app/src/lib/components/atoms/Card.svelte` に`isSelected`プロパティ追加

### Unit Tests for User Story 2

**Note**: 個別カードの効果処理テストは `CardEffects.test.ts` に集約し、`ActivateSpellCommand.test.ts` は普遍的なCommandフローのみをテストする方針（テストの責務分離）

- [ ] T041 [P] [US2] Unit Test実行: `npm test` で全テスト通過確認（新規テスト含む）

### E2E Tests for User Story 2

- [ ] T042 [P] [US2] E2Eテスト作成（正常系）: `skeleton-app/tests/e2e/graceful-charity.spec.ts` を新規作成
  - シナリオ1: 3枚ドロー → カード選択モーダル表示 → 2枚選択 → 確定 → 墓地送り
- [ ] T043 [P] [US2] E2Eテスト作成（エラー系）: デッキ2枚で発動失敗、1枚選択で確定ボタン無効化
- [ ] T044 [US2] E2Eテスト実行: `npm run test:e2e` で全テスト通過確認

**Checkpoint**: User Story 2完了 - 天使の施しが動作し、全テスト通過

---

## Phase 6: User Story 3 - Effect Resolution Progress Display (Priority: P3)

**Goal**: 効果解決中は、プレイヤーに現在の解決ステップが視覚的に表示される

**Independent Test**: 「天使の施し」を発動し、(1) 「3枚ドローします」というメッセージが表示される、(2) ドロー後に「手札から2枚選択してください」というメッセージが表示される、という表示切り替えを確認できる

### Implementation for User Story 3

- [ ] T045 [P] [US3] `EffectResolutionModal.svelte` UI改善: `skeleton-app/src/lib/components/modals/EffectResolutionModal.svelte` を更新
- [ ] T046 [US3] 進行状況表示追加: ステップ番号（1/2, 2/2）とプログレスバーを追加
- [ ] T047 [US3] モーダル外クリック無効化: 効果解決中はモーダルを閉じられないように設定

### E2E Tests for User Story 3

- [ ] T048 [P] [US3] E2Eテスト作成: 進行状況表示確認、モーダル外クリック無効化確認
- [ ] T049 [US3] E2Eテスト実行: `npm run test:e2e` で全テスト通過確認

**Checkpoint**: User Story 3完了 - 効果解決進行状況が視覚的に表示される

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント最終更新、コード品質向上

- [ ] T050 [P] ストック情報最終確認
  - `docs/architecture/data-model-design.md` の実装反映確認
  - `docs/adr/0005-card-effect-architecture.md` の実装反映確認
  - `docs/architecture/testing-strategy.md` の実装反映確認

- [ ] T051 [P] README/quickstart.md更新: Feature 004の機能を追加

- [ ] T052 コード品質チェック
  - `npm run lint` でESLint + Prettier通過
  - `npm run check` でTypeScript型チェック通過
  - 未使用importの削除

- [ ] T053 全テスト最終実行
  - `npm run test:run` で全Unit/Integrationテスト通過
  - `npm run test:e2e` で全E2Eテスト通過
  - `npm run test:coverage` でカバレッジ確認

- [ ] T054 ブラウザ動作確認
  - `npm run dev` でローカル起動
  - 強欲な壺発動確認
  - 天使の施し発動確認（カード選択含む）
  - 効果解決進行状況表示確認

**Checkpoint**: Feature 004完成 - すべての機能が動作し、ドキュメントも完備

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **Design & Documentation (Phase 2.5)**: Depends on Foundational completion - BLOCKS implementation
- **Architecture Implementation (Phase 3)**: Depends on Phase 2.5 completion
- **Pot of Greed Migration (Phase 4)**: Depends on Phase 3 completion
- **Graceful Charity (Phase 5)**: Depends on Phase 4 completion
- **Progress Display (Phase 6)**: Depends on Phase 5 completion
- **Polish (Phase 7)**: Depends on all feature phases completion

### Within Each Phase

- **Phase 2.5**: All documentation tasks can run in parallel ([P] marked)
- **Phase 3**: T013-T015 can run in parallel ([P] marked), T016-T017 can run in parallel
- **Phase 4**: T021-T023 are sequential (refactoring), T024-T025 are sequential (testing)
- **Phase 5**: Many tasks can run in parallel within each Part

### Parallel Opportunities

```bash
# Phase 2.5: All documentation tasks in parallel
Task: T008 + T009 + T010 + T011 (parallel)

# Phase 3: Base architecture in parallel
Task: T013 + T014 + T015 (parallel)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1-2: Setup + Foundational
2. Complete Phase 2.5: Design & Documentation (CRITICAL)
3. Complete Phase 3: Architecture Implementation
4. Complete Phase 4: Migrate Pot of Greed
5. **STOP and VALIDATE**: Test independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational + Design → Foundation ready
2. Add Architecture + Pot of Greed Migration → Test independently → Deploy/Demo (MVP!)
3. Add Graceful Charity → Test independently → Deploy/Demo
4. Add Progress Display → Test independently → Deploy/Demo
5. Each increment adds value without breaking previous features

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- **Design First**: Phase 2.5でドキュメント化してから実装（実装の手戻り防止）
- **Test Separation**: CardEffects.test.ts（カード固有）vs ActivateSpellCommand.test.ts（Commandフロー）
- Verify tests fail before implementing (TDD where applicable)
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Avoid: vague tasks, same file conflicts, skipping documentation phase
