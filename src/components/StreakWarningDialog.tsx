import mascotWaving from '@/assets/mascote_acenando_habitup.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StreakWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  confirmLabel?: string;
}

export function StreakWarningDialog({
  open,
  onOpenChange,
  title = 'Não perca sua sequência',
  confirmLabel = 'Entendi',
}: StreakWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm overflow-hidden rounded-[28px] border border-border/70 bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_62%)]" />

          <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-50 via-white to-amber-50 ring-1 ring-border/70 shadow-[0_14px_32px_rgba(16,185,129,0.08)]">
            <img
              src={mascotWaving}
              alt="Mascote HabitUp acenando"
              className="h-20 w-20 object-contain"
            />
          </div>

          <AlertDialogHeader className="mx-auto flex max-w-[26ch] items-center space-y-3 text-center">
            <AlertDialogTitle className="text-center font-display text-[24px] leading-tight tracking-tight text-foreground">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[14px] leading-6 text-muted-foreground">
              Não perca sua sequência de dias. Você ainda tem hoje para recuperar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex justify-center">
            <AlertDialogAction
              onClick={() => onOpenChange(false)}
              className="h-11 w-full rounded-full bg-primary text-center text-sm font-medium text-primary-foreground shadow-[0_10px_24px_rgba(16,185,129,0.16)] hover:bg-primary/90"
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
