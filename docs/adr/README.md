# Architecture Decision Records (ADR)

このディレクトリには、プロジェクトの重要な技術的決定を記録したADRが格納されています。

## ADR一覧

### 0001: Clean Architectureの採用
**Status**: ✅ Accepted (2024-11-23)

**決定内容**: 3層Clean Architecture（Domain/Application/Presentation）を採用

**理由**:
- テスト容易性向上
- 変更への強さ
- 責任の明確化

詳細: [0001-adopt-clean-architecture.md](./0001-adopt-clean-architecture.md)

---

### 0002: Immer.jsによる不変性保証
**Status**: ✅ Accepted (2024-11-23)

**決定内容**: Immer.jsを使用してGameStateの不変性を保証

**理由**:
- 直感的な書き方でイミュータブルな結果
- Structural Sharingによるパフォーマンス最適化
- TypeScript `readonly`との併用で型安全性

詳細: [0002-use-immer-for-immutability.md](./0002-use-immer-for-immutability.md)

---

### 0003: Effect System廃止
**Status**: ✅ Accepted (2024-11-24)

**決定内容**: Phase 4をスキップし、Effect SystemをCommand Patternに統一

**理由**:
- Command Patternで十分な機能カバー
- 3,839行のコード削減
- 設計のシンプル化

**影響**: 旧DuelState + Effect System（24ファイル）を完全削除

詳細: [0003-abolish-effect-system.md](./0003-abolish-effect-system.md)

---

### 0004: データモデルのレイヤー分離
**Status**: ✅ Accepted (2024-11-29)

**決定内容**: 3層のカード型定義（DomainCardData / CardDisplayData / YGOProDeckCard）

**理由**:
- レイヤー間の責務分離
- テスト容易性向上（ネットワーク不要）
- 数値IDへの統一（文字列ID排除）

**影響**: API統合とキャッシング戦略、段階的移行パス

詳細: [0004-data-model-layer-separation.md](./0004-data-model-layer-separation.md)

---

### 0005: Card Effect ArchitectureにStrategy Pattern採用
**Status**: ✅ Accepted (2024-12-07)

**決定内容**: Strategy PatternとRegistry Patternでカード効果を実装

**理由**:
- Open/Closed Principle遵守
- カード追加時にActivateSpellCommandの変更不要
- テスト容易性とコードの再利用性向上

**影響**: CardEffect階層構造、CardEffectRegistry導入

詳細: [0005-card-effect-strategy-pattern.md](./0005-card-effect-strategy-pattern.md)

---

## ADRの書き方

### ADRテンプレート

```markdown
# ADR-000X: タイトル

## Status
✅ Accepted / ❌ Rejected / ⏸️ Superseded / 🤔 Proposed

## Context
何が問題だったか？なぜこの決定が必要だったか？

## Decision
何を決定したか？具体的な実装方針は？

## Consequences

### Positive
✅ メリット1
✅ メリット2

### Negative
❌ デメリット1
❌ デメリット2

### Neutral
⚖️ トレードオフ

## Alternatives Considered
検討した代替案とその却下理由

## Implementation Notes
実装時の注意点やコード例

## Related Documents
関連するドキュメントへのリンク

## References
- 関連PR/Issue
- 外部リソース
```

### 命名規則

```
0001-adopt-clean-architecture.md
0002-use-immer-for-immutability.md
0003-abolish-effect-system.md
^^^^
4桁の連番
```

### いつADRを書くか？

以下の場合にADRを作成してください：

✅ **アーキテクチャの大きな変更**
- 例: Clean Architecture導入、レイヤー構成変更

✅ **技術スタック選定**
- 例: Immer.js採用、テストフレームワーク選定

✅ **設計パターンの採用/廃止**
- 例: Effect System廃止、Command Pattern統一

✅ **パフォーマンス最適化の方針**
- 例: 仮想スクロール導入、メモ化戦略

❌ **軽微な実装の詳細**
- 例: 変数名変更、関数の分割

❌ **バグ修正**
- 例: 型エラー修正、ロジック修正（ADRではなくコミットメッセージに記載）

### ステータスの意味

| Status | 説明 | 使用例 |
|--------|------|--------|
| 🤔 **Proposed** | 提案中（レビュー待ち） | PR作成前の議論段階 |
| ✅ **Accepted** | 承認済み（実装済み） | マージ後 |
| ❌ **Rejected** | 却下された | 代替案が採用された場合 |
| ⏸️ **Superseded** | 別のADRに置き換えられた | ADR-0005がADR-0002を上書き |

## 既存ADRの更新

### 状況が変わった場合

既存ADRは**編集せず**、新しいADRを作成してください：

```markdown
# ADR-0005: Immer.js廃止とImmutable.js採用

## Status
✅ Accepted

## Context
ADR-0002でImmer.jsを採用したが、パフォーマンス問題が発生...

## Related Documents
- Supersedes: [ADR-0002](./0002-use-immer-for-immutability.md)
```

旧ADRには以下を追記：

```markdown
# ADR-0002: Immer.jsによる不変性保証

## Status
⏸️ Superseded by [ADR-0005](./0005-adopt-immutable-js.md)
```

## ADRの価値

### なぜADRが重要か？

1. **意思決定の透明性**: なぜその技術を選んだかが明確
2. **歴史の記録**: 過去の判断を振り返れる
3. **オンボーディング**: 新メンバーが設計思想を理解しやすい
4. **議論の土台**: 変更提案時に過去の判断を参照できる

### ADRの限界

- **実装の詳細**: コードコメントやdocstringに記載
- **運用手順**: CLAUDE.mdに記載
- **ドメイン知識**: domain/に記載

## 関連リソース

- [親ディレクトリ](../) - docs/全体の目次
- [アーキテクチャ概要](../architecture/overview.md) - 現在のアーキテクチャ
- [ADRの提唱者](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Michael Nygardの原文
