import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '@/hooks/useHabits';
import { XpBar } from '@/components/XpBar';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { CelebrationBanner } from '@/components/CelebrationBanner';
import { DailyProgress } from '@/components/DailyProgress';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Settings } from 'lucide-react';
import { WEEKDAY_LABELS, getTodayWeekDay } from '@/types/habit';
import type { UserProfile } from '@/types/userProfile';

const WEEKDAY_FULL: Record<string, string> = {
  mon: 'Segunda-feira',
  tue: 'Terça-feira',
  wed: 'Quarta-feira',
  thu: 'Quinta-feira',
  fri: 'Sexta-feira',
  sat: 'Sábado',
  sun: 'Domingo',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

interface IndexProps {
  profile: UserProfile;
}

const Index = ({ profile }: IndexProps) => {
  const navigate = useNavigate();
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
  } = useHabits();

  const today = new Date();
  const dayName = WEEKDAY_FULL[getTodayWeekDay()];
  const dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  const completedCount = todayHabits.filter(h => isCompleted(h.id)).length;
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/50 rounded-b-3xl">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-foreground leading-tight">
                  {profile.name ? `${greeting}, ${profile.name}` : 'Meus Hábitos'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {dayName}, {dateStr}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-xl hover:bg-muted"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6 pb-24 space-y-5">
        {/* Stats */}
        <div className="space-y-3">
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
        <CelebrationBanner message={celebrationMessage} />

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
