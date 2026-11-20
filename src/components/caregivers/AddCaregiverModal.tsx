"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Upload, X, UserPlus } from "lucide-react";

interface AddCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCaregiverModal({ isOpen, onClose }: AddCaregiverModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
      }
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

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
      title="Add New Caregiver"
      description="Create a new caregiver profile and upload compliance credentials."
      maxWidth="xl"
      icon={
        <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 stroke-[2.2]" />
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
            {isSubmitting ? "Saving..." : "Save Caregiver"}
          </button>
        </>
      }
    >
      <form id="add-caregiver-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              placeholder="e.g. Sarah Connor"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Role Classification <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 cursor-pointer"
            >
              <option value="">Select role...</option>
              <option value="hha">Home Health Aide (HHA)</option>
              <option value="pca">Personal Care Aide (PCA)</option>
              <option value="cna">Certified Nursing Assistant (CNA)</option>
              <option value="rn">Registered Nurse (RN)</option>
              <option value="lpn">Licensed Practical Nurse (LPN)</option>
              <option value="sfc">Family Caregiver (SFC)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              placeholder="sarah@example.com"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Phone Number</label>
            <input
              type="tel"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Skills & Qualifications</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-[#2C5217] focus:outline-none cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyDown={handleAddSkill}
            className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
            placeholder="Type a skill and press Enter (e.g. ADL Assistance, Transfer Support, CPR)"
          />
        </div>

        <div>
          <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Compliance Documents</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:bg-slate-50/80 hover:border-[#3D6B22]/40 transition-all cursor-pointer bg-slate-50/30">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-8 w-8 text-[#3D6B22]" />
              <div className="flex text-sm text-slate-600 justify-center">
                <span className="font-semibold text-[#3D6B22] hover:underline">
                  Upload credentials
                </span>
                <p className="pl-1 text-slate-500">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-400">Driver License, Background Check, TB Test, CPR Card (PDF, up to 10MB)</p>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
