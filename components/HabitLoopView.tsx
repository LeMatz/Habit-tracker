
import React from 'react';
import { HabitLoop } from '../types';
import { RefreshCw, Zap, Target, Award } from 'lucide-react';

interface HabitLoopViewProps {
  loop: HabitLoop;
  title?: string;
}

const HabitLoopView: React.FC<HabitLoopViewProps> = ({ loop, title = "Ciclo del Hábito" }) => {
  if (!loop) return null;

  // Calculate dynamic margins based on text length to prevent overlap
  // Adjusted for narrower labels (approx 14 chars per line) or wider ones (approx 28 chars)
  const getVerticalMargin = (text: string, isWide: boolean = false) => {
    const charCount = text?.length || 0;
    if (charCount === 0) return 60;
    const charsPerLine = isWide ? 28 : 14;
    const lines = Math.ceil(charCount / charsPerLine); 
    return Math.max(60, Math.min(150, lines * 18 + 20)); 
  };

  const topMargin = getVerticalMargin(loop.cue, true);
  const bottomMargin = getVerticalMargin(loop.response, true);

  const steps = [
    { 
      label: loop.cue || 'Señal', 
      icon: <Zap size={20} />, 
      color: 'bg-yellow-500', 
      border: 'border-yellow-500/20', 
      text: 'text-yellow-500', 
      pos: '-top-5 left-1/2 -translate-x-1/2',
      labelPos: 'bottom-full mb-3',
      widthClass: 'w-[120px] sm:w-[160px]'
    },
    { 
      label: loop.craving || 'Anhelo', 
      icon: <Target size={20} />, 
      color: 'bg-pink-500', 
      border: 'border-pink-500/20', 
      text: 'text-pink-500', 
      pos: 'top-1/2 -right-5 -translate-y-1/2',
      labelPos: 'left-full ml-1',
      widthClass: 'w-[65px] sm:w-[110px]'
    },
    { 
      label: loop.response || 'Respuesta', 
      icon: <RefreshCw size={20} />, 
      color: 'bg-indigo-500', 
      border: 'border-indigo-500/20', 
      text: 'text-indigo-500', 
      pos: '-bottom-5 left-1/2 -translate-x-1/2',
      labelPos: 'top-full mt-3',
      widthClass: 'w-[120px] sm:w-[160px]'
    },
    { 
      label: loop.reward || 'Recompensa', 
      icon: <Award size={20} />, 
      color: 'bg-emerald-500', 
      border: 'border-emerald-500/20', 
      text: 'text-emerald-500', 
      pos: 'top-1/2 -left-5 -translate-y-1/2',
      labelPos: 'right-full mr-1',
      widthClass: 'w-[65px] sm:w-[110px]'
    },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-full overflow-visible px-1">
      <div className="flex items-center justify-center space-x-2 mb-4 relative z-50">
        <RefreshCw size={14} className="text-indigo-500 animate-spin-slow" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">{title}</h3>
      </div>

      <div 
        className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center transition-all duration-500"
        style={{ marginTop: `${topMargin}px`, marginBottom: `${bottomMargin}px` }}
      >
        {/* Central Circle - Background Ring */}
        <div className="absolute inset-0 border-4 border-slate-100 dark:border-white/5 rounded-full"></div>
        
        {/* Animated Dashed Ring with Directional Indicators */}
        <div className="absolute -inset-8 border-2 border-dashed border-indigo-500/20 rounded-full animate-spin-slow">
          {/* Clockwise Arrow Indicators - 4 positions for better visibility */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500/60">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current transform rotate-90"></div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-indigo-500/60">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current transform -rotate-90"></div>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-indigo-500/60">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current transform rotate-0"></div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-indigo-500/60">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-current transform rotate-180"></div>
          </div>
        </div>

        {/* Bubbles */}
        {steps.map((step, i) => (
          <div key={i} className={`absolute ${step.pos} z-20`}>
            <div className="relative flex items-center justify-center">
              {/* Icon Bubble */}
              <div className={`w-12 h-12 sm:w-15 sm:h-15 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg shadow-${step.color.split('-')[1]}-500/20 border-4 border-white dark:border-slate-900 transition-transform hover:scale-110 duration-300`}>
                {React.cloneElement(step.icon as React.ReactElement<any>, { size: 22 })}
              </div>
              
              {/* Directional Label */}
              <div className={`absolute ${step.labelPos} pointer-events-none flex justify-center z-30`}>
                <div className={`px-2 py-1.5 bg-white dark:bg-slate-800 rounded-xl border ${step.border} shadow-2xl backdrop-blur-md ${step.widthClass} text-center break-words`}>
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tight leading-tight block ${step.text}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Center Core */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-full border border-slate-200 dark:border-white/10 shadow-2xl z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <RefreshCw size={20} className="text-indigo-500" />
          </div>
        </div>
      </div>

      <div className="pt-4 text-center relative z-50">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
          La identidad se forja en la repetición.
        </p>
      </div>
    </div>
  );
};

export default HabitLoopView;
