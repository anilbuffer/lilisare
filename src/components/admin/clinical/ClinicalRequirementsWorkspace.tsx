"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  CheckSquare,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import {
  FormButtonCancel,
  FormButtonPrimary,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "@/components/ui/FormControls";
import { useAuth } from "@/hooks/useAuth";
import {
  checkClinicalPermission,
  resolveClinicalActor,
} from "@/lib/admin/clinicalAuthGuard";
import {
  cancelClinicalRequirement,
  DEMO_TODAY,
  editClinicalRequirement,
  exportClinicalCsv,
  getClinicalDetailHref,
  getClinicalRequirements,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalRequirement,
  PriorityLevel,
  RequirementStatus,
  VisitDeliveryMethod,
} from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { ClinicalAvatarName, RequirementStatusBadge } from "./ClinicalBadges";

type SortKey = "clientName" | "visitType" | "nextDueDate" | "status";

export function ClinicalRequirementsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canCreateReq = checkClinicalPermission(actor, "CREATE_REQUIREMENT").allowed;
  const canEditReq = checkClinicalPermission(actor, "EDIT_REQUIREMENT").allowed;
  const canCancelReq = checkClinicalPermission(actor, "CANCEL_REQUIREMENT").allowed;

  const [requirements, setRequirements] = useState<ClinicalRequirement[]>(() =>
    getClinicalRequirements()
  );

  // Edit / Cancel Requirement Modal State
  const [editTarget, setEditTarget] = useState<ClinicalRequirement | null>(null);
  const [editDueDate, setEditDueDate] = useState("");
  const [editFrequency, setEditFrequency] = useState("");
  const [editDeliveryMethod, setEditDeliveryMethod] = useState<VisitDeliveryMethod>("In-home");
  const [editPriority, setEditPriority] = useState<PriorityLevel>("Medium");
  const [editStatus, setEditStatus] = useState<RequirementStatus>("Active");
  const [editNotes, setEditNotes] = useState("");

  const [cancelTarget, setCancelTarget] = useState<ClinicalRequirement | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Filters (aligned with table columns: Client, Visit Type, Assigned Professional, Next Due Date, Status)
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueScopeOverride, setDueScopeOverride] = useState<{
    sourceFilter: string;
    value: string;
  } | null>(null);
  const dueScopeFilter =
    dueScopeOverride && dueScopeOverride.sourceFilter === initialFilter
      ? dueScopeOverride.value
      : initialFilter === "due_month"
        ? "due_month"
        : "all";
  const setDueScopeFilter = (value: string) =>
    setDueScopeOverride({ sourceFilter: initialFilter, value });

  const [sortKey, setSortKey] = useState<SortKey>("nextDueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const load = () => {
      setRequirements(getClinicalRequirements());
    };
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const uniqueClients = useMemo(
    () => Array.from(new Set(requirements.map((r) => r.clientName))).sort(),
    [requirements]
  );
  const uniqueVisitTypes = useMemo(
    () => Array.from(new Set(requirements.map((r) => r.visitType))).sort(),
    [requirements]
  );
  const uniqueProfessionals = useMemo(
    () =>
      Array.from(
        new Set(
          requirements
            .map((r) => r.assignedProfessionalName)
            .filter((name): name is string => Boolean(name))
        )
      ).sort(),
    [requirements]
  );

  const filtered = useMemo(() => {
    return requirements
      .filter((r) => {
        if (clientFilter !== "all" && r.clientName !== clientFilter) return false;
        if (visitTypeFilter !== "all" && r.visitType !== visitTypeFilter) return false;
        if (professionalFilter === "unassigned" && r.assignedProfessionalId) return false;
        if (
          professionalFilter !== "all" &&
          professionalFilter !== "unassigned" &&
          r.assignedProfessionalName !== professionalFilter
        ) {
          return false;
        }
        if (statusFilter !== "all" && r.status !== statusFilter) return false;

        if (dueScopeFilter === "due_month") {
          if (r.nextDueDate < "2026-11-01" || r.nextDueDate > "2026-11-30") return false;
        } else if (dueScopeFilter === "overdue") {
          if (r.status !== "Overdue" && !(r.nextDueDate < DEMO_TODAY && r.status !== "Completed"))
            return false;
        } else if (dueScopeFilter === "upcoming") {
          if (r.nextDueDate < DEMO_TODAY) return false;
        }

        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          const hay = `${r.id} ${r.clientName} ${r.clientId} ${r.visitType} ${r.assignedProfessionalName || "unassigned"} ${r.nextDueDate} ${r.status}`.toLowerCase();
          if (!hay.includes(t)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] || "");
        const bv = String(b[sortKey] || "");
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [
    requirements,
    clientFilter,
    visitTypeFilter,
    professionalFilter,
    statusFilter,
    dueScopeFilter,
    searchTerm,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExportFiltered = () => {
    const targetList =
      selectedIds.length > 0
        ? filtered.filter((r) => selectedIds.includes(r.id))
        : filtered;
    exportClinicalCsv(
      targetList.map((r) => ({
        RequirementID: r.id,
        Client: r.clientName,
        Agency: r.agencyName,
        Program: r.programName,
        Service: r.serviceName,
        VisitType: r.visitType,
        RequiredProfessional: r.professionalType,
        Frequency: r.frequency,
        LastCompleted: r.lastCompletedDate || "None",
        NextDueDate: r.nextDueDate,
        AssignedProfessional: r.assignedProfessionalName || "Unassigned",
        RequirementStatus: r.status,
        DocumentationStatus: r.documentationStatus,
      })),
      "lilisare-clinical-requirements-filtered.csv"
    );
    toast.success(`Exported ${targetList.length} requirements to CSV`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setClientFilter("all");
    setVisitTypeFilter("all");
    setProfessionalFilter("all");
    setStatusFilter("all");
    setDueScopeFilter("all");
    setCurrentPage(1);
    toast.info("Filters cleared");
  };

  const toggleAllRows = () => {
    if (selectedIds.length === paginated.length && paginated.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((r) => r.id));
    }
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openEditModal = (req: ClinicalRequirement) => {
    setEditTarget(req);
    setEditDueDate(req.nextDueDate);
    setEditFrequency(req.frequency);
    setEditDeliveryMethod(req.deliveryMethod);
    setEditPriority(req.priority);
    setEditStatus(req.status);
    setEditNotes(req.internalNotes || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      editClinicalRequirement(
        editTarget.id,
        {
          nextDueDate: editDueDate,
          frequency: editFrequency,
          deliveryMethod: editDeliveryMethod,
          priority: editPriority,
          status: editStatus,
          internalNotes: editNotes.trim(),
        },
        actor
      );
      toast.success(`Updated requirement ${editTarget.id}`);
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update requirement");
    }
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancelling this requirement.");
      return;
    }
    try {
      cancelClinicalRequirement(cancelTarget.id, cancelReason.trim(), actor);
      toast.success(`Cancelled requirement ${cancelTarget.id}`);
      setCancelTarget(null);
      setCancelReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel requirement");
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav
        activeTab="requirements"
        onExport={handleExportFiltered}
      />

      {/* Filter Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search client, visit type, assigned professional..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <span className="text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 border border-[#3D6B22]/20 px-3 py-1.5 rounded-xl">
                {selectedIds.length} selected
              </span>
            )}
            <button
              type="button"
              onClick={handleExportFiltered}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {selectedIds.length > 0
                  ? `Export Selected (${selectedIds.length})`
                  : "Export Filtered"}
              </span>
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            {canCreateReq && (
              <Link
                href="/admin/clinical/requirements/new/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Requirement</span>
              </Link>
            )}
          </div>
        </div>

        {/* Column-Aligned Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <select
            aria-label="Filter by Client"
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Clients</option>
            {uniqueClients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Visit Type"
            value={visitTypeFilter}
            onChange={(e) => {
              setVisitTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Visit Types</option>
            {uniqueVisitTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Assigned Professional"
            value={professionalFilter}
            onChange={(e) => {
              setProfessionalFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Professionals</option>
            <option value="unassigned">Unassigned</option>
            {uniqueProfessionals.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Next Due Date"
            value={dueScopeFilter}
            onChange={(e) => {
              setDueScopeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Due Dates</option>
            <option value="due_month">Due This Month (Nov)</option>
            <option value="overdue">Overdue Only</option>
            <option value="upcoming">Upcoming Only</option>
          </select>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            {(
              [
                "Active",
                "Pending Assignment",
                "Scheduled",
                "Due Soon",
                "Overdue",
                "Completed",
                "On Hold",
                "Draft",
                "Cancelled",
              ] as RequirementStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Standardized Clean Repository Table (Checkbox + 6 Primary Columns, Zero Horizontal Scroll) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <button
                    type="button"
                    onClick={toggleAllRows}
                    aria-label="Select all rows"
                    className="text-slate-400 hover:text-[#3D6B22] cursor-pointer"
                  >
                    {selectedIds.length === paginated.length && paginated.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#3D6B22]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("clientName")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Client</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("visitType")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Visit Type</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Assigned Professional</th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("nextDueDate")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Next Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm text-slate-700">
                      No matching clinical or supervisory requirements found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Adjust filters or create a new visit requirement.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((req) => {
                  const isSelected = selectedIds.includes(req.id);
                  const detailHref = getClinicalDetailHref(req.activeVisitId || req.id);
                  return (
                    <tr
                      key={req.id}
                      onClick={() => router.push(detailHref)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => toggleRow(req.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#3D6B22]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName
                          name={req.clientName}
                          variant="client"
                          highlightHover
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap truncate max-w-[200px]">
                        {req.visitType}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName
                          name={req.assignedProfessionalName}
                          variant="staff"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {req.nextDueDate}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RequirementStatusBadge status={req.status} />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {canEditReq &&
                            req.status !== "Cancelled" &&
                            req.status !== "Completed" && (
                              <button
                                type="button"
                                onClick={() => openEditModal(req)}
                                title="Edit requirement"
                                aria-label={`Edit ${req.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          {canCancelReq &&
                            req.status !== "Cancelled" &&
                            req.status !== "Completed" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(req);
                                  setCancelReason("");
                                }}
                                title="Cancel requirement"
                                aria-label={`Cancel ${req.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          <Link
                            href={detailHref}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          entryLabel="requirements"
        />
      </div>

      {/* Edit Requirement Modal */}
      <Modal
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Modify Clinical Requirement"
        description={editTarget ? `${editTarget.clientName} · ${editTarget.visitType}` : undefined}
        icon={<Pencil className="w-5 h-5" />}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FormLabel required>Next Due Date</FormLabel>
              <FormInput
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <FormLabel required>Frequency</FormLabel>
              <FormInput
                value={editFrequency}
                onChange={(e) => setEditFrequency(e.target.value)}
                required
              />
            </div>
            <div>
              <FormLabel required>Delivery Method</FormLabel>
              <FormSelect
                value={editDeliveryMethod}
                onChange={(e) => setEditDeliveryMethod(e.target.value as VisitDeliveryMethod)}
              >
                <option value="In-home">In-home</option>
                <option value="Virtual">Virtual</option>
                <option value="Other approved method">Other approved method</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel required>Priority</FormLabel>
              <FormSelect
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </FormSelect>
            </div>
            <div className="sm:col-span-2">
              <FormLabel required>Status</FormLabel>
              <FormSelect
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RequirementStatus)}
              >
                {(
                  [
                    "Active",
                    "Pending Assignment",
                    "Scheduled",
                    "Due Soon",
                    "Overdue",
                    "On Hold",
                    "Draft",
                  ] as RequirementStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div className="sm:col-span-2">
              <FormLabel>Internal Notes</FormLabel>
              <FormTextarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Reason for modification or operational context..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <FormButtonCancel type="button" onClick={() => setEditTarget(null)}>
              Cancel
            </FormButtonCancel>
            <FormButtonPrimary type="submit">Save Changes</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Cancel Requirement Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Clinical Requirement"
        description={cancelTarget ? `${cancelTarget.clientName} · ${cancelTarget.visitType}` : undefined}
        icon={<Trash2 className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <p className="text-xs text-slate-600">
            Cancelling this requirement will mark it as <strong>Cancelled</strong> and cancel any uncompleted linked visits. This action is recorded in the immutable audit trail.
          </p>
          <div>
            <FormLabel required>Cancellation Reason</FormLabel>
            <FormTextarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explain why this requirement is being cancelled..."
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <FormButtonCancel type="button" onClick={() => setCancelTarget(null)}>
              Keep Active
            </FormButtonCancel>
            <FormButtonPrimary type="submit">Confirm Cancellation</FormButtonPrimary>
          </div>
        </form>
      </Modal>
    </div>
  );
}
