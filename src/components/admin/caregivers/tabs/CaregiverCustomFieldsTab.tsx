"use client";

import React, { useState } from "react";
import { Tag, Plus, Edit2, Save, Trash2, CheckCircle2, X } from "lucide-react";
import { AdminCaregiverProfile, CaregiverCustomField } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverCustomFieldsTabProps {
  profile: AdminCaregiverProfile;
}

const DEFAULT_FIELDS: CaregiverCustomField[] = [
  { label: "Payroll Vendor ID", value: "PAY-TN-0232", category: "Finance & Accounting" },
  { label: "Uniform Scrubs Size", value: "Medium (Navy Blue)", category: "Field Operations" },
  { label: "Max Commute Radius", value: "15 miles from home", category: "Scheduling & Dispatch" },
  { label: "Security ID Badge Barcode", value: "BC-99081232", category: "Physical Security" },
  { label: "Secondary Language Certified", value: "Medical Spanish Level 3", category: "Clinical Quality" },
  { label: "Emergency Floating Roster", value: "Enrolled (Weekend Fill-In)", category: "Human Resources" },
];

export function CaregiverCustomFieldsTab({ profile }: CaregiverCustomFieldsTabProps) {
  const [fields, setFields] = useState<CaregiverCustomField[]>(
    profile.customFields && profile.customFields.length > 0 ? profile.customFields : DEFAULT_FIELDS
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [newFieldCategory, setNewFieldCategory] = useState("Operations");

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Caregiver custom fields saved successfully.");
  };

  const handleAddNewField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim() || !newFieldValue.trim()) {
      toast.error("Please fill in both field label and value");
      return;
    }

    const created: CaregiverCustomField = {
      label: newFieldLabel.trim(),
      value: newFieldValue.trim(),
      category: newFieldCategory,
    };

    setFields((prev) => [...prev, created]);
    setNewFieldLabel("");
    setNewFieldValue("");
    setIsAddFieldModalOpen(false);
    toast.success(`Added custom metadata field: ${created.label}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Agency Custom Metadata Fields
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise operational attributes, payroll synchronization keys, and branch tags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddFieldModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Add Field</span>
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-slate-400" />
              <span>Edit Fields</span>
            </button>
          )}
        </div>
      </div>

      {/* 02. Custom Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {field.category}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{field.label}</p>
            {isEditing ? (
              <input
                type="text"
                value={field.value}
                onChange={(e) => {
                  const val = e.target.value;
                  setFields((prev) => {
                    const next = [...prev];
                    next[idx].value = val;
                    return next;
                  });
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            ) : (
              <p className="text-sm font-bold text-slate-900 leading-snug">{field.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* 03. Add Custom Field Modal */}
      {isAddFieldModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Metadata Field</h3>
                  <p className="text-xs text-slate-500 font-medium">Enterprise operational tracking tag</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFieldModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewField} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Field Label</label>
                <input
                  type="text"
                  placeholder="e.g. Parking Permit Number"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Field Value</label>
                <input
                  type="text"
                  placeholder="e.g. PERMIT-2026-99"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Category</label>
                <select
                  value={newFieldCategory}
                  onChange={(e) => setNewFieldCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                >
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Field Operations">Field Operations</option>
                  <option value="Scheduling & Dispatch">Scheduling & Dispatch</option>
                  <option value="Clinical Quality">Clinical Quality</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Physical Security">Physical Security</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddFieldModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
