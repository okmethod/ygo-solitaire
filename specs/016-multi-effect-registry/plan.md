# Implementation Plan: 複数効果登録対応レジストリ

**Branch**: `016-multi-effect-registry` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-multi-effect-registry/spec.md`

## Summary

ChainableActionRegistry を拡張し、1つのカードIDに対して複数の効果（activation/ignition）を登録・取得できるようにする。現状の `Map<number, ChainableAction>` 構造を `Map<number, CardEffectEntry>` に変更し、明示的なAPI（`getActivation()`, `getIgnitionEffects()`）を提供する。これにより、ActivateIgnitionEffectCommand のハードコード問題を解消し、新しいカードの起動効果追加時の開発効率を大幅に向上させる。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)
**Primary Dependencies**: Svelte 5, SvelteKit 2, Immer.js
**Storage**: N/A（フロントエンドのみ、状態はメモリ内）
**Testing**: Vitest（単体テスト）, Playwright（E2Eテスト）
**Target Platform**: Web（SPA）
**Project Type**: single（フロントエンド専用）
**Performance Goals**: 特になし（レジストリ操作はO(1)維持）
**Constraints**: Domain Layer はフレームワーク非依存
**Scale/Scope**: カード効果の汎用化（2枚のカードで検証）

## Constitution Check

### Pre-Design Gate

| Principle                 | Status | Evidence                                                      |
| ------------------------- | ------ | ------------------------------------------------------------- |
| III. 最適解の選択と記録   | PASS   | spec.md にトレードオフと設計判断を記録済み                    |
| IV. 関心の分離            | PASS   | レジストリはDomain Layer、コマンドは既存パターンを踏襲        |
| V. 変更に対応できる設計   | PASS   | 将来の trigger/quick への拡張性を考慮した設計                 |
| VI. 理解しやすさ最優先    | PASS   | 明示的なAPI（getActivation/getIgnitionEffects）で曖昧さを排除 |
| VII. シンプルに問題を解決 | PASS   | 既存構造の最小限の拡張で対応                                  |
| VIII. テスト可能性        | PASS   | 既存テストパターンを踏襲、UIなしでテスト可能                  |

## Project Structure

### Documentation (this feature)

```text
specs/016-multi-effect-registry/
├── spec.md              # 仕様（作成済み）
├── plan.md              # 実装計画（本ファイル）
├── checklists/          # チェックリスト
│   └── requirements.md  # 要件チェックリスト
└── tasks.md             # タスク（/speckit.tasks で生成）
```

### Source Code (repository root)

```text
skeleton-app/src/lib/
├── domain/
│   ├── models/
│   │   ├── ChainableAction.ts         # effectCategory, effectId を追加
│   │   └── EffectCategory.ts          # 新規: 効果カテゴリ型定義
│   ├── registries/
│   │   └── ChainableActionRegistry.ts # 拡張: CardEffectEntry 構造に変更
│   ├── effects/
│   │   ├── index.ts                   # 登録処理を更新
│   │   └── actions/
│   │       ├── spells/individuals/
│   │       │   ├── ChickenGameActivation.ts    # effectCategory追加
│   │       │   └── ChickenGameIgnitionEffect.ts # 既存（更新）
│   │       └── monsters/individuals/
│   │           └── RoyalMagicalLibraryIgnitionEffect.ts # 新規
│   └── commands/
│       ├── ActivateIgnitionEffectCommand.ts   # ハードコード除去
│       └── ActivateSpellCommand.ts            # 新APIに移行
└── tests/
    └── unit/domain/
        ├── registries/ChainableActionRegistry.test.ts # 拡張
        └── commands/ActivateIgnitionEffectCommand.test.ts # 拡張
```

## Design Details

### 1. データモデル拡張

#### 1.1 EffectCategory 型（新規）

```typescript
// src/lib/domain/models/EffectCategory.ts
export type EffectCategory = "activation" | "ignition";
// 将来拡張: | "trigger" | "quick"
```

#### 1.2 ChainableAction インターフェース拡張

```typescript
// src/lib/domain/models/ChainableAction.ts
export interface ChainableAction {
  // 既存プロパティ
  readonly isCardActivation: boolean;
  readonly spellSpeed: 1 | 2 | 3;

  // 新規プロパティ
  readonly effectCategory: EffectCategory;
  readonly effectId: string; // 1ターンに1度制限用の一意識別子

  // 既存メソッド（変更なし）
  canActivate(state: GameState, sourceInstance: CardInstance): ValidationResult;
  createActivationSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];
  createResolutionSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[];
}
```

#### 1.3 CardEffectEntry インターフェース（新規）

```typescript
// src/lib/domain/registries/ChainableActionRegistry.ts 内
interface CardEffectEntry {
  activation?: ChainableAction; // 1つのカードに1つ
  ignitionEffects: ChainableAction[]; // 1つのカードに複数
  // 将来拡張: triggerEffects, quickEffects
}
```

### 2. レジストリAPI設計

#### 2.1 既存APIの廃止

```typescript
// 廃止: 曖昧なget()
static get(cardId: number): ChainableAction | undefined; // 削除
```

#### 2.2 新規API

```typescript
// src/lib/domain/registries/ChainableActionRegistry.ts
export class ChainableActionRegistry {
  private static effects = new Map<number, CardEffectEntry>();

  // 登録API
  static registerActivation(cardId: number, action: ChainableAction): void;
  static registerIgnition(cardId: number, action: ChainableAction): void;

  // 取得API
  static getActivation(cardId: number): ChainableAction | undefined;
  static getIgnitionEffects(cardId: number): ChainableAction[];
  static hasIgnitionEffects(cardId: number): boolean;

  // 既存API（維持）
  static clear(): void;
  static getRegisteredCardIds(): number[];
}
```

### 3. 呼び出し側の移行

#### 3.1 ActivateSpellCommand

```typescript
// Before
const chainableAction = ChainableActionRegistry.get(cardInstance.id);

// After
const activation = ChainableActionRegistry.getActivation(cardInstance.id);
```

#### 3.2 ActivateIgnitionEffectCommand

```typescript
// Before (ハードコード)
if (cardId !== 67616300) {
  return failureValidationResult(ValidationErrorCode.NO_IGNITION_EFFECT);
}
const ignitionEffect = new ChickenGameIgnitionEffect(this.cardInstanceId);

// After (汎用化)
const ignitionEffects = ChainableActionRegistry.getIgnitionEffects(cardInstance.id);
if (ignitionEffects.length === 0) {
  return failureValidationResult(ValidationErrorCode.NO_IGNITION_EFFECT);
}
// 発動可能な効果をフィルタ
const activatableEffects = ignitionEffects.filter((effect) => effect.canActivate(state, cardInstance).isValid);
```

### 4. 効果実装例

#### 4.1 ChickenGameActivation（更新）

```typescript
export class ChickenGameActivation extends FieldSpellAction {
  readonly effectCategory: EffectCategory = "activation";
  readonly effectId = "chicken-game-activation";
  // ...（既存実装を維持）
}
```

#### 4.2 ChickenGameIgnitionEffect（更新）

```typescript
export class ChickenGameIgnitionEffect implements ChainableAction {
  readonly effectCategory: EffectCategory = "ignition";
  readonly effectId = "chicken-game-ignition";
  // ...（既存実装を維持）
}
```

#### 4.3 RoyalMagicalLibraryIgnitionEffect（新規）

```typescript
export class RoyalMagicalLibraryIgnitionEffect implements ChainableAction {
  readonly isCardActivation = false;
  readonly spellSpeed = 1 as const;
  readonly effectCategory: EffectCategory = "ignition";
  readonly effectId = "royal-magical-library-ignition";

  constructor(private readonly cardInstanceId: string) {}

  canActivate(state: GameState): ValidationResult {
    // 簡略版: コスト条件なし
    // - ゲーム続行中
    // - メインフェイズ
    // - フィールド上に表側表示で存在
    // - 1ターンに1度制限
  }

  createActivationSteps(state: GameState): AtomicStep[] {
    // 発動記録（1ターンに1度制限）
  }

  createResolutionSteps(state: GameState): AtomicStep[] {
    // 1ドロー
    return [drawStep(1)];
  }
}
```

### 5. 登録処理の更新

```typescript
// src/lib/domain/effects/index.ts
function initializeChainableActionRegistry(): void {
  // 既存カード（activation）
  ChainableActionRegistry.registerActivation(55144522, new PotOfGreedActivation());
  ChainableActionRegistry.registerActivation(79571449, new GracefulCharityActivation());
  ChainableActionRegistry.registerActivation(67616300, new ChickenGameActivation());
  // ... 他のカード

  // 起動効果（ignition）
  ChainableActionRegistry.registerIgnition(67616300, new ChickenGameIgnitionEffect());
  ChainableActionRegistry.registerIgnition(70791313, new RoyalMagicalLibraryIgnitionEffect());
}
```

## Implementation Phases

### Phase 1: 基盤整備

1. EffectCategory 型を新規作成
2. ChainableAction インターフェースに effectCategory, effectId を追加
3. 全既存 ChainableAction 実装クラスに新プロパティを追加

### Phase 2: レジストリ拡張

4. CardEffectEntry インターフェースを定義
5. ChainableActionRegistry の内部構造を変更
6. 新規API（registerActivation, registerIgnition, getActivation, getIgnitionEffects）を実装
7. 既存 get() を削除

### Phase 3: 呼び出し側移行

8. ActivateSpellCommand を新APIに移行
9. ActivateIgnitionEffectCommand を汎用化
10. 効果登録処理（index.ts）を更新

### Phase 4: 新カード実装・検証

11. RoyalMagicalLibraryIgnitionEffect を実装
12. 王立魔法図書館のカードデータを登録
13. ユニットテスト・統合テストを作成・更新

### Phase 5: クリーンアップ

14. 不要なコードの削除
15. ドキュメント更新

## Risk Analysis

| リスク                                    | 影響度 | 対策                                                                 |
| ----------------------------------------- | ------ | -------------------------------------------------------------------- |
| 既存テストの破壊                          | 中     | 段階的な移行、テスト更新を同時実施                                   |
| 型エラーの波及                            | 低     | effectCategory/effectId をオプショナルにしない（コンパイル時に検出） |
| IgnitionEffect のインスタンス化タイミング | 中     | cardInstanceId を引数に取るファクトリ関数の導入を検討                |

## Success Criteria Mapping

| Criteria                             | Implementation                                       |
| ------------------------------------ | ---------------------------------------------------- |
| SC-001: チキンレースの共存           | registerActivation + registerIgnition で同一IDに登録 |
| SC-002: ハードコード除去             | getIgnitionEffects() による動的取得                  |
| SC-003: レジストリ登録のみで発動可能 | ActivateIgnitionEffectCommand の汎用化               |
| SC-004: 既存呼び出し側の移行         | getActivation() への移行                             |
| SC-005: 王立魔法図書館の検証         | RoyalMagicalLibraryIgnitionEffect の実装             |

## Critical Files

| ファイル                                                                                   | 変更内容                            |
| ------------------------------------------------------------------------------------------ | ----------------------------------- |
| `src/lib/domain/models/ChainableAction.ts`                                                 | effectCategory, effectId 追加       |
| `src/lib/domain/models/EffectCategory.ts`                                                  | 新規: 効果カテゴリ型定義            |
| `src/lib/domain/registries/ChainableActionRegistry.ts`                                     | CardEffectEntry構造、新API          |
| `src/lib/domain/commands/ActivateIgnitionEffectCommand.ts`                                 | ハードコード除去、汎用化            |
| `src/lib/domain/commands/ActivateSpellCommand.ts`                                          | 新APIに移行                         |
| `src/lib/domain/effects/index.ts`                                                          | registerActivation/registerIgnition |
| `src/lib/domain/effects/actions/monsters/individuals/RoyalMagicalLibraryIgnitionEffect.ts` | 新規                                |
