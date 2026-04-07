import { cn } from '@/lib/utils';
import { PartyPopper } from 'lucide-react';

interface CelebrationBannerProps {
  message: string | null;
}

export function CelebrationBanner({ message }: CelebrationBannerProps) {
  if (!message) return null;

  return (
    <div className="celebration-pulse rounded-2xl bg-success/8 border border-success/15 px-5 py-4 flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/15 flex-shrink-0">
        <PartyPopper className="w-5 h-5 text-success" />
      </div>
      <div>
        <p className="text-sm font-display font-bold text-success leading-tight">{message}</p>
        <p className="text-[11px] text-success/60 mt-0.5">+50 XP bônus</p>
      </div>
    </div>
  );
}
