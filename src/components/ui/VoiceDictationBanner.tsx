"use client";

import React, { useState, useRef } from "react";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";

export interface VoiceDictationBannerProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  recordingLabel?: string;
  onDictate: (spokenText?: string) => void;
  className?: string;
}

export function VoiceDictationBanner({
  title = "AI Voice Dictation",
  subtitle = "Speak naturally to log the patient inquiry",
  buttonLabel = "Dictate Inquiry",
  recordingLabel = "Recording...",
  onDictate,
  className = "",
}: VoiceDictationBannerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startDictation = () => {
    if (isRecording) return;

    setIsRecording(true);
    setLiveTranscript("");

    // Check if Browser SpeechRecognition is available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let recognizedWords = "";

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          recognizedWords = current;
          setLiveTranscript(current);
        };

        recognition.onerror = () => {
          // If error occurs, fallback smoothly
        };

        recognition.onend = () => {
          finishDictation(recognizedWords);
        };

        recognition.start();

        // Safety timeout in case speech recognition stays open
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (_) {}
          }
        }, 3200);

        return;
      } catch (e) {
        // Fallback to simulation if speech recognition is blocked or unsupported
      }
    }

    // High-fidelity fallback simulation
    setTimeout(() => {
      finishDictation();
    }, 2500);
  };

  const finishDictation = (spokenText?: string) => {
    setIsRecording(false);
    setLiveTranscript("");
    onDictate(spokenText);
  };

  return (
    <div
      className={`bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-blue-50/50 backdrop-blur-xl rounded-2xl p-4 sm:p-4.5 border border-[#3D6B22]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isRecording
              ? "bg-rose-100 text-rose-600 border border-rose-300 animate-pulse shadow-sm"
              : "bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20"
          }`}
        >
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            {isRecording && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                Listening
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRecording
              ? liveTranscript
                ? `Transcribing: "${liveTranscript}..."`
                : "Listening to voice input... speak clinical notes, contact, or patient details"
              : subtitle}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={startDictation}
        disabled={isRecording}
        className={`shrink-0 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] border cursor-pointer flex items-center justify-center gap-2 ${
          isRecording
            ? "bg-rose-50 text-rose-600 border-rose-300 shadow-[0_4px_16px_rgba(225,29,72,0.12)] cursor-not-allowed"
            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
        }`}
      >
        {isRecording ? (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{recordingLabel}</span>
          </>
        ) : (
          <span>{buttonLabel}</span>
        )}
      </button>
    </div>
  );
}
