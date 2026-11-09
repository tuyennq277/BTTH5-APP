export type Profile = {
  uid: string;
  fullName: string;
  email: string;
  photoURL?: string;
  connections?: Record<string, boolean>;
  lastOnline?: number;
};
export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
};
export type Chat = {
  id: string;
  members: Record<string, boolean>;
  messages?: Record<string, Omit<Message, 'id'>>;
  readReceipts?: Record<string, string>;
};
export type Conversation = {
  chat: Chat;
  peerId: string;
  last: Message;
  unread: number;
};
