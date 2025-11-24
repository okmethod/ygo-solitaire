# テスト戦略

## 基本方針

カードゲームのロジックはバグの温床になりやすいため、自動テストを重視します。

## テストピラミッド

```
        ┌─────────────┐
        │   E2E Tests │  ← 16 tests (Playwright)
        │   (少数)    │
        ├─────────────┤
        │ Integration │  ← Domain + Application
        │   Tests     │
        ├─────────────┤
        │   Unit      │  ← 204 tests (Vitest)
        │   Tests     │
        │   (多数)    │
        └─────────────┘
```

## Unit Tests (単体テスト)

### 対象
- Domain Layer: GameState, Rules
- Application Layer: Commands, GameFacade

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
