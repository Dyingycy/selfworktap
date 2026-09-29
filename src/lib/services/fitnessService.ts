import { WorkoutLog, MuscleGroup } from '@/types';

export interface MuscleGroupMeta {
  id: MuscleGroup;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
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

export const INITIAL_WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: 'log-1',
    date: '2026-09-29',
    muscleGroups: ['chest', 'arms'],
    durationMinutes: 50,
    exercises: '杠铃卧推 80kg x 4组, 哑铃上斜飞鸟, 绳索下压',
    intensity: 'intense',
    notes: '胸部充血明显，推力状态稳定',
    completedAt: '16:30',
  },
  {
    id: 'log-2',
    date: '2026-09-27',
    muscleGroups: ['back', 'core'],
    durationMinutes: 60,
    exercises: '引体向上 4组, 高位下拉, 坐姿划船, 悬垂举腿',
    intensity: 'intense',
    notes: '背部泵感强烈，核心稳定',
    completedAt: '18:00',
  },
  {
    id: 'log-3',
    date: '2026-09-25',
    muscleGroups: ['legs'],
    durationMinutes: 55,
    exercises: '深蹲 100kg x 5组, 倒蹬机, 腿屈伸, 提踵',
    intensity: 'extreme',
    notes: '练腿日力竭，下楼梯酸痛',
    completedAt: '19:15',
  },
  {
    id: 'log-4',
    date: '2026-09-23',
    muscleGroups: ['shoulders', 'cardio'],
    durationMinutes: 45,
    exercises: '哑铃推举, 侧平举超级组, 跑步机爬坡 20min',
    intensity: 'moderate',
    notes: '中束泵感饱满，有氧暴汗',
    completedAt: '17:40',
  },
  {
    id: 'log-5',
    date: '2026-09-21',
    muscleGroups: ['chest', 'core'],
    durationMinutes: 45,
    exercises: '平板卧推, 双杠臂屈伸, 平板支撑',
    intensity: 'moderate',
    notes: '早间激活训练',
    completedAt: '08:30',
  },
  {
    id: 'log-6',
    date: '2026-09-18',
    muscleGroups: ['back', 'arms'],
    durationMinutes: 50,
    exercises: '硬拉 120kg, 杠铃划船, 牧师凳弯举',
    intensity: 'intense',
    notes: '后背厚度训练',
    completedAt: '18:40',
  },
  {
    id: 'log-7',
    date: '2026-09-15',
    muscleGroups: ['cardio', 'stretch'],
    durationMinutes: 40,
    exercises: '户外慢跑 5km, 泡沫轴全身筋膜放松',
    intensity: 'light',
    notes: '动态恢复，心肺激活',
    completedAt: '20:10',
  },
];

// Calculate consecutive active streak in days
export function calculateWorkoutStreak(logs: WorkoutLog[]): number {
  if (!logs || logs.length === 0) return 0;
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];

  let streak = 0;
  let checkDate = new Date();

  // If today is trained
  if (dates.includes(todayStr)) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday was trained
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

// Muscle group frequency counts
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
