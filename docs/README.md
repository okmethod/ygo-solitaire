# ドキュメント目次

このディレクトリには、遊戯王1ターンキルシミュレーターの**ストック情報**（永続的な知識）が整理されています。

## 📚 ドキュメント構成

### 1. [domain/](./domain/) - ドメイン知識

プロジェクトの背景とゲームルールに関する知識。

### 2. [architecture/](./architecture/) - アーキテクチャ

システムの設計方針と構造。

### 3. [adr/](./adr/) - 設計判断記録

重要なアーキテクチャ上の決定を記録（ADR: Architecture Decision Records）。

### 4. [development/](./development/) - 開発ガイド

開発者向けの実践的なガイド。

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

1. [domain/project-concept.md](./domain/project-concept.md) - プロジェクトの全体像を理解
2. [development/setup.md](./development/setup.md) - 環境構築
3. [architecture/overview.md](./architecture/overview.md) - コードの構造を理解
4. [development/conventions.md](./development/conventions.md) - 開発ルールを確認

### コントリビューター向け

1. [domain/yugioh-rules.md](./domain/yugioh-rules.md) - ドメイン知識を深める
2. [adr/](./adr/) - 過去の設計判断を学ぶ
3. [architecture/testing-strategy.md](./architecture/testing-strategy.md) - テストの書き方を理解

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

ADRテンプレート: [adr/README.md](./adr/README.md) を参照

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
