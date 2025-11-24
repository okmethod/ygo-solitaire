---
description: "Architecture Refactoring - Separating Game Logic from UI"
---

# Tasks: Architecture Refactoring - Separating Game Logic from UI

**Input**: Design documents from `/specs/001-architecture-refactoring/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as part of implementation validation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `skeleton-app/src/lib/` - フロントエンドにすべてのゲームロジックを配置
- **Tests**: `skeleton-app/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (domain/, application/, presentation/) in skeleton-app/src/lib/
- [x] T002 Install Immer.js dependency for immutable state management
- [x] T002.5 [P] Configure test coverage thresholds in skeleton-app/vitest.config.ts
  - Set coverage.lines threshold to 80 (SC-002: 80%+ coverage for domain/)
  - Set coverage.include to ['src/lib/domain/**/*.ts']
  - Enable coverage.reporter: ['text', 'html', 'json-summary']
  - Verify npm run test:coverage fails if threshold not met
- [x] T003 [P] Configure ESLint rules to enforce layer boundaries in skeleton-app/.eslintrc.js
  - Add no-restricted-imports rule: domain/ cannot import from svelte, application/, presentation/
  - Add no-restricted-imports rule: application/ cannot import from presentation/
  - Create boundary violation test in skeleton-app/tests/unit/eslint-boundary.test.ts to verify TypeScript compile error on Svelte import

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create GameState interface with readonly modifiers in skeleton-app/src/lib/domain/models/GameState.ts
- [x] T005 [P] Create Zone types (Zones, CardPosition) in skeleton-app/src/lib/domain/models/Zone.ts
- [x] T006 [P] Create Card types (CardData, CardInstance) in skeleton-app/src/lib/domain/models/Card.ts
- [x] T007 Create constants file (EXODIA_PIECE_IDS, PHASE_NAMES, ZONE_SIZES) in skeleton-app/src/lib/domain/models/constants.ts
- [x] T008 [P] Implement updateGameState helper function using Immer in skeleton-app/src/lib/domain/models/GameState.ts
- [x] T009 [P] Implement createInitialGameState factory function in skeleton-app/src/lib/domain/models/GameState.ts
- [x] T010 Create test utilities (gameStateFactory, mockDeckRecipe) in skeleton-app/src/lib/__testUtils__/gameStateFactory.ts
- [x] T011 Create validation functions (validateGameState, GameStateInvariants) in skeleton-app/src/lib/domain/models/GameStateInvariants.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - ドメインロジックの独立テスト (Priority: P1) 🎯 MVP

**Goal**: 開発者として、UIコンポーネントを起動せずにゲームロジックをテストできる。

**Independent Test**: 任意のカード効果（例：強欲な壺）をテストコードから直接実行し、GameStateの変化（手札+2枚、墓地+1枚）を検証できる。ブラウザやSvelteコンポーネントは一切不要。

### Domain Models Implementation

- [ ] T012 [P] [US1] Add helper functions to Card.ts (getCardData, getUniqueCardData) in skeleton-app/src/lib/domain/models/Card.ts
- [ ] T013 [P] [US1] Unit test for GameState creation and immutability in skeleton-app/tests/unit/domain/models/GameState.test.ts
- [ ] T014 [P] [US1] Unit test for validation functions in skeleton-app/tests/unit/domain/models/GameStateInvariants.test.ts

### Domain Rules Implementation

- [x] T015 [P] [US1] Implement VictoryRule (checkVictory, hasExodiaPieces) in skeleton-app/src/lib/domain/rules/VictoryRule.ts
- [x] T016 [P] [US1] Implement PhaseRule (canTransition, nextPhase) in skeleton-app/src/lib/domain/rules/PhaseRule.ts
- [x] T017 [P] [US1] Implement SpellActivationRule (canActivate) in skeleton-app/src/lib/domain/rules/SpellActivationRule.ts
- [ ] T018 [P] [US1] Implement ChainRule (resolveChain, addToChain) in skeleton-app/src/lib/domain/rules/ChainRule.ts

### Domain Rules Testing

- [x] T019 [P] [US1] Unit test for VictoryRule (Exodia, LP0, DeckOut scenarios) in skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts
- [x] T020 [P] [US1] Unit test for PhaseRule (valid/invalid transitions) in skeleton-app/tests/unit/domain/rules/PhaseRule.test.ts
- [x] T021 [P] [US1] Unit test for SpellActivationRule in skeleton-app/tests/unit/domain/rules/SpellActivationRule.test.ts
- [ ] T022 [P] [US1] Unit test for ChainRule (LIFO resolution) in skeleton-app/tests/unit/domain/rules/ChainRule.test.ts

### Documentation

- [x] T023 [US1] Run tests with npm test to verify domain layer is framework-independent
- [x] T024 [US1] Verify no Svelte imports exist in domain/ with grep command

**Checkpoint**: At this point, User Story 1 should be fully functional - domain layer can be tested without any UI

---

## Phase 4: User Story 2 - 新規カード効果の拡張性 (Priority: P2)

**Goal**: 開発者として、新しいカード効果を追加する際に、既存のGameEngineコードを修正せずに済む。

**Independent Test**: 新しいカード効果クラス（例：ThunderBolt）を作成し、CardRegistryに登録するだけで、GameEngineが自動的に認識・実行できる。

### Effect System Migration

- [ ] T025 [US2] Update BaseEffect interface to accept GameState and return newState in EffectResult in skeleton-app/src/lib/domain/effects/bases/BaseEffect.ts
- [ ] T026 [US2] Update BaseMagicEffect to use new GameState pattern in skeleton-app/src/lib/domain/effects/bases/BaseMagicEffect.ts
- [ ] T027 [P] [US2] Update DrawEffect to use updateGameState with Immer in skeleton-app/src/lib/domain/effects/primitives/DrawEffect.ts
- [ ] T028 [P] [US2] Update DiscardEffect to use updateGameState with Immer in skeleton-app/src/lib/domain/effects/primitives/DiscardEffect.ts

### Card Effect Migration

- [ ] T029 [US2] Migrate PotOfGreedEffect to return newState in skeleton-app/src/lib/domain/effects/cards/magic/normal/PotOfGreedEffect.ts
- [ ] T030 [US2] Migrate GracefulCharityEffect to return newState in skeleton-app/src/lib/domain/effects/cards/magic/normal/GracefulCharityEffect.ts
- [ ] T031 [P] [US2] Update other existing card effects to return newState in skeleton-app/src/lib/domain/effects/cards/

### Effect System Testing

- [ ] T032 [P] [US2] Unit test for BaseEffect with GameState pattern in skeleton-app/tests/unit/domain/effects/BaseEffect.test.ts
- [ ] T033 [P] [US2] Unit test for PotOfGreedEffect returning newState in skeleton-app/tests/unit/domain/effects/PotOfGreedEffect.test.ts
- [ ] T034 [P] [US2] Unit test for GracefulCharityEffect returning newState in skeleton-app/tests/unit/domain/effects/GracefulCharityEffect.test.ts

### Extensibility Validation

- [ ] T035 [US2] Create a new test card effect (e.g., MockDrawEffect) and verify it works without modifying EffectRepository in skeleton-app/tests/unit/domain/effects/extensibility.test.ts
- [ ] T036 [US2] Verify CARD_EFFECTS registry in cardEffects.ts supports new effects without code changes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - new card effects can be added without modifying core engine

---

## Phase 5: User Story 3 - UIとロジックの疎結合化 (Priority: P3)

**Goal**: 開発者として、UIレイヤー（Svelteコンポーネント）の変更がゲームロジックに影響を与えない状態を保つ。

**Independent Test**: Svelteコンポーネントを別のUIライブラリ（例：React）に置き換えた場合でも、domain/とapplication/は変更不要。

### Application Commands Implementation

- [x] T037 [P] [US3] Create IGameCommand interface in skeleton-app/src/lib/application/commands/GameCommand.ts
- [x] T038 [P] [US3] Implement DrawCardCommand (canExecute, execute, description) in skeleton-app/src/lib/application/commands/DrawCardCommand.ts
- [x] T039 [P] [US3] Implement AdvancePhaseCommand using PhaseRule in skeleton-app/src/lib/application/commands/AdvancePhaseCommand.ts
- [x] T040 [US3] Implement ActivateSpellCommand (hand → field → effect → graveyard) in skeleton-app/src/lib/application/commands/ActivateSpellCommand.ts

### Application Stores Implementation

- [x] T041 [US3] Create gameStateStore (writable store) in skeleton-app/src/lib/application/stores/gameStateStore.ts
- [x] T042 [US3] Create derived stores (handCount, hasExodia, currentPhase, etc.) in skeleton-app/src/lib/application/stores/derivedStores.ts

### GameFacade Implementation

- [x] T043 [US3] Implement GameFacade (initializeGame, drawCard, activateSpell, advancePhase) in skeleton-app/src/lib/application/GameFacade.ts
- [x] T044 [US3] Implement checkVictory method in GameFacade using VictoryRule in skeleton-app/src/lib/application/GameFacade.ts

### Application Layer Testing

- [x] T045 [P] [US3] Integration test for DrawCardCommand with GameState in skeleton-app/tests/integration/commands/DrawCardCommand.test.ts
- [x] T046 [P] [US3] Integration test for ActivateSpellCommand with effect execution in skeleton-app/tests/integration/commands/ActivateSpellCommand.test.ts
- [x] T047 [P] [US3] Integration test for AdvancePhaseCommand in skeleton-app/tests/integration/commands/AdvancePhaseCommand.test.ts
- [x] T048 [US3] Integration test for GameFacade with store updates in skeleton-app/tests/integration/GameFacade.test.ts

### UI Migration

- [x] T049 [US3] Create GameStateAdapter for DuelState ↔ GameState conversion in skeleton-app/src/lib/presentation/adapters/GameStateAdapter.ts (completed as alternative approach)
- [x] T049.5 [US3] Create new simulator-v2 page demonstrating new architecture in skeleton-app/src/routes/(auth)/simulator-v2/[deckId]/ (completed as demo)
- [ ] T050 [US3] Update hand rendering to use $gameState store in skeleton-app/src/lib/presentation/components/organisms/board/DuelField.svelte
- [ ] T051 [US3] Update card activation handlers to call GameFacade methods in skeleton-app/src/lib/presentation/components/organisms/board/DuelField.svelte
- [ ] T052 [US3] Update phase display to use derived stores in skeleton-app/src/lib/presentation/components/organisms/board/DuelField.svelte

### E2E Testing

- [ ] T053 [US3] E2E test for Exodia victory scenario (draw cards, activate spells, win) in skeleton-app/tests/e2e/exodia-victory.spec.ts
- [ ] T054 [P] [US3] E2E test for phase transitions in skeleton-app/tests/e2e/phase-transitions.spec.ts
- [ ] T055 [P] [US3] E2E test for spell activation flow in skeleton-app/tests/e2e/spell-activation.spec.ts

**Checkpoint**: All user stories should now be independently functional - UI is completely decoupled from domain logic

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Create adapter function convertDuelStateToGameState for backward compatibility in skeleton-app/src/lib/__testUtils__/duelStateAdapter.ts
- [ ] T057 [P] Add JSDoc comments to all public interfaces in domain/ and application/ layers
- [ ] T058 Run linter (npm run lint) and fix any violations
- [ ] T059 Run formatter (npm run format) on all modified files
- [ ] T060 Verify test coverage is ≥80% for domain layer with npm run test:coverage
- [ ] T061 [P] Update CLAUDE.md documentation with new architecture patterns
- [ ] T062 Remove old DuelState.ts file from skeleton-app/src/lib/classes/DuelState.ts
- [ ] T063 Remove old effect class imports from components
- [ ] T064 Run full test suite (unit + integration + E2E) with npm test
- [ ] T065 Performance validation with Vitest benchmark in skeleton-app/tests/unit/performance/benchmark.test.ts
  - Measure updateGameState() execution time (average of 10 runs)
  - Verify <50ms per state update (from plan.md Performance Goals)
  - Measure UI re-render time with Svelte testing-library
  - Verify 60fps rendering capability
  - Document results in specs/001-architecture-refactoring/performance-results.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1's domain layer
- **User Story 3 (P3)**: Depends on US2 completion - Requires migrated effect system

### Within Each User Story

**User Story 1 (P1)**:
1. Domain models first (T012-T014)
2. Domain rules implementation (T015-T018)
3. Domain rules testing (T019-T022)
4. Documentation and verification (T023-T024)

**User Story 2 (P2)**:
1. Effect system base classes (T025-T028)
2. Card effect migration (T029-T031)
3. Effect testing (T032-T034)
4. Extensibility validation (T035-T036)

**User Story 3 (P3)**:
1. Commands and stores (T037-T042) can run in parallel
2. GameFacade implementation (T043-T044)
3. Application layer testing (T045-T048)
4. UI migration (T049-T052)
5. E2E testing (T053-T055)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within US1: T012-T014 (models testing), T015-T018 (rules implementation), T019-T022 (rules testing) can be parallelized
- Within US2: T027-T028 (primitive effects), T032-T034 (effect testing) can be parallelized
- Within US3: T037-T039 (commands), T045-T047 (command tests), T053-T055 (E2E tests) can be parallelized

---

## Current Progress Summary (2025-11-24)

### ✅ Completed Phases
- **Phase 1: Setup** - 100% complete (T001-T003)
- **Phase 2: Foundational** - 100% complete (T004-T011)
- **Phase 3: User Story 1** - 66% complete (Domain rules + tests done)

### 🚧 In Progress
- **Phase 5: User Story 3** - 80% complete
  - ✅ Commands (DrawCardCommand, AdvancePhaseCommand, ActivateSpellCommand)
  - ✅ Stores (gameStateStore, derivedStores)
  - ✅ GameFacade with unit tests
  - ✅ GameStateAdapter + simulator-v2 demo page
  - ✅ All command tests (T045-T048)
  - ⏳ Full UI migration pending (T050-T052)

### 📊 Test Results
- **Total Tests**: 298/298 passing
- **Coverage**: 80%+ for domain/ (vitest.config.ts enforced)
- **Type Safety**: All type checks passing
- **Linting**: All ESLint/Prettier checks passing

### 🎯 Next Steps
1. ✅ ~~Complete T011 (GameStateInvariants validation)~~ - Done
2. ✅ ~~Implement T040 (ActivateSpellCommand)~~ - Done
3. Migrate existing UI components (T050-T052)
4. E2E testing (T053-T055)
5. Phase 4 (Effect System) migration

---

## Parallel Example: User Story 1

```bash
# Launch all rule implementations together:
Task: "Implement VictoryRule in skeleton-app/src/lib/domain/rules/VictoryRule.ts"
Task: "Implement PhaseRule in skeleton-app/src/lib/domain/rules/PhaseRule.ts"
Task: "Implement SpellActivationRule in skeleton-app/src/lib/domain/rules/SpellActivationRule.ts"
Task: "Implement ChainRule in skeleton-app/src/lib/domain/rules/ChainRule.ts"

# Launch all rule tests together:
Task: "Unit test for VictoryRule in skeleton-app/tests/unit/domain/rules/VictoryRule.test.ts"
Task: "Unit test for PhaseRule in skeleton-app/tests/unit/domain/rules/PhaseRule.test.ts"
Task: "Unit test for SpellActivationRule in skeleton-app/tests/unit/domain/rules/SpellActivationRule.test.ts"
Task: "Unit test for ChainRule in skeleton-app/tests/unit/domain/rules/ChainRule.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently with `npm test -- domain/`
5. Verify no Svelte imports in domain/ with `grep -r "from 'svelte'" skeleton-app/src/lib/domain/`

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Domain layer can be tested without UI
   - Game rules are validated with unit tests
3. Add User Story 2 → Test independently → Deploy/Demo
   - New card effects can be added without modifying core engine
   - Effect system is fully migrated to immutable pattern
4. Add User Story 3 → Test independently → Deploy/Demo
   - UI is completely decoupled from domain logic
   - GameFacade provides clean API boundary
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Domain Models + Rules)
   - Developer B: User Story 2 (Effect System Migration) - can start in parallel after T011
   - Developer C: Prepare User Story 3 scaffolding (wait for US2)
3. After US1 + US2 complete:
   - Developer A + B + C: User Story 3 (Application + UI layer)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Run linter/formatter before each commit: `npm run lint && npm run format`
- Run relevant tests after each task: `npm test -- path/to/test`
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **IMPORTANT**: Do not commit unless tests pass and linter/formatter succeed
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Test Commands Reference

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run skeleton-app/tests/unit/domain/models/GameState.test.ts

# Run tests in watch mode
npx vitest skeleton-app/tests/unit/domain/

# Run with coverage
npm run test:coverage

# Run E2E tests
npx playwright test

# Run linter
npm run lint

# Run formatter
npm run format

# Type check
npm run check
```

---

## Success Criteria Validation

After completing all tasks, verify:

- **SC-001**: `grep -r "from 'svelte'" skeleton-app/src/lib/domain/` returns 0 results
- **SC-002**: `npm run test:coverage` shows ≥80% coverage for domain/
- **SC-003**: Add new card effect to cardEffects.ts without modifying GameEngine (0 lines changed in core)
- **SC-004**: All existing card effects produce same results (regression tests pass)
- **SC-005**: All GameState updates use Immer (no manual mutation)
