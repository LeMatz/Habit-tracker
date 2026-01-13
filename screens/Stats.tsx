
import React, { useEffect, useState, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import Heatmap from '../components/Heatmap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Zap, BarChart3, Info, Calendar, Award, Brain, Activity, Shield, Clock, Flame, BarChart, History, Book } from 'lucide-react';

const Stats: React.FC = () => {
  const { checkins, streak, pastHabits } = useHabits();
  const [successProgress, setSuccessProgress] = useState(0);

  // 1. Ranking Logic
  const getRank = (days: number) => {
    if (days >= 30) return { name: 'Alquimista de Hábitos', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', icon: <Flame className="text-fuchsia-400" /> };
    if (days >= 21) return { name: 'Rango Oro', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <Award className="text-amber-400" /> };
    if (days >= 14) return { name: 'Rango Plata', color: 'text-slate-300', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: <Shield className="text-slate-300" /> };
    if (days >= 7) return { name: 'Rango Bronce', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <Shield className="text-orange-400" /> };
    return { name: 'Sin Rango (Iniciado)', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: <Activity className="text-indigo-400" /> };
  };

  const currentRank = getRank(streak.currentStreak);

  // 2. Pattern Detection Engine
  const patterns = useMemo(() => {
    if (checkins.length < 3) return [];
    const results = [];
    
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const emergencyByDay: Record<number, number> = {};
    const completeByHour: Record<number, number> = {};
    const willpowerByDay: Record<number, number[]> = {};

    checkins.forEach(c => {
      const d = new Date(c.timestamp);
      const day = d.getDay();
      const hour = d.getHours();

      if (c.buttonType === 'emergency') {
        emergencyByDay[day] = (emergencyByDay[day] || 0) + 1;
      }
      if (c.buttonType === 'complete') {
        completeByHour[hour] = (completeByHour[hour] || 0) + 1;
      }
      
      if (!willpowerByDay[day]) willpowerByDay[day] = [];
      willpowerByDay[day].push(c.willpowerScore);
    });

    // Pattern: Danger Day
    const dangerDayIdx = Object.entries(emergencyByDay).sort((a, b) => b[1] - a[1])[0];
    if (dangerDayIdx && parseInt(dangerDayIdx[1] as any) > 1) {
      results.push({
        title: 'Día de Peligro',
        desc: `Hemos detectado que los ${dayNames[parseInt(dangerDayIdx[0])]} usas el botón SOS frecuentemente.`,
        icon: <Zap size={14} className="text-orange-500" />
      });
    }

    // Pattern: Power Hour
    const powerHour = Object.entries(completeByHour).sort((a, b) => b[1] - a[1])[0];
    if (powerHour && parseInt(powerHour[1] as any) > 1) {
      const h = parseInt(powerHour[0]);
      const timeStr = h < 12 ? 'el mediodía/mañana' : h < 18 ? 'la tarde' : 'la noche';
      results.push({
        title: 'Hora de Poder',
        desc: `Funcionas mejor durante ${timeStr} (${h}:00).`,
        icon: <Clock size={14} className="text-cyan-400" />
      });
    }

    // Pattern: SOS Resilience
    const sosCount = checkins.filter(c => c.buttonType === 'emergency').length;
    if (sosCount > 3) {
      results.push({
        title: 'Resiliencia SOS',
        desc: `Has evitado la ruptura de racha ${sosCount} veces gracias al protocolo de emergencia.`,
        icon: <Activity size={14} className="text-emerald-400" />
      });
    }

    return results;
  }, [checkins]);

  // 3. Metrics & Distribution
  const totalWillpower = checkins.reduce((acc, c) => acc + c.willpowerScore, 0);
  const avgWillpower = checkins.length > 0 ? (totalWillpower / checkins.length).toFixed(1) : "0";

  const shceCounts = {
    emergency: checkins.filter(c => c.buttonType === 'emergency').length,
    twoMinutes: checkins.filter(c => c.buttonType === 'twoMinutes').length,
    complete: checkins.filter(c => c.buttonType === 'complete').length
  };

  const willpowerData = checkins.slice(-10).map(c => ({
    name: c.date.split('-')[2],
    willpower: c.willpowerScore,
    avg: parseFloat(avgWillpower)
  }));

  useEffect(() => {
    const progress = Math.min(Math.round((streak.currentStreak / 30) * 100), 100);
    const timer = setTimeout(() => setSuccessProgress(progress), 400);
    return () => clearTimeout(timer);
  }, [streak.currentStreak]);

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 text-white pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
             <BarChart3 className="text-indigo-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-none">Análisis</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Inteligencia de Hábito</p>
          </div>
        </div>
      </div>

      {/* 1. Ranking Card */}
      <section className={`${currentRank.bg} ${currentRank.border} border p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group`}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="flex flex-col items-center space-y-4 relative z-10">
           <div className="w-20 h-20 bg-black/40 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl border border-white/5">
             {currentRank.icon}
           </div>
           <div className="text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-1">Rango por Racha</p>
             <h3 className={`text-3xl font-black tracking-tighter ${currentRank.color}`}>{currentRank.name}</h3>
             <p className="text-xs font-bold text-slate-500 mt-2">{streak.currentStreak} días ininterrumpidos</p>
           </div>
        </div>
      </section>

      {/* 2. Patterns / Intelligent Feedback */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-4">Insights de Comportamiento</h3>
        <div className="grid grid-cols-1 gap-3">
          {patterns.length > 0 ? patterns.map((p, i) => (
            <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex items-start space-x-4 group hover:bg-white/10 transition-colors">
              <div className="mt-1 p-2 bg-white/5 rounded-xl">{p.icon}</div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-white">{p.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{p.desc}</p>
              </div>
            </div>
          )) : (
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] text-center italic text-slate-600 text-xs">
              Recopilando datos suficientes para generar patrones...
            </div>
          )}
        </div>
      </section>

      {/* 3. Consistency Matrix */}
      <section className="bg-white/5 border border-white/5 p-8 rounded-[3.5rem] space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Calendar className="text-indigo-400" size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Matriz de Esfuerzo Actual</h3>
          </div>
        </div>
        
        <div className="space-y-6">
           <Heatmap checkins={checkins} />
           
           <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center space-y-1.5 p-3 bg-black/20 rounded-2xl border border-white/5">
                <div className="w-3 h-3 rounded-[2px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div>
                <span className="text-[8px] font-black text-slate-500 uppercase">Completo</span>
                <span className="text-xs font-black">{shceCounts.complete}</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5 p-3 bg-black/20 rounded-2xl border border-white/5">
                <div className="w-3 h-3 rounded-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                <span className="text-[8px] font-black text-slate-500 uppercase">2 Minutos</span>
                <span className="text-xs font-black">{shceCounts.twoMinutes}</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5 p-3 bg-black/20 rounded-2xl border border-white/5">
                <div className="w-3 h-3 rounded-[2px] bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                <span className="text-[8px] font-black text-slate-500 uppercase">SOS</span>
                <span className="text-xs font-black">{shceCounts.emergency}</span>
              </div>
           </div>
        </div>
      </section>

      {/* 4. Adaptation Curve */}
      <section className="bg-black/40 border border-white/5 p-8 rounded-[3rem] shadow-xl space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-pink-400" size={18} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Curva de Adaptación</h3>
          </div>
          <div className="bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/20">
            <span className="text-[9px] font-black text-pink-400">Promedio Voluntad: {avgWillpower}</span>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={willpowerData}>
              <defs>
                <linearGradient id="colorWill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} 
                itemStyle={{ fontWeight: '900', fontSize: '10px', color: '#ec4899' }}
              />
              <Area 
                type="monotone" 
                dataKey="willpower" 
                stroke="#ec4899" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWill)" 
              />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#475569" 
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. Metrics Grid */}
      <div className="grid grid-cols-2 gap-5 px-1">
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Racha Máxima</p>
          <div className="flex items-center space-x-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-2xl font-black">{streak.longestStreak}</span>
          </div>
        </div>
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total de sesiones</p>
          <div className="flex items-center space-x-2">
            <BarChart size={16} className="text-indigo-400" />
            <span className="text-2xl font-black">{streak.totalCompletions}</span>
          </div>
        </div>
      </div>

      {/* 6. Historical Identity Archive */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center space-x-2 px-4">
           <History size={16} className="text-indigo-400" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Archivo de Identidades</h3>
        </div>
        
        <div className="space-y-4">
          {pastHabits.length > 0 ? (
            pastHabits.map((habit) => (
              <div key={habit.id} className="bg-[#0f172a] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Book size={48} />
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight line-clamp-2">{habit.name}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Finalizado el {new Date(habit.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Sesiones</p>
                      <p className="text-sm font-black text-white">{habit.sessions}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Mejor Racha</p>
                      <p className="text-sm font-black text-white">{habit.maxStreak}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/5 border-2 border-dashed border-white/5 p-10 rounded-[3rem] text-center flex flex-col items-center space-y-3">
               <History size={32} className="text-slate-800" />
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No hay hábitos archivados aún</p>
            </div>
          )}
        </div>
      </section>

      <div className="py-12 text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400">Obsidian Peak Stats Engine</p>
      </div>
    </div>
  );
};

export default Stats;
