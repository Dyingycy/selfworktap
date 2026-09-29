import { WorkoutLog, MuscleGroup, ExerciseLog, WorkoutSet } from '@/types';

export interface MuscleGroupMeta {
  id: MuscleGroup;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export interface ExercisePreset {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultWeight: number;
  defaultReps: number;
  isBodyweight?: boolean;
}

export const MUSCLE_GROUPS_META: Record<MuscleGroup, MuscleGroupMeta> = {
  chest: {
    id: 'chest',
    name: '胸部',
    icon: '🏋️‍♂️',
    color: '#f43f5e',
    bgClass: 'bg-rose-500/15',
    borderClass: 'border-rose-500/30',
    textClass: 'text-rose-400',
  },
  back: {
    id: 'back',
    name: '背部',
    icon: '🦅',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
  },
  legs: {
    id: 'legs',
    name: '腿部臀部',
    icon: '🦵',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/15',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-400',
  },
  shoulders: {
    id: 'shoulders',
    name: '肩部三角肌',
    icon: '🛡️',
    color: '#a855f7',
    bgClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/30',
    textClass: 'text-purple-400',
  },
  arms: {
    id: 'arms',
    name: '手臂二三头',
    icon: '💪',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
  },
  core: {
    id: 'core',
    name: '腹肌核心',
    icon: '⚡',
    color: '#10b981',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400',
  },
  cardio: {
    id: 'cardio',
    name: '有氧跑步',
    icon: '🏃‍♂️',
    color: '#84cc16',
    bgClass: 'bg-lime-500/15',
    borderClass: 'border-lime-500/30',
    textClass: 'text-lime-400',
  },
  hiit: {
    id: 'hiit',
    name: 'HIIT减脂',
    icon: '🔥',
    color: '#ef4444',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/30',
    textClass: 'text-red-400',
  },
  stretch: {
    id: 'stretch',
    name: '拉伸瑜伽',
    icon: '🧘‍♂️',
    color: '#14b8a6',
    bgClass: 'bg-teal-500/15',
    borderClass: 'border-teal-500/30',
    textClass: 'text-teal-400',
  },
};

export const EXERCISE_PRESETS: Record<MuscleGroup, ExercisePreset[]> = {
  chest: [
    { id: 'c-1', name: '杠铃平板卧推', muscleGroup: 'chest', defaultWeight: 70, defaultReps: 8 },
    { id: 'c-2', name: '哑铃上斜卧推', muscleGroup: 'chest', defaultWeight: 24, defaultReps: 10 },
    { id: 'c-3', name: '蝴蝶机夹胸', muscleGroup: 'chest', defaultWeight: 45, defaultReps: 12 },
    { id: 'c-4', name: '双杠臂屈伸 (自重/负重)', muscleGroup: 'chest', defaultWeight: 0, defaultReps: 12, isBodyweight: true },
    { id: 'c-5', name: '绳索十字夹胸', muscleGroup: 'chest', defaultWeight: 20, defaultReps: 15 },
    { id: 'c-6', name: '标准俯卧撑', muscleGroup: 'chest', defaultWeight: 0, defaultReps: 20, isBodyweight: true },
  ],
  back: [
    { id: 'b-1', name: '传统杠铃硬拉', muscleGroup: 'back', defaultWeight: 110, defaultReps: 5 },
    { id: 'b-2', name: '引体向上 (宽握正握)', muscleGroup: 'back', defaultWeight: 0, defaultReps: 8, isBodyweight: true },
    { id: 'b-3', name: '高位下拉 (正手/对握)', muscleGroup: 'back', defaultWeight: 55, defaultReps: 12 },
    { id: 'b-4', name: '俯身杠铃划船', muscleGroup: 'back', defaultWeight: 60, defaultReps: 10 },
    { id: 'b-5', name: '坐姿绳索划船', muscleGroup: 'back', defaultWeight: 50, defaultReps: 12 },
    { id: 'b-6', name: '单臂哑铃划船', muscleGroup: 'back', defaultWeight: 24, defaultReps: 10 },
  ],
  legs: [
    { id: 'l-1', name: '杠铃深蹲 (高杠/低杠)', muscleGroup: 'legs', defaultWeight: 90, defaultReps: 8 },
    { id: 'l-2', name: '45度倒蹬机腿举', muscleGroup: 'legs', defaultWeight: 160, defaultReps: 10 },
    { id: 'l-3', name: '罗马尼亚硬拉 (RDL)', muscleGroup: 'legs', defaultWeight: 70, defaultReps: 10 },
    { id: 'l-4', name: '坐姿器械腿屈伸', muscleGroup: 'legs', defaultWeight: 45, defaultReps: 12 },
    { id: 'l-5', name: '俯卧器械腿弯举', muscleGroup: 'legs', defaultWeight: 35, defaultReps: 12 },
    { id: 'l-6', name: '哑铃负重箭步蹲', muscleGroup: 'legs', defaultWeight: 16, defaultReps: 12 },
    { id: 'l-7', name: '站姿/坐姿提踵', muscleGroup: 'legs', defaultWeight: 50, defaultReps: 15 },
  ],
  shoulders: [
    { id: 's-1', name: '站姿杠铃推举 (OHP)', muscleGroup: 'shoulders', defaultWeight: 45, defaultReps: 8 },
    { id: 's-2', name: '哑铃坐姿推肩', muscleGroup: 'shoulders', defaultWeight: 20, defaultReps: 10 },
    { id: 's-3', name: '哑铃侧平举 (中束)', muscleGroup: 'shoulders', defaultWeight: 10, defaultReps: 15 },
    { id: 's-4', name: '绳索面拉 (Face Pull)', muscleGroup: 'shoulders', defaultWeight: 25, defaultReps: 15 },
    { id: 's-5', name: '俯身哑铃飞鸟 (后束)', muscleGroup: 'shoulders', defaultWeight: 8, defaultReps: 15 },
  ],
  arms: [
    { id: 'a-1', name: 'EZ曲柄杠铃二头弯举', muscleGroup: 'arms', defaultWeight: 30, defaultReps: 10 },
    { id: 'a-2', name: '哑铃交替锤式弯举', muscleGroup: 'arms', defaultWeight: 14, defaultReps: 12 },
    { id: 'a-3', name: '绳索三头下压', muscleGroup: 'arms', defaultWeight: 30, defaultReps: 12 },
    { id: 'a-4', name: '仰卧杠铃臂屈伸 (碎头者)', muscleGroup: 'arms', defaultWeight: 25, defaultReps: 10 },
    { id: 'a-5', name: '单臂哑铃牧师凳弯举', muscleGroup: 'arms', defaultWeight: 12, defaultReps: 10 },
  ],
  core: [
    { id: 'cr-1', name: '悬垂举腿 (收腹提膝)', muscleGroup: 'core', defaultWeight: 0, defaultReps: 15, isBodyweight: true },
    { id: 'cr-2', name: '健腹轮跪姿推拉', muscleGroup: 'core', defaultWeight: 0, defaultReps: 12, isBodyweight: true },
    { id: 'cr-3', name: '标准平板支撑 (秒)', muscleGroup: 'core', defaultWeight: 0, defaultReps: 60, isBodyweight: true },
    { id: 'cr-4', name: '绳索跪姿负重卷腹', muscleGroup: 'core', defaultWeight: 35, defaultReps: 15 },
  ],
  cardio: [
    { id: 'cd-1', name: '跑步机坡度快走 / 慢跑', muscleGroup: 'cardio', defaultWeight: 0, defaultReps: 30 },
    { id: 'cd-2', name: 'Concept2 划船机', muscleGroup: 'cardio', defaultWeight: 0, defaultReps: 20 },
    { id: 'cd-3', name: '高阻力动感单车', muscleGroup: 'cardio', defaultWeight: 0, defaultReps: 30 },
    { id: 'cd-4', name: '户外路跑 5KM', muscleGroup: 'cardio', defaultWeight: 0, defaultReps: 26 },
  ],
  hiit: [
    { id: 'h-1', name: '波比跳 (Burpees)', muscleGroup: 'hiit', defaultWeight: 0, defaultReps: 15, isBodyweight: true },
    { id: 'h-2', name: '战绳交叉力量甩动', muscleGroup: 'hiit', defaultWeight: 0, defaultReps: 30 },
    { id: 'h-3', name: '重力药球砸地', muscleGroup: 'hiit', defaultWeight: 9, defaultReps: 15 },
    { id: 'h-4', name: '极速跳绳 500次', muscleGroup: 'hiit', defaultWeight: 0, defaultReps: 500 },
  ],
  stretch: [
    { id: 'st-1', name: '全身筋膜枪与泡沫轴放松', muscleGroup: 'stretch', defaultWeight: 0, defaultReps: 15 },
    { id: 'st-2', name: '深蹲与髋关节动态开髋', muscleGroup: 'stretch', defaultWeight: 0, defaultReps: 10 },
    { id: 'st-3', name: '胸背肩颈静态拉伸', muscleGroup: 'stretch', defaultWeight: 0, defaultReps: 10 },
  ],
};

export const INITIAL_WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: 'log-1',
    date: '2026-09-29',
    title: '胸部推力轰炸 & 手臂三头',
    muscleGroups: ['chest', 'arms'],
    durationMinutes: 55,
    exercisesList: [
      {
        id: 'ex-1',
        exerciseName: '杠铃平板卧推',
        muscleGroup: 'chest',
        sets: [
          { id: 's-1-1', setNumber: 1, weightKg: 60, reps: 12, completed: true },
          { id: 's-1-2', setNumber: 2, weightKg: 75, reps: 10, completed: true },
          { id: 's-1-3', setNumber: 3, weightKg: 80, reps: 8, completed: true },
          { id: 's-1-4', setNumber: 4, weightKg: 85, reps: 6, completed: true },
        ],
      },
      {
        id: 'ex-2',
        exerciseName: '哑铃上斜卧推',
        muscleGroup: 'chest',
        sets: [
          { id: 's-2-1', setNumber: 1, weightKg: 24, reps: 10, completed: true },
          { id: 's-2-2', setNumber: 2, weightKg: 26, reps: 8, completed: true },
          { id: 's-2-3', setNumber: 3, weightKg: 26, reps: 8, completed: true },
        ],
      },
      {
        id: 'ex-3',
        exerciseName: '绳索三头下压',
        muscleGroup: 'arms',
        sets: [
          { id: 's-3-1', setNumber: 1, weightKg: 30, reps: 12, completed: true },
          { id: 's-3-2', setNumber: 2, weightKg: 35, reps: 10, completed: true },
          { id: 's-3-3', setNumber: 3, weightKg: 40, reps: 8, completed: true },
        ],
      },
    ],
    exercises: '杠铃卧推 85kg·4组, 哑铃上斜卧推 26kg·3组, 绳索下压 40kg·3组',
    totalVolumeKg: 3240,
    intensity: 'intense',
    notes: '状态绝佳，平板卧推 85kg 稳健推起，胸部充血饱满！',
    completedAt: '16:30',
  },
  {
    id: 'log-2',
    date: '2026-09-27',
    title: '硬核背部拉力日 & 核心',
    muscleGroups: ['back', 'core'],
    durationMinutes: 60,
    exercisesList: [
      {
        id: 'ex-2-1',
        exerciseName: '传统杠铃硬拉',
        muscleGroup: 'back',
        sets: [
          { id: 's-d-1', setNumber: 1, weightKg: 100, reps: 8, completed: true },
          { id: 's-d-2', setNumber: 2, weightKg: 120, reps: 5, completed: true },
          { id: 's-d-3', setNumber: 3, weightKg: 130, reps: 3, completed: true },
        ],
      },
      {
        id: 'ex-2-2',
        exerciseName: '高位下拉 (正手/对握)',
        muscleGroup: 'back',
        sets: [
          { id: 's-l-1', setNumber: 1, weightKg: 55, reps: 12, completed: true },
          { id: 's-l-2', setNumber: 2, weightKg: 60, reps: 10, completed: true },
          { id: 's-l-3', setNumber: 3, weightKg: 65, reps: 8, completed: true },
        ],
      },
    ],
    exercises: '传统硬拉 130kg·3组, 高位下拉 65kg·3组, 悬垂举腿 4组',
    totalVolumeKg: 3680,
    intensity: 'intense',
    notes: '背部泵感强烈，背阔肌展开度好',
    completedAt: '18:00',
  },
  {
    id: 'log-3',
    date: '2026-09-25',
    title: '腿部深蹲力量摧毁日',
    muscleGroups: ['legs'],
    durationMinutes: 55,
    exercisesList: [
      {
        id: 'ex-3-1',
        exerciseName: '杠铃深蹲 (高杠/低杠)',
        muscleGroup: 'legs',
        sets: [
          { id: 's-sq-1', setNumber: 1, weightKg: 80, reps: 10, completed: true },
          { id: 's-sq-2', setNumber: 2, weightKg: 100, reps: 8, completed: true },
          { id: 's-sq-3', setNumber: 3, weightKg: 110, reps: 6, completed: true },
          { id: 's-sq-4', setNumber: 4, weightKg: 110, reps: 5, completed: true },
        ],
      },
    ],
    exercises: '杠铃深蹲 110kg·4组, 倒蹬机 160kg·3组, 腿弯举 3组',
    totalVolumeKg: 4200,
    intensity: 'extreme',
    notes: '下半身完全力竭，走出力量区双腿发软',
    completedAt: '19:15',
  },
  {
    id: 'log-4',
    date: '2026-09-23',
    title: '三角肌雕刻 & 有氧暴汗',
    muscleGroups: ['shoulders', 'cardio'],
    durationMinutes: 45,
    exercises: '站姿推举 45kg·4组, 哑铃侧平举 12kg·4组, 跑步机 20min',
    totalVolumeKg: 1950,
    intensity: 'moderate',
    notes: '中束球状感饱满，有氧高效燃脂',
    completedAt: '17:40',
  },
  {
    id: 'log-5',
    date: '2026-09-21',
    title: '晨间快节奏胸肌唤醒',
    muscleGroups: ['chest', 'core'],
    durationMinutes: 40,
    exercises: '哑铃上斜推 22kg·4组, 蝴蝶机 40kg·4组, 悬垂举腿',
    totalVolumeKg: 2100,
    intensity: 'moderate',
    notes: '早间激活，神清气爽',
    completedAt: '08:30',
  },
  {
    id: 'log-6',
    date: '2026-09-18',
    title: '背部厚度与二头峰顶',
    muscleGroups: ['back', 'arms'],
    durationMinutes: 50,
    exercises: '俯身划船 65kg·4组, 坐姿划船 55kg·4组, 牧师凳弯举 4组',
    totalVolumeKg: 2850,
    intensity: 'intense',
    notes: '斜方与菱形肌酸胀明显',
    completedAt: '18:40',
  },
  {
    id: 'log-7',
    date: '2026-09-15',
    title: '动态恢复与心肺拉伸',
    muscleGroups: ['cardio', 'stretch'],
    durationMinutes: 40,
    exercises: '户外路跑 5KM, 泡沫轴全身筋膜放松 15min',
    totalVolumeKg: 0,
    intensity: 'light',
    notes: '舒缓酸痛，全身放松',
    completedAt: '20:10',
  },
];

export function calculateWorkoutStreak(logs: WorkoutLog[]): number {
  if (!logs || logs.length === 0) return 0;
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];

  let streak = 0;
  let checkDate = new Date();

  if (dates.includes(todayStr)) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dates.includes(yesterdayStr)) {
      streak = 1;
      checkDate = yesterday;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return 0;
    }
  }

  while (true) {
    const curStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(curStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getMuscleDistribution(logs: WorkoutLog[]): Record<MuscleGroup, number> {
  const counts: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0,
    core: 0,
    cardio: 0,
    hiit: 0,
    stretch: 0,
  };

  logs.forEach((log) => {
    log.muscleGroups.forEach((mg) => {
      if (counts[mg] !== undefined) {
        counts[mg]++;
      }
    });
  });

  return counts;
}

export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}
