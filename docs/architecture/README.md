# アーキテクチャ

どのようにな構造で実装するかを記述した、**技術的な設計方針** を整理する。

---

## 📄 ファイル一覧

### アーキテクチャ概要: [overview.md](./overview.md)

**内容**:

- 4 層構造（Domain/Application/Infrastructure/Presentation）
- レイヤー構成と依存関係
- データフロー（Unidirectional）
- デザインパターン（Command、Strategy、Port/Adapter 等）
- ディレクトリ構造

### Card モデル設計: [card-model-design.md](./card-model-design.md)

**内容**:

- 主要データモデル（CardData/ExternalCardData/DisplayCardData）
- レイヤー別のデータ構造と責務
- YGOPRODeck API 統合とキャッシング戦略
- データ変換フロー

### Effect モデル設計: [effect-model-design.md](./effect-model-design.md)

**内容**:

- 3 層構造（Domain/Application/Presentation）
- Atomic Step による効果処理ステップの定義と再利用
- 発動する効果・適用する効果のモデルと実装
- 効果処理キュー（effectQueueStore）による非同期処理制御

### カード定義 DSL 設計: [card-definition-dsl-design.md](./card-definition-dsl-design.md)

**内容**:

- DSL（YAML）によるカードデータ・効果の一元定義
- ConditionChecker / AtomicStep / 効果ファクトリの組み合わせモデル
- エラッタ前バージョンの量産方針
- 既存の AtomicStep・BaseSpellActivation の再利用戦略

### TypeScript コメント規約: [typescript-comment-guide.md](./typescript-comment-guide.md)

**内容**:

- コメントの目的・粒度の考え方（根幹 vs 枝葉）
- JSDoc の書き方と省略ルール
- 良い例 / 悪い例

### テスト戦略: [testing-strategy.md](./testing-strategy.md)

**内容**:

- テストピラミッド（Unit/Integration/E2E）
- Vitest テスト（Unit + Integration）
- Playwright テスト（E2E）
- カバレッジ目標（ドメイン層 80%以上）
- テスト実行フロー

---

## 📖 読む順序

1. **実装開始前**: まず [overview.md](./overview.md) でレイヤー構成と設計原則を理解
2. **実装開始前**: 改修箇所に応じて、各種設計ドキュメントを確認
