# CLAUDE.md

## 基本ルール

- **回答は日本語で行う**
- **コミット前に必ず lint/format を実行する**
- **コンテキスト管理のためサブエージェントを活用する**:
  - 広範囲の調査・解析には **Explore/Plan サブエージェントを優先使用** し、メインスレッドを保護する
  - 独立したタスクは適宜サブエージェントへ委譲し、トークン効率化を徹底する

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

## ドキュメント体系

**重要**: 新規セッション開始時は必ず [docs/README.md](docs/README.md) から読み始める

- **`docs/`**: ストック情報（永続的な設計知識・アーキテクチャ）
- **`specs/`**: フロー情報（機能開発ごとの仕様・計画・タスク）

必要な情報は都度`docs/`から読み込むこと。CLAUDE.md にすべて記載しない。

## 開発時の重要ルール

- **Svelte 5 Runes モード**: `$state`, `$derived`, `$effect`を活用
- **不変性保持**: すべての状態更新は`Immer.js`の`produce()`を使用
- **レイヤー境界**: Domain Layer に Svelte/UI 依存コードを書かない
- **スタイル**: 可能な限り TailwindCSS を使用

---

## 作業フロー

### ブランチ戦略

- **main ブランチへの直接コミット禁止**
- 必ず専用ブランチを作成: `feature/<機能名>`, `fix/<修正内容>`

### コミット前チェックリスト

1. **テスト実行**: `npm run test:run`
2. **Lint/Format**: `npm run lint && npm run format`
3. **tasks.md 更新**: 完了タスクを`[x]`にマーク（重要！）
4. コミット・push・PR 作成

### よく使うコマンド（skeleton-app/内）

```bash
# 開発
npm run dev           # 開発サーバー起動
npm run build         # ビルド

# テスト・品質チェック
npm run test:run      # テスト実行
npm run lint          # ESLint + Prettier
npm run format        # Prettier format
npx playwright test   # E2Eテスト

# デプロイ
npm run deploy        # GitHub Pages
```

---

## spec-kit ワークフロー

次の機能開発では以下のワークフローを試す:

- `/speckit.specify` - 仕様作成（Explore サブエージェントによる既存設計調査を推奨）
- `/speckit.plan` - 実装計画作成（Plan サブエージェントによる技術的依存関係分析を推奨）
- `/speckit.tasks` - タスク生成（サブエージェントによる整合性と分割の検証）
- `/speckit.implement` - タスク実行 + タスク進捗の記録（ tasks.md の更新）
  - **サブエージェント隔離対象**: テスト・Lint 実行、詳細な型調査、大規模な既存資源調査、外部ライブラリの調査、規約適合性チェック、等
  - **メインスレッド**: 修正の完了報告と、次に進むべき判断に集中する

### タスク ID 管理ルール

- **spec 実装中**: タスク ID（T0xx）をコメントに記載して作業効率を上げる
  - **コミットメッセージ**: タスク ID を含めて OK（履歴として有用）
- **spec 完了後**: ストック情報（ソースコード、`docs/`）から、タスク ID を削除する

---

## 直近の作業記録

必要に応じて、`specs/`の番号の大きいものから読み込むこと。
適宜、git log も参照する。

キャッシュ目的で、直近の作業だけをここに書く。
すべてを CLAUDE.md に記載することはしない。
単純追加するのではなく、追加したら古いものを削除するなど。

現在進行中または最近完了した仕様:

- [specs/006-ux-automation/](specs/006-ux-automation/) - UX 改善（自動フェーズ進行・デッキシャッフル・自動勝利判定）✅ 完了

## Active Technologies

- TypeScript 5.0 (ES2022), Svelte 5 (Runes mode), SvelteKit 2 + Vitest (testing), Immer.js (immutability), TailwindCSS (styling), Skeleton UI
- Effect Model: ChainableAction (カード効果), AdditionalRule (永続効果)
- N/A (フロントエンドのみ、状態はメモリ内)

## Recent Changes

- 008-effect-model: Added ChainableAction and AdditionalRule models with Chicken Game implementation (2025-01-28)
- 007-domain-refactor: Added TypeScript (ES2022) + Svelte 5 (Runes mode), SvelteKit 2, TailwindCSS, Skeleton UI
