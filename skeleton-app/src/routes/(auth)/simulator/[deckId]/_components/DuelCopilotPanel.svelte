<script lang="ts">
  import { onMount } from "svelte";
  import type { IDuelCopilotClient } from "$lib/application/ports/IDuelCopilotClient";
  import type { GameSnapshot } from "$lib/domain/models/GameState";
  import type { DeckData } from "$lib/application/types/deck";
  import ChatWindow from "$lib/presentation/components/molecules/ChatWindow.svelte";

  interface Props {
    client: IDuelCopilotClient;
    deckData: DeckData;
    snapshot: GameSnapshot;
  }
  let { client, deckData, snapshot }: Props = $props();

  type ConversationMessage = { role: "user" | "assistant"; content: string };

  let isStreaming = $state(false);
  let streamingText = $state("");
  let chatHistory = $state<ConversationMessage[]>([]);
  let errorMessage = $state("");

  onMount(() => {
    // history[0] = 初回の大きなプロンプト（非表示）、history[1]以降 = 表示対象
    const history = client.getHistory();
    if (history.length < 2) return;

    const entries: ConversationMessage[] = [{ role: "assistant", content: history[1]?.content ?? "" }];
    for (let i = 2; i < history.length; i++) {
      const msg = history[i];
      if (!msg) continue;
      entries.push({ role: msg.role === "model" ? "assistant" : "user", content: msg.content });
    }
    chatHistory = entries;
  });

  const hasConversation = $derived(chatHistory.length > 0);

  async function handleHint(): Promise<void> {
    chatHistory = [];
    streamingText = "";
    isStreaming = true;
    errorMessage = "";

    try {
      await client.requestHint(deckData, snapshot, (chunk) => {
        streamingText += chunk;
      });
      const finalText = streamingText;
      chatHistory = [{ role: "assistant", content: finalText }];
      streamingText = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Failed to get hint";
    } finally {
      isStreaming = false;
    }
  }

  async function handleSend(message: string): Promise<void> {
    streamingText = "";
    isStreaming = true;
    errorMessage = "";

    try {
      await client.sendMessage(message, (chunk) => {
        streamingText += chunk;
      });
      const finalText = streamingText;
      chatHistory = [...chatHistory, { role: "user", content: message }, { role: "assistant", content: finalText }];
      streamingText = "";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Failed to send message";
    } finally {
      isStreaming = false;
    }
  }

  function handleReset(): void {
    client.clearHistory();
    isStreaming = false;
    streamingText = "";
    chatHistory = [];
    errorMessage = "";
  }
</script>

<div class="card space-y-3 px-4 py-3">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold md:text-xl">Duel Copilot (WIP)</h2>
    <div class="flex gap-2">
      {#if hasConversation || isStreaming}
        <button class="btn btn-sm preset-tonal" onclick={handleReset}>リセット</button>
      {/if}
      <button class="btn btn-sm preset-filled-primary-500" onclick={handleHint} disabled={isStreaming}>
        {isStreaming && !hasConversation ? "考え中…" : "ヒントを見る"}
      </button>
    </div>
  </div>

  {#if errorMessage}
    <p class="text-error-500 text-sm">{errorMessage}</p>
  {/if}

  <ChatWindow
    {chatHistory}
    {streamingText}
    {isStreaming}
    introductionText="「ヒントを見る」でコパイロットが状況を分析します"
    placeholderText="質問を入力…"
    onSend={hasConversation ? handleSend : undefined}
  />
</div>
