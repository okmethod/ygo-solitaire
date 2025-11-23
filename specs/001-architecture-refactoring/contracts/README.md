# API Contracts

このディレクトリには、アーキテクチャリファクタリング用のTypeScriptインターフェース定義が含まれています。

## 目的

- **Design-by-Contract**: 実装前にインターフェースを定義
- **ドキュメント**: 各層のAPI境界を明確化
- **テスト**: これらの契約に基づいてモック/スタブを作成
- **型安全性**: TypeScriptコンパイラで契約を強制

## 契約ファイル

### GameFacadeContract.ts
UIコンポーネントのメインエントリーポイント。すべてのゲーム操作はこのファサードを経由します。

**利用者**: `presentation/` のSvelteコンポーネント
**実装者**: `application/GameFacade.ts`

**主要メソッド**:
- `initializeGame(deckRecipeId)`: ゲームを初期化
- `drawCard(count)`: カードをドロー
- `activateSpell(cardInstanceId)`: 魔法カードを発動
- `advancePhase()`: フェイズを進める
- `checkVictory()`: 勝利条件をチェック
- `getGameState()`: 現在の状態を取得（読み取り専用）

### CommandContract.ts
プレイヤーアクションのCommandパターンインターフェース。

**利用者**: GameFacade
**実装者**: `application/commands/DrawCardCommand.ts` など

**主要インターフェース**:
- `IGameCommand`: すべてのコマンドの基底インターフェース
- `IDrawCardCommand`: ドローコマンド
- `IActivateSpellCommand`: 魔法発動コマンド
- `IAdvancePhaseCommand`: フェイズ遷移コマンド

**特徴**:
- `canExecute()`: 実行前の検証
- `execute()`: 新しいGameStateを返す（不変性）
- `description`: ログ・履歴用の説明

### RuleContract.ts
ドメインルール検証インターフェース。

**利用者**: Commands、GameFacade
**実装者**: `domain/rules/PhaseRule.ts` など

**主要インターフェース**:
- `IPhaseRule`: フェイズ遷移ルール
- `ISpellActivationRule`: 魔法発動ルール
- `IChainRule`: チェーン処理ルール
- `IVictoryRule`: 勝利条件ルール

**特徴**:
- ステートレスなバリデーター
- ゲームロジックの知識をカプセル化
- 純粋関数として実装可能

### EffectContract.ts
既存の効果システムのアダプターインターフェース。

**利用者**: Commands（ActivateSpellCommand）
**実装者**: 既存の `BaseEffect` クラス（最小限の変更で）

**主要インターフェース**:
- `ICardEffect`: カード効果の基本インターフェース
- `IPrimitiveEffect`: 再利用可能な要素効果
- `IBaseEffect`: 基底効果クラス
- `IBaseMagicEffect`: 魔法カード効果
- `IEffectRepository`: 効果のFactoryパターン管理

**重要な変更点**:
- `execute()` が新しい `GameState` を返す（DuelStateの変更からの移行）
- `EffectResult` に `newState: GameState` プロパティを追加

### StoreContract.ts
状態管理のSvelteストアインターフェース。

**利用者**: Svelteコンポーネント
**実装者**: `application/stores/gameStateStore.ts`

**主要インターフェース**:
- `IGameStateStore`: メイン状態ストア（Writable）
- `IDerivedStores`: 派生ストア（計算プロパティ）
- `IHistoryStore`: アクション履歴（将来の拡張）
- `IStoreUtils`: ストア作成ユーティリティ

**特徴**:
- Svelteの標準Store API準拠
- Derived storeで計算プロパティを定義
- リアクティビティの自動化

## 使用例

```typescript
// Svelteコンポーネントで使用
import type { IGameFacade } from '$lib/contracts/GameFacadeContract';
import { gameFacade } from '$lib/application/GameFacade';
import { gameState } from '$lib/application/stores/gameStateStore';

const facade: IGameFacade = gameFacade;

// ゲームを初期化
await facade.initializeGame('exodia-deck');

// カードをドロー
facade.drawCard();

// 状態を表示（リアクティブ）
$: handSize = $gameState.zones.hand.length;
```

## 依存フロー

```
UI (presentation/)
    ↓ 使用
GameFacade (application/) ← GameFacadeContractを実装
    ↓ 使用
Commands (application/) ← CommandContractを実装
    ↓ 使用
Rules (domain/rules/) ← RuleContractを実装
Effects (domain/effects/) ← EffectContractを実装
    ↓ 操作
GameState (domain/models/)
    ↓ 反映
Store (application/stores/) ← StoreContractを実装
    ↓ 購読
UI (presentation/) ← 再描画
```

**依存の方向性**:
- `presentation → application → domain`（Clean Architectureの原則）
- ドメイン層は他の層に依存しない（フレームワーク非依存）

## 契約でのテスト

契約により、テストダブルの作成が容易になります:

```typescript
// コンポーネントテスト用のモックGameFacade
const mockFacade: IGameFacade = {
  initializeGame: vi.fn(),
  drawCard: vi.fn(),
  activateSpell: vi.fn(),
  advancePhase: vi.fn(),
  getCurrentPhase: vi.fn(() => 'Draw'),
  getGameState: vi.fn(() => mockGameState),
  canActivateCard: vi.fn(() => true),
  checkVictory: vi.fn(() => ({ isGameOver: false })),
};
```

```typescript
// Commandのテスト
const command: IDrawCardCommand = new DrawCardCommand(2);
const initialState = createInitialGameState(mockDeckRecipe);

expect(command.canExecute(initialState)).toBe(true);
const newState = command.execute(initialState);
expect(newState.zones.hand.length).toBe(2);
expect(initialState.zones.hand.length).toBe(0); // 不変性の確認
```

## 次のステップ

契約定義後の実装順序:

1. **domain/models/GameState.ts** を実装
   - 不変な状態オブジェクト
   - Immerでの更新ヘルパー関数

2. **domain/rules/** クラスを実装
   - PhaseRule, SpellActivationRule, ChainRule, VictoryRule
   - ステートレスなバリデーター

3. **application/commands/** クラスを実装
   - DrawCardCommand, ActivateSpellCommand, AdvancePhaseCommand
   - Ruleクラスを使用した検証

4. **application/GameFacade.ts** を実装
   - CommandパターンでUIとドメインを接続
   - Storeの更新管理

5. **domain/effects/** を移行
   - 既存のBaseEffectをICardEffectに適合
   - execute()の戻り値にnewStateを追加

6. **presentation/** コンポーネントを更新
   - DuelStateからGameFacade経由に変更
   - Storeのsubscribeで状態を購読

## レイヤー境界の強制

```typescript
// ESLint設定例（.eslintrc.js）
module.exports = {
  overrides: [
    {
      // ドメイン層はSvelte/application/presentationに依存禁止
      files: ['src/lib/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              'svelte',
              'svelte/*',
              '$lib/application/*',
              '$lib/presentation/*'
            ],
          },
        ],
      },
    },
    {
      // アプリケーション層はpresentationに依存禁止
      files: ['src/lib/application/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['$lib/presentation/*'],
          },
        ],
      },
    },
  ],
};
```

## ドキュメントバージョン

- **バージョン**: 1.0.0
- **作成日**: 2025-01-23
- **ステータス**: 実装準備完了

## 関連ドキュメント

- `../spec.md`: 機能仕様
- `../research.md`: 設計判断の根拠
- `../data-model.md`: ドメインモデル詳細
- `../../docs/02-architecture.md`: Clean Architecture設計
