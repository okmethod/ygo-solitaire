# Implementation Plan: Spell Card Action Abstraction Refactoring

**Branch**: `012-spell-action-refactor` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/shohei/github/ygo-solitaire/specs/012-spell-action-refactor/spec.md`

## Summary

既存の10枚の魔法カード（通常魔法7枚、速攻魔法1枚、フィールド魔法2枚）のActionクラスに存在する大量の重複コード（約356行、17%）を抽象化により削減する。BaseSpellAction、NormalSpellAction、QuickPlaySpellAction、FieldSpellActionの抽象基底クラスと、createDrawStep、createSendToGraveyardStep等のヘルパー関数を実装し、各カードの実装を15-30行程度に削減する。リファクタリング後も既存の全545テストを100%パスさせ、コードの保守性を向上させる。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)
**Primary Dependencies**: Svelte 5 (Runes mode), SvelteKit 2, Immer.js (immutability), Vitest (unit testing), Playwright (E2E testing)
**Storage**: N/A (frontend only, state is managed in memory)
**Testing**: Vitest (unit tests), Playwright (E2E tests)
**Target Platform**: Web browser (SPA)
**Project Type**: Single project (frontend monorepo in `skeleton-app/`)
**Performance Goals**: No significant performance impact from refactoring (acceptable overhead: <5%)
**Constraints**: Must maintain 100% test pass rate (545 existing tests), must not break Clean Architecture boundaries (Domain Layer independence)
**Scale/Scope**: 10 spell card Action classes (~2123 LOC) → target: ~250-500 LOC (75-83% reduction)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: 目的と手段の分離 (Purpose-Means Separation)

**Status**: ✅ PASS

**Why (目的)**: コードの重複を削減し、新規カード追加時の実装コストを下げ、保守性を向上させる
**What/How (手段)**: 抽象基底クラスとヘルパー関数による共通処理の抽出

目的が明確で、手段との分離ができている。

### Principle IV: 関心の分離 (Separation of Concerns)

**Status**: ✅ PASS

このリファクタリングは Domain Layer (`skeleton-app/src/lib/domain/effects/`) のみを対象とし、レイヤー境界を維持する。UI層やApplication層への影響はない。

- ゲームロジック（Domain Layer）: ✅ リファクタリング対象
- インターフェース層（Application Layer）: 変更なし
- UI層（Presentation Layer）: 変更なし

### Principle VII: シンプルに問題を解決する (Simplicity)

**Status**: ✅ PASS

抽象化の条件「3回同じパターンが現れてから」を満たしている:
- 通常魔法カード: 7枚（95%の類似度）
- ドロー処理: 150行の重複
- 墓地送り処理: 96行の重複
- カード選択処理: 110行の重複

過剰な抽象化ではなく、実際に繰り返し現れているパターンを抽象化する適切な判断。

### Principle VIII: テスト可能性を意識する (Testability)

**Status**: ✅ PASS

既存の全545テストを100%パスさせることで品質を保証。リファクタリング後もテスト可能性は維持される。

**Constitution Check Summary**: ✅ **ALL GATES PASSED** - No violations, no complexity tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/012-spell-action-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT YET CREATED)
```

**Note**: Phase 0 (research.md) and Phase 1 (data-model.md, contracts/, quickstart.md) are **NOT applicable** to this refactoring feature. This is an internal code quality improvement that does not introduce new entities or APIs.

### Source Code (repository root)

**Current Structure**:

```text
skeleton-app/src/lib/domain/effects/
├── chainable/                     # Concrete card implementations (10 files, flat structure)
│   ├── PotOfGreedAction.ts        # 186 LOC → target: ~20 LOC
│   ├── GracefulCharityAction.ts   # 220 LOC → target: ~30 LOC
│   ├── OneDayOfPeaceAction.ts     # 229 LOC → target: ~25 LOC
│   ├── MagicalMalletAction.ts     # 259 LOC → target: ~35 LOC
│   ├── UpstartGoblinAction.ts     # 197 LOC → target: ~22 LOC
│   ├── DarkFactoryAction.ts       # 203 LOC → target: ~25 LOC
│   ├── TerraformingAction.ts      # 212 LOC → target: ~28 LOC
│   ├── CardDestructionAction.ts   # 241 LOC → target: ~30 LOC (Quick-Play)
│   ├── ChickenGameActivation.ts   # 184 LOC → target: ~20 LOC (Field)
│   └── ChickenGameIgnitionEffect.ts # 192 LOC → target: ~22 LOC (Field)
├── additional/                    # AdditionalRule implementations (flat structure)
│   └── ChickenGameContinuousRule.ts
├── models/                        # ChainableAction interface (unchanged)
│   ├── ChainableAction.ts
│   └── EffectResolutionStep.ts
├── registries/                    # Registry pattern (unchanged)
│   ├── ChainableActionRegistry.ts
│   └── AdditionalRuleRegistry.ts
└── index.ts                       # Public API (updated with new exports)
```

**Refactored Structure** (after implementation):

```text
skeleton-app/src/lib/domain/effects/
├── base/                          # NEW: Abstract base classes
│   └── spell/                     # Spell-specific abstractions
│       ├── BaseSpellAction.ts     # Common logic for all spell cards
│       ├── NormalSpellAction.ts   # Normal Spell abstraction
│       ├── QuickPlaySpellAction.ts # Quick-Play Spell abstraction
│       └── FieldSpellAction.ts    # Field Spell abstraction
│
├── builders/                      # NEW: Helper functions for EffectResolutionStep
│   ├── stepBuilders.ts            # Primitive step creation functions
│   └── index.ts                   # Public API for builders
│
├── actions/                       # Card activation effects (renamed from chainable/)
│   └── spell/                     # Spell card implementations
│       ├── PotOfGreedAction.ts    # Extends NormalSpellAction (~20 LOC)
│       ├── GracefulCharityAction.ts # Extends NormalSpellAction (~30 LOC)
│       ├── OneDayOfPeaceAction.ts # Extends NormalSpellAction (~25 LOC)
│       ├── MagicalMalletAction.ts # Extends NormalSpellAction (~35 LOC)
│       ├── UpstartGoblinAction.ts # Extends NormalSpellAction (~22 LOC)
│       ├── DarkFactoryAction.ts   # Extends NormalSpellAction (~25 LOC)
│       ├── TerraformingAction.ts  # Extends NormalSpellAction (~28 LOC)
│       ├── CardDestructionAction.ts # Extends QuickPlaySpellAction (~30 LOC)
│       ├── ChickenGameActivation.ts # Extends FieldSpellAction (~20 LOC)
│       └── ChickenGameIgnitionEffect.ts # Extends FieldSpellAction (~22 LOC)
│
├── rules/                         # Continuous rule effects (renamed from additional/)
│   └── spell/                     # Spell card continuous effects
│       ├── ChickenGameContinuousEffect.ts
│       └── ExodiaNonEffect.ts
│
├── models/                        # Domain models (unchanged)
│   ├── ChainableAction.ts
│   └── EffectResolutionStep.ts
│
├── registries/                    # Registry pattern (unchanged)
│   ├── ChainableActionRegistry.ts
│   └── AdditionalRuleRegistry.ts
│
└── index.ts                       # Updated with new exports (base/, builders/)
```

**Test Structure**:

```text
skeleton-app/tests/unit/domain/effects/
├── base/                          # NEW: Tests for abstract classes
│   └── spell/                     # Spell-specific abstract class tests
│       ├── NormalSpellAction.test.ts
│       ├── QuickPlaySpellAction.test.ts
│       └── FieldSpellAction.test.ts
│
├── builders/                      # NEW: Tests for helper functions
│   └── stepBuilders.test.ts
│
├── actions/                       # Card tests (renamed from chainable/)
│   └── spell/                     # Spell card tests
│       ├── PotOfGreedAction.test.ts   # All tests must still pass
│       ├── GracefulCharityAction.test.ts
│       ├── ... (8 more files)
│
├── rules/                         # Rule tests (renamed from additional/)
│   └── spell/                     # Spell rule tests
│       ├── ChickenGameContinuousEffect.test.ts
│       └── ExodiaNonEffect.test.ts
│
└── helpers/                       # NEW (P3): Common test helpers
    └── spellActionTestHelpers.ts  # Shared test utilities
```

**Structure Decision**: This is a Single Project (frontend SPA) with Clean Architecture layers. The refactoring introduces two new subdirectories (`base/` and `builders/`) within the existing `domain/effects/` structure to organize abstraction layers. All changes are contained within the Domain Layer, maintaining the existing architecture.

## Complexity Tracking

**No complexity tracking required** - All Constitution Check gates passed without violations.

## Phase 0: Outline & Research

**Status**: ✅ **NOT APPLICABLE** - This is a refactoring feature with clear technical context.

**Reason**: All technical decisions are already well-understood from the existing codebase. No research is needed for:
- TypeScript patterns for abstract classes (already in use)
- Helper function design (standard utility pattern)
- Testing strategy (existing 545 tests provide full coverage)

**Skipping research.md creation** - Proceeding directly to Phase 1 design.

## Phase 1: Design & Contracts

### 1. Directory & File Naming Conventions

**Abstract Base Classes** (`base/spell/` directory):

| File Name                    | Class Name              | Purpose                                   |
| ---------------------------- | ----------------------- | ----------------------------------------- |
| `BaseSpellAction.ts`         | `BaseSpellAction`       | Top-level abstract class for all spells  |
| `NormalSpellAction.ts`       | `NormalSpellAction`     | Abstract class for Normal Spells          |
| `QuickPlaySpellAction.ts`    | `QuickPlaySpellAction`  | Abstract class for Quick-Play Spells      |
| `FieldSpellAction.ts`        | `FieldSpellAction`      | Abstract class for Field Spells           |

**Naming Pattern**: `{SpellType}SpellAction.ts` → `export abstract class {SpellType}SpellAction`

**Helper Functions** (`builders/` directory):

| File Name           | Exported Functions                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stepBuilders.ts`   | `createDrawStep`, `createSendToGraveyardStep`, `createCardSelectionStep`, `createDamageStep`, `createGainLifeStep`, `createShuffleStep`, `createReturnToDeckStep` |
| `index.ts`          | Re-exports all functions from `stepBuilders.ts`                                                                                                                       |

**Naming Pattern**: `create{ActionType}Step` → returns `EffectResolutionStep`

**Refactored Card Implementations** (`actions/spell/` directory):

All existing spell card files will be moved from `chainable/` to `actions/spell/` subdirectory (with `chainable/` → `actions/` rename). Files will be renamed to follow consistent naming conventions (see File Naming Conventions below). Internal implementation will be updated to extend new abstract classes.

**File Naming Conventions for Effect Implementations**:

| Effect Type | Suffix | Example | Description |
| ----------- | ------ | ------- | ----------- |
| Card Activation | `Activation` | `PotOfGreedActivation.ts` | Normal/Quick-Play spell activation (activation = effect resolution) |
| Ignition Effect | `IgnitionEffect` | `ChickenGameIgnitionEffect.ts` | Activated effect from field (e.g., Field Spell ignition effect) |
| Continuous Effect | `ContinuousEffect` | `ChickenGameContinuousEffect.ts` | Passive continuous rule effect (AdditionalRule) |
| Non-Effect | `NonEffect` | `ExodiaNonEffect.ts` | Effect-external text (cannot be negated) - e.g., special win conditions |

**Rationale**:
- **Domain alignment**: Matches Yu-Gi-Oh! terminology (Activation, Ignition Effect, Continuous Effect)
- **Clarity**: File name immediately indicates effect type
- **Consistency**: Single standard applies to all card types (spell, monster, trap)
- **Extensibility**: Pattern naturally extends to future card types

**Current → Refactored Naming**:

| Current File | New File | Effect Type |
| ------------ | -------- | ----------- |
| `PotOfGreedAction.ts` | `PotOfGreedActivation.ts` | Normal Spell activation |
| `GracefulCharityAction.ts` | `GracefulCharityActivation.ts` | Normal Spell activation |
| `OneDayOfPeaceAction.ts` | `OneDayOfPeaceActivation.ts` | Normal Spell activation |
| `MagicalMalletAction.ts` | `MagicalMalletActivation.ts` | Normal Spell activation |
| `UpstartGoblinAction.ts` | `UpstartGoblinActivation.ts` | Normal Spell activation |
| `DarkFactoryAction.ts` | `DarkFactoryActivation.ts` | Normal Spell activation |
| `TerraformingAction.ts` | `TerraformingActivation.ts` | Normal Spell activation |
| `CardDestructionAction.ts` | `CardDestructionActivation.ts` | Quick-Play Spell activation |
| `ChickenGameActivation.ts` | `ChickenGameActivation.ts` | Field Spell activation (unchanged) |
| `ChickenGameIgnitionEffect.ts` | `ChickenGameIgnitionEffect.ts` | Field Spell ignition effect (unchanged) |
| `ChickenGameContinuousRule.ts` | `ChickenGameContinuousEffect.ts` | Field Spell continuous effect |
| `ExodiaVictoryRule.ts` | `ExodiaNonEffect.ts` | Non-effect (special win condition) |

### 2. Abstract Class Hierarchy Design

#### BaseSpellAction (Top-Level Abstract Class)

**File**: `skeleton-app/src/lib/domain/effects/base/spell/BaseSpellAction.ts`

**Responsibilities**:
- Implements `ChainableAction` interface
- Provides common properties: `isCardActivation = true`, `spellSpeed` (abstract)
- Provides common `canActivate()` with game-over check
- Provides default `createActivationSteps()` (can be overridden)
- Declares abstract `createResolutionSteps()`

**Key Methods**:

```typescript
export abstract class BaseSpellAction implements ChainableAction {
  readonly isCardActivation = true;
  abstract readonly spellSpeed: 1 | 2;

  // Common game-over check
  canActivate(state: GameState): boolean {
    if (state.result.isGameOver) return false;
    return this.additionalActivationConditions(state);
  }

  // Subclasses override this for card-specific conditions
  protected abstract additionalActivationConditions(state: GameState): boolean;

  // Default activation step (can be overridden)
  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return [{
      id: `${this.getCardId()}-activation`,
      summary: "カード発動",
      description: this.getActivationDescription(),
      notificationLevel: "info",
      action: (currentState) => ({
        success: true,
        newState: currentState,
        message: `${this.getCardName()} activated`,
      }),
    }];
  }

  // Card-specific implementation required
  abstract createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[];

  // Helper methods for subclasses
  protected abstract getCardId(): string;
  protected abstract getCardName(): string;
  protected abstract getActivationDescription(): string;
}
```

#### NormalSpellAction (Normal Spell Abstract Class)

**File**: `skeleton-app/src/lib/domain/effects/base/spell/NormalSpellAction.ts`

**Responsibilities**:
- Extends `BaseSpellAction`
- Sets `spellSpeed = 1`
- Adds Main Phase check to `canActivate()`
- Provides default activation step for normal spells

**Key Methods**:

```typescript
export abstract class NormalSpellAction extends BaseSpellAction {
  readonly spellSpeed = 1 as const;

  // Override to add Main Phase check
  canActivate(state: GameState): boolean {
    if (state.result.isGameOver) return false;
    if (state.phase !== "Main1") return false;
    return this.additionalActivationConditions(state);
  }

  // Subclasses only implement card-specific conditions
  protected abstract additionalActivationConditions(state: GameState): boolean;

  // Subclasses only implement resolution steps
  abstract createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[];

  // Subclasses provide card metadata
  protected abstract getCardId(): string;
  protected abstract getCardName(): string;
  protected abstract getActivationDescription(): string;
}
```

#### QuickPlaySpellAction (Quick-Play Spell Abstract Class)

**File**: `skeleton-app/src/lib/domain/effects/base/spell/QuickPlaySpellAction.ts`

**Responsibilities**:
- Extends `BaseSpellAction`
- Sets `spellSpeed = 2`
- Same Main Phase check as Normal Spell (for current scope - no opponent turn activation yet)

**Key Methods**:

```typescript
export abstract class QuickPlaySpellAction extends BaseSpellAction {
  readonly spellSpeed = 2 as const;

  // Same as NormalSpellAction for current scope
  canActivate(state: GameState): boolean {
    if (state.result.isGameOver) return false;
    if (state.phase !== "Main1") return false;
    return this.additionalActivationConditions(state);
  }

  // Future extension: Remove Main Phase check when opponent turn activation is implemented

  protected abstract additionalActivationConditions(state: GameState): boolean;
  abstract createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[];
  protected abstract getCardId(): string;
  protected abstract getCardName(): string;
  protected abstract getActivationDescription(): string;
}
```

#### FieldSpellAction (Field Spell Abstract Class)

**File**: `skeleton-app/src/lib/domain/effects/base/spell/FieldSpellAction.ts`

**Responsibilities**:
- Extends `BaseSpellAction`
- Sets `spellSpeed = 1`
- Adds Main Phase check (same as Normal Spell)
- Field-specific logic (if needed in future - currently minimal difference)

**Key Methods**:

```typescript
export abstract class FieldSpellAction extends BaseSpellAction {
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean {
    if (state.result.isGameOver) return false;
    if (state.phase !== "Main1") return false;
    return this.additionalActivationConditions(state);
  }

  // Field Spells stay on field - no graveyard step in resolution
  // Activation is handled by ActivateSpellCommand (places card on field)

  protected abstract additionalActivationConditions(state: GameState): boolean;
  abstract createResolutionSteps(state: GameState, instanceId: string): EffectResolutionStep[];
  protected abstract getCardId(): string;
  protected abstract getCardName(): string;
  protected abstract getActivationDescription(): string;
}
```

### 3. Helper Function Design (Step Builders)

**File**: `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`

All helper functions follow this pattern:
- **Function Name**: `create{Action}Step`
- **Return Type**: `EffectResolutionStep`
- **Parameters**: Minimal required for the specific action

#### createDrawStep

```typescript
/**
 * Creates an EffectResolutionStep for drawing cards from the deck
 * @param count Number of cards to draw
 * @param options Optional customization for id, summary, description
 */
export function createDrawStep(
  count: number,
  options?: {
    id?: string;
    summary?: string;
    description?: string;
  }
): EffectResolutionStep {
  return {
    id: options?.id ?? `draw-${count}`,
    summary: options?.summary ?? "カードをドロー",
    description: options?.description ?? `デッキから${count}枚ドローします`,
    notificationLevel: "info",
    action: (currentState: GameState) => {
      if (currentState.zones.deck.length < count) {
        return {
          success: false,
          newState: currentState,
          error: `Cannot draw ${count} cards. Not enough cards in deck.`,
        };
      }

      const newZones = drawCards(currentState.zones, count);
      const newState: GameState = {
        ...currentState,
        zones: newZones,
      };

      const victoryResult = checkVictoryConditions(newState);
      const finalState: GameState = {
        ...newState,
        result: victoryResult,
      };

      return {
        success: true,
        newState: finalState,
        message: `Drew ${count} card${count > 1 ? 's' : ''}`,
      };
    },
  };
}
```

#### createSendToGraveyardStep

```typescript
/**
 * Creates an EffectResolutionStep for sending a card to the graveyard
 */
export function createSendToGraveyardStep(
  instanceId: string,
  cardName: string,
  jaName: string,
  options?: { id?: string }
): EffectResolutionStep {
  return {
    id: options?.id ?? `${instanceId}-graveyard`,
    summary: "墓地へ送る",
    description: `${jaName}を墓地に送ります`,
    notificationLevel: "info",
    action: (currentState: GameState) => {
      const newZones = sendToGraveyard(currentState.zones, instanceId);
      const newState: GameState = {
        ...currentState,
        zones: newZones,
      };
      return {
        success: true,
        newState,
        message: `Sent ${cardName} to graveyard`,
      };
    },
  };
}
```

#### createCardSelectionStep

```typescript
/**
 * Creates an EffectResolutionStep for card selection (e.g., discard, target)
 */
export function createCardSelectionStep(config: {
  id: string;
  summary: string;
  description: string;
  availableCards: readonly CardInstance[] | [];
  minCards: number;
  maxCards: number;
  cancelable?: boolean;
  onSelect: (state: GameState, selectedIds: string[]) => GameCommandResult;
}): EffectResolutionStep {
  return {
    id: config.id,
    summary: config.summary,
    description: config.description,
    notificationLevel: "interactive",
    cardSelectionConfig: {
      availableCards: config.availableCards,
      minCards: config.minCards,
      maxCards: config.maxCards,
      summary: config.summary,
      description: config.description,
      cancelable: config.cancelable ?? false,
    },
    action: config.onSelect,
  };
}
```

#### Additional Helper Functions

```typescript
// Life point changes
export function createGainLifeStep(amount: number): EffectResolutionStep;
export function createDamageStep(amount: number): EffectResolutionStep;

// Deck manipulation
export function createShuffleStep(): EffectResolutionStep;
export function createReturnToDeckStep(instanceIds: string[]): EffectResolutionStep;
```

### 4. Migration Strategy (Incremental Refactoring)

**Phase-by-phase approach** to avoid breaking tests:

#### Phase 1: Foundation (Create abstractions without touching existing cards)

1. Create `skeleton-app/src/lib/domain/effects/base/spell/BaseSpellAction.ts`
2. Create `skeleton-app/src/lib/domain/effects/base/spell/NormalSpellAction.ts`
3. Create `skeleton-app/src/lib/domain/effects/base/spell/QuickPlaySpellAction.ts`
4. Create `skeleton-app/src/lib/domain/effects/base/spell/FieldSpellAction.ts`
5. Create `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`
6. Create `skeleton-app/src/lib/domain/effects/builders/index.ts`
7. Create unit tests for all new files
8. Update `skeleton-app/src/lib/domain/effects/index.ts` to export new classes/functions
9. Run all tests - **must pass 100% (545/545)**

#### Phase 2: Directory Restructuring (Rename directories + files + Move to spell/ subdirectories)

**Step 1: Rename top-level directories**
1. Rename `skeleton-app/src/lib/domain/effects/chainable/` → `actions/`
2. Rename `skeleton-app/src/lib/domain/effects/additional/` → `rules/`
3. Rename `skeleton-app/tests/unit/domain/effects/chainable/` → `actions/`
4. Rename `skeleton-app/tests/unit/domain/effects/additional/` → `rules/`

**Step 2: Rename effect implementation files (follow new naming convention)**

_Actions (8 files to rename):_
5. Rename `actions/PotOfGreedAction.ts` → `PotOfGreedActivation.ts`
6. Rename `actions/GracefulCharityAction.ts` → `GracefulCharityActivation.ts`
7. Rename `actions/OneDayOfPeaceAction.ts` → `OneDayOfPeaceActivation.ts`
8. Rename `actions/MagicalMalletAction.ts` → `MagicalMalletActivation.ts`
9. Rename `actions/UpstartGoblinAction.ts` → `UpstartGoblinActivation.ts`
10. Rename `actions/DarkFactoryAction.ts` → `DarkFactoryActivation.ts`
11. Rename `actions/TerraformingAction.ts` → `TerraformingActivation.ts`
12. Rename `actions/CardDestructionAction.ts` → `CardDestructionActivation.ts`

_Rules (2 files to rename):_
13. Rename `rules/ChickenGameContinuousRule.ts` → `ChickenGameContinuousEffect.ts`
14. Rename `rules/ExodiaVictoryRule.ts` → `ExodiaNonEffect.ts`

_Tests (10 files to rename):_
15. Rename all corresponding test files (8 Action tests + 2 Rule tests) with new suffixes

**Step 3: Update class names inside renamed files**
16. Update class names to match new file names (e.g., `PotOfGreedAction` → `PotOfGreedActivation`)
17. Update all imports of these classes throughout the codebase

**Step 4: Create spell/ subdirectories and move files**
18. Create `skeleton-app/src/lib/domain/effects/actions/spell/` directory
19. Move all 10 spell card Activation files to `actions/spell/`
20. Create `skeleton-app/src/lib/domain/effects/rules/spell/` directory
21. Move `ChickenGameContinuousEffect.ts` and `ExodiaNonEffect.ts` to `rules/spell/`
22. Create `skeleton-app/tests/unit/domain/effects/actions/spell/` directory
23. Move all 10 spell card test files to `tests/.../actions/spell/`
24. Create `skeleton-app/tests/unit/domain/effects/rules/spell/` directory
25. Move 2 rule test files to `tests/.../rules/spell/`

**Step 5: Update all import paths and references**
26. Update all import paths in moved files (relative paths: `../../` adjustments)
27. Update `skeleton-app/src/lib/domain/effects/index.ts` - change all:
   - `chainable/` → `actions/spell/`
   - `additional/` → `rules/spell/`
   - `xxxAction` → `xxxActivation` (8 files)
   - `ChickenGameContinuousRule` → `ChickenGameContinuousEffect`
   - `ExodiaVictoryRule` → `ExodiaNonEffect`
28. Update `skeleton-app/src/lib/domain/rules/VictoryRule.ts`:
   - `../effects/additional/ExodiaVictoryRule` → `../effects/rules/spell/ExodiaNonEffect`
29. Update `skeleton-app/src/lib/application/GameFacade.ts` - update import paths and class names
30. Update all test files that import from effects (26+ files total)
31. Update JSDoc `@module` comments in all moved files (12 files)
32. Update registry files (`ChainableActionRegistry.ts`, `AdditionalRuleRegistry.ts`) - update import paths and class names

**Step 6: Update documentation**
33. Update `docs/architecture/overview.md` - change directory references and class names
34. Update `docs/adr/0008-effect-model-and-clean-architecture.md` - change directory references and class names
35. Update any other documentation files mentioning old names

**Step 7: Validate**
36. Run all tests - **must pass 100% (545/545)**
37. Run lint/format checks
38. Verify no broken imports remain
39. Verify all class names updated consistently

#### Phase 3: Pilot Refactoring (Validate approach with 1 card)

1. Refactor `actions/spell/PotOfGreedActivation.ts` to extend `NormalSpellAction`
2. Run all Pot of Greed tests - **must pass 100%**
3. Run all 545 tests - **must pass 100%**
4. Measure LOC reduction (target: 186 LOC → ~20 LOC)

#### Phase 4: Normal Spell Refactoring (Remaining 6 cards)

1. Refactor `actions/spell/GracefulCharityActivation.ts`
2. Refactor `actions/spell/OneDayOfPeaceActivation.ts`
3. Refactor `actions/spell/MagicalMalletActivation.ts`
4. Refactor `actions/spell/UpstartGoblinActivation.ts`
5. Refactor `actions/spell/DarkFactoryActivation.ts`
6. Refactor `actions/spell/TerraformingActivation.ts`
7. After each card: run all tests - **must pass 100%**

#### Phase 5: Quick-Play Spell Refactoring

1. Refactor `actions/spell/CardDestructionActivation.ts` to extend `QuickPlaySpellAction`
2. Run all tests - **must pass 100%**

#### Phase 6: Field Spell Refactoring

1. Refactor `actions/spell/ChickenGameActivation.ts` to extend `FieldSpellAction`
2. Refactor `actions/spell/ChickenGameIgnitionEffect.ts` to extend `FieldSpellAction`
3. Run all tests - **must pass 100%**

#### Phase 7: Test Code Abstraction (P3 - Optional)

1. Create `skeleton-app/tests/unit/domain/effects/helpers/spellActionTestHelpers.ts`
2. Extract common test patterns (canActivate, immutability, etc.)
3. Refactor test files to use helpers
4. Run all tests - **must pass 100%**

### 5. Example: Pot of Greed Before/After

**Before** (186 LOC):

```typescript
export class PotOfGreedAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean {
    if (state.result.isGameOver) return false;
    if (state.phase !== "Main1") return false;
    if (state.zones.deck.length < 2) return false;
    return true;
  }

  createActivationSteps(state: GameState): EffectResolutionStep[] {
    return [{
      id: "pot-of-greed-activation",
      summary: "カード発動",
      description: "強欲な壺を発動します",
      notificationLevel: "info",
      action: (currentState: GameState) => ({
        success: true,
        newState: currentState,
        message: "Pot of Greed activated",
      }),
    }];
  }

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      { /* 60 lines for draw step */ },
      { /* 20 lines for graveyard step */ },
    ];
  }
}
```

**After** (~20 LOC):

```typescript
import { NormalSpellAction } from "../base/spell/NormalSpellAction";
import { createDrawStep, createSendToGraveyardStep } from "../builders";

export class PotOfGreedAction extends NormalSpellAction {
  protected additionalActivationConditions(state: GameState): boolean {
    return state.zones.deck.length >= 2;
  }

  protected getCardId(): string { return "pot-of-greed"; }
  protected getCardName(): string { return "Pot of Greed"; }
  protected getActivationDescription(): string { return "強欲な壺を発動します"; }

  createResolutionSteps(_state: GameState, activatedCardInstanceId: string): EffectResolutionStep[] {
    return [
      createDrawStep(2),
      createSendToGraveyardStep(activatedCardInstanceId, "Pot of Greed", "強欲な壺"),
    ];
  }
}
```

**Reduction**: 186 LOC → 20 LOC (89% reduction)

### 6. Critical Files for Implementation

**Most Important Files** (in order of implementation priority):

1. **`skeleton-app/src/lib/domain/effects/base/spell/NormalSpellAction.ts`**
   - Reason: 7 cards depend on this (most reused abstraction)
   - Dependencies: `BaseSpellAction`, `ChainableAction`, `GameState`

2. **`skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`**
   - Reason: Contains all helper functions (eliminates 356 lines of duplication)
   - Dependencies: `EffectResolutionStep`, `GameState`, `Zone` module, `VictoryRule`

3. **`skeleton-app/src/lib/domain/effects/actions/spell/PotOfGreedAction.ts`**
   - Reason: Pilot refactoring validates the entire approach
   - Dependencies: `NormalSpellAction`, `stepBuilders`

4. **`skeleton-app/src/lib/domain/effects/actions/spell/GracefulCharityAction.ts`**
   - Reason: Most complex card (card selection logic), validates helper flexibility
   - Dependencies: `NormalSpellAction`, `stepBuilders` (especially `createCardSelectionStep`)

5. **`skeleton-app/src/lib/domain/models/ChainableAction.ts`**
   - Reason: Interface definition - ensure abstract classes correctly implement it
   - Dependencies: None (this is the base interface)

### 7. Agent Context Update

Run the agent context update script after completing Phase 1 design:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Technologies to add**:
- Abstract Classes (TypeScript pattern)
- Factory Functions (Step Builders pattern)
- Incremental Refactoring (migration strategy)

## Phase 2: Tasks Generation

**Not included in this plan** - Use `/speckit.tasks` command to generate detailed task breakdown.

The task generation will create `specs/012-spell-action-refactor/tasks.md` with:
- Task breakdown for each User Story (P1, P1, P2, P3)
- Dependency graph showing execution order
- Parallel execution opportunities
- Test validation checkpoints

## Implementation Notes

### Constraints & Assumptions

1. **100% Test Pass Rate**: All 545 existing tests must pass after each incremental change
2. **No Behavior Changes**: Refactoring only - no functional changes to card effects
3. **Clean Architecture**: Domain Layer independence maintained (no Svelte/UI dependencies)
4. **Performance**: Acceptable overhead is <5% (abstraction layers should be negligible)
5. **Backward Compatibility**: ChainableActionRegistry continues to work without changes

### Success Metrics

- **Code Reduction**: Average 83% reduction (150 LOC → 25 LOC per card)
- **Test Coverage**: 100% pass rate maintained (545/545 tests)
- **Duplication Removal**: 356 lines of duplicate code eliminated
- **Implementation Time**: New cards take ~30 minutes instead of ~2 hours

### Future Extensions

This abstraction layer is designed to support:
- **Monster Cards**: Similar abstract base class hierarchy (`base/monster/`, `actions/monster/`)
- **Trap Cards**: Similar pattern for trap activation/resolution (`base/trap/`, `actions/trap/`)
- **Chain System**: Future integration with chain/stack resolution
- **Continuous Rules**: Continued independence from core card effects (`rules/monster/`, `rules/trap/`)

### Directory Naming Rationale

**Why `actions/` and `rules/` instead of `chainable/` and `additional/`?**

- **Domain clarity**: `actions/` and `rules/` describe the domain responsibility (card activation effects vs continuous rule effects), not the interface name
- **Discoverability**: New developers can understand the purpose without reading interface definitions
- **Consistency**: Aligns with ubiquitous language in the Yu-Gi-Oh! domain (cards have "actions" when activated, and some cards establish "rules" that persist)
- **Future extensibility**: Naturally extends to `actions/monster/`, `actions/trap/`, `rules/monster/`, etc.
