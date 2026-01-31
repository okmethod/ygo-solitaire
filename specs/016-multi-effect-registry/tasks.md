# Tasks: 複数効果登録対応レジストリ

**Input**: Design documents from `/specs/016-multi-effect-registry/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are included to verify the implementation works correctly.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `skeleton-app/`
- **Source**: `skeleton-app/src/lib/`
- **Tests**: `skeleton-app/src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 型定義とインターフェースの基盤整備

- [x] T001 [P] Create EffectCategory type in skeleton-app/src/lib/domain/models/EffectCategory.ts
- [x] T002 [P] Add effectCategory and effectId properties to ChainableAction interface in skeleton-app/src/lib/domain/models/ChainableAction.ts
- [x] T003 [P] Create CardEffectEntry interface in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ChainableActionRegistry の新API実装（全ユーザーストーリーの前提条件）

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement registerActivation() method in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [x] T005 Implement registerIgnition() method in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [x] T006 Implement getActivation() method in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [x] T007 Implement getIgnitionEffects() method in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [x] T008 Implement hasIgnitionEffects() method in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [x] T009 Remove deprecated get() method from skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 起動効果の汎用発動 (Priority: P1) MVP

**Goal**: フィールド上のカードの起動効果を汎用的に発動できるようにする。ActivateIgnitionEffectCommand からハードコードを除去する。

**Independent Test**: 《王立魔法図書館》の起動効果を追加し、ActivateIgnitionEffectCommand で正常に発動できることを確認する。

### Implementation for User Story 1

- [x] T010 [P] [US1] Add effectCategory and effectId to ChickenGameActivation in skeleton-app/src/lib/domain/effects/actions/spells/individuals/ChickenGameActivation.ts
- [x] T011 [P] [US1] Add effectCategory and effectId to ChickenGameIgnitionEffect in skeleton-app/src/lib/domain/effects/actions/spells/individuals/ChickenGameIgnitionEffect.ts
- [x] T012 [P] [US1] Add effectCategory and effectId to all existing ChainableAction implementations in skeleton-app/src/lib/domain/effects/actions/
- [x] T013 [US1] Refactor ActivateIgnitionEffectCommand to use getIgnitionEffects() API in skeleton-app/src/lib/domain/commands/ActivateIgnitionEffectCommand.ts
- [x] T014 [US1] Remove ChickenGame-specific hardcoded logic from ActivateIgnitionEffectCommand in skeleton-app/src/lib/domain/commands/ActivateIgnitionEffectCommand.ts
- [x] T015 [US1] Update ActivateIgnitionEffectCommand tests in skeleton-app/src/tests/unit/domain/commands/ActivateIgnitionEffectCommand.test.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - any card with registered ignition effects can be activated via ActivateIgnitionEffectCommand

---

## Phase 4: User Story 2 - 発動時効果と起動効果の共存 (Priority: P1)

**Goal**: 1つのカードに発動時効果と起動効果を両方登録できるようにする。《チキンレース》で検証。

**Independent Test**: 《チキンレース》に発動時効果（ChickenGameActivation）と起動効果（ChickenGameIgnitionEffect）を両方登録し、それぞれが独立して動作することを確認する。

### Implementation for User Story 2

- [x] T016 [US2] Update effect registration to use registerActivation/registerIgnition in skeleton-app/src/lib/domain/effects/index.ts
- [x] T017 [US2] Migrate ActivateSpellCommand to use getActivation() API in skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts
- [x] T018 [US2] Update ChainableActionRegistry tests for new API in skeleton-app/src/tests/unit/domain/registries/ChainableActionRegistry.test.ts
- [x] T019 [US2] Add integration test for ChickenGame activation and ignition coexistence in skeleton-app/src/tests/unit/domain/registries/ChainableActionRegistry.test.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - cards can have both activation and ignition effects registered

---

## Phase 5: User Story 3 - 王立魔法図書館の起動効果（簡略版） (Priority: P2)

**Goal**: 《王立魔法図書館》の起動効果（1ドロー）を実装し、起動効果の汎用化が正しく動作することを検証する。

**Independent Test**: 《王立魔法図書館》がモンスターゾーンに存在する状態で、起動効果を発動して1ドローできることを確認する。

### Implementation for User Story 3

- [x] T020 [P] [US3] Create RoyalMagicalLibraryIgnitionEffect class in skeleton-app/src/lib/domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect.ts
- [x] T021 [P] [US3] Register RoyalMagicalLibrary card data (if not exists) in skeleton-app/src/lib/domain/data/
- [x] T022 [US3] Register RoyalMagicalLibraryIgnitionEffect in skeleton-app/src/lib/domain/effects/index.ts
- [x] T023 [US3] Add unit test for RoyalMagicalLibraryIgnitionEffect in skeleton-app/tests/unit/domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect.test.ts
- [x] T024 [US3] Add integration test verifying RoyalMagicalLibrary ignition via ActivateIgnitionEffectCommand in skeleton-app/tests/unit/domain/commands/ActivateIgnitionEffectCommand.test.ts

**Checkpoint**: All user stories should now be independently functional - both ChickenGame and RoyalMagicalLibrary ignition effects work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: クリーンアップと品質確認

- [x] T025 [P] Remove any unused code or deprecated methods
- [x] T026 [P] Verify all existing tests pass with npm run test:run
- [x] T027 Run npm run lint && npm run format to ensure code quality
- [x] T028 Update docs if needed (only if architectural changes require documentation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority and closely related
  - US3 depends on US1/US2 completion for registry infrastructure
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core refactoring of ActivateIgnitionEffectCommand
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Closely related to US1, can proceed in parallel on different files
- **User Story 3 (P2)**: Depends on US1/US2 completion - Validates the generic ignition effect system works

### Within Each User Story

- Models/types before services/commands
- Core implementation before integration
- Implementation before tests
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different files)
- T010, T011, T012 can run in parallel (different effect files)
- T020, T021 can run in parallel (different files)
- T025, T026 can run in parallel

---

## Parallel Example: Phase 1

```bash
# Launch all Setup tasks together:
Task: "Create EffectCategory type in skeleton-app/src/lib/domain/models/EffectCategory.ts"
Task: "Add effectCategory and effectId properties to ChainableAction interface"
Task: "Create CardEffectEntry interface"
```

---

## Parallel Example: User Story 1

```bash
# Launch all effect updates together:
Task: "Add effectCategory and effectId to ChickenGameActivation"
Task: "Add effectCategory and effectId to ChickenGameIgnitionEffect"
Task: "Add effectCategory and effectId to all existing ChainableAction implementations"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (型定義)
2. Complete Phase 2: Foundational (新API実装)
3. Complete Phase 3: User Story 1 (ハードコード除去)
4. Complete Phase 4: User Story 2 (activation/ignition共存)
5. **STOP and VALIDATE**: Test ChickenGame with both effects
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> ActivateIgnitionEffectCommand refactored
3. Add User Story 2 -> Test independently -> ChickenGame works with both effects (MVP!)
4. Add User Story 3 -> Test independently -> RoyalMagicalLibrary validates generic system
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 and US2 are both P1 and closely interrelated - implement together for MVP
- US3 validates the design works for monster cards (not just spell cards)
