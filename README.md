# Yu-Gi-Oh! ソリティア

> 「詰将棋」のような感覚でプレイする、遊戯王1ターンキル・シミュレーター

## 🎮 プロジェクト概要

Webブラウザ上で手軽に遊戯王の「先攻1ターンキル」を挑戦・練習できるアプリケーション。

- あらかじめ用意されたデッキを選択
- 先攻1ターン目をプレイし、勝利条件（エクゾディア勝利等）を目指す
- 対戦相手はカカシ（気兼ねも思考待ち時間もゼロ）

詳細なプロジェクトコンセプトは [docs/README.md](docs/README.md) を参照してください。

## 🏗️ アーキテクチャ

Clean Architecture（3層構造）を採用：

```
Domain Layer     → ゲームルール（純粋TypeScript）
Application Layer → ユースケース（Commands, Stores）
Presentation Layer → UI（Svelte 5 + Skeleton UI）
```

**技術スタック**:
- **フロントエンド**: SvelteKit + Svelte 5 + Skeleton UI + TailwindCSS
- **状態管理**: Svelte Stores + Immer.js（不変性保証）
- **テスト**: Vitest（204 tests） + Playwright（16 E2E tests）
- **バックエンド**: FastAPI + Python（オプション）

詳細は [docs/architecture/overview.md](docs/architecture/overview.md) を参照してください。

## 📚 ドキュメント

プロジェクトの詳細なドキュメントは [docs/](docs/) に整理されています：

- **[docs/README.md](docs/README.md)**: ドキュメント目次とプロジェクトコンセプト
- **[docs/domain/](docs/domain/)**: 遊戯王ルールとスコープ管理
- **[docs/architecture/](docs/architecture/)**: アーキテクチャ設計とテスト戦略
- **[docs/development/](docs/development/)**: 開発環境セットアップとコーディング規約
- **[docs/adr/](docs/adr/)**: 設計判断記録（ADR）

---

## 🚀 クイックスタート

### 1. 開発環境起動

```bash
# フロントエンドのみ起動
cd skeleton-app
npm install
npm run dev
```

ブラウザでアクセス: http://localhost:5173/

### 2. Docker Composeで起動（フルスタック）

```bash
docker compose up
```

- フロントエンド: http://localhost:5173/
- バックエンドAPI: http://localhost:8000/

### 3. テスト実行

```bash
cd skeleton-app
npm run test:run      # Unit tests (204 tests)
npm run test:e2e      # E2E tests (16 tests)
npm run lint          # Linter check
```

詳細な開発手順は [docs/development/setup.md](docs/development/setup.md) を参照してください。

---

## 🌐 デプロイ

GitHub Pagesへの静的デプロイ：

```bash
cd skeleton-app
npm run build
npm run deploy
```

**公開URL**: https://okmethod.github.io/ygo-solitaire/

---

## 🤝 コントリビューション

コントリビューション歓迎！以下を参照してください：

- [開発環境セットアップ](docs/development/setup.md)
- [コーディング規約](docs/development/conventions.md)
- [アーキテクチャ概要](docs/architecture/overview.md)

---

**メンテナー**: @okmethod
