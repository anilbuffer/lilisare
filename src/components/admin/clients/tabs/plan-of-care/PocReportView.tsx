"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Download,
  Printer,
  RefreshCw,
  ChevronDown,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  Trash2,
  Calendar,
  Filter,
} from "lucide-react";
import { PocReportEntry, PocReportStatus } from "@/types/client";
import { Modal } from "@/components/ui/Modal";
import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormButtonPrimary,
  FormButtonSecondary,
} from "@/components/ui/FormControls";
import { toast } from "sonner";

interface PocReportViewProps {
  reports: PocReportEntry[];
  clientName: string;
  canEdit: boolean;
  onUpdateReports: (updated: PocReportEntry[]) => void;
}

const FAX_WORKFLOW_STATUSES: Array<{
  value: PocReportStatus;
  label: string;
  badgeClass: string;
}> = [
  {
    value: "Clinician Signed",
    label: "Clinician Signed",
    badgeClass: "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/25",
  },
  {
    value: "Sent to Practitioner",
    label: "Sent to Practitioner",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    value: "Returned Unsigned",
    label: "Returned Unsigned",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    value: "Returned Signed",
    label: "Returned Signed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "Error",
    label: "Error",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
];

function getReportStatusBadge(status: PocReportStatus): string {
  switch (status) {
    case "Reviewer Accepted":
    case "Returned Signed":
    case "Clinician Signed":
      return "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/25";
    case "Sent to Practitioner":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Fax Pending":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Returned Unsigned":
    case "Error":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function PocReportView({
  reports,
  clientName,
  canEdit,
  onUpdateReports,
}: PocReportViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [practitionerFilter, setPractitionerFilter] = useState("All");
  const [clinicianFilter, setClinicianFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Active row for Certification & Fax Workflow Modal
  const [editingReport, setEditingReport] = useState<PocReportEntry | null>(null);
  const [draftStatus, setDraftStatus] = useState<PocReportStatus>("Sent to Practitioner");
  const [draftSentDate, setDraftSentDate] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [draftSendManually, setDraftSendManually] = useState(false);

  const practitioners = useMemo(
    () => Array.from(new Set(reports.map((r) => r.practitioner))),
    [reports]
  );
  const clinicians = useMemo(
    () => Array.from(new Set(reports.map((r) => r.clinician))),
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (practitionerFilter !== "All" && r.practitioner !== practitionerFilter) return false;
      if (clinicianFilter !== "All" && r.clinician !== clinicianFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.clientName.toLowerCase().includes(q) ||
          r.practitioner.toLowerCase().includes(q) ||
          r.clinician.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          (r.note || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, practitionerFilter, clinicianFilter, statusFilter, searchQuery]);

  const openStatusEditor = (entry: PocReportEntry) => {
    setEditingReport(entry);
    setDraftStatus(entry.status);
    setDraftSentDate(entry.sentDate || "");
    setDraftNote(entry.note || "");
    setDraftSendManually(Boolean(entry.sendManually));
  };

  const handleSaveStatusUpdate = (mode: "save" | "resend" | "fax") => {
    if (!editingReport) return;
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yyyy = now.getFullYear();
    const todayStr = `${mm}/${dd}/${yyyy}`;

    const nextStatus: PocReportStatus =
      mode === "fax" || mode === "resend" ? "Sent to Practitioner" : draftStatus;

    const updated = reports.map((r) =>
      r.id === editingReport.id
        ? {
            ...r,
            status: nextStatus,
            sentDate: draftSentDate || todayStr,
            note: draftNote,
            sendManually: draftSendManually,
            modifiedBy: "Agency Admin",
            modifiedDate: todayStr,
          }
        : r
    );
    onUpdateReports(updated);
    setEditingReport(null);
    toast.success(
      mode === "fax"
        ? `Fax dispatched to ${editingReport.practitioner}`
        : mode === "resend"
        ? `Certification packet resent to ${editingReport.practitioner}`
        : `Certification status updated to ${nextStatus}`
    );
  };

  return (
    <div className="space-y-4">
      {/* LiliSare Certification & Fax Header Bar */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Certification Cycles & Practitioner Fax Tracking
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              CMS 485 60-day certification windows, physician signature routing, and fax audit log for{" "}
              <span className="font-semibold text-slate-700">{clientName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => toast.success("Exported Plan of Care Certification CSV.")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Clean LiliSare Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practitioner, clinician..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={practitionerFilter}
              onChange={(e) => setPractitionerFilter(e.target.value)}
              aria-label="Filter by practitioner"
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="All">Practitioner: All</option>
              {practitioners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative">
            <select
              value={clinicianFilter}
              onChange={(e) => setClinicianFilter(e.target.value)}
              aria-label="Filter by clinician"
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="All">Clinician: All</option>
              {clinicians.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by certification status"
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Reviewer Accepted">Reviewer Accepted</option>
              <option value="Fax Pending">Fax Pending</option>
              <option value="Clinician Signed">Clinician Signed</option>
              <option value="Sent to Practitioner">Sent to Practitioner</option>
              <option value="Returned Unsigned">Returned Unsigned</option>
              <option value="Returned Signed">Returned Signed</option>
              <option value="Error">Error</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Desktop Table (Clean single-line front columns matching LiliSare Agency Admin tables) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Cert. Start</th>
                <th className="px-4 py-3.5">Cert. End</th>
                <th className="px-4 py-3.5">Practitioner</th>
                <th className="px-4 py-3.5">Clinician</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Modified By</th>
                <th className="px-4 py-3.5">Updated</th>
                <th className="px-4 py-3.5 text-right">Fax / Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReports.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                    {row.certStart}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                    {row.certEnd}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium whitespace-nowrap">
                    {row.practitioner}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.clinician}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openStatusEditor(row)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:shadow-2xs cursor-pointer ${getReportStatusBadge(
                        row.status
                      )}`}
                    >
                      <span>{row.status}</span>
                      <ChevronDown className="w-3 h-3 opacity-70" />
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.modifiedBy}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {row.modifiedDate}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openStatusEditor(row)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 hover:bg-[#3D6B22]/15 border border-[#3D6B22]/20 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Manage Fax</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:hidden">
        {filteredReports.map((row) => (
          <div
            key={row.id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-slate-900">{row.practitioner}</div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {row.clinician}
                </div>
              </div>
              <button
                type="button"
                onClick={() => openStatusEditor(row)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer shrink-0 ${getReportStatusBadge(
                  row.status
                )}`}
              >
                <span>{row.status}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Cert. Start
                </span>
                <span className="font-semibold text-slate-800">{row.certStart}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Cert. End
                </span>
                <span className="font-semibold text-slate-800">{row.certEnd}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Modified By
                </span>
                <span className="text-slate-700">{row.modifiedBy}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Updated
                </span>
                <span className="text-slate-700">{row.modifiedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-500 truncate flex-1">
                {row.note || "No clinical notes attached"}
              </span>
              <button
                type="button"
                onClick={() => openStatusEditor(row)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 border border-[#3D6B22]/20 cursor-pointer shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Manage Fax</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certification & Fax Dispatch Modal */}
      <Modal
        isOpen={Boolean(editingReport)}
        onClose={() => setEditingReport(null)}
        title="Certification Status & Fax Dispatch"
        description={
          editingReport
            ? `${editingReport.clientName} • ${editingReport.certStart} – ${editingReport.certEnd}`
            : ""
        }
        icon={<FileCheck2 className="w-5 h-5" />}
        maxWidth="md"
      >
        {editingReport && (
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Certification Workflow Status</FormLabel>
              <div className="space-y-1.5">
                {FAX_WORKFLOW_STATUSES.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      draftStatus === opt.value
                        ? "border-[#3D6B22] bg-[#3D6B22]/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="poc-status"
                      checked={draftStatus === opt.value}
                      disabled={!canEdit}
                      onChange={() => setDraftStatus(opt.value)}
                      className="accent-[#3D6B22] w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${opt.badgeClass}`}
                    >
                      {opt.value === "Returned Unsigned" && (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {opt.value === "Returned Signed" && <CheckCircle2 className="w-3 h-3" />}
                      {opt.value === "Sent to Practitioner" && <Send className="w-3 h-3" />}
                      {opt.value === "Error" && <Trash2 className="w-3 h-3" />}
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">Practitioner Fax Details</div>
              <div className="text-xs text-slate-600">
                Recipient:{" "}
                <strong className="text-slate-800">
                  {editingReport.practitioner} • {editingReport.practitionerFax || "1-541-555-8821"}
                </strong>
              </div>
              <div className="text-xs text-slate-600">
                Last Sent:{" "}
                <strong className="text-slate-800">
                  {editingReport.sentDate || "Not yet dispatched"}
                </strong>
              </div>
            </div>

            <div>
              <FormLabel>Sent Date</FormLabel>
              <FormInput
                type="date"
                disabled={!canEdit}
                value={draftSentDate}
                onChange={(e) => setDraftSentDate(e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>

            <div>
              <FormLabel>Administrative / Fax Note</FormLabel>
              <FormTextarea
                rows={3}
                disabled={!canEdit}
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Leave any notes here..."
              />
            </div>

            {canEdit && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <FormButtonSecondary
                  type="button"
                  onClick={() => handleSaveStatusUpdate("resend")}
                  className="px-3 py-2 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend</span>
                </FormButtonSecondary>

                <div className="flex items-center gap-2.5">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftSendManually}
                      onChange={(e) => setDraftSendManually(e.target.checked)}
                      className="accent-[#3D6B22] rounded cursor-pointer"
                    />
                    <span>Send Manually</span>
                  </label>

                  <FormButtonSecondary
                    type="button"
                    onClick={() => handleSaveStatusUpdate("fax")}
                    className="px-3 py-2 text-xs"
                  >
                    Fax
                  </FormButtonSecondary>

                  <FormButtonPrimary
                    type="button"
                    onClick={() => handleSaveStatusUpdate("save")}
                    className="px-4 py-2 text-xs"
                  >
                    Save
                  </FormButtonPrimary>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
