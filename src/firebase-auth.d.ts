import 'firebase/auth';
import type AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persistence } from 'firebase/auth';
// Firebase cung cấp hàm này trong entry React Native; public typings bỏ sót export.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: typeof AsyncStorage,
  ): Persistence;
}
