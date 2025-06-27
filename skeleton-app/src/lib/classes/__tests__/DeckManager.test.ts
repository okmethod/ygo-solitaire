import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeckManager } from '../DeckManager';
import { DeckRecipe } from '../DeckRecipe';
import type { Card } from '$lib/types/card';

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// グローバルlocalStorageをモック
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DeckManager', () => {
  let sampleCard: Card;
  let testDeck: DeckRecipe;

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();
    
    sampleCard = {
      id: 'test-001',
      name: 'テストカード',
      type: 'monster',
      attack: 1000,
      defense: 800,
      level: 4,
      restriction: 'unlimited'
    };

    testDeck = new DeckRecipe({ name: 'テストデッキ' });
    testDeck.addCard(sampleCard, 'main');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createDeck', () => {
    it('should create a new deck with default name', () => {
      const deck = DeckManager.createDeck();
      expect(deck).toBeInstanceOf(DeckRecipe);
      expect(deck.name).toBe('新しいデッキ');
      expect(deck.mainDeck).toEqual([]);
      expect(deck.extraDeck).toEqual([]);
    });

    it('should create a new deck with custom name', () => {
      const deck = DeckManager.createDeck('カスタムデッキ');
      expect(deck.name).toBe('カスタムデッキ');
    });
  });

  describe('saveDeck', () => {
    it('should save a new deck', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = DeckManager.saveDeck(testDeck);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ygo_deck_recipes',
        expect.stringContaining('テストデッキ')
      );
    });

    it('should update existing deck', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      testDeck.name = 'テストデッキ';
      testDeck.description = '更新されたデッキ';
      
      const result = DeckManager.saveDeck(testDeck);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle save errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = DeckManager.saveDeck(testDeck);
      expect(result).toBe(false);
    });
  });

  describe('loadDeck', () => {
    it('should load existing deck', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const loadedDeck = DeckManager.loadDeck('テストデッキ');
      
      expect(loadedDeck).toBeInstanceOf(DeckRecipe);
      expect(loadedDeck?.name).toBe('テストデッキ');
    });

    it('should return null for non-existent deck', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      const loadedDeck = DeckManager.loadDeck('存在しないデッキ');
      expect(loadedDeck).toBeNull();
    });

    it('should handle load errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const loadedDeck = DeckManager.loadDeck('テストデッキ');
      expect(loadedDeck).toBeNull();
    });
  });

  describe('deleteDeck', () => {
    it('should delete existing deck', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const result = DeckManager.deleteDeck('テストデッキ');
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ygo_deck_recipes',
        JSON.stringify([])
      );
    });

    it('should return false for non-existent deck', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      const result = DeckManager.deleteDeck('存在しないデッキ');
      expect(result).toBe(false);
    });
  });

  describe('listDecks', () => {
    it('should return empty array when no decks exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const decks = DeckManager.listDecks();
      expect(decks).toEqual([]);
    });

    it('should return list of decks', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const decks = DeckManager.listDecks();
      expect(decks).toHaveLength(1);
      expect(decks[0]).toBeInstanceOf(DeckRecipe);
      expect(decks[0].name).toBe('テストデッキ');
    });

    it('should handle list errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const decks = DeckManager.listDecks();
      expect(decks).toEqual([]);
    });
  });

  describe('deckExists', () => {
    it('should return true for existing deck', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const exists = DeckManager.deckExists('テストデッキ');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent deck', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      const exists = DeckManager.deckExists('存在しないデッキ');
      expect(exists).toBe(false);
    });
  });

  describe('getUniqueDeckName', () => {
    it('should return original name if unique', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      const uniqueName = DeckManager.getUniqueDeckName('新しいデッキ');
      expect(uniqueName).toBe('新しいデッキ');
    });

    it('should return modified name if original exists', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const uniqueName = DeckManager.getUniqueDeckName('テストデッキ');
      expect(uniqueName).toBe('テストデッキ (1)');
    });

    it('should handle multiple duplicates', () => {
      const deck1 = new DeckRecipe({ name: 'デッキ' });
      const deck2 = new DeckRecipe({ name: 'デッキ (1)' });
      const existingDecks = [deck1.toJSON(), deck2.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const uniqueName = DeckManager.getUniqueDeckName('デッキ');
      expect(uniqueName).toBe('デッキ (2)');
    });
  });

  describe('getTemplates', () => {
    it('should return default templates when none exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const templates = DeckManager.getTemplates();
      expect(templates).toHaveLength(2); // デフォルトテンプレート数
      expect(templates[0].isOfficial).toBe(true);
    });
  });

  describe('createFromTemplate', () => {
    it('should create deck from template', () => {
      localStorageMock.getItem.mockReturnValue(null); // デフォルトテンプレートを使用
      
      const deck = DeckManager.createFromTemplate('sample-beatdown');
      expect(deck).toBeInstanceOf(DeckRecipe);
      expect(deck?.name).toBe('サンプルビートダウン');
    });

    it('should return null for non-existent template', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      const deck = DeckManager.createFromTemplate('non-existent');
      expect(deck).toBeNull();
    });
  });

  describe('exportDeck', () => {
    it('should export deck as JSON string', () => {
      const exported = DeckManager.exportDeck(testDeck);
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.name).toBe('テストデッキ');
    });
  });

  describe('importDeck', () => {
    it('should import deck from JSON string', () => {
      const exported = testDeck.toJSON();
      
      const imported = DeckManager.importDeck(exported);
      expect(imported).toBeInstanceOf(DeckRecipe);
      expect(imported?.name).toBe('テストデッキ');
    });

    it('should handle invalid JSON', () => {
      const imported = DeckManager.importDeck('invalid json');
      expect(imported).toBeNull();
    });

    it('should make imported deck name unique', () => {
      const existingDecks = [testDeck.toJSON()];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingDecks));
      
      const exported = testDeck.toJSON();
      const imported = DeckManager.importDeck(exported);
      
      expect(imported?.name).toBe('テストデッキ (1)');
    });
  });

  describe('clearAllData', () => {
    it('should clear all data', () => {
      const result = DeckManager.clearAllData();
      
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ygo_deck_recipes');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ygo_deck_templates');
    });
  });
});