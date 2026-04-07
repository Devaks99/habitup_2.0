import type { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';
import { Check, Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  xpPopup?: { amount: number; id: string } | null;
}

export function HabitCard({ habit, completed, onToggle, onRemove, xpPopup }: HabitCardProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 transition-all duration-300 cursor-pointer",
        completed
          ? "bg-success/5 border-success/15"
          : "bg-card border-border hover:border-primary/15 hover:shadow-sm active:scale-[0.99]"
      )}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
          completed
            ? "bg-success border-success scale-100"
            : "border-muted-foreground/25 hover:border-primary group-hover:border-primary/40"
        )}
      >
        {completed && (
          <Check className="w-3.5 h-3.5 text-success-foreground animate-in zoom-in-50 duration-200" />
        )}
      </div>

      {/* Emoji */}
      <span className="text-xl flex-shrink-0 select-none">{habit.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-[13px] leading-tight transition-all duration-300",
            completed ? "line-through text-muted-foreground/60" : "text-foreground"
          )}
        >
          {habit.name}
        </p>
        <p className={cn(
          "text-[11px] mt-0.5 transition-colors duration-300",
          completed ? "text-success/60" : "text-muted-foreground"
        )}>
          +{habit.xpReward} XP
        </p>
      </div>

      {/* XP popup */}
      {xpPopup && xpPopup.id === habit.id && (
        <span className="absolute right-4 -top-1 text-xs font-bold text-xp xp-float pointer-events-none">
          +{xpPopup.amount} XP
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex-shrink-0 p-1.5 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/8 transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
