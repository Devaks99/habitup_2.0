import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { XpBar } from '@/components/XpBar';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { CelebrationBanner } from '@/components/CelebrationBanner';
import { DailyProgress } from '@/components/DailyProgress';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { WEEKDAY_LABELS, getTodayWeekDay } from '@/types/habit';

const WEEKDAY_FULL: Record<string, string> = {
  mon: 'Segunda-feira',
  tue: 'Terça-feira',
  wed: 'Quarta-feira',
  thu: 'Quinta-feira',
  fri: 'Sexta-feira',
  sat: 'Sábado',
  sun: 'Domingo',
};

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    todayHabits,
    stats,
    addHabit,
    removeHabit,
    toggleHabit,
    isCompleted,
    completionPercentage,
    xpPopup,
    celebrationMessage,
    progress,
  } = useHabits();

  const today = new Date();
  const dayName = WEEKDAY_FULL[getTodayWeekDay()];
  const dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  const completedCount = todayHabits.filter(h => isCompleted(h.id)).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 pb-24">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-xp" />
            <h1 className="text-2xl font-display font-bold text-foreground">Hábitos</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {dayName}, {dateStr}
          </p>
        </header>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <XpBar stats={stats} />
          {todayHabits.length > 0 && (
            <DailyProgress
              percentage={completionPercentage}
              completed={completedCount}
              total={todayHabits.length}
            />
          )}
        </div>

        {/* Celebration */}
        <div className="mb-6">
          <CelebrationBanner message={celebrationMessage} />
        </div>

        {/* Habits */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Hábitos de hoje
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Novo
            </Button>
          </div>

          {todayHabits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-sm text-muted-foreground mb-4">
                Nenhum hábito cadastrado ainda.<br />
                Comece adicionando seu primeiro hábito!
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar hábito
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed={isCompleted(habit.id)}
                  onToggle={() => toggleHabit(habit.id)}
                  onRemove={() => removeHabit(habit.id)}
                  xpPopup={xpPopup}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AddHabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addHabit} />
    </div>
  );
};

export default Index;
