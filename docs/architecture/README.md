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

- CardData（1種類のカード）と CardInstance（1枚のカード）の分離モデル
- カードレジストリによる一元管理と YGOPRODeck API 統合
- レイヤー間のデータ変換フロー（内部データ・外部データ・表示用データ）

### Effect モデル設計: [effect-model-design.md](./effect-model-design.md)

**内容**:

- 発動する効果・適用する効果のモデルと実装
- Atomic Step による効果処理ステップの定義と再利用
- 効果処理キューストアによるキュー処理・チェーン管理・イベント割り込み制御

### カード定義 DSL 設計: [card-definition-dsl-design.md](./card-definition-dsl-design.md)

**内容**:

- DSL（YAML）によるカードデータ・効果の一元定義
- 条件チェック・処理ステップ・効果クラスファクトリの組み合わせモデル
- 新たなカードを DSL で追加実装する際の流れ

### Duel Copilot 設計: [duel-copilot-design.md](./duel-copilot-design.md)

**内容**:

- ゲーム状態・デッキ情報・カード情報を LLM プロンプトに変換する仕組み
- Clean Architecture における依存関係（Port/Adapter パターン）
- サービス層の責務とメソッド
- 今後の拡張アイデア

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
