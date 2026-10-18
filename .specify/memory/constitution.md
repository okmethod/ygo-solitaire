<!--
Sync Impact Report:
Version: 2.0.1 → 3.0.0 (MAJOR - 役割の再定義)
変更の要点:
  - constitution を「原則の本体」から「spec-kit 専用のポインタ文書」へ転換。
  - 原則・規約・設計の本体は in-repo の SSOT（CLAUDE.md / .claude/rules/ / docs/）に一本化し、本ファイルからの重複記述を全廃。Constitution Check は各 SSOT を指す短いチェックリストに縮約。
  - 実態整合: ADR 推奨を撤去（ADR は廃止済み → git log/コミットで記録）、コミット規約を Conventional Commits から gitmoji へ、ワークフロー節をクラウド/spec-kit 作業に限定。
Removed Sections（本体は各 SSOT が保持）:
  - Planning/Architecture/Coding Principles 本文 → Constitution Check のチェック項目＋リンクへ縮約
  - Project-Specific Principles / 技術スタック → CLAUDE.md
  - Testing Strategy 本文 → docs/design/testing-strategy.md
Templates Status:
  - ✅ plan-template.md: Constitution Check 節はリンク先 SSOT を参照して判定する運用に変更（テンプレ自体の改修は不要）
Follow-up TODOs:
  - なし
-->

# Yu-Gi-Oh! ソリティア プロジェクト憲法（spec-kit 専用）

## この文書の位置づけ

本ファイルは **spec-kit の Constitution Check ゲート専用**の文書である。
原則・規約・設計の**本体は持たない**。それらは in-repo の SSOT に一本化され、ここは**そこを指すだけ**。

- 散文の設計書（docs/）は「Why を対象の隣にインライン」方針のため独立原則ページを持たない。
- 一方、本ファイルは**機械（plan ゲート）が消費する成果物**なので、例外的に「原則の索引」として独立して存在する。

### 情報の正本（SSOT）

| 関心事                                                     | 正本                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| 行動原則・プロジェクト概要・ディレクトリ・開発ワークフロー | [CLAUDE.md](../../CLAUDE.md)                                             |
| 言語/FW コーディング規約                                   | [.claude/rules/](../../.claude/rules/)                                   |
| アーキテクチャ・設計判断（inline Why）                     | [docs/design/](../../docs/design/)                                       |
| ゲームルール・ユビキタス言語                               | [docs/game-rules/](../../docs/game-rules/)                               |
| テスト戦略                                                 | [docs/design/testing-strategy.md](../../docs/design/testing-strategy.md) |

---

## 大原則

**本質的に必要なものを深く考え、ベターな最適解を選び抜き、理解しやすいコードを書く**

---

## Constitution Check

plan は Phase 0 research の前と Phase 1 design の後に、以下を満たすことを確認する。
各項目の根拠・詳細はリンク先の SSOT を参照（ここでは再説明しない）。

### 要件（何を作るか）

- [ ] 目的（Why）が明確で、手段（How）と分離されている
- [ ] スコープ（先行 1 ターン・固定デッキ）を逸脱していない → [CLAUDE.md](../../CLAUDE.md) / [docs/game-rules/](../../docs/game-rules/)
- [ ] 概念は game-rules のユビキタス言語（正式名称）に従う → [docs/game-rules/](../../docs/game-rules/)

### 設計

- [ ] 4 層のレイヤー境界・依存方向（内向き）を守る → [docs/design/architecture.md](../../docs/design/architecture.md)
- [ ] 既存語彙で書けるものはコード追加せず DSL(YAML) で表現する → [docs/design/dsl.md](../../docs/design/dsl.md)
- [ ] 過剰な抽象化・早すぎる最適化を避け、理解しやすさを優先する → [.claude/rules/coding-guide.md](../../.claude/rules/coding-guide.md)

### 実装・品質

- [ ] 言語/FW 規約に準拠する → [.claude/rules/](../../.claude/rules/)
- [ ] UI なしでビジネスロジックをテスト可能にする → [docs/design/testing-strategy.md](../../docs/design/testing-strategy.md)
- [ ] コミット前に lint/format/test が通る → [CLAUDE.md](../../CLAUDE.md)

### ワークフロー（本節はクラウド/spec-kit 作業を統治する）

- [ ] ブランチを切り、PR を成果物として進める（spec-kit 作業はクラウド前提）
- [ ] コミットメッセージは gitmoji 規約（例: `:up:` `:gear:` `:memo:`）

> 違反は原則禁止。やむを得ず逸脱する場合は plan の Complexity Tracking に根拠と「却下した代替案」を記録する。

---

## Governance（spec-kit ガバナンス）

### 改定

- **MAJOR**: 本文書の役割・構造の再定義（例: 今回の 3.0.0）
- **MINOR**: チェック項目の追加、または SSOT 構成の変更
- **PATCH**: 文言の明確化、リンク修正

改定時は Sync Impact Report を更新し、plan-template の Constitution Check 運用との整合を確認する。

### 設計判断の記録

ADR 管理は廃止済み（[docs/adr/README.md](../../docs/adr/README.md) 参照）。
根拠は **git log／コミットメッセージ／PR 説明**、および設計判断の **inline Why**（docs/design）に残す。

### 原則の上流ライブラリ（参考）

抽象原則の素材は著者個人のクロスプロジェクト・ライブラリに由来する（user-level スキル / 下記）。
これらは**本リポジトリのランタイム SSOT ではない**。PJ 開始時に上記 in-repo SSOT へ流し込む供給源として扱う。

- [Planning Principles](https://github.com/okmethod/okmethod/blob/main/docs/development-domains/planning-principles/README.md)
- [Architecting Principles](https://github.com/okmethod/okmethod/blob/main/docs/development-domains/architecting-principles/README.md)
- [Coding Principles](https://github.com/okmethod/okmethod/blob/main/docs/development-domains/coding-principles/README.md)

**Version**: 3.0.0 | **Ratified**: 2025-01-23 | **Last Amended**: 2026-10-18
