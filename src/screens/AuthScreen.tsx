import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, ErrorBanner, Field, s } from '../components/UI';
import { errorMessage, login, register } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

export default function AuthScreen() {
  const [isRegister, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (isRegister && !name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (isRegister && password !== confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setBusy(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView
        style={s.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>c.</Text>
            </View>
            <Text style={styles.brandName}>
              chạm<Text style={styles.brandDot}>.</Text>
            </Text>
          </View>
          <Text style={styles.eyebrow}>KẾT NỐI NHỮNG CÂU CHUYỆN</Text>
          <Text style={styles.title}>
            {isRegister ? 'Bắt đầu kết nối.' : 'Chào bạn\ntrở lại.'}
          </Text>
          <Text style={styles.description}>
            {isRegister
              ? 'Tạo tài khoản để trò chuyện cùng mọi người.'
              : 'Một lời chào nhỏ, một cuộc trò chuyện mới.'}
          </Text>
          <View style={styles.form}>
            {isRegister && (
              <Field
                label="Họ và tên"
                placeholder="Nguyễn Văn An"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                maxLength={80}
                editable={!busy}
              />
            )}
            <Field
              label="Email"
              placeholder="ban@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!busy}
            />
            <Field
              label="Mật khẩu"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              editable={!busy}
            />
            {isRegister && (
              <Field
                label="Nhập lại mật khẩu"
                placeholder="Nhập lại mật khẩu của bạn"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                editable={!busy}
              />
            )}
            <ErrorBanner
              message={
                !isFirebaseConfigured
                  ? 'Chưa có cấu hình Firebase. Xem README để thiết lập.'
                  : error
              }
            />
            <Button
              title={isRegister ? 'Tạo tài khoản  →' : 'Đăng nhập  →'}
              onPress={submit}
              loading={busy}
              disabled={!isFirebaseConfigured}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => {
              setRegister(!isRegister);
              setError('');
              setPassword('');
              setConfirm('');
            }}
            style={styles.switch}
          >
            <Text style={styles.description}>
              {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
              <Text style={styles.link}>
                {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
              </Text>
            </Text>
          </Pressable>
          <View style={styles.footer}>
            <View style={styles.smallDot} />
            <Text style={styles.footerText}>
              TRÒ CHUYỆN REALTIME · FIREBASE
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  content: { padding: 28, flexGrow: 1 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 50,
  },
  logo: {
    backgroundColor: colors.primary,
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 29, fontWeight: '800', marginTop: -4 },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    marginLeft: 11,
  },
  brandDot: { color: colors.primary },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 18,
  },
  title: {
    fontSize: 45,
    lineHeight: 51,
    letterSpacing: -1.9,
    fontWeight: '800',
    color: colors.ink,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 14,
    lineHeight: 22,
  },
  form: { marginTop: 35 },
  switch: { alignItems: 'center', marginTop: 15, paddingVertical: 5 },
  link: { color: colors.primary, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 45,
    marginBottom: 10,
  },
  footerText: { fontSize: 9, letterSpacing: 1.6, color: colors.muted },
  smallDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
    marginRight: 8,
  },
});
