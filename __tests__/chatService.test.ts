import {
  chatIdFor,
  conversationOf,
  messagesOf,
} from '../src/services/chatService';
import type { Chat } from '../src/types';
jest.mock('../src/services/firebase', () => ({ requireDatabase: jest.fn() }));
jest.mock('firebase/database', () => ({}));
const chat: Chat = {
  id: 'ab',
  members: { alice: true, bob: true },
  messages: {
    third: { senderId: 'bob', text: '3', createdAt: 300 },
    first: { senderId: 'bob', text: '1', createdAt: 100 },
    second: { senderId: 'alice', text: '2', createdAt: 200 },
  },
};
test('both directions resolve to the same unique chat', () => {
  expect(chatIdFor('alice', 'bob')).toBe(chatIdFor('bob', 'alice'));
  expect(chatIdFor('a_b', 'c')).not.toBe(chatIdFor('a', 'b_c'));
});
test('orders snapshots and counts only incoming unread messages', () => {
  expect(messagesOf(chat).map(message => message.text)).toEqual([
    '1',
    '2',
    '3',
  ]);
  expect(conversationOf(chat, 'alice')?.unread).toBe(2);
  expect(
    conversationOf({ ...chat, readReceipts: { alice: 'second' } }, 'alice')
      ?.unread,
  ).toBe(1);
  expect(
    conversationOf({ ...chat, readReceipts: { alice: 'third' } }, 'alice')
      ?.unread,
  ).toBe(0);
  expect(conversationOf(chat, 'bob')?.unread).toBe(1);
});
test('hides a conversation until the first message', () => {
  expect(
    conversationOf({ id: 'ab', members: { alice: true, bob: true } }, 'alice'),
  ).toBeNull();
});
