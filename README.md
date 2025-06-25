# my-static-site

`gh-pages` ブランチの静的アセットを Github Pages で公開する。

## ローカルでの起動方法

- コンテナ起動

  ```sh
  docker compose up
  ```

- ブラウザでアクセス

  http://localhost:5173/

## インターネットへの公開方法

- 静的アセットデプロイ

  ```sh
  (cd skeleton-app && npm run build)
  (cd skeleton-app && npm run deploy)
  ```

- ブラウザでアクセス

  https://okmethod.github.io/my-static-site/
