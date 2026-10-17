import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  // SvelteKit v3 で $lib は廃止されたため、vite.config.ts と同様にエイリアスを指定する
  plugins: [sveltekit({ alias: { $lib: "src/lib" } })],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],

    // メモリ圧迫防止策（Vitest v4 で poolOptions は廃止されトップレベルに移動）
    pool: "forks", // スレッドではなくフォークを使用（メモリ分離）
    fileParallelism: true, // 並列実行を許可
    maxWorkers: 4, // 最大4プロセスに制限（デフォルトはCPUコア数）
    // タイムアウト設定（ハングしたテストを強制終了）
    testTimeout: 30000, // 30秒（デフォルト5秒から延長）
    hookTimeout: 10000, // beforeEach/afterEachのタイムアウト
    teardownTimeout: 10000, // テスト終了処理のタイムアウト

    // ファイル並列実行を制限（メモリ使用量削減）
    maxConcurrency: 5, // 同時実行テスト数を5に制限

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/lib/domain/**/*.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
