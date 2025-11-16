/**
 * IndexedDB Wrapper for GS4 Trainer
 * Handles persistent storage of character data
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { Character, EnhanciveSet } from '../types';

// Database schema
interface GS4TrainerDB {
  characters: {
    key: string; // character.id
    value: Character;
    indexes: {
      'by-name': string;
      'by-profession': string;
      'by-updated': Date;
    };
  };
  enhanciveSets: {
    key: string; // set.id
    value: EnhanciveSet;
    indexes: {
      'by-name': string;
    };
  };
  settings: {
    key: string; // setting name
    value: any;
  };
}

const DB_NAME = 'gs4-trainer';
const DB_VERSION = 1;

class Database {
  private db: IDBPDatabase<GS4TrainerDB> | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    this.db = await openDB<GS4TrainerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Characters store
        if (!db.objectStoreNames.contains('characters')) {
          const characterStore = db.createObjectStore('characters', {
            keyPath: 'id',
          });
          characterStore.createIndex('by-name', 'name');
          characterStore.createIndex('by-profession', 'profession');
          characterStore.createIndex('by-updated', 'updatedAt');
        }

        // Enhancive Sets store
        if (!db.objectStoreNames.contains('enhanciveSets')) {
          const setStore = db.createObjectStore('enhanciveSets', {
            keyPath: 'id',
          });
          setStore.createIndex('by-name', 'name');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBPDatabase<GS4TrainerDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // =========================================================================
  // CHARACTER OPERATIONS
  // =========================================================================

  /**
   * Save a character
   */
  async saveCharacter(character: Character): Promise<void> {
    const db = await this.ensureDB();
    // Note: updatedAt should be set by the caller before calling this function
    await db.put('characters', character);
  }

  /**
   * Get a character by ID
   */
  async getCharacter(id: string): Promise<Character | undefined> {
    const db = await this.ensureDB();
    return await db.get('characters', id);
  }

  /**
   * Get all characters
   */
  async getAllCharacters(): Promise<Character[]> {
    const db = await this.ensureDB();
    return await db.getAll('characters');
  }

  /**
   * Delete a character
   */
  async deleteCharacter(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('characters', id);
  }

  /**
   * Get characters by profession
   */
  async getCharactersByProfession(profession: string): Promise<Character[]> {
    const db = await this.ensureDB();
    return await db.getAllFromIndex('characters', 'by-profession', profession);
  }

  /**
   * Search characters by name
   */
  async searchCharactersByName(query: string): Promise<Character[]> {
    const db = await this.ensureDB();
    const all = await db.getAll('characters');
    const lowerQuery = query.toLowerCase();
    return all.filter((char) =>
      char.name.toLowerCase().includes(lowerQuery)
    );
  }

  // =========================================================================
  // ENHANCIVE SET OPERATIONS
  // =========================================================================

  /**
   * Save an enhancive set
   */
  async saveEnhanciveSet(set: EnhanciveSet): Promise<void> {
    const db = await this.ensureDB();
    await db.put('enhanciveSets', set);
  }

  /**
   * Get an enhancive set by ID
   */
  async getEnhanciveSet(id: string): Promise<EnhanciveSet | undefined> {
    const db = await this.ensureDB();
    return await db.get('enhanciveSets', id);
  }

  /**
   * Get all enhancive sets
   */
  async getAllEnhanciveSets(): Promise<EnhanciveSet[]> {
    const db = await this.ensureDB();
    return await db.getAll('enhanciveSets');
  }

  /**
   * Delete an enhancive set
   */
  async deleteEnhanciveSet(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('enhanciveSets', id);
  }

  // =========================================================================
  // SETTINGS OPERATIONS
  // =========================================================================

  /**
   * Save a setting
   */
  async saveSetting(key: string, value: any): Promise<void> {
    const db = await this.ensureDB();
    await db.put('settings', value, key);
  }

  /**
   * Get a setting
   */
  async getSetting<T = any>(key: string): Promise<T | undefined> {
    const db = await this.ensureDB();
    return await db.get('settings', key);
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('settings', key);
  }

  // =========================================================================
  // BULK OPERATIONS
  // =========================================================================

  /**
   * Export all data
   */
  async exportAll(): Promise<{
    characters: Character[];
    enhanciveSets: EnhanciveSet[];
    settings: Record<string, any>;
  }> {
    const db = await this.ensureDB();

    const characters = await db.getAll('characters');
    const enhanciveSets = await db.getAll('enhanciveSets');

    // Get all settings
    const settingsKeys = await db.getAllKeys('settings');
    const settings: Record<string, any> = {};
    for (const key of settingsKeys) {
      settings[String(key)] = await db.get('settings', key);
    }

    return {
      characters,
      enhanciveSets,
      settings,
    };
  }

  /**
   * Import all data
   */
  async importAll(data: {
    characters?: Character[];
    enhanciveSets?: EnhanciveSet[];
    settings?: Record<string, any>;
  }): Promise<void> {
    const db = await this.ensureDB();

    // Import characters
    if (data.characters) {
      const tx = db.transaction('characters', 'readwrite');
      for (const character of data.characters) {
        await tx.store.put(character);
      }
      await tx.done;
    }

    // Import enhancive sets
    if (data.enhanciveSets) {
      const tx = db.transaction('enhanciveSets', 'readwrite');
      for (const set of data.enhanciveSets) {
        await tx.store.put(set);
      }
      await tx.done;
    }

    // Import settings
    if (data.settings) {
      const tx = db.transaction('settings', 'readwrite');
      for (const [key, value] of Object.entries(data.settings)) {
        await tx.store.put(value, key);
      }
      await tx.done;
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    await db.clear('characters');
    await db.clear('enhanciveSets');
    await db.clear('settings');
  }
}

// Singleton instance
export const db = new Database();

// Initialize database on module load
db.init().catch((error) => {
  console.error('Failed to initialize database:', error);
});
