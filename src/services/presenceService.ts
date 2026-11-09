import { AppState } from 'react-native';
import {
  DatabaseReference,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
} from 'firebase/database';
import { requireDatabase } from './firebase';

export function startPresence(uid: string, fail: (error: Error) => void) {
  const db = requireDatabase();
  let stopped = false;
  let connected = false;
  let generation = 0;
  let connection: DatabaseReference | null = null;
  const offline = async () => {
    generation++;
    const old = connection;
    connection = null;
    if (old) {
      await remove(old);
      await onDisconnect(old).cancel();
    }
  };
  const online = async () => {
    if (
      stopped ||
      !connected ||
      AppState.currentState !== 'active' ||
      connection
    ) {
      return;
    }
    const version = ++generation;
    const target = push(ref(db, `users/${uid}/connections`));
    connection = target;
    // Đăng ký onDisconnect TRƯỚC khi ghi online.
    await onDisconnect(target).remove();
    await onDisconnect(ref(db, `users/${uid}/lastOnline`)).set(
      serverTimestamp(),
    );
    if (stopped || version !== generation) {
      await onDisconnect(target).cancel();
      return;
    }
    await set(target, true);
    if (stopped || version !== generation) {
      await remove(target);
    }
  };
  const stop = onValue(
    ref(db, '.info/connected'),
    snapshot => {
      connected = snapshot.val() === true;
      if (!connected) {
        generation++;
        connection = null;
      } else {
        online().catch(fail);
      }
    },
    fail,
  );
  const appState = AppState.addEventListener('change', state => {
    if (state === 'active') {
      online().catch(fail);
    } else {
      offline()
        .then(() => set(ref(db, `users/${uid}/lastOnline`), serverTimestamp()))
        .catch(fail);
    }
  });
  return async () => {
    stopped = true;
    stop();
    appState.remove();
    await offline();
  };
}
