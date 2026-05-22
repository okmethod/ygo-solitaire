import type { MockInstance } from "vitest";

declare global {
  var localStorageMock: {
    getItem: MockInstance;
    setItem: MockInstance;
    removeItem: MockInstance;
    clear: MockInstance;
    length: number;
    key: MockInstance;
  };
}
