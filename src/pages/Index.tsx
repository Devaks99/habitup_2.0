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
      <header className="sticky top-0 z-10 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 backdrop-blur-xl rounded-b-[2rem] shadow-lg shadow-primary/10">
          <div className="mx-auto max-w-lg px-5 pt-6 pb-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/10">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary-foreground/70 tracking-wide">
                    {dayName}, {dateStr}
                  </p>
                  <h1 className="text-xl font-display font-bold text-primary-foreground leading-tight mt-0.5">
                    {profile.name ? `${greeting}, ${profile.name} 👋` : `${greeting}!`}
                  </h1>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="rounded-xl hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground mt-0.5"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Mini stats in header */}
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 px-3.5 py-2.5">
                <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wider">Nível</p>
                <p className="text-lg font-display font-bold text-primary-foreground leading-tight">{stats.level}</p>
              </div>
              <div className="flex-1 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 px-3.5 py-2.5">
                <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wider">XP Total</p>
                <p className="text-lg font-display font-bold text-primary-foreground leading-tight">{stats.totalXp}</p>
              </div>
              <div className="flex-1 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 px-3.5 py-2.5">
                <p className="text-[10px] font-medium text-primary-foreground/60 uppercase tracking-wider">Hoje</p>
                <p className="text-lg font-display font-bold text-primary-foreground leading-tight">
                  {todayHabits.length > 0 ? `${completedCount}/${todayHabits.length}` : '—'}
                </p>
              </div>
            </div>
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
