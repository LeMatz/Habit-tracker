export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  streakHistory: string[];
}

export type HabitButtonType = 'emergency' | 'twoMinutes' | 'complete';

export interface DifficultyMode {
  id: string;
  name: string;
  description: string;
  objective: string;
  multiplier: number;
  icon: string;
}

export interface DailyCheckin {
  date: string;
  buttonType: HabitButtonType;
  difficultyModeId: string;
  willpowerScore: number;
  notes?: string;
  timestamp: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  neuroBasis: string;
}

export interface TaskState {
  currentTaskId: string | null;
  lastAssignedDate: string | null;
  isCompleted: boolean;
  history: string[];
}

export interface UserSettings {
  habitName: string;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  soundsEnabled: boolean;
  showStreak: boolean;
  fontSize: 'normal' | 'large';
  reminderTime: string;
  gender: 'male' | 'female';
  emergencyHabit: string;
  twoMinuteHabit: string;
  completeHabit: string;
}

export interface TreasureReward {
  id: number;
  title: string;
  description: string;
  diceNumber: number;
  isEditable: boolean;
  pointsCost: number;
}

export interface UserReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'instant' | 'experience' | 'treat';
  isActive: boolean;
  icon?: string;
}

export interface Transaction {
  id: string;
  rewardId: string;
  date: string;
  pointsSpent: number;
}

export interface RewardSystem {
  availablePoints: number;
  earnedToday: number;
  rewardsCatalog: UserReward[];
  purchaseHistory: Transaction[];
  lastDiceRollDate?: string;
  streakProtectors: number;
}

export interface PastHabit {
  id: string;
  name: string;
  sessions: number;
  maxStreak: number;
  rankReached: string;
  date: string;
  willpowerHistory?: { dateLabel: string, willpower: number }[];
  avgWillpower?: string;
  checkinsSnapshot?: DailyCheckin[];
}

export interface Tip {
  id: number;
  category: string;
  content: string;
  author: string;
  isFavorite: boolean;
}

export const VERSION = "3.5.0";