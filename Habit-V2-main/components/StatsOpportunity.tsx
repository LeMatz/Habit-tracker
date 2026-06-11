import React, { useState, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { 
  Star, 
  Info, 
  AlertCircle, 
  GitCommit, 
  TrendingUp, 
  Award, 
  Dribbble, 
  Gauge, 
  Tag, 
  BookOpen,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { EstadoEventoOportunidad } from '../types';

const STATE_COLORS: Record<EstadoEventoOportunidad, { bg: string; text: string; border: string; label: string; desc: string; colorHex: string }> = {
  ejecutada: {
    bg: 'bg-emerald-550/10 dark:bg-emerald-550/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-555/20',
    label: 'Fluidez',
    desc: 'Ejecutado y Detectado. Respuesta atencional lograda con éxito.',
    colorHex: '#10b981'
  },
  no_ejecutada: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-605 dark:text-rose-450',
    border: 'border-rose-555/20',
    label: 'Bloqueo',
    desc: 'No Ejecutado y Detectado. Se detectó el gatillo pero no se actuó.',
    colorHex: '#f43f5e'
  },
  condicion_externa: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-555/20',
    label: 'Dormido',
    desc: 'No Ejecutado y No Detectado. Desconexión inconsciente del estímulo.',
    colorHex: '#f59e0b'
  },
  automatico: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-555/20',
    label: 'Automático',
    desc: 'Ejecutado y No Detectado. Hábito realizado en piloto automático.',
    colorHex: '#6366f1'
  },
  entrenamiento: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-650 dark:text-violet-400',
    border: 'border-violet-555/20',
    label: 'Entrenamiento',
    desc: 'Repeticiones voluntarias / simulación artificial para habituación.',
    colorHex: '#8b5cf6'
  }
};

const StatsOpportunity: React.FC = () => {
  const { registrosEventos, settings, today } = useHabits();

  // Selected state filter in response matrix
  const [selectedMatrixState, setSelectedMatrixState] = useState<EstadoEventoOportunidad | null>('ejecutada');

  // Selected context name in map section
  const [selectedContextName, setSelectedContextName] = useState<string | null>(null);

  // Toggle states for individual info "i" popovers to keep UI super clean
  const [showInfoRatio, setShowInfoRatio] = useState(false);
  const [showInfoStreak, setShowInfoStreak] = useState(false);
  const [showInfoRiver, setShowInfoRiver] = useState(false);
  const [showInfoContexts, setShowInfoContexts] = useState(false);

  const totalEvents = (registrosEventos || []).length;

  // Process key metrics
  const metrics = useMemo(() => {
    const list = registrosEventos || [];
    const ejecutadas = list.filter(e => e.estado === 'ejecutada').length;
    const noEjecutadas = list.filter(e => e.estado === 'no_ejecutada').length;
    const automaticos = list.filter(e => e.estado === 'automatico').length;
    const entrenamientos = list.filter(e => e.estado === 'entrenamiento').length;
    const externas = list.filter(e => e.estado === 'condicion_externa').length;

    const reales = ejecutadas + noEjecutadas + externas + automaticos;
    
    // Formula for attention filter: relation between fluidez + bloqueo vs dormido + automatico (i.e. (fluidez + bloqueo) / reales)
    const ratio_captura = reales > 0 ? ((ejecutadas + noEjecutadas) / reales) * 100 : 0;
    
    // Automaticity formula: automatico vs all others (real occurrences) = automaticos / reales
    const ratio_automaticidad = reales > 0 ? (automaticos / reales) * 100 : 0;
    
    // Streak calculation based on calendar days capturing any event
    const uniqueDates = Array.from(new Set(list.map(e => e.date))).sort();
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: string | null = null;

    const getDiffDaysLocal = (date1: string, date2: string) => {
      try {
        const d1 = new Date(date1 + 'T12:00:00Z');
        const d2 = new Date(date2 + 'T12:00:00Z');
        return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      } catch (e) {
        return 0;
      }
    };

    uniqueDates.forEach((dateStr) => {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diff = getDiffDaysLocal(prevDate, dateStr);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 1;
        }
      }
      prevDate = dateStr;
    });
    if (tempStreak > maxStreak) maxStreak = tempStreak;

    let currentStreak = 0;
    const getYesterdayStringLocal = (base: string) => {
      const d = new Date(base + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().split('T')[0];
    };

    const yesterday = getYesterdayStringLocal(today);
    const hasToday = uniqueDates.includes(today);
    const hasYesterday = uniqueDates.includes(yesterday);

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? today : yesterday;
      while (uniqueDates.includes(checkDate)) {
        currentStreak++;
        checkDate = getYesterdayStringLocal(checkDate);
      }
    }

    const rachaAtencion = {
      currentStreak,
      longestStreak: Math.max(currentStreak, maxStreak)
    };

    const indiceEntrenamientoRatio = reales > 0 ? (entrenamientos / reales) : 0;

    return {
      ejecutadas,
      noEjecutadas,
      automaticos,
      entrenamientos,
      externas,
      ratio_captura,
      ratio_automaticidad,
      reales,
      rachaAtencion,
      indiceEntrenamientoRatio
    };
  }, [registrosEventos, today]);

  // Capture ratio over time (cumulative curve) using the new detection formula over non-training events
  const runningRatioData = useMemo(() => {
    const list = registrosEventos || [];
    const sorted = [...list].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    let detectedCount = 0;
    let realCount = 0;
    let finalRatio = 0;

    return sorted.map((e, idx) => {
      if (e.estado !== 'entrenamiento') {
        realCount++;
        if (e.estado === 'ejecutada' || e.estado === 'no_ejecutada') {
          detectedCount++;
        }
        finalRatio = realCount > 0 ? Math.round((detectedCount / realCount) * 100) : 0;
      }
      return {
        eventIndex: `${idx + 1}`,
        dateLabel: new Date(e.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        ratio: finalRatio,
        estado: e.estado
      };
    });
  }, [registrosEventos]);

  // Context breakdowns
  const mapContextos = useMemo(() => {
    const list = (registrosEventos || []).filter(e => e.estado !== 'entrenamiento');
    const contextStats: Record<string, { ejecutada: number; no_ejecutada: number; condicion_externa: number; automatico: number; total: number }> = {};
    
    list.forEach(e => {
      const ctx = e.contexto.trim() || 'General';
      if (!contextStats[ctx]) {
        contextStats[ctx] = { ejecutada: 0, no_ejecutada: 0, condicion_externa: 0, automatico: 0, total: 0 };
      }
      if (e.estado in contextStats[ctx]) {
        contextStats[ctx][e.estado as keyof typeof contextStats[string]]++;
      }
      contextStats[ctx].total++;
    });
    
    return Object.entries(contextStats)
      .map(([name, stats]) => ({ name, ...stats, entrenamiento: 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [registrosEventos]);

  // Selected matrix state filter details is no longer utilizing old river math

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      
      {/* 1. ATENCIÓN Y AUTOMATICIDAD SECTION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[3rem] space-y-6 relative shadow-sm">
        
        {/* Info button on metrics */}
        <button 
          onClick={() => { haptics.selection(); setShowInfoRatio(!showInfoRatio); }}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-20"
          title="Ver Información descriptiva"
        >
          <Info size={16} />
        </button>

        <div className="flex items-center space-x-2 px-1">
          <Gauge className="text-indigo-500 stroke-[2.5]" size={18} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Atención</h3>
        </div>

        {showInfoRatio && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-[11.5px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles size={12} />
              <span>¿Cómo se calcula esta métrica?</span>
            </h4>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              <strong>Filtro de Atención (Detectado):</strong> Mide cuánto te das cuenta de las oportunidades. Es la relación entre las veces detectadas (Fluidez + Bloqueo) frente a todas las oportunidades reales que aparecieron.
            </p>
          </div>
        )}

        {/* Large visual percentages loaded side-by-side */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-105 dark:border-white/5 flex flex-col items-center justify-center text-center">
          {/* Percentage 1: Filtro de Atención */}
          <div className="p-4 flex flex-col justify-center items-center">
            <span className="block text-4xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
              {Math.round(metrics.ratio_captura)}%
            </span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mt-3">Filtro de Atención</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 mt-1.5 max-w-sm block leading-normal text-center">
              (Fluidez + Bloqueo) / Oportunidades Reales.
            </p>
          </div>
        </div>

        {/* Clean nominal values display with custom centering for last container */}
        <div className="space-y-4 pt-1">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">Registros Totales</span>
          <div className="grid grid-cols-12 gap-3">
            {/* Row 1 */}
            <div className="col-span-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center flex flex-col justify-center items-center">
              <span className="text-xl font-black text-emerald-500 leading-none">{metrics.ejecutadas}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 block">Fluidez</span>
            </div>
            <div className="col-span-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center flex flex-col justify-center items-center">
              <span className="text-xl font-black text-indigo-500 leading-none">{metrics.automaticos}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 block">Automático</span>
            </div>

            {/* Row 2 */}
            <div className="col-span-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center flex flex-col justify-center items-center">
              <span className="text-xl font-black text-rose-500 leading-none">{metrics.noEjecutadas}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 block">Bloqueo</span>
            </div>
            <div className="col-span-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center flex flex-col justify-center items-center">
              <span className="text-xl font-black text-amber-500 leading-none">{metrics.externas}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 block">Dormido</span>
            </div>

            {/* Row 3 - Centered box for Entrenamiento */}
            <div className="col-span-12 flex justify-center pt-1">
              <div className="w-1/2 min-w-[180px] bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center flex flex-col justify-center items-center">
                <span className="text-xl font-black text-violet-500 leading-none">{metrics.entrenamientos}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5 block">Entrenamiento</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 2. RACHA DE ATENCION DE ALERTA OPORTUNA & TENDENCIA TEMPORAL */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[3rem] space-y-6 relative shadow-sm">
        
        {/* Info button on attention streak */}
        <button 
          onClick={() => { haptics.selection(); setShowInfoStreak(!showInfoStreak); }}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-20"
          title="Ver Información descriptiva"
        >
          <Info size={16} />
        </button>

        <div className="flex items-center space-x-2 px-1">
          <Award className="text-emerald-500 stroke-[2.5]" size={18} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Racha de Atención</h3>
        </div>

        {showInfoStreak && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-[11.5px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles size={12} />
              <span>Racha de Atención y Curva Temporal</span>
            </h4>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              La Racha de Atención mide el número de días seguidos que has registrado algún ensayo voluntario o gatillo ambiental.
              A continuación, la curva muestra la tendencia acumulada de detección (atención) a lo largo de tu historial.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="text-center sm:text-left flex-1 space-y-1">
            <span className="block text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
              {metrics.rachaAtencion.currentStreak} {metrics.rachaAtencion.currentStreak === 1 ? 'DÍA' : 'DÍAS'}
            </span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Racha de Atención Activa • Historial Récord: {metrics.rachaAtencion.longestStreak} days
            </span>
          </div>
        </div>

        {/* Recharts captures curve trend combined here */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1 block mt-2">Curva Temporal de Captura</span>
          {runningRatioData.length > 1 ? (
            <div className="h-40 w-full bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-100 dark:border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={runningRatioData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="eventIndex" hide />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontWeight: '900', fill: '#64748b' }} width={30} />
                  <Tooltip content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const mapped = STATE_COLORS[data.estado as EstadoEventoOportunidad] || { label: 'Desconocido' };
                      return (
                        <div className="bg-slate-950 p-3 rounded-2xl border border-white/10 text-white space-y-1 text-[11px] shadow-xl">
                          <p className="text-slate-400 font-extrabold text-[10px] uppercase">{data.dateLabel} (Evento #{data.eventIndex})</p>
                          <p className="font-extrabold text-indigo-400">Ratio de Captura: {payload[0].value}%</p>
                          <p className="text-[9.5px] font-bold">Último gatillo: <span className="text-white">{mapped.label}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Area type="monotone" dataKey="ratio" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.12} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
              Faltan registros para mostrar la curva temporal de captura (mínimo 2 registros).
            </div>
          )}
        </div>
      </section>

      {/* 3. MATRIZ DE RESPUESTAS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[3rem] space-y-5 relative shadow-sm">
        
        {/* Info button on response matrix */}
        <button 
          onClick={() => { haptics.selection(); setShowInfoRiver(!showInfoRiver); }}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-20"
          title="Ver Información descriptiva"
        >
          <Info size={16} />
        </button>

        <div className="flex items-center space-x-2 px-1">
          <Star className="text-indigo-500 animate-pulse stroke-[2.5]" size={18} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Matriz de Respuestas</h3>
        </div>

        {showInfoRiver && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-[11.5px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles size={12} />
              <span>Matriz de Respuestas</span>
            </h4>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Cruza las dimensiones de ejecución y detección consciente para evaluar tu nivel de autonomía neuronal. Toca cualquier cuadrante para filtrar tu registro histórico correspondiente abajo.
            </p>
          </div>
        )}

        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic px-1 leading-relaxed">
          Selecciona un cuadrante para ver su historial.
        </p>

        {totalEvents > 0 ? (
          <div className="space-y-6 pt-2">
            
            {/* The 2x2 Matrix Graphic representation */}
            <div className="grid grid-cols-12 gap-2 sm:gap-3">
              {/* Outer container */}
              <div className="col-span-12 grid grid-cols-12 gap-1.5 sm:gap-2 bg-slate-500/5 dark:bg-slate-950/20 p-2 sm:p-4 border border-slate-205 dark:border-white/5 rounded-3xl">
                
                {/* Headers spacer */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Historial</span>
                </div>
                {/* Column Headers */}
                <div className="col-span-5 p-1.5 sm:p-2 bg-indigo-500/5 dark:bg-indigo-500/10 border border-slate-100 dark:border-white/5 rounded-xl text-center min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block font-bold truncate">Detectado: SÍ</span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-tight block truncate">Atención Activa</span>
                </div>
                <div className="col-span-5 p-1.5 sm:p-2 bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl text-center min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold truncate">Detectado: NO</span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-tight block truncate">Atención Ciega</span>
                </div>

                {/* ROW 1: Ejecutado SÍ */}
                <div className="col-span-2 p-1 bg-emerald-500/5 dark:bg-emerald-500/10 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col items-center justify-center min-w-0">
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-450 uppercase text-center block leading-none">EJECUTADO</span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 text-center block mt-1">SÍ</span>
                </div>
                {/* Cell 1: Fluidez */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedMatrixState('ejecutada'); }}
                  className={`col-span-5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer min-w-0 ${
                    selectedMatrixState === 'ejecutada'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="w-full min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[11px] sm:text-[12px] font-black uppercase text-emerald-600 dark:text-emerald-400 truncate">Fluidez</span>
                      <span className="text-[9px] sm:text-[10.5px] font-black bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 shrink-0">
                        {totalEvents > 0 ? Math.round(metrics.ejecutadas / totalEvents * 100) : 0}%
                      </span>
                    </div>
                    <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-black block tracking-wide mt-0.5">SÍ / SÍ</span>
                  </div>
                  <div className="mt-1 sm:mt-1.5">
                    <span className="text-base sm:text-lg font-black">{metrics.ejecutadas}</span>
                  </div>
                </button>

                {/* Cell 2: Automático */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedMatrixState('automatico'); }}
                  className={`col-span-5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer min-w-0 ${
                    selectedMatrixState === 'automatico'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="w-full min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[11px] sm:text-[12px] font-black uppercase text-indigo-600 dark:text-indigo-400 truncate">Automático</span>
                      <span className="text-[9px] sm:text-[10.5px] font-black bg-indigo-500/10 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 shrink-0">
                        {totalEvents > 0 ? Math.round(metrics.automaticos / totalEvents * 100) : 0}%
                      </span>
                    </div>
                    <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-black block tracking-wide mt-0.5">SÍ / NO</span>
                  </div>
                  <div className="mt-1 sm:mt-1.5">
                    <span className="text-base sm:text-lg font-black">{metrics.automaticos}</span>
                  </div>
                </button>

                {/* ROW 2: Ejecutado NO */}
                <div className="col-span-2 p-1 bg-rose-500/5 dark:bg-rose-500/10 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col items-center justify-center min-w-0">
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-450 uppercase text-center block leading-none">EJECUTADO</span>
                  <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 text-center block mt-1">NO</span>
                </div>
                {/* Cell 3: Bloqueo */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedMatrixState('no_ejecutada'); }}
                  className={`col-span-5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer min-w-0 ${
                    selectedMatrixState === 'no_ejecutada'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="w-full min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[11px] sm:text-[12px] font-black uppercase text-rose-600 dark:text-rose-455 truncate">Bloqueo</span>
                      <span className="text-[9px] sm:text-[10.5px] font-black bg-rose-500/10 px-2 py-0.5 rounded-full text-rose-600 dark:text-rose-400 shrink-0">
                        {totalEvents > 0 ? Math.round(metrics.noEjecutadas / totalEvents * 100) : 0}%
                      </span>
                    </div>
                    <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-black block tracking-wide mt-0.5">NO / SÍ</span>
                  </div>
                  <div className="mt-1 sm:mt-1.5">
                    <span className="text-base sm:text-lg font-black">{metrics.noEjecutadas}</span>
                  </div>
                </button>
                {/* Cell 4: Dormido */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedMatrixState('condicion_externa'); }}
                  className={`col-span-5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer min-w-0 ${
                    selectedMatrixState === 'condicion_externa'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-450 ring-2 ring-amber-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="w-full min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[11px] sm:text-[12px] font-black uppercase text-amber-600 dark:text-amber-455 truncate">Dormido</span>
                      <span className="text-[9px] sm:text-[10.5px] font-black bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-600 dark:text-amber-455 shrink-0">
                        {totalEvents > 0 ? Math.round(metrics.externas / totalEvents * 100) : 0}%
                      </span>
                    </div>
                    <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-black block tracking-wide mt-0.5">NO / NO</span>
                  </div>
                  <div className="mt-1 sm:mt-1.5">
                    <span className="text-base sm:text-lg font-black">{metrics.externas}</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Simplified training list selection button */}
            <div className="pt-1.5 duration-200">
              <button
                type="button"
                onClick={() => { haptics.selection(); setSelectedMatrixState('entrenamiento'); }}
                className={`w-full py-3 px-5 rounded-2xl text-[11.5px] font-black uppercase tracking-wider transition-all border flex items-center justify-center cursor-pointer active:scale-[0.99] ${
                  selectedMatrixState === 'entrenamiento'
                    ? 'bg-violet-600 border-violet-600 dark:bg-violet-600 dark:border-violet-600 text-white shadow-md shadow-violet-550/15'
                    : 'bg-violet-50/50 dark:bg-violet-950/10 border-violet-200/50 dark:border-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30'
                }`}
              >
                <span>Entrenamientos ({metrics.entrenamientos})</span>
              </button>
            </div>

            {/* List of matching selected matrix state events */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Cuadrante seleccionado: <span className={STATE_COLORS[selectedMatrixState!].text}>{STATE_COLORS[selectedMatrixState!].label}</span>
                </span>
                
              </div>

              {(registrosEventos.filter(e => e.estado === selectedMatrixState).length > 0) ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {[...registrosEventos].filter(e => e.estado === selectedMatrixState).reverse().map((evt) => {
                    const dateObj = new Date(evt.timestamp);
                    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div 
                        key={evt.id}
                        className="p-3 bg-slate-50 dark:bg-slate-950/55 border border-slate-200/50 dark:border-white/5 rounded-xl space-y-2 text-[11px]"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                              {evt.contexto}
                            </span>
                            {evt.estadoEmocional && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700 text-[9px]">•</span>
                                <span className="px-1.5 py-0.5 bg-pink-105 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold text-[10px] rounded-md tracking-tight">
                                  {evt.estadoEmocional}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                            {formattedDate}
                          </span>
                        </div>
                        {evt.notas && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic font-semibold leading-relaxed">
                            "{evt.notas}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-[11px] italic bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                  Ningún evento registrado en la combinación "{STATE_COLORS[selectedMatrixState!].label}" todavía.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-3">
            <div className="flex justify-center space-x-1 py-1">
              <Star className="text-slate-300 dark:text-slate-700/50" size={14} />
              <Star className="text-slate-400 dark:text-slate-700 animate-pulse" size={18} />
              <Star className="text-slate-300 dark:text-slate-700/50" size={14} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Aún no hay ventanas de oportunidad capturadas</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-semibold">
              La matriz de respuestas aparecerá aquí con los porcentajes y reportes detallados una vez que registres tu primer evento.
            </p>
          </div>
        )}
      </section>

      {/* 4. MAPA DE CONTEXTOS RECURRENTES */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[3rem] space-y-5 relative shadow-sm">
        
        {/* Info button on context map */}
        <button 
          onClick={() => { haptics.selection(); setShowInfoContexts(!showInfoContexts); }}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-20"
          title="Ver Información descriptiva"
        >
          <Info size={16} />
        </button>

        <div className="flex items-center space-x-2 px-1">
          <Dribbble className="text-orange-500 animate-spin duration-[8000ms] stroke-[2.5]" size={18} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Mapa de Contextos</h3>
        </div>

        {showInfoContexts && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-500/20 rounded-2xl space-y-2 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-[11.5px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles size={12} />
              <span>Hábitos por Entorno</span>
            </h4>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Muestra en qué situaciones o lugares se presenta más tu hábito y qué tan bien respondes en cada escenario, ayudándote a identificar tus fortalezas y debilidades.
            </p>
          </div>
        )}

        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic px-1 leading-relaxed">
          Tus contextos donde pueden aparecer las Oportunidades. Toca un contexto para ver el detalle de sus estados emocionales.
        </p>

        {mapContextos.length > 0 ? (
          <div className="space-y-4 pt-1">
            {mapContextos.map((ctx, idx) => {
              const total = ctx.total || 1;
              const perEjecutadas = (ctx.ejecutada / total) * 100;
              const perOmitidas = (ctx.no_ejecutada / total) * 100;
              const perExternas = (ctx.condicion_externa / total) * 100;
              const perAutomaticos = (ctx.automatico / total) * 100;
              const perEntrenamientos = (ctx.entrenamiento / total) * 100;
              const isSelected = selectedContextName === ctx.name;

              // Calculate emotional breakdowns for this context
              const emotionCounts: Record<string, number> = {};
              (registrosEventos || [])
                .filter(e => (e.contexto.trim() || 'General') === ctx.name && e.estadoEmocional)
                .forEach(e => {
                  const em = e.estadoEmocional!.trim();
                  if (em) {
                    emotionCounts[em] = (emotionCounts[em] || 0) + 1;
                  }
                });
              const emotionList = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);

              return (
                <div 
                  key={idx} 
                  onClick={() => { haptics.selection(); setSelectedContextName(isSelected ? null : ctx.name); }}
                  className={`p-5 rounded-3xl border transition-all space-y-3 cursor-pointer select-none active:scale-[0.99] ${
                    isSelected 
                      ? 'bg-slate-100 dark:bg-slate-900/80 border-indigo-500/30 dark:border-indigo-500/40 ring-1 ring-indigo-500/5 dark:ring-indigo-500/10' 
                      : 'bg-slate-50 dark:bg-slate-950 p-5 border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {ctx.name}
                    </span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider font-bold">
                      {ctx.total} {ctx.total === 1 ? 'registro' : 'registros'}
                    </span>
                  </div>

                  {/* Segmented Horizon Stacked Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden p-0 flex">
                    {ctx.ejecutada > 0 && (
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${perEjecutadas}%` }} 
                        title={`Ejecutada: ${ctx.ejecutada}`}
                      />
                    )}
                    {ctx.no_ejecutada > 0 && (
                      <div 
                        className="h-full bg-rose-500" 
                        style={{ width: `${perOmitidas}%` }} 
                        title={`Bloqueo: ${ctx.no_ejecutada}`}
                      />
                    )}
                    {ctx.condicion_externa > 0 && (
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${perExternas}%` }} 
                        title={`Dormido: ${ctx.condicion_externa}`}
                      />
                    )}
                    {ctx.automatico > 0 && (
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${perAutomaticos}%` }} 
                        title={`Automático: ${ctx.automatico}`}
                      />
                    )}
                    {ctx.entrenamiento > 0 && (
                      <div 
                        className="h-full bg-violet-500" 
                        style={{ width: `${perEntrenamientos}%` }} 
                        title={`Entrenamiento: ${ctx.entrenamiento}`}
                      />
                    )}
                  </div>

                  {/* Indicators details legend */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1 text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-emerald-500" />
                      <span>Fluidez ({ctx.ejecutada})</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-rose-500" />
                      <span>Bloqueo ({ctx.no_ejecutada})</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-amber-500" />
                      <span>Dormido ({ctx.condicion_externa})</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded bg-indigo-500" />
                      <span>Automático ({ctx.automatico})</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="pt-2.5 mt-2.5 border-t border-dashed border-slate-200 dark:border-white/5 space-y-2 animate-in fade-in duration-200">
                      <p className="text-[10px] font-black uppercase text-pink-500 dark:text-pink-400 tracking-wider">
                        Distribución de Estados Emocionales:
                      </p>
                      {emotionList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {emotionList.map(([emotion, count]) => (
                            <div 
                              key={emotion}
                              className="px-2 py-0.5 bg-pink-100/40 dark:bg-pink-950/20 border border-pink-200/30 dark:border-pink-500/10 text-pink-700 dark:text-pink-400 rounded-lg text-[11px] font-extrabold flex items-center space-x-1 shrink-0"
                            >
                              <span>{emotion}</span>
                              <span className="px-1 py-0.25 bg-pink-200/50 dark:bg-pink-900/60 rounded text-[9px] font-extrabold text-pink-805 dark:text-pink-300">
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic font-black">No hay estados emocionales especificados para este contexto.</p>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
            Aún no hay contextos suficientes. Registra el contexto junto con tu evento en la página HOY para poblar este mapa.
          </div>
        )}
      </section>

    </div>
  );
};

export default StatsOpportunity;
