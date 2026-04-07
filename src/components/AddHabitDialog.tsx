import { useState } from 'react';
import type { Habit, WeekDay } from '@/types/habit';
import { WEEKDAYS, WEEKDAY_LABELS } from '@/types/habit';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ExpandEmojis } from './ExpandEmojis';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

export function AddHabitDialog({ open, onOpenChange, onAdd }: AddHabitDialogProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [type, setType] = useState<'daily' | 'scheduled'>('daily');
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
  const [xpReward, setXpReward] = useState(10);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      emoji,
      type,
      scheduledDays: type === 'scheduled' ? selectedDays : undefined,
      xpReward,
    });
    setName('');
    setEmoji('🎯');
    setType('daily');
    setSelectedDays([]);
    setXpReward(10);
    onOpenChange(false);
  };

  const toggleDay = (day: WeekDay) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] mx-auto my-4 rounded-2xl p-6 sm:max-w-md sm:p-6 sm:mx-0 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Hábito</DialogTitle>
          <DialogDescription>Crie um hábito para acompanhar diariamente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nome do hábito</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Meditar 10 minutos"
              className="bg-secondary/50"
            />
          </div>

          {/* Emoji */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Ícone</Label>
            <ExpandEmojis selectedEmoji={emoji} onEmojiSelect={setEmoji} />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Frequência</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('daily')}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  type === 'daily'
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                Diário
              </button>
              <button
                onClick={() => setType('scheduled')}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  type === 'scheduled'
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                Programado
              </button>
            </div>
          </div>

          {/* Days selector */}
          {type === 'scheduled' && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Dias da semana</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {WEEKDAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "flex-1 sm:flex-none py-2.5 px-2 sm:py-2 rounded-lg text-xs font-medium transition-all min-w-[38px]",
                      selectedDays.includes(day)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* XP */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Recompensa XP</Label>
            <div className="flex gap-2">
              {[5, 10, 15, 20, 25].map(xp => (
                <button
                  key={xp}
                  onClick={() => setXpReward(xp)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                    xpReward === xp
                      ? "bg-xp text-xp-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {xp}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || (type === 'scheduled' && selectedDays.length === 0)}
            className="w-full h-12 sm:h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold"
          >
            Adicionar Hábito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
