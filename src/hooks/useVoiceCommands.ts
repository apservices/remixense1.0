import { useState, useEffect, useCallback, useRef } from 'react';
import { isFeatureEnabled } from '@/lib/experimentalFeatures';
import { toast } from 'sonner';

interface VoiceCommand {
  command: string;
  aliases: string[];
  action: () => void;
  description: string;
}

interface UseVoiceCommandsOptions {
  commands: VoiceCommand[];
  language?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

export function useVoiceCommands({
  commands,
  language = 'pt-BR',
  continuous = true,
  onResult,
  onError
}: UseVoiceCommandsOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!isFeatureEnabled('VOICE_COMMANDS')) {
      return;
    }

    const SpeechRecognitionAPI = (window as unknown as { 
      SpeechRecognition?: SpeechRecognitionConstructor; 
      webkitSpeechRecognition?: SpeechRecognitionConstructor 
    }).SpeechRecognition || (window as unknown as { 
      webkitSpeechRecognition?: SpeechRecognitionConstructor 
    }).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript.toLowerCase().trim();
        
        setTranscript(transcriptText);
        onResult?.(transcriptText);

        if (result.isFinal) {
          // Check for matching commands
          for (const cmd of commands) {
            const allTriggers = [cmd.command, ...cmd.aliases].map(t => t.toLowerCase());
            if (allTriggers.some(trigger => transcriptText.includes(trigger))) {
              cmd.action();
              toast.success(`Comando: ${cmd.description}`);
              break;
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        
        if (event.error === 'not-allowed') {
          toast.error('Permissão de microfone negada');
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && continuous) {
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [commands, language, continuous, onResult, onError, isListening]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      toast.error('Reconhecimento de voz não suportado');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Ouvindo comandos de voz...');
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
}

// Default DJ voice commands
export const defaultDJCommands: Omit<VoiceCommand, 'action'>[] = [
  { command: 'play', aliases: ['tocar', 'iniciar'], description: 'Tocar música' },
  { command: 'pause', aliases: ['pausar', 'parar'], description: 'Pausar música' },
  { command: 'next', aliases: ['próxima', 'avançar'], description: 'Próxima faixa' },
  { command: 'previous', aliases: ['anterior', 'voltar'], description: 'Faixa anterior' },
  { command: 'mix', aliases: ['mixar', 'transição'], description: 'Iniciar transição' },
  { command: 'loop', aliases: ['repetir'], description: 'Ativar loop' },
  { command: 'sync', aliases: ['sincronizar'], description: 'Sincronizar BPM' },
];
