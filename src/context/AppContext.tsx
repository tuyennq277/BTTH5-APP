import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { ensureProfile, errorMessage, logout } from '../services/authService';
import { watchConversations, watchUsers } from '../services/chatService';
import { startPresence } from '../services/presenceService';
import { Conversation, Profile } from '../types';

type State = {
  user: User | null;
  loading: boolean;
  usersLoading: boolean;
  chatsLoading: boolean;
  users: Profile[];
  conversations: Conversation[];
  error: string;
  signOut: () => Promise<void>;
  retry: () => void;
};
const Context = createContext<State | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [users, setUsers] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const stopPresence = useRef<null | (() => Promise<void>)>(null);
  useEffect(() => {
    if (!auth) {
      return;
    }
    return onAuthStateChanged(auth, value => {
      setUser(value);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    setUsers([]);
    setConversations([]);
    setError('');
    if (!user) {
      return;
    }
    let cancelled = false;
    let stopUsers = () => {};
    let stopChats = () => {};
    setUsersLoading(true);
    setChatsLoading(true);
    const fail = (cause: Error) => {
      if (!cancelled) {
        setError(errorMessage(cause));
        setUsersLoading(false);
        setChatsLoading(false);
      }
    };
    ensureProfile(user)
      .then(() => {
        if (cancelled) {
          return;
        }
        stopUsers = watchUsers(value => {
          setUsers(value);
          setUsersLoading(false);
        }, fail);
        stopChats = watchConversations(
          user.uid,
          value => {
            setConversations(value);
            setChatsLoading(false);
          },
          fail,
        );
        stopPresence.current = startPresence(user.uid, fail);
      })
      .catch(fail);
    return () => {
      cancelled = true;
      stopUsers();
      stopChats();
      const stop = stopPresence.current;
      stopPresence.current = null;
      stop?.().catch(() => {});
    };
  }, [user, attempt]);
  const signOut = async () => {
    // Xóa connection khi vẫn còn quyền auth, sau đó mới đăng xuất.
    await stopPresence.current?.();
    stopPresence.current = null;
    await logout();
  };
  return (
    <Context.Provider
      value={{
        user,
        loading,
        usersLoading,
        chatsLoading,
        users,
        conversations,
        error,
        signOut,
        retry: () => setAttempt(value => value + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const value = useContext(Context);
  if (!value) {
    throw new Error('Missing AppProvider');
  }
  return value;
}
