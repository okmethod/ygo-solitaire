---
description: TypeScript の開発規約・コマンド
globs:
  - "skeleton-app/src/**/*.ts"
---

# TypeScript

- **言語**: TypeScript 5
- **パッケージ管理**: npm

## 開発規約

- ドメインモデルの型フィールドは `readonly` を基本とする（不変性の保証・Svelte Runes との相性）
- コメントは**日本語**を基本とし、ログやエラーメッセージは**英文**を基本とする
- JSDoc は **1行要約** を基本とし、型と重複する情報は書かない
  - 自明な `@param` / `@returns` は省く（引数名と型で十分なら不要）
  - `@type` タグは使わない（TSの型定義がSSoT）
- コメントは「何を（What）」ではなく「なぜ（Why）」を書く
- 根幹部分（インターフェース・基底クラス・公開API・index.ts）には JSDoc を書く
- 枝葉部分（個別実装・privateメソッド・メソッド内処理）は `//` コメントのみ（JSDocは書かない）
- 未実装・負債は `// TODO:` / `// FIXME:` コメントで明示する

## よく使うコマンド（skeleton-app/ 内）

```bash
npm run lint          # prettier check + eslint
npm run format        # prettier format
npm run check         # svelte-check --tsconfig
npm run test:run      # vitest run
```
