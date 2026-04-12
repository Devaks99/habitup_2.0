import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Habit, DayProgress, UserStats } from '@/types/habit';
import { getTodayKey, getYesterdayKey, isHabitActiveOnDate, getLevel } from '@/types/habit';


const HABITS_KEY = 'habits-app-habits';
const PROGRESS_KEY = 'habits-app-progress';
const STATS_KEY = 'habits-app-stats';
const PAUSE_CONSCIOUS_KEY = 'habits-app-pause-conscious-enabled';
export const PAUSE_CONSCIOUS_HABIT_ID = 'pause-conscious-habit';

function createEmptyProgress(date: string): DayProgress {
  return {
    date,
    completedHabitIds: [],
    totalXpEarned: 0,
    allCompleted: false,
  };
}

function normalizeProgress(saved: DayProgress, currentDate: string): DayProgress {
  if (saved.date !== currentDate) {
    return createEmptyProgress(currentDate);
  }
  return saved;
}

function normalizeStats(saved: UserStats, currentDate: string): UserStats {
  const merged = { ...DEFAULT_STATS, ...saved };
  if (!merged.lastCompletedDate) {
    return merged;
  }

  const yesterday = getYesterdayKey();
  if (merged.lastCompletedDate !== yesterday && merged.lastCompletedDate !== currentDate) {
    return { ...merged, currentStreak: 0 };
  }

  return merged;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function loadBooleanFromStorage(key: string, fallback: boolean): boolean {
  const value = loadFromStorage<string | null>(key, null);
  if (value === null) return fallback;
  return value === 'true' || value === true;
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

function createPauseConsciousHabit(order: number): Habit {
  return {
    id: PAUSE_CONSCIOUS_HABIT_ID,
    name: 'Pausa sem tela',
    emoji: '🧘',
    type: 'daily',
    xpReward: 45,
    createdAt: new Date().toISOString(),
    order,
    isSystem: true,
  };
}

const DEFAULT_STATS: UserStats = { totalXp: 0, level: 1, currentStreak: 0, lastCompletedDate: null };

export function useHabits() {
  const [currentDate, setCurrentDate] = useState(() => getTodayKey());
  const initialPauseEnabled = loadBooleanFromStorage(PAUSE_CONSCIOUS_KEY, false);
  const [habits, setHabits] = useState<Habit[]>(() => {
    const loaded = loadFromStorage<Habit[]>(HABITS_KEY, []);
    if (initialPauseEnabled) {
      const hasPause = loaded.some((h) => h.id === PAUSE_CONSCIOUS_HABIT_ID);
      return hasPause ? loaded : [...loaded, createPauseConsciousHabit(loaded.length)];
    }
    return loaded.filter((h) => h.id !== PAUSE_CONSCIOUS_HABIT_ID);
  });
  const [pauseConsciousEnabled, setPauseConsciousEnabledState] = useState<boolean>(initialPauseEnabled);
  const [progress, setProgress] = useState<DayProgress>(() => {
    const today = getTodayKey();
    const saved = loadFromStorage<DayProgress>(PROGRESS_KEY, createEmptyProgress(today));
    return normalizeProgress(saved, today);
  });
  const [stats, setStats] = useState<UserStats>(() => {
    const today = getTodayKey();
    const saved = loadFromStorage<UserStats>(STATS_KEY, DEFAULT_STATS);
    return normalizeStats(saved, today);
  });
  const [xpPopup, setXpPopup] = useState<{ amount: number; id: string } | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  useEffect(() => saveToStorage(HABITS_KEY, habits), [habits]);
  useEffect(() => saveToStorage(PROGRESS_KEY, progress), [progress]);
  useEffect(() => saveToStorage(STATS_KEY, stats), [stats]);
  useEffect(() => saveToStorage(PAUSE_CONSCIOUS_KEY, pauseConsciousEnabled), [pauseConsciousEnabled]);

  useEffect(() => {
    const syncCurrentDate = () => {
      setCurrentDate((prev) => {
        const next = getTodayKey();
        return prev === next ? prev : next;
      });
    };

    syncCurrentDate();

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeoutMs = nextMidnight.getTime() - now.getTime();

    const timeoutId = window.setTimeout(syncCurrentDate, timeoutMs);
    window.addEventListener('focus', syncCurrentDate);
    document.addEventListener('visibilitychange', syncCurrentDate);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('focus', syncCurrentDate);
      document.removeEventListener('visibilitychange', syncCurrentDate);
    };
  }, [currentDate]);

  useEffect(() => {
    setProgress((prev) => normalizeProgress(prev, currentDate));
    setStats((prev) => normalizeStats(prev, currentDate));
  }, [currentDate]);

  useEffect(() => {
    setHabits((prev) => {
      const hasPause = prev.some((h) => h.id === PAUSE_CONSCIOUS_HABIT_ID);
      if (pauseConsciousEnabled) {
        return hasPause ? prev : [...prev, createPauseConsciousHabit(prev.length)];
      }
      return prev.filter((h) => h.id !== PAUSE_CONSCIOUS_HABIT_ID);
    });
    setProgress((prev) => ({
      ...prev,
      completedHabitIds: prev.completedHabitIds.filter((id) => id !== PAUSE_CONSCIOUS_HABIT_ID),
    }));
  }, [pauseConsciousEnabled]);

  const todayHabits = useMemo(() => {
    const referenceDate = new Date(`${currentDate}T12:00:00`);
    return habits.filter((habit) => isHabitActiveOnDate(habit, referenceDate));
  }, [habits, currentDate]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      order: habits.length,
    };
    setHabits(prev => [...prev, newHabit]);
  }, [habits.length]);

  const setPauseConsciousEnabled = useCallback((enabled: boolean) => {
    setPauseConsciousEnabledState(enabled);
  }, []);

  const removeHabit = useCallback((id: string) => {
    if (id === PAUSE_CONSCIOUS_HABIT_ID) return;
    setHabits(prev => prev.filter(h => h.id !== id));
    setProgress(prev => ({
      ...prev,
      completedHabitIds: prev.completedHabitIds.filter(hid => hid !== id),
    }));
  }, []);

  const toggleHabit = useCallback((habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    setProgress(prev => {
      const baseProgress = prev.date === currentDate ? prev : createEmptyProgress(currentDate);
      const wasCompleted = baseProgress.completedHabitIds.includes(habitId);
      let newCompleted: string[];
      let xpChange = 0;

      if (wasCompleted) {
        newCompleted = baseProgress.completedHabitIds.filter(id => id !== habitId);
        xpChange = -habit.xpReward;
      } else {
        newCompleted = [...baseProgress.completedHabitIds, habitId];
        xpChange = habit.xpReward;
        setXpPopup({ amount: habit.xpReward, id: habitId });
        setTimeout(() => setXpPopup(null), 1000);
      }

      const referenceDate = new Date(`${currentDate}T12:00:00`);
      const activeHabits = habits.filter((activeHabit) => isHabitActiveOnDate(activeHabit, referenceDate));
      const allDone = activeHabits.length > 0 && activeHabits.every(h => newCompleted.includes(h.id));

      let bonusXp = 0;
      if (allDone && !baseProgress.allCompleted) {
        bonusXp = 50;
        const msgs = [
          '🎉 Incrível! Todos os hábitos concluídos!',
          '🔥 Você está em chamas! Dia perfeito!',
          '⭐ Excelente! Consistência é a chave!',
          '💪 Parabéns! Mais um dia de evolução!',
          '🏆 Campeão! Continue assim!',
        ];
        setCelebrationMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        setTimeout(() => setCelebrationMessage(null), 8000);
      }

      // Update stats with streak logic
      setStats(s => {
        const newXp = Math.max(0, s.totalXp + xpChange + bonusXp);
        const today = currentDate;

        let newStreak = s.currentStreak;
        let newLastDate = s.lastCompletedDate;

        if (allDone && !baseProgress.allCompleted) {
          // Just completed all habits today
          if (s.lastCompletedDate === getYesterdayKey(referenceDate) || s.lastCompletedDate === today) {
            newStreak = s.lastCompletedDate === today ? s.currentStreak : s.currentStreak + 1;
          } else {
            newStreak = 1; // Start new streak
          }
          newLastDate = today;
        } else if (!allDone && baseProgress.allCompleted) {
          // Unchecked a habit, lost today's completion
          if (s.lastCompletedDate === today) {
            newStreak = Math.max(0, s.currentStreak - 1);
            newLastDate = newStreak > 0 ? getYesterdayKey(referenceDate) : null;
          }
        }

        return { totalXp: newXp, level: getLevel(newXp), currentStreak: newStreak, lastCompletedDate: newLastDate };
      });

      return {
        ...baseProgress,
        completedHabitIds: newCompleted,
        totalXpEarned: baseProgress.totalXpEarned + xpChange + bonusXp,
        allCompleted: allDone,
      };
    });
  }, [habits, currentDate]);

  const resetXp = useCallback(() => {
    setStats({ totalXp: 0, level: 1, currentStreak: 0, lastCompletedDate: null });
  }, []);

  const reorderHabits = useCallback((habitIds: string[]) => {
    setHabits(prev => {
      const habitMap = new Map(prev.map(h => [h.id, h]));
      return habitIds
        .map((id, index) => {
          const habit = habitMap.get(id);
          if (!habit) return null;
          return { ...habit, order: index };
        })
        .filter((h): h is Habit => h !== null);
    });
  }, []);

  const isCompleted = useCallback((habitId: string) => {
    return progress.completedHabitIds.includes(habitId);
  }, [progress.completedHabitIds]);

  const completionPercentage = todayHabits.length > 0
    ? Math.round((progress.completedHabitIds.filter(id => todayHabits.some(h => h.id === id)).length / todayHabits.length) * 100)
    : 0;

  return {
    habits,
    todayHabits,
    progress,
    stats,
    pauseConsciousEnabled,
    setPauseConsciousEnabled,
    addHabit,
    removeHabit,
    toggleHabit,
    resetXp,
    isCompleted,
    completionPercentage,
    xpPopup,
    celebrationMessage,
    reorderHabits,
  };
}
