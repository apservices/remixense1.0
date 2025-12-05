import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceCommands, defaultDJCommands } from '@/hooks/useVoiceCommands';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/lib/experimentalFeatures';

interface VoiceCommandButtonProps {
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onMix?: () => void;
  className?: string;
}

export function VoiceCommandButton({
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onMix,
  className
}: VoiceCommandButtonProps) {
  const commands = defaultDJCommands.map(cmd => ({
    ...cmd,
    action: () => {
      switch (cmd.command) {
        case 'play': onPlay?.(); break;
        case 'pause': onPause?.(); break;
        case 'next': onNext?.(); break;
        case 'previous': onPrevious?.(); break;
        case 'mix': onMix?.(); break;
      }
    }
  }));

  const { isListening, isSupported, transcript, toggleListening } = useVoiceCommands({
    commands
  });

  if (!isFeatureEnabled('VOICE_COMMANDS') || !isSupported) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <motion.button
        onClick={toggleListening}
        className={cn(
          'relative p-2.5 rounded-full transition-colors touch-manipulation',
          isListening 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted hover:bg-accent'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isListening ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
        
        {/* Pulse animation when listening */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Transcript display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-background/95 border border-border/50 shadow-lg backdrop-blur-sm whitespace-nowrap"
          >
            <p className="text-xs text-muted-foreground">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
