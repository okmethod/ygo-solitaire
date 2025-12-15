# ドメイン実装概要

プロジェクトのスコープと実装状況のマッピング。

---

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

---

## ドメイン実装状況

**ドメイン知識 → コード対応表**

| ドメイン概念 | ドキュメント | 実装クラス/ファイル |
|------------|------------|------------------|
| **GameState** | [yugioh-rules.md](./yugioh-rules.md) | `domain/models/GameState.ts` |
| **Phase** | [yugioh-rules.md - フェーズシステム](./yugioh-rules.md#フェーズシステム) | `domain/models/Phase.ts`, `domain/rules/PhaseRule.ts` |
| **Victory Conditions** | [yugioh-rules.md - 勝利条件](./yugioh-rules.md#勝利条件) | `domain/rules/VictoryRule.ts` |
| **Card Zones** | [yugioh-rules.md - 領域](./yugioh-rules.md#領域-zone) | `GameState.zones` |
| **Card Types** | [yugioh-rules.md - カード種別](./yugioh-rules.md#カード種別) | `domain/models/Card.ts` |
| **Card Actions** | [yugioh-rules.md - 行動](./yugioh-rules.md#行動-action) | `application/commands/` |
| **Card Effects** | [yugioh-rules.md - 概念](./yugioh-rules.md#概念-concept) | `domain/effects/`, `application/effects/CardEffectRegistry.ts` |
| **Activation Rules** | [yugioh-rules.md - カード種別](./yugioh-rules.md#カード種別) | `domain/rules/SpellActivationRule.ts` |

### フェーズシステム

| フェーズ | 実装状況 | 実装箇所 | 備考 |
|---------|---------|---------|------|
| **Draw Phase** | ✅ 完全実装 | `PhaseRule.ts` | 先攻1T目はドローしない |
| **Standby Phase** | ✅ 完全実装 | `PhaseRule.ts` | スキップ可能 |
| **Main Phase 1** | ✅ 完全実装 | `PhaseRule.ts` | カード発動可能 |
| **End Phase** | ✅ 完全実装 | `PhaseRule.ts` | ゲーム終了 |

**コマンド**: `AdvancePhaseCommand`

#### 勝利条件

| 勝利条件 | 実装状況 | 実装箇所 | 備考 |
|---------|---------|---------|------|
| **エクゾディア勝利** | ✅ 完全実装 | `VictoryRule.checkExodiaVictory()` | 5パーツ判定 |
| **ライフポイント勝利** | ⏳ 枠組みのみ | `VictoryRule.checkLifePointVictory()` | 常に`null`を返す |

**派生Store**: `exodiaPieceCount`, `gameResult`

### 領域 (Zone)

| Zone | 実装状況 | GameState定義 | 操作 |
|------|---------|--------------|------|
| **Deck** | ✅ 完全実装 | `zones.deck` | DrawCommand |
| **Hand** | ✅ 完全実装 | `zones.hand` | DrawCommand, ActivateSpellCommand |
| **Field** | ✅ 基本実装 | `zones.field` | カード配置は未使用 |
| **Graveyard** | ✅ 完全実装 | `zones.graveyard` | ActivateSpellCommand |
| **Banishment** | ⏳ 定義のみ | - | 未使用 |

### カードシステム

#### カード種別

| カード種別 | 実装状況 | 実装箇所 | 備考 |
|-----------|---------|---------|------|
| **Monster** | ✅ データのみ | `Card` type | エクゾディアパーツのみ |
| **Spell (Normal)** | ✅ 完全実装 | `ActivateSpellCommand`, Effect System | Pot of Greed, Graceful Charity |
| **Trap** | 🚧 一部実装 | `SpellActivationRule`, `cardDatabase.ts` | 発動判定のみ（Jar of Greed定義済） |

#### カードアクション

| アクション | 実装状況 | 実装箇所 | 備考 |
|-----------|---------|---------|------|
| **Draw** | ✅ 完全実装 | `DrawCardCommand` | デッキ→手札 |
| **Activate (Spell)** | ✅ 基本実装 | `ActivateSpellCommand` | 通常魔法のみ |
| **Summon** | ❌ 未実装 | - | MVP範囲外 |
| **Set** | ❌ 未実装 | - | MVP範囲外 |
| **Release** | ❌ 未実装 | - | MVP範囲外 |

#### カード発動ルール

| ルール | 実装状況 | 実装箇所 | 備考 |
|--------|---------|---------|------|
| **発動可能フェーズ判定** | ✅ 完全実装 | `SpellActivationRule` ||
| **罠カード発動判定** | ✅ 完全実装 | `SpellActivationRule` |手札から直接発動不可|
| **発動後の墓地送り** | ✅ 完全実装 | `ActivateSpellCommand` | - |
| **カード効果処理** | ✅ 完全実装 | Effect System (Strategy Pattern + Registry) | - |
| **コスト処理** | ❌ 未実装 | - | - |
| **対象選択** | ❌ 未実装 | - | - |

#### カード効果システム (Effect System)

| コンポーネント | 実装状況 | 実装箇所 | 備考 |
|--------------|---------|---------|------|
| **CardEffect Interface** | ✅ 完全実装 | `domain/effects/CardEffect.ts` | すべてのカード効果の基底 |
| **CardEffectRegistry** | ✅ 完全実装 | `application/effects/CardEffectRegistry.ts` | カードID→Effect インスタンスマッピング |
| **SpellEffect** | ✅ 完全実装 | `domain/effects/bases/SpellEffect.ts` | 魔法カード共通処理 |
| **NormalSpellEffect** | ✅ 完全実装 | `domain/effects/bases/NormalSpellEffect.ts` | 通常魔法共通処理 |

**実装済みカード効果**: Pot of Greed, Graceful Charity

---

## MVP (Minimum Viable Product)

### ✅ 実装済み

- **デッキ**: 「封印されしエクゾディア」デッキ 1種
- **機能**:
  - 手札からの魔法発動（Pot of Greed, Graceful Charity）
  - カード効果処理（Effect System: Strategy Pattern）
  - ドロー（複数枚対応）
  - カード破棄（手札選択UI）
  - エクゾディア勝利判定
  - 罠カード発動判定（手札から直接発動不可）
- **UI**:
  - カードをクリックでプレイ
  - カード効果解決モーダル
  - カード選択モーダル（破棄時）
  - カード画像表示（YGOPRODeck API統合）

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

---

## 実装開始時の参照順序

1. [yugioh-rules.md](./yugioh-rules.md) - ドメインルール確認
2. この overview.md - 実装状況確認
3. [architecture/overview.md](../architecture/overview.md) - 実装方針確認

---

## 関連ドキュメント

- [yugioh-rules.md](./yugioh-rules.md) - 遊戯王OCG基本ルール
- [architecture/overview.md](../architecture/overview.md) - 技術アーキテクチャ
- [specs/001-architecture-refactoring/](../../specs/001-architecture-refactoring/) - リファクタリング記録
