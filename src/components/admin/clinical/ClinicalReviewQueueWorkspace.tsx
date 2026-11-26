"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  FileWarning,
  Flag,
  Lock,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import {
  FormButtonCancel,
  FormButtonPrimary,
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
  CLINICAL_PROFESSIONALS,
  assignClinicalReviewer,
  completeClinicalSignOff,
  getClinicalDetailHref,
  getClinicalDocumentationList,
  getClinicalReviews,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import {
  ClinicalDocumentation,
  ClinicalReview,
  ClinicalVisit,
} from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import {
  ClinicalReviewStatusBadge,
  DocumentationStatusBadge,
} from "./ClinicalBadges";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";
import {
  CreateFollowUpModal,
  RequestDocumentationModal,
} from "./ClinicalActionModals";

type QueueCategory =
  | "all"
  | "pending_doc"
  | "pending_rn"
  | "pending_supervisor"
  | "follow_up"
  | "returned";

export function ClinicalReviewQueueWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category");
  const { currentUser } = useAuth();
  const actor = useMemo(() => resolveClinicalActor(currentUser), [currentUser]);
  const canSignOff = checkClinicalPermission(actor, "CLINICAL_SIGN_OFF").allowed;

  const [visits, setVisits] = useState<ClinicalVisit[]>(() => getClinicalVisits());
  const [docs, setDocs] = useState<ClinicalDocumentation[]>(() =>
    getClinicalDocumentationList()
  );
  const [reviews, setReviews] = useState<ClinicalReview[]>(() =>
    getClinicalReviews()
  );

  const [category, setCategory] = useState<QueueCategory>(() => {
    if (initialCat === "pending_doc") return "pending_doc";
    if (initialCat === "pending_review") return "pending_rn";
    return "all";
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Action Modals
  const [assignReviewerTarget, setAssignReviewerTarget] = useState<ClinicalVisit | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState("PROF-RN-01");
  const [reqDocTarget, setReqDocTarget] = useState<ClinicalVisit | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<ClinicalVisit | null>(null);
  const [signOffTarget, setSignOffTarget] = useState<ClinicalVisit | null>(null);
  const [signOffComment, setSignOffComment] = useState("");

  useEffect(() => {
    const load = () => {
      setVisits(getClinicalVisits());
      setDocs(getClinicalDocumentationList());
      setReviews(getClinicalReviews());
    };
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

  const clinicalSigners = useMemo(
    () => CLINICAL_PROFESSIONALS.filter((p) => p.canPerformClinicalSignOff),
    []
  );

  const inScopeVisits = useMemo(
    () =>
      visits.filter((v) => {
        if (v.visitStatus === "Cancelled") return false;
        return (
          v.documentationStatus !== "Complete" ||
          (v.reviewStatus !== "Approved" && v.reviewStatus !== "Not Required")
        );
      }),
    [visits]
  );

  const queueRecords = useMemo(() => {
    return inScopeVisits
      .filter((v) => {
        if (category === "pending_doc") {
          return (
            v.documentationStatus === "Pending" ||
            v.documentationStatus === "Incomplete" ||
            v.documentationStatus === "Not Started"
          );
        }
        if (category === "pending_rn") {
          return (
            v.professionalQualification === "RN" &&
            (v.reviewStatus === "Pending Review" || v.reviewStatus === "Under Review")
          );
        }
        if (category === "pending_supervisor") {
          return (
            v.professionalQualification !== "RN" &&
            (v.reviewStatus === "Pending Review" ||
              v.reviewStatus === "Under Review" ||
              v.reviewStatus === "Follow-up Required")
          );
        }
        if (category === "follow_up") {
          return v.followUpRequired || v.reviewStatus === "Follow-up Required";
        }
        if (category === "returned") {
          return (
            v.reviewStatus === "Returned for Correction" ||
            v.documentationStatus === "Correction Requested"
          );
        }
        return true;
      })
      .filter((v) => {
        if (!searchTerm.trim()) return true;
        const t = searchTerm.toLowerCase();
        return `${v.id} ${v.clientName} ${v.serviceName} ${v.visitType} ${v.professionalName || ""}`
          .toLowerCase()
          .includes(t);
      })
      .sort((a, b) => {
        // Priority: 1. Overdue reviews, 2. Clinical follow-up required, 3. Missing doc, 4. Long-pending
        const score = (x: ClinicalVisit) => {
          let s = x.daysPendingReview * 10;
          if (x.reviewStatus === "Returned for Correction") s += 200;
          if (x.followUpRequired) s += 150;
          if (x.documentationStatus === "Incomplete" || x.documentationStatus === "Pending")
            s += 100;
          return s;
        };
        return score(b) - score(a);
      });
  }, [inScopeVisits, category, searchTerm]);

  const handleAssignReviewerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignReviewerTarget || !selectedReviewerId) return;
    try {
      assignClinicalReviewer(assignReviewerTarget.id, selectedReviewerId, actor);
      toast.success(`Clinical reviewer assigned for ${assignReviewerTarget.id}`);
      setAssignReviewerTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign reviewer");
    }
  };

  const handleSignOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signOffTarget) return;
    try {
      completeClinicalSignOff(signOffTarget.id, signOffComment, actor);
      toast.success(`Clinical sign-off completed for ${signOffTarget.id}`);
      setSignOffTarget(null);
      setSignOffComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-off blocked");
    }
  };

  const categories: DomainTabItem<QueueCategory>[] = useMemo(
    () => [
      { id: "all", label: "All Queue", badge: String(inScopeVisits.length), minWidth: 112 },
      {
        id: "pending_doc",
        label: "Pending Documentation",
        badge: String(
          inScopeVisits.filter(
            (v) =>
              v.documentationStatus === "Pending" ||
              v.documentationStatus === "Incomplete" ||
              v.documentationStatus === "Not Started"
          ).length
        ),
        minWidth: 178,
      },
      {
        id: "pending_rn",
        label: "Pending RN Review",
        badge: String(
          inScopeVisits.filter(
            (v) =>
              v.professionalQualification === "RN" &&
              (v.reviewStatus === "Pending Review" || v.reviewStatus === "Under Review")
          ).length
        ),
        minWidth: 158,
      },
      {
        id: "pending_supervisor",
        label: "Pending Supervisor Review",
        badge: String(
          inScopeVisits.filter(
            (v) =>
              v.professionalQualification !== "RN" &&
              (v.reviewStatus === "Pending Review" ||
                v.reviewStatus === "Under Review" ||
                v.reviewStatus === "Follow-up Required")
          ).length
        ),
        minWidth: 196,
      },
      {
        id: "follow_up",
        label: "Follow-up Required",
        badge: String(
          inScopeVisits.filter(
            (v) => v.followUpRequired || v.reviewStatus === "Follow-up Required"
          ).length
        ),
        minWidth: 155,
      },
      {
        id: "returned",
        label: "Returned for Correction",
        badge: String(
          inScopeVisits.filter(
            (v) =>
              v.reviewStatus === "Returned for Correction" ||
              v.documentationStatus === "Correction Requested"
          ).length
        ),
        minWidth: 180,
      },
    ],
    [inScopeVisits]
  );

  return (
    <div className="w-full max-w-9xl mx-auto min-w-0 space-y-5 animate-in fade-in duration-300 pb-10">
      <ClinicalSubNav activeTab="review" />

      {/* Governance Permission Boundary Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900">
              Clinical Sign-Off Governance Boundary:
            </span>{" "}
            <span className="text-slate-600">
              Agency Admin monitors operational completeness, assigns eligible reviewers, requests missing documentation, and escalates delays. Professional clinical approval &amp; sign-off remain strictly restricted to authorised RN / Clinical Supervisor roles.
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 self-start sm:self-auto ${
            canSignOff
              ? "bg-emerald-50 text-[#008f5a] border-emerald-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {canSignOff ? "Clinical Sign-Off Enabled" : "Operational Oversight Only"}
        </span>
      </div>

      {/* Category Space-Aware Overflow Tab Strip */}
      <ResponsiveDomainTabStrip
        tabs={categories}
        activeTab={category}
        onSelectTab={setCategory}
        ariaLabel="Review queue categories"
        moreHeading="Review Queues"
      />

      {/* Search Bar */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Visit ID, client, service, performing clinician..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          />
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1140px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Visit ID</th>
                <th className="py-3.5 px-3">Client</th>
                <th className="py-3.5 px-3">Service</th>
                <th className="py-3.5 px-3">Visit Type</th>
                <th className="py-3.5 px-3">Performing Professional</th>
                <th className="py-3.5 px-3">Visit Date</th>
                <th className="py-3.5 px-3">Submitted Date</th>
                <th className="py-3.5 px-3">Documentation Status</th>
                <th className="py-3.5 px-3">Review Status</th>
                <th className="py-3.5 px-3">Assigned Reviewer</th>
                <th className="py-3.5 px-3">Days Pending</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {queueRecords.map((v) => {
                const doc = docs.find((d) => d.visitId === v.id);
                const rev = reviews.find((r) => r.visitId === v.id);
                return (
                  <tr
                    key={v.id}
                    onClick={() => router.push(getClinicalDetailHref(v.id))}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {v.id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {v.clientName}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap truncate max-w-[150px]">
                      {v.serviceName}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {v.visitType}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {v.professionalName || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {v.scheduledDate || v.dueDate}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {doc?.submittedAt || "Not Submitted"}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <DocumentationStatusBadge status={v.documentationStatus} />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <ClinicalReviewStatusBadge status={v.reviewStatus} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {rev?.reviewerName || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          v.daysPendingReview >= 5
                            ? "text-[#ff6900]"
                            : v.daysPendingReview > 0
                              ? "text-amber-700"
                              : "text-slate-500"
                        }`}
                      >
                        {v.daysPendingReview}d
                      </span>
                    </td>
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={getClinicalDetailHref(v.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Open</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReviewerId(rev?.reviewerId || clinicalSigners[0]?.id || "");
                            setAssignReviewerTarget(v);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Reviewer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReqDocTarget(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold text-amber-800 cursor-pointer"
                          title="Request missing documentation"
                        >
                          <FileWarning className="w-3 h-3" />
                          <span>Req Doc</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEscalateTarget(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[11px] font-semibold text-[#c2410c] cursor-pointer"
                          title="Escalate or add follow-up"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Escalate</span>
                        </button>
                        {canSignOff && (
                          <button
                            type="button"
                            onClick={() => setSignOffTarget(v)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3D6B22] hover:bg-[#345C1D] text-white text-[11px] font-bold cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sign Off</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Clinical Reviewer Modal */}
      <Modal
        isOpen={Boolean(assignReviewerTarget)}
        onClose={() => setAssignReviewerTarget(null)}
        title="Assign Clinical Reviewer"
        description={
          assignReviewerTarget
            ? `${assignReviewerTarget.clientName} • ${assignReviewerTarget.id}`
            : undefined
        }
        icon={<ShieldCheck className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleAssignReviewerSubmit} className="space-y-4">
          <div>
            <FormLabel required>Authorised Clinical Reviewer (RN)</FormLabel>
            <FormSelect
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
            >
              {clinicalSigners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.roleTitle} · {p.licenseNumber})
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setAssignReviewerTarget(null)} />
            <FormButtonPrimary type="submit">Assign Reviewer</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      {/* Authorised RN Sign-off Modal (only accessible when role is CLINICAL_SUPERVISOR_RN) */}
      <Modal
        isOpen={Boolean(signOffTarget)}
        onClose={() => setSignOffTarget(null)}
        title="Professional Clinical Sign-Off"
        description={
          signOffTarget
            ? `${signOffTarget.clientName} • ${signOffTarget.visitType}`
            : undefined
        }
        icon={<CheckCircle2 className="w-5 h-5" />}
        maxWidth="md"
      >
        <form onSubmit={handleSignOffSubmit} className="space-y-4">
          <div>
            <FormLabel>Clinical Review Comments</FormLabel>
            <FormTextarea
              rows={3}
              value={signOffComment}
              onChange={(e) => setSignOffComment(e.target.value)}
              placeholder="Document professional sign-off verification..."
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <FormButtonCancel onClick={() => setSignOffTarget(null)} />
            <FormButtonPrimary type="submit">Complete Clinical Sign-Off</FormButtonPrimary>
          </div>
        </form>
      </Modal>

      <RequestDocumentationModal
        visit={reqDocTarget}
        actor={actor}
        onClose={() => setReqDocTarget(null)}
      />

      <CreateFollowUpModal
        visit={escalateTarget}
        actor={actor}
        defaultEscalate
        onClose={() => setEscalateTarget(null)}
      />
    </div>
  );
}
