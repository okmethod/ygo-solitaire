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
}
/**
 * 高機能な音再生関数
 * - エンベロープ（余韻）付き
 * - 周波数変化対応
 */
export function playNote(audioContextProvider: () => AudioContext | null, options: NoteOptions): void {
  const { waveType, startFreq, endFreq, duration, volume = 0.1 } = options;
  const audioCtx = audioContextProvider();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = waveType;
  const now = audioCtx.currentTime;

  // 周波数の制御
  oscillator.frequency.setValueAtTime(startFreq, now);
  if (endFreq && endFreq > 0) {
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  }

  // エンベロープ（音量減衰）
  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * 和音を再生（複数の音を同時に鳴らす）
 */
export function playChord(
  audioContextProvider: () => AudioContext | null,
  frequencies: number[],
  options: Omit<NoteOptions, "startFreq">,
): void {
  const volumePerNote = (options.volume ?? 0.1) / frequencies.length;
  frequencies.forEach((freq) => {
    playNote(audioContextProvider, {
      ...options,
      startFreq: freq,
      volume: volumePerNote,
    });
  });
}
