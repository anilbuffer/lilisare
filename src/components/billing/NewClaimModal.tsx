"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Upload, FileText } from "lucide-react";

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewClaimModal({ isOpen, onClose }: NewClaimModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Claim"
      description="Enter claim details to generate an 837/CMS-1500 format claim."
      maxWidth="xl"
      icon={
        <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Generating..." : "Generate Claim"}
          </button>
        </>
      }
    >
      <form id="new-claim-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Client / Patient <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="">Search patient...</option>
              <option value="1">Eleanor Ruth Whitfield (CL-1001)</option>
              <option value="2">James Sullivan (CL-1002)</option>
              <option value="3">Martha Jones (CL-1003)</option>
              <option value="4">Leo Miller (CL-1004)</option>
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Payer Program <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="">Select payer...</option>
              <option value="medicaid">Georgia Medicaid (CCSP / SOURCE)</option>
              <option value="medicare">Medicare Advantage</option>
              <option value="va">VA Community Care Network</option>
              <option value="private">Private Insurance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Date of Service</label>
            <input
              type="date"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Service Code (CPT/HCPCS)</label>
            <input
              type="text"
              required
              placeholder="e.g. T1019, S5125, S5130"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Total Billed Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Billing Provider NPI</label>
            <input
              type="text"
              placeholder="10-digit NPI"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Attach Supporting Documentation</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:bg-slate-50/80 hover:border-[#3D6B22]/40 transition-all cursor-pointer bg-slate-50/30">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-8 w-8 text-[#3D6B22]" />
              <div className="flex text-sm text-slate-600 justify-center">
                <span className="font-semibold text-[#3D6B22] hover:underline">
                  Upload claim attachments
                </span>
                <p className="pl-1 text-slate-500">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-400">EVV Timesheet, Authorization Letter, CMS-1500 PDF (up to 10MB)</p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
