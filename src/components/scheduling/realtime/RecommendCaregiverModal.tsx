"use client";

import React, { useMemo, useState } from "react";
import {
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  Home,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormButtonCancel } from "@/components/ui/FormControls";
import { RealTimeVisit, CaregiverMatchScore } from "@/types/scheduling";
import { CaregiverRecord } from "@/types/caregiver";
import { ClientRecord } from "@/types/client";
import { getRecommendedCaregivers } from "@/lib/scheduling/schedulingStore";

interface RecommendCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: RealTimeVisit | null;
  caregivers: CaregiverRecord[];
  allVisits: RealTimeVisit[];
  clients: ClientRecord[];
  onAssignCaregiver: (visitId: string, match: CaregiverMatchScore) => void;
}

export function RecommendCaregiverModal({
  isOpen,
  onClose,
  visit,
  caregivers,
  allVisits,
  clients,
  onAssignCaregiver,
}: RecommendCaregiverModalProps) {
  const [onlyActivated, setOnlyActivated] = useState(true);

  const ranked = useMemo(() => {
    if (!visit) return [];
    const list = getRecommendedCaregivers(visit, caregivers, allVisits, clients);
    return onlyActivated ? list.filter((m) => m.isActivated) : list;
  }, [visit, caregivers, allVisits, clients, onlyActivated]);

  if (!visit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Recommended Caregivers · ${visit.clientName}`}
      description={`Ranked by Availability, Distance, Skill Match & Compliance for ${visit.date} (${visit.startTime}–${visit.endTime})`}
      icon={<Sparkles className="w-5 h-5" />}
      maxWidth="3xl"
      footer={<FormButtonCancel onClick={onClose}>Close</FormButtonCancel>}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900">{visit.serviceCode}</span>
            <span>·</span>
            <span>{visit.serviceName}</span>
            <span>·</span>
            <span className="font-semibold text-[#3D6B22]">{visit.scheduledHours} hrs</span>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyActivated}
              onChange={(e) => setOnlyActivated(e.target.checked)}
              className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
            />
            <span>Active & Cleared Only</span>
          </label>
        </div>

        <div className="space-y-2.5">
          {ranked.map((match, idx) => (
            <div
              key={match.caregiverId}
              className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                idx === 0 && !match.hasConflict
                  ? "bg-[#F2F8EE]/60 border-[#93C573]"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-400">#{idx + 1}</span>
                  <span className="text-sm font-bold text-slate-900">{match.caregiverName}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {match.type} · {match.employmentClassification}
                  </span>
                  {match.isHouseholdLinked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-[#3D6B22] border border-[#C7E4B3]">
                      <Home className="w-3 h-3" />
                      Household Linked
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                      match.overallScore >= 80
                        ? "bg-[#3D6B22] text-white"
                        : match.overallScore >= 60
                          ? "bg-sky-100 text-sky-800"
                          : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {match.overallScore}% Match
                  </span>
                </div>

                {/* Breakdown metrics */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-800">{match.distanceMiles} mi</strong> (
                    {match.travelMinutes}m drive)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {match.scheduledHoursThisWeek}/{match.weeklyCapacityHours}h this week
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    <span>Skills {match.skillMatchScore}%</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />
                    <span>Avail {match.availabilityScore}%</span>
                  </span>
                </div>

                {/* Matched Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {match.matchedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-[#1E5622] border border-emerald-200"
                    >
                      {sk}
                    </span>
                  ))}
                  {match.missingSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200"
                    >
                      Missing: {sk}
                    </span>
                  ))}
                </div>

                {match.hasConflict && match.conflictReason && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 w-fit">
                    {!match.isActivated ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{match.conflictReason}</span>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  disabled={!match.isActivated}
                  onClick={() => {
                    onAssignCaregiver(visit.id, match);
                    onClose();
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !match.isActivated
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-[#3D6B22] hover:bg-[#345C1D] text-white shadow-sm shadow-[#3D6B22]/20 active:scale-95"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{match.isActivated ? "Assign Caregiver" : "Pending Clearance"}</span>
                </button>
              </div>
            </div>
          ))}

          {ranked.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No caregivers match the current filter. Toggle &quot;Active &amp; Cleared Only&quot; to
              view onboarding candidates.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
