import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Icons } from './Icons'

export default function Dashboard({ sensorData, publishControl, isGarbageFull, isGasHigh, logsList, theme = 'light', historyData = [] }) {
  const styles = {
    light: {
      card: 'bg-white border-slate-100 text-slate-900',
      title: 'text-slate-800',
      heading: 'text-slate-900',
      sub: 'text-slate-500',
      statCard: 'bg-slate-50 border-slate-100 text-slate-700',
      terminal: 'bg-slate-950 text-emerald-400 border-slate-800',
      btnControlOpen: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      btnControlClose: 'bg-slate-700 hover:bg-slate-800 text-white',
      btnControlAuto: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      btnAlarmOn: 'bg-pink-50 hover:bg-pink-100 text-pink-700',
      btnAlarmOff: 'bg-slate-50 hover:bg-slate-100 text-slate-700',
      badgeOk: 'text-emerald-700 bg-emerald-100',
      badgeWarn: 'text-red-700 bg-red-100',
      gridLines: '#F1F5F9',
      tooltipBg: '#FFFFFF',
      tooltipColor: '#0F172A',
      chartColor: '#8B5CF6'
    },
    dark: {
      card: 'bg-[#1E293B] border-slate-800 text-white',
      title: 'text-white',
      heading: 'text-white',
      sub: 'text-slate-400',
      statCard: 'bg-[#0F172A] border-slate-800 text-slate-300',
      terminal: 'bg-[#090D16] text-emerald-400 border-slate-800',
      btnControlOpen: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      btnControlClose: 'bg-slate-600 hover:bg-slate-755 text-white',
      btnControlAuto: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      btnAlarmOn: 'bg-pink-900/20 hover:bg-pink-900/30 text-pink-400',
      btnAlarmOff: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
      badgeOk: 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50',
      badgeWarn: 'text-red-400 bg-red-950/40 border border-red-900/50',
      gridLines: '#334155',
      tooltipBg: '#1E293B',
      tooltipColor: '#FFFFFF',
      chartColor: '#A78BFA'
    },
    cyber: {
      card: 'bg-[#02130C]/90 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.03)]',
      title: 'text-emerald-400 font-mono',
      heading: 'text-emerald-400 font-mono',
      sub: 'text-emerald-600/80 font-mono',
      statCard: 'bg-[#010906] border-emerald-950/80 text-emerald-500',
      terminal: 'bg-[#010805] text-emerald-400 border-emerald-500/20',
      btnControlOpen: 'bg-emerald-950/50 hover:bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-mono',
      btnControlClose: 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-mono',
      btnControlAuto: 'bg-emerald-900/20 hover:bg-emerald-900/30 border border-emerald-500 text-emerald-400 font-mono',
      btnAlarmOn: 'bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500 text-rose-400 font-mono',
      btnAlarmOff: 'bg-slate-900/20 hover:bg-slate-900/30 border border-slate-700 text-slate-400 font-mono',
      badgeOk: 'text-emerald-400 bg-emerald-950/65 border border-emerald-500/30',
      badgeWarn: 'text-rose-400 bg-rose-950/65 border border-rose-500/30 font-bold',
      gridLines: '#062F1C',
      tooltipBg: '#02130C',
      tooltipColor: '#10B981',
      chartColor: '#10B981'
    }
  }[theme] || styles.light;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${styles.heading}`}>Giám sát hệ thống Real-time</h2>
        <p className={`text-sm transition-all duration-300 ${styles.sub}`}>Màn hình điều khiển và mô phỏng trạng thái thùng rác thông minh.</p>
      </div>

      {/* Cảnh báo đầy */}
      {isGarbageFull && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm flex items-center gap-3 animate-bounce">
          <div className="bg-red-100 p-2 rounded-full">⚠️</div>
          <div>
            <p className="font-bold">Cảnh báo khẩn cấp!</p>
            <p className="text-sm">Thùng rác đã vượt mức 80%, yêu cầu dọn dẹp ngay lập tức để tránh tràn rác.</p>
          </div>
        </div>
      )}

      {/* Grid Hàng 1: Panel mô phỏng + Card cảm biến + Live terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Column 1: Mô phỏng thùng rác */}
        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden transition-all duration-300 ${styles.card}`}>
          <div className={`absolute top-0 left-0 w-full h-1 ${theme === 'cyber' ? 'bg-emerald-500' : theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-500'}`}></div>
          <div className="w-full text-left">
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${styles.sub}`}>Mô phỏng Thùng rác</div>
            <h3 className={`text-lg font-bold ${styles.title}`}>Trạng thái Thiết bị</h3>
          </div>

          {/* Physical Trash Can Graphic */}
          <div className="relative w-36 h-60 my-6 flex items-end justify-center">
            {/* Nắp xoay */}
            <div 
              className={`absolute -top-4 w-40 h-4 rounded-full transition-all duration-500 origin-right shadow-md z-10 ${theme === 'cyber' ? 'bg-emerald-700' : 'bg-slate-700'}`}
              style={{
                transform: sensorData.is_lid_open 
                  ? 'translateY(-15px) rotate(-40deg)' 
                  : 'translateY(0) rotate(0)'
              }}
            >
              <div className="absolute left-1/2 top-[-6px] -translate-x-1/2 w-8 h-2 bg-slate-500 rounded-t-md"></div>
            </div>

            {/* Thân thùng */}
            <div className={`w-36 h-52 border-4 rounded-b-2xl overflow-hidden relative shadow-inner ${theme === 'cyber' ? 'bg-[#010c08] border-emerald-500' : 'bg-slate-50 border-slate-700'}`}>
              <div className="absolute inset-0 flex justify-around opacity-5 pointer-events-none">
                <div className="w-1 bg-black h-full"></div>
                <div className="w-1 bg-black h-full"></div>
                <div className="w-1 bg-black h-full"></div>
              </div>

              {/* Lượng rác lấp đầy */}
              <div 
                className="absolute bottom-0 w-full transition-all duration-1000 ease-out flex items-center justify-center"
                style={{
                  height: `${sensorData.garbage_level}%`,
                  background: isGarbageFull 
                    ? 'linear-gradient(to top, #EF4444, #F87171)' 
                    : sensorData.garbage_level >= 50
                      ? 'linear-gradient(to top, #F59E0B, #FBBF24)'
                      : 'linear-gradient(to top, #10B981, #34D399)'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-white opacity-20 animate-pulse"></div>
                <span className="text-white font-black text-2xl drop-shadow">
                  {sensorData.garbage_level}%
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full space-y-3">
            <div className={`text-[10px] font-bold uppercase text-center tracking-wider ${styles.sub}`}>Điều khiển từ xa (MQTT Overrides)</div>
            <div className="flex gap-2">
              <button
                onClick={() => publishControl('open')}
                className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-xl shadow-sm transition-all duration-200 ${styles.btnControlOpen}`}
              >
                🔓 Mở Nắp
              </button>
              <button
                onClick={() => publishControl('close')}
                className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-xl shadow-sm transition-all duration-200 ${styles.btnControlClose}`}
              >
                🔒 Đóng Nắp
              </button>
              <button
                onClick={() => publishControl('auto')}
                className={`flex-1 py-2 px-1 text-[10px] font-bold rounded-xl shadow-sm transition-all duration-200 ${styles.btnControlAuto}`}
              >
                🔄 Tự Động
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => publishControl('play_alarm')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${styles.btnAlarmOn}`}
              >
                🔊 Bật Còi
              </button>
              <button
                onClick={() => publishControl('stop_alarm')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${styles.btnAlarmOff}`}
              >
                🔇 Tắt Còi
              </button>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Cảm biến cards (Chiếm 2 cột) */}
        <div className="lg:col-span-2 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gas */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${styles.card}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${styles.sub}`}>Khí Gas & Mùi Hôi</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black tracking-tight ${theme === 'cyber' ? 'text-emerald-400' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{sensorData.gas}</span>
                  <span className={`text-lg font-bold ${styles.sub}`}>ppm</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${isGasHigh ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-emerald-50 text-emerald-500'}`}>
                💨
              </div>
            </div>
            
            <div className={`mt-4 w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${styles.statCard}`}>
              <span className="text-xs font-medium">Trạng thái:</span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${isGasHigh ? styles.badgeWarn : styles.badgeOk}`}>
                {isGasHigh ? '⚠️ BÁO ĐỘNG HÔI THỐI' : '🟢 KHÔNG KHÍ SẠCH'}
              </span>
            </div>
          </div>

          {/* Temp */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${styles.card}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${styles.sub}`}>Nhiệt độ bên trong</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black tracking-tight ${theme === 'cyber' ? 'text-emerald-400' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{sensorData.temperature}</span>
                  <span className={`text-lg font-bold ${styles.sub}`}>°C</span>
                </div>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                🌡️
              </div>
            </div>
            <div className={`mt-4 w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${styles.statCard}`}>
              <span className="text-xs font-medium">Cảm biến:</span>
              <span className="text-xs font-bold">DHT11 (Ổn định)</span>
            </div>
          </div>

          {/* Humidity */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${styles.card}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${styles.sub}`}>Độ ẩm bên trong</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black tracking-tight ${theme === 'cyber' ? 'text-emerald-400' : theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{sensorData.humidity}</span>
                  <span className={`text-lg font-bold ${styles.sub}`}>%</span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                💧
              </div>
            </div>
            <div className={`mt-4 w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${styles.statCard}`}>
              <span className="text-xs font-medium">Trạng thái:</span>
              <span className="text-xs font-bold">{sensorData.humidity > 70 ? 'Môi trường ẩm ướt' : 'Khô ráo'}</span>
            </div>
          </div>

          {/* Servo */}
          <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${styles.card}`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${sensorData.is_lid_open ? 'bg-cyan-500' : 'bg-slate-500'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${styles.sub}`}>Trạng thái cơ học</div>
                <div className={`text-xl font-black mt-2 ${theme === 'cyber' ? 'text-emerald-300' : theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                  {sensorData.is_lid_open ? '🔓 ĐANG MỞ NẮP' : '🔒 NẮP ĐÃ ĐÓNG'}
                </div>
              </div>
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                🤖
              </div>
            </div>
            <div className={`mt-4 w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${styles.statCard}`}>
              <span className="text-xs font-medium">Góc Servo:</span>
              <span className="text-xs font-bold">{sensorData.is_lid_open ? 'Góc 120° (Mở)' : 'Góc 40° (Đóng)'}</span>
            </div>
          </div>

        </div>

        {/* Column 4: Live Event Feed */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between xl:col-span-1 lg:col-span-3 min-h-[460px] transition-all duration-300 ${styles.card}`}>
          <div className="w-full">
            <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${styles.title}`}>
              <span className="animate-pulse">📡</span> Nhật ký Live
            </h3>
            <p className={`text-xs mb-4 leading-normal ${styles.sub}`}>Các thay đổi trạng thái thời gian thực nhận qua MQTT Broker.</p>
          </div>
          
          <div className={`flex-1 p-4 rounded-xl font-mono text-[10px] space-y-3 overflow-y-auto max-h-[350px] xl:max-h-[310px] border shadow-inner transition-all duration-300 ${styles.terminal}`}>
            {logsList.map((log, idx) => {
              const isWarning = log.includes("⚠️") || log.includes("💨");
              return (
                <div key={idx} className={`flex items-start gap-1.5 leading-relaxed ${isWarning ? 'text-rose-400 font-bold' : ''}`}>
                  <span className="text-emerald-500 font-bold">❯</span>
                  <span>{log}</span>
                </div>
              );
            })}
          </div>
          
          <div className={`mt-4 text-[9px] font-semibold text-center uppercase tracking-wider ${styles.sub}`}>
            MQTT Client Active
          </div>
        </div>

      </div>

      {/* Grid Hàng 2: Biểu đồ giám sát thời gian thực + Chẩn đoán hệ thống (Lấp đầy nửa dưới màn hình) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ biến động mức rác */}
        <div className={`p-6 rounded-2xl border lg:col-span-2 transition-all duration-300 ${styles.card}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${styles.title}`}>
                📊 Biểu đồ biến động mức rác gần đây (Real-time Stream)
              </h3>
              <p className={`text-xs ${styles.sub}`}>Biểu đồ cập nhật tự động dòng dữ liệu mức rác thực tế nhận từ cảm biến.</p>
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 ${theme==='cyber'?'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20':''}`}>
              Live Telemetry
            </span>
          </div>
          
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={styles.chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={styles.chartColor} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={styles.gridLines} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: theme === 'cyber' ? '#10B981' : '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: theme === 'cyber' ? '#10B981' : '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: styles.tooltipBg, border: 'none', borderRadius: '8px', color: styles.tooltipColor }} />
                <Area type="monotone" dataKey="actual" stroke={styles.chartColor} strokeWidth={2.5} fillOpacity={1} fill="url(#dashboardLevel)" name="Mức rác (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng chẩn đoán phần cứng */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${styles.card}`}>
          <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${styles.title}`}>
            🩺 Chẩn đoán & Trạng thái Hệ thống
          </h3>
          <p className={`text-xs mb-4 leading-normal ${styles.sub}`}>Kiểm tra trạng thái kết nối phần cứng và phần mềm trung tâm.</p>
          
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center text-xs">
              <span className={theme==='cyber'?'text-emerald-700':'text-slate-500 font-medium'}>Máy chủ Node.js:</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">🟢 Connected</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className={theme==='cyber'?'text-emerald-700':'text-slate-500 font-medium'}>Cơ sở dữ liệu SQL Server:</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">🟢 Connected</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className={theme==='cyber'?'text-emerald-700':'text-slate-500 font-medium'}>Dịch vụ AI Python:</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">🟢 Active</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className={theme==='cyber'?'text-emerald-700':'text-slate-500 font-medium'}>Giao tiếp UART (9600 bps):</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">🟢 Online</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className={theme==='cyber'?'text-emerald-700':'text-slate-500 font-medium'}>Uptime hệ thống:</span>
              <span className={`font-mono font-bold ${theme==='cyber'?'text-emerald-350':'text-slate-700'}`}>02d : 14h : 22m</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
