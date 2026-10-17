# 設計方針

このアプリを **どう作るか**（技術的な設計・実装方針）を記述する。  
遊戯王のルールそのもの（何を作るか）は [game-rules/](../game-rules/) に置き、ここではそれを再説明せずリンクで誘導する。

このディレクトリは [game-rules/](../game-rules/) に依存してよい（逆向きは禁止）。  
依存ルールの詳細は [../README.md](../README.md) の「ドキュメント間の依存ルール」を参照。

---

## 📄 ファイル一覧

- [architecture.md](./architecture.md) — アーキテクチャ全体像（4 層構造・依存方向・データフロー・各層の責務）
- [testing-strategy.md](./testing-strategy.md) — テスト戦略（テストピラミッド・層割り当て・実行フロー）
- [comment-guide.md](./comment-guide.md) — TypeScript コメント規約（根幹 vs 枝葉・JSDoc の省略ルール）

---

## 📖 読む順序

1. まず [architecture.md](./architecture.md) でレイヤー構成と依存方向を把握する
2. 改修箇所に応じて、各設計ドキュメントを参照する
