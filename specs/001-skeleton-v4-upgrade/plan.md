# Implementation Plan: Skeleton UI v3 → v4 アップグレード

**Branch**: `001-skeleton-v4-upgrade` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-skeleton-v4-upgrade/spec.md`

---

## Summary

`@skeletonlabs/skeleton@3.1.3` および `@skeletonlabs/skeleton-svelte@1.2.1` を v4.13.0 に更新し、CSS 設定・HTML テーマ設定・コンポーネント API の差分を吸収する。Svelte 5 / SvelteKit 2 / Tailwind v4 は既に導入済みのため、変更範囲は Skeleton 固有の箇所に限定される。最大リスクは `Modal` → `Dialog` API 変更（8 ファイル）。

---

## Technical Context

**Language/Version**: TypeScript 5 + Svelte 5 (Runes モード)
**Primary Dependencies**: `@skeletonlabs/skeleton@4.13.0`, `@skeletonlabs/skeleton-svelte@4.13.0`, SvelteKit 2, Tailwind v4
**Storage**: N/A（フロントエンドのみ）
**Testing**: Vitest + ESLint + Prettier + svelte-check
**Target Platform**: ブラウザ (SPA, adapter-static)
**Project Type**: Web application
**Performance Goals**: アップグレード前後で変化なし
**Constraints**: 既存コンポーネントの動作・見た目を維持する
**Scale/Scope**: 影響ファイル: package.json (1), app.css (1), app.html (1), Svelte コンポーネント (最大 13)

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| 原則 | 評価 | 備考 |
|---|---|---|
| I. 目的と手段の分離 | ✅ | 「依存関係の更新」という目的が明確 |
| II. 段階的な理解の深化 | ✅ | パッケージ更新 → CSS → HTML → コンポーネントの順で段階的に移行 |
| III. 最適解の選択と記録 | ✅ | research.md に設計判断を記録済み |
| IV. 関心の分離 | ✅ | UI ライブラリ変更はプレゼンテーション層のみに影響 |
| V. 変更に対応できる設計 | ✅ | 最小限の変更で済む設計を選択 |
| VI. 理解しやすさ最優先 | ✅ | 変更箇所は明確・局所的 |
| VII. シンプルに問題を解決 | ✅ | 不要な抽象化なし |
| VIII. テスト可能性 | ✅ | lint/check/test:run でカバー可能 |
| ブランチ戦略 | ✅ | `001-skeleton-v4-upgrade` ブランチで作業 |

**Complexity violations**: なし

---

## Project Structure

### Documentation (this feature)

```text
specs/001-skeleton-v4-upgrade/
├── spec.md           # 機能仕様
├── plan.md           # このファイル
├── research.md       # Phase 0: 移行調査結果
├── quickstart.md     # Phase 1: 実装手順
└── tasks.md          # Phase 2 (/speckit.tasks コマンドで生成)
```

### Source Code (変更対象ファイル)

```text
skeleton-app/
├── package.json                                         # パッケージバージョン更新
└── src/
    ├── app.css                                          # CSS インポート変更
    ├── app.html                                         # data-theme 追加
    ├── custom-theme.css                                 # テーマ変数互換性確認・修正
    └── lib/presentation/
        ├── components/
        │   ├── modals/
        │   │   ├── ThemeSwitchModal.svelte              # Modal → Dialog 移行
        │   │   └── SettingsModal.svelte                 # Modal → Dialog 移行
        │   └── buttons/
        │       ├── ThemeSwitch.svelte                   # Segment API 確認
        │       ├── CardDetailToggle.svelte              # Segment API 確認
        │       └── ChainConfirmationToggle.svelte       # Segment API 確認
        └── utils/
            └── toaster.ts                               # Toaster API 確認
routes/
├── +layout.svelte                                       # Toaster コンポーネント確認
└── (auth)/
    ├── cheat/+page.svelte                               # Accordion API 確認
    └── simulator/[deckId]/_components/modals/
        ├── CardSelectionModal.svelte                    # Modal → Dialog 移行
        ├── CardStackModal.svelte                        # Modal → Dialog 移行
        ├── ConfirmationModal.svelte                     # Modal → Dialog 移行
        ├── GameOverModal.svelte                         # Modal → Dialog 移行
        └── ChainConfirmationModal.svelte                # Modal → Dialog 移行
```

---

## Implementation Phases

### Phase A: パッケージ更新と CSS 修正（低リスク）

最初にパッケージを更新し、型定義で後続作業の情報を得る。

1. `package.json` の依存バージョンを `^4.13.0` に変更
2. `npm install` を実行
3. `app.css` を修正:
   - `@import "@skeletonlabs/skeleton/optional/presets"` を削除
   - `@source "../node_modules/@skeletonlabs/skeleton-svelte/dist"` を `@import "@skeletonlabs/skeleton-svelte"` に変更
4. `app.html` の `<html>` 要素に `data-theme="cerberus"` を追加

### Phase B: ビルドエラー解消（コンポーネント API 変更対応）

パッケージ更新後に型エラー・インポートエラーを解消する。

1. `npm run check` でエラー一覧を確認
2. `Modal` が `@skeletonlabs/skeleton-svelte` からエクスポートされているか確認
   - 存在しない場合: `Dialog` コンポーネントへの移行作業（8 ファイル）
   - 後方互換エイリアスがある場合: インポートのみ確認
3. `Segment` のエクスポート名確認（`Segment` または `SegmentedControl`）
4. `Toaster` のエクスポート確認（`Toaster` または `Toast.Group`）
5. カスタムテーマ変数スキーマの確認・修正

### Phase C: 動作確認・品質チェック

1. `npm run dev` でアプリを起動し、全コンポーネントの動作確認
2. テーマ切替（25 種）・ダーク/ライトモードの動作確認
3. `npm run lint && npm run format && npm run check && npm run test:run`

---

## Modal → Dialog 移行戦略（Phase B の詳細）

Modal の用途を 2 種類に分類し、それぞれのパターンで移行する。

### パターン 1: トリガー付きモーダル（ThemeSwitchModal, SettingsModal）

現在: `<Modal open={...} triggerBase="..." contentBase="...">`

移行後（想定）:
```svelte
<Dialog.Trigger class="btn preset-filled">...</Dialog.Trigger>
<Dialog.Backdrop class="backdrop-blur-sm" />
<Dialog.Positioner>
  <Dialog.Content class="card bg-surface-100-900 p-4 ...">
    ...
  </Dialog.Content>
</Dialog.Positioner>
```

### パターン 2: 外部制御モーダル（CardSelectionModal, ConfirmationModal 等）

現在: `<Modal open={isOpen} onOpenChange={handleOpenChange}>`（外部から `isOpen` prop で制御）

移行後（想定）: Dialog の `open` prop による制御は同様に可能。プロップ名・コールバック名の変更に対応。

---

## Complexity Tracking

Constitution Check 違反なし。

---

## Notes

- Phase A は確実に実施可能（破壊的変更なし）
- Phase B の Modal 移行規模はインストール後に確定する
- カスタムテーマ (`custom-theme.css`) の変数スキーマ変更はインストール後に `npm run check` で検出
