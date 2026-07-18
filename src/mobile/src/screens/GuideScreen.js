import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { WebSocketContext } from '../context/WebSocketContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function GuideScreen() {
  const { theme } = useContext(WebSocketContext);
  const isDark = theme === 'dark';
  const styles = getStyles(theme);

  const pins = [
    { component: 'Cảm biến siêu âm Rác (HC-SR04)', trig: 'D12', echo: 'D11', vcc: '5V', gnd: 'GND' },
    { component: 'Cảm biến siêu âm Nắp (HC-SR04)', trig: 'D8', echo: 'D7', vcc: '5V', gnd: 'GND' },
    { component: 'Động cơ Servo (SG90)', trig: 'D10 (PWM)', echo: '-', vcc: '5V', gnd: 'GND' },
    { component: 'Mạch âm thanh DFPlayer Mini', trig: 'TX -> D4', echo: 'RX -> D3', vcc: '5V', gnd: 'GND' },
    { component: 'Mạch truyền thông ESP8266', trig: 'TX -> D2', echo: 'RX -> D1', vcc: '3.3V', gnd: 'GND' },
    { component: 'Cảm biến chất lượng khí MQ-135', trig: 'A0 (Analog)', echo: '-', vcc: '5V', gnd: 'GND' },
    { component: 'Cảm biến nhiệt độ ẩm DHT11', trig: 'D5', echo: '-', vcc: '5V', gnd: 'GND' },
    { component: 'Màn hình hiển thị LCD 1602 I2C', trig: 'SDA -> A4', echo: 'SCL -> A5', vcc: '5V', gnd: 'GND' },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={isDark ? '#020617' : '#F8FAFC'} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.title}>Hardware Guide</Text>
          <Text style={styles.subtitle}>Sơ đồ kết nối & Hướng dẫn lắp đặt</Text>
        </View>

        {/* Section 1: Sơ đồ nối dây chi tiết */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-branch-outline" size={20} color={isDark ? '#38BDF8' : '#4F46E5'} />
            <Text style={styles.sectionTitle}>SƠ ĐỒ ĐẤU NỐI CHÂN ARDUINO UNO</Text>
          </View>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeadText, { flex: 2 }]}>Linh kiện</Text>
            <Text style={[styles.tableHeadText, { flex: 1 }]}>Trig / TX</Text>
            <Text style={[styles.tableHeadText, { flex: 1 }]}>Echo / RX</Text>
            <Text style={[styles.tableHeadText, { flex: 0.8 }]}>Nguồn</Text>
          </View>

          {pins.map((pin, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow, 
                { borderBottomWidth: index === pins.length - 1 ? 0 : 1 }
              ]}
            >
              <Text style={[styles.cellText, { flex: 2, fontWeight: 'bold', color: isDark ? '#CBD5E1' : '#334155' }]}>
                {pin.component}
              </Text>
              <Text style={[styles.cellText, { flex: 1, color: '#F59E0B', fontFamily: 'monospace' }]}>
                {pin.trig}
              </Text>
              <Text style={[styles.cellText, { flex: 1, color: '#38BDF8', fontFamily: 'monospace' }]}>
                {pin.echo}
              </Text>
              <Text style={[styles.cellText, { flex: 0.8, color: '#10B981', fontFamily: 'monospace' }]}>
                {pin.vcc}
              </Text>
            </View>
          ))}
        </View>

        {/* Section 2: Hướng dẫn lắp ráp nhanh */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="build-outline" size={20} color="#FBBF24" />
            <Text style={[styles.sectionTitle, { color: '#FBBF24' }]}>HƯỚNG DẪN KỸ THUẬT LẮP ĐẶT</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Cảm biến siêu âm nắp và rác</Text>
              <Text style={styles.stepDesc}>Cảm biến siêu âm nắp lắp đặt phía ngoài nắp thùng hướng ra để phát hiện tay người. Cảm biến siêu âm đo rác chĩa thẳng góc từ trên nắp xuống lòng thùng để đo chiều sâu rác.</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Text style={{ color: '#A78BFA', fontWeight: 'bold' }}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Điện trở hạn dòng loa DFPlayer</Text>
              <Text style={styles.stepDesc}>Bạn bắt buộc phải đấu nối tiếp một điện trở 1k Ohm trên đường dây RX (Pin 3 của Arduino) và TX (Pin 4) để triệt tiêu nhiễu tín hiệu và bảo vệ module DFPlayer không bị cháy loa.</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={{ color: '#34D399', fontWeight: 'bold' }}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Cấp nguồn ổn định</Text>
              <Text style={styles.stepDesc}>Mạch ESP8266 truyền nhận Wi-Fi tiêu thụ dòng rất lớn. Hãy nối chân VCC của ESP8266 vào đầu ra 3.3V độc lập, tránh dùng chung nguồn nhiễu của động cơ Servo để tránh bị sụt áp làm mất Wi-Fi.</Text>
            </View>
          </View>
        </View>

        <View style={{height: 60}} />
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
    
    sectionCard: { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#FFFFFF', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0 : 0.03, shadowRadius: 12, elevation: 2 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: isDark ? '#38BDF8' : '#4F46E5', marginLeft: 8, letterSpacing: 1 },
    
    tableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: isDark ? '#1E293B' : '#E2E8F0', backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#F1F5F9', borderTopLeftRadius: 10, borderTopRightRadius: 10, paddingHorizontal: 8 },
    tableHeadText: { fontSize: 9, fontWeight: 'bold', color: isDark ? '#64748B' : '#475569' },
    tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomColor: isDark ? '#1E293B' : '#E2E8F0', paddingHorizontal: 8, alignItems: 'center' },
    cellText: { fontSize: 11, color: '#94A3B8' },

    stepItem: { flexDirection: 'row', marginBottom: 20 },
    stepBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16, marginTop: 2 },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
    stepDesc: { fontSize: 12, color: '#94A3B8', lineHeight: 18 }
  });
};
