# 開発環境セットアップ

## 前提条件

- **Node.js**: v20以上
- **npm**: v10以上
- **Docker** (オプション): バックエンドAPI開発時のみ必要

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/okmethod/ygo-solitaire.git
cd ygo-solitaire
```

### 2. フロントエンド開発

```bash
cd skeleton-app
npm install
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

### 3. バックエンドAPI（オプション）

```bash
cd fast-api-server
uv run uvicorn src.main:app --host 0.0.0.0 --reload
```

APIドキュメント: `http://localhost:8000/docs`

### 4. Docker Compose（全体起動）

```bash
docker compose up
```

- フロントエンド: `http://localhost:5173`
- バックエンド: `http://localhost:8000`

## ディレクトリ構造

```
ygo-solitaire/
├── skeleton-app/          # フロントエンド (SvelteKit)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── domain/         # Domain Layer
│   │   │   ├── application/    # Application Layer
│   │   │   └── components/     # Presentation Layer
│   │   └── routes/
│   ├── tests/
│   │   ├── unit/          # Unit tests
│   │   └── e2e/           # E2E tests (Playwright)
│   └── package.json
│
├── fast-api-server/       # バックエンドAPI (FastAPI)
│   ├── src/
│   └── pyproject.toml
│
├── docs/                  # ドキュメント
│   ├── domain/           # ドメイン知識
│   ├── architecture/     # アーキテクチャ
│   ├── adr/              # Architecture Decision Records
│   └── development/      # 開発ガイド
│
└── specs/                 # プロジェクト仕様（フロー情報）
    └── 001-architecture-refactoring/
```

## よく使用するコマンド

### フロントエンド（skeleton-app/内で実行）

#### 開発サーバー
```bash
npm run dev              # 開発サーバー起動
npm run build            # 本番ビルド
npm run preview          # ビルド結果のプレビュー
```

#### 型チェック・リント
```bash
npm run check            # TypeScript型チェック
npm run check:watch      # 型チェック（ウォッチモード）
npm run lint             # ESLint + Prettier チェック
npm run format           # Prettier フォーマット適用
```

#### テスト
```bash
npm test                 # Unit tests (ウォッチモード)
npm run test:run         # Unit tests (一回実行)
npm run test:coverage    # カバレッジ付きテスト
npm run test:ui          # Vitest UI

npm run test:e2e         # E2E tests (Playwright)
npm run test:e2e:ui      # E2E tests (UIモード)
npm run test:e2e:debug   # E2E tests (デバッグモード)
```

#### 特定のテストファイルのみ実行
```bash
# Unit test（単一ファイル）
npx vitest run src/lib/domain/rules/__tests__/VictoryRule.test.ts

# Unit test（ウォッチモード）
npx vitest src/lib/domain/rules/__tests__/VictoryRule.test.ts
```

#### デプロイ
```bash
npm run deploy           # GitHub Pagesへデプロイ
```

### バックエンド（fast-api-server/内で実行）

```bash
# サーバー起動
uv run uvicorn src.main:app --host 0.0.0.0 --reload

# リント・型チェック
uv run poe lint          # ruff format + ruff check + mypy
uv run poe fix           # ruff format + ruff check --fix
uv run poe mypy          # mypy型チェックのみ
```

## トラブルシューティング

### ポート競合
```bash
# 5173ポートが使用中の場合
lsof -ti:5173 | xargs kill -9

# 8000ポートが使用中の場合
lsof -ti:8000 | xargs kill -9
```

### Node modulesの再インストール
```bash
cd skeleton-app
rm -rf node_modules package-lock.json
npm install
```

### Playwright関連エラー
```bash
# ブラウザを再インストール
npx playwright install --with-deps
```

## エディタ設定

### VS Code推奨拡張機能

```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright"
  ]
}
```

### エディタ設定（.vscode/settings.json）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 次のステップ

- [アーキテクチャ概要](../architecture/overview.md)を読む
- [コーディング規約](./conventions.md)を確認する
- [テスト戦略](../architecture/testing-strategy.md)を理解する
