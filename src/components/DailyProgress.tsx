import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface DailyProgressProps {
  percentage: number;
  completed: number;
  total: number;
}

export function DailyProgress({ percentage, completed, total }: DailyProgressProps) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progresso do dia</p>
            <p className="text-xl font-display font-bold text-foreground">{percentage}%</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {completed}/{total} hábitos
        </p>
      </div>
      <Progress value={percentage} className="h-2.5 bg-secondary" indicatorClassName="bg-primary" />
    </div>
  );
}
