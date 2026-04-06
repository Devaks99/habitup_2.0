import { getXpProgress, getXpForNextLevel, getLevel } from '@/types/habit';
import type { UserStats } from '@/types/habit';
import { Progress } from '@/components/ui/progress';
import { Flame, Star } from 'lucide-react';

interface XpBarProps {
  stats: UserStats;
}

export function XpBar({ stats }: XpBarProps) {
  const currentProgress = getXpProgress(stats.totalXp);
  const needed = 100;
  const percentage = Math.round((currentProgress / needed) * 100);

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-xp/15">
            <Star className="w-5 h-5 text-xp" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nível</p>
            <p className="text-xl font-display font-bold text-foreground">{stats.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">XP Total</p>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-xp" />
            <p className="text-lg font-display font-bold text-foreground">{stats.totalXp}</p>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Progress value={percentage} className="h-2.5 bg-secondary [&>div]:bg-xp" />
        <p className="text-xs text-muted-foreground text-right">
          {currentProgress} / {needed} XP para o nível {stats.level + 1}
        </p>
      </div>
    </div>
  );
}
