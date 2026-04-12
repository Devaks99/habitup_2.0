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
  isSystem?: boolean;
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

function padDatePart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function getDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}`;
}

export function getTodayKey(date: Date = new Date()): string {
  return getDateKey(date);
}

export function getYesterdayKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return getDateKey(d);
}

export function getTodayWeekDay(date: Date = new Date()): WeekDay {
  const days: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

export function isHabitActiveOnDate(habit: Habit, date: Date = new Date()): boolean {
  if (habit.type === 'daily') return true;
  const today = getTodayWeekDay(date);
  return habit.scheduledDays?.includes(today) ?? false;
}

export function isHabitActiveToday(habit: Habit): boolean {
  return isHabitActiveOnDate(habit);
}

export const COMPLETION_MESSAGES = [
  '🎉 Incrível! Todos os hábitos concluídos!',
  '🔥 Você está em chamas! Dia perfeito!',
  '⭐ Excelente! Consistência é a chave!',
  '💪 Parabéns! Mais um dia de evolução!',
  '🏆 Campeão! Continue assim!',
  '✨ Brilhante! Seu eu do futuro agradece!',
];
