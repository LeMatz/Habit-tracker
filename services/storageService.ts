
import { DailyCheckin, StreakData, RewardSystem, UserSettings, TreasureReward, PastHabit, TaskState, Tip } from '../types';

const KEYS = {
  CHECKINS: 'habit_checkins',
  STREAK: 'habit_streak',
  REWARDS: 'habit_rewards',
  SETTINGS: 'habit_settings',
  DICE_REWARDS: 'habit_dice_rewards',
  PAST_HABITS: 'habit_past_archive',
  TASK_STATE: 'habit_task_state',
  TIPS: 'habit_tips'
};

export const storageService = {
  saveData: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`[Storage Error] Could not save ${key}:`, error);
    }
  },

  getData: (key: string, defaultValue: any) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`[Storage Error] Could not load ${key}:`, error);
      return defaultValue;
    }
  },

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
  getSettings: (): UserSettings => {
    const defaults: UserSettings = { 
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
        reward: 'Recompensa'
      },
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      habitType: 'calendar',
      thresholdRate: 20,
      showExecutionSpectrum: true,
      chequeoSubtitle: 'Monitorear Estado',
      ejecucionSubtitle: 'Mitigar / Resetear',
      thresholdVariables: [
        { id: 'var_sleep', name: 'Calidad de Sueño' },
        { id: 'var_stress', name: 'Nivel de estrés' },
        { id: 'var_exercise', name: 'Ejercicio diario' }
      ],
      definicionVentana: 'Ventana de disparador de oportunidad relevante para mi respuesta',
      frecuenciaSemanasEsperada: 3,
      opportunityTags: ['En Casa', 'En el Trabajo', 'En Tránsito', 'Social'],
      emotionalTags: ['Calmado', 'Ansioso', 'Cansado', 'Neutral']
    };
    const stored = storageService.getData(KEYS.SETTINGS, defaults);
    
    // Migración única para asegurar que todos los usuarios comiencen en Modo Oscuro por defecto
    if (!localStorage.getItem('theme_migrated_to_dark_v3')) {
      stored.isDarkMode = true;
      localStorage.setItem('theme_migrated_to_dark_v3', 'true');
      storageService.saveData(KEYS.SETTINGS, stored);
    }

    return { 
      ...defaults, 
      ...stored, 
      habitLoop: { ...defaults.habitLoop, ...(stored.habitLoop || {}) },
      activeDays: stored.activeDays !== undefined ? stored.activeDays : defaults.activeDays,
      thresholdVariables: stored.thresholdVariables ? stored.thresholdVariables : defaults.thresholdVariables,
      definicionVentana: stored.definicionVentana !== undefined ? stored.definicionVentana : defaults.definicionVentana,
      frecuenciaSemanasEsperada: stored.frecuenciaSemanasEsperada !== undefined ? stored.frecuenciaSemanasEsperada : defaults.frecuenciaSemanasEsperada,
      opportunityTags: stored.opportunityTags !== undefined ? stored.opportunityTags : defaults.opportunityTags,
      emotionalTags: stored.emotionalTags !== undefined ? stored.emotionalTags : defaults.emotionalTags
    };
  },

  savePastHabits: (habits: PastHabit[]) => storageService.saveData(KEYS.PAST_HABITS, habits),
  getPastHabits: (): PastHabit[] => storageService.getData(KEYS.PAST_HABITS, []),

  saveTaskState: (state: TaskState) => storageService.saveData(KEYS.TASK_STATE, state),
  getTaskState: (): TaskState => storageService.getData(KEYS.TASK_STATE, {
    currentTaskId: null,
    lastAssignedDate: null,
    isCompleted: false,
    history: []
  }),

  saveTips: (tips: Tip[]) => storageService.saveData(KEYS.TIPS, tips),
  getTips: (): Tip[] => storageService.getData(KEYS.TIPS, [])
};
