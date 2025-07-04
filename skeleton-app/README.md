# 遊戯王ソリティア - フロントエンド設計ドキュメント

このドキュメントでは、遊戯王ソリティアアプリケーションのフロントエンド（SvelteKit）における効果システムの設計思想と実装について詳しく説明します。

## 目次

1. [効果システム概要](#効果システム概要)
2. [アーキテクチャ設計](#アーキテクチャ設計)
3. [階層化設計](#階層化設計)
4. [ファクトリーパターン](#ファクトリーパターン)
5. [デッキレシピベース登録システム](#デッキレシピベース登録システム)
6. [型システム設計](#型システム設計)
7. [テスト戦略](#テスト戦略)
8. [拡張性と保守性](#拡張性と保守性)
9. [実装例: 強欲な壺](#実装例-強欲な壺)
10. [開発ガイド](#開発ガイド)

## 効果システム概要

遊戯王ソリティアでは、カードの効果を正確にシミュレートするために、OCGルールに準拠した包括的な効果システムを実装しています。

### 設計目標

- **拡張性**: 新しいカード効果を簡単に追加できる
- **再利用性**: 共通する効果処理を効率的に再利用できる
- **型安全性**: TypeScriptによる厳密な型チェック
- **テスタビリティ**: 単体・統合テストが容易に書ける
- **メモリ効率**: ファクトリーパターンによる効率的なメモリ使用

## アーキテクチャ設計

効果システムは以下のディレクトリ構造で構成されています：

```
src/lib/classes/effects/
├── BaseEffect.ts              # 効果の基底抽象クラス
├── EffectRegistry.ts          # ファクトリーパターン実装
├── atoms/                     # 再利用可能な原子効果
│   └── DrawEffect.ts         # 汎用ドロー効果
├── cards/                    # カード固有効果
│   └── PotOfGreedEffect.ts   # 強欲な壺効果
└── registry/                 # 効果登録システム
    ├── CardEffectRegistrar.ts    # デッキベース登録管理
    └── cardEffectsRegistry.ts    # カード効果設定
```

## 階層化設計

効果システムは3層のアーキテクチャを採用しています：

### 1. BaseEffect（基底層）

全ての効果の共通インターフェースと基本機能を提供：

```typescript
export abstract class BaseEffect implements Effect {
  // 共通プロパティ
  public readonly id: string;
  public readonly name: string;
  public readonly type: EffectType;
  public readonly description: string;
  public readonly cardId: number;

  // 抽象メソッド（継承先で実装）
  abstract canActivate(state: DuelState): boolean;
  abstract execute(state: DuelState): EffectResult;

  // 共通処理
  protected preExecute(state: DuelState, context?: EffectContext): boolean;
  protected postExecute(result: EffectResult, state: DuelState): EffectResult;
  protected checkWinCondition(state: DuelState): boolean;
}
```

### 2. atoms（原子効果層）

再利用可能な基本効果を実装：

```typescript
export class DrawEffect extends BaseEffect {
  private readonly drawCount: number;

  constructor(id: string, name: string, description: string, cardId: number, drawCount: number) {
    super(id, name, EffectType.DRAW, description, cardId);
    this.drawCount = drawCount;
  }

  canActivate(state: DuelState): boolean {
    return state.mainDeck.length >= this.drawCount;
  }

  execute(state: DuelState): EffectResult {
    // N枚ドロー処理の実装
  }
}
```

### 3. cards（カード固有効果層）

特定カードの効果を原子効果の継承により実装：

```typescript
export class PotOfGreedEffect extends DrawEffect {
  constructor() {
    super("pot-of-greed-55144522", "強欲な壺", "自分はデッキから２枚ドローする", 55144522, 2);
  }

  canActivate(state: DuelState): boolean {
    // 基本のドロー条件をチェック
    if (!super.canActivate(state)) {
      return false;
    }

    // 通常魔法の発動条件（メインフェイズのみ）
    const isMainPhase = state.currentPhase === "メインフェイズ1" || state.currentPhase === "メインフェイズ2";
    return isMainPhase && state.gameResult === "ongoing";
  }
}
```

## ファクトリーパターン

メモリ効率と拡張性を両立するため、ファクトリーパターンを採用：

### EffectRegistry

```typescript
export class EffectRegistry {
  private static effects = new Map<number, EffectFactory>();

  static register(cardId: number, factory: EffectFactory): void {
    this.effects.set(cardId, factory);
  }

  static getEffects(cardId: number): Effect[] {
    const factory = this.effects.get(cardId);
    return factory ? factory() : [];
  }
}
```

### 利点

- **メモリ効率**: 効果インスタンスは必要時のみ生成
- **再利用性**: 同一カードIDで複数回効果を取得可能
- **拡張性**: 新しい効果を動的に登録可能

## デッキレシピベース登録システム

効果の登録は、デッキレシピの構成に基づいて動的に行われます：

### デッキレシピの拡張

```typescript
export interface RecipeCardEntry {
  id: number;           // YGOPRODeck API の数値 ID
  quantity: number;     // 枚数
  effectClass?: string; // 効果クラス名（オプション）
}
```

### 動的登録プロセス

```typescript
export class CardEffectRegistrar {
  static registerEffectsFromDeck(deck: DeckRecipe): void {
    // 1. 既存効果をクリア
    EffectRegistry.clear();

    // 2. デッキ内のユニークカードを抽出
    const uniqueCards = new Map<number, string | undefined>();
    for (const card of [...deck.mainDeck, ...deck.extraDeck]) {
      uniqueCards.set(card.id, card.effectClass);
    }

    // 3. 効果クラスが指定されたカードの効果を登録
    for (const [cardId, effectClass] of uniqueCards) {
      const effectFactory = this.getEffectFactoryByClass(cardId, effectClass);
      if (effectFactory) {
        EffectRegistry.register(cardId, effectFactory);
      }
    }
  }
}
```

### 設定ファイルによる一元管理

```typescript
// cardEffectsRegistry.ts
export const CARD_EFFECTS_REGISTRY = {
  PotOfGreedEffect,
  // 新しいカード効果を追加する際はここに1行追加するだけ
} as const;
```

## 型システム設計

TypeScriptによる厳密な型チェックを実現：

### 効果の型定義

```typescript
export enum EffectType {
  DRAW = "draw",
  SEARCH = "search",
  WIN_CONDITION = "win_condition",
  ACTIVATE = "activate",
  TRAP = "trap",
}

export interface EffectResult {
  success: boolean;
  message: string;
  affectedCards?: Card[];
  stateChanged: boolean;
  gameEnded?: boolean;
  nextEffectId?: string;
}

export interface Effect {
  id: string;
  name: string;
  type: EffectType;
  description: string;
  cardId: number;
  canActivate(state: DuelState): boolean;
  execute(state: DuelState): EffectResult;
}
```

### 型安全な効果登録

```typescript
export type RegisteredCardEffectClassName = keyof typeof CARD_EFFECTS_REGISTRY;

export function isRegisteredCardEffect(className: string): className is RegisteredCardEffectClassName {
  return className in CARD_EFFECTS_REGISTRY;
}
```

## テスト戦略

包括的なテスト戦略により、システムの信頼性を確保：

### 1. 単体テスト

```typescript
// DrawEffect.test.ts
describe("DrawEffect", () => {
  it("2枚ドロー効果が正常に動作する", () => {
    const result = drawEffect2.execute(duelState);
    expect(result.success).toBe(true);
    expect(result.message).toBe("2枚ドローしました");
    expect(duelState.hands.length).toBe(initialHandSize + 2);
  });
});
```

### 2. 統合テスト

```typescript
// integration.test.ts
describe("Effects Integration", () => {
  it("フルワークフロー: 登録→取得→実行", () => {
    // 1. 効果が登録されていることを確認
    expect(EffectRegistry.hasEffects(55144522)).toBe(true);

    // 2. DuelStateから効果を取得
    const effects = duelState.getEffectsForCard(55144522);
    expect(effects).toHaveLength(1);

    // 3. 効果を実行
    const result = duelState.executeEffect(effects[0]);
    expect(result.success).toBe(true);
  });
});
```

### 3. エラーハンドリングテスト

```typescript
it("発動条件を満たさない場合は失敗する", () => {
  duelState.currentPhase = "バトルフェイズ";
  const result = duelState.executeEffect(potOfGreed);
  expect(result.success).toBe(false);
  expect(result.message).toContain("強欲な壺は発動できません");
});
```

## 拡張性と保守性

### 新しいカード効果の追加手順

1. **原子効果の作成**（必要に応じて）
   ```typescript
   // atoms/SearchEffect.ts
   export class SearchEffect extends BaseEffect {
     // サーチ効果の実装
   }
   ```

2. **カード固有効果の実装**
   ```typescript
   // cards/SangenOfTheYangZingEffect.ts
   export class SangenOfTheYangZingEffect extends SearchEffect {
     constructor() {
       super("sangen-12345", "源竜星－望天門", "デッキからカードをサーチ", 12345, searchConditions);
     }
   }
   ```

3. **効果登録設定への追加**
   ```typescript
   // cardEffectsRegistry.ts
   export const CARD_EFFECTS_REGISTRY = {
     PotOfGreedEffect,
     SangenOfTheYangZingEffect, // ← 1行追加するだけ
   } as const;
   ```

4. **デッキレシピでの指定**
   ```typescript
   { id: 12345, quantity: 1, effectClass: "SangenOfTheYangZingEffect" }
   ```

### 保守性の特徴

- **責任分離**: 各クラスが明確な責任を持つ
- **疎結合**: インターフェースによる依存関係の抽象化
- **設定駆動**: ハードコーディングを最小限に抑制
- **型安全性**: コンパイル時エラー検知

## 実装例: 強欲な壺

実際の効果実装を例に、設計思想を説明：

### 継承による効果構築

```typescript
export class PotOfGreedEffect extends DrawEffect {
  constructor() {
    super(
      "pot-of-greed-55144522",
      "強欲な壺", 
      "自分はデッキから２枚ドローする",
      55144522,
      2 // ドロー枚数
    );
  }

  canActivate(state: DuelState): boolean {
    // 1. 基本ドロー条件のチェック（DrawEffectから継承）
    if (!super.canActivate(state)) {
      return false;
    }

    // 2. 通常魔法固有の発動条件
    const isMainPhase = state.currentPhase === "メインフェイズ1" || 
                       state.currentPhase === "メインフェイズ2";
    
    if (!isMainPhase) {
      console.warn(`[PotOfGreedEffect] 通常魔法は${state.currentPhase}では発動できません`);
      return false;
    }

    // 3. ゲーム状態の確認
    if (state.gameResult !== "ongoing") {
      console.warn(`[PotOfGreedEffect] ゲームが既に終了しています: ${state.gameResult}`);
      return false;
    }

    return true;
  }
}
```

### OCGルールの実装

- **フェイズ制限**: メインフェイズでのみ発動可能
- **デッキ枚数チェック**: 必要枚数の確認
- **ゲーム状態確認**: 継続中のゲームでのみ発動
- **エラーハンドリング**: 適切なエラーメッセージの提供

## 開発ガイド

### 開発環境セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm run test

# 型チェック
npm run check

# コード品質チェック
npm run lint
```

### デバッグとログ

効果システムには包括的なログ機能が組み込まれています：

```typescript
// 効果実行時の詳細ログ
console.log(`[Effect] ${this.name} (${this.id}) の実行を開始します`);
console.log(`[Effect] デバッグ情報: ゲーム状態 = ${state.gameResult}, フェイズ = ${state.currentPhase}`);

// 登録プロセスのトレース
console.log(`[CardEffectRegistrar] カードID ${cardId} (${effectClass}) の効果を登録しました`);
```

### パフォーマンス考慮事項

- **ファクトリーパターン**: インスタンス生成の最適化
- **重複除去**: 同一カードIDの効果は1つのファクトリーのみ登録
- **遅延評価**: 効果の実行時のみインスタンス化
- **メモリ管理**: 不要な効果の自動クリア

---

この設計により、遊戯王OCGの複雑な効果システムを、拡張性と保守性を保ちながら実装することができています。新しいカード効果の追加は最小限のコード変更で行え、型安全性により開発時のエラーを大幅に削減できます。