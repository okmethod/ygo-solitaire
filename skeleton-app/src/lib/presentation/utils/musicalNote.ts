interface MusicalNote {
  name: { ja: string; en: string };
  octave: number;
  frequency: number;
  isSharp: boolean;
}

const baseMusicalNotes: MusicalNote[] = [
  { name: { ja: "ド", en: "C" }, octave: 4, frequency: 261.63, isSharp: false },
  { name: { ja: "ド#", en: "C#" }, octave: 4, frequency: 277.18, isSharp: true },
  { name: { ja: "レ", en: "D" }, octave: 4, frequency: 293.66, isSharp: false },
  { name: { ja: "レ#", en: "D#" }, octave: 4, frequency: 311.13, isSharp: true },
  { name: { ja: "ミ", en: "E" }, octave: 4, frequency: 329.63, isSharp: false },
  { name: { ja: "ファ", en: "F" }, octave: 4, frequency: 349.23, isSharp: false },
  { name: { ja: "ファ#", en: "F#" }, octave: 4, frequency: 369.99, isSharp: true },
  { name: { ja: "ソ", en: "G" }, octave: 4, frequency: 392.0, isSharp: false },
  { name: { ja: "ソ#", en: "G#" }, octave: 4, frequency: 415.3, isSharp: true },
  { name: { ja: "ラ", en: "A" }, octave: 4, frequency: 440.0, isSharp: false },
  { name: { ja: "ラ#", en: "A#" }, octave: 4, frequency: 466.16, isSharp: true },
  { name: { ja: "シ", en: "B" }, octave: 4, frequency: 493.88, isSharp: false },
  { name: { ja: "ド", en: "C" }, octave: 5, frequency: 523.25, isSharp: false },
] as const;

type JaName = (typeof baseMusicalNotes)[number]["name"]["ja"];
type EnName = (typeof baseMusicalNotes)[number]["name"]["en"];

function shiftOctaveFrequency(baseFrequency: number, octaveShift: number): number {
  return baseFrequency * Math.pow(2, octaveShift); // オクターブごとに周波数は 2倍 or 1/2倍 になる
}

export function getFrequency(name: JaName | EnName, octave: number): number {
  const baseNote = baseMusicalNotes
    .filter((note) => note.octave === 4)
    .find((note) => name === note.name.ja || name === note.name.en);
  if (!baseNote) throw new Error(`Note not found: ${name}`);

  const octaveShift = octave - baseNote.octave;
  return shiftOctaveFrequency(baseNote.frequency, octaveShift);
}

export function getNotesWithOctaveShift(octaveShift: number): MusicalNote[] {
  return baseMusicalNotes.map(({ name, octave: baseOctave, frequency, isSharp }) => ({
    name,
    octave: baseOctave + octaveShift,
    frequency: shiftOctaveFrequency(frequency, octaveShift),
    isSharp: isSharp,
  }));
}
