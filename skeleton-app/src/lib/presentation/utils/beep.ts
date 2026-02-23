export const waveTypes: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];

export const labelTypes = ["none", "ja", "en"] as const;
export type LabelType = (typeof labelTypes)[number];

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

/** playBeep用のオプション */
export interface BeepOptions {
  waveType: OscillatorType;
  startFreq: number;
  duration: number; // 秒単位
}

export function playBeep(audioContextProvider: () => AudioContext | null, options: BeepOptions) {
  const { waveType, startFreq, duration } = options;
  const stopBeep = startBeep(audioContextProvider, waveType, startFreq);
  setTimeout(() => stopBeep(), duration * 1000);
}

/** playNote用の拡張オプション */
export interface NoteOptions extends BeepOptions {
  endFreq?: number; // 周波数を変化させる場合の終了周波数
  volume?: number; // 0.0 ~ 1.0（デフォルト: 0.1）
  delay?: number; // 再生開始までの遅延（秒単位、デフォルト: 0）
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

/** playChord用のオプション */
export interface ChordOptions extends Omit<NoteOptions, "startFreq" | "delay"> {
  arpeggio?: number; // 各音間の遅延（秒単位）。0または未指定で同時再生
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
