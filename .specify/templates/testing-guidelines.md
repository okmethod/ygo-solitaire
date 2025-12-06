---
description: "Testing strategy guidelines for ygo-solitaire project"
---

# Testing Guidelines for ygo-solitaire

**Purpose**: Ensure test tasks follow the project's testing pyramid and avoid over-reliance on E2E tests.

**Reference**: [docs/architecture/testing-strategy.md](../../docs/architecture/testing-strategy.md)

---

## Testing Pyramid (Enforce for All Features)

```
        ┌─────────────┐
        │   E2E Tests │  ← 少数（UI統合確認のみ）
        │   (少数)    │
        ├─────────────┤
        │ Integration │  ← Domain + Application連携
        │   Tests     │  (tests/unit/ に配置)
        ├─────────────┤
        │   Unit      │  ← ロジック検証の中心
        │   Tests     │  (tests/unit/ に配置)
        └─────────────┘
```

**Target Ratio**: Vitest 8-10 : E2E 1-2

---

## Test Classification

### ✅ Vitest Tests (`tests/unit/`)

**Use for**:
- ✅ Domain Layer純粋関数（GameState, Rules）
- ✅ Application Layer Command クラス
- ✅ Domain + Application 連携（Integration）
- ✅ Store の状態管理ロジック
- ✅ カードID判定、デッキ枚数チェック等の内部ロジック
- ✅ エラーハンドリング、バリデーション

**Example Test Tasks**:
```markdown
### Unit Tests for User Story X

- [ ] TXX [P] [USX] Unit Test追加: `tests/unit/XXXCommand.test.ts` に〇〇ロジックのテストを追加
- [ ] TXX [P] [USX] Unit Test追加: デッキ不足時の`canExecute()`エラーハンドリングを検証
- [ ] TXX [USX] Test実行: `npm test` で全テスト通過確認
```

**Commands**:
- `npm test` - ウォッチモード
- `npm run test:run` - 一回実行
- `npm run test:coverage` - カバレッジ付き

---

### ⚠️ E2E Tests (`tests/e2e/`)

**Use ONLY for**:
- ⚠️ 新規UIコンポーネントの動作確認
- ⚠️ ユーザー操作フロー（クリック → モーダル表示 → 確定）
- ⚠️ 既存E2Eでカバーできない新規UI統合

**DO NOT use for**:
- ❌ 内部ロジックの検証（カードID判定等）
- ❌ 既存コンポーネントの再利用
- ❌ エラーハンドリング（Unit Testで十分）
- ❌ 既存E2Eテストでカバー済みの操作

**Example Test Tasks**:
```markdown
### E2E Tests for User Story X（UI統合確認のみ）

- [ ] TXX [P] [USX] E2Eテスト作成: `tests/e2e/XXX.spec.ts` で新規UI（〇〇モーダル）の動作を検証
```

**Commands**:
- `npm run test:e2e` - Headlessモード
- `npm run test:e2e:ui` - UIモード

**Existing E2E Tests** (Reuse when possible):
- `card-activation.spec.ts` - カード発動フロー（手札 → 墓地）
- `effect-activation-ui.spec.ts` - カードクリック → 発動
- `exodia-victory.spec.ts` - Exodia勝利判定
- `phase-transitions.spec.ts` - フェーズ遷移

---

## Test Responsibility Separation

**Principle**: Separate tests by responsibility to avoid file bloat and maintain clarity.

### Command Tests vs Card-Specific Tests

**DO NOT** add card-specific logic tests to Command test files (e.g., `ActivateSpellCommand.test.ts`).

**Instead**, separate tests into:

1. **Command Test File** (`ActivateSpellCommand.test.ts`)
   - ✅ Test Command pattern implementation
   - ✅ Test universal flow (hand → field → graveyard)
   - ✅ Test phase checks, game-over checks
   - ✅ Test immutability (Immer)
   - ❌ DO NOT test card-specific effects

2. **Card Effects Test File** (`CardEffects.test.ts`)
   - ✅ Test individual card effect processing
   - ✅ Test effectResolutionStore calls for specific cards
   - ✅ Test card-specific validation (deck size, hand requirements)
   - ✅ Group all card effects in one file (20-30 cards)

**File Structure**:
```
tests/unit/
├── ActivateSpellCommand.test.ts  → Command flow (universal)
└── CardEffects.test.ts            → Card-specific effects
```

**When to create subdirectories** (only if card count > 30):
```
tests/unit/
├── ActivateSpellCommand.test.ts
└── card-effects/
    ├── PotOfGreed.test.ts
    └── GracefulCharity.test.ts
```

---

## Task Planning Checklist

When creating test tasks for a new feature, ask:

**1. Is this internal logic?**
- ✅ Yes → Vitest Test
- ❌ No → Check next question

**2. Is there a new UI component?**
- ✅ Yes → E2E Test（1-2タスクのみ）
- ❌ No → No E2E Test needed

**3. Can existing E2E tests cover this?**
- ✅ Yes → No new E2E Test
- ❌ No → Add minimal E2E Test

---

## Example Test Task Breakdown

### ❌ BAD: E2E-heavy approach

```markdown
### E2E Tests for User Story 1

- [ ] T013 E2Eテスト作成（正常系）: Pot of Greed発動→2枚ドロー→手札増加を検証
- [ ] T014 E2Eテスト作成（エラー系）: デッキ1枚で発動→エラーメッセージ表示を検証
- [ ] T015 E2Eテスト実行: 全テスト通過確認
```

**Problems**:
- ❌ E2E tests for internal logic
- ❌ 3 E2E tasks for simple logic
- ❌ Slow execution, high maintenance cost

---

### ✅ GOOD: Vitest-centric approach with test separation

```markdown
### Unit Tests for User Story 1

**Note**: 個別カードの効果処理テストは `CardEffects.test.ts` に集約し、`ActivateSpellCommand.test.ts` は普遍的なCommandフローのみをテストする方針（テストの責務分離）

- [ ] T013 [P] [US1] Unit Test作成: `tests/unit/CardEffects.test.ts` を新規作成し、Pot of Greed（cardId 55144522）の効果処理テストを追加
  - effectResolutionStore.startResolution() 呼び出しを検証
  - EffectResolutionStep の内容（id, title, message, action）を検証
  - actionが DrawCardCommand(2) を実行することを検証
- [ ] T014 [P] [US1] Unit Test追加: `CardEffects.test.ts` にPot of Greedのデッキ枚数チェック（>= 2）テストを追加
  - デッキ1枚の状態で `canExecute()` が false を返すことを検証
- [ ] T015 [US1] Unit Test実行: `npm test` で全テスト通過確認（既存テスト含む）

**Note**: UI統合は既存E2Eテスト（card-activation.spec.ts）で確認済み
```

**Benefits**:
- ✅ Fast execution (Vitest)
- ✅ Low maintenance cost
- ✅ Reuses existing E2E tests
- ✅ Focused on logic verification
- ✅ Test responsibility separation (Command flow vs Card-specific effects)

---

## Test Task Template (Copy for New Features)

```markdown
### Unit Tests for User Story X

- [ ] TXX [P] [USX] Unit Test追加: `tests/unit/XXX.test.ts` に〇〇ロジックのテストを追加
  - カードID判定、状態管理、エラーハンドリング等
- [ ] TXX [P] [USX] Unit Test追加: 〇〇エラーケースのテストを追加
  - デッキ不足、無効な状態、境界値テスト等
- [ ] TXX [USX] Test実行: `npm test` で全テスト通過確認

### E2E Tests for User Story X（UI統合確認のみ）← この注釈を必ず付ける

> **ONLY include this section if there is a NEW UI component**

- [ ] TXX [P] [USX] E2Eテスト作成: `tests/e2e/XXX.spec.ts` で新規UI（〇〇モーダル）の動作を検証
  - モーダル表示 → ユーザー操作 → 期待される結果

**Note**: 内部ロジックはUnit Testで検証済み。このE2Eテストは新規UI統合のみ確認。
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: "Testing everything with E2E"

```markdown
- [ ] T013 E2Eテスト: カードID判定を検証
- [ ] T014 E2Eテスト: デッキ枚数チェックを検証
- [ ] T015 E2Eテスト: エラーメッセージ表示を検証
```

**Fix**: Use Vitest for internal logic verification.

---

### ❌ Anti-Pattern 2: "Duplicating existing E2E coverage"

```markdown
- [ ] T013 E2Eテスト: カード発動フローを検証（手札 → 墓地）
```

**Fix**: Note that `card-activation.spec.ts` already covers this.

---

### ❌ Anti-Pattern 3: "No tests at all"

```markdown
### Implementation for User Story 1

- [ ] T013 Implement feature X
- [ ] T014 Implement feature Y
```

**Fix**: Add Unit Tests for new logic.

---

## Coverage Goals (from docs/architecture/testing-strategy.md)

**Domain Layer**: 80%+ coverage required

```typescript
// vitest.config.ts
coverage: {
  include: ["src/lib/domain/**/*.ts"],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

**Application Layer**: Aim for high coverage (not strictly enforced)

**Presentation Layer**: E2E for critical user flows only

---

## Summary: Test Task Planning Rules

1. **Default to Vitest** for all logic verification
2. **Add E2E** only for new UI components (1-2 tasks max)
3. **Reuse existing E2E** tests when possible
4. **Target ratio**: Vitest 8-10 : E2E 1-2
5. **Always include** `npm test` execution task
6. **Annotate E2E sections** with "（UI統合確認のみ）"

---

## Related Documentation

- [Testing Strategy](../../docs/architecture/testing-strategy.md) - Full testing approach
- [Architecture Overview](../../docs/architecture/overview.md) - Clean Architecture layers
- [Coding Conventions](../../docs/development/conventions.md) - Code style guide

---

**Last Updated**: 2025-12-06 (Feature 004: Card Effect Execution)
