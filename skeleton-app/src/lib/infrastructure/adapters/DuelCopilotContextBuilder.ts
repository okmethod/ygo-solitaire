/**
 * DuelCopilotContextBuilder - デュエルコパイロット向けプロンプトの組み立て
 *
 * ゲーム状態・カードDSL・デッキガイドをLLMへ渡すプロンプトに変換する。
 *
 * @architecture インフラ層 (Adapter 内部ヘルパー)
 * @module infrastructure/adapters/DuelCopilotContextBuilder
 */

import type { GameSnapshot } from "$lib/domain/models/GameState";
import { CardDataRegistry } from "$lib/domain/cards/CardDataRegistry";
import { getDSLDefinition } from "$lib/domain/cards/definitions";
import type { DeckData } from "$lib/application/types/deck";

export interface DuelCopilotPrompt {
  systemPrompt: string;
  message: string;
}

/** デュエルコパイロット向けプロンプトを組み立てる */
export function buildDuelCopilotPrompt(deckData: DeckData, snapshot: GameSnapshot): DuelCopilotPrompt {
  return {
    systemPrompt: buildSystemPrompt(),
    message: buildMessage(deckData, snapshot),
  };
}

function buildSystemPrompt(): string {
  return `あなたは遊戯王OCGの1ターンキルシミュレーターのデュエルコパイロットです。
ユーザーから現在のゲーム状態とデッキの回し方ガイドを受け取り、次に取るべき行動を日本語で簡潔に提案してください。
カード名は《》で囲んで表記してください。推測や曖昧な情報は避け、提供された情報のみを根拠に回答してください。`;
}

function buildMessage(deckData: DeckData, snapshot: GameSnapshot): string {
  const parts: string[] = [];

  if (deckData.guide) {
    parts.push(`## デッキの回し方\n${deckData.guide}`);
  }

  const dslSection = buildDslSection(snapshot);
  if (dslSection) {
    parts.push(dslSection);
  }

  parts.push(`## 現在のゲーム状態\n\`\`\`json\n${JSON.stringify(buildStateContext(snapshot), null, 2)}\n\`\`\``);
  parts.push("## 質問\nこの盤面で次に何をすべきか教えてください。");

  return parts.join("\n\n");
}

/** 手札・フィールドのカードDSLセクションを組み立てる */
function buildDslSection(snapshot: GameSnapshot): string | null {
  const relevantInstances = [
    ...snapshot.space.hand,
    ...snapshot.space.mainMonsterZone,
    ...snapshot.space.spellTrapZone,
    ...snapshot.space.fieldZone,
  ];

  const uniqueCardIds = [...new Set(relevantInstances.map((c) => c.id))];
  if (uniqueCardIds.length === 0) return null;

  const dslTexts = uniqueCardIds.map((id) => {
    const name = tryGetCardName(id);
    const dsl = getDSLDefinition(id);
    return dsl ? `### 《${name}》\n\`\`\`yaml\n${dsl}\`\`\`` : `### 《${name}》\n（通常カード・効果なし）`;
  });

  return `## 手札・フィールドのカード定義\n${dslTexts.join("\n\n")}`;
}

/** LLMに渡す簡略化したゲーム状態オブジェクトを組み立てる */
function buildStateContext(snapshot: GameSnapshot) {
  return {
    phase: snapshot.phase,
    lp: snapshot.lp,
    normalSummonUsed: snapshot.normalSummonUsed,
    normalSummonLimit: snapshot.normalSummonLimit,
    hand: snapshot.space.hand.map((c) => tryGetCardName(c.id)),
    field: {
      monsters: snapshot.space.mainMonsterZone.map((c) => tryGetCardName(c.id)),
      spellTraps: snapshot.space.spellTrapZone.map((c) => tryGetCardName(c.id)),
      fieldZone: snapshot.space.fieldZone.map((c) => tryGetCardName(c.id)),
    },
    graveyard: snapshot.space.graveyard.map((c) => tryGetCardName(c.id)),
    deckCount: snapshot.space.mainDeck.length,
    activatedThisTurn: snapshot.activatedCardIds.map((id) => tryGetCardName(id)),
  };
}

function tryGetCardName(cardId: number): string {
  try {
    return CardDataRegistry.getCard(cardId).jaName;
  } catch {
    return String(cardId);
  }
}
