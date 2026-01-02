# Data Model: Additional Spell Cards Implementation

**Feature**: 013-card-pool-expansion
**Date**: 2026-01-02

## Overview

このfeatureでは、GameStateモデルに2つの新規フィールドを追加し、6枚の新規カードデータをCardDataRegistryに登録します。

## GameState Model Extensions

### New Fields

#### pendingEndPhaseEffects

```typescript
readonly pendingEndPhaseEffects: readonly EffectResolutionStep[]
```

**Purpose**: エンドフェイズに実行される遅延効果を保存

**Used By**:
- 無の煉獄 (Into the Void) - ターン終了時に手札を全て捨てる
- 命削りの宝札 (Card of Demise) - ターン終了時に手札を全て捨てる

**Lifecycle**:
1. カード発動時: createAddEndPhaseEffectStep()で追加
2. エンドフェイズ開始時: AdvancePhaseCommandが実行
3. エンドフェイズ実行後: 配列をクリア

**Default Value**: `[]` (empty array)

#### activatedOncePerTurnCards

```typescript
readonly activatedOncePerTurnCards: ReadonlySet<number>
```

**Purpose**: 「1ターンに1枚のみ」制約を持つカードの発動済み管理

**Used By**:
- 強欲で謙虚な壺 (Pot of Duality) - Card ID: 98645731
- 命削りの宝札 (Card of Demise) - Card ID: 59750328

**Lifecycle**:
1. カード発動時: Set に Card ID を追加
2. canActivate()で発動前チェック: Set.has(cardId)
3. エンドフェイズ移行時: new Set()でクリア

**Default Value**: `new Set<number>()` (empty set)

## Card Data Entities

### 1. Magical Stone Excavation (魔法石の採掘)

```typescript
{
  id: 98494543,
  jaName: "魔法石の採掘",
  name: "Magical Stone Excavation",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  desc: "手札を２枚捨てて発動できる。自分の墓地の魔法カード１枚を選んで手札に加える。"
}
```

**Effect Pattern**: 墓地からカード回収
**Dependencies**: createSearchFromGraveyardStep()

### 2. Into the Void (無の煉獄)

```typescript
{
  id: 93946239,
  jaName: "無の煉獄",
  name: "Into the Void",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  desc: "自分の手札が３枚以上の場合に発動できる。自分のデッキからカードを１枚ドローし、このターンのエンドフェイズ時に自分の手札を全て捨てる。"
}
```

**Effect Pattern**: ドロー + エンドフェイズ遅延効果
**Dependencies**: createDrawStep(), createAddEndPhaseEffectStep()

### 3. Pot of Duality (強欲で謙虚な壺)

```typescript
{
  id: 98645731,
  jaName: "強欲で謙虚な壺",
  name: "Pot of Duality",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  desc: "このカード名のカードは１ターンに１枚しか発動できず、このカードを発動するターン、自分はモンスターを特殊召喚できない。(1)：自分のデッキの上からカードを３枚めくり、その中から１枚を選んで手札に加える。その後、残りのカードをデッキに戻す。"
}
```

**Effect Pattern**: デッキ掘削 + 1ターンに1枚制約
**Dependencies**: createSearchFromDeckTopStep(), activatedOncePerTurnCards

### 4. Card of Demise (命削りの宝札)

```typescript
{
  id: 59750328,
  jaName: "命削りの宝札",
  name: "Card of Demise",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  desc: "このカード名のカードは１ターンに１枚しか発動できず、このカードを発動するターン、自分はモンスターを特殊召喚できない。(1)：自分は手札が３枚になるようにデッキからドローする。このカードの発動後、ターン終了時まで相手が受ける全てのダメージは０になる。このターンのエンドフェイズに、自分の手札を全て墓地へ送る。"
}
```

**Effect Pattern**: 複合（ドロー + ダメージ無効化 + エンドフェイズ遅延効果 + 1ターンに1枚制約）
**Dependencies**: createDrawStep(), createAddEndPhaseEffectStep(), activatedOncePerTurnCards

### 5. Toon Table of Contents (トゥーンのもくじ)

```typescript
{
  id: 89997728,
  jaName: "トゥーンのもくじ",
  name: "Toon Table of Contents",
  type: "spell",
  frameType: "spell",
  spellType: "normal",
  desc: "(1)：デッキから「トゥーン」カード１枚を手札に加える。"
}
```

**Effect Pattern**: デッキサーチ（カード名フィルタ）
**Dependencies**: createSearchFromDeckStep() (カード名に「トゥーン」を含む)

### 6. Toon World (トゥーンワールド)

```typescript
{
  id: 15259703,
  jaName: "トゥーンワールド",
  name: "Toon World",
  type: "spell",
  frameType: "spell",
  spellType: "continuous",
  desc: "１０００ＬＰを払ってこのカードを発動できる。"
}
```

**Effect Pattern**: LP支払い + フィールド配置
**Dependencies**: createLPPaymentStep() (新規または既存のcreateDamageStepを流用)

**Note**: カードタイプは"continuous"（永続魔法）だが、実装上はFieldSpellActionを継承する（効果の性質がフィールド魔法に近いため）

## Entity Relationships

```
GameState
├── pendingEndPhaseEffects: EffectResolutionStep[]
│   └── Used by: IntoTheVoidActivation, CardOfDemiseActivation
│
├── activatedOncePerTurnCards: Set<number>
│   └── Used by: PotOfDualityActivation, CardOfDemiseActivation
│
└── zones
    ├── graveyard: CardInstance[]
    │   └── Used by: MagicalStoneExcavationActivation
    │
    └── deck: CardInstance[]
        └── Used by: PotOfDualityActivation, CardOfDemiseActivation,
                     ToonTableOfContentsActivation

CardDataRegistry
├── 98494543: MagicalStoneExcavation
├── 93946239: IntoTheVoid
├── 98645731: PotOfDuality
├── 59750328: CardOfDemise
├── 89997728: ToonTableOfContents
└── 15259703: ToonWorld
```

## Validation Rules

### pendingEndPhaseEffects

- ✅ 配列は空でも有効
- ✅ 複数の効果が登録可能（実行順序は登録順）
- ✅ 各要素はEffectResolutionStepインターフェースに準拠

### activatedOncePerTurnCards

- ✅ Setは空でも有効
- ✅ 同じカードIDを複数回追加しても問題なし（Setの性質）
- ✅ エンドフェイズでクリアされる

### Card Activation Constraints

| Card | Constraint | Check Location |
|------|-----------|----------------|
| Magical Stone Excavation | 手札3枚以上 + 墓地に魔法カード1枚以上 | additionalActivationConditions() |
| Into the Void | 手札3枚以上 + デッキ1枚以上 | additionalActivationConditions() |
| Pot of Duality | デッキ3枚以上 + 未発動 | additionalActivationConditions() |
| Card of Demise | 未発動 | additionalActivationConditions() |
| Toon Table of Contents | デッキにトゥーンカード1枚以上 | additionalActivationConditions() |
| Toon World | LP1000以上 | additionalActivationConditions() |
