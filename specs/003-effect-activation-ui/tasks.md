# Tasks: Effect Activation UI with Card Illustrations

**Input**: Design documents from `/specs/003-effect-activation-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: テストタスクは仕様書で明示的に要求されていないため、検証チェックポイントとして含める（TDD方式ではない）

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーは独立して実装・テスト可能

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（US1, US2, US3）
- 説明に正確なファイルパスを含める

## Path Conventions

- **プロジェクト構造**: `skeleton-app/src/lib/` (SvelteKitプロジェクト)
- **3層アーキテクチャ**:
  - Domain: `src/lib/domain/` (既存、変更なし)
  - Application: `src/lib/application/` (新規cardDisplayStore追加)
  - Presentation: `src/lib/components/`, `src/routes/` (DuelField統合)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクト初期化と基本構造確認

- [X] T001 開発環境セットアップ確認（Node.js 18+、npm依存関係インストール済み）
- [X] T002 [P] ブランチ `003-effect-activation-ui` の作業準備確認
- [X] T003 [P] 既存のgameStateStore、derivedStores動作確認（skeleton-app/src/lib/application/stores/）

**Checkpoint**: ✅ 開発環境準備完了

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザーストーリー実装の前提となるコア機能

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリー作業は開始できない

- [X] T004 cardDisplayStore.tsの骨格作成（skeleton-app/src/lib/application/stores/cardDisplayStore.ts）- derivedストア4つのexport定義
- [X] T005 [P] handCards derivedストアの実装（gameStateStore.zones.handを監視、getCardsByIds()呼び出し）
- [X] T006 [P] fieldCards derivedストアの実装（gameStateStore.zones.fieldを監視）
- [X] T007 [P] graveyardCards derivedストアの実装（gameStateStore.zones.graveyardを監視）
- [X] T008 [P] banishedCards derivedストアの実装（gameStateStore.zones.banishedを監視）
- [X] T009 エラーハンドリング追加（API失敗時の空配列返却、console.errorログ）
- [X] T010 cardDisplayStore単体テスト作成（tests/unit/cardDisplayStore.test.ts - 10テストケース）
- [X] T011 テスト実行・合格確認（`npm run test:run` - 249/249 tests passing）

**Checkpoint**: ✅ cardDisplayStoreが完全に動作し、テスト合格

---

## Phase 3: User Story 1 - View Card Illustrations in Hand and Field (Priority: P1) 🎯 MVP

**Goal**: カードIDではなくイラスト画像で表示する

**Independent Test**: シミュレーターページでカードをドロー後、手札にカードイラスト（画像）が表示されることを確認

### Implementation for User Story 1

- [ ] T012 [P] [US1] V2シミュレーターページへのcardDisplayStoreインポート追加（skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte）
- [ ] T013 [P] [US1] 手札表示ロジック修正：$handCardsからCardDisplayDataを取得し、Card.svelteに渡す
- [ ] T014 [US1] 手札カードとinstanceIdのマッピングロジック実装（$gameStateStore.zones.handと$handCardsの組み合わせ）
- [ ] T015 [US1] Card.svelteへのprops渡し修正：card={cardData} size="medium" で画像表示
- [ ] T016 [US1] ローディング中のplaceholder表示実装（cardDataがundefinedの場合）
- [ ] T017 [US1] 動作確認：シミュレーターページでDraw Card → 手札にカードイラスト表示、既存ゲームコントロール（Draw Card/Advance Phaseボタン）との統合確認

**Checkpoint**: US1完全動作 - 手札カードがイラスト表示され、カードIDのみの表示は0件

---

## Phase 4: User Story 2 - Execute Card Effect Commands from UI (Priority: P2)

**Goal**: カードクリックで効果発動コマンドを実行できるようにする

**Independent Test**: Main1フェーズで手札の魔法カードをクリックし、効果が発動され（トーストメッセージ表示）、カードが墓地に移動することを確認

### Implementation for User Story 2

- [ ] T018 [P] [US2] handleCardClick関数の実装（card: CardDisplayData, instanceId: stringを受け取る）
- [ ] T019 [P] [US2] フェーズチェックロジック追加（$currentPhase === "Main1"のみ発動可能）
- [ ] T020 [P] [US2] 魔法発動可否チェック追加（$canActivateSpellsを使用）
- [ ] T021 [US2] GameFacade.activateSpell(instanceId)呼び出し実装（魔法カード専用、将来的にモンスター効果も追加可能）
- [ ] T022 [US2] トーストメッセージ表示ロジック追加（成功時はshowSuccessToast、失敗時はshowErrorToast）
- [ ] T023 [US2] Card.svelteのclickableとonClickプロパティ設定（Main1フェーズかつcanActivateSpellsがtrueの場合のみclickable）
- [ ] T024 [US2] 動作確認：Advance Phase → Main1 → 手札魔法カードクリック → トースト表示 → カード移動確認

**Checkpoint**: US2完全動作 - カードクリックで効果発動でき、ゲーム状態がリアルタイムでUI反映

---

## Phase 5: User Story 3 - Interactive Card Detail Display (Priority: P3)

**Goal**: カード詳細情報のモーダル表示

**Independent Test**: 任意のカードイラストをクリックし、カード詳細モーダルが開き、効果テキストやステータスが表示されることを確認

### Implementation for User Story 3

- [ ] T025 [P] [US3] Card.svelteのshowDetailOnClickプロパティを有効化（既存機能を活用）
- [ ] T026 [US3] 手札カードにshowDetailOnClick={true}を設定
- [ ] T027 [US3] フィールドカードにもshowDetailOnClick={true}を設定（将来のDuelField統合時）
- [ ] T028 [US3] 動作確認：カードクリック → CardDetailDisplayモーダル表示 → 詳細情報確認

**Checkpoint**: US3完全動作 - カード詳細をモーダルで確認可能

---

## Phase 6: DuelField Integration (US1拡張)

**Goal**: V2シミュレーターにDuelFieldコンポーネントを統合し、全ゾーンのカードイラスト表示を実現

**Note**: US1の手札表示が完了した後、フィールド全体の統合を行う

### Implementation for DuelField Integration

- [ ] T029 [P] [US1] DuelFieldコンポーネントのインポート追加（skeleton-app/src/routes/(auth)/simulator/[deckId]/+page.svelte）
- [ ] T030 [P] [US1] フィールド魔法ゾーン用カード抽出ロジック実装（$fieldCardsからframeType === "field"をフィルタ）
- [ ] T031 [P] [US1] モンスターゾーン用カード配列作成（type === "monster"、5枚固定、null埋め）
- [ ] T032 [P] [US1] 魔法・罠ゾーン用カード配列作成（type === "spell" | "trap" かつ frameType !== "field"、5枚固定）
- [ ] T033 [US1] DuelFieldコンポーネントへのprops渡し実装（deckCards, extraDeckCards, graveyardCards, fieldCards, monsterCards, spellTrapCards）
- [ ] T034 [US1] 既存の手札表示エリアをDuelFieldと併用する形で配置調整
- [ ] T035 [US1] 動作確認：全ゾーン（手札、フィールド、墓地、デッキ）でカードイラスト表示確認、既存ゲームコントロールとの統合維持確認（FR-008対応）

**Checkpoint**: DuelField統合完了 - 全ゾーンでカードイラスト表示され、遊戯王らしいフィールドレイアウト実現

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [ ] T036 [P] Linter実行（`npm run lint`）とエラー修正
- [ ] T037 [P] Formatter実行（`npm run format`）
- [ ] T038 [P] 全単体テスト実行・合格確認（`npm run test:run`）
- [ ] T039 [P] ビルド確認（`npm run build`）
- [ ] T040 パフォーマンス検証：40枚同時表示でフレームレート30fps以上維持確認（失敗時はリファクタリングorスコープ縮小の判断を記録）
- [ ] T041 API呼び出し頻度確認：キャッシュヒット時は追加リクエスト0件（失敗時はキャッシュロジック見直し）
- [ ] T042 E2Eテスト作成・実行（skeleton-app/tests/e2e/effect-activation-ui.test.ts）
- [ ] T043 [P] quickstart.md検証：各フェーズの手順通りに動作することを確認
- [ ] T044 コミット：各フェーズごとに適切なコミットメッセージでコミット
- [ ] T045 PR作成：mainブランチへのマージリクエスト作成（目的、変更内容、テスト方法を記載）

**Checkpoint**: すべての品質基準合格、PR準備完了

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし - 即座に開始可能
- **Foundational (Phase 2)**: Setupに依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: すべてFoundationalに依存
  - ユーザーストーリーは並列実行可能（スタッフ配置次第）
  - または優先順位順に逐次実行（P1 → P2 → P3）
- **DuelField Integration (Phase 6)**: US1の基本実装（T017まで）に依存
- **Polish (Phase 7)**: すべての希望するユーザーストーリー完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2)完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2)完了後に開始可能 - US1と統合するが独立してテスト可能
- **User Story 3 (P3)**: Foundational (Phase 2)完了後に開始可能 - US1/US2と統合するが独立してテスト可能

### Within Each User Story

- Models/Stores before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: T002, T003は並列実行可能
- Phase 2: T005-T008（各derivedストア実装）は並列実行可能
- Phase 3: T012, T013は並列実行可能
- Phase 4: T018-T020は並列実行可能
- Phase 5: T025, T026, T027は並列実行可能
- Phase 6: T029-T032は並列実行可能
- Phase 7: T036-T038は並列実行可能、T043も並列可能
- US1, US2, US3は異なる開発者が並列作業可能（Foundational完了後）

---

## Parallel Example: User Story 1

```bash
# US1のインポートとロジック修正を並列起動:
Task: "V2シミュレーターページへのcardDisplayStoreインポート追加"
Task: "手札表示ロジック修正：$handCardsからCardDisplayDataを取得"

# DuelField統合のゾーン抽出ロジックを並列起動:
Task: "フィールド魔法ゾーン用カード抽出ロジック実装"
Task: "モンスターゾーン用カード配列作成"
Task: "魔法・罠ゾーン用カード配列作成"
```

---

## Parallel Example: User Story 2

```bash
# US2のチェックロジックを並列起動:
Task: "handleCardClick関数の実装"
Task: "フェーズチェックロジック追加"
Task: "魔法発動可否チェック追加"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - すべてのストーリーをブロック)
3. Complete Phase 3: User Story 1（手札イラスト表示のみ）
4. **STOP and VALIDATE**: US1を独立してテスト
5. 準備できればデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立してテスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → 独立してテスト → デプロイ/デモ
4. User Story 3追加 → 独立してテスト → デプロイ/デモ
5. DuelField Integration追加 → 完全なフィールドレイアウト実現 → デプロイ/デモ
6. 各ストーリーが前のストーリーを壊さずに価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全体でSetup + Foundationalを完了
2. Foundational完了後:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. ストーリーが完了し、独立して統合

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical Path**: Phase 1 → Phase 2 (foundational MUST complete first) → US1/US2/US3 in parallel (P1 priority)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Tests are OPTIONAL**: This feature spec does not explicitly request TDD approach, so test tasks focus on verification checkpoints rather than test-first development
