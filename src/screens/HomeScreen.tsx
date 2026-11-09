import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Avatar,
  chatTime,
  colors,
  Empty,
  ErrorBanner,
  s,
} from '../components/UI';
import { useApp } from '../context/AppContext';
import { RootStackParams, TabParams } from '../navigation/types';
export default function HomeScreen() {
  const { user, users, conversations, chatsLoading, error, retry } = useApp();
  const root = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const tabs = useNavigation<BottomTabNavigationProp<TabParams>>();
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);
  return (
    <View style={[s.page, s.content]}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.greeting}>
            CHÀO BẠN,{' '}
            {(
              (user?.displayName || 'BẠN').split(' ').pop() || ''
            ).toUpperCase()}{' '}
            👋
          </Text>
          <Text style={s.title}>
            Tin nhắn<Text style={styles.dot}>.</Text>
          </Text>
        </View>
        <Avatar
          user={users.find(item => item.uid === user?.uid)}
          size={44}
          presence={false}
        />
      </View>
      <View style={styles.note}>
        <View style={styles.noteIcon}>
          <Text style={styles.noteSymbol}>✦</Text>
        </View>
        <View style={styles.noteBody}>
          <Text style={styles.noteTitle}>Một lời chào, thêm gần nhau.</Text>
          <Text style={styles.noteDetail}>
            {unread
              ? `Bạn có ${unread} tin nhắn chưa đọc`
              : 'Bắt đầu câu chuyện của bạn hôm nay'}
          </Text>
        </View>
      </View>
      <View style={styles.sectionRow}>
        <Text style={s.section}>CUỘC TRÒ CHUYỆN</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => tabs.navigate('Contacts')}
        >
          <Text style={styles.newChat}>＋ Chat mới</Text>
        </Pressable>
      </View>
      <ErrorBanner message={error} retry={retry} />
      {chatsLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.chat.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Empty
              symbol="☏"
              title="Câu chuyện bắt đầu từ bạn"
              detail="Mở Danh bạ và chọn một người để gửi lời chào đầu tiên."
            />
          }
          renderItem={({ item }) => {
            const peer = users.find(person => person.uid === item.peerId);
            return (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  root.navigate('Chat', {
                    chatId: item.chat.id,
                    peerId: item.peerId,
                  })
                }
                style={s.row}
              >
                <Avatar user={peer} />
                <View style={s.rowBody}>
                  <Text numberOfLines={1} style={s.name}>
                    {peer?.fullName || 'Người dùng'}
                  </Text>
                  <Text
                    style={[s.secondary, item.unread > 0 && styles.unreadText]}
                    numberOfLines={1}
                  >
                    {item.last.senderId === user?.uid ? 'Bạn: ' : ''}
                    {item.last.text}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.time}>
                    {chatTime(item.last.createdAt)}
                  </Text>
                  {item.unread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.unread > 99 ? '99+' : item.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
  },
  greeting: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.muted,
    marginBottom: 9,
  },
  dot: { color: colors.primary },
  note: {
    marginTop: 28,
    backgroundColor: '#F0F2FF',
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E2E6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSymbol: { color: colors.primary, fontSize: 25 },
  noteBody: { marginLeft: 12, flex: 1 },
  noteTitle: { fontSize: 13, color: colors.ink, fontWeight: '700' },
  noteDetail: { fontSize: 11, color: colors.muted, marginTop: 5 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newChat: { fontSize: 12, fontWeight: '700', color: colors.primary },
  right: { alignItems: 'flex-end', marginLeft: 10, gap: 9 },
  time: { fontSize: 10, color: colors.muted },
  badge: {
    backgroundColor: colors.primary,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  unreadText: { fontWeight: '600', color: colors.ink },
});
