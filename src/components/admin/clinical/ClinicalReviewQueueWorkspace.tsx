"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Lock, RotateCcw, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  checkClinicalPermission,
  resolveClinicalActor,
} from "@/lib/admin/clinicalAuthGuard";
import {
  getClinicalDetailHref,
  getClinicalReviews,
  getClinicalVisits,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalReview, ClinicalVisit } from "@/types/clinicalSupervisory";
import { ClinicalSubNav } from "./ClinicalSubNav";
import {
  ClinicalAvatarName,
  ClinicalReviewStatusBadge,
  DocumentationStatusBadge,
} from "./ClinicalBadges";
import {
  ResponsiveDomainTabStrip,
  DomainTabItem,
} from "@/components/ui/ResponsiveDomainTabStrip";

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
  const [reviews, setReviews] = useState<ClinicalReview[]>(() =>
    getClinicalReviews()
  );

  const [category, setCategory] = useState<QueueCategory>(() => {
    if (initialCat === "pending_doc") return "pending_doc";
    if (initialCat === "pending_review") return "pending_rn";
    return "all";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [docStatusFilter, setDocStatusFilter] = useState("all");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");

  useEffect(() => {
    const load = () => {
      setVisits(getClinicalVisits());
      setReviews(getClinicalReviews());
    };
    const timer = window.setTimeout(load, 0);
    const unsub = subscribeToClinicalSync(load);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);

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
        if (docStatusFilter !== "all" && v.documentationStatus !== docStatusFilter) return false;
        if (reviewStatusFilter !== "all" && v.reviewStatus !== reviewStatusFilter) return false;
        if (!searchTerm.trim()) return true;
        const t = searchTerm.toLowerCase();
        return `${v.id} ${v.clientName} ${v.serviceName} ${v.visitType} ${v.professionalName || ""}`
          .toLowerCase()
          .includes(t);
      })
      .sort((a, b) => {
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
  }, [inScopeVisits, category, docStatusFilter, reviewStatusFilter, searchTerm]);

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
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 text-[#3D6B22] flex items-center justify-center shrink-0">
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

      {/* Search & Column-Aligned Filters */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client, visit type, reviewer..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by Documentation"
            value={docStatusFilter}
            onChange={(e) => setDocStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Documentation</option>
            <option value="Not Started">Not Started</option>
            <option value="Pending">Pending</option>
            <option value="Submitted">Submitted</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Correction Requested">Correction Requested</option>
            <option value="Complete">Complete</option>
          </select>
          <select
            aria-label="Filter by Review Status"
            value={reviewStatusFilter}
            onChange={(e) => setReviewStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Review Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Returned for Correction">Returned for Correction</option>
            <option value="Follow-up Required">Follow-up Required</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setDocStatusFilter("all");
              setReviewStatusFilter("all");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Standardized Clean Review Queue Table (6 Columns, Zero Horizontal Scroll) */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Visit Type</th>
                <th className="py-3.5 px-4">Assigned Reviewer</th>
                <th className="py-3.5 px-4">Documentation</th>
                <th className="py-3.5 px-4">Review Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px] text-slate-700">
              {queueRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No records currently match this review queue filter.
                  </td>
                </tr>
              ) : (
                queueRecords.map((v) => {
                  const rev = reviews.find((r) => r.visitId === v.id);
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalAvatarName
                          name={rev?.reviewerName}
                          variant="staff"
                          fallbackVariant="muted"
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DocumentationStatusBadge status={v.documentationStatus} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ClinicalReviewStatusBadge status={v.reviewStatus} />
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
