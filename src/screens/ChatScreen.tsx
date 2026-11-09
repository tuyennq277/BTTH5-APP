import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  colors,
  Empty,
  ErrorBanner,
  online,
  s,
  time,
} from '../components/UI';
import { useApp } from '../context/AppContext';
import {
  markRead,
  messagesOf,
  sendMessage,
  watchChat,
} from '../services/chatService';
import { errorMessage } from '../services/authService';
import { RootStackParams } from '../navigation/types';
import { Message } from '../types';

export default function ChatScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Chat'>) {
  const { chatId, peerId } = route.params;
  const { user, users } = useApp();
  const peer = users.find(person => person.uid === peerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);
  const focused = useIsFocused();
  const list = useRef<FlatList<Message>>(null);
  const readId = useRef('');
  const insets = useSafeAreaInsets();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.header}>
          <Avatar user={peer} size={37} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>
              {peer?.fullName || 'Người dùng'}
            </Text>
            <Text style={[styles.status, online(peer) && styles.online]}>
              {online(peer) ? '● Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>
      ),
    });
  }, [navigation, peer]);
  useEffect(() => {
    setLoading(true);
    readId.current = '';
    return watchChat(
      chatId,
      chat => {
        setMessages(chat ? messagesOf(chat) : []);
        setLoading(false);
      },
      cause => {
        setError(errorMessage(cause));
        setLoading(false);
      },
    );
  }, [chatId]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (
      !user ||
      !focused ||
      appState !== 'active' ||
      !last ||
      readId.current === last.id
    ) {
      return;
    }
    readId.current = last.id;
    markRead(chatId, user.uid, last.id).catch(cause => {
      readId.current = '';
      setError(errorMessage(cause));
    });
  }, [messages, chatId, user, focused, appState]);
  const send = async () => {
    if (!draft.trim() || sending || !user) {
      return;
    }
    setSending(true);
    setError('');
    try {
      await sendMessage(chatId, user.uid, draft);
      setDraft('');
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSending(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.date}>
        <Text style={styles.dateText}>CUỘC TRÒ CHUYỆN CỦA BẠN</Text>
      </View>
      <View style={styles.error}>
        <ErrorBanner message={error} />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            list.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => list.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Empty
              symbol="✧"
              title="Gửi lời chào đầu tiên"
              detail={`Bắt đầu trò chuyện với ${
                peer?.fullName || 'người bạn này'
              }.`}
            />
          }
          renderItem={({ item, index }) => {
            const mine = item.senderId === user?.uid;
            const showDate =
              index === 0 ||
              new Date(messages[index - 1].createdAt).toDateString() !==
                new Date(item.createdAt).toDateString();
            return (
              <View>
                {showDate && (
                  <Text style={styles.day}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                )}
                <View style={[styles.messageRow, mine && styles.mineRow]}>
                  {!mine && <Avatar user={peer} size={27} presence={false} />}
                  <View
                    style={[styles.bubble, mine ? styles.mine : styles.theirs]}
                  >
                    <Text
                      selectable
                      style={[styles.messageText, mine && styles.mineText]}
                    >
                      {item.text}
                    </Text>
                    <Text style={[styles.time, mine && styles.mineTime]}>
                      {time(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TextInput
          accessibilityLabel="Nội dung tin nhắn"
          style={styles.input}
          placeholder="Nhắn một lời dễ thương..."
          placeholderTextColor={colors.muted}
          multiline
          maxLength={4000}
          value={draft}
          onChangeText={setDraft}
          editable={!sending}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gửi tin nhắn"
          disabled={!draft.trim() || sending}
          style={[styles.send, (!draft.trim() || sending) && s.disabled]}
          onPress={send}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>↑</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: 10 },
  headerName: { fontSize: 15, color: colors.ink, fontWeight: '700' },
  status: { fontSize: 10, color: colors.muted, marginTop: 3 },
  online: { color: colors.green },
  date: { alignItems: 'center', marginTop: 22, marginBottom: 6 },
  dateText: { fontSize: 9, color: colors.muted, letterSpacing: 1.5 },
  error: { paddingHorizontal: 18 },
  loader: { flex: 1 },
  messages: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  day: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 10,
    marginVertical: 22,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 8,
  },
  mineRow: { justifyContent: 'flex-end' },
  bubble: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
    maxWidth: '79%',
    borderRadius: 19,
    minWidth: 75,
  },
  mine: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  theirs: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: colors.line,
  },
  messageText: { fontSize: 15, lineHeight: 23, color: colors.ink },
  mineText: { color: '#fff' },
  time: { fontSize: 9, color: colors.muted, marginTop: 6, textAlign: 'right' },
  mineTime: { color: '#DCE1FF' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 14,
    color: colors.ink,
    maxHeight: 125,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 27 },
});
