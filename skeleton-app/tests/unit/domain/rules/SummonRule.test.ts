/**
 * 通常召喚・特殊召喚ルールのテスト
 */

import { describe, it, expect } from "vitest";
import {
  canNormalSummon,
  getRequiredTributes,
  performNormalSummon,
  canSpecialSummon,
  executeSpecialSummon,
} from "$lib/domain/rules/SummonRule";
import { createSummonReadyState } from "../../../__testUtils__";
import { GameProcessing } from "$lib/domain/models/GameProcessing";

describe("SummonRule", () => {
  describe("getRequiredTributes", () => {
    it("レベル4以下はリリース不要", () => {
      expect(getRequiredTributes(1)).toBe(0);
      expect(getRequiredTributes(4)).toBe(0);
      expect(getRequiredTributes(undefined)).toBe(0);
    });

    it("レベル5〜6は1体リリース", () => {
      expect(getRequiredTributes(5)).toBe(1);
      expect(getRequiredTributes(6)).toBe(1);
    });

    it("レベル7以上は2体リリース", () => {
      expect(getRequiredTributes(7)).toBe(2);
      expect(getRequiredTributes(12)).toBe(2);
    });
  });

  describe("canSummonOrSet", () => {
    it("条件を満たしている場合は召喚可能（レベル4モンスター）", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
      });

      const result = canNormalSummon(state, state.space.hand[0].instanceId);

      expect(result.isValid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });

    it("メインフェイズ以外では失敗", () => {
      const state = createSummonReadyState({
        hand: "monster",
        phase: "draw",
      });

      const result = canNormalSummon(state, state.space.hand[0].instanceId);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.NOT_MAIN_PHASE);
    });

    it("召喚回数上限に達している場合は失敗", () => {
      const state = createSummonReadyState({
        hand: "monster",
        normalSummonUsed: 1,
      });

      const result = canNormalSummon(state, state.space.hand[0].instanceId);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED);
    });

    it("モンスターゾーンが満杯（5体）の場合は通常召喚失敗", () => {
      const state = createSummonReadyState({
        hand: "monster",
        fieldCount: 5,
      });

      const result = canNormalSummon(state, state.space.hand[0].instanceId);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
    });

    it("カードが手札にない場合は失敗", () => {
      const state = createSummonReadyState({
        hand: "empty",
        fieldCount: 1,
      });

      const result = canNormalSummon(state, state.space.mainMonsterZone[0].instanceId);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.CARD_NOT_IN_HAND);
    });

    it("フィールドに十分なモンスターがいる場合はリリース召喚可能（レベル5）", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 5,
        fieldCount: 1,
      });

      const result = canNormalSummon(state, state.space.hand[0].instanceId);

      expect(result.isValid).toBe(true);
    });

    it("フィールドのモンスターが不足している場合はリリース召喚失敗（レベル7）", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 7,
        fieldCount: 1,
      });

      const result = canNormalSummon(state, state.space.hand[0].instanceId);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.NOT_ENOUGH_TRIBUTES);
    });
  });

  describe("performNormalSummon", () => {
    describe("リリース不要（レベル4以下）", () => {
      it("攻撃表示で召喚した場合、更新済みステートを即時返却する", () => {
        const state = createSummonReadyState({
          hand: "monster",
          levelOfHandMonster: 4,
          fieldCount: 0,
        });

        const result = performNormalSummon(state, state.space.hand[0].instanceId, "attack");

        expect(result.type).toBe("immediate");
        if (result.type === "immediate") {
          expect(result.state.normalSummonUsed).toBe(1);
          expect(result.state.space.mainMonsterZone.length).toBe(1);
          expect(result.state.space.hand.length).toBe(0);
          expect(result.message).toContain("召喚");
          expect(result.activationSteps.length).toBe(1); // emitNormalSummonedEventStep
        }
      });

      it("守備表示でセットした場合、即時結果を返却する", () => {
        const state = createSummonReadyState({
          hand: "monster",
          levelOfHandMonster: 4,
          fieldCount: 0,
        });

        const result = performNormalSummon(state, state.space.hand[0].instanceId, "defense");

        expect(result.type).toBe("immediate");
        if (result.type === "immediate") {
          expect(result.state.normalSummonUsed).toBe(1);
          expect(result.message).toContain("セット");
          expect(result.activationSteps.length).toBe(0); // セット時はイベントなし
        }
      });

      it("モンスターを表側攻撃表示で配置する", () => {
        const state = createSummonReadyState({
          hand: "monster",
          levelOfHandMonster: 4,
          fieldCount: 0,
        });

        const result = performNormalSummon(state, state.space.hand[0].instanceId, "attack");

        if (result.type === "immediate") {
          const summonedMonster = result.state.space.mainMonsterZone[0];
          expect(summonedMonster.stateOnField?.position).toBe("faceUp");
          expect(summonedMonster.stateOnField?.battlePosition).toBe("attack");
        }
      });

      it("モンスターを裏側守備表示で配置する", () => {
        const state = createSummonReadyState({
          hand: "monster",
          levelOfHandMonster: 4,
          fieldCount: 0,
        });

        const result = performNormalSummon(state, state.space.hand[0].instanceId, "defense");

        if (result.type === "immediate") {
          const summonedMonster = result.state.space.mainMonsterZone[0];
          expect(summonedMonster.stateOnField?.position).toBe("faceDown");
          expect(summonedMonster.stateOnField?.battlePosition).toBe("defense");
        }
      });
    });

    describe("リリース必要（レベル5以上）", () => {
      it("レベル5モンスターはneedsSelection結果を返却する", () => {
        const state = createSummonReadyState({
          hand: "monster",
          levelOfHandMonster: 5,
          fieldCount: 1,
        });

        const result = performNormalSummon(state, state.space.hand[0].instanceId, "attack");

        expect(result.type).toBe("needsSelection");
        if (result.type === "needsSelection") {
          expect(result.step).toBeDefined();
          expect(result.message).toContain("リリース");
        }
      });

      it("レベル7モンスター（2体リリース）はneedsSelection結果を返却する", () => {
        const state = createSummonReadyState({
          hand: "monster",
          levelOfHandMonster: 7,
          fieldCount: 2,
        });

        const result = performNormalSummon(state, state.space.hand[0].instanceId, "attack");

        expect(result.type).toBe("needsSelection");
        if (result.type === "needsSelection") {
          expect(result.step).toBeDefined();
        }
      });
    });
  });

  describe("canSpecialSummon", () => {
    it("モンスターゾーンに4体いる場合は特殊召喚可能", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 8,
        fieldCount: 4,
      });

      const result = canSpecialSummon(state);

      expect(result.isValid).toBe(true);
    });

    it("モンスターゾーンが満杯（5体）の場合はMONSTER_ZONE_FULLを返す", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 8,
        fieldCount: 5,
      });

      const result = canSpecialSummon(state);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe(GameProcessing.Validation.ERROR_CODES.MONSTER_ZONE_FULL);
    });
  });

  describe("executeSpecialSummon", () => {
    it("手札のモンスターを攻撃表示でモンスターゾーンに移動する", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 8,
        fieldCount: 0,
      });

      const { state: result, event } = executeSpecialSummon(state, state.space.hand[0].instanceId, "attack");

      expect(result.space.hand.length).toBe(0);
      expect(result.space.mainMonsterZone.length).toBe(1);
      const summonedMonster = result.space.mainMonsterZone[0];
      expect(summonedMonster.stateOnField?.position).toBe("faceUp");
      expect(summonedMonster.stateOnField?.battlePosition).toBe("attack");
      expect(event.type).toBe("specialSummoned");
      expect(event.sourceInstanceId).toBe(state.space.hand[0].instanceId);
    });

    it("手札のモンスターを守備表示でモンスターゾーンに移動する", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 8,
        fieldCount: 0,
      });

      const { state: result } = executeSpecialSummon(state, state.space.hand[0].instanceId, "defense");

      const summonedMonster = result.space.mainMonsterZone[0];
      expect(summonedMonster.stateOnField?.position).toBe("faceUp"); // 特殊召喚は常に表側
      expect(summonedMonster.stateOnField?.battlePosition).toBe("defense");
    });

    it("通常召喚権を消費しない", () => {
      const state = createSummonReadyState({
        hand: "monster",
        levelOfHandMonster: 4,
        fieldCount: 0,
      });

      const { state: result } = executeSpecialSummon(state, state.space.hand[0].instanceId, "attack");

      expect(result.normalSummonUsed).toBe(0); // 0のまま
    });
  });
});
