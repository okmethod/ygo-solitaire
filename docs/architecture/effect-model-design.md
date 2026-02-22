# Effect モデル設計

## 概要

YGO Solitaire の Effect モデルは、Clean Architecture の 3 層構造で設計されている:

- **Domain Layer**: 効果の分類と手続き・ルールの定義
  - 「発動する効果: チェーンブロックを作る処理」のモデル化と具体実装とレジストリ
  - 「適用する効果: 追加適用されるルール」のモデル化と具体実装とレジストリ
- **Application Layer**: 効果処理・ルール適用・ユーザ選択のワークフロー
- **Presentation Layer**: 通知・カード選択などの UI 提供

この 3 層構造により、以下を実現している:

1. **明確な責務分離**: Domain/Application/Presentation の各層が独立
2. **遊戯王 PSCT への準拠**: 遊戯王の公式ルールへのプログラム的な解釈・マッピングと実行可能性を担保
3. **抽象化による再利用と重複排除**: 共通クラスの再利用により、個別カードの実装コードを極小化
4. **テスタビリティ**: 各効果を個別にユニットテスト可能

ドメイン知識（発動する効果、適用する効果等）については [効果モデル](../domain/effect-model.md) を参照。

## 処理フロー

```
[コマンド選択]
    ↓
[GameFacade] → 各種Commandクラス実行、GameState更新、効果処理ステップ生成
    ↓
[effectQueueStore] → ステップ処理、通知とインタラクティブ制御、イベント検知と割り込み処理制御、GameState更新
    ↓
[Modal.svelte] → UI コンポーネント表示
```

---

## Domain Layer

### Atomic Step :効果処理ステップ

アトミックなゲーム状態更新のステップを定義し、個別の効果実装で再利用する。

**階層構造**

- `models/GameProcessing/AtomicStep.ts`: インターフェース定義
- `effects/steps/` ステップ定義

### Chainable Action :チェーンブロックを作る処理（発動する効果）

発動宣言から解決までのフローを管理する。  
カードの発動も、「チェーンブロックを作る処理」のため、同一クラスで管理する。

**階層構造**

- `models/Effect/ChainableAction.ts`: インターフェース定義
- `effects/actions/`: 効果定義
  - `ChainableActionRegistry.ts`: 定義レジストリ
  - `activations/`: カードの発動
    - `individuals/**/*Activation.ts`
  - `ignitions/`: 起動効果
    - `individuals/**/*IgnitionEffect.ts`
  - `quicks/`: 誘発即時効果（⏳ 未実装）
    - `individuals/**/*QuickEffect.ts`
  - `triggers/`: 誘発効果（⏳ 未実装）
    - `individuals/**/*TriggerEffect.ts`

**主要メソッド**

- **CONDITIONS**: `canActivate(state, context)`
- **ACTIVATION**: `createActivationSteps(state, instanceId)`
- **RESOLUTION**: `createResolutionSteps(state, instanceId)`

### Additional Rule :追加適用するルール（適用する効果）

チェーンブロックを作らず、特定の条件下で常にゲーム状態に干渉する。

**階層構造**

- `models/Effect/AdditionalRule.ts`: インターフェース定義
- `effects/rules/`: 効果定義
  - `AdditionalRuleRegistry.ts`: 定義レジストリ
  - `continuouses/`: 永続効果
    - `individuals/**/*ContinuousEffect.ts`
  - `unclassifieds/`: 分類されない効果（⏳ 未実装）
    - `individuals/**/*UnclassifiedEffect.ts`
  - `nons/`: 効果外テキスト（⏳ 未実装）
    - `individuals/**/*NonEffect.ts`

**主要プロパティ**

- `isEffect: boolean` - ルール上「効果」にあたるか（無効化の対象となるか）
- `category: RuleCategory` - どの処理に介入するかを定義

**RuleCategory の分類**

| カテゴリ            | 用途                     | 使用メソッド           |
| ------------------- | ------------------------ | ---------------------- |
| `NameOverride`      | カード名変更             | `apply()`              |
| `StatusModifier`    | 攻撃力/守備力変更        | `apply()`              |
| `SummonCondition`   | 特殊召喚条件             | `checkPermission()`    |
| `SummonPermission`  | 召喚制限                 | `checkPermission()`    |
| `ActionPermission`  | 行動制限（攻撃不可等）   | `checkPermission()`    |
| `VictoryCondition`  | 特殊勝利判定             | `checkPermission()`    |
| `ActionReplacement` | 破壊耐性、身代わり効果   | `replace()`            |
| `SelfDestruction`   | 維持コスト、自壊         | `replace()`            |
| `TriggerRule`       | イベント発生時に自動実行 | `createTriggerSteps()` |

---

## Application Layer

効果処理のワークフロー制御を担当する。

### `GameFacade`

ゲーム状態に干渉するための唯一の入り口（Facade パターン）として、プレゼン層へのゲーム操作（コマンド）実行のエンドポイントを提供する。

**ファイル**: `application/GameFacade.ts`

**主要メソッド**

提供しているコマンドについては、[ゲーム操作コマンドモデル](./game-command-model.md) を参照。

### `gameStateStore`

**ファイル**: `application/stores/gameStateStore.ts`

ゲーム状態の SSOT を管理する。  
このストアの変更を `derivedStores` により監視し、派生したread-only値をプレゼン層に提供する。

### `effectQueueStore`

効果処理ステップキューの SSOT を管理する。  
蓄積された AtomicStep を順次実行し、通知・カード選択をプレゼン層に委譲する。

**ファイル**: `application/stores/effectQueueStore.ts`

**主要機能**

- **ステップキュー管理**:
  - AtomicStep を順次実行する
- **タイミング管理**:（⏳ 未実装）
  - 「その後(THEN)」を検知し、タイミングを次に進める
  - 「同時に発生したこと」「順番に発生したこと」を区別する
- **イベントトリガー処理**:
  - 各種効果のトリガーとなるイベントを検知し、条件を満たす効果を収集する
  - 収集した効果のステップをキューに挿入し、割り込み処理する
- **チェーン管理**:
  - `chainStackStore` と連携してチェーンスタックを管理する
  - チェーンできるイベントとタイミングを検知し、チェーン有無を確認するステップをキューに挿入する
  - チェーンする場合は、発動処理ステップを処理し、解決処理ステップをスタックする
  - チェーン解決時に、スタックした解決処理ステップを処理する
- **UI 連携**:
  - 通知レベルに応じた通知・インタラクション制御により、ユーザーの選択を効果処理に反映させる

**処理フロー**

```
[ステップ実行処理開始] → EventTimeline初期化
    ↓
[ステップ実行ループ:開始]
  [[ステップを取り出す]]
  step.id === "then-marker" ？
    ├─ Yes → タイミングをインクリメント
    └─ No  → ステップ実行（GameState更新、イベント収集）
      ↓
  [[イベント検知]]
    ├─ TriggerRule (AdditionalRule) 抽出
    │   → ステップをキューに自動挿入（割り込み処理）
    │
    └─ TriggerEffect (ChainableAction) 抽出 （⏳ 未実装）
        → 発動確認ステップを挿入（強制or任意）
        発動する？
          ├─ Yes → activation → 自動挿入（即座に処理）
          │        resolution → スタック
          └─ No  → 次へ
  [[チェーン確認]]
  チェーンスタックが空でない？
    ├─ Yes → チェーン確認ステップを挿入 → スペルスピード確認 → チェーン可能な効果を収集
    │      発動する？
    │        ├─ Yes → チェーン構築を繰り返す
    │        └→ No  → チェーン終了 → スタックをLIFO順で解決
    └─ No  → 次のステップへ
[ステップ実行ループ:終了]
    ↓
[ステップ実行終了] → 最終的な GameState を確定
```

---

## Presentation Layer

効果処理の進行状況表示、ユーザー入力の受付を担当する。

**コンポーネント構造**

- `routes/(auth)/simulator/[deckId]/_components/`
  - `DuelField.svelte`: ゲーム盤面表示コンポーネント
  - `Hands.svelte`: 手札表示・操作コンポーネント
  - `modals/ConfirmationModal.svelte`: 効果発動の通知・確認
  - `modals/CardSelectionModal.svelte`: カード選択インタラクション

**UIフロー**

```
[DuelField / Hands] → ユーザー操作受付（GameFacade経由でコマンド実行）
  ↓
[DuelField] → effectQueueStore 監視
  notificationConfig発生 → ConfirmationModal 表示
  cardSelectionConfig発生 → CardSelectionModal 表示
    ↓
  ユーザー操作（onConfirm or onCancel）
    ↓
  次のステップへ
```
