import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Profile } from '../types';
export const colors = {
  primary: '#5260DB',
  ink: '#18243D',
  muted: '#7B8497',
  line: '#EBEEF5',
  background: '#F7F8FC',
  green: '#20BC8B',
};
export function online(user?: Profile) {
  return Object.keys(user?.connections || {}).length > 0;
}
export function time(value?: number) {
  return value
    ? new Date(value).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
}
export function chatTime(value: number) {
  return new Date(value).toDateString() === new Date().toDateString()
    ? time(value)
    : new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
}
export function Avatar({
  user,
  size = 52,
  presence = true,
}: {
  user?: Profile;
  size?: number;
  presence?: boolean;
}) {
  const palette = ['#E5E9FF', '#FFE9DC', '#E0F3ED', '#F1E6FA'];
  const name = user?.fullName || 'Người dùng';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
  return (
    <View style={{ width: size, height: size }}>
      {user?.photoURL ? (
        <Image
          source={{ uri: user.photoURL }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            s.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: palette[name.charCodeAt(0) % palette.length],
            },
          ]}
        >
          <Text
            style={{
              fontSize: size * 0.31,
              color: colors.primary,
              fontWeight: '700',
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {presence && online(user) && <View style={s.dot} />}
    </View>
  );
}
export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        (disabled || loading) && s.disabled,
        pressed && s.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={s.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#A0A7B7"
        style={s.input}
        {...props}
      />
    </View>
  );
}
export function Empty({
  symbol,
  title,
  detail,
}: {
  symbol: string;
  title: string;
  detail: string;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Text style={s.symbol}>{symbol}</Text>
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.detail}>{detail}</Text>
    </View>
  );
}
export function ErrorBanner({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  if (!message) {
    return null;
  }
  return (
    <Pressable
      accessibilityRole={retry ? 'button' : undefined}
      onPress={retry}
      style={s.error}
    >
      <Text style={s.errorText}>
        {message}
        {retry ? ' Nhấn để thử lại.' : ''}
      </Text>
    </Pressable>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 24 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
  },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 7, lineHeight: 21 },
  section: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginTop: 26,
    marginBottom: 16,
  },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  field: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 9,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: colors.ink,
  },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.green,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: '#fff',
  },
  empty: { padding: 32, alignItems: 'center', marginTop: 48 },
  emptyIcon: {
    height: 76,
    width: 76,
    backgroundColor: '#EEF0FF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  symbol: { fontSize: 34, color: colors.primary },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 9,
  },
  detail: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  error: {
    padding: 14,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    marginVertical: 10,
  },
  errorText: { color: '#B43B49', fontSize: 13, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowBody: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  secondary: { fontSize: 13, color: colors.muted, marginTop: 6 },
});
