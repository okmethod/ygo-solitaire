---
description: "Task list for Effect Model Implementation"
---

# Tasks: Effect Model Implementation

**Feature Branch**: `008-effect-model`  
**Input**: Design documents from `/Users/shohei/github/ygo-solitaire/specs/008-effect-model/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/effect-model-interfaces.ts

**Tests**: このspecでは既存のテストフレームワーク（Vitest）を使用し、新規モデルの単体テスト・統合テストを追加します。

**Organization**: タスクはUser Storyごとにグループ化され、各ストーリーを独立して実装・テスト可能です。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するUser Story（US1, US2, US3, US4, US5）
- ファイルパスを明示的に記載

## Path Conventions

このプロジェクトは`skeleton-app/`配下にSvelteKitアプリケーションを持つWeb app構成です：
- **Source**: `skeleton-app/src/lib/`
- **Tests**: `skeleton-app/tests/`
- **Domain Layer**: `skeleton-app/src/lib/domain/`
- **Application Layer**: `skeleton-app/src/lib/application/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 効果モデルの基盤となるインターフェースとRegistryの実装

**独立テスト**: Registry Patternが正しく動作し、O(1)ルックアップが可能であることを単体テストで検証

---

## Phase 2: User Story 1 - Developer implements ChainableAction model (Priority: P1) 🎯 MVP基盤

**Goal**: ChainableActionインターフェースを定義し、既存のPotOfGreedEffectを移行することで、他の機能に影響を与えずに単独でテスト可能な効果モデルの基盤を構築する。

**Independent Test**: ChainableActionRegistryにPotOfGreedActionを登録し、canActivate/createActivationSteps/createResolutionStepsの3メソッドが正しく動作することを単体テストで検証。既存のActivateSpellCommandテストも引き続きパスすることを確認。

### Implementation for User Story 1

- [ ] T001 [P] [US1] ChainableActionインターフェースを定義 in skeleton-app/src/lib/domain/models/ChainableAction.ts
- [ ] T002 [P] [US1] ChainableActionRegistryクラスを実装 in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [ ] T003 [P] [US1] GameStateUpdateResultにeffectStepsフィールドを追加 in skeleton-app/src/lib/domain/models/GameStateUpdateResult.ts
- [ ] T004 [P] [US1] EffectResolutionStep.actionシグネチャを同期関数に統一 in skeleton-app/src/lib/domain/effects/EffectResolutionStep.ts
- [ ] T005 [P] [US1] PotOfGreedActionをChainableActionとして実装 in skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts
- [ ] T006 [P] [US1] GracefulCharityActionをChainableActionとして実装 in skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts
- [ ] T007 [P] [US1] ChainableActionRegistry単体テストを作成 in skeleton-app/tests/unit/domain/registries/ChainableActionRegistry.test.ts
- [ ] T008 [P] [US1] PotOfGreedAction単体テストを作成 in skeleton-app/tests/unit/domain/effects/chainable/PotOfGreedAction.test.ts
- [ ] T009 [P] [US1] GracefulCharityAction単体テストを作成 in skeleton-app/tests/unit/domain/effects/chainable/GracefulCharityAction.test.ts
- [ ] T010 [US1] PotOfGreedActionとGracefulCharityActionをChainableActionRegistryに登録 in skeleton-app/src/lib/domain/effects/index.ts
- [ ] T011 [US1] 既存のeffectResolutionStore.confirmCurrentStepからawaitキーワードを削除（同期化対応） in skeleton-app/src/lib/application/stores/effectResolutionStore.svelte.ts

**Checkpoint**: ChainableActionインターフェースと2つの具象実装が完成し、Registryで管理可能。単体テストがすべてパス。

---

## Phase 3: User Story 2 - Developer implements AdditionalRule model (Priority: P1) 🎯 MVP基盤（並行可）

**Goal**: AdditionalRuleインターフェースを定義し、チキンレースの永続効果を実装例として使用することで、永続効果やルール効果を体系的に扱える基盤を構築する。

**Independent Test**: AdditionalRuleRegistryにChickenGameContinuousRuleを登録し、canApply/checkPermissionメソッドが正しく動作することを単体テストで検証。LP差分による条件判定が正しく機能することを確認。

### Implementation for User Story 2

- [ ] T012 [P] [US2] AdditionalRuleインターフェースとRuleCategoryを定義 in skeleton-app/src/lib/domain/models/AdditionalRule.ts
- [ ] T013 [P] [US2] RuleContextインターフェースを定義 in skeleton-app/src/lib/domain/models/RuleContext.ts
- [ ] T014 [P] [US2] AdditionalRuleRegistryクラスを実装 in skeleton-app/src/lib/domain/registries/AdditionalRuleRegistry.ts
- [ ] T015 [P] [US2] ChickenGameContinuousRuleをAdditionalRuleとして実装 in skeleton-app/src/lib/domain/effects/additional/ChickenGameContinuousRule.ts
- [ ] T016 [P] [US2] AdditionalRuleRegistry単体テストを作成 in skeleton-app/tests/unit/domain/registries/AdditionalRuleRegistry.test.ts
- [ ] T017 [P] [US2] ChickenGameContinuousRule単体テストを作成 in skeleton-app/tests/unit/domain/effects/additional/ChickenGameContinuousRule.test.ts
- [ ] T018 [US2] ChickenGameContinuousRuleをAdditionalRuleRegistryに登録 in skeleton-app/src/lib/domain/effects/index.ts

**Checkpoint**: AdditionalRuleインターフェースとチキンレース永続効果実装が完成し、Registryで管理可能。単体テストがすべてパス。

---

## Phase 4: User Story 3 - Developer refactors ActivateSpellCommand to return effectSteps (Priority: P2)

**Goal**: ActivateSpellCommandをリファクタリングし、effectStepsを返すだけの設計に変更することで、Domain LayerがApplication Layerに依存しないClean Architectureを実現する。

**Independent Test**: ActivateSpellCommand.execute()がeffectStepsを含むGameStateUpdateResultを返すことを単体テストで検証。GameFacade経由でeffectResolutionStore.startResolution()が正しく呼ばれることを統合テストで確認。

### Implementation for User Story 3

- [ ] T019 [US3] ActivateSpellCommandのコンストラクタからIEffectResolutionServiceパラメータを削除 in skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts
- [ ] T020 [US3] ActivateSpellCommand.execute()でChainableActionRegistryを優先チェックし、effectStepsを返す実装に変更 in skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts
- [ ] T021 [US3] GameFacade.activateSpell()でeffectStepsを受け取り、effectResolutionStore.startResolution()を呼ぶ実装に変更 in skeleton-app/src/lib/application/GameFacade.ts
- [ ] T022 [US3] ActivateSpellCommand単体テストを修正（DI削除、effectSteps検証追加） in skeleton-app/tests/unit/domain/commands/ActivateSpellCommand.test.ts
- [ ] T023 [US3] NormalSpells統合テストを修正（新旧システム両方を検証） in skeleton-app/tests/integration/card-effects/NormalSpells.test.ts
- [ ] T024 [US3] IEffectResolutionService.tsを削除 in skeleton-app/src/lib/domain/services/IEffectResolutionService.ts
- [ ] T025 [US3] EffectResolutionServiceImpl.tsを削除 in skeleton-app/src/lib/application/services/EffectResolutionServiceImpl.ts

**Checkpoint**: ActivateSpellCommandがeffectStepsを返す設計に変更され、Domain LayerのApplication Layer依存が解消。すべてのテストがパス。

---

## Phase 5: User Story 4 - User activates Chicken Game and uses its effects (Priority: P2)

**Goal**: ユーザーがチキンレースを発動し、その効果（1000LP支払いでドロー/破壊/相手回復）を使用できるようにすることで、効果モデルの実用性を検証する。

**Independent Test**: チキンレースのカード発動と起動効果発動をE2Eテストで確認。LP差分によるダメージ無効化が正しく機能することを統合テストで検証。

### Prerequisites

- [ ] T026 [US4] GameStateにactivatedIgnitionEffectsThisTurnフィールドを追加 in skeleton-app/src/lib/domain/models/GameState.ts
- [ ] T027 [US4] createInitialGameState()でactivatedIgnitionEffectsThisTurnを初期化 in skeleton-app/src/lib/domain/models/GameState.ts

### Implementation for User Story 4

- [ ] T028 [P] [US4] Chicken Gameカードデータを定義してCardDataRegistryに登録 in skeleton-app/src/lib/domain/registries/CardDataRegistry.ts
- [ ] T029 [P] [US4] ChickenGameActivation（カード発動）をChainableActionとして実装 in skeleton-app/src/lib/domain/effects/chainable/ChickenGameActivation.ts
- [ ] T030 [P] [US4] ChickenGameIgnitionEffect（起動効果）をChainableActionとして実装 in skeleton-app/src/lib/domain/effects/chainable/ChickenGameIgnitionEffect.ts
- [ ] T031 [P] [US4] ChickenGameActivation単体テストを作成 in skeleton-app/tests/unit/domain/effects/chainable/ChickenGameActivation.test.ts
- [ ] T032 [P] [US4] ChickenGameIgnitionEffect単体テストを作成（1ターンに1度制限を含む） in skeleton-app/tests/unit/domain/effects/chainable/ChickenGameIgnitionEffect.test.ts
- [ ] T033 [US4] ChickenGameActivationとChickenGameIgnitionEffectをChainableActionRegistryに登録 in skeleton-app/src/lib/domain/effects/index.ts
- [ ] T034 [US4] ChickenGame統合テストを作成（発動、起動効果、永続効果の全体フロー） in skeleton-app/tests/integration/card-effects/ChickenGame.test.ts
- [ ] T035 [US4] AdvancePhaseCommandでactivatedIgnitionEffectsThisTurnをクリアする処理を追加 in skeleton-app/src/lib/domain/commands/AdvancePhaseCommand.ts

**Checkpoint**: チキンレースのすべての効果（発動、起動効果、永続効果）が正しく動作し、E2Eテストでカバー。1ターンに1度制限も機能。

---

## Phase 6: User Story 5 - Developer removes legacy CardEffectRegistry (Priority: P3)

**Goal**: 既存のCardEffectRegistryを削除し、すべての効果をChainableActionRegistryに移行することで、コードベースを整理する。

**Independent Test**: CardEffectRegistryへの参照がゼロであることをgrep検索で確認。すべてのテストがパスすることで既存機能が壊れていないことを検証。

### Implementation for User Story 5

- [ ] T036 [US5] ActivateSpellCommandからCardEffectRegistryへのフォールバック処理を削除 in skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts
- [ ] T037 [US5] CardEffectRegistry.tsを削除 in skeleton-app/src/lib/domain/effects/CardEffectRegistry.ts
- [ ] T038 [P] [US5] 旧CardEffect.tsを削除またはChainableActionへのエイリアス化 in skeleton-app/src/lib/domain/effects/CardEffect.ts
- [ ] T039 [P] [US5] SpellEffect.ts、NormalSpellEffect.tsを削除（bases/ディレクトリ） in skeleton-app/src/lib/domain/effects/bases/
- [ ] T040 [P] [US5] PotOfGreedEffect.ts、GracefulCharityEffect.tsを削除（cards/ディレクトリ） in skeleton-app/src/lib/domain/effects/cards/
- [ ] T041 [US5] プロジェクト全体でCardEffectRegistryへの参照がゼロであることをgrepで確認
- [ ] T042 [US5] すべての既存テストが引き続きパスすることを確認（npm run test:run）

**Checkpoint**: CardEffectRegistry完全削除完了。コードベースが新システム（ChainableActionRegistry）に統一され、すべてのテストがパス。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント更新、コード整理、品質チェック

- [ ] T043 [P] docs/domain/effect-model.mdを更新（実装内容を反映） in docs/domain/effect-model.md
- [ ] T044 [P] ADR-0008を更新（実装完了マーク） in docs/adr/0008-effect-model-and-clean-architecture.md
- [ ] T045 [P] CLAUDE.mdを更新（Active Technologies, Recent Changes） in CLAUDE.md
- [ ] T046 Lint実行（npm run lint）
- [ ] T047 Format実行（npm run format）
- [ ] T048 全テスト実行（npm run test:run）でカバレッジ90%以上を確認
- [ ] T049 quickstart.md実装例の動作確認 in specs/008-effect-model/quickstart.md
- [ ] T050 tasks.mdのすべてのタスクが完了していることを確認 in specs/008-effect-model/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 実装不要（Phase 2に統合）
- **Phase 2 (US1 - ChainableAction)**: 依存なし - すぐに開始可能 🎯 MVP基盤
- **Phase 3 (US2 - AdditionalRule)**: 依存なし - US1と並行実行可能 🎯 MVP基盤
- **Phase 4 (US3 - ActivateSpellCommand refactor)**: US1完了後に実施（ChainableActionRegistryが必要）
- **Phase 5 (US4 - Chicken Game)**: US1, US2, US3完了後に実施（すべての基盤が必要）
- **Phase 6 (US5 - Legacy cleanup)**: US1, US3, US4完了後に実施（すべての移行が必要）
- **Phase 7 (Polish)**: すべてのUser Story完了後

### User Story Dependencies

- **User Story 1 (P1)**: 独立 - すぐに開始可能
- **User Story 2 (P1)**: 独立 - US1と並行可能
- **User Story 3 (P2)**: US1に依存（ChainableActionRegistryが必要）
- **User Story 4 (P2)**: US1, US2, US3に依存（すべての基盤が必要）
- **User Story 5 (P3)**: US1, US3, US4に依存（完全移行後の整理）

### Within Each User Story

- **US1**: インターフェース定義 → Registry実装 → 具象実装 → テスト → 登録
- **US2**: インターフェース定義 → Registry実装 → 具象実装 → テスト → 登録
- **US3**: コマンド修正 → GameFacade修正 → テスト修正 → 削除
- **US4**: GameState拡張 → カードデータ登録 → 効果実装 → テスト → 統合
- **US5**: フォールバック削除 → ファイル削除 → 検証

### Parallel Opportunities

**Phase 2 (US1)**:
- T001, T002, T003, T004（インターフェース・Registry定義）を並列実行可能
- T005, T006（具象実装）を並列実行可能
- T007, T008, T009（テスト）を並列実行可能

**Phase 3 (US2)**:
- T012, T013, T014（インターフェース・Registry定義）を並列実行可能
- T015, T016, T017（具象実装・テスト）を並列実行可能

**Phase 2とPhase 3**:
- US1とUS2は完全に独立しており、並行実行可能

**Phase 5 (US4)**:
- T028, T029, T030（カードデータ・効果実装）を並列実行可能
- T031, T032（テスト）を並列実行可能

**Phase 6 (US5)**:
- T038, T039, T040（削除タスク）を並列実行可能

**Phase 7 (Polish)**:
- T043, T044, T045（ドキュメント更新）を並列実行可能

---

## Parallel Example: User Story 1

```bash
# インターフェース・Registry定義を並列実行:
Task: "ChainableActionインターフェースを定義 in skeleton-app/src/lib/domain/models/ChainableAction.ts"
Task: "ChainableActionRegistryクラスを実装 in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts"
Task: "GameStateUpdateResultにeffectStepsフィールドを追加 in skeleton-app/src/lib/domain/models/GameStateUpdateResult.ts"
Task: "EffectResolutionStep.actionシグネチャを同期関数に統一 in skeleton-app/src/lib/domain/effects/EffectResolutionStep.ts"

# 具象実装を並列実行:
Task: "PotOfGreedActionをChainableActionとして実装 in skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts"
Task: "GracefulCharityActionをChainableActionとして実装 in skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts"

# テストを並列実行:
Task: "ChainableActionRegistry単体テストを作成 in skeleton-app/tests/unit/domain/registries/ChainableActionRegistry.test.ts"
Task: "PotOfGreedAction単体テストを作成 in skeleton-app/tests/unit/domain/effects/chainable/PotOfGreedAction.test.ts"
Task: "GracefulCharityAction単体テストを作成 in skeleton-app/tests/unit/domain/effects/chainable/GracefulCharityAction.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. **Phase 2 + 3を並行実行**: ChainableAction と AdditionalRule の基盤実装
2. **STOP and VALIDATE**: 両方の基盤が正しく動作することを単体テストで検証
3. **Phase 4に進む**: ActivateSpellCommandのリファクタリング
4. **STOP and VALIDATE**: 既存機能が壊れていないことを確認
5. **Phase 5に進む**: Chicken Gameの実装で効果モデルを検証
6. **Deploy/Demo**: 新効果モデルが実用可能であることを示す

### Incremental Delivery

1. **US1 + US2完了** → ChainableAction/AdditionalRule基盤完成 → テスト → コミット
2. **US3完了** → ActivateSpellCommandリファクタリング完了 → テスト → コミット
3. **US4完了** → Chicken Game実装完了 → E2Eテスト → コミット → Demo可能
4. **US5完了** → レガシーコード削除 → 全テスト → コミット → 整理完了

### Parallel Team Strategy

複数開発者がいる場合：

1. **Developer A**: User Story 1（ChainableAction基盤）
2. **Developer B**: User Story 2（AdditionalRule基盤）並行実行可能
3. US1とUS2が完了後:
   - **Developer A**: User Story 3（ActivateSpellCommand）
   - **Developer B**: User Story 4の準備（GameState拡張、カードデータ）
4. US3完了後:
   - **Developer A**: User Story 5（レガシー削除）
   - **Developer B**: User Story 4（Chicken Game実装）
5. 両方完了後、Phase 7（Polish）を協力して実施

---

## Notes

- [P]タスク: 異なるファイル、依存関係なし
- [Story]ラベル: タスクがどのUser Storyに属するかをトレース
- 各User Storyは独立して完了・テスト可能
- Checkpointで各ストーリーを個別に検証
- コミットは各タスクまたは論理的なグループ単位で実施
- 避けるべき: 曖昧なタスク、同じファイルへの競合、ストーリー間の独立性を壊す依存関係
- テストカバレッジ目標: 90%以上（既存と同等）、新規モデルは100%推奨
- すべてのタスクにはファイルパスを明示

---

## Summary

**Total Tasks**: 50タスク

**Task Count per User Story**:
- User Story 1 (ChainableAction): 11タスク
- User Story 2 (AdditionalRule): 7タスク
- User Story 3 (ActivateSpellCommand refactor): 7タスク
- User Story 4 (Chicken Game): 8タスク
- User Story 5 (Legacy cleanup): 7タスク
- Polish & Cross-Cutting: 8タスク

**Parallel Opportunities**:
- US1とUS2は完全に並行実行可能（合計18タスク）
- 各Phase内で [P] マークのタスクを並列実行可能（合計28タスク）
- 異なるファイルを扱うため、コンフリクトなし

**Independent Test Criteria**:
- US1: ChainableAction単体テスト、Registry単体テスト
- US2: AdditionalRule単体テスト、Registry単体テスト（カテゴリフィルタ、collectActiveRules）
- US3: ActivateSpellCommand単体テスト（effectSteps検証）、統合テスト
- US4: Chicken Game E2Eテスト、1ターンに1度制限テスト
- US5: grep検索でCardEffectRegistryへの参照ゼロ確認、全テストパス

**Suggested MVP Scope**:
- **Minimum**: User Story 1 + 2（基盤のみ）
- **Recommended**: User Story 1 + 2 + 3（ActivateSpellCommandリファクタリングまで）
- **Full Demo**: User Story 1 + 2 + 3 + 4（Chicken Game実装で効果モデル検証）

**Format Validation**: ✅ すべてのタスクがチェックリストフォーマットに準拠（checkbox, ID, [P]/[Story]ラベル, ファイルパス）
