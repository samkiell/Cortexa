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

export const useVoiceInput = (): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            } else {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error !== 'no-speech') {
            toast.error("Voice input failed. Try again.");
          }
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    try {
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
      } catch (e) {}

      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Mic permission denied', err);
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
