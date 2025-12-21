# Tasks: Domain Layer Refactoring

**Input**: Design documents from `/specs/007-domain-refactor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: テストは既存のテストスイートで検証。新規テスト作成は不要。

**Organization**: 3つのユーザーストーリー（型命名統一、Immer削除、Domain層移管）を段階的に実施。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: ユーザーストーリーへの紐付け（US1, US2, US3）
- 正確なファイルパスを記載

## Path Conventions

- Single Page Application (SPA) 構成
- メインコード: `skeleton-app/src/lib/`
- テスト: `skeleton-app/tests/`
- Domain層: `skeleton-app/src/lib/domain/`
- Application層: `skeleton-app/src/lib/application/`

---

## Phase 1: Setup（前提条件の確認）

**Purpose**: リファクタリング開始前の環境確認

- [x] T001 ブランチ`007-domain-refactor`がチェックアウトされていることを確認
- [x] T002 既存テストがすべてパスすることを確認 (`npm run test:run`)
- [x] T003 [P] Lint/Formatエラーがないことを確認 (`npm run lint`)
- [x] T004 [P] ドメインドキュメント (docs/domain/) が最新であることを確認

**Checkpoint**: 環境準備完了、リファクタリング開始可能

---

## Phase 2: Foundational（なし）

このリファクタリングでは、基盤整備フェーズは不要。既存コードベースに対する変更のみ。

---

## Phase 3: User Story 1 - 型命名の統一 (Priority: P1) 🎯 MVP

**Goal**: `DomainCardData` → `CardData` に変更し、ドメインドキュメントとコードの命名を一致させる

**Independent Test**: ドキュメントで「Card Data (カードデータ)」を検索し、コード内で`CardData`型に一貫して対応していることを確認。`DomainCardData`が存在しないことを検証。

### Implementation for User Story 1

- [x] T005 [US1] `domain/models/Card.ts`で`DomainCardData`を`CardData`にリネーム
- [x] T006 [US1] `domain/models/Card.ts`で型ガード`isDomainCardData`を`isCardData`にリネーム
- [x] T007 [US1] `domain/data/cardDatabase.ts`のimport文を更新（`DomainCardData` → `CardData`）
- [x] T008 [US1] TypeScript コンパイルエラーを検出 (`npm run check`)
- [x] T009 [US1] すべてのimport文を手動修正（コンパイラエラーに従う）
- [x] T010 [US1] 全ファイルで`DomainCardData`が残っていないことをgrep検索で確認
- [x] T011 [US1] 型命名変更後のテスト実行 (`npm run test:run`)
- [x] T012 [US1] Lint/Format実行 (`npm run lint && npm run format`)

**Checkpoint**: 型命名がドキュメントと一致。`CardData`型が一貫して使用されている。

---

## Phase 4: User Story 2 - Immer依存の削除 (Priority: P2)

**Goal**: すべてのCommandsから`immer`の`produce()`を削除し、spread構文に統一。`package.json`から`immer`を削除。

**Independent Test**: Immerをuninstall後、すべてのテストが100%パス。Commands実行時に元のGameStateオブジェクトが変更されないことを確認。

### Implementation for User Story 2

- [ ] T013 [P] [US2] `application/commands/DrawCardCommand.ts`のImmer削除、spread構文に置き換え
- [ ] T014 [P] [US2] `application/commands/DiscardCardsCommand.ts`のImmer削除、spread構文に置き換え
- [ ] T015 [P] [US2] `application/commands/ActivateSpellCommand.ts`のImmer削除、spread構文に置き換え
- [ ] T016 [P] [US2] `application/commands/AdvancePhaseCommand.ts`のImmer削除、spread構文に置き換え
- [ ] T017 [P] [US2] `application/commands/ShuffleDeckCommand.ts`のImmer削除、spread構文に置き換え
- [ ] T018 [US2] `package.json`から`immer`パッケージをuninstall (`npm uninstall immer`)
- [ ] T019 [US2] 全ファイルで`from "immer"`のimportが残っていないことをgrep検索で確認
- [ ] T020 [US2] TypeScript コンパイル確認 (`npm run check`)
- [ ] T021 [US2] Immer削除後のテスト実行（不変性検証含む） (`npm run test:run`)
- [ ] T022 [US2] Lint/Format実行 (`npm run lint && npm run format`)

**Checkpoint**: Immer依存が完全に削除され、spread構文で不変性が保たれている。

---

## Phase 5: User Story 3 - ゲーム操作のDomain層への移管 (Priority: P3)

**Goal**: Commands と CardEffectRegistry を`application/`から`domain/`に移動し、Clean Architectureに準拠。

**Independent Test**: Domain層のCommandsを単体で実行し、GameStateの変更が正しく行われることを検証。GameFacadeがDomain層のCommandsを呼び出すことを確認。

### Implementation for User Story 3

#### 3.1. ディレクトリ作成とファイル移動

- [ ] T023 [US3] `skeleton-app/src/lib/domain/commands/`ディレクトリを作成
- [ ] T024 [US3] `application/commands/GameCommand.ts`を`domain/commands/`に移動 (`git mv`)
- [ ] T025 [P] [US3] `application/commands/DrawCardCommand.ts`を`domain/commands/`に移動 (`git mv`)
- [ ] T026 [P] [US3] `application/commands/DiscardCardsCommand.ts`を`domain/commands/`に移動 (`git mv`)
- [ ] T027 [P] [US3] `application/commands/ActivateSpellCommand.ts`を`domain/commands/`に移動 (`git mv`)
- [ ] T028 [P] [US3] `application/commands/AdvancePhaseCommand.ts`を`domain/commands/`に移動 (`git mv`)
- [ ] T029 [P] [US3] `application/commands/ShuffleDeckCommand.ts`を`domain/commands/`に移動 (`git mv`)

#### 3.2. テストファイル移動

- [ ] T030 [US3] `tests/unit/application/commands/`を`tests/unit/domain/commands/`に移動 (`git mv`)

#### 3.3. CardEffectRegistry移動

- [ ] T031 [US3] `application/effects/CardEffectRegistry.ts`を`domain/effects/`に移動 (`git mv`)
- [ ] T032 [US3] `application/effects/index.ts`を`domain/effects/`に移動（Re-export用） (`git mv`)

#### 3.4. 空ディレクトリ削除

- [ ] T033 [US3] `application/commands/`ディレクトリを削除 (`rmdir`)
- [ ] T034 [US3] `application/effects/`ディレクトリを削除 (`rmdir`)

#### 3.5. Import文の更新

- [ ] T035 [US3] TypeScript コンパイルエラーを検出 (`npm run check`)
- [ ] T036 [US3] `application/GameFacade.ts`のimport文を更新（`$lib/domain/commands/`に変更）
- [ ] T037 [P] [US3] `domain/effects/cards/PotOfGreedEffect.ts`のimport文を更新
- [ ] T038 [P] [US3] `domain/effects/cards/GracefulCharityEffect.ts`のimport文を更新
- [ ] T039 [US3] Presentationレイヤー（Svelteコンポーネント）のimport文を更新（必要に応じて）
- [ ] T040 [US3] すべてのimport文が正しく解決されることを確認 (`npm run check`)

#### 3.6. Re-export設定

- [ ] T041 [US3] `domain/effects/index.ts`でCardEffectRegistry等をre-export

#### 3.7. 動作確認

- [ ] T042 [US3] TypeScript コンパイル確認 (`npm run check`)
- [ ] T043 [US3] ビルド成功確認 (`npm run build`)
- [ ] T044 [US3] Domain層移管後のテスト実行 (`npm run test:run`)
- [ ] T045 [US3] Lint/Format実行 (`npm run lint && npm run format`)
- [ ] T046 [US3] E2Eテスト実行（任意） (`npx playwright test`)
- [ ] T047 [US3] 開発サーバー起動確認 (`npm run dev`)

**Checkpoint**: Commands と CardEffectRegistry がDomain層に配置され、Clean Architecture準拠。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: リファクタリング完了後の仕上げ作業

- [ ] T048 [P] ADR0007作成 (`docs/adr/ADR0007-domain-layer-refactoring.md`)
- [ ] T049 [P] ADR0007に設計判断を記録（Context, Decision, Consequences, Alternatives）
- [ ] T050 最終テスト実行（すべてのテストが100%パス） (`npm run test:run`)
- [ ] T051 最終Lint/Format実行 (`npm run lint && npm run format`)
- [ ] T052 git status確認（すべての変更がコミット済み）
- [ ] T053 PR作成準備（コミットメッセージ確認、変更内容確認）
- [ ] T054 Pull Request作成（spec.mdを本文に含める）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし、即開始可能
- **User Story 1 (Phase 3)**: Setup完了後に開始
- **User Story 2 (Phase 4)**: User Story 1完了後に開始（型名変更が前提）
- **User Story 3 (Phase 5)**: User Story 2完了後に開始（Immer削除が前提）
- **Polish (Phase 6)**: すべてのUser Storiesが完了後に開始

### User Story Dependencies

- **User Story 1 (P1)**: Setup後に開始、他のストーリーに依存しない
- **User Story 2 (P2)**: User Story 1完了が前提（型名が統一されている必要）
- **User Story 3 (P3)**: User Story 2完了が前提（Immerが削除されている必要）

### Within Each User Story

- **US1**: 型定義変更 → import更新 → コンパイル → テスト
- **US2**: 各Command並列でImmer削除 → package.json更新 → テスト
- **US3**: ファイル移動（並列可能） → import更新 → テスト

### Parallel Opportunities

- **Setup (Phase 1)**: T002, T003, T004は並列実行可能
- **US2 (Phase 4)**: T013-T017（各Commandの変更）は並列実行可能
- **US3 (Phase 5)**:
  - T025-T029（Commandファイル移動）は並列実行可能
  - T037-T038（個別カード効果のimport更新）は並列実行可能
- **Polish (Phase 6)**: T048, T049は並列実行可能

---

## Parallel Example: User Story 2

```bash
# Launch all Command Immer削除 tasks together:
Task: "application/commands/DrawCardCommand.ts のImmer削除、spread構文に置き換え"
Task: "application/commands/DiscardCardsCommand.ts のImmer削除、spread構文に置き換え"
Task: "application/commands/ActivateSpellCommand.ts のImmer削除、spread構文に置き換え"
Task: "application/commands/AdvancePhaseCommand.ts のImmer削除、spread構文に置き換え"
Task: "application/commands/ShuffleDeckCommand.ts のImmer削除、spread構文に置き換え"
```

---

## Parallel Example: User Story 3

```bash
# Launch all Command file movements together:
Task: "application/commands/DrawCardCommand.ts を domain/commands/ に移動"
Task: "application/commands/DiscardCardsCommand.ts を domain/commands/ に移動"
Task: "application/commands/ActivateSpellCommand.ts を domain/commands/ に移動"
Task: "application/commands/AdvancePhaseCommand.ts を domain/commands/ に移動"
Task: "application/commands/ShuffleDeckCommand.ts を domain/commands/ に移動"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup（環境確認）
2. Complete Phase 3: User Story 1（型命名統一）
3. **STOP and VALIDATE**: ドキュメントとコードの命名が一致していることを確認
4. 必要に応じて、ここでコミット・レビュー

### Incremental Delivery

1. Complete Setup → 環境準備完了
2. Add User Story 1 → 型命名統一完了 → Commit
3. Add User Story 2 → Immer削除完了 → Commit
4. Add User Story 3 → Domain層移管完了 → Commit
5. Polish → ADR作成、PR準備 → Commit & Push

### Sequential Execution (推奨)

このリファクタリングは依存関係があるため、順次実行を推奨:

1. Setup完了
2. User Story 1 完了 → テスト確認 → Commit
3. User Story 2 完了 → テスト確認 → Commit
4. User Story 3 完了 → テスト確認 → Commit
5. Polish → PR作成

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし、並列実行可能
- [Story] ラベル = タスクがどのユーザーストーリーに属するかを示す
- 各ユーザーストーリーは独立してテスト可能
- 各Checkpoint後に動作確認（テスト実行）
- 各フェーズ完了後にコミット推奨
- `git mv`を使用してファイル履歴を保持
- TypeScriptコンパイラでimportエラーを自動検出
- 既存テストで不変性・動作を検証（新規テスト不要）
- quickstart.mdに詳細手順を記載（参照可能）
