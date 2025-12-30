# Quickstart: Card Pool Expansion - 6 New Spell Cards

**Feature**: 011-card-pool-expansion
**Date**: 2025-12-30
**Status**: Complete

## Overview

6枚の新規通常魔法・速攻魔法カードを既存のChainableActionシステムに追加。P1（成金ゴブリン、一時休戦）→P2（打ち出の小槌、手札断札）→P3（闇の量産工場、テラフォーミング）の順で段階的に実装・テスト。

---

## Prerequisites

- TypeScript 5.0+ (ES2022)
- Svelte 5 (Runes mode)
- SvelteKit 2.16+
- Vitest 3.2+ (unit tests)
- Playwright 1.56+ (E2E tests)

**Existing Systems**:
- ChainableAction interface & Registry
- CardSelectionModal (cancelable対応済み)
- NotificationLevel system (silent/info/interactive)
- GameState with LP & zones

---

## Quick Test Scenarios

### Scenario 1: Upstart Goblin (P1 - MVP)

**Goal**: Verify simple draw + opponent LP gain

**Steps**:
1. Start game with Upstart Goblin in hand, deck has 5 cards
2. Activate Upstart Goblin from hand
3. Observe: Player draws 1 card, opponent LP increases by 1000
4. Verify: Upstart Goblin sent to graveyard

**Expected**:
- Hand: +1 card
- Deck: -1 card
- Opponent LP: 8000 → 9000
- Graveyard: contains Upstart Goblin

---

### Scenario 2: Reload (P2)

**Goal**: Verify hand management + deck shuffle

**Steps**:
1. Start game with Reload in hand, hand has 4 other cards
2. Activate Reload
3. CardSelectionModal opens (minCards=0, maxCards=4)
4. Select 2 cards to return
5. Observe: Cards returned to deck, deck shuffled, draw 2 cards

**Expected**:
- Hand size: unchanged (4 other cards → 2 returned + 2 drawn = 4)
- Deck: shuffled
- Graveyard: contains Reload

---

### Scenario 3: Dark Factory (P3)

**Goal**: Verify graveyard recovery

**Setup**:
1. Start game with Dark Factory in hand
2. Place 2 Normal Monsters in graveyard (e.g., via test setup)

**Steps**:
1. Activate Dark Factory
2. CardSelectionModal opens with graveyard Normal Monsters (minCards=2, maxCards=2, cancelable=false)
3. Select 2 Normal Monsters
4. Observe: Monsters moved from graveyard to hand

**Expected**:
- Hand: +2 Normal Monsters
- Graveyard: -2 Normal Monsters
- Graveyard: contains Dark Factory

---

## Development Workflow

### Phase 1: Simple Draw Effects (P1)

**Cards**: Upstart Goblin, Ceasefire Variant

**Steps**:
1. Implement `UpstartGoblinAction.ts`
2. Add `damageNegation: boolean` to GameState
3. Implement `CeasefireVariantAction.ts`
4. Register in ChainableActionRegistry
5. Write unit tests
6. Run tests: `npm run test:run`

**Acceptance**:
- ✅ Unit tests pass (canActivate, resolution steps, LP gain, damageNegation)
- ✅ Integration test: Upstart Goblin draws + LP gain
- ✅ Integration test: Ceasefire draws + damageNegation

---

### Phase 2: Hand Management Effects (P2)

**Cards**: Reload, Card Destruction

**Steps**:
1. Implement `shuffleDeck()` helper in Zone.ts
2. Implement `ReloadAction.ts` (CardSelectionModal: minCards=0)
3. Implement `CardDestructionAction.ts` (spellSpeed=2, cancelable=false)
4. Register in ChainableActionRegistry
5. Write unit tests (including edge cases: 0 cards, all cards)
6. Write E2E test for CardSelectionModal interaction
7. Run tests: `npm run test:run && npm run test:e2e`

**Acceptance**:
- ✅ Unit tests pass (0 cards, all cards, spellSpeed=2)
- ✅ E2E test: Reload CardSelectionModal opens, selection works
- ✅ E2E test: Card Destruction non-cancelable modal

---

### Phase 3: Graveyard Recovery Effects (P3)

**Cards**: Dark Factory, Terraforming

**Steps**:
1. Implement `DarkFactoryAction.ts` (filter graveyard for Normal Monsters)
2. Implement `TerraformingAction.ts` (filter deck for Field Spells)
3. Register in ChainableActionRegistry
4. Write unit tests (filter logic, card recovery)
5. Write E2E test for graveyard/deck selection UI
6. Run tests: `npm run test:run && npm run test:e2e`

**Acceptance**:
- ✅ Unit tests pass (filter logic, graveyard recovery, deck search)
- ✅ E2E test: Dark Factory opens graveyard selection modal
- ✅ E2E test: Terraforming opens deck selection modal

---

## Testing Commands

```bash
# Unit tests (fast feedback)
npm run test:run

# E2E tests (UI interaction)
npm run test:e2e

# Lint & Format
npm run lint && npm run format

# Full test suite
npm run test:run && npm run test:e2e && npm run lint
```

---

## Key Files to Modify

### Domain Layer
- `skeleton-app/src/lib/domain/effects/chainable/` (6 new files)
- `skeleton-app/src/lib/domain/models/GameState.ts` (add `damageNegation`)
- `skeleton-app/src/lib/domain/models/Zone.ts` (add `shuffleDeck()`)
- `skeleton-app/src/lib/domain/registries/ChainableActionRegistry.ts` (register 6 cards)

### Tests
- `skeleton-app/tests/unit/domain/effects/chainable/` (6 new test files)
- `skeleton-app/tests/integration/card-effects/NewSpellCards.test.ts` (new)

---

## Common Issues

### Issue 1: CardSelectionModal not opening for graveyard selection

**Cause**: `availableCards` set to `zones.hand` instead of `zones.graveyard`

**Fix**: Set `availableCards: state.zones.graveyard.filter(...)` in cardSelectionConfig

---

### Issue 2: Reload with 0 cards selected crashes

**Cause**: Drawing 0 cards triggers validation error

**Fix**: Add conditional check:
```typescript
if (selectedInstanceIds.length === 0) {
  return { success: true, newState: currentState };
}
```

---

### Issue 3: damageNegation not persisted

**Cause**: Forgot to add field to initial state

**Fix**: Update `createInitialGameState()`:
```typescript
return {
  // ... existing fields
  damageNegation: false,
};
```

---

## Success Criteria

- ✅ All 6 cards activate successfully from hand
- ✅ CardSelectionModal opens for Reload, Card Destruction, Dark Factory, Terraforming
- ✅ Opponent LP gain (Upstart Goblin) reflected in state
- ✅ damageNegation flag set correctly (Ceasefire)
- ✅ Deck shuffle works (Reload)
- ✅ spellSpeed=2 defined (Card Destruction)
- ✅ Graveyard recovery works (Dark Factory)
- ✅ Deck search works (Terraforming)
- ✅ Edge cases handled (0 cards, all cards, insufficient resources)
- ✅ All tests pass (unit + E2E)

---

## Next Steps

After all tests pass:
1. Manual testing in browser
2. Lint & format: `npm run lint && npm run format`
3. Commit changes
4. Create PR for review
