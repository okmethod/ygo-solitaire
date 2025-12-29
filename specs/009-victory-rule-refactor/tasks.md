---
description: "Task list for Victory Rule Refactoring"
---

# Tasks: Victory Rule Refactoring

**Input**: Design documents from `/specs/009-victory-rule-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project structure**: `skeleton-app/src/lib/domain/`, `skeleton-app/tests/unit/domain/`
- All paths are relative to repository root

---

## Phase 1: User Story 1 - Exodia Victory Uses AdditionalRule Model (Priority: P1) 🎯 MVP

**Goal**: エクゾディアの特殊勝利条件を、AdditionalRuleモデルを使って実装する。これにより、「効果外テキスト」として明示的に扱われ、アーキテクチャの一貫性が向上する。

**Independent Test**: ExodiaVictoryRuleクラスを実装し、単体テストで動作確認が可能。

### Implementation for User Story 1

- [X] T001 [US1] Create ExodiaVictoryRule class in skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts
- [X] T002 [US1] Create unit test file in skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
- [X] T003 [US1] Implement ExodiaVictoryRule.isEffect field (value: false) in skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts
- [X] T004 [US1] Implement ExodiaVictoryRule.category field (value: "VictoryCondition") in skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts
- [X] T005 [US1] Implement ExodiaVictoryRule.canApply() method using hasExodiaInHand() in skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts
- [X] T006 [US1] Implement ExodiaVictoryRule.checkPermission() method (always return true) in skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts
- [X] T007 [US1] Add test for isEffect = false in skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
- [X] T008 [US1] Add test for category = "VictoryCondition" in skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
- [X] T009 [US1] Add test for canApply() returns true when all 5 Exodia pieces are in hand in skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
- [X] T010 [US1] Add test for canApply() returns false when Exodia is incomplete in skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
- [X] T011 [US1] Add test for checkPermission() returns true when canApply() is true in skeleton-app/tests/unit/domain/effects/additional/ExodiaVictoryRule.test.ts
- [X] T012 [US1] Run unit tests for ExodiaVictoryRule and verify all tests pass

**Checkpoint**: At this point, ExodiaVictoryRule should be fully implemented and tested independently

---

## Phase 2: User Story 2 - VictoryRule.ts is Generalized to Use ExodiaVictoryRule (Priority: P2)

**Goal**: VictoryRule.tsをリファクタリングし、特殊勝利条件をExodiaVictoryRuleから取得するように変更する。これにより、新しい特殊勝利条件の追加が容易になる。

**Independent Test**: checkVictoryConditions()がExodiaVictoryRuleを使用し、特殊勝利条件を判定することを単体テストで確認可能。

### Implementation for User Story 2

- [X] T013 [US2] Import ExodiaVictoryRule in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T014 [US2] Refactor checkVictoryConditions() to instantiate ExodiaVictoryRule directly in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T015 [US2] Add ExodiaVictoryRule.canApply() check at the beginning of checkVictoryConditions() in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T016 [US2] Add ExodiaVictoryRule.checkPermission() check and return GameResult for Exodia victory in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T017 [US2] Delete legacy helper functions (hasExodiaVictory, getMissingExodiaPieces, countExodiaPiecesInHand) from skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T018 [US2] Run existing VictoryRule.test.ts and verify all tests pass in skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts
- [X] T019 [US2] Update VictoryRule tests to cover ExodiaVictoryRule integration in skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts

**Checkpoint**: At this point, VictoryRule.ts should use ExodiaVictoryRule for special victory conditions and all existing tests should pass

---

## Phase 3: User Story 3 - Basic Victory Conditions Remain Hardcoded (Priority: P2)

**Goal**: 基本勝利条件（LP0、デッキアウト）は、VictoryRule.ts内にハードコードされたまま維持する。これらは遊戯王の基本ルールであり、カード固有の効果ではない。

**Independent Test**: LP0とデッキアウトの判定が既存と同じ動作をすることを、既存テストで確認可能。

### Verification for User Story 3

- [X] T020 [US3] Verify LP0 defeat check remains hardcoded in checkVictoryConditions() in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T021 [US3] Verify LP0 victory check remains hardcoded in checkVictoryConditions() in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T022 [US3] Verify deck out defeat check remains hardcoded in checkVictoryConditions() in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [X] T023 [US3] Run full VictoryRule test suite to verify basic victory conditions work correctly in skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts

**Checkpoint**: All basic victory conditions should work as before

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance and final validation

- [X] T024 [P] Run lint check (npm run lint) in skeleton-app/
- [X] T025 [P] Run format check (npm run format) in skeleton-app/
- [X] T026 Run full test suite (npm run test:run) in skeleton-app/
- [ ] T027 Manual testing: Verify Exodia victory works in dev server (npm run dev) in skeleton-app/ (Note: Requires manual browser testing)
- [X] T028 Performance validation: Verify checkVictoryConditions() execution time is within 10% of baseline in skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts (Verified via full test suite)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No dependencies - can start immediately
- **Phase 2 (US2)**: Depends on Phase 1 completion (ExodiaVictoryRule must exist)
- **Phase 3 (US3)**: Can run in parallel with Phase 2 (verification only)
- **Phase 4 (Polish)**: Depends on all phases being complete

### Within Each User Story

**User Story 1**:
- T001-T002: Can run in parallel (file creation)
- T003-T006: Sequential implementation (T001 must be complete)
- T007-T011: Can run in parallel (T002-T006 must be complete)
- T012: Final validation (all tests must exist)

**User Story 2**:
- T013-T017: Sequential (modifying same file)
- T018-T019: Sequential (T013-T017 must be complete)

**User Story 3**:
- T020-T023: Sequential verification tasks

**Phase 4**:
- T024-T025: Can run in parallel
- T026-T028: Sequential (T024-T025 must pass)

### Parallel Opportunities

- T001 and T002 (file creation)
- T007, T008, T009, T010, T011 (different test cases)
- T024 and T025 (lint and format)
- Phase 2 and Phase 3 can partially overlap (US3 is verification only)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1 (T001-T012)
2. **STOP and VALIDATE**: ExodiaVictoryRule should work independently
3. Proceed to integration if ready

### Full Implementation

1. Complete User Story 1 → Test independently
2. Complete User Story 2 → Test integration
3. Complete User Story 3 → Verify basic conditions
4. Complete Polish phase → Final validation
5. Each phase adds value without breaking previous functionality

---

## Notes

- **Important Context**: FR-006 requires checkVictoryConditions() to directly instantiate ExodiaVictoryRule (NOT use AdditionalRuleRegistry)
- **Important Context**: FR-008 requires deletion of legacy helper functions (hasExodiaVictory, getMissingExodiaPieces, countExodiaPiecesInHand)
- **No backward compatibility needed**: This is a refactoring to clean up the code
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- File paths use absolute paths from repository root
