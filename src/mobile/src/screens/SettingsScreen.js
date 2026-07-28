import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, StatusBar } from 'react-native';
import { WebSocketContext } from '../context/WebSocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { serverIp, setServerIp, sendCommand, isConnected, theme, changeTheme } = useContext(WebSocketContext);
  const [ipInput, setIpInput] = useState(serverIp);
  const [trashThreshold, setTrashThreshold] = useState('80');
  const [gasThreshold, setGasThreshold] = useState('500');
  const [tempThreshold, setTempThreshold] = useState('29');
  const [binHeight, setBinHeight] = useState(25); // Mặc định 25 cm
  const [speakerVolume, setSpeakerVolume] = useState(18); // Mặc định 18 (từ 0 đến 30)

  // Load cấu hình lưu trữ khi mở tab Cài đặt
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedTrash = await AsyncStorage.getItem('CFG_TRASH');
        const savedGas = await AsyncStorage.getItem('CFG_GAS');
        const savedTemp = await AsyncStorage.getItem('CFG_TEMP');
        const savedHeight = await AsyncStorage.getItem('CFG_HEIGHT');
        const savedVolume = await AsyncStorage.getItem('CFG_VOLUME');
        
        if (savedTrash) setTrashThreshold(savedTrash);
        if (savedGas) setGasThreshold(savedGas);
        if (savedTemp) setTempThreshold(savedTemp);
        if (savedHeight) setBinHeight(Number(savedHeight));
        if (savedVolume) setSpeakerVolume(Number(savedVolume));
      } catch (e) {
        console.error('Error loading config', e);
      }
    };
    loadConfig();
  }, []);

  const handleSaveIp = async () => {
    try {
      await AsyncStorage.setItem('SERVER_IP', ipInput);
      setServerIp(ipInput);
      Alert.alert('Thành công', 'Đã lưu địa chỉ IP Server. Ứng dụng sẽ tự động kết nối lại.');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu IP');
    }
  };

  const handleSaveConfig = async () => {
    if (!isConnected) {
      Alert.alert('Lỗi', 'Chưa kết nối đến Server, không thể gửi cấu hình.');
      return;
    }
    // Định dạng lệnh config: config:TrashThreshold:GasThreshold:BinHeight:SpeakerVolume:TempThreshold
    const cmd = `config:${trashThreshold}:${gasThreshold}:${binHeight}:${speakerVolume}:${tempThreshold}`;
    sendCommand(cmd);

    try {
      await AsyncStorage.setItem('CFG_TRASH', trashThreshold);
      await AsyncStorage.setItem('CFG_GAS', gasThreshold);
      await AsyncStorage.setItem('CFG_TEMP', tempThreshold);
      await AsyncStorage.setItem('CFG_HEIGHT', String(binHeight));
      await AsyncStorage.setItem('CFG_VOLUME', String(speakerVolume));
      Alert.alert('Đồng bộ thành công', `Đã đồng bộ thông số cấu hình:\n- Ngưỡng rác: ${trashThreshold}%\n- Ngưỡng gas: ${gasThreshold} ppm\n- Ngưỡng nhiệt độ: ${tempThreshold}°C\n- Chiều cao thùng: ${binHeight} cm\n- Âm lượng loa: ${speakerVolume}/30`);
    } catch (e) {
      console.error('Error saving config', e);
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#020617' : '#F8FAFC'} 
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>System Settings</Text>
          <Text style={styles.subtitle}>Cấu hình Kết nối & Phần cứng</Text>
        </View>

        {/* Section 1: Giao diện ứng dụng */}
        <View style={[styles.section, { borderColor: theme === 'dark' ? '#818CF8' : '#6366F1' }]}>
          <View style={[styles.sectionGlow, { backgroundColor: theme === 'dark' ? '#818CF8' : '#6366F1' }]} />
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={theme === 'dark' ? '#818CF8' : '#6366F1'} />
            <Text style={[styles.sectionTitle, { color: theme === 'dark' ? '#818CF8' : '#6366F1' }]}>GIAO DIỆN ỨNG DỤNG</Text>
          </View>
          <Text style={styles.helpText}>Chọn chế độ màu nền Sáng hoặc Tối cho giao diện ứng dụng di động.</Text>
          
          <View style={styles.themeSelectorRow}>
            <TouchableOpacity 
              style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]} 
              onPress={() => changeTheme('light')}
            >
              <Ionicons name="sunny" size={20} color={theme === 'light' ? '#4F46E5' : '#94A3B8'} />
              <Text style={[styles.themeBtnText, theme === 'light' && styles.themeBtnTextActive]}>CHẾ ĐỘ SÁNG</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]} 
              onPress={() => changeTheme('dark')}
            >
              <Ionicons name="moon" size={20} color={theme === 'dark' ? '#38BDF8' : '#94A3B8'} />
              <Text style={[styles.themeBtnText, theme === 'dark' && styles.themeBtnTextActive]}>CHẾ ĐỘ TỐI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Địa chỉ IP */}
        <View style={styles.section}>
          <View style={styles.sectionGlow} />
          <View style={styles.sectionHeader}>
            <Ionicons name="wifi" size={24} color="#38BDF8" />
            <Text style={styles.sectionTitle}>ĐỊA CHỈ IP SERVER</Text>
          </View>
          <Text style={styles.helpText}>Đổi IP này trùng với IP mạng Wi-Fi hiện tại của máy chủ (Node.js).</Text>
          
          <TextInput 
            style={styles.input}
            value={ipInput}
            onChangeText={setIpInput}
            placeholder="192.168.1.xxx"
            placeholderTextColor="#475569"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.btnSave} onPress={handleSaveIp}>
            <Text style={styles.btnSaveText}>LƯU & KẾT NỐI LẠI</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Cấu hình phần cứng */}
        <View style={[styles.section, { borderColor: '#F59E0B' }]}>
          <View style={[styles.sectionGlow, { backgroundColor: '#F59E0B' }]} />
          <View style={styles.sectionHeader}>
            <Ionicons name="hardware-chip" size={24} color="#FBBF24" />
            <Text style={[styles.sectionTitle, { color: '#FBBF24' }]}>CẤU HÌNH PHẦN CỨNG IoT</Text>
          </View>
          <Text style={styles.helpText}>Cập nhật các thông số hoạt động của thùng rác xuống thiết bị Arduino Uno.</Text>
          
          <Text style={styles.label}>Ngưỡng rác đầy (%)</Text>
          <TextInput 
            style={[styles.input, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}
            value={trashThreshold}
            onChangeText={setTrashThreshold}
            keyboardType="numeric"
            placeholderTextColor="#475569"
          />

          <Text style={styles.label}>Ngưỡng khí gas (ppm)</Text>
          <TextInput 
            style={[styles.input, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}
            value={gasThreshold}
            onChangeText={setGasThreshold}
            keyboardType="numeric"
            placeholderTextColor="#475569"
          />

          <Text style={styles.label}>Ngưỡng nhiệt độ cảnh báo (°C)</Text>
          <TextInput 
            style={[styles.input, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}
            value={tempThreshold}
            onChangeText={setTempThreshold}
            keyboardType="numeric"
            placeholderTextColor="#475569"
          />

          <Text style={styles.label}>Chiều cao thùng rác vật lý (cm)</Text>
          <View style={[styles.stepperContainer, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => setBinHeight(h => Math.max(10, h - 5))}
            >
              <Ionicons name="remove" size={18} color={theme === 'dark' ? '#38BDF8' : '#4F46E5'} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{binHeight} cm</Text>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => setBinHeight(h => Math.min(150, h + 5))}
            >
              <Ionicons name="add" size={18} color={theme === 'dark' ? '#38BDF8' : '#4F46E5'} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Âm lượng loa DFPlayer Mini (0-30)</Text>
          <View style={[styles.stepperContainer, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => setSpeakerVolume(v => Math.max(0, v - 2))}
            >
              <Ionicons name="volume-mute" size={18} color={theme === 'dark' ? '#38BDF8' : '#4F46E5'} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{speakerVolume} / 30</Text>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => setSpeakerVolume(v => Math.min(30, v + 2))}
            >
              <Ionicons name="volume-high" size={18} color={theme === 'dark' ? '#38BDF8' : '#4F46E5'} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.btnSave, { backgroundColor: '#F59E0B' }]} onPress={handleSaveConfig}>
            <Text style={[styles.btnSaveText, { color: '#020617' }]}>ĐỒNG BỘ XUỐNG THIẾT BỊ</Text>
          </TouchableOpacity>
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
    
    section: { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#FFFFFF', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: isDark ? '#38BDF8' : '#E2E8F0', position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0 : 0.03, shadowRadius: 10, elevation: 2 },
    sectionGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#38BDF8', opacity: 0.8 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: isDark ? '#38BDF8' : '#4F46E5', marginLeft: 10, letterSpacing: 1 },
    helpText: { fontSize: 13, color: isDark ? '#94A3B8' : '#475569', marginBottom: 20, lineHeight: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: isDark ? '#CBD5E1' : '#475569', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: 20, backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC' },
    btnSave: { backgroundColor: isDark ? '#38BDF8' : '#4F46E5', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
    btnSaveText: { color: isDark ? '#020617' : '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },

    themeSelectorRow: { flexDirection: 'row', justifyContent: 'space-between' },
    themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', marginHorizontal: 4, backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#F8FAFC' },
    themeBtnActive: { borderColor: isDark ? '#38BDF8' : '#4F46E5', backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#EEF2FF' },
    themeBtnText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12, marginLeft: 8, letterSpacing: 0.5 },
    themeBtnTextActive: { color: isDark ? '#38BDF8' : '#4F46E5' },

    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20, backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC' },
    stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
    stepValue: { fontSize: 16, fontWeight: 'bold', color: isDark ? '#F8FAFC' : '#0F172A' },
  });
};
