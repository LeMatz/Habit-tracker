
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DailyCheckin, StreakData, RewardSystem, HabitButtonType, Transaction, UserSettings, TreasureReward, DifficultyMode, PastHabit } from '../types';
import { storageService } from '../services/storageService';
import { INITIAL_REWARDS, DICE_REWARDS, DIFFICULTY_MODES } from '../constants';

interface HabitContextType {
  streak: StreakData;
  checkins: DailyCheckin[];
  rewards: RewardSystem;
  settings: UserSettings;
  diceRewards: TreasureReward[];
  pastHabits: PastHabit[];
  addCheckin: (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => boolean;
  canCheckin: () => boolean;
  hasCheckedInToday: () => boolean;
  redeemReward: (rewardId: string) => boolean;
  addPoints: (amount: number) => void;
  recordDiceRoll: () => void;
  updateSettings: (newSettings: UserSettings) => void;
  updateDiceReward: (id: number, title: string, description: string) => void;
  requestNotificationPermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
  sendTestNotification: () => void;
  resetProgress: () => void;
  startNewHabit: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- AUTOMATIC LOADING FROM LOCALSTORAGE ---
  // Initializes state using the storageService loaders (cargarDatos)
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() => storageService.getCheckins());
  const [streak, setStreak] = useState<StreakData>(() => storageService.getStreak());
  const [rewards, setRewards] = useState<RewardSystem>(() => {
    const stored = storageService.getRewardSystem();
    if (stored.rewardsCatalog.length === 0) stored.rewardsCatalog = INITIAL_REWARDS;
    if (stored.streakProtectors === undefined) stored.streakProtectors = 0;
    return stored;
  });
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [diceRewards, setDiceRewards] = useState<TreasureReward[]>(() => {
    const stored = storageService.getDiceRewards();
    return stored.length > 0 ? stored : DICE_REWARDS;
  });
  const [pastHabits, setPastHabits] = useState<PastHabit[]>(() => storageService.getPastHabits());
  
  const isResetting = useRef(false);
  const lastNotificationDate = useRef<string | null>(null);

  // --- INSTANT SAVE LOGIC (guardarDatos) ---
  // These effects fire on every state change, syncing to localStorage instantly.
  useEffect(() => {
    if (!isResetting.current) storageService.saveCheckins(checkins);
  }, [checkins]);

  useEffect(() => {
    if (!isResetting.current) storageService.saveStreak(streak);
  }, [streak]);

  useEffect(() => {
    if (!isResetting.current) storageService.saveRewardSystem(rewards);
  }, [rewards]);

  useEffect(() => {
    if (!isResetting.current) storageService.saveDiceRewards(diceRewards);
  }, [diceRewards]);

  useEffect(() => {
    if (!isResetting.current) storageService.savePastHabits(pastHabits);
  }, [pastHabits]);

  useEffect(() => {
    if (isResetting.current) return;
    storageService.saveSettings(settings);
    
    // UI Adaptation for Netlify environment (browser-level changes)
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (settings.fontSize === 'large') {
      document.documentElement.classList.add('font-large');
    } else {
      document.documentElement.classList.remove('font-large');
    }
  }, [settings]);

  // --- NOTIFICATION SYSTEM ---
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); 
      const today = now.toISOString().split('T')[0];

      if (currentTime === settings.reminderTime && lastNotificationDate.current !== today) {
        if (canCheckin()) {
          new Notification("Sistema SHCE", {
            body: `Es hora de tu hábito: ${settings.habitName}.`,
            icon: "💪"
          });
          lastNotificationDate.current = today;
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [settings.notificationsEnabled, settings.reminderTime, settings.habitName]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSettings({ ...settings, notificationsEnabled: true });
      return true;
    }
    return false;
  };

  const requestStoragePermission = async () => {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        return isPersisted;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Prueba SHCE", { body: "Notificaciones funcionando correctamente." });
    } else {
      alert("Habilita las notificaciones en los ajustes de tu navegador.");
    }
  };

  const resetProgress = () => {
    isResetting.current = true;
    localStorage.clear();
    window.location.reload();
  };

  const startNewHabit = () => {
    const currentSessionsCount = checkins.length;
    const currentHabitMaxStreak = streak.currentStreak;

    const newPastRecord: PastHabit = {
      id: Math.random().toString(36).substr(2, 9),
      name: settings.habitName || "Entrenamiento sin nombre",
      sessions: currentSessionsCount,
      maxStreak: currentHabitMaxStreak,
      date: new Date().toISOString()
    };

    setPastHabits(prev => [newPastRecord, ...prev]);
    setCheckins([]);
    setStreak(prev => ({
      ...prev,
      currentStreak: 0,
      streakHistory: []
    }));
  };

  const hasCheckedInToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return checkins.some(c => c.date === today);
  }, [checkins]);

  const canCheckin = useCallback(() => {
    return !hasCheckedInToday();
  }, [hasCheckedInToday]);

  const addCheckin = (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => {
    if (!canCheckin()) return false;

    const today = new Date().toISOString().split('T')[0];
    const newCheckin: DailyCheckin = {
      date: today,
      buttonType: type,
      difficultyModeId: modeId,
      willpowerScore: willpower,
      notes,
      timestamp: new Date().toISOString()
    };

    let newCurrent = 1;
    let protectorsUsed = 0;

    if (checkins.length > 0) {
      const lastCheckin = checkins[checkins.length - 1];
      const lastDate = new Date(lastCheckin.date);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newCurrent = streak.currentStreak + 1;
      } else if (diffDays > 1) {
        if (rewards.streakProtectors > 0) {
          newCurrent = streak.currentStreak + 1;
          protectorsUsed = 1;
        } else {
          newCurrent = 1;
        }
      }
    }

    setCheckins(prev => [...prev, newCheckin]);

    const newLongest = Math.max(streak.longestStreak, newCurrent);
    setStreak(prev => ({
      currentStreak: newCurrent,
      longestStreak: newLongest,
      totalCompletions: prev.totalCompletions + 1,
      streakHistory: [...prev.streakHistory, today]
    }));

    const mode = DIFFICULTY_MODES.find(m => m.id === modeId) || DIFFICULTY_MODES[0];
    let pointsToAdd = Math.round(10 * mode.multiplier);
    if (newCurrent % 7 === 0) pointsToAdd += 15;

    setRewards(prev => ({
      ...prev,
      availablePoints: prev.availablePoints + pointsToAdd,
      earnedToday: pointsToAdd,
      streakProtectors: prev.streakProtectors - protectorsUsed
    }));

    if (protectorsUsed > 0) {
      alert("¡Protector de Racha utilizado! Tu progreso ha sido salvado.");
    }

    return true;
  };

  const addPoints = (amount: number) => {
    setRewards(prev => ({
      ...prev,
      availablePoints: prev.availablePoints + amount
    }));
  };

  const recordDiceRoll = () => {
    const today = new Date().toISOString().split('T')[0];
    setRewards(prev => ({
      ...prev,
      lastDiceRollDate: today
    }));
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.rewardsCatalog.find(r => r.id === rewardId);
    if (!reward || rewards.availablePoints < reward.cost) return false;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      rewardId,
      date: new Date().toISOString(),
      pointsSpent: reward.cost
    };

    setRewards(prev => {
      let updatedProtectors = prev.streakProtectors;
      if (rewardId === '2') updatedProtectors += 1;

      return {
        ...prev,
        availablePoints: prev.availablePoints - reward.cost,
        purchaseHistory: [transaction, ...prev.purchaseHistory],
        streakProtectors: updatedProtectors
      };
    });

    return true;
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const updateDiceReward = (id: number, title: string, description: string) => {
    setDiceRewards(prev => prev.map(r => r.id === id ? { ...r, title, description } : r));
  };

  return (
    <HabitContext.Provider value={{ 
      streak, checkins, rewards, settings, diceRewards, pastHabits,
      addCheckin, canCheckin, hasCheckedInToday, redeemReward, 
      addPoints, recordDiceRoll, updateSettings, updateDiceReward,
      requestNotificationPermission, requestStoragePermission, sendTestNotification, resetProgress, startNewHabit
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
