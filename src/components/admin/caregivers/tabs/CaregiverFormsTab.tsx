"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Send,
  Eye,
  X,
  FileCheck2,
  Printer,
} from "lucide-react";
import { AdminCaregiverProfile, CaregiverFormItem } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverFormsTabProps {
  profile: AdminCaregiverProfile;
}

const DEFAULT_FORMS: CaregiverFormItem[] = [
  {
    id: "FRM-101",
    title: "CNA & HHA Clinical Skills Competency Assessment",
    type: "Clinical Evaluation",
    dateSigned: "2026-02-14",
    status: "Completed",
    signedBy: "Mackenzie Bertelsman (RN Supervisor)",
  },
  {
    id: "FRM-102",
    title: "HIPAA Confidentiality & Protected Health Information Acknowledgment",
    type: "Annual Compliance",
    dateSigned: "2026-02-10",
    status: "Completed",
    signedBy: "Carole Carter",
  },
  {
    id: "FRM-103",
    title: "EVV GPS Location Tracking & Telephony Protocol Consent",
    type: "Operational Compliance",
    dateSigned: "2026-02-10",
    status: "Completed",
    signedBy: "Carole Carter",
  },
  {
    id: "FRM-104",
    title: "Infection Control & PPE Attestation (OSHA Standards)",
    type: "Safety Protocol",
    dateSigned: "2026-01-15",
    status: "Completed",
    signedBy: "Carole Carter",
  },
  {
    id: "FRM-105",
    title: "Annual Caregiver Performance Appraisal 2026",
    type: "Supervisory Review",
    dateSigned: "2026-11-12",
    status: "Completed",
    signedBy: "Will Martin (Operations Director)",
  },
];

const FORM_TEMPLATES = [
  { title: "Quarterly In-Home Safety Observation Check", type: "Safety Protocol" },
  { title: "Medication Assistance Refresher Assessment", type: "Clinical Evaluation" },
  { title: "Emergency Disaster Preparedness Plan", type: "Operational Compliance" },
  { title: "Client Rights & Abuse Prevention Attestation", type: "Annual Compliance" },
];

export function CaregiverFormsTab({ profile }: CaregiverFormsTabProps) {
  const [formsList, setFormsList] = useState<CaregiverFormItem[]>(
    profile.forms && profile.forms.length > 0 ? profile.forms : DEFAULT_FORMS
  );

  // Modals
  const [selectedForm, setSelectedForm] = useState<CaregiverFormItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  const handleAssignForm = () => {
    const template = FORM_TEMPLATES[selectedTemplateIndex];
    const newForm: CaregiverFormItem = {
      id: `FRM-${Date.now().toString().slice(-4)}`,
      title: template.title,
      type: template.type,
      dateSigned: "Pending Signature",
      status: "Pending Signature",
      signedBy: profile.name,
    };
    setFormsList((prev) => [newForm, ...prev]);
    setIsAssignModalOpen(false);
    toast.success(`Assigned "${template.title}" to ${profile.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Caregiver Evaluative & Operational Forms
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Signed competencies, clinical supervisory evaluations, and annual acknowledgments
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAssignModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Form</span>
        </button>
      </div>

      {/* 02. Forms Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Form Title</th>
                <th className="py-3.5 px-4">Form Type</th>
                <th className="py-3.5 px-4">Signed Date</th>
                <th className="py-3.5 px-4">Signed / Certified By</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {formsList.map((form) => (
                <tr key={form.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#3D6B22] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span>{form.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{form.type}</td>
                  <td className="py-4 px-4 text-slate-600 ">{form.dateSigned}</td>
                  <td className="py-4 px-4 text-slate-800 font-semibold">{form.signedBy}</td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${form.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                    >
                      {form.status === "Completed" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      {form.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedForm(form)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Form</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 03. Functional View Form Detail Modal */}
      {selectedForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedForm.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedForm.type}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForm(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Document Identifier:</span>
                  <span className=" font-bold text-slate-800">{selectedForm.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Sign Date:</span>
                  <span className="font-semibold text-slate-800">{selectedForm.dateSigned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Certified Signatory:</span>
                  <span className="font-semibold text-slate-800">{selectedForm.signedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Validation Status:</span>
                  <span className="text-emerald-700 font-bold">{selectedForm.status} (Legally Binding)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700 leading-relaxed">
                <span className="font-bold text-emerald-900 block mb-0.5">Digital Attestation Timestamp:</span>
                SHA-256 Hash verified through state registry integration. All clauses acknowledged in full compliance with agency bylaws.
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Printed official copy of ${selectedForm.title}`);
                  setSelectedForm(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedForm(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 04. Assign Form Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assign Operational Form</h3>
                  <p className="text-xs text-slate-500 font-medium">Select a standard clinical evaluation or compliance template</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <label className="text-slate-700 font-bold block mb-1">Select Form Template</label>
              {FORM_TEMPLATES.map((tmpl, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedTemplateIndex === i
                    ? "bg-emerald-50/60 border-emerald-300 text-slate-900"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="formTemplate"
                    checked={selectedTemplateIndex === i}
                    onChange={() => setSelectedTemplateIndex(i)}
                    className="mt-0.5 accent-[#3D6B22]"
                  />
                  <div>
                    <span className="font-bold block text-slate-900">{tmpl.title}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{tmpl.type}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignForm}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
              >
                Assign Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
