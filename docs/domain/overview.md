# ドメイン実装概要

プロジェクトのスコープと実装状況のマッピング。

## スコープ定義

### ✅ やること (In Scope)

| 機能 | 説明 | 実装状況 |
|------|------|---------|
| **デッキ選択** | あらかじめ定義されたデッキから選択 | ✅ 完全実装 |
| **先攻1ターン目シミュレーション** | Draw → Standby → Main1 → End | ✅ 完全実装 |
| **エクゾディア勝利判定** | 5パーツが手札に揃う | ✅ 完全実装 |
| **ライフポイント勝利判定** | 相手ライフ0 | ⏳ 未実装（枠組みのみ） |
| **基本ルール処理** | カード発動、ドロー、墓地送り | ✅ 基本実装 |
| **プリセットカード** | 選択可能なデッキのカードのみ | ✅ 一部実装 |

### ❌ やらないこと (Out of Scope)

| 機能 | 理由 |
|------|------|
| **デッキ構築機能** | 複雑度爆発の防止 |
| **後攻・対戦相手のAI** | 先攻1ターン目限定 |
| **バトルフェイズ** | 先攻1ターン目は攻撃不可 |
| **完全なルール網羅** | MVP範囲外のレアケース |
| **サーバーサイド** | 完全クライアントサイド |

## ドメイン実装状況

### 🎮 ゲームフロー

#### フェーズシステム
**ドキュメント**: [yugioh-rules.md - フェーズシステム](./yugioh-rules.md#フェーズシステム)

| フェーズ | 実装状況 | 実装箇所 | 備考 |
|---------|---------|---------|------|
| **Draw Phase** | ✅ 完全実装 | `PhaseRule.ts` | 先攻1T目はドローしない |
| **Standby Phase** | ✅ 完全実装 | `PhaseRule.ts` | スキップ可能 |
| **Main Phase 1** | ✅ 完全実装 | `PhaseRule.ts` | カード発動可能 |
| **End Phase** | ✅ 完全実装 | `PhaseRule.ts` | ゲーム終了 |

**コマンド**: `AdvancePhaseCommand`

---

#### 勝利条件
**ドキュメント**: [yugioh-rules.md - 勝利条件](./yugioh-rules.md#勝利条件)

| 勝利条件 | 実装状況 | 実装箇所 | 備考 |
|---------|---------|---------|------|
| **エクゾディア勝利** | ✅ 完全実装 | `VictoryRule.checkExodiaVictory()` | 5パーツ判定 |
| **ライフポイント勝利** | ⏳ 枠組みのみ | `VictoryRule.checkLifePointVictory()` | 常に`null`を返す |

**派生Store**: `exodiaPieceCount`, `gameResult`

---

### 🃏 カードシステム

#### カード種別
**ドキュメント**: [yugioh-rules.md - カード種別](./yugioh-rules.md#カード種別)

| カード種別 | 実装状況 | 実装箇所 | 備考 |
|-----------|---------|---------|------|
| **Monster** | ✅ データのみ | `Card` type | エクゾディアパーツのみ |
| **Spell (Normal)** | ✅ 基本実装 | `ActivateSpellCommand` | 通常魔法のみ |
| **Trap** | ❌ 未実装 | - | スコープ外 |

---

#### カードアクション
**ドキュメント**: [yugioh-rules.md - 行動 (Action)](./yugioh-rules.md#行動-action)

| アクション | 実装状況 | 実装箇所 | 備考 |
|-----------|---------|---------|------|
| **Draw** | ✅ 完全実装 | `DrawCardCommand` | デッキ→手札 |
| **Activate (Spell)** | ✅ 基本実装 | `ActivateSpellCommand` | 通常魔法のみ |
| **Summon** | ❌ 未実装 | - | MVP範囲外 |
| **Set** | ❌ 未実装 | - | MVP範囲外 |
| **Release** | ❌ 未実装 | - | MVP範囲外 |

---

#### カード発動ルール
**ドキュメント**: [yugioh-rules.md - カード種別](./yugioh-rules.md#カード種別)

| ルール | 実装状況 | 実装箇所 |
|--------|---------|---------|
| **発動可能フェーズ判定** | ✅ 完全実装 | `SpellActivationRule` |
| **発動後の墓地送り** | ✅ 完全実装 | `ActivateSpellCommand` |
| **コスト処理** | ❌ 未実装 | - |
| **対象選択** | ❌ 未実装 | - |

---

### 🗂️ ゾーン管理

#### 領域 (Zone)
**ドキュメント**: [yugioh-rules.md - 領域 (Zone)](./yugioh-rules.md#領域-zone)

| Zone | 実装状況 | GameState定義 | 操作 |
|------|---------|--------------|------|
| **Deck** | ✅ 完全実装 | `zones.deck` | DrawCommand |
| **Hand** | ✅ 完全実装 | `zones.hand` | DrawCommand, ActivateSpellCommand |
| **Field** | ✅ 基本実装 | `zones.field` | カード配置は未使用 |
| **Graveyard** | ✅ 完全実装 | `zones.graveyard` | ActivateSpellCommand |
| **Banishment** | ⏳ 定義のみ | - | 未使用 |

---

## MVP (Minimum Viable Product)

### ✅ 実装済み

- **デッキ**: 「封印されしエクゾディア」デッキ 1種
- **機能**:
  - 手札からの魔法発動
  - ドロー
  - エクゾディア勝利判定
- **UI**: カードをクリックでプレイできる最低限の画面

### 🚧 次の拡張候補

1. **ライフポイント勝利の実装**
   - バーンダメージ処理
   - ライフポイント管理

2. **新しいデッキ追加**
   - バーンデッキ
   - 特殊召喚デッキ

3. **モンスター召喚**
   - 通常召喚の実装
   - フィールド配置

4. **チェーンシステム**
   - LIFO処理
   - チェーンブロック

## 実装とドメイン知識のマッピング

### ドメイン知識 → コード対応表

| ドメイン概念 | ドキュメント | 実装クラス/ファイル |
|------------|------------|------------------|
| **GameState** | [yugioh-rules.md](./yugioh-rules.md) | `domain/models/GameState.ts` |
| **Phase** | [yugioh-rules.md - フェーズシステム](./yugioh-rules.md#フェーズシステム) | `domain/models/Phase.ts` |
| **Victory Conditions** | [yugioh-rules.md - 勝利条件](./yugioh-rules.md#勝利条件) | `domain/rules/VictoryRule.ts` |
| **Card Zones** | [yugioh-rules.md - 領域](./yugioh-rules.md#領域-zone) | `GameState.zones` |
| **Card Actions** | [yugioh-rules.md - 行動](./yugioh-rules.md#行動-action) | `application/commands/` |

### コード → ドメイン知識の参照

新しい機能を実装する際は、以下の順序で参照：

1. **[yugioh-rules.md](./yugioh-rules.md)** でドメインルールを確認
2. **この overview.md** で実装状況を確認
3. **[architecture/overview.md](../architecture/overview.md)** で実装方針を確認
4. 実装開始

## 更新ガイド

### このファイルを更新するタイミング

✅ **新しい機能を実装した時**
```markdown
# Before
| **ライフポイント勝利** | ⏳ 枠組みのみ | ...

# After
| **ライフポイント勝利** | ✅ 完全実装 | `VictoryRule.checkLifePointVictory()` | バーンダメージ対応 |
```

✅ **スコープが変更された時**
```markdown
# "やらないこと"から"やること"に移動
```

✅ **新しいドメイン知識を文書化した時**
```markdown
# 新しいセクション追加
#### チェーンシステム
**ドキュメント**: [chain-system.md](./chain-system.md)
```

### 関連ファイルの更新

このファイルを更新した際は、以下も確認：

- [ ] [domain/README.md](./README.md) - ファイル一覧の更新
- [ ] [yugioh-rules.md](./yugioh-rules.md) - ルール定義の追加/更新
- [ ] [architecture/overview.md](../architecture/overview.md) - 実装方針の追加

## 関連ドキュメント

- [親ディレクトリ](../) - docs/全体の目次
- [yugioh-rules.md](./yugioh-rules.md) - 遊戯王OCG基本ルール
- [architecture/overview.md](../architecture/overview.md) - 技術アーキテクチャ
- [specs/001-architecture-refactoring/](../../specs/001-architecture-refactoring/) - リファクタリング記録
