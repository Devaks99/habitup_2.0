import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { CelebrationBanner } from '@/components/CelebrationBanner';
import { DailyProgress } from '@/components/DailyProgress';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Settings, Flame, Star, RotateCcw } from 'lucide-react';
import { getTodayWeekDay, getXpProgress } from '@/types/habit';
import type { UserProfile } from '@/types/userProfile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
    resetXp,
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
  const xpProgress = getXpProgress(stats.totalXp);
  const hasStreak = stats.currentStreak > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header — clean & minimal */}
      <header className="pt-8 pb-2 px-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground tracking-wide">
              {dayName}, {dateStr}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-xl hover:bg-muted -mr-2 w-8 h-8"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground leading-tight">
            {profile.name ? `${greeting}, ${profile.name}` : `${greeting}!`}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-5 pb-24 space-y-5">
        {/* Streak + XP card */}
        <div className={`rounded-2xl border p-5 transition-all duration-500 ${
          hasStreak
            ? 'bg-gradient-to-br from-accent/8 via-card to-card border-accent/25 shadow-sm shadow-accent/5'
            : 'bg-card border-border'
        }`}>
          <div className="flex items-center justify-between mb-4">
            {/* Streak */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-500 ${
                hasStreak ? 'bg-accent/15' : 'bg-muted'
              }`}>
                <Flame className={`w-5 h-5 transition-colors duration-500 ${
                  hasStreak ? 'text-accent' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-display font-bold leading-none ${
                  hasStreak ? 'text-accent' : 'text-muted-foreground'
                }`}>
                  {stats.currentStreak}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.currentStreak === 1 ? 'dia de sequência' : 'dias de sequência'}
                </p>
              </div>
            </div>

            {/* Level + XP */}
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <Star className="w-4 h-4 text-xp" />
                <p className="text-sm font-display font-bold text-foreground">Nível {stats.level}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{stats.totalXp} XP</p>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="space-y-1.5">
            <Progress value={xpProgress} className="h-2 bg-secondary [&>div]:bg-xp" />
            <div className="flex justify-between">
              <p className="text-[10px] text-muted-foreground">{xpProgress}/100 XP</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-[10px] text-muted-foreground/50 hover:text-destructive transition-colors flex items-center gap-0.5">
                    <RotateCcw className="w-2.5 h-2.5" />
                    resetar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Resetar progresso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá zerar seu XP, nível e sequência. Seus hábitos serão mantidos. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={resetXp}
                      className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirmar reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Daily progress */}
        {todayHabits.length > 0 && (
          <DailyProgress
            percentage={completionPercentage}
            completed={completedCount}
            total={todayHabits.length}
          />
        )}

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
