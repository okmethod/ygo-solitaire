# Tasks: Card Pool Expansion - 6 New Spell Cards

**Input**: Design documents from `/specs/011-card-pool-expansion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests are included for all 6 cards (SC-001 requirement)

**Organization**: Tasks are grouped by user story (P1, P2, P3) to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `skeleton-app/src/lib/`, `skeleton-app/tests/`
- Paths follow existing project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: GameState extension and Zone helper functions

- [x] T001 Add `damageNegation: boolean` field to GameState interface in skeleton-app/src/lib/domain/models/GameState.ts
- [x] T002 Update `createInitialGameState()` to initialize `damageNegation: false` in skeleton-app/src/lib/domain/models/GameState.ts
- [x] T003 [P] Create `shuffleDeck()` helper function in skeleton-app/src/lib/domain/models/Zone.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Verify ChainableActionRegistry registration pattern in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [x] T005 Verify CardSelectionModal supports graveyard/deck selection in skeleton-app/src/lib/presentation/components/modals/CardSelectionModal.svelte
- [x] T006 Verify NotificationLevel system (silent/info/interactive) is functional in skeleton-app/src/lib/application/stores/effectResolutionStore.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Simple Draw Effects (Priority: P1) 🎯 MVP

**Goal**: Add Upstart Goblin (1 draw + opponent 1000 LP) and Ceasefire Variant (both draw 1 + damage negation)

**Independent Test**: Activate Upstart Goblin → player draws 1, opponent gains 1000 LP. Activate Ceasefire → both draw 1, damageNegation=true

### Implementation for User Story 1

- [x] T007 [P] [US1] Create UpstartGoblinAction class in skeleton-app/src/lib/domain/effects/chainable/UpstartGoblinAction.ts
- [x] T008 [P] [US1] Create CeasefireVariantAction class in skeleton-app/src/lib/domain/effects/chainable/CeasefireVariantAction.ts
- [x] T009 [US1] Register Upstart Goblin (ID=70368879) in ChainableActionRegistry in skeleton-app/src/lib/domain/effects/index.ts
- [x] T010 [US1] Register Ceasefire Variant (ID=33782437) in ChainableActionRegistry in skeleton-app/src/lib/domain/effects/index.ts

### Tests for User Story 1

- [x] T011 [P] [US1] Unit test for UpstartGoblinAction (canActivate, resolution steps, LP gain) in skeleton-app/tests/unit/domain/effects/chainable/UpstartGoblinAction.test.ts
- [x] T012 [P] [US1] Unit test for CeasefireVariantAction (canActivate, resolution steps, damageNegation) in skeleton-app/tests/unit/domain/effects/chainable/CeasefireVariantAction.test.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - 2 cards work independently

---

## Phase 4: User Story 2 - Hand Management Effects (Priority: P2)

**Goal**: Add Reload (任意枚数 deck return + draw) and Card Destruction (手札2枚捨て + 2枚ドロー, spellSpeed=2)

**Independent Test**: Activate Reload, select 2 cards → deck shuffled, draw 2. Activate Card Destruction → discard 2, draw 2, modal non-cancelable

### Implementation for User Story 2

- [x] T013 [P] [US2] Create ReloadAction class with CardSelectionModal (minCards=0, maxCards=hand.length) in skeleton-app/src/lib/domain/effects/chainable/ReloadAction.ts
- [x] T014 [P] [US2] Create CardDestructionAction class with spellSpeed=2 and CardSelectionModal (minCards=2, maxCards=2, cancelable=false) in skeleton-app/src/lib/domain/effects/chainable/CardDestructionAction.ts
- [x] T015 [US2] Register Reload (ID=85852291) in ChainableActionRegistry in skeleton-app/src/lib/domain/effects/index.ts
- [x] T016 [US2] Register Card Destruction (ID=74519184) in ChainableActionRegistry in skeleton-app/src/lib/domain/effects/index.ts

### Tests for User Story 2

- [x] T017 [P] [US2] Unit test for ReloadAction (canActivate, 0 cards edge case, all cards edge case, shuffle) in skeleton-app/tests/unit/domain/effects/chainable/ReloadAction.test.ts
- [x] T018 [P] [US2] Unit test for CardDestructionAction (canActivate with hand.length >= 3, spellSpeed=2, discard + draw) in skeleton-app/tests/unit/domain/effects/chainable/CardDestructionAction.test.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - 4 cards total

---

## Phase 5: User Story 3 - Graveyard Recovery Effects (Priority: P3)

**Goal**: Add Dark Factory (墓地の通常モンスター2体回収) and Terraforming (デッキからフィールド魔法1枚サーチ)

**Independent Test**: Activate Dark Factory, select 2 Normal Monsters from graveyard → added to hand. Activate Terraforming, select 1 Field Spell from deck → added to hand

### Implementation for User Story 3

- [ ] T019 [P] [US3] Create DarkFactoryAction class with graveyard filtering (type === "Normal Monster") and CardSelectionModal in skeleton-app/src/lib/domain/effects/chainable/DarkFactoryAction.ts
- [ ] T020 [P] [US3] Create TerraformingAction class with deck filtering (type === "Spell" && frameType === "spell_field") and CardSelectionModal in skeleton-app/src/lib/domain/effects/chainable/TerraformingAction.ts
- [ ] T021 [US3] Register Dark Factory (ID=90928333) in ChainableActionRegistry in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts
- [ ] T022 [US3] Register Terraforming (ID=73628505) in ChainableActionRegistry in skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts

### Tests for User Story 3

- [ ] T023 [P] [US3] Unit test for DarkFactoryAction (canActivate with graveyard filter, recovery from graveyard to hand) in skeleton-app/tests/unit/domain/effects/chainable/DarkFactoryAction.test.ts
- [ ] T024 [P] [US3] Unit test for TerraformingAction (canActivate with deck filter, search from deck to hand) in skeleton-app/tests/unit/domain/effects/chainable/TerraformingAction.test.ts

**Checkpoint**: All user stories should now be independently functional - all 6 cards complete

---

## Phase 6: Integration & Polish

**Purpose**: Cross-cutting validation and documentation

- [ ] T025 [P] Create integration test for all 6 new spell cards in skeleton-app/tests/integration/card-effects/NewSpellCards.test.ts
- [ ] T026 Run all unit tests with `npm run test:run` and verify 100% pass rate
- [ ] T027 Run lint and format with `npm run lint && npm run format`
- [ ] T028 Validate quickstart.md scenarios (Upstart Goblin, Reload, Dark Factory)
- [ ] T029 Verify all 6 cards appear in ChainableActionRegistry and are callable via ActivateSpellCommand

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Integration & Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable, no US1 dependency
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independently testable, no US1/US2 dependency

### Within Each User Story

- Implementation tasks (T007-T008, T013-T014, T019-T020) can run in parallel within story
- Registration tasks (T009-T010, T015-T016, T021-T022) depend on corresponding implementation
- Test tasks (T011-T012, T017-T018, T023-T024) can run in parallel within story

### Parallel Opportunities

- **Phase 1**: T001-T003 can all run in parallel (different files)
- **Phase 2**: T004-T006 can all run in parallel (verification only)
- **User Story 1**: T007 and T008 in parallel, then T009 and T010 in parallel, then T011 and T012 in parallel
- **User Story 2**: T013 and T014 in parallel, then T015 and T016 in parallel, then T017 and T018 in parallel
- **User Story 3**: T019 and T020 in parallel, then T021 and T022 in parallel, then T023 and T024 in parallel
- **Phase 6**: T025 and T026 in parallel

---

## Parallel Example: User Story 1

```bash
# Launch implementation for User Story 1 together:
Task: "Create UpstartGoblinAction class in skeleton-app/src/lib/domain/effects/chainable/UpstartGoblinAction.ts"
Task: "Create CeasefireVariantAction class in skeleton-app/src/lib/domain/effects/chainable/CeasefireVariantAction.ts"

# Then launch registration together:
Task: "Register Upstart Goblin (ID=70368879) in ChainableActionRegistry"
Task: "Register Ceasefire Variant (ID=33782437) in ChainableActionRegistry"

# Then launch tests together:
Task: "Unit test for UpstartGoblinAction in skeleton-app/tests/unit/domain/effects/chainable/UpstartGoblinAction.test.ts"
Task: "Unit test for CeasefireVariantAction in skeleton-app/tests/unit/domain/effects/chainable/CeasefireVariantAction.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003) - GameState & Zone helpers
2. Complete Phase 2: Foundational (T004-T006) - Verify existing systems
3. Complete Phase 3: User Story 1 (T007-T012) - Upstart Goblin + Ceasefire Variant
4. **STOP and VALIDATE**: Test 2 cards independently, verify LP gain and damageNegation
5. Deploy/demo if ready (MVP = 2 new cards working)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T007-T012) → Test independently → 2 cards work (MVP!)
3. Add User Story 2 (T013-T018) → Test independently → 4 cards work total
4. Add User Story 3 (T019-T024) → Test independently → All 6 cards work
5. Complete Phase 6: Integration & Polish → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T006)
2. Once Foundational is done:
   - Developer A: User Story 1 (T007-T012) - Upstart Goblin, Ceasefire
   - Developer B: User Story 2 (T013-T018) - Reload, Card Destruction
   - Developer C: User Story 3 (T019-T024) - Dark Factory, Terraforming
3. All stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story delivers 2 new cards independently
- All cards follow ChainableAction pattern (no special cases)
- GameState extension is minimal (1 field: `damageNegation`)
- Zone helper is simple (1 function: `shuffleDeck`)
- Verify tests pass after each user story completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: code duplication (note for future refactoring), vague tasks, cross-story dependencies
