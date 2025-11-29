# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ALWAYS YOU MUST:
- 回答は日本語で行ってください。
- TODO にはブランチ作成・実装内容のテスト・コミット・push・PR作成（まだ作成されていない場合）が含めてください。

## GitHub Repository
- **リポジトリ**: https://github.com/okmethod/ygo-solitaire

## プロジェクト概要
遊戯王カードの1ターンキルコンボをシミュレートするWebアプリケーション。
固定のデッキレシピで先行1ターン目をプレイし、勝利条件を満たすことを目的とする。

## アーキテクチャ
- **フロントエンド**: `skeleton-app/` - SvelteKit + Skeleton UI + TailwindCSS
- **バックエンドAPI**: `fast-api-server/` - FastAPI + Python
- **デプロイ**: Docker Compose (開発) / GitHub Pages (本番)

## よく使用するコマンド

### 開発環境起動
```bash
# 全体起動
docker compose up

# フロントエンドのみ（skeleton-app/ 内で実行）
npm run dev

# バックエンドのみ（fast-api-server/ 内で実行）
uv run uvicorn src.main:app --host 0.0.0.0 --reload
```

### ビルドとテスト
```bash
# フロントエンド（skeleton-app/ 内で実行）
npm run build          # ビルド
npm run check          # TypeScript型チェック
npm run lint           # ESLint + Prettier チェック
npm run format         # Prettier フォーマット

# テスト実行
npm test               # テストをウォッチモードで実行
npm run test:run       # テストを一回実行
npm run test:coverage  # カバレッジ付きでテスト実行
npm run test:ui        # Vitest UIでテスト実行

# 特定のテストファイルのみ実行
npx vitest run src/lib/classes/effects/__tests__/BaseEffect.test.ts

# テストファイルをウォッチモードで実行
npx vitest src/lib/classes/effects/__tests__/BaseEffect.test.ts

# バックエンド（fast-api-server/ 内で実行）
uv run poe lint        # ruff format + ruff check + mypy
uv run poe fix         # ruff format + ruff check --fix
uv run poe mypy        # mypy型チェック
```

### デプロイ
```bash
# 本番デプロイ（skeleton-app/ 内で実行）
npm run deploy         # build + gh-pages へのデプロイ
```

## アプリケーションポート設定
### 開発環境（Docker Compose）
- **フロントエンド**: `http://localhost:5173` (ポート: 5173)
- **バックエンドAPI**: `http://localhost:8000` (ポート: 8000)

## 技術スタック詳細
### フロントエンド (skeleton-app/)
- **フレームワーク**: SvelteKit + Svelte 5
- **UIライブラリ**: Skeleton UI v3
- **CSS**: TailwindCSS v4
- **型チェック**: TypeScript + svelte-check
- **リンター**: ESLint + Prettier
- **デプロイ**: GitHub Pages (gh-pages)

### バックエンド (fast-api-server/)
- **フレームワーク**: FastAPI + Pydantic
- **パッケージ管理**: uv
- **リンター**: ruff + mypy
- **タスクランナー**: poethepoet
- **API設計**: RESTful API with OpenAPI/Swagger

## YOU MUST : New issue
- issue作成時は、目的・TODOを簡潔に記載してください。

## YOU MUST : Modify codes
- コード変更作業開始時にこの操作を行う
  - **作業開始時**: 専用ブランチを作成する
    - feature/<機能名>
    - fix/<修正内容>
    - 等
  - **mainブランチでの直接作業は禁止**: いかなる変更もmainブランチに直接コミットしない
- 以下を必ず作業終了時に実行してください。
  1. 作業内容をコミット
  2. リモートブランチに push する
  3. PR を作成する 

## YOU MUST : Commit
- コミット前には必ず動作確認してください
- コミット前には必ず linter / formatter を実行してください
- コミットする際はエラーがない状態で行ってください
- ファイルを新規追加する場合、そのファイルが Github にPushするべきでないファイル判断した場合には、必ず.gitignoreに指定してください

## ドキュメント体系

プロジェクトドキュメントは**ストック情報**（永続的な知識）と**フロー情報**（プロジェクト単位の作業記録）に分かれています。

### 📚 ストック情報（永続的な知識）

**重要**: 新しいセッション開始時は、必ず [docs/README.md](docs/README.md) から読み始めてください。

#### 1. プロジェクト全体の理解
- **[docs/README.md](docs/README.md)**: ドキュメント目次とプロジェクトコンセプト
  - プロジェクトの課題・目的・コンセプトを記載
  - 各サブディレクトリへのナビゲーション

#### 2. ドメイン知識（遊戯王ルール）
- **[docs/domain/](docs/domain/)**: ゲームルールとスコープ管理
  - [overview.md](docs/domain/overview.md) ⭐: スコープ定義と実装状況マッピング
    - やること/やらないことの明確化
    - ドメイン実装状況（✅完全実装 / 🚧一部実装 / ⏳未実装）
    - ドメイン知識とコードの対応表
  - [yugioh-rules.md](docs/domain/yugioh-rules.md): 遊戯王OCG基本ルール
    - ユビキタス言語（Zone, Action, Effect等）
    - フェーズシステム、勝利条件、カード種別

#### 3. アーキテクチャ設計
- **[docs/architecture/](docs/architecture/)**: 技術的な設計方針
  - [overview.md](docs/architecture/overview.md): Clean Architecture概要
    - 3層構造（Domain/Application/Presentation）
    - レイヤー構成と依存関係
    - 設計原則（不変性、Command Pattern）
  - [testing-strategy.md](docs/architecture/testing-strategy.md): テスト戦略
    - テストピラミッド、カバレッジ目標
    - Unit/Integration/E2E Tests

#### 4. 設計判断の記録
- **[docs/adr/](docs/adr/)**: Architecture Decision Records
  - [0001-adopt-clean-architecture.md](docs/adr/0001-adopt-clean-architecture.md): Clean Architecture採用
  - [0002-use-immer-for-immutability.md](docs/adr/0002-use-immer-for-immutability.md): Immer.js不変性保証
  - [0003-abolish-effect-system.md](docs/adr/0003-abolish-effect-system.md): Effect System廃止とCommand統一

#### 5. 開発ガイド
- **[docs/development/](docs/development/)**: 実践的な手順書
  - [setup.md](docs/development/setup.md): 開発環境セットアップ
  - [conventions.md](docs/development/conventions.md): コーディング規約

### 📋 フロー情報（プロジェクト単位）

- **[specs/](specs/)**: 機能開発ごとの仕様・計画・タスク
  - [001-architecture-refactoring/](specs/001-architecture-refactoring/): Clean Architectureリファクタリング（✅完了）
    - spec.md: 要件定義
    - plan.md: 実装計画
    - tasks.md: タスク管理と進捗

### 🎯 ドキュメント読み方ガイド

**新規参加者**:
1. [docs/README.md](docs/README.md) - プロジェクトコンセプト
2. [docs/domain/overview.md](docs/domain/overview.md) - スコープと実装状況
3. [docs/development/setup.md](docs/development/setup.md) - 環境構築
4. [docs/architecture/overview.md](docs/architecture/overview.md) - アーキテクチャ理解

**実装開始前**:
1. [docs/domain/yugioh-rules.md](docs/domain/yugioh-rules.md) - ドメイン用語学習
2. [docs/development/conventions.md](docs/development/conventions.md) - コーディング規約確認
3. [docs/adr/](docs/adr/) - 過去の設計判断を理解

**特定の機能実装時**:
1. [docs/domain/overview.md](docs/domain/overview.md) で該当機能の実装状況を確認
2. 必要に応じて [specs/](specs/) でフロー情報を参照

## コードアーキテクチャ（概要）

### Clean Architecture (3層構造)

```
Domain Layer (不変・純粋)
  ↓ 依存
Application Layer (Command Pattern)
  ↓ 依存
Presentation Layer (Svelte 5 Runes)
```

### 設計原則

1. **不変性**: Immer.jsで状態を不変更新
2. **Command Pattern**: すべての操作をCommandクラスで実装
3. **単方向データフロー**: User Action → Command → State Update → Re-render
4. **レイヤー境界遵守**: Domain LayerにSvelte依存コードを書かない

### ディレクトリ構造

```
skeleton-app/src/lib/
├── domain/         # ゲームルール（純粋TypeScript）
├── application/    # ユースケース（Commands, Stores, Facade）
└── components/     # UI（Svelte 5）
```

**詳細**: [docs/architecture/overview.md](docs/architecture/overview.md) を参照

## 開発時の注意事項
- フロントエンドのスタイルは可能な限り TailwindCSS を使用する
- Svelte 5 のルーン（`$state`, `$derived`, `$effect` など）を活用する
- バックエンドのリクエスト/レスポンススキーマにはPydanticモデルを使う
- APIのCORS設定は `fast-api-server/src/main.py` で管理
- 環境変数は `compose.yaml` の environment セクションで設定
- **不変性保持**: すべての状態更新はImmer.jsの`produce()`を使用する
- **レイヤー境界**: Domain LayerにSvelte依存コードを書かない

## Recent Changes
- 002-data-model-refactoring: Added TypeScript 5.x (SvelteKit + Vite環境)
- 001-architecture-refactoring: Clean Architecture完成、Effect System廃止（ADR-0003）、204/204 tests passing

## Active Technologies
- TypeScript 5.x (SvelteKit + Vite環境) (002-data-model-refactoring)
- N/A (フロントエンドのみ、外部API依存) (002-data-model-refactoring)
