"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Lock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";

interface ClientTransactionsTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
}

export function ClientTransactionsTab({ client, userRole = "admin" }: ClientTransactionsTabProps) {
  const [filterType, setFilterType] = useState<string>("All");
  const transactions = client.transactions || [];
  const canManageFinancials = userRole === "admin" || userRole === "billing";

  const filtered = transactions.filter(
    (t) => filterType === "All" || t.type === filterType
  );

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error("No transactions to export.");
      return;
    }

    const headers = ["Date", "Reference No", "Type", "Description", "Amount", "Status"];
    const rows = filtered.map((tx) => [
      `"${tx.date}"`,
      `"${tx.referenceNo}"`,
      `"${tx.type}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount.toFixed(2),
      `"${tx.status}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `client_${client.id}_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Transaction ledger CSV exported successfully.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Billing roles */}
      {!canManageFinancials && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Read-Only Transaction History:</strong> Direct adjustments and claim rebilling are restricted to the Billing department.
            </span>
          </div>
          <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] bg-slate-200 px-2.5 py-0.5 rounded-full">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Financial Transactions Ledger
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Reconciled
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Complete history of claims submitted, private pay payments, and account deposits
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Ledger Table Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Audit-Ready Ledger Entries
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Filtered by transaction category
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {["All", "Claim Payer", "Private Pay Invoice", "Wallet Credit"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterType(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === cat
                    ? "bg-[#3D6B22] text-white shadow-2xs font-bold"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Date</th>
                <th className="pb-3.5">Reference #</th>
                <th className="pb-3.5">Transaction Type</th>
                <th className="pb-3.5">Description</th>
                <th className="pb-3.5">Amount</th>
                <th className="pb-3.5 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 pl-2 font-medium text-slate-700">
                    {tx.date}
                  </td>
                  <td className="py-4 font-mono text-slate-600 font-semibold">
                    {tx.referenceNo}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 text-slate-900 font-medium">
                    {tx.description}
                  </td>
                  <td className="py-4 font-bold text-slate-900 text-sm">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-4 text-right pr-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === "Paid" || tx.status === "Reconciled"
                          ? "bg-emerald-50 text-[#3D6B22] border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
