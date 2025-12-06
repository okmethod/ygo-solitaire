# Performance Validation Guide - Effect Activation UI (003)

**Purpose**: パフォーマンス検証とAPI呼び出し頻度確認の手順書

**Date**: 2025-12-04

---

## パフォーマンス検証（40枚同時表示で30fps以上）

### 検証環境

- **ブラウザ**: Chrome DevTools Performance タブ
- **デバイス**: Desktop (throttling なし)
- **URL**: `http://localhost:5173/simulator/{deckId}`

### 検証手順

1. **開発サーバー起動**

   ```bash
   cd skeleton-app
   npm run dev
   ```

2. **シミュレーターページへアクセス**

   - デッキを選択してシミュレーターページを開く

3. **Chrome DevTools Performance タブで測定**

   - DevTools → Performance タブ
   - 「Record」ボタンをクリック
   - 以下の操作を実行:
     - Draw Card ボタンを連続クリック（40枚まで手札を増やす）
     - Advance Phase ボタンをクリックしてMain1フェーズへ移動
     - 手札のカードをクリック（クリック操作のレスポンス測定）
   - 「Stop」ボタンでRecording停止

4. **フレームレート確認**
   - Performance タブの「Frames」セクションでフレームレートを確認
   - 基準: **30fps以上を維持**
   - 確認ポイント:
     - カードドロー時のレンダリング
     - カードクリック時のUI更新
     - フェーズ遷移時のUI更新

### 判定基準

- ✅ **合格**: 40枚表示時に平均30fps以上維持
- ⚠️ **要改善**: 30fps未満だが20fps以上（リファクタリング検討）
- ❌ **失敗**: 20fps未満（スコープ縮小またはアーキテクチャ見直し）

### 現在の最適化

- Svelte 5のリアクティビティシステム（$derived）による効率的な再レンダリング
- YGOPRODeck APIのメモリキャッシュ（重複取得を防止）
- Card.svelteコンポーネントの軽量実装

---

## API呼び出し頻度確認（キャッシュヒット時は追加リクエスト0件）

### 検証環境

- **ブラウザ**: Chrome DevTools Network タブ
- **URL**: `http://localhost:5173/simulator/{deckId}`

### 検証手順

1. **開発サーバー起動**

   ```bash
   cd skeleton-app
   npm run dev
   ```

2. **Chrome DevTools Network タブで監視**

   - DevTools → Network タブ
   - Filter: `XHR` または `Fetch` を選択
   - Domain filter: `db.ygoprodeck.com` でフィルタリング

3. **初回ロード時のAPI呼び出しを確認**

   - シミュレーターページへアクセス
   - 初回ドローで手札に5枚追加
   - Network タブで `cardinfo.php?id=` のリクエスト数を確認
   - 期待: **1回のバッチリクエスト**（5枚のカードIDをカンマ区切りで送信）

4. **キャッシュヒット時の挙動確認**

   - 手札のカードをクリックして墓地に送る（activateSpell）
   - 墓地カードが表示される際にNetwork タブを確認
   - 期待: **追加リクエスト0件**（キャッシュから取得）

5. **再度ドローした場合の挙動確認**
   - Draw Cardボタンで新しいカードをドロー
   - 新規カードのみAPIリクエストが発生することを確認
   - 既にキャッシュされたカードは追加リクエストなし

### 判定基準

- ✅ **合格**: キャッシュヒット時は追加リクエスト0件
- ⚠️ **要改善**: 一部のカードで重複リクエストが発生（キャッシュキー設計見直し）
- ❌ **失敗**: すべてのカードで毎回リクエスト発生（キャッシュロジック不具合）

### 現在のキャッシュ実装

- **場所**: `src/lib/api/ygoprodeck.ts`
- **方式**: `Map<number, YGOProDeckCard>` によるメモリキャッシュ
- **ライフサイクル**: ページリロードまで（セッション単位）
- **最適化**: バッチリクエスト対応（`getCardsByIds([id1, id2, ...])`）

**キャッシュロジック**:

```typescript
// 1. キャッシュヒット/ミスを分離
const cachedCards = ids.map((id) => cardCache.get(id)).filter(Boolean);
const uncachedIds = ids.filter((id) => !cardCache.has(id));

// 2. 未キャッシュのカードのみAPIリクエスト
if (uncachedIds.length > 0) {
  const data = await fetchAPI(`cardinfo.php?id=${uncachedIds.join(",")}`);
  data.forEach((card) => cardCache.set(card.id, card));
}

// 3. キャッシュカード + 新規取得カードを結合
return [...cachedCards, ...fetchedCards];
```

---

## 検証結果記録

### パフォーマンス検証

- **実施日**: YYYY-MM-DD
- **結果**: ✅ 合格 / ⚠️ 要改善 / ❌ 失敗
- **測定値**: XX fps (40枚表示時)
- **備考**:

### API呼び出し頻度確認

- **実施日**: YYYY-MM-DD
- **結果**: ✅ 合格 / ⚠️ 要改善 / ❌ 失敗
- **初回リクエスト数**: X回
- **キャッシュヒット時**: 追加リクエスト X回
- **備考**:

---

## 参考資料

- [YGOPRODeck API Documentation](https://ygoprodeck.com/api-guide/)
- [Svelte Performance Best Practices](https://svelte.dev/docs/svelte/advanced/performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
