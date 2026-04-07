import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

interface CelebrationBannerProps {
  message: string | null;
}

export function CelebrationBanner({ message }: CelebrationBannerProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="rounded-2xl bg-success/8 border border-success/15 px-5 py-4 flex items-center gap-3"
        >
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-full bg-success/15 flex-shrink-0"
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PartyPopper className="w-5 h-5 text-success" />
          </motion.div>
          <div>
            <p className="text-sm font-display font-bold text-success leading-tight">{message}</p>
            <p className="text-[11px] text-success/60 mt-0.5">+50 XP bônus</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
