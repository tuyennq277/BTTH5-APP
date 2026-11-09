import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, colors, ErrorBanner, s } from '../components/UI';
import { useApp } from '../context/AppContext';
import { errorMessage } from '../services/authService';
import { getCurrentLocation } from '../services/locationService';
export default function SettingsScreen() {
  const { user, users, signOut } = useApp();
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const leave = async () => {
    setBusy(true);
    setError('');
    try {
      await signOut();
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  };
  const locate = async () => {
    setLocating(true);
    setError('');
    try {
      setLocation(await getCurrentLocation());
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLocating(false);
    }
  };
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={[s.title, styles.title]}>
        Cài đặt<Text style={styles.accent}>.</Text>
      </Text>
      <Text style={s.subtitle}>Một chút về bạn và ứng dụng.</Text>
      <View style={styles.card}>
        <Avatar
          user={users.find(item => item.uid === user?.uid)}
          size={78}
          presence={false}
        />
        <Text style={styles.name}>
          {users.find(item => item.uid === user?.uid)?.fullName ||
            user?.displayName ||
            'Người dùng'}
        </Text>
        <Text style={s.secondary}>{user?.email}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>● ĐANG KẾT NỐI</Text>
        </View>
      </View>
      <Text style={s.section}>THÔNG TIN ỨNG DỤNG</Text>
      <View style={styles.info}>
        <Text style={styles.infoTitle}>Chạm · Realtime Chat</Text>
        <Text style={styles.infoText}>
          Bài thực hành 5 · Chat 1-1 với Firebase
        </Text>
        <Text style={styles.infoText}>React Native CLI · Firebase JS SDK</Text>
      </View>
      <Text style={s.section}>VỊ TRÍ THIẾT BỊ</Text>
      <Text style={styles.infoText}>
        Chỉ lấy vị trí khi bạn nhấn nút. Tọa độ hiển thị trên máy, không gửi vào
        cuộc trò chuyện.
      </Text>
      {Boolean(location) && <Text style={styles.location}>{location}</Text>}
      <Button title="Xem vị trí hiện tại" onPress={locate} loading={locating} />
      <View style={styles.logout}>
        <ErrorBanner message={error} />
        <Button title="Đăng xuất" onPress={leave} loading={busy} />
      </View>
      <Text style={styles.version}>CHẠM · VERSION 1.0.0</Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  title: { marginTop: 28 },
  accent: { color: colors.primary },
  card: {
    alignItems: 'center',
    padding: 27,
    backgroundColor: colors.background,
    borderRadius: 24,
    marginTop: 26,
  },
  name: { fontSize: 21, color: colors.ink, fontWeight: '700', marginTop: 18 },
  tag: {
    borderRadius: 9,
    backgroundColor: '#E1F5ED',
    padding: 8,
    marginTop: 17,
  },
  tagText: {
    fontSize: 9,
    letterSpacing: 1,
    color: '#188660',
    fontWeight: '700',
  },
  info: { padding: 20, backgroundColor: colors.background, borderRadius: 18 },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  infoText: { fontSize: 12, color: colors.muted, lineHeight: 22 },
  location: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: 12,
  },
  logout: { marginTop: 26 },
  version: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.muted,
    textAlign: 'center',
    marginVertical: 28,
  },
});
