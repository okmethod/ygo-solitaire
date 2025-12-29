# Implementation Plan: Victory Rule Refactoring

**Branch**: `009-victory-rule-refactor` | **Date**: 2025-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-victory-rule-refactor/spec.md`

## Summary

エクゾディアの特殊勝利条件を、AdditionalRuleモデルを使って実装し、VictoryRule.tsをリファクタリングして特殊勝利条件をAdditionalRuleRegistryから動的に取得するように変更する。これにより、「効果外テキスト」として明示的に扱われ、アーキテクチャの一貫性が向上する。基本勝利条件（LP0、デッキアウト）はVictoryRule.ts内にハードコードされたまま維持する。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)  
**Primary Dependencies**: Svelte 5 (Runes mode), SvelteKit 2, Immer.js (immutability)  
**Storage**: N/A (フロントエンドのみ、状態はメモリ内)  
**Testing**: Vitest  
**Target Platform**: Web (SPA)  
**Project Type**: Single (skeleton-app/)  
**Performance Goals**: checkVictoryConditions()の実行時間が、リファクタリング前と比較して10%以内の変動に収まる  
**Constraints**:
- Domain LayerはSvelteに依存しない
- すべての状態更新はImmer.jsのproduce()を使用
- レガシーコードの削除（hasExodiaVictory等のヘルパー関数を削除）

**Scale/Scope**: 
- 新規実装: 1クラス (ExodiaVictoryRule)
- リファクタリング: 1ファイル (VictoryRule.ts)
- テストファイル: 2ファイル (ExodiaVictoryRule.test.ts, VictoryRule.test.tsの更新)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Planning Principles

✅ **I. 目的と手段の分離**
- **目的**: 特殊勝利条件を拡張可能にし、効果外テキストを型レベルで明示する
- **手段**: AdditionalRuleモデルを活用してエクゾディア勝利条件を実装
- **判断**: AdditionalRuleはspecs/008-effect-modelで既に実装済みであり、VictoryConditionカテゴリも定義されている。既存のインフラを活用することで、新しい特殊勝利条件の追加が容易になる。

✅ **II. 段階的な理解の深化**
- P1: ExodiaVictoryRuleをAdditionalRuleとして実装（独立してテスト可能）
- P2: VictoryRule.tsをリファクタリングしてExodiaVictoryRuleを直接使用（レガシーヘルパー関数を削除）
- P2: 基本勝利条件（LP0、デッキアウト）のハードコード維持を確認（パフォーマンスと可読性）

### Architecture Principles

✅ **III. 最適解の選択と記録**
- **選択**: エクゾディア勝利条件をAdditionalRuleで実装、基本勝利条件はハードコード維持
- **代替案**: すべての勝利条件をAdditionalRule化
- **理由**: 基本勝利条件は遊戯王の基本ルールであり、カード固有の効果ではない。パフォーマンスと可読性の観点からハードコードを維持する。

✅ **IV. 関心の分離**
- ExodiaVictoryRuleはDomain Layerに配置（`domain/effects/additional/ExodiaVictoryRule.ts`）
- VictoryRule.tsはDomain Layerのルール層（`domain/rules/VictoryRule.ts`）
- AdditionalRuleRegistryへの登録は`domain/effects/index.ts`で自動実行

✅ **V. 変更に対応できる設計**
- 新しい特殊勝利条件（最終列車、エクゾード・ネクロス等）の追加は、新しいAdditionalRuleクラスを実装するだけで済む
- レガシーヘルパー関数を削除し、ExodiaVictoryRuleに責務を集約

### Coding Principles

✅ **VI. 理解しやすさ最優先**
- ExodiaVictoryRule.canApply()内でエクゾディア判定ロジックを実装（hasExodiaInHand()は削除）
- checkVictoryConditions()は「特殊勝利条件→基本勝利条件」の順序で明確にチェック

✅ **VII. シンプルに問題を解決する**
- 過剰な抽象化を避ける: 基本勝利条件はハードコード維持
- YAGNI: 優先順位制御は将来の拡張として検討（現時点では登録順序に従う）

✅ **VIII. テスト可能性を意識する**
- ExodiaVictoryRuleは純粋関数（canApply, checkPermission）
- VictoryRule.tsの既存テストスイートを更新してリファクタリング後の動作を検証

### Project-Specific Principles

✅ **IX. 技術スタック**
- TypeScript: 型安全性（isEffect: falseで効果外テキストを保証）
- Svelte: Domain LayerはSvelteに依存しない（Pure TypeScript）

## Project Structure

### Documentation (this feature)

```text
specs/009-victory-rule-refactor/
├── spec.md             # Feature specification
├── plan.md             # This file (/speckit.plan command output)
├── research.md         # Phase 0 output (NEEDS CLARIFICATION resolution)
├── data-model.md       # Phase 1 output (Entity design)
├── quickstart.md       # Phase 1 output (Development guide)
├── contracts/          # Phase 1 output (API contracts)
└── tasks.md            # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
skeleton-app/src/lib/domain/
├── effects/
│   ├── additional/
│   │   ├── ChickenGameContinuousRule.ts  # Existing
│   │   └── ExodiaVictoryRule.ts          # NEW: Exodia victory condition
│   └── index.ts                          # MODIFIED: Register ExodiaVictoryRule
├── rules/
│   └── VictoryRule.ts                    # MODIFIED: Use AdditionalRuleRegistry
├── models/
│   ├── AdditionalRule.ts                 # Existing (VictoryCondition category already defined)
│   ├── RuleContext.ts                    # Existing
│   └── GameState.ts                      # Existing (hasExodiaInHand helper)
└── registries/
    └── AdditionalRuleRegistry.ts         # Existing

skeleton-app/tests/unit/domain/
├── effects/additional/
│   └── ExodiaVictoryRule.test.ts         # NEW: ExodiaVictoryRule tests
└── rules/
    └── VictoryRule.test.ts               # MODIFIED: Update for AdditionalRuleRegistry integration
```

**Structure Decision**: 
- ExodiaVictoryRuleは`domain/effects/additional/`に配置（他のAdditionalRule実装と同じディレクトリ）
- VictoryRule.tsは`domain/rules/`に配置（既存の構造を維持）
- テストファイルは対応するソースファイルと同じディレクトリ構造

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A | N/A | N/A |

**Note**: すべてのConstitution Checkをパス。基本勝利条件のハードコード維持は、憲法の「シンプルに問題を解決する」原則に準拠。

---

## Phase 0: Research & Design Decisions

### Research Questions

以下のNEEDS CLARIFICATIONを解決する:

1. **AdditionalRuleRegistryの実装詳細**
   - Question: AdditionalRuleRegistryはO(1)でルックアップ可能か？
   - Answer: Yes. `Map<number, AdditionalRule[]>`実装で、O(1)ルックアップ可能。

2. **VictoryConditionカテゴリの既存定義**
   - Question: VictoryConditionカテゴリは既に定義済みか？
   - Answer: Yes. `domain/models/AdditionalRule.ts`で定義済み。

3. **hasExodiaInHand()ヘルパーの実装**
   - Question: hasExodiaInHand()は正しく動作しているか？
   - Answer: Yes. `domain/models/GameState.ts`で実装済み。数値ID比較で先頭ゼロの問題を回避。

4. **ChickenGameContinuousRuleのパターン**
   - Question: 既存のAdditionalRule実装のベストプラクティスは？
   - Answer: ChickenGameContinuousRuleを参考に、canApply()とcheckPermission()を実装。

### Design Decisions

#### Decision 1: Why Refactor to AdditionalRule?

**Rationale**:
1. **アーキテクチャの一貫性**: 他の特殊ルール（ChickenGameContinuousRule等）はAdditionalRuleで実装されているため、勝利条件も同じパターンで統一する
2. **効果外テキストの明示**: isEffect: falseにより、エクゾディアの勝利条件が「効果を無効にする効果」によって無効化されないことを型レベルで保証する
3. **拡張性の向上**: 新しい特殊勝利条件（最終列車、エクゾード・ネクロス等）を追加する際、AdditionalRuleRegistryへの登録だけで済む

**Alternatives Considered**:
- Alternative 1: VictoryRule.ts内にエクゾディアチェックをハードコード（現状維持）
  - Rejected Because: 新しい特殊勝利条件を追加するたびにVictoryRule.tsを修正する必要がある（OCP違反）
- Alternative 2: すべての勝利条件をAdditionalRule化
  - Rejected Because: 基本勝利条件（LP0、デッキアウト）は遊戯王の基本ルールであり、カード固有の効果ではない。パフォーマンスと可読性の観点からハードコードを維持。

#### Decision 2: Why Keep Basic Victory Conditions Hardcoded?

**Rationale**:
1. **基本ルールの明示**: LP0とデッキアウトは遊戯王の基本ルールであり、カード固有の効果ではないため、VictoryRule.ts内にハードコードすることで明確にする
2. **パフォーマンス**: 基本勝利条件は毎回チェックされるため、Registry参照のオーバーヘッドを避ける
3. **可読性**: 基本ルールがVictoryRule.ts内に明示的に記述されることで、コードの可読性が向上する

**Alternatives Considered**:
- Alternative: すべての勝利条件をAdditionalRule化
  - Rejected Because: LP0とデッキアウトはカード固有の効果ではなく、遊戯王の基本ルール。Registry参照のオーバーヘッドが不要。

#### Decision 3: ExodiaVictoryRule Implementation Approach

**Rationale**:
- canApply(): hasExodiaInHand()ヘルパーを再利用（DRY原則）
- checkPermission(): 常にtrueを返す（勝利条件を満たしている場合）
- isEffect: false（効果外テキスト）
- category: "VictoryCondition"（特殊勝利条件）

**Pattern**: ChickenGameContinuousRuleと同じパターンを踏襲

---

## Phase 1: Data Model & Contracts

### Entity: ExodiaVictoryRule

**Type**: AdditionalRule implementation class

**Fields**:

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| isEffect | boolean | false | 効果外テキスト（無効化されない） |
| category | RuleCategory | "VictoryCondition" | 特殊勝利条件カテゴリ |

**Methods**:

| Method | Signature | Description |
|--------|-----------|-------------|
| canApply | (state: GameState, context: RuleContext) => boolean | 手札にエクゾディア5パーツが揃っているかを判定 |
| checkPermission | (state: GameState, context: RuleContext) => boolean | 勝利条件を満たしているかを確認（常にtrue） |

**Validation Rules**:
- canApply()はhasExodiaInHand(state)の結果を返す
- checkPermission()は常にtrueを返す（canApply()がtrueの場合のみ呼ばれる）

**State Transitions**:
```
checkVictoryConditions() 呼び出し
  → AdditionalRuleRegistry.collectActiveRules(state, "VictoryCondition")
  → ExodiaVictoryRule.canApply(state, {}) 
  → true なら ExodiaVictoryRule.checkPermission(state, {})
  → true なら GameResult { isGameOver: true, winner: "player", reason: "exodia" }
```

### Entity: VictoryRule.ts (Refactored)

**Changes**:

1. **checkVictoryConditions()リファクタリング**:
   - AdditionalRuleRegistryからVictoryConditionカテゴリのルールを取得
   - 特殊勝利条件を優先チェック（エクゾディア等）
   - 基本勝利条件（LP0、デッキアウト）をハードコードで維持

2. **後方互換性の維持**:
   - hasExodiaVictory(), hasLPDefeat(), hasLPVictory(), hasDeckOutDefeat()は維持
   - getMissingExodiaPieces(), countExodiaPiecesInHand()は維持

**Pseudocode**:

```typescript
export function checkVictoryConditions(state: GameState): GameResult {
  // 1. 特殊勝利条件チェック（AdditionalRuleRegistry）
  const victoryRules = AdditionalRuleRegistry.collectActiveRules(
    state, 
    "VictoryCondition", 
    {}
  );
  
  for (const rule of victoryRules) {
    if (rule.checkPermission && rule.checkPermission(state, {})) {
      // 特殊勝利条件が満たされた
      // TODO: ルールごとのメッセージ生成（将来の拡張）
      return {
        isGameOver: true,
        winner: "player",
        reason: "exodia", // 暫定: エクゾディアのみ
        message: `エクゾディア揃った！5つのパーツが手札に揃いました。勝利です！`,
      };
    }
  }

  // 2. 基本勝利条件チェック（ハードコード維持）
  
  // LP0敗北（プレイヤー）
  if (state.lp.player <= 0) {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "lp0",
      message: `ライフポイントが0になりました。敗北です。`,
    };
  }

  // LP0勝利（相手）
  if (state.lp.opponent <= 0) {
    return {
      isGameOver: true,
      winner: "player",
      reason: "lp0",
      message: `相手のライフポイントが0になりました。勝利です！`,
    };
  }

  // デッキアウト敗北
  if (state.zones.deck.length === 0 && state.phase === "Draw") {
    return {
      isGameOver: true,
      winner: "opponent",
      reason: "deckout",
      message: `デッキが空でドローできません。デッキアウトで敗北です。`,
    };
  }

  // 勝敗なし
  return {
    isGameOver: false,
  };
}
```

### Registry Initialization

**File**: `domain/effects/index.ts`

**Changes**:

```typescript
// AdditionalRule imports
import { AdditionalRuleRegistry } from "$lib/domain/registries/AdditionalRuleRegistry";
import { ChickenGameContinuousRule } from "$lib/domain/effects/additional/ChickenGameContinuousRule";
import { ExodiaVictoryRule } from "$lib/domain/effects/additional/ExodiaVictoryRule"; // NEW

// AdditionalRule exports
export { ExodiaVictoryRule } from "$lib/domain/effects/additional/ExodiaVictoryRule"; // NEW

function initializeAdditionalRuleRegistry(): void {
  // Card ID 67616300: Chicken Game (チキンレース) - Continuous Effect
  AdditionalRuleRegistry.register(67616300, new ChickenGameContinuousRule());

  // Card ID (none): Exodia Victory Condition - VictoryCondition (効果外テキスト)
  // Note: エクゾディアはカード固有の効果ではなく、5パーツ揃った時の効果外テキスト
  // そのため、特定のCard IDに紐付けず、VictoryRule側でチェックする
  // → AdditionalRuleRegistryには登録しない
  // → collectActiveRules()は使わず、VictoryRule.tsで直接ExodiaVictoryRuleをインスタンス化
}
```

**Note**: エクゾディアの勝利条件は、特定のカード（エクゾディア本体: 33396948）に紐付けるべきか、それともVictoryRule.ts側で直接チェックするべきか検討が必要。

**Design Decision**:
- Option 1: エクゾディア本体（33396948）のAdditionalRuleとして登録
  - Pros: AdditionalRuleRegistryのcollectActiveRules()パターンを活用できる
  - Cons: エクゾディア本体が手札にある場合のみチェックされる（フィールドにある場合は無視される）
  - **Selected**: Yes. エクゾディアの効果外テキストは「手札に揃った時」なので、canApply()内で手札チェックすれば十分。

- Option 2: VictoryRule.ts内で直接ExodiaVictoryRuleをインスタンス化
  - Pros: エクゾディアが手札/フィールドどこにあってもチェックできる
  - Cons: AdditionalRuleRegistryのパターンを活用できない
  - **Rejected**: AdditionalRuleRegistryのパターンを統一的に使うため。

**Final Decision**: Option 1を採用。エクゾディア本体（33396948）のAdditionalRuleとして登録する。ただし、canApply()内で「エクゾディア本体が手札にあるか」をチェックする必要はなく、「5パーツ全てが手札にあるか」をチェックすればよい。

**Revised Approach**:
- ExodiaVictoryRuleはカードIDに紐付けない（特定のカードの効果ではないため）
- VictoryRule.ts内で直接ExodiaVictoryRuleをインスタンス化してチェック
- AdditionalRuleRegistryは使用しない（このケースでは不適切）

**Rationale**: エクゾディアの勝利条件は「5パーツが手札に揃った状態」であり、特定のカード1枚の効果ではない。AdditionalRuleRegistryは「フィールド上のカードに紐付く効果」を管理するため、エクゾディアの勝利条件には不適切。

### Contracts

**Interface**: AdditionalRule (Existing)

```typescript
export interface AdditionalRule {
  readonly isEffect: boolean;
  readonly category: RuleCategory;
  canApply(state: GameState, context: RuleContext): boolean;
  checkPermission?(state: GameState, context: RuleContext): boolean;
}
```

**Implementation**: ExodiaVictoryRule

```typescript
export class ExodiaVictoryRule implements AdditionalRule {
  readonly isEffect = false;
  readonly category: RuleCategory = "VictoryCondition";

  canApply(state: GameState, context: RuleContext): boolean {
    return hasExodiaInHand(state);
  }

  checkPermission(state: GameState, context: RuleContext): boolean {
    return true; // canApply()がtrueなら勝利条件を満たしている
  }
}
```

**Testing Contract**:

```typescript
describe("ExodiaVictoryRule", () => {
  const rule = new ExodiaVictoryRule();

  it("should have isEffect = false", () => {
    expect(rule.isEffect).toBe(false);
  });

  it("should have category = VictoryCondition", () => {
    expect(rule.category).toBe("VictoryCondition");
  });

  it("canApply() should return true when all 5 Exodia pieces are in hand", () => {
    const state = createExodiaVictoryState();
    expect(rule.canApply(state, {})).toBe(true);
  });

  it("canApply() should return false when Exodia is incomplete", () => {
    const state = createMockGameState({ zones: { hand: [] } });
    expect(rule.canApply(state, {})).toBe(false);
  });

  it("checkPermission() should return true when canApply() is true", () => {
    const state = createExodiaVictoryState();
    expect(rule.checkPermission(state, {})).toBe(true);
  });
});
```

---

## Phase 2: Implementation Strategy (Overview)

**Note**: 詳細なタスク分割は`/speckit.tasks`コマンドで生成される。

### High-Level Implementation Steps

1. **T001: ExodiaVictoryRule実装**
   - `domain/effects/additional/ExodiaVictoryRule.ts`を作成
   - AdditionalRuleインターフェースを実装
   - canApply()とcheckPermission()を実装
   - 単体テストを作成

2. **T002: VictoryRule.tsリファクタリング**
   - checkVictoryConditions()を修正
   - ExodiaVictoryRuleを直接インスタンス化してチェック
   - 基本勝利条件のハードコードを維持
   - 既存のヘルパー関数を維持

3. **T003: テストの更新**
   - ExodiaVictoryRule.test.tsを作成
   - VictoryRule.test.tsを更新（後方互換性の検証）
   - すべてのテストがパスすることを確認

4. **T004: Lint/Format実行**
   - `npm run lint && npm run format`
   - エラーゼロの状態を確認

5. **T005: 統合テスト**
   - 既存のゲームフローでエクゾディア勝利が正しく動作することを確認
   - パフォーマンス検証（checkVictoryConditions()の実行時間）

### Dependency Order

```
T001 (ExodiaVictoryRule実装)
  └→ T002 (VictoryRule.tsリファクタリング)
      └→ T003 (テスト更新)
          └→ T004 (Lint/Format)
              └→ T005 (統合テスト)
```

### Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 既存のVictoryRule.tsのテストが壊れる | High | 既存のヘルパー関数を維持し、後方互換性を保証する |
| パフォーマンス劣化 | Medium | checkVictoryConditions()の実行時間を計測し、10%以内の変動に収める |
| AdditionalRuleRegistryのパターンが適用できない | Medium | エクゾディアの勝利条件は特定のカードに紐付けず、VictoryRule.ts内で直接チェックする |

---

## Development Quickstart

詳細は`quickstart.md`を参照（Phase 1で生成）。

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd skeleton-app
npm install
```

### Running Tests

```bash
# All tests
npm run test:run

# Watch mode
npm run test

# Specific test file
npm run test:run -- ExodiaVictoryRule.test.ts
```

### Linting & Formatting

```bash
# Lint
npm run lint

# Format
npm run format
```

### File Locations

- ExodiaVictoryRule: `skeleton-app/src/lib/domain/effects/additional/ExodiaVictoryRule.ts`
- VictoryRule: `skeleton-app/src/lib/domain/rules/VictoryRule.ts`
- Tests: `skeleton-app/tests/unit/domain/`

---

## References

- [ADR-0008: 効果モデルの導入とClean Architectureの完全実現](../../docs/adr/0008-effect-model-and-clean-architecture.md)
- [specs/008-effect-model](../008-effect-model/)
- [docs/architecture/overview.md](../../docs/architecture/overview.md)
- [docs/domain/effect-model.md](../../docs/domain/effect-model.md)
