# Research Document: Zone Architecture Expansion

**Feature**: 014-zone-expansion
**Date**: 2026-01-03
**Purpose**: Technical research for implementing Yu-Gi-Oh! OCG zone architecture and card placement commands

## Research Topics

### 1. Zone Architecture Pattern

**Decision**: 既存のZonesインターフェースを拡張し、readonly配列で各ゾーンを管理

**Rationale**:
- 既存コードベースでは`Zones`インターフェースがreadonly配列でゾーンを管理している
- Immer.jsを使用しているため、不変性は`produce()`内で保証される
- TypeScriptの構造的型付けにより、既存コードとの互換性を維持しやすい

**Alternatives Considered**:
1. **Map<ZoneType, CardInstance[]>**: より柔軟だが、型安全性が低下
2. **個別のクラス**: 過剰な抽象化でYAGNI原則に反する
3. **現在のアプローチ（選択）**: シンプルで既存パターンと一貫性

**Implementation Pattern**:
```typescript
export interface Zones {
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly mainMonsterZone: readonly CardInstance[];  // NEW
  readonly spellTrapZone: readonly CardInstance[];    // RENAMED from field
  readonly fieldZone: readonly CardInstance[];        // NEW
  readonly graveyard: readonly CardInstance[];
  readonly banished: readonly CardInstance[];
}
```

### 2. Command Pattern for Card Placement

**Decision**: 既存のGameCommandインターフェースを実装し、各配置操作を独立したCommandクラスとして実装

**Rationale**:
- 既存の`ActivateSpellCommand`、`DrawCardCommand`と同じパターンで統一性を保つ
- canExecute/executeの2段階チェックにより、実行前検証が明確
- Command Patternによりundo/redo、ロギング、テストが容易

**Alternatives Considered**:
1. **直接GameState操作**: テストが困難、責務が分散
2. **Service層**: 既存アーキテクチャに存在しない層を追加することになり一貫性を損なう
3. **Command Pattern（選択）**: 既存パターンと一貫性、拡張性が高い

**Implementation Pattern**:
```typescript
export class SummonMonsterCommand implements GameCommand {
  constructor(private readonly cardInstanceId: string) {}

  canExecute(state: GameState): boolean {
    // 召喚権チェック、フェーズチェック、ゾーン空きチェック
  }

  execute(state: GameState): CommandResult {
    // カード移動、召喚権消費、placedThisTurn設定
  }
}
```

### 3. Turn-based State Management

**Decision**: GameStateに`normalSummonLimit`、`normalSummonUsed`を追加し、デュアルカウンター方式で召喚権を管理

**Rationale**:
- 「召喚可能回数（limit）」と「使用した回数（used）」を分離することで、「このターンに召喚したか」の情報も取得可能
- カード効果による召喚回数増加（Double Summonなど）に対応可能
- `used < limit`の単純な比較でチェック可能

**Alternatives Considered**:
1. **boolean normalSummonAvailable**: 拡張性がない（2回以上の召喚に対応不可）
2. **残り回数のみ**: 「このターンに召喚したか」の情報が失われる
3. **デュアルカウンター（選択）**: 拡張性と情報保持を両立

**Card Placement Tracking**:

**Decision**: CardInstanceに`placedThisTurn: boolean`フィールドを追加

**Rationale**:
- セットされた速攻魔法・罠カードは同ターンに発動不可というOCGルールを実装
- カード自身が状態を持つため、ゾーン間移動時も情報が保持される
- 既存の`position: "faceUp" | "faceDown"`と同様のカード状態管理パターン

**Alternatives Considered**:
1. **GameState.cardsSetThisTurn: Set<instanceId>**: GameStateとCardInstanceで情報が分散
2. **CardInstance.placedThisTurn（選択）**: `position`と一貫性、カード単位で完結

### 4. Field Spell Replacement Logic

**Decision**: `SetSpellTrapCommand`および`ActivateSpellCommand`内で、fieldZoneに既存カードがある場合は自動的に墓地送りを実行

**Rationale**:
- OCGルール: フィールド魔法は既存カードがあっても発動/セット可能で、古いカードは自動的に墓地へ
- コマンド内で完結させることで、呼び出し側は詳細を意識不要
- 既存の`sendToGraveyard()`ヘルパー関数を再利用

**Alternatives Considered**:
1. **呼び出し側で事前チェック**: 責務が分散、エラーが発生しやすい
2. **コマンド内で自動処理（選択）**: カプセル化、使いやすさ

**Implementation Pattern**:
```typescript
// SetSpellTrapCommand内
if (isFieldSpell && zones.fieldZone.length > 0) {
  const existingCard = zones.fieldZone[0];
  zones = sendToGraveyard(zones, existingCard.instanceId);
}
zones = moveCard(zones, cardInstanceId, "hand", "fieldZone", "faceDown");
```

### 5. Zone Helper Functions Migration

**Decision**: 既存のZone操作ヘルパー関数（moveCard、drawCards、sendToGraveyard等）を新しいZonesインターフェースに対応させる

**Rationale**:
- `moveCard()`はゾーン名を文字列で受け取るため、新ゾーンへの対応は自動的
- 既存の`sendToGraveyard()`は`field`と`hand`から検索しているため、`mainMonsterZone`と`spellTrapZone`も検索対象に追加
- 段階的な移行が可能（既存テストが壊れない）

**Migration Strategy**:
1. `sendToGraveyard()`を拡張: `[...zones.mainMonsterZone, ...zones.spellTrapZone, ...zones.hand]`から検索
2. 既存の`field`参照を`spellTrapZone`に置換
3. 新ゾーンへの`moveCard()`呼び出しを追加

### 6. UI Layout Strategy

**Decision**: 既存の7列グリッドレイアウトを維持し、CSSクラスで3ゾーンを視覚的に区別

**Rationale**:
- 既存のDuelField.svelteは7列グリッド（5枚のカード + 2列のマージン）を使用
- mainMonsterZone（5枠）とspellTrapZone（5枠）は同じレイアウトパターン
- fieldZone（1枠）は独立した位置に配置

**Alternatives Considered**:
1. **完全レイアウト再構築**: リスクが高く、スコープ外
2. **既存グリッド活用（選択）**: 変更最小、リスク低

**CSS Strategy**:
- `.main-monster-zone`クラスでボーダー色やラベルを区別
- `.spell-trap-zone`クラスで視覚的に分離
- `.field-zone`は独立したposition

## Best Practices

### TypeScript Best Practices for Card Games
- **型安全なゾーン管理**: `keyof Zones`で型安全なゾーン指定
- **discriminated unions**: CardTypeで`type`フィールドを使用した型判別
- **readonly修飾子**: 不変性をコンパイル時に保証

### Immer.js Patterns
- すべてのGameState更新は`produce()`内で実行
- `return produce(state, draft => { ... })`パターンの徹底
- readonly配列の操作は通常の配列操作として記述（Immerが自動変換）

### Testing Strategy
- **単体テスト**: 各Commandのcanの制約を網羅的にテスト
- **統合テスト**: コマンド連鎖（召喚→セット→発動）のフロー
- **E2Eテスト**: UI操作からゾーン表示までの完全フロー

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Zone Structure | Interface with readonly arrays | 既存パターンと一貫性、型安全性 |
| Command Pattern | GameCommand implementation | 既存アーキテクチャと統一、拡張性 |
| Summon Rights | Dual counter (limit + used) | 拡張性（Double Summon対応）、情報保持 |
| Placement Tracking | CardInstance.placedThisTurn | positionフィールドと一貫性 |
| Field Spell Logic | Auto-replacement in command | カプセル化、OCGルール準拠 |
| UI Layout | CSS-based zone distinction | 変更最小、リスク低 |

## Constraints & Assumptions

### Constraints
- 既存439テストがすべてパスすること
- Immer.js不変性保証を維持
- Domain LayerはUI非依存
- Svelte 5 Runesモード使用

### Assumptions
- モンスターカードには`type: "monster"`が定義済み
- 魔法カードには`subtype: "Field" | "Normal" | "Quick-Play" | "Continuous"`が定義済み
- 先行1ターンのみのシミュレーターのため、ターンリセット処理は将来実装
- 裏側表示カードの情報は非表示（UI実装は別タスク）

## References

- [遊戯王OCG公式ルール](https://www.yugioh-card.com/japan/howto/)
- [既存コードベース]: `skeleton-app/src/lib/domain/`
- [Immer.js Documentation](https://immerjs.github.io/immer/)
- [Clean Architecture in TypeScript](https://github.com/okmethod/okmethod/blob/main/docs/architecting-guide/README.md)
