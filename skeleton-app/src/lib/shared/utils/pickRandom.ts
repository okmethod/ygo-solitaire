export function getRandomNumber(length: number): number {
  return Math.floor(Math.random() * length);
}

export function pickRandomNumbers(numbers: number[], count: number): number[] {
  if (numbers.length < count) {
    throw new Error("shortage elements in the array");
  }
  const pickedNumbers: number[] = [];
  const usedIndices: Set<number> = new Set();
  while (pickedNumbers.length < count) {
    const randomIndex = getRandomNumber(numbers.length);
    if (!usedIndices.has(randomIndex)) {
      pickedNumbers.push(numbers[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }
  return pickedNumbers;
}

export function pickRandomElementsFromArray<T>(array: T[], count: number): T[] {
  const allIndices = Array.from({ length: array.length }, (_, i) => i);
  const pickedIndices = pickRandomNumbers(allIndices, count);
  return pickedIndices.map((index) => array[index]);
}

export function pickRandomElementsFromObject<T>(obj: Record<string, T>, count: number): T[] {
  const keys = Object.keys(obj);
  const pickedKeys = pickRandomElementsFromArray(keys, count);
  return pickedKeys.map((key) => obj[key]);
}
