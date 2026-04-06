import { cn } from '@/lib/utils';

interface CelebrationBannerProps {
  message: string | null;
}

export function CelebrationBanner({ message }: CelebrationBannerProps) {
  if (!message) return null;

  return (
    <div className="celebration-pulse rounded-2xl bg-success/10 border border-success/20 p-5 text-center">
      <p className="text-lg font-display font-bold text-success">{message}</p>
      <p className="text-sm text-muted-foreground mt-1">+50 XP bônus!</p>
    </div>
  );
}
