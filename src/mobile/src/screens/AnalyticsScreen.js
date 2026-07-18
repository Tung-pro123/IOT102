import React, { useContext, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { WebSocketContext } from '../context/WebSocketContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const { historyData, sensorData, prediction, peakTime, theme, serverIp } = useContext(WebSocketContext);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customHistoryData, setCustomHistoryData] = useState([]);

  // Hàm gọi API lấy dữ liệu lịch sử theo ngày từ Node.js
  const fetchHistoryForDate = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      
      if (dateStr === todayStr) {
        setCustomHistoryData([]);
        return;
      }

      const response = await fetch(`http://${serverIp}:3001/api/history?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setCustomHistoryData(data);
      } else {
        setCustomHistoryData([]);
      }
    } catch (e) {
      console.error("Lỗi lấy lịch sử ngày:", e);
      setCustomHistoryData([]);
    }
  };

  // Xác định lịch sử đang active (Real-time hay Ngày quá khứ)
  const activeHistory = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const selStr = selectedDate.toISOString().split('T')[0];
    return todayStr === selStr ? historyData : customHistoryData;
  }, [historyData, customHistoryData, selectedDate]);

  // Tính toán số liệu thống kê từ lịch sử giống Web
  const stats = useMemo(() => {
    if (!activeHistory || activeHistory.length === 0) {
      return { avgLevel: 0, peakLevel: 0, emptyCount: 0 };
    }

    const levels = activeHistory.map(d => d.actual).filter(v => v !== null && v !== undefined);
    const avgLevel = levels.length > 0 ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0;
    const peakLevel = levels.length > 0 ? Math.max(...levels) : 0;

    // Tìm số lần rác giảm mạnh >= 15% (coi là 1 lần đổ rác)
    let emptyCount = 0;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i-1] <= -15) {
        emptyCount++;
      }
    }

    return { avgLevel, peakLevel, emptyCount };
  }, [activeHistory]);

  // Nhận định AI động
  const cleanCycleText = useMemo(() => {
    if (stats.avgLevel > 0) {
      if (stats.avgLevel > 65) {
        return `Mức rác trung bình gần đây rất cao (${stats.avgLevel}%). AI đề xuất tăng tần suất đổ rác lên ít nhất 2 lần/ngày.`;
      } else if (stats.avgLevel <= 30) {
        return `Mức rác trung bình hiện tại ở mức thấp (${stats.avgLevel}%). Chỉ cần thu gom định kỳ 1 lần/ngày lúc 17:00.`;
      } else {
        return `Lưu lượng rác thải ở mức vừa phải (trung bình ${stats.avgLevel}%). Đề xuất thu gom định kỳ vào lúc 16:30 hằng ngày.`;
      }
    }
    return "Hệ thống đang tích lũy dữ liệu lịch sử nạp xả để phân tích thói quen vứt rác của người dùng và đề xuất chu kỳ dọn dẹp tối ưu.";
  }, [stats.avgLevel]);

  const odorControlText = useMemo(() => {
    if (sensorData.gas >= 500) {
      return `⚠️ Phát hiện khí Gas / Mùi hôi thối vượt ngưỡng báo động (${sensorData.gas} ppm). AI khuyến cáo kiểm tra và dọn dẹp ngay lập tức chất thải hữu cơ dễ phân hủy sinh học, kết hợp đóng khít nắp để ngăn mùi phát tán.`;
    } else if (sensorData.gas > 250) {
      return `💨 Chất lượng không khí bên trong thùng ở mức trung bình (${sensorData.gas} ppm). Nhiệt độ hiện tại là ${sensorData.temperature}°C. Có dấu hiệu bốc mùi nhẹ từ các rác thải ẩm ướt, hãy cân nhắc kiểm tra phân loại rác hữu cơ.`;
    } else {
      return `🟢 Chất lượng không khí bên trong thùng rất tốt (${sensorData.gas} ppm). Nhiệt độ ${sensorData.temperature}°C mát mẻ, giảm thiểu nguy cơ vi khuẩn phân hủy sinh học tạo mùi hôi.`;
    }
  }, [sensorData.gas, sensorData.temperature]);

  // Cấu hình biểu đồ cột tần suất vứt rác theo giờ (tương tự như web)
  const hourlyData = {
    labels: ["0-4h", "4-8h", "8-12h", "12-16h", "16-20h", "20-24h"],
    datasets: [{
      data: [1, 3, 8, 6, 12, 4]
    }]
  };

  // Cấu hình biểu đồ đường biến động rác tích lũy
  const lineChartPoints = useMemo(() => {
    if (!activeHistory || activeHistory.length === 0) {
      return {
        labels: ["-4h", "-3h", "-2h", "-1h", "Now"],
        data: [0, 0, 0, 0, 0]
      };
    }
    
    // Lấy tối đa 5 điểm trải đều từ dữ liệu lịch sử để vẽ
    const total = activeHistory.length;
    const maxPoints = 5;
    const step = Math.max(1, Math.floor(total / maxPoints));
    const sampled = [];
    for (let i = 0; i < total; i += step) {
      sampled.push(activeHistory[i]);
      if (sampled.length >= maxPoints) break;
    }

    return {
      labels: sampled.map(d => {
        const parts = (d.time || "").split(" ");
        return parts[0] || "";
      }),
      data: sampled.map(d => d.actual !== null ? d.actual : 0)
    };
  }, [activeHistory]);

  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
    backgroundGradientFrom: theme === 'dark' ? '#0F172A' : '#FFFFFF',
    backgroundGradientTo: theme === 'dark' ? '#0F172A' : '#FFFFFF',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => theme === 'dark' ? `rgba(56, 189, 248, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => theme === 'dark' ? `rgba(148, 163, 184, ${opacity})` : `rgba(71, 85, 105, ${opacity})`,
    style: {
      borderRadius: 20
    },
    propsForDots: {
      r: "5",
      strokeWidth: 2.5,
      stroke: theme === 'dark' ? "#0F172A" : "#FFFFFF"
    },
    propsForBackgroundLines: {
      strokeWidth: 0.5,
      stroke: theme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      strokeDasharray: "5, 5"
    }
  };

  const formattedDateLabel = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const selStr = selectedDate.toISOString().split('T')[0];
    if (todayStr === selStr) return "Hôm nay (Real-time)";
    
    return selectedDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }, [selectedDate]);

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    fetchHistoryForDate(newDate);
  };

  const handleNextDay = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const selStr = selectedDate.toISOString().split('T')[0];
    if (selStr === todayStr) return;

    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    fetchHistoryForDate(newDate);
  };

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
          <Text style={styles.title}>AI Analytics</Text>
          <Text style={styles.subtitle}>Thống kê & Phân tích chuyên sâu</Text>
        </View>

        {/* Bộ chọn ngày thông minh dạng Pager */}
        <View style={styles.dateSelectorContainer}>
          <TouchableOpacity style={styles.dateArrowBtn} onPress={handlePrevDay}>
            <Ionicons name="chevron-back" size={22} color={theme === 'dark' ? '#38BDF8' : '#4F46E5'} />
          </TouchableOpacity>
          
          <Text style={styles.dateLabel}>{formattedDateLabel}</Text>
          
          <TouchableOpacity 
            style={[
              styles.dateArrowBtn, 
              selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && { opacity: 0.3 }
            ]} 
            onPress={handleNextDay}
            disabled={selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]}
          >
            <Ionicons name="chevron-forward" size={22} color={theme === 'dark' ? '#38BDF8' : '#4F46E5'} />
          </TouchableOpacity>
        </View>

        {/* KPI Cards Grid */}
        <View style={styles.kpiGrid}>
          {/* Card 1 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiGlow, { backgroundColor: '#8B5CF6' }]} />
            <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={24} color="#A78BFA" />
            <Text style={styles.kpiLabel}>TRUNG BÌNH</Text>
            <Text style={styles.kpiValue}>{stats.avgLevel}%</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiGlow, { backgroundColor: '#EF4444' }]} />
            <MaterialCommunityIcons name="trending-up" size={24} color="#FCA5A5" />
            <Text style={styles.kpiLabel}>ĐỈNH ĐIỂM</Text>
            <Text style={styles.kpiValue}>{stats.peakLevel}%</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.kpiCard}>
            <View style={[styles.kpiGlow, { backgroundColor: '#10B981' }]} />
            <MaterialCommunityIcons name="recycle" size={24} color="#34D399" />
            <Text style={styles.kpiLabel}>ĐỔ RÁC (7 ngày)</Text>
            <Text style={styles.kpiValue}>{stats.emptyCount} lần</Text>
          </View>
        </View>

        {/* Biểu đồ 1: Biến động rác */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>BIẾN ĐỘNG LƯỢNG RÁC TÍCH LŨY</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.chartWrapper}>
          <LineChart
            data={{
              labels: lineChartPoints.labels,
              datasets: [{
                data: lineChartPoints.data
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Biểu đồ 2: Tần suất vứt rác theo giờ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PHÂN BỐ LƯỢNG RÁC THEO GIỜ</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.chartWrapper}>
          <BarChart
            data={hourlyData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => theme === 'dark' ? `rgba(245, 158, 11, ${opacity})` : `rgba(234, 88, 12, ${opacity})`
            }}
            style={styles.chart}
            verticalLabelRotation={0}
          />
        </View>

        {/* AI Recommendations Panel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI INSIGHTS & RECOMMENDATIONS</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.aiPanel}>
          <View style={styles.aiGlow} />
          
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#818CF8" />
              <Text style={styles.aiCardLabel}>CHU KỲ DỌN DẸP</Text>
            </View>
            <Text style={styles.aiCardText}>{cleanCycleText}</Text>
          </View>

          <View style={[styles.aiCard, { borderTopColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : '#E2E8F0', borderTopWidth: 1, marginTop: 12 }]}>
            <View style={styles.aiCardHeader}>
              <MaterialCommunityIcons name="scent" size={18} color="#C4B5FD" />
              <Text style={styles.aiCardLabel}>KIỂM SOÁT MÙI HÔI</Text>
            </View>
            <Text style={styles.aiCardText}>{odorControlText}</Text>
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
    
    dateSelectorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#FFFFFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.02, shadowRadius: 6, elevation: 1 },
    dateArrowBtn: { padding: 6 },
    dateLabel: { fontSize: 14, fontWeight: 'bold', color: isDark ? '#F8FAFC' : '#0F172A' },

    kpiGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    kpiCard: { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#FFFFFF', width: '31%', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', position: 'relative', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.02, shadowRadius: 6, elevation: 1 },
    kpiGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.8 },
    kpiLabel: { fontSize: 8, fontWeight: 'black', color: isDark ? '#64748B' : '#94A3B8', marginTop: 6, letterSpacing: 0.5 },
    kpiValue: { fontSize: 16, fontWeight: '900', color: isDark ? '#F8FAFC' : '#0F172A', marginTop: 4 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: isDark ? '#94A3B8' : '#475569', letterSpacing: 2, marginRight: 15 },
    sectionLine: { flex: 1, height: 1, backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },

    chartWrapper: { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0', overflow: 'hidden', marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0 : 0.03, shadowRadius: 10, elevation: 2 },
    chart: { marginVertical: 8, borderRadius: 20 },

    aiPanel: { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : '#EEF2FF', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#C7D2FE', overflow: 'hidden', position: 'relative' },
    aiGlow: { position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, backgroundColor: '#6366F1', opacity: isDark ? 0.05 : 0.02 },
    aiCard: { paddingTop: 6 },
    aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    aiCardLabel: { fontSize: 10, fontWeight: 'bold', color: isDark ? '#94A3B8' : '#4F46E5', marginLeft: 6, letterSpacing: 1 },
    aiCardText: { fontSize: 12, color: isDark ? '#CBD5E1' : '#3730A3', lineHeight: 18 }
  });
};
