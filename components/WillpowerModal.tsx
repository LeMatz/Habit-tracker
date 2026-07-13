
import React, { useState } from 'react';
import { X, Brain } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface WillpowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => void;
}

const WillpowerModal: React.FC<WillpowerModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [score, setScore] = useState(5);

  if (!isOpen) return null;

  const getEmoji = (val: number) => {
    if (val === 10) return '🌀'; // Portal / Máximo estado
    if (val <= 3) return '🧊'; // Hielo/Dureza
    if (val <= 5) return '🛡️'; // Resistencia/Escudo
    if (val <= 8) return '🔥'; // Flujo/Fuego
    return '⚡'; // Estado Pico/Rayo
  };

  const getColor = (val: number) => {
    if (val <= 3) return 'text-sky-400';
    if (val <= 5) return 'text-indigo-400';
    if (val <= 8) return 'text-orange-400';
    if (val === 10) return 'text-cyan-400';
    return 'text-yellow-400';
  };

  const getLabel = (val: number) => {
    if (val <= 3) return 'Mucha Resistencia';
    if (val <= 5) return 'Esfuerzo Estable';
    if (val <= 8) return 'En el Flujo';
    return 'Estado de Gracia';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="bg-slate-950 border border-white/10 rounded-[3.5rem] w-full max-w-xs p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-3">
             <div className="p-2.5 bg-indigo-500/20 rounded-2xl">
               <Brain size={20} className="text-indigo-400" />
             </div>
             <h2 className="text-xl font-black text-white tracking-tight">Lag de inicio</h2>
          </div>
          <button 
            onClick={() => { haptics.selection(); onClose(); }} 
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-slate-200 text-[11px] font-black uppercase tracking-[0.15em] text-center mb-8 px-2 leading-relaxed">
          ¿Cuánto esfuerzo y tiempo te llevó comenzar hoy?
        </p>

        <div className="flex flex-col items-center space-y-8 relative z-10">
          {/* Display Area */}
          <div className="flex flex-col items-center space-y-4">
            <div className={`text-7xl transition-all duration-500 hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] bg-white/5 w-24 h-24 flex items-center justify-center rounded-[2rem] border border-white/5`}>
              {getEmoji(score)}
            </div>
            <div className="flex flex-col items-center">
              <span className={`font-black text-4xl ${getColor(score)} transition-colors duration-300`}>
                {score}
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                {getLabel(score)}
              </span>
            </div>
          </div>

          <div className="w-full space-y-4 px-2 pt-4">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setScore(val);
                haptics.selection();
              }}
              className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 shadow-inner"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-700 uppercase tracking-widest px-1">
              <span>Mucho</span>
              <span>Poco</span>
            </div>
          </div>

          <button
            onClick={() => {
              haptics.success();
              onSubmit(score);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-[0.25em] text-[10px] border border-indigo-400/20 mt-4"
          >
            Registrar tarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default WillpowerModal;
