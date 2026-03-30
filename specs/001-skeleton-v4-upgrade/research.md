# Research: Skeleton UI v3 → v4 移行調査

**Branch**: `001-skeleton-v4-upgrade` | **Date**: 2026-03-29

---

## 1. パッケージバージョン変更

**Decision**: 両パッケージを `^4.13.0` に更新する。

| パッケージ | 現在 | 移行後 |
|---|---|---|
| `@skeletonlabs/skeleton` | `^3.1.3` | `^4.13.0` |
| `@skeletonlabs/skeleton-svelte` | `^1.2.1` | `^4.13.0` |

**Rationale**: v4 から両パッケージのバージョン番号が同期されるため、合わせて更新する。
**Alternatives considered**: `npm update` による段階的更新 → major バージョン変更のため直接指定が必要。

---

## 2. CSS 変更 (app.css)

**Decision**: 以下の 2 点を変更する。

### 2a. optional/presets の削除

```css
/* 削除 */
@import "@skeletonlabs/skeleton/optional/presets";
```

**Rationale**: v4 でプリセットスタイルがコアパッケージに統合されたため不要。
**Alternatives considered**: そのまま残す → v4 にはパスが存在せずビルドエラーになる。

### 2b. @source ルールを @import に変更

```css
/* v3 (削除) */
@source "../node_modules/@skeletonlabs/skeleton-svelte/dist";

/* v4 (追加) */
@import "@skeletonlabs/skeleton-svelte";
```

**Rationale**: v4 では `@source` による明示的な指定が不要になり、`@import` で Tailwind が自動的にソースを検出する。
**Alternatives considered**: 両方残す → 重複・競合の可能性あり。

---

## 3. app.html のテーマ設定

**Decision**: `<html>` 要素に `data-theme` 属性を追加する。

```html
<!-- v4: html 要素に data-theme を設定 -->
<html lang="ja" data-theme="cerberus">
```

**Rationale**: v4 では `data-theme` が `<body>` ではなく `<html>` 要素に設定されることが推奨されている。現在の `app.html` には `data-theme` が存在しないため追加が必要。なお、動的テーマ切替は既存の `themeStore` の `applyTheme()` が `data-theme` を上書きするため、HTML のデフォルト値は初期表示用のフォールバックとして機能する。

**Alternatives considered**: themeStore のみで設定 → SSR/初期レンダリング時にテーマが未適用になる可能性。

---

## 4. コンポーネント API 変更

### 4a. Modal → Dialog (破壊的変更)

**Decision**: `Modal` コンポーネントを `Dialog` コンポーネント（サブコンポーネント構成）に移行する。

v4 での `Dialog` 構造:
```
Dialog.Trigger
Dialog.Backdrop
Dialog.Positioner
Dialog.Content
Dialog.Title
Dialog.Description
Dialog.CloseTrigger
```

**現状の Modal 使用箇所 (8 ファイル)**:
- `ThemeSwitchModal.svelte` - `{#snippet trigger()}` + `{#snippet content()}`
- `SettingsModal.svelte` - `{#snippet trigger()}` + `{#snippet content()}`
- `CardSelectionModal.svelte` - `{#snippet content()}` のみ（外部から `isOpen` 制御）
- `ConfirmationModal.svelte` - `{#snippet content()}` のみ
- `CardStackModal.svelte` - 要調査
- `GameOverModal.svelte` - 要調査
- `ChainConfirmationModal.svelte` - 要調査

**Rationale**: v4 でコンポーネントが `Dialog` にリネームされ、スタイリングは Tailwind クラスで直接指定する headless 設計になった。
**Alternatives considered**: 互換性のある `Modal` ラッパーを自作 → メンテナンスコスト増。

> **要確認**: v4 の `@skeletonlabs/skeleton-svelte` パッケージに `Modal` が後方互換エイリアスとして残っているか確認する（パッケージインストール後に型定義を確認）。

### 4b. Segment → SegmentedControl (リネームの可能性)

**Decision**: インポート名の変更が必要かどうかをインストール後に確認する。

**現状の Segment 使用箇所 (3 ファイル)**:
- `ThemeSwitch.svelte` - `<Segment>` + `<Segment.Item>`
- `CardDetailToggle.svelte` - `<Segment>` + `<Segment.Item>`
- `ChainConfirmationToggle.svelte` - `<Segment>` + `<Segment.Item>`

v4 ドキュメントでは「Segmented Control」と記載されているが、既存コードが使用している `Segment.Item` サブコンポーネント構成は v4 API と一致している可能性が高い。

**Rationale**: 現在のコードはすでに Svelte 5 スニペット構文を使用しており、API の互換性が高いと推定される。
**Alternatives considered**: 一括リネーム → 不要な変更になる可能性あり、確認後に判断。

### 4c. Toaster → Toast.Group の可能性

**Decision**: `createToaster()` の API 互換性をインストール後に確認する。

**現状の使用箇所**:
- `+layout.svelte` - `<Toaster {toaster} rounded="..." width="..." />`
- `toaster.ts` - `createToaster()`, `toaster.success()`, `toaster.error()`

v4 ドキュメントでは `Toast.Group` ルートコンポーネントが確認されているが、`Toaster` が互換エイリアスとして残っている可能性がある。

### 4d. Switch - 互換性高

**Decision**: 現在の `Switch` API は v4 と互換性あり（変更不要の可能性が高い）。

現在: `checked={...}`, `onCheckedChange={...}` → v4 ドキュメントの API と一致。

### 4e. Accordion - 互換性高

**Decision**: 現在の `Accordion` API は v4 と互換性あり（変更不要の可能性が高い）。

現在: `value`, `onValueChange`, `multiple`, `Accordion.Item` + スニペット構成 → v4 ドキュメントの API と一致。

---

## 5. カスタムテーマ (custom-theme.css)

**Decision**: v4 のテーマ変数スキーマとの互換性をインストール後に確認する。

**Rationale**: テーマ変数の命名規則が v3→v4 で変更されている可能性がある。インストール後に既存テーマのビルドエラー・スタイル崩れを確認し、必要に応じて変数名を更新する。

---

## 6. 移行リスク評価

| 変更項目 | リスク | 影響ファイル数 |
|---|---|---|
| パッケージバージョン更新 | 低 | 1 (package.json) |
| CSS 変更 (app.css) | 低 | 1 |
| app.html data-theme 追加 | 低 | 1 |
| Modal → Dialog 移行 | **高** | 8 |
| Segment リネーム確認 | 低〜中 | 3 |
| Toaster 確認 | 中 | 2 |
| Switch / Accordion | 低 | 4 |
| カスタムテーマ互換性 | 中 | 1 |
