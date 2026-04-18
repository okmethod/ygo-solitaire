/**
 * beep - Web Audio API の低レベル音声ラッパー
 *
 * 単音・スライド・和音の再生に必要な型定義と基本再生関数を提供する。
 * ストアに依存せず audioContextProvider を引数で受け取るため、テスト・再利用が容易。
 * soundEffects.ts や melody.ts から参照されるエンジン層。
 */

export const WAVE_TYPES: readonly OscillatorType[] = ["sine", "square", "sawtooth", "triangle"] as const;

export const LABEL_TYPES = ["none", "ja", "en"] as const;
export type LabelType = (typeof LABEL_TYPES)[number];

/** 最小単位の音（単一周波数・一定） */
export interface BeepPattern {
  startFreq: number;
  duration: number; // 秒単位
}

/** 単音パターン（周波数の推移を許容） */
export interface NotePattern extends BeepPattern {
  endFreq?: number;
}

/** 和音パターン（複数周波数とアルペジオ） */
export interface ChordPattern {
  frequencies: number[];
  duration: number;
  arpeggio?: number;
}

/** 再生時設定 */
interface PlaybackSettings {
  waveType: OscillatorType;
  volume?: number; // 0.0 ~ 1.0
  delay?: number; // 再生開始までの遅延
}

/** playBeep用設定（基本音） */
export interface BeepOptions extends BeepPattern, PlaybackSettings {}

/** playNote用設定（単音・スライド対応） */
export interface NoteOptions extends NotePattern, PlaybackSettings {}

/** playChord用設定（和音） */
export interface ChordOptions extends ChordPattern, Omit<PlaybackSettings, "delay"> {}

/** 連続音を開始し、停止関数を返す（押下中に音を鳴らし続けるボタン等での使用を想定） */
export function startBeep(
  audioContextProvider: () => AudioContext | null,
  waveType: OscillatorType,
  frequency: number,
): () => void {
  const audioCtx = audioContextProvider();
  if (!audioCtx) return () => {};

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = waveType;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.start();

  function _stopBeep(): void {
    oscillator.stop();
    oscillator.disconnect();
    gainNode.disconnect();
  }

  // stopBeep をクロージャとして返す
  return () => {
    _stopBeep();
  };
}

/** 単純なビープ音再生関数（周波数と持続時間のみ） */
export function playBeep(audioContextProvider: () => AudioContext | null, options: BeepOptions) {
  const { waveType, startFreq, duration } = options;
  const stopBeep = startBeep(audioContextProvider, waveType, startFreq);
  setTimeout(() => stopBeep(), duration * 1000);
}

/**
 * 高機能な音再生関数
 * - エンベロープ（余韻）付き
 * - 周波数変化対応
 * - アルペジオ（遅延再生）対応
 */
export function playNote(audioContextProvider: () => AudioContext | null, options: NoteOptions): void {
  const { waveType, startFreq, endFreq, duration, volume = 0.1, delay = 0 } = options;
  const audioCtx = audioContextProvider();
  if (!audioCtx) return;

  // レジューム処理（これがないと最初の音が鳴らない場合がある）
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = waveType;
  const startTime = audioCtx.currentTime + delay;

  // 周波数の制御
  oscillator.frequency.setValueAtTime(startFreq, startTime);
  if (endFreq && endFreq > 0) {
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
  }

  // エンベロープ（音量減衰）
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // delay中は無音
  gainNode.gain.setValueAtTime(volume, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/**
 * 和音を再生（同時 or アルペジオ）
 */
export function playChord(
  audioContextProvider: () => AudioContext | null,
  frequencies: number[],
  options: ChordOptions,
): void {
  const { arpeggio = 0, ...noteOptions } = options;
  const volumePerNote = (noteOptions.volume ?? 0.1) / frequencies.length;
  frequencies.forEach((freq, index) => {
    playNote(audioContextProvider, {
      ...noteOptions,
      startFreq: freq,
      volume: volumePerNote,
      delay: arpeggio * index,
    });
  });
}
