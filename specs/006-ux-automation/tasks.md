# Tasks: UX改善（自動フェーズ進行・デッキシャッフル・自動勝利判定）

**Input**: Design documents from `/specs/006-ux-automation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are included as requested in the feature specification (unit, integration, E2E tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **skeleton-app/src/lib/**: Main source code
- **skeleton-app/tests/**: Test files (unit, integration, e2e)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure for new components

- [ ] T001 Create shared utils directory in skeleton-app/src/lib/shared/utils/
- [ ] T002 Create commands directory for ShuffleDeckCommand in skeleton-app/src/lib/application/commands/ (if not exists)
- [ ] T003 [P] Create test directories for unit tests in skeleton-app/tests/unit/shared/utils/ and skeleton-app/tests/unit/application/commands/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Implement shuffleArray<T>() utility function in skeleton-app/src/lib/shared/utils/arrayUtils.ts (Fisher-Yates algorithm, O(n), immutable)
- [ ] T005 [P] Write unit tests for shuffleArray<T>() in skeleton-app/tests/unit/shared/utils/arrayUtils.test.ts (4 test cases: length, contents, randomness, immutability)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - デッキシャッフル機能 (Priority: P2)

**Goal**: ゲーム開始時にデッキをランダムにシャッフルし、毎回異なる手札・ドロー順でゲームをプレイできる

**Independent Test**: ゲーム開始時にデッキがシャッフルされ、10回のリロードで10回とも異なる手札が得られることを確認

**Why P2 first**: デッキシャッフルは他の自動化機能（US1, US3）から独立しており、並列実装可能。また、US1とUS3はデッキがシャッフルされた状態でテストする方が現実的なため、US2を先に実装する。

### Implementation for User Story 2

- [ ] T006 [P] [US2] Implement ShuffleDeckCommand class in skeleton-app/src/lib/application/commands/ShuffleDeckCommand.ts (uses shuffleArray<T>() from arrayUtils, Immer produce for immutability)
- [ ] T007 [P] [US2] Write unit tests for ShuffleDeckCommand in skeleton-app/tests/unit/application/commands/ShuffleDeckCommand.test.ts (2 test cases: successful shuffle, state immutability)
- [ ] T008 [US2] Add shuffleDeck() method to GameFacade in skeleton-app/src/lib/application/GameFacade.ts (executes ShuffleDeckCommand, returns success/error)
- [ ] T009 [US2] Call shuffleDeck() in onMount() lifecycle hook in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (with hasShuffled flag to prevent duplicate execution)
- [ ] T010 [US2] Add integration test for GameFacade.shuffleDeck() in skeleton-app/tests/integration/GameFacade.test.ts (verify deck is shuffled, state updated correctly)

**Checkpoint**: デッキシャッフル機能が完全に動作し、10回リロードで異なる手札が得られることを手動確認

---

## Phase 4: User Story 1 - ゲーム開始時の自動フェーズ進行 (Priority: P1) 🎯 MVP

**Goal**: ゲーム開始時に自動的にDraw→Standby→Main Phaseまで進行し、トースト通知で各フェーズ移行を表示

**Independent Test**: ゲーム開始後2秒以内にMain Phaseに到達し、トースト通知が3回表示されることを確認

### Implementation for User Story 1

- [ ] T011 [US1] Implement autoAdvanceToMainPhase() function in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (calls gameFacade.advancePhase() 3 times with 300ms intervals, shows toast notifications)
- [ ] T012 [US1] Add $effect() reactive block for auto-phase progression in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (triggers on currentTurn === 1 && currentPhase === "Draw", guards with hasAutoAdvanced flag and isGameOver flag)
- [ ] T013 [US1] Add toast notifications for each phase transition in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (using showSuccessToast from toaster.ts)
- [ ] T014 [US1] Add data-testid="current-phase" attribute to phase indicator element in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (for E2E testing)
- [ ] T015 [US1] Extend E2E smoke test in skeleton-app/tests/e2e/deck-loading.spec.ts (add assertion for Main Phase arrival with timeout 3000ms)

**Checkpoint**: ゲーム開始時に自動的にMain Phaseまで進行し、トースト通知が表示されることを確認（E2Eテストでも検証済み）

---

## Phase 5: User Story 3 - 自動勝利判定 (Priority: P1)

**Goal**: カード効果解決後・フェーズ移行後に自動的に勝利条件をチェックし、即座にゲームオーバー画面を表示

**Independent Test**: Exodia5体揃い時に自動的に勝利画面が表示されることを確認（手動チェック不要）

### Implementation for User Story 3

- [ ] T016 [US3] Add effectResolutionStore.subscribe() listener in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (triggers gameFacade.checkVictory() when !state.isActive && !isGameOver)
- [ ] T017 [US3] Add $effect() reactive block for phase transition victory check in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (triggers gameFacade.checkVictory() when currentPhase changes && !isGameOver)
- [ ] T018 [US3] Verify isGameOver flag guard logic prevents duplicate victory checks in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (both in effectResolutionStore and $effect blocks)
- [ ] T019 [US3] Add integration test for auto-victory check in skeleton-app/tests/integration/GameFacade.test.ts (verify checkVictory() is called after card effect resolution, not called when isGameOver is true)

**Checkpoint**: カード効果解決後とフェーズ移行後に自動的に勝利判定が実行され、Exodia5体揃い時に勝利画面が即座に表示されることを確認

---

## Phase 6: User Story 4 - 不要なUIボタン削除 (Priority: P3)

**Goal**: 自動化により不要になった「Draw Card」「Advance Phase」「Check Victory」ボタンをUI上から削除（またはDebug Infoセクション内に移動）

**Independent Test**: シミュレータページでこれらのボタンがメインUI上に存在しないこと（またはDebug Infoセクション内にのみ存在すること）を確認

### Implementation for User Story 4

- [ ] T020 [US4] Move manual action buttons (Draw Card, Advance Phase, Check Victory) to Debug Info section in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (within <details> tag, use btn-sm variant)
- [ ] T021 [US4] Comment out or remove original Actions section with manual buttons in skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte (preserve code in HTML comments for reference)
- [ ] T022 [US4] Verify E2E test does not fail due to button removal in skeleton-app/tests/e2e/deck-loading.spec.ts (buttons should not be required for smoke test to pass)

**Checkpoint**: 「Draw Card」「Advance Phase」「Check Victory」ボタンがUI上から削除され、Debug Infoセクション内にのみ表示されることを確認

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance and final validation

- [ ] T023 [P] Run all existing unit tests and verify 312+ tests pass (npm run test:run in skeleton-app/)
- [ ] T024 [P] Run linter and formatter (npm run lint && npm run format in skeleton-app/)
- [ ] T025 [P] Run all E2E tests and verify smoke test passes (npx playwright test in skeleton-app/)
- [ ] T026 Manual validation: Reload game 10 times and verify different hand each time (Success Criterion SC-002)
- [ ] T027 Manual validation: Verify game reaches Main Phase within 2 seconds (Success Criterion SC-001)
- [ ] T028 Manual validation: Verify Exodia victory auto-triggers without clicking Check Victory button (Success Criterion SC-003)
- [ ] T029 [P] Update CLAUDE.md Recent Changes section with 006-ux-automation completion status
- [ ] T030 Commit all changes with conventional commit messages (feat: デッキシャッフル機能を追加, feat: 自動フェーズ進行を実装, etc.)
- [ ] T031 Push to remote branch 006-ux-automation
- [ ] T032 Create Pull Request with spec.md link and implementation summary

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 2 (Phase 3)**: Depends on Foundational phase - can start immediately after Phase 2
- **User Story 1 (Phase 4)**: Depends on Foundational phase - can run in parallel with US2
- **User Story 3 (Phase 5)**: Depends on Foundational phase - can run in parallel with US1 and US2
- **User Story 4 (Phase 6)**: Depends on US1 and US3 completion (buttons become redundant after auto-phase and auto-victory)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 2 (P2 - Deck Shuffle)**: Independent - no dependencies on other stories
- **User Story 1 (P1 - Auto-Phase)**: Independent - no dependencies on other stories (can run in parallel with US2)
- **User Story 3 (P1 - Auto-Victory)**: Independent - no dependencies on other stories (can run in parallel with US1 and US2)
- **User Story 4 (P3 - UI Buttons)**: Depends on US1 and US3 (needs auto-phase and auto-victory to make buttons redundant)

### Within Each User Story

- **US2**: Tests (T007) can run in parallel with implementation (T006), but both must complete before T008
- **US1**: All tasks sequential (T011 → T012 → T013 → T014 → T015) due to same file modifications
- **US3**: Tests (T019) can run after implementation (T016, T017, T018) completes
- **US4**: All tasks sequential (T020 → T021 → T022) due to same file modifications

### Parallel Opportunities

- **Foundational tasks** (T004, T005): Can run in parallel (different files)
- **US2 tasks** (T006, T007): Can run in parallel (different files) until T008
- **User Stories** (US2, US1, US3): Can start in parallel after Foundational phase completes (if team capacity allows)
- **Polish tasks** (T023, T024, T025, T029): Can run in parallel (independent validation tasks)

---

## Parallel Example: User Story 2

```bash
# Launch US2 implementation and tests together:
Task: "Implement ShuffleDeckCommand class in skeleton-app/src/lib/application/commands/ShuffleDeckCommand.ts"
Task: "Write unit tests for ShuffleDeckCommand in skeleton-app/tests/unit/application/commands/ShuffleDeckCommand.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 + User Story 3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (shuffleArray utility - CRITICAL for US2)
3. Complete Phase 3: User Story 2 (Deck Shuffle - independent, enables realistic testing)
4. Complete Phase 4: User Story 1 (Auto-Phase Progression - MVP core feature)
5. Complete Phase 5: User Story 3 (Auto-Victory Check - MVP core feature)
6. **STOP and VALIDATE**: Test all 3 core features independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 2 → Test independently → Verify different hands on each reload
3. Add User Story 1 → Test independently → Verify auto-phase progression with toasts
4. Add User Story 3 → Test independently → Verify auto-victory on Exodia
5. Add User Story 4 → Test independently → Verify UI buttons moved to Debug Info
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 2 (Deck Shuffle)
   - Developer B: User Story 1 (Auto-Phase)
   - Developer C: User Story 3 (Auto-Victory)
3. After US1 and US3 complete:
   - Any developer: User Story 4 (UI Buttons)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are requested in spec.md, included for all user stories
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US2 is implemented first (P2) despite lower priority because it's independent and enables realistic testing of US1/US3
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
