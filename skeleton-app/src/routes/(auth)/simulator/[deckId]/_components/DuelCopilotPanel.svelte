<script lang="ts">
  import { onMount } from "svelte";
  import type { IDuelCopilotClient } from "$lib/application/ports/IDuelCopilotClient";
  import type { GameSnapshot } from "$lib/domain/models/GameState";
  import type { DeckData } from "$lib/application/types/deck";

  interface Props {
    client: IDuelCopilotClient;
    deckData: DeckData;
    snapshot: GameSnapshot;
  }
  let { client, deckData, snapshot }: Props = $props();

  type Status = "idle" | "loading" | "streaming" | "done" | "error";
  type ConversationEntry = { role: "assistant" | "user"; content: string };

  let status = $state<Status>("idle");
  let errorMessage = $state("");
  let conversation = $state<ConversationEntry[]>([]);
  let inputText = $state("");

  onMount(() => {
    // 復元された会話履歴を表示用エントリに変換する
    // history[0] = 初回の大きなプロンプト（非表示）、history[1]以降 = 表示対象
    const history = client.getHistory();
    if (history.length < 2) return;

    const entries: ConversationEntry[] = [{ role: "assistant", content: history[1]?.content ?? "" }];
    for (let i = 2; i < history.length; i++) {
      const msg = history[i];
      if (!msg) continue;
      entries.push({ role: msg.role === "model" ? "assistant" : "user", content: msg.content });
    }
    conversation = entries;
    status = "done";
  });

  const isProcessing = $derived(status === "loading" || status === "streaming");
  const canSendMessage = $derived(status === "done" && conversation.length > 0);

  async function handleHint() {
    status = "loading";
    errorMessage = "";
    conversation = [{ role: "assistant", content: "" }];

    try {
      await client.requestHint(deckData, snapshot, (chunk) => {
        status = "streaming";
        conversation[0] = { role: "assistant", content: (conversation[0]?.content ?? "") + chunk };
      });
      status = "done";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      status = "error";
    }
  }

  async function handleSend() {
    const message = inputText.trim();
    if (!message || isProcessing) return;

    inputText = "";
    status = "loading";
    errorMessage = "";
    conversation = [...conversation, { role: "user", content: message }, { role: "assistant", content: "" }];

    try {
      const lastIndex = conversation.length - 1;
      await client.sendMessage(message, (chunk) => {
        status = "streaming";
        conversation[lastIndex] = { role: "assistant", content: (conversation[lastIndex]?.content ?? "") + chunk };
      });
      status = "done";
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
      status = "error";
    }
  }

  function handleReset() {
    client.clearHistory();
    status = "idle";
    errorMessage = "";
    conversation = [];
    inputText = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="card space-y-3 px-4 py-3">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-bold md:text-xl">Duel Copilot (WIP)</h2>
    <div class="flex gap-2">
      {#if status !== "idle"}
        <button class="btn btn-sm preset-tonal" onclick={handleReset}> リセット </button>
      {/if}
      <button class="btn btn-sm preset-filled-primary-500" onclick={handleHint} disabled={isProcessing}>
        {#if isProcessing && conversation.length <= 1}
          考え中…
        {:else}
          ヒントを見る
        {/if}
      </button>
    </div>
  </div>

  {#if status === "error"}
    <p class="text-error-500 text-sm">{errorMessage}</p>
  {/if}

  {#if conversation.length > 0}
    <div class="space-y-2">
      {#each conversation as entry, i (i)}
        {#if entry.role === "user"}
          <div class="flex justify-end">
            <div class="bg-primary-100-900 max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap">
              {entry.content}
            </div>
          </div>
        {:else}
          <div class="bg-surface-100-900 rounded-lg p-3 text-sm whitespace-pre-wrap">
            {entry.content}{#if status === "streaming" && i === conversation.length - 1}<span class="animate-pulse"
                >▌</span
              >{/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  {#if canSendMessage}
    <div class="flex gap-2">
      <input
        class="input flex-1 text-sm"
        type="text"
        placeholder="フォローアップ質問を入力…"
        bind:value={inputText}
        onkeydown={handleKeydown}
      />
      <button class="btn btn-sm preset-filled-primary-500" onclick={handleSend} disabled={!inputText.trim()}>
        送信
      </button>
    </div>
  {/if}
</div>
