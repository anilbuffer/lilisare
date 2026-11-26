"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  Search,
  Save,
  RefreshCw,
  Filter,
  Check,
  X,
  Heart,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { ClientRecord, ClientAttributeItem } from "@/types/client";
import { DEFAULT_CLIENT_ATTRIBUTES } from "@/lib/clients/enterpriseClientEnricher";
import { toast } from "sonner";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientAttributesTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientAttributesTab({ client, onUpdateClient }: ClientAttributesTabProps) {
  // Local interactive state for all attributes
  const [attributesList, setAttributesList] = useState<ClientAttributeItem[]>(() => {
    if (client.attributes?.items && client.attributes.items.length > 0) {
      return client.attributes.items;
    }
    return DEFAULT_CLIENT_ATTRIBUTES;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isSaving, setIsSaving] = useState(false);
  const [showHelperCard, setShowHelperCard] = useState(true);

  // Handle radio change for an attribute
  const handleOptionChange = (id: string, newOption: "Yes" | "No" | "Preferred") => {
    setAttributesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: newOption } : item))
    );
  };

  // Save changes
  const handleSaveAttributes = () => {
    setIsSaving(true);
    const updatedRecord: ClientRecord = {
      ...client,
      attributes: {
        ...(client.attributes || {}),
        items: attributesList,
      },
      updatedAtRelative: "Just now",
    };

    setTimeout(() => {
      if (onUpdateClient) {
        onUpdateClient(updatedRecord);
      }
      const all = getClientsFromStorage();
      const idx = all.findIndex((c) => c.id === client.id);
      if (idx !== -1) {
        all[idx] = updatedRecord;
        saveClientsToStorage(all);
      }
      setIsSaving(false);
      toast.success("Client attributes updated and saved to care matching profile.");
    }, 400);
  };

  const filteredItems = attributesList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = [
    "All",
    "Clinical & Equipment",
    "Home Environment",
    "Caregiver Qualifications",
    "Language & Lifestyle",
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Client Care & Matching Attributes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configured criteria used by LiliSare to calculate caregiver compatibility scores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveAttributes}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Attributes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Attributes Card (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all">
            {/* Card Title & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Attributes</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter attributes..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-2 border-b border-slate-50">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === cat
                      ? "bg-[#3D6B22] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* The Attributes List with Radio Buttons (Exact Layout matching screenshot) */}
            <div className="divide-y divide-dashed divide-slate-200">
              {filteredItems.map((item) => {
                const hasPreferred = item.options.some((opt) => opt === "Preferred");

                return (
                  <div
                    key={item.id}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                  >
                    {/* Left: Radio Option Buttons */}
                    <div className="flex items-center gap-4 sm:w-48 shrink-0">
                      {/* Yes Option */}
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name={`attr-${item.id}`}
                          value="Yes"
                          checked={item.selected === "Yes"}
                          onChange={() => handleOptionChange(item.id, "Yes")}
                          className="w-4 h-4 text-[#3D6B22] border-slate-300 focus:ring-[#3D6B22] cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>

                      {/* No Option */}
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name={`attr-${item.id}`}
                          value="No"
                          checked={item.selected === "No"}
                          onChange={() => handleOptionChange(item.id, "No")}
                          className="w-4 h-4 text-[#3D6B22] border-slate-300 focus:ring-[#3D6B22] cursor-pointer"
                        />
                        <span>No</span>
                      </label>

                      {/* Preferred Option (If applicable) */}
                      {hasPreferred && (
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name={`attr-${item.id}`}
                            value="Preferred"
                            checked={item.selected === "Preferred"}
                            onChange={() => handleOptionChange(item.id, "Preferred")}
                            className="w-4 h-4 text-[#3D6B22] border-slate-300 focus:ring-[#3D6B22] cursor-pointer"
                          />
                          <span>Preferred</span>
                        </label>
                      )}
                    </div>

                    {/* Right: Attribute Title & Subtext description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          {item.name}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-semibold text-slate-400 hidden md:inline">
                            • {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Active Status Badge indicator */}
                    <div className="hidden sm:block shrink-0 pl-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.selected === "Yes"
                            ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                            : item.selected === "Preferred"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        {item.selected}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section (4 cols): Guide Tooltip Card + Caregiver Match Preview */}
        <div className="lg:col-span-4 space-y-4">
          {/* LiliSare Intelligent Care Match Guide Card (Matching speech bubble in screenshot) */}
          {showHelperCard && (
            <div className="relative bg-white rounded-xl lg:rounded-2xl p-5 border border-emerald-200/80 shadow-[0_4px_16px_rgba(61,107,34,0.06)] space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] font-bold text-xs shrink-0">
                    <Sparkles className="w-4 h-4 text-[#3D6B22]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      LiliSare Care Coordination Guide
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Automated Caregiver Roster Matching
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHelperCard(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                Here you can see this client has a <strong>catheter</strong>, requires a caregiver with <strong>vaccinations</strong>, has a <strong>dog in the home</strong>, enjoys <strong>games</strong>, and requires specific driving support.
              </p>

              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-[#2C5217] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                  <span>Matching Criteria Active</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  When scheduling visits in the Scheduler workspace, candidates are ranked based on active attributes (HL experience, vehicle availability, pet compatibility).
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-slate-500">
                  Total Active: {attributesList.filter((i) => i.selected === "Yes").length} Yes • {attributesList.filter((i) => i.selected === "Preferred").length} Preferred
                </span>
                <button
                  type="button"
                  onClick={handleSaveAttributes}
                  className="text-xs font-bold text-[#3D6B22] hover:underline cursor-pointer"
                >
                  Update Match
                </button>
              </div>
            </div>
          )}

          {/* Compatibility Breakdown Card */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#3D6B22]" />
              <span>Assigned Caregiver Match Check</span>
            </h4>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">
                  {client.assignedCareTeam.primaryCaregiver?.name || "Wilson Martin"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#2B5E1A]">
                  98% Compatible
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3 h-3 text-[#3D6B22]" />
                  <span>COVID Vaccine on file & verified</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3 h-3 text-[#3D6B22]" />
                  <span>Valid Driver License & Insured DSP</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3 h-3 text-[#3D6B22]" />
                  <span>Dog friendly (golden retriever acknowledged)</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3 h-3 text-[#3D6B22]" />
                  <span>Catheter care training verified by RN</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
