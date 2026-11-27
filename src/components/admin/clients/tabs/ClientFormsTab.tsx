"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  Search,
  ChevronDown,
  Lock,
  Mail,
  Copy,
  Pencil,
  Trash2,
  Eye,
  Send,
  ShieldCheck,
  FileText,
  Plus,
  X,
  ArrowDown,
  ArrowUp,
  Calendar,
  Link2,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ClientRecord, AssessmentFormItem } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientFormsTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

type FormStatusValue = "In Progress" | "Complete" | "none";
type ExpireValue = "never" | "30 days" | "60 days" | "90 days" | "6 months" | "1 year";
type SortField = "name" | "status" | "visitDate";
type SortDirection = "asc" | "desc";

const FORM_TEMPLATES: Array<{
  title: string;
  type: AssessmentFormItem["type"];
  defaultSections: Array<{ label: string; value: string }>;
}> = [
    {
      title: "In-Home Waiver Reassessment",
      type: "Waiver Assessment",
      defaultSections: [
        { label: "In-Home Respite & Support Adequacy", value: "Satisfactory (Level 2 Sensory Support)" },
        { label: "Authorized Weekly Hours Alignment", value: "40 hrs/week on schedule" },
        { label: "Guardian & Household Feedback", value: "Positive — care routine stable" },
      ],
    },
    {
      title: "Caregiver Shift Progress Note",
      type: "Progress Note",
      defaultSections: [
        { label: "ADL & Daily Routine Support", value: "Completed morning sensory & meal routine" },
        { label: "Client Engagement & Comfort", value: "Calm, responsive to visual schedule" },
        { label: "Care Plan Adherence", value: "100% aligned with active Plan of Care" },
      ],
    },
    {
      title: "Sensory & Fall Risk Assessment",
      type: "Clinical Assessment",
      defaultSections: [
        { label: "Mobility & Sensory Safety Score", value: "Low-Moderate Risk" },
        { label: "Household Pathway & Hazard Check", value: "Pathways clear, safety locks verified" },
        { label: "Supervision Protocol", value: "Standby supervision during transitions" },
      ],
    },
    {
      title: "ADL & Mobility Support Evaluation",
      type: "Evaluation",
      defaultSections: [
        { label: "Bathing, Dressing & Grooming", value: "Cueing & standby assistance" },
        { label: "Communication & Sensory Tools", value: "Visual schedule & noise-dampening active" },
        { label: "Recommended Caregiver Frequency", value: "Daily in-home Family Care shift" },
      ],
    },
    {
      title: "Household Environmental Safety Check",
      type: "Clinical Assessment",
      defaultSections: [
        { label: "Medication & Inhaler Storage", value: "Secured per emergency MAR protocol" },
        { label: "Smoke, CO & Exit Readiness", value: "Verified operational" },
        { label: "Caregiver Emergency Briefing", value: "Reviewed with primary guardian" },
      ],
    },
    {
      title: "Annual Guardian Consent & HIPAA Packet",
      type: "Consent & Release",
      defaultSections: [
        { label: "HIPAA & Privacy Acknowledgment", value: "E-signed by Legal Guardian" },
        { label: "Service Authorization & EVV Consent", value: "Active for current waiver period" },
        { label: "Emergency Contact Verification", value: "Confirmed with Miller Household" },
      ],
    },
    {
      title: "Household Care Management Report",
      type: "Management Report",
      defaultSections: [
        { label: "Waiver Unit Utilization", value: "On track (960 authorized units remaining)" },
        { label: "Family & Caregiver Satisfaction", value: "High — no missed EVV shifts" },
        { label: "Next Supervisory Review", value: "Scheduled per 60-day agency cycle" },
      ],
    },
  ];

const DEFAULT_CLIENT_FORMS: AssessmentFormItem[] = [
  {
    id: "FORM-201",
    title: "In-Home Waiver Reassessment",
    type: "Waiver Assessment",
    status: "In Progress",
    isDraftInProgress: true,
    isLocked: false,
    visitDate: "09/22/2025",
    linkedTo: "Visit #EVV-1042",
    createdAt: "yesterday at 7:31 PM",
    createdBy: "Evelyn Vance, RN",
    modifiedAt: "yesterday at 7:31 PM",
    modifiedBy: "Evelyn Vance, RN",
    expire: "never",
    lastUpdated: "yesterday at 7:31 PM",
    sections: FORM_TEMPLATES[0].defaultSections,
  },
  {
    id: "FORM-202",
    title: "Caregiver Shift Progress Note",
    type: "Progress Note",
    status: "In Progress",
    isDraftInProgress: true,
    isLocked: false,
    visitDate: "09/22/2025",
    linkedTo: "HH-1001 · Morning",
    createdAt: "yesterday at 7:31 PM",
    createdBy: "Sarah Miller",
    modifiedAt: "yesterday at 7:31 PM",
    modifiedBy: "Sarah Miller",
    expire: "never",
    lastUpdated: "yesterday at 7:31 PM",
    sections: FORM_TEMPLATES[1].defaultSections,
  },
  {
    id: "FORM-203",
    title: "Household Environmental Safety Check",
    type: "Clinical Assessment",
    status: "Complete",
    isDraftInProgress: false,
    isLocked: true,
    visitDate: "09/15/2025",
    linkedTo: "Miller Household",
    createdAt: "yesterday at 7:07 PM",
    createdBy: "Dana Jenkins",
    modifiedAt: "yesterday at 7:28 PM",
    modifiedBy: "Dana Jenkins",
    expire: "never",
    lastUpdated: "yesterday at 7:28 PM",
    signedBy: "Dana Jenkins, Agency Admin",
    sections: FORM_TEMPLATES[4].defaultSections,
  },
  {
    id: "FORM-204",
    title: "Sensory & Fall Risk Assessment",
    type: "Clinical Assessment",
    status: "Complete",
    isDraftInProgress: false,
    isLocked: true,
    visitDate: "09/08/2025",
    linkedTo: "POC-2026-Q4",
    createdAt: "yesterday at 7:10 PM",
    createdBy: "Evelyn Vance, RN",
    modifiedAt: "yesterday at 7:11 PM",
    modifiedBy: "Evelyn Vance, RN",
    expire: "never",
    lastUpdated: "yesterday at 7:11 PM",
    signedBy: "Evelyn Vance, RN",
    sections: FORM_TEMPLATES[2].defaultSections,
  },
  {
    id: "FORM-205",
    title: "ADL & Mobility Support Evaluation",
    type: "Evaluation",
    status: "Complete",
    isDraftInProgress: false,
    isLocked: true,
    visitDate: "09/09/2025",
    linkedTo: "Visit #EVV-1018",
    createdAt: "yesterday at 7:17 PM",
    createdBy: "Marcus Reid",
    modifiedAt: "yesterday at 7:20 PM",
    modifiedBy: "Marcus Reid",
    expire: "never",
    lastUpdated: "yesterday at 7:20 PM",
    signedBy: "Marcus Reid, Case Coordinator",
    sections: FORM_TEMPLATES[3].defaultSections,
  },
  {
    id: "FORM-206",
    title: "Family Caregiver Supervision Note",
    type: "Progress Note",
    status: "Complete",
    isDraftInProgress: false,
    isLocked: true,
    visitDate: "09/15/2025",
    linkedTo: "Clara Jenkins",
    createdAt: "yesterday at 7:06 PM",
    createdBy: "Dana Jenkins",
    modifiedAt: "yesterday at 7:28 PM",
    modifiedBy: "Dana Jenkins",
    expire: "never",
    lastUpdated: "yesterday at 7:28 PM",
    signedBy: "Dana Jenkins, Agency Admin",
    sections: FORM_TEMPLATES[1].defaultSections,
  },
  {
    id: "FORM-207",
    title: "Annual Guardian Consent & HIPAA Packet",
    type: "Consent & Release",
    status: "Complete",
    isDraftInProgress: false,
    isLocked: true,
    visitDate: "09/08/2025",
    linkedTo: "Auth #WAIV-88",
    createdAt: "yesterday at 7:08 PM",
    createdBy: "Marcus Reid",
    modifiedAt: "yesterday at 7:10 PM",
    modifiedBy: "Marcus Reid",
    expire: "never",
    lastUpdated: "yesterday at 7:10 PM",
    signedBy: "Sarah Miller (Legal Guardian)",
    sections: FORM_TEMPLATES[5].defaultSections,
  },
  {
    id: "FORM-208",
    title: "Household Care Management Report",
    type: "Management Report",
    status: "none",
    isDraftInProgress: false,
    isLocked: false,
    visitDate: "",
    linkedTo: "HH-1001",
    createdAt: "yesterday at 7:31 PM",
    createdBy: "Dana Jenkins",
    modifiedAt: "yesterday at 7:31 PM",
    modifiedBy: "Dana Jenkins",
    expire: "never",
    lastUpdated: "yesterday at 7:31 PM",
    sections: FORM_TEMPLATES[6].defaultSections,
  },
];

function normalizeStatus(status: AssessmentFormItem["status"]): FormStatusValue {
  if (status === "Complete" || status === "Completed & Signed") return "Complete";
  if (status === "In Progress" || status === "Draft" || status === "Pending Signature" || status === "Annual Renewal Due") {
    return "In Progress";
  }
  return "none";
}

function isRowLocked(form: AssessmentFormItem): boolean {
  if (typeof form.isLocked === "boolean") return form.isLocked;
  return normalizeStatus(form.status) === "Complete";
}

export function ClientFormsTab({ client, onUpdateClient }: ClientFormsTabProps) {
  const forms: AssessmentFormItem[] = useMemo(() => {
    if (client.forms && client.forms.length > 0) return client.forms;
    return DEFAULT_CLIENT_FORMS;
  }, [client.forms]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Modals
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState<AssessmentFormItem | null>(null);
  const [editingForm, setEditingForm] = useState<AssessmentFormItem | null>(null);
  const [deletingForm, setDeletingForm] = useState<AssessmentFormItem | null>(null);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);

  const newFormMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newFormMenuRef.current && !newFormMenuRef.current.contains(e.target as Node)) {
        setIsNewFormOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const [sendFormState, setSendFormState] = useState({
    selectedFormId: forms[0]?.id || "FORM-201",
    recipient: client.responsibleParties?.[0]?.name || "Sarah Miller",
    deliveryMethod: "SMS & Email Portal Link",
    customNote: "Please review and e-sign the clinical assessment packet at your earliest convenience.",
  });

  const [customFormState, setCustomFormState] = useState({
    title: "",
    type: "Clinical Assessment" as AssessmentFormItem["type"],
    visitDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    linkedTo: "",
    expire: "never" as ExpireValue,
    notes: "",
  });

  const [editDraft, setEditDraft] = useState<{
    title: string;
    visitDate: string;
    linkedTo: string;
    expire: ExpireValue;
    status: FormStatusValue;
    notes: string;
    sections: Array<{ label: string; value: string }>;
  } | null>(null);

  const persistForms = (nextForms: AssessmentFormItem[], extraNotes?: ClientRecord["notes"]) => {
    const updated: ClientRecord = {
      ...client,
      forms: nextForms,
      ...(extraNotes ? { notes: extraNotes } : {}),
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }
  };

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedForms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? forms.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          (f.createdBy || "").toLowerCase().includes(q) ||
          (f.modifiedBy || "").toLowerCase().includes(q) ||
          (f.linkedTo || "").toLowerCase().includes(q) ||
          normalizeStatus(f.status).toLowerCase().includes(q)
      )
      : forms;

    const statusRank: Record<FormStatusValue, number> = {
      "In Progress": 1,
      Complete: 2,
      none: 3,
    };

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "status") {
        cmp = statusRank[normalizeStatus(a.status)] - statusRank[normalizeStatus(b.status)];
      } else if (sortField === "name") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "visitDate") {
        cmp = (a.visitDate || "").localeCompare(b.visitDate || "");
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [forms, searchQuery, sortField, sortDirection]);

  const handleCreateFromTemplate = (template: (typeof FORM_TEMPLATES)[number]) => {
    const nowLabel = "Today, Just now";
    const todayFormatted = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    const newForm: AssessmentFormItem = {
      id: `FORM-${Date.now().toString().slice(-4)}`,
      title: template.title,
      type: template.type,
      status: "In Progress",
      isDraftInProgress: true,
      isLocked: false,
      visitDate: todayFormatted,
      linkedTo: "",
      createdAt: nowLabel,
      createdBy: "Agency Admin",
      modifiedAt: nowLabel,
      modifiedBy: "Agency Admin",
      expire: "never",
      lastUpdated: nowLabel,
      sections: template.defaultSections,
    };

    persistForms([newForm, ...forms]);
    setIsNewFormOpen(false);
    toast.success(`Created "${template.title}" draft.`);
  };

  const handleCreateCustomForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormState.title.trim()) return;
    const nowLabel = "Today, Just now";

    const newForm: AssessmentFormItem = {
      id: `FORM-${Date.now().toString().slice(-4)}`,
      title: customFormState.title.trim(),
      type: customFormState.type,
      status: "In Progress",
      isDraftInProgress: true,
      isLocked: false,
      visitDate: customFormState.visitDate.trim(),
      linkedTo: customFormState.linkedTo.trim(),
      createdAt: nowLabel,
      createdBy: "Agency Admin",
      modifiedAt: nowLabel,
      modifiedBy: "Agency Admin",
      expire: customFormState.expire,
      lastUpdated: nowLabel,
      notes: customFormState.notes.trim(),
      sections: [
        { label: "Primary Assessment Findings", value: "Pending completion" },
        { label: "Caregiver / Guardian Review", value: "Scheduled" },
      ],
    };

    persistForms([newForm, ...forms]);
    setIsCreateCustomOpen(false);
    setCustomFormState({
      title: "",
      type: "Clinical Assessment",
      visitDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      linkedTo: "",
      expire: "never",
      notes: "",
    });
    toast.success(`Created "${newForm.title}" draft.`);
  };

  const handleStatusChange = (formId: string, nextStatus: FormStatusValue) => {
    const nowLabel = "Today, Just now";
    const nextForms = forms.map((f) =>
      f.id === formId
        ? {
          ...f,
          status: nextStatus,
          isLocked: nextStatus === "Complete",
          isDraftInProgress: nextStatus === "In Progress",
          modifiedAt: nowLabel,
          modifiedBy: "Agency Admin",
          lastUpdated: nowLabel,
        }
        : f
    );
    persistForms(nextForms);
    toast.success(`Form status updated to "${nextStatus}".`);
  };

  const handleExpireChange = (formId: string, nextExpire: ExpireValue) => {
    const nowLabel = "Today, Just now";
    const nextForms = forms.map((f) =>
      f.id === formId
        ? {
          ...f,
          expire: nextExpire,
          modifiedAt: nowLabel,
          modifiedBy: "Agency Admin",
          lastUpdated: nowLabel,
        }
        : f
    );
    persistForms(nextForms);
    toast.success(`Expiration set to "${nextExpire}".`);
  };

  const handleCopyForm = (form: AssessmentFormItem) => {
    const nowLabel = "Today, Just now";
    const copied: AssessmentFormItem = {
      ...form,
      id: `FORM-${Date.now().toString().slice(-4)}`,
      title: `${form.title} (Copy)`,
      status: "In Progress",
      isLocked: false,
      isDraftInProgress: true,
      createdAt: nowLabel,
      createdBy: "Agency Admin",
      modifiedAt: nowLabel,
      modifiedBy: "Agency Admin",
      lastUpdated: nowLabel,
      signedBy: undefined,
    };
    persistForms([copied, ...forms]);
    toast.success(`Duplicated "${form.title}" as a new draft.`);
  };

  const handleOpenEdit = (form: AssessmentFormItem) => {
    setEditingForm(form);
    setEditDraft({
      title: form.title,
      visitDate: form.visitDate || "",
      linkedTo: form.linkedTo || "",
      expire: (form.expire as ExpireValue) || "never",
      status: normalizeStatus(form.status),
      notes: form.notes || "",
      sections:
        form.sections && form.sections.length > 0
          ? form.sections.map((s) => ({ ...s }))
          : [
            { label: "Section 1: Clinical / Care Review", value: "Satisfactory" },
            { label: "Section 2: Safety & Environment", value: "Clear / No Hazards" },
          ],
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm || !editDraft) return;
    const nowLabel = "Today, Just now";

    const nextForms = forms.map((f) =>
      f.id === editingForm.id
        ? {
          ...f,
          title: editDraft.title.trim() || f.title,
          visitDate: editDraft.visitDate.trim(),
          linkedTo: editDraft.linkedTo.trim(),
          expire: editDraft.expire,
          status: editDraft.status,
          isLocked: editDraft.status === "Complete",
          isDraftInProgress: editDraft.status === "In Progress",
          notes: editDraft.notes,
          sections: editDraft.sections,
          modifiedAt: nowLabel,
          modifiedBy: "Agency Admin",
          lastUpdated: nowLabel,
        }
        : f
    );

    persistForms(nextForms);
    setEditingForm(null);
    setEditDraft(null);
    toast.success("Form changes saved.");
  };

  const handleConfirmDelete = () => {
    if (!deletingForm) return;
    const nextForms = forms.filter((f) => f.id !== deletingForm.id);
    persistForms(nextForms);
    toast.success(`Deleted "${deletingForm.title}".`);
    setDeletingForm(null);
  };

  const handleOpenSend = (form: AssessmentFormItem) => {
    setSendFormState((prev) => ({
      ...prev,
      selectedFormId: form.id,
    }));
    setIsSendModalOpen(true);
  };

  const handleSendFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenForm = forms.find((f) => f.id === sendFormState.selectedFormId) || forms[0];

    const newNote = {
      id: `NOT-${Date.now()}`,
      timestamp: "Today, Just now",
      author: "Agency Admin",
      authorRole: "Operational Administrator",
      category: "Family Communication" as const,
      title: `Form Sent: ${chosenForm?.title || "Assessment Form"}`,
      content: `Dispatched ${chosenForm?.title} to ${sendFormState.recipient} via ${sendFormState.deliveryMethod}. Note: "${sendFormState.customNote}"`,
      isPinned: false,
    };

    persistForms(forms, [newNote, ...(client.notes || [])]);
    setIsSendModalOpen(false);
    toast.success(`Form packet sent to ${sendFormState.recipient}. Communication logged.`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Main Forms Card (LiliSare Global Card Outline) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200 overflow-hidden">
        {/* Card Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Forms <span className="text-slate-500 font-semibold">({forms.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  title="Search forms"
                  aria-label="Toggle form search"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isSearchOpen || searchQuery
                    ? "bg-[#3D6B22]/10 text-[#3D6B22]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
              <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> e-Sign & Clinical Packets
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            {/* Expandable Inline Search Input */}
            {(isSearchOpen || searchQuery) && (
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search form, author, status..."
                  className="w-full pl-8 pr-7 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* NEW FORM Dropdown */}
            <div ref={newFormMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsNewFormOpen((prev) => !prev)}
                aria-expanded={isNewFormOpen}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>NEW FORM</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isNewFormOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isNewFormOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-40 p-1.5 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Form Template
                  </div>
                  <div className="py-1 space-y-0.5">
                    {FORM_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.title}
                        type="button"
                        onClick={() => handleCreateFromTemplate(tpl)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#3D6B22]/10 hover:text-[#3D6B22] transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span>{tpl.title}</span>
                        <span className="text-[10px] font-medium text-slate-400">{tpl.type.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewFormOpen(false);
                        setIsCreateCustomOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#3D6B22] hover:bg-[#3D6B22]/10 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Custom Assessment Form...</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredAndSortedForms.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No matching forms found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? `No forms matched "${searchQuery}". Try clearing your search.`
                  : "Click NEW FORM to create an assessment or clinical progress note."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================================
                DESKTOP TABLE VIEW (lg and up)
               ================================================================= */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th
                      onClick={() => handleSortToggle("name")}
                      className={`py-3 pl-5 pr-3 cursor-pointer select-none transition-colors ${sortField === "name" ? "bg-slate-200/60 text-slate-800" : "hover:bg-slate-100/80"
                        }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>NAME</span>
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <ArrowDown className="w-3 h-3 text-[#3D6B22]" />
                          ) : (
                            <ArrowUp className="w-3 h-3 text-[#3D6B22]" />
                          ))}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle("visitDate")}
                      className="py-3 px-3 cursor-pointer select-none hover:bg-slate-100/80 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        <span>VISIT DATE</span>
                        {sortField === "visitDate" &&
                          (sortDirection === "asc" ? (
                            <ArrowDown className="w-3 h-3 text-[#3D6B22]" />
                          ) : (
                            <ArrowUp className="w-3 h-3 text-[#3D6B22]" />
                          ))}
                      </div>
                    </th>
                    <th className="py-3 px-3 whitespace-nowrap">LINKED TO</th>
                    <th className="py-3 px-3 whitespace-nowrap">CREATED</th>
                    <th className="py-3 px-3 whitespace-nowrap">MODIFIED</th>
                    <th className="py-3 px-3 whitespace-nowrap">EXPIRE</th>
                    <th
                      onClick={() => handleSortToggle("status")}
                      className={`py-3 px-3 cursor-pointer select-none transition-colors whitespace-nowrap ${sortField === "status" ? "bg-slate-200/60 text-slate-800" : "hover:bg-slate-100/80"
                        }`}
                    >
                      <div className="flex items-center gap-1">
                        {sortDirection === "asc" ? (
                          <ArrowDown className="w-3 h-3 text-[#3D6B22]" />
                        ) : (
                          <ArrowUp className="w-3 h-3 text-[#3D6B22]" />
                        )}
                        <span>STATUS</span>
                      </div>
                    </th>
                    <th className="py-3 pl-3 pr-5 text-right whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAndSortedForms.map((form) => {
                    const locked = isRowLocked(form);
                    const normalizedStatus = normalizeStatus(form.status);
                    const isDraft = normalizedStatus === "In Progress" || form.isDraftInProgress;
                    const expireVal = (form.expire as ExpireValue) || "never";

                    return (
                      <tr
                        key={form.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* NAME */}
                        <td className="py-3.5 pl-5 pr-3 align-middle">
                          <div className="flex items-start gap-2">
                            {locked && (
                              <Lock
                                className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0"
                                aria-label="Locked complete form"
                              />
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-[13px] leading-snug">
                                {form.title}
                              </div>
                              {isDraft && (
                                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span>Draft in Progress</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* VISIT DATE */}
                        <td className="py-3.5 px-3 align-middle text-slate-700 font-medium whitespace-nowrap">
                          {form.visitDate || <span className="text-slate-300">—</span>}
                        </td>

                        {/* LINKED TO */}
                        <td className="py-3.5 px-3 align-middle text-slate-600 whitespace-nowrap">
                          {form.linkedTo ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-700 font-semibold text-[11px]">
                              <Link2 className="w-3 h-3 text-[#3D6B22]" />
                              {form.linkedTo}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* CREATED */}
                        <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {form.createdAt || form.lastUpdated}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {form.createdBy || "Agency Staff"}
                          </div>
                        </td>

                        {/* MODIFIED */}
                        <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                          <div className="font-semibold text-slate-800">
                            {form.modifiedAt || form.lastUpdated}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {form.modifiedBy || form.signedBy || "Agency Staff"}
                          </div>
                        </td>

                        {/* EXPIRE */}
                        <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                          <select
                            aria-label={`Expiration for ${form.title}`}
                            value={expireVal}
                            onChange={(e) => handleExpireChange(form.id, e.target.value as ExpireValue)}
                            className="bg-transparent hover:bg-slate-100/80 border border-transparent hover:border-slate-200 rounded-lg px-2 py-1 text-xs font-medium italic text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer transition-all"
                          >
                            <option value="never">never</option>
                            <option value="30 days">30 days</option>
                            <option value="60 days">60 days</option>
                            <option value="90 days">90 days</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                          </select>
                        </td>

                        {/* STATUS */}
                        <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                          <select
                            aria-label={`Status for ${form.title}`}
                            value={normalizedStatus}
                            onChange={(e) => handleStatusChange(form.id, e.target.value as FormStatusValue)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 cursor-pointer transition-all ${normalizedStatus === "Complete"
                              ? "bg-emerald-50/80 text-[#3D6B22] border-emerald-200/80"
                              : normalizedStatus === "In Progress"
                                ? "bg-amber-50/80 text-amber-800 border-amber-200/80"
                                : "bg-slate-50 text-slate-600 border-slate-200 italic"
                              }`}
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Complete">Complete</option>
                            <option value="none">none</option>
                          </select>
                        </td>

                        {/* ACTIONS */}
                        <td className="py-3.5 pl-3 pr-5 align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenSend(form)}
                              className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-slate-600 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 transition-colors cursor-pointer"
                              title="Send form"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-semibold mt-0.5">Send</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyForm(form)}
                              className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy form"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-semibold mt-0.5">Copy</span>
                            </button>

                            {locked ? (
                              <button
                                type="button"
                                onClick={() => setViewingForm(form)}
                                className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-slate-600 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 transition-colors cursor-pointer"
                                title="View locked form"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-semibold mt-0.5">View</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(form)}
                                  className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-slate-600 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 transition-colors cursor-pointer"
                                  title="Edit form"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-semibold mt-0.5">Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeletingForm(form)}
                                  className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete form"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-semibold mt-0.5">Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================================
                MOBILE & TABLET ULTRA-RESPONSIVE CARD VIEW (< lg)
               ================================================================= */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredAndSortedForms.map((form) => {
                const locked = isRowLocked(form);
                const normalizedStatus = normalizeStatus(form.status);
                const isDraft = normalizedStatus === "In Progress" || form.isDraftInProgress;
                const expireVal = (form.expire as ExpireValue) || "never";

                return (
                  <div key={form.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/40 transition-colors">
                    {/* Card Top: Title + Status Selector */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2 min-w-0">
                        {locked && (
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                            {form.title}
                          </h3>
                          {isDraft ? (
                            <span className="inline-block text-[11px] font-semibold text-amber-700 mt-0.5">
                              Draft in Progress
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] font-medium text-slate-400 mt-0.5">
                              {form.type}
                            </span>
                          )}
                        </div>
                      </div>

                      <select
                        aria-label={`Status for ${form.title}`}
                        value={normalizedStatus}
                        onChange={(e) => handleStatusChange(form.id, e.target.value as FormStatusValue)}
                        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 cursor-pointer ${normalizedStatus === "Complete"
                          ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                          : normalizedStatus === "In Progress"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Complete">Complete</option>
                        <option value="none">none</option>
                      </select>
                    </div>

                    {/* Card Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Visit Date
                        </span>
                        <p className="font-semibold text-slate-800 mt-0.5">
                          {form.visitDate || "Not linked"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> Linked To
                        </span>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate">
                          {form.linkedTo || "—"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <User className="w-3 h-3" /> Created
                        </span>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate">
                          {form.createdBy || "Agency Staff"}
                        </p>
                        <p className="text-[11px] text-slate-500">{form.createdAt || form.lastUpdated}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Modified
                        </span>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate">
                          {form.modifiedBy || form.signedBy || "Agency Staff"}
                        </p>
                        <p className="text-[11px] text-slate-500">{form.modifiedAt || form.lastUpdated}</p>
                      </div>

                      <div className="col-span-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Expire
                        </span>
                        <select
                          aria-label={`Expiration for ${form.title}`}
                          value={expireVal}
                          onChange={(e) => handleExpireChange(form.id, e.target.value as ExpireValue)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium italic text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20"
                        >
                          <option value="never">never</option>
                          <option value="30 days">30 days</option>
                          <option value="60 days">60 days</option>
                          <option value="90 days">90 days</option>
                          <option value="6 months">6 months</option>
                          <option value="1 year">1 year</option>
                        </select>
                      </div>
                    </div>

                    {/* Touch-friendly Action Bar */}
                    <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenSend(form)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#3D6B22]" />
                        <span>Send</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyForm(form)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </button>

                      {locked ? (
                        <button
                          type="button"
                          onClick={() => setViewingForm(form)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(form)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingForm(form)}
                            className="col-span-3 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-50 border border-rose-200/80 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* =====================================================================
          VIEW LOCKED FORM MODAL
         ===================================================================== */}
      {viewingForm && (
        <Modal
          isOpen={!!viewingForm}
          onClose={() => setViewingForm(null)}
          title={viewingForm.title}
          description={`Form ID: ${viewingForm.id} • ${viewingForm.type}`}
          icon={<FileText className="w-5 h-5 text-[#3D6B22]" />}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  const f = viewingForm;
                  setViewingForm(null);
                  handleCopyForm(f);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy as New Draft</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingForm(null)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
              >
                Close Form
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3D6B22] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Status: {normalizeStatus(viewingForm.status)} (Locked)
                  </span>
                  <span className="text-xs text-slate-500">
                    Signed / Verified By:{" "}
                    <strong className="text-slate-800">
                      {viewingForm.signedBy || viewingForm.modifiedBy || "Clinical Staff"}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 sm:text-right">
                <div>Visit Date: {viewingForm.visitDate || "N/A"}</div>
                <div>Modified: {viewingForm.modifiedAt || viewingForm.lastUpdated}</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-3 text-xs text-slate-700">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>Assessment Sections & Responses</span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
              {(viewingForm.sections && viewingForm.sections.length > 0
                ? viewingForm.sections
                : [
                  { label: "Section 1: Clinical Assessment", value: "Completed & Verified" },
                  { label: "Section 2: Environmental Safety", value: "Clear / No Hazards" },
                  { label: "Section 3: Caregiver Alignment", value: "Verified with Care Plan" },
                ]
              ).map((sec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-500 font-medium">{sec.label}</span>
                  <span className="font-bold text-slate-800">{sec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================================
          EDIT FORM MODAL
         ===================================================================== */}
      {editingForm && editDraft && (
        <Modal
          isOpen={!!editingForm}
          onClose={() => {
            setEditingForm(null);
            setEditDraft(null);
          }}
          title={`Edit: ${editingForm.title}`}
          description={`Form ID: ${editingForm.id} • ${editingForm.type}`}
          icon={<Pencil className="w-5 h-5 text-[#3D6B22]" />}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Form Name
                </label>
                <input
                  type="text"
                  required
                  value={editDraft.title}
                  onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Visit Date
                </label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={editDraft.visitDate}
                  onChange={(e) => setEditDraft({ ...editDraft, visitDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                  Linked To (Visit / Episode)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Visit #EVV-402 or Care Plan"
                  value={editDraft.linkedTo}
                  onChange={(e) => setEditDraft({ ...editDraft, linkedTo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={editDraft.status}
                    onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as FormStatusValue })}
                    className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                    <option value="none">none</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                    Expire
                  </label>
                  <select
                    value={editDraft.expire}
                    onChange={(e) => setEditDraft({ ...editDraft, expire: e.target.value as ExpireValue })}
                    className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
                  >
                    <option value="never">never</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>Assessment Sections</span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
              <div className="space-y-2.5">
                {editDraft.sections.map((sec, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={sec.label}
                      onChange={(e) => {
                        const next = [...editDraft.sections];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setEditDraft({ ...editDraft, sections: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                    />
                    <input
                      type="text"
                      value={sec.value}
                      onChange={(e) => {
                        const next = [...editDraft.sections];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setEditDraft({ ...editDraft, sections: next });
                      }}
                      className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Clinical / Administrative Notes
              </label>
              <textarea
                rows={2}
                value={editDraft.notes}
                onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                placeholder="Add observations or follow-up instructions..."
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingForm(null);
                  setEditDraft(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================================
          CREATE CUSTOM FORM MODAL
         ===================================================================== */}
      <Modal
        isOpen={isCreateCustomOpen}
        onClose={() => setIsCreateCustomOpen(false)}
        title="Create New Assessment Form"
        description="Initialize a custom clinical or compliance form for this client"
        icon={<FileSpreadsheet className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCustomForm} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Form Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pediatric Sensory Reassessment"
              value={customFormState.title}
              onChange={(e) => setCustomFormState({ ...customFormState, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Form Category
              </label>
              <select
                value={customFormState.type}
                onChange={(e) =>
                  setCustomFormState({ ...customFormState, type: e.target.value as AssessmentFormItem["type"] })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
              >
                <option value="Clinical Assessment">Clinical Assessment</option>
                <option value="Progress Note">Progress Note</option>
                <option value="Evaluation">Evaluation</option>
                <option value="Management Report">Management Report</option>
                <option value="Waiver Assessment">Waiver Assessment</option>
                <option value="Consent & Release">Consent & Release</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                Visit Date
              </label>
              <input
                type="text"
                value={customFormState.visitDate}
                onChange={(e) => setCustomFormState({ ...customFormState, visitDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateCustomOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Draft</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          DELETE CONFIRMATION MODAL
         ===================================================================== */}
      {deletingForm && (
        <Modal
          isOpen={!!deletingForm}
          onClose={() => setDeletingForm(null)}
          title="Delete Form Draft"
          description="This action cannot be undone."
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">{deletingForm.title}</strong>?
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingForm(null)}
                className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Form</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================================
          SEND FORM TO FAMILY MODAL
         ===================================================================== */}
      <Modal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="Send Assessment Form to Family"
        icon={<Send className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleSendFormSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Select Assessment Packet
            </label>
            <select
              value={sendFormState.selectedFormId}
              onChange={(e) => setSendFormState({ ...sendFormState, selectedFormId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Recipient Guardian
            </label>
            <input
              type="text"
              required
              value={sendFormState.recipient}
              onChange={(e) => setSendFormState({ ...sendFormState, recipient: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Delivery Channel
            </label>
            <select
              value={sendFormState.deliveryMethod}
              onChange={(e) => setSendFormState({ ...sendFormState, deliveryMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
            >
              <option value="SMS & Email Portal Link">SMS & Email Portal Link</option>
              <option value="Secure Client Portal Notification">Secure Client Portal Notification</option>
              <option value="Email Only">Email Only</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Message to Family
            </label>
            <textarea
              rows={2}
              value={sendFormState.customNote}
              onChange={(e) => setSendFormState({ ...sendFormState, customNote: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSendModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Packet</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
