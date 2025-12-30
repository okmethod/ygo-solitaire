# ChainableAction Contracts: 6 New Spell Cards

**Feature**: 011-card-pool-expansion
**Date**: 2025-12-30
**Status**: Complete

## Overview

6枚の新規通常魔法・速攻魔法カードのChainableActionインターフェース契約定義。各カードは`canActivate()`, `createActivationSteps()`, `createResolutionSteps()`を実装する。

---

## Common Contract

すべてのカードは以下のインターフェースを実装:

```typescript
interface ChainableAction {
  readonly isCardActivation: boolean;
  readonly spellSpeed: 1 | 2 | 3;
  canActivate(state: GameState): boolean;
  createActivationSteps(state: GameState): EffectResolutionStep[];
  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
}
```

---

## 1. UpstartGoblinAction

### Contract

```typescript
class UpstartGoblinAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean;
  // PRECONDITIONS:
  //   - !state.result.isGameOver
  //   - state.phase === "Main1"
  //   - state.zones.deck.length >= 1
  // RETURNS: true if all preconditions met

  createActivationSteps(state: GameState): EffectResolutionStep[];
  // RETURNS: [activation notification step]

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
  // RETURNS:
  //   [
  //     { id: "upstart-goblin-draw", action: draw 1 card },
  //     { id: "upstart-goblin-lp-gain", action: opponent gains 1000 LP },
  //     { id: "upstart-goblin-graveyard", action: send spell to graveyard }
  //   ]
}
```

### Test Cases

1. **Scenario**: Normal activation
   - **Given**: Main Phase 1, deck has 5 cards
   - **When**: Activate Upstart Goblin
   - **Then**: Player draws 1 card, opponent gains 1000 LP, spell sent to graveyard

2. **Scenario**: Cannot activate with empty deck
   - **Given**: Main Phase 1, deck has 0 cards
   - **When**: Check canActivate()
   - **Then**: Returns false

---

## 2. CeasefireVariantAction

### Contract

```typescript
class CeasefireVariantAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean;
  // PRECONDITIONS:
  //   - !state.result.isGameOver
  //   - state.phase === "Main1"
  //   - state.zones.deck.length >= 1
  // RETURNS: true if all preconditions met

  createActivationSteps(state: GameState): EffectResolutionStep[];
  // RETURNS: [activation notification step]

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
  // RETURNS:
  //   [
  //     { id: "ceasefire-draw-player", action: player draws 1 card },
  //     { id: "ceasefire-draw-opponent", action: opponent draws 1 card (internal) },
  //     { id: "ceasefire-damage-negation", action: set damageNegation = true },
  //     { id: "ceasefire-graveyard", action: send spell to graveyard }
  //   ]
}
```

### Test Cases

1. **Scenario**: Normal activation
   - **Given**: Main Phase 1, deck has 5 cards
   - **When**: Activate Ceasefire Variant
   - **Then**: Both players draw 1 card, damageNegation set to true

---

## 3. ReloadAction

### Contract

```typescript
class ReloadAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean;
  // PRECONDITIONS:
  //   - !state.result.isGameOver
  //   - state.phase === "Main1"
  // RETURNS: true if all preconditions met

  createActivationSteps(state: GameState): EffectResolutionStep[];
  // RETURNS: [activation notification step]

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
  // RETURNS:
  //   [
  //     { id: "reload-select", cardSelectionConfig: { minCards: 0, maxCards: hand.length }, action: user selects cards },
  //     { id: "reload-return-shuffle-draw", action: return selected → shuffle deck → draw same number },
  //     { id: "reload-graveyard", action: send spell to graveyard }
  //   ]
}
```

### Test Cases

1. **Scenario**: Return 2 cards
   - **Given**: Main Phase 1, hand has 5 cards
   - **When**: Select 2 cards to return
   - **Then**: 2 cards returned to deck, deck shuffled, draw 2 cards

2. **Scenario**: Return 0 cards (edge case)
   - **Given**: Main Phase 1, hand has 3 cards
   - **When**: Select 0 cards
   - **Then**: No cards returned, no shuffle, no draw

3. **Scenario**: Return all cards (edge case)
   - **Given**: Main Phase 1, hand has 3 cards (including Reload)
   - **When**: Select all 2 other cards
   - **Then**: 2 cards returned, shuffle, draw 2 cards

---

## 4. CardDestructionAction

### Contract

```typescript
class CardDestructionAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 2 as const; // Quick-Play Spell

  canActivate(state: GameState): boolean;
  // PRECONDITIONS:
  //   - !state.result.isGameOver
  //   - state.phase === "Main1"
  //   - state.zones.hand.length >= 3 (spell + 2 cards to discard)
  // RETURNS: true if all preconditions met

  createActivationSteps(state: GameState): EffectResolutionStep[];
  // RETURNS: [activation notification step]

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
  // RETURNS:
  //   [
  //     { id: "card-destruction-discard-player", cardSelectionConfig: { minCards: 2, maxCards: 2, cancelable: false }, action: player discards 2 },
  //     { id: "card-destruction-discard-opponent", action: opponent discards 2 (internal) },
  //     { id: "card-destruction-draw", action: both players draw 2 },
  //     { id: "card-destruction-graveyard", action: send spell to graveyard }
  //   ]
}
```

### Test Cases

1. **Scenario**: Normal activation
   - **Given**: Main Phase 1, hand has 5 cards
   - **When**: Activate Card Destruction, select 2 cards to discard
   - **Then**: Player discards 2, opponent discards 2 (internal), both draw 2

2. **Scenario**: Cannot activate with insufficient cards
   - **Given**: Main Phase 1, hand has 2 cards
   - **When**: Check canActivate()
   - **Then**: Returns false

---

## 5. DarkFactoryAction

### Contract

```typescript
class DarkFactoryAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean;
  // PRECONDITIONS:
  //   - !state.result.isGameOver
  //   - state.phase === "Main1"
  //   - state.zones.graveyard.filter(card => card.type === "Normal Monster").length >= 2
  // RETURNS: true if all preconditions met

  createActivationSteps(state: GameState): EffectResolutionStep[];
  // RETURNS: [activation notification step]

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
  // RETURNS:
  //   [
  //     { id: "dark-factory-select", cardSelectionConfig: { minCards: 2, maxCards: 2, availableCards: filteredGraveyard, cancelable: false }, action: user selects 2 Normal Monsters },
  //     { id: "dark-factory-recover", action: move selected monsters from graveyard to hand },
  //     { id: "dark-factory-graveyard", action: send spell to graveyard }
  //   ]
}
```

### Test Cases

1. **Scenario**: Normal activation
   - **Given**: Main Phase 1, graveyard has 3 Normal Monsters
   - **When**: Select 2 Normal Monsters
   - **Then**: Selected monsters moved to hand

2. **Scenario**: Cannot activate with insufficient Normal Monsters
   - **Given**: Main Phase 1, graveyard has 1 Normal Monster
   - **When**: Check canActivate()
   - **Then**: Returns false

---

## 6. TerraformingAction

### Contract

```typescript
class TerraformingAction implements ChainableAction {
  readonly isCardActivation = true;
  readonly spellSpeed = 1 as const;

  canActivate(state: GameState): boolean;
  // PRECONDITIONS:
  //   - !state.result.isGameOver
  //   - state.phase === "Main1"
  //   - state.zones.deck.filter(card => card.type === "Spell" && card.frameType === "spell_field").length >= 1
  // RETURNS: true if all preconditions met

  createActivationSteps(state: GameState): EffectResolutionStep[];
  // RETURNS: [activation notification step]

  createResolutionSteps(state: GameState, activatedCardInstanceId: string): EffectResolutionStep[];
  // RETURNS:
  //   [
  //     { id: "terraforming-select", cardSelectionConfig: { minCards: 1, maxCards: 1, availableCards: filteredDeck, cancelable: false }, action: user selects 1 Field Spell },
  //     { id: "terraforming-search", action: move selected Field Spell from deck to hand },
  //     { id: "terraforming-graveyard", action: send spell to graveyard }
  //   ]
}
```

### Test Cases

1. **Scenario**: Normal activation
   - **Given**: Main Phase 1, deck has 2 Field Spells
   - **When**: Select 1 Field Spell
   - **Then**: Selected Field Spell moved to hand

2. **Scenario**: Cannot activate without Field Spells in deck
   - **Given**: Main Phase 1, deck has no Field Spells
   - **When**: Check canActivate()
   - **Then**: Returns false

---

## Registry Contract

### ChainableActionRegistry

```typescript
// Registration (in initialization code)
ChainableActionRegistry.register(70368879, new UpstartGoblinAction());
ChainableActionRegistry.register(33782437, new CeasefireVariantAction());
ChainableActionRegistry.register(85852291, new ReloadAction());
ChainableActionRegistry.register(74519184, new CardDestructionAction());
ChainableActionRegistry.register(90928333, new DarkFactoryAction());
ChainableActionRegistry.register(73628505, new TerraformingAction());

// Usage (in ActivateSpellCommand)
const action = ChainableActionRegistry.get(cardId);
if (action && action.canActivate(state)) {
  const activationSteps = action.createActivationSteps(state);
  const resolutionSteps = action.createResolutionSteps(state, instanceId);
  // Application Layer handles execution
}
```

---

## Summary

- **6 ChainableAction implementations**: すべて統一インターフェース
- **spellSpeed定義**: 通常魔法=1, 速攻魔法=2
- **CardSelectionModal契約**: minCards/maxCards/availableCards/cancelable
- **GameState契約**: `damageNegation: boolean`フィールド追加
- **Zone操作契約**: `moveCard()`, `shuffleDeck()` (新規)
