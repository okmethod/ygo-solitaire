# Implementation Plan: Card Effect Execution System

**Branch**: `004-card-effect-execution` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)

## Summary

「強欲な壺」と「天使の施し」の効果処理を、Clean Architectureの3層（Domain/Application/Presentation）に適切に分離して実装する。強欲な壺は2枚ドロー（自動実行）、天使の施しは3枚ドロー後に手札から2枚選択して捨てる（ユーザー入力あり）効果を実現する。

**技術アプローチ**:
- 既存のCommand Pattern（DrawCardCommand, ActivateSpellCommand）を拡張
- 既存のeffectResolutionStoreを活用して非同期効果解決フローを実装
- 新規Command（DiscardCardsCommand）を追加
- カード選択UI（CardSelectionModal）を新規作成

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit環境)
**Primary Dependencies**:
- Svelte 5 (Runes: $state, $derived, $effect)
- Skeleton UI v3
- TailwindCSS v4
- Immer.js (不変性保証)

**Storage**: メモリ内状態管理（gameStateStore, effectResolutionStore, cardSelectionStore）
**Testing**: Vitest (Unit/Integration) + Playwright (E2E)
**Target Platform**: Web (GitHub Pages + 開発時ローカル)
**Project Type**: Web (SvelteKit SPA)
**Performance Goals**: カード発動から効果完了まで即座（1秒以内）
**Constraints**:
- ブラウザのみ（オフライン動作）
- Clean Architecture遵守（Domain層はSvelte非依存）
**Scale/Scope**:
- 2つのカード効果のみ実装（強欲な壺、天使の施し）
- 将来的に他のカードにも拡張可能な設計

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Planning Principles (I-II)

- **I. 目的と手段の分離**: ✅
  - 目的: プレイヤーが遊戯王のコンボを体験できる
  - 手段: カード効果のシミュレーション実装

- **II. 段階的な理解の深化**: ✅
  - 仕様 → 設計 → 実装の段階を経る
  - Feature 003で確立したモーダルUIパターンを踏襲

### ✅ Architecture Principles (III-V)

- **III. 最適解の選択と記録**: ✅
  - 既存のCommand Patternを拡張（ADR-0003の方針に従う）
  - Effect Systemは廃止済み → Commandに統一

- **IV. 関心の分離**: ✅
  - Domain層: drawCards(), sendToGraveyard()（既存）
  - Application層: DiscardCardsCommand（新規）, effectResolutionStore（既存）
  - Presentation層: CardSelectionModal（新規）

- **V. 変更に対応できる設計**: ✅
  - カードID → 効果処理のマッピングで拡張可能
  - 将来的なカード追加に対応

### ✅ Coding Principles (VI-VIII)

- **VI. 理解しやすさ最優先**: ✅
  - 明確な命名: DiscardCardsCommand, cardSelectionStore
  - ユーザーストーリーに対応する実装

- **VII. シンプルに問題を解決する**: ✅
  - YAGNI: 2つのカードのみ実装（汎用的なEffect Systemは作らない）
  - 3回同じパターンが現れてから抽象化を検討

- **VIII. テスト可能性**: ✅
  - Domain層: 純粋関数（drawCards, sendToGraveyard）
  - Application層: Commandパターン
  - E2E: ユーザーフロー全体

### ✅ Project-Specific Principles (IX)

- **技術スタック整合**: ✅
  - TypeScript + Svelte + TailwindCSS（既存）
  - 新規依存なし

### ✅ Development Workflow

- **ブランチ戦略**: ✅
  - feature/004-card-effect-execution ブランチで作業
  - mainへの直接コミット禁止

- **コミット前品質保証**: ✅
  - npm run lint, npm run check, npm run test:run

**Constitution Check Result**: ✅ **PASS** - すべてのゲートをクリア

## Project Structure

### Documentation (this feature)

```text
specs/004-card-effect-execution/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - existing architecture)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
skeleton-app/
├── src/lib/
│   ├── domain/                          # Domain Layer
│   │   ├── models/
│   │   │   ├── GameState.ts             # (既存)
│   │   │   ├── Card.ts                  # (既存)
│   │   │   └── Zone.ts                  # (既存) drawCards, sendToGraveyard
│   │   ├── rules/
│   │   │   └── SpellActivationRule.ts   # (既存)
│   │   └── effects/                     # 🆕 Card Effect Architecture
│   │       ├── CardEffect.ts            # 🆕 新規 - インターフェース
│   │       ├── SpellEffect.ts           # 🆕 新規 - 魔法効果基底クラス
│   │       ├── NormalSpellEffect.ts     # 🆕 新規 - 通常魔法基底クラス
│   │       ├── CardEffectRegistry.ts    # 🆕 新規 - カードID→効果マッピング
│   │       └── cards/
│   │           ├── PotOfGreedEffect.ts       # 🆕 新規 - 強欲な壺
│   │           └── GracefulCharityEffect.ts  # 🆕 新規 - 天使の施し
│   │
│   ├── application/                     # Application Layer
│   │   ├── commands/
│   │   │   ├── GameCommand.ts           # (既存)
│   │   │   ├── DrawCardCommand.ts       # (既存)
│   │   │   ├── ActivateSpellCommand.ts  # (既存 - CardEffectRegistry使用に変更)
│   │   │   └── DiscardCardsCommand.ts   # 🆕 新規
│   │   ├── stores/
│   │   │   ├── gameStateStore.ts        # (既存)
│   │   │   └── cardSelectionStore.ts    # 🆕 新規
│   │   └── GameFacade.ts                # (既存 - discardCards追加)
│   │
│   ├── stores/                          # Presentation Layer Stores
│   │   └── effectResolutionStore.ts     # (既存 - 活用)
│   │
│   └── components/                      # Presentation Layer
│       ├── atoms/
│       │   └── Card.svelte              # (既存 - 選択モード対応)
│       └── modals/
│           ├── EffectResolutionModal.svelte  # (既存)
│           └── CardSelectionModal.svelte     # 🆕 新規
│
└── tests/
    ├── unit/
    │   ├── CardEffects.test.ts          # 🆕 新規 - カード効果テスト
    │   ├── DiscardCardsCommand.test.ts  # 🆕 新規
    │   └── ActivateSpellCommand.test.ts # (既存 - Commandフローのみテスト)
    ├── integration/
    │   └── CardEffectExecution.test.ts  # 🆕 新規
    └── e2e/
        └── card-effects.spec.ts         # 🆕 新規
```

**Structure Decision**:
既存のClean Architecture（Domain/Application/Presentation 3層）を維持し、各層に最小限の追加を行う。effectResolutionStoreやActivateSpellCommandなど、Feature 003で確立したパターンを最大限活用する。

## Card Effect Architecture Design

### Design Decision: Strategy Pattern with Class Hierarchy

**Problem**: 現在の`ActivateSpellCommand`でカードIDごとに分岐を増やすと、Open/Closed Principle違反となり、カード追加のたびに`ActivateSpellCommand.ts`を修正する必要がある。

**Solution**: かつての`BaseMagicEffect` → `PotOfGreedEffect`の設計を、新しいアーキテクチャ（GameState + effectResolutionStore）に適合させた**Strategy Pattern**を採用する。

### Class Hierarchy

```typescript
CardEffect (interface)
  ↓
SpellEffect (abstract class) - 魔法カード共通処理
  ↓
NormalSpellEffect (abstract class) - 通常魔法共通処理
  ↓
PotOfGreedEffect (concrete class) - 強欲な壺固有処理
```

### Component Responsibilities

#### 1. CardEffect (Interface)
```typescript
interface CardEffect {
  readonly cardId: number;
  canActivate(state: GameState): boolean;
  createSteps(state: GameState): EffectResolutionStep[];
}
```

#### 2. SpellEffect (Abstract Class)
- **責務**: 魔法カード共通のフェーズチェック、ゲームオーバーチェック
- **メソッド**:
  - `canActivate()`: ゲーム継続中チェック + フェーズチェック + サブクラス固有チェック
  - `canActivateSpell()`: サブクラスで実装（魔法固有の条件）

#### 3. NormalSpellEffect (Abstract Class)
- **責務**: 通常魔法共通の「Main1フェーズのみ発動可能」チェック
- **メソッド**: `spellType = "normal"` を定義

#### 4. PotOfGreedEffect / GracefulCharityEffect (Concrete Classes)
- **責務**: 各カード固有の効果処理
- **メソッド**:
  - `cardId`: カードID定義
  - `canActivateSpell()`: デッキ枚数チェック
  - `createSteps()`: EffectResolutionStep配列を生成

#### 5. CardEffectRegistry
- **責務**: カードID → CardEffectインスタンスのマッピング
- **メソッド**:
  - `get(cardId: number): CardEffect | undefined`

### Integration with ActivateSpellCommand

```typescript
// Before (Bad)
if (cardId === 55144522) {
  // Pot of Greed処理
} else if (cardId === 79571449) {
  // Graceful Charity処理
}

// After (Good)
const effect = CardEffectRegistry.get(cardId);
if (effect) {
  if (!effect.canActivate(state)) {
    return createFailureResult(state, "Cannot activate card effect");
  }
  const steps = effect.createSteps(state);
  effectResolutionStore.startResolution(steps);
}
```

### Benefits

1. **Open/Closed Principle遵守**: 新しいカード追加時、`ActivateSpellCommand`を変更しない
2. **単一責任**: 各カードの効果ロジックが1クラスに集約
3. **テストしやすい**: 各カード効果を独立してテスト可能
4. **遊戯王ルールに忠実**: 魔法/罠/モンスター効果の階層を表現可能
5. **共通処理の集約**: `SpellEffect`でフェーズチェックを一元管理

### Future Extensibility

- 速攻魔法: `QuickPlaySpellEffect extends SpellEffect`
- 永続魔法: `ContinuousSpellEffect extends SpellEffect`
- 罠カード: `TrapEffect extends CardEffect`
- モンスター効果: `MonsterEffect extends CardEffect`

## Complexity Tracking

**No violations** - この機能は既存アーキテクチャの自然な拡張であり、憲法のすべての原則に準拠している。Card Effect Architectureの導入により、Open/Closed Principleとコードの保守性が向上する。
