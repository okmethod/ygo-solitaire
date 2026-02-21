# ドメイン知識

「遊戯王のルール」そのものを記述した、フレームワークやライブラリに依存しない **純粋な知識** を整理する。  
また、それらのコードベースとの対応関係と、実装状況を一覧化する。

---

## 📄 ファイル一覧

### ルール概要: [overview.md](./overview.md)

**内容**:

- ゲームルール全体像とコードの対応
- ドメイン実装状況（✅ 完全実装 / 🚧 一部実装 / ⏳ 未実装 / ❌ 実装不要）

### カードモデル: [card-model.md](./card-model.md)

**内容**:

- カード種別（モンスター・魔法・罠）
- カード種別ごとのプロパティ
- カードデータとカード実体の違い
- カードの位置・表示形式

### 効果モデル: [effect-model.md](./effect-model.md)

**内容**:

- CardEffect Interface
- CardEffectRegistry（Strategy Pattern）
- 実装済みカード効果一覧

### ゲーム操作コマンドモデル: [game-command-model.md](./game-command-model.md)

**内容**:

- プレイヤーにより実行可能な行動（召喚、セット、発動、等）
- 各コマンドの実装状況

### チェーンシステム: [chain-system.md](./chain-system.md)

**内容**:

- チェーンの概念（LIFO 処理）
- ChainStack の実装
- チェーン解決の仕組み

### 特殊勝利条件: [victory-conditions.md](./victory-conditions.md)

**内容**:

- ライフポイント切れ・デッキ切れ以外の、各種カードの効果による特殊勝利条件

---

## 📖 読む順序

1. **新規参加者**: まず [overview.md](./overview.md) でルールの全体像と実装状況を把握
2. **実装開始前**: 改修箇所に応じて、各種ドメイン情報のルールを把握
