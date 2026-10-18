---
description: テスト作成時の規約リマインド（詳細は docs/design/testing-strategy.md）
globs:
  - "skeleton-app/tests/**/*.ts"
  - "skeleton-app/src/test/**/*.ts"
---

# テスト規約

テスト戦略・層割り当て・配置・テストダブルの詳細は `docs/design/testing-strategy.md` を参照。
以下はテスト作成時のリマインドに留める（説明は SSOT 側が持つ）。

## リマインド

- **配置**: Unit → `tests/unit/` / Integration → `tests/integration/` / E2E → `tests/e2e/`
- **命名**: Unit・Integration は `*.test.ts`、E2E は `*.spec.ts`
- **テストダブル**: ダミーカードは `DUMMY_CARD_IDS` / `__testUtils__` を使う（実カードは必要な場合のみ）
- **過剰テストを避ける**: 実装の裏返しテストはせず、境界値と代表的な正常系に絞る
