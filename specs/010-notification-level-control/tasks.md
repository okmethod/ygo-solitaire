# Tasks: Effect Resolution Notification Control

**Branch**: `010-notification-level-control`
**Input**: Design documents from `/specs/010-notification-level-control/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: NOT included (not explicitly requested in spec.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app (SvelteKit): `skeleton-app/src/lib/` (Domain/Application/Presentation layers)
- Tests: `skeleton-app/tests/unit/`, `skeleton-app/tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Breaking change - rename title/message to summary/description across all existing code

**Note**: Based on research.md Q7, we rename `title`/`message` to `summary`/`description` to better reflect domain knowledge rather than UI implementation details.

- [x] T001 Rename EffectResolutionStep properties: title → summary, message → description in skeleton-app/src/lib/domain/models/EffectResolutionStep.ts
- [x] T002 [P] Update all ChainableAction implementations to use summary/description in skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts
- [x] T003 [P] Update all ChainableAction implementations to use summary/description in skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts
- [x] T004 [P] Update all ChainableAction implementations to use summary/description in skeleton-app/src/lib/domain/effects/chainable/CardDestructionAction.ts (N/A - file does not exist, updated ChickenGameIgnitionEffect instead)
- [x] T005 [P] Update all ChainableAction implementations to use summary/description in skeleton-app/src/lib/domain/effects/chainable/UpstartGoblinAction.ts (N/A - file does not exist)
- [x] T006 Update effectResolutionStore to use summary/description in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T007 Update EffectResolutionModal component to use summary/description props in skeleton-app/src/lib/presentation/components/modals/EffectResolutionModal.svelte
- [x] T008 Update CardSelectionModal component if needed in skeleton-app/src/lib/presentation/components/modals/CardSelectionModal.svelte
- [x] T009 Run lint and format: npm run lint && npm run format in skeleton-app/
- [x] T010 Verify existing tests pass with renamed properties: npm run test:run in skeleton-app/

**Checkpoint**: title/message renamed to summary/description - all existing code updated and tests passing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add NotificationLevel type and extend EffectResolutionStep interface (Domain layer)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Add NotificationLevel type definition in skeleton-app/src/lib/domain/models/EffectResolutionStep.ts (type NotificationLevel = "silent" | "info" | "interactive")
- [x] T012 Add notificationLevel optional property to EffectResolutionStep interface in skeleton-app/src/lib/domain/models/EffectResolutionStep.ts
- [x] T013 Add NotificationHandler interface in skeleton-app/src/lib/application/stores/effectResolutionStore.ts (showInfo and showInteractive methods)
- [x] T014 Add notificationHandler field to EffectResolutionState in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T015 Implement registerNotificationHandler method in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T016 Run lint and format: npm run lint && npm run format in skeleton-app/
- [x] T017 Verify types compile without errors: npm run build in skeleton-app/

**Checkpoint**: Foundation ready - NotificationLevel type and NotificationHandler interface defined

---

## Phase 3: User Story 1 - Informational notifications use non-blocking toast (Priority: P1) 🎯 MVP

**Goal**: When a card effect performs an automated action (drawing cards, sending cards to graveyard), the user sees a brief toast notification that doesn't interrupt gameplay flow.

**Independent Test**: Activate "Pot of Greed" (draws 2 cards, sends spell to graveyard) and verify that toast notifications appear instead of modal dialogs, and gameplay continues automatically.

### Implementation for User Story 1

- [x] T018 [US1] Modify confirmCurrentStep to handle "info" notification level (call notificationHandler.showInfo) in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T019 [US1] Add 300ms delay after showInfo call for toast visibility in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T020 [US1] Extend toaster.ts with showInfoToast function (accepts title and message) in skeleton-app/src/lib/presentation/utils/toaster.ts
- [x] T021 [US1] Implement NotificationHandler in +page.svelte (showInfo uses toaster.success) in skeleton-app/src/routes/+page.svelte
- [x] T022 [US1] Register NotificationHandler in onMount of +page.svelte in skeleton-app/src/routes/+page.svelte
- [x] T023 [US1] Add notificationLevel: "info" to PotOfGreedAction draw step in skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts
- [x] T024 [US1] Add notificationLevel: "info" to PotOfGreedAction graveyard step in skeleton-app/src/lib/domain/effects/chainable/PotOfGreedAction.ts
- [x] T025 [US1] Run lint and format: npm run lint && npm run format in skeleton-app/
- [x] T026 [US1] Manual test: Activate Pot of Greed and verify 0 modals, 2 toasts appear

**Checkpoint**: At this point, User Story 1 should be fully functional - Pot of Greed shows toast notifications instead of modals

---

## Phase 4: User Story 2 - Interactive notifications use blocking modal (Priority: P1)

**Goal**: When a card effect requires user input (selecting cards to discard, choosing targets), the user sees a modal dialog that waits for their decision before continuing.

**Independent Test**: Activate "Graceful Charity" (draw 3, then discard 2) and verify that the card selection step shows a modal that blocks until the user selects 2 cards to discard.

### Implementation for User Story 2

- [x] T027 [US2] Modify confirmCurrentStep to handle "interactive" notification level (call notificationHandler.showInteractive) in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T028 [US2] Integrate existing cardSelectionConfig flow into "interactive" level handling in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T029 [US2] Implement showInteractive in NotificationHandler (reuse existing EffectResolutionModal logic) in skeleton-app/src/routes/+page.svelte
- [x] T030 [US2] Add notificationLevel: "info" to GracefulCharityAction draw step in skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts
- [x] T031 [US2] Add notificationLevel: "interactive" to GracefulCharityAction discard step in skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts
- [x] T032 [US2] Add notificationLevel: "info" to GracefulCharityAction graveyard step in skeleton-app/src/lib/domain/effects/chainable/GracefulCharityAction.ts
- [x] T033 [US2] Run lint and format: npm run lint && npm run format in skeleton-app/
- [x] T034 [US2] Manual test: Activate Graceful Charity and verify 1 modal (card selection), 2 toasts (draw, graveyard)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - Graceful Charity shows mixed toast/modal notifications

---

## Phase 5: User Story 3 - Silent notifications skip all UI (Priority: P2)

**Goal**: When a card effect involves internal state changes that don't need user awareness (applying permanent effect modifiers, updating hidden counters), no notification is shown and the effect proceeds silently.

**Independent Test**: Implement a permanent effect (like "Chicken Game"'s draw effect) and verify that the effect application shows no notification while still updating game state correctly.

### Implementation for User Story 3

- [x] T035 [US3] Modify confirmCurrentStep to handle "silent" notification level (no handler call, immediate execution) in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T036 [US3] Ensure silent steps execute immediately without delay in skeleton-app/src/lib/application/stores/effectResolutionStore.ts
- [x] T037 [US3] Add example: Create ChickenGameAdditionalRule with silent notification level for permanent effect application in skeleton-app/src/lib/domain/effects/additional/ChickenGameAdditionalRule.ts (if exists, otherwise skip)
- [x] T038 [US3] Run lint and format: npm run lint && npm run format in skeleton-app/
- [x] T039 [US3] Manual test: If ChickenGame exists, activate and verify no notification appears for permanent effect application

**Checkpoint**: All user stories should now be independently functional - silent/info/interactive all work as designed

---

## Phase 6: Migration & Backward Compatibility

**Purpose**: Migrate remaining card effects and ensure backward compatibility

- [x] T040 [P] Add notificationLevel: "info" to all CardDestructionAction steps in skeleton-app/src/lib/domain/effects/chainable/CardDestructionAction.ts
- [x] T041 [P] Add notificationLevel: "info" to all UpstartGoblinAction steps in skeleton-app/src/lib/domain/effects/chainable/UpstartGoblinAction.ts
- [x] T042 Verify backward compatibility: Create test step without notificationLevel and verify it defaults to "info" in skeleton-app/tests/unit/application/stores/effectResolutionStore.test.ts
- [x] T043 Run lint and format: npm run lint && npm run format in skeleton-app/
- [x] T044 Run all tests: npm run test:run in skeleton-app/

**Checkpoint**: All card effects migrated to notification level system, backward compatibility verified

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Update effectResolutionStore unit tests to verify NotificationHandler DI in skeleton-app/tests/unit/application/stores/effectResolutionStore.test.ts
- [ ] T046 [P] Add unit test: silent level executes without calling handler in skeleton-app/tests/unit/application/stores/effectResolutionStore.test.ts
- [ ] T047 [P] Add unit test: info level calls showInfo with correct params in skeleton-app/tests/unit/application/stores/effectResolutionStore.test.ts
- [ ] T048 [P] Add unit test: interactive level calls showInteractive with correct params in skeleton-app/tests/unit/application/stores/effectResolutionStore.test.ts
- [ ] T049 [P] Add unit test: default to "info" when notificationLevel is undefined in skeleton-app/tests/unit/application/stores/effectResolutionStore.test.ts
- [ ] T050 [P] Create integration test file for notification level control in skeleton-app/tests/integration/notification-level-control.test.ts
- [ ] T051 [P] Add integration test: Pot of Greed shows 2 toasts, 0 modals in skeleton-app/tests/integration/notification-level-control.test.ts
- [ ] T052 [P] Add integration test: Graceful Charity shows 2 toasts, 1 modal in skeleton-app/tests/integration/notification-level-control.test.ts
- [ ] T053 Run lint and format: npm run lint && npm run format in skeleton-app/
- [ ] T054 Run all tests: npm run test:run in skeleton-app/
- [ ] T055 Run quickstart.md validation: Follow manual testing checklist in specs/010-notification-level-control/quickstart.md

**Checkpoint**: All tests passing, quickstart validation complete, ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - breaking change to rename properties
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Migration (Phase 6)**: Depends on Phase 3-5 completion - ensures all effects use notification levels
- **Polish (Phase 7)**: Depends on all user stories and migration being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with existing CardSelectionModal but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Completely independent

### Within Each User Story

- confirmCurrentStep modifications before card effect updates
- NotificationHandler registration before manual testing
- Lint/format before manual testing
- Each story complete and verified before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004, T005 can run in parallel (different card effect files)
- **Phase 6 (Migration)**: T040, T041 can run in parallel (different card effect files)
- **Phase 7 (Polish)**: T045-T049, T050-T052 can run in parallel (different test files)
- User stories (Phase 3, 4, 5) can be worked on in parallel by different team members after Phase 2 completes

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all ChainableAction updates together:
Task: "Update all ChainableAction implementations to use summary/description in PotOfGreedAction.ts"
Task: "Update all ChainableAction implementations to use summary/description in GracefulCharityAction.ts"
Task: "Update all ChainableAction implementations to use summary/description in CardDestructionAction.ts"
Task: "Update all ChainableAction implementations to use summary/description in UpstartGoblinAction.ts"
```

## Parallel Example: Phase 7 Polish

```bash
# Launch all unit tests together:
Task: "Add unit test: silent level executes without calling handler"
Task: "Add unit test: info level calls showInfo with correct params"
Task: "Add unit test: interactive level calls showInteractive with correct params"
Task: "Add unit test: default to info when notificationLevel is undefined"

# Launch all integration tests together:
Task: "Add integration test: Pot of Greed shows 2 toasts, 0 modals"
Task: "Add integration test: Graceful Charity shows 2 toasts, 1 modal"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (rename properties)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (info level with toast notifications)
4. **STOP and VALIDATE**: Test Pot of Greed independently (2 toasts, 0 modals)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (Pot of Greed with toasts) → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently (Graceful Charity with mixed notifications) → Deploy/Demo
4. Add User Story 3 → Test independently (silent effects) → Deploy/Demo
5. Complete Migration → All effects using notification levels
6. Complete Polish → All tests passing
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (info level)
   - Developer B: User Story 2 (interactive level)
   - Developer C: User Story 3 (silent level)
3. Stories complete and integrate independently
4. Team completes Migration + Polish together

---

## Notes

- **Breaking Change (Phase 1)**: title/message → summary/description reflects domain knowledge, not UI implementation
- **Dependency Injection Pattern**: NotificationHandler follows CardSelectionHandler pattern (research.md Q2)
- **Backward Compatibility**: Steps without notificationLevel default to "info" (research.md Q5)
- **Clean Architecture**: Domain layer defines NotificationLevel, Presentation layer decides toast/modal (research.md Q6, Q7)
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Criteria Mapping

From spec.md Success Criteria:

- **SC-001**: Users experience zero modal interruptions when activating "Pot of Greed" → **Phase 3 (US1)**
- **SC-002**: Effect resolution for informational steps completes automatically within 500ms → **Phase 3 (US1)** (300ms delay)
- **SC-003**: Card selection steps continue to block with modal UI → **Phase 4 (US2)**
- **SC-004**: Notification level can be changed by modifying a single configuration value → **Phase 2 + all user stories**
- **SC-005**: All existing card effects continue to function correctly after migration → **Phase 6 (Migration)**

---

## Summary

- **Total Tasks**: 55
- **Task Count by Phase**:
  - Phase 1 (Setup): 10 tasks (breaking change: property rename)
  - Phase 2 (Foundational): 7 tasks (types, interfaces, DI setup)
  - Phase 3 (User Story 1): 9 tasks (info level with toast)
  - Phase 4 (User Story 2): 8 tasks (interactive level with modal)
  - Phase 5 (User Story 3): 5 tasks (silent level)
  - Phase 6 (Migration): 5 tasks (remaining effects + backward compatibility)
  - Phase 7 (Polish): 11 tasks (tests + validation)
- **Parallel Opportunities**: 17 tasks marked [P] (31% parallelizable)
- **Independent Test Criteria**: Each user story has clear validation steps
- **Suggested MVP Scope**: Phase 1-3 (Setup + Foundational + User Story 1)
- **Format Validation**: ✅ All tasks follow `- [ ] [ID] [P?] [Story?] Description with file path` format
