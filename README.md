# Yu-Gi-Oh! ソリティア

## プロジェクト概要
特定の遊戯王カードの1ターンキルコンボをシミュレートするWebアプリケーションを実装する。
固定のデッキレシピで先行1ターン目をプレイし、勝利条件を満たすことを目的とするゲームとする。

## シミュレーションの基本ロジック
- ライフポイントの計算
- カードの効果によるステータス変化（攻撃力・守備力、表示形式など）
- カードの移動（手札、フィールド、墓地、除外など）
- **遊戯王カード効果システム**（NEW!）
  - デッキレシピベースの動的効果登録
  - 階層化アーキテクチャ（atoms → cards → BaseEffect）
  - OCGルール準拠の発動条件判定

## 期待するUI/UX
- 初期手札の配布
- 現在のフィールド、手札、墓地の表示
- シミュレーションのステップごとのアクション実行
- ライフポイントの表示
- ワンキル成功or失敗の表示

## 技術スタック

### フロントエンド
- **フレームワーク**: SvelteKit + Svelte 5
- **UIライブラリ**: Skeleton UI v3
- **CSS**: TailwindCSS v4
- **型チェック**: TypeScript
- **テスト**: Vitest
- **デプロイ**: GitHub Pages

### 効果システム
- **アーキテクチャ**: 階層化設計（atoms/cards/BaseEffect）
- **登録方式**: デッキレシピベース動的登録
- **パターン**: ファクトリーパターン（EffectRegistry）
- **型安全性**: TypeScript完全対応
- **テスト**: 単体・統合・エラーハンドリング

詳細な設計思想については [`skeleton-app/README.md`](./skeleton-app/README.md) を参照してください。

--- 

## ローカルでの起動方法

- コンテナ起動

  ```sh
  docker compose up
  ```

- ブラウザでアクセス

  http://localhost:5173/

---

## インターネットへの公開方法

- 静的アセットデプロイ

  ```sh
  (cd skeleton-app && npm run build)
  (cd skeleton-app && npm run deploy)
  ```

- ブラウザでアクセス

  https://okmethod.github.io/ygo-solitaire/
