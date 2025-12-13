# テスト戦略

## 基本方針

カードゲームのロジックはバグの温床になりやすいため、自動テストを重視します。

## テストピラミッド

**E2E Tests (少数)**
- ツール: Playwright (`tests/e2e/`)
- 対象: Domain + Application + Presentation の連携
- 目的: ブラウザ上での実際の操作フロー検証

**Integration Tests**
- ツール: Vitest (`tests/integration/`)
- 対象: Domain + Application の連携
- 目的: レイヤー間の統合動作検証

**Unit Tests (多数)**
- ツール: Vitest (`tests/unit/`)
- 対象: 個別クラス・関数（全レイヤー）
- 目的: 各コンポーネントの単体動作検証

## Vitest テスト (Unit + Integration)

Vitestで実行されるテストは、以下のディレクトリ構造で配置されます。

```
tests/
├── unit/           # Unit Tests（単一クラス・関数）
│   ├── domain/
│   ├── application/
│   └── card-effects/
├── integration/    # Integration Tests（レイヤー間連携）
│   ├── GameFacade.test.ts
│   └── CardEffects.test.ts
└── e2e/           # E2E Tests（Playwright）
```

**メリット**:
- テストの目的が一目で区別できる
- `npx vitest run tests/unit/` のように個別実行可能
- 別々のカバレッジ設定が可能

### 対象
- Domain Layer: Rules, Effects, Models
- Application Layer: Commands, Stores, Facade
- Presentation Layer: Stores (cardDisplayStore, cardSelectionStore等)
- Infrastructure: API Client, Utilities

### ツール
- **Vitest**: 高速なTypeScript対応テストランナー
- **@testing-library/svelte**: Svelteコンポーネントテスト

### 実行コマンド
```bash
npm test              # ウォッチモード
npm run test:run      # 一回実行
npm run test:coverage # カバレッジ付き
npm run test:ui       # Vitest UI
```

### カバレッジ目標

**Domain Layer**: 80%以上必須

```typescript
// vitest.config.ts
coverage: {
  provider: "v8",
  include: ["src/lib/domain/**/*.ts"],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### テストケース例

#### Domain Layer: VictoryRule

```typescript
// VictoryRule.test.ts
describe('VictoryRule', () => {
  it('should detect Exodia victory when all 5 pieces are in hand', () => {
    const state = createStateWithExodia();
    const result = victoryRule.check(state);

    expect(result).not.toBeNull();
    expect(result?.winner).toBe('player');
    expect(result?.reason).toBe('exodia');
  });

  it('should return null when Exodia is incomplete', () => {
    const state = createStateWithCards(['exodia-head', 'exodia-right-arm']);
    const result = victoryRule.check(state);

    expect(result).toBeNull();
  });
});
```

#### Application Layer: DrawCardCommand

```typescript
// DrawCardCommand.test.ts
describe('DrawCardCommand', () => {
  it('should move card from deck to hand', () => {
    const initialState = createStateWithDeck(['pot-of-greed']);
    const command = new DrawCardCommand();

    const newState = command.execute(initialState);

    expect(newState.zones.deck.length).toBe(0);
    expect(newState.zones.hand.length).toBe(1);
    expect(newState.zones.hand[0].cardId).toBe('pot-of-greed');
  });

  it('should handle empty deck gracefully', () => {
    const initialState = createStateWithEmptyDeck();
    const command = new DrawCardCommand();

    expect(() => command.execute(initialState)).not.toThrow();
  });
});
```

### テストヘルパー

```typescript
// test/helpers.ts
export function createStateWithCards(cardIds: string[]): GameState {
  return {
    zones: {
      deck: [],
      hand: cardIds.map(id => createCard(id)),
      field: [],
      graveyard: [],
    },
    turnNumber: 1,
    currentPhase: 'Draw',
    gameResult: null,
  };
}
```

## Integration Tests (統合テスト)

### 対象
- Domain + Application の連携
- GameFacade経由の操作フロー

### テストケース例

```typescript
// GameFacade.integration.test.ts
describe('GameFacade Integration', () => {
  it('should complete full Exodia combo', () => {
    const facade = new GameFacade();
    facade.initializeGame('exodia-deck');

    // 5枚ドロー
    for (let i = 0; i < 5; i++) {
      facade.drawCard();
    }

    // 勝利判定
    const state = facade.getState();
    expect(state.gameResult?.winner).toBe('player');
  });
});
```

## E2E Tests (エンドツーエンドテスト)

### 対象
- ユーザーの実際の操作フロー
- ブラウザ上での動作検証

### ツール
- **Playwright**: クロスブラウザE2Eテスト

### 実行コマンド
```bash
npm run test:e2e        # Headlessモード
npm run test:e2e:ui     # UIモード
npm run test:e2e:debug  # デバッグモード
```

### テストスイート構成

#### 1. Phase Transition Flow
```typescript
// phase-transitions.spec.ts
test('should navigate through all phases correctly', async ({ page }) => {
  await page.goto('/simulator/test-deck');

  // Draw → Standby → Main1 → End
  await page.getByRole('button', { name: 'Advance Phase' }).click();
  await expect(page.getByText('スタンバイフェイズ')).toBeVisible();
});
```

#### 2. Card Activation Flow
```typescript
// card-activation.spec.ts
test('should activate spell card from hand', async ({ page }) => {
  await page.goto('/simulator/test-deck');
  await page.getByRole('button', { name: 'Draw Card' }).click();

  // Main1に進む
  await page.getByRole('button', { name: 'Advance Phase' }).click();
  await page.getByRole('button', { name: 'Advance Phase' }).click();

  // カード発動
  await page.getByRole('button', { name: 'Activate' }).click();
  await expect(page.getByText('Hand: 0 cards')).toBeVisible();
});
```

#### 3. Exodia Victory Flow
```typescript
// exodia-victory.spec.ts
test('should detect victory when drawing all 5 Exodia pieces', async ({ page }) => {
  await page.goto('/simulator/test-deck');

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Draw Card' }).click();
  }

  await expect(page.locator('h2:has-text("Game Over!")')).toBeVisible();
  await expect(page.locator('text=/Reason: exodia/')).toBeVisible();
});
```

## テスト実行フロー

### 開発時
```bash
# Unit tests (ウォッチモード)
npm test

# E2E tests (UIモード)
npm run test:e2e:ui
```

### CI/CD (GitHub Actions)
```bash
# 全テスト実行
npm run test:run      # Unit + Integration
npm run test:e2e      # E2E
npm run test:coverage # カバレッジレポート生成
```

## テスト分離

### Vitest設定
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/e2e/**", // PlaywrightテストをVitestから除外
    ],
  },
});
```

### Playwright設定
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev',
    port: 5173,
  },
});
```

## Card Effect Architecture テストパターン

### テスト責務の分離

Card Effect Architectureでは、テストを3層に分離します：

```
┌─────────────────────────────────────────────────────┐
│ 1. CardEffect Unit Tests                            │
│    - 個別カード効果クラスのテスト                    │
│    - tests/unit/card-effects/PotOfGreedEffect.test.ts│
│    - canActivate(), createSteps() の検証            │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│ 2. CardEffectRegistry Tests                         │
│    - Registry登録・取得のテスト                      │
│    - tests/unit/CardEffectRegistry.test.ts           │
│    - カードID → CardEffectインスタンスのマッピング   │
└─────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│ 3. Integration Tests (CardEffects.test.ts)          │
│    - ActivateSpellCommandとCardEffectの統合          │
│    - tests/unit/CardEffects.test.ts                  │
│    - effectResolutionStore呼び出しの検証             │
└─────────────────────────────────────────────────────┘
```

### 1. CardEffect Unit Tests

各CardEffectクラスの単体テスト。

**ファイルパス**: `tests/unit/card-effects/{CardName}Effect.test.ts`

**テスト対象**:
- `canActivate()`: バリデーションロジック
- `createSteps()`: EffectResolutionStep生成

**テストケース例**:

```typescript
// tests/unit/card-effects/PotOfGreedEffect.test.ts
import { describe, it, expect } from "vitest";
import { PotOfGreedEffect } from "$lib/domain/effects/cards/PotOfGreedEffect";
import { createMockGameState, createCardInstances } from "$lib/__testUtils__/gameStateFactory";

describe("PotOfGreedEffect", () => {
  describe("canActivate", () => {
    it("should return false when game is over", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: { deck: createCardInstances(["card1", "card2"], "deck") },
        result: { isGameOver: true, winner: "opponent" },
      });
      const effect = new PotOfGreedEffect();

      expect(effect.canActivate(state)).toBe(false);
    });

    it("should return false when not in Main1 phase", () => {
      const state = createMockGameState({
        phase: "Draw",
        zones: { deck: createCardInstances(["card1", "card2"], "deck") },
      });
      const effect = new PotOfGreedEffect();

      expect(effect.canActivate(state)).toBe(false);
    });

    it("should return false when deck has only 1 card", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: { deck: createCardInstances(["card1"], "deck") },
      });
      const effect = new PotOfGreedEffect();

      expect(effect.canActivate(state)).toBe(false);
    });

    it("should return true when deck has 2 or more cards", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: { deck: createCardInstances(["card1", "card2"], "deck") },
      });
      const effect = new PotOfGreedEffect();

      expect(effect.canActivate(state)).toBe(true);
    });
  });

  describe("createSteps", () => {
    it("should create draw step with correct properties", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: { deck: createCardInstances(["card1", "card2"], "deck") },
      });
      const effect = new PotOfGreedEffect();
      const steps = effect.createSteps(state);

      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });
      expect(steps[0].action).toBeTypeOf("function");
    });
  });
});
```

### 2. CardEffectRegistry Tests

Registry登録・取得の検証。

**ファイルパス**: `tests/unit/CardEffectRegistry.test.ts`

**テスト対象**:
- `register()`: カードID → CardEffectインスタンスの登録
- `get()`: カードIDによる取得
- `clear()`: テスト用クリーニング

**テストケース例**:

```typescript
// tests/unit/CardEffectRegistry.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { CardEffectRegistry } from "$lib/domain/effects/CardEffectRegistry";
import { PotOfGreedEffect } from "$lib/domain/effects/cards/PotOfGreedEffect";
import { GracefulCharityEffect } from "$lib/domain/effects/cards/GracefulCharityEffect";

describe("CardEffectRegistry", () => {
  beforeEach(() => {
    // 各テスト前にRegistryをクリア
    CardEffectRegistry.clear();
  });

  describe("register and get", () => {
    it("should register and return Pot of Greed effect", () => {
      const effect = new PotOfGreedEffect();
      CardEffectRegistry.register(55144522, effect);

      const retrieved = CardEffectRegistry.get(55144522);

      expect(retrieved).toBe(effect);
      expect(retrieved).toBeInstanceOf(PotOfGreedEffect);
    });

    it("should register and return Graceful Charity effect", () => {
      const effect = new GracefulCharityEffect();
      CardEffectRegistry.register(79571449, effect);

      const retrieved = CardEffectRegistry.get(79571449);

      expect(retrieved).toBe(effect);
      expect(retrieved).toBeInstanceOf(GracefulCharityEffect);
    });

    it("should return undefined for unregistered card ID", () => {
      const retrieved = CardEffectRegistry.get(99999999);

      expect(retrieved).toBeUndefined();
    });

    it("should handle multiple registrations", () => {
      CardEffectRegistry.register(55144522, new PotOfGreedEffect());
      CardEffectRegistry.register(79571449, new GracefulCharityEffect());

      expect(CardEffectRegistry.get(55144522)).toBeInstanceOf(PotOfGreedEffect);
      expect(CardEffectRegistry.get(79571449)).toBeInstanceOf(GracefulCharityEffect);
    });
  });

  describe("clear", () => {
    it("should clear all registered effects", () => {
      CardEffectRegistry.register(55144522, new PotOfGreedEffect());
      CardEffectRegistry.register(79571449, new GracefulCharityEffect());

      CardEffectRegistry.clear();

      expect(CardEffectRegistry.get(55144522)).toBeUndefined();
      expect(CardEffectRegistry.get(79571449)).toBeUndefined();
    });
  });
});
```

### 3. Integration Tests (CardEffects.test.ts)

ActivateSpellCommandとCardEffectの統合テスト。

**ファイルパス**: `tests/unit/CardEffects.test.ts`

**テスト対象**:
- `ActivateSpellCommand.execute()` → `CardEffectRegistry.get()` → `effect.createSteps()` → `effectResolutionStore.startResolution()`
- カード固有のバリデーション（`canExecute()`）
- EffectResolutionStepの内容検証

**テストケース例**:

```typescript
// tests/unit/CardEffects.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivateSpellCommand } from "$lib/application/commands/ActivateSpellCommand";
import { createMockGameState, createCardInstances } from "$lib/__testUtils__/gameStateFactory";
import { effectResolutionStore } from "$lib/stores/effectResolutionStore";

describe("Card Effects Integration", () => {
  describe("Pot of Greed (55144522)", () => {
    const potOfGreedCardId = "55144522";

    beforeEach(() => {
      effectResolutionStore.reset();
    });

    it("should call effectResolutionStore.startResolution when activated", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
        },
      });

      const spy = vi.spyOn(effectResolutionStore, "startResolution");
      const command = new ActivateSpellCommand("pot-1");
      command.execute(state);

      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("should create correct EffectResolutionStep structure", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1", "card2", "card3"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
        },
      });

      const spy = vi.spyOn(effectResolutionStore, "startResolution");
      const command = new ActivateSpellCommand("pot-1");
      command.execute(state);

      const [[steps]] = spy.mock.calls;
      expect(steps).toHaveLength(1);
      expect(steps[0]).toMatchObject({
        id: "pot-of-greed-draw",
        title: "カードをドローします",
        message: "デッキから2枚ドローします",
      });

      spy.mockRestore();
    });

    it("canExecute should return false when deck has only 1 card", () => {
      const state = createMockGameState({
        phase: "Main1",
        zones: {
          deck: createCardInstances(["card1"], "deck"),
          hand: [{ instanceId: "pot-1", cardId: potOfGreedCardId, location: "hand" }],
        },
      });

      const command = new ActivateSpellCommand("pot-1");

      expect(command.canExecute(state)).toBe(false);
    });
  });

  describe("Graceful Charity (79571449)", () => {
    // 同様のテストケース
  });
});
```

### テストカバレッジ目標

| レイヤー | 対象 | カバレッジ目標 |
|---------|------|---------------|
| Domain Layer | CardEffect, SpellEffect, NormalSpellEffect | 90%以上 |
| Domain Layer | CardEffectRegistry | 100% |
| Application Layer | ActivateSpellCommand統合 | 80%以上 |

### テスト実行順序

```bash
# 1. CardEffect Unit Tests
npm test tests/unit/card-effects/

# 2. CardEffectRegistry Tests
npm test tests/unit/CardEffectRegistry.test.ts

# 3. Integration Tests
npm test tests/unit/CardEffects.test.ts

# 4. 全Unit Tests
npm run test:run
```

### モック戦略

**CardEffect Unit Tests**:
- GameState: `createMockGameState()` でモック生成
- Stores: モック不要（純粋関数）

**CardEffectRegistry Tests**:
- CardEffectインスタンス: 実オブジェクトを使用
- モック不要（Registry自体がシンプル）

**Integration Tests**:
- `effectResolutionStore`: `vi.spyOn()` でスパイ
- `gameStateStore`: `get(store)` で同期的に値取得

---

## モック戦略

### Domain Layer
- **モック不要**: 純粋関数のため実オブジェクトでテスト

### Application Layer
- **GameState**: テストヘルパーで生成
- **Stores**: `get(store)` で同期的に値取得

### Presentation Layer
- **API**: Playwrightの `route` でモック
- **Toast**: 実際のtoaster動作を検証

## テストデータ

### テスト用デッキ
```typescript
// test-deck.ts
export const TEST_DECK = {
  id: 'test-deck',
  name: 'Test Deck',
  cards: [
    'exodia-head',
    'exodia-right-arm',
    'exodia-left-arm',
    'exodia-right-leg',
    'exodia-left-leg',
  ],
};
```

## CI/CD統合

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm run test:run
    npm run test:coverage

- name: Run E2E Tests
  run: |
    npx playwright install --with-deps
    npm run test:e2e
```

## 今後の課題

- [ ] Visual Regression Testing (Playwrightスクリーンショット比較)
- [ ] Performance Testing (Lighthouse CI)
- [ ] Mutation Testing (Stryker)

## 関連ドキュメント

- [アーキテクチャ概要](./overview.md)
- [コーディング規約](../development/conventions.md)
