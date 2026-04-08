import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const EMOJI_OPTIONS = ['📚', '💪', '🧘', '🏃', '❤️', '🛏️', '💧', '🍎', '😴', '✍️', '🎯', '🧠', '💊', '🌅', '🎵', '🧹', '💰', '📱', '🙏🏽'];

interface ExpandEmojisProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
}

export function ExpandEmojis({ selectedEmoji, onEmojiSelect }: ExpandEmojisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleEmojis = isExpanded ? EMOJI_OPTIONS : EMOJI_OPTIONS.slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
        {visibleEmojis.map(e => (
          <button
            key={e}
            onClick={() => {
              onEmojiSelect(e);
            }}
            className={cn(
              "w-11 h-11 sm:w-10 sm:h-10 rounded-xl text-lg flex items-center justify-center transition-all touch-man h-12 sm:h-auto",
              selectedEmoji === e
                ? "bg-primary/15 ring-2 ring-primary scale-105"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {e}
          </button>
        ))}
      </div>
      {EMOJI_OPTIONS.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs h-9 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
        >
{isExpanded ? 'Ver menos' : `Ver mais (+${EMOJI_OPTIONS.length - 5})`} <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      )}
    </div>
  );
}

