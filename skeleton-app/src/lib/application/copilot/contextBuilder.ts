/**
 * デュエルコパイロット向けプロンプトの組み立て
 *
 * ゲーム状態・カードDSL・デッキガイドをLLMへ渡すプロンプトに変換する。
 *
 * ## プロンプト設計の指針
 *
 * 人間向けドキュメントと異なり、LLMは直近の情報を重視する（recency 効果）。
 * そのため、推論対象（現在のゲーム状態）を末尾に置くことで応答品質が上がる。
 *
 * メッセージのセクション順序:
 * 1. デッキの回し方（戦略・勝ち筋）  ← 高レベルの目標を最初に与える
 * 2. カード定義 DSL（効果テキスト） ← 推論に使う参照情報
 * 3. 現在のゲーム状態  ← 推論対象。末尾に置くことで鮮度を保つ
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

/** sendMessage 時に現在盤面をユーザーメッセージへ差し込む（DSL は再送しない） */
export function buildStateUpdatePrefix(snapshot: GameSnapshot): string {
  return buildStateSection(snapshot);
}

function buildSystemPrompt(): string {
  return `あなたは遊戯王OCGの1ターンキルシミュレーターのデュエルコパイロットです。
このゲームは先攻1ターン目のみを扱います。勝利条件はデッキごとに異なり、「デッキの回し方」に定義されています。その勝ち筋以外での勝利はほぼ不可能なため、必ずガイドに沿った行動を提案してください。

以下の形式で回答してください：
1. **次の1手**: 今すぐ行うべき操作（カード発動・召喚・フェイズ移行など）
2. **理由**: その手が最善な根拠（1〜2文）
3. **その後の流れ**: 2〜3手先の展開

制約：
- カード名は必ず《》で囲む
- 提供されたゲーム状態・カード定義・ガイドにない情報は使用しない
- メインフェイズ1で実行可能な操作（モンスター召喚・カード発動・効果発動）の範囲で提案する
- normalSummonUsed が true の場合、通常召喚はすでに行使済みで追加の通常召喚はできない

ゲーム状態が提示されたら、上記の形式で次の手を提案してください。`;
}

function buildMessage(deckData: DeckData, snapshot: GameSnapshot): string {
  const parts: string[] = [];

  parts.push(`## デッキの回し方\n${deckData.guide}`);

  const dslSection = buildDslSection(snapshot);
  if (dslSection) {
    parts.push(dslSection);
  }

  parts.push(buildStateSection(snapshot));

  return parts.join("\n\n");
}

/** 現在のゲーム状態セクション（move番号付き）を組み立てる */
function buildStateSection(snapshot: GameSnapshot): string {
  return `## 現在のゲーム状態 (move: ${snapshot.moveCount})\n\`\`\`json\n${JSON.stringify(buildStateContext(snapshot), null, 2)}\n\`\`\``;
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
    moveCount: snapshot.moveCount,
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
