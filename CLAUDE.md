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
- **コンセプトとスコープ**: 固定デッキで先行 1 ターン目のみをプレイ
- **アーキテクチャ**: 4 層 Clean Architecture - レイヤー境界を常に意識すること
- **技術スタック**: TypeScript 6, Skeleton v5 (Svelte v5 + TailwindCSS v4 + Vite v8)

## ディレクトリ

- `docs`: ドキュメント全体像 + コンセプト + スコープ方針
  - `docs/game-rules/`: ゲームルール
  - `docs/design/`: 設計方針
- `skeleton-app/`: Skeleton フロントエンド
  - `src/lib/domain/`: ドメイン層
  - `src/lib/application/`: アプリ層
  - `src/lib/infrastructure/`: インフラ層
  - `src/lib/presentation/`: プレゼン層
- `.claude/rules/`: コーディング規約（言語非依存 + TS/Svelte 固有）

---

## 開発ワークフロー

- **ローカル / 1 人作業**: `main` に直接コミットして進めてよい
- **クラウド / spec-kit 作業**: ブランチを切り、PR を成果物として進める
- **コミットメッセージ**: gitmoji 規約（例: `:up:` `:gear:` `:memo:`）
- **設計判断の記録**: git log / コミットメッセージ / PR 説明、および docs/design の inline Why に残す（ADR は廃止）
