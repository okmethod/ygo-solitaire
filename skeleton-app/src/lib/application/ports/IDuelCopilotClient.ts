/**
 * IDuelCopilotClient - Port/Adapter パターンの Port (抽象/契約定義)
 *
 * @architecture レイヤー間依存ルール - アプリ層 (Port)
 * - ROLE: インフラ層が実装すべき抽象インターフェース（契約）の定義
 * - ALLOWED: アプリ層の DTO / ドメイン型への依存
 * - FORBIDDEN: インフラ層への依存
 *
 * @module application/ports/IDuelCopilotClient
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import type { DeckData } from "$lib/application/types/deck";

/** デュエルコパイロットクライアントの抽象インターフェース */
export interface IDuelCopilotClient {
  /**
   * 現在のゲーム状態を元に次の行動ヒントをストリーミングで取得する
   *
   * @param onChunk - テキストチャンクを受け取るコールバック
   */
  requestHint(deckData: DeckData, snapshot: GameSnapshot, onChunk: (text: string) => void): Promise<void>;
}
