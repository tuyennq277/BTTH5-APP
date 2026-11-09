import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Avatar,
  colors,
  Empty,
  ErrorBanner,
  online,
  s,
} from '../components/UI';
import { useApp } from '../context/AppContext';
import { openChat } from '../services/chatService';
import { errorMessage } from '../services/authService';
import { RootStackParams } from '../navigation/types';
export default function ContactsScreen() {
  const { user, users, usersLoading, error, retry } = useApp();
  const [search, setSearch] = useState('');
  const [opening, setOpening] = useState('');
  const [localError, setError] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase();
  const contacts = useMemo(
    () =>
      users
        .filter(
          person =>
            person.uid !== user?.uid &&
            normalize(`${person.fullName} ${person.email}`).includes(
              normalize(search),
            ),
        )
        .sort(
          (a, b) =>
            Number(online(b)) - Number(online(a)) ||
            a.fullName.localeCompare(b.fullName, 'vi'),
        ),
    [users, user, search],
  );
  const open = async (peerId: string) => {
    if (!user || opening) {
      return;
    }
    setOpening(peerId);
    setError('');
    try {
      const chatId = await openChat(user.uid, peerId);
      navigation.navigate('Chat', { chatId, peerId });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setOpening('');
    }
  };
  return (
    <View style={[s.page, s.content]}>
      <Text style={[s.title, styles.title]}>
        Danh bạ<Text style={styles.accent}>.</Text>
      </Text>
      <Text style={s.subtitle}>Tìm người bạn muốn trò chuyện.</Text>
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          accessibilityLabel="Tìm theo tên hoặc email"
          placeholder="Tìm tên hoặc email..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>
      <Text style={s.section}>
        {contacts.length} NGƯỜI BẠN · {contacts.filter(online).length} ĐANG
        ONLINE
      </Text>
      <ErrorBanner
        message={localError || error}
        retry={error ? retry : undefined}
      />
      {usersLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.uid}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Empty
              symbol="♧"
              title={
                search ? 'Không tìm thấy người dùng' : 'Danh bạ đang chờ bạn bè'
              }
              detail={
                search
                  ? 'Thử tìm bằng tên hoặc email khác.'
                  : 'Đăng ký tài khoản thứ hai trên thiết bị khác để bắt đầu chat.'
              }
            />
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              disabled={Boolean(opening)}
              onPress={() => open(item.uid)}
              style={s.row}
            >
              <Avatar user={item} />
              <View style={s.rowBody}>
                <Text style={s.name}>{item.fullName}</Text>
                <Text style={[s.secondary, online(item) && styles.online]}>
                  {online(item) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </Text>
              </View>
              {opening === item.uid ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.arrow}>↗</Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  title: { marginTop: 28 },
  accent: { color: colors.primary },
  search: {
    marginTop: 26,
    backgroundColor: colors.background,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchIcon: { fontSize: 26, color: colors.muted },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14, padding: 15 },
  online: { color: colors.green },
  arrow: { fontSize: 24, color: colors.primary },
});
