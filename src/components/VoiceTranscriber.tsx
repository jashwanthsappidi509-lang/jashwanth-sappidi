import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../context/LanguageContext';

interface VoiceTranscriberProps {
  onTranscription: (text: string) => void;
  placeholder?: string;
}

export default function VoiceTranscriber({ onTranscription, placeholder = "Tap to speak..." }: VoiceTranscriberProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { language } = useLanguage();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please enable permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "audio/webm",
                },
              },
              {
                text: `Transcribe this audio accurately. The speaker is likely a farmer speaking in ${language.name}. 
                If the audio is in another Indian language, transcribe it in that language. 
                Only return the transcribed text, nothing else.`,
              },
            ],
          },
        ],
      });

      const text = response.text;
      if (text) {
        onTranscription(text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTranscribing ? (
            <Loader2 className="animate-spin" size={24} />
          ) : isRecording ? (
            <Square size={20} fill="white" />
          ) : (
            <Mic size={24} />
          )}
        </button>
        
        <div className="flex-1">
          {isTranscribing ? (
            <p className="text-sm font-medium text-gray-400 animate-pulse">Transcribing your voice...</p>
          ) : isRecording ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 20, 8] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-1 bg-red-400 rounded-full"
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-red-500">Listening...</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 font-medium">{placeholder}</p>
          )}
        </div>

        {error && (
          <div className="absolute -top-12 left-0 right-0 p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
