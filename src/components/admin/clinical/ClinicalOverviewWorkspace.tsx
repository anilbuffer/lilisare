"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarClock,
  ClipboardCheck,
  FileWarning,
  Flame,
  History,
  Inbox,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CLINICAL_PROGRAMS,
  DEMO_TODAY,
  getClinicalAuditEvents,
  getClinicalDetailHref,
  getClinicalKpiSummary,
  getClinicalRequirements,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalAuditEvent,
  ClinicalRequirement,
  ClinicalVisit,
  PriorityLevel,
} from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import {
  ClinicalAvatarName,
  ClinicalVisitStatusBadge,
  PriorityBadge,
} from "./ClinicalBadges";

interface AttentionQueueItem {
  visitId: string;
  clientName: string;
  serviceName: string;
  visitType: string;
  dueDate: string;
  assignedProfessional: string;
  reason: string;
  priority: PriorityLevel;
  recommendedAction: string;
}

const emptySubscribe = () => () => { };

export function ClinicalOverviewWorkspace() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<ClinicalRequirement[]>(() =>
    getClinicalRequirements()
  );
  const [visits, setVisits] = useState<ClinicalVisit[]>(() => getClinicalVisits());
  const [auditEvents, setAuditEvents] = useState<ClinicalAuditEvent[]>(() =>
    getClinicalAuditEvents()
  );
  const [dateRange, setDateRange] = useState<"30d" | "90d" | "ytd">("30d");
  const [programFilter, setProgramFilter] = useState<string>("All Programs");
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const load = () => {
      setRequirements(getClinicalRequirements());
      setVisits(getClinicalVisits());
      setAuditEvents(getClinicalAuditEvents());
    };
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const kpi = useMemo(
    () => getClinicalKpiSummary(requirements, visits),
    [requirements, visits]
  );

  // Build prioritized Attention Required queue directly from live records
  const attentionQueue: AttentionQueueItem[] = useMemo(() => {
    const items: AttentionQueueItem[] = [];
    visits.forEach((v) => {
      if (v.visitStatus === "Cancelled") return;
      const isOverdue =
        v.visitStatus === "Missed" ||
        (v.dueDate < DEMO_TODAY && v.visitStatus !== "Completed");
      const isApproaching =
        !isOverdue &&
        v.visitStatus === "Unscheduled" &&
        v.dueDate >= DEMO_TODAY &&
        v.dueDate <= "2026-11-30";
      const isUnassigned = !v.professionalId;
      const isMissingDoc =
        v.visitStatus === "Completed" &&
        (v.documentationStatus === "Pending" ||
          v.documentationStatus === "Incomplete" ||
          v.documentationStatus === "Correction Requested" ||
          v.documentationStatus === "Not Started");
      const isPendingSignOff =
        v.reviewStatus === "Pending Review" ||
        v.reviewStatus === "Under Review" ||
        v.reviewStatus === "Returned for Correction";

      if (
        !isOverdue &&
        !isApproaching &&
        !isUnassigned &&
        !isMissingDoc &&
        !v.followUpRequired &&
        !(v.visitStatus === "Completed" && isPendingSignOff)
      ) {
        return;
      }

      let reason = "Follow-up required";
      let recommendedAction = "Open & Review";
      if (isUnassigned) {
        reason = "No eligible RN/supervisor assigned";
        recommendedAction = "Assign Professional";
      } else if (isOverdue) {
        reason = "Overdue visit requires urgent rescheduling";
        recommendedAction = "Reschedule Visit";
      } else if (v.documentationStatus === "Correction Requested") {
        reason = "Returned for correction & follow-up";
        recommendedAction = "Track Correction";
      } else if (isMissingDoc) {
        reason = `Missing / ${v.documentationStatus.toLowerCase()} visit documentation`;
        recommendedAction = "Request Documentation";
      } else if (v.visitStatus === "Completed" && isPendingSignOff) {
        reason = `Pending clinical review (${v.daysPendingReview}d)`;
        recommendedAction = "Route to Clinical Reviewer";
      } else if (isApproaching) {
        reason = "Due date approaching without scheduled slot";
        recommendedAction = "Schedule Visit";
      }

      items.push({
        visitId: v.id,
        clientName: v.clientName,
        serviceName: v.serviceName,
        visitType: v.visitType,
        dueDate: v.dueDate,
        assignedProfessional: v.professionalName || "Unassigned",
        reason,
        priority: v.priority,
        recommendedAction,
      });
    });

    const weight: Record<PriorityLevel, number> = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };
    return items.sort((a, b) => weight[b.priority] - weight[a.priority]).slice(0, 6);
  }, [visits]);

  // Upcoming clinical visits table
  const upcomingVisits = useMemo(() => {
    return visits
      .filter(
        (v) =>
          v.visitStatus === "Scheduled" ||
          v.visitStatus === "Rescheduled" ||
          v.visitStatus === "In Progress" ||
          (v.visitStatus === "Unscheduled" && v.dueDate >= DEMO_TODAY)
      )
      .sort((a, b) =>
        (a.scheduledDate || a.dueDate).localeCompare(b.scheduledDate || b.dueDate)
      )
      .slice(0, 6);
  }, [visits]);

  // Trend chart data (mock operational trends filtered by range & program)
  const chartData = useMemo(() => {
    const scale = programFilter === "All Programs" ? 1 : 0.45;
    const raw =
      dateRange === "30d"
        ? [
          { label: "Oct 30", completed: 14, overdue: 3, pendingDoc: 4 },
          { label: "Nov 05", completed: 18, overdue: 2, pendingDoc: 5 },
          { label: "Nov 11", completed: 21, overdue: 3, pendingDoc: 3 },
          { label: "Nov 17", completed: 24, overdue: 2, pendingDoc: 4 },
          { label: "Nov 22", completed: 22, overdue: 3, pendingDoc: 5 },
          { label: "Nov 26", completed: 26, overdue: kpi.overdueVisits, pendingDoc: kpi.pendingDocumentation },
        ]
        : dateRange === "90d"
          ? [
            { label: "Sep W1", completed: 38, overdue: 6, pendingDoc: 8 },
            { label: "Sep W3", completed: 44, overdue: 5, pendingDoc: 7 },
            { label: "Oct W1", completed: 49, overdue: 4, pendingDoc: 6 },
            { label: "Oct W3", completed: 53, overdue: 3, pendingDoc: 5 },
            { label: "Nov W1", completed: 58, overdue: 4, pendingDoc: 6 },
            { label: "Nov W4", completed: 62, overdue: kpi.overdueVisits, pendingDoc: kpi.pendingDocumentation },
          ]
          : [
            { label: "Q1", completed: 142, overdue: 12, pendingDoc: 18 },
            { label: "Q2", completed: 168, overdue: 9, pendingDoc: 14 },
            { label: "Q3", completed: 185, overdue: 7, pendingDoc: 11 },
            { label: "Q4 TD", completed: 152, overdue: kpi.overdueVisits, pendingDoc: kpi.pendingDocumentation },
          ];

    return raw.map((d) => ({
      ...d,
      completed: Math.max(1, Math.round(d.completed * scale)),
      overdue: Math.max(0, Math.round(d.overdue * scale)),
      pendingDoc: Math.max(0, Math.round(d.pendingDoc * scale)),
    }));
  }, [dateRange, programFilter, kpi.overdueVisits, kpi.pendingDocumentation]);

  const kpiCards = [
    {
      label: "Total Active Requirements",
      value: kpi.totalActiveRequirements,
      icon: ClipboardCheck,
      iconCls: "text-[#3D6B22] bg-[#3D6B22]/10 border-[#3D6B22]/20",
      href: "/admin/clinical/requirements/",
    },
    {
      label: "Upcoming Visits",
      value: kpi.upcomingVisits,
      icon: Calendar,
      iconCls: "text-sky-700 bg-sky-50 border-sky-200/80",
      href: "/admin/clinical/schedule/",
    },
    {
      label: "Due This Month",
      value: kpi.dueThisMonth,
      icon: CalendarClock,
      iconCls: "text-amber-800 bg-amber-50 border-amber-200/80",
      href: "/admin/clinical/requirements/?filter=due_month",
    },
    {
      label: "Overdue Visits",
      value: kpi.overdueVisits,
      icon: AlertCircle,
      iconCls: "text-[#ff6900] bg-orange-50 border-orange-200/80",
      href: "/admin/clinical/overdue/?section=overdue",
    },
    {
      label: "Pending Documentation",
      value: kpi.pendingDocumentation,
      icon: FileWarning,
      iconCls: "text-amber-700 bg-amber-50 border-amber-200/80",
      href: "/admin/clinical/review/?category=pending_doc",
    },
    {
      label: "Pending Clinical Review",
      value: kpi.pendingClinicalReview,
      icon: Inbox,
      iconCls: "text-purple-700 bg-purple-50 border-purple-200/80",
      href: "/admin/clinical/review/?category=pending_review",
    },
  ];

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-6 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="overview" />

      {/* 1. Six Clickable KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-snug">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${card.iconCls}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-[#3D6B22] transition-colors">
                  {card.value}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#3D6B22] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. Attention Required Operational Queue */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff6900]/10 border border-[#ff6900]/20 flex items-center justify-center text-[#ff6900] shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Attention Required
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Prioritized overdue visits, unassigned requirements, missing documentation &amp; pending sign-offs
              </p>
            </div>
          </div>
          <Link
            href="/admin/clinical/overdue/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/20 border border-[#3D6B22]/20 rounded-xl transition-all self-start sm:self-auto"
          >
            <span>Open Full Resolution Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Visit Type</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {attentionQueue.map((item) => (
                <tr
                  key={item.visitId}
                  onClick={() => router.push(getClinicalDetailHref(item.visitId))}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ClinicalAvatarName
                      name={item.clientName}
                      variant="client"
                      highlightHover
                    />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap truncate max-w-[200px]">
                    {item.visitType}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                    {item.dueDate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={getClinicalDetailHref(item.visitId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                    >
                      <span>{item.recommendedAction}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Upcoming Clinical & Supervisory Visits */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upcoming Clinical &amp; Supervisory Visits
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Appointments synchronized with the master Scheduling module
              </p>
            </div>
          </div>

          <Link
            href="/admin/clinical/schedule/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all self-start sm:self-auto"
          >
            <span>Open Clinical Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Visit Type</th>
                <th className="py-3.5 px-4">Assigned Professional</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {upcomingVisits.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => router.push(getClinicalDetailHref(v.id))}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ClinicalAvatarName
                      name={v.clientName}
                      variant="client"
                      highlightHover
                    />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap truncate max-w-[190px]">
                    {v.visitType}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ClinicalAvatarName name={v.professionalName} variant="staff" />
                  </td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    {v.scheduledAt || `Due ${v.dueDate}`}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ClinicalVisitStatusBadge status={v.visitStatus} />
                  </td>
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={getClinicalDetailHref(v.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Clinical Activity Trend Chart + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Clinical Activity Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22] shrink-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Clinical Activity
                </h3>
                <p className="text-xs text-slate-500">
                  Mock operational oversight trend by range &amp; program
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter trend by program"
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] max-w-[180px]"
              >
                <option value="All Programs">All Programs</option>
                {CLINICAL_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(["30d", "90d", "ytd"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDateRange(r)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${dateRange === r
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    {r === "30d" ? "30d" : r === "90d" ? "90d" : "YTD"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[280px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clinCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3e6b2b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3e6b2b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clinOverdue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6900" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ff6900" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clinPendingDoc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F2B632" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F2B632" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: "8px", fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Visits Completed"
                    stroke="#3e6b2b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#clinCompleted)"
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue"
                    name="Visits Overdue"
                    stroke="#ff6900"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#clinOverdue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pendingDoc"
                    name="Pending Documentation"
                    stroke="#F2B632"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#clinPendingDoc)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-[280px] rounded-xl bg-slate-50 animate-pulse" />
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Recent Activity
                </h3>
              </div>
              <Link
                href="/admin/clinical/audit/"
                className="text-xs font-bold text-[#3D6B22] hover:underline"
              >
                Full Audit
              </Link>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 thin-scrollbar">
              {auditEvents.slice(0, 7).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#3D6B22] font-mono">
                      {evt.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {evt.timestamp}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {evt.relatedClientName}
                    {evt.relatedVisitId && (
                      <Link
                        href={getClinicalDetailHref(evt.relatedVisitId)}
                        className="ml-1.5 font-mono text-[11px] text-[#3D6B22] hover:underline"
                      >
                        ({evt.relatedVisitId})
                      </Link>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {evt.reason}
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 pt-0.5">
                    <History className="w-3 h-3" />
                    <span>
                      {evt.performedBy} · {evt.performedByRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
