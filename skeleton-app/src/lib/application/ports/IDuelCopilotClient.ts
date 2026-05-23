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
import type { ChatMessage } from "$lib/application/ports/ILLMChatRepository";

/** デュエルコパイロットクライアントの抽象インターフェース */
export interface IDuelCopilotClient {
  /**
   * 現在のゲーム状態を元に次の行動ヒントをストリーミングで取得する。
   * 呼び出し時に会話履歴をリセットし、新たな会話コンテキストを開始する。
   *
   * @param onChunk - テキストチャンクを受け取るコールバック
   */
  requestHint(deckData: DeckData, snapshot: GameSnapshot, onChunk: (text: string) => void): Promise<void>;

  /**
   * 会話履歴を維持したままフォローアップメッセージを送信する。
   * requestHint を呼び出す前に使用した場合は何もしない。
   *
   * @param onChunk - テキストチャンクを受け取るコールバック
   */
  sendMessage(message: string, onChunk: (text: string) => void): Promise<void>;

  /** 現在の会話履歴を返す */
  getHistory(): ChatMessage[];

  /**
   * localStorage から会話履歴を復元する。
   * 保存データがない場合は何もしない。
   */
  restoreHistory(): void;

  /** 会話履歴をリセットし、localStorage からも削除する */
  clearHistory(): void;
}
