# Implementation Plan: TypeScript v6 アップグレード

**Branch**: `001-typescript-v6-upgrade` | **Date**: 2026-03-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-typescript-v6-upgrade/spec.md`

## Summary

TypeScript を v5 から v6 にアップグレードする。主な作業は依存関係の更新と `tsconfig.json` への `"types": ["node"]` 追加のみ。SPA プロダクションビルド・ローカル開発サーバー・テスト一式の動作確認をもって完了とする。

## Technical Context

**Language/Version**: TypeScript 5.x → 6.x（`^5.0.0` → `^6.0.0`）
**Primary Dependencies**: SvelteKit 2.x, Vite 6.x, svelte-check ^4.0.0（→ 4.4.6 以上）, typescript-eslint ^8.20.0
**Storage**: N/A（フロントエンド SPA）
**Testing**: Vitest 3.x (`npm run test:run`)、svelte-check (`npm run check`)、ESLint+Prettier (`npm run lint`)
**Target Platform**: ブラウザ（SPA / GitHub Pages）+ ローカル開発サーバー（Vite dev）
**Project Type**: Web SPA（SvelteKit + adapter-static）
**Performance Goals**: N/A（ビルド・型チェック時間への影響は許容範囲内）
**Constraints**: SvelteKit 2.x との互換性を維持。他の依存パッケージのバージョンは原則変更しない（TypeScript v6 対応に必要な場合を除く）
**Scale/Scope**: 設定ファイル 2 ファイル（`package.json`, `tsconfig.json`）の変更と依存関係更新のみ

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| 原則 | 評価 | 備考 |
|---|---|---|
| I. 目的と手段の分離 | ✅ PASS | TypeScript v6 の新機能活用は Out of Scope。アップグレード自体が目的。 |
| II. 段階的な理解の深化 | ✅ PASS | 研究フェーズで必要な変更を特定済み（R-001〜R-007）。 |
| III. 最適解の選択と記録 | ✅ PASS | research.md に設計判断の根拠を記録。 |
| IV. 関心の分離 | ✅ PASS | TypeScript 設定変更のみ。レイヤー境界に影響なし。 |
| V. 変更に対応できる設計 | ✅ PASS | 最小限の変更にとどめ、将来の更新容易性を維持。 |
| VI. 理解しやすさ最優先 | ✅ PASS | 設定ファイルへの明示的な `types` 追加は意図を明確化する。 |
| VII. シンプルに問題を解決する | ✅ PASS | 変更箇所は最小（2 ファイル + npm update）。 |
| VIII. テスト可能性を意識する | ✅ PASS | 既存テスト・Lint・型チェックで動作確認。 |
| IX. 技術スタック（スタンドアロン SPA） | ✅ PASS | TypeScript + Svelte + TailwindCSS の構成を維持。 |
| NON-NEGOTIABLE: ブランチ戦略 | ✅ PASS | 専用ブランチ `001-typescript-v6-upgrade` で作業中。 |
| NON-NEGOTIABLE: コミット前品質保証 | ✅ PASS | タスクにチェックを明示する。 |

**Violations**: なし

## Project Structure

### Documentation (this feature)

```text
specs/001-typescript-v6-upgrade/
├── spec.md              # 機能仕様
├── plan.md              # このファイル
├── research.md          # Phase 0 調査結果
├── checklists/
│   └── requirements.md  # 仕様品質チェックリスト
└── tasks.md             # Phase 2 output (/speckit.tasks で生成)
```

### Source Code (変更対象ファイル)

```text
skeleton-app/
├── package.json         # typescript バージョン更新、svelte-check 更新
└── tsconfig.json        # "types": ["node"] を追加
```

**Structure Decision**: ソースコードの変更は設定ファイル 2 ファイルのみ。アーキテクチャ変更なし。

## Implementation Steps

### Step 1: 依存関係の更新

```bash
cd skeleton-app

# TypeScript v6 に更新
npm install typescript@^6.0.0 --save-dev

# svelte-check を TypeScript v6 対応版（4.4.6 以上）に更新
npm update svelte-check
```

**確認方法**: `npx tsc --version` が 6.x を表示すること

---

### Step 2: tsconfig.json の更新

`skeleton-app/tsconfig.json` の `compilerOptions` に `"types": ["node"]` を追加する。

**変更前**:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

**変更後**:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["node"]
  }
}
```

**根拠**: TypeScript v6 で `types` のデフォルトが `[]` に変更されたため、`@types/node` が自動インクルードされなくなる。`vite.config.ts` で Node.js API を使用しているため明示指定が必要。（research.md R-002 参照）

---

### Step 3: 動作確認

以下の順番で実行し、すべてが通ることを確認する。

```bash
cd skeleton-app

# 1. SvelteKit の型生成を更新
npx svelte-kit sync

# 2. 型チェック
npm run check

# 3. Lint / Format
npm run lint

# 4. テスト
npm run test:run

# 5. プロダクションビルド（SPA）
npm run build

# 6. ローカル開発サーバー起動（手動確認）
npm run dev
```

**Step 6 確認内容**: ブラウザで `http://localhost:5173` にアクセスし、アプリが正常に表示されること。

---

### Step 4: コミット・PR 作成

```bash
# コミット
git add skeleton-app/package.json skeleton-app/package-lock.json skeleton-app/tsconfig.json
git commit -m "chore: upgrade TypeScript to v6 and update tsconfig types"

# PR 作成
gh pr create --title "chore: upgrade TypeScript v5 to v6"
```

---

## リスクと対処

| リスク | 可能性 | 対処 |
|---|---|---|
| `typescript-eslint ^8.20.0` が TypeScript v6 未対応 | 低（対応済みの情報あり） | `npm update typescript-eslint` で最新化 |
| `.svelte-kit/tsconfig.json` が v6 非対応の設定を含む | 低（SvelteKit 2.x は対応済み） | `npx svelte-kit sync` 後の内容を確認 |
| 型エラーが既存コードで発生 | 低（strict は既に true） | エラー内容に応じてコードを修正 |

## 完了条件

- [ ] `npm run check` がゼロエラーで完了
- [ ] `npm run lint` がゼロエラーで完了
- [ ] `npm run test:run` が 100% パス
- [ ] `npm run build` が正常に完了
- [ ] `npm run dev` が起動しブラウザでアプリが表示される
- [ ] `tsconfig.json` に `"types": ["node"]` が追加済み
- [ ] TypeScript バージョンが 6.x であることを確認済み
