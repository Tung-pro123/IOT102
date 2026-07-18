import { useEffect, useState, useMemo } from 'react'
import mqtt from 'mqtt'

// Import components
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Analytics from './components/Analytics'
import Sensors from './components/Sensors'
import Predictions from './components/Predictions'
import Reports from './components/Reports'
import { Icons } from './components/Icons'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme] = useState('light') // 'light', 'dark', 'cyber'
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối MQTT...')
  const [isConnected, setIsConnected] = useState(false)
  
  // Tự động phát hiện Backend URL
  const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  
  const [sensorData, setSensorData] = useState({
    garbage_level: 0,
    gas: 0,
    temperature: 0,
    humidity: 0,
    is_lid_open: false
  })
  
  const [prediction, setPrediction] = useState('Đang thu thập dữ liệu...')
  const [peakTime, setPeakTime] = useState('Đang thu thập...')
  const [historyData, setHistoryData] = useState([])
  const [timeframe, setTimeframe] = useState('24h') // '24h', '3days', '7days'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [customHistory, setCustomHistory] = useState(null) // null có nghĩa là đang xem ngày hiện tại (Real-time)
  const [logsList, setLogsList] = useState([
    "Chưa có hoạt động nào được ghi nhận. Hãy tương tác với thiết bị!",
  ])

  // Settings States
  const [trashThreshold, setTrashThreshold] = useState(() => Number(localStorage.getItem('trashThreshold')) || 80)
  const [gasThreshold, setGasThreshold] = useState(() => Number(localStorage.getItem('gasThreshold')) || 500)
  const [binHeight, setBinHeight] = useState(() => Number(localStorage.getItem('binHeight')) || 25)
  const [speakerVolume, setSpeakerVolume] = useState(() => Number(localStorage.getItem('speakerVolume')) || 18)

  // Settings Temp States (for editing in Modal)
  const [tempTrashThreshold, setTempTrashThreshold] = useState(trashThreshold)
  const [tempGasThreshold, setTempGasThreshold] = useState(gasThreshold)
  const [tempBinHeight, setTempBinHeight] = useState(binHeight)
  const [tempSpeakerVolume, setTempSpeakerVolume] = useState(speakerVolume)

  // Modal & Dropdown visibility
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Sync temp states when Modal opens
  useEffect(() => {
    if (showSettings) {
      setTempTrashThreshold(trashThreshold)
      setTempGasThreshold(gasThreshold)
      setTempBinHeight(binHeight)
      setTempSpeakerVolume(speakerVolume)
    }
  }, [showSettings, trashThreshold, gasThreshold, binHeight, speakerVolume])

  // Notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Hệ thống Smart Waste đã khởi chạy thành công.", time: "Vừa xong", type: "info", read: false }
  ])

  const isGarbageFull = sensorData.garbage_level >= trashThreshold
  const isGasHigh = sensorData.gas >= gasThreshold

  const publishControl = async (command) => {
    try {
      await fetch(`${apiUrl}/api/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      console.log(`📤 Đã gửi lệnh điều khiển: ${command}`);
    } catch (e) {
      console.error('Lỗi gửi lệnh điều khiển:', e);
    }
  };

  const handleDateChange = async (dateStr) => {
    setSelectedDate(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) {
      setCustomHistory(null);
    } else {
      try {
        const response = await fetch(`${apiUrl}/api/history?date=${dateStr}`);
        if (response.ok) {
          const data = await response.json();
          setCustomHistory(data);
        } else {
          console.error("Lỗi khi tải dữ liệu lịch sử");
          setCustomHistory([]);
        }
      } catch (err) {
        console.error("Lỗi kết nối API:", err);
        setCustomHistory([]);
      }
    }
  };

  useEffect(() => {
    let socket;
    let isMounted = true;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        if (isMounted) {
          setConnectionStatus("Đã kết nối Live (Backend WS)");
          setIsConnected(true);
        }
      };

      socket.onmessage = (event) => {
        try {
          const { topic, data } = JSON.parse(event.data);

          if (topic === "smarthome/bin/sensor_data") {
            setSensorData(prev => {
              const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const newLogs = [];
              
              if (data.is_lid_open !== undefined && data.is_lid_open !== prev.is_lid_open) {
                newLogs.push(`${timeStr} - Nắp thùng rác vừa ${data.is_lid_open ? 'MỞ 🔓' : 'ĐÓNG 🔒'}`);
              }
              if (data.garbage_level !== undefined && data.garbage_level !== prev.garbage_level) {
                newLogs.push(`${timeStr} - Cập nhật mức rác: ${data.garbage_level}%`);
                if (data.garbage_level >= trashThreshold) {
                  newLogs.push(`${timeStr} - ⚠️ CẢNH BÁO: Thùng rác đã đầy trên ${trashThreshold}%!`);
                }
              }
              if (data.gas !== undefined && data.gas > gasThreshold && prev.gas <= gasThreshold) {
                newLogs.push(`${timeStr} - 💨 CẢNH BÁO: Phát hiện mùi hôi thối vượt ngưỡng (${data.gas} ppm)`);
              }
              
              if (newLogs.length > 0) {
                setLogsList(prevLogs => {
                  const filtered = prevLogs.filter(l => !l.includes("Chưa có hoạt động"));
                  return [...newLogs, ...filtered].slice(0, 5);
                });
              }

              return {
                ...prev,
                garbage_level: data.garbage_level !== undefined ? data.garbage_level : prev.garbage_level,
                gas: data.gas !== undefined ? data.gas : prev.gas,
                temperature: data.temperature !== undefined ? parseFloat(data.temperature).toFixed(1) : prev.temperature,
                humidity: data.humidity !== undefined ? data.humidity : prev.humidity,
                is_lid_open: data.is_lid_open !== undefined ? data.is_lid_open : prev.is_lid_open
              };
            });
          } else if (topic === "smarthome/bin/prediction") {
            if (data.prediction) setPrediction(data.prediction);
            if (data.peak_time) setPeakTime(data.peak_time);
            if (data.history && data.history.length > 0) setHistoryData(data.history);
          }
        } catch (error) {
          console.error("Lỗi parse JSON: ", error);
        }
      };

      socket.onclose = () => {
        if (isMounted) {
          setConnectionStatus("Mất kết nối Backend (Đang thử lại...)");
          setIsConnected(false);
          setTimeout(() => {
            if (isMounted) connectWS();
          }, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("Lỗi WebSocket:", err);
      };
    };

    connectWS();

    return () => {
      isMounted = false;
      if (socket) socket.close();
    };
  }, [trashThreshold, gasThreshold])

  // Trigger notifications when sensorData violates thresholds
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    
    if (isGarbageFull) {
      setNotifications(prev => {
        if (prev.length > 0 && prev[0].text.includes("Mức rác đạt ngưỡng")) return prev;
        return [
          { id: Date.now(), text: `⚠️ CẢNH BÁO: Mức rác đạt ngưỡng đầy ${sensorData.garbage_level}% (Cấu hình: ${trashThreshold}%)`, time: timeStr, type: "warning", read: false },
          ...prev
        ].slice(0, 8);
      });
    }

    if (isGasHigh) {
      setNotifications(prev => {
        if (prev.length > 0 && prev[0].text.includes("Phát hiện mùi hôi thối")) return prev;
        return [
          { id: Date.now() + 1, text: `💨 CẢNH BÁO: Phát hiện mùi hôi thối ${sensorData.gas} ppm (Cấu hình: ${gasThreshold} ppm)`, time: timeStr, type: "warning", read: false },
          ...prev
        ].slice(0, 8);
      });
    }
  }, [isGarbageFull, isGasHigh, sensorData.garbage_level, sensorData.gas, trashThreshold, gasThreshold])


  const now = new Date();
  const formatTime = (date) => date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
  const formatDate = (date) => formatTime(date) + " " + date.getDate().toString().padStart(2, '0') + '/' + (date.getMonth() + 1).toString().padStart(2, '0');

  const timeMinus6h = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const timeMinus4h = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const timeMinus2h = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  const timePlus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const timePlus4h = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const currentTimeStr = formatDate(now) + " (Hiện tại)";

  const chartData = useMemo(() => {
    if (customHistory !== null) {
      if (customHistory.length === 0) {
        return [{ time: "Không có dữ liệu", actual: 0, prediction: null }];
      }
      return customHistory;
    }

    if (historyData.length === 0) {
      return [
        { time: formatDate(timeMinus6h), actual: 0, prediction: null },
        { time: formatDate(timeMinus4h), actual: 0, prediction: null },
        { time: formatDate(timeMinus2h), actual: 0, prediction: null },
        { time: currentTimeStr, actual: sensorData.garbage_level || 0, prediction: sensorData.garbage_level || 0 },
        { time: formatDate(timePlus2h) + " (Dự báo)", actual: null, prediction: Math.round((sensorData.garbage_level || 0) + (100 - (sensorData.garbage_level || 0)) / 2) },
        { time: formatDate(timePlus4h) + " (Đầy 100%)", actual: null, prediction: 100 }
      ];
    }

    const nowPoint = historyData.find(p => p.time && p.time.includes("(Hiện tại)"));
    const nowTs = nowPoint ? nowPoint.timestamp : (Date.now() / 1000);

    let secondsLimit = 24 * 3600; 
    if (timeframe === '3days') secondsLimit = 3 * 24 * 3600;
    else if (timeframe === '7days') secondsLimit = 7 * 24 * 3600;

    return historyData.filter(p => {
      if (p.timestamp >= nowTs) return true;
      return (nowTs - p.timestamp) <= secondsLimit;
    });
  }, [historyData, timeframe, sensorData.garbage_level, customHistory]);

  const currentPoint = chartData.find(p => p.time && p.time.includes("(Hiện tại)"));
  const currentLabel = currentPoint ? currentPoint.time : currentTimeStr;
  const currentY = currentPoint ? (currentPoint.actual ?? currentPoint.prediction ?? 0) : (sensorData.garbage_level || 0);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            sensorData={sensorData}
            publishControl={publishControl}
            isGarbageFull={isGarbageFull}
            isGasHigh={isGasHigh}
            logsList={logsList}
            theme={theme}
            historyData={historyData}
          />
        )
      case 'analytics':
        return <Analytics historyData={historyData} theme={theme} sensorData={sensorData} />
      case 'sensors':
        return <Sensors sensorData={sensorData} theme={theme} />
      case 'predictions':
        return (
          <Predictions
            prediction={prediction}
            peakTime={peakTime}
            chartData={chartData}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            selectedDate={selectedDate}
            handleDateChange={handleDateChange}
            customHistory={customHistory}
            currentLabel={currentLabel}
            currentY={currentY}
            sensorData={sensorData}
            theme={theme}
          />
        )
      case 'reports':
        return <Reports theme={theme} />
      default:
        return (
          <Dashboard
            sensorData={sensorData}
            publishControl={publishControl}
            isGarbageFull={isGarbageFull}
            isGasHigh={isGasHigh}
            logsList={logsList}
            theme={theme}
            historyData={historyData}
          />
        )
    }
  }

  const headerStylesMap = {
    light: {
      header: 'bg-white border-slate-200',
      title: 'text-slate-900',
      sub: 'text-emerald-600',
      border: 'bg-slate-200'
    },
    dark: {
      header: 'bg-[#1E293B] border-slate-800',
      title: 'text-white',
      sub: 'text-emerald-400',
      border: 'bg-slate-700'
    },
    cyber: {
      header: 'bg-[#02130C] border-emerald-950/60 font-mono',
      title: 'text-emerald-400',
      sub: 'text-emerald-400',
      border: 'bg-emerald-950'
    }
  };
  const headerStyles = headerStylesMap[theme] || headerStylesMap.light;

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-300 ${
      theme === 'cyber' ? 'bg-[#010906] text-emerald-300 font-mono' : theme === 'dark' ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F8F9FA] text-slate-800'
    }`}>
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Top Header */}
        <header className={`px-8 py-4 flex flex-wrap justify-between items-center border-b sticky top-0 z-10 transition-all duration-300 gap-4 ${headerStyles.header}`}>
          <div className="md:hidden flex items-center gap-2">
            <h1 className={`font-bold text-lg ${headerStyles.title}`}>Smart Waste</h1>
          </div>
          
          {/* Mobile Tab Selectors */}
          <div className="md:hidden flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
            <button onClick={() => setActiveTab('dashboard')} className={`px-2 py-1 rounded-md ${activeTab==='dashboard'?'bg-white text-slate-900 shadow-sm':''}`}>Dash</button>
            <button onClick={() => setActiveTab('analytics')} className={`px-2 py-1 rounded-md ${activeTab==='analytics'?'bg-white text-slate-900 shadow-sm':''}`}>Analytic</button>
            <button onClick={() => setActiveTab('sensors')} className={`px-2 py-1 rounded-md ${activeTab==='sensors'?'bg-white text-slate-900 shadow-sm':''}`}>Sensor</button>
            <button onClick={() => setActiveTab('predictions')} className={`px-2 py-1 rounded-md ${activeTab==='predictions'?'bg-white text-slate-900 shadow-sm':''}`}>AI</button>
            <button onClick={() => setActiveTab('reports')} className={`px-2 py-1 rounded-md ${activeTab==='reports'?'bg-white text-slate-900 shadow-sm':''}`}>Report</button>
          </div>

          {/* Theme Selector Toggle (Giữa/Trái) */}
          <div className={`flex p-0.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
            theme === 'cyber' ? 'bg-[#010906] border-emerald-950/80 text-emerald-600' : theme === 'dark' ? 'bg-[#0F172A] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              ☀️ Sáng
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                theme === 'dark' ? 'bg-[#1E293B] text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              🌙 Tối
            </button>
            <button
              onClick={() => setTheme('cyber')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 ${
                theme === 'cyber' ? 'bg-[#02130C]/90 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'hover:text-emerald-400'
              }`}
            >
              ☣️ Cyber Eco
            </button>
          </div>

          <div className="flex items-center gap-6 ml-auto md:ml-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${headerStyles.sub}`}>
                {connectionStatus}
              </span>
            </div>
            <div className={`h-6 w-px transition-all duration-300 ${headerStyles.border}`}></div>
            {/* Bell Notification Toggle */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }
                }}
                className="text-slate-400 hover:text-slate-600 transition relative flex items-center"
              >
                <Icons.Bell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl border p-4 shadow-xl z-50 transition-all duration-300 ${
                  theme === 'cyber' ? 'bg-[#02130C] border-emerald-500/30 text-emerald-400' : theme === 'dark' ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs">🔔 Thông báo hệ thống</span>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[9px] font-bold text-rose-500 hover:underline"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-center text-slate-400 py-4">Không có thông báo mới</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="text-[10px] flex items-start gap-2 leading-relaxed">
                          <span className={n.type === 'warning' ? 'text-rose-500' : 'text-indigo-500'}>
                            {n.type === 'warning' ? '⚠️' : 'ℹ️'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-left">{n.text}</p>
                            <span className="text-[9px] text-slate-400 block text-left">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Modal Toggle Button */}
            <button 
              onClick={() => setShowSettings(true)}
              className="text-slate-400 hover:text-slate-600 transition flex items-center"
            >
              <Icons.Settings />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Container (Xóa max-w-7xl để lấp đầy khoảng trống ngang) */}
        <div className="p-8 w-full flex-1 transition-all duration-300">
          {renderTabContent()}
        </div>

      </main>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all duration-300 ${
            theme === 'cyber' ? 'bg-[#02130C] border-emerald-500/40 text-emerald-400 font-mono' : theme === 'dark' ? 'bg-[#1E293B] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              ⚙️ Cấu hình Hệ thống (IoT Configuration)
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Ngưỡng đầy rác */}
              <div>
                <label className="block font-semibold mb-1 text-left">Ngưỡng cảnh báo đầy (%): {tempTrashThreshold}%</label>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={tempTrashThreshold} 
                  onChange={(e) => setTempTrashThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 animate-none"
                />
              </div>

              {/* Ngưỡng khí gas */}
              <div>
                <label className="block font-semibold mb-1 text-left">Ngưỡng chất lượng không khí (Gas ppm):</label>
                <input 
                  type="number" 
                  min="100" 
                  max="1000" 
                  value={tempGasThreshold} 
                  onChange={(e) => setTempGasThreshold(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                    theme === 'cyber' ? 'bg-[#010906] border-emerald-950 text-emerald-400' : theme === 'dark' ? 'bg-[#0F172A] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Chiều cao thùng */}
              <div>
                <label className="block font-semibold mb-1 text-left">Chiều cao lòng thùng chứa (cm):</label>
                <input 
                  type="number" 
                  min="10" 
                  max="100" 
                  value={tempBinHeight} 
                  onChange={(e) => setTempBinHeight(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                    theme === 'cyber' ? 'bg-[#010906] border-emerald-950 text-emerald-400' : theme === 'dark' ? 'bg-[#0F172A] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Âm lượng DFPlayer */}
              <div>
                <label className="block font-semibold mb-1 text-left">Âm lượng loa DFPlayer (0-30): {tempSpeakerVolume}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={tempSpeakerVolume} 
                  onChange={(e) => setTempSpeakerVolume(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 animate-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  theme === 'cyber' ? 'border-slate-850 text-slate-400 hover:bg-slate-950' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setTrashThreshold(tempTrashThreshold);
                  setGasThreshold(tempGasThreshold);
                  setBinHeight(tempBinHeight);
                  setSpeakerVolume(tempSpeakerVolume);
                  localStorage.setItem('trashThreshold', tempTrashThreshold);
                  localStorage.setItem('gasThreshold', tempGasThreshold);
                  localStorage.setItem('binHeight', tempBinHeight);
                  localStorage.setItem('speakerVolume', tempSpeakerVolume);
                  
                  // Publish MQTT config payload
                  publishControl(`config:${tempTrashThreshold}:${tempGasThreshold}:${tempBinHeight}:${tempSpeakerVolume}`);
                  
                  setShowSettings(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl text-white transition ${
                  theme === 'cyber' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
