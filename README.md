# Yu-Gi-Oh! ソリティア

> ソリティア感覚でプレイする、1人プレイ用の遊戯王ワンターンキル・シミュレーター

## プロジェクト概要

Web ブラウザ上で手軽に遊戯王の「先攻ワンターンキル」に挑戦・練習できるアプリケーション。

- **全盛期ワンキルデッキを体験**: ユーザーはデッキを選ぶだけで、即座にゲームを開始できる
- **壁とやってろ**: 対戦相手はカカシで、気兼ねも思考待ち時間もゼロ
- **スコープ限定**: シチュエーションとカードプールを絞ることで、大量かつ複雑な実装を不要に

詳細なプロジェクトコンセプトは [docs/README.md](docs/README.md) を参照してください。

---

## ディレクトリ構成

```
ygo-solitaire/
├── skeleton-app       # フロントエンド
│
├── docs               # ストック情報（永続的な情報）
│   ├── domain/        # ドメイン知識: ゲームルール
│   └── architecture/  # アーキテクチャ: 技術的な構成・方針
│
└── specs              # フロー情報（spec-kit による作業記録）
```

---

## アーキテクチャ

Clean Architecture（4 層構造）を採用:

```
Domain Layer         : ゲームルール（純粋TypeScript）
Application Layer    : ユースケース（Commands, Stores）
Infrastructure Layer : 外部アクセス（YGOPRODeck API）
Presentation Layer   : UI（Skeleton v4）
```

**技術スタック**:

- **フロントエンド**: Skeleton v4 (Svelte v5 + TailwindCSS v4 + Vite v6)
- **状態管理**: Svelte Stores
- **テスト**: Vitest（Unit tests / Integration tests） + Playwright（E2E tests）

詳細は [docs/architecture/overview.md](docs/architecture/overview.md) を参照してください。

---

## クイックスタート

### 1. 開発環境起動

```bash
# フロントエンドのみ起動
cd skeleton-app
npm install
npm run dev
```

ブラウザでアクセス: http://localhost:5173/

### 2. Docker Compose で起動（フルスタック）

```bash
docker compose up
```

- フロントエンド: http://localhost:5173/

### 3. テスト実行

```bash
cd skeleton-app

npm run lint          # prettier check + eslint
npm run format        # prettier format
npm run check         # svelte-check --tsconfig

npm run test:run      # vitest tests（実行後に自動クリーンアップ）
npm run test:e2e      # playwright tests（実行後に自動クリーンアップ）

```

**注**: テスト実行後、残存するプロセスは自動的にクリーンアップされます（posttestスクリプト）

---

## 🌐 デプロイ

GitHub Pages への静的デプロイ:

```bash
cd skeleton-app
npm run build
npm run deploy
```

**公開 URL**: https://okmethod.github.io/ygo-solitaire/

---

## Claude Code 運用方針

- **CLAUDE.md 運用方針**: 情報密度を（目安: 50 行程度）
  - CLAUDE.md は即座に必要な前提情報（行動原則、プロジェクト概要）のみとする
  - 詳細情報（ドメイン知識、アーキテクチャ、設計意図）は `docs/` へ委譲し、都度読み込む
  - 一般論・一般的なベストプラクティスは書かない（モデルがすでに知っている）

---

**メンテナー**: @okmethod
