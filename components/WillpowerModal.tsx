
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface WillpowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number) => void;
}

const WillpowerModal: React.FC<WillpowerModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [score, setScore] = useState(5);

  if (!isOpen) return null;

  const getEmoji = (val: number) => {
    if (val <= 3) return '😫';
    if (val <= 5) return '😐';
    if (val <= 8) return '😊';
    return '🤩';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">Valoración</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <p className="text-slate-600 text-center mb-8">
          ¿Cuánta voluntad te ha costado empezar hoy?
        </p>

        <div className="flex flex-col items-center space-y-8">
          <div className="text-6xl animate-bounce duration-1000">
            {getEmoji(score)}
          </div>

          <div className="w-full space-y-2">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <button
            onClick={() => onSubmit(score)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-colors"
          >
            Guardar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WillpowerModal;
