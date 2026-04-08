import type { Habit } from '@/types/habit';
import { WEEKDAY_LABELS } from '@/types/habit';
import { cn } from '@/lib/utils';
import { Check, Trash2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  xpPopup?: { amount: number; id: string } | null;
}

function HabitCardContent({ 
  habit, 
  completed, 
  onToggle, 
  onRemove, 
  xpPopup,
  isDragging,
  attributes,
  listeners,
}: HabitCardProps & { isDragging?: boolean; attributes?: any; listeners?: any }) {
  return (
    <motion.div
      layout
      className={cn(
        "group relative flex items-center gap-2 rounded-2xl border px-4 py-3.5 transition-all duration-300",
        isDragging
          ? "opacity-50 bg-accent/5 border-primary/30 shadow-lg"
          : completed
            ? "bg-success/5 border-success/15 cursor-pointer hover:shadow-sm"
            : "bg-card border-border cursor-pointer hover:border-primary/15 hover:shadow-sm"
      )}
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Drag handle */}
      <div
        className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none p-0.5 rounded hover:bg-accent/10 transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors" />
      </div>

      {/* Checkbox */}
      <motion.div
        className={cn(
          "relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
          completed
            ? "bg-success border-success"
            : "border-muted-foreground/25 group-hover:border-primary/40"
        )}
        animate={completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check className="w-3.5 h-3.5 text-success-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Emoji */}
      <span className="text-xl flex-shrink-0 select-none">{habit.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-[13px] leading-tight transition-all duration-300",
          completed ? "line-through text-muted-foreground/60" : "text-foreground"
        )}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className={cn(
            "text-[11px] transition-colors duration-300",
            completed ? "text-success/60" : "text-muted-foreground"
          )}>
            +{habit.xpReward} XP
          </p>
          {habit.type === 'scheduled' && habit.scheduledDays && (
            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">
              {habit.scheduledDays.map(d => WEEKDAY_LABELS[d]).join(' · ')}
            </span>
          )}
        </div>
      </div>

      {/* XP popup */}
      <AnimatePresence>
        {xpPopup && xpPopup.id === habit.id && (
          <motion.span
            className="absolute right-4 -top-1 text-xs font-bold text-xp pointer-events-none"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            +{xpPopup.amount} XP
          </motion.span>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
}

export function HabitCard({ habit, completed, onToggle, onRemove, xpPopup }: HabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <HabitCardContent
        habit={habit}
        completed={completed}
        onToggle={onToggle}
        onRemove={onRemove}
        xpPopup={xpPopup}
        isDragging={isDragging}
        attributes={attributes}
        listeners={listeners}
      />
    </div>
  );
}
