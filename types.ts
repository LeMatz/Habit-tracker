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

export interface HabitLoop {
  cue: string;
  craving: string;
  response: string;
  reward: string;
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
  habitLoop: HabitLoop;
  activeDays?: number[]; // indices de 0 (Domingo) a 6 (Sábado) que representan los días comprometidos
  habitType?: 'calendar' | 'threshold' | 'opportunity';
  thresholdRate?: number;
  showExecutionSpectrum?: boolean;
  chequeoSubtitle?: string;
  ejecucionSubtitle?: string;
  thresholdVariables?: Array<{ id: string; name: string }>;
  definicionVentana?: string;
  frecuenciaSemanasEsperada?: number;
  opportunityTags?: string[];
  emotionalTags?: string[];
}

export type EstadoEventoOportunidad = 'ejecutada' | 'no_ejecutada' | 'condicion_externa' | 'automatico' | 'entrenamiento';

export interface RegistroEventoOportunidad {
  id: string;
  date: string;
  timestamp: string;
  estado: EstadoEventoOportunidad;
  contexto: string;
  estadoEmocional?: string;
  notas?: string;
}

export interface CicloHistorico {
  ciclo: number;
  dias: number;
  fechaDisparo: string;
  interrumpido: boolean;
  factores?: Record<string, number>;
}

export interface IntervencionRegistrada {
  timestamp: string;
  momentPercent: number; // e.g. 10, 20, 30... 100
  tipo: string;
  efectividad: 'alta' | 'media' | 'baja';
  nota?: string;
}

export interface RegistroDiarioUmbral {
  date: string;
  tipo: 'chequeo' | 'ejecución' | 'sin_registro';
  porcentaje: number;
  timestamp: string;
  factores: Record<string, number>;
  rate?: number; // tasa de acumulación en ese segmento
  intervencion?: boolean;
  espectro?: 'emd' | '2min' | 'complete';
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
  lastDiceResult?: number;
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
  habitLoop?: HabitLoop;
  streakSnapshot?: StreakData;
  settingsSnapshot?: {
    habitName: string;
    emergencyHabit: string;
    twoMinuteHabit: string;
    completeHabit: string;
    habitLoop: HabitLoop;
    activeDays?: number[];
  };
}

export interface Tip {
  id: number;
  category: string;
  content: string;
  author: string;
  isFavorite: boolean;
}

export const VERSION = "3.5.0";