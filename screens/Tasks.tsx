
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { TASKS_POOL } from '../constants';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import { ClipboardCheck, Sparkles, Brain, CheckCircle2, Info, Settings2, Loader2, Microscope, X, Lightbulb, Target } from 'lucide-react';

const Tasks: React.FC = () => {
  const { taskState, completeDailyTask, settings } = useHabits();
  const [infoModal, setInfoModal] = useState<'mission' | null>(null);
  
  const currentTask = TASKS_POOL.find(t => t.id === taskState.currentTaskId);

  const handleComplete = () => {
    if (taskState.isCompleted) return;
    haptics.success();
    if (settings.soundsEnabled) soundService.playTaskComplete();
    completeDailyTask();
  };

  if (!currentTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Asignando Misión...</p>
      </div>
    );
  }

  const renderInfoModal = () => {
    if (!infoModal) return null;

    const content = {
      icon: <Target className="text-cyan-400" size={32} />,
      title: "MISION DIARIA",
      subtitle: "tareas opcionales",
      rules: [
        { icon: <Sparkles size={18} className="text-amber-400" />, title: "Recompensa", desc: "Cada misión completada otorga +5 puntos de Maná inmediatamente." },
        { icon: <Brain size={18} className="text-indigo-400" />, title: "Propósito", desc: "Estas tareas entrenan funciones ejecutivas superiores que complementan y facilitan la creación de nuevos hábitos" },
        { icon: <CheckCircle2 size={18} className="text-emerald-400" />, title: "Disponibilidad", desc: "Se asigna una nueva misión aleatoria cada 24 horas." }
      ]
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
        <div className="bg-[#020617] border border-white/10 rounded-[3.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-500 relative">
          <button onClick={() => setInfoModal(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><X size={20} /></button>
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5">{content.icon}</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{content.title}</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{content.subtitle}</p>
            </div>
            <div className="space-y-6">
              {content.rules.map((rule, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="mt-1">{rule.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{rule.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setInfoModal(null)} className="w-full bg-white/5 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] border border-white/10">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 text-white pb-32">
      <div className="flex items-center space-x-3 px-1">
        <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
           <ClipboardCheck className="text-cyan-400" size={24} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black tracking-tight dark:text-white text-slate-900 leading-none">Misión Diaria</h2>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Refuerzo Cognitivo</span>
        </div>
      </div>

      <div className={`p-10 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden group ${taskState.isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-white/5 shadow-2xl backdrop-blur-sm'}`}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-3xl"></div>
        
        {/* Info Button */}
        <button 
          onClick={() => { haptics.selection(); setInfoModal('mission'); }}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white/60 transition-colors z-20"
        >
          <Info size={18} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className={`p-7 rounded-[2.8rem] transition-all duration-500 border shadow-2xl ${taskState.isCompleted ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border-white/10 text-indigo-400'}`}>
            {taskState.isCompleted ? <CheckCircle2 size={48} className="animate-in zoom-in" /> : <Brain size={48} className="animate-pulse" />}
          </div>

          <div className="space-y-4">
            <h3 className={`text-2xl font-black tracking-tight leading-tight ${taskState.isCompleted ? 'text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {currentTask.title}
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {currentTask.description}
            </p>
          </div>

          {!taskState.isCompleted ? (
            <div className="w-full pt-4">
              <button 
                onClick={handleComplete}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-3 border border-indigo-400/20"
              >
                <Sparkles size={16} />
                <span>Confirmar Ejecución</span>
              </button>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">+5 Puntos de Maná</span>
              </div>
            </div>
          ) : (
            <div className="w-full pt-4 flex flex-col items-center space-y-4">
              <div className="px-8 py-4 bg-emerald-500/20 text-emerald-400 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                ¡Misión Cumplida!
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Siguiente reto en el próximo ciclo</p>
            </div>
          )}
        </div>
      </div>

      {/* Scientific Basis Box */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-[3rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] space-y-6 shadow-2xl overflow-hidden">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Microscope size={18} className="text-indigo-400" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500/80">Base Científica</h4>
            </div>
            <div className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-white/5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neuro-Insights</span>
            </div>
          </div>
          
          <div className="flex items-start space-x-5">
            <div className="flex-1">
              <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold italic">
                "{currentTask.neuroBasis}"
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2 opacity-40">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-3 px-6 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[2rem] opacity-70">
        <Settings2 size={14} className="text-indigo-400" />
        <p className="text-[10px] font-bold text-slate-500 italic text-center leading-tight">
          La adaptabilidad es la marca del genio. Modifica la misión según tu voluntad actual.
        </p>
      </div>

      {renderInfoModal()}
    </div>
  );
};

export default Tasks;
