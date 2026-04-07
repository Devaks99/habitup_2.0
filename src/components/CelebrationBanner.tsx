import { motion, AnimatePresence } from 'framer-motion';
import mascotCoolImg from '@/assets/mascote_oculos_escuro_habitup.png';

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
          <motion.img
            src={mascotCoolImg}
            alt="HabitUp celebrando"
            className="w-12 h-12 object-contain flex-shrink-0"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.2, 1], rotate: [-30, 10, 0] }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          />
          <div>
            <p className="text-sm font-display font-bold text-success leading-tight">{message}</p>
            <p className="text-[11px] text-success/60 mt-0.5">+50 XP bônus</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
