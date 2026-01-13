
import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Trash2, 
  Heart, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle2, 
  UserCircle, 
  Sun, 
  Eye,
  Send,
  Type,
  RotateCcw,
  RefreshCw,
  Database,
  Lock
} from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, requestNotificationPermission, requestStoragePermission, sendTestNotification, resetProgress, startNewHabit } = useHabits();
  const [isStorageEnabled, setIsStorageEnabled] = useState(false);

  useEffect(() => {
    // Check if storage persistence is already granted
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsStorageEnabled);
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    haptics.selection();
    updateSettings({ ...settings, [field]: value });
  };

  const heroTerm = settings.gender === 'male' ? 'Héroe' : 'Heroína';
  const genderPrefix = settings.gender === 'male' ? 'del' : 'de la';
  const forgedTerm = settings.gender === 'male' ? 'FORJADO' : 'FORJADA';

  const handleNotificationToggle = async () => {
    haptics.selection();
    if (settings.notificationsEnabled) {
      handleChange('notificationsEnabled', false);
    } else {
      const success = await requestNotificationPermission();
      if (!success) {
        haptics.error();
        alert("Las notificaciones fueron bloqueadas o no están disponibles en este navegador.");
      } else {
        haptics.success();
      }
    }
  };

  const handleStorageAccess = async () => {
    haptics.selection();
    const success = await requestStoragePermission();
    if (success) {
      setIsStorageEnabled(true);
      haptics.success();
      alert("Base de datos local inicializada con éxito.");
    } else {
      haptics.error();
      alert("No se pudo garantizar persistencia absoluta, pero los datos se guardarán temporalmente.");
    }
  };

  const handleReset = () => {
    haptics.error();
    if (confirm('¿Deseas reiniciar TODO tu progreso? Perderás racha, puntos y estadísticas de por vida.')) {
      haptics.heavy();
      resetProgress();
    }
  };

  const handleStartNew = () => {
    haptics.medium();
    if (confirm('¿Deseas empezar un hábito nuevo? Reiniciarás tu racha actual y análisis, pero conservarás tus puntos acumulados, récord personal y total de sesiones.')) {
      haptics.success();
      startNewHabit();
      alert("Hábito reiniciado. ¡Éxito con tu nuevo desafío!");
    }
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-white pb-32">
      <div className="flex items-center space-x-3 px-1">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
           <SettingsIcon className="text-indigo-400" size={24} />
        </div>
        <h2 className="text-2xl font-black tracking-tight dark:text-white text-slate-900">Ajustes</h2>
      </div>

      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <UserCircle size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Perfil {genderPrefix} {heroTerm}</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 dark:bg-white/5 dark:border-white/5 bg-slate-200 border-slate-300 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl"></div>
          
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">¿Quién soy?</label>
            <input 
              type="text" 
              value={settings.habitName}
              onChange={(e) => handleChange('habitName', e.target.value)}
              placeholder="Ej: Un corredor incansable..."
              className="w-full px-6 py-5 bg-black/40 dark:bg-black/40 bg-white/50 rounded-3xl border border-white/10 dark:border-white/10 border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-black dark:text-white text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Identidad</label>
            <div className="grid grid-cols-2 gap-4 p-1 bg-black/40 dark:bg-black/40 bg-slate-300/50 rounded-[2rem] border border-white/5 dark:border-white/5 border-slate-300">
              <button 
                onClick={() => handleChange('gender', 'male')}
                className={`py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${settings.gender === 'male' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Héroe
              </button>
              <button 
                onClick={() => handleChange('gender', 'female')}
                className={`py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${settings.gender === 'female' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Heroína
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Database size={14} className="text-cyan-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sistema de Datos</h3>
        </div>
        <div className="rounded-[3rem] bg-white/5 border border-white/5 dark:bg-white/5 dark:border-white/5 bg-slate-200 border-slate-300 divide-y dark:divide-white/5 divide-slate-300 overflow-hidden shadow-2xl">
          <div className="p-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-white/5">
                  <Database size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight dark:text-white text-slate-900">Almacenamiento Local</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Base de datos persistente</span>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isStorageEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {isStorageEnabled ? 'Activado' : 'Pendiente'}
              </div>
            </div>
            {!isStorageEnabled && (
              <button 
                onClick={handleStorageAccess}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-center space-x-3 transition-all group shadow-lg shadow-indigo-600/20"
              >
                <Lock size={16} className="text-white group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Autorizar Base de Datos</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Zap size={14} className="text-amber-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Arquitectura SHCE</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 dark:bg-white/5 dark:border-white/5 bg-slate-200 border-slate-300 space-y-8 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <Zap size={12} className="text-orange-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hábito de Emergencia (SOS)</label>
            </div>
            <input 
              type="text" 
              value={settings.emergencyHabit}
              onChange={(e) => handleChange('emergencyHabit', e.target.value)}
              placeholder="Lo mínimo si no tienes tiempo..."
              className="w-full px-6 py-4 bg-black/40 dark:bg-black/40 bg-white/50 rounded-2xl border border-white/10 dark:border-white/10 border-slate-300 focus:ring-2 focus:ring-orange-500/50 outline-none font-bold text-sm dark:text-white text-slate-900 transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <Clock size={12} className="text-indigo-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regla de los 2 Minutos</label>
            </div>
            <input 
              type="text" 
              value={settings.twoMinuteHabit}
              onChange={(e) => handleChange('twoMinuteHabit', e.target.value)}
              placeholder="El disparador de 2 min..."
              className="w-full px-6 py-4 bg-black/40 dark:bg-black/40 bg-white/50 rounded-2xl border border-white/10 dark:border-white/10 border-slate-300 focus:ring-2 focus:ring-indigo-500/50 outline-none font-bold text-sm dark:text-white text-slate-900 transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-1">
              <CheckCircle2 size={12} className="text-cyan-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hábito Completo</label>
            </div>
            <input 
              type="text" 
              value={settings.completeHabit}
              onChange={(e) => handleChange('completeHabit', e.target.value)}
              placeholder="Tu objetivo ideal diario..."
              className="w-full px-6 py-4 bg-black/40 dark:bg-black/40 bg-white/50 rounded-2xl border border-white/10 dark:border-white/10 border-slate-300 focus:ring-2 focus:ring-cyan-500/50 outline-none font-bold text-sm dark:text-white text-slate-900 transition-all"
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Shield size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Mejoras de Experiencia</h3>
        </div>
        <div className="rounded-[3rem] bg-white/5 border border-white/5 dark:bg-white/5 dark:border-white/5 bg-slate-200 border-slate-300 divide-y dark:divide-white/5 divide-slate-300 overflow-hidden shadow-2xl">
          
          <div className="p-7 flex items-center justify-between group transition-colors hover:bg-white/5">
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-white/5">
                {settings.isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight dark:text-white text-slate-900">Tema Oscuro</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Apariencia visual</span>
              </div>
            </div>
            <button 
              onClick={() => handleChange('isDarkMode', !settings.isDarkMode)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.isDarkMode ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-400'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.isDarkMode ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="p-7 flex items-center justify-between group transition-colors hover:bg-white/5">
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-white/5">
                <Type size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight dark:text-white text-slate-900">Fuente Grande</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Escalar tamaño de texto</span>
              </div>
            </div>
            <button 
              onClick={() => handleChange('fontSize', settings.fontSize === 'normal' ? 'large' : 'normal')}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.fontSize === 'large' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-400'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.fontSize === 'large' ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="p-7 flex items-center justify-between group transition-colors hover:bg-white/5">
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-orange-500/10 text-orange-500 rounded-2xl border border-white/5">
                <Eye size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight dark:text-white text-slate-900">Visibilidad de Racha</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Mostrar tarjeta en inicio</span>
              </div>
            </div>
            <button 
              onClick={() => handleChange('showStreak', !settings.showStreak)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.showStreak ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-slate-400'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.showStreak ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="p-7 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-white/5">
                  <Bell size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight dark:text-white text-slate-900">Notificaciones Diarias</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Recordatorio en la App</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="time" 
                  value={settings.reminderTime}
                  onChange={(e) => handleChange('reminderTime', e.target.value)}
                  className="bg-black/40 dark:bg-black/40 bg-white/50 border border-white/10 dark:border-white/10 border-slate-300 rounded-xl px-4 py-2 text-xs font-black text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  onClick={handleNotificationToggle}
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.notificationsEnabled ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-400'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.notificationsEnabled ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            {settings.notificationsEnabled && (
              <button 
                onClick={sendTestNotification}
                className="w-full py-4 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center space-x-3 hover:bg-white/10 transition-all group"
              >
                <Send size={16} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Probar Notificación Ahora</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Trash2 size={14} className="text-red-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Zona de Peligro</h3>
        </div>
        <div className="rounded-[3rem] bg-red-500/5 border border-red-500/10 overflow-hidden shadow-xl divide-y divide-red-500/10">
           
           <button 
            onClick={handleStartNew}
            className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors group text-left"
           >
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/10">
                  <RefreshCw size={26} />
                </div>
                <div>
                  <span className="text-lg font-black text-slate-200 block tracking-tight">Empezar Hábito Nuevo</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reinicia racha y análisis, mantén puntos</span>
                </div>
              </div>
           </button>

           <button 
            onClick={handleReset}
            className="w-full p-8 flex items-center justify-between hover:bg-red-500/10 transition-colors group text-left"
           >
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/10">
                  <RotateCcw size={26} />
                </div>
                <div>
                  <span className="text-lg font-black text-red-400 block tracking-tight">Reiniciar Todo</span>
                  <span className="text-[9px] font-bold text-red-500/40 uppercase tracking-widest">Borrado total absoluto de la cuenta</span>
                </div>
              </div>
           </button>
        </div>
      </section>

      <div className="flex flex-col items-center justify-center pt-12 pb-16 space-y-3 text-center">
         <div className="flex items-center space-x-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
           <span>{forgedTerm} EN</span>
           <Heart size={14} className="text-indigo-500 fill-indigo-500 animate-pulse" />
           <span>EL SILENCIO</span>
         </div>
         <span className="text-[9px] font-bold text-slate-800 uppercase tracking-tighter px-4 leading-relaxed">
           Sistema SHCE v3.3.0 — Obsidian Peak Edition
         </span>
      </div>
    </div>
  );
};

export default Settings;
