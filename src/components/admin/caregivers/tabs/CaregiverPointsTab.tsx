"use client";

import React, { useState } from "react";
import {
  Award,
  Sparkles,
  TrendingUp,
  Gift,
  Plus,
  CheckCircle2,
  Calendar,
  Star,
} from "lucide-react";
import { AdminCaregiverProfile, CaregiverPointHistory } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverPointsTabProps {
  profile: AdminCaregiverProfile;
}

const DEFAULT_POINT_HISTORY: CaregiverPointHistory[] = [
  {
    id: "PT-101",
    date: "Nov 22, 2026",
    reason: "Zero missed clock-in EVV punctuality streak (30 consecutive days)",
    points: 80,
    type: "positive",
  },
  {
    id: "PT-102",
    date: "Nov 05, 2026",
    reason: "Caregiver of the Month supervisory commendation",
    points: 150,
    type: "positive",
  },
  {
    id: "PT-103",
    date: "Oct 20, 2026",
    reason: "Short-notice weekend shift emergency cover",
    points: 70,
    type: "positive",
  },
  {
    id: "PT-104",
    date: "Oct 12, 2026",
    reason: "Client five-star positive survey feedback",
    points: 50,
    type: "positive",
  },
];

export function CaregiverPointsTab({ profile }: CaregiverPointsTabProps) {
  const [balance, setBalance] = useState(profile.pointsBalance || 420);
  const [history, setHistory] = useState<CaregiverPointHistory[]>(
    profile.pointHistory && profile.pointHistory.length > 0
      ? profile.pointHistory
      : DEFAULT_POINT_HISTORY
  );

  const handleAwardPoints = () => {
    const pts = 50;
    const newEntry: CaregiverPointHistory = {
      id: `PT-${Date.now().toString().slice(-4)}`,
      date: "Today",
      reason: "Administrative Recognition Bonus",
      points: pts,
      type: "positive",
    };
    setBalance((b) => b + pts);
    setHistory((prev) => [newEntry, ...prev]);
    toast.success(`Awarded +${pts} points to ${profile.name}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Points Summary Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center font-bold text-amber-700 shadow-2xs">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Caregiver Rewards & Recognition
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Gold Tier
              </span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{balance} Points</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Available for gift cards, scrubs credits, and paid-time-off bonuses
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAwardPoints}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Award Points (+50)</span>
        </button>
      </div>

      {/* 02. Points Activity Ledger */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Points Activity Ledger</h3>
            <p className="text-xs text-slate-500 font-medium">
              EVV punctuality milestones, client compliments, and agency rewards
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white text-slate-600 border border-slate-200">
            {history.length} Transactions
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {history.map((item) => (
            <div key={item.id} className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{item.reason}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.date}</p>
                </div>
              </div>

              <span className="font-mono font-bold text-sm text-[#1E5622] px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0">
                +{item.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
