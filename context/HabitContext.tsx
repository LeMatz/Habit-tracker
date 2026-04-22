import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { DailyCheckin, StreakData, RewardSystem, HabitButtonType, UserSettings, TreasureReward, PastHabit, TaskState, Tip } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
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
  today: string;
  isHydrated: boolean;
  addCheckin: (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => boolean;
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
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const getTodayString = () => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now);
  } catch {
    const now = new Date();
    const offset = -3;
    const d = new Date(now.getTime() + offset * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  }
};

const getYesterdayString = (baseDateStr: string) => {
  try {
    const d = new Date(baseDateStr + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
  } catch {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
};

const getDiffDays = (date1: string, date2: string) => {
  try {
    const d1 = new Date(date1 + 'T12:00:00Z');
    const d2 = new Date(date2 + 'T12:00:00Z');
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

const DEFAULT_SETTINGS: UserSettings = {
  habitName: '',
  isDarkMode: true,
  notificationsEnabled: false,
  soundsEnabled: true,
  showStreak: true,
  fontSize: 'normal',
  reminderTime: '08:00',
  gender: 'male',
  emergencyHabit: 'EMD',
  twoMinuteHabit: '2 minutos',
  completeHabit: 'Hábito Completo',
  habitLoop: { cue: 'Señal', craving: 'Anhelo', response: 'Respuesta', reward: 'Recompensa' },
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [today, setToday] = useState(getTodayString());
  const [isHydrated, setIsHydrated] = useState(false);

  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    streakHistory: [],
  });
  const [rewards, setRewards] = useState<RewardSystem>({
    availablePoints: 0,
    earnedToday: 0,
    rewardsCatalog: INITIAL_REWARDS,
    purchaseHistory: [],
    streakProtectors: 0,
  });
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [diceRewards, setDiceRewards] = useState<TreasureReward[]>(DICE_REWARDS);
  const [pastHabits, setPastHabits] = useState<PastHabit[]>([]);
  const [taskState, setTaskState] = useState<TaskState>({
    currentTaskId: null,
    lastAssignedDate: null,
    isCompleted: false,
    history: [],
  });
  const [tips, setTips] = useState<Tip[]>(TIPS_POOL);

  const isResetting = useRef(false);

  const loadAll = useCallback(async () => {
    const [
      storedCheckins,
      storedStreak,
      storedRewards,
      storedSettings,
      storedDice,
      storedPast,
      storedTaskState,
      storedTips,
    ] = await Promise.all([
      storageService.getCheckins(),
      storageService.getStreak(),
      storageService.getRewardSystem(),
      storageService.getSettings(),
      storageService.getDiceRewards(),
      storageService.getPastHabits(),
      storageService.getTaskState(),
      storageService.getTips(),
    ]);

    setCheckins(storedCheckins);
    setStreak(storedStreak);
    setRewards({
      ...storedRewards,
      rewardsCatalog:
        storedRewards.rewardsCatalog && storedRewards.rewardsCatalog.length > 0
          ? storedRewards.rewardsCatalog
          : INITIAL_REWARDS,
    });
    setSettings(storedSettings);
    setDiceRewards(storedDice.length > 0 ? storedDice : DICE_REWARDS);
    setPastHabits(storedPast);

    const currentToday = getTodayString();
    setTaskState(
      storedTaskState.lastAssignedDate !== currentToday
        ? { ...storedTaskState, isCompleted: false }
        : storedTaskState
    );

    setTips(storedTips.length > 0 ? storedTips : TIPS_POOL);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!isHydrated) return;
    if (settings.notificationsEnabled) {
      notificationService.scheduleDailyReminder(settings.reminderTime, settings.habitName);
    } else {
      notificationService.cancelDailyReminder();
    }
  }, [isHydrated, settings.notificationsEnabled, settings.reminderTime, settings.habitName]);

  const verifyStreakIntegrity = useCallback(
    (currentToday: string) => {
      if (streak.streakHistory.length === 0) return;
      const sortedHistory = Array.from(new Set(streak.streakHistory)).sort();
      const lastCheckinDate = sortedHistory[sortedHistory.length - 1];
      if (lastCheckinDate >= currentToday) return;

      const yesterday = getYesterdayString(currentToday);
      if (lastCheckinDate === yesterday) return;

      const diffDays = getDiffDays(lastCheckinDate, currentToday);
      if (diffDays <= 1) return;

      let protectorsAvailable = rewards.streakProtectors;
      let recoveredCount = 0;
      const newCheckins: DailyCheckin[] = [];
      const newStreakHistory: string[] = [];

      for (let i = 1; i < diffDays; i++) {
        const tempDate = new Date(currentToday + 'T12:00:00Z');
        tempDate.setUTCDate(tempDate.getUTCDate() - i);
        const dateStr = tempDate.toISOString().split('T')[0];

        if (!sortedHistory.includes(dateStr)) {
          if (protectorsAvailable > 0) {
            newCheckins.push({
              date: dateStr,
              buttonType: 'complete',
              difficultyModeId: 'normal',
              willpowerScore: 5,
              notes: 'Protector de racha activado automáticamente',
              timestamp: new Date().toISOString(),
            });
            newStreakHistory.push(dateStr);
            protectorsAvailable--;
            recoveredCount++;
          } else {
            recoveredCount = -1;
            break;
          }
        }
      }

      if (recoveredCount > 0) {
        setCheckins((prev) => [...prev, ...newCheckins]);
        setRewards((prev) => ({ ...prev, streakProtectors: protectorsAvailable }));
        setStreak((prev) => ({
          ...prev,
          currentStreak: prev.currentStreak + recoveredCount,
          longestStreak: Math.max(prev.longestStreak, prev.currentStreak + recoveredCount),
          streakHistory: [...prev.streakHistory, ...newStreakHistory].sort(),
        }));
      } else if (recoveredCount === -1) {
        setStreak((prev) => ({ ...prev, currentStreak: 0, streakHistory: [] }));
      }
    },
    [streak.streakHistory, streak.currentStreak, rewards.streakProtectors]
  );

  useEffect(() => {
    if (isHydrated) verifyStreakIntegrity(today);
  }, [today, verifyStreakIntegrity, isHydrated]);

  useEffect(() => {
    const checkDate = () => {
      const newToday = getTodayString();
      if (newToday !== today) {
        setToday(newToday);
        setTaskState((prev) => ({ ...prev, isCompleted: false }));
        verifyStreakIntegrity(newToday);
      }
    };

    const interval = setInterval(checkDate, 30_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkDate();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [today, verifyStreakIntegrity]);

  useEffect(() => {
    if (!isHydrated || isResetting.current) return;
    if (taskState.lastAssignedDate !== today || !taskState.currentTaskId) {
      setTaskState((prev) => {
        if (prev.lastAssignedDate === today && prev.currentTaskId) return prev;

        let availableTasks = TASKS_POOL.filter((t) => !prev.history.includes(t.id));
        let randomTask;
        let newHistory;

        if (availableTasks.length === 0) {
          const lastTaskId = prev.currentTaskId;
          availableTasks = TASKS_POOL.filter((t) => t.id !== lastTaskId);
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
          history: newHistory,
        };
      });
    }
  }, [today, taskState.lastAssignedDate, taskState.currentTaskId, isHydrated]);

  useEffect(() => {
    if (!isHydrated || isResetting.current) return;
    storageService.saveCheckins(checkins);
    storageService.saveStreak(streak);
    storageService.saveRewardSystem(rewards);
    storageService.saveDiceRewards(diceRewards);
    storageService.savePastHabits(pastHabits);
    storageService.saveTaskState(taskState);
    storageService.saveTips(tips);
    storageService.saveSettings(settings);
  }, [checkins, streak, rewards, diceRewards, pastHabits, taskState, tips, settings, isHydrated]);

  const hasCheckedInToday = useCallback(() => checkins.some((c) => c.date === today), [checkins, today]);
  const canCheckin = useCallback(() => !hasCheckedInToday(), [hasCheckedInToday]);

  const addCheckin = (type: HabitButtonType, willpower: number, modeId: string, notes?: string) => {
    if (!canCheckin()) return false;

    const newCheckin: DailyCheckin = {
      date: today,
      buttonType: type,
      difficultyModeId: modeId,
      willpowerScore: willpower,
      notes,
      timestamp: new Date().toISOString(),
    };
    setCheckins((prev) => [...prev, newCheckin]);

    setStreak((prev) => {
      const sortedHistory = Array.from(new Set(prev.streakHistory)).sort();
      const lastCheckinDate = sortedHistory[sortedHistory.length - 1];
      const yesterday = getYesterdayString(today);

      if (lastCheckinDate === today) return prev;

      const isContinuous = !lastCheckinDate || lastCheckinDate === yesterday;
      const newStreakCount = isContinuous ? prev.currentStreak + 1 : 1;

      return {
        ...prev,
        currentStreak: newStreakCount,
        longestStreak: Math.max(prev.longestStreak, newStreakCount),
        totalCompletions: prev.totalCompletions + 1,
        streakHistory: [...prev.streakHistory, today].sort(),
      };
    });

    const mode = DIFFICULTY_MODES.find((m) => m.id === modeId) || DIFFICULTY_MODES[0];
    const points = Math.round(10 * mode.multiplier);
    setRewards((prev) => ({ ...prev, availablePoints: prev.availablePoints + points, earnedToday: points }));

    return true;
  };

  const completeDailyTask = () => {
    if (taskState.isCompleted) return;
    setTaskState((prev) => ({ ...prev, isCompleted: true }));
    setRewards((prev) => ({ ...prev, availablePoints: prev.availablePoints + 5 }));
  };

  const addPoints = (amount: number) =>
    setRewards((prev) => ({ ...prev, availablePoints: prev.availablePoints + amount }));
  const recordDiceRoll = (result: number) =>
    setRewards((prev) => ({ ...prev, lastDiceRollDate: today, lastDiceResult: result }));
  const updateSettings = (newSettings: UserSettings) => setSettings(newSettings);
  const updateDiceReward = (id: number, title: string, description: string) =>
    setDiceRewards((prev) => prev.map((r) => (r.id === id ? { ...r, title, description } : r)));
  const toggleFavoriteTip = (id: number) =>
    setTips((prev) => prev.map((tip) => (tip.id === id ? { ...tip, isFavorite: !tip.isFavorite } : tip)));

  const redeemReward = (rewardId: string) => {
    const reward = rewards.rewardsCatalog.find((r) => r.id === rewardId);
    if (!reward || rewards.availablePoints < reward.cost) return false;

    setRewards((prev) => {
      const nextPoints = prev.availablePoints - reward.cost;
      const nextHistory = [
        {
          id: Math.random().toString(36).slice(2, 11),
          rewardId,
          date: new Date().toISOString(),
          pointsSpent: reward.cost,
        },
        ...prev.purchaseHistory,
      ];
      let nextProtectors = prev.streakProtectors;
      if (rewardId === 'reward_2') nextProtectors += 1;
      return {
        ...prev,
        availablePoints: nextPoints,
        purchaseHistory: nextHistory,
        streakProtectors: nextProtectors,
      };
    });
    return true;
  };

  const requestNotificationPermission = () => notificationService.requestPermissions();
  const requestStoragePermission = async () => true;
  const sendTestNotification = () => {
    notificationService.sendTest();
  };

  const resetProgress = async () => {
    isResetting.current = true;
    await storageService.clearAll();
    await notificationService.cancelDailyReminder();
    setCheckins([]);
    setStreak({ currentStreak: 0, longestStreak: 0, totalCompletions: 0, streakHistory: [] });
    setRewards({
      availablePoints: 0,
      earnedToday: 0,
      rewardsCatalog: INITIAL_REWARDS,
      purchaseHistory: [],
      streakProtectors: 0,
    });
    setSettings(DEFAULT_SETTINGS);
    setDiceRewards(DICE_REWARDS);
    setPastHabits([]);
    setTaskState({ currentTaskId: null, lastAssignedDate: null, isCompleted: false, history: [] });
    setTips(TIPS_POOL);
    isResetting.current = false;
  };

  const deletePastHabit = (id: string) => setPastHabits((prev) => prev.filter((h) => h.id !== id));

  const startNewHabit = () => {
    let currentRankName = 'NV 1 - Prometeo';
    if (streak.currentStreak >= 32)
      currentRankName = settings.gender === 'male' ? 'NV 4 - Hércules Semi-Dios' : 'NV 4 - Hércules Semi-Diosa';
    else if (streak.currentStreak >= 17) currentRankName = 'NV 3 - Aquiles';
    else if (streak.currentStreak >= 7) currentRankName = 'NV 2 - Jasón';

    const daysToLookBack = 30;
    const todayDate = new Date(today + 'T12:00:00');
    const historyData: { dateLabel: string; willpower: number }[] = [];
    let sum = 0;
    let count = 0;
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checkin = checkins.find((c) => c.date === dateStr);
      const willpower = checkin ? checkin.willpowerScore : 0;
      historyData.push({
        dateLabel: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        willpower,
      });
      if (willpower > 0) {
        sum += willpower;
        count++;
      }
    }

    const archiveEntry: PastHabit = {
      id: Math.random().toString(36).slice(2, 11),
      name: settings.habitName || 'Entrenamiento Anterior',
      sessions: checkins.length,
      maxStreak: streak.longestStreak,
      rankReached: currentRankName,
      date: new Date().toISOString(),
      willpowerHistory: historyData,
      avgWillpower: count > 0 ? (sum / count).toFixed(1) : '0.0',
      checkinsSnapshot: [...checkins],
      habitLoop: settings.habitLoop,
    };

    setPastHabits((prev) => [archiveEntry, ...prev]);
    setCheckins([]);
    setStreak((prev) => ({
      ...prev,
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: [],
      totalCompletions: 0,
    }));
    setTaskState((prev) => ({ ...prev, isCompleted: false, currentTaskId: null, history: [] }));
  };

  return (
    <HabitContext.Provider
      value={{
        streak,
        checkins,
        rewards,
        settings,
        diceRewards,
        pastHabits,
        taskState,
        tips,
        today,
        isHydrated,
        addCheckin,
        canCheckin,
        hasCheckedInToday,
        redeemReward,
        completeDailyTask,
        addPoints,
        recordDiceRoll,
        updateSettings,
        updateDiceReward,
        toggleFavoriteTip,
        requestNotificationPermission,
        requestStoragePermission,
        sendTestNotification,
        resetProgress,
        startNewHabit,
        deletePastHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used within a HabitProvider');
  return ctx;
};
