"use client";

import React, { useMemo, useState } from "react";
import { Send, CheckCircle2, Radio, MapPin, Smartphone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  FormLabel,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import { RealTimeVisit, VisitBroadcastRecord } from "@/types/scheduling";
import { CaregiverRecord } from "@/types/caregiver";
import { ClientRecord } from "@/types/client";
import { getRecommendedCaregivers } from "@/lib/scheduling/schedulingStore";

interface SendToCaregiversModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: RealTimeVisit | null;
  caregivers: CaregiverRecord[];
  allVisits: RealTimeVisit[];
  clients: ClientRecord[];
  onSendBroadcast: (
    visitId: string,
    caregiverIds: string[],
    caregiverNames: string[],
    channel: VisitBroadcastRecord["channel"],
    urgency: VisitBroadcastRecord["urgency"],
    message: string
  ) => void;
}

export function SendToCaregiversModal({
  isOpen,
  onClose,
  visit,
  caregivers,
  allVisits,
  clients,
  onSendBroadcast,
}: SendToCaregiversModalProps) {
  const candidates = useMemo(() => {
    if (!visit) return [];
    return getRecommendedCaregivers(visit, caregivers, allVisits, clients).filter(
      (c) => c.isActivated
    );
  }, [visit, caregivers, allVisits, clients]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    candidates.slice(0, 4).map((c) => c.caregiverId)
  );
  const [channel, setChannel] = useState<VisitBroadcastRecord["channel"]>("Mobile Push + SMS");
  const [urgency, setUrgency] = useState<VisitBroadcastRecord["urgency"]>("Urgent");
  const [message, setMessage] = useState(() =>
    visit
      ? `Open ${visit.serviceCode} shift for ${visit.clientName} (${visit.clientRegion}) on ${visit.date} from ${visit.startTime} to ${visit.endTime} (${visit.scheduledHours}h). Tap to accept in LiliSare Caregiver App.`
      : ""
  );

  if (!visit) return null;

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    const names = candidates
      .filter((c) => selectedIds.includes(c.caregiverId))
      .map((c) => c.caregiverName);

    onSendBroadcast(visit.id, selectedIds, names, channel, urgency, message);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Open Shift to Caregivers"
      description={`Broadcast shift offer for ${visit.clientName} (${visit.date}, ${visit.startTime}–${visit.endTime})`}
      icon={<Send className="w-5 h-5" />}
      maxWidth="2xl"
      footer={
        <>
          <FormButtonCancel onClick={onClose} />
          <FormButtonPrimary
            type="submit"
            form="broadcast-shift-form"
            disabled={selectedIds.length === 0}
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast to {selectedIds.length} Caregivers</span>
          </FormButtonPrimary>
        </>
      }
    >
      <form id="broadcast-shift-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <FormLabel htmlFor="broadcast-channel">Delivery Channel</FormLabel>
            <FormSelect
              id="broadcast-channel"
              icon={<Smartphone className="w-4 h-4" />}
              value={channel}
              onChange={(e) => setChannel(e.target.value as VisitBroadcastRecord["channel"])}
            >
              <option value="Mobile Push + SMS">Mobile Push + SMS</option>
              <option value="Mobile App Push">Mobile App Push</option>
              <option value="SMS Alert">SMS Alert</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel htmlFor="broadcast-urgency">Priority Level</FormLabel>
            <FormSelect
              id="broadcast-urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as VisitBroadcastRecord["urgency"])}
            >
              <option value="Urgent">Urgent Fill (Immediate Push)</option>
              <option value="Standard">Standard Shift Offer</option>
            </FormSelect>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FormLabel className="mb-0">
              Select Eligible Active Caregivers ({selectedIds.length}/{candidates.length})
            </FormLabel>
            <button
              type="button"
              onClick={() =>
                setSelectedIds(
                  selectedIds.length === candidates.length
                    ? []
                    : candidates.map((c) => c.caregiverId)
                )
              }
              className="text-xs font-bold text-[#3D6B22] hover:underline cursor-pointer"
            >
              {selectedIds.length === candidates.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl divide-y divide-slate-100">
            {candidates.map((cg) => {
              const checked = selectedIds.includes(cg.caregiverId);
              return (
                <label
                  key={cg.caregiverId}
                  className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                    checked ? "bg-[#F2F8EE]/60" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleId(cg.caregiverId)}
                      className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{cg.caregiverName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#3D6B22]">
                          {cg.overallScore}% Match
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {cg.distanceMiles} mi
                        </span>
                        <span>·</span>
                        <span>{cg.phone}</span>
                        {cg.hasConflict && (
                          <span className="text-amber-700 font-semibold">
                            · {cg.conflictReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {checked && <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0" />}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <FormLabel htmlFor="broadcast-msg">Shift Offer Message</FormLabel>
          <FormTextarea
            id="broadcast-msg"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
