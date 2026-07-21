import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { WebSocketContext } from '../context/WebSocketContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function NotificationScreen() {
  const { sensorData, theme } = useContext(WebSocketContext);
  const isDark = theme === 'dark';

  // Danh sách sự kiện tĩnh + động thời gian thực
  const notifications = useMemo(() => {
    const list = [
      {
        id: '1',
        title: 'Khởi động hệ thống',
        desc: 'Hệ thống EcoPulse đã kết nối mạng thành công và bắt đầu đồng bộ.',
        time: '10 phút trước',
        type: 'info',
        icon: 'power'
      },
      {
        id: '2',
        title: 'Đồng bộ cấu hình',
        desc: 'Đã nhận cấu hình ngưỡng cảnh báo mới từ đám mây (Cloud Sync).',
        time: '7 phút trước',
        type: 'success',
        icon: 'cloud-sync'
      }
    ];

    // Thêm các sự kiện cảnh báo động dựa trên sensorData thời gian thực
    if (sensorData.garbage_level >= 80) {
      list.unshift({
        id: 'danger_garbage',
        title: 'CẢNH BÁO: Rác đầy!',
        desc: `Cảm biến siêu âm ghi nhận mức rác vượt ngưỡng báo động (${sensorData.garbage_level}%). Cần thu dọn ngay!`,
        time: 'Vừa xong',
        type: 'danger',
        icon: 'delete-empty'
      });
    }

    if (sensorData.gas >= 500) {
      list.unshift({
        id: 'danger_gas',
        title: 'CẢNH BÁO: Khí độc hại!',
        desc: `Phát hiện nồng độ khí gas / mùi hôi vượt ngưỡng an toàn (${sensorData.gas} ppm). Đã phát loa cảnh báo Bài 5.`,
        time: 'Vừa xong',
        type: 'gas',
        icon: 'alert-decagram'
      });
    }

    if (sensorData.temperature >= 29) {
      list.unshift({
        id: 'danger_temp',
        title: 'CẢNH BÁO: Quá nhiệt!',
        desc: `Nhiệt độ thùng rác đạt ngưỡng báo động đỏ (${sensorData.temperature}°C). Đã phát loa cảnh báo Bài 6.`,
        time: 'Vừa xong',
        type: 'danger',
        icon: 'thermometer-alert'
      });
    }

    return list;
  }, [sensorData]);

  const styles = getStyles(theme);

  const getIconColor = (type) => {
    switch (type) {
      case 'danger': return '#EF4444';
      case 'gas': return '#F59E0B';
      case 'success': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getCardBorderColor = (type) => {
    if (!isDark) return '#E2E8F0';
    switch (type) {
      case 'danger': return '#FCA5A5';
      case 'gas': return '#FDE68A';
      default: return '#1E293B';
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={isDark ? '#020617' : '#F8FAFC'} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.title}>System Alerts</Text>
          <Text style={styles.subtitle}>Nhật ký & Cảnh báo Sự kiện Hệ thống</Text>
        </View>

        {/* List of Alerts */}
        {notifications.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.alertCard, 
              { borderColor: getCardBorderColor(item.type) }
            ]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
              <MaterialCommunityIcons 
                name={item.icon} 
                size={24} 
                color={getIconColor(item.type)} 
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {item.title}
                </Text>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        {notifications.length === 2 && (
          <View style={styles.emptyTip}>
            <Ionicons name="shield-checkmark" size={48} color="#10B981" />
            <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#475569' }]}>
              Hệ thống hoạt động an toàn
            </Text>
            <Text style={styles.emptySub}>Không có cảnh báo khẩn cấp nào ghi nhận.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => {
  const isDark = theme === 'dark';
  return StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: isDark ? '#020617' : '#F8FAFC' },
    container: { flex: 1, padding: 20 },
    header: { marginBottom: 25, marginTop: 40 },
    title: { fontSize: 24, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', letterSpacing: 0.5 },
    subtitle: { fontSize: 13, color: isDark ? '#94A3B8' : '#475569', marginTop: 4, letterSpacing: 0.5 },
    
    alertCard: { flexDirection: 'row', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#FFFFFF', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.02, shadowRadius: 6, elevation: 1 },
    iconWrapper: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    textContainer: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 14, fontWeight: 'bold', flex: 1, marginRight: 8 },
    cardTime: { fontSize: 10, color: '#64748B' },
    cardDesc: { fontSize: 12, color: '#94A3B8', lineHeight: 18 },

    emptyTip: { alignItems: 'center', marginTop: 40, padding: 20 },
    emptyText: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
    emptySub: { fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' }
  });
};
