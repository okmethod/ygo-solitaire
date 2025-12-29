# Yu-Gi-Oh! ソリティア

> ソリティア感覚でプレイする、 1 人プレイ用の遊戯王 1 ターンキル・シミュレーター

## 🎮 プロジェクト概要

Web ブラウザ上で手軽に遊戯王の「先攻 1 ターンキル」に挑戦・練習できるアプリケーション。

- ユーザーはデッキを選ぶだけで、即座にゲームを開始できる
- 対戦相手はカカシで、気兼ねも思考待ち時間もゼロ
- カードプールを絞ることで、大量かつ複雑な実装は不要

詳細なプロジェクトコンセプトは [docs/README.md](docs/README.md) を参照してください。

---

## 📚 ディレクトリ構成

```
ygo-solitaire/
├── skeleton-app       # フロントエンド
│
├── docs               # ストック情報（永続的な情報）
│   ├── domain/        # ドメイン知識: ゲームルール
│   ├── architecture/  # アーキテクチャ: 技術的な構成・方針
│   └── adr/           # ADR: 設計判断の記録
│
└── specs              # フロー情報（spec-kit による作業記録）
```

---

## 🏗️ アーキテクチャ

Clean Architecture（4 層構造）を採用:

```
Domain Layer         : ゲームルール（純粋TypeScript）
Application Layer    : ユースケース（Commands, Stores）
Infrastructure Layer : 外部アクセス（YGOPRODeck API）
Presentation Layer   : UI（Skeleton v3）
```

**技術スタック**:

- **フロントエンド**: Skeleton v3 (Svelte v5 + TailwindCSS v4 + Skeleton UI v3)
- **状態管理**: Svelte Stores + Immer.js（不変性保証）
- **テスト**: Vitest（Unit tests / Integration tests） + Playwright（E2E tests）

詳細は [docs/architecture/overview.md](docs/architecture/overview.md) を参照してください。

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

### 2. Docker Compose で起動（フルスタック）

```bash
docker compose up
```

- フロントエンド: http://localhost:5173/

### 3. テスト実行

```bash
cd skeleton-app
npm run test:run      # Unit tests（実行後に自動クリーンアップ）
npm run test:e2e      # E2E tests（実行後に自動クリーンアップ）
npm run lint          # Linter check
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

**メンテナー**: @okmethod
