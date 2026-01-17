# Effect モデル設計

## 概要

YGO Solitaire の Effect モデルは、Clean Architecture の 3 層構造で設計されている:

- **Domain Layer**: 効果の分類と手続き・ルールの定義
  - **ChainableAction**:「発動する効果: チェーンブロックを作る処理」のモデル化と具体実装とレジストリ
  - **AdditionalRule**: 「適用する効果: 追加適用されるルール」のモデル化と具体実装とレジストリ
- **Application Layer**: 効果処理・ルール適用のワークフロー
- **Presentation Layer**: 通知や、カード選択などの UI 提供

この 3 層構造により、以下を実現している:

1. **明確な責務分離**: Domain/Application/Presentation の各層が独立
2. **遊戯王 PSCT への準拠**: 遊戯王の公式ルールへのプログラム的な解釈・マッピングと実行可能性を担保
3. **抽象化による再利用と重複排除**: 共通クラスの再利用により、個別カードの実装コードを極小化

この設計により、高い保守性・拡張性・テスタビリティの高いコードベースを実現している。

**参考**: [PSCT: Problem-Solving Card Text](https://www.yugioh-card.com/en/play/psct/)

---

## Domain Layer

### Chainable Action :チェーンブロックを作る処理

発動宣言から解決までのフローを管理する。  
カードの発動も、「チェーンブロックを作る処理」のため、同一クラスで管理する。

#### クラス階層 (抽象化構造)

```
domain/
├── models/
│   ├── ChainableAction.ts           # チェーンブロックを作る処理のインターフェース
│   └── AtomicStep.ts                # 効果処理ステップのインターフェース
│
├── effects/
│   ├── base/                        # 種別ごとの基底クラス
│   │   ├── monster (※将来拡張予定)
│   │   │   └── BaseMonsterAction    # モンスターカード共通
│   │   ├── spell
│   │   │   ├── BaseSpellAction      # 魔法カード共通
│   │   │   ├── NormalSpellAction    # 通常魔法共通
│   │   │   ├── QuickPlaySpellAction # 速攻魔法共通
│   │   │   └── FieldSpellAction     # フィールド魔法共通
│   │   └── trap (※将来拡張予定)
│   │       └── BaseTrapAction       # 罠カード共通
│   │
│   ├── builders/                    # 頻出ステップのヘルパー関数群
│   │   └── (etc)
│   │
│   └── actions/                     # 個別カードの具象実装
│       ├── monster
│       │   └── (etc)
│       ├── spell
│       │   └── (etc)
│       └── trap
│           └── (etc)
│
└── registries/
    └── ChainableActionRegistry.ts   # チェーンブロックを作る処理の定義レジストリ
```

#### 主要メソッド

- **CONDITIONS**: `canActivate(state, context)`
- **ACTIVATION**: `createActivationSteps(state, instanceId)`
- **RESOLUTION**: `createResolutionSteps(state, instanceId)`

#### Step Builder 関数 (Step Factories)

よく使われる処理は `builders/stepBuilders.ts` として共通化し、個別のカード実装を簡略化する。

- `createDrawStep(amount)`: ドロー処理の生成
- `createSendToGraveyardStep(target)`: 墓地送り処理の生成
- `createSearchStep(filter)`: デッキからのサーチ処理の生成

### Additional Rule :追加ルール・常時適用効果

#### クラス階層 (抽象化構造)

```
domain/
├── models/
│   ├── AdditionalRule.ts           # 追加ルールのインターフェース
│   └── RuleContext.ts              # 各ルールのコンテキストパラメータのインターフェース
│
├── effects/
│   ├── base/                       # 種別ごとの基底クラス
│   │   └── (※将来拡張予定)
│   │
│   └── rules/                      # 個別カードの具象実装
│       ├── monster
│       │   └── (etc)
│       ├── spell
│       │   └── (etc)
│       └── trap
│           └── (etc)
│
└── registries/
    └── AdditionalRuleRegistry.ts   # 追加ルールの定義レジストリ
```

#### 主要フラグ

チェーンブロックを作らず、特定の条件下で常にゲーム状態に干渉する。  
フラグ、およびファイル命名規則（後述）によって分類する。

| ルールタイプ     | isEffect             | scope                            |
| ---------------- | -------------------- | -------------------------------- |
| 永続効果         | `True` (無効化可能)  | `Field` (フィールド上でのみ有効) |
| 分類されない効果 | `True` (無効化可能)  | `Any` (フィールド以外でも有効)   |
| 効果外テキスト   | `False` (無効化不可) | `Any` (フィールド以外でも有効)   |

### 個別カード効果実装ファイルの命名規則

| 効果タイプ           | 接尾語                  | 説明                                                   |
| -------------------- | ----------------------- | ------------------------------------------------------ |
| **カードの発動**     | `Activation.ts`         | 永続カードの発動、および使い切りカードの発動＆効果処理 |
| **起動効果**         | `IgnitionEffect.ts`     | 発動を宣言して使用する効果（スペルスピード 1）         |
| **誘発即時効果**     | `QuickEffect.ts`        | 発動を宣言して使用する効果（スペルスピード 2）         |
| **誘発効果**         | `TriggerEffect.ts`      | 特定のイベントに反応して、強制または任意で発動する効果 |
| **永続効果**         | `ContinuousEffect.ts`   | フィールドに存在する限り有効になるルール効果           |
| **分類されない効果** | `UnclassifiedEffect.ts` | フィールドに存在しなくても有効になるルール効果         |
| **効果外テキスト**   | `NonEffect.ts`          | 特殊勝利条件等、無効化されないルール効果               |

---

## Application Layer

### 効果処理のワークフロー

効果処理は、UI との対話（対象の選択など）を伴うため、ステップ形式で実行する。

1. **発動フェーズ**:

- `canActivate` 判定
- `createActivationSteps` によるコスト支払い・対象指定ステップの実行。

2. **解決フェーズ**:

- チェーンスタックからのポップ。
- `createResolutionSteps` による効果処理ステップの実行。

### ルール適用

※将来拡張予定

---

## Presentation Layer

### Effect Visibility

ユーザーに効果の内容や進行状況を伝えるためのデータ変換を行う。

- **`ActionDisplayData`**: 発動可能な効果をボタンやリストとして表示するための型。
- **`ResolutionStepView`**: 解決中のステップ内容（例：「カードを 1 枚ドローします」）をモーダルやログに表示。
