# Tasks: データモデルのYGOPRODeck API互換化とレイヤー分離

**Feature**: 002-data-model-refactoring
**Input**: Design documents from `/specs/002-data-model-refactoring/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/domain-types.ts, quickstart.md

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Path Conventions

**SvelteKit monorepo structure**:
- **Frontend**: `skeleton-app/src/lib/`
  - Domain Layer: `domain/models/`, `domain/rules/`
  - Application Layer: `application/commands/`, `application/stores/`
  - Presentation Layer: `types/`, `components/`, `api/`
- **Tests**: `skeleton-app/tests/`
  - Unit tests: `tests/unit/`
  - E2E tests: `tests/e2e/playwright/`
  - Fixtures: `tests/fixtures/ygoprodeck/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and YGOPRODeck API型定義の修正

### Setup Tasks

- [X] T001 Create test fixtures directory at skeleton-app/tests/fixtures/ygoprodeck/
- [X] T002 [P] Create fixture file for Exodia at skeleton-app/tests/fixtures/ygoprodeck/exodia.json
- [X] T003 [P] Create fixture file for Pot of Greed at skeleton-app/tests/fixtures/ygoprodeck/pot-of-greed.json
- [X] T004 [P] Create fixture file for Graceful Charity at skeleton-app/tests/fixtures/ygoprodeck/graceful-charity.json

### YGOPRODeck API型定義の修正（すべてのUser Storiesの基盤）

- [X] T005 Update YGOProDeckCard interface in skeleton-app/src/lib/types/ygoprodeck.ts (frameType → optional)
- [X] T006 [P] Improve fetchYGOProDeckAPI error handling in skeleton-app/src/lib/api/ygoprodeck.ts (add logging, 429 detection)
- [X] T007 [P] Improve normalizeType function in skeleton-app/src/lib/types/ygoprodeck.ts (throw error for unknown types)

**Checkpoint**: YGOPRODeck API型定義が修正され、エラーハンドリングが強化された

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: キャッシュ実装とテストモック基盤（すべてのUser Storiesに必要）

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### キャッシュ実装

- [X] T008 Add memory cache (Map<number, YGOProDeckCard>) in skeleton-app/src/lib/api/ygoprodeck.ts
- [X] T009 Implement clearCache() function in skeleton-app/src/lib/api/ygoprodeck.ts
- [X] T010 Update getCardsByIds() to use cache in skeleton-app/src/lib/api/ygoprodeck.ts

### テストモック基盤

- [X] T011 [P] Create Vitest unit test file at skeleton-app/tests/unit/api/ygoprodeck.test.ts
- [X] T012 [P] Implement cache hit/miss test in skeleton-app/tests/unit/api/ygoprodeck.test.ts
- [X] T013 [P] Update E2E test to mock YGOPRODeck API in skeleton-app/tests/e2e/deck-loading.spec.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - ゲームロジックの保守性向上 (Priority: P1) 🎯 MVP

**Goal**: Domain Layerのゲームロジックを修正する際、表示用データに依存せず、カードIDとカードタイプのみで実装できる

**Independent Test**: Domain Layerのユニットテストが、YGOPRODeck APIへのネットワーク接続なしで完全に実行可能であることを確認（SC-001: 204 tests）

### Domain Layer型定義の追加

- [ ] T014 [P] [US1] Add DomainCardData interface in skeleton-app/src/lib/domain/models/Card.ts
- [ ] T015 [P] [US1] Add CardType type definition in skeleton-app/src/lib/domain/models/Card.ts
- [ ] T016 [P] [US1] Add @deprecated marker to existing CardData type in skeleton-app/src/lib/domain/models/Card.ts

### Domain Layer変換関数の実装

- [ ] T017 [US1] Implement createDomainCardData() function in skeleton-app/src/lib/domain/models/Card.ts
- [ ] T018 [US1] Implement inferCardTypeFromId() function in skeleton-app/src/lib/domain/models/Card.ts (temporary)
- [ ] T019 [US1] Implement validateDomainCardData() function in skeleton-app/src/lib/domain/models/Card.ts

### Domain Layer型ガードの実装

- [ ] T020 [P] [US1] Implement isMonsterCard() type guard in skeleton-app/src/lib/domain/models/Card.ts
- [ ] T021 [P] [US1] Implement isSpellCard() type guard in skeleton-app/src/lib/domain/models/Card.ts
- [ ] T022 [P] [US1] Implement isTrapCard() type guard in skeleton-app/src/lib/domain/models/Card.ts

### Domain Layerファイルの移行

- [ ] T023 [US1] Migrate skeleton-app/src/lib/domain/models/GameState.ts to use DomainCardData
- [ ] T024 [P] [US1] Migrate skeleton-app/src/lib/domain/rules/ files to use DomainCardData
- [ ] T025 [US1] Update skeleton-app/src/lib/classes/DuelState.ts to use DomainCardData (if needed)

### Domain Layer単体テストの更新

- [ ] T026 [P] [US1] Create unit test for DomainCardData validation in skeleton-app/tests/unit/domain/models/Card.test.ts
- [ ] T027 [P] [US1] Create unit test for type guards in skeleton-app/tests/unit/domain/models/Card.test.ts
- [ ] T028 [US1] Update existing Domain Layer tests to use DomainCardData in skeleton-app/tests/unit/domain/

### 検証

- [ ] T029 [US1] Run all Domain Layer unit tests offline (npm run test:run -- tests/unit/domain/) - 204 tests should pass
- [ ] T030 [US1] Verify TypeScript compilation succeeds (npm run check)

**Checkpoint**: At this point, Domain Layer (US1) should be fully functional and testable independently without network

---

## Phase 4: User Story 3 - YGOPRODeck API互換性の保証 (Priority: P1)

**Goal**: デッキレシピやゲーム状態でカードIDを扱う際、YGOPRODeck APIの数値ID（例: 33396948）をそのまま使用できる

**Independent Test**: 既存のデッキレシピのカードIDが、YGOPRODeck APIで正しく解決できることを統合テストで確認（SC-003）

### デッキレシピ型の検証

- [ ] T031 [US3] Verify RecipeCardEntry unchanged in skeleton-app/src/lib/types/deck.ts (FR-005: backward compatibility)
- [ ] T032 [US3] Add validation for RecipeCardEntry card IDs in skeleton-app/src/lib/utils/deckLoader.ts

### YGOPRODeck API統合テスト

- [ ] T033 [P] [US3] Create integration test for deck recipe loading in skeleton-app/tests/unit/utils/deckLoader.test.ts
- [ ] T034 [P] [US3] Create integration test for card ID resolution in skeleton-app/tests/unit/api/ygoprodeck.test.ts

### 検証

- [ ] T035 [US3] Load existing deck recipe and verify YGOPRODeck API resolution (manual test with fixtures)
- [ ] T036 [US3] Verify all integration tests pass (npm run test:run -- tests/unit/)

**Checkpoint**: At this point, YGOPRODeck API compatibility (US3) should be verified independently

---

## Phase 5: User Story 2 - UI表示データの柔軟性向上 (Priority: P2)

**Goal**: UIでカード情報を表示する際、YGOPRODeck APIから最新のカード名・画像・テキストを動的に取得できる

**Independent Test**: Presentation LayerのコンポーネントがYGOPRODeck APIから取得したデータを正しく表示することを、E2Eテストで確認（SC-002: 16 tests）

### Presentation Layer型定義の追加

- [ ] T037 [P] [US2] Add CardDisplayData interface in skeleton-app/src/lib/types/card.ts
- [ ] T038 [P] [US2] Add CardImages interface in skeleton-app/src/lib/types/card.ts
- [ ] T039 [P] [US2] Add MonsterAttributes interface in skeleton-app/src/lib/types/card.ts
- [ ] T040 [P] [US2] Add @deprecated marker to existing Card type in skeleton-app/src/lib/types/card.ts

### データ変換関数の実装

- [ ] T041 [US2] Implement convertToCardDisplayData() function in skeleton-app/src/lib/types/ygoprodeck.ts

### Presentation Layerファイルの移行

- [ ] T042 [US2] Update skeleton-app/src/lib/utils/deckLoader.ts to use CardDisplayData
- [ ] T043 [P] [US2] Update skeleton-app/src/lib/components/atoms/Card.svelte to use CardDisplayData
- [ ] T044 [P] [US2] Update skeleton-app/src/lib/components/atoms/CardDetailDisplay.svelte to use CardDisplayData

### Application Layerファイルの移行

- [ ] T045 [P] [US2] Update skeleton-app/src/lib/application/commands/ files to bridge Domain/Presentation layers
- [ ] T046 [P] [US2] Update skeleton-app/src/lib/application/stores/ files to use appropriate types

### E2Eテストの更新

- [ ] T047 [US2] Update skeleton-app/tests/e2e/playwright/specs/deck-loading.spec.ts to verify card display
- [ ] T048 [US2] Add test for card name display in skeleton-app/tests/e2e/playwright/specs/

### 検証

- [ ] T049 [US2] Run all E2E tests with mocked API (cd tests/e2e && npx playwright test) - 16 tests should pass
- [ ] T050 [US2] Verify TypeScript compilation succeeds (npm run check)

**Checkpoint**: At this point, Presentation Layer (US2) should be fully functional with dynamic YGOPRODeck API data

---

## Phase 6: User Story 4 - YGOPRODeck API負荷軽減 (Priority: P2)

**Goal**: テストを繰り返し実行する際、YGOPRODeck APIへの過剰なリクエストを防ぎ、外部サービスへの配慮とテスト実行速度の両立を実現できる

**Independent Test**: E2Eテストを10回連続実行した際、YGOPRODeck APIへの実リクエストが初回のみに限定されることを確認（SC-006）

### キャッシュ機能の検証

- [ ] T051 [US4] Verify cache implementation in skeleton-app/src/lib/api/ygoprodeck.ts
- [ ] T052 [US4] Add test for cache hit ratio in skeleton-app/tests/unit/api/ygoprodeck.test.ts

### バッチリクエストの最適化検証

- [ ] T053 [US4] Verify getCardsByIds() batch request in skeleton-app/src/lib/api/ygoprodeck.ts (NFR-001)
- [ ] T054 [US4] Add test for batch request optimization in skeleton-app/tests/unit/api/ygoprodeck.test.ts

### E2Eテストのモック検証

- [ ] T055 [US4] Verify E2E tests use mocked API in skeleton-app/tests/e2e/playwright/specs/
- [ ] T056 [US4] Add monitoring for API request count in E2E tests

### 検証

- [ ] T057 [US4] Run E2E tests 10 times consecutively and verify minimal API requests (manual test)
- [ ] T058 [US4] Verify cache clears between test runs (npm run test:run -- tests/unit/api/)

**Checkpoint**: At this point, YGOPRODeck API load reduction (US4) should be verified independently

---

## Phase 7: Cleanup & Migration Completion

**Purpose**: 旧型定義の削除とドキュメント化

### 旧型定義の削除

- [ ] T059 Remove @deprecated CardData type from skeleton-app/src/lib/domain/models/Card.ts
- [ ] T060 Remove @deprecated Card type from skeleton-app/src/lib/types/card.ts

### 最終検証

- [ ] T061 Run all unit tests (npm run test:run) - 204+ tests should pass
- [ ] T062 Run all E2E tests (cd tests/e2e && npx playwright test) - 16+ tests should pass
- [ ] T063 Run TypeScript compilation (npm run check) - 0 errors
- [ ] T064 Run linter/formatter (npm run lint && npm run format) - 0 errors

### ドキュメント作成

- [ ] T065 [P] Create docs/architecture/data-model-design.md with data model design documentation (SC-005)
- [ ] T066 [P] Update CLAUDE.md with new data model context (already done by update-agent-context.sh)

**Checkpoint**: All user stories complete, old types removed, documentation updated

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T067 [P] Code cleanup and refactoring across all layers
- [ ] T068 [P] Performance profiling for YGOPRODeck API requests
- [ ] T069 Run quickstart.md validation (follow quickstart.md steps manually)
- [ ] T070 [P] Create ADR for data model separation strategy (ADR-00XX)
- [ ] T071 [P] Add JSDoc comments to all public APIs
- [ ] T072 Final integration test across all user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - **US1 (P1) - Domain Layer**: Can start after Phase 2 - No dependencies on other stories
  - **US3 (P1) - API Compatibility**: Can start after Phase 2 - May run in parallel with US1
  - **US2 (P2) - Presentation Layer**: Depends on US1 completion (needs DomainCardData defined)
  - **US4 (P2) - API Optimization**: Depends on Phase 2 completion (cache already implemented)
- **Cleanup (Phase 7)**: Depends on all user stories (Phase 3-6) being complete
- **Polish (Phase 8)**: Depends on Cleanup completion

### User Story Dependencies

```
Phase 2 (Foundational) ──┬──> US1 (P1) ──> US2 (P2) ──┬──> Phase 7 (Cleanup) ──> Phase 8 (Polish)
                         │                             │
                         ├──> US3 (P1) ────────────────┤
                         │                             │
                         └──> US4 (P2) ────────────────┘
```

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1, can run in parallel
- **User Story 2 (P2)**: Can start after US1 completion - Needs DomainCardData type definition
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, cache already implemented in Phase 2

### Within Each User Story

**User Story 1 (Domain Layer)**:
1. Type definitions → Conversion functions → Type guards
2. Domain Layer file migration
3. Unit tests update
4. Verification

**User Story 3 (API Compatibility)**:
1. Deck recipe type verification
2. Integration tests
3. Verification

**User Story 2 (Presentation Layer)**:
1. Type definitions → Conversion functions
2. Presentation Layer file migration
3. E2E tests update
4. Verification

**User Story 4 (API Optimization)**:
1. Cache verification
2. Batch request verification
3. E2E test mock verification
4. Load test

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel (different fixture files)
- T006, T007 can run in parallel (different concerns in YGOPRODeck API)

**Phase 2 (Foundational)**:
- T011, T012, T013 can run in parallel (different test files)

**Phase 3 (US1)**:
- T014, T015, T016 can run in parallel (different type definitions)
- T020, T021, T022 can run in parallel (different type guards)
- T024 (domain/rules/) can run in parallel with other migrations
- T026, T027 can run in parallel (different test cases)

**Phase 4 (US3)**:
- T033, T034 can run in parallel (different test files)

**Phase 5 (US2)**:
- T037, T038, T039, T040 can run in parallel (different type definitions)
- T043, T044 can run in parallel (different Svelte components)
- T045, T046 can run in parallel (different Application Layer files)

**Phase 8 (Polish)**:
- T065, T066, T068, T070, T071 can run in parallel (different documentation/cleanup tasks)

**Cross-Story Parallelism**:
- **After Phase 2 completes**, US1 and US3 can run in parallel (both P1, independent)
- **After US1 completes**, US2 can start while US4 continues (if US4 started after Phase 2)

---

## Parallel Example: User Story 1 (Domain Layer)

```bash
# After Phase 2 completes, launch all type definitions in parallel:
Task: "Add DomainCardData interface in skeleton-app/src/lib/domain/models/Card.ts"
Task: "Add CardType type definition in skeleton-app/src/lib/domain/models/Card.ts"
Task: "@deprecated marker to existing CardData type"

# Then launch all type guards in parallel:
Task: "isMonsterCard() type guard"
Task: "isSpellCard() type guard"
Task: "isTrapCard() type guard"

# Launch Domain Layer migrations in parallel:
Task: "Migrate GameState.ts to DomainCardData"
Task: "Migrate domain/rules/ files to DomainCardData"

# Launch test updates in parallel:
Task: "Unit test for DomainCardData validation"
Task: "Unit test for type guards"
```

---

## Parallel Example: User Story 1 + User Story 3 (Both P1)

```bash
# After Phase 2 completes, two developers can work in parallel:

# Developer A: User Story 1 (Domain Layer)
Task: "T014-T030" (Domain Layer type definitions and migrations)

# Developer B: User Story 3 (API Compatibility)
Task: "T031-T036" (API compatibility verification)

# Both stories are independent and can be completed in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3 Only)

**Why**: Both are P1 priority and provide foundational value

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T013) **CRITICAL - blocks all stories**
3. **Parallel execution**:
   - Complete Phase 3: User Story 1 (T014-T030) - Domain Layer independence
   - Complete Phase 4: User Story 3 (T031-T036) - API compatibility
4. **STOP and VALIDATE**:
   - Test User Story 1 independently (204 unit tests offline)
   - Test User Story 3 independently (deck recipe loading with YGOPRODeck API)
5. Deploy/demo if ready (MVP: Domain Layer + API compatibility)

### Incremental Delivery

1. **Foundation**: Setup + Foundational (Phase 1-2) → Foundation ready
2. **MVP**: Add User Story 1 + 3 (Phase 3-4) → Test independently → **Deploy/Demo** ✅
3. **UI Enhancement**: Add User Story 2 (Phase 5) → Test independently → Deploy/Demo
4. **Optimization**: Add User Story 4 (Phase 6) → Test independently → Deploy/Demo
5. **Polish**: Cleanup + Cross-cutting (Phase 7-8) → Final release

### Parallel Team Strategy

With 2 developers:

1. **Together**: Complete Setup + Foundational (Phase 1-2)
2. **Split after Foundational**:
   - Developer A: User Story 1 (Phase 3) - Domain Layer
   - Developer B: User Story 3 (Phase 4) - API Compatibility
3. **Sequential after P1 stories**:
   - Developer A: User Story 2 (Phase 5) - Presentation Layer (depends on US1)
   - Developer B: User Story 4 (Phase 6) - API Optimization (independent)
4. **Together**: Cleanup + Polish (Phase 7-8)

With 3+ developers:

1. **Together**: Complete Setup + Foundational (Phase 1-2)
2. **Split after Foundational**:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 3 (Phase 4)
   - Developer C: User Story 4 (Phase 6) - can start immediately after Phase 2
3. **Developer A continues**: User Story 2 (Phase 5) after completing US1
4. **Together**: Cleanup + Polish (Phase 7-8)

---

## Task Summary

### Total Tasks: 72

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 6 tasks **← BLOCKS all user stories**
- **Phase 3 (US1 - Domain Layer, P1)**: 17 tasks 🎯 MVP
- **Phase 4 (US3 - API Compatibility, P1)**: 6 tasks 🎯 MVP
- **Phase 5 (US2 - Presentation Layer, P2)**: 14 tasks
- **Phase 6 (US4 - API Optimization, P2)**: 8 tasks
- **Phase 7 (Cleanup)**: 8 tasks
- **Phase 8 (Polish)**: 6 tasks

### Parallel Opportunities: 28 tasks marked [P]

- Phase 1: 4 parallel tasks
- Phase 2: 3 parallel tasks
- Phase 3 (US1): 11 parallel tasks
- Phase 4 (US3): 2 parallel tasks
- Phase 5 (US2): 7 parallel tasks
- Phase 8: 5 parallel tasks

### Independent Test Criteria by User Story

- **US1 (Domain Layer)**: 204 unit tests pass offline (npm run test:run -- tests/unit/domain/)
- **US3 (API Compatibility)**: Existing deck recipes load successfully with YGOPRODeck API
- **US2 (Presentation Layer)**: 16 E2E tests pass with mocked API (cd tests/e2e && npx playwright test)
- **US4 (API Optimization)**: E2E tests run 10x with minimal real API requests

### Suggested MVP Scope

**Phase 1-4 only** (Setup + Foundational + US1 + US3):
- Total MVP tasks: 36 tasks (50% of total)
- Delivers: Domain Layer independence + YGOPRODeck API compatibility
- Can be validated independently without Presentation Layer changes
- Provides foundation for future UI enhancements (US2) and optimizations (US4)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical Path**: Phase 1 → Phase 2 (foundational MUST complete first) → US1/US3 in parallel (P1 priority)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Tests are OPTIONAL**: This feature spec does not explicitly request TDD approach, so test tasks focus on verification checkpoints rather than test-first development
