# アーキテクチャ構成

コンセプト: UI とゲームロジックを完全に分離し、変更に強くテストしやすい構成にする。

1. 全体構造 (Clean Architecture風)

src/
  ├── domain/         # ゲームのコアルール・ロジック (UI/Frameworkに依存しない)
  │   ├── models/     # Card, GameState などの型定義
  │   ├── rules/      # 基本ルール (Summon, Draw, Chain)
  │   └── cards/      # 各カードの効果実装 (Exodia, PotOfGreed...)
  ├── application/    # ユースケース・インタラクション
  │   ├── GameFacade.ts # UIから呼ばれる窓口
  │   └── Store.ts    # Svelte Store (状態管理)
  ├── presentation/   # UI (Svelte Components)
  │   ├── components/ # CardView, HandView, BoardView
  │   └── pages/      # TitlePage, GamePage
  └── infrastructure/ # 外部データ等の扱い
      └── CardRepository.ts # カードデータのJSONロード


2. モジュール分割と責任

Domain Layer (核心)

責任: 「遊戯王のルール」そのものを表現する。

依存: 何にも依存しない（Pure TypeScript）。

重要: ここには Svelte や DOM のコードを一切書かない。これにより、ロジック単体でのテストが可能になる。

Application Layer (接着剤)

責任: ユーザーの操作（「カードをクリックした」）をドメインの言葉（「発動アクション」）に変換し、エンジンの処理結果を Store に反映させる。

State Management: ゲームの状態（GameState）は Svelte の writable store で保持し、UI はそれを購読（subscribe）する。

Presentation Layer (見た目)

責任: Store の状態を画面に描画し、ユーザー入力を受け取る。

技術: Svelte + Tailwind CSS。

ロジック: 「カードが光るアニメーション」などの表示ロジックのみを持ち、「攻撃力が計算される」などのゲームロジックは持たない。

3. データフロー (Unidirectional)

User Action: ユーザーがカードをクリック。

Dispatch: UI が GameFacade.playCard(cardId) を呼ぶ。

Validate & Execute: ドメイン層がルール判定し、状態を更新して新しい GameState を返す。

State Update: Store が新しい GameState で上書きされる。

Re-render: Svelte が変更を検知し、画面を再描画する。

# 品質特性の実現

コンセプト: 複雑なルール処理の正確性を担保し、カード追加に耐えうる拡張性を持つ。

1. テスト容易性 (Testability)

カードゲームのロジックはバグの温床になりやすいため、自動テストを重視する。

ロジックの分離による単体テスト

UI から分離された Domain Layer に対して、Jest / Vitest 等でテストを書く。

テストケース例:

「強欲な壺を発動すると、手札が2枚増え、強欲な壺は墓地に行くこと」

「手札が0枚のとき、コストとして手札を捨てるカードは発動できないこと」

これにより、ブラウザを起動して手動で操作しなくても、ルールの正しさを保証できる。

2. 拡張性・保守性 (Maintainability)

カードの種類が増えても、既存コードが壊れないようにする。

Open-Closed Principle (OCP) の適用

新しいカード（例: 「サンダー・ボルト」）を追加する際、GameEngine 本体を修正するのではなく、新しい ThunderBoltCard クラスを追加して登録する方式にする。

各カードの効果ロジックは、共通インターフェース CardEffect を実装する形にする。

カードデータとロジックの分離

カードの基本ステータス（ID, 名前, テキスト）は JSON で管理。

カードの動的な振る舞い（効果処理）は TypeScript のコードで管理。

両者を ID で紐付ける CardRegistry パターンを採用する。

3. パフォーマンス (Performance)

不変オブジェクトによる更新検知

GameState の更新は、オブジェクトの一部を書き換えるのではなく、変更があった部分をコピーして新しいオブジェクトを作る（Immutability）。

Svelte は参照の変更を検知して再描画するため、これにより無駄なレンダリングを防ぎ、レスポンスを維持する。

# 採用するデザインパターン

コンセプト: カードゲーム特有の動的な振る舞いを、実績あるパターンで解決する。

1. Command Pattern (コマンドパターン)

プレイヤーの行動をオブジェクトとしてカプセル化する。

適用箇所: プレイヤーの操作（カードプレイ、フェイズ移行など）。

構造:

interface GameCommand {
  execute(state: GameState): GameState;
}
class ActivateSpellCommand implements GameCommand { ... }
class SummonMonsterCommand implements GameCommand { ... }


メリット:

行動履歴（ログ）の保存が容易になる。

将来的に「待った（Undo）」機能を実装したくなった場合に対応しやすい。

2. Strategy Pattern (ストラテジーパターン)

カードごとの異なる効果処理を交換可能にする。

適用箇所: 各カードの効果ロジック。

構造:

interface CardBehavior {
  canActivate(state: GameState, card: Card): boolean;
  onActivate(state: GameState, card: Card): GameState;
}
class PotOfGreedBehavior implements CardBehavior { ... }
class DarkHoleBehavior implements CardBehavior { ... }


メリット: GameEngine に巨大な switch 文を作らずに済む。カード個別のロジックを独立したファイルに隔離できる。

3. Observer Pattern (オブザーバーパターン)

状態の変化を UI に通知する。

適用箇所: GameState と UI の同期。

実装: Svelte の store (writable, derived) がこのパターンの役割を果たす。

メリット: 状態管理と表示ロジックの結合度を下げる。

4. Factory Pattern (ファクトリーパターン)

カードデータからカードインスタンスを生成する。

適用箇所: ゲーム開始時のデッキ生成。

メリット: カード ID から、ステータス情報と効果ロジック（Strategy）を組み合わせた CardInstance を生成する手順を集約できる。