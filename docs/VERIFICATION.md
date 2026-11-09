# Kết quả kiểm tra — 09/11/2026

- `npm run typecheck`: đạt.
- `npm test -- --runInBand`: 3 kiểm thử đạt (chat ID đối xứng và không trùng, thứ tự tin và số chưa đọc, ẩn chat chưa có tin).
- `npm run lint`: 0 lỗi, 5 cảnh báo về inline style/render function.
- Firebase Database Emulator: toàn bộ kiểm tra trong `tests/database.rules.test.mjs` đạt. Có các lệnh cố ý bị permission_denied để xác nhận rules chặn đúng.
- Firebase thật: đăng ký/đăng nhập hai tài khoản mẫu, từ chối sai mật khẩu, tạo profile, tạo chat bằng transaction, cập nhật hai indexes, nhận tin qua listener của client độc lập, đồng bộ read receipt và trả lời: đạt.
- `:app:assembleDebug -PreactNativeArchitectures=x86_64`: thành công.
- `:app:assembleRelease -PreactNativeArchitectures=x86_64`: thành công, APK khoảng 25,5 MB; đã cài trên Medium_Phone_API_37.0.
- Đã quan sát bản APK độc lập mở giao diện, người dùng xác nhận đăng nhập được và đã gửi tin trong màn hình Chat. Ảnh: `docs/screenshots/app-running.png`.
- Rules thật đã được xuất bản sau xác nhận của người dùng. Ảnh: `docs/screenshots/firebase-rules.jpg`.

Chưa kiểm tra build iOS hoặc APK ARM trên máy Windows này. Chưa có mã Thông báo Bài 4/bộ rules của giảng viên để đối chiếu; xem README.
