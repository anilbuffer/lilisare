"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Flag, Plus } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { resolveClinicalActor } from "@/lib/admin/clinicalAuthGuard";
import {
  DEMO_TODAY,
  completeClinicalFollowUp,
  getClinicalDetailHref,
  getClinicalFollowUps,
  getClinicalVisits,
  getMockNotifications,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalFollowUp,
  ClinicalMockNotification,
  ClinicalVisit,
} from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import { ClinicalAvatarName, PriorityBadge } from "./ClinicalBadges";
import { CreateFollowUpModal } from "./ClinicalActionModals";
import { Pagination } from "@/components/ui/Pagination";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";

type SectionTab =
  | "all"
  | "overdue"
  | "upcoming"
  | "unassigned"
  | "missing_doc"
  | "pending_signoff"
  | "followup";

function calcDaysOverdue(dueDate: string): number {
  const due = new Date(`${dueDate}T12:00:00`).getTime();
  const today = new Date(`${DEMO_TODAY}T12:00:00`).getTime();
  const diff = Math.round((today - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function ClinicalOverdueWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section") as SectionTab | null;
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);

  const [visits, setVisits] = useState<ClinicalVisit[]>(() => getClinicalVisits());
  const [followUps, setFollowUps] = useState<ClinicalFollowUp[]>(() =>
    getClinicalFollowUps()
  );
  const [mockNotifs, setMockNotifs] = useState<ClinicalMockNotification[]>(() =>
    getMockNotifications()
  );
  const [activeSection, setActiveSection] = useState<SectionTab>(
    initialSection || "all"
  );
  const [pickFollowUpOpen, setPickFollowUpOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState<ClinicalVisit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection]);

  useEffect(() => {
    const load = () => {
      setVisits(getClinicalVisits());
      setFollowUps(getClinicalFollowUps());
      setMockNotifs(getMockNotifications());
    };
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const sectionPredicates = useMemo(() => {
    const isOverdue = (v: ClinicalVisit) =>
      v.visitStatus === "Missed" ||
      (v.dueDate < DEMO_TODAY &&
        v.visitStatus !== "Completed" &&
        v.visitStatus !== "Cancelled");
    const isUpcoming = (v: ClinicalVisit) =>
      v.dueDate >= DEMO_TODAY &&
      v.visitStatus !== "Completed" &&
      v.visitStatus !== "Cancelled";
    const isUnassigned = (v: ClinicalVisit) =>
      !v.professionalId && v.visitStatus !== "Cancelled";
    const isMissingDoc = (v: ClinicalVisit) =>
      (v.visitStatus === "Completed" &&
        (v.documentationStatus === "Pending" ||
          v.documentationStatus === "Incomplete" ||
          v.documentationStatus === "Not Started")) ||
      v.documentationStatus === "Correction Requested";
    const isPendingSignOff = (v: ClinicalVisit) =>
      v.visitStatus === "Completed" &&
      (v.reviewStatus === "Pending Review" ||
        v.reviewStatus === "Under Review" ||
        v.reviewStatus === "Returned for Correction");
    const isFollowUp = (v: ClinicalVisit) => v.followUpRequired;
    return {
      isOverdue,
      isUpcoming,
      isUnassigned,
      isMissingDoc,
      isPendingSignOff,
      isFollowUp,
    };
  }, []);

  const categorizedVisits = useMemo(() => {
    const {
      isOverdue,
      isUpcoming,
      isUnassigned,
      isMissingDoc,
      isPendingSignOff,
      isFollowUp,
    } = sectionPredicates;

    return visits.filter((v) => {
      if (v.visitStatus === "Cancelled") return false;
      if (activeSection === "overdue") return isOverdue(v);
      if (activeSection === "upcoming") return isUpcoming(v);
      if (activeSection === "unassigned") return isUnassigned(v);
      if (activeSection === "missing_doc") return isMissingDoc(v);
      if (activeSection === "pending_signoff") return isPendingSignOff(v);
      if (activeSection === "followup") return isFollowUp(v);
      return (
        isOverdue(v) ||
        isUnassigned(v) ||
        isMissingDoc(v) ||
        isPendingSignOff(v) ||
        isFollowUp(v) ||
        isUpcoming(v)
      );
    });
  }, [visits, activeSection, sectionPredicates]);

  const sections: DomainTabItem<SectionTab>[] = useMemo(() => {
    const activeVisits = visits.filter((v) => v.visitStatus !== "Cancelled");
    const {
      isOverdue,
      isUpcoming,
      isUnassigned,
      isMissingDoc,
      isPendingSignOff,
      isFollowUp,
    } = sectionPredicates;
    const allCount = activeVisits.filter(
      (v) =>
        isOverdue(v) ||
        isUnassigned(v) ||
        isMissingDoc(v) ||
        isPendingSignOff(v) ||
        isFollowUp(v) ||
        isUpcoming(v)
    ).length;

    return [
      { id: "all", label: "All Outstanding", badge: String(allCount), minWidth: 138 },
      {
        id: "overdue",
        label: "Overdue Visits",
        badge: String(activeVisits.filter(isOverdue).length),
        minWidth: 130,
      },
      {
        id: "upcoming",
        label: "Upcoming Due Dates",
        badge: String(activeVisits.filter(isUpcoming).length),
        minWidth: 158,
      },
      {
        id: "unassigned",
        label: "Unassigned Requirements",
        badge: String(activeVisits.filter(isUnassigned).length),
        minWidth: 185,
      },
      {
        id: "missing_doc",
        label: "Missing Documentation",
        badge: String(activeVisits.filter(isMissingDoc).length),
        minWidth: 175,
      },
      {
        id: "pending_signoff",
        label: "Pending Sign-off",
        badge: String(activeVisits.filter(isPendingSignOff).length),
        minWidth: 145,
      },
      {
        id: "followup",
        label: "Follow-up Required",
        badge: String(activeVisits.filter(isFollowUp).length),
        minWidth: 155,
      },
    ];
  }, [visits, sectionPredicates]);

  const handleCompleteFollowUp = (fuId: string) => {
    try {
      completeClinicalFollowUp(fuId, actor);
      toast.success("Operational follow-up marked complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete follow-up");
    }
  };

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="overdue" />

      {/* Section Tabs (Space-Aware Responsive Overflow Strip) */}
      <ResponsiveDomainTabStrip
        tabs={sections}
        activeTab={activeSection}
        onSelectTab={setActiveSection}
        ariaLabel="Overdue and follow-up filter sections"
        moreHeading="Resolution Queues"
      />

      {/* Standardized Clean Operational Resolution Table (6 Columns, Zero Horizontal Scroll) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Visit Requirement</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Responsible Professional</th>
                <th className="py-3.5 px-4">Timeliness</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {categorizedVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No overdue or outstanding items match this view.
                  </td>
                </tr>
              ) : (
                categorizedVisits
                  .slice(
                    (Math.min(currentPage, Math.max(1, Math.ceil(categorizedVisits.length / pageSize))) - 1) * pageSize,
                    Math.min(currentPage, Math.max(1, Math.ceil(categorizedVisits.length / pageSize))) * pageSize
                  )
                  .map((v) => {
                  const daysLate = calcDaysOverdue(v.dueDate);
                  return (
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
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {v.dueDate}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName name={v.professionalName} variant="staff" />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {daysLate > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#c2410c] border border-orange-200 font-bold text-[11px]">
                            <AlertCircle className="w-3 h-3 text-[#ff6900]" />
                            {daysLate}d overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[11px]">
                            On time
                          </span>
                        )}
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={getClinicalDetailHref(v.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#3D6B22] hover:border-[#3D6B22]/30 transition-colors"
                        >
                          <span>Resolve</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={Math.min(currentPage, Math.max(1, Math.ceil(categorizedVisits.length / pageSize)))}
          totalPages={Math.max(1, Math.ceil(categorizedVisits.length / pageSize))}
          totalItems={categorizedVisits.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          entryLabel="items"
        />
      </div>

      {/* Active Follow-up Tasks & Mock Notification Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Follow-up Tasks ({followUps.filter((f) => f.status !== "Completed").length})
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">
                Operational Ownership
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPickFollowUpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Follow-up</span>
            </button>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto thin-scrollbar">
            {followUps.map((fu) => (
              <div
                key={fu.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {fu.id}
                    </span>
                    <PriorityBadge priority={fu.priority} />
                    <span className="text-[11px] font-semibold text-slate-600">
                      {fu.followUpType}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      fu.status === "Completed"
                        ? "bg-emerald-50 text-[#008f5a] border-emerald-200"
                        : fu.status === "Escalated"
                          ? "bg-orange-50 text-[#c2410c] border-orange-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {fu.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {fu.clientName} ·{" "}
                  <Link
                    href={getClinicalDetailHref(fu.visitId)}
                    className="text-[#3D6B22] hover:underline font-mono"
                  >
                    {fu.visitId}
                  </Link>
                </div>
                <p className="text-xs text-slate-600">{fu.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">
                  <span className="text-slate-500">
                    Owner: <strong className="text-slate-700">{fu.assignedToName}</strong> · Due{" "}
                    {fu.dueDate}
                  </span>
                  {fu.status !== "Completed" && (
                    <button
                      type="button"
                      onClick={() => handleCompleteFollowUp(fu.id)}
                      className="inline-flex items-center gap-1 font-bold text-[#3D6B22] hover:underline cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulated Mock Reminder Log */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Simulated Reminder Log (Mock Only)
            </h3>
            <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
              No live SMS/Email sent
            </span>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto thin-scrollbar">
            {mockNotifs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Open any visit detail view and send a reminder to log a simulated notification here.
              </div>
            ) : (
              mockNotifs.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      To: {n.recipientName} ({n.clientName})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {n.sentAt}
                    </span>
                  </div>
                  <p className="text-slate-600">{n.message}</p>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Channel: {n.channel} · Logged by {n.sentBy}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pick Visit for Follow-up Modal */}
      <Modal
        isOpen={pickFollowUpOpen}
        onClose={() => setPickFollowUpOpen(false)}
        title="Add Operational Follow-up"
        description="Select a clinical or supervisory visit to attach an operational follow-up task."
        icon={<Flag className="w-5 h-5" />}
        maxWidth="lg"
      >
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto thin-scrollbar">
          {visits.filter((v) => v.visitStatus !== "Cancelled").length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No active clinical visits available.
            </p>
          ) : (
            visits
              .filter((v) => v.visitStatus !== "Cancelled")
              .map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-[#3D6B22]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900">
                      {v.clientName} · {v.visitType}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Due {v.dueDate} · {v.professionalName || "Unassigned"} · {v.visitStatus}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPickFollowUpOpen(false);
                      setFollowUpTarget(v);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#3D6B22] text-white text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))
          )}
        </div>
      </Modal>

      <CreateFollowUpModal
        visit={followUpTarget}
        actor={actor}
        onClose={() => setFollowUpTarget(null)}
      />
    </div>
  );
}
