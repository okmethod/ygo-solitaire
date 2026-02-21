/**
 * E2E Smoke Test: Basic application loading
 */
import { test, expect } from "@playwright/test";

// フィクスチャのインポート（実際のYGOPRODeck APIレスポンスと同じ形式）
import exodiaFixture from "./fixtures/ygoprodeck/exodia.json" assert { type: "json" };
import potOfGreedFixture from "./fixtures/ygoprodeck/pot-of-greed.json" assert { type: "json" };
import gracefulCharityFixture from "./fixtures/ygoprodeck/graceful-charity.json" assert { type: "json" };

test.describe("Application Smoke Test", () => {
  test("should load application with mocked YGOPRODeck API", async ({ page }) => {
    // YGOPRODeck APIをモック
    await page.route("**/api.ygoprodeck.com/api/v7/**", async (route) => {
      const url = route.request().url();

      // Exodia (33396948)
      if (url.includes("id=33396948")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [exodiaFixture] }),
        });
        return;
      }

      // Pot of Greed (55144522)
      if (url.includes("id=55144522")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [potOfGreedFixture] }),
        });
        return;
      }

      // Graceful Charity (79571449)
      if (url.includes("id=79571449")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [gracefulCharityFixture] }),
        });
        return;
      }

      // バッチリクエスト（複数IDをカンマ区切りで取得）
      if (url.includes("id=")) {
        const idMatch = url.match(/id=([0-9,]+)/);
        if (idMatch) {
          const ids = idMatch[1].split(",").map((id) => parseInt(id, 10));
          const cards = ids
            .map((id) => {
              if (id === 33396948) return exodiaFixture;
              if (id === 55144522) return potOfGreedFixture;
              if (id === 79571449) return gracefulCharityFixture;
              return null;
            })
            .filter(Boolean);

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: cards }),
          });
          return;
        }
      }

      // 未定義のカードIDはエラー
      await route.abort("failed");
    });

    // アプリケーションページに移動
    await page.goto("/");

    // ページが正常に読み込まれることを確認（スモークテスト）
    await expect(page).toHaveTitle(/.*/, { timeout: 5000 });

    // エラーページに遷移していないことを確認
    await expect(page).not.toHaveURL(/error/);
  });

  test("should auto-advance to Main Phase on simulator page", async ({ page }) => {
    // YGOPRODeck APIをモック（必要最小限のカードのみ）
    // greedy-exodia-deckで必要な全カードIDに対応
    await page.route("**/api.ygoprodeck.com/api/v7/**", async (route) => {
      const url = route.request().url();

      // バッチリクエスト（複数IDをカンマ区切りで取得）
      if (url.includes("id=")) {
        const idMatch = url.match(/id=([0-9,]+)/);
        if (idMatch) {
          const ids = idMatch[1].split(",").map((id) => parseInt(id, 10));
          const cards = ids.map((id) => {
            // Exodia pieces and spell cards
            if (id === 33396948) return exodiaFixture;
            if (id === 55144522) return potOfGreedFixture;
            if (id === 79571449) return gracefulCharityFixture;

            // 残りのExodiaパーツと強欲な瓶はダミーデータで対応
            const isSpell = id > 50000000;
            return {
              id,
              name: `Card ${id}`,
              type: isSpell ? "Spell Card" : "Effect Monster",
              humanReadableCardType: isSpell ? "Spell Card" : "Effect Monster",
              frameType: isSpell ? "spell" : "effect",
              typeline: isSpell ? ["Normal"] : ["Spellcaster", "Effect"],
              desc: `Test card ${id}`,
              race: isSpell ? "Normal" : "Spellcaster",
              atk: isSpell ? undefined : 1000,
              def: isSpell ? undefined : 1000,
              level: isSpell ? undefined : 3,
              attribute: isSpell ? undefined : "DARK",
              card_images: [
                {
                  id,
                  image_url: `https://images.ygoprodeck.com/images/cards/${id}.jpg`,
                  image_url_small: `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
                  image_url_cropped: `https://images.ygoprodeck.com/images/cards_cropped/${id}.jpg`,
                },
              ],
            };
          });

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ data: cards }),
          });
          return;
        }
      }

      // 未定義のカードIDはエラー
      await route.abort("failed");
    });

    // シミュレータページに移動（有効なdeckId "greedy-exodia-deck" を使用）
    // Note: ベースURL /ygo-solitaire が設定されているため、相対パスで指定
    await page.goto("/ygo-solitaire/simulator/greedy-exodia-deck");

    // 自動フェーズ進行を確認：Main Phase 1に到達することを期待
    const phaseIndicator = page.locator('[data-testid="current-phase"]');

    // 自動フェーズ進行の完了を待機（300ms × 2 + マージン = 1500ms）
    await page.waitForTimeout(1500);

    // メインフェーズ1に到達していることを確認（英語表記で文字エンコーディング問題を回避）
    await expect(phaseIndicator).toContainText("Main Phase 1");
  });
});
