# Feature Specification: アーキテクチャリファクタリング - ゲームロジックとUIの完全分離

**Feature Branch**: `001-architecture-refactoring`
**Created**: 2025-01-23
**Status**: Draft
**Input**: User description: "アーキテクチャリファクタリング：ゲームロジックとUIの完全分離

## 背景
現在の実装ではビジネスロジックとUIが密結合している問題がある。
Geminiで生成した設計素案（docs/01-requirement.md, docs/02-architecture.md）に基づき、Clean Architectureの原則に沿ったリファクタリングを行いたい。

## 目的
- ゲームロジック（domain層）をフレームワーク非依存にする
- UIなしでビジネスロジックを完全にテスト可能にする
- カード追加時に既存コードを修正せずに済む拡張性を実現

## 参考資料
- docs/01-requirement.md: 要件定義（課題・コンセプト・スコープ・ドメインモデル）
- docs/02-architecture.md: アーキテクチャ設計（Clean Architecture風の層構造、デザインパターン）
- .specify/memory/constitution.md: プロジェクト憲法（原則IV: 関心の分離）

## 主要な変更内容
1. domain/層の作成：Card、GameState、ルール処理を完全に独立
2. application/層の作成：GameFacadeでUIとドメインを接続
3. presentation/層の整理：Svelteコンポーネントはプレゼンテーションのみ
4. デザインパターンの適用：Command、Strategy、Observer、Factory

## 成功基準
- DuelStateクラスがSvelteに依存していない
- domain/配下のコードがVitestで単体テスト可能
- 新しいカード追加時に既存コードを修正不要"

## User Scenarios & Testing

### User Story 1 - ドメインロジックの独立テスト (Priority: P1)

開発者として、UIコンポーネントを起動せずにゲームロジックをテストできる。

**Why this priority**: これはリファクタリングの最も根本的な価値。ゲームルールの正確性を保証し、UI開発と並行してロジックを検証できる。

**Independent Test**: 任意のカード効果（例：強欲な壺）をテストコードから直接実行し、GameStateの変化（手札+2枚、墓地+1枚）を検証できる。ブラウザやSvelteコンポーネントは一切不要。

**Acceptance Scenarios**:

1. **Given** domain層の既存カード効果クラス, **When** テストコードから効果を実行, **Then** GameStateが正しく更新され、すべてのルール処理が純粋TypeScriptで完結する
2. **Given** Svelte非依存のGameStateとルールエンジン, **When** Vitestで単体テストを実行, **Then** ブラウザ起動なしでテストが完了する
3. **Given** リファクタリング完了後のdomain/配下, **When** import文を確認, **Then** Svelte関連のimportが一切存在しない

---

### User Story 2 - 新規カード効果の拡張性 (Priority: P2)

開発者として、新しいカード効果を追加する際に、既存のコアロジックを修正せずに済む。

**Why this priority**: 長期的な保守性の鍵。カードプールが増えても、コアロジックが壊れないことが拡張の前提条件。

**Independent Test**: 新しいカード効果クラス（例：ThunderBolt）を作成し、CardRegistryに登録するだけで、システムが自動的に認識・実行できる。

**Acceptance Scenarios**:

1. **Given** Strategy Patternに基づくCardBehaviorインターフェース, **When** 新しいカード効果クラスを実装, **Then** 既存のコアロジック（GameFacade、Rules）のswitch文や条件分岐を修正せずに動作する
2. **Given** Factory Patternに基づくCardRegistry, **When** 新しいカードIDと効果クラスを登録, **Then** ゲーム中に自動的にインスタンス化される
3. **Given** 既存の全カード効果, **When** 新しいカードを追加, **Then** 既存カードのテストが全て成功したまま維持される

---

### User Story 3 - UIとロジックの疎結合化 (Priority: P3)

開発者として、UIレイヤー（Svelteコンポーネント）の変更がゲームロジックに影響を与えない状態を保つ。

**Why this priority**: UIフレームワークの変更や、デザインシステムの刷新に対応できる柔軟性を確保。

**Independent Test**: Svelteコンポーネントを別のUIライブラリ（例：React）に置き換えた場合でも、domain/とapplication/は変更不要。

**Acceptance Scenarios**:

1. **Given** application/GameFacadeクラス, **When** UIからの操作を受け取る, **Then** ドメインの言葉（Command）に変換し、UIの実装詳細に依存しない
2. **Given** presentation/のSvelteコンポーネント, **When** ゲーム状態を表示, **Then** GameStateをsubscribeして描画するのみで、ルール処理を含まない
3. **Given** Observer Patternに基づくStore, **When** GameStateが更新, **Then** UIが自動的に再描画され、双方向の依存が存在しない

---

### Edge Cases

- domain層のコードが誤ってSvelteをimportした場合、TypeScriptコンパイルエラーが発生するか？
- 既存のDuelStateクラスをリファクタリングする際、一時的にUIが壊れた状態でも、ゲームロジックのテストは成功するか？
- GameStateの不変性（Immutability）が守られていない場合、どのように検出するか？

## Requirements

### Functional Requirements

- **FR-001**: domain/配下のすべてのコードは、フレームワーク固有のライブラリ（Svelte、DOM API等）に依存してはならない
- **FR-002**: domain/配下のすべてのクラス・関数は、Vitestで単体テスト可能でなければならない
- **FR-003**: 新しいカード効果を追加する際、CardBehaviorインターフェースを実装し、CardRegistryに登録するだけで動作すること
- **FR-004**: GameStateの更新は、既存オブジェクトの変更ではなく、新しいオブジェクトの生成（Immutability）で行うこと
- **FR-005**: application/GameFacadeは、UIからの操作をCommandパターンでドメインロジックに橋渡しすること
- **FR-006**: presentation/のSvelteコンポーネントは、GameStateをsubscribeして表示するのみで、ルール処理を実装してはならない
- **FR-007**: 既存のDuelStateクラスの機能は、リファクタリング後もすべて保持されること（機能の削減はNG）

### Key Entities

- **GameState**: ゲームの現在状態を表す不変オブジェクト。zones（deck, hand, field, graveyard, banishment）、LP、phase、chainStackを含む
- **Card / CardInstance**: カードの静的情報（ID, name, type）とゲーム中のインスタンス（位置、状態）
- **CardBehavior**: カード効果の抽象インターフェース。`canActivate()`, `onActivate()`メソッドを定義
- **GameCommand**: プレイヤーの操作をオブジェクト化したもの。`execute(state: GameState): GameState`メソッドを実装
- **GameFacade**: UIとドメインの境界。UIからの操作を受け取り、Commandを実行し、Storeを更新

### Assumptions

- TypeScript Strictモードを使用しており、型安全性が保証されている
- 既存のテストインフラ（Vitest）が整っており、新しいテストを追加可能
- 段階的リファクタリングが可能で、一度にすべてを書き換える必要はない
- 既存の`skeleton-app/src/lib/classes/`配下のコードが、リファクタリング対象

## Success Criteria

### Measurable Outcomes

- **SC-001**: domain/配下のすべてのファイルで、Svelteへのimportが0件であること（静的解析で検証可能）
- **SC-002**: domain/配下のコードに対する単体テストカバレッジが80%以上であること
- **SC-003**: 新しいカード効果（例：サンダー・ボルト）を追加する際、既存のコアロジック（domain/rules/, application/GameFacade.ts）のコード変更行数が0行であること
- **SC-004**: 既存のすべてのカード効果が、リファクタリング後も同じ挙動を保つこと（回帰テストで検証）
- **SC-005**: GameStateの更新がすべてImmutableパターンで行われること（参照の変更を検知するテストで検証）
