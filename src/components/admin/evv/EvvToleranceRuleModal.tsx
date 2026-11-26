"use client";

import React, { useState, useEffect } from "react";
import { Sliders, X, Check } from "lucide-react";
import { EvvToleranceRule } from "@/types/evvVisit";

interface EvvToleranceRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleToEdit?: EvvToleranceRule | null;
  onSave: (rule: EvvToleranceRule) => void;
}

export function EvvToleranceRuleModal({
  isOpen,
  onClose,
  ruleToEdit,
  onSave,
}: EvvToleranceRuleModalProps) {
  const isEditing = Boolean(ruleToEdit);

  const [ruleName, setRuleName] = useState("");
  const [payer, setPayer] = useState("Health First Colorado (Medicaid)");
  const [program, setProgram] = useState("HCBS-EBD");
  const [serviceCode, setServiceCode] = useState("ALL");
  const [serviceLabel, setServiceLabel] = useState("All Covered Services");
  const [clockInTolerance, setClockInTolerance] = useState(10);
  const [clockOutTolerance, setClockOutTolerance] = useState(10);
  const [earlyArrival, setEarlyArrival] = useState<
    "Allow within Grace" | "Require Reason" | "Flag for Review" | "Round to Schedule" | "Allow"
  >("Allow within Grace");
  const [lateDeparture, setLateDeparture] = useState<
    "Allow within Grace" | "Require Supervisor Approval" | "Require Overtime Approval" | "Flag Exception"
  >("Allow within Grace");
  const [notes, setNotes] = useState("");
  const [requireSupervisorReview, setRequireSupervisorReview] = useState(false);

  // Sync form when ruleToEdit changes or modal opens
  useEffect(() => {
    if (ruleToEdit) {
      setRuleName(ruleToEdit.ruleName || "");
      setPayer(ruleToEdit.payer || "Health First Colorado (Medicaid)");
      setProgram(ruleToEdit.program || "HCBS-EBD");
      setServiceCode(ruleToEdit.serviceCode || "ALL");
      setServiceLabel(ruleToEdit.serviceName || "All Covered Services");
      setClockInTolerance(
        ruleToEdit.clockInToleranceMinutes ?? ruleToEdit.timeToleranceMinutes ?? 10
      );
      setClockOutTolerance(
        ruleToEdit.clockOutToleranceMinutes ?? ruleToEdit.timeToleranceMinutes ?? 10
      );
      setEarlyArrival(ruleToEdit.earlyArrivalHandling || "Allow within Grace");
      setLateDeparture(ruleToEdit.lateDepartureHandling || "Allow within Grace");
      setNotes(ruleToEdit.description || "");
      setRequireSupervisorReview(Boolean(ruleToEdit.reviewRequired));
    } else {
      // Default initial form state matching screenshot
      setRuleName("");
      setPayer("Health First Colorado (Medicaid)");
      setProgram("HCBS-EBD");
      setServiceCode("ALL");
      setServiceLabel("All Covered Services");
      setClockInTolerance(10);
      setClockOutTolerance(10);
      setEarlyArrival("Allow within Grace");
      setLateDeparture("Allow within Grace");
      setNotes("");
      setRequireSupervisorReview(false);
    }
  }, [ruleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleName.trim()) {
      return;
    }

    // Infer State and Aggregator details based on payer
    let stateCode = "CO";
    let aggregatorName = "Sandata";
    let geofenceRadius = 150;
    let gpsReq: "Required" | "Optional" = "Required";
    let sigReq: "Required" | "Optional" = "Required";
    let voiceReq: "Required" | "Optional" | "Not Applicable" = "Optional";

    if (payer.includes("Ohio")) {
      stateCode = "OH";
      aggregatorName = "Sandata";
      geofenceRadius = 150;
    } else if (payer.includes("New Jersey") || payer.includes("NJ")) {
      stateCode = "NJ";
      aggregatorName = "HHAeXchange";
      geofenceRadius = 300;
      sigReq = "Optional";
      voiceReq = "Required";
    } else if (payer.includes("Florida") || payer.includes("FL")) {
      stateCode = "FL";
      aggregatorName = "Netsmart";
      geofenceRadius = 250;
      gpsReq = "Optional";
      sigReq = "Required";
    } else if (payer.includes("Private Pay") || payer.includes("LTC")) {
      stateCode = "Agency";
      aggregatorName = "CareBridge";
      geofenceRadius = 500;
      gpsReq = "Optional";
      sigReq = "Optional";
      voiceReq = "Not Applicable";
    }

    const newOrUpdatedRule: EvvToleranceRule = {
      id: ruleToEdit?.id || `RULE-${Date.now().toString().slice(-4)}`,
      ruleName: ruleName.trim(),
      payer,
      program,
      serviceCode: serviceCode.trim() || "ALL",
      serviceName: serviceLabel.trim() || "All Covered Services",
      clockInToleranceMinutes: Number(clockInTolerance) || 10,
      clockOutToleranceMinutes: Number(clockOutTolerance) || 10,
      timeToleranceMinutes: Number(clockInTolerance) || 10,
      earlyArrivalHandling: earlyArrival,
      lateDepartureHandling: lateDeparture,
      lateArrivalHandling: "Allow within Grace",
      earlyDepartureHandling: "Allow within Grace",
      reviewRequired: requireSupervisorReview,
      approvalRequired: requireSupervisorReview,
      description: notes.trim(),
      stateCode: ruleToEdit?.stateCode || stateCode,
      statePayerName: ruleToEdit?.statePayerName || payer,
      aggregatorName: ruleToEdit?.aggregatorName || aggregatorName,
      geofenceRadiusFeet: ruleToEdit?.geofenceRadiusFeet || geofenceRadius,
      gpsRequirement: ruleToEdit?.gpsRequirement || gpsReq,
      signatureRequirement: ruleToEdit?.signatureRequirement || sigReq,
      voiceRequirement: ruleToEdit?.voiceRequirement || voiceReq,
      effectiveDate: ruleToEdit?.effectiveDate || "2026-01-01",
      isActive: ruleToEdit?.isActive ?? true,
    };

    onSave(newOrUpdatedRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Matching Screenshot) */}
        <div className="p-4 sm:p-5 flex items-start justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isEditing ? "Edit EVV Tolerance Rule" : "Create EVV Tolerance Rule"}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Define grace windows and review requirements by payer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Rule Name * */}
          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
              Rule Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g., CES Waiver Strict 7-Minute Window"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Row 2: Payer & Program */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
                Payer
              </label>
              <select
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 cursor-pointer"
              >
                <option value="Health First Colorado (Medicaid)">
                  Health First Colorado (Medicaid)
                </option>
                <option value="Ohio Medicaid (ODM)">Ohio Medicaid (ODM)</option>
                <option value="NJ FamilyCare">NJ FamilyCare</option>
                <option value="Florida AHCA">Florida AHCA</option>
                <option value="Private Pay / LTC">Private Pay / LTC</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
                Program
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 cursor-pointer"
              >
                <option value="HCBS-EBD">HCBS-EBD</option>
                <option value="HCBS-CES">HCBS-CES</option>
                <option value="HCBS-CHRP">HCBS-CHRP</option>
                <option value="HCBS-SLS">HCBS-SLS</option>
                <option value="HCBS-ODM">HCBS-ODM</option>
                <option value="MLTSS">MLTSS</option>
                <option value="SMMC-LTC">SMMC-LTC</option>
                <option value="Private Duty">Private Duty</option>
              </select>
            </div>
          </div>

          {/* Row 3: Service Code & Service Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
                Service Code
              </label>
              <input
                type="text"
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                placeholder="ALL"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>

            <div>
              <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
                Service Label
              </label>
              <input
                type="text"
                value={serviceLabel}
                onChange={(e) => setServiceLabel(e.target.value)}
                placeholder="All Covered Services"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Row 4: Clock-in & Clock-out Tolerances (Bordered Container Box matching screenshot) */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  Clock-in Tolerance (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={clockInTolerance}
                  onChange={(e) => setClockInTolerance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
                  Clock-out Tolerance (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={clockOutTolerance}
                  onChange={(e) => setClockOutTolerance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-900 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Early Arrival & Late Departure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
                Early Arrival
              </label>
              <select
                value={earlyArrival}
                onChange={(e) =>
                  setEarlyArrival(
                    e.target.value as "Allow within Grace" | "Require Reason" | "Flag for Review" | "Round to Schedule" | "Allow"
                  )
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 cursor-pointer"
              >
                <option value="Allow within Grace">Allow within Grace</option>
                <option value="Require Reason">Require Reason</option>
                <option value="Flag for Review">Flag for Review</option>
                <option value="Round to Schedule">Round to Schedule</option>
                <option value="Allow">Allow</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
                Late Departure
              </label>
              <select
                value={lateDeparture}
                onChange={(e) =>
                  setLateDeparture(
                    e.target.value as "Allow within Grace" | "Require Supervisor Approval" | "Require Overtime Approval" | "Flag Exception"
                  )
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 cursor-pointer"
              >
                <option value="Allow within Grace">Allow within Grace</option>
                <option value="Require Supervisor Approval">Require Supervisor Approval</option>
                <option value="Require Overtime Approval">Require Overtime Approval</option>
                <option value="Flag Exception">Flag Exception</option>
              </select>
            </div>
          </div>

          {/* Row 6: Rule Policy Notes */}
          <div>
            <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">
              Rule Policy Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain policy justification or contract basis..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800 resize-y"
            />
          </div>

          {/* Row 7: Checkbox Require supervisor review */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireSupervisorReview}
                onChange={(e) => setRequireSupervisorReview(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]/20 cursor-pointer"
              />
              <span className="text-[13px] font-semibold text-slate-800">
                Require supervisor review on variance
              </span>
            </label>
          </div>

          {/* Modal Actions Footer (Matching Screenshot) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
