
import React from 'react';
import { Home, BarChart2, Gift, Settings as SettingsIcon } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { rewards } = useHabits();
  
  const tabs = [
    { id: 'home', icon: <Home size={22} />, label: 'Hoy' },
    { id: 'stats', icon: <BarChart2 size={22} />, label: 'Stats' },
    { id: 'rewards', icon: <Gift size={22} />, label: 'Bazar' },
    { id: 'settings', icon: <SettingsIcon size={22} />, label: 'Ajustes' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#020617] overflow-hidden relative border-x border-white/5 transition-all duration-500">
      <header className="sticky top-0 p-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            💪
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">Sistema SHCE</h1>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
          <span className="text-xs">🌀</span>
          <span className="text-sm font-black text-indigo-400">{rewards.availablePoints}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {children}
      </main>

      <nav className="absolute bottom-6 left-5 right-5 bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex justify-between items-center px-6 py-4 z-30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
              activeTab === tab.id 
                ? 'text-indigo-400 scale-110' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
