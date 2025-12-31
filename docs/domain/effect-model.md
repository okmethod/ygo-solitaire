# 効果モデル

**実装箇所**: `domain/models/ChainableAction.ts`, `domain/models/AdditionalRule.ts`
**参考資料**: [Problem-Solving Card Text, Part 3: Conditions, Activations, and Effects](https://www.yugioh-card.com/en/play/psct/psct-3/)

---

## Chainable Actions: チェーンブロックを作る処理

チェーンブロックを作る処理には、「カードの発動」と「効果の発動」がある。  
ルール上「カードの発動」は「効果」ではないが、いずれも構成要素が同じ。  
そのため、同じモデルとして定義し、フラグによって区別する。

- **カードの発動**: 手札・セット状態の魔法・罠カードを、表にして出す処理
- **効果の発動**: 場の表側のカードや、手札・墓地等のカードの以下の効果による処理
  - **起動効果**: メインフェイズに、プレイヤーが発動を宣言して発動する
  - **誘発効果**: カードが定めた特定の条件を満たしたタイミングで、自動または任意で発動する
  - **クイックエフェクト**: 特定のタイミングまたはチェーンブロックを作る処理にチェーンして、任意で発動する

チェーンブロックやスペルスピード等、チェーンシステム自体の説明については [チェーンシステム](./chain-system.md) を参照。

### チェーンブロックを作る処理の 3 ステップ構成

`CONDITIONS : ACTIVATION ; RESOLUTION`

- **CONDITIONS**: 発動条件（Effect Conditions）
  - 発動を宣言できるかどうかの判定に使用する条件。
- **ACTIVATION**: 発動時の処理（Actions at activation）
  - コストの支払い、「対象を取る効果」における対象の指定などの手続き。
  - カードの発動の場合は、カードを場に配置する処理もここに含まれる。
  - 発動が確定した瞬間に即座に実行され、無効化されても取り消されない。
- **RESOLUTION**: 効果の解決（Effect resolution）
  - チェーン解決時に適用されるメインの処理（狭義の「効果」）
  - 別の効果により無効化される可能性がある。

### 構成例

- **例 1 （命の綱）**
  - CONDITIONS: `自分モンスターが戦闘によって墓地に送られた時に、`
  - ACTIVATION: `手札を全て捨てて発動する。`
  - RESOLUTION: `そのモンスターの攻撃力を 800 ポイントアップさせて、フィールド上に特殊召喚する。`
- **例 2 （クリッター）**
  - CONDITIONS: `このカードがフィールドから墓地へ送られた場合に発動する。`
  - ACTIVATION: （無し）
  - RESOLUTION: `デッキから攻撃力 1500 以下のモンスター 1 体を手札に加える。`
- **例 3 （サンダー・ブレイク）**
  - CONDITIONS: （無し）
  - ACTIVATION: `手札を 1 枚捨て、フィールドのカード 1 枚を対象として発動できる。`
  - RESOLUTION: `そのカードを破壊する。`

---

## Additional Rules : 追加ルール

基本的なルールに追加、またはオーバーライドする形で適用する、個別のルールのような効果。  
ルール上「効果」にあたるものと、ルール上「効果」にあたらないものが存在する。  
そのため、同じモデルとして定義し、フラグによって区別する。

- ルール上「効果」にあたる
  - **永続効果**: フィールドに存在する限り、適用されるルール。
  - **分類されない効果（ルール効果）**: フィールドに限らず、手札・墓地等に存在していても適用されるルール。
- ルール上「効果」にあたらない
  - **効果外テキスト**:「効果を無効にする効果」によって無効化されないルール。

### Rule Category: ルール分類

追加ルールが、どの処理に介入するか？によって、ルールの分類を定義する。

- データ書き換え
  - **Name Override**: カード名の書き換え
  - **Status Modifier**: モンスターのステータスの増減
- 判定追加・制限追加
  - **Summon Condition**: 特殊召喚の条件
  - **Summon Permission**: 召喚回数や種類の制限
  - **Action Permission**: 「攻撃できない」「発動できない」などの制限
  - **Victory Condition**: 特殊勝利判定
- 処理置換・処理フック
  - **Action Replacement**: 「破壊されない」「破壊される代わりに～する」などの置換処理
  - **Self Destruction**: 維持コストや自壊の処理
- その他
  - **Attack Modifier**: 攻撃方法の拡張（❌ 実装不要）

### 代表例

- **永続効果の例**
  - チェーンブロックを作らないステータス変化の効果
  - チェーンブロックを作らないロック（攻撃宣言できない、特殊召喚できない、等）効果
  - 2 回攻撃、全体攻撃、直接攻撃できる効果
  - 破壊耐性（戦闘破壊されない、効果では破壊されない、等）の効果
- **分類されない効果（ルール効果）の例**
  - フィールド以外に存在する時や裏側表示でも適用される、永続効果に類似した効果
  - 「召喚に成功したターン」のみ適用される、永続効果に類似した効果
  - 条件による特殊召喚(召喚条件)
  - 召喚・特殊召喚を無効にされない効果
  - 特定の召喚方法で攻撃力・守備力が変動する効果
  - 他のカードの身代わりとなる効果の一部
  - 一部の置換効果（フィールドから離れた場合や破壊された場合に、～する効果）
  - フィールドに１枚しか存在できない制約
  - エクストラデッキのモンスターや儀式モンスターを特殊召喚する際の素材になった場合に適用する効果
  - 自身をエクシーズ素材に持つモンスターに効果を適用する効果
  - カード名を変更する効果
  - モンスターカードであるにもかかわらず魔法＆罠ゾーンにセットできる効果
- **効果外テキストの例**
  - カード名の扱いを変えるルール
  - 召喚条件・召喚制限（通常の方法では通常召喚・特殊方法できない制限や、特殊召喚するための特定の条件を定めたルール）
  - 発動条件・発動制限（1 ターンに 1 度まで等の制限を課すルール）
  - 効果の獲得条件（特定の条件下でのみ効果を得るルール）
  - 維持コスト（一定のコストを支払わないと自壊するルール）
  - 特殊勝利条件（特定の条件を満たせば勝利扱いとするルール）

---

## 実装例

### ChainableActionRegistry の使用例

```typescript
// domain/registries/ChainableActionRegistry.ts
import { ChainableActionRegistry } from "$lib/domain/registries/ChainableActionRegistry";
import { PotOfGreedActivation } from "$lib/domain/effects/actions/spell/PotOfGreedActivation";

// カード効果の登録
ChainableActionRegistry.register(55144522, new PotOfGreedActivation());

// カード効果の取得
const action = ChainableActionRegistry.get(55144522);
if (action && action.canActivate(state)) {
  const activationSteps = action.createActivationSteps(state);
  const resolutionSteps = action.createResolutionSteps(state, instanceId);
}
```

### AdditionalRuleRegistry の使用例

```typescript
// domain/registries/AdditionalRuleRegistry.ts
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { ChickenGameContinuousEffect } from "$lib/domain/effects/rules/spell/ChickenGameContinuousEffect";

// 永続効果の登録
AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousEffect());

// カテゴリ別フィルタ
const actionPermissions = AdditionalRuleRegistry.getByCategory(67616300, "ActionPermission");

// フィールド全体から適用可能なルールを収集
const activeRules = AdditionalRuleRegistry.collectActiveRules(state, "ActionPermission", { damageTarget: "player" });
```

### Chicken Game (チキンレース) の実装例

```typescript
// ChickenGameActivation.ts - カードの発動
export class ChickenGameActivation implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean {
    return state.zones.field.length === 0;
  }

  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return [];
  }

  createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
    return [];
  }
}

// ChickenGameIgnitionEffect.ts - 起動効果
export class ChickenGameIgnitionEffect implements ChainableAction {
  readonly isCardActivation = false;
  readonly spellSpeed = 1 as const;

  constructor(private readonly cardInstanceId: string) {}

  canActivate(state: GameState): boolean {
    if (state.phase !== "Main1") return false;
    if (state.lp.player < 1000) return false;

    const effectKey = `${this.cardInstanceId}:chicken-game-ignition`;
    if (state.activatedIgnitionEffectsThisTurn.has(effectKey)) {
      return false;
    }

    return true;
  }

  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return [
      {
        id: "chicken-game-cost",
        title: "コストを支払います",
        message: "1000LPを支払います",
        action: (state) => {
          const newLp = { ...state.lp, player: state.lp.player - 1000 };
          const effectKey = `${this.cardInstanceId}:chicken-game-ignition`;
          const newActivatedEffects = new Set([...state.activatedIgnitionEffectsThisTurn, effectKey]);
          return {
            success: true,
            newState: {
              ...state,
              lp: newLp,
              activatedIgnitionEffectsThisTurn: newActivatedEffects,
            },
          };
        },
      },
    ];
  }

  createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[] {
    return [
      {
        id: "chicken-game-draw",
        title: "効果を解決します",
        message: "デッキから1枚ドローします",
        action: (state) => {
          const newZones = drawCards(state.zones, 1);
          return { success: true, newState: { ...state, zones: newZones } };
        },
      },
    ];
  }
}

// ChickenGameContinuousEffect.ts - 永続効果
export class ChickenGameContinuousEffect implements AdditionalRule {
  readonly isEffect = true;
  readonly category: RuleCategory = "ActionPermission";

  canApply(state: GameState, context: RuleContext): boolean {
    const chickenGameOnField = state.zones.field.some((card) => card.id === 67616300 && card.position === "faceUp");
    if (!chickenGameOnField) return false;

    const damageTarget = context.damageTarget || "player";
    if (damageTarget === "player") {
      return state.lp.player < state.lp.opponent;
    } else {
      return state.lp.opponent < state.lp.player;
    }
  }

  checkPermission(state: GameState, context: RuleContext): boolean {
    return false;
  }
}
```
