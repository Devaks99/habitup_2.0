import { useState, useRef } from 'react';
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
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300",
        completed
          ? "bg-success/8 border-success/20"
          : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Custom checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "relative flex-shrink-0 w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center",
          completed
            ? "bg-success border-success"
            : "border-muted-foreground/30 hover:border-primary"
        )}
      >
        {completed && (
          <Check className="w-4 h-4 text-success-foreground animate-in zoom-in-50 duration-200" />
        )}
      </button>

      {/* Emoji */}
      <span className="text-2xl flex-shrink-0">{habit.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-sm transition-all duration-300",
            completed ? "line-through text-muted-foreground" : "text-foreground"
          )}
        >
          {habit.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          +{habit.xpReward} XP
        </p>
      </div>

      {/* XP popup */}
      {xpPopup && xpPopup.id === habit.id && (
        <span className="absolute right-4 top-2 text-sm font-bold text-xp xp-float">
          +{xpPopup.amount} XP
        </span>
      )}

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          "flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
          showDelete ? "opacity-100" : "opacity-0"
        )}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
