
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
  Gift,
  Calendar,
  Layers,
  Target,
  Sliders,
  Info,
  Bell
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 0 }
];

const Settings: React.FC = () => {
  const { settings, updateSettings, requestNotificationPermission, requestStoragePermission, resetProgress, startNewHabit, diceRewards, updateDiceReward, sendTestNotification } = useHabits();
  const [isStorageEnabled, setIsStorageEnabled] = useState(false);
  const [showDiceConfig, setShowDiceConfig] = useState(false);
  const [showDaysInfo, setShowDaysInfo] = useState(false);
  const [showOpportunityInfo, setShowOpportunityInfo] = useState(false);
  const [showEmotionalInfo, setShowEmotionalInfo] = useState(false);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setIsStorageEnabled);
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    haptics.selection();
    updateSettings({ ...settings, [field]: value });
  };

  const handleDayToggle = (dayValue: number) => {
    haptics.selection();
    const currentActiveDays = settings.activeDays || [0, 1, 2, 3, 4, 5, 6];
    let newActiveDays: number[];
    if (currentActiveDays.includes(dayValue)) {
      if (currentActiveDays.length <= 1) {
        haptics.error();
        alert('Debes comprometerte al menos 1 día a la semana.');
        return;
      }
      newActiveDays = currentActiveDays.filter(d => d !== dayValue);
    } else {
      newActiveDays = [...currentActiveDays, dayValue];
    }
    handleChange('activeDays', newActiveDays);
  };

  const handleUpdateVariableName = (id: string, newName: string) => {
    const list = (settings.thresholdVariables || []).map(v => v.id === id ? { ...v, name: newName } : v);
    handleChange('thresholdVariables', list);
  };

  const handleDeleteVariable = (id: string) => {
    const list = (settings.thresholdVariables || []).filter(v => v.id !== id);
    handleChange('thresholdVariables', list);
  };

  const handleAddVariable = () => {
    const variables = settings.thresholdVariables || [];
    const newId = 'var_' + Math.random().toString(36).substring(2, 9);
    const list = [...variables, { id: newId, name: 'Nueva Variable' }];
    handleChange('thresholdVariables', list);
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

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tipo de Hábito</label>
            <div className="grid grid-cols-3 gap-2.5 p-1 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => handleChange('habitType', 'calendar')}
                className={`py-4 px-1 rounded-[1.7rem] text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center space-y-2 ${(!settings.habitType || settings.habitType === 'calendar') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}
              >
                <Calendar size={16} />
                <span>Calendario</span>
              </button>
              <button 
                onClick={() => handleChange('habitType', 'threshold')}
                className={`py-4 px-1 rounded-[1.7rem] text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center space-y-2 ${settings.habitType === 'threshold' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}
              >
                <Layers size={16} />
                <span>Umbral</span>
              </button>
              <button 
                onClick={() => handleChange('habitType', 'opportunity')}
                className={`py-4 px-1 rounded-[1.7rem] text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center space-y-2 ${settings.habitType === 'opportunity' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'}`}
              >
                <Target size={16} />
                <span>Oportunidad</span>
              </button>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed italic text-center px-4">
              {(!settings.habitType || settings.habitType === 'calendar') && "Sabes exactamente cuándo y como ejecutar el nuevo hábito."}
              {settings.habitType === 'threshold' && "Hábitos que no se hacen necesariamente todos los días sino que buscan mantener el estado de un contexto o situación."}
              {settings.habitType === 'opportunity' && "Hábitos activados por contextos o situaciones imprevistas."}
            </p>
          </div>
        </div>
      </section>

      {/* Días de Compromiso */}
      {settings.habitType !== 'opportunity' && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 px-3">
             <Calendar size={14} className="text-indigo-500" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Días de Compromiso</h3>
          </div>
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">¿Qué días quieres realizar el hábito?</label>
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setShowDaysInfo(!showDaysInfo); }}
                  className={`p-2 rounded-xl transition-all ${showDaysInfo ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  title="Más información"
                >
                  <Info size={16} />
                </button>
              </div>
              {showDaysInfo && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-405 leading-relaxed font-semibold">
                    Desmarca los días libres. En los días desmarcados, si no registras el hábito, la racha continuará intacta y no se consumirán protectores. Si registras de todos modos, ¡tu racha aumentará igualmente!
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = (settings.activeDays || [0, 1, 2, 3, 4, 5, 6]).includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border flex flex-col items-center justify-center space-y-1 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 shadow-lg'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <span className="text-[9px]">{day.label.slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ciclo del Hábito o Tasa de Proyección */}
      {settings.habitType !== 'opportunity' && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 px-3">
             <RotateCcw size={14} className="text-indigo-500" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
               {settings.habitType === 'threshold' ? 'Tasa de Proyección' : 'Ciclo del Hábito'}
             </h3>
          </div>
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
            {settings.habitType === 'threshold' ? (
              <div className="space-y-4">
                <label className="text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                  Tasa proyección: {settings.thresholdRate ?? 20}% diaria
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-base font-black text-slate-900 dark:text-white shrink-0 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl">
                    {settings.thresholdRate ?? 20}%
                  </span>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.thresholdRate ?? 20}
                    onChange={(e) => handleChange('thresholdRate', parseInt(e.target.value))}
                    className="w-full accent-indigo-600 outline-none h-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 rounded-full"
                  />
                </div>
                <p className="text-[11.5px] text-slate-450 dark:text-slate-400 font-semibold leading-relaxed italic text-center px-4">
                  ¿Aproximadamente cuánto porcentaje crees que sube por día tu Espiral de Umbral?
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </section>
      )}

      {/* Espectro de Ejecución */}
      {settings.habitType !== 'opportunity' && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 px-3">
             <Zap size={14} className="text-amber-500" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Espectro de Ejecución</h3>
          </div>
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
            
            {settings.habitType === 'threshold' && (
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">Mostrar Espectro de Ejecución</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Habilitar selección al registrar</span>
                </div>
                <button 
                  onClick={() => handleChange('showExecutionSpectrum', !settings.showExecutionSpectrum)}
                  className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.showExecutionSpectrum ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.showExecutionSpectrum ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>
            )}

            {(settings.habitType === 'calendar' || (settings.habitType === 'threshold' && settings.showExecutionSpectrum)) && (
              <div className="space-y-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-1">
                    <Zap size={12} className="text-orange-500" />
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Botón EMD (Esfuerzo Mínimo Diario)</label>
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
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Botón 2 minutos</label>
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
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Botón Completo (Hábito)</label>
                  </div>
                  <input 
                    type="text" 
                    value={settings.completeHabit}
                    onChange={(e) => handleChange('completeHabit', e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {settings.habitType === 'threshold' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1 block">Nombres de Acciones (Botones de Check-In)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Texto del Botón Chequeo</label>
                    <input 
                      type="text" 
                      value={settings.chequeoSubtitle ?? 'Monitorear Estado'}
                      onChange={(e) => handleChange('chequeoSubtitle', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
                      placeholder="Monitorear Estado"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Texto del Botón Ejecución</label>
                    <input 
                      type="text" 
                      value={settings.ejecucionSubtitle ?? 'Mitigar / Resetear'}
                      onChange={(e) => handleChange('ejecucionSubtitle', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-xs text-slate-900 dark:text-white"
                      placeholder="Mitigar / Resetear"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Etiquetas del Contexto (Sólamente para hábitos de oportunidad) */}
      {settings.habitType === 'opportunity' && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 px-3">
             <Sliders size={14} className="text-indigo-500" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Etiquetas del Contexto</h3>
          </div>
          <div className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Contextos o Disparadores de Oportunidad</label>
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setShowOpportunityInfo(!showOpportunityInfo); }}
                  className={`p-2 rounded-xl transition-all ${showOpportunityInfo ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  title="Más información"
                >
                  <Info size={16} />
                </button>
              </div>
              {showOpportunityInfo && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    Reflexiona sobre los lugares, situaciones o disparadores que podrían abrir una ventana de oportunidad.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social']).map((tag, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => {
                      const tags = [...(settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social'])];
                      tags[idx] = e.target.value;
                      handleChange('opportunityTags', tags);
                    }}
                    className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-sm text-slate-900 dark:text-white min-w-0"
                    placeholder="Nombre del contexto o condición"
                  />
                  <button
                    onClick={() => {
                      const tags = (settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social']).filter((_, i) => i !== idx);
                      handleChange('opportunityTags', tags);
                    }}
                    className="p-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Eliminar Etiqueta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                <input
                  id="new_tag_input_id"
                  type="text"
                  placeholder="Ej: Gimnasio, En Reunión..."
                  className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-xs text-slate-900 dark:text-white min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget as HTMLInputElement).value.trim();
                      if (val) {
                        const tags = [...(settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social']), val];
                        handleChange('opportunityTags', tags);
                        (e.currentTarget as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new_tag_input_id') as HTMLInputElement;
                    const val = el?.value.trim();
                    if (val) {
                      const tags = [...(settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social']), val];
                      handleChange('opportunityTags', tags);
                      el.value = '';
                    }
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-wide transition-all shrink-0 active:scale-95"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Etiquetas de Estado Emocional (Sólamente para hábitos de oportunidad) */}
      {settings.habitType === 'opportunity' && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 px-3">
             <Heart size={14} className="text-pink-500" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Etiquetas del Estado Emocional</h3>
          </div>
          <div className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Estados Emocionales de Registro</label>
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setShowEmotionalInfo(!showEmotionalInfo); }}
                  className={`p-2 rounded-xl transition-all ${showEmotionalInfo ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  title="Más información"
                >
                  <Info size={16} />
                </button>
              </div>
              {showEmotionalInfo && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                  <p className="text-[12.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    Configura los estados emocionales, físicos o mentales que sentiste cuando se abrió la ventana de oportunidad. Esto te dará claridad sobre tu estado interno al momento de actuar o postergar.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral']).map((tag, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => {
                      const tags = [...(settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral'])];
                      tags[idx] = e.target.value;
                      handleChange('emotionalTags', tags);
                    }}
                    className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-sm text-slate-900 dark:text-white min-w-0"
                    placeholder="Nombre del estado emocional"
                  />
                  <button
                    onClick={() => {
                      const tags = (settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral']).filter((_, i) => i !== idx);
                      handleChange('emotionalTags', tags);
                    }}
                    className="p-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Eliminar Etiqueta Emocional"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                <input
                  id="new_emotion_tag_input_id"
                  type="text"
                  placeholder="Ej: Motivado, Aturdido..."
                  className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-xs text-slate-900 dark:text-white min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget as HTMLInputElement).value.trim();
                      if (val) {
                        const tags = [...(settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral']), val];
                        handleChange('emotionalTags', tags);
                        (e.currentTarget as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new_emotion_tag_input_id') as HTMLInputElement;
                    const val = el?.value.trim();
                    if (val) {
                      const tags = [...(settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral']), val];
                      handleChange('emotionalTags', tags);
                      el.value = '';
                    }
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-wide transition-all shrink-0 active:scale-95"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gestión de Variables de Control (Only for Threshold Habit) */}
      {settings.habitType === 'threshold' && (
        <section className="space-y-5">
          <div className="flex items-center space-x-2 px-3">
             <Sliders size={14} className="text-cyan-500" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Variables de Umbral</h3>
          </div>
          <div className="p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Elige y configura las variables que deseas auditar durante tus chequeos diarios de umbral.
            </p>
            <div className="space-y-4">
              {(settings.thresholdVariables ?? []).map((v) => (
                <div key={v.id} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => handleUpdateVariableName(v.id, e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-sm text-slate-900 dark:text-white min-w-0"
                    placeholder="Nombre de la variable"
                  />
                  <button
                    onClick={() => handleDeleteVariable(v.id)}
                    className="p-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Eliminar Variable"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
                <input
                  id="new_variable_input_id"
                  type="text"
                  placeholder="Ej: Fatiga, Estrés, Horas de Sueño..."
                  className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-xs text-slate-900 dark:text-white min-w-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget as HTMLInputElement).value.trim();
                      if (val) {
                        const variables = settings.thresholdVariables || [];
                        const newId = 'var_' + Math.random().toString(36).substring(2, 9);
                        const list = [...variables, { id: newId, name: val }];
                        handleChange('thresholdVariables', list);
                        (e.currentTarget as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new_variable_input_id') as HTMLInputElement;
                    const val = el?.value.trim();
                    if (val) {
                      const variables = settings.thresholdVariables || [];
                      const newId = 'var_' + Math.random().toString(36).substring(2, 9);
                      const list = [...variables, { id: newId, name: val }];
                      handleChange('thresholdVariables', list);
                      el.value = '';
                    }
                  }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-[10px] uppercase tracking-wide transition-all shrink-0 active:scale-95"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* Configuración de Notificaciones */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 px-3">
           <Bell size={14} className="text-indigo-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Notificaciones Diarias</h3>
        </div>
        <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl transition-colors">
          <div 
            onClick={async () => {
              const currentVal = !settings.notificationsEnabled;
              if (currentVal) {
                const granted = await requestNotificationPermission();
                if (!granted) {
                  alert("No se pudieron activar las notificaciones porque el permiso fue denegado o no es soportado por el navegador.");
                  return;
                }
              }
              handleChange('notificationsEnabled', currentVal);
            }}
            className="flex items-center justify-between group cursor-pointer select-none"
          >
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10 transition-colors">
                <Bell size={22} className="text-indigo-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Enviar Notificaciones</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Recordatorios de Misión</span>
              </div>
            </div>
            <div 
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${settings.notificationsEnabled ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.notificationsEnabled ? 'left-8' : 'left-1'}`}></div>
            </div>
          </div>

          {settings.notificationsEnabled && (
            <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Hora del Recordatorio</label>
                <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 rounded-3xl p-1 border border-slate-200 dark:border-slate-700">
                  <span className="pl-5 text-slate-400 dark:text-slate-500"><Clock size={18} /></span>
                  <input 
                    type="time" 
                    value={settings.reminderTime || '08:00'}
                    onChange={(e) => handleChange('reminderTime', e.target.value)}
                    className="flex-1 bg-transparent px-4 py-4 text-sm font-black text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    sendTestNotification();
                  }}
                  className="w-full py-4 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest transition-all active:scale-95"
                >
                  Probar Notificación de Misión
                </button>
              </div>
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
          
          <div 
            onClick={() => handleChange('isDarkMode', !settings.isDarkMode)}
            className="p-7 flex items-center justify-between group cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/25 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10 transition-colors">
                {settings.isDarkMode ? <Moon size={22} className="text-indigo-500" /> : <Sun size={22} className="text-amber-500" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Modo Oscuro</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Apariencia Visual</span>
              </div>
            </div>
            <div 
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${settings.isDarkMode ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.isDarkMode ? 'left-8' : 'left-1'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => handleChange('soundsEnabled', !settings.soundsEnabled)}
            className="p-7 flex items-center justify-between group cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/25 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10 transition-colors">
                {settings.soundsEnabled ? <Volume2 size={22} className="text-indigo-500" /> : <VolumeX size={22} className="text-slate-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Efectos de Sonido</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Feedback Auditivo</span>
              </div>
            </div>
            <div 
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${settings.soundsEnabled ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.soundsEnabled ? 'left-8' : 'left-1'}`}></div>
            </div>
          </div>

          <div 
            onClick={() => handleChange('fontSize', settings.fontSize === 'normal' ? 'large' : 'normal')}
            className="p-7 flex items-center justify-between group cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/25 active:bg-slate-100 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center space-x-5">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/10 transition-colors">
                <Type size={22} className="text-indigo-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">Fuente Grande</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Optimización Universal</span>
              </div>
            </div>
            <div 
              className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${settings.fontSize === 'large' ? 'bg-indigo-600 shadow-indigo-500/50' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.fontSize === 'large' ? 'left-8' : 'left-1'}`}></div>
            </div>
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
      <div className="flex flex-col items-center justify-center pt-12 pb-16 space-y-2 text-center">
         <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
           <span>{forgedTerm} EN EL SILENCIO</span>
           <Heart size={14} className="text-indigo-500 fill-indigo-500 animate-pulse" />
           <span>SHCE v3.5.0</span>
         </div>
         <div className="text-[9px] font-black text-slate-400/80 dark:text-slate-600/80 uppercase tracking-[0.3em] font-mono">
           www.sistemashce.com
         </div>
      </div>
    </div>
  );
};

export default Settings;
