# Implementation Plan: 魔力カウンターシステムと永続効果トリガー機構

**Branch**: `017-magic-counter-system` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-magic-counter-system/spec.md`

## Summary

王立魔法図書館の永続効果（魔法カード発動時に魔力カウンターを置く）を実装する。これには以下の2つの主要な技術課題がある:

1. **カウンターシステムの導入**: `CardInstance` にカウンター情報を追加し、カード単位でカウンターを管理
2. **永続効果のトリガー機構**: `AdditionalRule` を拡張し、「特定イベント発生時に自動実行される永続効果」をサポート

既存の `AdditionalRule` は「判定追加・データ書き換え・処理置換」のパッシブな介入方式のみをサポートしているが、本機能では「イベントに反応してアクティブに状態変更を行う」新しいカテゴリ（`TriggerRule`）が必要となる。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)
**Primary Dependencies**: Svelte 5 (Runes mode), SvelteKit 2, Immer.js
**Storage**: N/A（フロントエンドのみ、状態はメモリ内）
**Testing**: Vitest（単体テスト）, Playwright（E2Eテスト）
**Target Platform**: Web（SPA）
**Project Type**: single（フロントエンド専用）
**Performance Goals**: カウンター操作は O(1)、トリガー処理は O(n) （フィールド上のカード数）
**Constraints**: Domain Layer はフレームワーク非依存、Svelte 5 Runes モード、Immer.js による不変性保持
**Scale/Scope**: 1枚のカード（王立魔法図書館）で機能検証、将来的な拡張性を考慮

## Constitution Check

### Pre-Design Gate

| Principle                 | Status | Evidence                                                                                    |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| III. 最適解の選択と記録   | PASS   | 既存の AdditionalRule パターンを拡張、spec.md に設計判断を記録                              |
| IV. 関心の分離            | PASS   | Domain Layer（カウンター/トリガー）、Application Layer（イベント発火）、Presentation（UI） |
| V. 変更に対応できる設計   | PASS   | カウンター種別・上限をカードごとに定義可能な汎用設計                                        |
| VI. 理解しやすさ最優先    | PASS   | 既存パターン（AdditionalRule, ChainableAction）を踏襲                                       |
| VII. シンプルに問題を解決 | PASS   | 最小限の拡張で P1 機能を実現、P2 は段階的に追加                                             |
| VIII. テスト可能性        | PASS   | Domain Layer のトリガー機構は UI なしでテスト可能                                           |

## Project Structure

### Documentation (this feature)

```text
specs/017-magic-counter-system/
├── spec.md              # 仕様（作成済み）
├── plan.md              # 実装計画（本ファイル）
├── research.md          # 調査結果
├── data-model.md        # データモデル設計
└── tasks.md             # タスク（/speckit.tasks で生成）
```

### Source Code (repository root)

```text
skeleton-app/src/lib/
├── domain/
│   ├── models/
│   │   ├── Card.ts                    # CardInstance にカウンター情報追加
│   │   ├── AdditionalRule.ts          # TriggerRule カテゴリ追加
│   │   ├── RuleContext.ts             # TriggerEvent 型追加
│   │   └── Counter.ts                 # 新規: カウンター型定義
│   ├── registries/
│   │   └── AdditionalRuleRegistry.ts  # collectTriggerRules メソッド追加
│   ├── effects/
│   │   ├── rules/
│   │   │   ├── index.ts               # 登録処理更新
│   │   │   └── monsters/
│   │   │       └── RoyalMagicalLibraryContinuousEffect.ts  # 新規: 永続効果
│   │   ├── steps/
│   │   │   └── counters.ts            # 新規: カウンター操作ステップ
│   │   └── actions/Ignitions/individuals/monsters/
│   │       └── RoyalMagicalLibraryIgnitionEffect.ts  # 更新: 起動効果にカウンター消費追加
│   └── commands/
│       └── ActivateSpellCommand.ts    # トリガー発火処理追加
├── application/
│   └── GameFacade.ts                  # トリガー実行フロー追加（必要に応じて）
├── presentation/
│   ├── components/
│   │   └── atoms/
│   │       └── SpellCounterBadge.svelte  # 新規: カウンター表示コンポーネント
│   └── assets/
│       └── SpellCounter.png           # 既存: カウンター画像
└── tests/
    └── unit/domain/
        ├── models/Counter.test.ts     # 新規
        └── effects/rules/RoyalMagicalLibraryContinuousEffect.test.ts  # 新規
```

## Design Details

### 1. カウンターシステム

#### 1.1 Counter 型定義（新規）

```typescript
// src/lib/domain/models/Counter.ts
export type CounterType = "spell" | "bushido" | "predator"; // 将来拡張可能

export interface CounterState {
  readonly type: CounterType;
  readonly count: number;
  readonly maxCount?: number; // カードごとの上限（undefined = 無制限）
}
```

#### 1.2 CardInstance 拡張

```typescript
// src/lib/domain/models/Card.ts
export interface CardInstance extends CardData {
  readonly instanceId: string;
  readonly location: ZoneName;
  readonly position?: Position;
  readonly battlePosition?: BattlePosition;
  readonly placedThisTurn: boolean;
  readonly counters: readonly CounterState[]; // 新規追加
}
```

#### 1.3 カウンター操作ヘルパー関数

```typescript
// src/lib/domain/models/Counter.ts
export function addCounter(
  counters: readonly CounterState[],
  type: CounterType,
  amount: number,
  maxCount?: number
): readonly CounterState[];

export function removeCounter(
  counters: readonly CounterState[],
  type: CounterType,
  amount: number
): readonly CounterState[];

export function getCounterCount(
  counters: readonly CounterState[],
  type: CounterType
): number;
```

### 2. 永続効果トリガー機構

#### 2.1 TriggerEvent 型

```typescript
// src/lib/domain/models/RuleContext.ts
export type TriggerEvent = "spellActivated" | "monsterSummoned" | "cardDestroyed";
// 将来拡張: "drawPhaseStart", "endPhaseStart" など

export interface RuleContext {
  // 既存フィールド
  damageAmount?: number;
  damageTarget?: string;
  targetCardInstanceId?: string;

  // 新規: トリガーイベント情報
  triggerEvent?: TriggerEvent;
  triggerSourceCardId?: number; // 発動元のカードID
  triggerSourceInstanceId?: string; // 発動元のカードインスタンスID
  [key: string]: unknown;
}
```

#### 2.2 AdditionalRule 拡張

```typescript
// src/lib/domain/models/AdditionalRule.ts
export type RuleCategory =
  // 既存カテゴリ
  | "NameOverride"
  | "StatusModifier"
  | "SummonCondition"
  | "SummonPermission"
  | "ActionPermission"
  | "VictoryCondition"
  | "ActionReplacement"
  | "SelfDestruction"
  // 新規カテゴリ
  | "TriggerRule"; // イベント発生時に自動実行

export interface AdditionalRule {
  readonly isEffect: boolean;
  readonly category: RuleCategory;

  // 既存メソッド
  canApply(state: GameState, context: RuleContext): boolean;
  apply?(state: GameState, context: RuleContext): GameState;
  checkPermission?(state: GameState, context: RuleContext): boolean;
  replace?(state: GameState, context: RuleContext): GameState;

  // 新規: トリガールール用
  readonly triggers?: readonly TriggerEvent[]; // 反応するイベント
  onTrigger?(state: GameState, context: RuleContext, sourceInstance: CardInstance): GameState;
}
```

#### 2.3 AdditionalRuleRegistry 拡張

```typescript
// src/lib/domain/registries/AdditionalRuleRegistry.ts
export class AdditionalRuleRegistry {
  // 既存メソッド
  static register(cardId: number, rule: AdditionalRule): void;
  static get(cardId: number): AdditionalRule[];
  static getByCategory(cardId: number, category: RuleCategory): AdditionalRule[];
  static collectActiveRules(state: GameState, category: RuleCategory, context?: RuleContext): AdditionalRule[];

  // 新規: トリガールール収集・実行
  static collectTriggerRules(state: GameState, event: TriggerEvent): Array<{
    rule: AdditionalRule;
    sourceInstance: CardInstance;
  }>;

  static executeTriggerRules(state: GameState, event: TriggerEvent, context: RuleContext): GameState;
}
```

### 3. 王立魔法図書館の永続効果実装

```typescript
// src/lib/domain/effects/rules/monsters/RoyalMagicalLibraryContinuousEffect.ts
export class RoyalMagicalLibraryContinuousEffect implements AdditionalRule {
  readonly isEffect = true;
  readonly category: RuleCategory = "TriggerRule";
  readonly triggers: readonly TriggerEvent[] = ["spellActivated"];

  private readonly MAX_SPELL_COUNTERS = 3;

  canApply(state: GameState, _context: RuleContext): boolean {
    // 王立魔法図書館がフィールドに表側表示で存在するか
    return state.zones.mainMonsterZone.some(
      (card) => card.id === 70791313 && card.position === "faceUp"
    );
  }

  onTrigger(state: GameState, context: RuleContext, sourceInstance: CardInstance): GameState {
    // sourceInstance は王立魔法図書館のインスタンス
    const currentCount = getCounterCount(sourceInstance.counters, "spell");

    // 上限チェック（王立魔法図書館固有の制限）
    if (currentCount >= this.MAX_SPELL_COUNTERS) {
      return state; // 何もしない
    }

    // カウンターを1つ追加
    const newCounters = addCounter(sourceInstance.counters, "spell", 1, this.MAX_SPELL_COUNTERS);
    const updatedCard = { ...sourceInstance, counters: newCounters };

    // GameState を更新（Immer.js パターン）
    return produce(state, (draft) => {
      const index = draft.zones.mainMonsterZone.findIndex(
        (c) => c.instanceId === sourceInstance.instanceId
      );
      if (index !== -1) {
        draft.zones.mainMonsterZone[index] = updatedCard;
      }
    });
  }
}
```

### 4. ActivateSpellCommand へのトリガー発火追加

```typescript
// src/lib/domain/commands/ActivateSpellCommand.ts
execute(state: GameState): GameStateUpdateResult {
  // 既存処理...
  const updatedState: GameState = {
    ...state,
    zones: this.moveActivatedSpellCard(state.zones, cardInstance),
    activatedOncePerTurnCards: updatedActivatedCards,
  };

  // 新規: 永続効果のトリガー発火
  const triggerContext: RuleContext = {
    triggerEvent: "spellActivated",
    triggerSourceCardId: cardInstance.id,
    triggerSourceInstanceId: cardInstance.instanceId,
  };
  const stateAfterTriggers = AdditionalRuleRegistry.executeTriggerRules(
    updatedState,
    "spellActivated",
    triggerContext
  );

  return successUpdateResult(
    stateAfterTriggers,
    `Spell card activated: ${this.cardInstanceId}`,
    this.buildEffectSteps(stateAfterTriggers, cardInstance),
  );
}
```

### 5. 起動効果（カウンター消費→ドロー）の更新

```typescript
// src/lib/domain/effects/actions/Ignitions/individuals/monsters/RoyalMagicalLibraryIgnitionEffect.ts
export class RoyalMagicalLibraryIgnitionEffect extends BaseIgnitionEffect {
  private readonly REQUIRED_COUNTERS = 3;

  protected individualConditions(state: GameState, sourceInstance: CardInstance): ValidationResult {
    // カウンターが3個以上あるか
    const currentCount = getCounterCount(sourceInstance.counters, "spell");
    if (currentCount < this.REQUIRED_COUNTERS) {
      return failureValidationResult(ValidationErrorCode.INSUFFICIENT_COUNTERS);
    }
    return successValidationResult();
  }

  protected individualActivationSteps(state: GameState, sourceInstance: CardInstance): AtomicStep[] {
    // カウンター消費ステップ
    return [removeCounterStep(sourceInstance.instanceId, "spell", this.REQUIRED_COUNTERS)];
  }

  protected individualResolutionSteps(_state: GameState, _sourceInstance: CardInstance): AtomicStep[] {
    return [drawStep(1)];
  }
}
```

### 6. UI表示（SpellCounterBadge）

```svelte
<!-- src/lib/presentation/components/atoms/SpellCounterBadge.svelte -->
<script lang="ts">
  import spellCounterImage from "$lib/presentation/assets/SpellCounter.png";

  interface SpellCounterBadgeProps {
    count: number;
    maxCount?: number;
  }

  let { count, maxCount }: SpellCounterBadgeProps = $props();
</script>

{#if count > 0}
  <div class="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 px-1 rounded">
    <img src={spellCounterImage} alt="魔力カウンター" class="w-4 h-4" />
    <span class="text-xs text-white font-bold">{count}{maxCount ? `/${maxCount}` : ""}</span>
  </div>
{/if}
```

## Implementation Phases

### Phase 1: データモデル基盤（P1必須）

1. `Counter.ts` を新規作成（CounterState, CounterType, ヘルパー関数）
2. `CardInstance` に `counters` フィールドを追加
3. `GameState` の初期化処理で空のカウンター配列を設定
4. カウンター操作のユニットテストを作成

### Phase 2: トリガー機構（P1必須）

5. `RuleContext` に `TriggerEvent` 型とトリガー関連フィールドを追加
6. `AdditionalRule` に `TriggerRule` カテゴリと `triggers`/`onTrigger` を追加
7. `AdditionalRuleRegistry` に `collectTriggerRules`/`executeTriggerRules` を実装
8. トリガー機構のユニットテストを作成

### Phase 3: 永続効果実装（P1必須）

9. `RoyalMagicalLibraryContinuousEffect` を実装
10. `AdditionalRuleRegistry` に登録
11. `ActivateSpellCommand` にトリガー発火処理を追加
12. 永続効果のユニットテスト・統合テストを作成

### Phase 4: UI表示（P1必須）

13. `SpellCounterBadge.svelte` を作成
14. `Card.svelte` または `DuelField.svelte` にカウンター表示を統合
15. カウンター表示の E2E テストを作成

### Phase 5: 起動効果更新（P2）

16. `RoyalMagicalLibraryIgnitionEffect` にカウンター消費ロジックを追加
17. `removeCounterStep` を `counters.ts` に実装
18. 起動効果のユニットテストを更新

### Phase 6: 複数体対応（P2）

19. 複数の王立魔法図書館が存在する場合のテストを作成
20. 各インスタンスの独立性を検証

### Phase 7: クリーンアップ

21. コードレビュー・リファクタリング
22. ドキュメント更新（effect-model.md など）

## Risk Analysis

| リスク                                       | 影響度 | 対策                                                           |
| -------------------------------------------- | ------ | -------------------------------------------------------------- |
| CardInstance 変更による既存テストの破壊      | 中     | `counters: []` をデフォルト値として段階的に移行                |
| トリガー発火タイミングの複雑化               | 中     | 現時点では「魔法発動時」のみに限定、将来的に拡張               |
| Immer.js と readonly の整合性                | 低     | produce() 内での変更のみ許可、型定義で保護                     |
| 永続効果の発生源追跡（TODO）                 | 低     | 本機能では先送り、将来的に sourceInstance を活用               |
| 複数のトリガールールが同時発火する場合の順序 | 中     | 現時点では登録順に実行、将来的にはタイムスタンプや優先度で制御 |

## Success Criteria Mapping

| Criteria                             | Implementation                                                   |
| ------------------------------------ | ---------------------------------------------------------------- |
| SC-001: 魔法発動時にカウンター蓄積   | `ActivateSpellCommand` → `executeTriggerRules` → `onTrigger`     |
| SC-002: UIにカウンター数を表示       | `SpellCounterBadge.svelte` を `DuelField.svelte` に統合          |
| SC-003: 複数体の独立管理             | `CardInstance.counters` によるインスタンス単位の管理             |
| SC-004: カウンター消費で起動効果発動 | `RoyalMagicalLibraryIgnitionEffect` の `individualConditions`    |
| SC-005: 既存フローを妨げない         | トリガー処理は `ActivateSpellCommand.execute()` 内で同期的に実行 |

## Critical Files for Implementation

1. **skeleton-app/src/lib/domain/models/Card.ts** - CardInstance に counters フィールドを追加する中心ファイル
2. **skeleton-app/src/lib/domain/models/AdditionalRule.ts** - TriggerRule カテゴリと onTrigger メソッドを追加する永続効果の基盤
3. **skeleton-app/src/lib/domain/registries/AdditionalRuleRegistry.ts** - トリガールール収集・実行メソッドを追加するレジストリ
4. **skeleton-app/src/lib/domain/commands/ActivateSpellCommand.ts** - 魔法発動時にトリガー発火処理を追加する起点
5. **skeleton-app/src/routes/(auth)/simulator/[deckId]/_components/DuelField.svelte** - カウンター表示を統合するUIコンポーネント

## 調査結果サマリ

**既存パターンの活用**:
- `AdditionalRule` の `canApply` / カテゴリ別メソッドパターンを踏襲
- `ChainableActionRegistry` のカードID→効果マッピングパターンを踏襲
- `AtomicStep` による効果処理ステップパターンを踏襲

**新規追加が必要な概念**:
- `CounterState` / `counters` フィールド（CardInstance の拡張）
- `TriggerRule` カテゴリと `onTrigger` メソッド（AdditionalRule の拡張）
- `executeTriggerRules` メソッド（AdditionalRuleRegistry の拡張）

**UI資材**:
- `SpellCounter.png` は既に `skeleton-app/src/lib/presentation/assets/` に配置済み
