# ドキュメント目次

このディレクトリには、遊戯王1ターンキルシミュレーターの**ストック情報**（永続的な知識）が整理されています。

## 📚 ドキュメント構成

### 1. ドメイン知識 ([domain/](./domain/))

プロジェクトの背景とゲームルールに関する知識：

- **[遊戯王OCG基本ルール](./domain/yugioh-rules.md)**
  - ユビキタス言語（Zone, Action, Effect等）
  - フェイズシステム（Draw → Standby → Main1 → End）
  - 勝利条件（エクゾディア、ライフポイント）
  - カード種別（Monster, Spell, Trap）

- **[プロジェクトコンセプト](./domain/project-concept.md)**
  - 課題と目的
  - スコープ（やること/やらないこと）
  - MVP定義

### 2. アーキテクチャ ([architecture/](./architecture/))

システムの設計方針と構造：

- **[アーキテクチャ概要](./architecture/overview.md)**
  - Clean Architecture（3層構造）
  - レイヤー構成（Domain/Application/Presentation）
  - データフロー（Unidirectional）
  - 設計原則（不変性、Command Pattern）
  - 技術スタック

- **[テスト戦略](./architecture/testing-strategy.md)**
  - テストピラミッド
  - Unit Tests (204 tests)
  - E2E Tests (16 tests)
  - カバレッジ目標（Domain Layer 80%以上）

### 3. 設計判断記録 ([adr/](./adr/))

重要なアーキテクチャ上の決定を記録（ADR: Architecture Decision Records）：

- **[ADR-0001: Clean Architectureの採用](./adr/0001-adopt-clean-architecture.md)**
  - 3層構造の導入理由
  - レイヤー分離のメリット/デメリット

- **[ADR-0002: Immer.jsによる不変性保証](./adr/0002-use-immer-for-immutability.md)**
  - 不変性が必要な理由
  - Immer.js採用の判断
  - 代替案との比較

- **[ADR-0003: Effect System廃止](./adr/0003-abolish-effect-system.md)**
  - Phase 4スキップの判断
  - Command Patternへの統一
  - 3,839行削除の経緯

### 4. 開発ガイド ([development/](./development/))

開発者向けの実践的なガイド：

- **[開発環境セットアップ](./development/setup.md)**
  - 前提条件
  - クイックスタート
  - よく使用するコマンド
  - トラブルシューティング

- **[コーディング規約](./development/conventions.md)**
  - TypeScript規約
  - Svelte 5規約
  - レイヤー境界のルール
  - テストの書き方
  - Git Commit規約

## 🗂️ ドキュメント分類

### ストック情報 vs フロー情報

このディレクトリは**ストック情報**（永続的な知識）を格納しています：

```
docs/                          # ← ストック情報（永続的）
├── domain/                    # ドメイン知識（変化しにくい）
├── architecture/              # アーキテクチャ方針（長期的）
├── adr/                       # 設計判断の歴史
└── development/               # 開発プラクティス

specs/                         # ← フロー情報（プロジェクト単位）
└── 001-architecture-refactoring/  # 特定のリファクタ作業
    ├── spec.md                # この作業の要件
    ├── plan.md                # この作業の計画
    └── tasks.md               # この作業の進捗
```

## 📖 読み始める順序

### 新規参加者向け

1. **[プロジェクトコンセプト](./domain/project-concept.md)** - プロジェクトの全体像を理解
2. **[開発環境セットアップ](./development/setup.md)** - 環境構築
3. **[アーキテクチャ概要](./architecture/overview.md)** - コードの構造を理解
4. **[コーディング規約](./development/conventions.md)** - 開発ルールを確認

### コントリビューター向け

1. **[遊戯王OCG基本ルール](./domain/yugioh-rules.md)** - ドメイン知識を深める
2. **[ADR](./adr/)** - 過去の設計判断を学ぶ
3. **[テスト戦略](./architecture/testing-strategy.md)** - テストの書き方を理解

## 🔄 ドキュメント更新

### 更新が必要なタイミング

| ドキュメント | 更新タイミング |
|------------|-------------|
| **domain/** | 新しいゲームルールを実装した時 |
| **architecture/** | アーキテクチャを大きく変更した時 |
| **adr/** | 重要な技術的決定をした時 |
| **development/** | 開発手順や規約が変わった時 |

### 新しいADRの追加

重要な設計判断をした場合は、ADRを追加してください：

```bash
# 次の番号を使用
touch docs/adr/0004-new-decision.md
```

ADRテンプレート:
```markdown
# ADR-000X: タイトル

## Status
✅ Accepted / ❌ Rejected / ⏸️ Superseded

## Context
何が問題だったか

## Decision
何を決定したか

## Consequences
### Positive
✅ メリット

### Negative
❌ デメリット
```

## 📚 関連リソース

- **[CLAUDE.md](../CLAUDE.md)**: Claude Codeへの指示書（クイックリファレンス）
- **[README.md](../README.md)**: ユーザー向けプロジェクト説明
- **[specs/](../specs/)**: プロジェクト仕様（フロー情報）

## 🤝 貢献

ドキュメントの改善提案は常に歓迎します！

1. 誤字・脱字を見つけた → 直接修正してPR
2. 説明が不明瞭 → Issue作成または改善案をPR
3. 新しいトピックが必要 → Issueで提案

---

**最終更新**: 2024-11-24
**メンテナー**: @okmethod
