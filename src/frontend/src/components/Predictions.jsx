import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts'
import { Icons } from './Icons'

export default function Predictions({
  prediction,
  peakTime,
  chartData,
  timeframe,
  setTimeframe,
  selectedDate,
  handleDateChange,
  customHistory,
  currentLabel,
  currentY,
  sensorData,
  theme = 'light'
}) {
  const styles = {
    light: {
      card: 'bg-white border-slate-100 text-slate-900',
      title: 'text-slate-800',
      heading: 'text-slate-900',
      sub: 'text-slate-500',
      kpiCard: 'bg-white border-slate-100 text-slate-900',
      kpiIconBg: 'text-indigo-600',
      kpiIconBg2: 'text-pink-600',
      pickerBg: 'bg-slate-50 border-slate-200 text-slate-700',
      timeframeBg: 'bg-slate-100 text-slate-500',
      timeframeBtnActive: 'bg-white text-slate-900 shadow-sm',
      mathPanel: 'bg-[#0B0F19] text-slate-300 border-slate-800',
      gridLines: '#E2E8F0',
      tooltipBg: '#FFFFFF',
      tooltipColor: '#0F172A',
      refLineColor: '#EF4444',
      actLineColor: '#8B5CF6',
      predLineColor: '#F59E0B'
    },
    dark: {
      card: 'bg-[#1E293B] border-slate-800 text-white',
      title: 'text-white',
      heading: 'text-white',
      sub: 'text-slate-400',
      kpiCard: 'bg-[#1E293B] border-slate-800 text-white',
      kpiIconBg: 'text-indigo-400',
      kpiIconBg2: 'text-pink-400',
      pickerBg: 'bg-[#0F172A] border-slate-800 text-slate-300',
      timeframeBg: 'bg-[#0F172A] text-slate-400',
      timeframeBtnActive: 'bg-[#1E293B] text-white shadow-sm',
      mathPanel: 'bg-[#0B0F19] text-slate-300 border-slate-850',
      gridLines: '#334155',
      tooltipBg: '#1E293B',
      tooltipColor: '#FFFFFF',
      refLineColor: '#F87171',
      actLineColor: '#A78BFA',
      predLineColor: '#FBBF24'
    },
    cyber: {
      card: 'bg-[#02130C]/90 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.02)]',
      title: 'text-emerald-400 font-mono',
      heading: 'text-emerald-400 font-mono',
      sub: 'text-emerald-600/80 font-mono',
      kpiCard: 'bg-[#02130C]/90 border-emerald-500/30 text-emerald-400',
      kpiIconBg: 'text-emerald-400',
      kpiIconBg2: 'text-rose-400',
      pickerBg: 'bg-[#010906] border-emerald-950 text-emerald-400',
      timeframeBg: 'bg-[#010906] text-emerald-700',
      timeframeBtnActive: 'bg-[#02130C]/90 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      mathPanel: 'bg-gradient-to-r from-[#010805] to-[#021810] text-emerald-500 border-emerald-500/20 font-mono',
      gridLines: '#062F1C',
      tooltipBg: '#02130C',
      tooltipColor: '#10B981',
      refLineColor: '#EF4444',
      actLineColor: '#10B981',
      predLineColor: '#F59E0B'
    }
  }[theme] || styles.light;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${styles.heading}`}>Phân tích Dự báo AI (Machine Learning)</h2>
        <p className={`text-sm transition-all duration-300 ${styles.sub}`}>Mô hình Hồi quy Tuyến tính (Linear Regression) chạy tự động để dự đoán tốc độ đầy rác.</p>
      </div>

      {/* Grid 2 AI KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* AI Prediction Card */}
        <div className={`p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${styles.kpiCard}`}>
          <div className={`absolute top-8 right-8 opacity-45 ${styles.kpiIconBg}`}>
            <Icons.AI />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className={styles.kpiIconBg}><Icons.AI /></div>
              <div className={`text-xs font-bold uppercase tracking-wider ${styles.kpiIconBg}`}>AI Dự đoán thời điểm đầy</div>
            </div>
            <div className="text-2xl font-bold max-w-[85%] leading-snug">
              {prediction}
            </div>
          </div>
          <div className={`text-xs font-medium mt-10 ${styles.sub}`}>Cập nhật liên tục dựa trên chu kỳ nạp rác hiện tại</div>
        </div>

        {/* Peak Time Card */}
        <div className={`p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${styles.kpiCard}`}>
          <div className={`absolute top-8 right-8 opacity-45 ${styles.kpiIconBg2}`}>
            <Icons.Clock />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className={styles.kpiIconBg2}><Icons.Clock /></div>
              <div className={`text-xs font-bold uppercase tracking-wider ${styles.kpiIconBg2}`}>Giờ cao điểm vứt rác</div>
            </div>
            <div className="text-2xl font-bold max-w-[85%] leading-snug">
              {peakTime}
            </div>
          </div>
          <div className={`text-xs font-medium mt-10 ${styles.sub}`}>Dựa trên phân tích thói quen vứt rác trong 7 ngày qua</div>
        </div>

      </div>

      {/* AI Line Chart Section */}
      <div className={`p-8 rounded-2xl border transition-all duration-300 relative overflow-hidden ${styles.card}`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h3 className={`text-xl font-bold ${styles.title}`}>Biểu đồ Lịch sử & Dự báo Tốc độ rác đầy</h3>
            <p className={`text-sm ${styles.sub}`}>Xem mức rác theo thời gian lịch sử hoặc dự đoán tương lai từ mô hình AI.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Bộ chọn Ngày */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${styles.pickerBg}`}>
              <span className={theme === 'cyber' ? 'text-emerald-700' : 'text-slate-400'}>Chọn Ngày:</span>
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer"
              />
            </div>

            {customHistory === null ? (
              <div className={`flex p-1 rounded-xl text-xs font-semibold transition-all duration-300 ${styles.timeframeBg}`}>
                <button
                  onClick={() => setTimeframe('24h')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-250 ${timeframe === '24h' ? styles.timeframeBtnActive : 'hover:text-slate-900'}`}
                >
                  24 Giờ
                </button>
                <button
                  onClick={() => setTimeframe('3days')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-250 ${timeframe === '3days' ? styles.timeframeBtnActive : 'hover:text-slate-900'}`}
                >
                  3 Ngày
                </button>
                <button
                  onClick={() => setTimeframe('7days')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-250 ${timeframe === '7days' ? styles.timeframeBtnActive : 'hover:text-slate-900'}`}
                >
                  7 Ngày
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                Xem Hôm nay
              </button>
            )}

            <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${theme==='cyber'?'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20':'bg-indigo-50 text-indigo-700'}`}>
              <Icons.AI /> AI Active
            </div>
          </div>
        </div>

        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={styles.gridLines} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme === 'cyber' ? '#10B981' : '#64748B', fontSize: 10 }} 
                dy={10} 
                interval={Math.max(1, Math.floor(chartData.length / 8))}
              />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: theme === 'cyber' ? '#10B981' : '#64748B', fontSize: 12 }} dx={-10} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: styles.tooltipBg, border: 'none', borderRadius: '12px', color: styles.tooltipColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: styles.tooltipColor, marginBottom: '4px' }}
              />
              <ReferenceLine y={100} stroke={styles.refLineColor} strokeDasharray="3 3" label={{ position: 'top', value: 'Ngưỡng Tràn (100%)', fill: styles.refLineColor, fontSize: 12, fontWeight: 'bold' }} />
              {customHistory === null && (
                <>
                  <ReferenceLine x={currentLabel} stroke={theme === 'cyber' ? '#10B981' : '#3B82F6'} strokeDasharray="3 3" />
                  <ReferenceDot 
                    x={currentLabel} 
                    y={currentY} 
                    r={7} 
                    fill={theme === 'cyber' ? '#10B981' : '#3B82F6'} 
                    stroke="#FFFFFF" 
                    strokeWidth={3} 
                    isFront={true}
                    label={{ position: 'top', offset: 12, value: 'Hiện tại', fill: theme === 'cyber' ? '#10B981' : '#3B82F6', fontSize: 11, fontWeight: 'bold' }}
                  />
                </>
              )}

              <Line
                type="linear"
                dataKey="actual"
                stroke={styles.actLineColor}
                strokeWidth={4}
                dot={{ r: 5, fill: styles.actLineColor, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: styles.actLineColor, stroke: '#C4B5FD', strokeWidth: 4 }}
                name="Mức rác thực tế (%)"
                connectNulls
              />
              <Line
                type="linear"
                dataKey="prediction"
                stroke={styles.predLineColor}
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: styles.predLineColor, strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: styles.predLineColor, stroke: '#FDE68A', strokeWidth: 3 }}
                name="Đường dự báo AI (%)"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Thông tin giải thuật Toán học AI (To prevent blank bottom space) */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${styles.mathPanel}`}>
        <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
          🧠 Mô hình Toán học Hồi quy Tuyến tính (Linear Regression Model)
        </h3>
        <p className="text-xs text-slate-400 mb-4">Cách thức dịch vụ AI Python khớp đường xu hướng và tính toán mốc thời gian thùng rác đầy 100%.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột 1: Công thức */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Phương trình hồi quy</span>
            <div className="bg-slate-950/50 p-4 rounded-xl font-mono text-center text-lg text-white border border-slate-800">
              y = a &times; x + b
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Trong đó: <br />
              • <strong className="text-white">y</strong>: Mức rác tích lũy (%) dự đoán tại thời điểm x. <br />
              • <strong className="text-white">x</strong>: Thời gian thực tế tính bằng giây (Unix timestamp). <br />
              • <strong className="text-white">a (Hệ số góc)</strong>: Tốc độ nạp rác tích lũy trung bình mỗi giây. <br />
              • <strong className="text-white">b (Hệ số chặn)</strong>: Mức rác tại thời điểm bắt đầu chu kỳ dọn dẹp.
            </p>
          </div>
          {/* Cột 2: Quy trình huấn luyện */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Quy trình Fit & Dự toán</span>
            <div className="text-[11px] text-slate-400 space-y-2 font-sans">
              <div className="flex gap-2">
                <span className="text-indigo-500 font-bold font-mono">1.</span>
                <span><strong>Lọc sự kiện đổ rác:</strong> Khi mức rác giảm đột ngột &ge; 15%, AI hiểu thùng rác đã được đổ, từ đó chỉ chọn dữ liệu từ lúc đổ rác đến hiện tại để train chu kỳ mới.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-500 font-bold font-mono">2.</span>
                <span><strong>Huấn luyện OLS:</strong> Cứ 60 giây một lần, mô hình Fit lại dữ liệu thực tế để tính toán hệ số góc mới, thích nghi với tốc độ xả rác thay đổi của người dùng.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-500 font-bold font-mono">3.</span>
                <span><strong>Dự toán điểm đầy 100%:</strong> Đặt y = 100%, giải phương trình tìm thời gian x để tính toán mốc giờ chính xác sẽ đầy tràn rác.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
