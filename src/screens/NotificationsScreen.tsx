import React from 'react';
import { Text, View } from 'react-native';
import { Empty, s } from '../components/UI';
// Thư mục ban đầu trống: ghép nguyên component Thông báo Bài 4 vào đây khi có source.
export default function NotificationsScreen() {
  return (
    <View style={[s.page, s.content]}>
      <Text style={[s.title, { marginTop: 28 }]}>Thông báo.</Text>
      <Text style={s.subtitle}>Trung tâm thông báo của bạn.</Text>
      <Empty
        symbol="♧"
        title="Chưa có thông báo"
        detail="Chưa có mã màn hình Thông báo Bài 4 trong dự án. Màn hình này được dành sẵn để ghép lại bài trước."
      />
    </View>
  );
}
