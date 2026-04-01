
import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Trash2, 
  Heart, 
  Shield, 
  Zap, 
  UserCircle, 
  Sun, 
  Type,
  RotateCcw,
  ChevronRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Dice5,
  ChevronDown,
  ChevronUp,
  Gift
} from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, requestNotificationPermission, requestStoragePermission, resetProgress, startNewHabit, diceRewards, updateDiceReward } = useHabits();
  const [isStorageEnabled, setIsStorageEnabled] = useState(false);
  const [showDiceConfig, setShowDiceConfig] = useState(false);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsStorageEnabled);
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    haptics.selection();
    updateSettings({ ...settings, [field]: value });
  };

  const forgedTerm = settings.gender === 'male' ? 'FORJADO' : 'FORJADA';

  const handleReset = () => {
    haptics.error();
    if (confirm('¿Estás seguro de reiniciar todo? Se perderá el historial y los puntos.')) {
      resetProgress();
    }
  };

  const handleNewHabit = () => {
    haptics.heavy();
    if (confirm('¿Empezar hábito nuevo? Se archivará el actual y se reiniciará la racha, pero conservarás tus puntos y récord histórico.')) {
      startNewHabit();
    }
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      {/* Header */}
      <div className="flex items-center space-x-3 px-1">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-inner text-indigo-600 dark:text-indigo-400">
           <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Ajustes</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración del Sistema</p>
        </div>
      </div>

      {/* Identidad */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <UserCircle size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Identidad de Misión</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8 shadow-xl relative overflow-hidden transition-colors">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">¿Quién soy?</label>
            <input 
              type="text" 
              value={settings.habitName}
              onChange={(e) => handleChange('habitName', e.target.value)}
              placeholder="Soy un corredor constante"
              className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 outline-none font-black text-slate-900 dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Avatar de Género</label>
            <div className="grid grid-cols-2 gap-4 p-1 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => handleChange('gender', 'male')}
                className={`py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${settings.gender === 'male' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}
              >
                Héroe
              </button>
              <button 
                onClick={() => handleChange('gender', 'female')}
                className={`py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${settings.gender === 'female' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}
              >
                Heroína
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ciclo del Hábito */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <RotateCcw size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Ciclo del Hábito (James Clear)</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Señal</label>
              <input 
                type="text" 
                value={settings.habitLoop.cue}
                onChange={(e) => handleChange('habitLoop', { ...settings.habitLoop, cue: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Anhelo</label>
              <input 
                type="text" 
                value={settings.habitLoop.craving}
                onChange={(e) => handleChange('habitLoop', { ...settings.habitLoop, craving: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Respuesta</label>
              <input 
                type="text" 
                value={settings.habitLoop.response}
                onChange={(e) => handleChange('habitLoop', { ...settings.habitLoop, response: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Recompensa</label>
              <input 
                type="text" 
                value={settings.habitLoop.reward}
                onChange={(e) => handleChange('habitLoop', { ...settings.habitLoop, reward: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic text-center px-4">
            Define los cuatro pasos de tu hábito para hacerlo consciente y automático.
          </p>
        </div>
      </section>

      {/* Configuración de Botones Personalizados */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Zap size={14} className="text-amber-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Nombres de Ejecución</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-1">
              <Zap size={12} className="text-orange-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Botón EMD (Esfuerzo Mínimo Diario)</label>
            </div>
            <input 
              type="text" 
              value={settings.emergencyHabit}
              onChange={(e) => handleChange('emergencyHabit', e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-1">
              <Clock size={12} className="text-indigo-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Botón 2 minutos</label>
            </div>
            <input 
              type="text" 
              value={settings.twoMinuteHabit}
              onChange={(e) => handleChange('twoMinuteHabit', e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-1">
              <CheckCircle2 size={12} className="text-cyan-500" />
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Botón Completo (Hábito)</label>
            </div>
            <input 
              type="text" 
              value={settings.completeHabit}
              onChange={(e) => handleChange('completeHabit', e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Configuración de Premios del Dado */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Dice5 size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Premios del Dado</h3>
        </div>
        <div className="px-1">
          <button 
            onClick={() => { haptics.selection(); setShowDiceConfig(!showDiceConfig); }}
            className={`w-full flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] hover:bg-slate-50 dark:hover:bg-white/5 transition-all group shadow-lg ${showDiceConfig ? 'rounded-b-none border-b-0' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl shadow-sm">
                <Gift size={20} className="text-indigo-400" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Ajustar Premios</span>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 italic">Dado del destino</p>
              </div>
            </div>
            {showDiceConfig ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </button>

          {showDiceConfig && (
            <div className="p-6 bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-[2.5rem] space-y-4 animate-in slide-in-from-top-4 duration-500 shadow-xl relative z-10">
              {diceRewards.map((reward) => (
                <div key={reward.id} className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-100 dark:border-indigo-500/10">
                    {reward.diceNumber}
                  </div>
                  <input 
                    type="text" 
                    value={reward.title}
                    onChange={(e) => updateDiceReward(reward.id, e.target.value, '')}
                    placeholder="Tu premio..."
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* UI Enhancements */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Shield size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Mejoras de Experiencia</h3>
        </div>
        <div className="rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xl transition-colors">
          
          <div className="p-7 flex items-center justify-between group">
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10">
                {settings.isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Modo Oscuro</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Apariencia Visual</span>
              </div>
            </div>
            <button 
              onClick={() => handleChange('isDarkMode', !settings.isDarkMode)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.isDarkMode ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.isDarkMode ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="p-7 flex items-center justify-between group">
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10">
                {settings.soundsEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Efectos de Sonido</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Feedback Auditivo</span>
              </div>
            </div>
            <button 
              onClick={() => handleChange('soundsEnabled', !settings.soundsEnabled)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.soundsEnabled ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.soundsEnabled ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="p-7 flex items-center justify-between group">
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10">
                <Type size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Fuente Grande</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Optimización Universal</span>
              </div>
            </div>
            <button 
              onClick={() => handleChange('fontSize', settings.fontSize === 'normal' ? 'large' : 'normal')}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.fontSize === 'large' ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.fontSize === 'large' ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Trash2 size={14} className="text-red-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Zona de Peligro</h3>
        </div>
        <div className="rounded-[3rem] bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 overflow-hidden shadow-xl divide-y divide-red-100 dark:divide-red-500/10 transition-colors">
           <button 
            onClick={handleNewHabit}
            className="w-full p-8 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors group text-left"
           >
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <PlusCircle size={26} />
                </div>
                <div>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block tracking-tight">Empezar Hábito Nuevo</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-indigo-400/40 uppercase tracking-widest leading-relaxed">Reinicia racha y análisis manteniendo puntos y récords</span>
                </div>
              </div>
              <ChevronRight className="text-indigo-500/30 group-hover:translate-x-1 transition-transform" />
           </button>

           <button 
            onClick={handleReset}
            className="w-full p-8 flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors group text-left"
           >
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-500/20">
                  <RotateCcw size={26} />
                </div>
                <div>
                  <span className="text-lg font-black text-red-600 dark:text-red-500 block tracking-tight">Reiniciar Todo</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-red-500/40 uppercase tracking-widest leading-relaxed">Eliminación completa y absoluta de la cuenta</span>
                </div>
              </div>
              <ChevronRight className="text-red-500/30 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </section>

      {/* Version & Credits */}
      <div className="flex flex-col items-center justify-center pt-12 pb-16 space-y-4 text-center">
         <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
           <span>{forgedTerm} EN EL SILENCIO</span>
           <Heart size={14} className="text-indigo-500 fill-indigo-500 animate-pulse" />
           <span>SHCE v3.5.0</span>
         </div>
      </div>
    </div>
  );
};

export default Settings;
