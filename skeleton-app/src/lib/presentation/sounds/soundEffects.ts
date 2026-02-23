import { audioContextProvider } from "$lib/presentation/stores/audioStore";
import { playNote, playChord, type NoteOptions } from "$lib/presentation/utils/beep";

/**
 * サウンド定義（単音 or 和音）
 */
type SoundDefinition =
  | { type: "note"; options: NoteOptions }
  | { type: "chord"; frequencies: number[]; options: Omit<NoteOptions, "startFreq"> };

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
  {
    name: "cardDraw",
    description: "カードをドロー時: 「シュパッ」",
    sound: {
      type: "note",
      options: { waveType: "sine", startFreq: 400, endFreq: 1200, duration: 0.05 },
    },
  },
  {
    name: "activate",
    description: "発動時: 「カチャッ」",
    sound: {
      type: "note",
      options: { waveType: "sawtooth", startFreq: 880, endFreq: 440, duration: 0.04, volume: 0.05 },
    },
  },
  {
    name: "chainLink",
    description: "チェーン時: 「ピキーン」",
    sound: {
      type: "note",
      options: { waveType: "triangle", startFreq: 880, endFreq: 1760, duration: 0.1 },
    },
  },
  {
    name: "error",
    description: "エラー時: 「ブッ」",
    sound: {
      type: "note",
      options: { waveType: "sawtooth", startFreq: 110, endFreq: 55, duration: 0.2, volume: 0.1 },
    },
  },
  {
    name: "phaseChange",
    description: "フェーズ移行時: 「ポーン」",
    sound: {
      type: "note",
      options: { waveType: "sine", startFreq: 587.33, duration: 0.2, volume: 0.08 },
    },
  },
  {
    name: "win",
    description: "勝利時: 「ジャラララーン」",
    sound: {
      type: "chord",
      frequencies: [523.25, 659.25, 783.99, 1046.5],
      options: { waveType: "triangle", duration: 0.8, volume: 0.1 },
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
 * 名前で直接アクセスする用（既存コード互換）
 */
export const playSE = Object.fromEntries(SoundEffects.map((se) => [se.name, se.play])) as Record<string, () => void>;

export type SoundEffectName = keyof typeof playSE;
