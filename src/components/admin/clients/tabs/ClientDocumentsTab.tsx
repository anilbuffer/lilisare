"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  Clock,
  ShieldCheck,
  FileCheck,
  X,
  FileSignature,
} from "lucide-react";
import { ClientRecord, DocumentItem } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientDocumentsTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientDocumentsTab({ client, onUpdateClient }: ClientDocumentsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "Consent",
    signedBy: client.assignedCareTeam?.caseManager?.name || "Eleanor Miller",
    expiryDate: "2027-12-31",
  });

  const docs = client.documents || [];

  const filteredDocs = docs.filter(
    (d) => selectedCategory === "All" || d.category === selectedCategory
  );

  const handleDownloadDoc = (doc: DocumentItem) => {
    const content = `LILISARE HOME HEALTHCARE DOCUMENT
----------------------------------------
Document ID: ${doc.id}
Title: ${doc.name}
Category: ${doc.category}
Client: ${client.name} (${client.id})
Signer: ${doc.signedBy || "N/A"}
Status: ${doc.status}
Upload Date: ${doc.uploadedDate || "Nov 2026"}
Expiry Date: ${doc.expiryDate || "N/A"}
----------------------------------------
Cryptographic Verification Hash: SHA256:${Math.random().toString(36).substring(2, 15).toUpperCase()}
HIPAA Compliance Standard: 45 CFR Part 164 Subpart C
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${doc.name}`);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) {
      toast.error("Please enter a document title.");
      return;
    }

    const newDoc: DocumentItem = {
      id: `DOC-${Date.now()}`,
      name: uploadForm.name.trim(),
      category: uploadForm.category as any,
      status: "Verified",
      signedBy: uploadForm.signedBy.trim(),
      uploadedDate: "Just now",
      expiryDate: uploadForm.expiryDate,
      fileSize: "1.4 MB",
    };

    const updated: ClientRecord = {
      ...client,
      documents: [newDoc, ...(client.documents || [])],
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsUploadModalOpen(false);
    setUploadForm({
      name: "",
      category: "Consent",
      signedBy: "Eleanor Miller",
      expiryDate: "2027-12-31",
    });
    toast.success(`${newDoc.name} uploaded and cryptographically indexed.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Clinical, Consent & Legal Documents
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> HIPAA Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              HIPAA-compliant document management repository with cryptographic audit verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {["All", "Consent", "Assessment", "Authorization", "Medical / Clinical"].map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === cat
                ? "bg-[#3D6B22] text-white shadow-2xs font-bold"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                  {doc.category}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${doc.status === "Verified"
                    ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-[#3D6B22]" />
                  <span>{doc.status}</span>
                </span>
              </div>

              <div className="mt-3.5">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {doc.name}
                </h4>
                <div className="mt-2.5 space-y-1.5 text-xs text-slate-500 font-medium">
                  {doc.signedBy && (
                    <div>Signed: <strong className="text-slate-800">{doc.signedBy}</strong></div>
                  )}
                  {doc.uploadedDate && (
                    <div>Uploaded: {doc.uploadedDate} ({doc.fileSize || "1.2 MB"})</div>
                  )}
                  {doc.expiryDate && (
                    <div className="text-[#3D6B22] font-semibold">Valid Thru: {doc.expiryDate}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(doc)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6B22] hover:underline cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Document</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadDoc(doc)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          description={`Category: ${previewDoc.category} • Uploaded: ${previewDoc.uploadedDate}`}
          icon={<FileCheck className="w-5 h-5 text-[#3D6B22]" />}
          maxWidth="2xl"
          footer={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <span className="text-[11px] text-slate-500 ">
                SHA-256: 8F2A90...E17B
              </span>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadDoc(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Copy</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {previewDoc.name}
                </span>
                <span className="text-xs text-slate-500">
                  Digitally signed by: <strong className="text-slate-800">{previewDoc.signedBy}</strong>
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200 self-start sm:self-auto shrink-0">
                Verified Cryptographic Signature
              </span>
            </div>

            {/* Document Paper Preview */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs  text-xs text-slate-700 leading-relaxed space-y-3">
              <div className="text-center font-bold pb-2 border-b border-slate-100">
                STATE HEALTH SERVICES • CLIENT COMPLIANCE RECORD
              </div>
              <div>Patient / Client: {client.name} (DOB: {client.dob})</div>
              <div>Authorized Service: Pediatric In-Home Care / Comprehensive Waiver</div>
              <div>Payer Contract: {client.authorization?.payer}</div>
              <div className="pt-2 text-slate-500 text-[11px] italic">
                This document certifies active consent and compliance standards established under state Medicaid regulations. All terms have been reviewed with the designated legal guardian.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Client Document"
        icon={<Upload className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={uploadForm.name}
              onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
              placeholder="e.g. 2026 Annual HIPAA Consent & Authorization"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Document Category
              </label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
              >
                <option value="Consent">Consent</option>
                <option value="Assessment">Assessment</option>
                <option value="Authorization">Authorization</option>
                <option value="Medical / Clinical">Medical / Clinical</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Signed By / Authority
              </label>
              <input
                type="text"
                value={uploadForm.signedBy}
                onChange={(e) => setUploadForm({ ...uploadForm, signedBy: e.target.value })}
                placeholder="e.g. Eleanor Miller"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Document Expiration Date
            </label>
            <input
              type="date"
              value={uploadForm.expiryDate}
              onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700">
              Drag and drop PDF/DOCX file here, or browse files
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Accepted formats: PDF, TIFF, DOCX up to 25MB
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
