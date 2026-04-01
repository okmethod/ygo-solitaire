# Feature Specification: TypeScript v6 アップグレード

**Feature Branch**: `001-typescript-v6-upgrade`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "TypeScript v5 から v6 へのバージョンアップ"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - TypeScript v6 への依存関係更新 (Priority: P1)

開発者として、プロジェクトの TypeScript を v5 から v6 に更新し、ビルドおよび型チェックが正常に通ることを確認したい。

**Why this priority**: TypeScript のバージョンアップはすべての後続作業の土台となる。ここが完了しないと他のストーリーに進めない。

**Independent Test**: `npm install typescript@6` 後に `npm run check` が成功することで独立して検証可能。

**Acceptance Scenarios**:

1. **Given** package.json の typescript が ^5.x の状態で、**When** typescript@6 に更新し依存関係をインストールすると、**Then** パッケージが正常にインストールされ、バージョンが 6.x になっている
2. **Given** typescript@6 がインストールされた状態で、**When** `npm run check` (svelte-check) を実行すると、**Then** 型エラーなしに完了する
3. **Given** typescript@6 がインストールされた状態で、**When** `npm run lint` を実行すると、**Then** lint エラーなしに完了する

---

### User Story 2 - tsconfig.json の v6 対応 (Priority: P2)

開発者として、TypeScript v6 の新しいデフォルト値・破壊的変更に対応した tsconfig.json に更新し、意図した設定が明示的に管理されている状態にしたい。

**Why this priority**: TypeScript v6 ではデフォルト値が大きく変更されており（`strict`, `module`, `moduleResolution` 等）、明示的な設定なしでは意図しない挙動が生じる可能性がある。

**Independent Test**: 更新した tsconfig.json で `npm run check` を実行し、型チェックが通ることで独立して検証可能。

**Acceptance Scenarios**:

1. **Given** tsconfig.json が v5 向けの設定の状態で、**When** v6 の破壊的変更（`baseUrl` 削除推奨、`moduleResolution` 変更等）を踏まえ設定を見直すと、**Then** 意図した型チェック・モジュール解決が機能する
2. **Given** v6 で非推奨となった設定オプションが tsconfig.json に残っている状態で、**When** 非推奨オプションを削除または代替設定に移行すると、**Then** TypeScript コンパイラの警告が出なくなる

---

### User Story 3 - ビルド・テスト・開発サーバーの動作確認 (Priority: P3)

開発者として、TypeScript v6 へのアップグレード後も、SPA としてのプロダクションビルド・ローカル開発サーバーの起動・テスト一式がすべて正常に動作することを確認したい。

**Why this priority**: 型チェック単体の通過だけでなく、本番環境想定の SPA ビルドとローカル開発の両方で動作することを確認しアップグレードの安全性を保証する。

**Independent Test**: `npm run build`、`npm run dev` 起動確認、`npm run test:run` の 3 つが成功することで独立して検証可能。

**Acceptance Scenarios**:

1. **Given** typescript@6 および更新済み tsconfig.json の状態で、**When** `npm run test:run` を実行すると、**Then** 既存のすべてのテストがパスする
2. **Given** typescript@6 および更新済み tsconfig.json の状態で、**When** `npm run build` を実行すると、**Then** SPA としてのビルド成果物が正常に生成される
3. **Given** typescript@6 および更新済み tsconfig.json の状態で、**When** `npm run dev` でローカル開発サーバーを起動すると、**Then** エラーなく起動しブラウザでアプリが表示される

---

### Edge Cases

- TypeScript v6 で削除された設定オプション（`--moduleResolution classic`、`module: amd/umd` 等）が tsconfig に含まれている場合のエラー
- SvelteKit の `.svelte-kit/tsconfig.json`（自動生成）が v6 非対応の設定を `extends` 経由で引き継いでいる場合の対処
- `import ... assert {...}` 構文が v6 で削除される場合の `with` キーワードへの移行要否
- `esModuleInterop: false` が v6 で常時有効化される変更による既存コードへの影響

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: プロジェクトの TypeScript 依存関係を v6.x に更新しなければならない
- **FR-002**: 更新後、`npm run check` (svelte-check による型チェック) がエラーなしに完了しなければならない
- **FR-003**: 更新後、`npm run lint` がエラーなしに完了しなければならない
- **FR-004**: 更新後、`npm run test:run` (vitest) がすべてパスしなければならない
- **FR-005**: 更新後、`npm run build` (SPA プロダクションビルド) が正常に完了しなければならない
- **FR-005b**: 更新後、`npm run dev` (ローカル開発サーバー) がエラーなく起動しなければならない
- **FR-006**: tsconfig.json から TypeScript v6 で非推奨・削除となった設定オプションを取り除かなければならない
- **FR-007**: TypeScript v6 の新しいデフォルト値の変更（`strict`, `module`, `target`, `types` 等）に対し、プロジェクトの意図する設定を明示的に tsconfig.json に記載しなければならない

### Key Entities

- **tsconfig.json**: TypeScript コンパイラ設定ファイル。v6 の破壊的変更（デフォルト値変更・オプション削除）の影響を最も受ける
- **package.json**: `typescript` パッケージのバージョン指定を含む依存関係定義ファイル
- **SvelteKit 自動生成 tsconfig**: `.svelte-kit/tsconfig.json` — SvelteKit が生成する設定で、プロジェクトの tsconfig.json が `extends` している

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: アップグレード後、`npm run check` がゼロエラーで完了する
- **SC-002**: アップグレード後、`npm run lint` がゼロエラーで完了する
- **SC-003**: アップグレード後、`npm run test:run` で既存テストがすべてパスする（パス率 100%）
- **SC-004**: アップグレード後、`npm run build` が正常に完了し、SPA としてのビルド成果物が生成される
- **SC-005b**: アップグレード後、`npm run dev` がエラーなく起動し、ブラウザでアプリが表示される
- **SC-006**: tsconfig.json に TypeScript v6 で非推奨・削除となった設定オプションが残存していない

## Assumptions

- 本プロジェクトは SPA（Static Site）としてビルドした成果物を本番環境で動かす想定である。ローカル開発時は `npm run dev` (Vite dev server) を使用する。両方の動作確認が必要。
- SvelteKit は TypeScript v6 に対応済み、または対応バージョンへのアップグレードが必要な場合は合わせて対応する
- 現在の tsconfig.json の `moduleResolution: "bundler"` は TypeScript v6 でも有効であることを前提とする
- `import ... assert {...}` 構文はこのプロジェクトでは使用されていないことを前提とする（もし使用されている場合は `with` キーワードへの移行が必要）

## Out of Scope

- TypeScript v6 の新機能（ES2025 標準ライブラリ、Temporal API 等）を積極活用するコードの書き換え
- 他の依存パッケージ（Svelte、SvelteKit、Vite 等）のバージョンアップ（TypeScript v6 対応に必要な場合を除く）
