# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ALWAYS YOU MUST:
- 回答は日本語で行ってください。
- TODO にはブランチ作成・実装内容のテスト・コミット・push・PR作成（まだ作成されていない場合）が含めてください。
- **タスクID（T0xxなど）の使用ルール**:
  - **基本方針**: 実装中は書く → 完了後に削除する
    - 実装中: タスクIDをコメントに記載して作業効率を上げる
    - 実装完了時: ストック情報からタスクIDを機械的に削除する
  - **フロー情報**（`specs/*/tasks.md`）: タスクIDを使用（一時的な作業管理）
  - **ストック情報**（ソースコード、`docs/`）: タスクIDを記載しない（最終的に削除）
  - **コミットメッセージ**: タスクIDを含めても良い（履歴として有用、git blameで追跡可能）
  - **削除タイミング**: 機能実装完了後、Grep + Editで`T0\d{2}`パターンを削除
  - **理由**: 実装中の作業効率（tasks.mdとコードの明確な対応）を優先しつつ、最終的なコード品質も維持

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
  - [data-model-design.md](docs/architecture/data-model-design.md): データモデル設計 ⭐
    - 3層データモデル（DomainCardData / CardDisplayData）
    - YGOPRODeck API統合とキャッシング戦略
    - 型の互換性と段階的移行パス
  - [migration-strategy.md](docs/architecture/migration-strategy.md): GameState/Rules 段階的移行戦略
    - 文字列ID → 数値ID移行（T023-T025）
    - ファイル単位の段階的移行計画
    - リスク管理とテスト戦略
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

### Clean Architecture (4層構造)

```
Domain Layer (不変・純粋)
  ↓ 依存
Application Layer (Command Pattern)
  ↓ 依存
Infrastructure Layer (Port/Adapter Pattern)
  ↓ 依存
Presentation Layer (Svelte 5 Runes)
```

### データモデル設計 (重要)

**3層データモデル構造**（詳細: [docs/architecture/data-model-design.md](docs/architecture/data-model-design.md)）:

```
┌─────────────────────────────────────────┐
│     Presentation Layer                  │
│  CardDisplayData (UI表示用完全データ)    │
│  - 全プロパティ (name, images, etc.)     │
└─────────────────────────────────────────┘
              ▲
              │ convertToCardDisplayData()
              │
┌─────────────────────────────────────────┐
│     Application Layer                   │
│  YGOPRODeck API統合・データ変換         │
│  - getCardsByIds() (バッチ+キャッシュ)   │
└─────────────────────────────────────────┘
              ▲
              │ API Response
              │
┌─────────────────────────────────────────┐
│     Domain Layer                        │
│  DomainCardData (ゲームロジック用)       │
│  - id: number, type, frameType のみ     │
└─────────────────────────────────────────┘
```

**重要な型定義**:
- **`DomainCardData`**: ゲームロジック用最小データ (`src/lib/domain/models/Card.ts`)
  ```typescript
  interface DomainCardData {
    id: number;              // YGOPRODeck API互換
    type: SimpleCardType;    // "monster" | "spell" | "trap"
    frameType?: string;
  }
  ```

- **`CardDisplayData`**: UI表示用完全データ (`src/lib/types/card.ts`)
  ```typescript
  interface CardDisplayData {
    id: number;
    name: string;
    type: CardType;
    description: string;
    monsterAttributes?: MonsterAttributes;
    images?: CardImages;
    // ... 他の表示用プロパティ
  }
  ```

**データ変換フロー**:
```
YGOPRODeck API → YGOProDeckCard → convertToCardDisplayData() → CardDisplayData
```

**API最適化**:
- **バッチリクエスト**: `getCardsByIds([id1, id2, ...])` で複数カードを一度に取得
- **メモリキャッシュ**: セッション単位でカードデータをキャッシュ（重複リクエスト防止）

### 設計原則

1. **不変性**: Immer.jsで状態を不変更新
2. **Command Pattern**: すべての操作をCommandクラスで実装
3. **単方向データフロー**: User Action → Command → State Update → Re-render
4. **レイヤー境界遵守**: Domain LayerにSvelte依存コードを書かない
5. **データ分離**: Domain層は最小データ、Presentation層は完全データ

### ディレクトリ構造

```
skeleton-app/src/lib/
├── domain/            # ゲームルール（純粋TypeScript）
│   ├── models/        # DomainCardData, GameState
│   ├── rules/         # SpellActivationRule, VictoryRule等
│   └── effects/       # CardEffect, NormalSpellEffect等
├── application/       # ユースケース（Commands, Stores, Facade）
│   ├── commands/      # DrawCardCommand, ActivateSpellCommand等
│   ├── stores/        # gameStateStore, cardDisplayStore等
│   ├── ports/         # ICardDataRepository（Port Interface）
│   └── types/         # CardDisplayData, DeckRecipe（Application DTOs）
├── infrastructure/    # 外部システム統合
│   ├── api/           # YGOPRODeck API統合
│   ├── adapters/      # YGOProDeckCardRepository（Adapter実装）
│   └── types/         # YGOProDeckCard（外部API型）
└── presentation/      # UI層
    ├── components/    # Svelte 5コンポーネント
    ├── stores/        # cardSelectionStore, theme等（UI状態）
    ├── types/         # UI型（型エイリアス）
    ├── constants/     # UI定数
    └── utils/         # UI utilities
```

**詳細**:
- アーキテクチャ全体: [docs/architecture/overview.md](docs/architecture/overview.md)
- データモデル設計: [docs/architecture/data-model-design.md](docs/architecture/data-model-design.md)

## 開発時の注意事項
- フロントエンドのスタイルは可能な限り TailwindCSS を使用する
- Svelte 5 のルーン（`$state`, `$derived`, `$effect` など）を活用する
- バックエンドのリクエスト/レスポンススキーマにはPydanticモデルを使う
- APIのCORS設定は `fast-api-server/src/main.py` で管理
- 環境変数は `compose.yaml` の environment セクションで設定
- **不変性保持**: すべての状態更新はImmer.jsの`produce()`を使用する
- **レイヤー境界**: Domain LayerにSvelte依存コードを書かない

## Recent Changes
- 006-ux-automation (2024-12-20): UX改善（自動フェーズ進行・デッキシャッフル・自動勝利判定）実装完了
  - デッキシャッフル機能（ShuffleDeckCommand, Fisher-Yates algorithm）
  - 自動フェーズ進行（Draw→Standby→Main Phase 1）
  - 自動勝利判定（カード効果解決後・フェーズ移行後）
  - 不要なUIボタン削除（Draw Card, Advance Phase, Check Victory → Debug Infoセクションに移動）
  - フェーズ名を英語に統一（文字エンコーディング問題解消）
  - E2E テスト整備（playwright.config.ts環境変数設定、auto-phase progression test）
  - 334/334 unit tests passing, 2/2 E2E tests passing
- 005-4-layer-clean-arch (2024-12-15): 4層Clean Architectureへのリファクタリング完了
  - 4層構造化（Domain/Application/Infrastructure/Presentation）
  - Port/Adapterパターン導入（ICardDataRepository, YGOProDeckCardRepository）
  - レイヤー依存関係是正（Application/Infrastructure→Presentation依存ゼロ）
  - Stores配置統一（Application/Presentation層に責任分離）
  - 型定義のレイヤー分離（Application/Infrastructure/Presentation）
  - ドキュメント整備（overview.md, data-model-design.md簡素化）
  - 312/312 tests passing
- 005-documentation-update (2024-12-09): ストック情報整備
  - domain/overview.md: 実装状況更新（Trap/Effect System/Domain DB）
  - architecture/data-model-design.md: Domain Layer Card Database セクション追加
  - adr/0003: Effect System再導入（ADR-0005）との関係性を明記
- PR#50 (2024-12-08): 罠カード判定をDomain Layerに移行
  - SpellActivationRule: 罠カード手札発動禁止ルールを実装
  - cardDatabase.ts: Jar of Greed (trap) 定義追加
  - 246/246 tests passing
  - ADR-0005: Card Effect Strategy Pattern採用記録
  - CardEffect interface, CardEffectRegistry, NormalSpellEffect 実装
  - PotOfGreedEffect, GracefulCharityEffect 実装
  - Clean Architecture遵守（Effect SystemをDomain Layer配置）
  - YGOPRODeck API統合によるカード画像表示
  - Effect Resolution Modal, Card Selection Modal 実装
  - E2E テスト追加（effect-activation-ui.spec.ts）
  - YGOPRODeck API統合とキャッシング機能追加
  - 239/239 tests passing
  - アーキテクチャドキュメント整備（docs/architecture/data-model-design.md）

## Active Technologies
