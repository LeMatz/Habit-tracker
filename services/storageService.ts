
import { DailyCheckin, StreakData, RewardSystem, UserSettings, TreasureReward, PastHabit } from '../types';

const KEYS = {
  CHECKINS: 'habit_checkins',
  STREAK: 'habit_streak',
  REWARDS: 'habit_rewards',
  SETTINGS: 'habit_settings',
  DICE_REWARDS: 'habit_dice_rewards',
  PAST_HABITS: 'habit_past_archive'
};

/**
 * SHCE Local Persistance Engine
 * Exclusively uses localStorage for zero-latency data sync.
 */
export const storageService = {
  // Sync structure: converts array/object to JSON string (guardarDatos)
  saveData: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`[Storage Error] Could not save ${key}:`, error);
    }
  },

  // Automatic Loading: retrieves and validates data (cargarDatos)
  getData: (key: string, defaultValue: any) => {
    try {
      const data = localStorage.getItem(key);
      // Validation: if empty/null, return default (usually empty array [] or object)
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`[Storage Error] Could not load ${key}:`, error);
      return defaultValue;
    }
  },

  // State-specific helper methods
  saveCheckins: (checkins: DailyCheckin[]) => storageService.saveData(KEYS.CHECKINS, checkins),
  getCheckins: (): DailyCheckin[] => storageService.getData(KEYS.CHECKINS, []),

  saveStreak: (streak: StreakData) => storageService.saveData(KEYS.STREAK, streak),
  getStreak: (): StreakData => storageService.getData(KEYS.STREAK, { 
    currentStreak: 0, 
    longestStreak: 0, 
    totalCompletions: 0, 
    streakHistory: [] 
  }),

  saveRewardSystem: (rewards: RewardSystem) => storageService.saveData(KEYS.REWARDS, rewards),
  getRewardSystem: (): RewardSystem => storageService.getData(KEYS.REWARDS, { 
    availablePoints: 0, 
    earnedToday: 0, 
    rewardsCatalog: [], 
    purchaseHistory: [],
    streakProtectors: 0 
  }),

  saveDiceRewards: (rewards: TreasureReward[]) => storageService.saveData(KEYS.DICE_REWARDS, rewards),
  getDiceRewards: (): TreasureReward[] => storageService.getData(KEYS.DICE_REWARDS, []),

  saveSettings: (settings: UserSettings) => storageService.saveData(KEYS.SETTINGS, settings),
  getSettings: (): UserSettings => storageService.getData(KEYS.SETTINGS, { 
    habitName: '', 
    isDarkMode: true, 
    notificationsEnabled: false,
    showStreak: true,
    fontSize: 'normal',
    reminderTime: '08:00',
    gender: 'male',
    emergencyHabit: 'Mínimo SOS',
    twoMinuteHabit: 'Regla 2 Min',
    completeHabit: 'Hábito Completo'
  }),

  savePastHabits: (habits: PastHabit[]) => storageService.saveData(KEYS.PAST_HABITS, habits),
  getPastHabits: (): PastHabit[] => storageService.getData(KEYS.PAST_HABITS, [])
};
