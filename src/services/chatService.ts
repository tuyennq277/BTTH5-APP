import {
  get,
  onValue,
  push,
  ref,
  runTransaction,
  serverTimestamp,
  update,
} from 'firebase/database';
import { Chat, Conversation, Message, Profile } from '../types';
import { requireDatabase } from './firebase';

export function chatIdFor(first: string, second: string) {
  return [first, second]
    .sort()
    .map(uid => `${uid.length}_${uid}`)
    .join('');
}
export function messagesOf(chat: Chat): Message[] {
  return Object.entries(chat.messages || {})
    .map(([id, value]) => ({ ...value, id }))
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}
export function conversationOf(chat: Chat, uid: string): Conversation | null {
  const messages = messagesOf(chat);
  if (!messages.length) {
    return null;
  }
  const readId = chat.readReceipts?.[uid];
  const readIndex = readId
    ? messages.findIndex(message => message.id === readId)
    : -1;
  return {
    chat,
    peerId: Object.keys(chat.members).find(id => id !== uid)!,
    last: messages[messages.length - 1],
    unread: messages
      .slice(readIndex + 1)
      .filter(message => message.senderId !== uid).length,
  };
}
export function watchUsers(
  next: (users: Profile[]) => void,
  fail: (error: Error) => void,
) {
  return onValue(
    ref(requireDatabase(), 'users'),
    snapshot => {
      next(
        Object.entries(snapshot.val() || {}).map(([uid, value]) => ({
          ...(value as Profile),
          uid,
        })),
      );
    },
    fail,
  );
}
export function watchChat(
  chatId: string,
  next: (chat: Chat | null) => void,
  fail: (error: Error) => void,
) {
  return onValue(
    ref(requireDatabase(), `chats/${chatId}`),
    snapshot =>
      next(snapshot.exists() ? { ...snapshot.val(), id: chatId } : null),
    fail,
  );
}
export async function openChat(uid: string, peerId: string) {
  const db = requireDatabase();
  const id = chatIdFor(uid, peerId);
  const target = ref(db, `chats/${id}`);
  // Giao dịch tránh ghi đè nếu cả hai người cùng mở cuộc trò chuyện lần đầu.
  await runTransaction(target, current =>
    current
      ? undefined
      : {
          user1: [uid, peerId].sort()[0],
          user2: [uid, peerId].sort()[1],
          members: { [uid]: true, [peerId]: true },
        },
  );
  await update(ref(db), {
    [`userChats/${uid}/${id}`]: true,
    [`userChats/${peerId}/${id}`]: true,
  });
  return id;
}
export async function sendMessage(chatId: string, uid: string, text: string) {
  const clean = text.trim();
  if (!clean) {
    throw new Error('Không thể gửi tin nhắn rỗng.');
  }
  if (clean.length > 4000) {
    throw new Error('Tin nhắn tối đa 4.000 ký tự.');
  }
  await update(push(ref(requireDatabase(), `chats/${chatId}/messages`)), {
    senderId: uid,
    text: clean,
    createdAt: serverTimestamp(),
  });
}
export async function markRead(chatId: string, uid: string, messageId: string) {
  const db = requireDatabase();
  // Không đưa mốc đọc lùi lại khi hai thiết bị mở cùng một tài khoản.
  const snapshot = await get(ref(db, `chats/${chatId}/messages`));
  const ids = messagesOf({
    id: chatId,
    members: {},
    messages: snapshot.val() || {},
  }).map(message => message.id);
  await runTransaction(
    ref(db, `chats/${chatId}/readReceipts/${uid}`),
    current =>
      ids.indexOf(messageId) > ids.indexOf(current) ? messageId : current,
  );
}
export function watchConversations(
  uid: string,
  next: (items: Conversation[]) => void,
  fail: (error: Error) => void,
) {
  const subscriptions = new Map<string, () => void>();
  const chats = new Map<string, Chat>();
  const emit = () =>
    next(
      Array.from(chats.values())
        .map(chat => conversationOf(chat, uid))
        .filter((item): item is Conversation => item !== null)
        .sort(
          (a, b) =>
            b.last.createdAt - a.last.createdAt ||
            b.last.id.localeCompare(a.last.id),
        ),
    );
  const stop = onValue(
    ref(requireDatabase(), `userChats/${uid}`),
    snapshot => {
      const ids = new Set(Object.keys(snapshot.val() || {}));
      subscriptions.forEach((unsubscribe, id) => {
        if (!ids.has(id)) {
          unsubscribe();
          subscriptions.delete(id);
          chats.delete(id);
        }
      });
      ids.forEach(id => {
        if (!subscriptions.has(id)) {
          subscriptions.set(
            id,
            watchChat(
              id,
              chat => {
                if (chat) {
                  chats.set(id, chat);
                } else {
                  chats.delete(id);
                }
                emit();
              },
              fail,
            ),
          );
        }
      });
      emit();
    },
    fail,
  );
  return () => {
    stop();
    subscriptions.forEach(unsubscribe => unsubscribe());
    subscriptions.clear();
  };
}
