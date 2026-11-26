"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CareNoteTemplate, CareNoteTemplateSection } from "@/types/careNotes";
import {
  getCareNoteTemplatesFromStorage,
  saveCareNoteTemplate,
  CARE_NOTES_SYNC_EVENT,
  CARE_NOTE_REVIEWERS,
} from "@/lib/admin/careNotesStore";
import { CareNotesSubNav } from "./CareNotesSubNav";
import {
  FileCode,
  Plus,
  Edit3,
  X,
  Eye,
  CheckCircle2,
  Sliders,
  FileText,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CareNotesTemplatesWorkspaceProps {
  hideSubNav?: boolean;
  onTabChange?: (tabId: string) => void;
}

export function CareNotesTemplatesWorkspace({
  hideSubNav = false,
  onTabChange,
}: CareNotesTemplatesWorkspaceProps = {}) {
  const [templates, setTemplates] = useState<CareNoteTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CareNoteTemplate | null>(null);
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
    if (!selectedTemplate && list.length > 0) {
      setSelectedTemplate(list[0]);
    } else if (selectedTemplate) {
      const match = list.find((t) => t.id === selectedTemplate.id);
      if (match) setSelectedTemplate(match);
    }
  };

  useEffect(() => {
    reloadTemplates();
    window.addEventListener(CARE_NOTES_SYNC_EVENT, reloadTemplates);
    return () => window.removeEventListener(CARE_NOTES_SYNC_EVENT, reloadTemplates);
  }, []);

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
        key: "sec_1",
        title: "Service Tasks Delivered",
        description: "Document direct client support provided during visit.",
        required: true,
        placeholder: "Detail tasks and interventions performed...",
        guidance: "Avoid broad summaries.",
      },
      {
        key: "sec_2",
        title: "Client Response & Safety",
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
      },
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) {
      toast.error("Template must have at least one section");
      return;
    }
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionChange = (idx: number, field: keyof CareNoteTemplateSection, val: any) => {
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

    const templateData: CareNoteTemplate = {
      id: editingId || `TMPL-${Date.now().toString().slice(-4)}`,
      templateName: name,
      description,
      programId: program.toLowerCase().replace(/\s+/g, "-"),
      programName: program,
      serviceCategory,
      serviceCode,
      version,
      status,
      effectiveDate,
      sections,
      lastUpdatedBy: adminActor.name,
      lastUpdatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    saveCareNoteTemplate(templateData, adminActor);
    toast.success(editingId ? "Template updated" : "New template created");
    setIsEditorOpen(false);
    reloadTemplates();
  };

  return (
    <div className="w-full">
      {!hideSubNav && (
        <CareNotesSubNav
          title="Note Templates"
          description="Design and manage structured care note layouts, required fields, and caregiver guidance across programs."
          activeTab="templates"
          onTabChange={onTabChange}
        />
      )}

      <div className="max-w-9xl mx-auto space-y-5 pb-16 px-4 sm:px-6 lg:px-8 pt-2 animate-in fade-in duration-300">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Note Templates</h2>
              <p className="text-xs text-slate-500 font-medium">Configured service-specific note architectures and mandatory fields</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer self-stretch sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>
        </div>

        {/* Templates Grid with Live Preview Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Templates */}
          <div className="space-y-3">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-4 sm:p-5 rounded-xl lg:rounded-2xl border transition-all cursor-pointer bg-white ${isSelected
                    ? "border-[#3D6B22] shadow-sm ring-1 ring-[#3D6B22]/20"
                    : "border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 mr-2 border border-slate-200/80">
                        {tmpl.serviceCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{tmpl.templateName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                      v{tmpl.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">{tmpl.description}</p>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{tmpl.programName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(tmpl);
                      }}
                      className="font-bold text-[#3D6B22] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Cols: Live Template Preview */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-[#3D6B22]/10 text-[#3D6B22] px-2.5 py-0.5 rounded border border-[#3D6B22]/20">
                        {selectedTemplate.serviceCode}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{selectedTemplate.templateName}</h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Program: {selectedTemplate.programName} • Category: {selectedTemplate.serviceCategory}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Active Version {selectedTemplate.version}
                    </span>
                    <button
                      onClick={() => openEditModal(selectedTemplate)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" /> <span>Edit Template</span>
                    </button>
                  </div>
                </div>

                {/* Section Structure Preview */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Template Form Sections ({selectedTemplate.sections.length})
                  </div>

                  {selectedTemplate.sections.map((sec, idx) => (
                    <div key={sec.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{sec.title}</span>
                          {sec.required && (
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{sec.key}</span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">{sec.description}</p>

                      <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-400 italic">
                        {sec.placeholder || "Caregiver narrative input field..."}
                      </div>

                      {sec.guidance && (
                        <div className="text-[11px] text-[#3D6B22] font-medium flex items-center gap-1.5 pt-1">
                          <Sparkles className="w-3.5 h-3.5" /> Caregiver guidance: {sec.guidance}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200">
                Select a template to inspect details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Template Editor adhering to Global Modal Layout */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {editingId ? "Edit Note Template" : "Create Care Note Template"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Standard Personal Care Note (T1019)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Program</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
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
                      value={serviceCode}
                      onChange={(e) => setServiceCode(e.target.value)}
                      className="w-24 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Category"
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full flex-1 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of when this note structure applies..."
                    className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Sections Editor */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Note Sections</span>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="text-xs font-bold text-[#3D6B22] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>

                {sections.map((sec, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                        placeholder="Section Title"
                        className="font-bold text-xs bg-white px-3 py-1.5 border border-slate-200 rounded-lg flex-1"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sec.required}
                          onChange={(e) => handleSectionChange(idx, "required", e.target.checked)}
                          className="rounded text-[#3D6B22]"
                        />
                        <span>Mandatory</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={sec.description}
                      onChange={(e) => handleSectionChange(idx, "description", e.target.value)}
                      placeholder="Prompt description for caregiver..."
                      className="text-xs bg-white px-3 py-1.5 border border-slate-200 rounded-lg w-full text-slate-600"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
                >
                  Save Note Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
