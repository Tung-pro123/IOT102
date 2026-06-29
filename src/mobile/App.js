import './polyfills';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native';

// Đọc IP từ .env (đổi IP này khi đổi mạng Wi-Fi)
const SERVER_IP = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '10.1.6.18';
const WS_URL = `ws://${SERVER_IP}:3001`;

// Simple SVG Icons using Unicode or text for demo purposes
const Icons = {
  Wifi: '📡',
  Bell: '🔔',
  Trash: '🗑️',
  Wind: '💨',
  Temp: '🌡️',
  Water: '💧',
  Robot: '🤖',
  Clock: '🕒',
  Dashboard: '⊞',
  Map: '🗺️',
  Alerts: '⚠️',
  Settings: '⚙️'
};

export default function App() {
  const [sensorData, setSensorData] = useState({
    garbage_level: 0,
    gas: 0,
    temperature: 0,
    humidity: 0
  });
  const [prediction, setPrediction] = useState('Đang thu thập dữ liệu...');
  const [peakTime, setPeakTime] = useState('Đang thu thập...');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      console.log(`Kết nối WebSocket tới ${WS_URL}...`);
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket kết nối thành công!');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { topic, data } = JSON.parse(event.data);
          if (topic === 'smarthome/bin/sensor_data') {
            setSensorData(prev => ({
              ...prev,
              garbage_level: data.garbage_level !== undefined ? data.garbage_level : prev.garbage_level,
              gas: data.gas !== undefined ? data.gas : prev.gas,
              temperature: data.temperature !== undefined ? parseFloat(data.temperature).toFixed(1) : prev.temperature,
              humidity: data.humidity !== undefined ? data.humidity : prev.humidity
            }));
          } else if (topic === 'smarthome/bin/prediction') {
            if (data.prediction) setPrediction(data.prediction);
            if (data.peak_time) setPeakTime(data.peak_time);
          }
        } catch (e) {
          console.log('Parse error', e);
        }
      };

      ws.onerror = (err) => {
        console.log('WebSocket error', err.message);
      };

      ws.onclose = () => {
        console.log('WebSocket đóng, thử kết nối lại sau 3 giây...');
        setIsConnected(false);
        setTimeout(connect, 3000); // Tự động kết nối lại
      };
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Ngăn auto-reconnect khi unmount
        wsRef.current.close();
      }
    };
  }, []);

  const isGarbageFull = sensorData.garbage_level >= 80;
  const isGasHigh = sensorData.gas > 500;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerIcon, { color: isConnected ? '#10B981' : '#64748B' }]}>
          {Icons.Wifi}
        </Text>
        <Text style={styles.headerTitle}>EcoPulse IoT</Text>
        <Text style={styles.headerIcon}>{Icons.Bell}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Area */}
        <View style={styles.titleArea}>
          <Text style={styles.mainTitle}>Giám sát hệ thống thùng rác Real-time</Text>
          <Text style={styles.subTitle}>Tổng quan dữ liệu cảm biến</Text>
        </View>

        {/* 2x2 Grid */}
        <View style={styles.grid}>
          {/* Card 1 */}
          <View style={[styles.card, styles.cardLeft]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{Icons.Trash}</Text>
              <Text style={styles.cardLabel}>MỨC RÁC HIỆN TẠI</Text>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValue}>{sensorData.garbage_level}</Text>
              <Text style={styles.cardUnit}>%</Text>
            </View>
          </View>

          {/* Card 2 */}
          <View style={[styles.card, styles.cardRight]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{Icons.Wind}</Text>
              <Text style={styles.cardLabel}>NỒNG ĐỘ KHÍ/MÙI</Text>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValue}>{sensorData.gas}</Text>
              <Text style={styles.cardUnit}>ppm</Text>
            </View>
            <View style={[styles.badge, isGasHigh ? styles.badgeDanger : styles.badgeSuccess]}>
              <Text style={[styles.badgeText, isGasHigh ? styles.badgeTextDanger : styles.badgeTextSuccess]}>
                ✓ {isGasHigh ? 'Phát hiện mùi hôi!' : 'Không khí trong lành'}
              </Text>
            </View>
          </View>

          {/* Card 3 */}
          <View style={[styles.card, styles.cardLeft]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{Icons.Temp}</Text>
              <Text style={styles.cardLabel}>NHIỆT ĐỘ BÊN TRONG</Text>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValue}>{sensorData.temperature}</Text>
              <Text style={styles.cardUnit}>°C</Text>
            </View>
          </View>

          {/* Card 4 */}
          <View style={[styles.card, styles.cardRight]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{Icons.Water}</Text>
              <Text style={styles.cardLabel}>ĐỘ ẨM BÊN TRONG</Text>
            </View>
            <View style={styles.cardValueContainer}>
              <Text style={styles.cardValue}>{sensorData.humidity}</Text>
              <Text style={styles.cardUnit}>%</Text>
            </View>
          </View>
        </View>

        {/* Phân tích & Dự báo */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PHÂN TÍCH & DỰ BÁO</Text>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listCardIconContainer}>
            <Text style={styles.listCardIcon}>{Icons.Robot}</Text>
          </View>
          <View style={styles.listCardContent}>
            <Text style={styles.listCardTitle}>AI Dự đoán</Text>
            <Text style={styles.listCardDesc}>{prediction}</Text>
          </View>
        </View>

        <View style={[styles.listCard, { marginBottom: 30 }]}>
          <View style={styles.listCardIconContainer}>
            <Text style={styles.listCardIcon}>{Icons.Clock}</Text>
          </View>
          <View style={styles.listCardContent}>
            <Text style={styles.listCardTitle}>Giờ cao điểm vứt rác</Text>
            <Text style={styles.listCardDesc}>{peakTime}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>{Icons.Dashboard}</Text>
          <Text style={[styles.navText, styles.navActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{Icons.Map}</Text>
          <Text style={styles.navText}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{Icons.Alerts}</Text>
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{Icons.Settings}</Text>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  headerIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleArea: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 34,
    marginBottom: 8
  },
  subTitle: {
    fontSize: 16,
    color: '#64748B'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 6
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    flexShrink: 1
  },
  cardValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardUnit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    marginLeft: 4
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  badgeSuccess: {
    backgroundColor: '#E0F2FE'
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  badgeTextSuccess: {
    color: '#0369A1'
  },
  badgeTextDanger: {
    color: '#B91C1C'
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 1
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  listCardIcon: {
    fontSize: 24
  },
  listCardContent: {
    flex: 1
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4
  },
  listCardDesc: {
    fontSize: 14,
    color: '#64748B'
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  navIcon: {
    fontSize: 20,
    color: '#94A3B8',
    marginBottom: 4
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8'
  },
  navActive: {
    color: '#3B82F6'
  }
});
