
import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { HabitButton } from '../components/HabitButtons';
import WillpowerModal from '../components/WillpowerModal';
import { 
  Flame, 
  Trophy, 
  Star, 
  ChevronDown, 
  Brain, 
  Zap, 
  MicOff, 
  MapPin, 
  Ghost, 
  Wind, 
  Smartphone,
  Activity
} from 'lucide-react';
import { HabitButtonType } from '../types';
import { haptics } from '../utils/haptics';
import { DIFFICULTY_MODES } from '../constants';

const Home: React.FC = () => {
  const { streak, canCheckin, addCheckin, settings } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<HabitButtonType | null>(null);
  const [selectedModeId, setSelectedModeId] = useState('normal');
  const [isModeOpen, setIsModeOpen] = useState(false);

  const selectedMode = DIFFICULTY_MODES.find(m => m.id === selectedModeId) || DIFFICULTY_MODES[0];

  const handleHabitClick = (type: HabitButtonType) => {
    // Restriction: In special modes, only 'complete' is allowed.
    // This is double-checked by the disabled property in the UI, but here as safety.
    if (selectedModeId !== 'normal' && type !== 'complete') return;

    if (type === 'emergency') haptics.medium();
    else if (type === 'twoMinutes') haptics.light();
    else if (type === 'complete') haptics.success();

    setSelectedType(type);
    setModalOpen(true);
  };

  const handleSubmit = (willpower: number) => {
    if (selectedType) {
      const success = addCheckin(selectedType, willpower, selectedModeId);
      if (success) {
        haptics.success();
        setModalOpen(false);
      }
    }
  };

  const handleModeChange = (id: string) => {
    haptics.selection();
    setSelectedModeId(id);
    setIsModeOpen(false);
  };

  const available = canCheckin();
  const genderTitle = settings.gender === 'male' ? 'Legendaria' : 'Legendaria';
  const heroTerm = settings.gender === 'male' ? 'Héroe' : 'Heroína';

  const renderModeIcon = (iconName: string, size = 16) => {
    switch (iconName) {
      case 'MicOff': return <MicOff size={size} />;
      case 'MapPin': return <MapPin size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Ghost': return <Ghost size={size} />;
      case 'Wind': return <Wind size={size} />;
      case 'Smartphone': return <Smartphone size={size} />;
      default: return <Activity size={size} />;
    }
  };

  return (
    <div className={`p-6 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20`}>
      {/* Premium Midnight Streak Card */}
      {settings.showStreak && (
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#020617] border border-white/5 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-600/5 rounded-full blur-[60px]"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-5 rounded-[2rem] bg-white/5 backdrop-blur-md mb-6 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <Flame className="text-orange-500 fill-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]" size={48} />
            </div>
            <h3 className="text-5xl font-black mb-1 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">{streak.currentStreak} DÍAS</h3>
            <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] mb-8">Racha {genderTitle}</p>
            
            <div className="w-full flex justify-center space-x-3 mb-8 px-2">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 flex-1 rounded-full transition-all duration-1000 ${
                    i < streak.currentStreak % 7 
                      ? 'bg-gradient-to-r from-indigo-400 to-cyan-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]' 
                      : 'bg-white/10'
                  }`}
                ></div>
              ))}
            </div>

            <div className="flex items-center space-x-2 bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl">
              <Trophy size={16} className="text-amber-400" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Record Personal: {streak.longestStreak}</span>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Modifier Dropdown */}
      <div className="relative z-20 px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block ml-4">Configuración de Sesión</label>
        
        <button 
          onClick={() => { haptics.selection(); setIsModeOpen(!isModeOpen); }}
          className={`w-full bg-[#0f172a] border border-white/10 p-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl transition-all duration-300 ${isModeOpen ? 'rounded-b-none ring-2 ring-indigo-500/50' : 'hover:bg-[#1e293b]'}`}
        >
          <div className="flex items-center space-x-5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
              {renderModeIcon(selectedMode.icon, 20)}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-white">{selectedMode.name}</span>
                <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {selectedMode.multiplier}x
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider line-clamp-1 mt-0.5">
                {selectedMode.description}
              </p>
            </div>
          </div>
          <ChevronDown className={`text-slate-600 transition-transform duration-300 ${isModeOpen ? 'rotate-180' : ''}`} />
        </button>

        {isModeOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0f172a] border-x border-b border-white/10 rounded-b-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="max-h-80 overflow-y-auto no-scrollbar">
              {DIFFICULTY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`w-full p-5 flex items-start space-x-4 transition-colors text-left group ${selectedModeId === mode.id ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}
                >
                  <div className={`p-2 rounded-xl transition-all ${selectedModeId === mode.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                    {renderModeIcon(mode.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${selectedModeId === mode.id ? 'text-white' : 'text-slate-400'}`}>{mode.name}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${selectedModeId === mode.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        {mode.multiplier}x
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium leading-relaxed mt-1">
                      {mode.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-1.5 opacity-90">
                       <Brain size={10} className="text-indigo-300" />
                       <span className="text-[8px] font-black uppercase text-indigo-200">{mode.objective}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8 px-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <h2 className={`font-black text-white dark:text-white text-slate-900 tracking-tight text-2xl uppercase`}>
              {settings.habitName || "Entrenamiento"}
            </h2>
            <div className={`flex items-center space-x-2`}>
               <div className={`w-2 h-2 rounded-full ${available ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ejecución del día</span>
            </div>
          </div>
          {!available && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Completado
            </div>
          )}
        </div>
        
        {/* If a special mode is selected, only allow 'complete' habit. Disable others. */}
        <div className={`grid grid-cols-3 gap-5`}>
          <HabitButton 
            type="emergency" 
            onClick={() => handleHabitClick('emergency')} 
            disabled={!available || selectedModeId !== 'normal'} 
            customLabel={settings.emergencyHabit}
          />
          <HabitButton 
            type="twoMinutes" 
            onClick={() => handleHabitClick('twoMinutes')} 
            disabled={!available || selectedModeId !== 'normal'} 
            customLabel={settings.twoMinuteHabit}
          />
          <HabitButton 
            type="complete" 
            onClick={() => handleHabitClick('complete')} 
            disabled={!available} 
            customLabel={settings.completeHabit}
          />
        </div>

        {selectedModeId !== 'normal' && available && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-center">
              ⚠️ Los modificadores de dificultad requieren completar el hábito total.
            </p>
          </div>
        )}

        {!available && (
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
            <div className="bg-white/5 p-4 rounded-3xl shadow-inner border border-white/5">
              <Star className="text-indigo-400 fill-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]" size={32} />
            </div>
            <div>
              <p className="text-lg font-black text-white mb-1">¡Victoria de {heroTerm}!</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[240px]">
                Has invertido en tu futuro hoy bajo el {selectedMode.name}. El progreso es inevitable.
              </p>
            </div>
          </div>
        )}
      </div>

      <WillpowerModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
};

export default Home;
