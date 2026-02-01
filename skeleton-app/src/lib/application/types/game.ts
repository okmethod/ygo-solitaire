/**
 * game - ゲーム状態の DTO (Data Transfer Object)
 *
 * @architecture レイヤー間依存ルール - Application Layer (DTO)
 * - ROLE: Application Layer や Presentation Layer が消費するデータ形式の定義
 * - ALLOWED: Domain Layer のモデルへの依存
 * - FORBIDDEN: Infrastructure Layer への依存、Presentation Layer への依存
 *
 * @module application/types/game
 */

/** Domain 型の再エクスポート */
export type { GameState } from "$lib/domain/models/GameState";
export type { CardSelectionConfig } from "$lib/domain/models/AtomicStep";
