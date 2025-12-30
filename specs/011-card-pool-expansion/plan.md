# Implementation Plan: Card Pool Expansion - 6 New Spell Cards

**Branch**: `011-card-pool-expansion` | **Date**: 2025-12-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-card-pool-expansion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

6枚の新規通常魔法・速攻魔法カード（成金ゴブリン、一時休戦、打ち出の小槌、手札断札、闇の量産工場、テラフォーミング）を追加し、既存のChainableActionシステムの拡張性を検証する。P1では既存パターン踏襲、P2ではCardSelectionModal活用、P3では新パターン（墓地回収・デッキサーチ）を実装。相手側の効果は内部状態のみ反映し、UI表示はスコープ外。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022), Svelte 5 (Runes mode)
**Primary Dependencies**: SvelteKit 2.16, Immer.js (immutability), TailwindCSS 4.0, Skeleton UI 3.1
**Storage**: N/A (client-side only, state in memory)
**Testing**: Vitest 3.2 (unit), Playwright 1.56 (E2E), jsdom 26.1 (DOM mocking)
**Target Platform**: Modern browsers (Chrome/Firefox/Safari), deployed as static site via GitHub Pages
**Project Type**: Web (frontend SPA - single project structure under `skeleton-app/`)
**Performance Goals**: 60fps UI updates, <100ms effect resolution feedback
**Constraints**: Browser-only (no server), client-side routing, immutable state management (Immer.js)
**Scale/Scope**: 6 new cards, ~6 new ChainableAction classes, 10+ unit tests, 3 E2E scenarios

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Planning Principles

- [x] **目的と手段の分離**: カード効果の「体験価値」（コンボ構築幅拡大）と実装手段（ChainableAction）を明確に分離
- [x] **段階的な理解の深化**: P1（既存パターン）→P2（UI活用）→P3（新パターン）の順で検証を深化

### Architecture Principles

- [x] **最適解の選択と記録**: ChainableActionパターン踏襲が最適と判断（理由: 既存実装との一貫性、テスト容易性）
- [x] **関心の分離**: Domain Layer（効果ロジック）/ Application Layer（効果解決）/ Presentation Layer（CardSelectionModal）の責務が明確
- [x] **変更に対応できる設計**: ChainableActionRegistryによるOCP準拠（新カード追加時に既存コード変更不要）

### Coding Principles

- [x] **理解しやすさ最優先**: 各カード効果は独立したクラスで実装、命名規則統一（UpstartGoblinAction, ReloadAction等）
- [x] **シンプルに問題を解決する**: 相手側効果は内部状態のみ（UI実装はYAGNI）、フィールド魔法は定義のみ（実装は将来）
- [x] **テスト可能性を意識**: ChainableAction単体で完結、UI不要で効果ロジックテスト可能

### Project-Specific Principles

- [x] **本質**: 1ターンキルコンボシミュレーション（6枚追加でコンボ幅拡大）
- [x] **技術スタック**: 既存技術（TypeScript+Svelte+TailwindCSS）踏襲、新規依存なし

**Status**: ✅ All gates passed

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
skeleton-app/
├── src/lib/
│   ├── domain/
│   │   ├── effects/chainable/
│   │   │   ├── UpstartGoblinAction.ts         # 成金ゴブリン (P1)
│   │   │   ├── CeasefireVariantAction.ts      # 一時休戦 (P1)
│   │   │   ├── ReloadAction.ts                # 打ち出の小槌 (P2)
│   │   │   ├── CardDestructionAction.ts       # 手札断札 (P2)
│   │   │   ├── DarkFactoryAction.ts           # 闇の量産工場 (P3)
│   │   │   └── TerraformingAction.ts          # テラフォーミング (P3)
│   │   ├── models/
│   │   │   ├── GameState.ts                   # (既存) LP, damageNegationフィールド追加検討
│   │   │   └── Zone.ts                        # (既存) 墓地回収・デッキサーチ関数追加
│   │   └── registries/
│   │       └── ChainableActionRegistry.ts     # (既存) 6カード登録
│   ├── application/stores/
│   │   └── effectResolutionStore.ts           # (既存) NotificationLevel対応済み
│   └── presentation/components/modals/
│       └── CardSelectionModal.svelte          # (既存) cancelable対応済み
└── tests/
    ├── unit/domain/effects/chainable/
    │   ├── UpstartGoblinAction.test.ts
    │   ├── CeasefireVariantAction.test.ts
    │   ├── ReloadAction.test.ts
    │   ├── CardDestructionAction.test.ts
    │   ├── DarkFactoryAction.test.ts
    │   └── TerraformingAction.test.ts
    └── integration/card-effects/
        └── NewSpellCards.test.ts              # 6カード統合テスト
```

**Structure Decision**: 単一プロジェクト構造（skeleton-app/）を維持。Domain Layerにカード効果クラスを追加、既存のChainableActionRegistryに登録。GameStateへのフィールド追加（相手LP、damageNegation）を検討。Zone.tsに墓地回収・デッキサーチ用ヘルパー関数を追加。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - all constitution principles satisfied.

---

## Phase 0: Research (Complete)

**Output**: [research.md](research.md)

**Key Findings**:
- GameState already has `lp.opponent` field - Upstart Goblin LP gain supported
- `shuffleArray()` function exists - Reload shuffle supported
- CardSelectionModal supports minCards/maxCards - all card selection scenarios supported
- `moveCard()` function exists - graveyard recovery & deck search supported
- Need to add: `damageNegation: boolean` to GameState (Ceasefire effect)
- Need to add: `shuffleDeck()` helper function to Zone.ts (Reload)

---

## Phase 1: Design & Contracts (Complete)

**Outputs**:
- [data-model.md](data-model.md) - 6 card entities + GameState extension
- [contracts/ChainableActionContracts.md](contracts/ChainableActionContracts.md) - ChainableAction interface contracts
- [quickstart.md](quickstart.md) - Development workflow & test scenarios

**Key Decisions**:
- All cards implement ChainableAction interface (consistency)
- GameState extension: `damageNegation: boolean` (simple flag for Ceasefire)
- Zone helper: `shuffleDeck()` wrapper around `shuffleArray()` (Reload)
- Card selection from graveyard/deck: reuse CardSelectionModal (no new UI)
- spellSpeed=2 for Card Destruction (future chain system compatibility)

---

## Constitution Check (Post-Design Re-evaluation)

### Changes from Initial Check

**New Information**:
- GameState extension confirmed: `damageNegation: boolean` field
- Zone helper confirmed: `shuffleDeck()` function
- All 6 cards follow uniform ChainableAction pattern

### Re-evaluation

- [x] **Simplicity**: GameState extension minimal (1 field), Zone helper simple (1 function)
- [x] **Consistency**: All 6 cards follow ChainableAction pattern (no special cases)
- [x] **Testability**: All cards independently testable without UI (Domain Layer isolation)
- [x] **YAGNI**: Opponent hand/UI excluded (not needed for 1-turn kill), Field Spell implementation deferred

**Final Status**: ✅ All gates still passed after Phase 1 design

---

## Next Phase

**Phase 2**: Task Generation (`/speckit.tasks`)

**Inputs**:
- spec.md (user stories & priorities)
- plan.md (technical context & structure)
- data-model.md (entities)
- contracts/ (API contracts)

**Expected Output**:
- tasks.md with:
  - Setup phase (GameState extension, Zone helper)
  - P1 phase (Upstart Goblin, Ceasefire)
  - P2 phase (Reload, Card Destruction)
  - P3 phase (Dark Factory, Terraforming)
  - Test tasks per card
  - Registry registration tasks
