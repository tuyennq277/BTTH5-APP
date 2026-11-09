import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig';

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL,
);
// Chỉ khởi tạo khi có cấu hình thật, tránh lỗi auth/invalid-api-key lúc mở app.
const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;
export const auth = app
  ? (() => {
      try {
        return initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (error) {
        if ((error as { code?: string }).code !== 'auth/already-initialized') {
          throw error;
        }
        return getAuth(app);
      }
    })()
  : null;
export const database = app ? getDatabase(app) : null;
export function requireAuth() {
  if (!auth) {
    throw new Error('Vui lòng cấu hình Firebase trước khi sử dụng.');
  }
  return auth;
}
export function requireDatabase() {
  if (!database) {
    throw new Error('Vui lòng cấu hình Firebase trước khi sử dụng.');
  }
  return database;
}
