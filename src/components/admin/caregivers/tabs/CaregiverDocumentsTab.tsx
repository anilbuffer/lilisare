"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Folder,
  Search,
  Plus,
  X,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverDocumentsTabProps {
  profile: AdminCaregiverProfile;
}

export function CaregiverDocumentsTab({ profile }: CaregiverDocumentsTabProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Credentials");

  const [documents, setDocuments] = useState([
    {
      id: "DOC-1",
      name: "Driver's License (State Real ID)",
      category: "Identification",
      uploadDate: "2024-02-10",
      fileSize: "1.8 MB",
      status: "Verified",
    },
    {
      id: "DOC-2",
      name: "Social Security Card Verification",
      category: "Identification",
      uploadDate: "2024-02-10",
      fileSize: "1.2 MB",
      status: "Verified",
    },
    {
      id: "DOC-3",
      name: `${profile.licenseName} Copy`,
      category: "Credentials",
      uploadDate: "2024-02-11",
      fileSize: "2.4 MB",
      status: "Verified",
    },
    {
      id: "DOC-4",
      name: "AHA BLS Provider CPR Certification Card",
      category: "Credentials",
      uploadDate: "2024-12-15",
      fileSize: "1.1 MB",
      status: "Verified",
    },
    {
      id: "DOC-5",
      name: "Negative TB Test Quantiferon Lab Report",
      category: "Medical",
      uploadDate: "2026-01-20",
      fileSize: "980 KB",
      status: "Verified",
    },
    {
      id: "DOC-6",
      name: "Form W-4 Employee Withholding Certificate",
      category: "HR & Tax",
      uploadDate: "2024-02-10",
      fileSize: "650 KB",
      status: "Verified",
    },
    {
      id: "DOC-7",
      name: "Form I-9 Employment Eligibility Verification",
      category: "HR & Tax",
      uploadDate: "2024-02-10",
      fileSize: "1.4 MB",
      status: "Verified",
    },
    {
      id: "DOC-8",
      name: "Direct Deposit Bank ACH Authorization",
      category: "HR & Tax",
      uploadDate: "2024-02-10",
      fileSize: "840 KB",
      status: "Verified",
    },
    {
      id: "DOC-9",
      name: "EVV GPS Policy & Privacy Consent Agreement",
      category: "Compliance",
      uploadDate: "2024-02-10",
      fileSize: "1.3 MB",
      status: "Verified",
    },
  ]);

  const categories = ["All", "Identification", "Credentials", "Medical", "HR & Tax", "Compliance"];

  const filtered = documents.filter((d) => {
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (name: string) => {
    // Generate simulated downloadable file
    const element = document.createElement("a");
    const file = new Blob([`Official LiliSare Verified Document: ${name}\nCaregiver: ${profile.name}\nTimestamp: ${new Date().toISOString()}`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${name.replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded: ${name}`);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    const newDoc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: newDocName.trim(),
      category: newDocCategory,
      uploadDate: "Today",
      fileSize: "1.5 MB",
      status: "Verified",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setNewDocName("");
    setIsUploadModalOpen(false);
    toast.success(`Uploaded "${newDoc.name}" to repository.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Caregiver Document Repository
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              HIPAA compliant storage of state licenses, clinical certificates, and HR records
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 02. Search & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const count =
              cat === "All"
                ? documents.length
                : documents.filter((d) => d.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-2xs"
          />
        </div>
      </div>

      {/* 03. Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {doc.status}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 mt-3 line-clamp-1">
                {doc.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {doc.category} • {doc.fileSize}
              </p>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Uploaded {doc.uploadDate}</span>
              <button
                type="button"
                onClick={() => handleDownload(doc.name)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D6B22] hover:text-[#345C1D] hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 04. Functional Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Caregiver Record</h3>
                  <p className="text-xs text-slate-500 font-medium">Encrypted HIPAA document storage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Annual CPR Re-certification Card"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                >
                  <option value="Identification">Identification</option>
                  <option value="Credentials">Credentials</option>
                  <option value="Medical">Medical</option>
                  <option value="HR & Tax">HR & Tax</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <p className="text-slate-600 font-semibold">Click to choose PDF or scan image</p>
                <p className="text-slate-400 text-[10px]">PDF, PNG, JPG up to 25MB</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
