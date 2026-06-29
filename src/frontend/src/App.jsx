import { useEffect, useState } from 'react'
import mqtt from 'mqtt'

// SVG Icons
const Icons = {
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  ),
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
  ),
  Sensors: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  ),
  Predictions: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
  ),
  Reports: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
  ),
  AI: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1c-.55 0-1 .45-1 1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1c0-.55-.45-1-1-1h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z"></path><path d="M9 13v-1a3 3 0 0 1 6 0v1"></path></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  )
}

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối MQTT...')
  const [isConnected, setIsConnected] = useState(false)
  const [sensorData, setSensorData] = useState({
    garbage_level: 0,
    gas: 0,
    temperature: 0,
    humidity: 0,
    is_lid_open: false
  })
  const [prediction, setPrediction] = useState('Đang thu thập dữ liệu...')
  const [peakTime, setPeakTime] = useState('Đang thu thập...')

  useEffect(() => {
    const brokerUrl = "wss://test.mosquitto.org:8081/mqtt"
    const client = mqtt.connect(brokerUrl)

    client.on("connect", () => {
      setConnectionStatus("Đã kết nối Live (MQTT)")
      setIsConnected(true)
      client.subscribe("smarthome/bin/sensor_data")
      client.subscribe("smarthome/bin/prediction")
    })

    client.on("message", (topic, message) => {
      try {
        const data = JSON.parse(message.toString())
        if (topic === "smarthome/bin/sensor_data") {
          setSensorData(prev => ({
            ...prev,
            garbage_level: data.garbage_level !== undefined ? data.garbage_level : prev.garbage_level,
            gas: data.gas !== undefined ? data.gas : prev.gas,
            temperature: data.temperature !== undefined ? parseFloat(data.temperature).toFixed(1) : prev.temperature,
            humidity: data.humidity !== undefined ? data.humidity : prev.humidity,
            is_lid_open: data.is_lid_open !== undefined ? data.is_lid_open : prev.is_lid_open
          }))
        } else if (topic === "smarthome/bin/prediction") {
          if (data.prediction) setPrediction(data.prediction)
          if (data.peak_time) setPeakTime(data.peak_time)
        }
      } catch (error) {
        console.error("Lỗi parse JSON: ", error)
      }
    })

    return () => client.end()
  }, [])

  const isGarbageFull = sensorData.garbage_level >= 80
  const isGasHigh = sensorData.gas > 500

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#F8F9FA] border-r border-slate-200 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="text-slate-700">
              <Icons.Trash />
            </div>
            <h1 className="font-bold text-lg leading-tight">Smart Waste<br/>Management</h1>
          </div>
          
          <nav className="px-4 mt-2 flex flex-col gap-1">
            <button className="flex items-center gap-3 w-full px-4 py-3 bg-black text-white rounded-lg font-medium text-sm transition">
              <Icons.Dashboard />
              Dashboard
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg font-medium text-sm transition">
              <Icons.Analytics />
              Analytics
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg font-medium text-sm transition">
              <Icons.Sensors />
              Sensors
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg font-medium text-sm transition">
              <Icons.Predictions />
              Predictions
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg font-medium text-sm transition">
              <Icons.Reports />
              Reports
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          <button className="flex justify-center items-center gap-2 w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm shadow-sm transition">
            <Icons.Download />
            Export Report
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-10">
          <div className="md:hidden flex items-center gap-2">
             <h1 className="font-bold text-lg">Smart Waste</h1>
          </div>
          <div className="hidden md:block"></div> {/* Spacer */}
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span className={`text-sm font-semibold ${isConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                {connectionStatus}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <button className="text-slate-400 hover:text-slate-600 transition">
              <Icons.Bell />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition">
              <Icons.Settings />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Giám sát hệ thống thùng rác Real-time</h2>
            <p className="text-slate-500">Tổng quan dữ liệu cảm biến và dự đoán AI.</p>
          </div>

          {/* Cảnh báo */}
          {isGarbageFull && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-8 rounded-xl shadow-sm flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">⚠️</div>
              <div>
                <p className="font-bold">Cảnh báo khẩn cấp!</p>
                <p className="text-sm">Thùng rác đã vượt mức 80%, yêu cầu dọn dẹp ngay lập tức để tránh tràn rác.</p>
              </div>
            </div>
          )}

          {/* Grid 5 Cảm biến */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
              <div className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Mức rác hiện tại</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black tracking-tight text-slate-900">{sensorData.garbage_level}</span>
                <span className="text-xl font-bold text-slate-400">%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${isGarbageFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${sensorData.garbage_level}%` }}
                ></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-md transition">
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
              <div className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Nồng độ khí / Mùi</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-black tracking-tight text-slate-900">{sensorData.gas}</span>
                <span className="text-xl font-bold text-slate-400">ppm</span>
              </div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 ${isGasHigh ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isGasHigh ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                {isGasHigh ? 'Phát hiện mùi hôi!' : 'Không khí trong lành'}
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
              <div>
                <div className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Nhiệt độ bên trong</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight text-slate-900">{sensorData.temperature}</span>
                  <span className="text-xl font-bold text-slate-400">°C</span>
                </div>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-6">Đo lường bằng DHT11</div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div>
                <div className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Độ ẩm bên trong</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tight text-slate-900">{sensorData.humidity}</span>
                  <span className="text-xl font-bold text-slate-400">%</span>
                </div>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-6">Đo lường bằng DHT11</div>
            </div>

            {/* Card 5 - Trạng thái nắp */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden hover:shadow-md transition flex flex-col justify-between">
              <div className={`absolute top-0 left-0 w-full h-1 ${sensorData.is_lid_open ? 'bg-cyan-500' : 'bg-slate-400'}`}></div>
              <div>
                <div className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Trạng thái Nắp</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black tracking-tight text-slate-900">
                    {sensorData.is_lid_open ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                  </span>
                </div>
              </div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 ${sensorData.is_lid_open ? 'text-cyan-700 bg-cyan-50' : 'text-slate-700 bg-slate-50'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${sensorData.is_lid_open ? 'bg-cyan-500' : 'bg-slate-400'}`}></div>
                {sensorData.is_lid_open ? 'Sẵn sàng bỏ rác' : 'Nắp đang đóng'}
              </div>
            </div>

          </div>

          {/* Grid 2 AI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* AI Prediction */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-8 right-8 text-indigo-50 opacity-50">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1c-.55 0-1 .45-1 1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1c0-.55-.45-1-1-1h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z"></path><path d="M9 13v-1a3 3 0 0 1 6 0v1"></path></svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="text-indigo-600"><Icons.AI /></div>
                  <div className="text-indigo-600 text-xs font-bold uppercase tracking-wider">AI Dự đoán (Machine Learning)</div>
                </div>
                <div className="text-2xl font-bold text-slate-900 max-w-[80%] leading-snug">
                  {prediction}
                </div>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-10">Cập nhật liên tục dựa trên thuật toán Linear Regression</div>
            </div>

            {/* Peak Time */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-8 right-8 text-pink-50 opacity-50">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="text-pink-600"><Icons.Clock /></div>
                  <div className="text-pink-600 text-xs font-bold uppercase tracking-wider">Giờ cao điểm vứt rác</div>
                </div>
                <div className="text-2xl font-bold text-slate-900 max-w-[80%] leading-snug">
                  {peakTime}
                </div>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-10">Dựa trên phân tích thói quen người dùng 7 ngày qua</div>
            </div>

          </div>

        </div>
      </main>

    </div>
  )
}

export default App
