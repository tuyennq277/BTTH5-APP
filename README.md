# BTTH5-APP

Bài thực hành 5 — Chạm · Chat 1-1 realtime

Ứng dụng **React Native CLI**, TypeScript, React Navigation và **Firebase JS SDK** (`firebase/auth`, `firebase/database`), không dùng Expo.

## Firebase đã cấu hình

- Project: `btth5-realtime-chat` (Spark).
- Authentication: Email/Password đã bật.
- Realtime Database: Singapore (`asia-southeast1`).
- Cấu hình thật: `src/services/firebaseConfig.ts`.
- Rules triển khai: `database.rules.json`.
- Console: https://console.firebase.google.com/project/btth5-realtime-chat/overview

Không cần `google-services.json` hoặc plugin Firebase native vì bài dùng JS SDK. Firebase Web config là thông tin cấu hình ứng dụng; quyền dữ liệu được kiểm soát bằng Authentication và Database Rules. Không đặt service-account key vào ứng dụng.

## Chạy Android

Cài dependencies bằng `npm ci`, mở Android Emulator hoặc kết nối điện thoại có USB debugging.

```powershell
npm start
```

Ở terminal thứ hai:

```powershell
npm run android -- --active-arch-only
```

Script Android tự tìm JDK đi kèm Android Studio và Android SDK trên Windows nếu chưa có JAVA_HOME/ANDROID_HOME. Máy khác cần cài JDK/SDK theo hướng dẫn React Native. `android/local.properties` là cấu hình đường dẫn riêng của máy và được bỏ qua trong Git.

Bản APK độc lập nằm ở `android/app/build/outputs/apk/release/app-release.apk` khi build hoàn tất; mở không cần Metro. Bản đang build cho emulator x86_64. Muốn APK cho điện thoại ARM:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
cd android
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
```

APK bài tập dùng debug keystore có sẵn trong template. Khi phát hành lên cửa hàng phải thay bằng khóa ký riêng.

## Chạy iOS

Cần macOS và Xcode. Chạy `bundle install`, `bundle exec pod install` trong thư mục `ios`, rồi `npm run ios`. Đã khai báo mô tả xin quyền vị trí. Chưa kiểm tra build iOS trên máy Windows này.

## Tính năng theo đề

| Mục | Cách triển khai |
| --- | --- |
| Đăng ký | Họ tên, email, mật khẩu >= 6 ký tự, xác nhận mật khẩu; Firebase Auth và hồ sơ RTDB |
| Đăng nhập | Firebase Email/Password, lỗi tiếng Việt, lưu phiên qua AsyncStorage |
| Đăng xuất | Cài đặt → xóa connection của thiết bị → signOut → về Đăng nhập |
| Danh bạ | Listener users, loại bản thân, tìm tên/email không phân biệt dấu, online/offline realtime |
| Chat | Mỗi cặp UID có một chat ID; gửi/nhận realtime, bubble hai bên, thời gian, chặn rỗng, tự cuộn |
| Tiêu đề | Tên và trạng thái của người đang chat cập nhật theo users listener |
| Home | Avatar ảnh hoặc chữ cái mặc định, tên, tin cuối, thời gian, sắp xếp mới nhất trước |
| Chưa đọc | Tính từ tin nhắn đối phương sau read receipt; cập nhật realtime, mở chat đang active thì đánh dấu đã đọc |
| Presence | Mỗi thiết bị một connection, onDisconnect đăng ký trước khi ghi online, AppState xử lý nền/foreground |
| Geolocation | Đã cài và sử dụng: nút Xem vị trí hiện tại trong Cài đặt; chỉ xin quyền khi nhấn, tọa độ không gửi Firebase |
| Cleanup | Mọi onValue và AppState listener đều trả cleanup; watchConversations hủy toàn bộ listener con |

**Phần chưa thể đối chiếu với Bài 4:** thư mục ban đầu hoàn toàn trống, không có mã màn hình Thông báo cũ hoặc bộ rules của giảng viên. `src/screens/NotificationsScreen.tsx` hiện là chỗ dành sẵn, chưa phải bản Thông báo Bài 4. Cần ghép nguyên component Bài 4 vào file này khi có source. Rules hiện tại là bộ rules viết cho cấu trúc dữ liệu ứng dụng này, đã kiểm thử, không phải rules giảng viên chưa cung cấp.

## Cấu trúc

```text
src/
  components/UI.tsx             Thành phần giao diện dùng chung
  context/AppContext.tsx        Auth, danh bạ, cuộc trò chuyện, presence và cleanup
  navigation/types.ts          Kiểu dữ liệu React Navigation
  screens/                     Đăng nhập/đăng ký, Home, Danh bạ, Chat, Thông báo, Cài đặt
  services/
    firebaseConfig.ts          Cấu hình Firebase
    firebase.ts                Khởi tạo SDK và persistence
    authService.ts             Đăng ký/đăng nhập/đăng xuất và lỗi
    chatService.ts             Listener, tạo chat, gửi tin, read receipts
    presenceService.ts         Online/offline đa thiết bị
    locationService.ts         Geolocation và quyền thiết bị
```

## Cấu trúc Realtime Database

```text
users/{uid}/
  uid, fullName, email, createdAt, photoURL? , lastOnline?
  connections/{connectionId}: true
chats/{chatId}/
  user1, user2
  members/{uid}: true
  messages/{messageId}: {senderId, text, createdAt}
  readReceipts/{uid}: messageId
userChats/{uid}/{chatId}: true
```

Chat được tạo bằng transaction; sau đó ghi hai userChats indexes bằng một atomic update. Mỗi lần gửi chỉ tạo một message ID. Danh sách thay toàn bộ từ snapshot và dùng ID làm key, tránh nhân đôi do listener. Timestamp do Firebase server cấp. Read receipt dùng transaction để không lùi mốc đọc khi đăng nhập nhiều thiết bị.

Home lắng nghe các chat được index của tài khoản, tính tin cuối và số chưa đọc từ lịch sử. Cách này phù hợp quy mô bài tập; ứng dụng lớn nên bổ sung phân trang và tổng hợp metadata ở backend.

## Kiểm tra

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
npm run test:rules
```

`test:rules` cần Java trong PATH, chỉ dùng Firebase Emulator và project giả `demo-btth5`, không xóa dữ liệu Firebase thật.

Kiểm thử rules gồm: từ chối người chưa đăng nhập, sửa hồ sơ người khác, người ngoài đọc chat, thêm thành viên, giả mạo sender, chỉnh tin đã gửi, tin rỗng, sửa read receipt người khác; cho phép profile, presence, chat hai người, tin nhiều dòng, atomic indexes và mốc đã đọc đúng quyền.

Đã tạo hai tài khoản mẫu để kiểm tra Firebase thật. Thông tin đăng nhập nằm trong `.local/demo-accounts.json` trên máy này; thư mục `.local` không đưa vào Git. Kết quả kiểm tra Firebase thật nằm ở `.local/firebase-smoke-result.json`.

## Kiểm tra thủ công khi nộp bài

1. Đăng ký hai tài khoản, thử thiếu tên, email sai, mật khẩu ngắn và xác nhận không khớp.
2. Đăng nhập sai mật khẩu để kiểm tra thông báo lỗi.
3. Trên hai thiết bị đăng nhập hai tài khoản, kiểm tra danh bạ không có chính mình.
4. Tìm theo tên/email, mở chat, gửi hai chiều, kiểm tra bubble và giờ.
5. Cho tài khoản B về Home; tài khoản A gửi vài tin. B phải thấy số chưa đọc tăng và chat lên đầu.
6. Mở chat trên B; số chưa đọc phải về 0. Gửi tin khi chat đang mở thì vẫn giữ 0.
7. Đưa A về nền hoặc tắt mạng; B thấy A offline sau khi kết nối được cập nhật. Mở lại A để kiểm tra online.
8. Ra/vào chat nhiều lần rồi gửi một tin; tin chỉ xuất hiện một lần.
9. Đăng xuất ở Cài đặt, kiểm tra về Đăng nhập và nút Back không quay lại màn hình đã đăng nhập.

Tài liệu chính thức: [React Native CLI](https://reactnative.dev/docs/getting-started-without-a-framework), [React Navigation](https://reactnavigation.org/docs/getting-started), [Firebase presence](https://firebase.google.com/docs/database/web/offline-capabilities), [Geolocation](https://github.com/michalchudziak/react-native-geolocation).

