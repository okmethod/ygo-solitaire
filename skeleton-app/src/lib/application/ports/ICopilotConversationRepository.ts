/**
 * ICopilotConversationRepository - コパイロット会話履歴永続化 Port 定義
 *
 * @architecture レイヤー間依存ルール - アプリ層 (Port)
 * - ROLE: インフラ層が実装すべき抽象インターフェース（契約）の定義
 * - ALLOWED: アプリ層の型定義への依存
 * - FORBIDDEN: インフラ層への依存
 *
 * @module application/ports/ICopilotConversationRepository
 */

import type { ChatMessage } from "$lib/application/ports/ILLMChatRepository";

/** localStorage に保存する会話セッションのデータ構造 */
export interface CopilotConversationData {
  readonly systemPrompt: string;
  readonly history: ChatMessage[];
}

/** コパイロット会話履歴の永続化インターフェース */
export interface ICopilotConversationRepository {
  save(data: CopilotConversationData): void;
  load(): CopilotConversationData | null;
  clear(): void;
}
