export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

export const WEEKDAYS: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  type: 'daily' | 'scheduled';
  scheduledDays?: WeekDay[];
  xpReward: number;
  createdAt: string;
  order: number;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  totalXpEarned: number;
  allCompleted: boolean;
}

export interface UserStats {
  totalXp: number;
  level: number;
  currentStreak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getXpForNextLevel(xp: number): number {
  const level = getLevel(xp);
  return level * 100;
}

export function getXpProgress(xp: number): number {
  return xp % 100;
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getTodayWeekDay(): WeekDay {
  const days: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date().getDay()];
}

export function isHabitActiveToday(habit: Habit): boolean {
  if (habit.type === 'daily') return true;
  const today = getTodayWeekDay();
  return habit.scheduledDays?.includes(today) ?? false;
}

export const COMPLETION_MESSAGES = [
  '🎉 Incrível! Todos os hábitos concluídos!',
  '🔥 Você está em chamas! Dia perfeito!',
  '⭐ Excelente! Consistência é a chave!',
  '💪 Parabéns! Mais um dia de evolução!',
  '🏆 Campeão! Continue assim!',
  '✨ Brilhante! Seu eu do futuro agradece!',
];
