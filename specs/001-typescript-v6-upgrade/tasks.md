# Tasks: TypeScript v6 アップグレード

**Input**: Design documents from `/specs/001-typescript-v6-upgrade/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Organization**: タスクはユーザーストーリー単位で整理。各ストーリーは独立して検証可能。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（別ファイル・依存関係なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3）
- ファイルパスを各タスクに明記

---

## Phase 1: Setup（事前確認）

**Purpose**: 作業開始前の環境確認

- [x] T001 現在の TypeScript バージョンを確認する（`skeleton-app/` で `npx tsc --version` を実行）
- [x] T002 `skeleton-app/` でクリーンな状態であることを確認する（`npm run check` および `npm run test:run` がパスすること）

**Checkpoint**: 現在の動作が確認でき、アップグレード後の比較基準が明確になっている

---

## Phase 2: Foundational（依存関係の更新）

**Purpose**: TypeScript v6 インストール。後続の全ストーリーをブロックする必須前提作業

**⚠️ CRITICAL**: このフェーズ完了後でないとユーザーストーリーの作業を開始できない

- [x] T003 `skeleton-app/package.json` の `typescript` を `"^6.0.0"` に更新する（`npm install typescript@^6.0.0 --save-dev`）
- [x] T004 `skeleton-app/` で `npm update svelte-check` を実行し TypeScript v6 対応版（4.4.6 以上）に更新する
- [x] T005 `skeleton-app/` で `npx svelte-kit sync` を実行し `.svelte-kit/tsconfig.json` を v6 環境向けに再生成する

**Checkpoint**: Foundation 完了。`npx tsc --version` で 6.x を確認できること

---

## Phase 3: User Story 1 — TypeScript v6 への依存関係更新（Priority: P1）🎯 MVP

**Goal**: TypeScript v6 がインストールされ、`npm run check` と `npm run lint` がエラーなしに通ること

**Independent Test**: `npm run check` がゼロエラーで完了し、`npm run lint` がゼロエラーで完了すること

### Implementation for User Story 1

- [x] T006 [US1] `skeleton-app/` で `npm run check` を実行し、型エラーが出ないことを確認する（エラーが出た場合は原因を調査して対処）
- [x] T007 [US1] `skeleton-app/` で `npm run lint` を実行し、lint エラーが出ないことを確認する（`typescript-eslint` 等が TypeScript v6 未対応の場合は `npm update typescript-eslint` を実行）

**Checkpoint**: US1 完了。TypeScript v6 インストール済みかつ型チェック・lint が通っている

---

## Phase 4: User Story 2 — tsconfig.json の v6 対応（Priority: P2）

**Goal**: TypeScript v6 の破壊的変更（`types` デフォルト変更）に対応した tsconfig.json になっており、`npm run check` が引き続きエラーなしに通ること

**Independent Test**: `skeleton-app/tsconfig.json` に `"types": ["node"]` が追加され、`npm run check` がゼロエラーで完了すること

### Implementation for User Story 2

- [x] T008 [US2] `skeleton-app/tsconfig.json` の `compilerOptions` に `"types": ["node"]` を追加する
- [x] T009 [US2] `skeleton-app/` で `npm run check` を再実行し、T008 の変更後もエラーなしに完了することを確認する

**Checkpoint**: US2 完了。tsconfig.json が v6 対応済みで型チェックが通っている

---

## Phase 5: User Story 3 — ビルド・テスト・開発サーバーの動作確認（Priority: P3）

**Goal**: SPA プロダクションビルド・ローカル開発サーバー・テスト一式がすべて正常に動作すること

**Independent Test**: `npm run test:run` が 100% パス、`npm run build` が成功、`npm run dev` が起動してブラウザでアプリが表示されること

### Implementation for User Story 3

- [x] T010 [P] [US3] `skeleton-app/` で `npm run test:run` を実行し、既存テストが全件パスすることを確認する
- [x] T011 [P] [US3] `skeleton-app/` で `npm run build` を実行し、SPA ビルド成果物（`build/` ディレクトリ）が正常に生成されることを確認する
- [ ] T012 [US3] `skeleton-app/` で `npm run dev` を起動し、ブラウザで `http://localhost:5173/<repo-name>/` にアクセスしてアプリが正常に表示されることを手動確認する（確認後 Ctrl+C で停止）

**Checkpoint**: US3 完了。アップグレードの安全性が全面的に確認された

---

## Phase 6: Polish & クリーンアップ

**Purpose**: コミット・PR 作成

- [x] T013 `skeleton-app/package.json` と `skeleton-app/package-lock.json` の変更内容を確認する（`typescript: ^6.0.0`、`svelte-check` 更新が反映されていること）
- [x] T014 `skeleton-app/tsconfig.json` の変更内容を確認する（`"types": ["node"]` が追加されていること）
- [x] T015 変更ファイル（`skeleton-app/package.json`, `skeleton-app/package-lock.json`, `skeleton-app/tsconfig.json`）をステージングしてコミットする（メッセージ例: `chore: upgrade TypeScript to v6 and add types config`）
- [ ] T016 `001-typescript-v6-upgrade` ブランチを push して PR を作成する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即座に開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 — 全ユーザーストーリーをブロック
- **US1 (Phase 3)**: Phase 2 完了後に開始
- **US2 (Phase 4)**: Phase 3（US1）完了後に開始（tsconfig 変更後の check 確認が必要）
- **US3 (Phase 5)**: Phase 4（US2）完了後に開始（すべての設定が確定した状態で検証）
- **Polish (Phase 6)**: Phase 5（US3）完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後に開始可能
- **US2 (P2)**: US1 完了後（TypeScript v6 + tsconfig 整合性の確認が必要）
- **US3 (P3)**: US2 完了後（全設定確定後に最終検証）

### Within Each User Story

- コマンド実行タスクは逐次実行（結果に依存するため）
- T010 と T011 は [P] マークあり — 並行実行可能（別コマンド、別出力）

### Parallel Opportunities

- T010（テスト実行）と T011（ビルド実行）は別コマンド・別出力のため並行実行可能
- T001 と T002（Phase 1 確認）は並行実行可能

---

## Parallel Example: User Story 3

```bash
# T010 と T011 は並行実行可能
npm run test:run  # Terminal A
npm run build     # Terminal B
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1: Setup（事前確認）
2. Phase 2: Foundational（TypeScript v6 インストール）
3. Phase 3: US1（型チェック・lint 確認）
4. **STOP and VALIDATE**: `npm run check` と `npm run lint` が通ることを確認
5. ここで一度コミット可能

### Incremental Delivery

1. Phase 1 + 2 → TypeScript v6 インストール済み
2. + US1 → 型チェック・lint 通過（MVP）
3. + US2 → tsconfig.json v6 対応完了
4. + US3 → 全面動作確認完了
5. Polish → コミット・PR

---

## Notes

- [P] タスクは別ファイル・別コマンドで依存関係なし
- [Story] ラベルは spec.md のユーザーストーリーとのトレーサビリティ
- `npm run dev` の確認（T012）は手動操作が必要なため、他のタスクとは並行不可
- typescript-eslint が v6 未対応だった場合は T007 で対処し、対応バージョンに更新する
- 各フェーズの Checkpoint で次フェーズに進む前に動作を確認すること
