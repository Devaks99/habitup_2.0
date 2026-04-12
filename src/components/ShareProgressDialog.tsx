import { useState, useRef, useCallback, useEffect } from 'react';
import { useImageToBase64 } from '@/hooks/useImageToBase64';
import { toPng } from 'html-to-image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

import mascotDefault from '@/assets/mascote_habitup.png';
import mascotWaving from '@/assets/mascote_acenando_habitup.png';
import mascotCelebration from '@/assets/mascote_comemoracao_habitup.png';
import mascotSunglasses from '@/assets/mascote_oculos_escuro_habitup.png';
import mascotHot from '@/assets/mascote_quente_habitup.png';
import mascotHotSunglasses from '@/assets/mascote_quente_oculos_habitup.png';

function getDefaultMascotId(streak: number) {
  if (streak >= 5) return 'hot-sunglasses';
  if (streak >= 3) return 'hot';
  return 'default';
}

function getMascotUnlockThreshold(id: string) {
  if (id === 'hot') return 3;
  if (id === 'hot-sunglasses') return 5;
  return 0;
}

function isMascotUnlocked(id: string, streak: number) {
  return streak >= getMascotUnlockThreshold(id);
}

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
  { id: 'hot', src: mascotHot, label: 'Quente' },
  { id: 'hot-sunglasses', src: mascotHotSunglasses, label: 'Quente + Óculos' },
];

export function ShareProgressDialog({ streak, level, totalXp }: ShareProgressDialogProps) {
  const [selectedMascot, setSelectedMascot] = useState(() => getDefaultMascotId(streak));
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mascotImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setSelectedMascot(prev => isMascotUnlocked(prev, streak) ? prev : getDefaultMascotId(streak));
  }, [streak]);

  const unlockedMascotIds = MASCOTS.filter(m => isMascotUnlocked(m.id, streak)).map(m => m.id);
  const mascot = MASCOTS.find(m => m.id === selectedMascot) || MASCOTS[0];

  const mascotImage = useImageToBase64(mascot.src);
  const captureImageSrc = mascotImage.base64 ?? mascot.src;
  const isMascotReady = mascotImage.status === 'ready';
  const isReadyToCapture = isMascotReady && imageLoaded && !isGenerating;

  useEffect(() => {
    setImageLoaded(false);
  }, [captureImageSrc]);

  useEffect(() => {
    let cancelled = false;

    const preloadCaptureImage = async () => {
      if (!captureImageSrc) {
        setImageLoaded(false);
        return;
      }

      setImageLoaded(false);

      const img = new Image();
      img.decoding = 'sync';

      try {
        await new Promise<void>((resolve, reject) => {
          const cleanup = () => {
            img.onload = null;
            img.onerror = null;
          };

          img.onload = () => {
            cleanup();
            resolve();
          };

          img.onerror = () => {
            cleanup();
            reject(new Error(`Failed to preload image: ${captureImageSrc}`));
          };

          img.src = captureImageSrc;

          if (img.complete) {
            cleanup();
            resolve();
          }
        });

        await img.decode().catch(() => undefined);
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);

        if (!cancelled) {
          setImageLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to preload mascot for capture:', error);
          setImageLoaded(false);
        }
      }
    };

    preloadCaptureImage();

    return () => {
      cancelled = true;
    };
  }, [captureImageSrc]);

  const ensureImagePainted = useCallback(async () => {
    if (!cardRef.current) return;

    const images = Array.from(cardRef.current.querySelectorAll('img'));

    await Promise.all(images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve, reject) => {
          const cleanup = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
          };

          const onLoad = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            reject(new Error(`Failed to load image for capture: ${img.currentSrc || img.src}`));
          };

          img.addEventListener('load', onLoad, { once: true });
          img.addEventListener('error', onError, { once: true });
        });
      }

      await img.decode().catch(() => undefined);
    }));

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    await new Promise(resolve => setTimeout(resolve, 150));

    if (mascotImgRef.current && !mascotImgRef.current.complete) {
      throw new Error('Mascot image is not ready for capture');
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !imageLoaded) return;
    setIsGenerating(true);
    try {
      console.log('Starting download process...');
      await ensureImagePainted();
      console.log('Image painted, capturing...');
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      console.log('Generated image dataUrl length:', dataUrl.length);
      const link = document.createElement('a');
      link.download = `habitup-progresso.png`;
      link.href = dataUrl;
      link.click();
      console.log('Download initiated');
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [ensureImagePainted, imageLoaded]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current || !imageLoaded) return;
    setIsGenerating(true);
    try {
      await ensureImagePainted();
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      console.log('Share image dataUrl length:', dataUrl.length); // Debug
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
  }, [ensureImagePainted, streak, level, imageLoaded]);

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
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] p-0 gap-0 overflow-y-auto rounded-2xl border-border mx-auto">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-display font-bold">Compartilhar progresso</DialogTitle>
        </DialogHeader>

        {/* Mascot selector */}
        <div className="px-5 pb-4">
          <p className="text-[11px] text-muted-foreground mb-2.5">Escolha o mascote:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MASCOTS.filter(m => m.id !== 'hot' && m.id !== 'hot-sunglasses').map((m) => {
              const isLocked = !unlockedMascotIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && setSelectedMascot(m.id)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                    selectedMascot === m.id
                      ? 'bg-primary/10 ring-2 ring-primary/40'
                      : 'bg-muted/40 hover:bg-muted/70'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="relative">
                    <img src={m.src} alt={m.label} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">{m.label}</span>
                  {selectedMascot === m.id && !isLocked && (
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
              );
            })}
            {MASCOTS.filter(m => m.id === 'hot' || m.id === 'hot-sunglasses').map((m) => {
              const isLocked = !unlockedMascotIds.includes(m.id);
              const unlockHint = isLocked
                ? m.id === 'hot'
                  ? 'Desbloqueie em 3 dias'
                  : 'Desbloqueie em 5 dias'
                : '';

              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && setSelectedMascot(m.id)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                    selectedMascot === m.id
                      ? 'bg-primary/10 ring-2 ring-primary/40'
                      : 'bg-muted/40 hover:bg-muted/70'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="relative">
                    <img src={m.src} alt={m.label} className="w-10 h-10 object-contain" />
                    {isLocked && (
                      <div className="absolute inset-0 rounded-xl bg-slate-950/10 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-slate-700" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">{m.label}</span>
                  {isLocked && unlockHint && (
                    <span className="text-[8px] text-muted-foreground/80">{unlockHint}</span>
                  )}
                  {selectedMascot === m.id && !isLocked && (
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
              );
            })}
          </div>
        </div>

        {/* Card preview */}
        <div className="px-4 sm:px-5 pb-4 flex justify-center">
          <div className={`rounded-2xl overflow-hidden shadow-lg w-full max-w-sm aspect-[4/5] sm:aspect-square ${
            streak >= 5
              ? 'border-2 border-red-500/90 bg-red-50'
              : streak >= 3
              ? 'border-2 border-orange-400/90 bg-orange-50'
              : streak > 0
              ? 'border-2 border-amber-300/90 bg-amber-50'
              : 'border border-border/50 bg-white'
          }`}>
            <div
              ref={cardRef}
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(145deg, #e8f5e8 0%, #f0f7e8 30%, #fdf8ef 60%, #fff9f0 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(20px, 5vw, 28px) clamp(16px, 4vw, 24px)',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              }}>
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
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em',
                  color: '#4a8c5c',
                }}>Habit</span>
                <span style={{
                  fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em',
                  color: '#d4943a',
                }}>Up</span>
              </div>

              {/* Mascot */}
              {mascotImage.status === 'loading' ? (
                <Skeleton className="w-[120px] h-[120px] rounded-2xl mx-auto mb-5" />
              ) : (
                <img
                  ref={mascotImgRef}
                  src={captureImageSrc}
                  alt="Mascote"
                  style={{
                    width: 120, height: 120, objectFit: 'contain',
                    marginBottom: 20,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
                  }}
                  onError={() => console.error('Mascot image load failed:', mascot.src)}
                />
              )}

              {/* Stats */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 32,
                marginBottom: 10,
              }}>
                {/* Streak */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 48, fontWeight: 800, lineHeight: 1,
                    color: '#2d2d2d', letterSpacing: '-0.03em',
                  }}>
                    {streak}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
                    letterSpacing: '0.12em', color: '#e67e22', marginTop: 5,
                    display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                  }}>
                    🔥 dias
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  width: 1, height: 50,
                  background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12), transparent)',
                }} />

                {/* Level */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 48, fontWeight: 800, lineHeight: 1,
                    color: '#2d2d2d', letterSpacing: '-0.03em',
                  }}>
                    {level}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
                    letterSpacing: '0.12em', color: '#4a8c5c', marginTop: 5,
                    display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center',
                  }}>
                    ⭐ nível
                  </div>
                </div>
              </div>

              {/* XP */}
              <div style={{
                fontSize: 13, fontWeight: 500, color: '#999',
                marginTop: 2,
              }}>
                {totalXp} XP acumulados
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 14, paddingTop: 12,
                borderTop: '1px solid rgba(0,0,0,0.05)',
                width: '100%', textAlign: 'center' as const,
              }}>
                <span style={{
                  fontSize: 10, color: '#bbb', fontWeight: 500,
                  letterSpacing: '0.05em',
                }}>
                  Construindo hábitos, um dia de cada vez 💪
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-1">
          <p className="text-[11px] text-muted-foreground text-center">
            {isReadyToCapture
              ? 'Pronto para gerar a imagem com o mascote completo.'
              : 'Aguarde até o mascote carregar completamente antes de baixar.'}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownload}
            disabled={isGenerating || !isMascotReady || !imageLoaded}
            className="flex-1 rounded-full gap-2 bg-primary text-primary-foreground h-10 text-sm font-medium hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
          >
            {!isMascotReady || !imageLoaded ? (
              'Preparando...'
            ) : isGenerating ? (
              'Gerando...'
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar imagem
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            disabled={isGenerating || !isMascotReady || !imageLoaded}
            className="flex-1 rounded-full gap-2 h-10 text-sm font-medium border-2 border-primary bg-primary/5 text-primary hover:bg-primary/10 disabled:border-muted disabled:bg-muted/20 disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
          >
            {!isMascotReady || !imageLoaded ? (
              'Preparando...'
            ) : isGenerating ? (
              'Gerando...'
            ) : copied ? (
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
                className="flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </motion.span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
