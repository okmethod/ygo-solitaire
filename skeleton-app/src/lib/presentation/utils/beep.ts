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

export function playBeep(
  audioContextProvider: () => AudioContext | null,
  waveType: OscillatorType,
  frequency: number,
  duration: number = 0.2,
) {
  const stopBeep = startBeep(audioContextProvider, waveType, frequency);
  setTimeout(() => stopBeep(), duration * 1000);
}
