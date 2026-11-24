"use client";

import React, { useState } from "react";
import {
  DollarSign,
  CreditCard,
  Receipt,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  ArrowUpRight,
  Shield,
  FileText,
  X,
  Printer,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverPayDetailsTabProps {
  profile: AdminCaregiverProfile;
}

export function CaregiverPayDetailsTab({ profile }: CaregiverPayDetailsTabProps) {
  const payStubs = [
    {
      period: "Nov 01 – Nov 15, 2026",
      payDate: "Nov 20, 2026",
      grossPay: profile.payroll?.periodEarnings || "$1,368.00",
      hours: profile.payroll?.hours || 48,
      regularHours: profile.payroll?.regularHours || 40,
      overtimeHours: profile.payroll?.overtimeHours || 8,
      netPay: "$1,124.50",
      status: "Direct Deposited",
    },
    {
      period: "Oct 16 – Oct 31, 2026",
      payDate: "Nov 05, 2026",
      grossPay: "$1,140.00",
      hours: 40,
      regularHours: 40,
      overtimeHours: 0,
      netPay: "$942.20",
      status: "Direct Deposited",
    },
    {
      period: "Oct 01 – Oct 15, 2026",
      payDate: "Oct 20, 2026",
      grossPay: "$1,282.50",
      hours: 45,
      regularHours: 40,
      overtimeHours: 5,
      netPay: "$1,055.80",
      status: "Direct Deposited",
    },
  ];

  const [selectedPaystub, setSelectedPaystub] = useState<(typeof payStubs)[0] | null>(null);

  const handleDownloadPaystub = (stub: (typeof payStubs)[0]) => {
    // Generate text simulated download
    const element = document.createElement("a");
    const file = new Blob([`LiliSare Payroll Statement\nEmployee: ${profile.name}\nPay Period: ${stub.period}\nGross: ${stub.grossPay}\nNet: ${stub.netPay}\nDirect Deposit: Chase Bank •••• 4819`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `Paystub_${stub.payDate.replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded Paystub PDF statement for ${stub.period}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Key Payroll Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Base Hourly Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 ">
            {profile.payRate || "$28.50/hr"}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Standard clinical shift rate</p>
        </div>

        {/* Overtime Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overtime Rate (1.5x)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 ">
            {profile.overtimeRate || "$42.75/hr"}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Hours exceeding 40/week</p>
        </div>

        {/* Holiday Rate */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Holiday Differential</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 ">
            {profile.holidayRate || "$57.00/hr"}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Recognized state holidays</p>
        </div>

        {/* Direct Deposit */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Disbursement</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Direct Deposit</span>
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Chase Bank •••• 4819</p>
        </div>
      </div>

      {/* 02. Pay Period History Table */}
      <div className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bi-Weekly Paystub History & Remittances</h3>
            <p className="text-xs text-slate-500 font-medium">
              Tax withholdings, regular hours, overtime bonuses, and automated direct deposit confirmation
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-2xs">
            Next Pay Date: Dec 05, 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Pay Period</th>
                <th className="py-3 px-4">Pay Date</th>
                <th className="py-3 px-4">Regular Hrs</th>
                <th className="py-3 px-4">Overtime Hrs</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payStubs.map((stub, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#3D6B22]" />
                      <span>{stub.period}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{stub.payDate}</td>
                  <td className="py-3.5 px-4  text-slate-700">{stub.regularHours} hrs</td>
                  <td className="py-3.5 px-4  text-slate-700">{stub.overtimeHours} hrs</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 ">{stub.grossPay}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E5622] ">{stub.netPay}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {stub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPaystub(stub)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 03. Functional Paystub Detail View Modal */}
      {selectedPaystub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#3D6B22] flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Paystub Remittance Statement</h3>
                  <p className="text-xs text-slate-500 font-medium">Period: {selectedPaystub.period}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaystub(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Employee:</span>
                  <span className="font-bold text-slate-900">{profile.name} (#{profile.numericId || profile.id})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Disbursement Date:</span>
                  <span className="font-semibold text-slate-800">{selectedPaystub.payDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Regular Shift Hours:</span>
                  <span className=" text-slate-800">{selectedPaystub.regularHours} hrs @ {profile.payRate || "$28.50"}/hr</span>
                </div>
                {selectedPaystub.overtimeHours > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Overtime Hours (1.5x):</span>
                    <span className=" text-purple-700 font-semibold">{selectedPaystub.overtimeHours} hrs @ {profile.overtimeRate || "$42.75"}/hr</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-slate-700 font-bold">Gross Earnings:</span>
                  <span className=" font-bold text-slate-900">{selectedPaystub.grossPay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimated Taxes & FICA:</span>
                  <span className=" text-rose-600 font-semibold">-$243.50</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-slate-900 font-extrabold text-sm">Net Deposit Amount:</span>
                  <span className=" font-extrabold text-[#1E5622] text-sm">{selectedPaystub.netPay}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700">
                <span className="font-bold text-emerald-900 block mb-0.5">Automated Clearing House (ACH):</span>
                Direct Deposit routed to Chase Bank Checking (•••• 4819). Remitted automatically under agency EIN 84-2918201.
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleDownloadPaystub(selectedPaystub)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download PDF Statement</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaystub(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
