# Feature Specification: Skeleton UI v3 → v4 アップグレード

**Feature Branch**: `001-skeleton-v4-upgrade`
**Created**: 2026-03-29
**Status**: Draft
**Input**: User description: "Skeleton UI v3 から v4.13 へのバージョンアップ。SvelteKit プロジェクト (skeleton-app/) の Skeleton を最新バージョンに移行する。"

---

## 背景

現在 `@skeletonlabs/skeleton@3.1.3` および `@skeletonlabs/skeleton-svelte@1.2.1` を使用している。
最新版 v4.13.0 に移行し、依存関係の鮮度・セキュリティ・将来的なサポートを確保する。

**現状の使用コンポーネント**:
- `Modal` (8 ファイル)
- `Segment` (3 ファイル)
- `Switch` (1 ファイル)
- `Accordion` (1 ファイル)
- `Toaster` / `createToaster` (2 ファイル)

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - アプリが正常に起動・動作する (Priority: P1)

開発者が v4 へのアップグレード後、アプリを起動してシミュレーター画面を操作できる。
既存の UI（テーマ切替・モーダル・トースト通知）がすべて動作する。

**Why this priority**: アプリが壊れると他のすべての機能が使えなくなるため。

**Independent Test**: `npm run dev` でアプリが起動し、シミュレーター画面でカード操作・モーダル表示・トースト表示が機能することを確認。

**Acceptance Scenarios**:

1. **Given** v4 へアップグレード済みの状態で、**When** `npm run dev` を実行し、**Then** エラーなくアプリが起動する。
2. **Given** アプリ起動中に、**When** ゲーム内でモーダルが開かれる操作を行うと、**Then** モーダルが正常に表示・閉鎖される。
3. **Given** アプリ起動中に、**When** 操作によりトースト通知がトリガーされると、**Then** トーストが画面右上に表示される。

---

### User Story 2 - テーマ切替が正常に動作する (Priority: P2)

ユーザーが設定モーダルからテーマ（25 種）およびダーク/ライトモードを切り替えられる。

**Why this priority**: テーマ切替はユーザー向け機能であり、v4 のテーマ API 変更の影響を受けやすい。

**Independent Test**: 設定モーダルを開き、テーマを変更すると画面全体の配色が切り替わることを確認。

**Acceptance Scenarios**:

1. **Given** アプリ起動中に、**When** 設定モーダルでテーマを変更すると、**Then** `data-theme` 属性が切り替わり、配色が即座に反映される。
2. **Given** アプリ起動中に、**When** ダーク/ライトモードトグルを操作すると、**Then** `data-mode` 属性が切り替わり、色合いが変わる。

---

### User Story 3 - ビルド・品質チェックが全て通過する (Priority: P3)

v4 移行後、既存の lint / type check / test がすべてパスする。

**Why this priority**: CI/CD の健全性を担保するため。

**Independent Test**: `npm run lint && npm run check && npm run test:run` がすべてエラーなく終了する。

**Acceptance Scenarios**:

1. **Given** v4 へアップグレード済みの状態で、**When** `npm run lint` を実行すると、**Then** エラー・警告ゼロで終了する。
2. **Given** v4 へアップグレード済みの状態で、**When** `npm run check` を実行すると、**Then** 型エラーゼロで終了する。
3. **Given** v4 へアップグレード済みの状態で、**When** `npm run test:run` を実行すると、**Then** 全テストが PASS する。

---

### Edge Cases

- v4 で廃止・リネームされたコンポーネント API が存在した場合、移行先 API を特定して更新する。
- カスタムテーマ (`custom-theme.css`) が v4 のテーマ変数スキーマと互換性がない場合、変数名を修正する。
- 25 種のプリセットテーマのうち v4 で削除・リネームされたものがあれば、代替テーマに置き換えるかインポートを削除する。

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `@skeletonlabs/skeleton` および `@skeletonlabs/skeleton-svelte` のバージョンを v4.13.0 に更新しなければならない。
- **FR-002**: v4 の CSS インポートパス・テーマ設定が新仕様に準拠しなければならない。
- **FR-003**: `app.html` の `<html>` 要素に `data-theme` 属性を設定し、テーマが正常にアクティブ化されなければならない。
- **FR-004**: 使用中の全コンポーネント（Modal, Segment, Switch, Accordion, Toaster）が v4 の API に準拠して動作しなければならない。
- **FR-005**: 既存のカスタムテーマ (`custom-theme.css`) が v4 のテーマ変数スキーマと互換性を持たなければならない。
- **FR-006**: `npm run lint`・`npm run check`・`npm run test:run` がすべてパスしなければならない。

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: アップグレード後にアプリが起動でき、シミュレーターの全操作が正常に完了できる。
- **SC-002**: lint / type check / unit test がエラーゼロで完了する。
- **SC-003**: 25 種のテーマおよびダーク/ライトモード切替がすべて視覚的に正常に動作する。
- **SC-004**: ページロード時間・操作レスポンスがアップグレード前と同等以上を維持する。

---

## Assumptions

- Svelte 5 / SvelteKit 2 / Tailwind v4 は既に導入済みであり、これらのバージョン変更は本スコープに含まない。
- v4 において `@skeletonlabs/skeleton-svelte` は引き続き独立したパッケージとして存在する。
- v3 → v4 のコンポーネント API 変更範囲は小さく、大規模なリアーキテクチャは不要と想定する。
