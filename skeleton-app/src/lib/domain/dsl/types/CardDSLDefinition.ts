/**
 * CardDSLDefinition - YAML形式のカード定義に対応する型
 *
 * YAMLファイルからパースされた後、Zodスキーマでバリデーションされる。
 * GenericNormalSpellActivation等の汎用クラスがこの定義を注入して動作する。
 */

import type { CardType, FrameSubType, SpellSubType, TrapSubType } from "$lib/domain/models/Card";
import type { RuleCategory } from "$lib/domain/models/Effect";
import type { EventType } from "$lib/domain/models/GameProcessing";

/**
 * ステップのDSL表現
 *
 * StepRegistryのキーと引数をマッピングする。
 * 例: { step: "DRAW", args: { count: 3 } }
 */
export interface StepDSL {
  /** StepRegistryのキー */
  readonly step: string;
  /** ステップに渡す引数（オプション） */
  readonly args?: Readonly<Record<string, unknown>>;
}

/**
 * チェーンブロックを作る処理のDSL表現
 *
 * 発動条件、発動時処理（コスト）、効果処理を定義する。
 */
export interface ChainableActionDSL {
  /** 発動条件のステップリスト */
  readonly conditions?: readonly StepDSL[];
  /** 発動時処理（コスト支払い等）のステップリスト */
  readonly activations?: readonly StepDSL[];
  /** 効果処理のステップリスト */
  readonly resolutions?: readonly StepDSL[];
}

/**
 * 追加適用するルールのDSL表現
 *
 * 永続効果などのAdditionalRuleをDSLで定義する。
 */
export interface AdditionalRuleDSL {
  /** ルールのカテゴリ */
  readonly category: RuleCategory;
  /** トリガーイベント（TriggerRuleの場合） */
  readonly triggers?: readonly EventType[];
  /**
   * トリガータイミング種別
   * - "when": タイミングを逃す可能性あり
   * - "if": タイミングを逃さない（デフォルト）
   */
  readonly triggerTiming?: "when" | "if";
  /** 強制効果かどうか（デフォルト: true） */
  readonly isMandatory?: boolean;
  /** 効果処理のステップリスト */
  readonly resolutions?: readonly StepDSL[];
}

/**
 * カードデータのDSL表現
 */
export interface CardDataDSL {
  /** 日本語カード名 */
  readonly jaName: string;
  /** カードタイプ */
  readonly type: CardType;
  /** カードフレームタイプ */
  readonly frameType: FrameSubType;
  /** エディション（latest: 最新, legacy: エラッタ前） */
  readonly edition?: "latest" | "legacy";
  /** 魔法カードサブタイプ */
  readonly spellType?: SpellSubType;
  /** 罠カードサブタイプ */
  readonly trapType?: TrapSubType;
  // モンスター用（将来拡張）
  readonly race?: string;
  readonly attribute?: string;
  readonly level?: number;
}

/**
 * YAMLカード定義の型
 *
 * カードデータと効果定義を一元管理する。
 * 1枚のカードの全情報を1箇所で管理（SSOT原則）。
 */
export interface CardDSLDefinition {
  /** カードID（YGOProDeck APIと同じ値） */
  readonly id: number;

  /** カードデータ */
  readonly data: CardDataDSL;

  /**
   * チェーンブロックを作る処理
   * - activations: カードの発動（魔法・罠）
   * - ignitions: 起動効果（モンスター）
   */
  readonly "effect-chainable-actions"?: {
    readonly activations?: ChainableActionDSL;
    readonly ignitions?: readonly ChainableActionDSL[];
  };

  /**
   * 追加適用するルール
   * - continuous: 永続効果
   */
  readonly "effect-additional-rules"?: {
    readonly continuous?: readonly AdditionalRuleDSL[];
  };
}
