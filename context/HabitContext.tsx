
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DailyCheckin, StreakData, RewardSystem, HabitButtonType, Transaction, UserSettings, TreasureReward, DifficultyMode, PastHabit, TaskState, Tip, CicloHistorico, IntervencionRegistrada, RegistroDiarioUmbral, RegistroEventoOportunidad, EstadoEventoOportunidad } from '../types';
import { storageService } from '../services/storageService';
import { INITIAL_REWARDS, DICE_REWARDS, DIFFICULTY_MODES, TASKS_POOL, TIPS_POOL } from '../constants';

interface HabitContextType {
  streak: StreakData;
  checkins: DailyCheckin[];
  rewards: RewardSystem;
  settings: UserSettings;
  diceRewards: TreasureReward[];
  pastHabits: PastHabit[];
  taskState: TaskState;
  tips: Tip[];
  today: string; // Fecha actual reactiva YYYY-MM-DD (GMT-3)
  umbralActual: number;
  ciclosHistoricos: CicloHistorico[];
  intervencionesRegistradas: IntervencionRegistrada[];
  registrosDiarios: RegistroDiarioUmbral[];
  registrosEventos: RegistroEventoOportunidad[];
  addRegistroEvento: (estado: EstadoEventoOportunidad, contexto: string, estadoEmocional?: string, notas?: string) => void;
  addCheckin: (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => boolean;
  addThresholdCheckin: (
    tipo: 'chequeo' | 'ejecución',
    porcentaje: number,
    factores: Record<string, number>,
    isIntervention?: boolean,
    interventionEffectiveness?: 'alta' | 'media' | 'baja',
    interventionNotes?: string,
    espectro?: 'emd' | '2min' | 'complete'
  ) => boolean;
  completeDailyTask: () => void;
  canCheckin: () => boolean;
  hasCheckedInToday: () => boolean;
  redeemReward: (rewardId: string) => boolean;
  addPoints: (amount: number) => void;
  recordDiceRoll: (result: number) => void;
  updateSettings: (newSettings: UserSettings) => void;
  updateDiceReward: (id: number, title: string, description: string) => void;
  toggleFavoriteTip: (id: number) => void;
  requestNotificationPermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
  sendTestNotification: () => void;
  resetProgress: () => void;
  startNewHabit: () => void;
  deletePastHabit: (id: string) => void;
  resumePastHabit: (id: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Función de fecha optimizada para GMT-3 (Argentina)
const getTodayString = () => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const dateStr = formatter.format(now);
    return dateStr;
  } catch (e) {
    // Fallback robusto para Argentina (GMT-3) si Intl falla
    const now = new Date();
    const offset = -3; // Argentina es UTC-3
    // Restamos 3 horas al tiempo UTC para aproximar la fecha de Argentina
    const argentinaDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
    return argentinaDate.toISOString().split('T')[0];
  }
};

// Función para obtener la fecha de ayer de forma robusta
const getYesterdayString = (baseDateStr: string) => {
  try {
    const d = new Date(baseDateStr + 'T12:00:00Z'); // Usar UTC para aritmética pura
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
  } catch (e) {
    // Fallback
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
};

// Calcular diferencia de días de forma robusta
const getDiffDays = (date1: string, date2: string) => {
  try {
    const d1 = new Date(date1 + 'T12:00:00Z');
    const d2 = new Date(date2 + 'T12:00:00Z');
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

// Obtener el día de la semana (0: Domingo, 1: Lunes, etc.) de forma robusta
const getWeekDayOfDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr + 'T12:00:00-03:00');
    return d.getDay();
  } catch (e) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.getDay();
  }
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [today, setToday] = useState(getTodayString());
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() => storageService.getCheckins());
  const [streak, setStreak] = useState<StreakData>(() => storageService.getStreak());
  const [rewards, setRewards] = useState<RewardSystem>(() => {
    const stored = storageService.getRewardSystem();
    if (!stored.rewardsCatalog || stored.rewardsCatalog.length === 0) stored.rewardsCatalog = INITIAL_REWARDS;
    return stored;
  });
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [diceRewards, setDiceRewards] = useState<TreasureReward[]>(() => {
    const stored = storageService.getDiceRewards();
    return stored.length > 0 ? stored : DICE_REWARDS;
  });
  const [pastHabits, setPastHabits] = useState<PastHabit[]>(() => storageService.getPastHabits());
  const [taskState, setTaskState] = useState<TaskState>(() => {
    const saved = storageService.getTaskState();
    const currentToday = getTodayString();
    
    // Si no hay fecha o es distinta, el useEffect se encargará de la renovación
    // Solo reseteamos isCompleted si es un nuevo día para evitar flashes visuales
    if (saved.lastAssignedDate !== currentToday) {
      return { ...saved, isCompleted: false };
    }
    return saved;
  });
  const [tips, setTips] = useState<Tip[]>(() => {
    const stored = storageService.getTips();
    return stored.length > 0 ? stored : TIPS_POOL;
  });

  const [umbralActual, setUmbralActual] = useState<number>(() => storageService.getUmbralActual());
  const [ciclosHistoricos, setCiclosHistoricos] = useState<CicloHistorico[]>(() => {
    return storageService.getCiclosHistoricos();
  });
  const [intervencionesRegistradas, setIntervencionesRegistradas] = useState<IntervencionRegistrada[]>(() => storageService.getIntervenciones());
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiarioUmbral[]>(() => {
    return storageService.getRegistrosDiarios();
  });
  const [registrosEventos, setRegistrosEventos] = useState<RegistroEventoOportunidad[]>(() => {
    return storageService.getRegistrosEventos();
  });
  
  const isResetting = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lógica de Integridad de Racha (Protector de Racha)
  const verifyStreakIntegrity = useCallback((currentToday: string) => {
    // Si no hay historial, no hay nada que verificar
    if (streak.streakHistory.length === 0) return;

    // Asegurar que el historial esté ordenado y sin duplicados
    const sortedHistory = Array.from(new Set(streak.streakHistory)).sort();
    const lastCheckinDate = sortedHistory[sortedHistory.length - 1];
    
    // Si ya se registró hoy o la fecha es futura (error de reloj), no hacer nada
    if (lastCheckinDate >= currentToday) return;

    const yesterday = getYesterdayString(currentToday);
    
    // Si el último check-in fue ayer, la racha sigue viva (esperando el de hoy)
    if (lastCheckinDate === yesterday) return;

    // Si llegamos aquí, hay un hueco de al menos 1 día (el de ayer se perdió)
    const diffDays = getDiffDays(lastCheckinDate, currentToday);
    
    // Si por alguna razón el cálculo de días da 1 o menos, abortar (doble seguridad)
    if (diffDays <= 1) return;

    const userActiveDays = settings.activeDays || [0, 1, 2, 3, 4, 5, 6];
    let protectorsAvailable = rewards.streakProtectors;
    let recoveredCount = 0;
    let hasBreach = false;
    let newCheckins: DailyCheckin[] = [];
    let newStreakHistory: string[] = [];

    // Intentar llenar los huecos con protectores sólo para los días que el usuario indicó compromiso
    // i=1 es ayer, i=2 es anteayer, etc.
    for (let i = 1; i < diffDays; i++) {
      const tempDate = new Date(currentToday + 'T12:00:00Z');
      tempDate.setUTCDate(tempDate.getUTCDate() - i);
      const dateStr = tempDate.toISOString().split('T')[0];

      // Si este día no está en el historial
      if (!sortedHistory.includes(dateStr)) {
        const weekday = getWeekDayOfDate(dateStr);
        const isCommittedDay = userActiveDays.includes(weekday);

        if (isCommittedDay) {
          // Es un día comprometido, requiere protector
          if (protectorsAvailable > 0) {
            newCheckins.push({
              date: dateStr,
              buttonType: 'complete',
              difficultyModeId: 'normal',
              willpowerScore: 5,
              notes: 'Protector de racha activado automáticamente',
              timestamp: new Date().toISOString()
            });
            newStreakHistory.push(dateStr);
            protectorsAvailable--;
            recoveredCount++;
          } else {
            // Se acabaron los protectores en un día comprometido, hay ruptura
            hasBreach = true;
            break;
          }
        }
        // Si no es un día comprometido, se salta de forma gratuita sin romper racha
      }
    }

    if (hasBreach) {
      console.log(`[Streak] Racha perdida. Día comprometido sin protector y sin check-in hasta ${lastCheckinDate}`);
      setStreak(prev => ({
        ...prev,
        currentStreak: 0,
        streakHistory: [] 
      }));
    } else if (recoveredCount > 0) {
      console.log(`[Streak] Recuperados ${recoveredCount} días comprometidos con protectores. Nueva racha: ${streak.currentStreak + recoveredCount}`);
      setCheckins(prev => [...prev, ...newCheckins]);
      setRewards(prev => ({ ...prev, streakProtectors: protectorsAvailable }));
      setStreak(prev => ({
        ...prev,
        currentStreak: prev.currentStreak + recoveredCount,
        longestStreak: Math.max(prev.longestStreak, prev.currentStreak + recoveredCount),
        streakHistory: [...prev.streakHistory, ...newStreakHistory].sort()
      }));
    } else {
      console.log(`[Streak] Ninguna brecha en días comprometidos. La racha continúa intacta: ${streak.currentStreak}`);
    }
  }, [streak.streakHistory, streak.currentStreak, rewards.streakProtectors, settings.activeDays]);

  const verifyStreakIntegrityRef = useRef(verifyStreakIntegrity);
  verifyStreakIntegrityRef.current = verifyStreakIntegrity;

  // Verificar racha al iniciar y cuando cambia el día
  useEffect(() => {
    verifyStreakIntegrityRef.current(today);
  }, [today]);

  useEffect(() => {
    const checkDate = () => {
      const newToday = getTodayString();
      if (newToday !== today) {
        setToday(newToday);
        setTaskState(prev => ({ ...prev, isCompleted: false }));
        verifyStreakIntegrityRef.current(newToday);
      }
    };

    const interval = setInterval(checkDate, 30000);
    window.addEventListener('focus', checkDate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkDate();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDate);
    };
  }, [today]);

  // Manejo de Tareas Diarias con "Shuffle Bag" robusto
  useEffect(() => {
    if (isResetting.current) return;
    
    // Solo renovar si la fecha guardada es distinta a hoy o no hay tarea
    if (taskState.lastAssignedDate !== today || !taskState.currentTaskId) {
      setTaskState(prev => {
        // Verificación de seguridad dentro del setter para evitar duplicados por re-renders
        if (prev.lastAssignedDate === today && prev.currentTaskId) return prev;

        let availableTasks = TASKS_POOL.filter(t => !prev.history.includes(t.id));
        let randomTask;
        let newHistory;
        
        if (availableTasks.length === 0) {
          const lastTaskId = prev.currentTaskId;
          availableTasks = TASKS_POOL.filter(t => t.id !== lastTaskId);
          const pool = availableTasks.length > 0 ? availableTasks : TASKS_POOL;
          randomTask = pool[Math.floor(Math.random() * pool.length)];
          newHistory = [randomTask.id];
        } else {
          randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
          newHistory = [...prev.history, randomTask.id];
        }

        return {
          ...prev,
          currentTaskId: randomTask.id,
          lastAssignedDate: today,
          isCompleted: false,
          history: newHistory
        };
      });
    }
  }, [today, taskState.lastAssignedDate, taskState.currentTaskId]);

  useEffect(() => {
    if (isResetting.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      storageService.saveCheckins(checkins);
      storageService.saveStreak(streak);
      storageService.saveRewardSystem(rewards);
      storageService.saveDiceRewards(diceRewards);
      storageService.savePastHabits(pastHabits);
      storageService.saveTaskState(taskState);
      storageService.saveTips(tips);
      storageService.saveSettings(settings);
      storageService.saveUmbralActual(umbralActual);
      storageService.saveCiclosHistoricos(ciclosHistoricos);
      storageService.saveIntervenciones(intervencionesRegistradas);
      storageService.saveRegistrosDiarios(registrosDiarios);
      storageService.saveRegistrosEventos(registrosEventos);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [checkins, streak, rewards, diceRewards, pastHabits, taskState, tips, settings, umbralActual, ciclosHistoricos, intervencionesRegistradas, registrosDiarios, registrosEventos]);

  const hasCheckedInToday = useCallback(() => {
    return checkins.some(c => c.date === today);
  }, [checkins, today]);

  const canCheckin = useCallback(() => !hasCheckedInToday(), [hasCheckedInToday]);

  const addCheckin = (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => {
    if (!canCheckin()) return false;
    
    const newCheckin: DailyCheckin = {
      date: today,
      buttonType: type,
      difficultyModeId: modeId,
      willpowerScore: willpower,
      notes,
      timestamp: new Date().toISOString()
    };
    
    setCheckins(prev => [...prev, newCheckin]);
    setStreak(prev => {
      const sortedHistory = Array.from(new Set(prev.streakHistory)).sort();
      const lastCheckinDate = sortedHistory[sortedHistory.length - 1];
      const yesterday = getYesterdayString(today);
      
      // Si ya existe un check-in hoy, no incrementar la racha de nuevo (protección)
      if (lastCheckinDate === today) {
        console.log(`[Streak] Intento de check-in duplicado para ${today}. Ignorado.`);
        return prev;
      }

      let isContinuous = !lastCheckinDate;
      if (lastCheckinDate) {
        if (lastCheckinDate === yesterday) {
          isContinuous = true;
        } else {
          const diffDays = getDiffDays(lastCheckinDate, today);
          if (diffDays <= 1) {
            isContinuous = true;
          } else {
            // Evaluamos si en el hueco hay algún día comprometido que no esté registrado en el historial
            let hasUncoveredCommittedDay = false;
            const userActiveDays = settings.activeDays || [0, 1, 2, 3, 4, 5, 6];
            
            for (let i = 1; i < diffDays; i++) {
              const tempDate = new Date(today + 'T12:00:00Z');
              tempDate.setUTCDate(tempDate.getUTCDate() - i);
              const dateStr = tempDate.toISOString().split('T')[0];
              
              if (!sortedHistory.includes(dateStr)) {
                const weekday = getWeekDayOfDate(dateStr);
                if (userActiveDays.includes(weekday)) {
                  hasUncoveredCommittedDay = true;
                  break;
                }
              }
            }
            isContinuous = !hasUncoveredCommittedDay;
          }
        }
      }

      const newStreakCount = isContinuous ? prev.currentStreak + 1 : 1;
      
      console.log(`[Streak] Check-in registrado. Hoy: ${today}, Ayer: ${yesterday}, Último: ${lastCheckinDate}, Continuo: ${isContinuous}, Nueva Racha: ${newStreakCount}`);

      return {
        ...prev,
        currentStreak: newStreakCount,
        longestStreak: Math.max(prev.longestStreak, newStreakCount),
        totalCompletions: prev.totalCompletions + 1,
        streakHistory: [...prev.streakHistory, today].sort()
      };
    });

    const mode = DIFFICULTY_MODES.find(m => m.id === modeId) || DIFFICULTY_MODES[0];
    const points = Math.round(10 * mode.multiplier);
    setRewards(prev => ({ 
      ...prev, 
      availablePoints: prev.availablePoints + points,
      earnedToday: points 
    }));

    return true;
  };

  const addThresholdCheckin = (
    tipo: 'chequeo' | 'ejecución',
    porcentaje: number,
    factores: Record<string, number>,
    isIntervention?: boolean,
    interventionEffectiveness?: 'alta' | 'media' | 'baja',
    interventionNotes?: string,
    espectro?: 'emd' | '2min' | 'complete'
  ) => {
    const currentToday = getTodayString();

    // 1. Si califica para racha diaria, registrar check-in estándar
    if (canCheckin()) {
      let mappedButtonType: 'emergency' | 'twoMinutes' | 'complete' = 'complete';
      if (tipo === 'ejecución' && espectro) {
        if (espectro === 'emd') mappedButtonType = 'emergency';
        else if (espectro === '2min') mappedButtonType = 'twoMinutes';
      }
      addCheckin(mappedButtonType, 5, 'normal', `Registro de Umbral: ${tipo === 'chequeo' ? 'Chequeo' : 'Ejecución'} al ${porcentaje}%`);
    } else {
      const hasExecutionToday = registrosDiarios.some(r => r.date === currentToday && r.tipo === 'ejecución');
      if (tipo === 'ejecución' && !hasExecutionToday) {
        addPoints(5); // Recompensa adicional por ejecutar
      }
    }

    // 2. Agregar registro diario
    const nuevoRegistro: RegistroDiarioUmbral = {
      date: currentToday,
      tipo,
      porcentaje,
      timestamp: new Date().toISOString(),
      factores,
      rate: porcentaje - umbralActual > 0 ? porcentaje - umbralActual : 0,
      intervencion: isIntervention,
      espectro
    };

    setRegistrosDiarios(prev => {
      const filtered = prev.filter(r => r.date !== currentToday);
      return [...filtered, nuevoRegistro];
    });

    // 3. Actualizar porcentaje de umbral
    setUmbralActual(porcentaje);

    // 4. Si se alcanza el 100%, reiniciar ciclo e incrementar en historial de ciclos
    if (porcentaje >= 100) {
      let daysCount = 7;
      if (ciclosHistoricos.length > 0) {
        const lastDisparado = ciclosHistoricos[ciclosHistoricos.length - 1].fechaDisparo;
        daysCount = getDiffDays(lastDisparado, currentToday);
      } else if (registrosDiarios.length > 0) {
        const firstReg = registrosDiarios[0].date;
        daysCount = getDiffDays(firstReg, currentToday);
      }
      if (daysCount <= 0) daysCount = 1;

      const nuevoCiclo: CicloHistorico = {
        ciclo: ciclosHistoricos.length + 1,
        dias: daysCount,
        fechaDisparo: currentToday,
        interrumpido: false,
        factores
      };
      setCiclosHistoricos(prev => [...prev, nuevoCiclo]);
      setUmbralActual(0);
    }

    // 5. Registrar intervención si corresponde
    if (isIntervention) {
      const nuevaIntervencion: IntervencionRegistrada = {
        timestamp: new Date().toISOString(),
        momentPercent: porcentaje,
        tipo: 'Medida Preventiva',
        efectividad: interventionEffectiveness || 'media',
        nota: interventionNotes
      };
      setIntervencionesRegistradas(prev => [...prev, nuevaIntervencion]);

      if (interventionEffectiveness === 'alta') {
        const lastDateStr = ciclosHistoricos.length > 0 ? ciclosHistoricos[ciclosHistoricos.length - 1].fechaDisparo : currentToday;
        const daysCount = Math.max(1, getDiffDays(lastDateStr, currentToday));

        const nuevoCiclo: CicloHistorico = {
          ciclo: ciclosHistoricos.length + 1,
          dias: daysCount,
          fechaDisparo: currentToday,
          interrumpido: true,
          factores
        };
        setCiclosHistoricos(prev => [...prev, nuevoCiclo]);
        setUmbralActual(0);
      } else if (interventionEffectiveness === 'media') {
        setUmbralActual(prev => Math.max(0, prev - 20));
      }
    }

    return true;
  };

  const addRegistroEvento = (estado: EstadoEventoOportunidad, contexto: string, estadoEmocional?: string, notas?: string) => {
    const currentToday = getTodayString();
    const newEvento: RegistroEventoOportunidad = {
      id: `opportunity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: currentToday,
      timestamp: new Date().toISOString(),
      estado,
      contexto,
      estadoEmocional,
      notas
    };

    const alreadyRegisteredToday = registrosEventos.some(e => e.date === currentToday);

    setRegistrosEventos(prev => [...prev, newEvento]);

    let points = 0;
    if (!alreadyRegisteredToday) {
      points = 10;
    }

    setRewards(prev => ({
      ...prev,
      availablePoints: prev.availablePoints + points,
      earnedToday: prev.earnedToday + points
    }));

    if (!alreadyRegisteredToday && (estado === 'ejecutada' || estado === 'automatico')) {
      if (canCheckin()) {
        addCheckin('complete', 5, 'normal', `Oportunidad: ${contexto}`);
      }
    }
  };

  const completeDailyTask = () => {
    if (taskState.isCompleted) return;
    setTaskState(prev => ({ ...prev, isCompleted: true }));
    setRewards(prev => ({ ...prev, availablePoints: prev.availablePoints + 5 }));
  };

  const addPoints = (amount: number) => setRewards(prev => ({ ...prev, availablePoints: prev.availablePoints + amount }));
  const recordDiceRoll = (result: number) => setRewards(prev => ({ ...prev, lastDiceRollDate: today, lastDiceResult: result }));
  const updateSettings = (newSettings: UserSettings) => {
    const oldCtxs = settings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social'];
    const newCtxs = newSettings.opportunityTags ?? ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social'];

    const oldEmos = settings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral'];
    const newEmos = newSettings.emotionalTags ?? ['Calmado', 'Ansioso', 'Cansado', 'Neutral'];

    setSettings(newSettings);

    if (registrosEventos && registrosEventos.length > 0) {
      let changed = false;
      const updatedRecords = registrosEventos.map(e => {
        let newCtx = e.contexto;
        let newEmo = e.estadoEmocional;

        // Context Translation
        if (oldCtxs.length === newCtxs.length) {
          const idx = oldCtxs.indexOf(e.contexto);
          if (idx !== -1 && newCtxs[idx] !== e.contexto) {
            newCtx = newCtxs[idx];
            changed = true;
          }
        } else {
          if (!newCtxs.includes(e.contexto)) {
            newCtx = newCtxs[0] || 'General';
            changed = true;
          }
        }

        // Emotion Translation
        if (e.estadoEmocional) {
          if (oldEmos.length === newEmos.length) {
            const idx = oldEmos.indexOf(e.estadoEmocional);
            if (idx !== -1 && newEmos[idx] !== e.estadoEmocional) {
              newEmo = newEmos[idx];
              changed = true;
            }
          } else {
            if (!newEmos.includes(e.estadoEmocional)) {
              newEmo = newEmos[0] || 'Neutral';
              changed = true;
            }
          }
        }

        if (newCtx !== e.contexto || newEmo !== e.estadoEmocional) {
          return {
            ...e,
            contexto: newCtx,
            estadoEmocional: newEmo
          };
        }
        return e;
      });

      if (changed) {
        setRegistrosEventos(updatedRecords);
      }
    }
  };
  const updateDiceReward = (id: number, title: string, description: string) => 
    setDiceRewards(prev => prev.map(r => r.id === id ? { ...r, title, description } : r));
  const toggleFavoriteTip = (id: number) => 
    setTips(prev => prev.map(tip => tip.id === id ? { ...tip, isFavorite: !tip.isFavorite } : tip));

  const redeemReward = (rewardId: string) => {
    const reward = rewards.rewardsCatalog.find(r => r.id === rewardId);
    if (!reward || rewards.availablePoints < reward.cost) return false;

    setRewards(prev => {
      const nextPoints = prev.availablePoints - reward.cost;
      const nextHistory = [
        { id: Math.random().toString(36).substr(2, 9), rewardId, date: new Date().toISOString(), pointsSpent: reward.cost },
        ...prev.purchaseHistory
      ];
      
      let nextProtectors = prev.streakProtectors;
      if (rewardId === 'reward_2') {
        nextProtectors += 1;
      }

      return {
        ...prev,
        availablePoints: nextPoints,
        purchaseHistory: nextHistory,
        streakProtectors: nextProtectors
      };
    });
    return true;
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  };

  const requestStoragePermission = async () => true;
  const sendTestNotification = () => {};
  
  const resetProgress = () => {
    isResetting.current = true;
    setRegistrosEventos([]);
    localStorage.clear();
    window.location.reload();
  };

  const deletePastHabit = (id: string) => {
    setPastHabits(prev => prev.filter(h => h.id !== id));
  };

  const startNewHabit = () => {
    // Rank calculation
    let currentRankName = 'NV 1 - Prometeo';
    if (streak.currentStreak >= 32) currentRankName = settings.gender === 'male' ? 'NV 4 - Hércules Semi-Dios' : 'NV 4 - Hércules Semi-Diosa';
    else if (streak.currentStreak >= 17) currentRankName = 'NV 3 - Aquiles';
    else if (streak.currentStreak >= 7) currentRankName = 'NV 2 - Jasón';

    // Capture 30-day history for archive
    const daysToLookBack = 30;
    const todayDate = new Date(today + 'T12:00:00');
    const historyData = [];
    let sum = 0;
    let count = 0;

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checkin = checkins.find(c => c.date === dateStr);
      const willpower = checkin ? checkin.willpowerScore : 0;
      
      historyData.push({
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        willpower: willpower
      });
      if (willpower > 0) {
        sum += willpower;
        count++;
      }
    }

    const archiveEntry: PastHabit = {
      id: Math.random().toString(36).substr(2, 9),
      name: settings.habitName || "Entrenamiento Anterior",
      sessions: checkins.length,
      maxStreak: streak.longestStreak,
      rankReached: currentRankName,
      date: new Date().toISOString(),
      willpowerHistory: historyData,
      avgWillpower: count > 0 ? (sum / count).toFixed(1) : "0.0",
      checkinsSnapshot: [...checkins],
      habitLoop: settings.habitLoop,
      streakSnapshot: { ...streak },
      settingsSnapshot: {
        habitName: settings.habitName || "",
        emergencyHabit: settings.emergencyHabit || "EMD",
        twoMinuteHabit: settings.twoMinuteHabit || "2 minutos",
        completeHabit: settings.completeHabit || "Hábito Completo",
        habitLoop: { ...settings.habitLoop },
        activeDays: settings.activeDays || [0, 1, 2, 3, 4, 5, 6]
      }
    };
    
    setPastHabits(prev => [archiveEntry, ...prev]);
    setCheckins([]);
    setStreak(prev => ({
      ...prev,
      currentStreak: 0,
      longestStreak: 0, // Reset longest for the new habit mission
      streakHistory: [],
      totalCompletions: 0
    }));
    
    setTaskState(prev => ({
      ...prev,
      isCompleted: false,
      currentTaskId: null,
      history: []
    }));

    setUmbralActual(0);
    setCiclosHistoricos([]);
    setIntervencionesRegistradas([]);
    setRegistrosDiarios([]);
    setRegistrosEventos([]);
  };

  const resumePastHabit = (id: string) => {
    // 1. Find the archived habit
    const targetHabit = pastHabits.find(h => h.id === id);
    if (!targetHabit) return;

    // 2. Archive current active habit first
    let currentRankName = 'NV 1 - Prometeo';
    if (streak.currentStreak >= 32) currentRankName = settings.gender === 'male' ? 'NV 4 - Hércules Semi-Dios' : 'NV 4 - Hércules Semi-Diosa';
    else if (streak.currentStreak >= 17) currentRankName = 'NV 3 - Aquiles';
    else if (streak.currentStreak >= 7) currentRankName = 'NV 2 - Jasón';

    const daysToLookBack = 30;
    const todayDate = new Date(today + 'T12:00:00');
    const historyData = [];
    let sum = 0;
    let count = 0;

    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checkin = checkins.find(c => c.date === dateStr);
      const willpower = checkin ? checkin.willpowerScore : 0;
      
      historyData.push({
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        willpower: willpower
      });
      if (willpower > 0) {
        sum += willpower;
        count++;
      }
    }

    const currentArchiveEntry: PastHabit = {
      id: Math.random().toString(36).substr(2, 9),
      name: settings.habitName || "Entrenamiento Anterior",
      sessions: checkins.length,
      maxStreak: streak.longestStreak,
      rankReached: currentRankName,
      date: new Date().toISOString(),
      willpowerHistory: historyData,
      avgWillpower: count > 0 ? (sum / count).toFixed(1) : "0.0",
      checkinsSnapshot: [...checkins],
      habitLoop: settings.habitLoop,
      streakSnapshot: { ...streak },
      settingsSnapshot: {
        habitName: settings.habitName || "",
        emergencyHabit: settings.emergencyHabit || "EMD",
        twoMinuteHabit: settings.twoMinuteHabit || "2 minutos",
        completeHabit: settings.completeHabit || "Hábito Completo",
        habitLoop: { ...settings.habitLoop },
        activeDays: settings.activeDays || [0, 1, 2, 3, 4, 5, 6]
      }
    };

    // 3. Swap the histories: delete target habit from history, and append current habit to history
    setPastHabits(prev => {
      const filtered = prev.filter(h => h.id !== id);
      return [currentArchiveEntry, ...filtered];
    });

    // 4. Restore the selected habit's snapshots to active state
    // Checkins
    setCheckins(targetHabit.checkinsSnapshot || []);

    // Streak
    if (targetHabit.streakSnapshot) {
      setStreak(targetHabit.streakSnapshot);
    } else {
      setStreak({
        currentStreak: 0,
        longestStreak: targetHabit.maxStreak,
        totalCompletions: targetHabit.sessions,
        streakHistory: targetHabit.checkinsSnapshot ? targetHabit.checkinsSnapshot.map(c => c.date) : []
      });
    }

    // Settings
    if (targetHabit.settingsSnapshot) {
      setSettings(prev => ({
        ...prev,
        habitName: targetHabit.settingsSnapshot!.habitName,
        emergencyHabit: targetHabit.settingsSnapshot!.emergencyHabit,
        twoMinuteHabit: targetHabit.settingsSnapshot!.twoMinuteHabit,
        completeHabit: targetHabit.settingsSnapshot!.completeHabit,
        habitLoop: targetHabit.settingsSnapshot!.habitLoop,
        activeDays: targetHabit.settingsSnapshot!.activeDays
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        habitName: targetHabit.name,
        emergencyHabit: 'EMD',
        twoMinuteHabit: '2 minutos',
        completeHabit: 'Hábito Completo',
        habitLoop: targetHabit.habitLoop || { cue: 'Señal', craving: 'Anhelo', response: 'Respuesta', reward: 'Recompensa' },
        activeDays: [0, 1, 2, 3, 4, 5, 6]
      }));
    }

    // Reset daily task status for fresh habits
    setTaskState(prev => ({
      ...prev,
      isCompleted: false,
      currentTaskId: null,
      history: []
    }));

    setUmbralActual(0);
    setCiclosHistoricos([]);
    setIntervencionesRegistradas([]);
    setRegistrosDiarios([]);
    setRegistrosEventos([]);
  };

  return (
    <HabitContext.Provider value={{ 
      streak, checkins, rewards, settings, diceRewards, pastHabits, taskState, tips, today,
      umbralActual, ciclosHistoricos, intervencionesRegistradas, registrosDiarios,
      registrosEventos, addRegistroEvento,
      addCheckin, addThresholdCheckin, canCheckin, hasCheckedInToday, redeemReward, completeDailyTask,
      addPoints, recordDiceRoll, updateSettings, updateDiceReward, toggleFavoriteTip,
      requestNotificationPermission, requestStoragePermission, sendTestNotification, resetProgress, startNewHabit, deletePastHabit,
      resumePastHabit
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};
