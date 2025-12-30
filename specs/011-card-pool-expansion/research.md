# Research: Card Pool Expansion - 6 New Spell Cards

**Feature**: 011-card-pool-expansion
**Date**: 2025-12-30
**Status**: Complete

## Overview

6枚の新規通常魔法・速攻魔法カードを既存のChainableActionシステムに追加する際の技術的な実現可能性を検証。既存実装の調査により、すべて実装可能と判断。

## Research Questions & Findings

### Q1: GameStateに相手LPフィールドは存在するか？

**Decision**: 既存実装で対応済み

**Rationale**:
- `GameState.lp.opponent`フィールドが既に存在 ([GameState.ts:22-25](../../skeleton-app/src/lib/domain/models/GameState.ts#L22-L25))
- 初期値は8000LP ([GameState.ts:17](../../skeleton-app/src/lib/domain/models/GameState.ts#L17))
- 成金ゴブリンの「相手1000LP回復」は`lp.opponent += 1000`で実装可能

**Alternatives considered**:
- N/A（既存実装を使用）

---

### Q2: デッキシャッフル機能は実装済みか？

**Decision**: `shuffleArray`関数を使用

**Rationale**:
- `skeleton-app/src/lib/shared/utils/arrayUtils.ts`に汎用シャッフル関数が実装済み
- Fisher-Yates (Knuth) アルゴリズム使用、O(n)、不変性保証
- 打ち出の小槌の「デッキをシャッフル」処理で直接使用可能

**Alternatives considered**:
- 新規実装: 不要（既存実装で十分）

---

### Q3: CardSelectionModalは任意枚数選択に対応しているか？

**Decision**: minCards/maxCardsで柔軟に対応可能

**Rationale**:
- CardSelectionConfigに`minCards`, `maxCards`フィールドが存在
- 打ち出の小槌: `minCards: 0, maxCards: hand.length`で任意枚数選択可能
- 闇の量産工場: `minCards: 2, maxCards: 2`で2枚固定
- テラフォーミング: `minCards: 1, maxCards: 1`で1枚固定

**Alternatives considered**:
- カスタムUI実装: 不要（既存CardSelectionModalで対応可能）

---

### Q4: 墓地からの回収・デッキからのサーチ機能は実装可能か？

**Decision**: Zone.tsにヘルパー関数を追加

**Rationale**:
- `Zone.ts`に`moveCard`関数が実装済み（任意ゾーン間移動）
- 闇の量産工場: `moveCard(zones, instanceId, "graveyard", "hand")`で実装
- テラフォーミング: `moveCard(zones, instanceId, "deck", "hand")`で実装
- フィルタリング（通常モンスター、フィールド魔法）はCardDataRegistryのtype判定で実現

**Alternatives considered**:
- 専用コマンド作成: 不要（既存moveCard関数で十分）

---

### Q5: ダメージ無効化効果の実装方法は？

**Decision**: GameStateに`damageNegation`フラグを追加

**Rationale**:
- 一時休戦の「次の相手ターン終了時までダメージ0」は永続効果
- 現在は相手ターンが存在しないため、`damageNegation: boolean`フラグで簡易実装
- AdditionalRuleシステムとの統合は将来のダメージ計算システム実装時に検討

**Alternatives considered**:
- AdditionalRule即時実装: オーバーエンジニアリング（現在ダメージ計算システム未実装）
- 実装しない: spec要件を満たさない

---

### Q6: 速攻魔法（spellSpeed=2）の実装方法は？

**Decision**: ChainableActionの`spellSpeed`プロパティに2を設定

**Rationale**:
- ChainableActionインターフェースに`spellSpeed: 1 | 2 | 3`が定義済み
- 手札断札は`spellSpeed = 2 as const`で実装
- チェーンシステムは未実装だが、将来実装時に対応可能（型定義のみ）

**Alternatives considered**:
- spellSpeedフィールドを省略: 将来のチェーンシステムで問題（仕様違反）

---

## Implementation Strategy

### Phase 1: Simple Draw Effects (P1)

**Cards**: 成金ゴブリン、一時休戦

**Pattern**: PotOfGreedActionと同じ構造
- canActivate: Main Phase 1, deck.length >= 1
- createActivationSteps: 発動通知のみ
- createResolutionSteps: ドロー → LP/damageNegation更新 → 墓地送り

**New Requirements**:
- GameStateに`damageNegation: boolean`フィールドを追加

---

### Phase 2: Hand Management Effects (P2)

**Cards**: 打ち出の小槌、手札断札

**Pattern**: GracefulCharityAction（CardSelectionModal活用）
- canActivate: Main Phase 1, hand.length >= minCards
- createActivationSteps: 発動通知
- createResolutionSteps: カード選択 → デッキ戻し/捨てる → シャッフル/ドロー → 墓地送り

**New Requirements**:
- 打ち出の小槌: `minCards: 0`対応（0枚選択時は何もしない）
- 手札断札: `spellSpeed: 2`設定

---

### Phase 3: Graveyard Recovery Effects (P3)

**Cards**: 闇の量産工場、テラフォーミング

**Pattern**: CardSelectionModal + Zone操作
- canActivate: Main Phase 1, graveyard/deck内に対象カードが存在
- createActivationSteps: 発動通知
- createResolutionSteps: カード選択（墓地/デッキ） → 手札に加える → 墓地送り

**New Requirements**:
- CardSelectionConfigの`availableCards`に墓地/デッキを指定
- フィルタリング: `type === "Normal Monster"`, `type === "Spell" && frameType === "spell_field"`

---

## Risk Assessment

### Low Risk
- GameState拡張（`damageNegation`フィールド追加）: 既存コードへの影響なし
- Zone操作（墓地回収・デッキサーチ）: 既存`moveCard`関数で実現可能
- CardSelectionModal活用: 既存実装で対応可能

### Medium Risk
- 打ち出の小槌の0枚選択: エッジケースのテストが必要
- 速攻魔法（spellSpeed=2）: チェーンシステム未実装のため、将来の互換性検証が必要

### High Risk
- なし

---

## Conclusion

すべての要件は既存のChainableActionシステムで実装可能。GameStateへの`damageNegation`フィールド追加のみが新規変更。CardSelectionModal、Zone操作、shuffleArray関数など既存実装を最大限活用。Phase 1 → Phase 2 → Phase 3の順で段階的に実装することで、リスクを最小化。
