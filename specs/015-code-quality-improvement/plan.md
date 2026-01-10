# Implementation Plan: コードベース品質改善

**Branch**: `015-code-quality-improvement` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-code-quality-improvement/spec.md`

## Summary

品質チェックレポートで発見された問題（アーキテクチャ境界違反、冗長な実装、テスト重複、コメント不足）を段階的に改善する。6 つの User Story（P1-P3）に分けて実装し、Clean Architecture 原則への準拠、コード行数削減（197→50 行）、テストケース削減（20-30 ケース）、コメント品質向上を達成する。

## Technical Context

**Language/Version**: TypeScript 5.0 (ES2022)
**Primary Dependencies**: Svelte 5 (Runes mode), SvelteKit 2, Immer.js, Vitest, Playwright, TailwindCSS
**Storage**: N/A（フロントエンドのみ、状態はメモリ内）
**Testing**: Vitest (unit/integration), Playwright (E2E)
**Target Platform**: Web ブラウザ（GitHub Pages デプロイ）
**Project Type**: Web application (frontend-only SPA)
**Performance Goals**: テスト実行時間 5-10%短縮、カード画像ロード時間改善
**Constraints**: Domain Layer カバレッジ 80%以上維持、既存機能のリグレッションゼロ
**Scale/Scope**: 197 行→50 行（TerraformingActivation）、750-760 テスト→730 以下、17 の改善要件

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Planning Principles

- **I. 目的と手段の分離**: ✅ PASS
  - 目的: コードベースの保守性・可読性・テスト効率の向上
  - 手段: アーキテクチャ修正、リファクタリング、テスト最適化、コメント改善
  - 明確に分離されている

- **II. 段階的な理解の深化**: ✅ PASS
  - 品質チェック → 仕様策定 → 実装計画 → タスク分割 の段階を経ている
  - 各段階で「何を改善すべきか」が明確化されている

### ✅ Architecture Principles

- **III. 最適解の選択と記録**: ✅ PASS
  - Singleton vs Factory Pattern の選択を明示（FR-006）
  - ChickenGameIgnitionEffect をスコープ外とした判断を記録（Registry 設計の制約）
  - すべてのスコープ判断に根拠がある

- **IV. 関心の分離（Separation of Concerns）**: ✅ PASS - **この spec の主目的**
  - **US1（P1）**: Presentation → Domain の不正な依存を修正
  - GameFacade パターンで Application Layer を経由する設計に修正
  - 依存方向: Presentation → Application → Domain を徹底

- **V. 変更に対応できる設計**: ✅ PASS
  - TerraformingActivation を基底クラス活用に修正（OCP 原則）
  - Repository パターンで DI 容易性を確保（DIP 原則）
  - テストの重複削減で変更容易性を向上

### ✅ Coding Principles

- **VI. 理解しやすさ最優先**: ✅ PASS - **この spec の主目的**
  - **US5（P3）**: コメント品質向上（日本語化、複雑箇所の説明追加）
  - **US1, US4**: 再発防止策として簡潔なルールコメント追加（FR-004, FR-011）
  - 自明な処理へのコメント追加は禁止（FR-015）

- **VII. シンプルに問題を解決する**: ✅ PASS
  - TerraformingActivation の冗長な実装を基底クラス活用に簡略化
  - テストの重複削除（YAGNI - 不要なテストを削除）
  - 過剰な抽象化を避け、必要な改善のみ実施

- **VIII. テスト可能性を意識する**: ✅ PASS
  - Domain Layer のカバレッジ 80%以上を維持（FR-010）
  - アーキテクチャ修正により、GameFacade を通じたテストが容易に
  - Repository 統一により、モック注入がより明確に

### ✅ Project-Specific Principles

- **IX. 技術スタック**: ✅ PASS
  - 既存の技術スタック（TypeScript, Svelte, Vitest, Playwright）を維持
  - 新規技術の導入なし（品質改善のみ）

### 結論

**すべての憲法原則に準拠。Constitution Check をパス。**

特に以下の原則を実現するための spec である:
- **原則 IV**: レイヤー間の依存方向を正しく保つ（US1 の主目的）
- **原則 VI**: コードの理解しやすさを向上させる（US5 の主目的）

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - すべての Constitution Check をパスしているため、違反の正当化は不要。

## Project Structure

### Documentation (this feature)

```text
specs/015-code-quality-improvement/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
└── checklists/
    └── requirements.md  # Specification quality checklist
```

**Note**: この feature は品質改善であり、新規機能ではないため、以下は不要:
- `research.md` - 技術調査不要（既存技術スタックで実施）
- `data-model.md` - データモデル変更なし
- `quickstart.md` - 新規機能なし
- `contracts/` - API 変更なし

### Source Code (repository root)

```text
skeleton-app/
├── src/
│   ├── lib/
│   │   ├── domain/                      # Domain Layer
│   │   │   ├── commands/                # GameCommand パターン
│   │   │   ├── effects/
│   │   │   │   ├── base/                # 基底クラス（US2 で活用）
│   │   │   │   │   └── spell/
│   │   │   │   │       └── NormalSpellAction.ts
│   │   │   │   ├── actions/             # 個別カード実装
│   │   │   │   │   └── spell/
│   │   │   │   │       └── TerraformingActivation.ts  # US2: 197→50行に削減
│   │   │   │   └── builders/
│   │   │   │       └── stepBuilders.ts  # US5: コメント追加対象
│   │   │   ├── models/
│   │   │   ├── registries/
│   │   │   └── rules/
│   │   │
│   │   ├── application/                 # Application Layer
│   │   │   ├── facade/
│   │   │   │   └── GameFacade.ts        # US1: 新メソッド追加、FR-004 コメント追加
│   │   │   ├── stores/
│   │   │   │   ├── cardDisplayStore.ts  # US3: Repository 統一、US6: Race Condition
│   │   │   │   └── effectResolutionStore.ts  # US6: get() → getStoreValue
│   │   │   ├── utils/
│   │   │   │   └── deckLoader.ts        # US3: Repository 統一、US5: コメント追加対象
│   │   │   └── ports/                   # Port/Adapter パターン
│   │   │
│   │   ├── infrastructure/              # Infrastructure Layer
│   │   │   └── adapters/
│   │   │       └── YGOProDeckCardRepository.ts  # US3: Singleton/Factory 化
│   │   │
│   │   └── presentation/                # Presentation Layer
│   │       └── components/
│   │           ├── organisms/
│   │           │   └── board/
│   │           │       ├── DuelField.svelte  # US1: Domain import 削除
│   │           │       └── Hands.svelte      # US1: Domain import 削除
│   │           └── modals/
│   │               └── CardSelectionModal.svelte  # US1: Infrastructure import 削除
│   │
│   └── routes/
│
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   ├── effects/
    │   │   │   └── base/
    │   │   │       └── spell/
    │   │   │           ├── BaseSpellAction.test.ts     # US4: FR-011 コメント追加
    │   │   │           ├── NormalSpellAction.test.ts   # US4: 重複テスト削除
    │   │   │           ├── QuickPlaySpellAction.test.ts  # US4: 重複テスト削除
    │   │   │           └── FieldSpellAction.test.ts    # US4: 重複テスト削除
    │   │   └── models/
    │   │       └── Card.test.ts         # US4: 25→8-10 ケースに削減
    │   │
    │   └── application/
    │       └── facade/
    │           └── GameFacade.test.ts   # US1: 新メソッドのテスト追加
    │
    ├── integration/
    │   └── card-effects/
    │       └── NormalSpells.test.ts     # US2: Terraforming テスト（既存）
    │
    └── e2e/
        └── *.spec.ts
```

**Structure Decision**: 既存の Clean Architecture（4 層）構造を維持。今回の改善は既存ファイルの修正が中心で、新規ファイル追加は最小限（GameFacade の新メソッド用テストのみ）。

## Implementation Phases

この spec は品質改善であり、新規機能開発ではないため、従来の Phase 0（研究）・Phase 1（設計）は不要。代わりに、User Story（US1-US6）を優先度順に実装する。

### Phase 0: N/A（研究不要）

品質改善のため、技術調査は不要。既存技術スタック（TypeScript, Svelte, Vitest）で実施。

### Phase 1: N/A（新規設計不要）

データモデル変更なし、API 変更なし。既存アーキテクチャの修正のみ。

### Phase 2: Implementation (タスク分割は /speckit.tasks で実施)

#### **User Story 1 - アーキテクチャ境界の修正と再発防止策（P1）**

**影響ファイル**:
- `skeleton-app/src/lib/application/facade/GameFacade.ts`（新メソッド追加）
- `skeleton-app/src/lib/presentation/components/organisms/board/DuelField.svelte`（Domain import 削除）
- `skeleton-app/src/lib/presentation/components/organisms/board/Hands.svelte`（Domain import 削除）
- `skeleton-app/src/lib/presentation/components/modals/CardSelectionModal.svelte`（Infrastructure import 削除）
- `skeleton-app/tests/unit/application/facade/GameFacade.test.ts`（新メソッドのテスト追加）

**主要タスク**:
1. GameFacade に以下のメソッドを追加（FR-001）
   - canActivateSetSpell(instanceId: string): boolean
   - canActivateIgnitionEffect(instanceId: string): boolean
   - canSummonMonster(instanceId: string): boolean
   - canSetMonster(instanceId: string): boolean
   - canSetSpellTrap(instanceId: string): boolean
2. DuelField.svelte と Hands.svelte から Domain import 削除、GameFacade 経由に修正（FR-002）
3. CardSelectionModal.svelte から Infrastructure import 削除、Application Layer 経由に修正（FR-003）
4. GameFacade.ts、各層の index.ts に依存方向ルールコメント追加（FR-004）
5. GameFacade の新メソッドの Unit テスト追加
6. 全テスト実行、動作確認

**成功基準**:
- SC-001: Presentation → Domain の直接 import がゼロ
- SC-002: Presentation → Infrastructure の直接 import がゼロ
- 全テストパス

#### **User Story 2 - 冗長コードのリファクタリング（TerraformingActivation のみ）（P2）**

**影響ファイル**:
- `skeleton-app/src/lib/domain/effects/actions/spell/TerraformingActivation.ts`（197 行→50 行）
- `skeleton-app/tests/integration/card-effects/NormalSpells.test.ts`（既存テスト確認）

**主要タスク**:
1. TerraformingActivation.ts を NormalSpellAction 継承形式に書き直し（FR-005）
2. canActivate() を基底クラスのものを活用
3. createActivationSteps() を stepBuilders 活用
4. createResolutionSteps() を stepBuilders 活用
5. 既存テスト全てパス確認
6. 統合テストで Terraforming の動作確認

**成功基準**:
- SC-003: TerraformingActivation.ts が 50 行以下
- 全テストパス

#### **User Story 3 - Repository 管理の最適化（P2）**

**影響ファイル**:
- `skeleton-app/src/lib/infrastructure/adapters/YGOProDeckCardRepository.ts`（Singleton/Factory 化）
- `skeleton-app/src/lib/application/stores/cardDisplayStore.ts`（Repository 共有）
- `skeleton-app/src/lib/application/utils/deckLoader.ts`（Repository 共有）

**主要タスク**:
1. YGOProDeckCardRepository に Singleton Pattern または Factory Pattern 導入（FR-006）
2. cardDisplayStore.ts と deckLoader.ts で同一インスタンス共有（FR-007）
3. キャッシュ動作確認（同一カード ID への複数アクセスで API 呼び出し削減）
4. 全テスト実行

**成功基準**:
- SC-008: カード画像ロード時間改善
- 全テストパス

#### **User Story 4 - テストの重複削減と再発防止策（P3）**

**影響ファイル**:
- `skeleton-app/tests/unit/domain/effects/base/spell/BaseSpellAction.test.ts`（FR-011 コメント追加）
- `skeleton-app/tests/unit/domain/effects/base/spell/NormalSpellAction.test.ts`（重複削除）
- `skeleton-app/tests/unit/domain/effects/base/spell/QuickPlaySpellAction.test.ts`（重複削除）
- `skeleton-app/tests/unit/domain/effects/base/spell/FieldSpellAction.test.ts`（重複削除）
- `skeleton-app/tests/unit/domain/models/Card.test.ts`（25→8-10 ケース）

**主要タスク**:
1. 各 Subclass から共通フェーズチェックテストを削除、BaseSpellAction.test.ts に集約（FR-008）
2. Card.test.ts の型ガード関数テストを 25→8-10 に削減（FR-009）
3. BaseSpellAction.test.ts 冒頭にテスト戦略コメント追加（FR-011）
4. カバレッジレポート確認（FR-010）
5. 全テスト実行

**成功基準**:
- SC-004: テストケース総数 730 以下（20-30 削減）
- SC-005: Domain Layer カバレッジ 80%以上維持
- SC-006: テスト実行時間 5-10%短縮

#### **User Story 5 - コメント品質の向上（厳選された改善）（P3）**

**影響ファイル**:
- `skeleton-app/src/lib/application/utils/deckLoader.ts`（日本語コメント追加）
- `skeleton-app/src/lib/domain/effects/builders/stepBuilders.ts`（日本語コメント追加）
- `skeleton-app/src/lib/domain/models/GameState.ts`（TODO 整理）
- その他、英文コメント→日本語化対象ファイル

**主要タスク**:
1. deckLoader.ts と stepBuilders.ts の複雑なロジックに日本語コメント追加（FR-012）
2. 既存英文コメント（docstring 除く）を日本語に書き換え（FR-013）
3. GameState.ts の TODO コメント整理（FR-014）
4. 自明な処理へのコメント追加なし確認（FR-015）
5. コードレビュー、理解しやすさ確認

**成功基準**:
- SC-007: deckLoader.ts、stepBuilders.ts に日本語コメント追加済み
- 既存英文説明コメント→日本語化済み
- ファイルサイズ必要以上に増加なし

#### **User Story 6 - Application Layer の細かな改善（P3）**

**影響ファイル**:
- `skeleton-app/src/lib/application/stores/effectResolutionStore.ts`（get() 削除）
- `skeleton-app/src/lib/application/stores/cardDisplayStore.ts`（isCancelled 追加）

**主要タスク**:
1. effectResolutionStore.ts の独自 get() を Svelte の getStoreValue に置き換え（FR-016）
2. cardDisplayStore.ts の handCards、graveyardCards、banishedCards に isCancelled フラグ追加（FR-017）
3. 統合テスト実行、Race Condition 発生しないこと確認
4. 全テスト実行

**成功基準**:
- SC-009: 全改善実施後、既存機能が正常動作（リグレッションなし）

## Gate Evaluation

### Pre-Implementation Gate

✅ **PASS** - すべての Constitution Check に合格

- アーキテクチャ原則への準拠が主目的の spec
- 段階的改善（P1→P2→P3）で安全に実施
- 各段階で全テスト実行によるリグレッション防止

### Post-Phase 1 Gate (N/A)

この spec は既存コード改善のため、Phase 1（設計フェーズ）は不要。

### Implementation Ready

✅ **READY** - タスク分割（/speckit.tasks）へ進む準備完了

## Dependencies

- 既存のテストスイートが全てパスしている状態（✅ 確認済み）
- 品質チェックレポートの内容（✅ spec.md に反映済み）
- 既存アーキテクチャドキュメント（✅ docs/architecture/overview.md 等）
- Clean Architecture 原則と PSCT 設計への理解（✅ 憲法準拠）
- Svelte 5 Runes とストア管理の知識（✅ 既存技術スタック）

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| アーキテクチャ修正時の呼び出し箇所更新漏れ | High | 全テスト実行、TypeScript 型チェック、手動動作確認 |
| リファクタリング時の微妙な動作の違い | Medium | 統合テストで動作確認、既存テスト全パス確認 |
| Repository 統一時のテストモック不整合 | Low | テスト戦略確認、必要に応じてモック修正 |
| テスト削減時の重要エッジケース喪失 | Medium | カバレッジレポート確認、削除前にテスト内容精査 |
| 他開発者との変更コンフリクト | Low | 小さな単位でコミット、頻繁なマージ、PR ベース開発 |

## Next Steps

1. **`/speckit.tasks`** を実行して tasks.md を生成
2. tasks.md に基づいて US1（P1）から順次実装
3. 各 US 完了時に全テスト実行、リグレッション確認
4. 全 US 完了後、最終動作確認・lint・format 実行
5. PR 作成、レビュー、main へマージ
