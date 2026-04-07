import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { CelebrationBanner } from '@/components/CelebrationBanner';
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

function getMotivationalText(percentage: number, hasStreak: boolean): string {
  if (percentage === 100) return 'Dia perfeito! 🏆';
  if (percentage >= 75) return 'Quase lá, continue!';
  if (percentage >= 50) return 'Bom progresso!';
  if (hasStreak) return 'Mantenha sua sequência!';
  return 'Vamos começar o dia!';
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

  // SVG circle progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-10 pb-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground mb-0.5">
                {dayName}, {dateStr}
              </p>
              <h1 className="text-[26px] font-display font-bold text-foreground leading-tight tracking-tight">
                {profile.name ? `${greeting}, ${profile.name}` : `${greeting}!`}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full hover:bg-muted w-9 h-9 mt-1"
            >
              <Settings className="w-[18px] h-[18px] text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pb-28 space-y-6">
        {/* Progress hero — circular progress + stats */}
        {todayHabits.length > 0 && (
          <div className={`rounded-3xl border p-6 transition-all duration-500 ${
            hasStreak
              ? 'bg-gradient-to-br from-accent/6 to-card border-accent/15'
              : 'bg-card border-border'
          }`}>
            <div className="flex items-center gap-6">
              {/* Circular progress */}
              <div className="relative flex-shrink-0">
                <svg width="128" height="128" className="transform -rotate-90">
                  <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={completionPercentage === 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-foreground leading-none">
                    {completionPercentage}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {completedCount}/{todayHabits.length}
                  </span>
                </div>
              </div>

              {/* Right side — streak, xp, motivational */}
              <div className="flex-1 min-w-0 space-y-3">
                <p className="text-sm text-muted-foreground leading-snug">
                  {getMotivationalText(completionPercentage, hasStreak)}
                </p>

                {/* Streak pill */}
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 ${
                    hasStreak
                      ? 'bg-accent/15 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Flame className="w-3.5 h-3.5" />
                    {stats.currentStreak} {stats.currentStreak === 1 ? 'dia' : 'dias'}
                  </div>
                </div>

                {/* XP bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-xp" />
                      <span className="text-[11px] font-semibold text-foreground">Nv. {stats.level}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{xpProgress}/100</span>
                  </div>
                  <Progress value={xpProgress} className="h-1.5 bg-secondary [&>div]:bg-xp" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Celebration */}
        <CelebrationBanner message={celebrationMessage} />

        {/* Habits list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">
              Hábitos de hoje
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 rounded-full h-8 px-3 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </Button>
          </div>

          {todayHabits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="text-5xl mb-4">🌱</p>
              <p className="text-sm text-muted-foreground mb-1 font-medium">
                Nenhum hábito ainda
              </p>
              <p className="text-xs text-muted-foreground/70 mb-5">
                Comece adicionando seu primeiro hábito!
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2 h-10 px-5"
              >
                <Plus className="w-4 h-4" />
                Adicionar hábito
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayHabits.map((habit, i) => (
                <div
                  key={habit.id}
                  className="animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <HabitCard
                    habit={habit}
                    completed={isCompleted(habit.id)}
                    onToggle={() => toggleHabit(habit.id)}
                    onRemove={() => removeHabit(habit.id)}
                    xpPopup={xpPopup}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reset — subtle, at the bottom */}
        {stats.totalXp > 0 && (
          <div className="flex justify-center pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-[11px] text-muted-foreground/40 hover:text-destructive/70 transition-colors flex items-center gap-1 py-2 px-3 rounded-full hover:bg-destructive/5">
                  <RotateCcw className="w-3 h-3" />
                  Resetar progresso
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">Resetar tudo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Seu XP, nível e sequência serão zerados. Os hábitos cadastrados serão mantidos. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={resetXp}
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <AddHabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addHabit} />
    </div>
  );
};

export default Index;
