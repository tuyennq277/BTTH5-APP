import { readFileSync } from 'node:fs';
import { test, before, after } from 'node:test';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import {
  ref,
  set,
  get,
  update,
  push,
  serverTimestamp,
  runTransaction,
} from 'firebase/database';
let env;
let alice;
let bob;
let outsider;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-btth5',
    database: {
      host: '127.0.0.1',
      port: 9000,
      rules: readFileSync('database.rules.json', 'utf8').replace(/^\uFEFF/, ''),
    },
  });
  alice = env
    .authenticatedContext('alice', { email: 'alice@example.test' })
    .database();
  bob = env
    .authenticatedContext('bob', { email: 'bob@example.test' })
    .database();
  outsider = env
    .authenticatedContext('outsider', { email: 'outsider@example.test' })
    .database();
  await env.clearDatabase();
});
after(async () => {
  await env?.cleanup();
});
test('profiles, presence, private chat, atomic indexes and unread receipts', async () => {
  for (const [db, uid] of [
    [alice, 'alice'],
    [bob, 'bob'],
    [outsider, 'outsider'],
  ]) {
    await assertSucceeds(
      set(ref(db, `users/${uid}`), {
        uid,
        fullName: uid,
        email: `${uid}@example.test`,
        createdAt: serverTimestamp(),
      }),
    );
  }
  await assertFails(get(ref(env.unauthenticatedContext().database(), 'users')));
  await assertFails(update(ref(bob, 'users/alice'), { fullName: 'spoofed' }));
  await assertSucceeds(
    set(ref(alice, 'users/alice/connections/device1'), true),
  );
  await assertSucceeds(
    set(ref(alice, 'users/alice/connections/device1'), null),
  );
  await assertSucceeds(
    set(ref(alice, 'chats/ab'), {
      user1: 'alice',
      user2: 'bob',
      members: { alice: true, bob: true },
    }),
  );
  await assertFails(
    set(ref(outsider, 'chats/invalid'), {
      user1: 'outsider',
      user2: 'nobody',
      members: { outsider: true, nobody: true },
    }),
  );
  await assertSucceeds(
    runTransaction(ref(bob, 'chats/ab'), current =>
      current
        ? undefined
        : { user1: 'alice', user2: 'bob', members: { alice: true, bob: true } },
    ),
  );
  await assertSucceeds(
    update(ref(alice), {
      'userChats/alice/ab': true,
      'userChats/bob/ab': true,
    }),
  );
  await assertFails(get(ref(outsider, 'chats/ab')));
  await assertFails(get(ref(bob, 'userChats/alice')));
  await assertFails(set(ref(outsider, 'userChats/outsider/ab'), true));
  await assertFails(set(ref(alice, 'chats/ab/members/outsider'), true));
  await assertFails(set(ref(alice, 'chats/ab/members/bob'), null));
  const message = push(ref(alice, 'chats/ab/messages'));
  await assertSucceeds(
    set(message, {
      senderId: 'alice',
      text: 'Xin chào\nBạn khỏe không?',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(update(message, { text: 'edited' }));
  await assertFails(
    set(ref(alice, 'chats/ab/messages/spoof'), {
      senderId: 'bob',
      text: 'spoof',
      createdAt: serverTimestamp(),
    }),
  );
  await assertFails(
    set(ref(alice, 'chats/ab/messages/empty'), {
      senderId: 'alice',
      text: '   \n ',
      createdAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(set(ref(bob, 'chats/ab/readReceipts/bob'), message.key));
  await assertFails(set(ref(alice, 'chats/ab/readReceipts/bob'), message.key));
  await assertFails(set(ref(bob, 'chats/ab/readReceipts/bob'), 'missing'));
  await assertSucceeds(get(ref(bob, 'chats/ab/messages')));
});
