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

## ドキュメント

プロジェクトの詳細なドキュメントは `docs/` ディレクトリに整理されています：

### ストック情報（永続的な知識）
- **[ドメイン知識](docs/domain/)**: 遊戯王ルール、プロジェクトコンセプト
  - [遊戯王OCG基本ルール](docs/domain/yugioh-rules.md)
  - [プロジェクトコンセプト](docs/domain/project-concept.md)
- **[アーキテクチャ](docs/architecture/)**: Clean Architecture、テスト戦略
  - [アーキテクチャ概要](docs/architecture/overview.md)
  - [テスト戦略](docs/architecture/testing-strategy.md)
- **[ADR](docs/adr/)**: 設計判断記録（Architecture Decision Records）
  - [ADR-0001: Clean Architectureの採用](docs/adr/0001-adopt-clean-architecture.md)
  - [ADR-0002: Immer.jsによる不変性保証](docs/adr/0002-use-immer-for-immutability.md)
  - [ADR-0003: Effect System廃止](docs/adr/0003-abolish-effect-system.md)
- **[開発ガイド](docs/development/)**: セットアップ、コーディング規約
  - [開発環境セットアップ](docs/development/setup.md)
  - [コーディング規約](docs/development/conventions.md)

### フロー情報（プロジェクト単位）
- **[specs/](specs/)**: 機能開発ごとの仕様・計画・タスク
  - [001-architecture-refactoring](specs/001-architecture-refactoring/): Clean Architectureリファクタリング（完了）

## コードアーキテクチャ

### Clean Architecture (3層構造)

現在のアーキテクチャは**Clean Architecture**に基づいています：

```
Domain Layer (不変・純粋)
  ↓ 依存
Application Layer (Command Pattern)
  ↓ 依存
Presentation Layer (Svelte 5 Runes)
```

### レイヤー構成

#### Domain Layer (`src/lib/domain/`)
- **責任**: ゲームルールの純粋なロジック
- **依存**: なし（Pure TypeScript）
- **主要コンポーネント**:
  - `GameState`: 不変なゲーム状態（Immer.jsで更新）
  - `VictoryRule`: 勝利条件判定
  - `PhaseRule`: フェーズ遷移ルール
  - `SpellActivationRule`: 魔法カード発動ルール

#### Application Layer (`src/lib/application/`)
- **責任**: ユースケースの実装（Command Pattern）
- **主要コンポーネント**:
  - `DrawCardCommand`: カードドロー
  - `ActivateSpellCommand`: 魔法カード発動
  - `AdvancePhaseCommand`: フェイズ進行
  - `GameFacade`: UIからの単一窓口
  - Svelte Stores: 状態管理

#### Presentation Layer (`src/routes/`, `src/lib/components/`)
- **責任**: UIの描画とユーザー入力
- **技術**: Svelte 5 + Skeleton UI + TailwindCSS

### 設計原則

1. **不変性**: Immer.jsで状態を不変更新
2. **Command Pattern**: すべての操作をCommandクラスで実装
3. **単方向データフロー**: User Action → Command → State Update → Re-render
4. **Effect System廃止**: 旧システムは削除、Command Patternに統一（ADR-0003）

### 重要なファイルパス

```
skeleton-app/src/lib/
├── domain/                    # Domain Layer
│   ├── models/GameState.ts
│   ├── rules/VictoryRule.ts
│   └── factories/
├── application/               # Application Layer
│   ├── commands/
│   │   ├── DrawCardCommand.ts
│   │   └── ActivateSpellCommand.ts
│   ├── GameFacade.ts
│   └── stores/gameStateStore.ts
└── components/                # Presentation Layer
    └── organisms/board/DuelField.svelte
```

詳細は [アーキテクチャ概要](docs/architecture/overview.md) を参照してください。

## 開発時の注意事項
- フロントエンドのスタイルは可能な限り TailwindCSS を使用する
- Svelte 5 のルーン（`$state`, `$derived`, `$effect` など）を活用する
- バックエンドのリクエスト/レスポンススキーマにはPydanticモデルを使う
- APIのCORS設定は `fast-api-server/src/main.py` で管理
- 環境変数は `compose.yaml` の environment セクションで設定
- **不変性保持**: すべての状態更新はImmer.jsの`produce()`を使用する
- **レイヤー境界**: Domain LayerにSvelte依存コードを書かない

## Recent Changes
- 001-architecture-refactoring: Clean Architecture完成、Effect System廃止（ADR-0003）、204/204 tests passing
