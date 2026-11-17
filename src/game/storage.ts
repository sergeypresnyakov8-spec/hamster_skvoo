import { createInitialGameState } from './catalog';
import { normalizeGameState } from './engine';
import { GameState } from './types';

const DB_NAME = 'zvezdniy_korol_db';
const STORE_NAME = 'saves';
const SAVE_KEY = 'primary_save_v2';
const LEGACY_SAVE_KEY = 'primary_save';
const LOCAL_BACKUP_KEY = 'zk_backup_save_v2';
const LEGACY_LOCAL_BACKUP_KEY = 'zk_backup_save_v1';

let pendingState: GameState | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function writeImmediately(state: GameState): Promise<void> {
  const stamped: GameState = { ...state, lastSavedAt: Date.now() };
  try {
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(stamped));
  } catch {
    // ignore quota errors on mirror
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(stamped, SAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // localStorage mirror already saved
  }
}

export function saveGameState(state: GameState): void {
  pendingState = state;
  try {
    // Keep synchronous localStorage mirror up-to-date in case Android kills the WebView mid-session
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() }));
  } catch {
    // ignore quota errors
  }

  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    if (pendingState) {
      const toFlush = pendingState;
      pendingState = null;
      void writeImmediately(toFlush);
    }
  }, 1500);
}

export async function flushGameState(state?: GameState): Promise<void> {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const target = state ?? pendingState;
  pendingState = null;
  if (target) {
    await writeImmediately(target);
  }
}

export async function loadGameState(): Promise<GameState> {
  let fromIdb: GameState | null = null;
  try {
    const db = await openDB();
    fromIdb = await new Promise<GameState | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(SAVE_KEY);
      req.onsuccess = () => resolve((req.result as GameState) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    fromIdb = null;
  }

  let fromLs: GameState | null = null;
  try {
    const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (raw) fromLs = JSON.parse(raw) as GameState;
  } catch {
    fromLs = null;
  }

  const chosen =
    fromIdb && fromLs
      ? (fromIdb.lastSavedAt ?? 0) >= (fromLs.lastSavedAt ?? 0)
        ? fromIdb
        : fromLs
      : fromIdb ?? fromLs;

  if (!chosen) {
    return createInitialGameState();
  }
  return normalizeGameState(chosen);
}

export async function clearAllSaves(): Promise<GameState> {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  pendingState = null;

  try {
    localStorage.removeItem(LEGACY_LOCAL_BACKUP_KEY);
    localStorage.removeItem(LOCAL_BACKUP_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(LEGACY_SAVE_KEY);
      store.delete(SAVE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // ignore
  }

  const fresh = createInitialGameState();
  await writeImmediately(fresh);
  return fresh;
}
