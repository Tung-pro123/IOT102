import React from 'react'
import { Icons } from './Icons'

export default function Sidebar({ activeTab, setActiveTab, theme = 'light' }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Icons.Dashboard /> },
    { id: 'analytics', name: 'Analytics', icon: <Icons.Analytics /> },
    { id: 'sensors', name: 'Sensors', icon: <Icons.Sensors /> },
    { id: 'predictions', name: 'Predictions', icon: <Icons.Predictions /> },
    { id: 'reports', name: 'Reports', icon: <Icons.Reports /> }
  ];

  const styles = {
    light: {
      aside: 'bg-[#F8F9FA] border-slate-200',
      title: 'text-slate-900',
      subtitle: 'text-slate-400',
      btnActive: 'bg-slate-900 text-white shadow-sm',
      btnInactive: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
      footer: 'border-slate-200 bg-slate-50 text-slate-400'
    },
    dark: {
      aside: 'bg-[#0B0F19] border-slate-800',
      title: 'text-white',
      subtitle: 'text-slate-500',
      btnActive: 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20',
      btnInactive: 'text-slate-400 hover:bg-[#1E293B] hover:text-white',
      footer: 'border-slate-800 bg-[#0F172A] text-slate-500'
    },
    cyber: {
      aside: 'bg-[#020A06] border-emerald-950/60 font-mono',
      title: 'text-emerald-400',
      subtitle: 'text-emerald-700',
      btnActive: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      btnInactive: 'text-emerald-700 hover:bg-emerald-500/5 hover:text-emerald-500',
      footer: 'border-emerald-950/60 bg-[#010604] text-emerald-800'
    }
  }[theme] || styles.light;

  return (
    <aside className={`w-64 border-r flex flex-col justify-between hidden md:flex transition-all duration-300 ${styles.aside}`}>
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className={`p-2 rounded-xl text-white ${theme === 'cyber' ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : theme === 'dark' ? 'bg-indigo-600' : 'bg-indigo-600'}`}>
            <Icons.Trash />
          </div>
          <div>
            <h1 className={`font-bold text-sm leading-tight ${styles.title}`}>Smart Waste</h1>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${styles.subtitle}`}>Management</span>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === item.id ? styles.btnActive : styles.btnInactive
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className={`p-4 border-t text-[10px] font-semibold uppercase tracking-wider text-center transition-all duration-300 ${styles.footer}`}>
        IOT102 • Summer 2026
      </div>
    </aside>
  )
}
