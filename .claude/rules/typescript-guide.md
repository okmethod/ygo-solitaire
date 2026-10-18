---
description: TypeScript の開発規約・コマンド
globs:
  - "skeleton-app/**/*.ts"
---

# TypeScript

- **言語**: TypeScript 6
- **パッケージ管理**: npm

## 開発規約

- ドメインモデルの型フィールドは `readonly` を基本とする（不変性の保証・Svelte Runes との相性）
- JSDoc タグは TS の型を前提に省く: 自明な `@param` / `@returns` は書かない、`@type` は使わない（型定義が SSoT）
- JSDoc・コメントの方針（根幹/枝葉の使い分け・1 行要約・型重複回避）は `docs/design/comment-guide.md` を参照
- 未実装・負債は `// TODO:` / `// FIXME:` コメントで明示する

## よく使うコマンド（skeleton-app/ 内）

```bash
npm run lint          # prettier check + eslint
npm run format        # prettier format
npm run check         # svelte-check --tsconfig
npm run test:run      # vitest run
```
