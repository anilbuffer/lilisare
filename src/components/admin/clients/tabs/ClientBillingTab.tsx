"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Lock,
  ArrowUpDown,
  History,
  Plus,
  X,
} from "lucide-react";
import {
  AssignedServiceItem,
  BillingAuthorization,
  BillingPayer,
  BillRateAdjustmentItem,
  ClientBillingConfig,
  ClientRecord,
  MaxHoursVisitItem,
  PaymentResponsibilityItem,
} from "@/types/client";
import { PortalRole } from "../AdminClientDetailView";
import { toast } from "sonner";
import { getClientsFromStorage, saveClientsToStorage } from "@/lib/clients/mockData";
import { FormInput, FormLabel, FormSelect } from "@/components/ui/FormControls";
import {
  CLIENT_CLASS_OPTIONS,
  formatShortDate,
  getInitialBillingConfig,
} from "./billing/billingDefaults";
import { AuthorizationModal } from "./billing/AuthorizationModal";
import {
  AssignedServiceModal,
  BillRateAdjustmentModal,
  EligibilityHistoryModal,
  MaxHoursModal,
  PayerModal,
  PaymentResponsibilityModal,
} from "./billing/BillingSectionModals";

interface ClientBillingTabProps {
  client: ClientRecord;
  userRole?: PortalRole;
  onUpdateClient?: (updated: ClientRecord) => void;
}

const CARD_CLASS =
  "bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4";

const PRIMARY_BTN_CLASS =
  "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0";

const SECONDARY_BTN_CLASS =
  "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer shrink-0";

function SectionHelp({ title }: { title: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center text-slate-400 hover:text-slate-600 cursor-help"
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </span>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs sm:text-[13px] font-medium text-slate-700">
        {label}
      </span>
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          } ${checked ? "bg-[#3D6B22]" : "bg-slate-300"}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
              checked ? "translate-x-4.5" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-xs font-medium text-slate-600 w-6">
          {checked ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );
}

export function ClientBillingTab({
  client,
  userRole = "admin",
  onUpdateClient,
}: ClientBillingTabProps) {
  const canManageBilling = userRole === "admin" || userRole === "billing";
  const [billing, setBilling] = useState<ClientBillingConfig>(() =>
    getInitialBillingConfig(client)
  );

  useEffect(() => {
    setBilling(getInitialBillingConfig(client));
  }, [client.id]);

  // Authorizations toolbar state
  const [showAuthSearch, setShowAuthSearch] = useState(false);
  const [authSearchQuery, setAuthSearchQuery] = useState("");
  const [showExpiredAuths, setShowExpiredAuths] = useState(false);
  const [authSortAsc, setAuthSortAsc] = useState(true);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const [authDropdownSearch, setAuthDropdownSearch] = useState("");

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingAuth, setEditingAuth] = useState<BillingAuthorization | null>(
    null
  );
  const [newAuthType, setNewAuthType] = useState<
    "Per-Service Time" | "Shared Time"
  >("Per-Service Time");

  const [isPayerModalOpen, setIsPayerModalOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<BillingPayer | null>(null);
  const [isEligHistoryOpen, setIsEligHistoryOpen] = useState(false);

  const [isPayRespModalOpen, setIsPayRespModalOpen] = useState(false);
  const [editingPayResp, setEditingPayResp] =
    useState<PaymentResponsibilityItem | null>(null);

  const [isAssignedSvcModalOpen, setIsAssignedSvcModalOpen] = useState(false);
  const [editingAssignedSvc, setEditingAssignedSvc] =
    useState<AssignedServiceItem | null>(null);

  const [isMaxHoursModalOpen, setIsMaxHoursModalOpen] = useState(false);
  const [editingMaxHours, setEditingMaxHours] =
    useState<MaxHoursVisitItem | null>(null);

  const [isRateAdjModalOpen, setIsRateAdjModalOpen] = useState(false);
  const [editingRateAdj, setEditingRateAdj] =
    useState<BillRateAdjustmentItem | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAuthDropdownOpen(false);
      }
    };
    if (isAuthDropdownOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isAuthDropdownOpen]);

  const persistBilling = (nextBilling: ClientBillingConfig) => {
    setBilling(nextBilling);

    const firstAuth = nextBilling.authorizations[0];
    const firstSvc = firstAuth?.services[0];
    const updatedClient: ClientRecord = {
      ...client,
      billingConfig: nextBilling,
      authorization: firstAuth
        ? {
            ...client.authorization,
            authNumber: firstAuth.authNumber,
            payer: firstAuth.payerName,
            startDate: firstSvc?.startDate || client.authorization.startDate,
            expiryDate: firstSvc?.endDate || client.authorization.expiryDate,
          }
        : client.authorization,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updatedClient);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updatedClient;
      saveClientsToStorage(all);
    }
  };

  const updateBillingInfo = <K extends keyof ClientBillingConfig["billingInfo"]>(
    key: K,
    value: ClientBillingConfig["billingInfo"][K]
  ) => {
    if (!canManageBilling) return;
    persistBilling({
      ...billing,
      billingInfo: {
        ...billing.billingInfo,
        [key]: value,
      },
    });
  };

  /* Payer handlers */
  const handleSavePayer = (payer: BillingPayer) => {
    const exists = billing.payers.some((p) => p.id === payer.id);
    const nextPayers = exists
      ? billing.payers.map((p) => (p.id === payer.id ? payer : p))
      : [...billing.payers, payer];
    persistBilling({ ...billing, payers: nextPayers });
    setIsPayerModalOpen(false);
    setEditingPayer(null);
    toast.success(exists ? "Payer updated." : "Payer added.");
  };

  const handleDeletePayer = (payer: BillingPayer) => {
    persistBilling({
      ...billing,
      payers: billing.payers.filter((p) => p.id !== payer.id),
    });
    toast.success(`Removed payer "${payer.name}".`);
  };

  const handleCheckEligibility = (payer: BillingPayer) => {
    const todayShort = formatShortDate(new Date().toISOString().slice(0, 10));
    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const nextPayers = billing.payers.map((p) =>
      p.id === payer.id
        ? {
            ...p,
            eligibilityStatus: "Verified" as const,
            verificationDate: todayShort,
          }
        : p
    );
    const nextHistory = [
      {
        id: `ELIG-${Date.now()}`,
        payerName: payer.name,
        checkedAt: timestamp,
        status: "Verified" as const,
        checkedBy: "Agency Admin",
      },
      ...billing.eligibilityHistory,
    ];
    persistBilling({
      ...billing,
      payers: nextPayers,
      eligibilityHistory: nextHistory,
    });
    toast.success(`Eligibility verified for ${payer.name}.`);
  };

  /* Authorization handlers */
  const openNewAuthorization = (type: "Per-Service Time" | "Shared Time") => {
    setNewAuthType(type);
    setEditingAuth(null);
    setIsAuthDropdownOpen(false);
    setAuthDropdownSearch("");
    setIsAuthModalOpen(true);
  };

  const openEditAuthorization = (auth: BillingAuthorization) => {
    setEditingAuth(auth);
    setNewAuthType(auth.authType);
    setIsAuthModalOpen(true);
  };

  const handleSaveAuthorization = (saved: BillingAuthorization) => {
    const exists = billing.authorizations.some((a) => a.id === saved.id);
    const nextAuths = exists
      ? billing.authorizations.map((a) => (a.id === saved.id ? saved : a))
      : [saved, ...billing.authorizations];
    persistBilling({ ...billing, authorizations: nextAuths });
    setIsAuthModalOpen(false);
    setEditingAuth(null);
    toast.success(
      exists ? "Authorization updated." : "New authorization saved."
    );
  };

  const handleDeleteAuthorization = (auth: BillingAuthorization) => {
    persistBilling({
      ...billing,
      authorizations: billing.authorizations.filter((a) => a.id !== auth.id),
    });
    toast.success(`Authorization #${auth.authNumber} deleted.`);
  };

  /* Payment Responsibility handlers */
  const handleSavePaymentResp = (item: PaymentResponsibilityItem) => {
    const exists = billing.paymentResponsibilities.some((p) => p.id === item.id);
    const next = exists
      ? billing.paymentResponsibilities.map((p) => (p.id === item.id ? item : p))
      : [...billing.paymentResponsibilities, item];
    persistBilling({ ...billing, paymentResponsibilities: next });
    setIsPayRespModalOpen(false);
    setEditingPayResp(null);
    toast.success(
      exists ? "Payment responsibility updated." : "Payment responsibility added."
    );
  };

  /* Assigned Services handlers */
  const handleSaveAssignedService = (item: AssignedServiceItem) => {
    const exists = billing.assignedServices.some((s) => s.id === item.id);
    const next = exists
      ? billing.assignedServices.map((s) => (s.id === item.id ? item : s))
      : [...billing.assignedServices, item];
    persistBilling({ ...billing, assignedServices: next });
    setIsAssignedSvcModalOpen(false);
    setEditingAssignedSvc(null);
    toast.success(
      exists ? "Assigned service updated." : "Assigned service added."
    );
  };

  /* Max Hours & Visits handlers */
  const handleSaveMaxHours = (item: MaxHoursVisitItem) => {
    const exists = billing.maxHoursAndVisits.some((m) => m.id === item.id);
    const next = exists
      ? billing.maxHoursAndVisits.map((m) => (m.id === item.id ? item : m))
      : [...billing.maxHoursAndVisits, item];
    persistBilling({ ...billing, maxHoursAndVisits: next });
    setIsMaxHoursModalOpen(false);
    setEditingMaxHours(null);
    toast.success(
      exists
        ? "Max hours and visits rule updated."
        : "Max hours and visits rule added."
    );
  };

  /* Bill Rate Adjustment handlers */
  const handleSaveRateAdjustment = (item: BillRateAdjustmentItem) => {
    const exists = billing.billRateAdjustments.some((r) => r.id === item.id);
    const next = exists
      ? billing.billRateAdjustments.map((r) => (r.id === item.id ? item : r))
      : [...billing.billRateAdjustments, item];
    persistBilling({ ...billing, billRateAdjustments: next });
    setIsRateAdjModalOpen(false);
    setEditingRateAdj(null);
    toast.success(
      exists ? "Bill rate adjustment updated." : "Bill rate adjustment added."
    );
  };

  /* Filtered & sorted Authorizations */
  const visibleAuthorizations = billing.authorizations
    .map((auth) => {
      const filteredLines = auth.services.filter((line) => {
        if (!showExpiredAuths && line.status === "Expired") return false;
        if (!authSearchQuery.trim()) return true;
        const q = authSearchQuery.toLowerCase();
        return (
          auth.authNumber.toLowerCase().includes(q) ||
          auth.payerName.toLowerCase().includes(q) ||
          line.code.toLowerCase().includes(q) ||
          line.description.toLowerCase().includes(q)
        );
      });
      return { ...auth, services: filteredLines };
    })
    .filter((auth) => {
      if (auth.services.length > 0) return true;
      if (!authSearchQuery.trim()) return showExpiredAuths || auth.services.length > 0;
      const q = authSearchQuery.toLowerCase();
      return (
        auth.authNumber.toLowerCase().includes(q) ||
        auth.payerName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aDate = a.services[0]?.startDate || "";
      const bDate = b.services[0]?.startDate || "";
      return authSortAsc
        ? aDate.localeCompare(bDate)
        : bDate.localeCompare(aDate);
    });

  const authTypeOptions = [
    {
      label: "Per-Service Time Authorization",
      type: "Per-Service Time" as const,
      isNew: false,
    },
    {
      label: "Shared Time Authorization",
      type: "Shared Time" as const,
      isNew: true,
    },
  ].filter((opt) =>
    opt.label.toLowerCase().includes(authDropdownSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Role Notice Banner for Non-Billing roles */}
      {!canManageBilling && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Read-Only Financial View:</strong> Payer authorizations and
              billing rates are managed exclusively by the Billing &amp;
              Accounting team.
            </span>
          </div>
          <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px] bg-amber-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto shrink-0">
            {userRole.toUpperCase()} VIEW
          </span>
        </div>
      )}

      {/* 1. Billing Information */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Billing Information
              </h3>
              <SectionHelp title="Client billing classification, cycle, invoice preferences, and service authorization scope." />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Core billing classification, invoice rules, and service scope
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <FormLabel>Client Class</FormLabel>
              <FormSelect
                disabled={!canManageBilling}
                value={billing.billingInfo.clientClass}
                onChange={(e) =>
                  updateBillingInfo("clientClass", e.target.value)
                }
              >
                {CLIENT_CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <FormLabel>Billing Cycle</FormLabel>
              <FormSelect
                disabled={!canManageBilling}
                value={billing.billingInfo.billingCycle}
                onChange={(e) =>
                  updateBillingInfo(
                    "billingCycle",
                    e.target.value as ClientBillingConfig["billingInfo"]["billingCycle"]
                  )
                }
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Semi-Monthly">Semi-Monthly</option>
                <option value="Monthly">Monthly</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel>Insurance Policy Number</FormLabel>
              <FormInput
                disabled={!canManageBilling}
                value={billing.billingInfo.insurancePolicyNumber}
                onChange={(e) =>
                  updateBillingInfo("insurancePolicyNumber", e.target.value)
                }
                placeholder="Insurance Policy Number"
              />
            </div>

            <div>
              <FormLabel>Billing Notes</FormLabel>
              <textarea
                rows={3}
                disabled={!canManageBilling}
                value={billing.billingInfo.billingNotes}
                onChange={(e) =>
                  updateBillingInfo("billingNotes", e.target.value)
                }
                placeholder="Billing Notes"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl px-4 py-2">
              <ToggleRow
                label="Bill Client"
                checked={billing.billingInfo.billClient}
                disabled={!canManageBilling}
                onChange={(v) => updateBillingInfo("billClient", v)}
              />
              <ToggleRow
                label="Bill overtime rates"
                checked={billing.billingInfo.billOvertimeRates}
                disabled={!canManageBilling}
                onChange={(v) => updateBillingInfo("billOvertimeRates", v)}
              />
              <ToggleRow
                label="Bill holiday rates"
                checked={billing.billingInfo.billHolidayRates}
                disabled={!canManageBilling}
                onChange={(v) => updateBillingInfo("billHolidayRates", v)}
              />
              <ToggleRow
                label="Pay Caregiver"
                checked={billing.billingInfo.payCaregiver}
                disabled={!canManageBilling}
                onChange={(v) => updateBillingInfo("payCaregiver", v)}
              />
              <ToggleRow
                label="HIPAA information Release Signed"
                checked={billing.billingInfo.hipaaReleaseSigned}
                disabled={!canManageBilling}
                onChange={(v) => updateBillingInfo("hipaaReleaseSigned", v)}
              />
              <ToggleRow
                label="Use mTU on calendar"
                checked={billing.billingInfo.useMtuOnCalendar}
                disabled={!canManageBilling}
                onChange={(v) => updateBillingInfo("useMtuOnCalendar", v)}
              />
            </div>

            <div>
              <FormLabel>
                <span className="inline-flex items-center gap-1.5">
                  <span>Include Total Amount Due On Split Invoices</span>
                  <SectionHelp title="Controls whether split invoices display the combined total due." />
                </span>
              </FormLabel>
              <FormSelect
                disabled={!canManageBilling}
                value={billing.billingInfo.includeTotalOnSplitInvoices}
                onChange={(e) =>
                  updateBillingInfo(
                    "includeTotalOnSplitInvoices",
                    e.target.value as ClientBillingConfig["billingInfo"]["includeTotalOnSplitInvoices"]
                  )
                }
              >
                <option value="System Default (No)">System Default (No)</option>
                <option value="System Default (Yes)">System Default (Yes)</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </FormSelect>
            </div>

            <div className="pt-1">
              <span className="text-[12px] font-semibold text-[#3D6B22] block mb-1.5">
                Services
              </span>
              <div className="flex flex-wrap items-center gap-5">
                {(
                  ["All", "Authorized Only", "Authorized + Assigned"] as const
                ).map((option) => (
                  <label
                    key={option}
                    className={`inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-700 ${
                      canManageBilling ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`services-filter-${client.id}`}
                      disabled={!canManageBilling}
                      checked={billing.billingInfo.servicesFilter === option}
                      onChange={() => updateBillingInfo("servicesFilter", option)}
                      className="accent-[#3D6B22] w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payers */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Payers
              </h3>
              <SectionHelp title="Insurance and waiver payers linked to this client." />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active and historical insurance payers with real-time eligibility status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEligHistoryOpen(true)}
              className={SECONDARY_BTN_CLASS}
            >
              <History className="w-3.5 h-3.5" />
              <span>Eligibility History</span>
            </button>
            {canManageBilling && (
              <button
                type="button"
                onClick={() => {
                  setEditingPayer(null);
                  setIsPayerModalOpen(true);
                }}
                className={PRIMARY_BTN_CLASS}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Payer</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Name</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5">Requires Auth.</th>
                <th className="pb-3.5">Eligibility Status</th>
                <th className="pb-3.5">Verification Date</th>
                <th className="pb-3.5">Default Fax</th>
                <th className="pb-3.5">Contact</th>
                <th className="pb-3.5">Location</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billing.payers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No payers configured for this client.
                  </td>
                </tr>
              ) : (
                billing.payers.map((payer) => (
                  <tr
                    key={payer.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-semibold text-slate-900 whitespace-nowrap">
                      {payer.name}
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          payer.status === "Active"
                            ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            payer.status === "Active"
                              ? "bg-[#3D6B22]"
                              : "bg-slate-400"
                          }`}
                        />
                        {payer.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700 whitespace-nowrap">
                      {payer.requiresAuth ? "Yes" : "No"}
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          payer.eligibilityStatus === "Verified"
                            ? "bg-[#3D6B22]/10 text-[#3D6B22] border-[#3D6B22]/20"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {payer.eligibilityStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {payer.verificationDate || "—"}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {payer.defaultFax || "—"}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {payer.contact || "—"}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {payer.location || "—"}
                    </td>
                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      {canManageBilling && (
                        <div className="inline-flex items-center gap-2 text-[#3D6B22] font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPayer(payer);
                              setIsPayerModalOpen(true);
                            }}
                            className="hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleDeletePayer(payer)}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleCheckEligibility(payer)}
                            className="hover:underline cursor-pointer"
                          >
                            Check Eligibility
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Authorizations */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Authorizations
                </h3>
                <SectionHelp title="Prior authorizations and authorized service time caps." />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Service-level and shared-time prior authorizations
              </p>
            </div>

            {showAuthSearch ? (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={authSearchQuery}
                  onChange={(e) => setAuthSearchQuery(e.target.value)}
                  placeholder="Search Auth #, Payer, Code..."
                  className="pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#3D6B22] w-56"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAuthSearchQuery("");
                    setShowAuthSearch(false);
                  }}
                  title="Clear search"
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthSearch(true)}
                className={SECONDARY_BTN_CLASS}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none shadow-2xs">
              <input
                type="checkbox"
                checked={showExpiredAuths}
                onChange={(e) => setShowExpiredAuths(e.target.checked)}
                className="accent-[#3D6B22] rounded"
              />
              <span>Show expired</span>
            </label>

            {canManageBilling && (
              <div className="relative" ref={authDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAuthDropdownOpen((prev) => !prev)}
                  className={PRIMARY_BTN_CLASS}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isAuthDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-40 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          value={authDropdownSearch}
                          onChange={(e) => setAuthDropdownSearch(e.target.value)}
                          placeholder="Type to search..."
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3D6B22]"
                        />
                      </div>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {authTypeOptions.map((opt) => (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => openNewAuthorization(opt.type)}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-[#3D6B22]/5 hover:text-slate-900 flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          {opt.isNew && (
                            <span className="text-[10px] font-bold text-[#3D6B22] bg-[#3D6B22]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Auth #</th>
                <th className="pb-3.5">Auth Type</th>
                <th className="pb-3.5">Payer</th>
                <th className="pb-3.5">Code</th>
                <th className="pb-3.5">Description</th>
                <th className="pb-3.5">
                  <button
                    type="button"
                    onClick={() => setAuthSortAsc((p) => !p)}
                    className="inline-flex items-center gap-1 hover:text-slate-700 cursor-pointer uppercase"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Start</span>
                  </button>
                </th>
                <th className="pb-3.5">End</th>
                <th className="pb-3.5">Max Time</th>
                <th className="pb-3.5">Period</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAuthorizations.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No authorizations found.
                  </td>
                </tr>
              ) : (
                visibleAuthorizations.map((auth) => (
                  <React.Fragment key={auth.id}>
                    {/* Primary Authorization Header Row */}
                    <tr className="bg-slate-50/70">
                      <td className="py-3 pl-2 font-bold whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            canManageBilling && openEditAuthorization(auth)
                          }
                          className={`text-[#3D6B22] font-bold ${
                            canManageBilling
                              ? "hover:underline cursor-pointer"
                              : "cursor-default"
                          }`}
                        >
                          {auth.authNumber}
                        </button>
                      </td>
                      <td className="py-3 font-medium text-slate-700 whitespace-nowrap">
                        {auth.authType}
                      </td>
                      <td
                        className="py-3 font-semibold text-slate-800 whitespace-nowrap"
                        colSpan={8}
                      >
                        {auth.payerName}
                      </td>
                      <td className="py-3 pr-2 text-right whitespace-nowrap">
                        {canManageBilling && (
                          <div className="inline-flex items-center gap-2 font-semibold">
                            <button
                              type="button"
                              onClick={() => openEditAuthorization(auth)}
                              className="text-[#3D6B22] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAuthorization(auth)}
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Nested Authorized Service Lines */}
                    {auth.services.map((line) => (
                      <tr
                        key={line.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 pl-2"></td>
                        <td className="py-3"></td>
                        <td className="py-3"></td>
                        <td className="py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              canManageBilling && openEditAuthorization(auth)
                            }
                            className={`text-[#3D6B22] font-semibold ${
                              canManageBilling
                                ? "hover:underline cursor-pointer"
                                : "cursor-default"
                            }`}
                          >
                            {line.code}
                          </button>
                        </td>
                        <td className="py-3 text-slate-700 whitespace-nowrap">
                          {line.description}
                        </td>
                        <td className="py-3 text-slate-600 whitespace-nowrap">
                          {formatShortDate(line.startDate)}
                        </td>
                        <td className="py-3 text-slate-600 whitespace-nowrap">
                          {formatShortDate(line.endDate)}
                        </td>
                        <td className="py-3 font-semibold text-slate-800 whitespace-nowrap">
                          {line.maxTimeAllowed} {line.units}
                        </td>
                        <td className="py-3 text-slate-600 whitespace-nowrap">
                          {line.period}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              line.status === "Current"
                                ? "bg-emerald-50 text-[#3D6B22] border-emerald-200"
                                : line.status === "Expired"
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {line.status}
                          </span>
                        </td>
                        <td className="py-3 pr-2"></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Payment Responsibility */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Payment Responsibility
              </h3>
              <SectionHelp title="Primary, secondary, and client-share payment splits." />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Primary, secondary, and private-pay responsibility splits
            </p>
          </div>
          {canManageBilling && (
            <button
              type="button"
              onClick={() => {
                setEditingPayResp(null);
                setIsPayRespModalOpen(true);
              }}
              className={PRIMARY_BTN_CLASS}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Responsibility</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Payer / Party</th>
                <th className="pb-3.5">Type</th>
                <th className="pb-3.5">Share</th>
                <th className="pb-3.5">Notes</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billing.paymentResponsibilities.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No payment responsibility rules configured.
                  </td>
                </tr>
              ) : (
                billing.paymentResponsibilities.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-semibold text-slate-900 whitespace-nowrap">
                      {item.payerName}
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                        {item.responsibilityType}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {item.percentage}%
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {item.notes || "—"}
                    </td>
                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      {canManageBilling && (
                        <div className="inline-flex items-center gap-2 font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPayResp(item);
                              setIsPayRespModalOpen(true);
                            }}
                            className="text-[#3D6B22] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              persistBilling({
                                ...billing,
                                paymentResponsibilities:
                                  billing.paymentResponsibilities.filter(
                                    (p) => p.id !== item.id
                                  ),
                              });
                              toast.success("Payment responsibility removed.");
                            }}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Assigned Services */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Assigned Services
              </h3>
              <SectionHelp title="Services assigned to this client with standard bill rates." />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Approved service codes and default bill rates for this client
            </p>
          </div>
          {canManageBilling && (
            <button
              type="button"
              onClick={() => {
                setEditingAssignedSvc(null);
                setIsAssignedSvcModalOpen(true);
              }}
              className={PRIMARY_BTN_CLASS}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Code</th>
                <th className="pb-3.5">Description</th>
                <th className="pb-3.5">Payer</th>
                <th className="pb-3.5">Type</th>
                <th className="pb-3.5">Bill Rate</th>
                <th className="pb-3.5">Req. Auth.</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billing.assignedServices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No assigned services.
                  </td>
                </tr>
              ) : (
                billing.assignedServices.map((svc) => (
                  <tr
                    key={svc.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-semibold text-slate-900 whitespace-nowrap">
                      {svc.code}
                    </td>
                    <td className="py-3.5 text-slate-700 whitespace-nowrap">
                      {svc.description}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {svc.payer || "—"}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {svc.type}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      ${svc.billRate.toFixed(2)}
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      {svc.reqAuth ? "Yes" : "No"}
                    </td>
                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      {canManageBilling && (
                        <div className="inline-flex items-center gap-2 font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAssignedSvc(svc);
                              setIsAssignedSvcModalOpen(true);
                            }}
                            className="text-[#3D6B22] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              persistBilling({
                                ...billing,
                                assignedServices:
                                  billing.assignedServices.filter(
                                    (s) => s.id !== svc.id
                                  ),
                              });
                              toast.success("Assigned service deleted.");
                            }}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Max Hours and Visits */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Max Hours and Visits
              </h3>
              <SectionHelp title="Maximum allowable service hours and visit counts per period." />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Period-based service hour and visit caps for scheduling enforcement
            </p>
          </div>
          {canManageBilling && (
            <button
              type="button"
              onClick={() => {
                setEditingMaxHours(null);
                setIsMaxHoursModalOpen(true);
              }}
              className={PRIMARY_BTN_CLASS}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Limit</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Service Code</th>
                <th className="pb-3.5">Max Hours</th>
                <th className="pb-3.5">Max Visits</th>
                <th className="pb-3.5">Period</th>
                <th className="pb-3.5">Start Date</th>
                <th className="pb-3.5">End Date</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billing.maxHoursAndVisits.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No max hours or visit limits configured.
                  </td>
                </tr>
              ) : (
                billing.maxHoursAndVisits.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-semibold text-slate-900 whitespace-nowrap">
                      {item.serviceCode}
                    </td>
                    <td className="py-3.5 text-slate-700 whitespace-nowrap">
                      {item.maxHours} hrs
                    </td>
                    <td className="py-3.5 text-slate-700 whitespace-nowrap">
                      {item.maxVisits}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {item.period}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {formatShortDate(item.startDate)}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {formatShortDate(item.endDate)}
                    </td>
                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      {canManageBilling && (
                        <div className="inline-flex items-center gap-2 font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMaxHours(item);
                              setIsMaxHoursModalOpen(true);
                            }}
                            className="text-[#3D6B22] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              persistBilling({
                                ...billing,
                                maxHoursAndVisits:
                                  billing.maxHoursAndVisits.filter(
                                    (m) => m.id !== item.id
                                  ),
                              });
                              toast.success("Rule removed.");
                            }}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Bill Rate Adjustments */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Bill Rate Adjustments
              </h3>
              <SectionHelp title="Date-bounded rate overrides for specific services or payers." />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Temporary or contract-specific bill rate overrides
            </p>
          </div>
          {canManageBilling && (
            <button
              type="button"
              onClick={() => {
                setEditingRateAdj(null);
                setIsRateAdjModalOpen(true);
              }}
              className={PRIMARY_BTN_CLASS}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Adjustment</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3.5 pl-2">Code</th>
                <th className="pb-3.5">Description</th>
                <th className="pb-3.5">Payer</th>
                <th className="pb-3.5">Type</th>
                <th className="pb-3.5">Rate</th>
                <th className="pb-3.5">Start Date</th>
                <th className="pb-3.5">End Date</th>
                <th className="pb-3.5 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billing.billRateAdjustments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-xs text-slate-400 font-medium"
                  >
                    No bill rate adjustments.
                  </td>
                </tr>
              ) : (
                billing.billRateAdjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-semibold text-slate-900 whitespace-nowrap">
                      {adj.code}
                    </td>
                    <td className="py-3.5 text-slate-700 whitespace-nowrap">
                      {adj.description}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {adj.payer || "—"}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {adj.type}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      ${adj.rate.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {formatShortDate(adj.startDate)}
                    </td>
                    <td className="py-3.5 text-slate-600 whitespace-nowrap">
                      {formatShortDate(adj.endDate)}
                    </td>
                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      {canManageBilling && (
                        <div className="inline-flex items-center gap-2 font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRateAdj(adj);
                              setIsRateAdjModalOpen(true);
                            }}
                            className="text-[#3D6B22] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              persistBilling({
                                ...billing,
                                billRateAdjustments:
                                  billing.billRateAdjustments.filter(
                                    (r) => r.id !== adj.id
                                  ),
                              });
                              toast.success("Bill rate adjustment deleted.");
                            }}
                            className="text-red-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AuthorizationModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setEditingAuth(null);
        }}
        onSave={handleSaveAuthorization}
        initialAuth={editingAuth}
        authType={newAuthType}
        payers={billing.payers}
      />

      <PayerModal
        isOpen={isPayerModalOpen}
        onClose={() => {
          setIsPayerModalOpen(false);
          setEditingPayer(null);
        }}
        onSave={handleSavePayer}
        initialPayer={editingPayer}
      />

      <EligibilityHistoryModal
        isOpen={isEligHistoryOpen}
        onClose={() => setIsEligHistoryOpen(false)}
        history={billing.eligibilityHistory}
      />

      <PaymentResponsibilityModal
        isOpen={isPayRespModalOpen}
        onClose={() => {
          setIsPayRespModalOpen(false);
          setEditingPayResp(null);
        }}
        onSave={handleSavePaymentResp}
        initialItem={editingPayResp}
        payers={billing.payers}
      />

      <AssignedServiceModal
        isOpen={isAssignedSvcModalOpen}
        onClose={() => {
          setIsAssignedSvcModalOpen(false);
          setEditingAssignedSvc(null);
        }}
        onSave={handleSaveAssignedService}
        initialItem={editingAssignedSvc}
        payers={billing.payers}
      />

      <MaxHoursModal
        isOpen={isMaxHoursModalOpen}
        onClose={() => {
          setIsMaxHoursModalOpen(false);
          setEditingMaxHours(null);
        }}
        onSave={handleSaveMaxHours}
        initialItem={editingMaxHours}
      />

      <BillRateAdjustmentModal
        isOpen={isRateAdjModalOpen}
        onClose={() => {
          setIsRateAdjModalOpen(false);
          setEditingRateAdj(null);
        }}
        onSave={handleSaveRateAdjustment}
        initialItem={editingRateAdj}
        payers={billing.payers}
      />
    </div>
  );
}
