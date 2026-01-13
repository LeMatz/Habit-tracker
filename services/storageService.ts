
import { DailyCheckin, StreakData, RewardSystem, Transaction, Tip, UserSettings, TreasureReward, PastHabit } from '../types';

const KEYS = {
  CHECKINS: 'habit_checkins',
  STREAK: 'habit_streak',
  REWARDS: 'habit_rewards',
  TIPS: 'habit_tips',
  SETTINGS: 'habit_settings',
  DICE_REWARDS: 'habit_dice_rewards',
  PAST_HABITS: 'habit_past_archive'
};

export const storageService = {
  saveCheckin: (checkin: DailyCheckin) => {
    const checkins = storageService.getCheckins();
    checkins.push(checkin);
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(checkins));
  },

  getCheckins: (): DailyCheckin[] => {
    const data = localStorage.getItem(KEYS.CHECKINS);
    return data ? JSON.parse(data) : [];
  },

  saveStreak: (streak: StreakData) => {
    localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
  },

  getStreak: (): StreakData => {
    const data = localStorage.getItem(KEYS.STREAK);
    return data ? JSON.parse(data) : { currentStreak: 0, longestStreak: 0, totalCompletions: 0, streakHistory: [] };
  },

  saveRewardSystem: (rewards: RewardSystem) => {
    localStorage.setItem(KEYS.REWARDS, JSON.stringify(rewards));
  },

  getRewardSystem: (): RewardSystem => {
    const data = localStorage.getItem(KEYS.REWARDS);
    return data ? JSON.parse(data) : { 
      availablePoints: 0, 
      earnedToday: 0, 
      rewardsCatalog: [], 
      purchaseHistory: [],
      streakProtectors: 0 
    };
  },

  saveTips: (tips: Tip[]) => {
    localStorage.setItem(KEYS.TIPS, JSON.stringify(tips));
  },

  getTips: (): Tip[] => {
    const data = localStorage.getItem(KEYS.TIPS);
    return data ? JSON.parse(data) : [];
  },

  saveDiceRewards: (rewards: TreasureReward[]) => {
    localStorage.setItem(KEYS.DICE_REWARDS, JSON.stringify(rewards));
  },

  getDiceRewards: (): TreasureReward[] => {
    const data = localStorage.getItem(KEYS.DICE_REWARDS);
    return data ? JSON.parse(data) : [];
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getSettings: (): UserSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { 
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
    };
  },

  savePastHabits: (habits: PastHabit[]) => {
    localStorage.setItem(KEYS.PAST_HABITS, JSON.stringify(habits));
  },

  getPastHabits: (): PastHabit[] => {
    const data = localStorage.getItem(KEYS.PAST_HABITS);
    return data ? JSON.parse(data) : [];
  }
};
