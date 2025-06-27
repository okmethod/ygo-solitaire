import type { MockInstance } from "vitest";

declare global {
  // eslint-disable-next-line no-var
  var localStorageMock: {
    getItem: MockInstance;
    setItem: MockInstance;
    removeItem: MockInstance;
    clear: MockInstance;
    length: number;
    key: MockInstance;
  };
}
