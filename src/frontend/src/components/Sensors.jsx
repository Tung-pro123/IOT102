import React from 'react'

export default function Sensors({ sensorData, theme = 'light' }) {
  // Định nghĩa mô tả kỹ thuật cho từng cảm biến
  const sensorList = [
    {
      name: "Cảm biến Siêu âm đo tay (HC-SR04)",
      pin: "TRIG: Pin 3 | ECHO: Pin 2",
      type: "Digital Ultrasonic Distance Sensor",
      value: sensorData.is_lid_open ? "Phát hiện có tay người (<15cm)" : "Không có tay (Trống)",
      status: "🟢 Đang hoạt động",
      desc: "Phát sóng siêu âm tần số cao để đo khoảng cách tay người tiếp cận nắp thùng rác. Khi phát hiện tay <15cm, gửi lệnh quay servo mở nắp.",
      color: "border-indigo-500",
      bg: "bg-indigo-50 text-indigo-700"
    },
    {
      name: "Cảm biến Siêu âm đo mức rác (HC-SR04)",
      pin: "TRIG: Pin 9 | ECHO: Pin 8",
      type: "Digital Ultrasonic Distance Sensor",
      value: `${sensorData.garbage_level}% đầy`,
      status: sensorData.garbage_level >= 80 ? "🔴 Cảnh báo Đầy rác!" : "🟢 Hoạt động tốt",
      desc: "Lắp đặt cố định dưới nắp thùng rác để đo khoảng cách thẳng đứng xuống bề mặt rác. Bản tin đo đạc được map từ 25cm (trống) đến 5cm (đầy).",
      color: "border-emerald-500",
      bg: "bg-emerald-50 text-emerald-700"
    },
    {
      name: "Cảm biến chất lượng không khí (MQ-135)",
      pin: "Analog: Chân A0",
      type: "Analog Gas Sensor (Air Quality)",
      value: `${sensorData.gas} ppm`,
      status: sensorData.gas > 500 ? "🔴 Phát hiện mùi hôi / Khí độc!" : "🟢 Không khí an toàn",
      desc: "Đo nồng độ các chất khí NH3, NOx, cồn, benzen, khói và đặc biệt là khí gas thoát ra từ sự phân hủy của rác thải hữu cơ dư thừa.",
      color: "border-orange-500",
      bg: "bg-orange-50 text-orange-700"
    },
    {
      name: "Cảm biến Nhiệt độ & Độ ẩm (DHT11)",
      pin: "Digital: Chân 7",
      type: "Digital Temp & Humidity Sensor",
      value: `${sensorData.temperature}°C | ${sensorData.humidity}% RH`,
      status: "🟢 Hoạt động tốt",
      desc: "Đo lường các thông số môi trường bên trong thùng rác để phát hiện nhiệt độ tăng cao đột biến (phòng cháy) hoặc độ ẩm lớn gây mùi hôi tanh ẩm ướt.",
      color: "border-rose-500",
      bg: "bg-rose-50 text-rose-700"
    }
  ];

  const styles = {
    light: {
      card: 'bg-white border-slate-100 text-slate-900',
      title: 'text-slate-800',
      heading: 'text-slate-900',
      sub: 'text-slate-500',
      innerBg: 'bg-slate-50 text-slate-700',
      pinVal: 'text-slate-700 font-bold',
      actualVal: 'text-slate-900 font-black',
      architectureBg: 'bg-white border-slate-100',
      archCard: 'bg-slate-50/50 border-slate-100 text-slate-600',
      archTitle1: 'text-indigo-600',
      archTitle2: 'text-rose-600',
      archTitle3: 'text-emerald-600',
      archText: 'text-slate-600'
    },
    dark: {
      card: 'bg-[#1E293B] border-slate-800 text-white',
      title: 'text-white',
      heading: 'text-white',
      sub: 'text-slate-400',
      innerBg: 'bg-[#0F172A] text-slate-300 border border-slate-800/40',
      pinVal: 'text-indigo-300 font-bold',
      actualVal: 'text-white font-black',
      architectureBg: 'bg-[#1E293B] border-slate-800 text-white',
      archCard: 'bg-[#0F172A] border-slate-800 text-slate-400',
      archTitle1: 'text-indigo-400',
      archTitle2: 'text-rose-400',
      archTitle3: 'text-emerald-400',
      archText: 'text-slate-400'
    },
    cyber: {
      card: 'bg-[#02130C]/90 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.02)]',
      title: 'text-emerald-400 font-mono',
      heading: 'text-emerald-400 font-mono',
      sub: 'text-emerald-600/80 font-mono',
      innerBg: 'bg-[#010906] text-emerald-500 border border-emerald-950',
      pinVal: 'text-emerald-400 font-bold font-mono',
      actualVal: 'text-emerald-300 font-black font-mono',
      architectureBg: 'bg-[#02130C]/90 border-emerald-500/30 text-emerald-400',
      archCard: 'bg-[#010906] border-emerald-950 text-emerald-500 font-mono',
      archTitle1: 'text-emerald-400 font-black',
      archTitle2: 'text-rose-400 font-black',
      archTitle3: 'text-emerald-400 font-black',
      archText: 'text-emerald-600/80'
    }
  }[theme] || styles.light;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${styles.heading}`}>Chi tiết hệ thống Cảm biến IoT</h2>
        <p className={`text-sm transition-all duration-300 ${styles.sub}`}>Thông tin kỹ thuật cấu hình chân kết nối (Pinout) và dữ liệu chẩn đoán của từng cảm biến phần cứng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensorList.map((sensor, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border-t-4 ${sensor.color} hover:shadow-md transition-all duration-300 flex flex-col justify-between ${styles.card}`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-base leading-snug">{sensor.name}</h3>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.sub}`}>{sensor.type}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md ${sensor.bg}`}>
                  {sensor.status}
                </span>
              </div>
              <p className={`text-xs leading-relaxed mb-6 ${styles.sub}`}>{sensor.desc}</p>
            </div>
            
            <div className={`p-4 rounded-xl space-y-2 transition-all duration-300 ${styles.innerBg}`}>
              <div className="flex justify-between text-xs">
                <span className={`${theme === 'cyber' ? 'text-emerald-600' : 'text-slate-400'} font-medium`}>Chân cắm Arduino:</span>
                <span className={styles.pinVal}>{sensor.pin}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={`${theme === 'cyber' ? 'text-emerald-600' : 'text-slate-400'} font-medium`}>Giá trị đọc thực tế:</span>
                <span className={styles.actualVal}>{sensor.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sơ đồ mạch & Bảng đấu nối chân (To prevent blank bottom space) */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${styles.architectureBg}`}>
        <h3 className={`text-sm font-bold mb-1.5 flex items-center gap-2 ${styles.title}`}>
          🔌 Sơ đồ cấu trúc phần cứng & Kết nối liên vi điều khiển (Pinout Architecture)
        </h3>
        <p className={`text-xs mb-4 ${styles.sub}`}>Mô tả cấu trúc sơ đồ giao tiếp hai chiều giữa Arduino Uno R3 và ESP8266 NodeMCU.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Giao tiếp serial */}
          <div className={`border p-4 rounded-xl transition-all duration-300 ${styles.archCard}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${styles.archTitle1}`}>Giao tiếp UART (Serial)</span>
            <div className={`font-mono text-[11px] space-y-1 ${styles.archText}`}>
              <div>• Arduino Pin 12 (TX) ➡ ESP8266 D1 (RX)</div>
              <div>• Arduino Pin 11 (RX) ⬅ ESP8266 D2 (TX)</div>
              <div>• Chung GND (Cực kỳ quan trọng để ổn định áp)</div>
            </div>
          </div>
          {/* Card 2: Cơ cấu chấp hành */}
          <div className={`border p-4 rounded-xl transition-all duration-300 ${styles.archCard}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${styles.archTitle2}`}>Cơ cấu chấp hành (Outputs)</span>
            <div className={`font-mono text-[11px] space-y-1 ${styles.archText}`}>
              <div>• Động cơ MG996R: Pin 10 (PWM)</div>
              <div>• Loa DFPlayer TX/RX: Pin 4 / Pin 5</div>
              <div>• Loa I2S ESP8266: Chân Rx/D4/D8 (I2S Bus)</div>
            </div>
          </div>
          {/* Card 3: Nguồn điện cung cấp */}
          <div className={`border p-4 rounded-xl transition-all duration-300 ${styles.archCard}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-2 ${styles.archTitle3}`}>Nguồn điện cung cấp (Power)</span>
            <div className={`font-mono text-[11px] space-y-1 ${styles.archText}`}>
              <div>• Nguồn 1 (Pin 3S 11V) ➡ Buck LM2596 (5.5V) ➡ Servo</div>
              <div>• Nguồn 2 (USB 5V) ➡ Arduino Uno & ESP8266</div>
              <div>• Cầu chì bảo vệ dòng rò chống cháy nổ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
