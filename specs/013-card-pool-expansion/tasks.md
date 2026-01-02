# Tasks: Additional Spell Cards Implementation

**Input**: Design documents from `/Users/shohei/github/ygo-solitaire/specs/013-card-pool-expansion/`
**Prerequisites**: spec.md, plan.md, data-model.md, research.md, quickstart.md

**Tests**: Integration tests will be added to existing test files (NormalSpells.test.ts, FieldSpells.test.ts)

**Organization**: Tasks are grouped by phase and user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (P1, P2, P3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `skeleton-app/src/`, `skeleton-app/tests/` at repository root
- All paths use TypeScript with `.ts` extension

---

## Phase 1: Infrastructure - GameState Extensions & Step Builders

**Purpose**: Extend GameState model and create new step builder functions for card effect support

**⚠️ CRITICAL**: All card implementations depend on this phase being complete

### GameState Model Extensions

- [ ] T001 [P] [Infrastructure] Add `pendingEndPhaseEffects: readonly EffectResolutionStep[]` field to GameState interface in `skeleton-app/src/lib/domain/models/GameState.ts`
- [ ] T002 [P] [Infrastructure] Add `activatedOncePerTurnCards: ReadonlySet<number>` field to GameState interface in `skeleton-app/src/lib/domain/models/GameState.ts`
- [ ] T003 [Infrastructure] Update `createInitialGameState()` to initialize new fields (`pendingEndPhaseEffects: []`, `activatedOncePerTurnCards: new Set<number>()`) in `skeleton-app/src/lib/domain/models/GameState.ts`

### Step Builder Functions

- [ ] T004 [P] [Infrastructure] Create `createSearchFromGraveyardStep()` function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts` (for Magical Stone Excavation)
- [ ] T005 [P] [Infrastructure] Create `createSearchFromDeckTopStep()` function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts` (for Pot of Duality)
- [ ] T006 [P] [Infrastructure] Create `createAddEndPhaseEffectStep()` function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts` (for Into the Void, Card of Demise)
- [ ] T007 [P] [Infrastructure] Create `createDrawUntilCountStep()` function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts` (for Card of Demise - draw until hand = 3)
- [ ] T008 [P] [Infrastructure] Create `createSearchFromDeckByNameStep()` function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts` (for Toon Table of Contents - search by name filter)
- [ ] T009 [P] [Infrastructure] Create `createLPPaymentStep()` function in `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts` (for Toon World - pay 1000 LP)

### AdvancePhaseCommand Updates

- [ ] T010 [Infrastructure] Update `AdvancePhaseCommand.execute()` to execute `pendingEndPhaseEffects` when entering End phase in `skeleton-app/src/lib/domain/commands/AdvancePhaseCommand.ts`
- [ ] T011 [Infrastructure] Update `AdvancePhaseCommand.execute()` to clear `activatedOncePerTurnCards` Set when entering End phase in `skeleton-app/src/lib/domain/commands/AdvancePhaseCommand.ts`
- [ ] T012 [Infrastructure] Update `AdvancePhaseCommand.execute()` to clear `pendingEndPhaseEffects` array after execution in `skeleton-app/src/lib/domain/commands/AdvancePhaseCommand.ts`

### Validation

- [ ] T013 [Infrastructure] Run all existing tests to verify no regressions (`npm run test:run` in `skeleton-app/`)
- [ ] T014 [Infrastructure] Run lint/format checks (`npm run lint && npm run format` in `skeleton-app/`)

**Checkpoint**: Infrastructure ready - GameState extended, step builders created, phase command updated

---

## Phase 2: P1 Cards - Magical Stone Excavation & Into the Void

**Purpose**: Implement 2 P1 priority spell cards (graveyard recovery + risky draw)

**User Stories**:
- US1 (P1): Magical Stone Excavation - Spell card recovery from graveyard
- US2 (P1): Into the Void - Risky draw with end phase penalty

### Card Data Registration

- [ ] T015 [P] [P1] Add Magical Stone Excavation (ID: 98494543) card data to `skeleton-app/src/lib/domain/registries/CardDataRegistry.ts`
- [ ] T016 [P] [P1] Add Into the Void (ID: 93946239) card data to `skeleton-app/src/lib/domain/registries/CardDataRegistry.ts`

### Card Action Implementations

- [ ] T017 [P1] Create `MagicalStoneExcavationActivation` class extending NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/MagicalStoneExcavationActivation.ts`
  - Implement `additionalActivationConditions()`: hand >= 3 (self + cost 2), graveyard has spell cards
  - Implement `createResolutionSteps()`: discard 2 cards → search from graveyard → add to hand → send self to graveyard
- [ ] T018 [P1] Create `IntoTheVoidActivation` class extending NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/IntoTheVoidActivation.ts`
  - Implement `additionalActivationConditions()`: hand >= 3, deck >= 1
  - Implement `createResolutionSteps()`: draw 1 card → add end phase effect (discard all hand) → send self to graveyard

### Registry Registration

- [ ] T019 [P] [P1] Register MagicalStoneExcavationActivation in `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts`
- [ ] T020 [P] [P1] Register IntoTheVoidActivation in `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts`

### Export from effects/index.ts

- [ ] T021 [P1] Export MagicalStoneExcavationActivation and IntoTheVoidActivation from `skeleton-app/src/lib/domain/effects/index.ts`

### Integration Tests

- [ ] T022 [P] [P1] Add Magical Stone Excavation test scenarios to `skeleton-app/tests/integration/card-effects/NormalSpells.test.ts`
  - Scenario 1: Activate with 3 cards in hand, 2 spell cards in graveyard → select 1 spell → hand = 1
  - Scenario 2: Cannot activate with hand = 2 (insufficient cost)
  - Scenario 3: Cannot activate when graveyard has no spell cards
- [ ] T023 [P] [P1] Add Into the Void test scenarios to `skeleton-app/tests/integration/card-effects/NormalSpells.test.ts`
  - Scenario 1: Activate with 4 cards in hand → draw 1 → end phase → hand = 0 (all discarded)
  - Scenario 2: Cannot activate with hand = 2 (insufficient condition)
  - Scenario 3: Cannot activate when deck = 0 (cannot draw)

### Validation

- [ ] T024 [P1] Run all tests including new integration tests - must pass 100%
- [ ] T025 [P1] Run lint/format checks - all must pass

**Checkpoint**: P1 cards implemented (Magical Stone Excavation, Into the Void), graveyard recovery and end phase effects working

---

## Phase 3: P2 Cards - Pot of Duality & Card of Demise

**Purpose**: Implement 2 P2 priority spell cards (deck excavation with once-per-turn constraint)

**User Stories**:
- US3 (P2): Pot of Duality - Deck excavation and selection
- US4 (P2): Card of Demise - Draw until 3 with complex effects

### Card Data Registration

- [ ] T026 [P] [P2] Add Pot of Duality (ID: 98645731) card data to `skeleton-app/src/lib/domain/registries/CardDataRegistry.ts`
- [ ] T027 [P] [P2] Add Card of Demise (ID: 59750328) card data to `skeleton-app/src/lib/domain/registries/CardDataRegistry.ts`

### Card Action Implementations

- [ ] T028 [P2] Create `PotOfDualityActivation` class extending NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/PotOfDualityActivation.ts`
  - Implement `additionalActivationConditions()`: deck >= 3, card not in activatedOncePerTurnCards
  - Implement `createResolutionSteps()`: search from deck top 3 → select 1 → return 2 to deck → send self to graveyard
  - Add card ID to activatedOncePerTurnCards in activation step
- [ ] T029 [P2] Create `CardOfDemiseActivation` class extending NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/CardOfDemiseActivation.ts`
  - Implement `additionalActivationConditions()`: card not in activatedOncePerTurnCards
  - Implement `createResolutionSteps()`: draw until hand = 3 → add end phase effect (discard all) → send self to graveyard
  - Add card ID to activatedOncePerTurnCards in activation step
  - Note: Damage negation effect is out of scope (先行1ターンキルでは不要)

### Registry Registration

- [ ] T030 [P] [P2] Register PotOfDualityActivation in `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts`
- [ ] T031 [P] [P2] Register CardOfDemiseActivation in `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts`

### Export from effects/index.ts

- [ ] T032 [P2] Export PotOfDualityActivation and CardOfDemiseActivation from `skeleton-app/src/lib/domain/effects/index.ts`

### Integration Tests

- [ ] T033 [P] [P2] Add Pot of Duality test scenarios to `skeleton-app/tests/integration/card-effects/NormalSpells.test.ts`
  - Scenario 1: Activate with deck = 10 → select 1 from top 3 → deck = 9, hand = 1
  - Scenario 2: Activate 1st card → success, activate 2nd card same turn → fail (once-per-turn constraint)
  - Scenario 3: End phase → activatedOncePerTurnCards cleared → can activate next turn
- [ ] T034 [P] [P2] Add Card of Demise test scenarios to `skeleton-app/tests/integration/card-effects/NormalSpells.test.ts`
  - Scenario 1: Activate with hand = 0 → draw 3 cards → end phase → hand = 0 (all discarded)
  - Scenario 2: Activate with hand = 1 → draw 2 cards → end phase → hand = 0
  - Scenario 3: Once-per-turn constraint test (same as Pot of Duality)

### Validation

- [ ] T035 [P2] Run all tests including new integration tests - must pass 100%
- [ ] T036 [P2] Run lint/format checks - all must pass

**Checkpoint**: P2 cards implemented (Pot of Duality, Card of Demise), deck excavation and once-per-turn constraint working

---

## Phase 4: P3 Cards - Toon Table of Contents & Toon World

**Purpose**: Implement 2 P3 priority cards (Toon support - foundation for future Toon deck)

**User Stories**:
- US5 (P3): Toon Table of Contents - Toon card search
- US6 (P3): Toon World - Field spell with LP payment

### Card Data Registration

- [ ] T037 [P] [P3] Add Toon Table of Contents (ID: 89997728) card data to `skeleton-app/src/lib/domain/registries/CardDataRegistry.ts`
- [ ] T038 [P] [P3] Add Toon World (ID: 15259703, type: "continuous") card data to `skeleton-app/src/lib/domain/registries/CardDataRegistry.ts`

### Card Action Implementations

- [ ] T039 [P3] Create `ToonTableOfContentsActivation` class extending NormalSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/ToonTableOfContentsActivation.ts`
  - Implement `additionalActivationConditions()`: deck has at least 1 card with "トゥーン" in name (jaName or name)
  - Implement `createResolutionSteps()`: search from deck (filter by "トゥーン") → add to hand → send self to graveyard
- [ ] T040 [P3] Create `ToonWorldActivation` class extending FieldSpellAction in `skeleton-app/src/lib/domain/effects/actions/spell/ToonWorldActivation.ts`
  - Note: Card type is "continuous" but use FieldSpellAction for implementation (effect behaves like field spell)
  - Implement `additionalActivationConditions()`: player LP >= 1000
  - Implement `createResolutionSteps()`: pay 1000 LP → place on field

### Registry Registration

- [ ] T041 [P] [P3] Register ToonTableOfContentsActivation in `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts`
- [ ] T042 [P] [P3] Register ToonWorldActivation in `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts`

### Export from effects/index.ts

- [ ] T043 [P3] Export ToonTableOfContentsActivation and ToonWorldActivation from `skeleton-app/src/lib/domain/effects/index.ts`

### Integration Tests

- [ ] T044 [P] [P3] Add Toon Table of Contents test scenarios to `skeleton-app/tests/integration/card-effects/NormalSpells.test.ts`
  - Scenario 1: Activate with 1 Toon card in deck → add to hand → deck size decreases
  - Scenario 2: Cannot activate when deck has no Toon cards (name filter test)
- [ ] T045 [P] [P3] Add Toon World test scenarios to `skeleton-app/tests/integration/card-effects/FieldSpells.test.ts`
  - Scenario 1: Activate with LP = 8000 → pay 1000 LP → LP = 7000, field = 1 (Toon World)
  - Scenario 2: Cannot activate when LP < 1000

### Validation

- [ ] T046 [P3] Run all tests including new integration tests - must pass 100%
- [ ] T047 [P3] Run lint/format checks - all must pass

**Checkpoint**: P3 cards implemented (Toon Table of Contents, Toon World), Toon support foundation ready

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and cleanup

### Final Validation

- [ ] T048 Run all tests (existing + new integration tests) - must pass 100% (`npm run test:run` in `skeleton-app/`)
- [ ] T049 Run E2E tests if applicable (`npm run test:e2e` in `skeleton-app/`)
- [ ] T050 Run lint/format checks - all must pass (`npm run lint && npm run format` in `skeleton-app/`)
- [ ] T051 Verify test coverage for new cards (target: 80%+ for each card)

### Documentation Updates

- [ ] T052 [P] Update CLAUDE.md with recent changes section (6 new spell cards added)
- [ ] T053 [P] Update docs/domain/card-models.md if new card patterns are introduced
- [ ] T054 [P] Add notes to specs/013-card-pool-expansion/spec.md about implementation completion

### Cleanup

- [ ] T055 Remove any temporary test code or debug logs
- [ ] T056 Verify all imports are correctly organized (no unused imports)
- [ ] T057 Review all new code for consistent naming and formatting

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Infrastructure)**: No dependencies - BLOCKS all other phases
- **Phase 2 (P1 Cards)**: Depends on Phase 1 completion
- **Phase 3 (P2 Cards)**: Depends on Phase 1 completion (can run parallel with Phase 2 if different developers)
- **Phase 4 (P3 Cards)**: Depends on Phase 1 completion (can run parallel with Phase 2 & 3)
- **Phase 5 (Polish)**: Depends on Phase 2, 3, 4 completion

### User Story Dependencies

- **Infrastructure (Phase 1)**: No dependencies - foundation for all cards
- **P1 Cards (US1-2)**: Depends on Infrastructure - Graveyard recovery + End phase effects
- **P2 Cards (US3-4)**: Depends on Infrastructure - Deck excavation + Once-per-turn constraint
- **P3 Cards (US5-6)**: Depends on Infrastructure - Toon support + LP payment

### Within Each Phase

- **Phase 1**: T001-T003 (GameState) can run in parallel, T004-T009 (step builders) can run in parallel, T010-T012 (AdvancePhaseCommand) must be sequential
- **Phase 2**: T015-T016 (card data) can run in parallel, T017-T018 (implementations) can run in parallel, T022-T023 (tests) can run in parallel
- **Phase 3**: T026-T027 (card data) can run in parallel, T028-T029 (implementations) can run in parallel, T033-T034 (tests) can run in parallel
- **Phase 4**: T037-T038 (card data) can run in parallel, T039-T040 (implementations) can run in parallel, T044-T045 (tests) can run in parallel
- **Phase 5**: T052-T054 (docs) can run in parallel

### Parallel Opportunities

- **Phase 1**: T001-T003 (GameState fields), T004-T009 (step builders)
- **Phase 2-4**: If multiple developers available, each phase can run in parallel after Phase 1 completes
- **Within each phase**: Card data registration, action implementations, and test writing can be parallelized

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2 Only)

1. Complete Phase 1: Infrastructure (GameState + step builders + AdvancePhaseCommand)
2. Complete Phase 2: P1 Cards (Magical Stone Excavation + Into the Void)
3. **STOP and VALIDATE**: All tests pass, graveyard recovery and end phase effects working
4. Commit and merge to main

### Incremental Delivery

1. Phase 1 → Infrastructure ready (GameState extended, step builders created)
2. Phase 2 (P1) → Graveyard recovery + risky draw working (MVP!)
3. Phase 3 (P2) → Deck excavation + once-per-turn constraint working
4. Phase 4 (P3) → Toon support foundation ready
5. Phase 5 → Final polish and documentation
6. Each phase validates independently with 100% test pass rate

### Parallel Team Strategy

With 2 developers:

1. Both complete Phase 1 together (Infrastructure)
2. Once Phase 1 is done:
   - Developer A: Phase 2 (P1 Cards)
   - Developer B: Phase 3 (P2 Cards)
3. Developer A or B: Phase 4 (P3 Cards)
4. Both: Phase 5 (Polish & Documentation)

---

## Success Metrics

- **SC-001**: All 6 new spell cards implemented and registered
- **SC-002**: All existing tests pass (no regressions)
- **SC-003**: All new integration tests pass (18+ new test scenarios)
- **SC-004**: Test coverage >= 80% for all new cards
- **SC-005**: Lint/format checks pass 100%
- **SC-006**: GameState extended with 2 new fields (pendingEndPhaseEffects, activatedOncePerTurnCards)
- **SC-007**: 6 new step builder functions created and tested
- **SC-008**: AdvancePhaseCommand correctly handles end phase effects and clears once-per-turn cards

---

## Notes

- [P] tasks = different files, no dependencies within that phase
- [Story] label maps task to specific user story (P1/P2/P3) for traceability
- Run tests after EVERY card implementation (not just at phase end) - safety net for incremental changes
- Commit after each phase or logical group (e.g., after Phase 2, Phase 3, etc.)
- Stop at any checkpoint to validate independently
- Target: All tests pass at ALL times
- Integration tests are added to existing test files (NormalSpells.test.ts, FieldSpells.test.ts) to maintain consistency
