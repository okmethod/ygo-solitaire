# CLAUDE.md

---

## 基本ルール

- **回答は日本語で簡潔に行う**
- **コミット前に必ず lint/format を実行する**
- **サブエージェントを積極活用しトークン節約する**:
  - 3ファイル以上の調査・コード検索 → Explore
  - 実装計画の策定 → Plan
  - テスト/Lint/ビルド実行 → Bash (background可)

---

## CLAUDE.md 運用方針

**原則**: 書きすぎず、書かなすぎず（目安: 100 行程度）

- **CLAUDE.md の役割**: 即座に必要な最小限の情報のみ（コマンド、作業フロー、直近作業）
- **詳細情報は`docs/`へ委譲**: アーキテクチャ、ドメイン知識、設計判断は都度読み込む
- **コンテキスト圧迫を防ぐ**: すべてを記載せず、必要な情報を適切に参照する
- **定期的な見直し**: 情報が増えたら古い内容を削除し、`docs/`や`git log`に委譲する

---

## プロジェクト概要

遊戯王カードの 1 ターンキルコンボシミュレータ

- **リポジトリ**: https://github.com/okmethod/ygo-solitaire
- **コンセプトとスコープ**: 固定デッキで先行 1 ターン目のみをプレイ（詳細: [docs/README.md](docs/README.md)）
- **ドメイン知識**: 必要なゲームルールをドキュメント化（詳細: [docs/domain/overview.md](docs/domain/overview.md)）
- **アーキテクチャ**: 4 層 Clean Architecture（詳細: [docs/architecture/overview.md](docs/architecture/overview.md)）
- **フロントエンド**: SvelteKit + Skeleton UI + TailwindCSS (`skeleton-app/`)

---

## ドキュメント体系

**重要**: 新規セッション開始時は必ず [docs/README.md](docs/README.md) から読み始める

- **`docs/`**: ストック情報（永続的な設計知識・アーキテクチャ）
- **`specs/`**: フロー情報（機能開発ごとの仕様・計画・タスク）

必要な情報は都度`docs/`から読み込むこと。CLAUDE.md にすべて記載しない。

---

## 開発時の重要ルール

- **Svelte 5 Runes モード**: `$state`, `$derived`, `$effect`を活用
- **レイヤー境界**: ドメイン層 / アプリ層 / インフラ層の責務を常に意識
- **不変性保持**: 状態は `readonly` のメンバを使用

---

## 作業フロー

### ブランチ戦略

- **main ブランチへの直接コミット禁止**
- 必ず専用ブランチを作成: `feature/<機能名>`, `fix/<修正内容>`

### コミット前チェックリスト

1. **テスト実行**: `npm run test:run`
2. **Lint/Format**: `npm run lint && npm run format`
3. コミット・push・PR 作成

### よく使うコマンド（skeleton-app/内）

```bash
# テスト・品質チェック
npm run lint          # prettier check + eslint
npm run format        # prettier format
npm run check         # svelte-check --tsconfig
npm run test:run      # vitest run
```
