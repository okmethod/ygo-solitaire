import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * docstring の `@see {@link docs/...}` が指すドキュメントの実在を検査する。
 * docs 改名時にリンクがサイレントに腐るのを防ぐ（棲み分けルールは docs/design/comment-guide.md）。
 */

// $lib 配下の全ソースを raw で取り込む（vite root = skeleton-app）
const sources = import.meta.glob("/src/lib/**/*.{ts,svelte}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// リポジトリルート（skeleton-app の親）配下に docs/ が存在する
const repoRoot = resolve(process.cwd(), "..");

// {@link docs/...} のパス部分を抽出（#アンカーは張らない規約なので末尾で切る）
const linkPattern = /\{@link\s+(docs\/[^\s}#]+)/g;

const docLinks: { source: string; docPath: string }[] = [];
for (const [source, content] of Object.entries(sources)) {
  for (const match of content.matchAll(linkPattern)) {
    const docPath = match[1];
    if (docPath) docLinks.push({ source, docPath });
  }
}

describe("docstring の docs リンク", () => {
  it("検査対象のソースを取り込めている", () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0);
  });

  it.each(docLinks)("$source → $docPath が実在する", ({ docPath }) => {
    expect(existsSync(resolve(repoRoot, docPath))).toBe(true);
  });
});
