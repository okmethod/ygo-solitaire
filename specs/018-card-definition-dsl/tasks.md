# Tasks: Card Definition DSL

**Input**: Design documents from `/specs/018-card-definition-dsl/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Unit tests are included to verify DSL parser and generic effect classes work correctly.

**Organization**: Tasks are grouped by implementation phase (P1, P2, P3) to enable incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Source**: `skeleton-app/src/lib/domain/dsl/`
- **Card Definitions**: `skeleton-app/src/lib/domain/cards/definitions/`
- **Tests**: `skeleton-app/src/lib/domain/dsl/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and DSL infrastructure setup

- [x] T001 Install js-yaml and @types/js-yaml dependencies via `npm install js-yaml @types/js-yaml`
- [x] T002 Create DSL directory structure: `skeleton-app/src/lib/domain/dsl/` with subdirectories `types/`, `registries/`, `parsers/`, `factories/`
- [x] T003 Create card definitions directory structure: `skeleton-app/src/lib/domain/cards/definitions/spells/` and `monsters/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core DSL infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Define CardDSLDefinition type in `skeleton-app/src/lib/domain/dsl/types/CardDSLDefinition.ts` (includes CardDSLDefinition, ChainableActionDSL, StepDSL interfaces)
- [x] T005 [P] Define DSL error types (DSLParseError, DSLValidationError) in `skeleton-app/src/lib/domain/dsl/types/DSLErrors.ts`
- [x] T006 Create Zod schema for CardDSLDefinition validation in `skeleton-app/src/lib/domain/dsl/parsers/schemas/CardDSLSchema.ts`
- [x] T007 Create CardDSLParser with yaml parsing and Zod validation in `skeleton-app/src/lib/domain/dsl/parsers/CardDSLParser.ts`
- [x] T008 Add unit tests for CardDSLParser in `tests/unit/domain/dsl/CardDSLParser.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Simple Normal Spell Cards (Priority: P1)

**Goal**: Enable defining simple normal spell cards like "Graceful Charity" via YAML DSL

**Independent Test**: DSL-defined "Graceful Charity" works identically to the class-based implementation

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US1] Create unit test for StepRegistry in `skeleton-app/tests/unit/domain/dsl/StepRegistry.test.ts`
- [x] T010 [P] [US1] Create unit test for ConditionRegistry in `skeleton-app/tests/unit/domain/dsl/ConditionRegistry.test.ts`
- [x] T011 [P] [US1] Create unit test for GenericNormalSpellActivation in `skeleton-app/tests/unit/domain/dsl/GenericNormalSpellActivation.test.ts`

### Implementation for User Story 1

- [x] T012 [P] [US1] Implement StepRegistry with basic steps (DRAW, SELECT_AND_DISCARD, FILL_HANDS, THEN, GAIN_LP) in `skeleton-app/src/lib/domain/dsl/registries/StepRegistry.ts`
- [x] T013 [P] [US1] Implement ConditionRegistry with basic conditions (CAN_DRAW) in `skeleton-app/src/lib/domain/dsl/registries/ConditionRegistry.ts`
- [x] T014 [US1] Implement GenericNormalSpellActivation extending NormalSpellActivation in `skeleton-app/src/lib/domain/dsl/factories/GenericNormalSpellActivation.ts`
- [x] T015 [US1] Implement DSL Loader for loading and registering DSL-defined cards in `skeleton-app/src/lib/domain/dsl/loader.ts`
- [x] T016 [US1] Create YAML definition for "Graceful Charity" (79571449) in `skeleton-app/src/lib/domain/cards/definitions/spells/graceful-charity.yaml`
- [x] T017 [US1] Create YAML definition for "Pot of Greed" (55144522) in `skeleton-app/src/lib/domain/cards/definitions/spells/pot-of-greed.yaml`
- [x] T018 [US1] Create YAML definition for "Upstart Goblin" (70368879) in `skeleton-app/src/lib/domain/cards/definitions/spells/upstart-goblin.yaml`
- [x] T019 [US1] Create equivalence test comparing DSL vs class-based implementations in `skeleton-app/tests/unit/domain/dsl/DSLEquivalence.test.ts`
- [x] T020 [US1] Integrate DSL loader with ChainableActionRegistry registration in `skeleton-app/src/lib/domain/effects/actions/index.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional - DSL-defined simple normal spells work correctly

---

## Phase 4: User Story 2 - Spells with Costs (Priority: P2)

**Goal**: Enable defining spell cards with activation costs like "Magical Stone Excavation"

**Independent Test**: DSL-defined "Magical Stone Excavation" correctly separates cost payment from effect resolution

### Tests for User Story 2

- [x] T021 [P] [US2] Create unit test for cost-related steps in `skeleton-app/tests/unit/domain/dsl/CostSteps.test.ts`
- [x] T022 [P] [US2] Create unit test for cost-related conditions in `skeleton-app/tests/unit/domain/dsl/CostConditions.test.ts`

### Implementation for User Story 2

- [x] T023 [P] [US2] activations section parsing already implemented in Phase 3 (GenericNormalSpellActivation)
- [x] T024 [P] [US2] Add SEARCH_FROM_DECK step to StepRegistry in `skeleton-app/src/lib/domain/dsl/registries/StepRegistry.ts`
- [x] T025 [P] [US2] Add SALVAGE_FROM_GRAVEYARD step to StepRegistry in `skeleton-app/src/lib/domain/dsl/registries/StepRegistry.ts`
- [x] T026 [P] [US2] Add HAND_COUNT_EXCLUDING_SELF condition to ConditionRegistry in `skeleton-app/src/lib/domain/dsl/registries/ConditionRegistry.ts`
- [x] T027 [P] [US2] Add GRAVEYARD_HAS_SPELL and DECK_HAS_CARD conditions to ConditionRegistry in `skeleton-app/src/lib/domain/dsl/registries/ConditionRegistry.ts`
- [x] T028 [US2] Create YAML definition for "Magical Stone Excavation" (98494543) in `skeleton-app/src/lib/domain/cards/definitions/spells/magical-stone-excavation.yaml`
- [x] T029 [US2] Create YAML definition for "Terraforming" (73628505) in `skeleton-app/src/lib/domain/cards/definitions/spells/terraforming.yaml`
- [x] T030 [US2] Add equivalence tests for cost-based spells in `skeleton-app/tests/unit/domain/dsl/DSLEquivalence.test.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Monsters with Continuous Effects (Priority: P3)

**Goal**: Enable defining monsters with continuous (trigger) effects like "Royal Magical Library"

**Independent Test**: DSL-defined "Royal Magical Library" places counter on spell activation and draws on ignition effect

### Tests for User Story 3

- [x] T031 [P] [US3] Create unit test for GenericTriggerRule in `skeleton-app/tests/unit/domain/dsl/GenericTriggerRule.test.ts`
- [x] T032 [P] [US3] Create unit test for counter steps in `skeleton-app/tests/unit/domain/dsl/CounterSteps.test.ts`

### Implementation for User Story 3

- [x] T033 [US3] Define AdditionalRuleDSL type in `skeleton-app/src/lib/domain/dsl/types/CardDSLDefinition.ts` (既存)
- [x] T034 [US3] Add effect-additional-rules section parsing to CardDSLParser in `skeleton-app/src/lib/domain/dsl/parsers/CardDSLParser.ts` (既存)
- [x] T035 [US3] Implement GenericTriggerRule extending AdditionalRule base in `skeleton-app/src/lib/domain/dsl/factories/GenericTriggerRule.ts`
- [x] T036 [P] [US3] Add PLACE_COUNTER step to StepRegistry in `skeleton-app/src/lib/domain/dsl/registries/StepRegistry.ts`
- [x] T037 [P] [US3] Add REMOVE_COUNTER step to StepRegistry in `skeleton-app/src/lib/domain/dsl/registries/StepRegistry.ts`
- [x] T038 [US3] Add HAS_COUNTER condition to ConditionRegistry in `skeleton-app/src/lib/domain/dsl/registries/ConditionRegistry.ts`
- [x] T039 [US3] Implement GenericIgnitionEffect for DSL-based ignition effects in `skeleton-app/src/lib/domain/dsl/factories/GenericIgnitionEffect.ts`
- [x] T040 [US3] Create YAML definition for "Royal Magical Library" (70791313) with continuous + ignition in `skeleton-app/src/lib/domain/cards/definitions/monsters/royal-magical-library.yaml`
- [x] T041 [US3] Integrate DSL loader with AdditionalRuleRegistry in `skeleton-app/src/lib/domain/dsl/loader.ts`
- [x] T042 [US3] Add equivalence tests for monster effects in `skeleton-app/tests/unit/domain/dsl/DSLEquivalence.test.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Add additional simple spell DSL definitions (Dark Factory, Card Destruction, etc.) in `skeleton-app/src/lib/domain/cards/definitions/spells/`
- [x] T044 Validate error messages contain card ID and field path for debugging in `skeleton-app/tests/unit/domain/dsl/DSLErrors.test.ts`
- [x] T045 [P] Update docs/architecture/card-definition-dsl-design.md with implementation notes
- [SKIP] T046 ~~Run full test suite including existing E2E tests to verify DSL/class coexistence~~ (E2Eテストはスコープ外。Unitテスト中心で進める)
- [x] T047 Clean up any temporary task IDs from source code comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 patterns but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1/US2 patterns but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/interfaces before implementations
- Registries before factories (GenericSpellActivation needs StepRegistry)
- Factories before YAML definitions
- YAML definitions before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks can run sequentially (dependency chain)
- Foundational tasks T004-T005 can run in parallel
- T006-T008 are sequential (schema -> parser -> tests)
- US1: T009-T011 (tests) can run in parallel; T012-T013 (registries) can run in parallel
- US2: T021-T022 (tests) can run in parallel; T023-T027 (implementations) can run in parallel
- US3: T031-T032 (tests) can run in parallel; T036-T037 (steps) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T009: "Create unit test for StepRegistry"
Task T010: "Create unit test for ConditionRegistry"
Task T011: "Create unit test for GenericNormalSpellActivation"

# Launch registry implementations together:
Task T012: "Implement StepRegistry with basic steps"
Task T013: "Implement ConditionRegistry with basic conditions"

# Launch YAML definitions together (after T014-T015 complete):
Task T016: "Create YAML definition for Graceful Charity"
Task T017: "Create YAML definition for Pot of Greed"
Task T018: "Create YAML definition for Upstart Goblin"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Confirm DSL-defined Graceful Charity works identically to class implementation

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> MVP (simple normal spells)
3. Add User Story 2 -> Test independently -> Cost-based spells work
4. Add User Story 3 -> Test independently -> Continuous effects work
5. Each story adds value without breaking previous stories

### Success Metrics

- **SC-001**: 80%+ of existing 13 Spell Activations can be DSL-ified (target: 10+)
- **SC-002**: New card DSL definitions are 1/4 the lines of class implementations
- **SC-003**: All existing tests pass with DSL/class coexistence
- **SC-004**: DSL parse errors include card ID and field path

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
