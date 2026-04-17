'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

export const useVoiceInput = (): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as { 
        SpeechRecognition: new () => SpeechRecognition; 
        webkitSpeechRecognition: new () => SpeechRecognition; 
      };
      return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
    }
    return false;
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && isSupported) {
      const win = window as unknown as { 
        SpeechRecognition: new () => SpeechRecognition; 
        webkitSpeechRecognition: new () => SpeechRecognition; 
      };
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          if (event.error !== 'no-speech') {
            toast.error("Voice input failed. Try again.");
          }
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [isSupported]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    try {
      // Stop any existing recognition
      try {
        recognitionRef.current.stop();
      } catch {
        // Silent fail
      }

      // Request mic permission and ensure high quality
      await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Reset transcript before starting
      setTranscript('');
      
      // Stop any existing recognition
      try {
        recognitionRef.current.stop();
      } catch {
        // Silent fail
      }

      recognitionRef.current.start();
      setIsListening(true);
    } catch (_err) {
      console.error('Mic permission denied', _err);
      toast.error("Microphone access denied.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  };
};
