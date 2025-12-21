# アーキテクチャ

このディレクトリには、システムの設計方針と構造に関するドキュメントが格納されています。

## 📄 ファイル一覧

### [overview.md](./overview.md)

Clean Architecture の概要と設計原則

**内容**:

- 4 層構造（Domain/Application/Infrastructure/Presentation）
- レイヤー構成と依存関係
- データフロー（Unidirectional）
- デザインパターン（Command、Strategy、Port/Adapter 等）
- ディレクトリ構造

**読むべき人**: 全開発者（必読）

---

### [data-model-design.md](./data-model-design.md)

データモデル設計と API 統合

**内容**:

- 3 層データモデル（DomainCardData/CardDisplayData）
- レイヤー別のデータ構造と責務
- YGOPRODeck API 統合とキャッシング戦略
- データ変換フロー

**読むべき人**: データモデル設計者、API 統合担当者

---

### [testing-strategy.md](./testing-strategy.md)

テスト戦略と実装方法

**内容**:

- テストピラミッド（Unit/Integration/E2E）
- Vitest テスト（Unit + Integration）
- Playwright テスト（E2E）
- カバレッジ目標（Domain Layer 80%以上）
- テスト実行フロー

**読むべき人**: 実装者、レビュアー

---

## 🎯 このディレクトリの目的

「どのように実装するか」を記述した、**技術的な設計方針**。

## 📖 読む順序

1. **実装開始前**: まず [overview.md](./overview.md) でレイヤー構成と設計原則を理解
2. **データモデル設計時**: [data-model-design.md](./data-model-design.md) で 3 層データモデルと API 統合を確認
3. **テスト実装前**: [testing-strategy.md](./testing-strategy.md) でテストの書き方とカバレッジ目標を確認
