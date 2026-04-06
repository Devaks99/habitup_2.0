import { useState, useEffect, useCallback } from 'react';
import type { Habit, DayProgress, UserStats } from '@/types/habit';
import { getTodayKey, isHabitActiveToday, getLevel } from '@/types/habit';

const HABITS_KEY = 'habits-app-habits';
const PROGRESS_KEY = 'habits-app-progress';
const STATS_KEY = 'habits-app-stats';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => loadFromStorage(HABITS_KEY, []));
  const [progress, setProgress] = useState<DayProgress>(() => {
    const today = getTodayKey();
    const saved = loadFromStorage<DayProgress>(PROGRESS_KEY, {
      date: today,
      completedHabitIds: [],
      totalXpEarned: 0,
      allCompleted: false,
    });
    // Reset if different day
    if (saved.date !== today) {
      return { date: today, completedHabitIds: [], totalXpEarned: 0, allCompleted: false };
    }
    return saved;
  });
  const [stats, setStats] = useState<UserStats>(() =>
    loadFromStorage(STATS_KEY, { totalXp: 0, level: 1, currentStreak: 0 })
  );
  const [xpPopup, setXpPopup] = useState<{ amount: number; id: string } | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  useEffect(() => saveToStorage(HABITS_KEY, habits), [habits]);
  useEffect(() => saveToStorage(PROGRESS_KEY, progress), [progress]);
  useEffect(() => saveToStorage(STATS_KEY, stats), [stats]);

  const todayHabits = habits.filter(isHabitActiveToday);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const removeHabit = useCallback((id: string) => {
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
      const isCompleted = prev.completedHabitIds.includes(habitId);
      let newCompleted: string[];
      let xpChange = 0;

      if (isCompleted) {
        newCompleted = prev.completedHabitIds.filter(id => id !== habitId);
        xpChange = -habit.xpReward;
      } else {
        newCompleted = [...prev.completedHabitIds, habitId];
        xpChange = habit.xpReward;
        setXpPopup({ amount: habit.xpReward, id: habitId });
        setTimeout(() => setXpPopup(null), 1000);
      }

      const activeHabits = habits.filter(isHabitActiveToday);
      const allDone = activeHabits.length > 0 && activeHabits.every(h => newCompleted.includes(h.id));

      // Bonus XP for completing all
      let bonusXp = 0;
      if (allDone && !prev.allCompleted) {
        bonusXp = 50;
        const msgs = [
          '🎉 Incrível! Todos os hábitos concluídos!',
          '🔥 Você está em chamas! Dia perfeito!',
          '⭐ Excelente! Consistência é a chave!',
          '💪 Parabéns! Mais um dia de evolução!',
          '🏆 Campeão! Continue assim!',
        ];
        setCelebrationMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        setTimeout(() => setCelebrationMessage(null), 4000);
      }

      setStats(s => {
        const newXp = Math.max(0, s.totalXp + xpChange + bonusXp);
        return { ...s, totalXp: newXp, level: getLevel(newXp) };
      });

      return {
        ...prev,
        completedHabitIds: newCompleted,
        totalXpEarned: prev.totalXpEarned + xpChange + bonusXp,
        allCompleted: allDone,
      };
    });
  }, [habits]);

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
    addHabit,
    removeHabit,
    toggleHabit,
    isCompleted,
    completionPercentage,
    xpPopup,
    celebrationMessage,
  };
}
