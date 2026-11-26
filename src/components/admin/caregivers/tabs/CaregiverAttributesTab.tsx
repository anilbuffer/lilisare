"use client";

import React, { useState } from "react";
import {
  Sliders,
  Save,
  RefreshCw,
  Search,
  Sparkles,
  Info,
  Check,
  X,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  AdminCaregiverProfile,
  DEFAULT_CAREGIVER_ATTRIBUTES,
  CaregiverAttributeDef,
} from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverAttributesTabProps {
  profile: AdminCaregiverProfile;
  onUpdateProfile?: (updated: AdminCaregiverProfile) => void;
}

export function CaregiverAttributesTab({
  profile,
  onUpdateProfile,
}: CaregiverAttributesTabProps) {
  // Local state for all attributes
  const [attributesState, setAttributesState] = useState<Record<string, "Yes" | "No">>(() => {
    if (profile.attributes) {
      return { ...profile.attributes };
    }
    const init: Record<string, "Yes" | "No"> = {};
    DEFAULT_CAREGIVER_ATTRIBUTES.forEach((attr) => {
      init[attr.id] = attr.defaultSelected;
    });
    return init;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "yes" | "no">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [showHelperCard, setShowHelperCard] = useState(true);

  const handleToggle = (id: string, value: "Yes" | "No") => {
    setAttributesState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSetAll = (val: "Yes" | "No") => {
    const updated: Record<string, "Yes" | "No"> = {};
    DEFAULT_CAREGIVER_ATTRIBUTES.forEach((a) => {
      updated[a.id] = val;
    });
    setAttributesState(updated);
    toast.info(`Set all attributes to "${val}"`);
  };

  const handleSave = () => {
    setIsSaving(true);
    const updated: AdminCaregiverProfile = {
      ...profile,
      attributes: attributesState,
    };

    setTimeout(() => {
      if (onUpdateProfile) onUpdateProfile(updated);
      setIsSaving(false);
      toast.success("Caregiver matching attributes updated successfully.");
    }, 400);
  };

  const filteredAttributes = DEFAULT_CAREGIVER_ATTRIBUTES.filter((attr) => {
    const matchesSearch =
      attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.description.toLowerCase().includes(searchTerm.toLowerCase());
    const val = attributesState[attr.id] || "Yes";
    const matchesFilter =
      filterMode === "all" ||
      (filterMode === "yes" && val === "Yes") ||
      (filterMode === "no" && val === "No");
    return matchesSearch && matchesFilter;
  });

  const affirmativeCount = Object.values(attributesState).filter((v) => v === "Yes").length;
  const exclusionCount = Object.values(attributesState).filter((v) => v === "No").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Caregiver Matching Attributes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Clinical skills, lifestyle preferences, and capability criteria for client compatibility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => handleSetAll("Yes")}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Assume All Yes
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Attributes"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Attributes Card (8 cols) - Matching Image 1 Reference */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Header matching Image 1: "Attributes (if not set, YES is assumed)" */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Attributes{" "}
                  <span className="font-normal text-xs text-slate-500">
                    (if not set, YES is assumed)
                  </span>
                </h3>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-52">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search attributes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterMode("all")}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${filterMode === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("yes")}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${filterMode === "yes" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode("no")}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${filterMode === "no" ? "bg-amber-100 text-amber-800 font-bold" : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Attributes List */}
            <div className="divide-y divide-slate-100">
              {filteredAttributes.map((attr) => {
                const currentVal = attributesState[attr.id] || "Yes";

                return (
                  <div
                    key={attr.id}
                    className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex items-start gap-4"
                  >
                    {/* Radio Group styled faithfully like Image 1 */}
                    <div className="flex items-center gap-3 pt-0.5 shrink-0 select-none">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name={`attr-${attr.id}`}
                          checked={currentVal === "Yes"}
                          onChange={() => handleToggle(attr.id, "Yes")}
                          className="w-4 h-4 text-[#C05621] accent-[#C05621] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name={`attr-${attr.id}`}
                          checked={currentVal === "No"}
                          onChange={() => handleToggle(attr.id, "No")}
                          className="w-4 h-4 text-[#C05621] accent-[#C05621] cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>

                    {/* Title & Description matching Image 1 */}
                    <div className="min-w-0 flex-1 pl-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {attr.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                        {attr.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {showHelperCard && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all relative">
              <button
                type="button"
                onClick={() => setShowHelperCard(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#3D6B22] font-bold text-xs flex items-center justify-center shrink-0">
                  CA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Cheyenne from LiliSare Core
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Each caregiver has the same tab of matching attributes. Here we can see that this
                caregiver is qualified to work with catheters, is vaccinated, and fits other aspects
                of our clients needs.
              </p>
            </div>
          )}

          {/* Quick Stats on Caregiver Compatibility */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#3D6B22]" />
              <span>Matching Matrix Summary</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Total Tracked:</span>
                <span className="font-bold text-slate-800">
                  {DEFAULT_CAREGIVER_ATTRIBUTES.length} Attributes
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-slate-500 font-medium">Affirmative (Yes):</span>
                <span className="font-bold text-emerald-700">
                  {affirmativeCount} Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="text-slate-500 font-medium">Exclusions (No):</span>
                <span className="font-bold text-amber-700">
                  {exclusionCount} Exclusions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
