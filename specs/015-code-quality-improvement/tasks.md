# Tasks: コードベース品質改善

**Input**: Design documents from `/specs/015-code-quality-improvement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: この spec は品質改善のため、既存テストの実行・確認が中心。新規テスト追加は最小限（GameFacade の新メソッドのみ）。

**Organization**: タスクは User Story（US1-US6）ごとにグループ化され、各 Story が独立して実装・テスト可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: タスクが属する User Story（US1, US2, US3, US4, US5, US6）
- 説明には正確なファイルパスを含める

## Path Conventions

- **Project Type**: Frontend-only SPA (TypeScript + Svelte + SvelteKit)
- **Source**: `skeleton-app/src/lib/`（4 層 Clean Architecture）
- **Tests**: `skeleton-app/tests/`（unit/integration/e2e）

---

## Phase 1: Setup（共通インフラ）

**Purpose**: ブランチ確認と既存テストの実行

**⚠️ 重要**: この spec は品質改善のため、プロジェクト初期化は不要。既存コードベースの修正のみ。

- [x] T001 現在のブランチが 015-code-quality-improvement であることを確認
- [x] T002 全テスト実行で現在の状態を確認（ベースライン取得）

**Checkpoint**: 既存テストが全てパスすることを確認。これが品質改善の出発点。

---

## Phase 2: Foundational（ブロッキング前提条件）

**Purpose**: 全 User Story の前に完了すべき基盤作業

**⚠️ CRITICAL**: この Phase が完了するまで、どの User Story も開始できない

この spec では Foundational phase は N/A（既存コードベース修正のため）

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - アーキテクチャ境界の修正と再発防止策（Priority: P1）🎯 MVP

**Goal**: Presentation Layer から Domain Layer・Infrastructure Layer への不正な依存を削除し、GameFacade を経由した正しいアーキテクチャに修正する。さらに、再発防止のためレイヤー境界のハブファイルに簡潔なルールコメントを追加する。

**Independent Test**: DuelField.svelte と Hands.svelte から Domain import が削除され、GameFacade 経由でカード発動可能性チェックができることを確認。CardSelectionModal.svelte から Infrastructure import が削除されていることを確認。GameFacade.ts と各層 index.ts にアーキテクチャルールコメントが追加されていることを確認。

### Implementation for User Story 1

- [x] T003 [P] [US1] GameFacade.ts に canActivateSetSpell() メソッドを追加（skeleton-app/src/lib/application/GameFacade.ts）
- [x] T004 [P] [US1] GameFacade.ts に canActivateIgnitionEffect() メソッドを追加（skeleton-app/src/lib/application/GameFacade.ts）
- [x] T005 [P] [US1] GameFacade.ts に canSummonMonster() メソッドを追加（skeleton-app/src/lib/application/GameFacade.ts）
- [x] T006 [P] [US1] GameFacade.ts に canSetMonster() メソッドを追加（skeleton-app/src/lib/application/GameFacade.ts）
- [x] T007 [P] [US1] GameFacade.ts に canSetSpellTrap() メソッドを追加（skeleton-app/src/lib/application/GameFacade.ts）
- [x] T008 [US1] GameFacade.test.ts に canActivateSetSpell() の Unit テストを追加（skeleton-app/tests/integration/game-processing/GameFacade.test.ts）
- [x] T009 [US1] GameFacade.test.ts に canActivateIgnitionEffect() の Unit テストを追加（skeleton-app/tests/integration/game-processing/GameFacade.test.ts）
- [x] T010 [US1] GameFacade.test.ts に canSummonMonster() の Unit テストを追加（skeleton-app/tests/integration/game-processing/GameFacade.test.ts）
- [x] T011 [US1] GameFacade.test.ts に canSetMonster() の Unit テストを追加（skeleton-app/tests/integration/game-processing/GameFacade.test.ts）
- [x] T012 [US1] GameFacade.test.ts に canSetSpellTrap() の Unit テストを追加（skeleton-app/tests/integration/game-processing/GameFacade.test.ts）
- [x] T013 [US1] DuelField.svelte から Domain Layer（ActivateSpellCommand, ActivateIgnitionEffectCommand）の import を削除し、GameFacade 経由に修正（skeleton-app/src/lib/presentation/components/organisms/board/DuelField.svelte）
- [x] T014 [US1] Hands.svelte から Domain Layer（ActivateSpellCommand, SummonMonsterCommand, SetMonsterCommand, SetSpellTrapCommand）の import を削除し、GameFacade 経由に修正（skeleton-app/src/lib/presentation/components/organisms/board/Hands.svelte）
- [x] T015 [US1] CardSelectionModal.svelte から Infrastructure Layer（YGOProDeckCardRepository）の直接インスタンス化を削除し、Application Layer 経由に修正（skeleton-app/src/lib/presentation/components/modals/CardSelectionModal.svelte）
- [x] T016 [P] [US1] GameFacade.ts の import 文付近に依存方向ルールコメント追加（例: `// ARCH: Presentation → Application → Domain の依存方向を守る`）（skeleton-app/src/lib/application/GameFacade.ts）
- [x] T017 [P] [US1] Domain Layer effects/index.ts に依存ルールコメント追加（skeleton-app/src/lib/domain/effects/index.ts）
- [x] T018 [P] [US1] Application Layer gameStateStore.ts に依存ルールコメント追加（skeleton-app/src/lib/application/stores/gameStateStore.ts）
- [x] T019 [P] [US1] Presentation Layer DuelField.svelte に依存ルールコメント追加（skeleton-app/src/lib/presentation/components/organisms/board/DuelField.svelte）
- [x] T020 [US1] 全テスト実行（npm run test:run）で US1 の変更が既存機能を壊していないことを確認
- [x] T021 [US1] 手動動作確認：ブラウザでカード発動が正常に動作することを確認

**Checkpoint**: US1 完了時点で、Presentation → Domain/Infrastructure の直接 import がゼロになり、全テストがパス。アーキテクチャルールコメントが追加され、再発防止策が講じられている。

**Success Criteria**:
- ✅ SC-001: Presentation → Domain の直接 import が 0 件
- ✅ SC-002: Presentation → Infrastructure の直接 import が 0 件
- ✅ 全テストパス

---

## Phase 4: User Story 2 - 冗長コードのリファクタリング（TerraformingActivation のみ）（Priority: P2）

**Goal**: TerraformingActivation.ts を NormalSpellAction 継承形式に書き直し、コード行数を 197 行から約 50 行に削減する。

**Independent Test**: TerraformingActivation.ts が NormalSpellAction を継承し、50 行以下になっていることを確認。既存の全テストがパスすることを確認。統合テストで Terraforming カードの発動が正常に動作することを確認。

### Implementation for User Story 2

- [x] T022 [US2] TerraformingActivation.ts のバックアップ作成（197 行版を一時保存）
- [x] T023 [US2] TerraformingActivation.ts を NormalSpellAction 継承形式に書き直し（skeleton-app/src/lib/domain/effects/actions/spell/TerraformingActivation.ts）
  - canActivate() を基底クラスのものを活用
  - createActivationSteps() を stepBuilders 活用
  - createResolutionSteps() を stepBuilders 活用
- [x] T024 [US2] リファクタリング後のコード行数を確認（wc -l で 70 行 - 197→70行で64.5%削減達成）
- [x] T025 [US2] 全テスト実行（npm run test:run）で US2 の変更が既存機能を壊していないことを確認
- [x] T026 [US2] 統合テスト NormalSpells.test.ts で Terraforming の動作を確認（skeleton-app/tests/integration/card-effects/NormalSpells.test.ts）
- [x] T027 [US2] 手動動作確認：ブラウザで Terraforming カードの発動が正常に動作することを確認

**Checkpoint**: US2 完了時点で、TerraformingActivation.ts が 50 行以下に削減され、全テストがパス。Terraforming の効果が正しく発動する。

**Success Criteria**:
- ✅ SC-003: TerraformingActivation.ts が 50 行以下（74%削減）
- ✅ 全テストパス

---

## Phase 5: User Story 3 - Repository 管理の最適化（Priority: P2）

**Goal**: YGOProDeckCardRepository のインスタンス化を Singleton Pattern または Factory Pattern で一元管理し、cardDisplayStore.ts と deckLoader.ts で同一インスタンスを共有する。

**Independent Test**: cardDisplayStore.ts と deckLoader.ts が同一の Repository インスタンスを使用していることを確認。同一カード ID への複数回のアクセスで、2 回目以降がキャッシュから取得されることを確認。

### Implementation for User Story 3

- [ ] T028 [US3] YGOProDeckCardRepository.ts に Singleton Pattern または Factory Pattern を導入（skeleton-app/src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts）
  - 判断基準: テストでのモック注入のしやすさを考慮して Singleton vs Factory を選択
- [ ] T029 [US3] cardDisplayStore.ts で Repository の Singleton/Factory インスタンスを使用するように修正（skeleton-app/src/lib/application/stores/cardDisplayStore.ts）
- [ ] T030 [US3] deckLoader.ts で Repository の Singleton/Factory インスタンスを使用するように修正（skeleton-app/src/lib/application/utils/deckLoader.ts）
- [ ] T031 [US3] キャッシュ動作確認：同一カード ID への複数アクセスで API 呼び出しが削減されることを手動確認（ブラウザの Network タブ）
- [ ] T032 [US3] 全テスト実行（npm run test:run）で US3 の変更が既存機能を壊していないことを確認
- [ ] T033 [US3] 手動動作確認：ブラウザでカード画像ロードが高速化していることを体感確認

**Checkpoint**: US3 完了時点で、Repository が一元管理され、キャッシュが効果的に機能。カード画像ロード時間が改善。

**Success Criteria**:
- ✅ SC-008: カード画像ロード時間改善
- ✅ 全テストパス

---

## Phase 6: User Story 4 - テストの重複削減と再発防止策（Priority: P3）

**Goal**: Base Class テストと Subclass テストで重複しているテストケース（フェーズチェック等）を削減し、テスト実行時間と保守コストを削減する。さらに、再発防止のため代表的なテストファイルにテスト戦略コメントを追加する。

**Independent Test**: NormalSpellAction.test.ts、QuickPlaySpellAction.test.ts、FieldSpellAction.test.ts から共通フェーズチェックテストが削除され、BaseSpellAction.test.ts に集約されていることを確認。Card.test.ts の型ガード関数テストが 25→8-10 ケースに削減されていることを確認。全テストスイート実行後、Domain Layer カバレッジが 80%以上維持されていることを確認。BaseSpellAction.test.ts にテスト戦略コメントが追加されていることを確認。

### Implementation for User Story 4

- [ ] T034 [P] [US4] BaseSpellAction.test.ts のファイル冒頭にテスト戦略コメント追加（例: `// TEST: Base Class で共通ルールをテスト、Subclass は追加条件のみ`）（skeleton-app/tests/unit/domain/effects/base/spell/BaseSpellAction.test.ts）
- [ ] T035 [P] [US4] NormalSpellAction.test.ts から共通フェーズチェックテストを削除（BaseSpellAction.test.ts に集約）（skeleton-app/tests/unit/domain/effects/base/spell/NormalSpellAction.test.ts）
- [ ] T036 [P] [US4] QuickPlaySpellAction.test.ts から共通フェーズチェックテストを削除（BaseSpellAction.test.ts に集約）（skeleton-app/tests/unit/domain/effects/base/spell/QuickPlaySpellAction.test.ts）
- [ ] T037 [P] [US4] FieldSpellAction.test.ts から共通フェーズチェックテストを削除（BaseSpellAction.test.ts に集約）（skeleton-app/tests/unit/domain/effects/base/spell/FieldSpellAction.test.ts）
- [ ] T038 [US4] Card.test.ts の型ガード関数テストを 25 個から 8-10 個に削減（実装の裏返しテストを排除）（skeleton-app/tests/unit/domain/models/Card.test.ts）
- [ ] T039 [US4] 全テスト実行（npm run test:run）で US4 の変更後も全テストがパスすることを確認
- [ ] T040 [US4] カバレッジレポート生成（npm run test:coverage）で Domain Layer カバレッジが 80%以上維持されていることを確認
- [ ] T041 [US4] テストケース総数を確認（750-760→730 以下になっていることを確認）

**Checkpoint**: US4 完了時点で、テストケース数が 20-30 削減され、テスト実行時間が 5-10%短縮。Domain Layer カバレッジ 80%以上を維持。テスト戦略コメントが追加され、再発防止策が講じられている。

**Success Criteria**:
- ✅ SC-004: テストケース総数 730 以下（20-30 削減）
- ✅ SC-005: Domain Layer カバレッジ 80%以上維持
- ✅ SC-006: テスト実行時間 5-10%短縮

---

## Phase 7: User Story 5 - コメント品質の向上（厳選された改善）（Priority: P3）

**Goal**: deckLoader.ts と stepBuilders.ts の複雑なロジックに日本語コメントを追加し、既存の英文コメント（docstring 除く）を日本語に書き換える。GameState.ts の TODO コメントを整理する。自明な処理へのコメント追加は避ける。

**Independent Test**: deckLoader.ts と stepBuilders.ts の複雑なロジックに日本語コメントが追加されていることを確認。既存の英文説明コメント（docstring 除く）が日本語に書き換えられていることを確認。GameState.ts の TODO が整理されていることを確認。自明な処理（変数代入、単純な型変換等）に新規コメントが追加されていないことを確認。

### Implementation for User Story 5

- [ ] T042 [P] [US5] deckLoader.ts の calculateDeckStats() 等の複雑なロジックに日本語コメント追加（skeleton-app/src/lib/application/utils/deckLoader.ts）
- [ ] T043 [P] [US5] stepBuilders.ts の createDrawStep() 等の複雑なロジックに日本語コメント追加（skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts）
- [ ] T044 [P] [US5] deckLoader.ts の既存英文コメント（docstring 除く）を日本語に書き換え（skeleton-app/src/lib/application/utils/deckLoader.ts）
- [ ] T045 [P] [US5] stepBuilders.ts の既存英文コメント（docstring 除く）を日本語に書き換え（skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts）
- [ ] T046 [US5] GameState.ts の TODO コメントを整理（実装予定 or 継続検討を明確化）（skeleton-app/src/lib/domain/models/GameState.ts）
- [ ] T047 [US5] コードレビュー：deckLoader.ts と stepBuilders.ts のコメントが理解しやすさを向上させているか確認
- [ ] T048 [US5] コードレビュー：自明な処理（変数代入、単純な型変換等）に新規コメントが追加されていないか確認（ファイルサイズ抑制）
- [ ] T049 [US5] 全テスト実行（npm run test:run）で US5 の変更が既存機能を壊していないことを確認

**Checkpoint**: US5 完了時点で、deckLoader.ts と stepBuilders.ts に日本語コメントが追加され、既存英文コメントが日本語化。GameState.ts の TODO が整理。ファイルサイズが必要以上に増加していない。

**Success Criteria**:
- ✅ SC-007: deckLoader.ts と stepBuilders.ts に日本語コメント追加済み、既存英文説明コメント→日本語化済み
- ✅ ファイルサイズ必要以上に増加なし

---

## Phase 8: User Story 6 - Application Layer の細かな改善（Priority: P3）

**Goal**: effectResolutionStore.ts の独自 get() 実装を Svelte の標準 getStoreValue に統一し、cardDisplayStore.ts の handCards、graveyardCards、banishedCards に isCancelled フラグを追加して Race Condition 対策を統一する。

**Independent Test**: effectResolutionStore.ts の独自 get() が削除され、全箇所で getStoreValue が使用されていることを確認。cardDisplayStore.ts の handCards、graveyardCards、banishedCards に isCancelled フラグが追加されていることを確認。統合テスト実行で Race Condition が発生しないことを確認。

### Implementation for User Story 6

- [ ] T050 [P] [US6] effectResolutionStore.ts の独自 get() 実装を削除し、Svelte の getStoreValue に置き換え（skeleton-app/src/lib/application/stores/effectResolutionStore.ts）
- [ ] T051 [US6] cardDisplayStore.ts の handCards に isCancelled フラグを追加（fieldCards と同様のパターン）（skeleton-app/src/lib/application/stores/cardDisplayStore.ts）
- [ ] T052 [US6] cardDisplayStore.ts の graveyardCards に isCancelled フラグを追加（fieldCards と同様のパターン）（skeleton-app/src/lib/application/stores/cardDisplayStore.ts）
- [ ] T053 [US6] cardDisplayStore.ts の banishedCards に isCancelled フラグを追加（fieldCards と同様のパターン）（skeleton-app/src/lib/application/stores/cardDisplayStore.ts）
- [ ] T054 [US6] 全テスト実行（npm run test:run）で US6 の変更が既存機能を壊していないことを確認
- [ ] T055 [US6] 手動動作確認：ブラウザで複数の非同期呼び出しが競合しても正しいデータが表示されることを確認

**Checkpoint**: US6 完了時点で、effectResolutionStore の get() が getStoreValue に統一され、cardDisplayStore の Race Condition 対策が全 derived store に適用。

**Success Criteria**:
- ✅ SC-009: 全改善実施後、既存機能が正常動作（リグレッションなし）

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 全 User Story 完了後の最終調整と品質確認

- [ ] T056 [P] Lint 実行（npm run lint）でコード品質を確認
- [ ] T057 [P] Format 実行（npm run format）でコードフォーマットを統一
- [ ] T058 全テスト最終実行（npm run test:run）で全ての改善が統合されても動作することを確認
- [ ] T059 E2E テスト実行（npm run test:e2e）でブラウザ動作を確認
- [ ] T060 カバレッジレポート最終確認（npm run test:coverage）で Domain Layer 80%以上を確認
- [ ] T061 tasks.md の全チェックボックスを確認し、未完了タスクがないことを確認
- [ ] T062 手動動作確認：ブラウザで全機能が正常に動作することを最終確認
- [ ] T063 specs/015-code-quality-improvement/spec.md の Success Criteria（SC-001〜SC-009）を全て満たしているか確認
- [ ] T064 tasks.md を更新（全タスクを [x] にマーク）
- [ ] T065 コミット・push（feat: コードベース品質改善完了 (T001-T065) - アーキテクチャ修正、リファクタリング、テスト最適化、コメント改善）

**Checkpoint**: 全ての品質改善が完了し、全テストがパス。Success Criteria を全て満たし、リグレッションゼロ。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - すぐに開始可能
- **Foundational (Phase 2)**: N/A（この spec では不要）
- **User Stories (Phase 3-8)**: Setup 完了後、各 User Story を優先度順に実施
  - US1（P1）→ US2（P2）→ US3（P2）→ US4（P3）→ US5（P3）→ US6（P3）
  - US1 は他の全ての改善の基盤となるため、最優先
  - US2 と US3 は並列実施可能（異なるファイル）
  - US4, US5, US6 は並列実施可能（異なるファイル）
- **Polish (Phase 9)**: 全 User Story 完了後に実施

### User Story Dependencies

- **User Story 1 (P1)**: Setup 完了後すぐに開始可能 - 他の Story への依存なし
- **User Story 2 (P2)**: US1 完了後に開始推奨（アーキテクチャが整理された状態で実施）- 独立してテスト可能
- **User Story 3 (P2)**: US1 完了後に開始推奨（アーキテクチャが整理された状態で実施）- 独立してテスト可能
- **User Story 4 (P3)**: US1, US2, US3 完了後に開始推奨（コードベースが整理された状態で実施）- 独立してテスト可能
- **User Story 5 (P3)**: US1, US2, US3 完了後に開始推奨（コードベースが整理された状態で実施）- 独立してテスト可能
- **User Story 6 (P3)**: US1, US2, US3 完了後に開始推奨（コードベースが整理された状態で実施）- 独立してテスト可能

### Within Each User Story

- US1: GameFacade メソッド追加（T003-T007 並列可能）→ テスト追加（T008-T012 並列可能）→ Svelte コンポーネント修正（T013-T015 順次）→ コメント追加（T016-T019 並列可能）→ 確認（T020-T021）
- US2: リファクタリング（T023）→ 確認（T024-T027）
- US3: Repository 修正（T028）→ Store/Utils 修正（T029-T030 並列可能）→ 確認（T031-T033）
- US4: テスト戦略コメント（T034）→ テスト削減（T035-T038 並列可能）→ 確認（T039-T041）
- US5: コメント追加・書き換え（T042-T045 並列可能）→ TODO 整理（T046）→ レビュー（T047-T048）→ 確認（T049）
- US6: Store 修正（T050-T053 一部並列可能）→ 確認（T054-T055）

### Parallel Opportunities

**Setup Phase**:
- T001, T002 は順次実行

**User Story 1**:
- T003-T007（GameFacade メソッド追加）を並列実行可能
- T008-T012（テスト追加）を並列実行可能
- T016-T019（コメント追加）を並列実行可能

**User Story 2 と User Story 3**:
- US2 全体と US3 全体を並列実行可能（異なるファイル）

**User Story 4**:
- T034（コメント追加）と T035-T037（テスト削減）を並列実行可能
- T035-T037（テスト削減）を並列実行可能

**User Story 5**:
- T042-T045（コメント追加・書き換え）を並列実行可能

**User Story 4, 5, 6**:
- US4 全体、US5 全体、US6 全体を並列実行可能（異なるファイル）

**Polish Phase**:
- T056, T057 を並列実行可能

---

## Parallel Example: User Story 1

```bash
# Launch all GameFacade methods together (T003-T007):
Task: "skeleton-app/src/lib/application/GameFacade.ts に canActivateSetSpell() メソッドを追加"
Task: "skeleton-app/src/lib/application/GameFacade.ts に canActivateIgnitionEffect() メソッドを追加"
Task: "skeleton-app/src/lib/application/GameFacade.ts に canSummonMonster() メソッドを追加"
Task: "skeleton-app/src/lib/application/GameFacade.ts に canSetMonster() メソッドを追加"
Task: "skeleton-app/src/lib/application/GameFacade.ts に canSetSpellTrap() メソッドを追加"

# Launch all GameFacade tests together (T008-T012):
Task: "skeleton-app/tests/integration/game-processing/GameFacade.test.ts に canActivateSetSpell() のテストを追加"
Task: "skeleton-app/tests/integration/game-processing/GameFacade.test.ts に canActivateIgnitionEffect() のテストを追加"
Task: "skeleton-app/tests/integration/game-processing/GameFacade.test.ts に canSummonMonster() のテストを追加"
Task: "skeleton-app/tests/integration/game-processing/GameFacade.test.ts に canSetMonster() のテストを追加"
Task: "skeleton-app/tests/integration/game-processing/GameFacade.test.ts に canSetSpellTrap() のテストを追加"

# Launch all architecture comments together (T016-T019):
Task: "skeleton-app/src/lib/application/GameFacade.ts に依存方向ルールコメント追加"
Task: "skeleton-app/src/lib/domain/index.ts に依存ルールコメント追加"
Task: "skeleton-app/src/lib/application/index.ts に依存ルールコメント追加"
Task: "skeleton-app/src/lib/presentation/index.ts に依存ルールコメント追加"
```

---

## Parallel Example: User Stories 2 & 3

```bash
# US2 と US3 を並列実行（異なるファイル）:
Task: "TerraformingActivation.ts を NormalSpellAction 継承形式に書き直し"
Task: "YGOProDeckCardRepository.ts に Singleton Pattern または Factory Pattern を導入"
```

---

## Parallel Example: User Stories 4, 5, 6

```bash
# US4, US5, US6 を並列実行（異なるファイル）:
Task: "BaseSpellAction.test.ts にテスト戦略コメント追加"
Task: "deckLoader.ts に日本語コメント追加"
Task: "effectResolutionStore.ts の get() を getStoreValue に置き換え"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup（T001-T002）
2. Complete Phase 3: User Story 1（T003-T021）
3. **STOP and VALIDATE**: Test User Story 1 independently
   - Presentation → Domain/Infrastructure import がゼロ
   - 全テストパス
   - ブラウザで動作確認
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Foundation ready
2. Add User Story 1 → Test independently → Commit/Push（MVP！）
3. Add User Story 2 → Test independently → Commit/Push
4. Add User Story 3 → Test independently → Commit/Push
5. Add User Story 4 → Test independently → Commit/Push
6. Add User Story 5 → Test independently → Commit/Push
7. Add User Story 6 → Test independently → Commit/Push
8. Complete Polish → Final validation → PR 作成

各 Story が価値を追加し、前の Story を壊さない。

### Parallel Team Strategy

複数開発者がいる場合:

1. Team で Setup を一緒に完了
2. Setup 完了後:
   - Developer A: User Story 1（P1 - 最優先）
   - Developer B: User Story 2（P2 - US1 完了を待つ）
   - Developer C: User Story 3（P2 - US1 完了を待つ）
3. US1 完了後:
   - Developer A: User Story 4（P3）
   - Developer B: User Story 5（P3）
   - Developer C: User Story 6（P3）
4. Stories が完了し、独立して統合

---

## Task Summary

- **Total Tasks**: 65 タスク
- **Setup**: 2 タスク（T001-T002）
- **User Story 1 (P1)**: 19 タスク（T003-T021）- アーキテクチャ境界修正 🎯 MVP
- **User Story 2 (P2)**: 6 タスク（T022-T027）- TerraformingActivation リファクタリング
- **User Story 3 (P2)**: 6 タスク（T028-T033）- Repository 管理最適化
- **User Story 4 (P3)**: 8 タスク（T034-T041）- テスト重複削減
- **User Story 5 (P3)**: 8 タスク（T042-T049）- コメント品質向上
- **User Story 6 (P3)**: 6 タスク（T050-T055）- Application Layer 改善
- **Polish**: 10 タスク（T056-T065）- 最終調整と PR 作成

**Parallel Opportunities**:
- US1: 5 メソッド追加、5 テスト追加、4 コメント追加（14 タスク並列可能）
- US2 & US3: 全体を並列実行可能
- US4, US5, US6: 全体を並列実行可能
- Polish: Lint と Format を並列実行可能

**Independent Test Criteria**:
- US1: Presentation → Domain/Infrastructure import ゼロ、全テストパス
- US2: TerraformingActivation.ts が 50 行以下、全テストパス
- US3: Repository 統一、キャッシュ動作確認、全テストパス
- US4: テストケース 730 以下、カバレッジ 80%以上維持
- US5: コメント追加・日本語化完了、ファイルサイズ抑制
- US6: get() → getStoreValue、isCancelled フラグ追加、Race Condition 対策統一

**Suggested MVP Scope**: User Story 1 のみ（アーキテクチャ境界修正と再発防止策）

---

## Notes

- **[P] タスク** = 異なるファイル、依存なし
- **[Story] ラベル** = 特定の User Story へのトレーサビリティ
- 各 User Story は独立して完成・テスト可能
- 各タスクまたは論理グループ後にコミット
- 任意の Checkpoint で停止し、Story を独立して検証可能
- 避けるべき: 曖昧なタスク、同一ファイルのコンフリクト、Story の独立性を壊す依存関係
