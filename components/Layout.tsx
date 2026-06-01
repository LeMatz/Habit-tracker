import React, { useRef, useEffect } from 'react';
import { Home, BarChart2, Gift, Settings as SettingsIcon, ClipboardList } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { rewards } = useHabits();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to the top when activeTab shifts
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);
  
  const tabs = [
    { id: 'home', icon: <Home size={22} />, label: 'Hoy' },
    { id: 'tasks', icon: <ClipboardList size={22} />, label: 'Tareas' },
    { id: 'stats', icon: <BarChart2 size={22} />, label: 'Stats' },
    { id: 'rewards', icon: <Gift size={22} />, label: 'Bazar' },
    { id: 'settings', icon: <SettingsIcon size={22} />, label: 'Ajustes' },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border-x border-slate-200 dark:border-slate-900 relative transition-colors duration-500 overflow-hidden">
      {/* Header Fijo */}
      <header className="shrink-0 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-40 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center p-1.5 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <span className="text-xl">⚡</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Sistema SHCE</h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl">
          <span className="text-xs">🌀</span>
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{rewards.availablePoints}</span>
        </div>
      </header>

      {/* Área de Contenido con Scroll Nativo */}
      <main ref={mainRef} className="native-scroll no-scrollbar">
        <div className="px-1 py-4 min-h-full pb-32">
          {children}
        </div>
      </main>

      {/* Navegación Flotante: Versión Midnight Oscura con Bordes Cian */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
        <nav className="max-w-[calc(100%-1rem)] mx-auto bg-slate-950 border border-cyan-500/60 rounded-[2.5rem] flex justify-between items-center px-4 py-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] pointer-events-auto transition-all">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-cyan-400 scale-110' 
                  : 'text-slate-500 hover:text-cyan-500/50'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-cyan-500/10' : ''}`}>
                {tab.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;