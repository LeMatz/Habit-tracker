
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { haptics } from '../utils/haptics';
import { soundService } from '../utils/soundService';
import { 
  Dice5, 
  ShoppingBag, 
  Lock, 
  ShieldCheck, 
  Scissors, 
  Zap, 
  Music, 
  BookOpen,
  Sparkles,
  Gift,
  Coffee,
  Coins,
  Infinity as InfinityIcon,
  CircleDot,
  X,
  Trophy,
  CheckCircle2,
  Info,
  Dice1,
  LayoutGrid,
  ZapIcon
} from 'lucide-react';
import { UserReward } from '../types';

const Gamification: React.FC = () => {
  const { rewards, redeemReward, addPoints, diceRewards, hasCheckedInToday, recordDiceRoll, settings, today } = useHabits();
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [purchasedReward, setPurchasedReward] = useState<UserReward | null>(null);
  const [infoModal, setInfoModal] = useState<'dice' | 'inventory' | 'mana' | null>(null);

  const habitCompleted = hasCheckedInToday();
  const alreadyRolled = rewards.lastDiceRollDate === today;
  const canRoll = habitCompleted && !alreadyRolled;
  const heroTerm = settings.gender === 'male' ? 'Héroe' : 'Heroína';

  const handleRollDice = () => {
    if (isRolling || !canRoll) return;
    haptics.medium();
    setIsRolling(true);
    setDiceResult(null);
    const vInterval = setInterval(() => { haptics.selection(); if (settings.soundsEnabled) soundService.playDiceTick(); }, 120);
    setTimeout(() => {
      clearInterval(vInterval);
      const result = Math.floor(Math.random() * 6) + 1;
      setDiceResult(result);
      setIsRolling(false);
      haptics.success();
      if (settings.soundsEnabled) soundService.playDiceResult();
      if (result === 6) addPoints(3);
      recordDiceRoll();
    }, 1500);
  };

  const handleRedeem = (reward: UserReward) => {
    haptics.heavy();
    const success = redeemReward(reward.id);
    if (success) {
      haptics.success();
      if (settings.soundsEnabled) soundService.playPurchase();
      setPurchasedReward(reward);
    } else {
      haptics.error();
    }
  };

  const renderRewardIcon = (iconName?: string, size = 24, padding = "p-4") => {
    let IconComp = Gift;
    switch (iconName) {
      case 'Scissors': IconComp = Scissors; break;
      case 'ShieldCheck': IconComp = ShieldCheck; break;
      case 'Zap': IconComp = Zap; break;
      case 'Music': IconComp = Music; break;
      case 'BookOpen': IconComp = BookOpen; break;
      case 'Coffee': IconComp = Coffee; break;
      default: IconComp = Sparkles;
    }
    return <div className={`relative ${padding} rounded-2xl bg-slate-800/50 backdrop-blur-md border border-white/10 shadow-lg text-white flex items-center justify-center`}><IconComp size={size} /></div>;
  };

  const renderInfoModal = () => {
    if (!infoModal) return null;
    
    const modalContent = {
      dice: {
        icon: <Dice1 className="text-indigo-400" size={32} />,
        title: "Dado del Destino",
        subtitle: "Sistema de Invocación",
        rules: [
          { icon: <CheckCircle2 size={18} className="text-emerald-400" />, title: "Requisito de Hábito", desc: "El dado solo puede ser invocado una vez al día, DESPUÉS de registrar tu hábito." },
          { icon: <Sparkles size={18} className="text-amber-400" />, title: "Jackpot del 6", desc: "Si obtienes un 6, además del premio especial, recibes +3 puntos de Maná extra." },
          { icon: <InfinityIcon size={18} className="text-indigo-400" />, title: "Personalización", desc: "Puedes ajustar los premios que otorga cada número del dado en la sección de Ajustes." }
        ]
      },
      inventory: {
        icon: <LayoutGrid className="text-indigo-400" size={32} />,
        title: "Inventario Élite",
        subtitle: "Economía de Identidad",
        rules: [
          { icon: <Coins size={18} className="text-amber-400" />, title: "Cosecha de Maná", desc: "Obtienes Maná mediante check-ins y misiones diarias. Los modos de dificultad multiplican tu ganancia." },
          { icon: <ShieldCheck size={18} className="text-emerald-400" />, title: "Protección Automática", desc: "El 'Protector de Racha' se activa solo si olvidas un día. Es tu red de seguridad definitiva." },
          { icon: <Sparkles size={18} className="text-indigo-400" />, title: "Tipos de Items", desc: "Instantáneos (alivio inmediato), Experiencias (contenido exclusivo) y Tratamientos (recompensas físicas)." }
        ]
      },
      mana: {
        icon: <ZapIcon className="text-indigo-400" size={32} />,
        title: "Energía de Maná",
        subtitle: "Recurso de Transformación",
        rules: [
          { icon: <Sparkles size={18} className="text-indigo-400" />, title: "Origen", desc: "El Maná es la representación de tu energía de voluntad convertida en recurso digital." },
          { icon: <Coins size={18} className="text-amber-400" />, title: "Acumulación", desc: "Obtienes Maná por cada check-in diario, sin importar si es la versión completa, de 2 minutos o EMD. El compromiso diario es lo que realmente genera energía." },
          { icon: <ShoppingBag size={18} className="text-cyan-400" />, title: "Utilidad", desc: "Gasta tu Maná en el Bazar para obtener protecciones de racha o premios que refuercen tu nueva identidad." }
        ]
      }
    };

    const modalData = modalContent[infoModal];

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

  return (
    <div className="p-6 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700 pb-24">
      {/* Header Estilizado */}
      <div className="flex items-center space-x-3 px-1">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-inner text-indigo-600 dark:text-indigo-400">
           <ShoppingBag size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Bazar</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Intercambio de Voluntad</p>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center py-10">
        {/* Espiral de energía exterior Mejorada */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
          {/* Espiral Indigo Principal */}
          <svg className="w-80 h-80 animate-[spin_12s_linear_infinite] opacity-30" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="spiral-grad-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M50,50 Q70,20 90,50 T50,80 T10,50 T50,20" 
              fill="none" 
              stroke="url(#spiral-grad-indigo)" 
              strokeWidth="0.8" 
              className="animate-[pulse_4s_ease-in-out_infinite]"
            />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#spiral-grad-indigo)" strokeWidth="0.15" strokeDasharray="2,6" />
          </svg>

          {/* Espiral Cian Secundaria (Contraste) */}
          <svg className="absolute w-64 h-64 animate-[spin_8s_linear_infinite_reverse] opacity-40" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="spiral-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M50,50 C65,35 85,50 50,85 C15,50 35,35 50,50" 
              fill="none" 
              stroke="url(#spiral-grad-cyan)" 
              strokeWidth="0.6" 
              className="animate-[pulse_3s_ease-in-out_infinite]"
            />
            {/* Partículas orbitales cian */}
            <circle cx="50" cy="15" r="1.5" className="fill-cyan-400 animate-pulse" />
            <circle cx="85" cy="50" r="1" className="fill-cyan-300 animate-pulse" />
            <circle cx="50" cy="85" r="1.2" className="fill-cyan-400 animate-pulse" />
            <circle cx="15" cy="50" r="1" className="fill-cyan-300 animate-pulse" />
          </svg>

          {/* Anillos de pulsación */}
          <div className="absolute w-64 h-64 rounded-full border border-indigo-500/10 animate-[ping_5s_linear_infinite]"></div>
          <div className="absolute w-72 h-72 rounded-full border border-cyan-500/5 animate-[ping_7s_linear_infinite_reverse]"></div>
        </div>

        {/* Botón de Información */}
        <button 
          onClick={() => { haptics.selection(); setInfoModal('mana'); }}
          className="absolute top-0 right-10 p-3 bg-white/5 hover:bg-indigo-500/10 border border-white/5 rounded-2xl text-slate-500 hover:text-cyan-400 transition-all z-20 shadow-lg group"
        >
          <Info size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#1e1b4b] to-black border border-white/10 shadow-[0_0_70px_rgba(6,182,212,0.3),0_0_50px_rgba(79,70,229,0.3)] flex flex-col items-center justify-center overflow-hidden group">
          {/* Brillo dinámico interno cian e indigo */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/10 to-indigo-500/5 rotate-45 animate-[pulse_4s_ease-in-out_infinite]"></div>
          
          <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-cyan-100 z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">{rewards.availablePoints}</span>
          <span className="text-xs font-black text-indigo-400/80 uppercase tracking-[0.3em] mt-[-5px] z-10 flex items-center space-x-1">
             <span>Maná</span>
             <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
          </span>
          
          {/* Rayo de energía diagonal que cruza */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        </div>

        {/* Partículas de energía que "flotan" hacia arriba con colores mixtos */}
        <div className="absolute -bottom-6 w-full flex justify-around opacity-60">
           <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_#818cf8]"></div>
           <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.5s] shadow-[0_0_8px_#22d3ee]"></div>
           <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:0.8s] shadow-[0_0_8px_#c084fc]"></div>
           <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_#67e8f9]"></div>
        </div>
      </div>

      {/* Dado del destino */}
      <section className="space-y-6 relative">
        <button onClick={() => { haptics.selection(); setInfoModal('dice'); }} className="absolute top-0 right-4 p-2 text-slate-500 hover:text-white z-20"><Info size={18} /></button>
        <div className="flex items-center space-x-2 px-4"><Coins size={14} className="text-indigo-500" /><h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Mecánica de Suerte</h3></div>
        <div className={`relative p-10 rounded-[4rem] group ${canRoll ? 'bg-gradient-to-br from-indigo-600 to-indigo-900 shadow-xl' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 opacity-90'}`}>
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <div className="text-center space-y-2"><h3 className={`font-black text-2xl tracking-tighter uppercase ${canRoll ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Dado del destino</h3></div>
            <div className={`w-32 h-32 bg-white rounded-[2.8rem] flex items-center justify-center text-6xl text-indigo-700 transition-all ${isRolling ? 'animate-bounce' : !canRoll ? 'grayscale opacity-40' : ''}`}>{!habitCompleted ? <Lock size={44} /> : isRolling ? <Dice5 className="animate-spin" /> : diceResult || <Dice5 />}</div>
            <button onClick={handleRollDice} disabled={isRolling || !canRoll} className={`w-full py-6 font-black rounded-[2rem] shadow-2xl transition-all uppercase tracking-[0.25em] text-[10px] ${canRoll ? 'bg-white text-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{isRolling ? 'Procesando...' : 'Lanzar Dado'}</button>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="space-y-8 relative">
        <button onClick={() => { haptics.selection(); setInfoModal('inventory'); }} className="absolute top-0 right-4 p-2 text-slate-500 hover:text-white z-20"><Info size={18} /></button>
        <div className="flex items-center justify-between px-4"><div className="flex items-center space-x-3"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><h3 className="font-black text-[11px] text-slate-500 uppercase tracking-[0.3em]">Inventario de Élite</h3></div></div>
        <div className="space-y-6">
          {rewards.rewardsCatalog.map((reward) => {
            const isAffordable = rewards.availablePoints >= reward.cost;
            return (
              <div key={reward.id} className={`group p-6 rounded-[2.8rem] border flex items-center justify-between ${isAffordable ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10' : 'bg-slate-50 dark:bg-slate-900/30 opacity-80'}`}>
                <div className="flex items-center space-x-5">{renderRewardIcon(reward.icon)}<div><h4 className="text-base font-black tracking-tight mb-0.5">{reward.name}</h4><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{reward.description}</p></div></div>
                <button onClick={() => handleRedeem(reward)} disabled={!isAffordable} className={`px-6 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest ${isAffordable ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-lg' : 'bg-slate-200 dark:bg-slate-800/50 text-slate-400'}`}>{reward.cost} MANÁ</button>
              </div>
            );
          })}
        </div>
      </section>

      {purchasedReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] w-full max-w-sm p-8 shadow-2xl text-center">
            <button onClick={() => setPurchasedReward(null)} className="absolute top-6 right-6 p-2 text-slate-500"><X size={20} /></button>
            <div className="flex flex-col items-center space-y-6 pt-4">
              {renderRewardIcon(purchasedReward.icon, 48, "p-8")}
              <h3 className="text-3xl font-black text-white tracking-tighter">¡Felicidades, {heroTerm}!</h3>
              <button onClick={() => setPurchasedReward(null)} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-[10px]">Continuar Misión</button>
            </div>
          </div>
        </div>
      )}

      {renderInfoModal()}
    </div>
  );
};

export default Gamification;
