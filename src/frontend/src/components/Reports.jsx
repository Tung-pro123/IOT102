import React, { useState, useEffect } from 'react'
import { Icons } from './Icons'

export default function Reports({ theme = 'light' }) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (dateStr) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        console.error("Lỗi khi tải nhật ký");
        setLogs([]);
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(reportDate);
  }, [reportDate]);

  // Hàm xuất CSV client-side chuyên nghiệp
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Thêm BOM để tránh lỗi font tiếng Việt
    csvContent += "STT,Mốc thời gian,Mức rác (%),Trạng thái\n";

    logs.forEach((log, index) => {
      const status = log.actual >= 80 ? "Cảnh báo đầy" : "Bình thường";
      csvContent += `${index + 1},"${log.time}",${log.actual}%,${status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_Thung_Rac_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const styles = {
    light: {
      card: 'bg-white border-slate-100 text-slate-900',
      title: 'text-slate-800',
      heading: 'text-slate-900',
      sub: 'text-slate-500',
      pickerBg: 'bg-slate-50 border-slate-200 text-slate-700',
      btnDownload: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      tableBorder: 'border-slate-100',
      thBg: 'bg-slate-50 text-slate-400 border-slate-100',
      trBorder: 'border-slate-100 hover:bg-slate-50 text-slate-700',
      idxCol: 'text-slate-400',
      badgeOk: 'text-emerald-700 bg-emerald-50',
      badgeWarn: 'text-red-700 bg-red-50'
    },
    dark: {
      card: 'bg-[#1E293B] border-slate-800 text-white',
      title: 'text-white',
      heading: 'text-white',
      sub: 'text-slate-400',
      pickerBg: 'bg-[#0F172A] border-slate-800 text-slate-300',
      btnDownload: 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm shadow-indigo-500/10',
      tableBorder: 'border-slate-800',
      thBg: 'bg-[#0F172A] text-slate-400 border-slate-800',
      trBorder: 'border-slate-800 hover:bg-[#0F172A]/50 text-slate-300',
      idxCol: 'text-slate-500',
      badgeOk: 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40',
      badgeWarn: 'text-red-400 bg-red-950/40 border border-red-900/40'
    },
    cyber: {
      card: 'bg-[#02130C]/90 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.02)]',
      title: 'text-emerald-400 font-mono',
      heading: 'text-emerald-400 font-mono',
      sub: 'text-emerald-600/80 font-mono',
      pickerBg: 'bg-[#010906] border-emerald-950 text-emerald-400',
      btnDownload: 'bg-emerald-950/50 hover:bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      tableBorder: 'border-emerald-950/80',
      thBg: 'bg-[#010906] text-emerald-600 border-emerald-950/80 font-mono',
      trBorder: 'border-emerald-950/40 hover:bg-[#010906]/30 text-emerald-400 font-mono',
      idxCol: 'text-emerald-700',
      badgeOk: 'text-emerald-400 bg-emerald-950/65 border border-emerald-500/30',
      badgeWarn: 'text-rose-400 bg-rose-950/65 border border-rose-500/30 font-bold'
    }
  }[theme] || styles.light;

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-3xl font-bold mb-2 transition-all duration-300 ${styles.heading}`}>Báo cáo & Xuất dữ liệu CSDL</h2>
          <p className={`text-sm transition-all duration-300 ${styles.sub}`}>Tra cứu toàn bộ lịch sử nạp rác được ghi nhận trong cơ sở dữ liệu SQL Server.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all duration-200 ${styles.btnDownload}`}
        >
          <Icons.Download /> Xuất CSV Báo Cáo
        </button>
      </div>

      <div className={`rounded-2xl border p-6 transition-all duration-300 ${styles.card}`}>
        {/* Bộ lọc */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${styles.pickerBg}`}>
            <span className={theme === 'cyber' ? 'text-emerald-700' : 'text-slate-400'}>Chọn ngày truy vấn:</span>
            <input
              type="date"
              value={reportDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setReportDate(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Bảng nhật ký */}
        <div className={`overflow-x-auto rounded-xl border ${styles.tableBorder}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={styles.thBg}>
                <th className="p-4 w-16">STT</th>
                <th className="p-4">Mốc thời gian</th>
                <th className="p-4">Mức rác (%)</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">
                    🔄 Đang truy vấn cơ sở dữ liệu SQL Server...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">
                    📂 Không có dữ liệu lịch sử ghi nhận trong ngày này.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className={`border-b transition-all duration-150 ${styles.trBorder}`}>
                    <td className={`p-4 font-semibold ${styles.idxCol}`}>{index + 1}</td>
                    <td className="p-4 font-medium">{log.time}</td>
                    <td className="p-4 font-black">{log.actual}%</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] ${log.actual >= 80 ? styles.badgeWarn : styles.badgeOk}`}>
                        {log.actual >= 80 ? 'CẢNH BÁO ĐẦY' : 'BÌNH THƯỜNG'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
