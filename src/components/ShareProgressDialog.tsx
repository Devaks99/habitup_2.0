import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import mascotDefault from '@/assets/mascote_habitup.png';
import mascotWaving from '@/assets/mascote_acenando_habitup.png';
import mascotCelebration from '@/assets/mascote_comemoracao_habitup.png';
import mascotSunglasses from '@/assets/mascote_oculos_escuro_habitup.png';

interface ShareProgressDialogProps {
  streak: number;
  level: number;
  totalXp: number;
}

const MASCOTS = [
  { id: 'default', src: mascotDefault, label: 'Padrão' },
  { id: 'waving', src: mascotWaving, label: 'Acenando' },
  { id: 'celebration', src: mascotCelebration, label: 'Comemorando' },
  { id: 'sunglasses', src: mascotSunglasses, label: 'Estiloso' },
];

export function ShareProgressDialog({ streak, level, totalXp }: ShareProgressDialogProps) {
  const [selectedMascot, setSelectedMascot] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mascot = MASCOTS.find(m => m.id === selectedMascot) || MASCOTS[0];

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `habitup-progresso.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'habitup-progresso.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Meu progresso no HabitUp',
          text: `🔥 ${streak} dias em sequência · Nível ${level}`,
          files: [file],
        });
      } else {
        // fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [streak, level]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 h-7 px-2.5"
        >
          <Share2 className="w-3 h-3" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-border">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-display font-bold">Compartilhar progresso</DialogTitle>
        </DialogHeader>

        {/* Mascot selector */}
        <div className="px-5 pb-4">
          <p className="text-[11px] text-muted-foreground mb-2.5">Escolha o mascote:</p>
          <div className="flex gap-2">
            {MASCOTS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMascot(m.id)}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                  selectedMascot === m.id
                    ? 'bg-primary/10 ring-2 ring-primary/40'
                    : 'bg-muted/40 hover:bg-muted/70'
                }`}
              >
                <img src={m.src} alt={m.label} className="w-10 h-10 object-contain" />
                <span className="text-[9px] text-muted-foreground font-medium">{m.label}</span>
                {selectedMascot === m.id && (
                  <motion.div
                    layoutId="mascot-check"
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card preview */}
        <div className="px-5 pb-4 flex justify-center">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50 inline-block">
            <div
              ref={cardRef}
              style={{
                width: 380,
                minHeight: 220,
                background: 'linear-gradient(145deg, #e8f5e8 0%, #f0f7e8 30%, #fdf8ef 60%, #fff9f0 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 28px 24px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              }}
            >
              {/* Decorative circles */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)',
              }} />
              <div style={{
                position: 'absolute', bottom: -20, left: -20,
                width: 90, height: 90, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 183, 77, 0.1) 0%, transparent 70%)',
              }} />

              {/* Brand */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 20,
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
                  color: '#4a8c5c',
                }}>Habit</span>
                <span style={{
                  fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em',
                  color: '#d4943a',
                }}>Up</span>
              </div>

              {/* Mascot */}
              <img
                src={mascot.src}
                alt="Mascote"
                style={{
                  width: 72, height: 72, objectFit: 'contain',
                  marginBottom: 16,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
                }}
                crossOrigin="anonymous"
              />

              {/* Stats */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 24,
                marginBottom: 12,
              }}>
                {/* Streak */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 36, fontWeight: 800, lineHeight: 1,
                    color: '#2d2d2d', letterSpacing: '-0.03em',
                  }}>
                    {streak}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em', color: '#e67e22', marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center',
                  }}>
                    🔥 dias
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  width: 1, height: 40,
                  background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), transparent)',
                }} />

                {/* Level */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 36, fontWeight: 800, lineHeight: 1,
                    color: '#2d2d2d', letterSpacing: '-0.03em',
                  }}>
                    {level}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em', color: '#4a8c5c', marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center',
                  }}>
                    ⭐ nível
                  </div>
                </div>
              </div>

              {/* XP */}
              <div style={{
                fontSize: 11, fontWeight: 500, color: '#999',
                marginTop: 2,
              }}>
                {totalXp} XP acumulados
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 16, paddingTop: 12,
                borderTop: '1px solid rgba(0,0,0,0.05)',
                width: '100%', textAlign: 'center' as const,
              }}>
                <span style={{
                  fontSize: 9, color: '#bbb', fontWeight: 500,
                  letterSpacing: '0.05em',
                }}>
                  Construindo hábitos, um dia de cada vez 💪
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Baixar imagem
          </Button>
          <Button
            onClick={handleShare}
            disabled={isGenerating}
            variant="outline"
            className="flex-1 rounded-full gap-2 h-10 text-sm font-medium border-border"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-success" />
                  Copiado!
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
