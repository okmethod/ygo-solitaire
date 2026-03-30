# Quickstart: Skeleton UI v3 → v4 移行

## 前提条件

- ブランチ: `001-skeleton-v4-upgrade`
- 作業ディレクトリ: `skeleton-app/`

---

## Step 1: パッケージ更新

```bash
cd skeleton-app

# package.json を手動で編集後、インストール
npm install
```

**package.json の変更箇所**:
```json
{
  "devDependencies": {
    "@skeletonlabs/skeleton": "^4.13.0",
    "@skeletonlabs/skeleton-svelte": "^4.13.0"
  }
}
```

---

## Step 2: CSS 修正 (src/app.css)

```css
/* 削除 */
@import "@skeletonlabs/skeleton/optional/presets";

/* 変更: @source → @import */
/* 削除 */
@source "../node_modules/@skeletonlabs/skeleton-svelte/dist";
/* 追加 */
@import "@skeletonlabs/skeleton-svelte";
```

---

## Step 3: app.html にデフォルトテーマを設定

```html
<!-- src/app.html -->
<html lang="ja" data-theme="cerberus">
```

---

## Step 4: ビルドエラー確認

```bash
npm run check 2>&1 | head -50
```

エラーの内容に応じて以下を実施:

### Modal が存在しない場合

`@skeletonlabs/skeleton-svelte` から `Modal` がエクスポートされていない場合、8 ファイルで `Dialog` への移行が必要。詳細は [plan.md](./plan.md) の「Modal → Dialog 移行戦略」を参照。

### Segment が存在しない場合

インポートを `SegmentedControl` に変更（3 ファイル）。

### Toaster が存在しない場合

`Toast.Group` への移行（2 ファイル）。

---

## Step 5: 動作確認

```bash
npm run dev
```

確認項目:
- [ ] アプリが起動する
- [ ] テーマが適用されている（デフォルト: cerberus）
- [ ] 設定モーダルが開閉できる
- [ ] テーマ切替（25 種）が動作する
- [ ] ダーク/ライトモード切替が動作する
- [ ] トースト通知が表示される

---

## Step 6: 品質チェック

```bash
npm run lint
npm run format
npm run check
npm run test:run
```

すべてエラーゼロで完了することを確認。

---

## トラブルシューティング

### テーマが適用されない

`themeStore` の `applyTheme()` が `document.documentElement.setAttribute('data-theme', ...)` を呼んでいることを確認。

### カスタムテーマのスタイル崩れ

`custom-theme.css` のカスタムプロパティ名が v4 のスキーマと一致しているか確認。v4 公式テーマの CSS を参照して変数名を修正する。
