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

## 開発時の注意事項
- フロントエンドのスタイルは可能な限り TailwindCSS を使用する
- バックエンドのリクエスト/レスポンススキーマにはPydanticモデルを使う
- APIのCORS設定は `fast-api-server/src/main.py:21` で管理
- 環境変数は `compose.yaml` の environment セクションで設定
