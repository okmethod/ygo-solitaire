# Tasks: Zone Architecture Expansion and Card Placement Commands

**Input**: Design documents from `/specs/014-zone-expansion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/GameFacade.ts, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 既存の439テストがすべてパスすることを確認（リグレッションベースライン）
- [ ] T002 [P] TypeScriptコンパイルエラーがないことを確認
- [ ] T003 [P] Lint/Formatエラーがないことを確認（npm run lint, npm run format）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model updates that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Update Zones interface in skeleton-app/src/lib/domain/models/Zone.ts (add mainMonsterZone, spellTrapZone, fieldZone, remove field reference)
- [ ] T005 Update sendToGraveyard helper in skeleton-app/src/lib/domain/models/Zone.ts (search mainMonsterZone, spellTrapZone, fieldZone)
- [ ] T006 Update GameState interface in skeleton-app/src/lib/domain/models/GameState.ts (add normalSummonLimit, normalSummonUsed)
- [ ] T007 Update createInitialGameState in skeleton-app/src/lib/domain/models/GameState.ts (initialize new zones and summon fields)
- [ ] T008 Update CardInstance interface in skeleton-app/src/lib/domain/models/Card.ts (add battlePosition, placedThisTurn)
- [ ] T009 既存テストを修正して新Zonesインターフェースに対応（zones.field → zones.spellTrapZone）
- [ ] T010 Phase 2完了確認: すべての既存テストがパスすることを確認

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Field Zone Separation (Priority: P1) 🎯 MVP

**Goal**: 3つのゾーン（mainMonsterZone, spellTrapZone, fieldZone）を正確に分離し、フィールド魔法が正しいゾーンに配置される

**Independent Test**: ゲーム初期化時に3つのゾーンが空で存在すること、フィールド魔法を発動するとfieldZoneに配置されること、永続魔法はspellTrapZoneに配置されることを検証

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Unit test for Zones interface in skeleton-app/tests/unit/domain/models/Zone.test.ts (3つの新ゾーンの存在確認)
- [ ] T012 [P] [US1] Unit test for GameState initialization in skeleton-app/tests/unit/domain/models/GameState.test.ts (召喚権初期値確認)
- [ ] T013 [P] [US1] Unit test for sendToGraveyard in skeleton-app/tests/unit/domain/models/Zone.test.ts (新ゾーンからの墓地送り)

### Implementation for User Story 1

- [ ] T014 [US1] Update ActivateSpellCommand in skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts (フィールド魔法をfieldZoneに配置、placedThisTurn制限チェック追加)
- [ ] T015 [US1] Update ActivateSpellCommand tests in skeleton-app/tests/unit/domain/commands/ActivateSpellCommand.test.ts (フィールド魔法とspellTrapZone分離を確認)
- [ ] T016 [US1] Verify all existing spell cards (Chicken Game, Upstart Goblin, Toon World) work with new zones

**Checkpoint**: At this point, User Story 1 should be fully functional - フィールド魔法がfieldZoneに、その他の魔法がspellTrapZoneに正しく配置される

---

## Phase 4: User Story 2 - Monster Summoning (Priority: P2)

**Goal**: 手札のモンスターカードを召喚し、mainMonsterZoneに表側攻撃表示で配置できる。召喚権の管理（1ターンに1回）を実現

**Independent Test**: 手札にモンスターカードがある状態でSummonMonsterCommandを実行し、モンスターがmainMonsterZoneに表側攻撃表示で配置されること、召喚権が消費されること、2回目の召喚ができないことを検証

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US2] Unit test for SummonRule in skeleton-app/tests/unit/domain/rules/SummonRule.test.ts (召喚権チェック全条件網羅)
- [ ] T018 [P] [US2] Unit test for SummonMonsterCommand in skeleton-app/tests/unit/domain/commands/SummonMonsterCommand.test.ts (召喚コマンドの全条件)

### Implementation for User Story 2

- [ ] T019 [P] [US2] Create SummonRule in skeleton-app/src/lib/domain/rules/SummonRule.ts (canNormalSummon関数実装)
- [ ] T020 [US2] Create SummonMonsterCommand in skeleton-app/src/lib/domain/commands/SummonMonsterCommand.ts (召喚コマンド実装、normalSummonUsed+1)
- [ ] T021 [US2] Add summonMonster method to GameFacade in skeleton-app/src/lib/application/GameFacade.ts
- [ ] T022 [US2] Update GameFacade tests in skeleton-app/tests/unit/application/GameFacade.test.ts (summonMonster method)

**Checkpoint**: At this point, User Story 2 should be fully functional - モンスター召喚が動作し、召喚権が正しく管理される

---

## Phase 5: User Story 3 - Monster and Spell/Trap Setting (Priority: P2)

**Goal**: 手札のモンスターカードをセット（裏側守備表示）、魔法・罠カードをセット（裏側表示）できる。モンスターセットは召喚権を消費し、魔法・罠セットは消費しない

**Independent Test**: モンスターカードをセットしてmainMonsterZoneに裏側守備表示で配置されること、召喚権が消費されること、魔法・罠カードをセットしてspellTrapZoneまたはfieldZoneに裏側表示で配置されること、召喚権が消費されないことを検証

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T023 [P] [US3] Unit test for SetMonsterCommand in skeleton-app/tests/unit/domain/commands/SetMonsterCommand.test.ts (セットコマンドの全条件、召喚権消費確認)
- [ ] T024 [P] [US3] Unit test for SetSpellTrapCommand in skeleton-app/tests/unit/domain/commands/SetSpellTrapCommand.test.ts (魔法・罠セット、フィールド魔法自動置換)
- [ ] T025 [P] [US3] Integration test for summon flow in skeleton-app/tests/integration/summon-flow.test.ts (召喚→セット→発動の一連のフロー)

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create SetMonsterCommand in skeleton-app/src/lib/domain/commands/SetMonsterCommand.ts (裏側守備表示でmainMonsterZoneに配置、normalSummonUsed+1)
- [ ] T027 [P] [US3] Create SetSpellTrapCommand in skeleton-app/src/lib/domain/commands/SetSpellTrapCommand.ts (フィールド魔法はfieldZone、その他はspellTrapZone、自動置換実装)
- [ ] T028 [US3] Add setMonster method to GameFacade in skeleton-app/src/lib/application/GameFacade.ts
- [ ] T029 [US3] Add setSpellTrap method to GameFacade in skeleton-app/src/lib/application/GameFacade.ts
- [ ] T030 [US3] Update GameFacade tests in skeleton-app/tests/unit/application/GameFacade.test.ts (setMonster, setSpellTrap methods)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - すべての配置操作（召喚、セット、発動）が正しく動作する

---

## Phase 6: User Story 4 - UI Updates for Zone Display (Priority: P3)

**Goal**: DuelFieldコンポーネントで3つのゾーン（mainMonsterZone、spellTrapZone、fieldZone）が視覚的に区別されて表示される

**Independent Test**: DuelField.svelteを表示し、3つのゾーンが正しく表示されること、各ゾーンにカードが配置された際に適切な位置に表示されることを目視で確認

### Implementation for User Story 4

- [ ] T031 [P] [US4] Update DuelField.svelte in skeleton-app/src/lib/presentation/components/DuelField.svelte (3ゾーン表示、視覚的区別)
- [ ] T032 [P] [US4] Update Hands.svelte in skeleton-app/src/lib/presentation/components/Hands.svelte (召喚・セットボタン追加)
- [ ] T033 [US4] Manual E2E test: ゲーム起動してDuelFieldで3ゾーンが表示されることを確認
- [ ] T034 [US4] Manual E2E test: モンスター召喚・セット、魔法・罠セットがUIで正しく反映されることを確認

**Checkpoint**: All user stories should now be independently functional - UI含めてすべての機能が完成

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T035 [P] すべての単体テストを実行して全パスを確認（npm run test:run）
- [ ] T036 [P] Lint/Formatチェックを実行（npm run lint && npm run format）
- [ ] T037 既存439テスト + 新規テストがすべてパスすることを最終確認
- [ ] T038 Edge caseの手動検証（満杯ゾーンへの配置、フィールド魔法自動置換、速攻魔法セットターン発動制限）
- [ ] T039 [P] quickstart.md checklist完了確認
- [ ] T040 Code cleanup and refactoring（不要なコメント削除、命名の統一）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses SummonRule (独立実装可能)
- **User Story 3 (P2)**: Can start after US2 (SummonRuleを共有) - But independently testable
- **User Story 4 (P3)**: Can start after US1, US2, US3 (ドメインロジック完成後)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/Rules before commands
- Commands before facade methods
- Facade before UI
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: All 3 tasks can run in parallel
- Phase 2: T004-T008 can run in parallel (different files)
- User Story 1: T011, T012, T013 (tests) can run in parallel
- User Story 2: T017, T018 (tests) can run in parallel; T019 (SummonRule) independent
- User Story 3: T023, T024, T025 (tests) can run in parallel; T026, T027 (commands) can run in parallel
- User Story 4: T031, T032 (UI components) can run in parallel
- Phase 7: T035, T036, T039 can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Unit test for SummonRule in skeleton-app/tests/unit/domain/rules/SummonRule.test.ts"
Task: "Unit test for SummonMonsterCommand in skeleton-app/tests/unit/domain/commands/SummonMonsterCommand.test.ts"

# Then launch implementation (after tests fail):
Task: "Create SummonRule in skeleton-app/src/lib/domain/rules/SummonRule.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → フィールド魔法が正しいゾーンに配置される
3. Add User Story 2 → Test independently → モンスター召喚が動作する
4. Add User Story 3 → Test independently → すべての配置操作が動作する
5. Add User Story 4 → Test independently → UIで3ゾーンが視覚的に区別される
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (フィールド魔法のゾーン分離)
   - Developer B: User Story 2 (モンスター召喚)
   - Developer C: User Story 3 (セットコマンド)
3. After US1-3 complete: Developer D works on User Story 4 (UI)
4. Stories complete and integrate independently

---

## Task Summary

| Phase | Task Count | Parallelizable |
|-------|------------|----------------|
| Phase 1: Setup | 3 | 3 |
| Phase 2: Foundational | 7 | 5 |
| Phase 3: US1 (P1) | 6 | 3 |
| Phase 4: US2 (P2) | 6 | 3 |
| Phase 5: US3 (P2) | 8 | 5 |
| Phase 6: US4 (P3) | 4 | 2 |
| Phase 7: Polish | 6 | 3 |
| **Total** | **40** | **24** |

**Independent Test Criteria**:
- **US1**: フィールド魔法がfieldZoneに配置され、永続魔法がspellTrapZoneに配置される
- **US2**: モンスター召喚が動作し、召喚権が正しく管理される（1ターン1回制限）
- **US3**: モンスター・魔法・罠のセットが動作し、召喚権が正しく管理される
- **US4**: UIで3ゾーンが視覚的に区別され、カードが正しく表示される

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = ゾーン分離の基盤とフィールド魔法の正しい配置

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- すべての既存テスト（439個）が常にパスすることを確認しながら進める
- Immer.js不変性保証を維持（produce()内で状態更新）
- Domain LayerにUI依存コードを含めない（Clean Architecture原則）
