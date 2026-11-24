"use client";

import React, { useState } from "react";
import {
  Activity,
  Heart,
  Pill,
  AlertTriangle,
  Stethoscope,
  Phone,
  FileText,
  Plus,
  ShieldCheck,
  Lock,
  Printer,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientHealthcareTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientHealthcareTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientHealthcareTabProps) {
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const health = client.healthcare || {
    diagnoses: [],
    medications: [],
    allergies: [],
    vitals: [],
    physicians: [],
  };

  const [orderForm, setOrderForm] = useState({
    code: "G80.9",
    description: "Cerebral Palsy, Unspecified",
    type: "Secondary" as "Primary" | "Secondary",
    onsetDate: "2020-04-12",
  });

  const canManageClinical = userRole === "admin" || userRole === "clinical";

  const handleCreateDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.code.trim() || !orderForm.description.trim()) {
      toast.error("Please enter ICD-10 code and clinical description.");
      return;
    }

    const newDiag = {
      code: orderForm.code.trim().toUpperCase(),
      description: orderForm.description.trim(),
      type: orderForm.type,
      onsetDate: orderForm.onsetDate,
    };

    const updatedHealth = {
      ...health,
      diagnoses: [...health.diagnoses, newDiag],
    };

    const updated: ClientRecord = {
      ...client,
      healthcare: updatedHealth,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsAddOrderOpen(false);
    toast.success(`Diagnosis ${newDiag.code} added to clinical orders.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Clinical roles */}
      {!canManageClinical && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Clinical Oversight View:</strong> Diagnoses and medical orders are governed by the Supervising Nurse RN. Displayed for care coordination reference.
            </span>
          </div>
          <span className="font-bold text-blue-700 uppercase tracking-wider text-[10px] bg-blue-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Clinical Healthcare & Medical Profile
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> RN Certified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ICD-10 clinical diagnoses, active medication regimen, allergies, and attending physicians
            </p>
          </div>
        </div>

        {canManageClinical && (
          <button
            type="button"
            onClick={() => setIsAddOrderOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Clinical Order</span>
          </button>
        )}
      </div>

      {/* Grid: Diagnoses and Allergies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Diagnoses Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3D6B22]" />
              <span>Diagnoses (ICD-10)</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {health.diagnoses.length} Active Diagnoses
            </span>
          </div>

          <div className="space-y-3">
            {health.diagnoses.map((d, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded">
                      {d.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${d.type === "Primary"
                        ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                    >
                      {d.type}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs font-bold text-slate-900">
                    {d.description}
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                  Onset: {d.onsetDate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Allergies & Sensitivities</span>
            </h3>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              High Risk
            </span>
          </div>

          <div className="space-y-2.5">
            {health.allergies.map((a, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-rose-950">{a.allergen}</div>
                  <div className="text-[11px] text-rose-700 mt-0.5 font-medium">
                    Reaction: {a.reaction}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medications Regimen */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#3D6B22]" />
            <span>Medication Administration Record (MAR)</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {health.medications.length} Prescribed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health.medications.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  Dosage: <strong className="text-slate-800">{m.dosage}</strong> • {m.frequency}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Route: {m.route}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                Prescriber: {m.prescriber}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Clinical Order Modal */}
      <Modal
        isOpen={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        title="Add Clinical Diagnosis Order"
        icon={<Stethoscope className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateDiagnosis} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              ICD-10 Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={orderForm.code}
              onChange={(e) => setOrderForm({ ...orderForm, code: e.target.value })}
              placeholder="e.g. G80.9"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Clinical Diagnosis Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={orderForm.description}
              onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
              placeholder="e.g. Cerebral Palsy, Unspecified"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Diagnosis Classification
              </label>
              <select
                value={orderForm.type}
                onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Onset Date
              </label>
              <input
                type="date"
                value={orderForm.onsetDate}
                onChange={(e) => setOrderForm({ ...orderForm, onsetDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOrderOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Clinical Order</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
