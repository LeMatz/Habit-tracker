import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyCheckin, StreakData, RewardSystem, UserSettings, TreasureReward, PastHabit, TaskState, Tip } from '../types';

const KEYS = {
  CHECKINS: 'habit_checkins',
  STREAK: 'habit_streak',
  REWARDS: 'habit_rewards',
  SETTINGS: 'habit_settings',
  DICE_REWARDS: 'habit_dice_rewards',
  PAST_HABITS: 'habit_past_archive',
  TASK_STATE: 'habit_task_state',
  TIPS: 'habit_tips',
};

async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[Storage Error] Could not save ${key}:`, error);
  }
}

async function getData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch (error) {
    console.error(`[Storage Error] Could not load ${key}:`, error);
    return defaultValue;
  }
}

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
  habitLoop: {
    cue: 'Señal',
    craving: 'Anhelo',
    response: 'Respuesta',
    reward: 'Recompensa',
  },
};

export const storageService = {
  saveData,
  getData,

  saveCheckins: (checkins: DailyCheckin[]) => saveData(KEYS.CHECKINS, checkins),
  getCheckins: (): Promise<DailyCheckin[]> => getData(KEYS.CHECKINS, []),

  saveStreak: (streak: StreakData) => saveData(KEYS.STREAK, streak),
  getStreak: (): Promise<StreakData> =>
    getData(KEYS.STREAK, {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      streakHistory: [],
    }),

  saveRewardSystem: (rewards: RewardSystem) => saveData(KEYS.REWARDS, rewards),
  getRewardSystem: (): Promise<RewardSystem> =>
    getData(KEYS.REWARDS, {
      availablePoints: 0,
      earnedToday: 0,
      rewardsCatalog: [],
      purchaseHistory: [],
      streakProtectors: 0,
    }),

  saveDiceRewards: (rewards: TreasureReward[]) => saveData(KEYS.DICE_REWARDS, rewards),
  getDiceRewards: (): Promise<TreasureReward[]> => getData(KEYS.DICE_REWARDS, []),

  saveSettings: (settings: UserSettings) => saveData(KEYS.SETTINGS, settings),
  getSettings: async (): Promise<UserSettings> => {
    const stored = await getData<Partial<UserSettings>>(KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      habitLoop: { ...DEFAULT_SETTINGS.habitLoop, ...(stored.habitLoop ?? {}) },
    };
  },

  savePastHabits: (habits: PastHabit[]) => saveData(KEYS.PAST_HABITS, habits),
  getPastHabits: (): Promise<PastHabit[]> => getData(KEYS.PAST_HABITS, []),

  saveTaskState: (state: TaskState) => saveData(KEYS.TASK_STATE, state),
  getTaskState: (): Promise<TaskState> =>
    getData(KEYS.TASK_STATE, {
      currentTaskId: null,
      lastAssignedDate: null,
      isCompleted: false,
      history: [],
    }),

  saveTips: (tips: Tip[]) => saveData(KEYS.TIPS, tips),
  getTips: (): Promise<Tip[]> => getData(KEYS.TIPS, []),

  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
