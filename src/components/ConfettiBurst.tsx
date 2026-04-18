import { AnimatePresence, motion } from 'framer-motion';

interface ConfettiBurstProps {
  active: boolean;
}

const CONFETTI_PIECES = [
  { left: '8%', size: 8, duration: 2.6, delay: 0.0, drift: -48, rotate: -180, color: '#10b981', shape: 'dot' },
  { left: '14%', size: 10, duration: 3.1, delay: 0.08, drift: -24, rotate: -120, color: '#fbbf24', shape: 'rect' },
  { left: '20%', size: 12, duration: 2.9, delay: 0.12, drift: 34, rotate: 160, color: '#fb923c', shape: 'rect' },
  { left: '27%', size: 7, duration: 3.2, delay: 0.2, drift: -36, rotate: -220, color: '#38bdf8', shape: 'dot' },
  { left: '34%', size: 11, duration: 2.8, delay: 0.28, drift: 42, rotate: 200, color: '#d946ef', shape: 'rect' },
  { left: '41%', size: 9, duration: 3.0, delay: 0.06, drift: -20, rotate: -140, color: '#22c55e', shape: 'dot' },
  { left: '48%', size: 12, duration: 2.7, delay: 0.18, drift: 16, rotate: 180, color: '#f97316', shape: 'rect' },
  { left: '54%', size: 8, duration: 3.3, delay: 0.24, drift: -28, rotate: -200, color: '#8b5cf6', shape: 'dot' },
  { left: '61%', size: 10, duration: 2.95, delay: 0.1, drift: 22, rotate: 140, color: '#14b8a6', shape: 'rect' },
  { left: '68%', size: 12, duration: 3.25, delay: 0.16, drift: -44, rotate: -170, color: '#fb7185', shape: 'rect' },
  { left: '75%', size: 7, duration: 2.85, delay: 0.22, drift: 36, rotate: 210, color: '#f59e0b', shape: 'dot' },
  { left: '82%', size: 10, duration: 3.15, delay: 0.04, drift: -18, rotate: -150, color: '#10b981', shape: 'rect' },
  { left: '88%', size: 8, duration: 3.05, delay: 0.14, drift: 28, rotate: 170, color: '#c084fc', shape: 'dot' },
  { left: '93%', size: 11, duration: 2.75, delay: 0.26, drift: -30, rotate: -190, color: '#fbbf24', shape: 'rect' },
];

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_42%)]" />

          {CONFETTI_PIECES.map((piece, index) => (
            <motion.span
              key={`${piece.left}-${index}`}
              className="absolute top-[-8%] block"
              style={{
                left: piece.left,
                width: piece.shape === 'dot' ? piece.size : piece.size * 0.72,
                height: piece.shape === 'dot' ? piece.size : piece.size * 1.5,
                borderRadius: piece.shape === 'dot' ? 9999 : 4,
                backgroundColor: piece.color,
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)',
              }}
              initial={{ y: -60, x: 0, opacity: 0, rotate: 0, scale: 0.7 }}
              animate={{
                y: ['0vh', '28vh', '56vh', '104vh'],
                x: [0, piece.drift * 0.5, piece.drift, piece.drift * 0.65],
                rotate: [0, piece.rotate * 0.4, piece.rotate, piece.rotate * 1.15],
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1, 1, 0.92],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.18, 0.84, 0.32, 1],
              }}
            />
          ))}

          <motion.div
            className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_55%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.75, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
