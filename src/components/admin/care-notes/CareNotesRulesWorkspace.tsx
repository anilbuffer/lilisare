"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CareNoteRule } from "@/types/careNotes";
import {
  getCareNoteRulesFromStorage,
  saveCareNoteRule,
  CARE_NOTES_SYNC_EVENT,
  CARE_NOTE_REVIEWERS,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import {
  Sliders,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  Edit3,
  X,
  FileCheck,
  AlertCircle,
  Eye,
  Building2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export function CareNotesRulesWorkspace() {
  const [rules, setRules] = useState<CareNoteRule[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CareNoteRule | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formProgram, setFormProgram] = useState("Medicaid HCBS Waiver");
  const [formCategory, setFormCategory] = useState("Personal Care");
  const [formCode, setFormCode] = useState("T1019");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<"required" | "conditional" | "not_required">("required");
  const [formSections, setFormSections] = useState("");
  const [formConditional, setFormConditional] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formEffective, setFormEffective] = useState("2026-01-01");
  const [formStatus, setFormStatus] = useState<"active" | "pending_review" | "upcoming" | "inactive">("active");

  const adminActor = CARE_NOTE_REVIEWERS[0];

  const reloadRules = () => {
    setRules(getCareNoteRulesFromStorage());
  };

  useEffect(() => {
    reloadRules();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, reloadRules);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, reloadRules);
  }, []);

  const openCreateModal = () => {
    setEditingRule(null);
    setFormName("");
    setFormProgram("Medicaid HCBS Waiver");
    setFormCategory("Personal Care");
    setFormCode("T1019");
    setFormDescription("");
    setFormType("required");
    setFormSections("ADL & Personal Care Assist\nMobility & Transfers\nClient Response & Safety Check");
    setFormConditional("");
    setFormInstructions("Flag note if descriptions are vague or missing specific tasks.");
    setFormEffective("2026-11-26");
    setFormStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (rule: CareNoteRule) => {
    setEditingRule(rule);
    setFormName(rule.requirementName);
    setFormProgram(rule.programName);
    setFormCategory(rule.serviceCategory);
    setFormCode(rule.serviceCode);
    setFormDescription(rule.requirementDescription);
    setFormType(rule.requirementType);
    setFormSections(rule.requiredSections.join("\n"));
    setFormConditional(rule.conditionalRequirements || "");
    setFormInstructions(rule.validationInstructions || "");
    setFormEffective(rule.effectiveFrom);
    setFormStatus(rule.status);
    setIsModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      toast.error("Please fill in the rule name and service code");
      return;
    }

    const sectionsArray = formSections
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const ruleData: CareNoteRule = {
      id: editingRule ? editingRule.id : `RULE-${Date.now().toString().slice(-4)}`,
      agencyId: "AGY-COLUMBUS",
      programId: formProgram.toLowerCase().replace(/\s+/g, "-"),
      programName: formProgram,
      serviceCategory: formCategory,
      serviceCode: formCode,
      requirementName: formName,
      requirementDescription: formDescription,
      requirementType: formType,
      requiredSections: sectionsArray,
      conditionalRequirements: formConditional,
      validationInstructions: formInstructions,
      effectiveFrom: formEffective,
      status: formStatus,
      updatedBy: adminActor.name,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    saveCareNoteRule(ruleData, adminActor);
    toast.success(editingRule ? "Documentation rule updated" : "New documentation rule configured");
    setIsModalOpen(false);
    reloadRules();
  };

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (programFilter !== "all" && r.programName !== programFilter) return false;
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        const match =
          r.requirementName.toLowerCase().includes(t) ||
          r.serviceCode.toLowerCase().includes(t) ||
          r.serviceCategory.toLowerCase().includes(t) ||
          r.programName.toLowerCase().includes(t);
        if (!match) return false;
      }
      return true;
    });
  }, [rules, statusFilter, programFilter, searchTerm]);

  return (
    <div className="w-full max-w-9xl mx-auto space-y-5 pb-16 px-4 sm:px-6 lg:px-8 pt-2 animate-in fade-in duration-300">
      <CareNotesSubNav
        title="Documentation Rules"
        description="Configure required note sections, clinical thresholds, and documentation SLAs as state and program requirements evolve."
      />

      {/* Top Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="text-xs text-slate-500 font-semibold mb-1">Active Rules</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {rules.filter((r) => r.status === "active").length}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Live in validation engine</div>
        </div>
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="text-xs text-slate-500 font-semibold mb-1">Pending Review</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {rules.filter((r) => r.status === "pending_review").length}
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Awaiting committee sign-off</div>
        </div>
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="text-xs text-slate-500 font-semibold mb-1">Upcoming Effective</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {rules.filter((r) => r.status === "upcoming").length}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Scheduled for state cycle</div>
        </div>
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
          <div className="text-xs text-slate-500 font-semibold mb-1">Service Coverage</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {new Set(rules.map((r) => r.serviceCode)).size} Codes
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Configured documentation types</div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search rule name or service code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_review">Pending Review</option>
            <option value="upcoming">Upcoming</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          >
            <option value="all">All Programs</option>
            <option value="Medicaid HCBS Waiver">Medicaid HCBS</option>
            <option value="Ohio PASSPORT Waiver">Ohio PASSPORT</option>
            <option value="IHSS Attendant Program">IHSS Attendant</option>
            <option value="DODD Supported Living">DODD Living</option>
            <option value="Private Duty & Skilled Nursing">Skilled Nursing</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Configure New Rule</span>
        </button>
      </div>

      {/* Operational Table (Clean Front List) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rule ID</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Service Code & Category</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requirement Name</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requirement Type</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => openEditModal(rule)}>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 group-hover:text-[#3D6B22] group-hover:border-[#3D6B22]/30 transition-colors">
                      {rule.id}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs text-slate-700 font-medium whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mr-2">
                      {rule.serviceCode}
                    </span>
                    {rule.serviceCategory}
                  </td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className="font-semibold text-xs text-slate-900 group-hover:text-[#3D6B22] transition-colors">{rule.requirementName}</span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rule.requirementType === "required"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : rule.requirementType === "conditional"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {rule.requirementType}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        rule.status === "active"
                          ? "bg-emerald-50 text-[#008f5a] border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {rule.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(rule);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" /> <span>Edit Rule</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Configure Rule Form adhering to Global Modal Layout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {editingRule ? `Edit Rule: ${editingRule.id}` : "Configure Documentation Rule"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Define mandatory care documentation requirements and validation thresholds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Requirement Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. HCBS Personal Care Comprehensive Documentation"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Associated Program</label>
                  <select
                    value={formProgram}
                    onChange={(e) => setFormProgram(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                  >
                    <option value="Medicaid HCBS Waiver">Medicaid HCBS Waiver</option>
                    <option value="Ohio PASSPORT Waiver">Ohio PASSPORT Waiver</option>
                    <option value="IHSS Attendant Program">IHSS Attendant Program</option>
                    <option value="DODD Supported Living">DODD Supported Living</option>
                    <option value="Private Duty & Skilled Nursing">Private Duty & Skilled Nursing</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Service Code & Category</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Code (e.g. T1019)"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-28 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Category (e.g. Personal Care)"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Requirement Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of state or program requirement..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Required Documentation Sections (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formSections}
                    onChange={(e) => setFormSections(e.target.value)}
                    placeholder="ADL & Personal Care Assist&#10;Mobility & Transfers&#10;Client Response & Safety Check"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Requirement Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="required">Required (Mandatory)</option>
                    <option value="conditional">Conditional</option>
                    <option value="not_required">Not Required</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Effective Date</label>
                  <input
                    type="date"
                    value={formEffective}
                    onChange={(e) => setFormEffective(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Validation Guidance for Admin Review
                  </label>
                  <input
                    type="text"
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="e.g. Ensure blood pressure readings are recorded; check that transfer assists name device..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#3D6B22]" /> Live Rule Preview
                </div>
                <p className="text-slate-600 leading-relaxed">
                  When a care note with service code <strong>{formCode || "..."}</strong> is evaluated, the system will
                  enforce {formSections.split("\n").filter(Boolean).length} documentation section(s). Missing sections will
                  automatically trigger quality flags and block approval.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  {editingRule ? "Save Rule Changes" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
