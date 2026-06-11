
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Quote, Heart, Share2, ChevronDown, ChevronUp } from 'lucide-react';

const Tips: React.FC = () => {
  const { tips, toggleFavoriteTip, streak } = useHabits();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'HabitQuest Tip',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Contenido copiado al portapapeles');
    }
  };

  const unlockedCount = Math.min(tips.length, Math.floor(streak.totalCompletions / 2) + 1);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col space-y-1">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Consejos Diarios</h2>
        <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">Desbloqueas 1 consejo por cada 2 check-ins.</p>
      </div>

      <div className="space-y-4">
        {tips.slice(0, unlockedCount).map((tip) => (
          <div 
            key={tip.id} 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-all duration-300"
          >
            <div 
              className="p-5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === tip.id ? null : tip.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
                  {tip.category}
                </span>
                {expandedId === tip.id ? <ChevronUp size={16} className="text-slate-400 dark:text-slate-500" /> : <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />}
              </div>
              
              <div className="flex space-x-3">
                <Quote className="text-blue-200 dark:text-blue-950 shrink-0" size={24} />
                <p className={`text-slate-705 dark:text-slate-205 leading-relaxed font-semibold transition-colors ${expandedId === tip.id ? '' : 'line-clamp-2'}`}>
                  {tip.content}
                </p>
              </div>

              {expandedId === tip.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">— {tip.author}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteTip(tip.id); }}
                      className={`p-2 rounded-full transition-colors ${tip.isFavorite ? 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                    >
                      <Heart size={18} fill={tip.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(tip.content); }}
                      className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {unlockedCount < tips.length && (
          <div className="bg-slate-100 dark:bg-slate-900/40 rounded-2xl p-8 border-2 border-dashed border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-lg">🔒</span>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Siguiente consejo bloqueado</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Completa más hábitos para desbloquear</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tips;
