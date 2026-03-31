# Tasks: Skeleton UI v3 → v4 アップグレード

**Input**: Design documents from `/specs/001-skeleton-v4-upgrade/`
**Branch**: `001-skeleton-v4-upgrade`
**Total tasks**: 27 | **Parallel opportunities**: 12

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー（US1/US2/US3）

---

## Phase 1: Setup（パッケージ更新）

**Purpose**: Skeleton v4 パッケージのインストール

- [x] T001 `package.json` の `@skeletonlabs/skeleton` を `^4.13.0` に更新する（`skeleton-app/package.json`）
- [x] T002 `package.json` の `@skeletonlabs/skeleton-svelte` を `^4.13.0` に更新する（`skeleton-app/package.json`）
- [x] T003 `skeleton-app/` で `npm install` を実行してパッケージをインストールする

---

## Phase 2: Foundational（CSS・HTML 設定変更）

**Purpose**: v4 の設定仕様に合わせた基盤ファイルの更新。コンポーネント修正前に完了必須。

**⚠️ CRITICAL**: Phase 3 以降の作業はこのフェーズ完了後に開始する

- [x] T004 `app.css` から `@import "@skeletonlabs/skeleton/optional/presets"` を削除する（`skeleton-app/src/app.css`）
- [x] T005 `app.css` の `@source "../node_modules/@skeletonlabs/skeleton-svelte/dist"` を `@import "@skeletonlabs/skeleton-svelte"` に変更する（`skeleton-app/src/app.css`）
- [x] T006 `app.html` の `<html>` 要素に `data-theme="cerberus"` を追加する（`skeleton-app/src/app.html`）
- [x] T007 `npm run check` を実行してすべてのビルドエラーを把握し、エラー内容を記録する（`skeleton-app/`）

**Checkpoint**: エラー一覧が把握できた状態 → コンポーネント修正作業に進める

---

## Phase 3: US1 - アプリが正常に起動・動作する（Priority: P1）🎯 MVP

**Goal**: v4 パッケージでアプリが起動し、全 Skeleton コンポーネント（Modal/Dialog・Segment・Switch・Accordion・Toaster）が動作する

**Independent Test**: `npm run dev` でアプリ起動後、モーダル開閉・トースト表示が正常に動作することを確認

### Modal → Dialog 移行調査

- [x] T008 [US1] インストール済み `@skeletonlabs/skeleton-svelte@4.13.0` の型定義ファイルを確認し、`Modal` が存在するか `Dialog` に変更されたかを特定する（`skeleton-app/node_modules/@skeletonlabs/skeleton-svelte/dist/`）

### Modal → Dialog 移行（T008 で `Modal` が廃止と確認された場合のみ実施）

> T008 の結果が `Modal` 後方互換あり の場合は T009〜T015 をスキップ

- [x] T009 [P] [US1] `ThemeSwitchModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/lib/presentation/components/modals/ThemeSwitchModal.svelte`）
- [x] T010 [P] [US1] `SettingsModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/lib/presentation/components/modals/SettingsModal.svelte`）
- [x] T011 [P] [US1] `CardSelectionModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/routes/(auth)/simulator/[deckId]/_components/modals/CardSelectionModal.svelte`）
- [x] T012 [P] [US1] `ConfirmationModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/routes/(auth)/simulator/[deckId]/_components/modals/ConfirmationModal.svelte`）
- [x] T013 [P] [US1] `CardStackModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/routes/(auth)/simulator/[deckId]/_components/modals/CardStackModal.svelte`）
- [x] T014 [P] [US1] `GameOverModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/routes/(auth)/simulator/[deckId]/_components/modals/GameOverModal.svelte`）
- [x] T015 [P] [US1] `ChainConfirmationModal.svelte` を `Dialog` サブコンポーネント構成に移行する（`skeleton-app/src/routes/(auth)/simulator/[deckId]/_components/modals/ChainConfirmationModal.svelte`）

### Segment / Toaster / カスタムテーマ確認

- [x] T016 [P] [US1] `Segment` が v4 で `SegmentedControl` 等にリネームされた場合、3 ファイルのインポートを修正する（`ThemeSwitch.svelte`, `CardDetailToggle.svelte`, `ChainConfirmationToggle.svelte`）
- [x] T017 [P] [US1] `Toaster` コンポーネントが v4 で `Toast.Group` に変更された場合、`+layout.svelte` と `toaster.ts` を修正する（`skeleton-app/src/routes/+layout.svelte`, `skeleton-app/src/lib/presentation/utils/toaster.ts`）
- [x] T018 [US1] `custom-theme.css` の CSS カスタムプロパティが v4 のテーマ変数スキーマと一致するか確認し、変数名の差分を修正する（`skeleton-app/src/custom-theme.css`）

### 動作確認

- [ ] T019 [US1] `npm run dev` でアプリを起動し、モーダル開閉・トースト表示・コンポーネント動作を目視確認する（`skeleton-app/`）

**Checkpoint**: アプリ起動・全コンポーネント動作確認 → US2（テーマ切替）確認に進める

---

## Phase 4: US2 - テーマ切替が正常に動作する（Priority: P2）

**Goal**: 25 種のテーマとダーク/ライトモード切替がすべて正常に動作する

**Independent Test**: 設定モーダルで各テーマを切り替えると `data-theme` 属性が更新され、配色が即座に反映されることを確認

- [ ] T020 [US2] `applyTheme()` が `document.documentElement` の `data-theme` / `data-mode` を正しく設定していることをブラウザ DevTools で確認する（`skeleton-app/src/lib/presentation/stores/themeStore.ts`）
- [ ] T021 [P] [US2] 設定モーダルで代表的なテーマ（cerberus・wintry・catppuccin）を切り替えて配色が変わることを確認する
- [ ] T022 [P] [US2] ダーク/ライトモードトグルで `data-mode` が切り替わり、スタイルが変化することを確認する

**Checkpoint**: テーマ切替・ダーク/ライトモード動作確認完了

---

## Phase 5: US3 - ビルド・品質チェック通過（Priority: P3）

**Goal**: lint / type check / unit test がすべてエラーゼロで完了する

**Independent Test**: 以下コマンドがすべて exit code 0 で終了すること

- [x] T023 [P] [US3] `npm run format` を実行して Prettier フォーマットを適用する（`skeleton-app/`）
- [x] T024 [P] [US3] `npm run lint` を実行し、ESLint エラーをすべて解消する（`skeleton-app/`）
- [x] T025 [US3] `npm run check` を実行し、Svelte / TypeScript 型エラーをすべて解消する（`skeleton-app/`）
- [x] T026 [US3] `npm run test:run` を実行し、全テストが PASS することを確認する（`skeleton-app/`）

**Checkpoint**: 品質チェック全通過 → Polish フェーズへ

---

## Final Phase: Polish

**Purpose**: 最終確認・コミット

- [ ] T027 変更した全ファイルをレビューし、意図しない差分・デグレがないことを確認する
- [ ] T028 `git add` して `git commit` を作成する（Conventional Commits: `chore: upgrade skeleton ui to v4.13`）

---

## Dependencies（ストーリー完了順序）

```
T001 → T002 → T003 (npm install)
              ↓
         T004, T005, T006 [並列可]
              ↓
             T007 (npm run check でエラー把握)
              ↓
         T008 (Modal 廃止確認)
              ↓
    T009〜T015 [並列可] ← Modal廃止の場合のみ
    T016, T017 [並列可]
         T018
         T019 (動作確認)
              ↓
    T020, T021, T022 [並列可]
              ↓
    T023, T024 [並列可]
         T025
         T026
              ↓
    T027 → T028
```

## 並列実行の機会

| フェーズ | 並列実行可能なタスク |
|---|---|
| Phase 2 | T004, T005, T006 |
| Phase 3 Modal移行 | T009, T010, T011, T012, T013, T014, T015 |
| Phase 3 その他 | T016, T017 |
| Phase 4 | T021, T022 |
| Phase 5 | T023, T024 |

## 実装戦略

**MVP スコープ**: US1（Phase 1〜3 完了）= アプリが起動・動作する状態

- **Step 1**: Phase 1〜2 を完了（破壊的変更なし・30分以内）
- **Step 2**: T007 のエラー確認で残作業を確定
- **Step 3**: Modal 移行（最大リスク）を優先実施
- **Step 4**: US2・US3 は US1 完了後に実施

## 総タスク数サマリー

| フェーズ | タスク数 |
|---|---|
| Phase 1: Setup | 3 |
| Phase 2: Foundational | 4 |
| Phase 3: US1 (P1) | 12 |
| Phase 4: US2 (P2) | 3 |
| Phase 5: US3 (P3) | 4 |
| Final: Polish | 2 |
| **合計** | **28** |
