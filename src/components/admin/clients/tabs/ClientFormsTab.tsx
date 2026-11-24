"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Eye,
  Send,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { ClientRecord, AssessmentFormItem } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientFormsTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientFormsTab({ client, onUpdateClient }: ClientFormsTabProps) {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState<AssessmentFormItem | null>(null);

  const forms = client.forms || [];

  const [sendFormState, setSendFormState] = useState({
    selectedFormId: forms[0]?.id || "FORM-101",
    recipient: client.responsibleParties?.[0]?.name || "Eleanor Miller",
    deliveryMethod: "SMS & Email Portal Link",
    customNote: "Please review and e-sign the annual waiver packet at your earliest convenience.",
  });

  const handleSendFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenForm = forms.find((f) => f.id === sendFormState.selectedFormId) || forms[0];

    const newNote = {
      id: `NOT-${Date.now()}`,
      timestamp: "Today, Just now",
      author: "Agency Admin",
      authorRole: "Operational Administrator",
      category: "Family Communication" as const,
      title: `Form Sent: ${chosenForm?.title || "Assessment Form"}`,
      content: `Dispatched ${chosenForm?.title} to ${sendFormState.recipient} via ${sendFormState.deliveryMethod}. Note: "${sendFormState.customNote}"`,
      isPinned: false,
    };

    const updated: ClientRecord = {
      ...client,
      notes: [newNote, ...(client.notes || [])],
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsSendModalOpen(false);
    toast.success(`Form packet sent to ${sendFormState.recipient}. Communication logged.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Standardized State & Agency Assessment Forms
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> e-Sign Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Waiver reassessment questionnaires, electronic signature packets, and compliance forms
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSendModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Form to Family</span>
        </button>
      </div>

      {/* Forms List Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Assessment Packets
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Legal state instruments and signed intake packets
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
            {forms.length} Registered Forms
          </span>
        </div>

        <div className="space-y-3">
          {forms.map((f) => (
            <div
              key={f.id}
              className="p-4 sm:p-4.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className=" text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                    {f.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                  <span className="text-xs font-semibold text-slate-500">
                    ({f.type})
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-slate-500 font-medium">
                  Last Updated: <strong className="text-slate-700">{f.lastUpdated}</strong>
                  {f.signedBy && (
                    <span> • Signed by: <strong className="text-[#3D6B22]">{f.signedBy}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${f.status === "Completed & Signed"
                    ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  {f.status}
                </span>

                <button
                  type="button"
                  onClick={() => setViewingForm(f)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Form Modal */}
      {viewingForm && (
        <Modal
          isOpen={!!viewingForm}
          onClose={() => setViewingForm(null)}
          title={viewingForm.title}
          description={`Instrument Form ID: ${viewingForm.id} • ${viewingForm.type}`}
          icon={<FileText className="w-5 h-5 text-[#3D6B22]" />}
          maxWidth="2xl"
          footer={
            <button
              type="button"
              onClick={() => setViewingForm(null)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Close Form
            </button>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Status: {viewingForm.status}
                </span>
                <span className="text-xs text-slate-500">
                  Signed By: <strong className="text-slate-800">{viewingForm.signedBy || "Electronic Guardian Signature"}</strong>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Updated: {viewingForm.lastUpdated}
              </span>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs text-slate-700">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                ASSESSMENT SECTIONS & RESPONSES
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Section 1: In-Home Respite Adequacy</span>
                <span className="font-bold text-slate-800">Satisfactory (Level 3)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Section 2: Environmental Safety Hazard Check</span>
                <span className="font-bold text-[#3D6B22]">Clear / No Hazards Found</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Section 3: Family Support Capacity</span>
                <span className="font-bold text-slate-800">Primary Guardian Active</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Section 4: Transportation Access</span>
                <span className="font-bold text-slate-800">DSP Driving Authorized</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Send Form to Family Modal */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Send Assessment Form to Family"
        icon={<Send className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSendFormSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Select Assessment Packet
            </label>
            <select
              value={sendFormState.selectedFormId}
              onChange={(e) => setSendFormState({ ...sendFormState, selectedFormId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Recipient Guardian
            </label>
            <input
              type="text"
              required
              value={sendFormState.recipient}
              onChange={(e) => setSendFormState({ ...sendFormState, recipient: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Delivery Channel
            </label>
            <select
              value={sendFormState.deliveryMethod}
              onChange={(e) => setSendFormState({ ...sendFormState, deliveryMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
            >
              <option value="SMS & Email Portal Link">SMS & Email Portal Link</option>
              <option value="Secure Client Portal Notification">Secure Client Portal Notification</option>
              <option value="Email Only">Email Only</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Message to Family
            </label>
            <textarea
              rows={2}
              value={sendFormState.customNote}
              onChange={(e) => setSendFormState({ ...sendFormState, customNote: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSendModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Packet</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
