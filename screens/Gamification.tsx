
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { 
  Dice5, 
  ShoppingBag, 
  Settings2, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  ShieldCheck, 
  Scissors, 
  Zap, 
  Music, 
  BookOpen,
  Sparkles,
  Gift,
  Star,
  Coffee,
  Ghost
} from 'lucide-react';

const Gamification: React.FC = () => {
  const { rewards, redeemReward, addPoints, diceRewards, updateDiceReward, hasCheckedInToday, recordDiceRoll } = useHabits();
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const habitCompleted = hasCheckedInToday();
  const alreadyRolled = rewards.lastDiceRollDate === today;
  const canRoll = habitCompleted && !alreadyRolled;

  const handleRollDice = () => {
    if (isRolling || !canRoll) return;
    haptics.medium();
    setIsRolling(true);
    setDiceResult(null);
    
    // Simulate dice rolling vibration
    const vInterval = setInterval(() => {
      haptics.selection();
    }, 150);

    setTimeout(() => {
      clearInterval(vInterval);
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      setIsRolling(false);
      haptics.success();
      addPoints(5);
      recordDiceRoll();
    }, 1200);
  };

  const handleRedeem = (id: string) => {
    haptics.heavy();
    const success = redeemReward(id);
    if (success) {
      haptics.success();
    } else {
      haptics.error();
    }
  };

  const currentDiceReward = diceRewards.find(r => r.diceNumber === diceResult);

  const renderRewardIcon = (iconName?: string) => {
    const size = 26;
    let IconComp = Gift;
    let bgColor = 'bg-indigo-500/10';
    let textColor = 'text-indigo-400';
    let borderColor = 'border-indigo-500/20';

    switch (iconName) {
      case 'Scissors':
        IconComp = Scissors;
        bgColor = 'bg-violet-500/20';
        textColor = 'text-violet-400';
        borderColor = 'border-violet-500/30';
        break;
      case 'ShieldCheck':
        IconComp = ShieldCheck;
        bgColor = 'bg-emerald-500/20';
        textColor = 'text-emerald-400';
        borderColor = 'border-emerald-500/30';
        break;
      case 'Zap':
        IconComp = Zap;
        bgColor = 'bg-amber-500/20';
        textColor = 'text-amber-400';
        borderColor = 'border-amber-500/30';
        break;
      case 'Music':
        IconComp = Music;
        bgColor = 'bg-pink-500/20';
        textColor = 'text-pink-400';
        borderColor = 'border-pink-500/30';
        break;
      case 'BookOpen':
        IconComp = BookOpen;
        bgColor = 'bg-cyan-500/20';
        textColor = 'text-cyan-400';
        borderColor = 'border-cyan-500/30';
        break;
      case 'Coffee':
        IconComp = Coffee;
        bgColor = 'bg-orange-500/20';
        textColor = 'text-orange-400';
        borderColor = 'border-orange-500/30';
        break;
      default:
        IconComp = Sparkles;
        bgColor = 'bg-indigo-500/20';
        textColor = 'text-indigo-400';
        borderColor = 'border-indigo-500/30';
    }

    return (
      <div className={`p-4 rounded-2xl ${bgColor} ${textColor} border ${borderColor} shadow-inner group-hover:animate-pulse transition-all duration-500 transform group-hover:-translate-y-1`}>
        <IconComp size={size} className="drop-shadow-[0_0_8px_currentColor]" />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-10 animate-in fade-in slide-in-from-left-8 duration-700 pb-16 text-white">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-black tracking-tight">Bazar</h2>
        <ShoppingBag size={22} className="text-slate-600" />
      </div>

      <div className="flex flex-col space-y-4">
        <div className="bg-[#0f172a] p-8 rounded-[3rem] border border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="flex items-center space-x-5 relative">
            <div className="bg-indigo-500/20 p-4 rounded-2xl shadow-inner border border-indigo-500/10 flex items-center justify-center">
              <span className="text-3xl drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]">🌀</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Maná acumulado</p>
              <p className="text-4xl font-black text-white">{rewards.availablePoints} <span className="text-sm font-bold text-indigo-500/50">pts</span></p>
            </div>
          </div>
          <div className="bg-indigo-500 text-white px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <span className="text-[10px] font-black uppercase tracking-tighter">+{rewards.earnedToday} hoy</span>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <ShieldCheck className="text-emerald-400" size={24} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Escudos de Racha</p>
              <p className="text-lg font-black text-white">{rewards.streakProtectors} disponibles</p>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>

      <div className={`bg-gradient-to-br transition-all duration-700 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group ${canRoll ? 'from-indigo-600 to-indigo-900 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)]' : 'from-slate-800 to-slate-900 opacity-80'}`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]"></div>
        
        <div className="flex flex-col items-center space-y-8 relative">
          <div className="text-center">
            <h3 className="font-black text-2xl mb-2">Oráculo de la Suerte</h3>
            {!habitCompleted ? (
              <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest bg-orange-400/10 py-2 px-4 rounded-full">Requiere Acción Diaria</p>
            ) : alreadyRolled ? (
              <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest bg-cyan-400/10 py-2 px-4 rounded-full">Destino Sellado por hoy</p>
            ) : (
              <p className="text-indigo-200 text-xs font-medium px-6 opacity-70 leading-relaxed">Invoca una recompensa inmediata para fortalecer tu disciplina.</p>
            )}
          </div>

          <div 
            className={`w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl text-indigo-700 transition-all duration-300 ${isRolling ? 'animate-bounce scale-110' : !canRoll ? 'grayscale opacity-30 scale-90' : 'group-hover:rotate-12'}`}
          >
            {!habitCompleted ? <Lock size={40} className="text-slate-400" /> : isRolling ? <Dice5 className="animate-spin" size={48} /> : diceResult || <Dice5 size={48} />}
          </div>

          <button
            onClick={handleRollDice}
            disabled={isRolling || !canRoll}
            className={`w-full py-5 font-black rounded-3xl shadow-2xl transition-all uppercase tracking-[0.2em] text-xs ${
              canRoll 
                ? 'bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {isRolling ? 'Invocando...' : !habitCompleted ? 'Bloqueado: Haz tu hábito' : alreadyRolled ? 'Lanzado hoy' : 'Lanzar Dado'}
          </button>

          {diceResult && currentDiceReward && (
            <div className="text-center animate-in slide-in-from-bottom-4 duration-500 bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 w-full shadow-inner">
              <p className="text-[10px] text-indigo-200 uppercase font-black tracking-[0.4em] mb-2">¡Cara {diceResult}!</p>
              <h4 className="text-xl font-black mb-1">{currentDiceReward.title}</h4>
              {currentDiceReward.description && (
                <p className="text-xs text-indigo-100 opacity-60 leading-relaxed">{currentDiceReward.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-2">
        <button 
          onClick={() => { haptics.selection(); setShowConfig(!showConfig); }}
          className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <Settings2 size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-white transition-colors">Configurar Destino</span>
          </div>
          {showConfig ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>

        {showConfig && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 duration-500">
            {diceRewards.map((reward) => (
              <div key={reward.id} className="bg-black/40 border border-white/5 p-6 rounded-3xl flex items-center space-x-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/10">
                  {reward.diceNumber}
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={reward.title}
                    onChange={(e) => updateDiceReward(reward.id, e.target.value, '')}
                    placeholder="Escribe tu recompensa..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-black text-[11px] text-slate-500 uppercase tracking-[0.4em] flex items-center space-x-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
             <span>Inventario de Premios</span>
          </h3>
        </div>

        <div className="space-y-5">
          {rewards.rewardsCatalog.map((reward) => (
            <div key={reward.id} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex items-center space-x-5">
                {renderRewardIcon(reward.icon)}
                <div>
                  <h4 className="text-base font-black text-white mb-0.5">{reward.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{reward.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={rewards.availablePoints < reward.cost}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  rewards.availablePoints >= reward.cost 
                    ? 'bg-white text-indigo-900 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-90 hover:bg-indigo-50' 
                    : 'bg-slate-800 text-slate-600 border border-white/5'
                }`}
              >
                {reward.cost} pts
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
