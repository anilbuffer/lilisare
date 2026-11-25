"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Save,
  X,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/components/ui/Card";
import {
  AuthorizationRecord,
  AuthorizationStatus,
  CareCategory,
  UnitMeasure,
  upsertAuthorizationRecord,
} from "@/lib/admin/authorizationsData";

interface AdminAuthorizationFormProps {
  initialRecord?: AuthorizationRecord | null;
  mode: "create" | "edit";
}

const CLIENT_OPTIONS = [
  { id: "CL-4011", name: "Eleanor Ruth Whitfield", hhId: "HH-201", hhName: "Whitfield Household", dob: "1968-04-12", phone: "(303) 555-0144" },
  { id: "CL-4012", name: "Lucas Gabriel Gomez", hhId: "HH-202", hhName: "Gomez Household", dob: "2016-09-24", phone: "(303) 555-0177" },
  { id: "CL-4013", name: "Harper Mia Alvarez", hhId: "HH-203", hhName: "Alvarez Household", dob: "2019-11-05", phone: "(303) 555-0182" },
  { id: "CL-4014", name: "Samuel Thomas Wright", hhId: "HH-204", hhName: "Wright Household", dob: "1975-02-18", phone: "(303) 555-0199" },
  { id: "CL-4015", name: "Mateo Alexander Silva", hhId: "HH-205", hhName: "Silva Household", dob: "1954-08-30", phone: "(303) 555-0165" },
  { id: "CL-4016", name: "Amara Joy Washington", hhId: "HH-206", hhName: "Washington Household", dob: "2008-05-14", phone: "(303) 555-0128" },
  { id: "CL-4017", name: "David Jonathan Brooks", hhId: "HH-207", hhName: "Brooks Household", dob: "1960-12-03", phone: "(303) 555-0139" },
];

export function AdminAuthorizationForm({ initialRecord, mode }: AdminAuthorizationFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit";

  // Form states
  const [clientId, setClientId] = useState(initialRecord?.clientId || "CL-4011");
  const [clientName, setClientName] = useState(initialRecord?.clientName || "Eleanor Ruth Whitfield");
  const [householdId, setHouseholdId] = useState(initialRecord?.householdId || "HH-201");
  const [householdName, setHouseholdName] = useState(initialRecord?.householdName || "Whitfield Household");
  const [clientDob, setClientDob] = useState(initialRecord?.clientDob || "1968-04-12");
  const [clientPhone, setClientPhone] = useState(initialRecord?.clientPhone || "(303) 555-0144");

  const [careCategory, setCareCategory] = useState<CareCategory>(initialRecord?.careCategory || "NON_MEDICAL");
  const [payer, setPayer] = useState(initialRecord?.payer || "Colorado Medicaid");
  const [payerPlan, setPayerPlan] = useState(initialRecord?.payerPlan || "Health First Colorado HCBS-EBD");
  const [insurancePolicyId, setInsurancePolicyId] = useState(initialRecord?.insurancePolicyId || "CO-MED-994821");
  const [authRefNumber, setAuthRefNumber] = useState(initialRecord?.id || `AUTH-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  const [serviceName, setServiceName] = useState(initialRecord?.serviceName || "Personal Care / IHSS");
  const [serviceCode, setServiceCode] = useState(initialRecord?.serviceCode || "T1019");
  const [modifier, setModifier] = useState(initialRecord?.modifier || "U2");
  const [unitMeasure, setUnitMeasure] = useState<UnitMeasure>(initialRecord?.unitMeasure || "15-min Units");
  const [unitsApproved, setUnitsApproved] = useState(initialRecord?.unitsApproved ?? 1200);
  const [unitsUsed, setUnitsUsed] = useState(initialRecord?.unitsUsed ?? 0);
  const [weeklyCapUnits, setWeeklyCapUnits] = useState(initialRecord?.weeklyCapUnits ?? 25);
  const [billRate, setBillRate] = useState(initialRecord?.billRate ?? 15.5);
  const [payRate, setPayRate] = useState(initialRecord?.payRate ?? 10.25);

  const [effectiveDate, setEffectiveDate] = useState(initialRecord?.effectiveDate || "2026-06-01");
  const [expirationDate, setExpirationDate] = useState(initialRecord?.expirationDate || "2027-05-31");
  const [diagnosisCode, setDiagnosisCode] = useState(initialRecord?.diagnosisCode || "G80.9 (Cerebral Palsy)");
  const [status, setStatus] = useState<AuthorizationStatus>(initialRecord?.status || "APPROVED");

  const [caseManagerName, setCaseManagerName] = useState(initialRecord?.caseManagerName || "David Sterling, MSW");
  const [caseManagerAgency, setCaseManagerAgency] = useState(initialRecord?.caseManagerAgency || "Denver County Adult Services SEP");
  const [caseManagerPhone, setCaseManagerPhone] = useState(initialRecord?.caseManagerPhone || "(303) 555-0192");
  const [caseManagerEmail, setCaseManagerEmail] = useState(initialRecord?.caseManagerEmail || "d.sterling@denvergov.org");
  const [notes, setNotes] = useState(initialRecord?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client Selection Change handler
  const handleClientSelect = (selectedId: string) => {
    const selected = CLIENT_OPTIONS.find((c) => c.id === selectedId);
    if (selected) {
      setClientId(selected.id);
      setClientName(selected.name);
      setHouseholdId(selected.hhId);
      setHouseholdName(selected.hhName);
      setClientDob(selected.dob);
      setClientPhone(selected.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!authRefNumber.trim()) {
      toast.error("Please provide a valid Authorization Reference Number");
      setIsSubmitting(false);
      return;
    }

    const savedRecord: AuthorizationRecord = {
      id: authRefNumber.trim(),
      internalId: initialRecord?.internalId || `PA-${Math.floor(100 + Math.random() * 900)}`,
      clientId,
      clientName,
      clientDob,
      clientPhone,
      householdId,
      householdName,
      careCategory,
      payer,
      payerPlan,
      insurancePolicyId,
      caseManagerName,
      caseManagerEmail,
      caseManagerPhone,
      caseManagerAgency,
      serviceName,
      serviceCode,
      modifier: modifier.trim() || undefined,
      unitMeasure,
      unitsApproved: Number(unitsApproved) || 0,
      unitsUsed: Number(unitsUsed) || 0,
      weeklyCapUnits: Number(weeklyCapUnits) || undefined,
      billRate: Number(billRate) || 0,
      payRate: Number(payRate) || 0,
      effectiveDate,
      expirationDate,
      diagnosisCode,
      status,
      documents: initialRecord?.documents || [
        {
          id: `DOC-${Date.now().toString().slice(-4)}`,
          name: "Notice of Action (NOA) - Initial Determination.pdf",
          type: "Notice of Action (NOA)",
          fileSize: "1.4 MB",
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: "Marcus Vance (Agency Admin)",
          verificationStatus: "VERIFIED",
        },
      ],
      notes,
      statusHistory: isEditing
        ? [
            {
              status,
              changedAt: new Date().toISOString().slice(0, 10),
              changedBy: "Marcus Vance (Agency Admin)",
              reason: "Authorization details updated via Full Page Workspace",
            },
            ...(initialRecord?.statusHistory || []),
          ]
        : [
            {
              status,
              changedAt: new Date().toISOString().slice(0, 10),
              changedBy: "Marcus Vance (Agency Admin)",
              reason: "Initial authorization entry created in LiliSare Admin",
            },
          ],
    };

    upsertAuthorizationRecord(savedRecord);
    toast.success(isEditing ? `Authorization ${savedRecord.id} updated successfully` : `Authorization ${savedRecord.id} created successfully`);

    setTimeout(() => {
      router.push(`/admin/authorizations/${encodeURIComponent(savedRecord.id)}`);
    }, 200);
  };

  const backUrl = isEditing && initialRecord ? `/admin/authorizations/${initialRecord.id}` : "/admin/authorizations";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* ----------------------------------------------------------------- */}
      {/* 01. Form Top Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer w-fit group mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{isEditing ? "Back to Authorization Detail" : "Back to Authorizations Registry"}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isEditing ? `Edit Authorization: ${initialRecord?.id}` : "Create New Payer Authorization"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure HCPCS service codes, approved units, billing rates, and validity windows for payer billing compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={backUrl}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Cancel</span>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Authorization"}</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 02. Section 1: Patient & Household Identification */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center text-[#3D6B22]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Patient & Household Identification</h3>
            <p className="text-[11px] text-slate-400">Select the beneficiary and review linked household records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Select Client / Beneficiary <span className="text-rose-500">*</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer"
            >
              {CLIENT_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Associated Household
            </label>
            <input
              type="text"
              value={householdName}
              readOnly
              className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Client DOB & Phone
            </label>
            <input
              type="text"
              value={`${clientDob} • ${clientPhone}`}
              readOnly
              className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 03. Section 2: Payer & Authorization Reference */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payer Program & Authorization Reference</h3>
            <p className="text-[11px] text-slate-400">Specify payer entity and distinguish Policy ID from Prior Auth #</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Care Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={careCategory}
              onChange={(e) => setCareCategory(e.target.value as CareCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer"
            >
              <option value="NON_MEDICAL">Non-Medical Home Care (IHSS / Respite / Homemaker)</option>
              <option value="SKILLED_CARE">Skilled Health Care (RN / LPN / CNA / Therapy)</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Payer Organization <span className="text-rose-500">*</span>
            </label>
            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer"
            >
              <option value="Colorado Medicaid">Colorado Medicaid (Health First Colorado)</option>
              <option value="CES Waiver">CES Waiver (Developmental Disabilities)</option>
              <option value="CHRP Waiver">CHRP Waiver (Children's Habilitation)</option>
              <option value="UnitedHealthcare">UnitedHealthcare Commercial</option>
              <option value="Kaiser Permanente">Kaiser Permanente Senior Advantage</option>
              <option value="Anthem BlueCross">Anthem BlueCross BlueShield</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Benefit Plan / Program Name
            </label>
            <input
              type="text"
              value={payerPlan}
              onChange={(e) => setPayerPlan(e.target.value)}
              placeholder="e.g. Health First Colorado HCBS-EBD"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Patient Insurance Policy / Medicaid ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={insurancePolicyId}
              onChange={(e) => setInsurancePolicyId(e.target.value)}
              placeholder="e.g. CO-MED-994821"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Prior Authorization Reference # <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={authRefNumber}
              onChange={(e) => setAuthRefNumber(e.target.value)}
              placeholder="e.g. AUTH-2026-9941"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-mono font-bold text-[#3D6B22]"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Approval Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AuthorizationStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer font-semibold"
            >
              <option value="APPROVED">APPROVED (Active for Scheduling & Billing)</option>
              <option value="PENDING">PENDING (Submitted to Payer)</option>
              <option value="REQUESTED">REQUESTED (Initial Draft)</option>
              <option value="DENIED">DENIED (In Appeal / Review)</option>
              <option value="EXPIRED">EXPIRED (Terminated Term)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 04. Section 3: Service Scope & HCPCS Details */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Service Scope & HCPCS Procedure Code</h3>
            <p className="text-[11px] text-slate-400">Define procedure codes, modifiers, and approved volume</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Authorized Service Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Personal Care / IHSS Attendant Care"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              HCPCS / CPT Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={serviceCode}
              onChange={(e) => setServiceCode(e.target.value)}
              placeholder="e.g. T1019, G0151, S5125"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Billing Modifier (Optional)
            </label>
            <input
              type="text"
              value={modifier}
              onChange={(e) => setModifier(e.target.value)}
              placeholder="e.g. U2, TF, TG"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-mono"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Unit Measure <span className="text-rose-500">*</span>
            </label>
            <select
              value={unitMeasure}
              onChange={(e) => setUnitMeasure(e.target.value as UnitMeasure)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer"
            >
              <option value="15-min Units">15-min Units (4 units = 1 hour)</option>
              <option value="Visits">Visits (per diem / encounter)</option>
              <option value="Hours">Hours (direct care hour)</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Total Approved Units <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={unitsApproved}
              onChange={(e) => setUnitsApproved(Number(e.target.value))}
              placeholder="e.g. 1200"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-bold"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Units Already Used
            </label>
            <input
              type="number"
              value={unitsUsed}
              onChange={(e) => setUnitsUsed(Number(e.target.value))}
              placeholder="e.g. 0"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Weekly Scheduling Cap
            </label>
            <input
              type="number"
              value={weeklyCapUnits}
              onChange={(e) => setWeeklyCapUnits(Number(e.target.value))}
              placeholder="e.g. 25"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 05. Section 4: Validity & Financial Rates */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#3D6B22]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Validity Window, Rates & Clinical Diagnosis</h3>
            <p className="text-[11px] text-slate-400">Effective dates, ICD-10 justification, and reimbursement rates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Effective Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Expiration Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Standard Bill Rate ($/unit) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={billRate}
              onChange={(e) => setBillRate(Number(e.target.value))}
              placeholder="e.g. 15.50"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-bold"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Caregiver Pay Rate ($/unit) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={payRate}
              onChange={(e) => setPayRate(Number(e.target.value))}
              placeholder="e.g. 10.25"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              ICD-10 Primary Diagnosis Code & Description
            </label>
            <input
              type="text"
              value={diagnosisCode}
              onChange={(e) => setDiagnosisCode(e.target.value)}
              placeholder="e.g. G80.9 (Cerebral Palsy, unspecified)"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all font-semibold"
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 06. Section 5: Case Manager & Coordination Notes */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Case Manager Contact & Agency Coordination</h3>
            <p className="text-[11px] text-slate-400">Single Entry Point (SEP) case manager details for renewals & reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Case Manager Name
            </label>
            <input
              type="text"
              value={caseManagerName}
              onChange={(e) => setCaseManagerName(e.target.value)}
              placeholder="e.g. David Sterling, MSW"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Assigned SEP / CCB Agency
            </label>
            <input
              type="text"
              value={caseManagerAgency}
              onChange={(e) => setCaseManagerAgency(e.target.value)}
              placeholder="e.g. Denver County Adult Services SEP"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Case Manager Phone
            </label>
            <input
              type="text"
              value={caseManagerPhone}
              onChange={(e) => setCaseManagerPhone(e.target.value)}
              placeholder="e.g. (303) 555-0192"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Case Manager Email
            </label>
            <input
              type="email"
              value={caseManagerEmail}
              onChange={(e) => setCaseManagerEmail(e.target.value)}
              placeholder="e.g. d.sterling@denvergov.org"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
              Internal Coordination & Renewal Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any specific clinical notes, renewal deadlines, or restrictions..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] text-slate-800 transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 07. Form Bottom Action Bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={backUrl}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-400" />
          <span>Cancel</span>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Saving..." : isEditing ? "Save Authorization Changes" : "Create Authorization"}</span>
        </button>
      </div>
    </form>
  );
}
