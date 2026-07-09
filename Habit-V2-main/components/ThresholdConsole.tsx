import React, { useState, useMemo, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import { 
  Zap, 
  Activity, 
  Sliders, 
  Sparkles, 
  X, 
  Eye, 
  EyeOff,
  Info
} from 'lucide-react';

const ThresholdConsole: React.FC = () => {
  const { 
    streak, 
    settings, 
    umbralActual, 
    ciclosHistoricos, 
    registrosDiarios, 
    addThresholdCheckin,
    canCheckin
  } = useHabits();

  // Selected Spectrum Option (for execution check-in menu)
  const [selectedSpectrumOption, setSelectedSpectrumOption] = useState<'emd' | '2min' | 'complete'>('complete');

  // Toggle for historical overlays
  const [showHistory, setShowHistory] = useState(true);

  // Check-in modal state
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinType, setCheckinType] = useState<'chequeo' | 'ejecución'>('chequeo');
  const [tempPercent, setTempPercent] = useState<number>(umbralActual);
  
  // Custom temporary factor check-in values (dynamic based on user settings variables)
  const variables = useMemo(() => {
    return settings.thresholdVariables || [
      { id: 'var_sleep', name: 'Calidad de Sueño' },
      { id: 'var_stress', name: 'Nivel de estrés' },
      { id: 'var_exercise', name: 'Ejercicio diario' }
    ];
  }, [settings.thresholdVariables]);

  const [dynamicFactors, setDynamicFactors] = useState<Record<string, number>>({});

  // Reset or initialize dynamic factors when check-in opens
  useEffect(() => {
    if (checkinOpen) {
      const initial: Record<string, number> = {};
      variables.forEach(v => {
        initial[v.id] = 3;
      });
      setDynamicFactors(initial);
      setSelectedSpectrumOption('complete');
    }
  }, [checkinOpen, variables]);

  const handleFactorChange = (id: string, val: number) => {
    setDynamicFactors(prev => ({ ...prev, [id]: val }));
  };

  // Explanation modals / tooltips state
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; desc: string } | null>(null);

  // Projection velocity (defined manually in settings)
  const computedDailySpeed = settings.thresholdRate ?? 20;

  // Extrapolation of days until 100%
  const daysToTriggerOfCurrent = useMemo(() => {
    const remaining = 100 - umbralActual;
    const days = remaining / (computedDailySpeed || 1);
    return days;
  }, [umbralActual, computedDailySpeed]);

  const timeEstimatedLabel = useMemo(() => {
    if (daysToTriggerOfCurrent <= 0) return "Inminente (100%)";
    if (daysToTriggerOfCurrent < 1) {
      const hours = Math.round(daysToTriggerOfCurrent * 24);
      return `Prox. ${hours} horas`;
    }
    return `Prox. ${daysToTriggerOfCurrent.toFixed(1)} días`;
  }, [daysToTriggerOfCurrent]);

  // Center & SVG dimensions of local spiral
  const cx = 150;
  const cy = 150;
  
  const getSpiralPoint = (percent: number, offsetRadius = 0) => {
    // Theta starts at inner core and spirals out
    const thetaMin = 0.8 * Math.PI;
    const thetaMax = 4.2 * Math.PI;
    const theta = thetaMin + (percent / 100) * (thetaMax - thetaMin);
    
    const b = 8.5; // pitch
    const r = 35 + b * theta + offsetRadius; // Pushed outer starting radius from 26 to 35 to prevent overlap with Central Box
    
    return {
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
      theta,
      r
    };
  };

  const getSpiralPath = (startPct: number, endPct: number, offsetRadius = 0) => {
    const points = [];
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const pct = startPct + (i / steps) * (endPct - startPct);
      const pt = getSpiralPoint(pct, offsetRadius);
      points.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const handleOpenCheckin = (type: 'chequeo' | 'ejecución') => {
    haptics.selection();
    setCheckinType(type);
    setTempPercent(Math.max(0, Math.min(100, umbralActual)));
    setCheckinOpen(true);
  };

  const handleSubmitCheckin = () => {
    haptics.success();
    if (settings.soundsEnabled) soundService.playSuccess();
    
    let label = '';
    if (checkinType === 'ejecución' && settings.showExecutionSpectrum) {
      if (selectedSpectrumOption === 'emd') label = ` [${settings.emergencyHabit || 'EMD'}]`;
      if (selectedSpectrumOption === '2min') label = ` [${settings.twoMinuteHabit || '2 minutos'}]`;
      if (selectedSpectrumOption === 'complete') label = ` [${settings.completeHabit || 'Hóbito Completo'}]`;
    }

    addThresholdCheckin(
      checkinType,
      tempPercent,
      checkinType === 'chequeo' ? dynamicFactors : currentVariableValues,
      false, // isIntervention (Removed action)
      undefined,
      `Registro de ${checkinType === 'ejecución' ? 'Ejecución' : 'Chequeo'}${label}`,
      checkinType === 'ejecución' ? selectedSpectrumOption : undefined
    );
    
    setCheckinOpen(false);
  };

  // Get current rating state of variables from latest check-in or default values
  const currentVariableValues = useMemo(() => {
    const latest = registrosDiarios.slice().sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];
    const values: Record<string, number> = {};
    variables.forEach(v => {
      values[v.id] = (latest && latest.factores && latest.factores[v.id] !== undefined) 
        ? latest.factores[v.id] 
        : 3;
    });
    return values;
  }, [registrosDiarios, variables]);

  const getFactorColorClass = (val: number, isStress = false) => {
    if (isStress) {
      if (val >= 4) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      if (val === 3) return 'bg-yellow-500';
      return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    } else {
      if (val >= 4) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      if (val === 3) return 'bg-yellow-500';
      return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* 1. Header (Espiral de Umbral) */}
      <div className="flex flex-col space-y-2 px-1">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shadow-inner text-cyan-600 dark:text-cyan-400">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Espiral de Umbral</h2>
              <button 
                onClick={() => {
                  haptics.selection();
                  setInfoModalContent({
                    title: "Espiral de Umbral",
                    desc: "La Espiral de Umbral visualiza dinámicamente tu acumulación hacia un límite crítico de disparo. Cada ciclo contiene 10 segmentos de tensión donde realizas chequeos o ejecutas el hábito para mitigar o resetear la tensión."
                  });
                }}
                className="p-1 text-slate-450 hover:text-cyan-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-1.5"
                title="Saber más"
              >
                <Info size={14} />
              </button>
            </div>
            <p className="text-[10px] text-cyan-500 font-extrabold uppercase tracking-widest mt-1">
              {settings.habitName ? settings.habitName : 'SISTEMA SHCE • REVOLUCIÓN DE HÁBITOS'}
            </p>
          </div>
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-2 pl-1">
          Mide el aumento diario de la espiral hasta que se hace necesario Ejecutar el hábito deseado
        </p>
      </div>

      {/* 2. Visualización de la Espiral */}
      <div className="bg-slate-950 border border-white/5 rounded-[3.5rem] p-6 text-white relative overflow-hidden shadow-2xl flex flex-col items-center">
        {/* Lights backgrounds */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-[60px]" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-[60px]" />

        {/* View Toggle and Controls */}
        <div className="w-full flex justify-between items-center z-10 mb-4 px-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[9px] font-black tracking-[0.25em] text-slate-400 uppercase">Ciclo Actual</span>
            <button 
              onClick={() => {
                haptics.selection();
                setInfoModalContent({
                  title: "Gráfico de Espiral",
                  desc: "Muestra la acumulación de tu ciclo. Las divisiones representan tramos del 10%."
                });
              }}
              className="p-1 text-slate-500 hover:text-cyan-400 rounded-full"
            >
              <Info size={11} />
            </button>
          </div>
          <button 
            onClick={() => { haptics.selection(); setShowHistory(!showHistory); }}
            className={`p-2.5 rounded-full border transition-all flex items-center space-x-1.5 ${showHistory ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
            title="Mostrar Historial de Ciclos"
          >
            {showHistory ? <Eye size={12} /> : <EyeOff size={12} />}
            <span className="text-[8px] font-black uppercase tracking-wider">Historial</span>
          </button>
        </div>

        {/* The SVG Container */}
        <div className="relative w-72 h-72 flex items-center justify-center select-none">
          <svg className="w-full h-full transform -rotate-12 overflow-visible" viewBox="0 0 300 300">
            {/* Define Gradients & Dropshadow glow filters */}
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* A. Historial Superpuesto */}
            {showHistory && ciclosHistoricos.map((pastCycle, idx) => {
              const offsetRadius = -5 * (idx + 1);
              return (
                <path
                  key={`past-${idx}`}
                  d={getSpiralPath(0, 100, offsetRadius)}
                  fill="none"
                  stroke={pastCycle.interrumpido ? "rgba(244, 63, 94, 0.12)" : "rgba(6, 182, 212, 0.12)"}
                  strokeWidth="2"
                  strokeDasharray="2, 3"
                />
              );
            })}

            {/* B. La Espiral Base & Relleno Progresivo (drawn with visual gaps between segments to make divisions clear) */}
            {[...Array(10)].map((_, idx) => {
              const startPct = idx * 10;
              const endPct = startPct + 10;
              const isFilled = umbralActual >= endPct;
              const isPartiallyFilled = umbralActual > startPct && umbralActual < endPct;
              
              let strokeColor = "rgba(47, 55, 69, 0.4)"; // Empty track
              let strokeW = "5";
              let shadowFilter = "";

              if (isFilled) {
                strokeColor = "url(#cyan-gradient)";
                strokeW = "7";
                shadowFilter = "url(#glow-cyan)";
              } else if (isPartiallyFilled) {
                strokeColor = "#06b6d4";
                strokeW = "6.5";
              }

              // Added subtle gap of 0.8% on each side to make the tramos of proportion highly clear and separated
              const pathSelection = getSpiralPath(startPct + 0.8, endPct - 0.8);

              return (
                <g key={`seg-${idx}`}>
                  {/* Visual path segment (no custom clicks allows manual metric override) */}
                  <path
                    d={pathSelection}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeLinecap="round"
                    filter={shadowFilter}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* C. Proyección de Disparo */}
            {umbralActual < 100 && (
              <g>
                <path
                  d={getSpiralPath(umbralActual, 100)}
                  fill="none"
                  stroke="rgba(245, 158, 11, 0.35)"
                  strokeWidth="3"
                  strokeDasharray="4, 5"
                />
              </g>
            )}
          </svg>

          {/* Central Overlay Box displaying threshold percentage & speed details */}
          <div className="absolute flex flex-col items-center justify-center bg-slate-900 border border-white/5 shadow-2xl p-5 rounded-full w-28 h-28 text-center bg-opacity-95 transform -translate-y-1">
            <span className="text-[7px] font-black text-cyan-400 uppercase tracking-[0.25em]">Métrica Umbral</span>
            <span className="text-3xl font-black tracking-tight leading-none my-1">{umbralActual}%</span>
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">{timeEstimatedLabel}</span>
          </div>
        </div>

        {/* Real-time Forecast Banner */}
        <div className="w-full mt-4 p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between text-left">
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Tasa de Proyección</span>
              <p className="text-[13px] font-black text-slate-200 mt-0.5">+{computedDailySpeed}% por día</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Punto de umbral</span>
            <p className="text-[13px] font-black text-amber-400 mt-0.5">{timeEstimatedLabel}</p>
          </div>
        </div>
      </div>

      {/* 3. Check-in Diario Section (Limited to once per day!) */}
      <div className="space-y-4 px-1">
        <div className="flex items-center space-x-1.5 justify-start">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Check-In Regulador</h3>
          <button 
            onClick={() => {
              haptics.selection();
              setInfoModalContent({
                title: "Check-In Regulador",
                desc: "Herramienta diaria. Usa el 'Chequeo' para registrar el estado actual y la 'Ejecución' para liberes o reduzcas la acumulación del umbral."
              });
            }}
            className="p-1 text-slate-400 hover:text-indigo-500 rounded-full"
          >
            <Info size={14} />
          </button>
        </div>

        {!canCheckin() ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] block">Entrada Completada Hoy</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              Ya realizaste tu registro diario. ¡Racha activa de {streak.currentStreak} días! Vuelve mañana para un nuevo control.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOpenCheckin('chequeo')}
              className="group flex flex-col justify-between p-6 bg-slate-900/90 hover:bg-slate-900 text-white rounded-[2.2rem] border border-cyan-500/30 hover:border-cyan-400 shadow-lg text-left h-36 transition-all transform active:scale-95 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-2xl group-hover:bg-cyan-600/15" />
              <div className="p-3 bg-cyan-500/15 rounded-2xl w-fit text-cyan-400">
                <Activity size={18} />
              </div>
              <div>
                <span className="text-sm font-black block text-slate-100">Chequeo</span>
                <span className="text-[8.5px] font-black uppercase tracking-widest text-cyan-400 mt-0.5 block">
                  {settings.chequeoSubtitle || 'Monitorear Estado'}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleOpenCheckin('ejecución')}
              className="group flex flex-col justify-between p-6 bg-slate-900/90 hover:bg-slate-900 text-white rounded-[2.2rem] border border-orange-500/30 hover:border-orange-400 shadow-lg text-left h-36 transition-all transform active:scale-95 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-2xl group-hover:bg-orange-600/15" />
              <div className="p-3 bg-orange-500/15 rounded-2xl w-fit text-orange-400">
                <Zap size={18} />
              </div>
              <div>
                <span className="text-sm font-black block text-slate-100">Ejecución</span>
                <span className="text-[8.5px] font-black uppercase tracking-widest text-orange-400 mt-0.5 block">
                  {settings.ejecucionSubtitle || 'Mitigar / Resetear'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4. Variables de Control section (displays user dynamic settings variables) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 rounded-[3rem] shadow-xl space-y-6 relative transition-all">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center space-x-1.5">
            <Sliders className="text-cyan-500" size={16} />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Variables de Control</h3>
            <button 
              onClick={() => {
                haptics.selection();
                setInfoModalContent({
                  title: "Variables de Control",
                  desc: "Este listado muestra las variables que influyen sobre la acumulación. Se actualizan según el último Check-In registrado."
                });
              }}
              className="p-1 text-slate-400 hover:text-indigo-500 rounded-full"
            >
              <Info size={14} />
            </button>
          </div>
        </div>

        {/* Variables Dynamic rating display */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
              <span>Auditoría de Estado</span>
              <span>{registrosDiarios.length > 0 ? "Actualizado" : "Valores Básicos"}</span>
            </div>
            {registrosDiarios.length > 0 ? (
              <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed italic">
                Mostrando las métricas calculadas a partir de tu último check-in registrado hoy en el panel.
              </p>
            ) : (
              <p className="text-[11.5px] font-bold text-slate-500 leading-relaxed italic">
                Sin registros previos de check-in en este ciclo. Se muestran valores basales neutros (3).
              </p>
            )}
          </div>

          <div className="space-y-4 pt-1">
            {variables.map((v) => {
              const val = currentVariableValues[v.id] ?? 3;
              const percent = (val / 5) * 100;
              const isStress = v.name.toLowerCase().includes('estrés') || v.name.toLowerCase().includes('tension') || v.name.toLowerCase().includes('stress');
              return (
                <div key={v.id} className="space-y-1.5 px-0.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-450 uppercase tracking-tight">
                    <span>{v.name}</span>
                    <span className="font-extrabold">{val}/5</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0">
                    <div 
                      className={`h-full rounded-full ${getFactorColorClass(val, isStress)} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MODAL: Chequeo / Ejecución dialog (Custom layout: fixed header and footer, scrollable fields avoids overlap) */}
      {checkinOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-950 border border-white/10 rounded-[3rem] w-full max-w-sm p-7 shadow-2xl animate-in zoom-in duration-500 relative flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${checkinType === 'ejecución' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'}`}>
                  {checkinType === 'ejecución' ? <Zap size={18} /> : <Activity size={18} />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    {checkinType === 'ejecución' ? (settings.ejecucionSubtitle || 'Ejecución') : (settings.chequeoSubtitle || 'Chequeo')}
                  </h3>
                  <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest block mt-0.5">Auditoría de Resistencia</span>
                </div>
              </div>
              <button 
                onClick={() => setCheckinOpen(false)}
                className="p-1.5 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body - Scrollable content area so sliders never block the footer confirm button */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1 scrollbar-thin scrollbar-thumb-white/20">
              
              {/* Target / Percent Picker */}
              <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  ¿Cuál es tu porcentaje de tensión actual?
                </label>
                <p className="text-3xl font-black text-white leading-none">{tempPercent}%</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={tempPercent}
                  onChange={(e) => {
                    haptics.selection();
                    setTempPercent(parseInt(e.target.value));
                  }}
                  className="w-full h-1 cursor-pointer bg-slate-800 rounded-full mt-2 accent-cyan-400"
                />
                <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest px-1 mt-1">
                  <span>Mínimo 0%</span>
                  <span>100% Disparo</span>
                </div>
              </div>

              {/* OPTION CARDS: Espectro de Ejecución (Only shown if enabled and in execution type checkin) */}
              {settings.showExecutionSpectrum && checkinType === 'ejecución' && (
                <div className="space-y-3 bg-white/5 p-4.5 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black uppercase text-orange-450 tracking-wider block">Espectro de Ejecución</span>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-normal">
                    Selecciona el nivel de racha ejecutado:
                  </p>
                  
                  <div className="space-y-2 mt-1">
                    {[
                      { key: 'emd', label: settings.emergencyHabit || 'EMD', desc: 'Esfuerzo Mínimo Diario' },
                      { key: '2min', label: settings.twoMinuteHabit || '2 minutos', desc: 'Hábito rápido' },
                      { key: 'complete', label: settings.completeHabit || 'Hóbito Completo', desc: 'Objetivo total' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { haptics.selection(); setSelectedSpectrumOption(opt.key as any); }}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${selectedSpectrumOption === opt.key ? 'bg-orange-500/20 border-orange-500 text-white' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10'}`}
                      >
                        <div>
                          <span className="text-xs font-black block">{opt.label}</span>
                          <span className="text-[8px] font-medium text-slate-500 uppercase tracking-wider block mt-0.5">{opt.desc}</span>
                        </div>
                        {selectedSpectrumOption === opt.key && <Sparkles size={12} className="text-orange-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Factors rating inputs (Only shown for 'chequeo' or if evaluating variables) */}
              {checkinType === 'chequeo' && (
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Auditar Factores de Consecuencia</span>
                  
                  {variables.map((v) => {
                    const value = dynamicFactors[v.id] ?? 3;
                    return (
                      <div key={v.id} className="space-y-1 bg-white/5 border border-white/5 p-3 rounded-xl">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                          <span>{v.name}</span>
                          <span className="text-white">{value}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={value}
                          onChange={(e) => handleFactorChange(v.id, parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-850 rounded-full outline-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer - Locked/sticky below form content */}
            <div className="pt-4 border-t border-white/5 bg-slate-950">
              <button
                onClick={handleSubmitCheckin}
                className={`w-full font-black py-4.5 rounded-2xl text-[10px] uppercase tracking-[0.25em] text-white shadow-xl transition-all border ${checkinType === 'ejecución' ? 'bg-orange-600 hover:bg-orange-500 border-orange-500 shadow-orange-600/25' : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-50 border-cyan-500 shadow-cyan-600/25'}`}
              >
                Confirmar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HELP/INFO MODAL */}
      {infoModalContent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl relative">
            <button 
              onClick={() => setInfoModalContent(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-450 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
            >
              <X size={14} />
            </button>
            <div className="space-y-4 text-center p-2">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl w-fit mx-auto">
                <Info size={24} />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{infoModalContent.title}</h4>
              <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">
                {infoModalContent.desc}
              </p>
              <button
                onClick={() => setInfoModalContent(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl text-[9px] uppercase tracking-wider transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThresholdConsole;
