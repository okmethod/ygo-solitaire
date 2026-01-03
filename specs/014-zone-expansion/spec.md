# Feature Specification: Zone Architecture Expansion and Card Placement Commands

**Feature Branch**: `014-zone-expansion`
**Created**: 2026-01-03
**Status**: Draft
**Input**: User description: "フィールドゾーン拡張とモンスター・魔法カードの配置機能の追加: mainMonsterZone（メインモンスターゾーン）、spellTrapZone（魔法・罠ゾーン、fieldからリネーム）、fieldZone（フィールドゾーン）の3つのゾーンに分離。モンスターカードの「召喚」「セット」、魔法・罠カードの「セット」コマンドを追加。"

## User Scenarios & Testing

### User Story 1 - Field Zone Separation (Priority: P1)

ユーザーがゲームフィールドを見たとき、メインモンスターゾーン（5枚）、魔法・罠ゾーン（5枚）、フィールドゾーン（1枚）が明確に分離して表示される。現在の`field`ゾーンは`spellTrapZone`にリネームされ、新たに`mainMonsterZone`と`fieldZone`が追加される。フィールド魔法カード（Chicken Game等）は`fieldZone`に配置される。

**Why this priority**: P1である理由は、この変更がゲームのゾーンアーキテクチャの基盤となり、今後のモンスターカード実装の前提条件となるため。また、現在フィールド魔法が`field`ゾーンに配置されている不正確な実装を修正し、正しいゾーン構造を実現する。

**Independent Test**: ゲーム初期化時に3つのゾーン（mainMonsterZone, spellTrapZone, fieldZone）が空の状態で存在すること、フィールド魔法を発動すると`fieldZone`に配置されること、既存の魔法カード（永続魔法、通常魔法）は`spellTrapZone`に配置されることを検証する。

**Acceptance Scenarios**:

1. **Given** ゲームが初期化された状態、**When** GameStateを確認する、**Then** zones.mainMonsterZone、zones.spellTrapZone、zones.fieldZoneがすべて空配列として存在する
2. **Given** 手札にChicken Game（フィールド魔法）、**When** Chicken Gameを発動する、**Then** Chicken Gameがzones.fieldZoneに配置され、zones.spellTrapZoneには配置されない
3. **Given** 手札にUpstart Goblin（通常魔法）、**When** Upstart Goblinを発動する、**Then** 一旦zones.spellTrapZoneに配置され、効果解決後にzones.graveyardに送られる
4. **Given** 手札にToon World（永続魔法）、**When** Toon Worldを発動する、**Then** Toon Worldがzones.spellTrapZoneに配置され、効果解決後もzones.spellTrapZoneに残る（zones.fieldZoneには配置されない）

---

### User Story 2 - Monster Summoning (Priority: P2)

ユーザーが手札のモンスターカードを選択し、「召喚」コマンドを実行することで、モンスターを`mainMonsterZone`に表側攻撃表示で配置できる。召喚には1ターンに1回の制限（召喚権）があり、既に召喚済みの場合は実行できない。

**Why this priority**: P2である理由は、モンスターカードのプレイ方法として最も基本的な操作であり、P1のゾーン分離が完了した後に実装すべき機能であるため。召喚権の管理はゲームルールの中核となる。

**Independent Test**: 手札にモンスターカードがある状態でSummonMonsterCommandを実行し、モンスターがmainMonsterZoneに表側攻撃表示で配置されること、召喚権が消費されること、同じターンに2回目の召喚ができないことを検証する。

**Acceptance Scenarios**:

1. **Given** 手札にモンスターカード1枚、Main1フェーズ、召喚権あり、**When** 召喚コマンドを実行する、**Then** モンスターがmainMonsterZoneに表側攻撃表示（position: "faceUp", battlePosition: "attack"）で配置され、召喚権が消費される
2. **Given** 手札にモンスターカード2枚、Main1フェーズ、召喚権あり、**When** 1枚目を召喚後に2枚目を召喚しようとする、**Then** 召喚権がないため実行できない
3. **Given** 手札にモンスターカード1枚、Standbyフェーズ、召喚権あり、**When** 召喚しようとする、**Then** Main1フェーズではないため実行できない
4. **Given** mainMonsterZoneが5枚で満杯、手札にモンスターカード、召喚権あり、**When** 召喚しようとする、**Then** ゾーンが満杯のため実行できない

---

### User Story 3 - Monster and Spell/Trap Setting (Priority: P2)

ユーザーが手札のモンスターカードまたは魔法・罠カードを選択し、「セット」コマンドを実行することで、カードを裏側表示で配置できる。モンスターのセットは召喚権を消費し、`mainMonsterZone`に裏側守備表示で配置される。魔法・罠のセットは召喚権を消費せず、`spellTrapZone`に裏側表示で配置される。

**Why this priority**: P2である理由は、召喚と同等に基本的な操作だが、裏側表示の実装が必要であり、召喚の実装後に追加すべき機能であるため。また、先行1ターンキルシミュレーターでは使用頻度が低いが、ゲームルールの完全性のために必要。

**Independent Test**: 手札のモンスターカードをセットしてmainMonsterZoneに裏側守備表示で配置されること、召喚権が消費されること、手札の魔法・罠カードをセットしてspellTrapZoneに裏側表示で配置されること、召喚権が消費されないことを検証する。

**Acceptance Scenarios**:

1. **Given** 手札にモンスターカード1枚、Main1フェーズ、召喚権あり、**When** モンスターをセットする、**Then** モンスターがmainMonsterZoneに裏側守備表示（position: "faceDown", battlePosition: "defense"）で配置され、召喚権が消費される
2. **Given** 手札に通常魔法・速攻魔法・永続魔法カード1枚、Main1フェーズ、**When** 魔法カードをセットする、**Then** 魔法カードがspellTrapZoneに裏側表示（position: "faceDown"）で配置され、召喚権は消費されない
3. **Given** 手札にフィールド魔法カード1枚、Main1フェーズ、**When** フィールド魔法をセットする、**Then** フィールド魔法がfieldZoneに裏側表示（position: "faceDown"）で配置され、召喚権は消費されない。既存のフィールド魔法がある場合は墓地に送られる
4. **Given** 手札に罠カード1枚、Main1フェーズ、**When** 罠カードをセットする、**Then** 罠カードがspellTrapZoneに裏側表示（position: "faceDown"）で配置され、召喚権は消費されない
5. **Given** spellTrapZoneが5枚で満杯、手札に魔法カード、**When** セットしようとする、**Then** ゾーンが満杯のため実行できない

---

### User Story 4 - UI Updates for Zone Display (Priority: P3)

ユーザーがDuelFieldコンポーネントで、3つのゾーン（mainMonsterZone、spellTrapZone、fieldZone）が視覚的に区別されて表示される。現在の7列グリッドレイアウトを維持しながら、mainMonsterZoneとspellTrapZoneの表示を更新し、fieldZoneを独立したゾーンとして表示する。

**Why this priority**: P3である理由は、ドメインロジックとテストが完了した後にUIを更新すべきであり、ユーザー体験の向上は重要だが実装の最終段階で行うため。

**Independent Test**: DuelField.svelteを表示し、3つのゾーンが正しく表示されること、各ゾーンにカードが配置された際に適切な位置に表示されることを目視で確認する。

**Acceptance Scenarios**:

1. **Given** ゲーム画面を表示、**When** DuelFieldを確認する、**Then** mainMonsterZone（5枠）、spellTrapZone（5枠）、fieldZone（1枠）が視覚的に区別されて表示される
2. **Given** fieldZoneにChicken Gameが配置、**When** DuelFieldを確認する、**Then** fieldZoneの位置にChicken Gameが表示される
3. **Given** mainMonsterZoneにモンスター2枚が裏側守備表示で配置、**When** DuelFieldを確認する、**Then** モンスターゾーンに裏側カード画像が2枚表示される

---

### Edge Cases

- mainMonsterZoneまたはspellTrapZoneが5枚で満杯の場合、新たにカードを配置しようとするとエラーになる
- spellTrapZoneが満杯の場合、フィールド魔法以外の魔法カード（通常魔法・速攻魔法・永続魔法・装備魔法・儀式魔法など）の発動またはセットも不可となる（発動・セット時に一旦spellTrapZoneに配置されるため）
- fieldZoneに既にフィールド魔法がある場合、新たにフィールド魔法を発動またはセットすると既存のフィールド魔法が自動的に墓地に送られ、新しいフィールド魔法がfieldZoneに配置される
- モンスターのセット後に召喚権がない状態でも、魔法・罠のセットは可能である（召喚権を消費しないため）
- 裏側表示のカードの情報（カード名、効果等）は、ユーザーには非表示とする
- 速攻魔法・罠カードは、セットしたターンには発動できない（CardInstance.placedThisTurnで管理）。通常魔法・永続魔法・フィールド魔法はセットしたターンでも発動可能
- ターンが変わった際に召喚権とCardInstance.placedThisTurnがリセットされる（先行1ターンキルでは1ターンのみなので、現時点ではAdvancePhaseCommandでの実装は不要だが、将来的にリセット処理を追加する）

## Requirements

### Functional Requirements

- **FR-001**: システムは、Zonesインターフェースを拡張し、`mainMonsterZone`、`spellTrapZone`、`fieldZone`の3つのゾーンを追加しなければならない
- **FR-002**: 既存の`field`ゾーンは削除され、`spellTrapZone`に置き換えられなければならない
- **FR-003**: GameStateは、新しいZonesインターフェースを使用するように更新されなければならない
- **FR-004**: GameStateは、召喚権を管理する2つのフィールドを持たなければならない
  - `normalSummonLimit: number` - そのターンの通常召喚可能回数（初期値1、カード効果で増減可能）
  - `normalSummonUsed: number` - そのターンに使用した通常召喚回数（初期値0、召喚・セットで1増加）
  - 召喚・セット可能条件: `normalSummonUsed < normalSummonLimit`
- **FR-005**: CardInstanceインターフェースは、以下のフィールドを追加しなければならない
  - `battlePosition?: "attack" | "defense"` - モンスターカードのバトルポジション
  - `placedThisTurn: boolean` - このターンにフィールドに配置されたかどうか（速攻魔法・罠カードの発動制限、モンスターの表示形式変更制限等に使用、初期値false）
  - SummonMonsterCommand/SetMonsterCommand/SetSpellTrapCommand実行時にtrueに設定
  - ターン終了時にfalseにリセット（先行1ターンキルでは1ターンのみなので、リセット処理は将来実装）
- **FR-006**: システムは、SummonMonsterCommandを実装しなければならない。手札のモンスターカードを`mainMonsterZone`に表側攻撃表示で配置し、召喚権を消費する
- **FR-007**: SummonMonsterCommandの実行条件は、Main1フェーズ、normalSummonUsed < normalSummonLimit、mainMonsterZoneが満杯でないこと。実行時にnormalSummonUsedを1増加させ、召喚されたカードのplacedThisTurnをtrueに設定する
- **FR-008**: システムは、SetMonsterCommandを実装しなければならない。手札のモンスターカードを`mainMonsterZone`に裏側守備表示で配置し、召喚権を消費する
- **FR-009**: SetMonsterCommandの実行条件は、SummonMonsterCommandと同じ（Main1フェーズ、normalSummonUsed < normalSummonLimit、mainMonsterZoneが満杯でないこと）。実行時にnormalSummonUsedを1増加させ、セットされたカードのplacedThisTurnをtrueに設定する
- **FR-010**: システムは、SetSpellTrapCommandを実装しなければならない。手札の魔法・罠カードを裏側表示で配置する。フィールド魔法は`fieldZone`に、それ以外の魔法・罠カードは`spellTrapZone`に配置する。召喚権は消費しない
- **FR-011**: SetSpellTrapCommandの実行条件は、Main1フェーズ、配置先ゾーン（spellTrapZoneまたはfieldZone）が満杯でないこと。フィールド魔法の場合、既存のフィールド魔法があれば自動的に墓地に送られる。実行時にセットしたカードのplacedThisTurnをtrueに設定する
- **FR-012**: ActivateSpellCommandは、フィールド魔法カード（subtype === "Field"）を`fieldZone`に配置し、フィールド魔法以外の魔法カードは`spellTrapZone`に配置するように更新されなければならない（通常魔法・速攻魔法は効果解決後に墓地に送られる）
- **FR-012-2**: 裏側表示でセットされているカードを発動する場合、速攻魔法カード（subtype === "Quick-Play"）で`placedThisTurn`が`true`の場合は発動不可とする。通常魔法・永続魔法・フィールド魔法はセットしたターンでも発動可能
- **FR-013**: fieldZoneに既にフィールド魔法がある場合、新たにフィールド魔法を発動またはセットすると、既存のフィールド魔法を自動的に墓地に送ってから新しいフィールド魔法をfieldZoneに配置しなければならない。spellTrapZoneが5枚で満杯の場合、フィールド魔法以外の魔法カードの発動またはセットは不可となる
- **FR-014**: すべてのZone操作ヘルパー関数（moveCard、drawCards、sendToGraveyard等）は、新しいZonesインターフェースに対応するように更新されなければならない
- **FR-015**: GameFacadeは、新しいコマンド（summonMonster、setMonster、setSpellTrap）を公開しなければならない
- **FR-016**: DuelField.svelteは、mainMonsterZone、spellTrapZone、fieldZoneを視覚的に区別して表示するように更新されなければならない
- **FR-017**: Hands.svelteは、モンスターカード選択時に「召喚」「セット」ボタンを、魔法・罠カード選択時に「発動」「セット」ボタンを表示するように更新されなければならない
- **FR-018**: 既存のすべてのテストがパスすること（リグレッションなし）
- **FR-019**: 新規実装には、単体テストと統合テストが含まれなければならない

### Key Entities

- **Zones (Updated)**: mainMonsterZone、spellTrapZone、fieldZoneを含む新しいゾーン構造
- **GameState (Extended)**: normalSummonLimit（そのターンの通常召喚可能回数、初期値1）、normalSummonUsed（そのターンに使用した通常召喚回数、初期値0）フィールドを追加
- **CardInstance (Extended)**: battlePosition（モンスターカードのバトルポジション）、placedThisTurn（このターンにフィールドに配置されたかどうか、速攻魔法・罠カードの発動制限・モンスターの表示形式変更制限等に使用）フィールドを追加
- **SummonMonsterCommand**: モンスター召喚コマンド
- **SetMonsterCommand**: モンスターセットコマンド
- **SetSpellTrapCommand**: 魔法・罠セットコマンド（フィールド魔法はfieldZoneに、それ以外はspellTrapZoneにセット）
- **ActivateSpellCommand (Updated)**: フィールド魔法をfieldZoneに配置するように更新

## Success Criteria

### Measurable Outcomes

- **SC-001**: GameStateのZonesインターフェースが3つのゾーン（mainMonsterZone、spellTrapZone、fieldZone）を持ち、既存のfieldゾーンが削除されている
- **SC-002**: ユーザーが手札のモンスターカードを召喚し、mainMonsterZoneに表側攻撃表示で配置できる
- **SC-003**: ユーザーが手札のモンスターカードをセットし、mainMonsterZoneに裏側守備表示で配置できる
- **SC-004**: ユーザーが手札の魔法・罠カードをセットし、通常魔法・速攻魔法・永続魔法・罠カードはspellTrapZoneに、フィールド魔法はfieldZoneに裏側表示で配置できる
- **SC-005**: フィールド魔法カード（Chicken Game）を発動すると、fieldZoneに配置される
- **SC-006**: 召喚権の管理が正しく機能し、1ターンに1回のみ召喚またはセットできる
- **SC-007**: DuelFieldコンポーネントで3つのゾーンが視覚的に区別されて表示される
- **SC-008**: すべての既存テスト（439テスト）がパスする
- **SC-009**: 新規実装により追加されたテストがすべてパスする
- **SC-010**: Lint/Formatチェックがすべてパスする

## Scope

### In Scope

- Zonesインターフェースの拡張（mainMonsterZone、spellTrapZone、fieldZone追加、field削除）
- GameStateの拡張（normalSummonLimit、normalSummonUsedフィールド追加）
- CardInstanceの拡張（battlePosition、placedThisTurnフィールド追加）
- SummonMonsterCommand実装
- SetMonsterCommand実装
- SetSpellTrapCommand実装
- ActivateSpellCommand更新（フィールド魔法をfieldZoneに配置）
- Zone操作ヘルパー関数の更新
- GameFacade API拡張
- DuelField.svelte UI更新
- Hands.svelte UI更新
- 単体テスト・統合テスト作成
- 既存テストの修正（Zonesインターフェース変更に伴う）

### Out of Scope

- モンスターカードの実際のカードデータ追加（カードプールへの追加は別feature）
- 罠カードの実装（罠カードの発動タイミング、チェーン処理は別feature）
- モンスターの攻撃・守備力の実装（戦闘フェーズは先行1ターンキルでは不要）
- エクストラモンスターゾーンの実装（融合・シンクロ・エクシーズ・リンク召喚は別feature）
- ペンデュラムゾーンの実装（ペンデュラム召喚は別feature）
- リバースモンスター効果の実装（裏側表示カードの反転処理は別feature）

## Assumptions

- モンスターカードのCardDataにはすでに`type: "monster"`が定義されており、カード種別の判定が可能である
- normalSummonLimitの初期値は1、normalSummonUsedの初期値は0、CardInstance.placedThisTurnの初期値はfalseで、ターン終了時にすべてリセットされる（先行1ターンキルでは1ターンのみなので、リセット処理は将来実装）
- 将来的に「Double Summon」などのカード効果でnormalSummonLimitを増やすことが可能（現時点では未実装）
- normalSummonUsedを別途管理することで、「このターンに通常召喚したか」という情報が必要なカード効果の実装が可能になる
- CardInstance.placedThisTurnを管理することで、速攻魔法・罠カードの「セットしたターンには発動できない」制約やモンスターの「召喚・セットしたターンに表示形式変更できない」制約を実装できる（`position === "faceDown"`と同様のカード状態管理）
- fieldZoneは常に1枚のみで、新しいフィールド魔法を発動すると既存のフィールド魔法が自動的に墓地に送られる
- 裏側表示のカードは、UIで裏側カード画像（card-back）として表示される
- モンスターカードのbattlePositionは、召喚時は"attack"、セット時は"defense"で固定（表示形式変更は別feature）
- 既存の魔法カード（Chicken Game、Upstart Goblin、Pot of Greed等）は、新しいZonesインターフェースに対応するように更新される
- ActivateSpellCommandは、カードのsubtypeを確認してフィールド魔法とそれ以外を判定する（`subtype === "Field"`でフィールド魔法を識別）
- フィールド魔法の発動またはセット時、fieldZoneに既存カードがある場合は自動的に墓地に送られる処理が実装される

## Dependencies

- 既存のGameStateモデル
- 既存のZonesインターフェース
- 既存のCardInstanceインターフェース
- 既存のGameCommandインターフェース
- 既存のGameFacade
- 既存のDuelField.svelte、Hands.svelteコンポーネント
- 既存のActivateSpellCommand
- 既存のZone操作ヘルパー関数（moveCard、drawCards等）
- 既存のテストスイート（439テスト）
