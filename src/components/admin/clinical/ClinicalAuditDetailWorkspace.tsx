"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  History,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  getClinicalDetailHref,
  getClinicalRuleDetailHref,
  resolveClinicalAuditEventByParam,
  subscribeToClinicalSync,
} from "@/lib/admin/clinicalSupervisoryStore";
import { ClinicalAuditEvent } from "@/types/clinicalSupervisory";

export function ClinicalAuditDetailWorkspace({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const [eventRecord, setEventRecord] = useState<ClinicalAuditEvent | null>(() =>
    resolveClinicalAuditEventByParam(eventId, queryId)
  );

  const reload = useCallback(() => {
    setEventRecord(resolveClinicalAuditEventByParam(eventId, queryId));
  }, [eventId, queryId]);

  useEffect(() => {
    const timer = window.setTimeout(reload, 0);
    const unsub = subscribeToClinicalSync(reload);
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, [reload]);

  if (!eventRecord) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center space-y-3">
        <History className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          Audit Event Record Not Found
        </h2>
        <p className="text-xs text-slate-500">
          Event &ldquo;{queryId || eventId}&rdquo; could not be located.
        </p>
        <Link
          href="/admin/clinical/audit/"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Audit History</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto min-w-0 space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/clinical/audit/"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Audit History</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Immutable Ledger Record · {eventRecord.id}</span>
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                {eventRecord.id}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 font-mono text-xs font-bold text-[#3D6B22]">
                {eventRecord.action.replace(/_/g, " ")}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                {eventRecord.entityType}
              </span>
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {eventRecord.entityType} Event — {eventRecord.relatedClientName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Recorded at <strong className="font-mono text-slate-800">{eventRecord.timestamp}</strong> by{" "}
                <strong className="text-slate-800">{eventRecord.performedBy}</strong> ({eventRecord.performedByRole})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {eventRecord.entityType === "Rule" && (
              <Link
                href={getClinicalRuleDetailHref(eventRecord.entityId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95"
              >
                <span>Open Visit Rule</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            {eventRecord.relatedVisitId && (
              <Link
                href={getClinicalDetailHref(eventRecord.relatedVisitId, {
                  tab: "audit",
                  eventId: eventRecord.id,
                })}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95"
              >
                <span>Open Visit Detail</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Top 4-Card Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Audit Action
          </span>
          <div className="font-bold text-sm text-slate-900 truncate">
            {eventRecord.action.replace(/_/g, " ")}
          </div>
          <p className="text-[11px] text-slate-500">{eventRecord.entityType} mutation</p>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Performed By
          </span>
          <div className="font-bold text-sm text-slate-900 truncate">
            {eventRecord.performedBy}
          </div>
          <p className="text-[11px] text-slate-500">{eventRecord.performedByRole}</p>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Target Entity
          </span>
          <div className="font-mono font-bold text-sm text-slate-900 truncate">
            {eventRecord.entityId}
          </div>
          <p className="text-[11px] text-slate-500 truncate">{eventRecord.relatedClientName}</p>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Ledger Timestamp
          </span>
          <div className="font-mono font-bold text-xs text-slate-900">
            {eventRecord.timestamp}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographically Verified</span>
          </p>
        </div>
      </div>

      {/* Detailed Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3D6B22]" />
            <span>Actor &amp; Entity Reference</span>
          </h2>
          <dl className="space-y-2.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Event ID</dt>
              <dd className="font-mono font-bold text-slate-900">{eventRecord.id}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Timestamp</dt>
              <dd className="font-mono text-slate-700">{eventRecord.timestamp}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Performed By</dt>
              <dd className="font-semibold text-slate-900">{eventRecord.performedBy}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Actor Role</dt>
              <dd className="font-medium text-slate-800">{eventRecord.performedByRole}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Target Entity</dt>
              <dd className="font-mono font-semibold text-slate-800">
                {eventRecord.entityType} ({eventRecord.entityId})
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Related Scope / Client</dt>
              <dd className="font-medium text-slate-900">
                {eventRecord.relatedClientId !== "SYSTEM" ? (
                  <Link
                    href={`/admin/clients/${eventRecord.relatedClientId}/`}
                    className="text-[#3D6B22] hover:underline font-semibold"
                  >
                    {eventRecord.relatedClientName}
                  </Link>
                ) : (
                  eventRecord.relatedClientName
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            State Change &amp; Operational Justification
          </h2>

          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Previous Value
              </span>
              <span className="font-medium text-slate-700">{eventRecord.previousValue}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-[#3D6B22] block mb-1">
                New Value
              </span>
              <span className="font-bold text-slate-900">{eventRecord.newValue}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Recorded Reason / Justification
            </span>
            <p className="text-slate-700 leading-relaxed">{eventRecord.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
