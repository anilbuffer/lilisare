"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  CheckSquare,
  Download,
  Eye,
  RotateCcw,
  Search,
  Square,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { resolveClinicalActor } from "@/lib/admin/clinicalAuthGuard";
import {
  CLINICAL_AGENCIES,
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  exportClinicalCsv,
  getClinicalDetailHref,
  getClinicalRequirements,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalRequirement,
  ClinicalVisit,
  DocumentationStatus,
  RequirementStatus,
} from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { DocumentationStatusBadge, RequirementStatusBadge } from "./ClinicalBadges";
import { AssignProfessionalModal } from "./ClinicalActionModals";

type SortKey =
  | "id"
  | "clientName"
  | "serviceName"
  | "nextDueDate"
  | "status"
  | "documentationStatus";

export function ClinicalRequirementsWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);

  const [requirements, setRequirements] = useState<ClinicalRequirement[]>(() =>
    getClinicalRequirements()
  );
  const [visits, setVisits] = useState<ClinicalVisit[]>(() => getClinicalVisits());

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [profTypeFilter, setProfTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [docStatusFilter, setDocStatusFilter] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "assigned" | "unassigned">("all");
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

  const [assignVisitTarget, setAssignVisitTarget] = useState<ClinicalVisit | null>(null);

  useEffect(() => {
    const load = () => {
      setRequirements(getClinicalRequirements());
      setVisits(getClinicalVisits());
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
  const uniqueServices = useMemo(
    () => Array.from(new Set(requirements.map((r) => r.serviceName))).sort(),
    [requirements]
  );
  const uniqueVisitTypes = useMemo(
    () => Array.from(new Set(requirements.map((r) => r.visitType))).sort(),
    [requirements]
  );

  const filtered = useMemo(() => {
    return requirements
      .filter((r) => {
        if (agencyFilter !== "all" && r.agencyId !== agencyFilter) return false;
        if (programFilter !== "all" && r.programName !== programFilter) return false;
        if (clientFilter !== "all" && r.clientName !== clientFilter) return false;
        if (serviceFilter !== "all" && r.serviceName !== serviceFilter) return false;
        if (visitTypeFilter !== "all" && r.visitType !== visitTypeFilter) return false;
        if (profTypeFilter !== "all" && r.professionalType !== profTypeFilter) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (docStatusFilter !== "all" && r.documentationStatus !== docStatusFilter) return false;
        if (assignmentFilter === "assigned" && !r.assignedProfessionalId) return false;
        if (assignmentFilter === "unassigned" && r.assignedProfessionalId) return false;

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
          const hay = `${r.id} ${r.clientName} ${r.clientId} ${r.serviceName} ${r.visitType} ${r.assignedProfessionalName || "unassigned"} ${r.programName}`.toLowerCase();
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
    agencyFilter,
    programFilter,
    clientFilter,
    serviceFilter,
    visitTypeFilter,
    profTypeFilter,
    statusFilter,
    docStatusFilter,
    assignmentFilter,
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
    setAgencyFilter("all");
    setProgramFilter("all");
    setClientFilter("all");
    setServiceFilter("all");
    setVisitTypeFilter("all");
    setProfTypeFilter("all");
    setStatusFilter("all");
    setDocStatusFilter("all");
    setAssignmentFilter("all");
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
              placeholder="Search Requirement ID, client, service, RN/supervisor..."
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
          </div>
        </div>

        {/* Multi-Facet Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <select
            aria-label="Filter by Agency"
            value={agencyFilter}
            onChange={(e) => {
              setAgencyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Agencies</option>
            {CLINICAL_AGENCIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Program"
            value={programFilter}
            onChange={(e) => {
              setProgramFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Programs</option>
            {CLINICAL_PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

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
            aria-label="Filter by Service"
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Services</option>
            {uniqueServices.map((s) => (
              <option key={s} value={s}>
                {s}
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
            aria-label="Filter by Professional Type"
            value={profTypeFilter}
            onChange={(e) => {
              setProfTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Professional Types</option>
            <option value="RN">RN</option>
            <option value="Clinical Supervisor">Clinical Supervisor</option>
            <option value="Field Supervisor">Field Supervisor</option>
            <option value="Qualified Non-RN Supervisor">Qualified Non-RN Supervisor</option>
          </select>

          <select
            aria-label="Filter by Requirement Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Requirement Statuses</option>
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

          <select
            aria-label="Filter by Documentation Status"
            value={docStatusFilter}
            onChange={(e) => {
              setDocStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Documentation Statuses</option>
            {(
              [
                "Not Started",
                "Pending",
                "Submitted",
                "Incomplete",
                "Correction Requested",
                "Complete",
              ] as DocumentationStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Assignment"
            value={assignmentFilter}
            onChange={(e) => {
              setAssignmentFilter(e.target.value as "all" | "assigned" | "unassigned");
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">Assigned &amp; Unassigned</option>
            <option value="assigned">Assigned Only</option>
            <option value="unassigned">Unassigned Only</option>
          </select>

          <select
            aria-label="Filter by Due Window"
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
        </div>
      </div>

      {/* Repository Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1180px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                <th className="py-3.5 px-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("id")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Requirement ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("clientName")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Client</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Agency / Program</th>
                <th className="py-3.5 px-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("serviceName")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Service</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Visit Type</th>
                <th className="py-3.5 px-3">Required Professional</th>
                <th className="py-3.5 px-3">Frequency</th>
                <th className="py-3.5 px-3">Last Completed</th>
                <th className="py-3.5 px-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("nextDueDate")}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer"
                  >
                    <span>Next Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Assigned Professional</th>
                <th className="py-3.5 px-3">Requirement Status</th>
                <th className="py-3.5 px-3">Documentation Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500">
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
                  const linkedVisit = visits.find((v) => v.id === req.activeVisitId);
                  const isSelected = selectedIds.includes(req.id);
                  return (
                    <tr
                      key={req.id}
                      onClick={() => router.push(getClinicalDetailHref(req.activeVisitId || req.id))}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => toggleRow(req.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#3D6B22]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 group-hover:text-[#3D6B22]">
                          {req.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap group-hover:text-[#3D6B22]">
                        {req.clientName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap truncate max-w-[175px]">
                        {req.programName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap truncate max-w-[155px]">
                        {req.serviceName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                        {req.visitType}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {req.professionalType}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {req.frequency}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {req.lastCompletedDate || "—"}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {req.nextDueDate}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {req.assignedProfessionalName ? (
                          <span className="font-medium text-slate-700">
                            {req.assignedProfessionalName}
                          </span>
                        ) : (
                          <span className="font-bold text-[#ff6900]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <RequirementStatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <DocumentationStatusBadge status={req.documentationStatus} />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {linkedVisit && !req.assignedProfessionalId && (
                            <button
                              type="button"
                              onClick={() => setAssignVisitTarget(linkedVisit)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3D6B22]/10 text-[#3D6B22] hover:bg-[#3D6B22]/20 text-[11px] font-bold cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                          )}
                          <Link
                            href={getClinicalDetailHref(req.activeVisitId || req.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
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

      <AssignProfessionalModal
        visit={assignVisitTarget}
        actor={actor}
        onClose={() => setAssignVisitTarget(null)}
      />
    </div>
  );
}
