
import { TreasureReward, UserReward, DifficultyMode, DailyTask, Tip } from './types';

export const TASKS_POOL: DailyTask[] = [
  { 
    id: 't1', 
    title: 'Rastreo Consciente', 
    description: 'Durante el día, pon una alarma aleatoria 3 veces. Cuando suene, detente y anota: ¿Qué estoy haciendo? ¿Qué estoy sintiendo? Cuál es mi nivel de energía del 1 al 10?',
    neuroBasis: 'Metacognición: Entrena la capacidad de tu cerebro para observarse a sí mismo en tiempo real.'
  },
  { 
    id: 't2', 
    title: 'Incomodidad Voluntaria', 
    description: 'Realiza una tarea rutinaria con la mano no dominante (cepillarte los dientes, usar el mouse, revolver el café).',
    neuroBasis: 'Flexibilidad Cognitiva: Rompe los caminos pavimentados de tus neuronas.'
  },
  { 
    id: 't3', 
    title: 'Mindfulness de 1 minuto', 
    description: 'Siéntate en silencio. Enfócate en tu respiración y nota cada vez que te distraes para volver suavemente.',
    neuroBasis: 'Atención Sostenida: Fortalece el músculo que te permite regresar al presente.'
  },
  { 
    id: 't4', 
    title: 'Ejercicio de Gratitud Enfocada', 
    description: 'Escribe 3 cosas por las que tu "Yo del Futuro" te agradecerá haber empezado este programa.',
    neuroBasis: 'Sesgo de Positividad: Reconfigura el sistema de recompensa para valorar el esfuerzo a largo plazo.'
  },
  { 
    id: 't5', 
    title: 'Regla 5-5-5', 
    description: 'Nombra 5 cosas que puedas observar, 5 cosas audibles y 5 sensaciones corporales en tu entorno actual.',
    neuroBasis: 'Anclaje Sensorial: Ancla la atención al presente y reduce la activación autonómica del sistema nervioso.'
  },
  { 
    id: 't6', 
    title: 'Respiración Cuadrada', 
    description: 'Inhala 4 segundos, sostén la respiración 4 segundos, exhala en 4 segundos y sostén el vacío 4 segundos. Repite este ciclo tres veces.',
    neuroBasis: 'Activación Parasimpática: Favorece la relajación profunda al estimular el nervio vago y equilibrar el ritmo cardíaco.'
  },
  { 
    id: 't7', 
    title: 'Elongación Simple', 
    description: 'Realiza una elongación suave de al menos tres grupos musculares diferentes por unos segundos, sin exigirte. Repite el circuito tres veces.',
    neuroBasis: 'Propiocepción: Mejora la conexión mente-cuerpo y libera la tensión física acumulada que impacta en el estrés mental.'
  },
  {
    id: 't8',
    title: 'Visualización de Proceso',
    description: 'Cierra los ojos e imagina paso a paso cómo realizarás tu hábito mañana, incluyendo cómo superarás un posible obstáculo.',
    neuroBasis: 'Simulación Mental: Pre-activa las cortezas motora y premotora, reduciendo la fricción a la hora de la acción real.'
  },
  {
    id: 't9',
    title: 'Diálogo Interno de Tercero',
    description: 'Dite a ti mismo un cumplido o un consejo usando tu propio nombre (en tercera persona) frente al espejo.',
    neuroBasis: 'Autodistanciamiento: Reduce la carga emocional de la autocrítica y mejora la regulación del córtex prefrontal.'
  },
  {
    id: 't10',
    title: 'Reencuadre Cognitivo',
    description: 'Identifica un pensamiento negativo que hayas tenido hoy y escríbelo. Luego, busca una interpretación alternativa que sea más útil.',
    neuroBasis: 'Revalorización: Fortalece las conexiones inhibitorias entre el córtex prefrontal y la amígdala.'
  }
];

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
    id: 'hero',
    name: 'Modo Héroe',
    description: 'Hoy tuve un mal día e igual hice mi hábito.',
    objective: 'Resiliencia pura: Actuar a pesar de la resistencia emocional.',
    multiplier: 1.2,
    icon: 'Shield'
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
    description: 'Realizar el hábito en un lugar totalmente nuevo (un café, otra habitación, un parque).',
    objective: 'Neuroplasticidad mediante la ruptura de señales de entorno.',
    multiplier: 1.5,
    icon: 'MapPin'
  },
  {
    id: 'double',
    name: 'Modo Doble',
    description: 'Aumentar el doble el tiempo que dedico manteniendo la calidad.',
    objective: 'Entrenamiento de la agilidad mental bajo presión.',
    multiplier: 1.7,
    icon: 'Zap'
  },
  {
    id: 'incognito',
    name: 'Modo Incógnito',
    description: 'Usar el Efecto Batman (actuar como alguien que admiras) durante toda la sesión.',
    objective: 'Desapego del ego y fortalecimiento de la nueva identidad.',
    multiplier: 1.2,
    icon: 'Ghost'
  },
  {
    id: 'chaos',
    name: 'Modo Caos',
    description: 'Hacerlo en un entorno ruidoso o con distracciones deliberadas.',
    objective: 'Antifragilidad: aprender a florecer en el desorden.',
    multiplier: 1.5,
    icon: 'Dices'
  },
  {
    id: 'digital_fast',
    name: 'Modo Ayuno Digital',
    description: 'Prohibido usar cualquier herramienta digital (lápiz y papel, lectura física, etc.).',
    objective: 'Desconexión de la dependencia tecnológica.',
    multiplier: 1.4,
    icon: 'Smartphone'
  }
];

export const INITIAL_REWARDS: UserReward[] = [
  {
    id: 'reward_1',
    name: 'Reducción de Tarea',
    description: 'Permiso para reducir el hábito diario a su versión de dos minutos.',
    cost: 70,
    category: 'instant',
    isActive: true,
    icon: 'Scissors'
  },
  {
    id: 'reward_2',
    name: 'Protector de racha',
    description: 'Saltar una sesión sin perder racha.',
    cost: 150,
    category: 'experience',
    isActive: true,
    icon: 'ShieldCheck'
  },
  {
    id: 'reward_3',
    name: 'Barra de Alivio',
    description: 'Permiso para reducir exigencia al 50% en una sesión.',
    cost: 50,
    category: 'instant',
    isActive: true,
    icon: 'Coffee'
  },
  {
    id: 'reward_4',
    name: 'Meditación Guiada',
    description: 'Meditación guiada grabada para inducir relajación.',
    cost: 1500,
    category: 'experience',
    isActive: true,
    icon: 'Music'
  },
  {
    id: 'reward_5',
    name: 'Clase Oculta',
    description: 'Clase grabada enseñando a usar un de Diagrama de Flujo de Trabajo para proyectos personales.',
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
  { id: 6, diceNumber: 6, title: 'GRAN PREMIO', description: '', isEditable: true, pointsCost: 0 }
];

export const TIPS_POOL: Tip[] = [
  { id: 1, category: 'Neuroplasticidad', content: 'Tu cerebro no es una red rígida, es una selva en constante crecimiento.', author: 'Dr. Santiago Ramón y Cajal', isFavorite: false },
  { id: 2, category: 'Hábitos', content: 'La disciplina es el arte de recordar lo que realmente quieres.', author: 'Anónimo', isFavorite: false }
];
