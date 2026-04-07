import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { CelebrationBanner } from '@/components/CelebrationBanner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Settings, Flame, Star, RotateCcw, ChevronDown, Calendar, Repeat, Trash2 } from 'lucide-react';
import { getTodayWeekDay, getXpProgress, WEEKDAY_LABELS } from '@/types/habit';
import mascotImg from '@/assets/mascote_habitup.png';
import type { UserProfile } from '@/types/userProfile';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const WEEKDAY_FULL: Record<string, string> = {
  mon: 'Segunda-feira', tue: 'Terça-feira', wed: 'Quarta-feira',
  thu: 'Quinta-feira', fri: 'Sexta-feira', sat: 'Sábado', sun: 'Domingo',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getMotivationalText(pct: number, streak: boolean): string {
  if (pct === 100) return 'Dia perfeito! 🏆';
  if (pct >= 75) return 'Quase lá, continue!';
  if (pct >= 50) return 'Bom progresso!';
  if (streak) return 'Mantenha sua sequência!';
  return 'Vamos começar o dia!';
}

interface IndexProps {
  profile: UserProfile;
}

const Index = ({ profile }: IndexProps) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAllHabits, setShowAllHabits] = useState(false);
  const {
    habits,
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

  const dailyHabits = habits.filter(h => h.type === 'daily');
  const scheduledHabits = habits.filter(h => h.type === 'scheduled');

  // SVG circle
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-8 pb-5">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">H</span>
              </div>
              <span className="font-display font-bold text-foreground text-lg tracking-tight">HabitUp</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full hover:bg-muted w-9 h-9"
            >
              <Settings className="w-[18px] h-[18px] text-muted-foreground" />
            </Button>
          </div>
          <div>
            <p className="text-[13px] text-muted-foreground">
              {dayName}, {dateStr}
            </p>
            <h1 className="text-[22px] font-display font-bold text-foreground leading-tight tracking-tight mt-0.5">
              {profile.name ? `${greeting}, ${profile.name}` : `${greeting}!`}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pb-28 space-y-5">
        {/* Progress card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl border p-5 transition-colors duration-500 ${
            hasStreak
              ? 'bg-gradient-to-br from-accent/6 to-card border-accent/15'
              : 'bg-card border-border'
          }`}
        >
          <div className="flex items-center gap-5">
            {/* Circular progress */}
            {todayHabits.length > 0 ? (
              <div className="relative flex-shrink-0">
                <svg width="108" height="108" className="transform -rotate-90">
                  <circle
                    cx="54" cy="54" r={radius}
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="7"
                  />
                  <motion.circle
                    cx="54" cy="54" r={radius}
                    fill="none"
                    stroke={completionPercentage === 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: progressOffset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-display font-bold text-foreground leading-none">
                    {completionPercentage}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {completedCount}/{todayHabits.length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative flex-shrink-0 w-[108px] h-[108px] flex items-center justify-center">
                <img src={mascotImg} alt="HabitUp mascote" className="w-20 h-20 object-contain" />
              </div>
            )}

            {/* Stats column */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <p className="text-[13px] text-muted-foreground leading-snug">
                {todayHabits.length > 0
                  ? getMotivationalText(completionPercentage, hasStreak)
                  : 'Adicione seu primeiro hábito!'}
              </p>

              {/* Streak + Level pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-500 ${
                  hasStreak ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                }`}>
                  <Flame className="w-3 h-3" />
                  {stats.currentStreak} {stats.currentStreak === 1 ? 'dia' : 'dias'}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-xp/10 text-xp">
                  <Star className="w-3 h-3" />
                  Nv. {stats.level}
                </div>
              </div>

              {/* XP bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{stats.totalXp} XP total</span>
                  <span className="text-[10px] text-muted-foreground">{xpProgress}/100</span>
                </div>
                <Progress value={xpProgress} className="h-1.5 bg-secondary [&>div]:bg-xp [&>div]:transition-all [&>div]:duration-500" />
              </div>
            </div>
          </div>

          {/* Habit count summary */}
          <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Repeat className="w-3 h-3" />
              <span>{dailyHabits.length} diário{dailyHabits.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{scheduledHabits.length} programado{scheduledHabits.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="text-[11px] text-muted-foreground">
              {habits.length} total
            </div>
          </div>
        </motion.div>

        {/* Celebration */}
        <CelebrationBanner message={celebrationMessage} />

        {/* Today's habits */}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-border p-10 text-center"
            >
              <p className="text-sm text-muted-foreground mb-1 font-medium">Nenhum hábito para hoje</p>
              <p className="text-xs text-muted-foreground/60 mb-4">Crie hábitos diários ou programados!</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2 h-9 px-4 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {todayHabits.map((habit, i) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <HabitCard
                      habit={habit}
                      completed={isCompleted(habit.id)}
                      onToggle={() => toggleHabit(habit.id)}
                      onRemove={() => removeHabit(habit.id)}
                      xpPopup={xpPopup}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* All habits — expandable */}
        {habits.length > 0 && (
          <section>
            <button
              onClick={() => setShowAllHabits(!showAllHabits)}
              className="flex items-center justify-between w-full mb-3 group"
            >
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">
                Todos os hábitos ({habits.length})
              </h2>
              <motion.div
                animate={{ rotate: showAllHabits ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAllHabits && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5">
                    {/* Daily habits */}
                    {dailyHabits.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Repeat className="w-2.5 h-2.5" /> Diários
                        </p>
                        <div className="space-y-1">
                          {dailyHabits.map(habit => (
                            <div key={habit.id} className="flex items-center gap-3 rounded-xl bg-card border border-border px-3.5 py-2.5">
                              <span className="text-base">{habit.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-foreground truncate">{habit.name}</p>
                                <p className="text-[10px] text-muted-foreground">+{habit.xpReward} XP · Todos os dias</p>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/8 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl max-w-xs">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-display text-base">Excluir hábito?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      "{habit.name}" será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl text-sm">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeHabit(habit.id)}
                                      className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scheduled habits */}
                    {scheduledHabits.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" /> Programados
                        </p>
                        <div className="space-y-1">
                          {scheduledHabits.map(habit => (
                            <div key={habit.id} className="flex items-center gap-3 rounded-xl bg-card border border-border px-3.5 py-2.5">
                              <span className="text-base">{habit.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-foreground truncate">{habit.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  +{habit.xpReward} XP · {habit.scheduledDays?.map(d => WEEKDAY_LABELS[d]).join(', ')}
                                </p>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="p-1 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/8 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl max-w-xs">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-display text-base">Excluir hábito?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      "{habit.name}" será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl text-sm">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeHabit(habit.id)}
                                      className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Reset */}
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
                    XP, nível e sequência serão zerados. Seus hábitos serão mantidos.
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
