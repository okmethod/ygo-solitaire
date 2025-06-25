# Claude Code Configuration

## ALWAYS YOU MUST:
- 回答は日本語で行ってください。
- TODO にはブランチ作成・実装内容のテスト・コミット・push・PR作成（まだ作成されていない場合）が含めてください。

## Github Repository
- **リポジトリ**: https://github.com/okmethod/ygo-solitaire

## プロジェクト概要
./README.md を参照。

## 技術スタック
- フロントエンド: Skeleton v3 @ TypeScript
  - Tool Chain
    - npm
    - SvelteKit
    - Svelte
    - Tailwind
  - 留意事項
    - スタイルは可能な限り TailwindCSS を使用する
- バックエンドAPI: FastAPI @ Python
  - Tool Chain
    - uv
    - ruff
    - mypy
  - 留意事項
    - リクエスト/レスポンススキーマにはPydanticモデルを使う
- Claude Code: AIによる開発支援
- GitHub CLI: GitHubリポジトリ操作（Pull Request作成など）    

## アプリケーションポート設定
### 開発環境 （Docker Compose）
- 以下のポート番号を変更しないこと。
- **フロントエンド**: `http://localhost:5173` (ポート: 5173)
- **バックエンドAPI**: `http://localhost:8000` (ポート: 8000)

## YOU MUST : New issue
- issue作成時は、目的・TODOを簡潔に記載してください。

## YOU MUST : Modify codes
- コード変更作業開始時にこの操作を行う
  - **作業開始時**: 専用ブランチを作成する（feature-<機能名>、fix-<修正内容>等）
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
