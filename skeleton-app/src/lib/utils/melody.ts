import { getFrequency } from "$lib/utils/musicalNote";
import { playBeep } from "$lib/utils//beep";

export interface MelodyNote {
  name: string;
  octave: number;
  duration: number;
}

export function playMelody(
  audioContextProvider: () => AudioContext | null,
  waveType: OscillatorType,
  melody: (MelodyNote | null)[],
  tempoBpm: number,
) {
  const beatDurationSec = 60 / tempoBpm; // 1拍の長さ

  melody.forEach((melodyNote, index) => {
    if (!melodyNote) {
      return; // null の場合はスキップ
    }
    const frequency = getFrequency(melodyNote.name, melodyNote.octave);
    const startTime = index * beatDurationSec;
    setTimeout(() => {
      playBeep(audioContextProvider, waveType, frequency, melodyNote.duration * beatDurationSec);
    }, startTime * 1000); // ミリ秒単位に変換
  });
}

export const sampleMelody: { melodyNotes: (MelodyNote | null)[]; defaultTempoBpm: number } = {
  melodyNotes: [
    { name: "ファ#", octave: 4, duration: 1 },
    { name: "ファ", octave: 4, duration: 1 },
    { name: "レ", octave: 4, duration: 1 },
    { name: "ソ#", octave: 3, duration: 1 },
    { name: "レ#", octave: 4, duration: 1 },
    { name: "ソ", octave: 4, duration: 1 },
    { name: "シ", octave: 4, duration: 2 },
    null,
  ],
  defaultTempoBpm: 300,
};
