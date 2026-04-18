import { useState, useRef, useCallback, useEffect } from 'react';
import { useImageToBase64 } from '@/hooks/useImageToBase64';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

import {
  SHARE_MASCOTS,
  ShareMascotId,
  getDefaultMascotId,
  getMascotUnlockThreshold,
  getStreakTheme,
  isMascotUnlocked,
} from '@/lib/streakTheme';

interface ShareProgressDialogProps {
  streak: number;
  level: number;
  totalXp: number;
}

function getCanvasPalette(tone: ReturnType<typeof getStreakTheme>['tone']) {
  switch (tone) {
    case 'purple-bolt':
      return {
        backgroundStops: ['#f4eefe', '#efe4ff', '#efe0ff', '#f6ebff'],
        frameColor: '#8b5cf6',
        topGlow: 'rgba(139, 92, 246, 0.16)',
        bottomGlow: 'rgba(168, 85, 247, 0.18)',
      };
    case 'purple':
      return {
        backgroundStops: ['#fff1fb', '#f9e8ff', '#f4e4ff', '#fff3fb'],
        frameColor: '#d946ef',
        topGlow: 'rgba(217, 70, 239, 0.15)',
        bottomGlow: 'rgba(192, 38, 211, 0.16)',
      };
    case 'red':
      return {
        backgroundStops: ['#fff2ef', '#ffe7e0', '#fff0ea', '#fff7f3'],
        frameColor: '#ef4444',
        topGlow: 'rgba(239, 68, 68, 0.14)',
        bottomGlow: 'rgba(251, 146, 60, 0.16)',
      };
    case 'orange':
      return {
        backgroundStops: ['#fff7ee', '#ffefd9', '#fff5e8', '#fffaf2'],
        frameColor: '#fb923c',
        topGlow: 'rgba(251, 146, 60, 0.14)',
        bottomGlow: 'rgba(245, 158, 11, 0.16)',
      };
    case 'amber':
      return {
        backgroundStops: ['#fffaf0', '#fff3d6', '#fff8e7', '#fffcf3'],
        frameColor: '#fbbf24',
        topGlow: 'rgba(251, 191, 36, 0.14)',
        bottomGlow: 'rgba(245, 158, 11, 0.14)',
      };
    default:
      return {
        backgroundStops: ['#e8f5e8', '#f0f7e8', '#fdf8ef', '#fff9f0'],
        frameColor: '#e7dfd1',
        topGlow: 'rgba(76, 175, 80, 0.10)',
        bottomGlow: 'rgba(255, 183, 77, 0.12)',
      };
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadCanvasImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = async () => {
      await img.decode().catch(() => undefined);
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image for canvas generation: ${src}`));
    };

    img.src = src;
  });
}

export function ShareProgressDialog({ streak, level, totalXp }: ShareProgressDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedMascot, setSelectedMascot] = useState<ShareMascotId>(() => getDefaultMascotId(streak));
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const streakTheme = getStreakTheme(streak);

  useEffect(() => {
    setSelectedMascot(prev => isMascotUnlocked(prev, streak) ? prev : getDefaultMascotId(streak));
  }, [streak]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  const unlockedMascotIds = SHARE_MASCOTS.filter(m => isMascotUnlocked(m.id, streak)).map(m => m.id);
  const mascot = SHARE_MASCOTS.find(m => m.id === selectedMascot) || SHARE_MASCOTS[0];

  const mascotImage = useImageToBase64(mascot.src);
  const captureImageSrc = mascotImage.base64 ?? mascot.src;
  const isMascotReady = mascotImage.status === 'ready';
  const isReadyToCapture = isMascotReady && !isGenerating;

  const generateShareImageBlob = useCallback(async () => {
    if (!captureImageSrc) {
      throw new Error('Mascot image source is not available');
    }

    await document.fonts?.ready;

    const mascotCanvasImage = await loadCanvasImage(captureImageSrc);
    const palette = getCanvasPalette(streakTheme.tone);

    const width = 1080;
    const height = 1350;
    const frameInset = 12;
    const innerInset = 22;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
    backgroundGradient.addColorStop(0, palette.backgroundStops[0]);
    backgroundGradient.addColorStop(0.35, palette.backgroundStops[1]);
    backgroundGradient.addColorStop(0.7, palette.backgroundStops[2]);
    backgroundGradient.addColorStop(1, palette.backgroundStops[3]);

    ctx.fillStyle = palette.frameColor;
    drawRoundedRect(ctx, frameInset, frameInset, width - frameInset * 2, height - frameInset * 2, 38);
    ctx.fill();

    ctx.save();
    drawRoundedRect(ctx, innerInset, innerInset, width - innerInset * 2, height - innerInset * 2, 32);
    ctx.clip();
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(innerInset, innerInset, width - innerInset * 2, height - innerInset * 2);

    const topGlow = ctx.createRadialGradient(width - 180, 130, 30, width - 180, 130, 210);
    topGlow.addColorStop(0, palette.topGlow);
    topGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(width - 420, -20, 420, 420);

    const bottomGlow = ctx.createRadialGradient(170, height - 180, 24, 170, height - 180, 180);
    bottomGlow.addColorStop(0, palette.bottomGlow);
    bottomGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(-10, height - 380, 380, 380);

    ctx.textAlign = 'center';
    ctx.fillStyle = streakTheme.shareAccentColor;
    ctx.font = '700 48px "Space Grotesk", sans-serif';
    ctx.fillText('Habit', width / 2 - 28, 170);
    ctx.fillStyle = '#d4943a';
    ctx.font = '800 48px "Space Grotesk", sans-serif';
    ctx.fillText('Up', width / 2 + 96, 170);

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
    ctx.shadowBlur = 28;
    ctx.drawImage(mascotCanvasImage, width / 2 - 180, 240, 360, 360);
    ctx.restore();

    ctx.fillStyle = '#2d2d2d';
    ctx.font = '800 164px "Space Grotesk", sans-serif';
    ctx.fillText(String(streak), width / 2 - 150, 760);
    ctx.fillText(String(level), width / 2 + 150, 760);

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 660);
    ctx.lineTo(width / 2, 820);
    ctx.stroke();

    ctx.fillStyle = streakTheme.shareStreakLabelColor;
    ctx.font = '700 28px Inter, sans-serif';
    ctx.fillText('DIAS', width / 2 - 150, 810);

    ctx.fillStyle = streakTheme.shareAccentColor;
    ctx.fillText('NÍVEL', width / 2 + 150, 810);

    ctx.fillStyle = '#7a7a7a';
    ctx.font = '500 32px Inter, sans-serif';
    ctx.fillText(`${totalXp} XP acumulados`, width / 2, 900);

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(128, 980);
    ctx.lineTo(width - 128, 980);
    ctx.stroke();

    ctx.fillStyle = '#a0a0a0';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText('Construindo hábitos, um dia de cada vez', width / 2, 1038);

    ctx.restore();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (!value) {
          reject(new Error('Failed to export canvas image'));
          return;
        }
        resolve(value);
      }, 'image/png');
    });

    return blob;
  }, [captureImageSrc, level, streak, streakTheme, totalXp]);

  const handleDownload = useCallback(async () => {
    if (!isReadyToCapture) return;
    setIsGenerating(true);
    try {
      const blob = await generateShareImageBlob();
      const dataUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `habitup-progresso.png`;
      link.href = dataUrl;
      link.click();
      setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [generateShareImageBlob, isReadyToCapture]);

  const handleShare = useCallback(async () => {
    if (!isReadyToCapture) return;
    setIsGenerating(true);
    try {
      const blob = await generateShareImageBlob();
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
  }, [generateShareImageBlob, streak, level, isReadyToCapture]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            {SHARE_MASCOTS.filter(m => m.unlockAt === 0).map((m) => {
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
            {SHARE_MASCOTS.filter(m => m.unlockAt > 0).map((m) => {
              const isLocked = !unlockedMascotIds.includes(m.id);
              const unlockHint = isLocked ? `Desbloqueie em ${getMascotUnlockThreshold(m.id)} dias` : '';

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
          <div className={`rounded-2xl overflow-hidden shadow-lg w-full max-w-sm aspect-[4/5] sm:aspect-square ${streakTheme.shareFrameClassName}`}>
            <div
              ref={cardRef}
              style={{
                width: '100%',
                height: '100%',
                background: streakTheme.shareBackground,
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
                background: streakTheme.shareGlowTop,
              }} />
              <div style={{
                position: 'absolute', bottom: -20, left: -20,
                width: 90, height: 90, borderRadius: '50%',
                background: streakTheme.shareGlowBottom,
              }} />

              {/* Brand */}
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em',
                  color: streakTheme.shareAccentColor,
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
                    letterSpacing: '0.12em', color: streakTheme.shareStreakLabelColor, marginTop: 5,
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
                    letterSpacing: '0.12em', color: streakTheme.shareAccentColor, marginTop: 5,
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
              : 'Preparando o mascote para a primeira geração da imagem.'}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownload}
            disabled={isGenerating || !isReadyToCapture}
            className="flex-1 rounded-full gap-2 bg-primary text-primary-foreground h-10 text-sm font-medium hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
          >
            {!isReadyToCapture ? (
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
            disabled={isGenerating || !isReadyToCapture}
            className="flex-1 rounded-full gap-2 h-10 text-sm font-medium border-2 border-primary bg-primary/5 text-primary hover:bg-primary/10 disabled:border-muted disabled:bg-muted/20 disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
          >
            {!isReadyToCapture ? (
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
