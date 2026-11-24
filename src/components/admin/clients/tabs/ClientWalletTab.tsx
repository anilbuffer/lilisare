"use client";

import React, { useState } from "react";
import {
  Wallet,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  Plus,
  Download,
  CheckCircle2,
  AlertCircle,
  Lock,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { ClientRecord, TransactionRecord } from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientWalletTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientWalletTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientWalletTabProps) {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isAutoPayModalOpen, setIsAutoPayModalOpen] = useState(false);

  const [fundsAmount, setFundsAmount] = useState<number>(250);
  const [fundsMethod, setFundsMethod] = useState("ACH Checking (Ending in 4091)");
  const [fundsMemo, setFundsMemo] = useState("Family Respite Reserve Credit");

  const wallet = client.wallet || {
    balance: 1450.00,
    escrowBalance: 500.00,
    monthlySpendCap: 2500.00,
    autoPayEnabled: true,
    paymentMethod: "ACH Checking (Ending in 4091)",
  };

  const [autoPayEnabled, setAutoPayEnabled] = useState(wallet.autoPayEnabled);
  const [monthlySpendCap, setMonthlySpendCap] = useState(wallet.monthlySpendCap);

  const canManageWallet = userRole === "admin" || userRole === "billing";

  const handleDepositFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundsAmount <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    const newTx: TransactionRecord = {
      id: `TX-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "Wallet Credit",
      description: fundsMemo || `Deposit via ${fundsMethod}`,
      amount: fundsAmount,
      status: "Paid",
      referenceNo: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    const updatedWallet = {
      ...wallet,
      balance: wallet.balance + fundsAmount,
    };

    const updated: ClientRecord = {
      ...client,
      wallet: updatedWallet,
      transactions: [newTx, ...(client.transactions || [])],
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsAddFundsOpen(false);
    toast.success(`Successfully deposited $${fundsAmount.toFixed(2)} to client wallet.`);
  };

  const handleSaveAutoPay = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedWallet = {
      ...wallet,
      autoPayEnabled,
      monthlySpendCap: Number(monthlySpendCap),
    };

    const updated: ClientRecord = {
      ...client,
      wallet: updatedWallet,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsAutoPayModalOpen(false);
    toast.success("Auto-pay and billing spend controls updated.");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Billing roles */}
      {!canManageWallet && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Account Ledger:</strong> Family private pay escrow and auto-pay methods are restricted to Billing & Finance.
            </span>
          </div>
          <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px] bg-amber-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Client Wallet & Private Pay Account
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> FDIC Insured Escrow
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Family escrow funds, private copay balances, and automatic billing payment methods
            </p>
          </div>
        </div>

        {canManageWallet && (
          <button
            type="button"
            onClick={() => setIsAddFundsOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Funds</span>
          </button>
        )}
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Available Wallet Balance
          </div>
          <div className="text-3xl font-extrabold text-[#3D6B22]">
            ${wallet.balance.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Available for copays, private respite hours, and specialized transport.
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Family Escrow Reserve
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ${wallet.escrowBalance.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Held in escrow per signed family agreement.
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Spend Cap
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ${wallet.monthlySpendCap.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Authorized threshold before family notification.
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {wallet.paymentMethod}
            </div>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
              <span>
                {wallet.autoPayEnabled
                  ? "Auto-Pay Active • Automatically debited on the 1st of each month"
                  : "Manual Invoicing Only • Auto-Pay Disabled"}
              </span>
            </div>
          </div>
        </div>

        {canManageWallet && (
          <button
            type="button"
            onClick={() => setIsAutoPayModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Manage Auto-Pay</span>
          </button>
        )}
      </div>

      {/* Add Funds Modal */}
      <Modal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        title="Add Funds to Client Wallet"
        icon={<DollarSign className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleDepositFunds} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Select Preset Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFundsAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${fundsAmount === amt
                    ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Custom Amount ($)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={fundsAmount}
              onChange={(e) => setFundsAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Payment Method
            </label>
            <select
              value={fundsMethod}
              onChange={(e) => setFundsMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] cursor-pointer"
            >
              <option value="ACH Checking (Ending in 4091)">ACH Checking (Ending in 4091)</option>
              <option value="Family Visa Card (Ending in 8821)">Family Visa Card (Ending in 8821)</option>
              <option value="Direct Wire / Escrow Transfer">Direct Wire / Escrow Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Deposit Memo / Purpose
            </label>
            <input
              type="text"
              value={fundsMemo}
              onChange={(e) => setFundsMemo(e.target.value)}
              placeholder="e.g. Authorized family deposit"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddFundsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Confirm Deposit</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* AutoPay Preferences Modal */}
      <Modal
        isOpen={isAutoPayModalOpen}
        onClose={() => setIsAutoPayModalOpen(false)}
        title="Manage Auto-Pay & Spend Controls"
        description="Configure automatic recurring copay deductions and monthly budget ceilings."
        icon={<Settings className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAutoPay} className="space-y-4">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPayEnabled}
              onChange={(e) => setAutoPayEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Enable Automatic Monthly Debit
              </span>
              <span className="text-[11px] text-slate-500">
                Debits balance automatically on the 1st of each calendar month.
              </span>
            </div>
          </label>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Monthly Spend Cap ($)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={monthlySpendCap}
              onChange={(e) => setMonthlySpendCap(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Triggers an instant admin notification before charging over this cap.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAutoPayModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
