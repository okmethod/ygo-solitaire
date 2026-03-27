# Architecture Decision Records (ADR)

このディレクトリには、プロジェクトの重要な技術的決定を記録した ADR が格納されています。

## ADR の価値

### なぜ ADR が重要か？

1. **意思決定の透明性**: なぜその技術・方針を選んだかの根拠を明確にする
2. **歴史の記録**: 過去の判断を振り返れる
3. **オンボーディング**: 新メンバーが設計思想を理解しやすい
4. **議論の土台**: 変更提案時に過去の判断を参照できる

### ADR の限界

- **実装の詳細**: コードコメントや docstring に記載
- **運用手順**: CLAUDE.md に記載
- **ドメイン知識**: domain/に記載

---

## ADR 一覧

**ADR管理は廃止した**

### 廃止理由

- 1人開発のため、チーム共有・オンボーディング目的の価値が薄い
- 構造変更が頻繁で、ADRがすぐ陳腐化する
- ドキュメント最新断面のメンテナンスで手一杯

### 代替手段

- **設計判断の記録**: git log、コミットメッセージ
- **現在のアーキテクチャ**: [docs/architecture/](../architecture/)
- **ドメイン知識**: [docs/domain/](../domain/)

---

## 関連リソース

- [親ディレクトリ](../) - docs/全体の目次
- [アーキテクチャ概要](../architecture/overview.md) - 現在のアーキテクチャ
- [ADR の提唱者](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Michael Nygard の原文
