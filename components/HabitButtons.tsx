
import React from 'react';
import { Zap, Clock, CheckCircle2 } from 'lucide-react';
import { HabitButtonType } from '../types';

interface HabitButtonProps {
  type: HabitButtonType;
  onClick: () => void;
  disabled?: boolean;
  customLabel?: string;
}

export const HabitButton: React.FC<HabitButtonProps> = ({ type, onClick, disabled, customLabel }) => {
  const configs = {
    emergency: {
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-700',
      shadow: 'shadow-orange-500/20',
      icon: <Zap size={28} />,
      text: customLabel || 'Mínimo',
      subtext: 'SOS'
    },
    twoMinutes: {
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-700',
      shadow: 'shadow-indigo-500/20',
      icon: <Clock size={28} />,
      text: customLabel || '2 Min',
      subtext: 'Micro'
    },
    complete: {
      color: 'bg-cyan-500',
      gradient: 'from-cyan-400 to-cyan-600',
      shadow: 'shadow-cyan-500/20',
      icon: <CheckCircle2 size={28} />,
      text: customLabel || 'Total',
      subtext: 'Check'
    }
  };

  const config = configs[type];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center space-y-4 group ${disabled ? 'opacity-20 grayscale' : 'hover:-translate-y-2'} transition-all duration-300`}
    >
      <div
        className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white relative overflow-hidden transition-all duration-500 ${
          !disabled 
            ? `bg-gradient-to-br ${config.gradient} shadow-2xl ${config.shadow} active:scale-95` 
            : 'bg-slate-800 border border-white/5'
        }`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
        {config.icon}
      </div>
      <div className="text-center px-1">
        <p className="text-[10px] font-black text-white uppercase tracking-tighter line-clamp-2 leading-tight h-5 overflow-hidden">{config.text}</p>
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{config.subtext}</p>
      </div>
    </button>
  );
};
