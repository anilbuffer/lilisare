"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  History,
  DollarSign,
  BriefcaseMedical,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormLabel, FormSelect } from "@/components/ui/FormControls";
import {
  AssignedServiceItem,
  BillingPayer,
  BillRateAdjustmentItem,
  EligibilityHistoryEntry,
  MaxHoursVisitItem,
  PaymentResponsibilityItem,
} from "@/types/client";
import { AVAILABLE_BILLING_SERVICES } from "./billingDefaults";

/* 1. Payer Add/Edit Modal */
export function PayerModal({
  isOpen,
  onClose,
  onSave,
  initialPayer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payer: BillingPayer) => void;
  initialPayer: BillingPayer | null;
}) {
  const [form, setForm] = useState<Omit<BillingPayer, "id">>({
    name: "",
    status: "Active",
    requiresAuth: true,
    eligibilityStatus: "Not requested",
    verificationDate: "",
    defaultFax: "",
    contact: "",
    location: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialPayer) {
      setForm({
        name: initialPayer.name,
        status: initialPayer.status,
        requiresAuth: initialPayer.requiresAuth,
        eligibilityStatus: initialPayer.eligibilityStatus,
        verificationDate: initialPayer.verificationDate || "",
        defaultFax: initialPayer.defaultFax || "",
        contact: initialPayer.contact || "",
        location: initialPayer.location || "",
      });
    } else {
      setForm({
        name: "",
        status: "Active",
        requiresAuth: true,
        eligibilityStatus: "Not requested",
        verificationDate: "",
        defaultFax: "",
        contact: "",
        location: "",
      });
    }
  }, [isOpen, initialPayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      id: initialPayer?.id || `PAY-${Date.now()}`,
      ...form,
      name: form.name.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialPayer ? "Edit Payer" : "Add Payer"}
      description="Configure payer status, authorization requirement, and contact details."
      icon={<Building2 className="w-5 h-5" />}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <FormLabel required>Payer Name</FormLabel>
            <FormInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. UHC - United Healthcare"
            />
          </div>
          <div>
            <FormLabel>Status</FormLabel>
            <FormSelect
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "Active" | "Inactive" })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Requires Authorization</FormLabel>
            <FormSelect
              value={form.requiresAuth ? "Yes" : "No"}
              onChange={(e) =>
                setForm({ ...form, requiresAuth: e.target.value === "Yes" })
              }
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Default Fax</FormLabel>
            <FormInput
              value={form.defaultFax}
              onChange={(e) => setForm({ ...form, defaultFax: e.target.value })}
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <FormLabel>Contact</FormLabel>
            <FormInput
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="Representative name"
            />
          </div>
          <div className="sm:col-span-2">
            <FormLabel>Location</FormLabel>
            <FormInput
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, State"
            />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
          >
            Save Payer
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* 2. Eligibility History Modal */
export function EligibilityHistoryModal({
  isOpen,
  onClose,
  history,
}: {
  isOpen: boolean;
  onClose: () => void;
  history: EligibilityHistoryEntry[];
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eligibility Verification History"
      description="Audit log of payer eligibility checks for this client."
      icon={<History className="w-5 h-5" />}
      maxWidth="2xl"
    >
      {history.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          No eligibility checks recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold">
                <th className="py-2.5 px-3">Payer</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Checked By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {entry.payerName}
                  </td>
                  <td className="py-2.5 px-3">{entry.checkedAt}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#3D6B22] border border-emerald-200">
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{entry.checkedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

/* 3. Payment Responsibility Modal */
export function PaymentResponsibilityModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  payers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PaymentResponsibilityItem) => void;
  initialItem?: PaymentResponsibilityItem | null;
  payers: BillingPayer[];
}) {
  const [payerName, setPayerName] = useState("");
  const [responsibilityType, setResponsibilityType] =
    useState<PaymentResponsibilityItem["responsibilityType"]>("Primary");
  const [percentage, setPercentage] = useState(100);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setPayerName(initialItem.payerName);
      setResponsibilityType(initialItem.responsibilityType);
      setPercentage(initialItem.percentage);
      setNotes(initialItem.notes || "");
    } else {
      setPayerName(payers[0]?.name || "Client / Private Pay");
      setResponsibilityType("Primary");
      setPercentage(100);
      setNotes("");
    }
  }, [isOpen, initialItem, payers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialItem?.id || `PR-${Date.now()}`,
      payerName,
      responsibilityType,
      percentage: Number(percentage),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? "Edit Payment Responsibility" : "Add Payment Responsibility"}
      description="Assign primary, secondary, or client share billing responsibility."
      icon={<DollarSign className="w-5 h-5" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormLabel required>Payer / Responsible Party</FormLabel>
          <FormSelect
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
          >
            {payers.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
            <option value="Client / Private Pay">Client / Private Pay</option>
          </FormSelect>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <FormLabel>Responsibility Type</FormLabel>
            <FormSelect
              value={responsibilityType}
              onChange={(e) =>
                setResponsibilityType(
                  e.target.value as PaymentResponsibilityItem["responsibilityType"]
                )
              }
            >
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
              <option value="Copay">Copay</option>
              <option value="Client Share">Client Share</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Share (%)</FormLabel>
            <FormInput
              type="number"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <FormLabel>Notes</FormLabel>
          <FormInput
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional billing split notes"
          />
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer"
          >
            Save Responsibility
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* 4. Assigned Service Modal */
export function AssignedServiceModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  payers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: AssignedServiceItem) => void;
  initialItem?: AssignedServiceItem | null;
  payers: BillingPayer[];
}) {
  const [selectedCode, setSelectedCode] = useState(
    AVAILABLE_BILLING_SERVICES[0].code
  );
  const [payer, setPayer] = useState("");
  const [type, setType] = useState<AssignedServiceItem["type"]>("Hourly");
  const [billRate, setBillRate] = useState(60);
  const [reqAuth, setReqAuth] = useState(false);

  const selectedCatalog =
    AVAILABLE_BILLING_SERVICES.find((s) => s.code === selectedCode) ||
    AVAILABLE_BILLING_SERVICES[0];

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setSelectedCode(initialItem.code);
      setPayer(initialItem.payer);
      setType(initialItem.type);
      setBillRate(initialItem.billRate);
      setReqAuth(initialItem.reqAuth);
    } else {
      const first = AVAILABLE_BILLING_SERVICES[0];
      setSelectedCode(first.code);
      setBillRate(first.defaultRate);
      setType(first.defaultType);
      setPayer("");
      setReqAuth(false);
    }
  }, [isOpen, initialItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialItem?.id || `ASGN-${Date.now()}`,
      code: selectedCatalog.code,
      description: selectedCatalog.description,
      payer,
      type,
      billRate: Number(billRate),
      reqAuth,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? "Edit Assigned Service" : "Assign Service"}
      description="Add an approved service code and bill rate to this client."
      icon={<BriefcaseMedical className="w-5 h-5" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormLabel required>Service</FormLabel>
          <FormSelect
            value={selectedCode}
            onChange={(e) => {
              const found = AVAILABLE_BILLING_SERVICES.find(
                (s) => s.code === e.target.value
              );
              setSelectedCode(e.target.value);
              if (found) {
                setBillRate(found.defaultRate);
                setType(found.defaultType);
              }
            }}
          >
            {AVAILABLE_BILLING_SERVICES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.description} (${s.defaultRate.toFixed(2)})
              </option>
            ))}
          </FormSelect>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <FormLabel>Payer (Optional)</FormLabel>
            <FormSelect value={payer} onChange={(e) => setPayer(e.target.value)}>
              <option value="">All / Unspecified</option>
              {payers.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel>Billing Type</FormLabel>
            <FormSelect
              value={type}
              onChange={(e) =>
                setType(e.target.value as AssignedServiceItem["type"])
              }
            >
              <option value="Hourly">Hourly</option>
              <option value="Per Visit">Per Visit</option>
              <option value="Daily">Daily</option>
              <option value="mTU">mTU</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Bill Rate ($)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min={0}
              value={billRate}
              onChange={(e) => setBillRate(Number(e.target.value))}
            />
          </div>
          <div>
            <FormLabel>Requires Auth.</FormLabel>
            <FormSelect
              value={reqAuth ? "Yes" : "No"}
              onChange={(e) => setReqAuth(e.target.value === "Yes")}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </FormSelect>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer"
          >
            Add Service
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* 5. Max Hours & Visits Modal */
export function MaxHoursModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MaxHoursVisitItem) => void;
  initialItem?: MaxHoursVisitItem | null;
}) {
  const [serviceCode, setServiceCode] = useState(
    AVAILABLE_BILLING_SERVICES[0].code
  );
  const [maxHours, setMaxHours] = useState(40);
  const [maxVisits, setMaxVisits] = useState(5);
  const [period, setPeriod] = useState<MaxHoursVisitItem["period"]>("Week");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setServiceCode(initialItem.serviceCode);
      setMaxHours(initialItem.maxHours);
      setMaxVisits(initialItem.maxVisits);
      setPeriod(initialItem.period);
      setStartDate(initialItem.startDate);
      setEndDate(initialItem.endDate);
    } else {
      setServiceCode(AVAILABLE_BILLING_SERVICES[0].code);
      setMaxHours(40);
      setMaxVisits(5);
      setPeriod("Week");
      setStartDate("2026-01-01");
      setEndDate("2026-12-31");
    }
  }, [isOpen, initialItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialItem?.id || `MHV-${Date.now()}`,
      serviceCode,
      maxHours: Number(maxHours),
      maxVisits: Number(maxVisits),
      period,
      startDate,
      endDate,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? "Edit Max Hours and Visits" : "Add Max Hours and Visits"}
      description="Set service-level hour and visit caps for scheduling enforcement."
      icon={<Clock className="w-5 h-5" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <FormLabel>Service Code</FormLabel>
            <FormSelect
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
            >
              {AVAILABLE_BILLING_SERVICES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.description}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel>Max Hours</FormLabel>
            <FormInput
              type="number"
              min={0}
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
            />
          </div>
          <div>
            <FormLabel>Max Visits</FormLabel>
            <FormInput
              type="number"
              min={0}
              value={maxVisits}
              onChange={(e) => setMaxVisits(Number(e.target.value))}
            />
          </div>
          <div>
            <FormLabel>Period</FormLabel>
            <FormSelect
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as MaxHoursVisitItem["period"])
              }
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="2-week">2-week</option>
              <option value="Month">Month</option>
            </FormSelect>
          </div>
          <div />
          <div>
            <FormLabel>Start Date</FormLabel>
            <FormInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <FormLabel>End Date</FormLabel>
            <FormInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer"
          >
            Save Limit
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* 6. Bill Rate Adjustment Modal */
export function BillRateAdjustmentModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  payers,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BillRateAdjustmentItem) => void;
  initialItem: BillRateAdjustmentItem | null;
  payers: BillingPayer[];
}) {
  const [code, setCode] = useState(AVAILABLE_BILLING_SERVICES[0].code);
  const [payer, setPayer] = useState("");
  const [type, setType] = useState<BillRateAdjustmentItem["type"]>("Hourly");
  const [rate, setRate] = useState(50);
  const [startDate, setStartDate] = useState("2026-02-08");
  const [endDate, setEndDate] = useState("2026-08-31");

  useEffect(() => {
    if (!isOpen) return;
    if (initialItem) {
      setCode(initialItem.code);
      setPayer(initialItem.payer);
      setType(initialItem.type);
      setRate(initialItem.rate);
      setStartDate(initialItem.startDate);
      setEndDate(initialItem.endDate);
    } else {
      setCode(AVAILABLE_BILLING_SERVICES[0].code);
      setPayer("");
      setType("Hourly");
      setRate(50);
      setStartDate("2026-02-08");
      setEndDate("2026-08-31");
    }
  }, [isOpen, initialItem]);

  const selectedCatalog =
    AVAILABLE_BILLING_SERVICES.find((s) => s.code === code) ||
    AVAILABLE_BILLING_SERVICES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialItem?.id || `BRA-${Date.now()}`,
      code: selectedCatalog.code,
      description: selectedCatalog.description,
      payer,
      type,
      rate: Number(rate),
      startDate,
      endDate,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialItem ? "Edit Bill Rate Adjustment" : "Add Bill Rate Adjustment"}
      description="Override service bill rate for a specified date range."
      icon={<SlidersHorizontal className="w-5 h-5" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <FormLabel>Service Code</FormLabel>
            <FormSelect value={code} onChange={(e) => setCode(e.target.value)}>
              {AVAILABLE_BILLING_SERVICES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.description}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel>Payer (Optional)</FormLabel>
            <FormSelect value={payer} onChange={(e) => setPayer(e.target.value)}>
              <option value="">All / Unspecified</option>
              {payers.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel>Type</FormLabel>
            <FormSelect
              value={type}
              onChange={(e) =>
                setType(e.target.value as BillRateAdjustmentItem["type"])
              }
            >
              <option value="Hourly">Hourly</option>
              <option value="Per Visit">Per Visit</option>
              <option value="Daily">Daily</option>
              <option value="mTU">mTU</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Adjusted Rate ($)</FormLabel>
            <FormInput
              type="number"
              step="0.01"
              min={0}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <div />
          <div>
            <FormLabel>Start Date</FormLabel>
            <FormInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <FormLabel>End Date</FormLabel>
            <FormInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 cursor-pointer"
          >
            Save Adjustment
          </button>
        </div>
      </form>
    </Modal>
  );
}
