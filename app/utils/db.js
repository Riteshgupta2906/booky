import { openDB } from 'idb';

const DB_NAME = 'tbr-app-db';
const STORE_NAME = 'app-data';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const get = async (key) => {
  const db = await initDB();
  return db.get(STORE_NAME, key);
};

export const set = async (key, value) => {
  const db = await initDB();
  return db.put(STORE_NAME, value, key);
};

export const del = async (key) => {
  const db = await initDB();
  return db.delete(STORE_NAME, key);
};
