# ドメイン知識

このディレクトリには、プロジェクトの背景とゲームルールに関する永続的な知識が格納されています。

## 📄 ファイル一覧

### [project-concept.md](./project-concept.md)
プロジェクトの全体像とコンセプト

**内容**:
- 課題と目的（なぜ作るのか）
- コンセプト（詰将棋のようなTCGシミュレーター）
- スコープ（やること/やらないこと）
- MVP定義

**読むべき人**: 全員（最初に読むドキュメント）

---

### [yugioh-rules.md](./yugioh-rules.md)
遊戯王OCGの基本ルール

**内容**:
- ユビキタス言語（Zone, Action, Effect等）
- フェイズシステム（Draw → Standby → Main1 → End）
- 勝利条件（エクゾディア、ライフポイント）
- カード種別（Monster, Spell, Trap）
- アクター（Player, System）

**読むべき人**: 開発者、レビュアー

---

## 🎯 このディレクトリの目的

### ドメイン知識とは？

「遊戯王のルール」そのものを記述した、フレームワークやライブラリに依存しない**純粋な知識**。

### 技術ドキュメントとの違い

| 種類 | 場所 | 例 |
|------|------|---|
| **ドメイン知識** | `domain/` | "ドローフェイズでカードを1枚引く" |
| **技術実装** | `architecture/` | "DrawCardCommandでImmer.jsを使う" |
| **実装詳細** | コード | `GameState.zones.deck.shift()` |

## 📖 読む順序

### 1. 新規参加者

まず[project-concept.md](./project-concept.md)を読んでください：
- プロジェクトの目的を理解
- スコープ（やること/やらないこと）を把握
- MVPの範囲を確認

### 2. 実装開始前

次に[yugioh-rules.md](./yugioh-rules.md)を読んでください：
- ドメイン用語を学習
- ゲームルールを理解
- コード内の命名規則を把握

## 🔄 更新タイミング

### いつ更新すべきか？

✅ **新しいゲームルールを実装する時**
- 例: チェーンシステムを追加 → yugioh-rules.mdに「チェーン」セクション追加

✅ **スコープが変更された時**
- 例: バトルフェイズを実装することになった → project-concept.mdの「やらないこと」から削除

✅ **新しい勝利条件を追加した時**
- 例: デッキ切れ勝利を実装 → yugioh-rules.mdに追加

❌ **実装の詳細が変わった時**
- 例: DrawCardCommandの実装方法が変わった → domain/は変更不要

## 📝 ドキュメント追加ガイド

### 新しいファイルを追加する場合

```bash
# 例: カード効果の詳細ルールを追加
touch docs/domain/card-effects.md
```

追加後、このREADME.mdの「ファイル一覧」セクションを更新してください。

### 推奨される追加トピック

将来的に以下のドキュメントを追加する可能性があります：

- `card-types-detail.md`: カード種別の詳細（効果モンスター、装備魔法等）
- `chain-system.md`: チェーンシステムの詳細ルール
- `summon-rules.md`: 召喚ルールの詳細（通常召喚、特殊召喚等）
- `glossary.md`: 用語集

## 🔗 関連ドキュメント

- [親ディレクトリ](../) - docs/全体の目次
- [architecture/](../architecture/) - 技術アーキテクチャ
- [CLAUDE.md](../../CLAUDE.md) - クイックリファレンス

## 📚 外部リソース

- [遊戯王OCG公式ルール](https://www.yugioh-card.com/japan/howto/)
- [遊戯王カードデータベース](https://www.db.yugioh-card.com/)
