# Research: TypeScript v6 アップグレード

**Feature**: 001-typescript-v6-upgrade
**Date**: 2026-03-31

---

## 調査結果

### R-001: SvelteKit 2.x との互換性

**Decision**: SvelteKit 2.x（現バージョン 2.55.0）は TypeScript v6 と互換性あり。SvelteKit 側のバージョンアップは不要。

**Rationale**: SvelteKit リリースノートに TypeScript v6 向け追加対応の記載はなく、既存の `@sveltejs/kit ^2.16.0` および `@sveltejs/vite-plugin-svelte ^5.0.0` のまま動作する。

**Alternatives considered**: SvelteKit のバージョンアップを同時に行う案も検討したが、今回のスコープ外とする（Out of Scope に記載済み）。

---

### R-002: `types` デフォルト変更による `@types/node` への影響

**Decision**: `tsconfig.json` に `"types": ["node"]` を明示的に追加する必要あり。

**Rationale**: TypeScript v6 では `types` のデフォルトが「全 `@types/*` を自動インクルード」から空配列 `[]` に変更された。現在の `tsconfig.json` には `types` が未設定のため、アップグレード後は `@types/node` が自動参照されなくなり、`process` 等 Node.js グローバルが型エラーになる可能性がある。

**Alternatives considered**: `types` を設定しない（空配列デフォルトのまま）という選択肢もあるが、Vite の設定ファイル（`vite.config.ts`）が Node.js API を使用しているため `@types/node` の明示指定が必要。`@types/js-yaml` は import で個別参照するため `types` 配列への追加は不要。

**変更内容**:
```json
// tsconfig.json に追加
"types": ["node"]
```

---

### R-003: `moduleResolution: "bundler"` の有効性

**Decision**: そのまま維持。変更不要。

**Rationale**: TypeScript v6 で廃止されたのは `"classic"` モードのみ。`"bundler"` は引き続き有効かつ SvelteKit + Vite 構成での推奨設定。

---

### R-004: `esModuleInterop: true` の明示設定

**Decision**: そのまま維持。変更不要。

**Rationale**: TypeScript v6 では `esModuleInterop` は常時 `true`（変更不可）となったが、`true` を明示設定することは有効で警告も出ない。`false` への設定が deprecated になっただけ。

---

### R-005: svelte-check のバージョン

**Decision**: `npm update` で `svelte-check` を 4.4.6 以上に更新する。

**Rationale**: `svelte-check ^4.0.0` は現時点で 4.4.6 が最新（2026-03-31 リリース）。`svelte-language-server 0.17.30` に TypeScript 6.0 互換性対応（PR #2988）が含まれている。TypeScript v6 インストール後に svelte-check を更新しないと `npm run check` が失敗する可能性がある。

---

### R-006: SPA ビルド（adapter-static）と dev サーバーの動作

**Decision**: 追加対応不要。TypeScript v6 は Vite のビルドパイプラインには直接影響しない。

**Rationale**: `svelte.config.js` は `adapter-static` + `fallback: "index.html"` で SPA 構成。`vite.config.ts` はビルド設定・dev サーバー設定の両方を定義。TypeScript は型チェックのみに使用され、実際のビルド変換は Vite が担うため、TypeScript バージョンアップ後も `npm run build` / `npm run dev` の動作には直接影響しない。ただし型エラーが `svelte-check` で検出された場合は `npm run build` も失敗するため、先にチェックを通すことが前提。

---

### R-007: 移行コードモッドツール `ts5to6`

**Decision**: このプロジェクトでは使用不要。手動で変更箇所が特定済み。

**Rationale**: 必要な変更は `tsconfig.json` への `"types": ["node"]` 追加のみと判明。自動変換ツールが必要になるほどのコード変更はない。

---

## 必要な変更まとめ

| 対象ファイル | 変更内容 | 優先度 |
|---|---|---|
| `skeleton-app/package.json` | `typescript: "^6.0.0"` に更新 | P1 |
| `skeleton-app/tsconfig.json` | `"types": ["node"]` を追加 | P1 |
| `skeleton-app/` | `npm update svelte-check` で 4.4.6 以上に更新 | P1 |

**変更不要なもの**: `moduleResolution`, `esModuleInterop`, `strict`, SvelteKit バージョン, Vite バージョン

---

## 不確実性・リスク

- `tsconfig.json` の `types` 追加後も、`.svelte-kit/tsconfig.json`（自動生成）が予期しない設定を `extends` 経由で引き継ぐ可能性がある。`npx svelte-kit sync` 後の内容を実行時に確認すること。
- TypeScript v6 への更新後、`typescript-eslint ^8.20.0` が TypeScript v6 をサポートしているか確認が必要（調査中では対応の言及あり。実行時に lint エラーが出た場合は `typescript-eslint` も更新する）。
