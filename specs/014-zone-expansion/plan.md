# Implementation Plan: Zone Architecture Expansion and Card Placement Commands

**Branch**: `014-zone-expansion` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-zone-expansion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: 遊戯王OCGのゾーンアーキテクチャを正確に実装し、モンスター・魔法・罠カードの基本的な配置操作（召喚・セット）を提供する。

**Technical Approach**:
- Zonesインターフェースを3つの専用ゾーン（mainMonsterZone、spellTrapZone、fieldZone）に拡張
- Command Patternを用いた新規コマンド実装（SummonMonster、SetMonster、SetSpellTrap）
- GameStateにターン管理フィールド追加（召喚権、配置フラグ）
- 既存のActivateSpellCommandを更新してフィールド魔法の正しいゾーン配置を実現
- Clean Architectureの原則を維持し、ドメインロジックとUIを分離

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022 target)
**Primary Dependencies**:
- Svelte 5 (Runes mode) - リアクティブUI
- Immer.js - 不変性保証
- Vitest - 単体テスト
- Playwright - E2Eテスト
- TailwindCSS + Skeleton UI - スタイリング

**Storage**: N/A (メモリ内状態管理)
**Testing**: Vitest (unit), Playwright (E2E), 既存439テストすべてパス必須
**Target Platform**: Web (SPA), モダンブラウザ
**Project Type**: Single (フロントエンドのみのSPA)
**Performance Goals**: 60fps UIレンダリング、即座のコマンド実行（<16ms）
**Constraints**:
- 既存テスト439個がすべてパスすること（リグレッションなし）
- Immer.jsによる不変性保証を維持
- Svelte 5 Runesモードの使用
- Domain LayerにSvelte/UI依存コードを含めない

**Scale/Scope**:
- 1ターンキルシミュレーター（先行1ターンのみ）
- 新規コマンド3個（SummonMonster、SetMonster、SetSpellTrap）
- 更新対象: 7ファイル程度（Zone.ts、GameState.ts、Card.ts、Commands、GameFacade、UI）
- 新規テスト: 約30-40シナリオ追加予定

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Planning Principles
- **目的と手段の分離**: 仕様書で「なぜ（Why this priority）」が各User Storyに明記されている
- **段階的な理解の深化**: P1（ゾーン分離）→P2（召喚・セット）→P3（UI）の段階的アプローチ

### ✅ Architecture Principles
- **関心の分離**: Domain Layer（Zone.ts、GameState.ts、Commands）とUI Layer（DuelField.svelte、Hands.svelte）を明確に分離
- **変更に対応できる設計**: Command Patternにより新規操作の追加が容易

### ✅ Coding Principles
- **理解しやすさ最優先**: 既存コードと同じ命名規則・パターンを継承
- **シンプルに問題を解決する**: YAGNIの原則に従い、必要な機能のみ実装
- **テスト可能性**: Domain Layerは純粋関数で実装、UI非依存

### ✅ Project-Specific Principles
- **技術スタック**: TypeScript + Svelte + TailwindCSS を維持
- **4層Clean Architecture**: Presentation → Application → Domain → Infrastructure の分離を維持

### ⚠️ Potential Violations
なし。すべての憲法原則に準拠している。

## Project Structure

### Documentation (this feature)

```text
specs/014-zone-expansion/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output (generated below)
├── quickstart.md        # Phase 1 output (generated below)
├── contracts/           # Phase 1 output (generated below)
│   └── GameFacade.ts    # Public API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
skeleton-app/
├── src/lib/
│   ├── domain/
│   │   ├── models/
│   │   │   ├── Zone.ts                      # [UPDATE] Zones interface拡張
│   │   │   ├── GameState.ts                 # [UPDATE] 召喚権・配置フラグ追加
│   │   │   └── Card.ts                      # [UPDATE] battlePosition, placedThisTurn追加
│   │   ├── commands/
│   │   │   ├── SummonMonsterCommand.ts      # [NEW] モンスター召喚
│   │   │   ├── SetMonsterCommand.ts         # [NEW] モンスターセット
│   │   │   ├── SetSpellTrapCommand.ts       # [NEW] 魔法・罠セット
│   │   │   └── ActivateSpellCommand.ts      # [UPDATE] フィールド魔法対応
│   │   └── rules/
│   │       └── SummonRule.ts                # [NEW] 召喚権チェックロジック
│   ├── application/
│   │   └── GameFacade.ts                    # [UPDATE] 新規コマンド公開
│   └── presentation/
│       ├── components/
│       │   ├── DuelField.svelte             # [UPDATE] 3ゾーン表示
│       │   └── Hands.svelte                 # [UPDATE] 召喚・セットボタン
│       └── stores/
│           └── gameStore.svelte.ts          # [POTENTIAL UPDATE] 状態管理
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   ├── models/
    │   │   │   ├── Zone.test.ts             # [UPDATE] 新ゾーン対応
    │   │   │   ├── GameState.test.ts        # [NEW] 召喚権テスト
    │   │   │   └── Card.test.ts             # [NEW] placedThisTurnテスト
    │   │   └── commands/
    │   │       ├── SummonMonsterCommand.test.ts  # [NEW]
    │   │       ├── SetMonsterCommand.test.ts     # [NEW]
    │   │       └── SetSpellTrapCommand.test.ts   # [NEW]
    │   └── application/
    │       └── GameFacade.test.ts           # [UPDATE]
    └── integration/
        └── summon-flow.test.ts              # [NEW] 召喚フロー統合テスト
```

**Structure Decision**: Single project構成を維持。既存の4層Clean Architecture（Presentation、Application、Domain、Infrastructure）に準拠。skeleton-app/配下のsrc/lib/がメインのソースコードで、Domain LayerはUI非依存、Application LayerがFacadeパターンでDomainを公開、Presentation LayerがSvelteコンポーネント。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

該当なし。すべての憲法原則に準拠しており、正当化が必要な違反はない。
