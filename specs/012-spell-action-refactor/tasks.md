# Tasks: Spell Card Action Abstraction Refactoring

**Input**: Design documents from `/Users/shohei/github/ygo-solitaire/specs/012-spell-action-refactor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT requested in this refactoring - existing 545 unit tests will validate correctness

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `skeleton-app/src/`, `skeleton-app/tests/` at repository root
- All paths use TypeScript with `.ts` extension

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - no changes needed (existing TypeScript/Svelte project)

- [x] T001 Verify all existing 545 tests pass as baseline (`npm run test:run` in `skeleton-app/`)

---

## Phase 2: Foundational (Blocking Prerequisites - US2)

**Purpose**: Create abstract classes and step builder functions that ALL refactoring depends on

**⚠️ CRITICAL**: No card refactoring can begin until this phase is complete

**User Story**: US2 - Primitive Step Builder Functions (Priority: P1)

**Goal**: Implement reusable helper functions (createDrawStep, createSendToGraveyardStep, etc.) that generate EffectResolutionStep objects. These eliminate 356 lines of duplicate code across card implementations.

**Independent Test**: Each helper function can be unit tested to verify correct EffectResolutionStep generation with various parameters.

### Implementation for US2

- [x] T002 [P] [US2] Create BaseSpellAction abstract class in `skeleton-app/src/lib/domain/effects/base/spell/BaseSpellAction.ts`
- [x] T003 [P] [US2] Create NormalSpellAction abstract class in `skeleton-app/src/lib/domain/effects/base/spell/NormalSpellAction.ts`
- [x] T004 [P] [US2] Create QuickPlaySpellAction abstract class in `skeleton-app/src/lib/domain/effects/base/spell/QuickPlaySpellAction.ts`
- [x] T005 [P] [US2] Create FieldSpellAction abstract class in `skeleton-app/src/lib/domain/effects/base/spell/FieldSpellAction.ts`
- [x] T006 [P] [US2] Create createDrawStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T007 [P] [US2] Create createSendToGraveyardStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T008 [P] [US2] Create createCardSelectionStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T009 [P] [US2] Create createGainLifeStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T010 [P] [US2] Create createDamageStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T011 [P] [US2] Create createShuffleStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T012 [P] [US2] Create createReturnToDeckStep helper function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
- [x] T013 [US2] Create builders index file in `skeleton-app/src/lib/domain/effects/builders/index.ts` (exports all step builders)
- [x] T014 [P] [US2] Create unit tests for BaseSpellAction in `skeleton-app/tests/unit/domain/effects/base/spell/BaseSpellAction.test.ts`
- [x] T015 [P] [US2] Create unit tests for NormalSpellAction in `skeleton-app/tests/unit/domain/effects/base/spell/NormalSpellAction.test.ts`
- [x] T016 [P] [US2] Create unit tests for QuickPlaySpellAction in `skeleton-app/tests/unit/domain/effects/base/spell/QuickPlaySpellAction.test.ts`
- [x] T017 [P] [US2] Create unit tests for FieldSpellAction in `skeleton-app/tests/unit/domain/effects/base/spell/FieldSpellAction.test.ts`
- [x] T018 [P] [US2] Create unit tests for stepBuilders in `skeleton-app/tests/unit/domain/effects/builders/stepBuilders.test.ts`
- [x] T019 [US2] Update effects index to export new base classes and builders in `skeleton-app/src/lib/domain/effects/index.ts`
- [x] T020 [US2] Run all 545 tests - must pass 100%

**Checkpoint**: Foundation ready - abstract classes and builders validated, card refactoring can now begin

---

## Phase 3: Directory Restructuring (Foundational)

**Purpose**: Rename directories and files to follow new naming conventions before refactoring card implementations

**⚠️ CRITICAL**: Complete this phase before any card refactoring to avoid conflicts

### Step 1: Rename top-level directories

- [x] T021 Rename `skeleton-app/src/lib/domain/effects/chainable/` → `actions/`
- [x] T022 Rename `skeleton-app/src/lib/domain/effects/additional/` → `rules/`
- [x] T023 Rename `skeleton-app/tests/unit/domain/effects/chainable/` → `actions/`
- [x] T024 Rename `skeleton-app/tests/unit/domain/effects/additional/` → `rules/`

### Step 2: Rename effect implementation files (8 Action + 2 Rule files)

- [x] T025 [P] Rename `actions/PotOfGreedAction.ts` → `PotOfGreedActivation.ts`
- [x] T026 [P] Rename `actions/GracefulCharityAction.ts` → `GracefulCharityActivation.ts`
- [x] T027 [P] Rename `actions/OneDayOfPeaceAction.ts` → `OneDayOfPeaceActivation.ts`
- [x] T028 [P] Rename `actions/MagicalMalletAction.ts` → `MagicalMalletActivation.ts`
- [x] T029 [P] Rename `actions/UpstartGoblinAction.ts` → `UpstartGoblinActivation.ts`
- [x] T030 [P] Rename `actions/DarkFactoryAction.ts` → `DarkFactoryActivation.ts`
- [x] T031 [P] Rename `actions/TerraformingAction.ts` → `TerraformingActivation.ts`
- [x] T032 [P] Rename `actions/CardDestructionAction.ts` → `CardDestructionActivation.ts`
- [x] T033 [P] Rename `rules/ChickenGameContinuousRule.ts` → `ChickenGameContinuousEffect.ts`
- [x] T034 [P] Rename `rules/ExodiaVictoryRule.ts` → `ExodiaNonEffect.ts`

### Step 3: Rename corresponding test files (8 Action tests + 2 Rule tests)

- [x] T035 [P] Rename `actions/PotOfGreedAction.test.ts` → `PotOfGreedActivation.test.ts`
- [x] T036 [P] Rename `actions/GracefulCharityAction.test.ts` → `GracefulCharityActivation.test.ts`
- [x] T037 [P] Rename `actions/OneDayOfPeaceAction.test.ts` → `OneDayOfPeaceActivation.test.ts`
- [x] T038 [P] Rename `actions/MagicalMalletAction.test.ts` → `MagicalMalletActivation.test.ts`
- [x] T039 [P] Rename `actions/UpstartGoblinAction.test.ts` → `UpstartGoblinActivation.test.ts`
- [x] T040 [P] Rename `actions/DarkFactoryAction.test.ts` → `DarkFactoryActivation.test.ts`
- [x] T041 [P] Rename `actions/TerraformingAction.test.ts` → `TerraformingActivation.test.ts`
- [x] T042 [P] Rename `actions/CardDestructionAction.test.ts` → `CardDestructionActivation.test.ts`
- [x] T043 [P] Rename `rules/ChickenGameContinuousRule.test.ts` → `ChickenGameContinuousEffect.test.ts`
- [x] T044 [P] Rename `rules/ExodiaVictoryRule.test.ts` → `ExodiaNonEffect.test.ts`

### Step 4: Update class names inside renamed files

- [x] T045 [P] Update class name PotOfGreedAction → PotOfGreedActivation in `actions/PotOfGreedActivation.ts`
- [x] T046 [P] Update class name GracefulCharityAction → GracefulCharityActivation in `actions/GracefulCharityActivation.ts`
- [x] T047 [P] Update class name OneDayOfPeaceAction → OneDayOfPeaceActivation in `actions/OneDayOfPeaceActivation.ts`
- [x] T048 [P] Update class name MagicalMalletAction → MagicalMalletActivation in `actions/MagicalMalletActivation.ts`
- [x] T049 [P] Update class name UpstartGoblinAction → UpstartGoblinActivation in `actions/UpstartGoblinActivation.ts`
- [x] T050 [P] Update class name DarkFactoryAction → DarkFactoryActivation in `actions/DarkFactoryActivation.ts`
- [x] T051 [P] Update class name TerraformingAction → TerraformingActivation in `actions/TerraformingActivation.ts`
- [x] T052 [P] Update class name CardDestructionAction → CardDestructionActivation in `actions/CardDestructionActivation.ts`
- [x] T053 [P] Update class name ChickenGameContinuousRule → ChickenGameContinuousEffect in `rules/ChickenGameContinuousEffect.ts`
- [x] T054 [P] Update class name ExodiaVictoryRule → ExodiaNonEffect in `rules/ExodiaNonEffect.ts`

### Step 5: Create spell/ subdirectories and move files

- [x] T055 Create `skeleton-app/src/lib/domain/effects/actions/spell/` directory
- [x] T056 Move all 10 spell card Activation files to `actions/spell/` (PotOfGreed, GracefulCharity, OneDayOfPeace, MagicalMallet, UpstartGoblin, DarkFactory, Terraforming, CardDestruction, ChickenGameActivation, ChickenGameIgnitionEffect)
- [x] T057 Create `skeleton-app/src/lib/domain/effects/rules/spell/` directory
- [x] T058 Move ChickenGameContinuousEffect.ts and ExodiaNonEffect.ts to `rules/spell/`
- [x] T059 Create `skeleton-app/tests/unit/domain/effects/actions/spell/` directory
- [x] T060 Move all 10 spell card test files to `tests/.../actions/spell/`
- [x] T061 Create `skeleton-app/tests/unit/domain/effects/rules/spell/` directory
- [x] T062 Move 2 rule test files (ChickenGameContinuousEffect.test.ts, ExodiaNonEffect.test.ts) to `tests/.../rules/spell/`

### Step 6: Update all import paths and references

- [x] T063 Update relative import paths in all moved card files (12 files: adjust `../../` depth)
- [x] T064 Update `skeleton-app/src/lib/domain/effects/index.ts` - change `chainable/` → `actions/spell/`, `additional/` → `rules/spell/`, update all class names
- [x] T065 Update `skeleton-app/src/lib/domain/rules/VictoryRule.ts` - change `../effects/additional/ExodiaVictoryRule` → `../effects/rules/spell/ExodiaNonEffect`
- [x] T066 Update `skeleton-app/src/lib/application/GameFacade.ts` - update import paths and class names
- [x] T067 Update registry files (`ChainableActionRegistry.ts`, `AdditionalRuleRegistry.ts`) - update import paths and class names
- [x] T068 Update all test files that import from effects (26+ files total)
- [x] T069 Update JSDoc `@module` comments in all moved files (12 files)

### Step 7: Update documentation

- [x] T070 [P] Update `docs/architecture/overview.md` - change directory references and class names
- [x] T071 [P] Update `docs/adr/0008-effect-model-and-clean-architecture.md` - change directory references and class names
- [x] T072 [P] Update `docs/architecture/effect-model-design.md` - change directory references (already updated in previous session)

### Step 8: Validate restructuring

- [x] T073 Run all 545 tests - must pass 100%
- [x] T074 Run lint/format checks (`npm run lint && npm run format` in `skeleton-app/`)
- [x] T075 Verify no broken imports remain (TypeScript compiler check)

**Checkpoint**: Directory structure updated, all tests passing, ready for card refactoring

---

## Phase 4: User Story 1 - Core Spell Card Abstraction (Priority: P1) 🎯 MVP

**Goal**: Refactor 7 normal spell cards to use NormalSpellAction abstraction, reducing each from ~150-260 LOC to ~15-30 LOC

**Independent Test**: All existing unit tests for the 7 normal spell cards continue to pass (100%)

### Pilot Refactoring (Validate approach)

- [x] T076 [US1] Refactor `PotOfGreedActivation.ts` to extend NormalSpellAction and use step builders in `skeleton-app/src/lib/domain/effects/actions/spell/PotOfGreedActivation.ts`
- [x] T077 [US1] Run Pot of Greed unit tests - must pass 100%
- [x] T078 [US1] Run all 545 tests - must pass 100%
- [x] T079 [US1] Measure LOC reduction for Pot of Greed (target: 186 LOC → ~20 LOC)

### Normal Spell Refactoring (Remaining 6 cards)

- [ ] T080 [US1] Refactor GracefulCharityActivation.ts to extend NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/GracefulCharityActivation.ts`
- [ ] T081 [US1] Run all 545 tests - must pass 100%
- [ ] T082 [US1] Refactor OneDayOfPeaceActivation.ts to extend NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/OneDayOfPeaceActivation.ts`
- [ ] T083 [US1] Run all 545 tests - must pass 100%
- [ ] T084 [US1] Refactor MagicalMalletActivation.ts to extend NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/MagicalMalletActivation.ts`
- [ ] T085 [US1] Run all 545 tests - must pass 100%
- [ ] T086 [US1] Refactor UpstartGoblinActivation.ts to extend NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/UpstartGoblinActivation.ts`
- [ ] T087 [US1] Run all 545 tests - must pass 100%
- [ ] T088 [US1] Refactor DarkFactoryActivation.ts to extend NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/DarkFactoryActivation.ts`
- [ ] T089 [US1] Run all 545 tests - must pass 100%
- [ ] T090 [US1] Refactor TerraformingActivation.ts to extend NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/TerraformingActivation.ts`
- [ ] T091 [US1] Run all 545 tests - must pass 100%

**Checkpoint**: All 7 normal spell cards refactored, all tests passing, ~1000 LOC eliminated

---

## Phase 5: User Story 3 - Quick-Play and Field Spell Abstraction (Priority: P2)

**Goal**: Refactor 1 quick-play spell and 2 field spell cards to use QuickPlaySpellAction and FieldSpellAction abstractions

**Independent Test**: All existing unit tests for Card Destruction and Chicken Game continue to pass (100%)

### Quick-Play Spell Refactoring

- [ ] T092 [US3] Refactor CardDestructionActivation.ts to extend QuickPlaySpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/CardDestructionActivation.ts`
- [ ] T093 [US3] Run all 545 tests - must pass 100%

### Field Spell Refactoring

- [ ] T094 [US3] Refactor ChickenGameActivation.ts to extend FieldSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/ChickenGameActivation.ts`
- [ ] T095 [US3] Refactor ChickenGameIgnitionEffect.ts to extend FieldSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/ChickenGameIgnitionEffect.ts`
- [ ] T096 [US3] Run all 545 tests - must pass 100%

**Checkpoint**: All spell cards refactored (10 total), all tests passing, code duplication reduced by 83%

---

## Phase 6: User Story 4 - Test Code Abstraction (Priority: P3)

**Goal**: Extract common test patterns (canActivate, immutability, etc.) into reusable test helper functions, reducing test code duplication by 50%

**Independent Test**: Refactor one card's tests using helpers, verify all tests still pass

### Implementation for US4

- [ ] T097 [P] [US4] Create testCanActivate helper in `skeleton-app/tests/unit/domain/effects/helpers/spellActionTestHelpers.ts`
- [ ] T098 [P] [US4] Create testImmutability helper in `skeleton-app/tests/unit/domain/effects/helpers/spellActionTestHelpers.ts`
- [ ] T099 [P] [US4] Create testActivationSteps helper in `skeleton-app/tests/unit/domain/effects/helpers/spellActionTestHelpers.ts`
- [ ] T100 [P] [US4] Create testResolutionSteps helper in `skeleton-app/tests/unit/domain/effects/helpers/spellActionTestHelpers.ts`
- [ ] T101 [US4] Refactor PotOfGreedActivation.test.ts to use test helpers
- [ ] T102 [US4] Run all 545 tests - must pass 100%
- [ ] T103 [US4] Refactor remaining 9 spell card tests to use helpers (GracefulCharity, OneDayOfPeace, MagicalMallet, UpstartGoblin, DarkFactory, Terraforming, CardDestruction, ChickenGameActivation, ChickenGameIgnitionEffect)
- [ ] T104 [US4] Run all 545 tests - must pass 100%

**Checkpoint**: All test code refactored, test duplication reduced by 50%, all tests passing

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T105 Run all 545 tests - must pass 100%
- [ ] T106 Run lint/format checks - all must pass (`npm run lint && npm run format` in `skeleton-app/`)
- [ ] T107 Measure final code metrics (LOC reduction, duplication rate)
- [ ] T108 Update agent context with new technologies (`Abstract Classes`, `Factory Functions`, `Incremental Refactoring`)
- [ ] T109 [P] Update CLAUDE.md active technologies section
- [ ] T110 [P] Document refactoring approach in ADR if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - verify baseline
- **Phase 2 (Foundational - US2)**: Depends on Phase 1 - BLOCKS all card refactoring
- **Phase 3 (Directory Restructuring)**: Depends on Phase 2 - BLOCKS all card refactoring
- **Phase 4 (US1)**: Depends on Phase 2 & Phase 3 completion
- **Phase 5 (US3)**: Depends on Phase 2 & Phase 3 completion (can run in parallel with Phase 4 if staffed)
- **Phase 6 (US4)**: Depends on Phase 4 & Phase 5 completion (all card refactoring done)
- **Phase 7 (Polish)**: Depends on all phases

### User Story Dependencies

- **US2 (P1 - Foundational)**: No dependencies - creates abstractions
- **US1 (P1 - Normal Spells)**: Depends on US2 (needs abstractions)
- **US3 (P2 - Quick-Play & Field)**: Depends on US2 (needs abstractions) - Independent of US1
- **US4 (P3 - Test Helpers)**: Depends on US1 & US3 (needs all cards refactored)

### Within Each User Story

- **US2**: Abstract classes and builders can be created in parallel → tests → validation
- **US1**: Pilot first (T076-T079) → then remaining 6 cards sequentially (T080-T091)
- **US3**: Quick-Play and Field can be done in parallel
- **US4**: Helpers created in parallel → pilot refactor → remaining tests

### Parallel Opportunities

- **Phase 2 (US2)**: T002-T012 (abstract classes & builders) can run in parallel, T014-T018 (tests) can run in parallel
- **Phase 3 (Restructuring)**: T025-T034 (file renames), T035-T044 (test renames), T045-T054 (class names), T070-T072 (docs) can run in parallel within their substeps
- **Phase 5 (US3)**: T092-T093 (Quick-Play) and T094-T096 (Field) can run in parallel
- **Phase 6 (US4)**: T097-T100 (helper creation) can run in parallel

---

## Parallel Example: US2 (Foundational)

```bash
# Launch all abstract class creation tasks together:
Task: "Create BaseSpellAction in skeleton-app/src/lib/domain/effects/base/spell/BaseSpellAction.ts"
Task: "Create NormalSpellAction in skeleton-app/src/lib/domain/effects/base/spell/NormalSpellAction.ts"
Task: "Create QuickPlaySpellAction in skeleton-app/src/lib/domain/effects/base/spell/QuickPlaySpellAction.ts"
Task: "Create FieldSpellAction in skeleton-app/src/lib/domain/effects/base/spell/FieldSpellAction.ts"

# Launch all step builder function tasks together:
Task: "Create createDrawStep in skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts"
Task: "Create createSendToGraveyardStep in skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts"
Task: "Create createCardSelectionStep in skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts"
# ... (all other step builders)
```

---

## Implementation Strategy

### MVP First (US2 + US1 Only)

1. Complete Phase 1: Setup (baseline verification)
2. Complete Phase 2: Foundational (US2 - abstractions & builders)
3. Complete Phase 3: Directory Restructuring
4. Complete Phase 4: US1 (7 normal spell cards)
5. **STOP and VALIDATE**: All 545 tests pass, LOC reduced by ~80%
6. Commit and merge to main

### Incremental Delivery

1. Phase 1-2 (US2) → Foundation ready (abstractions & builders tested)
2. Phase 3 → Directory structure modernized
3. Phase 4 (US1) → 7 normal spells refactored (MVP!) → ~1000 LOC eliminated
4. Phase 5 (US3) → All 10 spell cards refactored → 83% code reduction achieved
5. Phase 6 (US4) → Test code refactored → 50% test duplication eliminated
6. Each phase validates independently with 100% test pass rate

### Parallel Team Strategy

With 2 developers:

1. Both complete Phase 1-3 together (Foundation + Restructuring)
2. Once Phase 3 is done:
   - Developer A: Phase 4 (US1 - Normal Spells)
   - Developer B: Phase 5 (US3 - Quick-Play & Field)
3. Both: Phase 6 (US4 - Test Helpers)
4. Both: Phase 7 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies within that substep
- [Story] label maps task to specific user story for traceability
- Run tests after EVERY card refactoring (not just at phase end) - safety net for incremental changes
- Commit after each card refactoring or logical group
- Stop at any checkpoint to validate independently
- Target: 545/545 tests pass at ALL times
- Success Metrics: 83% LOC reduction (2123 → ~250-500), 356 lines duplication eliminated
