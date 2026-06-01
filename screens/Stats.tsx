
import React, { useMemo, useState } from 'react';
import { useHabits } from '../context/HabitContext';
import Heatmap from '../components/Heatmap';
import HabitLoopView from '../components/HabitLoopView';
import StatsOpportunity from '../components/StatsOpportunity';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, BarChart3, Calendar, Activity, Shield, Flame, BarChart, History, Compass, Crown, Trophy, Target, X, Trash2, Info, Award, Zap, Ruler, Eye, Layers, RotateCcw, Sliders } from 'lucide-react';
import { PastHabit } from '../types';
import { haptics } from '../utils/haptics';

const Stats: React.FC = () => {
  const { 
    checkins, 
    streak, 
    pastHabits, 
    settings, 
    today, 
    deletePastHabit, 
    resumePastHabit,
    umbralActual,
    ciclosHistoricos,
    intervencionesRegistradas,
    registrosDiarios
  } = useHabits();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [selectedPastHabit, setSelectedPastHabit] = useState<PastHabit | null>(null);
  const [infoModal, setInfoModal] = useState<'rank' | 'curve' | 'matrix' | null>(null);

  // 1. Threshold Calculations for Stats
  const speedCurveData = useMemo(() => {
    const sorted = [...(registrosDiarios || [])].sort((a, b) => a.date.localeCompare(b.date));
    const last14 = sorted.slice(-14);
    if (last14.length === 0) {
      return [
        { dateLabel: 'Inicio', rate: 10 },
        { dateLabel: 'Actual', rate: 12 }
      ];
    }
    return last14.map(r => ({
      dateLabel: new Date(r.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      rate: r.rate || Math.round(9 + (3 - r.factores.stress) * 1.5 + (3 - r.factores.sleep) * 0.8)
    }));
  }, [registrosDiarios]);

  const responseMatrixData = useMemo(() => {
    const todayDate = new Date(today + 'T12:00:00');
    const matrix = [];
    
    // 42 days matrix
    for (let i = 41; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const record = (registrosDiarios || []).find(r => r.date === dateStr);
      
      let type: 'chequeo' | 'ejecución' | 'sin_registro' = 'sin_registro';
      if (record) {
         if (record.tipo === 'ejecución') type = 'ejecución';
         else if (record.tipo === 'chequeo') type = 'chequeo';
      }
      
      matrix.push({
        date: dateStr,
        label: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        type
      });
    }
    return matrix;
  }, [registrosDiarios, today]);

  const responseMatrixWeeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      weeks.push(responseMatrixData.slice(i * 7, (i + 1) * 7));
    }
    return weeks;
  }, [responseMatrixData]);

  const responseLegendItems = useMemo(() => [
    { label: settings.chequeoSubtitle || 'Chequeo Registrado', color: 'bg-cyan-500', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.6)]' },
    { label: settings.ejecucionSubtitle || 'Ejecución/Mitigación', color: 'bg-orange-500', shadow: 'shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
    { label: 'Sin Registro', color: 'bg-slate-900 border border-white/5', shadow: '' }
  ], [settings.chequeoSubtitle, settings.ejecucionSubtitle]);

  // Threshold variables definition
  const thresholdVariables = useMemo(() => {
    return settings.thresholdVariables || [
      { id: 'var_sleep', name: 'Calidad de Sueño' },
      { id: 'var_stress', name: 'Nivel de estrés' },
      { id: 'var_exercise', name: 'Ejercicio diario' }
    ];
  }, [settings.thresholdVariables]);

  // Metric for each threshold variable
  const variableMetrics = useMemo(() => {
    return thresholdVariables.map(v => {
      const recordsWithVar = (registrosDiarios || []).filter(r => r.factores && r.factores[v.id] !== undefined);
      const totalCount = recordsWithVar.length;
      const sum = recordsWithVar.reduce((acc, r) => acc + (r.factores[v.id] || 0), 0);
      const avg = totalCount > 0 ? (sum / totalCount).toFixed(1) : '—';
      const avgNum = totalCount > 0 ? sum / totalCount : 0;
      
      return {
        id: v.id,
        name: v.name,
        average: avg,
        avgNum,
        totalCount
      };
    });
  }, [thresholdVariables, registrosDiarios]);

  const getVarMetricColor = (val: number, name: string) => {
    if (val === 0) return 'bg-slate-700';
    const isStress = name.toLowerCase().includes('estrés') || name.toLowerCase().includes('tension') || name.toLowerCase().includes('stress');
    if (isStress) {
      if (val >= 4) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      if (val >= 3) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    } else {
      if (val >= 4) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      if (val >= 3) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    }
  };

  // Chronological chart data for the line chart
  const variableChartData = useMemo(() => {
    const sorted = [...(registrosDiarios || [])].sort((a, b) => a.date.localeCompare(b.date));
    const last15 = sorted.slice(-15);
    
    return last15.map(r => {
      const dataPoint: Record<string, any> = {
        dateLabel: new Date(r.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        date: r.date,
      };
      thresholdVariables.forEach(v => {
        if (r.factores && r.factores[v.id] !== undefined) {
          dataPoint[v.id] = r.factores[v.id];
        }
      });
      return dataPoint;
    });
  }, [registrosDiarios, thresholdVariables]);

  const chartColors = [
    '#22d3ee', // Cyan
    '#818cf8', // Indigo
    '#f97316', // Orange
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#eab308'  // Yellow
  ];

  const thresholdEffortMatrix = useMemo(() => {
    const fromRegistros = (registrosDiarios || [])
      .filter(r => r.tipo === 'ejecución')
      .map(r => {
        let buttonType: 'emergency' | 'twoMinutes' | 'complete' = 'complete';
        if (r.espectro === 'emd') buttonType = 'emergency';
        else if (r.espectro === '2min') buttonType = 'twoMinutes';
        return {
          date: r.date,
          buttonType,
          timestamp: r.timestamp
        };
      });

    const sortedExecutions = fromRegistros.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const totalSlots = 84;
    const slots = [];

    sortedExecutions.forEach(exec => {
      let colorClass = '';
      if (exec.buttonType === 'emergency') {
        colorClass = 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] scale-100 border-transparent';
      } else if (exec.buttonType === 'twoMinutes') {
        colorClass = 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-100 border-transparent';
      } else {
        colorClass = 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-100 border-transparent';
      }
      slots.push({ colorClass });
    });

    const remaining = totalSlots - slots.length;
    for (let i = 0; i < remaining; i++) {
      slots.push({ colorClass: 'bg-slate-900 border border-white/5 scale-[0.85] rounded-[2px]' });
    }

    // Fisher-Yates shuffle to randomize placement of elements exactly like the calendar habits Matrix
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    const grid = [];
    for (let col = 0; col < 12; col++) {
      const column = [];
      for (let row = 0; row < 7; row++) {
        column.push(slots[col * 7 + row]);
      }
      grid.push(column);
    }

    return grid;
  }, [registrosDiarios]);

  const thresholdLegendItems = useMemo(() => [
    { label: settings.completeHabit || 'Completo', color: 'bg-cyan-500', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.6)]' },
    { label: settings.twoMinuteHabit || '2 min', color: 'bg-indigo-500', shadow: 'shadow-[0_0_8px_rgba(99,102,241,0.6)]' },
    { label: settings.emergencyHabit || 'EMD', color: 'bg-orange-500', shadow: 'shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
    { label: 'Sin Ejecución', color: 'bg-slate-900 border border-white/5', shadow: '' },
  ], [settings.completeHabit, settings.twoMinuteHabit, settings.emergencyHabit]);

  // Ranking Logic
  const getRankData = (days: number) => {
    if (days >= 32) return { 
      level: 4,
      name: settings.gender === 'male' ? 'Hércules Semi-Dios' : 'Hércules Semi-Dios', 
      description: 'Has alcanzado la cima. Tu disciplina es ahora una fuerza de la naturaleza.',
      feat: 'Completó 12 trabajos imposibles y se fue aceptado en el Olimpo. Tu disciplina no es algo que haces, es quién eres: una fuerza de la naturaleza inamovible e identitaria.',
      color: 'text-fuchsia-600 dark:text-fuchsia-400', 
      bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', 
      border: 'border-fuchsia-200 dark:border-fuchsia-500/20', 
      icon: <Crown />,
      nextThreshold: 50, 
      prevThreshold: 32
    };
    if (days >= 17) return { 
      level: 3,
      name: 'Aquiles', 
      description: 'Maestría técnica. Tu ejecución es impecable y veloz.',
      feat: 'El guerrero más veloz y técnico. Este nivel representa la maestría donde tu ejecución es impecable, rápida y casi automática ante cualquier desafío.',
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-500/10', 
      border: 'border-amber-200 dark:border-amber-500/20', 
      icon: <Shield />,
      nextThreshold: 32,
      prevThreshold: 17
    };
    if (days >= 7) return { 
      level: 2,
      name: 'Jasón', 
      description: 'Consolidación. Como Jasón al frente del Argo, ya has zarpado.',
      feat: 'Lideró la travesía del barco Argo en busca de un tesoro que le aseguraría el trono. Representa la fase de consolidación, donde ya has zarpado y organizas tu entorno para mantener el rumbo del hábito.',
      color: 'text-slate-600 dark:text-slate-300', 
      bg: 'bg-slate-50 dark:bg-slate-400/10', 
      border: 'border-slate-200 dark:border-slate-400/20', 
      icon: <Compass />,
      nextThreshold: 17,
      prevThreshold: 7
    };
    return { 
      level: 1,
      name: 'Prometeo', 
      description: 'Iniciación. Has robado el fuego de los Dioses para iluminar tu humanidad.',
      feat: 'Asumes el costo de pensar por cuenta propia: tomas aquello que expande tu capacidad, aunque implique riesgo y castigo. Abandonas la obediencia pasiva y operas desde la responsabilidad de crear y sostener tu propio poder.',
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-500/10', 
      border: 'border-indigo-200 dark:border-indigo-500/20', 
      icon: <Activity />,
      nextThreshold: 7,
      prevThreshold: 0
    };
  };

  const currentRank = getRankData(streak.currentStreak);
  const linajeTerm = settings.gender === 'male' ? 'Linaje de Héroes' : 'Linaje de Heroínas';
  
  const progressToNext = useMemo(() => {
    if (streak.currentStreak >= 50) return 100;
    const range = currentRank.nextThreshold - currentRank.prevThreshold;
    const currentPos = streak.currentStreak - currentRank.prevThreshold;
    return Math.max(5, Math.min(100, (currentPos / range) * 100));
  }, [streak.currentStreak, currentRank]);

  const willpowerData = useMemo(() => {
    if (timeRange === 'today') {
      const todayCheckin = checkins.find(c => c.date === today);
      return [
        { dateLabel: 'Mañana', willpower: 0 },
        { dateLabel: 'Hoy', willpower: todayCheckin ? todayCheckin.willpowerScore : 0 }
      ];
    }
    const daysToLookBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const todayDate = new Date(today + 'T12:00:00');
    const data = [];
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checkin = checkins.find(c => c.date === dateStr);
      data.push({
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        willpower: checkin ? checkin.willpowerScore : 0,
        fullDate: dateStr
      });
    }
    return data;
  }, [checkins, today, timeRange]);

  const avgWillpower = useMemo(() => {
    const dataWithValues = willpowerData.filter(d => d.willpower > 0);
    if (dataWithValues.length === 0) return "0.0";
    const sum = dataWithValues.reduce((acc, d) => acc + d.willpower, 0);
    return (sum / dataWithValues.length).toFixed(1);
  }, [willpowerData]);

  const gridColor = settings.isDarkMode ? '#1e293b' : '#f1f5f9';
  const axisColor = settings.isDarkMode ? '#475569' : '#94a3b8';
  const areaColor = '#ec4899'; 

  const getRankColor = (rankName: string) => {
    if (rankName.includes('Hércules')) return 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20';
    if (rankName.includes('Aquiles')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (rankName.includes('Jasón')) return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col items-center">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{data.dateLabel}</p>
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${payload[0].value > 0 ? 'bg-pink-500' : 'bg-slate-700'}`}></div>
            <p className="text-xs font-black text-white">{payload[0].value} Willpower</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDeleteRecord = (id: string) => {
    haptics.error();
    if (confirm('¿Deseas eliminar este registro de tu linaje para siempre?')) {
      deletePastHabit(id);
      setSelectedPastHabit(null);
      haptics.success();
    }
  };

  const handleResumeRecord = (id: string, name: string) => {
    haptics.selection();
    const currentName = settings.habitName || "Entrenamiento actual";
    if (confirm(`Al retomar "${name}", tu hábito activo actual ("${currentName}") será archivado automáticamente con toda su racha, progreso e historial. ¿Deseas continuar?`)) {
      resumePastHabit(id);
      setSelectedPastHabit(null);
      haptics.success();
    }
  };

  const renderInfoModal = () => {
    if (!infoModal) return null;

    const modalData = {
      rank: {
        icon: React.cloneElement(currentRank.icon as React.ReactElement<any>, { size: 32, className: currentRank.color }),
        title: "Estatus de Identidad",
        subtitle: `Rango actual: ${currentRank.name}`,
        rules: [
          { 
            icon: React.cloneElement(currentRank.icon as React.ReactElement<any>, { size: 20, className: currentRank.color }), 
            title: currentRank.name, 
            desc: currentRank.feat 
          }
        ]
      },
      curve: {
        icon: <TrendingUp className="text-pink-500" size={32} />,
        title: "Curva de Adaptación",
        subtitle: "Métrica de Resistencia",
        rules: [
          { icon: <Zap size={18} className="text-yellow-400" />, title: "Willpower Score", desc: "Mide qué tanto esfuerzo (del 1 al 10) te costó arrancar. A mayor número, menos 'lag' de inicio." },
          { icon: <Target size={18} className="text-cyan-400" />, title: "Media de Voluntad", desc: "Representa tu estado de flujo promedio. Una media alta indica que el hábito ya no genera fricción mental." },
          { icon: <Ruler size={18} className="text-slate-400" />, title: "Tendencia", desc: "Busca que la línea se estabilice en valores altos (8-10) con el paso de las semanas." }
        ]
      },
      matrix: {
        icon: <Calendar className="text-indigo-500" size={32} />,
        title: "Matriz de Esfuerzo",
        subtitle: "Huella Visual",
        rules: [
          { icon: <Layers size={18} className="text-indigo-400" />, title: "Cronología", desc: "Este mapa es lineal. Cada cuadro es un día de los últimos 84 días. Los cuadros negros son días que perdiste (huecos en tu racha)." },
          { icon: <Eye size={18} className="text-indigo-400" />, title: "Visión de Racha", desc: "Los cuadros grises son el futuro. Tu misión es evitar que se conviertan en huecos negros manteniendo la constancia diaria." }
        ]
      }
    }[infoModal];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
        <div className="bg-[#020617] border border-white/10 rounded-[3.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-500 relative">
          <button onClick={() => setInfoModal(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><X size={20} /></button>
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5">{modalData.icon}</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{modalData.title}</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{modalData.subtitle}</p>
            </div>
            <div className="space-y-6">
              {modalData.rules.map((rule, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="mt-1 flex-shrink-0">{rule.icon}</div>
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

  const renderPastHabitModal = () => {
    if (!selectedPastHabit) return null;

    const habit = selectedPastHabit;
    const dateFormatted = new Date(habit.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
        <div className="bg-[#020617] border border-white/10 rounded-[3.5rem] w-full max-w-lg h-[85vh] flex flex-col shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-4 flex justify-between items-start shrink-0">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{habit.name}</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Misión Finalizada el {dateFormatted}</p>
            </div>
            <button onClick={() => setSelectedPastHabit(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 no-scrollbar">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-5 rounded-3xl space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sesiones Totales</p>
                <div className="flex items-center space-x-2">
                  <Activity size={14} className="text-cyan-400" />
                  <p className="text-xl font-black text-white">{habit.sessions}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-5 rounded-3xl space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Máxima Racha</p>
                <div className="flex items-center space-x-2">
                  <Flame size={14} className="text-orange-500" />
                  <p className="text-xl font-black text-white">{habit.maxStreak}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-5 rounded-3xl space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rango Alcanzado</p>
                <div className="flex items-center space-x-2">
                  <Crown size={14} className="text-amber-400" />
                  <p className="text-xs font-black text-white uppercase truncate">{habit.rankReached}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-5 rounded-3xl space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Media Voluntad</p>
                <div className="flex items-center space-x-2">
                  <Zap size={14} className="text-pink-500" />
                  <p className="text-xl font-black text-white">{habit.avgWillpower || "0.0"}</p>
                </div>
              </div>
            </div>

            {/* Willpower History Chart */}
            {habit.willpowerHistory && habit.willpowerHistory.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 px-1">
                  <TrendingUp className="text-pink-500" size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Últimos 30 Días</h4>
                </div>
                <div className="w-full h-40 bg-white/5 rounded-[2rem] border border-white/5 p-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={habit.willpowerHistory} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWillPast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="dateLabel" hide tick={{ fontSize: 8, fill: '#475569' }} />
                      <YAxis domain={[0, 10]} hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="willpower" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorWillPast)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Heatmap */}
            {habit.checkinsSnapshot && habit.checkinsSnapshot.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 px-1">
                  <Calendar className="text-indigo-500" size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Matriz de Esfuerzo</h4>
                </div>
                <Heatmap checkins={habit.checkinsSnapshot} endDate={habit.date.split('T')[0]} />
              </div>
            )}

            {/* Habit Loop */}
            {habit.habitLoop && (
              <div className="bg-white/5 border border-white/5 py-10 px-3 sm:px-10 rounded-[2.5rem] sm:rounded-[3rem] relative overflow-visible">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-slate-400 text-[7px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-white/10 z-30">
                  Ciclo de Identidad
                </div>
                <HabitLoopView loop={habit.habitLoop} title="" />
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <button 
                onClick={() => handleResumeRecord(habit.id, habit.name)}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-3xl uppercase tracking-widest text-[10px] border border-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
              >
                <RotateCcw size={16} />
                <span>Retomar Hábito</span>
              </button>

              <button 
                onClick={() => handleDeleteRecord(habit.id)}
                className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black py-4 rounded-[2rem] uppercase tracking-widest text-[10px] border border-red-500/20 transition-all"
              >
                <Trash2 size={16} />
                <span>Eliminar del Linaje</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const legendItems = [
    { label: settings.completeHabit || 'Completo', color: 'bg-cyan-500', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.6)]' },
    { label: settings.twoMinuteHabit || '2 min', color: 'bg-indigo-500', shadow: 'shadow-[0_0_8px_rgba(99,102,241,0.6)]' },
    { label: settings.emergencyHabit || 'EMD', color: 'bg-orange-500', shadow: 'shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
    { label: 'Día Perdido', color: 'bg-white', shadow: 'shadow-[0_0_8px_rgba(255,255,255,0.4)]' },
    { label: 'Sin Registro', color: 'bg-slate-900', shadow: 'border border-white/5' },
  ];

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 pb-32">
      <div className="flex items-center space-x-4 px-2">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
           <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Análisis</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Evolución del Héroe</p>
        </div>
      </div>

      {/* Rank Card */}
      <section className={`${currentRank.bg} ${currentRank.border} border p-8 rounded-[3.5rem] shadow-xl relative overflow-hidden transition-all duration-500`}>
        {/* Info Button for Rank */}
        <button 
          onClick={() => { haptics.selection(); setInfoModal('rank'); }}
          className="absolute top-6 right-6 p-2 text-slate-400/40 hover:text-slate-400 transition-colors z-20"
        >
          <Info size={18} />
        </button>

        <div className="flex flex-col items-center space-y-6 relative z-10 text-center">
           <div className="relative">
             <div className="w-24 h-24 bg-white/60 dark:bg-black/40 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-lg border border-white/20 dark:border-white/5">
               {React.cloneElement(currentRank.icon as React.ReactElement<any>, { size: 48, className: currentRank.color })}
             </div>
             <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xl border-2 border-white dark:border-slate-900 ${currentRank.color.replace('text', 'bg')}`}>
               NV {currentRank.level}
             </div>
           </div>
           <div className="w-full">
             <div className="flex flex-col items-center space-y-1">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-white/40">Estatus de Identidad</span>
               <h3 className={`text-3xl font-black tracking-tighter ${currentRank.color}`}>{currentRank.name}</h3>
             </div>
             <p className="mt-4 text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic px-4">{currentRank.description}</p>
             <div className="mt-8 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                  <div className="flex items-center space-x-2">
                    <Target size={12} className="text-indigo-500" />
                    <span>Progreso al Nivel {currentRank.level === 4 ? 4 : currentRank.level + 1}</span>
                  </div>
                  <span>{Math.round(progressToNext)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${currentRank.color.replace('text', 'bg')} shadow-[0_0_10px_rgba(0,0,0,0.2)]`} style={{ width: `${progressToNext}%` }}></div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Threshold and Calendar conditional metrics section */}
      {settings.habitType === 'threshold' ? (
        <>
          {/* CURVA DE VELOCIDAD */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-lg space-y-6 overflow-hidden relative">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2 px-1 text-center">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-indigo-500" size={18} />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Curva de Velocidad</h3>
                </div>
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Velocidad de Acumulación del Umbral</p>
              </div>
            </div>
            <div className="w-full flex justify-center items-center py-2 min-h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={speedCurveData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 8, fill: axisColor, fontWeight: '900' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 'auto']} tick={{ fontSize: 10, fill: axisColor, fontWeight: '900' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#020617] border border-white/10 p-3 rounded-2xl shadow-2xl">
                          <p className="text-[10.5px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.dateLabel}</p>
                          <p className="text-[13px] font-black text-white">Velocidad: +{payload[0].value}% / día</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Area type="monotone" dataKey="rate" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* MATRIZ DE RESPUESTA */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3.5rem] space-y-6 relative">
            <div className="flex items-center space-x-2 px-1">
              <Calendar className="text-indigo-500" size={18} />
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Matriz de Respuesta</h3>
            </div>
            
            <p className="text-[11.5px] text-slate-400 dark:text-slate-500 italic mt-1 px-1 leading-relaxed">
              Resumen visual de los últimos 42 días, registrando chequeos habituales y ejecuciones del hábito deseado.
            </p>

            <div className="space-y-6">
              {/* Responsive Grid */}
              <div className="flex space-x-2 overflow-x-auto no-scrollbar p-6 bg-slate-950/65 rounded-[2.5rem] border border-white/5 shadow-inner justify-center">
                {responseMatrixWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col space-y-2 shrink-0">
                    {week.map((day, di) => {
                      let tileColor = "bg-slate-900 border border-white/5 scale-[0.85]";
                      if (day.type === 'chequeo') {
                        tileColor = "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.65)] scale-100";
                      } else if (day.type === 'ejecución') {
                        tileColor = "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.65)] scale-100";
                      }
                      
                      return (
                        <div
                          key={`${wi}-${di}`}
                          title={`${day.date}: ${day.type.toUpperCase()}`}
                          className={`w-[18px] h-[18px] rounded transition-all duration-1000 ease-out ${tileColor}`}
                          style={{ transitionDelay: `${(wi * 7 + di) * 6}ms` }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legends */}
              <div className="px-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {responseLegendItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-3.5 h-3.5 rounded-md ${item.color} ${item.shadow} shrink-0`}></div>
                      <span className="text-[11.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MÉTRICAS DE VARIABLES DE CONTROL */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-lg space-y-6">
            <div className="flex items-center space-x-2 px-1">
              <Sliders className="text-indigo-500" size={18} />
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Métricas de Variables</h3>
            </div>
            
            <p className="text-[11.5px] text-slate-400 dark:text-slate-500 italic mt-1 px-1 leading-relaxed">
              Resumen del impacto de tus variables elegidas. Muestra el promedio total.
            </p>

            {/* Line Chart for Variables */}
            <div className="w-full py-2">
              {variableChartData.length > 0 ? (
                <div className="w-full h-64 bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={variableChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 8, fill: axisColor, fontWeight: '900' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: axisColor, fontWeight: '900' }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#020617] border border-white/10 p-3 rounded-2xl shadow-2xl space-y-1.5 backdrop-blur-md">
                              <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {payload[0].payload.dateLabel}
                              </p>
                              <div className="space-y-1">
                                {payload.map((p: any, idx: number) => {
                                  const varObj = thresholdVariables.find(v => v.id === p.name);
                                  return (
                                    <div key={idx} className="flex items-center space-x-2 text-[12px]">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                      <span className="text-slate-300 font-bold">{varObj ? varObj.name : p.name}:</span>
                                      <span className="text-white font-black">{p.value}/5</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      {thresholdVariables.map((v, idx) => (
                        <Line 
                          key={v.id}
                          type="monotone"
                          dataKey={v.id}
                          stroke={chartColors[idx % chartColors.length]}
                          strokeWidth={3}
                          dot={{ r: 3, strokeWidth: 1 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                      <Legend 
                        content={({ payload }: any) => (
                          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
                            {payload.map((entry: any, index: number) => {
                              const varObj = thresholdVariables.find(v => v.id === entry.dataKey);
                              return (
                                <div key={index} className="flex items-center space-x-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">
                                    {varObj ? varObj.name : entry.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-[11.5px] text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-white/5 text-center">
                  Sin datos suficientes. Registra chequeos o ejecuciones para poblar el gráfico de líneas.
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              {variableMetrics.map((v) => {
                const percent = v.avgNum ? (v.avgNum / 5) * 100 : 0;
                return (
                  <div key={v.id} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-[13.5px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{v.name}</h4>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                          {v.totalCount} {v.totalCount === 1 ? 'registro' : 'registros'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[17px] font-black text-slate-900 dark:text-white">{v.average}</span>
                        <span className="text-[12px] font-bold text-slate-400">/5</span>
                      </div>
                    </div>
                    {v.avgNum > 0 ? (
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0">
                          <div 
                            className={`h-full rounded-full ${getVarMetricColor(v.avgNum, v.name)} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">Sin datos suficientes. Registra un chequeo para ver el progreso.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* MATRIZ DE ESFUERZO DE UMBRAL */}
          {settings.showExecutionSpectrum && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3.5rem] space-y-6 relative">
              <div className="flex items-center space-x-2 px-1">
                <Calendar className="text-orange-500" size={18} />
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Matriz de Esfuerzo de Umbral</h3>
              </div>
              
              <p className="text-[11.5px] text-slate-400 dark:text-slate-500 italic mt-1 px-1 leading-relaxed">
                Visualización de las ejecuciones. Divididas en EMD, regla de 2 minutos o Hábito completo.
              </p>

              <div className="space-y-6">
                {/* Responsive Grid */}
                <div className="flex space-x-1.5 overflow-x-auto no-scrollbar p-6 bg-slate-950/65 rounded-[2.5rem] border border-white/5 shadow-inner justify-center mb-2">
                  {thresholdEffortMatrix.map((week, wi) => (
                    <div key={wi} className="flex flex-col space-y-1.5 shrink-0">
                      {week.map((day, di) => (
                        <div
                          key={`${wi}-${di}`}
                          className={`w-4 h-4 rounded-[2px] transition-all duration-1000 ease-out ${
                            day.colorClass
                          }`}
                          style={{ 
                            transitionDelay: `${(wi * 7 + di) * 5}ms` 
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legends */}
                <div className="px-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {thresholdLegendItems.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className={`w-3.5 h-3.5 rounded-md ${item.color} ${item.shadow} shrink-0`}></div>
                        <span className="text-[11.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : settings.habitType === 'opportunity' ? (
        <StatsOpportunity />
      ) : (
        <>
          {/* Adaptation Curve Chart Section */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-lg space-y-6 overflow-hidden relative">
            <button 
              onClick={() => { haptics.selection(); setInfoModal('curve'); }}
              className="absolute top-6 right-6 p-2 text-slate-400/40 hover:text-slate-400 transition-colors z-20"
            >
              <Info size={16} />
            </button>

            <div className="flex flex-col space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 px-1">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-pink-500" size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Curva de Adaptación</h3>
                </div>
                <div className="flex items-center justify-center bg-pink-100 dark:bg-pink-500/10 px-4 py-1.5 rounded-full border border-pink-200 dark:border-pink-500/20 min-w-[90px]">
                  <span className="text-[9px] font-black text-pink-600 dark:text-pink-400 text-center">Media: {avgWillpower}</span>
                </div>
              </div>
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                {['today', '7d', '30d', '90d'].map((r) => (
                  <button key={r} onClick={() => setTimeRange(r as any)} className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${timeRange === r ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm border border-slate-200 dark:border-white/10' : 'text-slate-400'}`}>{r.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="w-full flex justify-center items-center py-2 min-h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={willpowerData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs><linearGradient id="colorWill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={areaColor} stopOpacity={0.6}/><stop offset="95%" stopColor={areaColor} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="dateLabel" hide={timeRange === 'today' || willpowerData.length > 15} tick={{ fontSize: 8, fill: axisColor, fontWeight: '900' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 10, fill: axisColor, fontWeight: '900' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="willpower" stroke={areaColor} strokeWidth={3} fillOpacity={1} fill="url(#colorWill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Heatmap Section */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3.5rem] space-y-6 relative">
            <button 
              onClick={() => { haptics.selection(); setInfoModal('matrix'); }}
              className="absolute top-6 right-6 p-2 text-slate-400/40 hover:text-slate-400 transition-colors z-20"
            >
              <Info size={16} />
            </button>

            <div className="flex items-center space-x-2 px-1">
              <Calendar className="text-indigo-500" size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Matriz de Esfuerzo</h3>
            </div>
            <div className="space-y-6">
              <Heatmap checkins={checkins} endDate={today} />
              <div className="px-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {legendItems.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-[4px] ${item.color} ${item.shadow} shrink-0`}></div>
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="space-y-6 pt-4">
        <div className="px-4">
           <div className="flex items-center space-x-2 mb-1">
              <History size={16} className="text-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">{linajeTerm}</h3>
           </div>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Identidades archivadas anteriormente.</p>
        </div>
        <div className="space-y-5">
          {pastHabits.length > 0 ? pastHabits.map((habit) => (
            <button key={habit.id} onClick={() => setSelectedPastHabit(habit)} className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.8rem] relative overflow-hidden group mx-1">
              <div className="absolute top-0 right-0 p-3 opacity-10"><Trophy size={40} className="text-indigo-500" /></div>
              <div className="flex flex-col space-y-3 relative z-10">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{habit.name}</h4>
                  <div className={`flex items-center space-x-2 text-[8px] font-black uppercase px-2 py-1 rounded-full border ${getRankColor(habit.rankReached || 'Prometeo')}`}><span>{habit.rankReached || 'Prometeo'}</span></div>
                </div>
              </div>
            </button>
          )) : (
            <div className="bg-slate-100/50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/5 rounded-[2.8rem] p-12 text-center flex flex-col items-center space-y-3 mx-1"><p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Tu legado comienza hoy</p></div>
          )}
        </div>
      </section>

      {renderInfoModal()}
      {renderPastHabitModal()}
    </div>
  );
};

export default Stats;
