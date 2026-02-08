# Tasks: 魔力カウンターシステムと永続効果トリガー機構

**Input**: Design documents from `/specs/017-magic-counter-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: ユニットテスト・統合テスト・E2Eテストを含む（plan.mdで明示的に要求）

**Organization**: タスクはplan.mdのImplementation Phasesに基づいて構成され、spec.mdのユーザーストーリー（P1, P2）に対応

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3, US4）
- ファイルパスは正確に記載

## Path Conventions

- **Project root**: `skeleton-app/src/lib/`
- **Domain layer**: `skeleton-app/src/lib/domain/`
- **Presentation layer**: `skeleton-app/src/lib/presentation/`
- **Tests**: `skeleton-app/src/tests/`

---

## Phase 1: Setup - データモデル基盤

**Purpose**: カウンターシステムの基盤となるデータモデルとヘルパー関数を実装

- [x] T001 [P] Counter.tsを新規作成（CounterType, CounterState型定義）in skeleton-app/src/lib/domain/models/Counter.ts
- [x] T002 [P] Counter.tsにヘルパー関数を実装（addCounter, removeCounter, getCounterCount）in skeleton-app/src/lib/domain/models/Counter.ts
- [x] T003 CardInstanceにcountersフィールドを追加 in skeleton-app/src/lib/domain/models/Card.ts
- [x] T004 GameStateのCardInstance生成箇所で空のカウンター配列を初期化 in skeleton-app/src/lib/domain/models/GameState.ts
- [x] T005 [P] カウンター操作のユニットテストを作成 in skeleton-app/tests/unit/domain/models/Counter.test.ts

**Checkpoint**: カウンターの追加・削除・取得がテストで検証される

---

## Phase 2: Foundational - トリガー機構

**Purpose**: 永続効果がイベントに反応して自動実行されるトリガー機構を実装

**⚠️ CRITICAL**: この機構がないとUS1（魔力カウンター自動蓄積）を実装できない

- [x] T006 [P] RuleContextにTriggerEvent型を追加 in skeleton-app/src/lib/domain/models/RuleContext.ts
- [x] T007 [P] RuleContextにトリガー関連フィールドを追加（triggerEvent, triggerSourceCardId, triggerSourceInstanceId）in skeleton-app/src/lib/domain/models/RuleContext.ts
- [x] T008 AdditionalRuleにTriggerRuleカテゴリを追加 in skeleton-app/src/lib/domain/models/AdditionalRule.ts
- [x] T009 AdditionalRuleにtriggersとonTriggerメソッドを追加 in skeleton-app/src/lib/domain/models/AdditionalRule.ts
- [x] T010 AdditionalRuleRegistryにcollectTriggerRulesメソッドを実装 in skeleton-app/src/lib/domain/registries/AdditionalRuleRegistry.ts
- [x] T011 AdditionalRuleRegistryにexecuteTriggerRulesメソッドを実装 in skeleton-app/src/lib/domain/registries/AdditionalRuleRegistry.ts
- [x] T012 [P] トリガー機構のユニットテストを作成 in skeleton-app/tests/unit/domain/registries/AdditionalRuleRegistry.test.ts

**Checkpoint**: トリガー発火とルール収集の機構がテストで検証される

---

## Phase 3: User Story 1 - 魔力カウンターの自動蓄積 (Priority: P1) 🎯 MVP

**Goal**: 王立魔法図書館がフィールドに存在する状態で魔法カードを発動すると、魔力カウンターが自動的に1つ置かれる

**Independent Test**: 王立魔法図書館をフィールドに配置し、任意の魔法カードを発動することで、カウンターが1つ増えることを確認

### Implementation for User Story 1

- [x] T013 [US1] RoyalMagicalLibraryContinuousEffectを新規実装 in skeleton-app/src/lib/domain/effects/rules/monsters/RoyalMagicalLibraryContinuousEffect.ts
- [x] T014 [US1] RoyalMagicalLibraryContinuousEffectをAdditionalRuleRegistryに登録 in skeleton-app/src/lib/domain/effects/rules/index.ts
- [x] T015 [US1] ActivateSpellCommandにトリガー発火処理を追加 in skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts
- [x] T016 [P] [US1] 永続効果のユニットテストを作成 in skeleton-app/tests/unit/domain/effects/rules/monster/RoyalMagicalLibraryContinuousEffect.test.ts
- [x] T017 [US1] 魔法発動時のカウンター蓄積の統合テストを作成 in skeleton-app/tests/integration/counter-accumulation.test.ts

**Checkpoint**: 魔法カード発動時に王立魔法図書館にカウンターが自動蓄積される（上限3個）

---

## Phase 4: User Story 2 - 魔力カウンターのUI表示 (Priority: P1)

**Goal**: カードに置かれている魔力カウンターの数を視覚的に表示する

**Independent Test**: 魔力カウンターが1個以上あるカードをフィールドで表示し、カウンター数が見えることを確認

### Implementation for User Story 2

- [ ] T018 [P] [US2] SpellCounterBadge.svelteを新規作成 in skeleton-app/src/lib/presentation/components/atoms/SpellCounterBadge.svelte
- [ ] T019 [US2] DuelField.svelteにカウンター表示を統合 in skeleton-app/src/routes/(auth)/simulator/[deckId]/\_components/DuelField.svelte
- [x] T020 [P] [US2] カウンター表示のE2Eテストを作成 - スキップ（ランダム性のため自動E2Eテストが困難）

**Checkpoint**: フィールド上のカードに魔力カウンター数が視覚的に表示される

---

## Phase 5: User Story 3 - 複数体の王立魔法図書館の独立管理 (Priority: P2)

**Goal**: フィールドに2体以上の王立魔法図書館を配置している場合、それぞれが独立してカウンターを蓄積する

**Independent Test**: 2体の王立魔法図書館を配置し、魔法カードを発動した際に両方に1個ずつカウンターが置かれることを確認

### Implementation for User Story 3

- [x] T021 [P] [US3] 複数体の王立魔法図書館が存在する場合のユニットテストを作成 in skeleton-app/src/tests/unit/domain/effects/rules/RoyalMagicalLibraryContinuousEffect.test.ts
- [x] T022 [US3] 各インスタンスの独立性を検証する統合テストを作成 in skeleton-app/src/tests/integration/multiple-library-instances.test.ts

**Checkpoint**: 複数体の王立魔法図書館が各自独立してカウンターを管理できる

---

## Phase 6: User Story 4 - カウンター消費によるドロー効果 (Priority: P2)

**Goal**: 王立魔法図書館の起動効果を発動し、魔力カウンターを3つ消費して1枚ドローできる

**Independent Test**: 魔力カウンターが3個以上ある王立魔法図書館の起動効果を発動し、カウンターが3個減り、1枚ドローすることを確認

### Implementation for User Story 4

- [x] T023 [P] [US4] removeCounterStepをcounters.tsに新規実装 in skeleton-app/src/lib/domain/effects/steps/counters.ts
- [x] T024 [US4] RoyalMagicalLibraryIgnitionEffectにカウンター消費ロジックを追加（individualConditions）in skeleton-app/src/lib/domain/effects/actions/Ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect.ts
- [x] T025 [US4] RoyalMagicalLibraryIgnitionEffectにカウンター消費ステップを追加（individualActivationSteps）in skeleton-app/src/lib/domain/effects/actions/Ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect.ts
- [x] T026 [P] [US4] 起動効果のユニットテストを更新 in skeleton-app/src/tests/unit/domain/effects/actions/RoyalMagicalLibraryIgnitionEffect.test.ts
- [x] T027 [US4] カウンター消費→ドローの統合テストを作成 in skeleton-app/src/tests/integration/counter-consumption-draw.test.ts

**Checkpoint**: カウンター3個消費でドロー効果が発動する

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: コードレビュー、リファクタリング、ドキュメント更新

- [ ] T028 [P] コードレビュー・リファクタリング（重複コードの除去、命名の改善）
- [ ] T029 [P] ドキュメント更新（effect-model.mdに永続効果トリガー機構を追記）in docs/architecture/effect-model.md
- [ ] T030 全テスト実行と最終検証（npm run test:run && npm run test:e2e）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし - すぐに開始可能
- **Phase 2 (Foundational)**: Phase 1完了後 - 全ユーザーストーリーをブロック
- **Phase 3 (US1)**: Phase 2完了後 - MVP機能
- **Phase 4 (US2)**: Phase 3完了後（カウンターが蓄積されないと表示確認できない）
- **Phase 5 (US3)**: Phase 3完了後 - US1と同じ永続効果の検証
- **Phase 6 (US4)**: Phase 3完了後 - カウンター蓄積機能が必要
- **Phase 7 (Polish)**: 全ユーザーストーリー完了後

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2（Foundational）完了後に開始可能 - 他ストーリーに依存しない
- **User Story 2 (P1)**: US1完了後（カウンターが存在しないと表示確認不可）
- **User Story 3 (P2)**: US1完了後（同じ永続効果機構を使用）
- **User Story 4 (P2)**: US1完了後（カウンター蓄積が前提）

### Within Each Phase

- テストは実装と並行して作成可能
- モデル変更 → レジストリ変更 → コマンド変更の順序
- [P]マークのタスクは並列実行可能

### Parallel Opportunities

- T001, T002: Counter.ts内のタスクは順次だが、他ファイルとは並列可能
- T006, T007: RuleContext変更は並列可能
- T016, T018, T021, T023, T026: テスト作成は実装と並列可能

---

## Parallel Example: Phase 1 Setup

```bash
# 以下のタスクを並列実行可能:
Task: "T001 Counter.ts型定義"
Task: "T005 カウンター操作のユニットテスト作成"
# T001完了後:
Task: "T002 ヘルパー関数実装"
Task: "T003 CardInstance変更"
Task: "T004 GameState初期化処理"
```

---

## Parallel Example: Phase 3 User Story 1

```bash
# T013完了後、以下を並列実行可能:
Task: "T014 Registry登録"
Task: "T016 ユニットテスト作成"
# T015（ActivateSpellCommand更新）完了後:
Task: "T017 統合テスト作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Phase 1完了: データモデル基盤
2. Phase 2完了: トリガー機構（CRITICAL - 全ストーリーをブロック）
3. Phase 3完了: US1 - 魔力カウンター自動蓄積
4. Phase 4完了: US2 - UI表示
5. **STOP and VALIDATE**: 魔法発動 → カウンター蓄積 → UI表示の流れを確認
6. デプロイ/デモ可能（MVP!）

### Incremental Delivery

1. Setup + Foundational → 基盤完成
2. US1追加 → 独立テスト → デプロイ（コア機能）
3. US2追加 → 独立テスト → デプロイ（視覚的フィードバック）
4. US3追加 → 独立テスト → デプロイ（複数体対応）
5. US4追加 → 独立テスト → デプロイ（完全な機能）
6. 各ストーリーが独立して価値を追加

---

## Notes

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベル = 特定のユーザーストーリーへのトレーサビリティ
- 各ユーザーストーリーは独立して完了・テスト可能
- テスト失敗を確認してから実装
- タスクまたは論理グループごとにコミット
- チェックポイントで独立してストーリーを検証
- 避けるべき: 曖昧なタスク、同一ファイルの競合、独立性を損なうストーリー間依存
