/**
 * ICardDataRepository - Port/Adapter パターンの Port (抽象/契約定義)
 *
 * @remarks
 * - テスト時にモック実装を注入可能
 * - 将来的に別のカードAPI（ローカルストレージ、FastAPI等）への切り替えが容易
 * - 外部APIの実装詳細から完全に分離
 *
 * @architecture レイヤー間依存ルール - Application Layer (Port)
 * - ROLE: Infrastructure Layer が実装すべき抽象インターフェース（契約）の定義
 * - ALLOWED: Application Layer 内の DTO 定義への依存
 * - FORBIDDEN: Infrastructure Layer への依存
 *
 * @module application/ports/ICardDataRepository
 */

// ============================================================================
// Application層が必要とする外部カードデータの型定義
// ============================================================================

/** 外部APIから取得するカード画像情報 */
export interface ExternalCardImages {
  image: string;
  imageSmall: string;
  imageCropped: string;
}

/**
 * 外部カードデータ (External Card Data)
 *
 * Application層が外部APIから必要とするカード情報。
 * Infrastructure層で外部API固有の形式から変換されて提供される。
 */
export interface ExternalCardData {
  // 基本情報（全カード共通）
  id: number;
  name: string; // 英語名
  type: string; // "Spell Card", "Effect Monster", "Trap Card" など
  frameType: string; // "spell", "effect", "trap", "normal" など
  desc: string; // カード効果テキスト

  // オプション（カードによって有無が異なる）
  archetype?: string;

  // モンスター専用
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string; // "LIGHT", "DARK" など
  race?: string; // モンスター種族名

  // 画像情報
  images: ExternalCardImages | null;
}

// ============================================================================
// Repository インターフェース
// ============================================================================

/** カード情報取得の抽象インターフェース */
export interface ICardDataRepository {
  /** カードIDリストから複数のカードデータを取得 */
  getCardsByIds(fetchFunction: typeof fetch, cardIds: number[]): Promise<ExternalCardData[]>;

  /** 単一のカードデータを取得 */
  getCardById(fetchFunction: typeof fetch, cardId: number): Promise<ExternalCardData>;
}
