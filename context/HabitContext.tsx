
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DailyCheckin, StreakData, RewardSystem, HabitButtonType, Transaction, UserSettings, TreasureReward, DifficultyMode, PastHabit, TaskState, Tip } from '../types';
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
  addCheckin: (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => boolean;
  completeDailyTask: () => void;
  canCheckin: () => boolean;
  hasCheckedInToday: () => boolean;
  redeemReward: (rewardId: string) => boolean;
  addPoints: (amount: number) => void;
  recordDiceRoll: () => void;
  updateSettings: (newSettings: UserSettings) => void;
  updateDiceReward: (id: number, title: string, description: string) => void;
  toggleFavoriteTip: (id: number) => void;
  requestNotificationPermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
  sendTestNotification: () => void;
  resetProgress: () => void;
  startNewHabit: () => void;
  deletePastHabit: (id: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Función de fecha optimizada para GMT-3
const getTodayString = () => {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

// Función para obtener la fecha de ayer
const getYesterdayString = (baseDateStr: string) => {
  const d = new Date(baseDateStr + 'T12:00:00'); // Usar mediodía para evitar problemas de DST
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
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
  const [taskState, setTaskState] = useState<TaskState>(() => storageService.getTaskState());
  const [tips, setTips] = useState<Tip[]>(() => {
    const stored = storageService.getTips();
    return stored.length > 0 ? stored : TIPS_POOL;
  });
  
  const isResetting = useRef(false);

  // Lógica de Integridad de Racha (Protector de Racha)
  const verifyStreakIntegrity = useCallback((currentToday: string) => {
    if (checkins.length === 0) return;

    const lastCheckinDate = streak.streakHistory[streak.streakHistory.length - 1];
    if (!lastCheckinDate || lastCheckinDate === currentToday) return;

    const yesterday = getYesterdayString(currentToday);
    
    if (lastCheckinDate !== yesterday) {
      const lastDate = new Date(lastCheckinDate + 'T12:00:00');
      const nowDate = new Date(currentToday + 'T12:00:00');
      const diffDays = Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        let protectorsAvailable = rewards.streakProtectors;
        let recoveredCount = 0;
        let newCheckins: DailyCheckin[] = [];
        let newStreakHistory: string[] = [];

        let tempDate = new Date(lastDate);
        tempDate.setDate(tempDate.getDate() + 1);
        
        while (tempDate < nowDate && protectorsAvailable > 0) {
          const dateStr = tempDate.toISOString().split('T')[0];
          if (!streak.streakHistory.includes(dateStr)) {
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
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }

        if (recoveredCount > 0) {
          setCheckins(prev => [...prev, ...newCheckins]);
          setRewards(prev => ({ ...prev, streakProtectors: protectorsAvailable }));
          setStreak(prev => ({
            ...prev,
            currentStreak: prev.currentStreak + recoveredCount,
            longestStreak: Math.max(prev.longestStreak, prev.currentStreak + recoveredCount),
            streakHistory: [...prev.streakHistory, ...newStreakHistory].sort()
          }));
        } else {
          setStreak(prev => ({
            ...prev,
            currentStreak: 0,
            streakHistory: []
          }));
        }
      }
    }
  }, [checkins, streak, rewards.streakProtectors]);

  useEffect(() => {
    verifyStreakIntegrity(today);
  }, []);

  useEffect(() => {
    const checkDate = () => {
      const newToday = getTodayString();
      if (newToday !== today) {
        setToday(newToday);
        setTaskState(prev => ({ ...prev, isCompleted: false }));
        verifyStreakIntegrity(newToday);
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
  }, [today, verifyStreakIntegrity]);

  // Manejo de Tareas Diarias con "Shuffle Bag" robusto
  useEffect(() => {
    if (isResetting.current) return;
    
    if (taskState.lastAssignedDate !== today || !taskState.currentTaskId) {
      let availableTasks = TASKS_POOL.filter(t => !taskState.history.includes(t.id));
      
      if (availableTasks.length === 0) {
        const lastTaskId = taskState.currentTaskId;
        availableTasks = TASKS_POOL.filter(t => t.id !== lastTaskId);
        const pool = availableTasks.length > 0 ? availableTasks : TASKS_POOL;
        const randomTask = pool[Math.floor(Math.random() * pool.length)];
        
        setTaskState(prev => ({
          ...prev,
          currentTaskId: randomTask.id,
          lastAssignedDate: today,
          isCompleted: false,
          history: [randomTask.id]
        }));
      } else {
        const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        
        setTaskState(prev => ({
          ...prev,
          currentTaskId: randomTask.id,
          lastAssignedDate: today,
          isCompleted: false,
          history: [...prev.history, randomTask.id]
        }));
      }
    }
  }, [today]);

  useEffect(() => {
    if (isResetting.current) return;
    storageService.saveCheckins(checkins);
    storageService.saveStreak(streak);
    storageService.saveRewardSystem(rewards);
    storageService.saveDiceRewards(diceRewards);
    storageService.savePastHabits(pastHabits);
    storageService.saveTaskState(taskState);
    storageService.saveTips(tips);
    storageService.saveSettings(settings);
  }, [checkins, streak, rewards, diceRewards, pastHabits, taskState, tips, settings]);

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
      const lastCheckinDate = prev.streakHistory[prev.streakHistory.length - 1];
      const yesterday = getYesterdayString(today);
      const isContinuous = !lastCheckinDate || lastCheckinDate === yesterday;
      const newStreakCount = isContinuous ? prev.currentStreak + 1 : 1;
      
      return {
        ...prev,
        currentStreak: newStreakCount,
        longestStreak: Math.max(prev.longestStreak, newStreakCount),
        totalCompletions: prev.totalCompletions + 1,
        streakHistory: [...prev.streakHistory, today]
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

  const completeDailyTask = () => {
    setTaskState(prev => ({ ...prev, isCompleted: true }));
    setRewards(prev => ({ ...prev, availablePoints: prev.availablePoints + 5 }));
  };

  const addPoints = (amount: number) => setRewards(prev => ({ ...prev, availablePoints: prev.availablePoints + amount }));
  const recordDiceRoll = () => setRewards(prev => ({ ...prev, lastDiceRollDate: today }));
  const updateSettings = (newSettings: UserSettings) => setSettings(newSettings);
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
    localStorage.clear();
    window.location.reload();
  };

  const deletePastHabit = (id: string) => {
    setPastHabits(prev => prev.filter(h => h.id !== id));
  };

  const startNewHabit = () => {
    // Rank calculation
    let currentRankName = 'NV 1 - Perseo';
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
      checkinsSnapshot: [...checkins]
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
  };

  return (
    <HabitContext.Provider value={{ 
      streak, checkins, rewards, settings, diceRewards, pastHabits, taskState, tips, today,
      addCheckin, canCheckin, hasCheckedInToday, redeemReward, completeDailyTask,
      addPoints, recordDiceRoll, updateSettings, updateDiceReward, toggleFavoriteTip,
      requestNotificationPermission, requestStoragePermission, sendTestNotification, resetProgress, startNewHabit, deletePastHabit
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
