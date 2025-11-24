# アーキテクチャ

このディレクトリには、システムの設計方針と構造に関するドキュメントが格納されています。

## 📄 ファイル一覧

### [overview.md](./overview.md)
Clean Architectureの概要と設計原則

**内容**:
- Clean Architecture（3層構造）
- レイヤー構成（Domain/Application/Presentation）
- データフロー（Unidirectional）
- 設計原則（不変性、Command Pattern）
- ファイル構造
- 技術スタック

**読むべき人**: 全開発者（必読）

---

### [testing-strategy.md](./testing-strategy.md)
テスト戦略と実装方法

**内容**:
- テストピラミッド
- Unit Tests（204 tests）
- Integration Tests
- E2E Tests（16 tests）
- カバレッジ目標（Domain Layer 80%以上）
- テスト実行フロー

**読むべき人**: 実装者、レビュアー

---

## 🎯 このディレクトリの目的

「どのように実装するか」を記述した、**技術的な設計方針**。

## 📖 読む順序

1. **実装開始前**: まず [overview.md](./overview.md) でレイヤー構成と設計原則を理解
2. **テスト実装前**: 次に [testing-strategy.md](./testing-strategy.md) でテストの書き方とカバレッジ目標を確認
