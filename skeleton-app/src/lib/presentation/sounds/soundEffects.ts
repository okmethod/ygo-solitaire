/**
 * soundEffects - ゲーム用サウンドエフェクトのアダプター層
 *
 * beep.ts の汎用音声エンジンと audioStore を繋ぎ、ゲームアクションに対応した SE を定義・公開する。
 * ストアへの依存はこのファイルに集約し、呼び出し側は playSE.confirm() のように引数なしで使える。
 */

import { audioContextProvider } from "$lib/presentation/stores/audioStore";
import type { NotePattern, NoteOptions, ChordPattern, ChordOptions } from "$lib/presentation/sounds/beep";
import { WAVE_TYPES, playNote, playChord } from "$lib/presentation/sounds/beep";

/**
 * 単音パターン（周波数の推移）
 */
const NOTE_PATTERNS = {
  // --- 短音・打撃系 ---
  SHORT: { startFreq: 880, duration: 0.08 }, // 基本のピッ
  TICK: { startFreq: 2400, duration: 0.02 }, // 高域のチッ
  THUD: { startFreq: 120, endFreq: 40, duration: 0.12 }, // 重いドサッ
  STAB: { startFreq: 300, endFreq: 150, duration: 0.05 }, // 短いトッ
  // --- スライド・スイープ系 ---
  ASCEND: { startFreq: 400, endFreq: 1200, duration: 0.1 }, // 上昇
  DESCEND: { startFreq: 800, endFreq: 150, duration: 0.1 }, // 下降
  GLIDE: { startFreq: 400, endFreq: 2400, duration: 0.4 }, // 長い上昇
  SWIPE: { startFreq: 2000, endFreq: 400, duration: 0.06 }, // 素早い下降
} as const satisfies Record<string, NotePattern>;

/** 和音パターンの統合（複数周波数） */
const CHORD_PATTERNS = {
  // --- 明るい・調和（Positive / System） ---
  CHIME: { frequencies: [1046.5, 1318.51], duration: 0.1, arpeggio: 0.04 }, // 爽やかな2音
  GLITTER: { frequencies: [1318.51, 1567.98, 2093], duration: 0.15, arpeggio: 0.01 }, // 輝く高音
  FANFARE: { frequencies: [261.63, 329.63, 392, 523.25, 659.25], duration: 0.8, arpeggio: 0.1 }, // 堂々とした和音

  // --- 暗い・不穏（Negative / Warning） ---
  DISCORD: { frequencies: [150, 140], duration: 0.15, arpeggio: 0.05 }, // 濁った低音
  FALL: { frequencies: [659.25, 523.25], duration: 0.2, arpeggio: 0.08 }, // 寂しい下降

  // --- 衝撃・力強さ（Physical / Action） ---
  CRASH: { frequencies: [200, 250, 300, 180], duration: 0.2, arpeggio: 0.01 }, // 複雑な散らばり
  POWER: { frequencies: [130.81, 196, 261.63, 392], duration: 0.4, arpeggio: 0.02 }, // 重厚なパワー
  HEAVY: { frequencies: [55, 82.41, 110], duration: 0.25, arpeggio: 0 }, // 超低域の塊
} as const satisfies Record<string, ChordPattern>;

/** 単音パターンをSEオプション形式に変換するヘルパー */
const createNoteSE = (p: NotePattern, wave: OscillatorType, vol = 0.1): NoteOptions => ({
  ...p,
  waveType: wave,
  volume: vol,
});

/** 和音パターンをSEオプション形式に変換するヘルパー */
const createChordSE = (p: ChordPattern, wave: OscillatorType, vol = 0.1): ChordOptions => ({
  ...p,
  waveType: wave,
  volume: vol,
});

/**
 * サウンド定義（単音 or 和音）
 */
type SoundDefinition =
  | { type: "note"; options: NoteOptions }
  | { type: "chord"; frequencies: number[]; options: ChordOptions };

/**
 * 波形ごとに整理されたサウンド定義の集合
 * 利用例: SE.sine.SHORT
 */
const SE = Object.fromEntries(
  WAVE_TYPES.map((wave) => [
    wave,
    {
      // 単音パターンのマッピング
      ...Object.fromEntries(
        Object.entries(NOTE_PATTERNS).map(([name, p]) => [
          name,
          { type: "note", options: createNoteSE(p, wave) } as SoundDefinition,
        ]),
      ),
      // 和音パターンのマッピング
      ...Object.fromEntries(
        Object.entries(CHORD_PATTERNS).map(([name, p]) => [
          name,
          { type: "chord", frequencies: p.frequencies, options: createChordSE(p, wave) } as SoundDefinition,
        ]),
      ),
    },
  ]),
) as Record<OscillatorType, Record<string, SoundDefinition>>;

/**
 * サウンドエフェクト設定
 */
interface SoundEffectConfig {
  readonly name: string;
  readonly description: string;
  readonly sound: SoundDefinition;
}

/**
 * 再生用サウンドエフェクト
 */
interface SoundEffect {
  readonly name: string;
  readonly description: string;
  readonly play: () => void;
}

/**
 * サウンド定義から再生関数を生成
 */
function createPlayFunction(sound: SoundDefinition): () => void {
  if (sound.type === "note") {
    return () => playNote(audioContextProvider, sound.options);
  } else {
    return () => playChord(audioContextProvider, sound.frequencies, sound.options);
  }
}

/** Config形式から公開用SE形式（play関数付き）に変換するラッパー */
const toSoundEffect = (config: SoundEffectConfig): SoundEffect => ({
  name: config.name,
  description: config.description,
  play: createPlayFunction(config.sound),
});

/** * 波形ごとのSEリストを生成するヘルパー
 */
const createEffectsByWave = (wave: OscillatorType): readonly SoundEffect[] => {
  return Object.entries(SE[wave]).map(([pName, sound]) =>
    toSoundEffect({
      name: `${wave.toUpperCase()}_${pName}`,
      description: `Wave: ${wave}, Pattern: ${pName}`,
      sound,
    }),
  );
};
export const sineSoundEffects = createEffectsByWave("sine");
export const squareSoundEffects = createEffectsByWave("square");
export const sawtoothSoundEffects = createEffectsByWave("sawtooth");
export const triangleSoundEffects = createEffectsByWave("triangle");

/**
 * ゲーム用に選定したサウンドエフェクトのレジストリ
 */
const SE_ASSIGNMENTS = {
  // === システム・UI ===
  confirm: { sound: SE.triangle.SHORT, desc: "決定: ピッ" },
  cancel: { sound: SE.triangle.DESCEND, desc: "キャンセル: ポッ" },
  error: { sound: SE.sawtooth.DISCORD, desc: "エラー: ブブッ" },

  // === カード操作 ===
  activate: { sound: SE.sine.SWIPE, desc: "発動: ピュン" },
  summon: { sound: SE.triangle.GLIDE, desc: "召喚: ピョイーン" },
  set: { sound: SE.sine.STAB, desc: "セット: トッ" },
  discard: { sound: SE.sine.DESCEND, desc: "捨てる: ヒュン" },

  // === イベント ===
  attention: { sound: SE.triangle.CHIME, desc: "アテンション: コリン" },
  damage: { sound: SE.square.THUD, desc: "ダメージ: ズッ" },
} as const;

/** ゲーム用SE一覧（イテレート・一覧表示用） */
export const gameSoundEffects: readonly SoundEffect[] = Object.entries(SE_ASSIGNMENTS).map(([name, { sound, desc }]) =>
  toSoundEffect({ name, description: desc, sound }),
);

/**
 * サウンドエフェクト再生関数のマップ
 * 例: playSE.confirm() で「決定」音を再生
 */
export const playSE = Object.fromEntries(gameSoundEffects.map((se) => [se.name, se.play])) as {
  [K in keyof typeof SE_ASSIGNMENTS]: () => void;
};
