# CLAUDE.md

## 基本ルール
- **回答は日本語で行う**
- **タスク完了時は即座に`specs/*/tasks.md`を更新する**
- **コミット前に必ずlint/formatを実行する**

## CLAUDE.md運用方針

**原則**: 書きすぎず、書かなすぎず（目安: 100行程度）

- **CLAUDE.mdの役割**: 即座に必要な最小限の情報のみ（コマンド、作業フロー、直近作業）
- **詳細情報は`docs/`へ委譲**: アーキテクチャ、ドメイン知識、設計判断は都度読み込む
- **コンテキスト圧迫を防ぐ**: すべてを記載せず、必要な情報を適切に参照する
- **定期的な見直し**: 情報が増えたら古い内容を削除し、`docs/`や`git log`に委譲する

## ドキュメント体系
**重要**: 新規セッション開始時は必ず [docs/README.md](docs/README.md) から読み始める

- **`docs/`**: ストック情報（永続的な設計知識・アーキテクチャ）
- **`specs/`**: フロー情報（機能開発ごとの仕様・計画・タスク）

必要な情報は都度`docs/`から読み込むこと。CLAUDE.mdにすべて記載しない。

### 新規参加者ガイド
1. [docs/README.md](docs/README.md) - プロジェクトコンセプト
2. [docs/domain/overview.md](docs/domain/overview.md) - スコープと実装状況
3. [docs/architecture/overview.md](docs/architecture/overview.md) - アーキテクチャ理解

## プロジェクト概要
遊戯王カードの1ターンキルコンボシミュレータ（固定デッキで先行1ターン目をプレイ）

- **リポジトリ**: https://github.com/okmethod/ygo-solitaire
- **フロントエンド**: SvelteKit + Skeleton UI + TailwindCSS (`skeleton-app/`)
- **バックエンド**: FastAPI (`fast-api-server/`) ※現在未使用
- **アーキテクチャ**: 4層Clean Architecture（詳細: [docs/architecture/overview.md](docs/architecture/overview.md)）

## よく使うコマンド（skeleton-app/内）

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

## 開発時の重要ルール

- **Svelte 5 Runesモード**: `$state`, `$derived`, `$effect`を活用
- **不変性保持**: すべての状態更新は`Immer.js`の`produce()`を使用
- **レイヤー境界**: Domain LayerにSvelte/UI依存コードを書かない
- **スタイル**: 可能な限りTailwindCSSを使用

## タスクID管理ルール

- **実装中**: タスクID（T0xx）をコメントに記載して作業効率を上げる
- **完了後**: ストック情報（ソースコード、`docs/`）からタスクIDを削除
- **コミットメッセージ**: タスクIDを含めてOK（履歴として有用）

## 作業フロー

### ブランチ戦略
- **mainブランチへの直接コミット禁止**
- 必ず専用ブランチを作成: `feature/<機能名>`, `fix/<修正内容>`

### コミット前チェックリスト
1. **テスト実行**: `npm run test:run`
2. **Lint/Format**: `npm run lint && npm run format`
3. **tasks.md更新**: 完了タスクを`[x]`にマーク（重要！）
4. コミット・push・PR作成

## spec-kitワークフロー

次の機能開発では以下のワークフローを試す:
- `/speckit.specify` - 仕様作成
- `/speckit.plan` - 実装計画作成
- `/speckit.tasks` - タスク生成
- `/speckit.implement` - **タスク実行 + 自動tasks.md更新**

## 直近の作業記録

必要に応じて、`specs/`の番号の大きいものから読み込むこと。
適宜、git logも参照する。

キャッシュ目的で、直近の作業だけをここに書く。
すべてをCLAUDE.mdに記載することはしない。
単純追加するのではなく、追加したら古いものを削除するなど。

現在進行中または最近完了した仕様:
- [specs/006-ux-automation/](specs/006-ux-automation/) - UX改善（自動フェーズ進行・デッキシャッフル・自動勝利判定）✅完了

