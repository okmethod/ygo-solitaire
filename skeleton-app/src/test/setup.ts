import { vi } from "vitest";
import { initializeCardDataRegistry, initializeTestCardData } from "$lib/domain/CardDataRegistry";

// カードデータレジストリを初期化（テストデータを含む）
initializeCardDataRegistry();
initializeTestCardData();

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// グローバルにlocalStorageMockを公開
global.localStorageMock = localStorageMock;
