# Implementation Plan: Architecture Refactoring - Separating Game Logic from UI

**Branch**: `001-architecture-refactoring` | **Date**: 2025-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-architecture-refactoring/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: ゲームロジック（domain層）をフレームワーク非依存にし、UIなしでビジネスロジックを完全にテスト可能にする。カード追加時に既存コードを修正せずに済む拡張性を実現する。

**Technical Approach**:
- **Clean Architecture採用**: domain/application/presentation 3層構造で関心を分離
- **不変性保証**: Immer.jsを使用し、GameStateはすべて新しいインスタンスを生成
- **既存資産の活用**: 効果システム（Strategy Pattern + Factory Pattern）は優れた設計のため最小限の変更で移行
- **段階的移行**: 既存DuelStateと共存しながら、phase 1-5で段階的にリファクタリング
- **Command Pattern**: プレイヤー操作をオブジェクト化し、履歴管理・Undo対応の基盤を構築
- **Observer Pattern**: Svelte Storeで単方向データフロー（UI → GameFacade → Command → GameState → Store → UI）を実現

## Technical Context

**Language/Version**: TypeScript 5.x (Strict mode)
**Primary Dependencies**: Svelte 5 (Runes), SvelteKit, Immer.js, TailwindCSS v4, Vitest, Playwright
**Storage**: N/A (client-side only, no persistence layer required)
**Testing**: Vitest + Testing Library (unit/integration), Playwright (E2E)
**Target Platform**: Modern browsers (Chrome, Edge, Firefox, Safari - ES2020+)
**Project Type**: Web application - Single-page application (SPA) deployed to GitHub Pages
**Performance Goals**: <50ms state updates, 60fps UI rendering, instant card effect resolution
**Constraints**: Client-side only (offline-capable), no server dependency, フレームワーク非依存なdomain層
**Scale/Scope**: Single-player, Exodia Draw Deck MVP (limited rule set: Draw/Standby/Main1/End phases, normal spells only, simple chain)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Principle IV: Separation of Concerns (関心の分離)**
- Domain層（`domain/`）はフレームワーク非依存 ✓
  - GameState, Card, Ruleクラスは純粋TypeScript
  - SvelteやDOM APIへの依存なし
- UI層（`presentation/`）は表示のみ担当 ✓
  - GameFacadeを経由してゲームロジックを操作
  - コンポーネント内でゲームルールを実装しない
- Application層（`application/`）が橋渡し ✓
  - GameFacade、Commands、Storesで依存を分離
  - 依存の方向性: `presentation → application → domain`

✅ **Principle V: Change-Friendly Design (変更に対応できる設計)**
- **Open-Closed Principle**: 新カード追加時にGameEngineを修正不要 ✓
  - Strategy Pattern（CardBehavior）で拡張に開いている
  - `CARD_EFFECTS`に1行追加するだけで新効果を登録
- **Dependency Inversion**: 抽象に依存 ✓
  - GameFacadeはIGameCommandインターフェースに依存
  - 具象CommandクラスはDI可能
- **Single Responsibility**: 各クラスの変更理由は1つ ✓
  - PhaseRule（フェイズ遷移のみ）、VictoryRule（勝利判定のみ）

✅ **Principle VI: Readability First (理解しやすさ最優先)**
- 明確な命名 ✓
  - GameState, CardBehavior, GameFacade（目的が一目でわかる）
- 契約の文書化 ✓
  - `contracts/` に全インターフェース定義を配置
  - `quickstart.md` で開発フローを詳細に説明

✅ **Principle VII: Simplicity (シンプルに問題を解決)**
- YAGNI原則 ✓
  - MVPスコープ: Exodia Draw Deck限定（Draw/Standby/Main1/Endフェイズのみ）
  - モンスター召喚ルール、罠カード、複雑なタイミング処理は実装しない
- 過剰な抽象化を避ける ✓
  - 既存の優れた設計（効果システム）は維持
  - 必要最小限の変更で移行

✅ **Principle VIII: Testability (テスト可能性)**
- Domain層はUIなしでテスト可能 ✓
  - Vitestで純粋なTypeScriptとして単体テスト
  - GameState、Rules、Effectsをブラウザなしで検証
- 純粋関数・依存注入 ✓
  - CommandパターンでDI可能
  - Immerで不変性を保証し、テストで参照比較可能

**Result**: 全原則を満たしている。複雑性違反なし。

**特記事項**: 既存の効果システム（BaseEffect階層、EffectRepository）は既にOpen-Closed Principleを満たしており、この優れた設計を維持する方針。

## Project Structure

### Documentation (this feature)

```text
specs/001-architecture-refactoring/
├── plan.md              # This file (implementation plan)
├── spec.md              # Feature specification
├── research.md          # Design decisions and rationale (Phase 0 output)
├── data-model.md        # Entity relationships and types (Phase 1 output)
├── quickstart.md        # Developer guide (Phase 1 output)
├── contracts/           # TypeScript interface definitions (Phase 1 output)
│   ├── README.md
│   ├── GameFacadeContract.ts
│   ├── CommandContract.ts
│   ├── RuleContract.ts
│   ├── EffectContract.ts
│   └── StoreContract.ts
└── checklists/          # Quality checklists
    └── requirements.md
```

### Source Code (repository root)

```text
skeleton-app/src/lib/
├── domain/              # Pure game logic (Svelte-independent)
│   ├── models/
│   │   ├── GameState.ts     # Immutable state object (interface + factory)
│   │   ├── Card.ts          # CardData, CardInstance types
│   │   ├── Zone.ts          # Zone-related models
│   │   └── constants.ts     # EXODIA_PIECE_IDS, PHASE_NAMES, etc.
│   ├── rules/
│   │   ├── PhaseRule.ts          # Phase transition rules
│   │   ├── SpellActivationRule.ts # Spell activation validation
│   │   ├── ChainRule.ts          # Chain processing (LIFO, simple version)
│   │   └── VictoryRule.ts        # Victory conditions (Exodia, LP0, DeckOut)
│   └── effects/         # Existing effect system (moved from classes/)
│       ├── bases/
│       │   ├── BaseEffect.ts       # Base abstract class (modified to return newState)
│       │   └── BaseMagicEffect.ts
│       ├── primitives/
│       │   ├── DrawEffect.ts
│       │   └── DiscardEffect.ts
│       ├── cards/
│       │   └── magic/normal/
│       │       ├── PotOfGreedEffect.ts
│       │       └── GracefulCharityEffect.ts
│       ├── CardEffectRegistrar.ts
│       ├── EffectRepository.ts
│       └── __tests__/
│
├── application/         # Bridge layer
│   ├── GameFacade.ts    # Main API for UI components
│   ├── commands/
│   │   ├── GameCommand.ts           # Command interface
│   │   ├── DrawCardCommand.ts
│   │   ├── ActivateSpellCommand.ts
│   │   └── AdvancePhaseCommand.ts
│   └── stores/
│       ├── gameStateStore.ts    # Writable store for GameState
│       └── derivedStores.ts     # Derived stores (handCardCount, hasExodia, etc.)
│
├── presentation/        # Svelte components (display only)
│   └── components/
│       └── organisms/board/
│           └── DuelField.svelte
│
└── __testUtils__/       # Test helpers
    └── gameStateFactory.ts

skeleton-app/tests/
├── unit/                # Domain layer tests (fast, no browser)
│   ├── GameState.test.ts
│   ├── VictoryRule.test.ts
│   └── PhaseRule.test.ts
├── integration/         # Application layer tests
│   ├── GameFacade.test.ts
│   └── DrawCardCommand.test.ts
└── e2e/                 # End-to-end tests (Playwright)
    └── exodia-victory.spec.ts
```

**Structure Decision**: Web application (single frontend project). バックエンド（FastAPI）は最小限（カードデータAPIのみ）のため、フロントエンドの`skeleton-app/`にすべてのゲームロジックを配置。Clean Architectureの3層構造（domain/application/presentation）を採用し、依存の方向性を厳守（`presentation → application → domain`）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: 複雑性違反なし。すべての設計判断は憲法の原則に準拠している。

**特記事項**:
- **Immer.js依存**: 不変性を保証するライブラリを追加（約14KB gzipped）
  - 理由: 手動スプレッド構文は深いネストで煩雑かつエラーが混入しやすい
  - トレードオフ: ライブラリ依存 vs 開発者体験・バグ削減
  - 判断: 不変性はアーキテクチャの核心要件であり、Immerは業界標準ソリューション
- **Command Pattern導入**: 小規模操作でもCommandクラスを作成（ボイラープレート増加）
  - 理由: 履歴管理・Undo/Redoの基盤、テスタビリティ向上
  - トレードオフ: 初期コスト vs 将来の拡張性
  - 判断: MVPスコープでも操作履歴（リプレイ機能）は価値が高い
