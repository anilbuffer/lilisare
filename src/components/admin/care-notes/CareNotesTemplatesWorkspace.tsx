"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CareNoteTemplate, CareNoteTemplateSection } from "@/types/careNotes";
import {
  INITIAL_CARE_NOTE_TEMPLATES,
  getCareNoteTemplatesFromStorage,
  saveCareNoteTemplate,
  CARE_NOTES_SYNC_EVENT,
  CARE_NOTE_REVIEWERS,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import { Modal } from "@/components/ui/Modal";
import {
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import {
  FileCode,
  Plus,
  Edit3,
  CheckCircle2,
  Sliders,
  Trash2,
  Sparkles,
  Search,
  X,
  Clock,
  Layers,
  Copy,
  ArrowRight,
  Calendar,
  UserCheck,
  Building2,
  ChevronUp,
  ChevronDown,
  Archive,
} from "lucide-react";
import { toast } from "sonner";

interface CareNotesTemplatesWorkspaceProps {
  hideSubNav?: boolean;
  onTabChange?: (tabId: string) => void;
}

function getStatusBadge(status: CareNoteTemplate["status"]) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#008f5a] border border-emerald-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00d084] shrink-0" />
        Active
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
      Archived
    </span>
  );
}

export function CareNotesTemplatesWorkspace({
  hideSubNav = false,
  onTabChange,
}: CareNotesTemplatesWorkspaceProps = {}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<CareNoteTemplate[]>(INITIAL_CARE_NOTE_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_CARE_NOTE_TEMPLATES[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Editor form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [program, setProgram] = useState("Medicaid HCBS Waiver");
  const [serviceCategory, setServiceCategory] = useState("Personal Care");
  const [serviceCode, setServiceCode] = useState("T1019");
  const [version, setVersion] = useState("1.0");
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");
  const [effectiveDate, setEffectiveDate] = useState("2026-01-01");
  const [sections, setSections] = useState<CareNoteTemplateSection[]>([
    {
      key: "sec_1",
      title: "ADL & Direct Care Tasks",
      description: "Itemize specific activities of daily living assisted during shift.",
      required: true,
      placeholder: "Detail bathing, grooming, dressing...",
      guidance: "Specify equipment or transfer assist levels.",
    },
  ]);

  const adminActor = CARE_NOTE_REVIEWERS[0];

  const reloadTemplates = () => {
    const list = getCareNoteTemplatesFromStorage();
    setTemplates(list);
    setSelectedId((prev) => {
      if (prev && list.some((t) => t.id === prev)) return prev;
      return list[0]?.id || "";
    });
  };

  useEffect(() => {
    reloadTemplates();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, reloadTemplates);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, reloadTemplates);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (programFilter !== "all" && t.programName !== programFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          t.templateName.toLowerCase().includes(q) ||
          t.serviceCode.toLowerCase().includes(q) ||
          t.serviceCategory.toLowerCase().includes(q) ||
          t.programName.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [templates, statusFilter, programFilter, searchTerm]);

  const selectedTemplate = useMemo(() => {
    return (
      filteredTemplates.find((t) => t.id === selectedId) ||
      filteredTemplates[0] ||
      templates.find((t) => t.id === selectedId) ||
      null
    );
  }, [filteredTemplates, templates, selectedId]);

  const totalSectionsCount = useMemo(
    () => templates.reduce((sum, t) => sum + t.sections.length, 0),
    [templates]
  );

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setProgram("Medicaid HCBS Waiver");
    setServiceCategory("Personal Care");
    setServiceCode("T1019");
    setVersion("1.0");
    setStatus("active");
    setEffectiveDate("2026-11-26");
    setSections([
      {
        key: "service_tasks",
        title: "Service Tasks Delivered",
        description: "Document direct client support provided during visit.",
        required: true,
        placeholder: "Detail tasks and interventions performed...",
        guidance: "Avoid broad summaries.",
      },
      {
        key: "client_safety",
        title: "Client Response & Safety Check",
        description: "Assess client status, environment safety, and departure handover.",
        required: true,
        placeholder: "Record client mood, comfort, and safety checks...",
      },
    ]);
    setIsEditorOpen(true);
  };

  const openEditModal = (tmpl: CareNoteTemplate) => {
    setEditingId(tmpl.id);
    setName(tmpl.templateName);
    setDescription(tmpl.description);
    setProgram(tmpl.programName);
    setServiceCategory(tmpl.serviceCategory);
    setServiceCode(tmpl.serviceCode);
    setVersion(tmpl.version);
    setStatus(tmpl.status);
    setEffectiveDate(tmpl.effectiveDate);
    setSections(JSON.parse(JSON.stringify(tmpl.sections)));
    setIsEditorOpen(true);
  };

  const openDuplicateModal = (tmpl: CareNoteTemplate) => {
    setEditingId(null);
    setName(`${tmpl.templateName} (Copy)`);
    setDescription(tmpl.description);
    setProgram(tmpl.programName);
    setServiceCategory(tmpl.serviceCategory);
    setServiceCode(tmpl.serviceCode);
    setVersion("1.0");
    setStatus("draft");
    setEffectiveDate("2026-11-26");
    setSections(JSON.parse(JSON.stringify(tmpl.sections)));
    setIsEditorOpen(true);
  };

  const handleAddSection = () => {
    const newKey = `sec_${Date.now().toString().slice(-4)}`;
    setSections([
      ...sections,
      {
        key: newKey,
        title: "New Documentation Section",
        description: "Description of expected caregiver notes.",
        required: true,
        placeholder: "Enter details...",
        guidance: "",
      },
    ]);
  };

  const handleMoveSection = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const copy = [...sections];
    const [item] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, item);
    setSections(copy);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) {
      toast.error("Template must have at least one section");
      return;
    }
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionChange = (
    idx: number,
    field: keyof CareNoteTemplateSection,
    val: string | boolean
  ) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setSections(updated);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serviceCode.trim()) {
      toast.error("Template name and service code are required");
      return;
    }

    const newId = editingId || `TMPL-${Date.now().toString().slice(-4)}`;
    const cleanedSections = sections.map((sec, idx) => ({
      ...sec,
      key:
        sec.key?.trim() ||
        sec.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "") ||
        `sec_${idx + 1}`,
    }));

    const templateData: CareNoteTemplate = {
      id: newId,
      templateName: name.trim(),
      description: description.trim(),
      programId: program.toLowerCase().replace(/\s+/g, "-"),
      programName: program,
      serviceCategory: serviceCategory.trim() || "Personal Care",
      serviceCode: serviceCode.trim().toUpperCase(),
      version: version.trim() || "1.0",
      status,
      effectiveDate: effectiveDate || "2026-11-26",
      sections: cleanedSections,
      lastUpdatedBy: adminActor.name,
      lastUpdatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    saveCareNoteTemplate(templateData, adminActor);
    toast.success(editingId ? "Template updated" : "New template created");
    setSelectedId(newId);
    setIsEditorOpen(false);
    reloadTemplates();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setProgramFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm.trim() !== "" || programFilter !== "all" || statusFilter !== "all";

  return (
    <div className="w-full max-w-9xl mx-auto space-y-6 animate-in fade-in duration-300">
      {!hideSubNav && (
        <CareNotesSubNav
          title="Note Templates"
          description="Design and manage structured care note layouts, required fields, and caregiver guidance across programs."
          activeTab="templates"
          onTabChange={onTabChange}
        />
      )}

      {/* Top KPI Summary Cards (Consistent with Rules & Overview KPI strip) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Templates
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {templates.length}
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Layouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#008f5a] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {templates.filter((t) => t.status === "active").length}
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Drafts / Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {templates.filter((t) => t.status === "draft").length}
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Form Sections
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {totalSectionsCount}
          </div>
        </div>
      </div>

      {/* Action, Search & Filter Bar (Consistent with Rules & All Notes) */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search template name, code, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="all">All Programs</option>
              <option value="Medicaid HCBS Waiver">Medicaid HCBS Waiver</option>
              <option value="Ohio PASSPORT Waiver">Ohio PASSPORT Waiver</option>
              <option value="IHSS Attendant Program">IHSS Attendant Program</option>
              <option value="DODD Supported Living">DODD Supported Living</option>
              <option value="Private Duty & Skilled Nursing">Skilled Nursing</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "draft" | "archived")}
              className="px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onTabChange) onTabChange("rules");
                else router.push("/admin/care-notes?tab=rules");
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Documentation Rules</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Template</span>
            </button>
          </div>
        </div>

        {/* Filter status bar */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{filteredTemplates.length}</strong> of{" "}
            {templates.length} note templates
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-bold text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Master-Detail Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: Template Directory List */}
        <div className="lg:col-span-4 space-y-3 lg:max-h-[760px] lg:overflow-y-auto pr-1 [scrollbar-width:thin]">
          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-xl lg:rounded-2xl p-8 text-center border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 text-sm">No templates match filter</p>
              <p className="text-xs text-slate-500">Adjust your search or program criteria.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTemplates.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  className={`bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/15 shadow-[0_6px_20px_rgba(61,107,34,0.08)]"
                      : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                          isSelected
                            ? "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/25"
                            : "bg-slate-100 text-slate-700 border-slate-200/80"
                        }`}
                      >
                        {tmpl.serviceCode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70">
                        v{tmpl.version}
                      </span>
                    </div>
                    {getStatusBadge(tmpl.status)}
                  </div>

                  <h3
                    className={`text-sm font-bold tracking-tight mb-1 ${
                      isSelected ? "text-[#3D6B22]" : "text-slate-900"
                    }`}
                  >
                    {tmpl.templateName}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3">
                    {tmpl.description || "Structured caregiver documentation layout."}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-slate-500 font-medium truncate">
                      <span className="truncate">{tmpl.programName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="shrink-0 font-semibold text-slate-700">
                        {tmpl.sections.length} section{tmpl.sections.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(tmpl);
                      }}
                      className="font-bold text-[#3D6B22] hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer ml-2"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 8 Cols: Live Template Architecture & Caregiver Preview */}
        <div className="lg:col-span-8">
          {selectedTemplate ? (
            <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all duration-200 space-y-6">
              {/* Preview Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0 mt-0.5">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-[#3D6B22]/10 text-[#3D6B22] px-2.5 py-0.5 rounded-lg border border-[#3D6B22]/20">
                        {selectedTemplate.serviceCode}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {selectedTemplate.templateName}
                      </h2>
                      {getStatusBadge(selectedTemplate.status)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openDuplicateModal(selectedTemplate)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedTemplate)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl text-xs font-bold shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Template</span>
                  </button>
                </div>
              </div>

              {/* Structured Metadata Micro-Cards Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3 h-3 text-slate-400" /> Program
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate" title={selectedTemplate.programName}>
                    {selectedTemplate.programName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Layers className="w-3 h-3 text-slate-400" /> Service Category
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {selectedTemplate.serviceCategory}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Version & Effective
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    v{selectedTemplate.version} • {selectedTemplate.effectiveDate}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <UserCheck className="w-3 h-3 text-slate-400" /> Last Configured By
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate" title={selectedTemplate.lastUpdatedAt}>
                    {selectedTemplate.lastUpdatedBy}
                  </div>
                </div>
              </div>

              {/* Section Architecture Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Structured Form Sections ({selectedTemplate.sections.length})
                  </span>
                  <div className="h-px bg-slate-100 flex-1" />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {selectedTemplate.sections.filter((s) => s.required).length} Required •{" "}
                    {selectedTemplate.sections.filter((s) => !s.required).length} Optional
                  </span>
                </div>

                <div className="space-y-3.5">
                  {selectedTemplate.sections.map((sec, idx) => (
                    <div
                      key={`${sec.key}-${idx}`}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50/70 hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{sec.title}</span>
                          {sec.required ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 uppercase tracking-wider">
                              Mandatory
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Optional
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                          {sec.key}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {sec.description}
                      </p>

                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-xs text-slate-400 italic">
                        {sec.placeholder || "Caregiver narrative input field..."}
                      </div>

                      {sec.guidance && (
                        <div className="px-3 py-2 rounded-lg bg-[#3D6B22]/5 border border-[#3D6B22]/15 text-[11px] text-[#3D6B22] font-medium flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            <strong className="font-bold">Caregiver Guidance:</strong> {sec.guidance}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Link Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 font-medium">
                  Applied automatically when caregivers document <strong className="text-slate-600">{selectedTemplate.serviceCode}</strong> visits
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onTabChange) onTabChange("rules");
                    else router.push("/admin/care-notes?tab=rules");
                  }}
                  className="font-bold text-[#3D6B22] hover:text-[#345C1D] inline-flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Inspect Linked Documentation Rules <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl lg:rounded-2xl p-12 text-center border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
              <Archive className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No template selected</p>
              <p className="text-xs text-slate-500">Select a template from the directory or create a new template layout.</p>
            </div>
          )}
        </div>
      </div>

      {/* Shared LiliSare Modal & FormControls Template Editor */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingId ? "Edit Care Note Template" : "Create Care Note Template"}
        description="Configure program scope, versioning, and required documentation fields"
        icon={<FileCode className="w-5 h-5" />}
        maxWidth="3xl"
        footer={
          <>
            <FormButtonCancel onClick={() => setIsEditorOpen(false)} />
            <FormButtonPrimary type="submit" form="template-editor-form">
              Save Note Template
            </FormButtonPrimary>
          </>
        }
      >
        <form id="template-editor-form" onSubmit={handleSaveTemplate} className="space-y-6">
          {/* General Metadata Section */}
          <div>
            <FormSection title="Template Identification & Scope" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormLabel required>Template Name</FormLabel>
                <FormInput
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Personal Care Note (T1019)"
                />
              </div>

              <div>
                <FormLabel required>Program</FormLabel>
                <FormSelect value={program} onChange={(e) => setProgram(e.target.value)}>
                  <option value="Medicaid HCBS Waiver">Medicaid HCBS Waiver</option>
                  <option value="Ohio PASSPORT Waiver">Ohio PASSPORT Waiver</option>
                  <option value="IHSS Attendant Program">IHSS Attendant Program</option>
                  <option value="DODD Supported Living">DODD Supported Living</option>
                  <option value="Private Duty & Skilled Nursing">Private Duty &amp; Skilled Nursing</option>
                </FormSelect>
              </div>

              <div>
                <FormLabel required>Service Code &amp; Category</FormLabel>
                <div className="flex items-center gap-2">
                  <FormInput
                    type="text"
                    required
                    placeholder="T1019"
                    value={serviceCode}
                    onChange={(e) => setServiceCode(e.target.value)}
                    className="w-28 font-mono uppercase"
                  />
                  <FormInput
                    type="text"
                    required
                    placeholder="Service Category"
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <FormLabel>Version &amp; Status</FormLabel>
                <div className="flex items-center gap-2">
                  <FormInput
                    type="text"
                    placeholder="1.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-24 font-mono"
                  />
                  <div className="flex-1">
                    <FormSelect
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "active" | "draft" | "archived")}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </FormSelect>
                  </div>
                </div>
              </div>

              <div>
                <FormLabel>Effective Date</FormLabel>
                <FormInput
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <FormLabel>Template Description</FormLabel>
                <FormTextarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of when this care note template applies..."
                />
              </div>
            </div>
          </div>

          {/* Structured Sections Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Structured Care Note Sections ({sections.length})
                </h4>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="ml-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/20 border border-[#3D6B22]/20 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <span className="w-6 h-6 rounded-lg bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <FormInput
                        type="text"
                        required
                        value={sec.title}
                        onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                        placeholder="Section Title"
                        className="py-1.5 text-xs font-bold bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sec.required}
                          onChange={(e) => handleSectionChange(idx, "required", e.target.checked)}
                          className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
                        />
                        <span>Mandatory</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, -1)}
                        disabled={idx === 0}
                        title="Move section up"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(idx, 1)}
                        disabled={idx === sections.length - 1}
                        title="Move section down"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        title="Remove section"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <FormInput
                        type="text"
                        value={sec.description}
                        onChange={(e) => handleSectionChange(idx, "description", e.target.value)}
                        placeholder="Prompt description for caregiver..."
                        className="py-1.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <FormInput
                        type="text"
                        value={sec.placeholder}
                        onChange={(e) => handleSectionChange(idx, "placeholder", e.target.value)}
                        placeholder="Placeholder example text..."
                        className="py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <FormInput
                      type="text"
                      value={sec.guidance || ""}
                      onChange={(e) => handleSectionChange(idx, "guidance", e.target.value)}
                      placeholder="Caregiver validation guidance (optional, e.g. Avoid broad summaries)"
                      className="py-1.5 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
