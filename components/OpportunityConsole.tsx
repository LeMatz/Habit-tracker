import React, { useState, useMemo, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import { 
  Star, 
  HelpCircle, 
  Plus, 
  Tag, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Clock,
  BookOpen,
  Info,
  Brain
} from 'lucide-react';
import { EstadoEventoOportunidad } from '../types';

const STATE_DETAILS: Record<EstadoEventoOportunidad, { 
  bg: string; 
  text: string; 
  border: string; 
  label: string; 
  shortDesc: string; 
  infoText: string;
}> = {
  ejecutada: {
    bg: 'bg-emerald-550/5 hover:bg-emerald-550/10 dark:bg-emerald-550/10 dark:hover:bg-emerald-550/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    label: 'Fluidez',
    shortDesc: 'Ejecutado y Detectado.',
    infoText: 'Apareció una oportunidad, te diste cuenta (Detectado) y respondiste adecuadamente (Ejecutado).'
  },
  no_ejecutada: {
    bg: 'bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/10 dark:hover:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    label: 'Bloqueo',
    shortDesc: 'No Ejecutado y Detectado.',
    infoText: 'Detectaste la oportunidad (Detectado) pero fallaste en responder por distracción, resistencia o por un factor externo (No Ejecutado).'
  },
  condicion_externa: {
    bg: 'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    label: 'Dormido',
    shortDesc: 'No Ejecutado y No Detectado.',
    infoText: 'La oportunidad apareció pero no te diste cuenta (No Detectado) y por lo tanto no realizaste la acción (No Ejecutado).'
  },
  automatico: {
    bg: 'bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    label: 'Automático',
    shortDesc: 'Ejecutado y No Detectado.',
    infoText: 'Completaste la acción o hábito (Ejecutado) pero sin percatarte activamente en el momento (No Detectado).'
  },
  entrenamiento: {
    bg: 'bg-violet-500/5 hover:bg-violet-500/10 dark:bg-violet-500/10 dark:hover:bg-violet-500/20',
    text: 'text-violet-650 dark:text-violet-400',
    border: 'border-violet-500/20',
    label: 'Entrenamiento',
    shortDesc: 'Entrenamiento Consciente.',
    infoText: 'Práctica del comportamiento deseado en una situación no real'
  }
};

const QUICK_TAGS = ['En Casa', 'En el Trabajo', 'En Tránsito', 'Con amigos'];

const OpportunityConsole: React.FC = () => {
  const { 
    registrosEventos, 
    addRegistroEvento, 
    settings,
    today 
  } = useHabits();

  // Process key metrics for success tracking
  const metrics = useMemo(() => {
    const list = registrosEventos || [];
    const ejecutadas = list.filter(e => e.estado === 'ejecutada').length;
    const noEjecutadas = list.filter(e => e.estado === 'no_ejecutada').length;
    const automaticos = list.filter(e => e.estado === 'automatico').length;
    const externas = list.filter(e => e.estado === 'condicion_externa').length;

    const reales = ejecutadas + noEjecutadas + externas + automaticos;
    const ratio_automaticidad = reales > 0 ? (automaticos / reales) * 100 : 0;

    return {
      ratio_automaticidad,
      reales,
      automaticos,
      ejecutadas,
      noEjecutadas,
      externas
    };
  }, [registrosEventos]);

  // Selected registration state
  const [selectedEstado, setSelectedEstado] = useState<EstadoEventoOportunidad>('ejecutada');
  const [contexto, setContexto] = useState('');
  const [estadoEmocional, setEstadoEmocional] = useState('');
  const [notas, setNotas] = useState('');

  // Info details popup state
  const [activeInfoKey, setActiveInfoKey] = useState<EstadoEventoOportunidad | null>(null);
  const [showConfigInfo, setShowConfigInfo] = useState(false);
  const [showFormInfo, setShowFormInfo] = useState(false);
  const [showAutoInfo, setShowAutoInfo] = useState(false);

  // Successfully saved alert feedback
  const [successMessage, setSuccessMessage] = useState(false);

  // States for highly aesthetic circular progress animation (ÍNDICE DE AUTOMATICIDAD)
  const [animatedRatio, setAnimatedRatio] = useState(0);
  const [startPulsing, setStartPulsing] = useState(false);

  useEffect(() => {
    setStartPulsing(false);
    
    const startTime = performance.now();
    const duration = 1800; // 1.8s
    const targetVal = metrics.ratio_automaticidad;
    const startVal = 0; // Starts from 0
    
    let animationFrameId: number;
    let pulseTimeout: any;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // ease-out-cubic formula: 1 - Math.pow(1 - progress, 3)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startVal + (targetVal - startVal) * easeOutCubic;
      
      setAnimatedRatio(currentValue);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Start pulse 0.5s after fill animation completes
        pulseTimeout = setTimeout(() => {
          setStartPulsing(true);
        }, 500);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (pulseTimeout) clearTimeout(pulseTimeout);
    };
  }, [metrics.ratio_automaticidad]);

  // Filter events captured today for high-fidelity reinforcement lists - newest first
  const todayEvents = [...(registrosEventos || [])].filter(e => e.date === today).reverse();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    haptics.success();
    if (settings.soundsEnabled) soundService.playSuccess();
    
    // Register the event
    addRegistroEvento(
      selectedEstado, 
      contexto.trim() || 'General', 
      estadoEmocional.trim() || undefined, 
      notas.trim() || undefined
    );

    // Provide micro tactile/visual confirmation feedback
    setSuccessMessage(true);
    setTimeout(() => setSuccessMessage(false), 3000);

    // Reset fields keeping selected state for convenience
    setContexto('');
    setEstadoEmocional('');
    setNotas('');
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* 1. VISUAL IDENTITY & GENERAL INFORMATION (Compact, responsive grid - Enlarged font sizes) */}
      <div className="bg-gradient-to-br from-[#1e1b4b] to-[#020617] border border-white/5 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="space-y-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
            <div className="space-y-1">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/25 rounded-md text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <Star size={11} className="fill-indigo-400" />
                <span>Identidad de Oportunidad Activa</span>
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-snug break-words">
                {settings.habitName || 'Entrenamiento de Ventana'}
              </h2>
            </div>

            {/* Inline Info button next to title */}
            <button
              type="button"
              onClick={() => { haptics.selection(); setShowConfigInfo(!showConfigInfo); }}
              className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-slate-350 transition-all self-start cursor-pointer"
              title="Información sobre Micro-Hábitos de Oportunidad"
            >
              <Info size={15} />
            </button>
          </div>

          {showConfigInfo && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-[11.5px] text-slate-205 animate-in slide-in-from-top-3 duration-250 leading-relaxed">
              <h4 className="font-extrabold text-indigo-400 uppercase tracking-widest flex items-center space-x-1">
                <BookOpen size={13} />
                <span>¿Cómo usarlo?</span>
              </h4>
              <p>
                Los hábitos de oportunidad no ocurren a una hora fija. Cada vez que sientas el "disparador" o situación gatillo en tu vida diaria, entra aquí y registra qué pasó.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 1.5. ÍNDICE DE AUTOMATICIDAD CARD (Aesthetic, main success metric) */}
      <div className="bg-gradient-to-br from-[#0c1435] to-[#04081c] border border-indigo-500/15 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl flex flex-col items-center">
        {/* Isolated Keyframes for Pulse Animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes circular-glow-pulse {
            0%, 100% {
              opacity: var(--glow-base);
              transform: scale(1);
              box-shadow: 0 0 35px rgba(99, 102, 241, 0.6);
            }
            50% {
              opacity: calc(var(--glow-base) + 0.15);
              transform: scale(1.04);
              box-shadow: 0 0 50px rgba(99, 102, 241, 0.8);
            }
          }
        `}} />

        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6366f1]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Info button on automaticity */}
        <button 
          onClick={() => { haptics.selection(); setShowAutoInfo(!showAutoInfo); }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-all z-20"
          title="Ver Información descriptiva"
          type="button"
        >
          <Info size={16} />
        </button>

        {/* Header information */}
        <div className="text-center space-y-2 mb-6 relative z-10 w-full max-w-md">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-400/20 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-indigo-300">
            <Brain className="text-indigo-400 animate-pulse" size={13} />
            <span>ÍNDICE DE AUTOMATICIDAD</span>
          </span>
          
          <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-sm mx-auto">
            Mide la proporción de respuestas en "piloto automático" sobre las situaciones reales. ¡La meta es automatizarlo!
          </p>

          {showAutoInfo && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-left animate-in slide-in-from-top-4 duration-350 mt-3">
              <h4 className="text-[10.5px] font-black text-indigo-300 uppercase tracking-widest mb-1 flex items-center space-x-1">
                <Sparkles size={11} className="text-indigo-400" />
                <span>¿Cómo se calcula?</span>
              </h4>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                Es la cantidad de tus registros en estado *Automático* y la cantidad total de oportunidades reales que aparecieron (no cuentan entrenamientos).
              </p>
            </div>
          )}
        </div>

        {/* 200px Centered Circular Progress Widget with Evident Glow */}
        <div className="relative w-[200px] h-[200px] flex items-center justify-center shrink-0 z-10 select-none">
          {/* Radial Glow div behind the SVG circle */}
          <div 
            className="absolute rounded-full w-[170px] h-[170px] transition-all duration-300 shadow-lg"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(99, 102, 241, 0.1) 60%, rgba(99, 102, 241, 0) 100%)',
              filter: 'blur(15px)',
              '--glow-base': 0.35 + 0.35 * (metrics.ratio_automaticidad / 100),
              opacity: 'var(--glow-base)',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.55)',
              animation: startPulsing ? 'circular-glow-pulse 3s ease-in-out infinite' : 'none',
              transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
            } as React.CSSProperties}
          />

          {/* Svg Circle Ring */}
          <svg className="absolute top-0 left-0 w-[200px] h-[200px]" viewBox="0 0 200 200">
            {/* Background progress track */}
            <circle 
              cx="100" 
              cy="100" 
              r="94" 
              fill="transparent" 
              stroke="rgba(255, 255, 255, 0.05)" 
              strokeWidth="12" 
            />
            {/* Active animated progress ring - with a bright drop-shadow filter */}
            <circle 
              cx="100" 
              cy="100" 
              r="94" 
              fill="transparent" 
              stroke="#6366f1" 
              strokeWidth="12" 
              strokeLinecap="round"
              strokeDasharray="590"
              strokeDashoffset={590 - (590 * animatedRatio) / 100}
              transform="rotate(-90 100 100)"
              className="transition-all duration-75"
              style={{ filter: 'drop-shadow(0 0 6px #6366f1)' }}
            />
          </svg>

          {/* Centered content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {/* Big monospace number */}
            <span className="font-mono font-bold text-[52px] text-white tracking-widest leading-none drop-shadow-md select-all">
              {metrics.reales > 0 ? Math.round(animatedRatio) : 0}
              <span className="text-xl font-black text-indigo-400 select-none ml-0.5">%</span>
            </span>
            {/* Bottom label with strict vertical spacing (8px / mt-2) */}
            <span className="text-[9.5px] font-medium tracking-[1.5px] text-indigo-300 uppercase leading-none mt-1.5 select-none">
              AUTOMATICIDAD
            </span>
          </div>
        </div>

        {/* Supporting details showing count */}
        <div className="mt-5 text-center z-10">
          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
            {metrics.reales > 0 ? `${metrics.automaticos} de ${metrics.reales} Oportunidades Reales` : 'Sin Oportunidades registradas'}
          </span>
        </div>
      </div>

      {/* 2. REGISTRATION ACTION HUB (HOY) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            <h3 className="text-[11.5px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Registrar evento</h3>
          </div>
          
          <button
            type="button"
            onClick={() => { haptics.selection(); setShowFormInfo(!showFormInfo); }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-450 transition-all cursor-pointer"
            title="Información sobre estados de captura"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {showFormInfo && (
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2 text-[11.5px] text-slate-600 dark:text-slate-400 animate-in slide-in-from-top-3 duration-250 leading-relaxed">
            <h4 className="font-bold text-indigo-500 flex items-center space-x-1 text-xs">
              <span>La Matriz de Respuestas</span>
            </h4>
            <p>
              Para construir el hábito necesitamos dos cosas: darnos cuenta de que se abre una oportunidad (Detectado) y hacer conscientemente algo al respecto (Ejecutado). Esto devela tu estado de atención y conducta:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <li><strong className="text-emerald-500">Fluidez (Detectado y Ejecutado):</strong> Plena consciencia de la Oportunidad y respuesta eficaz ante ella.</li>
              <li><strong className="text-rose-500">Bloqueo (Detectado y NO Ejecutado):</strong> Te diste cuenta de la oportunidad pero no realizaste la acción.</li>
              <li><strong className="text-indigo-500">Automático (NO Detectado y Ejecutado):</strong> Realizaste la acción en piloto automático sin notar el inicio.</li>
              <li><strong className="text-amber-500">Dormido (NO Detectado y NO Ejecutado):</strong> Desconexión de la oportunidad; como no te diste cuenta no pudiste hacer nada</li>
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STATE SELECTORS (Prominent, obvious, readable layout to avoid margin overflows) */}
          <div className="space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
              1. Matriz de Registro (Cruzar Ejecutado y Detectado)
            </span>

            <div className="border border-slate-205 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
              <div className="text-center pb-2 border-b border-slate-200/50 dark:border-white/5">
                <p className="text-[11px] text-indigo-650 dark:text-indigo-400 font-black uppercase tracking-wider bg-indigo-100/60 dark:bg-indigo-950/50 px-3 py-1.5 rounded-full inline-block">
                  Estado: {STATE_DETAILS[selectedEstado].label}
                </p>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-bold mt-1.5 leading-relaxed">
                  {STATE_DETAILS[selectedEstado].infoText}
                </p>
              </div>

              {/* Responsive 2x2 Matrix Grid with custom labels */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-center select-none">
                {/* corner head blank */}
                <div className="col-span-3 flex items-center justify-center">
                  <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] font-black uppercase text-slate-450 tracking-wider">Cruzar</span>
                </div>
                {/* Columns */}
                <div className="col-span-5 p-1 sm:p-2 bg-indigo-500/5 dark:bg-indigo-500/10 border border-slate-200/60 dark:border-white/5 rounded-xl flex flex-col justify-center overflow-hidden">
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide block truncate">Detectado: SÍ</span>
                  <span className="text-[7px] xs:text-[8px] sm:text-[8.5px] text-slate-400 font-extrabold uppercase tracking-tight block truncate">Atención Activa</span>
                </div>
                <div className="col-span-4 p-1 sm:p-2 bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl flex flex-col justify-center overflow-hidden">
                  <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-black text-slate-500 dark:text-slate-455 uppercase tracking-wide block truncate">Detectado: NO</span>
                  <span className="text-[7px] xs:text-[8px] sm:text-[8.5px] text-slate-400 font-extrabold uppercase tracking-tight block truncate">Atención Ciega</span>
                </div>

                {/* ROW 1: Ejecutado SÍ */}
                <div className="col-span-3 p-1 sm:p-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                  <span className="text-[8px] xs:text-[9.5px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide leading-tight text-center">Ejecutado: SÍ</span>
                </div>
                {/* Cell 1: Fluidez */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedEstado('ejecutada'); }}
                  className={`col-span-5 p-1.5 xs:p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedEstado === 'ejecutada'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/25 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] xs:text-[11px] sm:text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Fluidez</span>
                    {selectedEstado === 'ejecutada' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-ping" />}
                  </div>
                  <span className="text-[8px] xs:text-[9px] sm:text-[9.5px] text-slate-400 block font-bold mt-1">SÍ / SÍ</span>
                </button>
                {/* Cell 2: Automático */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedEstado('automatico'); }}
                  className={`col-span-4 p-1.5 xs:p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedEstado === 'automatico'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500/25 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] xs:text-[11px] sm:text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">Automático</span>
                    {selectedEstado === 'automatico' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-ping" />}
                  </div>
                  <span className="text-[8px] xs:text-[9px] sm:text-[9.5px] text-slate-400 block font-bold mt-1">SÍ / NO</span>
                </button>

                {/* ROW 2: Ejecutado NO */}
                <div className="col-span-3 p-1 sm:p-2 bg-rose-500/5 dark:bg-rose-500/10 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                  <span className="text-[8px] xs:text-[9.5px] sm:text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide leading-tight text-center">Ejecutado: NO</span>
                </div>
                {/* Cell 3: Bloqueo */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedEstado('no_ejecutada'); }}
                  className={`col-span-5 p-1.5 xs:p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedEstado === 'no_ejecutada'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-300 ring-2 ring-rose-500/25 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-rose-300 dark:hover:border-rose-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] xs:text-[11px] sm:text-xs font-black uppercase text-rose-600 dark:text-rose-450">Bloqueo</span>
                    {selectedEstado === 'no_ejecutada' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-ping" />}
                  </div>
                  <span className="text-[8px] xs:text-[9px] sm:text-[9.5px] text-slate-400 block font-bold mt-1">NO / SÍ</span>
                </button>
                {/* Cell 4: Dormido */}
                <button
                  type="button"
                  onClick={() => { haptics.selection(); setSelectedEstado('condicion_externa'); }}
                  className={`col-span-4 p-1.5 xs:p-2 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedEstado === 'condicion_externa'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-300 ring-2 ring-amber-500/25 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 hover:border-amber-300 dark:hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] xs:text-[11px] sm:text-xs font-black uppercase text-amber-600 dark:text-amber-455 animate-pulse">Dormido</span>
                    {selectedEstado === 'condicion_externa' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping" />}
                  </div>
                  <span className="text-[8px] xs:text-[9px] sm:text-[9.5px] text-slate-400 block font-bold mt-1">NO / NO</span>
                </button>
              </div>

              {/* Botón de Entrenamiento por fuera de la matriz de respuestas */}
              <div className="pt-2 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => { 
                    haptics.selection(); 
                    setSelectedEstado('entrenamiento');
                    setContexto('');
                    setEstadoEmocional('');
                  }}
                  className={`w-full py-3.5 px-5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border flex items-center justify-center space-x-2.5 cursor-pointer active:scale-[0.99] ${
                    selectedEstado === 'entrenamiento'
                      ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 text-white shadow-lg shadow-indigo-550/20'
                      : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30'
                  }`}
                >
                  <Sparkles size={14} className={selectedEstado === 'entrenamiento' ? 'animate-pulse text-white' : 'text-indigo-500'} />
                  <span>Entrenamiento</span>
                </button>
              </div>
            </div>
          </div>

          {/* CONTEXT INPUT (Selectable tags instead of manual text input) */}
          <div className={`space-y-3 transition-opacity duration-200 ${selectedEstado === 'entrenamiento' ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-0.5">
              <label className="text-[10.5px] font-black uppercase tracking-widest text-slate-400">
                2. ¿Dónde estabas o qué disparó la oportunidad? (Contexto - Opcional) {selectedEstado === 'entrenamiento' && <span className="text-rose-500 font-extrabold tracking-normal italic uppercase">(Métricas Reales Excluidas)</span>}
              </label>
              {contexto && (
                <span className="text-[10.5px] text-indigo-650 dark:text-indigo-400 font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg self-start">
                  Seleccionado: {contexto}
                </span>
              )}
            </div>
            
            {/* Context tag buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social']).map((tag) => {
                const isSelected = contexto === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={selectedEstado === 'entrenamiento'}
                    onClick={() => { haptics.selection(); setContexto(isSelected ? '' : tag); }}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black leading-tight transition-all border text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse bg-emerald-300" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EMOTIONAL STATE INPUT (Selectable tags instead of manual text input) */}
          <div className={`space-y-3 transition-opacity duration-200 ${selectedEstado === 'entrenamiento' ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-0.5">
              <label className="text-[10.5px] font-black uppercase tracking-widest text-pink-400 block border-none p-0 m-0">
                3. ¿Cuál era tu estado emocional o mental? (Opcional) {selectedEstado === 'entrenamiento' && <span className="text-rose-500 font-extrabold tracking-normal italic uppercase">(Bloqueado)</span>}
              </label>
              {estadoEmocional && (
                <span className="text-[10.5px] text-pink-600 dark:text-pink-400 font-black uppercase tracking-wider bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-lg self-start">
                  Seleccionado: {estadoEmocional}
                </span>
              )}
            </div>
            
            {/* Emotional Tag buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral']).map((tag) => {
                const isSelected = estadoEmocional === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={selectedEstado === 'entrenamiento'}
                    onClick={() => { haptics.selection(); setEstadoEmocional(isSelected ? '' : tag); }}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black leading-tight transition-all border text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-600/20' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-pink-600 dark:hover:text-pink-400'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse bg-emerald-300" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* NOTES EVALUATION INPUT (Horizontal wide layout) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-0.5">
              4. Evaluación / Notas Adicionales (Opcional)
            </label>
            <textarea 
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Completado en 1 min. Logré calmar el pulso con 3 respiraciones profundas."
              className="w-full px-4 py-3 h-18 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-650 outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            />
          </div>

          {/* SUBMISSION BLOCK */}
          <div className="pt-2 flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full py-4 text-white font-black rounded-xl text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-550/20 hover:shadow-lg active:scale-95"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Registrar Evento</span>
            </button>

            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-[11.5px] uppercase font-black tracking-wider animate-in fade-in duration-200">
                <CheckCircle2 size={14} />
                <span>¡Hito de oportunidad registrado con éxito!</span>
              </div>
            )}
          </div>

        </form>
      </section>

      {/* 3. CAPTURES REGISTERED TODAY (Micro Feed) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-white/5 pb-2">
          <Clock className="text-slate-400 shrink-0" size={16} />
          <h3 className="text-[11.5px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">Registrados Hoy</h3>
        </div>

        {todayEvents.length > 0 ? (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {todayEvents.map((evt) => (
              <div 
                key={evt.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start justify-between gap-3 text-[11px]"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-xs">
                      {evt.contexto}
                    </span>
                    {evt.estadoEmocional && (
                      <>
                        <span className="text-slate-300 dark:text-slate-705 font-bold">•</span>
                        <span className="px-1.5 py-0.5 bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 font-black text-[10px] rounded-md tracking-tight font-sans">
                          {evt.estadoEmocional}
                        </span>
                      </>
                    )}
                  </div>
                  {evt.notas && (
                    <p className="text-[11px] text-slate-450 dark:text-slate-550 italic font-semibold">
                      "{evt.notas}"
                    </p>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider shrink-0 border ${
                  STATE_DETAILS[evt.estado]?.bg || 'bg-slate-100 border-slate-200 text-slate-600'
                } ${STATE_DETAILS[evt.estado]?.text || ''} ${STATE_DETAILS[evt.estado]?.border || ''}`}>
                  {STATE_DETAILS[evt.estado]?.label || evt.estado}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-[11px] italic font-semibold">
            Ningún evento registrado hoy. ¡Mantente atento!
          </div>
        )}
      </section>

    </div>
  );
};

export default OpportunityConsole;
