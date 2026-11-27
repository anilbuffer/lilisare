"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, Info } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  CLINICAL_AGENCIES,
  CLINICAL_PROFESSIONALS,
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  exportClinicalCsv,
  getClinicalDetailHref,
  getClinicalFollowUps,
  getClinicalRequirements,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { ClinicalAvatarName } from "./ClinicalBadges";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";

type ReportId =
  | "completion"
  | "overdue"
  | "upcoming"
  | "workload"
  | "documentation"
  | "pending_review"
  | "service_wise"
  | "followup";

const REPORTS: DomainTabItem<ReportId>[] = [
  { id: "completion", label: "Visit Completion Report", minWidth: 165 },
  { id: "overdue", label: "Overdue Visit Report", minWidth: 150 },
  { id: "upcoming", label: "Upcoming Visit Requirements", minWidth: 185 },
  { id: "workload", label: "Professional Workload", minWidth: 155 },
  { id: "documentation", label: "Documentation Completion", minWidth: 175 },
  { id: "pending_review", label: "Pending Review Report", minWidth: 155 },
  { id: "service_wise", label: "Service-wise Requirement Report", minWidth: 205 },
  { id: "followup", label: "Follow-up and Escalation Report", minWidth: 195 },
];

const emptySubscribe = () => () => { };

export function ClinicalReportsWorkspace() {
  const router = useRouter();
  const [visits, setVisits] = useState(() => getClinicalVisits());
  const [reqs, setReqs] = useState(() => getClinicalRequirements());
  const [followUps, setFollowUps] = useState(() => getClinicalFollowUps());
  const [activeReport, setActiveReport] = useState<ReportId>("completion");
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Filters
  const [dateRange, setDateRange] = useState("Last 90 Days");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [profFilter, setProfFilter] = useState("all");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = () => {
      setVisits(getClinicalVisits());
      setReqs(getClinicalRequirements());
      setFollowUps(getClinicalFollowUps());
    };
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      if (agencyFilter !== "all" && v.agencyId !== agencyFilter) return false;
      if (programFilter !== "all" && v.programName !== programFilter) return false;
      if (serviceFilter !== "all" && v.serviceName !== serviceFilter) return false;
      if (profFilter !== "all" && v.professionalId !== profFilter) return false;
      if (visitTypeFilter !== "all" && v.visitType !== visitTypeFilter) return false;
      if (statusFilter !== "all" && v.visitStatus !== statusFilter) return false;
      return true;
    });
  }, [
    visits,
    agencyFilter,
    programFilter,
    serviceFilter,
    profFilter,
    visitTypeFilter,
    statusFilter,
  ]);

  // Visualizations derived from filtered mock records
  const completedVsOverdueData = useMemo(() => {
    const completed = filteredVisits.filter((v) => v.visitStatus === "Completed").length;
    const overdue = filteredVisits.filter(
      (v) => v.visitStatus === "Missed" || (v.dueDate < DEMO_TODAY && v.visitStatus !== "Completed")
    ).length;
    const scheduled = filteredVisits.filter(
      (v) => v.visitStatus === "Scheduled" || v.visitStatus === "Rescheduled"
    ).length;
    return [
      { category: "Completed", count: completed, fill: "#3e6b2b" },
      { category: "Scheduled", count: scheduled, fill: "#0F5E6E" },
      { category: "Overdue / Missed", count: overdue, fill: "#ff6900" },
    ];
  }, [filteredVisits]);

  const serviceDistributionData = useMemo(() => {
    const map = new Map<string, number>();
    filteredVisits.forEach((v) => {
      const short = v.serviceName.split("(")[0].trim();
      map.set(short, (map.get(short) || 0) + 1);
    });
    return Array.from(map.entries()).map(([service, count]) => ({
      service,
      count,
    }));
  }, [filteredVisits]);

  const docCompletionPie = useMemo(() => {
    const complete = filteredVisits.filter((v) => v.documentationStatus === "Complete").length;
    const submitted = filteredVisits.filter((v) => v.documentationStatus === "Submitted").length;
    const pendingOrInc = filteredVisits.filter(
      (v) =>
        v.documentationStatus === "Pending" ||
        v.documentationStatus === "Incomplete" ||
        v.documentationStatus === "Correction Requested"
    ).length;
    return [
      { name: "Complete", value: complete, color: "#00d084" },
      { name: "Submitted", value: submitted, color: "#3e6b2b" },
      { name: "Pending / Incomplete", value: pendingOrInc, color: "#ff6900" },
    ];
  }, [filteredVisits]);

  const reviewBreakdownData = useMemo(() => {
    const map = new Map<string, number>();
    filteredVisits.forEach((v) => {
      map.set(v.reviewStatus, (map.get(v.reviewStatus) || 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredVisits]);

  const monthlyTrendData = [
    { month: "Aug", completed: 12, overdue: 2 },
    { month: "Sep", completed: 15, overdue: 1 },
    { month: "Oct", completed: 18, overdue: 2 },
    {
      month: "Nov",
      completed: filteredVisits.filter((v) => v.visitStatus === "Completed").length,
      overdue: filteredVisits.filter((v) => v.visitStatus === "Missed" || v.dueDate < DEMO_TODAY).length,
    },
  ];

  // Active Report Table Rows (concise on-screen view + full CSV export rows)
  const reportData = useMemo((): {
    rows: { detailHref?: string; cells: Record<string, string | number> }[];
    exportRows: Record<string, string | number>[];
  } => {
    if (activeReport === "workload") {
      const items = CLINICAL_PROFESSIONALS.map((p) => {
        const assigned = filteredVisits.filter((v) => v.professionalId === p.id);
        const completed = assigned.filter((v) => v.visitStatus === "Completed").length;
        const pendingDoc = assigned.filter(
          (v) => v.documentationStatus === "Pending" || v.documentationStatus === "Incomplete"
        ).length;
        return {
          cells: {
            Professional: p.name,
            Qualification: p.qualificationType,
            "Assigned Visits": assigned.length,
            Completed: completed,
            Status: p.status,
          },
          exportRow: {
            Professional: p.name,
            Qualification: p.qualificationType,
            AssignedVisits: assigned.length,
            Completed: completed,
            PendingDoc: pendingDoc,
            Status: p.status,
          },
        };
      });
      return {
        rows: items.map((x) => ({ cells: x.cells })),
        exportRows: items.map((x) => x.exportRow),
      };
    }
    if (activeReport === "followup") {
      const items = followUps.map((f) => ({
        detailHref: getClinicalDetailHref(f.visitId),
        cells: {
          Client: f.clientName,
          "Follow-up Type": f.followUpType,
          Priority: f.priority,
          "Due Date": f.dueDate,
          Status: f.status,
        },
        exportRow: {
          FollowUpID: f.id,
          Client: f.clientName,
          VisitID: f.visitId,
          Type: f.followUpType,
          Priority: f.priority,
          Owner: f.assignedToName,
          DueDate: f.dueDate,
          Status: f.status,
        },
      }));
      return {
        rows: items.map((x) => ({ detailHref: x.detailHref, cells: x.cells })),
        exportRows: items.map((x) => x.exportRow),
      };
    }
    if (activeReport === "service_wise") {
      const items = serviceDistributionData.map((s) => ({
        cells: {
          Service: s.service,
          "Total Visits": s.count,
          "Active Requirements": reqs.filter((r) => r.serviceName.includes(s.service)).length,
        },
      }));
      return {
        rows: items.map((x) => ({ cells: x.cells })),
        exportRows: items.map((x) => x.cells),
      };
    }
    const subset = filteredVisits.filter((v) => {
      if (activeReport === "overdue")
        return v.visitStatus === "Missed" || (v.dueDate < DEMO_TODAY && v.visitStatus !== "Completed");
      if (activeReport === "upcoming")
        return v.dueDate >= DEMO_TODAY && v.visitStatus !== "Completed";
      if (activeReport === "documentation")
        return v.visitStatus === "Completed";
      if (activeReport === "pending_review")
        return v.reviewStatus !== "Approved" && v.reviewStatus !== "Not Required";
      return true;
    });
    const items = subset.map((v) => ({
      detailHref: getClinicalDetailHref(v.id),
      cells: {
        Client: v.clientName,
        "Visit Type": v.visitType,
        Professional: v.professionalName || "Unassigned",
        "Due Date": v.dueDate,
        Status:
          activeReport === "documentation"
            ? v.documentationStatus
            : activeReport === "pending_review"
              ? v.reviewStatus
              : v.visitStatus,
      },
      exportRow: {
        VisitID: v.id,
        Client: v.clientName,
        Service: v.serviceName,
        VisitType: v.visitType,
        Professional: v.professionalName || "Unassigned",
        DueDate: v.dueDate,
        VisitStatus: v.visitStatus,
        DocumentationStatus: v.documentationStatus,
        ReviewStatus: v.reviewStatus,
      },
    }));
    return {
      rows: items.map((x) => ({ detailHref: x.detailHref, cells: x.cells })),
      exportRows: items.map((x) => x.exportRow),
    };
  }, [activeReport, filteredVisits, followUps, reqs, serviceDistributionData]);

  const handleExportReport = () => {
    if (reportData.exportRows.length === 0) {
      toast.info("No rows to export for the current report filter.");
      return;
    }
    exportClinicalCsv(
      reportData.exportRows,
      `lilisare-clinical-${activeReport}-report.csv`
    );
    toast.success(`Exported ${reportData.exportRows.length} report rows to CSV`);
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="reports" onExport={handleExportReport} />

      {/* Mock Metrics Disclaimer */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#3D6B22] shrink-0" />
          <span>
            <strong>Mock Operational Data Notice:</strong> Charts and metrics below reflect simulated development records for workflow verification and are not live agency performance reports.
          </span>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3D6B22] text-white text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <select
          aria-label="Date Range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="Last 90 Days">Last 90 Days</option>
          <option value="Year to Date">Year to Date</option>
        </select>
        <select
          aria-label="Agency"
          value={agencyFilter}
          onChange={(e) => setAgencyFilter(e.target.value)}
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
          aria-label="Program"
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
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
          aria-label="Service"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="all">All Services</option>
          {Array.from(new Set(visits.map((v) => v.serviceName))).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Professional"
          value={profFilter}
          onChange={(e) => setProfFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="all">All Professionals</option>
          {CLINICAL_PROFESSIONALS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Visit Type"
          value={visitTypeFilter}
          onChange={(e) => setVisitTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="all">All Visit Types</option>
          {Array.from(new Set(visits.map((v) => v.visitType))).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Missed">Missed</option>
          <option value="Unscheduled">Unscheduled</option>
        </select>
      </div>

      {/* Report Selector Space-Aware Responsive Tab Strip */}
      <ResponsiveDomainTabStrip
        tabs={REPORTS}
        activeTab={activeReport}
        onSelectTab={setActiveReport}
        ariaLabel="Clinical and supervisory reports"
        moreHeading="Additional Reports"
      />

      {/* Visualizations Grid (5 core charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Completed vs. Overdue Visits &amp; Monthly Trend
          </h3>
          <div className="h-[220px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="completed" name="Completed" fill="#3e6b2b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="overdue" name="Overdue" fill="#ff6900" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Documentation Completion Rate &amp; Pending Review Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[220px]">
            {mounted && (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={docCompletionPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                    >
                      {docCompletionPie.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reviewBreakdownData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="status" type="category" width={95} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Visits" fill="#F2B632" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Service-wise & Snapshot Bar */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Service-wise Visit Distribution ({dateRange})
        </h3>
        <div className="h-[200px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="service" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="count" name="Clinical Visits" fill="#3e6b2b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Standardized Clean Underlying Report Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {REPORTS.find((r) => r.id === activeReport)?.label} ({reportData.rows.length} rows)
          </h3>
          <span className="text-[11px] text-slate-400">
            Completed vs Overdue snapshot: {completedVsOverdueData[0]?.count} /{" "}
            {completedVsOverdueData[2]?.count}
          </span>
        </div>
        <div className="overflow-x-auto">
          {reportData.rows.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No records match the active report filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {Object.keys(reportData.rows[0].cells).map((col) => (
                    <th key={col} className="py-3.5 px-4 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                  {reportData.rows.some((r) => Boolean(r.detailHref)) && (
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
                {reportData.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => {
                      if (row.detailHref) router.push(row.detailHref);
                    }}
                    className={`transition-colors ${
                      row.detailHref
                        ? "hover:bg-slate-50/80 cursor-pointer group"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {Object.entries(row.cells).map(([col, val], cIdx) => {
                      const strVal = String(val);
                      const isPersonCol = col === "Client" || col === "Professional";
                      return (
                        <td
                          key={col}
                          className={`py-3.5 px-4 whitespace-nowrap ${
                            !isPersonCol && cIdx === 0
                              ? "font-semibold text-slate-900 group-hover:text-[#3D6B22]"
                              : ""
                          }`}
                        >
                          {isPersonCol ? (
                            <ClinicalAvatarName
                              name={strVal}
                              variant={col === "Client" ? "client" : "staff"}
                              highlightHover={cIdx === 0}
                            />
                          ) : (
                            strVal
                          )}
                        </td>
                      );
                    })}
                    {reportData.rows.some((r) => Boolean(r.detailHref)) && (
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.detailHref && (
                          <Link
                            href={row.detailHref}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
