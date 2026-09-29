export type NewsSource = 'all' | '36kr' | 'sspai' | 'v2ex' | 'github' | 'hackernews';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  aiSummary?: string;
  url: string;
  source: NewsSource;
  sourceName: string;
  publishTime: string;
  hotScore?: number;
  tags?: string[];
}

export interface DouyinHotItem {
  position: number;
  word: string;
  hotValue: number;
  label?: string; // '新' | '热' | '爆'
  isTech: boolean;
  categoryTag: string; // 'AI前沿' | '数码新品' | '数智出行' | '全网热搜'
  url: string;
  videoCount?: number;
  aiTakeaway?: string;
}

export interface DailyBriefHighlight {
  title: string;
  takeaway: string;
  impact: string;
  source?: string;
}

export interface DailyBriefing {
  date: string;
  title: string;
  overview: string;
  highlights: DailyBriefHighlight[];
  techTrends: string[];
  quoteOfTheDay: string;
  generatedAt: string;
}

export interface AskAiRequest {
  title: string;
  content: string;
  sourceName?: string;
  question: string;
  apiKey?: string;
}

export interface AskAiResponse {
  answer: string;
  keyPoints?: string[];
  takeaway?: string;
}

// === Personal Workbench Extensions ===

export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoCategory = 'work' | 'study' | 'life' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  category?: TodoCategory;
  subTasks?: SubTask[];
  isAiDecomposing?: boolean;
  createdAt: string;
  sourceNewsTitle?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  icon: string;
  target: string;
  completedToday: boolean;
  streakCount: number;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string; // Emoji or label
  color?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// === Weather & Commute Types ===

export interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
}

export interface WeatherAdvice {
  commute: string;
  clothing: string;
  brief: string;
}

export interface WeatherData {
  city: string;
  district?: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  advice: WeatherAdvice;
  daily: DailyForecast[];
  updatedAt: string;
}

// === Fitness & Workout Training Types ===

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'hiit' | 'stretch';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: WorkoutSet[];
}

export interface WorkoutLog {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title?: string;
  muscleGroups: MuscleGroup[];
  durationMinutes: number;
  exercisesList?: ExerciseLog[];
  exercises?: string;
  totalVolumeKg?: number;
  intensity?: 'light' | 'moderate' | 'intense' | 'extreme';
  notes?: string;
  completedAt: string;
}
