"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Clock,
  Home,
  UserCheck,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InquiryRecord } from "@/types/intake";
import { Household } from "@/lib/households/mockData";

interface IntakeAiBriefingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: InquiryRecord[];
  households?: Household[];
  lastSyncTime: string;
}

export function IntakeAiBriefingDrawer({
  isOpen,
  onClose,
  inquiries,
  households = [],
  lastSyncTime,
}: IntakeAiBriefingDrawerProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const urgentInquiries = inquiries.filter(
    (i) => i.urgency === "Urgent" || i.urgency === "Immediate" || i.source === "Hospital Discharge"
  );
  const newLeads = inquiries.filter((i) => i.stage === "New Inquiry" || i.stage === "New Lead");
  const bottleneckHouseholds = households.filter((h) => Boolean(h.triJourneyStatus?.bottleneckMessage));

  const toggleAudio = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const urgentNames = urgentInquiries
      .slice(0, 2)
      .map((i) => i.familyInfo.clientInfo.name)
      .join(" and ");

    const text = `Good morning, Intake Coordinator. Here is your daily LiliSare operational briefing. You have ${urgentInquiries.length} urgent referrals requiring immediate triage, including ${urgentNames || "hospital discharges"}. There are ${newLeads.length} new leads awaiting first contact, and ${bottleneckHouseholds.length} households flagged with coordination delays across the Three Connected Journeys.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
    toast.success("Playing AI audio briefing...");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1B3414] to-[#2D5422] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl text-[#93C573]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">LiliSare AI Intake Briefing</h2>
              <p className="text-xs text-teal-100/90">Daily Triage & Triage Action Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => {
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Audio Player Pill */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Voice Synthesis:</span>
              <span className="text-[11px] text-slate-500">Synced at {lastSyncTime}</span>
            </div>
            <button
              onClick={toggleAudio}
              className="flex items-center gap-1.5 bg-[#1B3414] hover:bg-[#274C1D] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {isPlayingAudio ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-[#93C573] animate-pulse" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-[#93C573]" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>

          {/* Operational Status */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Intake SLA Health: Optimal (98.2%)
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Average response time to emergency and hospital referrals is holding at <strong>14.2 minutes</strong>, well within the mandatory 15-minute compliance window.
            </p>
          </div>

          {/* Critical Action Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Priority Actions Today
            </h4>

            {/* Hospital Discharge Item */}
            <div className="p-3.5 bg-rose-50/80 rounded-xl border border-rose-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-rose-600" /> Hospital Discharge Triage
                </span>
                <span className="text-[10px] bg-rose-200/70 text-rose-800 font-bold px-2 py-0.5 rounded">
                  {urgentInquiries.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Hospital discharge patients require rapid assessment booking within 24 hours to prevent readmission penalties.
              </p>
              <Link
                href="/intake/pipeline"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 pt-1"
              >
                <span>View Hospital Referrals</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Tri-Journey Bottlenecks Item */}
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-600" /> Three Connected Journeys Delays
                </span>
                <span className="text-[10px] bg-amber-200/70 text-amber-800 font-bold px-2 py-0.5 rounded">
                  {bottleneckHouseholds.length} Households
                </span>
              </div>
              <p className="text-xs text-slate-700">
                {bottleneckHouseholds.length > 0
                  ? `${bottleneckHouseholds[0].name} has a caregiver screening delay blocking authorization.`
                  : "All household tracks are progressing without blocking bottlenecks."}
              </p>
              <Link
                href="/intake/households"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 pt-1"
              >
                <span>Resolve Household Delays</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">LiliSare Triage Engine</span>
          <button
            onClick={() => {
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              setIsPlayingAudio(false);
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
