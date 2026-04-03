# CLAUDE.md

---

## 行動原則

- **回答は日本語で簡潔に行う**
- **コミット前に必ず lint/format を実行する**
- **サブエージェントを積極活用しトークン節約する**:
  - 3ファイル以上の調査・コード検索 → Explore
  - 実装計画の策定 → Plan
  - テスト/Lint/ビルド実行 → Bash (background可)

---

## プロジェクト概要

遊戯王カードの 1 ターンキルシミュレータ

- **リポジトリ**: https://github.com/okmethod/ygo-solitaire
- **コンセプトとスコープ**: 固定デッキで先行 1 ターン目のみをプレイ（詳細: [docs/README.md](docs/README.md)）
- **ドメイン知識**: 必要なゲームルールをドキュメント化（詳細: [docs/domain/overview.md](docs/domain/overview.md)）
- **アーキテクチャ**: 4 層 Clean Architecture（詳細: [docs/architecture/overview.md](docs/architecture/overview.md)）
  - Note: ドメイン層 / アプリ層 / インフラ層 / プレゼン層の責務とレイヤー境界を常に意識すること
- **技術スタック**: Skeleton v4 (Svelte v5 + TailwindCSS v4 + Vite v6)
  - Note: Svelte 5 Runes モード(`$state`, `$derived`, `$effect`) を活用すること

---

### よく使うコマンド（skeleton-app/内）

```bash
# lint/format
npm run lint          # prettier check + eslint
npm run format        # prettier format
npm run check         # svelte-check --tsconfig

# テスト
npm run test:run      # vitest run
```
