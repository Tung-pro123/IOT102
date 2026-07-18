import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { WebSocketContext } from '../context/WebSocketContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { isConnected, sensorData, sendCommand, theme } = useContext(WebSocketContext);

  const isGarbageFull = sensorData.garbage_level >= 80;
  const isGasHigh = sensorData.gas > 500;
  const isLidOpen = sensorData.is_lid_open;

  const handleControl = (cmd, label) => {
    sendCommand(cmd);
    Alert.alert('Đã gửi lệnh', `Lệnh [${label}] đã được gửi tới hệ thống.`);
  };

  // Màu sắc động dựa trên mức rác
  const getTrashColor = (level) => {
    if (level >= 80) return '#EF4444'; // Đỏ
    if (level >= 50) return '#F59E0B'; // Vàng cam
    return '#10B981'; // Xanh lá
  };

  const trashColor = getTrashColor(sensorData.garbage_level);
  const styles = getStyles(theme);

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#020617' : '#F8FAFC'} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Info */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EcoPulse IoT</Text>
            <Text style={styles.subtitle}>Smart Waste Management</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: isConnected ? '#10B981' : '#F43F5E' }]}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#F43F5E' }]} />
            <Text style={[styles.statusText, { color: isConnected ? '#10B981' : '#F43F5E' }]}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Cảnh báo đầy */}
        {isGarbageFull && (
          <View style={styles.alertBox}>
            <View style={styles.alertGlow} />
            <Ionicons name="warning" size={28} color="#F43F5E" style={{ zIndex: 2 }} />
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Cảnh báo khẩn cấp!</Text>
              <Text style={styles.alertDesc}>Thùng rác đã đầy trên 80%. Vui lòng dọn dẹp!</Text>
            </View>
          </View>
        )}

        {/* Khu vực mô phỏng và các thông số khác (Split Screen Layout) */}
        <View style={styles.splitSection}>
          
          {/* CỘT TRÁI: Mô phỏng thùng rác vật lý */}
          <View style={styles.simCard}>
            <View style={styles.simCardHeader}>
              <Text style={styles.simLabel}>MÔ PHỎNG THÙNG RÁC</Text>
            </View>
            
            <View style={styles.trashCanContainer}>
              {/* Nắp thùng rác động */}
              <View 
                style={[
                  styles.trashLid, 
                  isLidOpen ? styles.trashLidOpen : styles.trashLidClosed
                ]} 
              />
              
              {/* Thân thùng rác */}
              <View style={styles.trashBody}>
                {/* Lượng rác lấp đầy động */}
                <View 
                  style={[
                    styles.trashFill, 
                    { 
                      height: `${Math.min(100, Math.max(5, sensorData.garbage_level))}%`,
                      backgroundColor: trashColor
                    }
                  ]} 
                />
                
                {/* Phần trăm rác hiển thị chính giữa thùng */}
                <View style={styles.trashPercentContainer}>
                  <Text style={styles.trashPercentText}>{sensorData.garbage_level}%</Text>
                  <Text style={styles.trashStatusText}>
                    {isLidOpen ? 'NẮP MỞ' : 'NẮP ĐÓNG'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* CỘT PHẢI: 3 thẻ cảm biến dạng dọc */}
          <View style={styles.statsColumn}>
            
            {/* Card Khí Gas */}
            <View style={[styles.miniCard, { borderColor: isGasHigh ? '#EF4444' : '#F59E0B' }]}>
              <View style={styles.miniCardHeader}>
                <MaterialCommunityIcons name="weather-windy" size={18} color={isGasHigh ? '#FDA4AF' : '#FBBF24'} />
                <Text style={styles.miniCardLabel}>KHÍ GAS</Text>
              </View>
              <Text style={styles.miniCardValue}>{sensorData.gas} <Text style={styles.miniCardUnit}>ppm</Text></Text>
              <Text style={[styles.miniCardStatus, { color: isGasHigh ? '#EF4444' : '#10B981' }]}>
                {isGasHigh ? '⚠️ Ô nhiễm' : '✓ Sạch'}
              </Text>
            </View>

            {/* Card Nhiệt độ */}
            <View style={[styles.miniCard, { borderColor: '#3B82F6' }]}>
              <View style={styles.miniCardHeader}>
                <MaterialCommunityIcons name="thermometer" size={18} color="#93C5FD" />
                <Text style={styles.miniCardLabel}>NHIỆT ĐỘ</Text>
              </View>
              <Text style={styles.miniCardValue}>{sensorData.temperature} <Text style={styles.miniCardUnit}>°C</Text></Text>
            </View>

            {/* Card Độ ẩm */}
            <View style={[styles.miniCard, { borderColor: '#8B5CF6' }]}>
              <View style={styles.miniCardHeader}>
                <MaterialCommunityIcons name="water-percent" size={18} color="#C4B5FD" />
                <Text style={styles.miniCardLabel}>ĐỘ ẨM</Text>
              </View>
              <Text style={styles.miniCardValue}>{sensorData.humidity} <Text style={styles.miniCardUnit}>%</Text></Text>
            </View>

          </View>
        </View>

        {/* Command Center */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>COMMAND CENTER</Text>
          <View style={styles.sectionLine} />
        </View>
        
        <View style={styles.controlPanel}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => handleControl('open', 'Mở nắp')}>
              <Ionicons name="lock-open" size={20} color="#fff" style={styles.btnIcon} />
              <Text style={styles.btnTextPrimary}>MỞ NẮP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => handleControl('close', 'Đóng nắp')}>
              <Ionicons name="lock-closed" size={20} color={theme === 'dark' ? '#94A3B8' : '#334155'} style={styles.btnIcon} />
              <Text style={styles.btnTextSecondary}>ĐÓNG NẮP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={() => handleControl('auto', 'Tự động')}>
              <Ionicons name="hardware-chip" size={20} color="#10B981" style={styles.btnIcon} />
              <Text style={styles.btnTextSuccess}>TỰ ĐỘNG (AI)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => handleControl('play_alarm', 'Bật còi')}>
              <Ionicons name="volume-high" size={20} color="#fff" style={styles.btnIcon} />
              <Text style={styles.btnTextPrimary}>BÁO ĐỘNG SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDangerOutline]} onPress={() => handleControl('stop_alarm', 'Tắt còi')}>
              <Ionicons name="volume-mute" size={20} color="#F43F5E" style={styles.btnIcon} />
              <Text style={styles.btnTextDangerOutline}>TẮT CÒI</Text>
            </TouchableOpacity>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 40 },
    title: { fontSize: 24, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', letterSpacing: 0.5 },
    subtitle: { fontSize: 13, color: isDark ? '#94A3B8' : '#475569', marginTop: 4, letterSpacing: 0.5 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
    
    alertBox: { flexDirection: 'row', backgroundColor: isDark ? '#4C1D95' : '#FEE2E2', padding: 18, borderRadius: 16, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#7C3AED' : '#FCA5A5', overflow: 'hidden', position: 'relative' },
    alertGlow: { position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, backgroundColor: '#F43F5E', opacity: isDark ? 0.15 : 0.05 },
    alertTextContainer: { marginLeft: 16, flex: 1, zIndex: 2 },
    alertTitle: { fontSize: 16, fontWeight: 'bold', color: isDark ? '#FCA5A5' : '#991B1B', letterSpacing: 0.5 },
    alertDesc: { fontSize: 13, color: isDark ? '#FECDD3' : '#B91C1C', marginTop: 4, lineHeight: 18 },
    
    splitSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    
    simCard: { width: '47%', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#FFFFFF', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0 : 0.04, shadowRadius: 10, elevation: 2 },
    simCardHeader: { width: '100%', alignItems: 'center', marginBottom: 12 },
    simLabel: { fontSize: 9, fontWeight: 'bold', color: isDark ? '#64748B' : '#94A3B8', letterSpacing: 1 },
    
    trashCanContainer: { width: 100, height: 180, justifyContent: 'flex-end', alignItems: 'center', marginTop: 10, position: 'relative' },
    trashLid: { width: 110, height: 8, backgroundColor: '#64748B', borderRadius: 4, position: 'absolute', zIndex: 10 },
    trashLidClosed: { bottom: 140 },
    trashLidOpen: { bottom: 155, transform: [{ rotate: '-25deg' }, { translateX: -10 }] },
    
    trashBody: { width: 90, height: 140, backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#F1F5F9', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderWidth: 2, borderColor: isDark ? '#475569' : '#94A3B8', overflow: 'hidden', justifyContent: 'flex-end', position: 'relative' },
    trashFill: { width: '100%', position: 'absolute', bottom: 0, left: 0 },
    
    trashPercentContainer: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
    trashPercentText: { fontSize: 28, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', textShadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    trashStatusText: { fontSize: 9, fontWeight: 'bold', color: isDark ? '#94A3B8' : '#475569', marginTop: 4, letterSpacing: 0.5 },

    statsColumn: { width: '49%', justifyContent: 'space-between' },
    miniCard: { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', height: 82, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.02, shadowRadius: 6, elevation: 1 },
    miniCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    miniCardLabel: { fontSize: 9, fontWeight: 'bold', color: isDark ? '#94A3B8' : '#475569', marginLeft: 4, letterSpacing: 0.5 },
    miniCardValue: { fontSize: 18, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A' },
    miniCardUnit: { fontSize: 11, color: isDark ? '#64748B' : '#94A3B8' },
    miniCardStatus: { fontSize: 9, fontWeight: 'bold', marginTop: 2 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: isDark ? '#94A3B8' : '#475569', letterSpacing: 2, marginRight: 15 },
    sectionLine: { flex: 1, height: 1, backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
    
    controlPanel: { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#FFFFFF', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0 : 0.03, shadowRadius: 12, elevation: 2 },
    controlRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, marginHorizontal: 6, borderWidth: 1, borderColor: 'transparent' },
    btnIcon: { marginRight: 8 },
    
    btnPrimary: { backgroundColor: '#3B82F6' },
    btnSecondary: { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F1F5F9', borderColor: isDark ? '#334155' : '#CBD5E1' },
    btnSuccess: { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#E6F4EA', borderColor: '#10B981' },
    btnDanger: { backgroundColor: '#E11D48' },
    btnDangerOutline: { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.1)' : '#FCE8E6', borderColor: '#BE123C' },
    
    btnTextPrimary: { color: '#fff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
    btnTextSecondary: { color: isDark ? '#94A3B8' : '#334155', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
    btnTextSuccess: { color: '#10B981', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
    btnTextDangerOutline: { color: '#F43F5E', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  });
};
