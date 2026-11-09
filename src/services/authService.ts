import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  ref,
  runTransaction,
  serverTimestamp,
  update,
} from 'firebase/database';
import { requireAuth, requireDatabase } from './firebase';

export async function ensureProfile(user: User, fullName?: string) {
  const target = ref(requireDatabase(), `users/${user.uid}`);
  await runTransaction(target, current =>
    current
      ? undefined
      : {
          uid: user.uid,
          fullName:
            fullName ||
            user.displayName ||
            user.email?.split('@')[0] ||
            'Người dùng',
          email: user.email,
          createdAt: serverTimestamp(),
        },
  );
}
export async function register(
  fullName: string,
  email: string,
  password: string,
) {
  const { user } = await createUserWithEmailAndPassword(
    requireAuth(),
    email.trim(),
    password,
  );
  await updateProfile(user, { displayName: fullName.trim() });
  await ensureProfile(user, fullName.trim());
  await update(ref(requireDatabase(), `users/${user.uid}`), {
    fullName: fullName.trim(),
  });
}
export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}
export async function logout() {
  await signOut(requireAuth());
}
export function errorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'auth/too-many-requests':
      'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.',
    'auth/network-request-failed': 'Không thể kết nối. Vui lòng kiểm tra mạng.',
    'auth/operation-not-allowed':
      'Chưa bật đăng nhập Email/Password trong Firebase.',
    PERMISSION_DENIED:
      'Không có quyền truy cập dữ liệu. Hãy kiểm tra Firebase Rules.',
  };
  return (
    messages[code || ''] ||
    (error instanceof Error
      ? error.message
      : 'Có lỗi xảy ra. Vui lòng thử lại.')
  );
}
