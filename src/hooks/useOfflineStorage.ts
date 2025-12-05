// V3 IndexedDB Storage for Offline Drafts and Cache
import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'remixense-offline-v3';
const DB_VERSION = 1;

interface DraftProject {
  id: string;
  name: string;
  data: unknown;
  updatedAt: Date;
  synced: boolean;
}

interface CachedTrack {
  id: string;
  name: string;
  audioBlob: Blob;
  metadata: {
    bpm?: number;
    key?: string;
    duration?: number;
  };
  cachedAt: Date;
}

export function useOfflineStorage() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      setError('Failed to open offline database');
      console.error('IndexedDB error:', request.error);
    };

    request.onsuccess = () => {
      setDb(request.result);
      setIsReady(true);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Drafts store
      if (!database.objectStoreNames.contains('drafts')) {
        const draftsStore = database.createObjectStore('drafts', { keyPath: 'id' });
        draftsStore.createIndex('synced', 'synced', { unique: false });
        draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Cached tracks store
      if (!database.objectStoreNames.contains('cachedTracks')) {
        const tracksStore = database.createObjectStore('cachedTracks', { keyPath: 'id' });
        tracksStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // Pending uploads store
      if (!database.objectStoreNames.contains('pendingUploads')) {
        const uploadsStore = database.createObjectStore('pendingUploads', { keyPath: 'id' });
        uploadsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Save draft project
  const saveDraft = useCallback(async (draft: Omit<DraftProject, 'updatedAt' | 'synced'>): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readwrite');
      const store = transaction.objectStore('drafts');

      const draftData: DraftProject = {
        ...draft,
        updatedAt: new Date(),
        synced: false
      };

      const request = store.put(draftData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get all drafts
  const getDrafts = useCallback(async (): Promise<DraftProject[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readonly');
      const store = transaction.objectStore('drafts');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get unsynced drafts
  const getUnsyncedDrafts = useCallback(async (): Promise<DraftProject[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readonly');
      const store = transaction.objectStore('drafts');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Delete draft
  const deleteDraft = useCallback(async (id: string): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Cache track for offline playback
  const cacheTrack = useCallback(async (track: Omit<CachedTrack, 'cachedAt'>): Promise<void> => {
    if (!db) throw new Error('Database not ready');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cachedTracks', 'readwrite');
      const store = transaction.objectStore('cachedTracks');

      const trackData: CachedTrack = {
        ...track,
        cachedAt: new Date()
      };

      const request = store.put(trackData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get cached track
  const getCachedTrack = useCallback(async (id: string): Promise<CachedTrack | null> => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cachedTracks', 'readonly');
      const store = transaction.objectStore('cachedTracks');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Clear old cached tracks (older than 7 days)
  const clearOldCache = useCallback(async (): Promise<number> => {
    if (!db) return 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('cachedTracks', 'readwrite');
      const store = transaction.objectStore('cachedTracks');
      const index = store.index('cachedAt');
      const range = IDBKeyRange.upperBound(sevenDaysAgo);

      let deletedCount = 0;
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get storage usage estimate
  const getStorageEstimate = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
      };
    }
    return null;
  }, []);

  return {
    isReady,
    error,
    saveDraft,
    getDrafts,
    getUnsyncedDrafts,
    deleteDraft,
    cacheTrack,
    getCachedTrack,
    clearOldCache,
    getStorageEstimate
  };
}
