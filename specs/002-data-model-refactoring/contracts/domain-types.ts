/**
 * Domain Layer型定義のTypeScriptコントラクト
 *
 * このファイルは、Phase 1設計段階で定義されたDomain Layer型のコントラクトです。
 * 実装時にこのファイルを参照し、型定義の整合性を保証してください。
 *
 * @see specs/002-data-model-refactoring/data-model.md
 * @see specs/002-data-model-refactoring/spec.md
 */

// ============================================================================
// Domain Layer: 最小限のカードデータ
// ============================================================================

/**
 * Domain Layer用カードデータ（最小限の情報のみ）
 *
 * ゲームロジックに必要なプロパティのみを含む。
 * 表示用データ（カード名、画像、テキスト等）は含まない。
 *
 * **設計原則**:
 * - Clean Architecture: Domain Layerは外部API（YGOPRODeck）に依存しない
 * - テスタビリティ: ネットワーク接続なしでユニットテスト可能
 * - YGOPRODeck API互換: カードIDは`number`型（例: 33396948）
 *
 * **使用箇所**:
 * - `skeleton-app/src/lib/domain/models/Card.ts`
 * - `skeleton-app/src/lib/domain/models/GameState.ts`
 * - `skeleton-app/src/lib/domain/rules/` (各種ゲームルール)
 *
 * @property {number} id - YGOPRODeck API互換のカードID（例: 33396948 = Exodia the Forbidden One）
 * @property {CardType} type - カードの基本タイプ（"monster" | "spell" | "trap"）
 * @property {string} [frameType] - モンスターのフレームタイプ（オプショナル：モンスターカードのみ）
 *
 * @example
 * // Exodia the Forbidden Oneのドメインデータ
 * const exodia: DomainCardData = {
 *   id: 33396948,
 *   type: "monster",
 *   frameType: "normal"
 * };
 *
 * @example
 * // 通常魔法カード（Pot of Greed）
 * const potOfGreed: DomainCardData = {
 *   id: 55144522,
 *   type: "spell"
 *   // frameTypeはモンスターカードのみなので省略
 * };
 *
 * @see FR-001: Domain LayerのカードデータはカードID（YGOPRODeck互換の数値）とカードタイプのみを保持
 * @see FR-002: Domain LayerのCardData型は、カード名・説明文・画像URL等の表示用データを含まない
 * @see FR-004: カードIDの型は `number` 型でなければならず、YGOPRODeck APIのID形式と完全互換
 */
export interface DomainCardData {
  /**
   * YGOPRODeck API互換のカードID
   *
   * **型**: number（YGOPRODeck API互換）
   * **例**: 33396948 (Exodia the Forbidden One), 55144522 (Pot of Greed)
   * **必須**: ✅ 必須
   *
   * @see FR-004: カードIDの型は `number` 型
   */
  id: number;

  /**
   * カードの基本タイプ（ゲームロジックで使用）
   *
   * **型**: "monster" | "spell" | "trap"
   * **用途**: フィールド配置判定、効果発動条件
   * **必須**: ✅ 必須
   *
   * @example
   * if (card.type === "monster") {
   *   // モンスターゾーンに配置可能
   * }
   */
  type: CardType;

  /**
   * モンスターのフレームタイプ（オプショナル）
   *
   * **型**: string (例: "normal", "fusion", "synchro", "xyz", "link")
   * **用途**: 融合/シンクロ/エクシーズ判定
   * **必須**: ⚠️ モンスターカードのみ（オプショナル）
   *
   * **注意**: 魔法・罠カードでは `undefined`
   *
   * @example
   * if (card.frameType === "fusion") {
   *   // 融合モンスター専用処理
   * }
   */
  frameType?: string;
}

/**
 * カードの基本タイプ（Domain Layer用）
 *
 * **設計原則**:
 * - ゲームロジックで使用される3つの基本タイプのみ
 * - YGOPRODeck APIのtype文字列から変換（normalizeType関数使用）
 *
 * **使用箇所**:
 * - `DomainCardData.type` プロパティ
 * - `CardDisplayData.type` プロパティ（Presentation Layerと共通）
 *
 * @see data-model.md#レイヤー間のデータフロー
 */
export type CardType = "monster" | "spell" | "trap";

// ============================================================================
// Domain Layer: 変換関数のコントラクト
// ============================================================================

/**
 * RecipeCardEntryからDomainCardDataに変換する関数のシグネチャ
 *
 * **実装場所**: `skeleton-app/src/lib/domain/models/Card.ts`
 *
 * **責務**:
 * - デッキレシピのエントリをDomain Layer用データに変換
 * - カードタイプの推論（必要に応じて）
 * - 後方互換性の維持（FR-005）
 *
 * @param {RecipeCardEntry} entry - デッキレシピのカードエントリ
 * @returns {DomainCardData} Domain Layer用カードデータ
 *
 * @example
 * const recipeEntry: RecipeCardEntry = {
 *   id: 33396948,
 *   quantity: 1,
 *   effectClass: "ExodiaEffect"
 * };
 *
 * const domainCard = createDomainCardData(recipeEntry);
 * // => { id: 33396948, type: "monster", frameType: "normal" }
 *
 * @see FR-005: 既存のデッキレシピ（`RecipeCardEntry`）のカードIDは変更してはならない
 */
export function createDomainCardData(entry: RecipeCardEntry): DomainCardData;

/**
 * カードIDからカードタイプを推論する関数のシグネチャ
 *
 * **実装場所**: `skeleton-app/src/lib/domain/models/Card.ts`
 *
 * **責務**:
 * - カードIDから基本タイプを推論（テーブル参照またはAPI問い合わせ）
 * - フォールバック処理（不明な場合のデフォルト値）
 *
 * **注意**: この関数は移行期間中の一時的な実装です。
 * 最終的には、すべてのカードタイプがデッキレシピに明示的に記載されるべきです。
 *
 * @param {number} id - YGOPRODeck API互換のカードID
 * @returns {CardType} 推論されたカードタイプ
 *
 * @example
 * const type = inferCardTypeFromId(33396948);
 * // => "monster"
 */
export function inferCardTypeFromId(id: number): CardType;

// ============================================================================
// Presentation Layer: 表示用カードデータ（参考）
// ============================================================================

/**
 * Presentation Layer用カードデータ（UI表示用）
 *
 * **注意**: このコントラクトはDomain Layerの実装では使用しません。
 * Presentation Layerの型定義として参照のみ。
 *
 * **実装場所**: `skeleton-app/src/lib/types/card.ts`
 *
 * @see data-model.md#presentation-layer型定義
 */
export interface CardDisplayData {
  id: number;
  name: string;
  type: CardType;
  description?: string;
  images?: CardImages;
  monsterAttributes?: MonsterAttributes;
  isSelected?: boolean;
}

/**
 * カード画像URL群
 */
export interface CardImages {
  imageCropped?: string;
  image?: string;
  imageSmall?: string;
}

/**
 * モンスター属性（モンスターカードのみ）
 */
export interface MonsterAttributes {
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
  frameType?: string;
}

// ============================================================================
// デッキレシピ型（既存型の参照）
// ============================================================================

/**
 * デッキレシピのカードエントリ
 *
 * **実装場所**: `skeleton-app/src/lib/types/deck.ts`
 *
 * **後方互換性**: FR-005により、この型の構造は変更してはならない
 *
 * @see FR-005: 既存のデッキレシピ（`RecipeCardEntry`）のカードIDは変更してはならない
 */
export interface RecipeCardEntry {
  id: number;
  quantity: number;
  effectClass?: string;
}

// ============================================================================
// テスト用のモックデータ例
// ============================================================================

/**
 * テスト用モックデータ: Exodia the Forbidden One
 *
 * **使用例**:
 * - Unit tests (`skeleton-app/tests/unit/domain/`)
 * - Integration tests
 */
export const MOCK_EXODIA: DomainCardData = {
  id: 33396948,
  type: "monster",
  frameType: "normal",
};

/**
 * テスト用モックデータ: Pot of Greed（強欲な壺）
 */
export const MOCK_POT_OF_GREED: DomainCardData = {
  id: 55144522,
  type: "spell",
};

/**
 * テスト用モックデータ: Graceful Charity（天使の施し）
 */
export const MOCK_GRACEFUL_CHARITY: DomainCardData = {
  id: 79571449,
  type: "spell",
};

/**
 * テスト用モックデータ: Mirror Force（聖なるバリア -ミラーフォース-）
 */
export const MOCK_MIRROR_FORCE: DomainCardData = {
  id: 44095762,
  type: "trap",
};

/**
 * テスト用モックデータ: Blue-Eyes White Dragon（青眼の白龍）
 */
export const MOCK_BLUE_EYES: DomainCardData = {
  id: 89631139,
  type: "monster",
  frameType: "normal",
};

// ============================================================================
// 型ガード（Type Guards）
// ============================================================================

/**
 * カードがモンスターカードかどうかを判定する型ガード
 *
 * **使用例**:
 * ```typescript
 * if (isMonsterCard(card)) {
 *   // card.frameType にアクセス可能
 *   console.log(card.frameType);
 * }
 * ```
 *
 * @param {DomainCardData} card - 判定対象のカード
 * @returns {boolean} モンスターカードの場合はtrue
 */
export function isMonsterCard(card: DomainCardData): boolean {
  return card.type === "monster";
}

/**
 * カードが魔法カードかどうかを判定する型ガード
 *
 * @param {DomainCardData} card - 判定対象のカード
 * @returns {boolean} 魔法カードの場合はtrue
 */
export function isSpellCard(card: DomainCardData): boolean {
  return card.type === "spell";
}

/**
 * カードが罠カードかどうかを判定する型ガード
 *
 * @param {DomainCardData} card - 判定対象のカード
 * @returns {boolean} 罠カードの場合はtrue
 */
export function isTrapCard(card: DomainCardData): boolean {
  return card.type === "trap";
}

// ============================================================================
// バリデーション関数のコントラクト
// ============================================================================

/**
 * DomainCardDataの妥当性を検証する関数のシグネチャ
 *
 * **実装場所**: `skeleton-app/src/lib/domain/models/Card.ts`
 *
 * **検証内容**:
 * - カードIDが正の整数であること
 * - カードタイプが "monster" | "spell" | "trap" のいずれかであること
 * - モンスターカード以外で frameType が設定されていないこと
 *
 * @param {DomainCardData} card - 検証対象のカードデータ
 * @returns {boolean} 妥当な場合はtrue
 * @throws {Error} 妥当性違反の場合はエラーをスロー
 *
 * @example
 * const card: DomainCardData = { id: 33396948, type: "monster" };
 * validateDomainCardData(card); // OK
 *
 * const invalidCard: DomainCardData = { id: -1, type: "monster" };
 * validateDomainCardData(invalidCard); // throws Error
 */
export function validateDomainCardData(card: DomainCardData): boolean;

// ============================================================================
// 実装時の注意事項
// ============================================================================

/**
 * ## 実装時のチェックリスト
 *
 * ### Domain Layer実装 (`skeleton-app/src/lib/domain/models/Card.ts`)
 *
 * - [ ] `DomainCardData` インターフェースを定義
 * - [ ] `CardType` 型を定義
 * - [ ] `createDomainCardData()` 関数を実装
 * - [ ] `inferCardTypeFromId()` 関数を実装（一時的）
 * - [ ] `validateDomainCardData()` 関数を実装
 * - [ ] `isMonsterCard()`, `isSpellCard()`, `isTrapCard()` 型ガードを実装
 *
 * ### テスト実装 (`skeleton-app/tests/unit/domain/models/Card.test.ts`)
 *
 * - [ ] `DomainCardData` の型検証テスト
 * - [ ] `createDomainCardData()` のユニットテスト
 * - [ ] `validateDomainCardData()` のエラーケーステスト
 * - [ ] 型ガード関数のテスト
 *
 * ### 移行作業 (既存コードの段階的移行)
 *
 * - [ ] 既存の `CardData` 型に `@deprecated` マーカーを追加
 * - [ ] Domain Layerファイルを `DomainCardData` に移行
 * - [ ] すべてのユニットテストがパスすることを確認
 * - [ ] TypeScriptコンパイルエラーがゼロであることを確認
 *
 * ### ドキュメント
 *
 * - [ ] JSDocコメントを充実させる
 * - [ ] `data-model.md` との整合性を確認
 * - [ ] `spec.md` の要件（FR-001, FR-002, FR-004）を満たすことを確認
 */

// ============================================================================
// 参考資料
// ============================================================================

/**
 * ## 参考資料
 *
 * - **Feature Specification**: `specs/002-data-model-refactoring/spec.md`
 * - **Data Model Design**: `specs/002-data-model-refactoring/data-model.md`
 * - **Research Document**: `specs/002-data-model-refactoring/research.md`
 * - **Implementation Plan**: `specs/002-data-model-refactoring/plan.md`
 * - **Project Constitution**: `.specify/memory/constitution.md`
 *
 * ## YGOPRODeck API
 *
 * - **API Endpoint**: https://db.ygoprodeck.com/api/v7/cardinfo.php
 * - **API Documentation**: https://ygoprodeck.com/api-guide/
 * - **Example Request**: https://db.ygoprodeck.com/api/v7/cardinfo.php?id=33396948
 *
 * ## 関連するADR
 *
 * - **ADR-0002**: Immer.jsによる不変性保証
 * - **ADR-0003**: Command Patternによる効果システム実装
 * - **ADR-00XX**: データモデル分離戦略（このfeature完了後に作成予定）
 */
