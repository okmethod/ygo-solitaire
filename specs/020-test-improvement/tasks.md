# Tasks: Domain Layer Test Improvement

**Input**: Design documents from `/specs/020-test-improvement/`
**Prerequisites**: plan.md, spec.md

**Note**: この機能はテスト改善が目的のため、全タスクがテスト作成タスクです。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)

## Path Conventions

- **Source**: `skeleton-app/src/lib/domain/`
- **Tests**: `skeleton-app/tests/unit/domain/`
- **Test Utils**: `skeleton-app/tests/__testUtils__/`

---

## Phase 1: Setup

**Purpose**: カバレッジツール設定の確認と環境整備

- [ ] T001 Verify vitest coverage configuration in `skeleton-app/vitest.config.ts`
- [ ] T002 Add `/coverage/` to `skeleton-app/.gitignore` if not present
- [ ] T003 Run `npm run test:coverage` to establish baseline coverage

**Checkpoint**: カバレッジレポートが生成され、現状の22%が確認できる

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全ユーザーストーリーで共通利用するテストヘルパーの準備

- [ ] T004 Review existing test patterns in `skeleton-app/tests/unit/domain/effects/base/BaseSpellActivation.test.ts`
- [ ] T005 Add synchro material helper functions to `skeleton-app/tests/__testUtils__/gameStateFactory.ts`

**Checkpoint**: テストヘルパーが準備完了、ユーザーストーリー実装開始可能

---

## Phase 3: User Story 1 - テストカバレッジの可視化 (Priority: P1) 🎯 MVP

**Goal**: `npm run test:coverage` でドメイン層のカバレッジ率を数値で確認できる

**Independent Test**: カバレッジコマンド実行後、HTMLレポートでファイル単位のカバレッジが確認できる

### Implementation for User Story 1

- [ ] T006 [US1] Validate coverage report shows domain layer percentages
- [ ] T007 [US1] Document current coverage baseline (22%) in spec notes

**Checkpoint**: カバレッジツールが動作し、改善前のベースラインが記録されている

---

## Phase 4: User Story 2 - GameState/GameProcessing層のテスト追加 (Priority: P2)

**Goal**: ゲームの中核データ構造のテストを追加し、カバレッジを0%から50%以上に向上

**Independent Test**: ActivationContext, EventTimeline, UpdateValidationのテストが全てパス

### Implementation for User Story 2

- [ ] T008 [P] [US2] Create ActivationContext tests in `skeleton-app/tests/unit/domain/models/ActivationContext.test.ts`
  - Test: setActivatedCard, getActivatedCard
  - Test: setTargetCards, getTargetCards
  - Test: setCostCards, getCostCards
  - Test: clearContext
- [ ] T009 [P] [US2] Create EventTimeline tests in `skeleton-app/tests/unit/domain/models/EventTimeline.test.ts`
  - Test: createTimeline
  - Test: addEvent, getEvents
  - Test: getEventsByType
  - Test: clearTimeline
- [ ] T010 [P] [US2] Create UpdateValidation tests in `skeleton-app/tests/unit/domain/models/UpdateValidation.test.ts`
  - Test: createValidationSuccess
  - Test: createValidationError
  - Test: getErrorMessage
- [ ] T011 [US2] Run coverage for models/ and verify 50%+ achieved

**Checkpoint**: GameState/GameProcessing層のカバレッジが50%以上

---

## Phase 5: User Story 3 - Effect基盤クラスのテスト追加 (Priority: P3)

**Goal**: Effect基盤クラスのテストを追加し、カバレッジを0%から50%以上に向上

**Independent Test**: BaseIgnitionEffect, BaseTriggerEffect, BaseContinuousEffectのテストが全てパス

### Implementation for User Story 3

- [ ] T012 [P] [US3] Create BaseIgnitionEffect tests in `skeleton-app/tests/unit/domain/effects/base/BaseIgnitionEffect.test.ts`
  - Create concrete test subclass
  - Test: effectId property
  - Test: effectType property
  - Test: canActivate method
  - Test: buildSteps method
- [ ] T013 [P] [US3] Create BaseTriggerEffect tests in `skeleton-app/tests/unit/domain/effects/base/BaseTriggerEffect.test.ts`
  - Create concrete test subclass
  - Test: triggerType property
  - Test: shouldTrigger method
  - Test: isTriggerEffect type guard
- [ ] T014 [P] [US3] Create BaseContinuousEffect tests in `skeleton-app/tests/unit/domain/effects/base/BaseContinuousEffect.test.ts`
  - Create concrete test subclass
  - Test: ruleId property
  - Test: ruleType property
  - Test: isApplicable method
  - Test: apply method
- [ ] T015 [US3] Run coverage for effects/ and verify 50%+ achieved

**Checkpoint**: Effect基盤クラスのカバレッジが50%以上

---

## Phase 6: User Story 4 - Commands/Rules層テスト追加 (Priority: P4)

**Goal**: 未テストのCommand/Ruleのテストを追加し、カバレッジを80%以上に向上

**Independent Test**: SynchroSummonCommand, SynchroSummonRule, ActivationRuleのテストが全てパス

### Implementation for User Story 4

- [ ] T016 [P] [US4] Create SynchroSummonCommand tests in `skeleton-app/tests/unit/domain/commands/SynchroSummonCommand.test.ts`
  - Test: canExecute with valid synchro materials
  - Test: canExecute with invalid materials (level mismatch)
  - Test: canExecute with no tuner
  - Test: execute performs synchro summon
- [ ] T017 [P] [US4] Create SynchroSummonRule tests in `skeleton-app/tests/unit/domain/rules/SynchroSummonRule.test.ts`
  - Test: canSynchroSummon validation
  - Test: performSynchroSummon state changes
  - Test: level calculation helpers
  - Test: edge cases (single material, max materials)
- [ ] T018 [P] [US4] Create ActivationRule tests in `skeleton-app/tests/unit/domain/rules/ActivationRule.test.ts`
  - Test: placeCardForActivation with spell card
  - Test: placeCardForActivation with different zones
- [ ] T019 [US4] Run coverage for commands/ and rules/ and verify 80%+ achieved

**Checkpoint**: Commands/Rules層のカバレッジが80%以上

---

## Phase 7: Polish & Verification

**Purpose**: 全体カバレッジの確認と最終検証

- [ ] T020 Run full test suite `npm run test:run` and verify all tests pass
- [ ] T021 Run `npm run test:coverage` and verify domain layer coverage is 40%+
- [ ] T022 Run `npm run lint && npm run format` to ensure code quality
- [ ] T023 Update spec.md status from Draft to Complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP
- **User Story 2-4 (Phase 4-6)**: Depends on Foundational - can run in parallel
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - validates tooling works
- **User Story 2 (P2)**: Independent - models layer tests
- **User Story 3 (P3)**: Independent - effects layer tests
- **User Story 4 (P4)**: Depends on T005 (synchro helpers) - commands/rules tests

### Parallel Opportunities

Within each user story, tasks marked [P] can run in parallel:

```
Phase 4 (US2): T008, T009, T010 can run in parallel
Phase 5 (US3): T012, T013, T014 can run in parallel
Phase 6 (US4): T016, T017, T018 can run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Coverage tool works, baseline established
5. Continue with remaining stories

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Coverage visible (MVP!)
3. User Story 2 → models/ coverage improved
4. User Story 3 → effects/ coverage improved
5. User Story 4 → commands/rules coverage improved
6. Polish → Final validation, 40%+ coverage achieved

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- テストパターンは既存の BaseSpellActivation.test.ts を参考にする
