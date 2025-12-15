/**
 * E2E Smoke Test: Basic application loading
 */
import { test, expect } from "@playwright/test";

// フィクスチャのインポート（実際のYGOPRODeck APIレスポンスと同じ形式）
import exodiaFixture from "../fixtures/ygoprodeck/exodia.json" assert { type: "json" };
import potOfGreedFixture from "../fixtures/ygoprodeck/pot-of-greed.json" assert { type: "json" };
import gracefulCharityFixture from "../fixtures/ygoprodeck/graceful-charity.json" assert { type: "json" };

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
});
