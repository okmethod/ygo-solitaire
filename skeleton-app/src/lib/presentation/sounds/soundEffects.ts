import { audioContextProvider } from "$lib/presentation/stores/audioStore";
import type { NoteOptions, ChordOptions } from "$lib/presentation/utils/beep";
import { playNote, playChord } from "$lib/presentation/utils/beep";

/**
 * サウンド定義（単音 or 和音）
 */
type SoundDefinition =
  | { type: "note"; options: NoteOptions }
  | { type: "chord"; frequencies: number[]; options: ChordOptions };

/**
 * サウンドエフェクト設定
 */
interface SoundEffectConfig {
  readonly name: string;
  readonly description: string;
  readonly sound: SoundDefinition;
}

/**
 * サウンドエフェクト（公開用）
 */
export interface SoundEffect {
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

/**
 * サウンドエフェクトのレジストリ
 */
const configs: readonly SoundEffectConfig[] = [
  // === システム系 ===
  {
    name: "confirm",
    description: "決定: 「ピッ」デジタル",
    sound: {
      type: "note",
      options: { waveType: "square", startFreq: 880, duration: 0.08, volume: 0.06 },
    },
  },
  {
    name: "cancel",
    description: "キャンセル: 「プッ」デジタル",
    sound: {
      type: "note",
      options: { waveType: "sawtooth", startFreq: 800, endFreq: 150, duration: 0.1, volume: 0.08 },
    },
  },
  {
    name: "error",
    description: "エラー: 「ブブッ」失敗",
    sound: {
      type: "chord",
      frequencies: [150, 140], // 不協和音
      options: { waveType: "sawtooth", duration: 0.15, volume: 0.12, arpeggio: 0.05 },
    },
  },
  {
    name: "phaseChange",
    description: "フェイズ進行: 「テュルン」区切り",
    sound: {
      type: "chord",
      frequencies: [659.25, 523.25], // E5, C5 (下降)
      options: { waveType: "triangle", duration: 0.2, volume: 0.1, arpeggio: 0.08 },
    },
  },

  // === カードアクション系 ===
  {
    name: "drawCard",
    description: "ドロー: 「ピンッ」紙めくり感",
    sound: {
      type: "note",
      options: { waveType: "sine", startFreq: 2000, endFreq: 400, duration: 0.06, volume: 0.08 },
    },
  },
  {
    name: "setCard",
    description: "セット: 「トン」置く音",
    sound: {
      type: "note",
      options: { waveType: "sine", startFreq: 300, endFreq: 150, duration: 0.05, volume: 0.12 },
    },
  },
  {
    name: "discard",
    description: "捨てる: 「ポンッ」素早く落ちる",
    sound: {
      type: "note",
      options: { waveType: "sine", startFreq: 1200, endFreq: 150, duration: 0.1, volume: 0.08 },
    },
  },
  {
    name: "search",
    description: "サーチ: 「ピピッ」発見",
    sound: {
      type: "chord",
      frequencies: [1046.5, 1318.51], // C6, E6
      options: { waveType: "square", duration: 0.1, volume: 0.08, arpeggio: 0.04 },
    },
  },
  {
    name: "destroy",
    description: "破壊: 「バリーン」砕ける",
    sound: {
      type: "chord",
      frequencies: [200, 250, 300, 180], // 不規則な破壊音
      options: { waveType: "sawtooth", duration: 0.2, volume: 0.15, arpeggio: 0.01 },
    },
  },

  // === 発動系 ===
  {
    name: "activate",
    description: "カード発動: 「キラッ」輝き",
    sound: {
      type: "chord",
      frequencies: [1318.51, 1567.98, 2093], // E6, G6, C7 (明るい高音和音)
      options: { waveType: "triangle", duration: 0.15, volume: 0.12, arpeggio: 0.01 },
    },
  },
  {
    name: "chain",
    description: "チェーン: 「カキーン」金属連鎖",
    sound: {
      type: "chord",
      frequencies: [1760, 2217.46, 2637.02], // A6, C#7, E7
      options: { waveType: "triangle", duration: 0.2, volume: 0.1, arpeggio: 0.015 },
    },
  },

  // === 召喚系 ===
  {
    name: "normalSummon",
    description: "通常召喚: 「ブォン」出現",
    sound: {
      type: "chord",
      frequencies: [130.81, 196, 261.63, 392], // C3, G3, C4, G4 (パワーコード)
      options: { waveType: "sawtooth", duration: 0.3, volume: 0.15, arpeggio: 0 },
    },
  },
  {
    name: "specialSummon",
    description: "特殊召喚: 「ズォォン」出現",
    sound: {
      type: "chord",
      frequencies: [110, 220, 329.63, 440, 659.25], // A2, A3, E4, A4, E5 (荘厳なA)
      options: { waveType: "sawtooth", duration: 0.5, volume: 0.12, arpeggio: 0.02 },
    },
  },

  // === バトル系 ===
  {
    name: "attack",
    description: "攻撃宣言: 「ピュン」発射",
    sound: {
      type: "note",
      options: { waveType: "sawtooth", startFreq: 800, endFreq: 200, duration: 0.08, volume: 0.15 },
    },
  },
  {
    name: "damage",
    description: "ダメージ: 「ドォン」重い衝撃",
    sound: {
      type: "chord",
      frequencies: [55, 82.41, 110], // A1, E2, A2 (超低音)
      options: { waveType: "sawtooth", duration: 0.25, volume: 0.2, arpeggio: 0 },
    },
  },
  {
    name: "recovery",
    description: "回復: 「キラキラ」輝く回復",
    sound: {
      type: "chord",
      frequencies: [783.99, 987.77, 1174.66, 1567.98], // G5, B5, D6, G6 (Gmaj)
      options: { waveType: "square", duration: 0.4, volume: 0.1, arpeggio: 0.05 },
    },
  },

  // === 特殊演出系 ===
  {
    name: "win",
    description: "勝利: 「ピロリロリン」軽快な勝利",
    sound: {
      type: "chord",
      frequencies: [261.63, 329.63, 392, 523.25, 659.25], // C4, E4, G4, C5, E5
      options: { waveType: "square", duration: 0.8, volume: 0.12, arpeggio: 0.1 },
    },
  },
  {
    name: "lose",
    description: "敗北: 「ドドドン...」重い終焉",
    sound: {
      type: "chord",
      frequencies: [82.41, 103.83, 123.47], // E2, G#2, B2 (Emaj 低音)
      options: { waveType: "sawtooth", duration: 0.8, volume: 0.15, arpeggio: 0.15 },
    },
  },
];

/**
 * サウンドエフェクト一覧（イテレート・一覧表示用）
 */
export const SoundEffects: readonly SoundEffect[] = configs.map((config) => ({
  name: config.name,
  description: config.description,
  play: createPlayFunction(config.sound),
}));

/**
 * サウンドエフェクト再生関数のマップ
 * 例: playSE.confirm() で「決定」音を再生
 */
export const playSE = Object.fromEntries(SoundEffects.map((se) => [se.name, se.play])) as Record<string, () => void>;

export type SoundEffectName = keyof typeof playSE;
