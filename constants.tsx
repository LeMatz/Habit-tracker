
import { Tip, TreasureReward, UserReward, DifficultyMode } from './types';

export const DIFFICULTY_MODES: DifficultyMode[] = [
  {
    id: 'normal',
    name: 'Modo Estándar',
    description: 'Sesión habitual sin restricciones adicionales.',
    objective: 'Mantenimiento de la red neuronal establecida.',
    multiplier: 1.0,
    icon: 'Activity'
  },
  {
    id: 'monk',
    name: 'Modo Monje',
    description: 'Sin música, sin notificaciones y en silencio absoluto.',
    objective: 'Foco profundo y reducción de dopamina barata.',
    multiplier: 1.3,
    icon: 'MicOff'
  },
  {
    id: 'nomad',
    name: 'Modo Nómada',
    description: 'Realizar el hábito en un lugar totalmente nuevo.',
    objective: 'Neuroplasticidad mediante ruptura de señales de entorno.',
    multiplier: 1.5,
    icon: 'MapPin'
  },
  {
    id: 'double',
    name: 'Modo Doble',
    description: 'Aumentar el doble el tiempo manteniendo la calidad.',
    objective: 'Entrenamiento de la agilidad mental bajo presión.',
    multiplier: 1.7,
    icon: 'Zap'
  },
  {
    id: 'incognito',
    name: 'Modo Incógnito',
    description: 'Usar el Efecto Batman durante toda la sesión.',
    objective: 'Desapego del ego y fortalecimiento de identidad.',
    multiplier: 1.2,
    icon: 'Ghost'
  },
  {
    id: 'chaos',
    name: 'Modo Caos',
    description: 'Hacerlo en un entorno ruidoso o con distracciones.',
    objective: 'Antifragilidad: aprender a florecer en el desorden.',
    multiplier: 1.5,
    icon: 'Wind'
  },
  {
    id: 'fast',
    name: 'Modo Ayuno Digital',
    description: 'Prohibido usar cualquier herramienta digital.',
    objective: 'Desconexión de la dependencia tecnológica.',
    multiplier: 1.4,
    icon: 'Smartphone'
  }
];

export const INITIAL_TIPS: Tip[] = [
  {
    id: 1,
    category: "Motivación",
    content: "Los primeros 5 minutos son los más difíciles. Supera esos y el resto fluye.",
    author: "James Clear",
    length: "short",
    isFavorite: false
  },
  {
    id: 2,
    category: "Ciencia",
    content: "Un hábito se forma por la repetición constante en un contexto similar.",
    author: "Andrew Huberman",
    length: "short",
    isFavorite: false
  },
  {
    id: 3,
    category: "Psicología",
    content: "No rompas la cadena. El éxito es el resultado de pequeños esfuerzos diarios.",
    author: "Jerry Seinfeld",
    length: "short",
    isFavorite: false
  }
];

export const INITIAL_REWARDS: UserReward[] = [
  {
    id: '1',
    name: 'Reducción de Tarea',
    description: 'Permiso para reducir el hábito a 2 minutos.',
    cost: 70,
    category: 'instant',
    isActive: true,
    icon: 'Scissors'
  },
  {
    id: '2',
    name: 'Protector de racha',
    description: 'Salva tu racha si olvidas un día.',
    cost: 200,
    category: 'experience',
    isActive: true,
    icon: 'ShieldCheck'
  },
  {
    id: '3',
    name: 'Barra de alivio',
    description: 'Reduce exigencia al 50% en una sesión.',
    cost: 50,
    category: 'instant',
    isActive: true,
    icon: 'Zap'
  },
  {
    id: '4',
    name: 'Meditación Guiada',
    description: 'Audio grabado para relajación profunda.',
    cost: 1500,
    category: 'treat',
    isActive: true,
    icon: 'Music'
  },
  {
    id: '5',
    name: 'Clase oculta',
    description: 'Diagrama de Flujo para proyectos.',
    cost: 2000,
    category: 'experience',
    isActive: true,
    icon: 'BookOpen'
  }
];

export const DICE_REWARDS: TreasureReward[] = [
  { id: 1, diceNumber: 1, title: 'Meditación extra', description: '', isEditable: true, pointsCost: 0 },
  { id: 2, diceNumber: 2, title: 'Snack Saludable', description: '', isEditable: true, pointsCost: 0 },
  { id: 3, diceNumber: 3, title: 'Descanso 10m', description: '', isEditable: true, pointsCost: 0 },
  { id: 4, diceNumber: 4, title: 'Puntos Extra', description: '', isEditable: true, pointsCost: 0 },
  { id: 5, diceNumber: 5, title: 'Elogio', description: '', isEditable: true, pointsCost: 0 },
  { id: 6, diceNumber: 6, title: 'GRAN PREMIO', description: '', isEditable: true, pointsCost: 0 },
];
