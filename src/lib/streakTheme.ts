import mascotDefault from '@/assets/mascote_habitup.png';
import mascotWaving from '@/assets/mascote_acenando_habitup.png';
import mascotCelebration from '@/assets/mascote_comemoracao_habitup.png';
import mascotSunglasses from '@/assets/mascote_oculos_escuro_habitup.png';
import mascotHot from '@/assets/mascote_quente_habitup.png';
import mascotHotSunglasses from '@/assets/mascote_quente_oculos_habitup.png';
import mascotPurple from '@/assets/mascote_roxo_habitup.png';
import mascotPurpleBolt from '@/assets/mascote_roxo_raio_habitup.png';

export type ShareMascotId =
  | 'default'
  | 'waving'
  | 'celebration'
  | 'sunglasses'
  | 'hot'
  | 'hot-sunglasses'
  | 'purple'
  | 'purple-bolt';

export interface StreakTheme {
  tone: 'neutral' | 'amber' | 'orange' | 'red' | 'purple' | 'purple-bolt';
  cardClassName: string;
  bodyTextClassName: string;
  mutedTextClassName: string;
  streakPillClassName: string;
  summaryTextClassName: string;
  xpBarClassName: string;
  xpBarIndicatorClassName: string;
  progressRingColor: string;
  shareFrameClassName: string;
  shareBackground: string;
  shareAccentColor: string;
  shareGlowTop: string;
  shareGlowBottom: string;
  shareStreakLabelColor: string;
}

export const STREAK_WARNING_MESSAGE =
  'Foi por pouco! Não deixe sua sequência acabar. Você ainda tem mais uma chance de manter sua sequência. Vamos nessa!';

export const SHARE_MASCOTS: Array<{
  id: ShareMascotId;
  src: string;
  label: string;
  unlockAt: number;
}> = [
  { id: 'default', src: mascotDefault, label: 'Padrão', unlockAt: 0 },
  { id: 'waving', src: mascotWaving, label: 'Acenando', unlockAt: 0 },
  { id: 'celebration', src: mascotCelebration, label: 'Comemorando', unlockAt: 0 },
  { id: 'sunglasses', src: mascotSunglasses, label: 'Estiloso', unlockAt: 0 },
  { id: 'hot', src: mascotHot, label: 'Quente', unlockAt: 3 },
  { id: 'hot-sunglasses', src: mascotHotSunglasses, label: 'Quente + Óculos', unlockAt: 5 },
  { id: 'purple', src: mascotPurple, label: 'Roxo', unlockAt: 10 },
  { id: 'purple-bolt', src: mascotPurpleBolt, label: 'Roxo + Raio', unlockAt: 15 },
];

export function getDefaultMascotId(streak: number): ShareMascotId {
  if (streak >= 15) return 'purple-bolt';
  if (streak >= 10) return 'purple';
  if (streak >= 5) return 'hot-sunglasses';
  if (streak >= 3) return 'hot';
  return 'default';
}

export function getMascotUnlockThreshold(id: ShareMascotId): number {
  return SHARE_MASCOTS.find((mascot) => mascot.id === id)?.unlockAt ?? 0;
}

export function isMascotUnlocked(id: ShareMascotId, streak: number): boolean {
  return streak >= getMascotUnlockThreshold(id);
}

export function getStreakMascot(
  streak: number,
  completionPerfect: boolean,
  showWaving: boolean,
): string {
  if (streak >= 15) return mascotPurpleBolt;
  if (streak >= 10) return mascotPurple;
  if (streak >= 5) return mascotHotSunglasses;
  if (streak >= 3) return mascotHot;
  if (completionPerfect) return mascotCelebration;
  if (showWaving) return mascotWaving;
  return mascotDefault;
}

export function getStreakTheme(streak: number): StreakTheme {
  if (streak >= 15) {
    return {
      tone: 'purple-bolt',
      cardClassName: 'rounded-2xl border-2 p-5 transition-all duration-500 bg-violet-50 border-violet-500/90',
      bodyTextClassName: 'text-[#2d1f46]',
      mutedTextClassName: 'text-[#654d8d]',
      streakPillClassName: 'bg-violet-100 text-[#5a2ca0]',
      summaryTextClassName: 'text-[#5b4a7b]',
      xpBarClassName: 'h-1.5 bg-violet-100 [&>div]:bg-violet-500 [&>div]:transition-all [&>div]:duration-500',
      xpBarIndicatorClassName: 'bg-violet-500',
      progressRingColor: '#8b5cf6',
      shareFrameClassName: 'border border-violet-500/75 bg-violet-50',
      shareBackground: 'linear-gradient(145deg, #f4eefe 0%, #efe4ff 35%, #efe0ff 65%, #f6ebff 100%)',
      shareAccentColor: '#7c3aed',
      shareGlowTop: 'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%)',
      shareGlowBottom: 'radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, transparent 70%)',
      shareStreakLabelColor: '#7c3aed',
    };
  }

  if (streak >= 10) {
    return {
      tone: 'purple',
      cardClassName: 'rounded-2xl border-2 p-5 transition-all duration-500 bg-fuchsia-50 border-fuchsia-400/90',
      bodyTextClassName: 'text-[#35234b]',
      mutedTextClassName: 'text-[#6e5a8a]',
      streakPillClassName: 'bg-fuchsia-100 text-[#9137b8]',
      summaryTextClassName: 'text-[#66547b]',
      xpBarClassName: 'h-1.5 bg-fuchsia-100 [&>div]:bg-fuchsia-500 [&>div]:transition-all [&>div]:duration-500',
      xpBarIndicatorClassName: 'bg-fuchsia-500',
      progressRingColor: '#d946ef',
      shareFrameClassName: 'border border-fuchsia-400/75 bg-fuchsia-50',
      shareBackground: 'linear-gradient(145deg, #fff1fb 0%, #f9e8ff 32%, #f4e4ff 62%, #fff3fb 100%)',
      shareAccentColor: '#c026d3',
      shareGlowTop: 'radial-gradient(circle, rgba(192, 38, 211, 0.14) 0%, transparent 70%)',
      shareGlowBottom: 'radial-gradient(circle, rgba(217, 70, 239, 0.16) 0%, transparent 70%)',
      shareStreakLabelColor: '#c026d3',
    };
  }

  if (streak >= 5) {
    return {
      tone: 'red',
      cardClassName: 'rounded-2xl border-2 p-5 transition-all duration-500 bg-red-50 border-red-500/90',
      bodyTextClassName: 'text-[#38241f]',
      mutedTextClassName: 'text-[#6f4a45]',
      streakPillClassName: 'bg-red-100 text-[#7b1f1f]',
      summaryTextClassName: 'text-[#62403c]',
      xpBarClassName: 'h-1.5 bg-red-100 [&>div]:bg-red-500 [&>div]:transition-all [&>div]:duration-500',
      xpBarIndicatorClassName: 'bg-red-500',
      progressRingColor: '#ef4444',
      shareFrameClassName: 'border border-red-500/75 bg-red-50',
      shareBackground: 'linear-gradient(145deg, #fff2ef 0%, #ffe7e0 35%, #fff0ea 68%, #fff7f3 100%)',
      shareAccentColor: '#dc2626',
      shareGlowTop: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
      shareGlowBottom: 'radial-gradient(circle, rgba(251, 146, 60, 0.16) 0%, transparent 70%)',
      shareStreakLabelColor: '#dc2626',
    };
  }

  if (streak >= 3) {
    return {
      tone: 'orange',
      cardClassName: 'rounded-2xl border-2 p-5 transition-all duration-500 bg-orange-50 border-orange-400/90',
      bodyTextClassName: 'text-[#43322c]',
      mutedTextClassName: 'text-[#7c554a]',
      streakPillClassName: 'bg-orange-100 text-[#8d4517]',
      summaryTextClassName: 'text-[#6d4c40]',
      xpBarClassName: 'h-1.5 bg-orange-100 [&>div]:bg-orange-400 [&>div]:transition-all [&>div]:duration-500',
      xpBarIndicatorClassName: 'bg-orange-400',
      progressRingColor: '#fb923c',
      shareFrameClassName: 'border border-orange-400/75 bg-orange-50',
      shareBackground: 'linear-gradient(145deg, #fff7ee 0%, #ffefd9 35%, #fff5e8 68%, #fffaf2 100%)',
      shareAccentColor: '#f97316',
      shareGlowTop: 'radial-gradient(circle, rgba(251, 146, 60, 0.12) 0%, transparent 70%)',
      shareGlowBottom: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%)',
      shareStreakLabelColor: '#ea580c',
    };
  }

  if (streak > 0) {
    return {
      tone: 'amber',
      cardClassName: 'rounded-2xl border-2 p-5 transition-all duration-500 bg-amber-50 border-amber-300/90',
      bodyTextClassName: 'text-[#4d3f2f]',
      mutedTextClassName: 'text-[#836f4a]',
      streakPillClassName: 'bg-amber-100 text-[#7d5f0e]',
      summaryTextClassName: 'text-[#735f3f]',
      xpBarClassName: 'h-1.5 bg-amber-100 [&>div]:bg-amber-400 [&>div]:transition-all [&>div]:duration-500',
      xpBarIndicatorClassName: 'bg-amber-400',
      progressRingColor: '#fbbf24',
      shareFrameClassName: 'border border-amber-300/75 bg-amber-50',
      shareBackground: 'linear-gradient(145deg, #fffaf0 0%, #fff3d6 35%, #fff8e7 68%, #fffcf3 100%)',
      shareAccentColor: '#f59e0b',
      shareGlowTop: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
      shareGlowBottom: 'radial-gradient(circle, rgba(251, 191, 36, 0.14) 0%, transparent 70%)',
      shareStreakLabelColor: '#d97706',
    };
  }

  return {
    tone: 'neutral',
    cardClassName: 'rounded-2xl border p-5 transition-colors duration-500 bg-card border-border/80',
    bodyTextClassName: 'text-[#525252]',
    mutedTextClassName: 'text-[#6b6b6b]',
    streakPillClassName: 'bg-muted text-muted-foreground',
    summaryTextClassName: 'text-[#525252]',
    xpBarClassName: 'h-1.5 bg-secondary [&>div]:bg-xp [&>div]:transition-all [&>div]:duration-500',
    xpBarIndicatorClassName: 'bg-xp',
    progressRingColor: 'hsl(var(--xp))',
    shareFrameClassName: 'border border-border/50 bg-white',
    shareBackground: 'linear-gradient(145deg, #e8f5e8 0%, #f0f7e8 30%, #fdf8ef 60%, #fff9f0 100%)',
    shareAccentColor: '#4a8c5c',
    shareGlowTop: 'radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)',
    shareGlowBottom: 'radial-gradient(circle, rgba(255, 183, 77, 0.1) 0%, transparent 70%)',
    shareStreakLabelColor: '#e67e22',
  };
}
