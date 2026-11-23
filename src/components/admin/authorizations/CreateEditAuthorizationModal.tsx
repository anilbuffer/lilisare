"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormSection, FormLabel, FormInput, FormSelect, FormTextarea } from "@/components/ui/FormControls";
import { ShieldCheck, Plus, Edit3, UserCheck, Calendar, DollarSign, FileSignature, UploadCloud } from "lucide-react";
import { AuthorizationRecord, AuthorizationStatus, CareCategory, UnitMeasure } from "@/lib/admin/authorizationsData";

interface CreateEditAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: AuthorizationRecord | null;
  onSave: (record: AuthorizationRecord) => void;
}

export function CreateEditAuthorizationModal({
  isOpen,
  onClose,
  recordToEdit,
  onSave,
}: CreateEditAuthorizationModalProps) {
  const isEditing = !!recordToEdit;

  // Form states
  const [clientId, setClientId] = useState("CL-4011");
  const [clientName, setClientName] = useState("Eleanor Ruth Whitfield");
  const [householdId, setHouseholdId] = useState("HH-201");
  const [householdName, setHouseholdName] = useState("Whitfield Household");
  const [clientDob, setClientDob] = useState("1968-04-12");
  const [clientPhone, setClientPhone] = useState("(303) 555-0144");

  const [careCategory, setCareCategory] = useState<CareCategory>("NON_MEDICAL");
  const [payer, setPayer] = useState("Colorado Medicaid");
  const [payerPlan, setPayerPlan] = useState("Health First Colorado HCBS-EBD");
  const [insurancePolicyId, setInsurancePolicyId] = useState("CO-MED-994821");
  const [authRefNumber, setAuthRefNumber] = useState("");

  const [serviceName, setServiceName] = useState("Personal Care / IHSS");
  const [serviceCode, setServiceCode] = useState("T1019");
  const [modifier, setModifier] = useState("U2");
  const [unitMeasure, setUnitMeasure] = useState<UnitMeasure>("15-min Units");
  const [unitsApproved, setUnitsApproved] = useState(1200);
  const [unitsUsed, setUnitsUsed] = useState(0);
  const [weeklyCapUnits, setWeeklyCapUnits] = useState(25);
  const [billRate, setBillRate] = useState(15.5);
  const [payRate, setPayRate] = useState(10.25);

  const [effectiveDate, setEffectiveDate] = useState("2026-06-01");
  const [expirationDate, setExpirationDate] = useState("2027-05-31");
  const [diagnosisCode, setDiagnosisCode] = useState("G80.9 (Cerebral Palsy)");
  const [status, setStatus] = useState<AuthorizationStatus>("APPROVED");

  const [caseManagerName, setCaseManagerName] = useState("David Sterling, MSW");
  const [caseManagerAgency, setCaseManagerAgency] = useState("Denver County Adult Services SEP");
  const [caseManagerPhone, setCaseManagerPhone] = useState("(303) 555-0192");
  const [caseManagerEmail, setCaseManagerEmail] = useState("d.sterling@denvergov.org");
  const [notes, setNotes] = useState("");

  const clientOptions = [
    { id: "CL-4011", name: "Eleanor Ruth Whitfield", hhId: "HH-201", hhName: "Whitfield Household", dob: "1968-04-12", phone: "(303) 555-0144" },
    { id: "CL-4012", name: "Lucas Gabriel Gomez", hhId: "HH-202", hhName: "Gomez Household", dob: "2016-09-24", phone: "(303) 555-0177" },
    { id: "CL-4013", name: "Harper Mia Alvarez", hhId: "HH-203", hhName: "Alvarez Household", dob: "2019-11-05", phone: "(303) 555-0182" },
    { id: "CL-4014", name: "Samuel Thomas Wright", hhId: "HH-204", hhName: "Wright Household", dob: "1975-02-18", phone: "(303) 555-0199" },
    { id: "CL-4015", name: "Mateo Alexander Silva", hhId: "HH-205", hhName: "Silva Household", dob: "1954-08-30", phone: "(303) 555-0165" },
    { id: "CL-4016", name: "Amara Joy Washington", hhId: "HH-206", hhName: "Washington Household", dob: "2008-05-14", phone: "(303) 555-0128" },
    { id: "CL-4017", name: "David Jonathan Brooks", hhId: "HH-207", hhName: "Brooks Household", dob: "1960-12-03", phone: "(303) 555-0139" },
  ];

  useEffect(() => {
    if (recordToEdit) {
      setClientId(recordToEdit.clientId);
      setClientName(recordToEdit.clientName);
      setHouseholdId(recordToEdit.householdId);
      setHouseholdName(recordToEdit.householdName);
      setClientDob(recordToEdit.clientDob);
      setClientPhone(recordToEdit.clientPhone);

      setCareCategory(recordToEdit.careCategory);
      setPayer(recordToEdit.payer);
      setPayerPlan(recordToEdit.payerPlan);
      setInsurancePolicyId(recordToEdit.insurancePolicyId);
      setAuthRefNumber(recordToEdit.id);

      setServiceName(recordToEdit.serviceName);
      setServiceCode(recordToEdit.serviceCode);
      setModifier(recordToEdit.modifier || "");
      setUnitMeasure(recordToEdit.unitMeasure);
      setUnitsApproved(recordToEdit.unitsApproved);
      setUnitsUsed(recordToEdit.unitsUsed);
      setWeeklyCapUnits(recordToEdit.weeklyCapUnits || 20);
      setBillRate(recordToEdit.billRate);
      setPayRate(recordToEdit.payRate);

      setEffectiveDate(recordToEdit.effectiveDate);
      setExpirationDate(recordToEdit.expirationDate);
      setDiagnosisCode(recordToEdit.diagnosisCode);
      setStatus(recordToEdit.status);

      setCaseManagerName(recordToEdit.caseManagerName);
      setCaseManagerAgency(recordToEdit.caseManagerAgency);
      setCaseManagerPhone(recordToEdit.caseManagerPhone);
      setCaseManagerEmail(recordToEdit.caseManagerEmail);
      setNotes(recordToEdit.notes || "");
    } else {
      setAuthRefNumber(`AUTH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setUnitsUsed(0);
      setStatus("APPROVED");
    }
  }, [recordToEdit, isOpen]);

  const handleClientChange = (cId: string) => {
    const found = clientOptions.find((c) => c.id === cId);
    if (found) {
      setClientId(found.id);
      setClientName(found.name);
      setHouseholdId(found.hhId);
      setHouseholdName(found.hhName);
      setClientDob(found.dob);
      setClientPhone(found.phone);
    }
  };

  const handleServicePresetChange = (preset: string) => {
    if (preset === "SN_CNA") {
      setCareCategory("SKILLED_CARE");
      setServiceName("Skilled Nursing / CNA Care");
      setServiceCode("T1019");
      setModifier("U2");
      setUnitMeasure("15-min Units");
      setBillRate(15.5);
      setPayRate(10.25);
    } else if (preset === "PT") {
      setCareCategory("SKILLED_CARE");
      setServiceName("Physical Therapy (PT)");
      setServiceCode("G0151");
      setModifier("");
      setUnitMeasure("Visits");
      setBillRate(125.0);
      setPayRate(85.0);
      setUnitsApproved(36);
    } else if (preset === "OT") {
      setCareCategory("SKILLED_CARE");
      setServiceName("Occupational Therapy (OT)");
      setServiceCode("G0152");
      setModifier("");
      setUnitMeasure("Visits");
      setBillRate(135.0);
      setPayRate(90.0);
      setUnitsApproved(24);
    } else if (preset === "ST") {
      setCareCategory("SKILLED_CARE");
      setServiceName("Speech-Language Pathology (ST)");
      setServiceCode("G0153");
      setModifier("");
      setUnitMeasure("Visits");
      setBillRate(130.0);
      setPayRate(88.0);
      setUnitsApproved(16);
    } else if (preset === "IHSS") {
      setCareCategory("NON_MEDICAL");
      setServiceName("IHSS Personal Care & Homemaker");
      setServiceCode("S5130");
      setModifier("U3");
      setUnitMeasure("15-min Units");
      setBillRate(15.0);
      setPayRate(10.25);
    } else if (preset === "FAMILY_CG") {
      setCareCategory("NON_MEDICAL");
      setServiceName("Family Caregiver (Pediatric)");
      setServiceCode("S5125");
      setModifier("TG");
      setUnitMeasure("15-min Units");
      setBillRate(16.25);
      setPayRate(11.5);
    } else if (preset === "RESPITE") {
      setCareCategory("NON_MEDICAL");
      setServiceName("Respite Care Services");
      setServiceCode("T1005");
      setModifier("");
      setUnitMeasure("Hours");
      setBillRate(32.0);
      setPayRate(22.0);
      setUnitsApproved(100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parId = authRefNumber.trim() || `AUTH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const savedRecord: AuthorizationRecord = {
      id: parId,
      internalId: recordToEdit?.internalId || `PA-${Math.floor(100 + Math.random() * 900)}`,
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
      modifier: modifier || undefined,
      unitMeasure,
      unitsApproved: Number(unitsApproved),
      unitsUsed: Number(unitsUsed),
      weeklyCapUnits: Number(weeklyCapUnits),
      billRate: Number(billRate),
      payRate: Number(payRate),
      effectiveDate,
      expirationDate,
      diagnosisCode,
      status,
      documents: recordToEdit?.documents || [
        {
          id: `DOC-${Date.now()}`,
          name: `${serviceCode}-Authorization-NOA.pdf`,
          type: "Notice of Action (NOA)",
          fileSize: "1.4 MB",
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: "Marcus Vance (Agency Admin)",
          verificationStatus: status === "APPROVED" ? "VERIFIED" : "PENDING_REVIEW",
        },
      ],
      notes,
      statusHistory: recordToEdit?.statusHistory || [
        {
          status,
          changedAt: new Date().toISOString().slice(0, 10),
          changedBy: "Marcus Vance (Agency Admin)",
          reason: isEditing ? "Record updated by Agency Admin" : "Initial authorization registered",
        },
      ],
    };

    onSave(savedRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Prior Authorization: ${recordToEdit?.id}` : "Create Prior Authorization"}
      description="Record payer approval for non-medical home care or skilled home health care services"
      maxWidth="3xl"
      icon={<ShieldCheck className="w-5 h-5 text-[#3D6B22]" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isEditing ? "Save Authorization Changes" : "Create Authorization"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        {/* Distinction Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3D6B22] mt-1.5 shrink-0" />
          <p>
            <strong>Payer Approval Scope:</strong> Authorization is payer-specific permission for units, codes, and dates. Ensure the <strong>Authorization Ref #</strong> matches the official Notice of Action (different from the member&apos;s Policy ID).
          </p>
        </div>

        {/* 1. Patient & Household */}
        <FormSection
          title="1. Patient & Household Context"
          badge={<UserCheck className="w-3.5 h-3.5 text-[#3D6B22]" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FormLabel required>Patient Profile</FormLabel>
            <FormSelect value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel>Linked Household</FormLabel>
            <FormInput value={householdName} disabled />
          </div>
        </div>

        {/* 2. Care Category & Service Specification */}
        <FormSection
          title="2. Care Category & Service Line"
          badge={<DollarSign className="w-3.5 h-3.5 text-[#3D6B22]" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FormLabel required>Care Category</FormLabel>
            <FormSelect
              value={careCategory}
              onChange={(e) => setCareCategory(e.target.value as CareCategory)}
            >
              <option value="NON_MEDICAL">Non-Medical Home Care</option>
              <option value="SKILLED_CARE">Skilled Home Health Care</option>
            </FormSelect>
          </div>

          <div className="sm:col-span-2">
            <FormLabel>Service Preset Shortcut</FormLabel>
            <FormSelect onChange={(e) => handleServicePresetChange(e.target.value)} defaultValue="">
              <option value="" disabled>Select a standard service line...</option>
              <option value="IHSS">Non-Medical: IHSS Personal Care (S5130)</option>
              <option value="FAMILY_CG">Non-Medical: Family Caregiver Pediatric (S5125)</option>
              <option value="RESPITE">Non-Medical: Respite Care (T1005)</option>
              <option value="SN_CNA">Skilled: Nursing / CNA Care (T1019)</option>
              <option value="PT">Skilled: Physical Therapy (G0151)</option>
              <option value="OT">Skilled: Occupational Therapy (G0152)</option>
              <option value="ST">Skilled: Speech-Language Pathology (G0153)</option>
            </FormSelect>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FormLabel required>Service Name</FormLabel>
            <FormInput value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          </div>
          <div>
            <FormLabel required>HCPCS / CPT Code</FormLabel>
            <FormInput value={serviceCode} onChange={(e) => setServiceCode(e.target.value)} />
          </div>
          <div>
            <FormLabel>Modifier</FormLabel>
            <FormInput value={modifier} onChange={(e) => setModifier(e.target.value)} placeholder="e.g. U2, TG" />
          </div>
        </div>

        {/* 3. Payer & Identification */}
        <FormSection
          title="3. Payer & Identifiers"
          badge={<ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FormLabel required>Payer Organization</FormLabel>
            <FormSelect value={payer} onChange={(e) => setPayer(e.target.value)}>
              <option value="Colorado Medicaid">Colorado Medicaid (Health First)</option>
              <option value="CES Waiver">CES Waiver (Children's Extensive Support)</option>
              <option value="CHRP Waiver">CHRP Waiver</option>
              <option value="SLS Waiver">SLS Waiver</option>
              <option value="UnitedHealthcare">UnitedHealthcare Commercial</option>
              <option value="Kaiser Permanente">Kaiser Permanente</option>
              <option value="VA Community Care">VA Community Care</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel required>Authorization Reference #</FormLabel>
            <FormInput
              value={authRefNumber}
              onChange={(e) => setAuthRefNumber(e.target.value)}
              placeholder="e.g. AUTH-2026-9941"
            />
          </div>
          <div>
            <FormLabel required>Insurance Policy / Member ID</FormLabel>
            <FormInput
              value={insurancePolicyId}
              onChange={(e) => setInsurancePolicyId(e.target.value)}
              placeholder="e.g. CO-MED-994821"
            />
          </div>
        </div>

        {/* 4. Units & Validity Term */}
        <FormSection
          title="4. Approved Units & Effective Term"
          badge={<Calendar className="w-3.5 h-3.5 text-[#3D6B22]" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <FormLabel required>Unit Measure</FormLabel>
            <FormSelect
              value={unitMeasure}
              onChange={(e) => setUnitMeasure(e.target.value as UnitMeasure)}
            >
              <option value="15-min Units">15-min Units</option>
              <option value="Visits">Visits</option>
              <option value="Hours">Hours</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel required>Total Approved Units</FormLabel>
            <FormInput
              type="number"
              value={unitsApproved}
              onChange={(e) => setUnitsApproved(Number(e.target.value))}
            />
          </div>
          <div>
            <FormLabel>Units Used to Date</FormLabel>
            <FormInput
              type="number"
              value={unitsUsed}
              onChange={(e) => setUnitsUsed(Number(e.target.value))}
            />
          </div>
          <div>
            <FormLabel>Weekly Cap</FormLabel>
            <FormInput
              type="number"
              value={weeklyCapUnits}
              onChange={(e) => setWeeklyCapUnits(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <FormLabel required>Effective Date</FormLabel>
            <FormInput type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </div>
          <div>
            <FormLabel required>Expiration Date</FormLabel>
            <FormInput type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
          </div>
          <div>
            <FormLabel required>Approval Lifecycle Status</FormLabel>
            <FormSelect
              value={status}
              onChange={(e) => setStatus(e.target.value as AuthorizationStatus)}
            >
              <option value="APPROVED">APPROVED (Active & Operational)</option>
              <option value="REQUESTED">REQUESTED (Pending Determination)</option>
              <option value="PENDING">PENDING (Awaiting Docs / Review)</option>
              <option value="DENIED">DENIED (Denied by Payer)</option>
              <option value="EXPIRED">EXPIRED (Term Concluded)</option>
            </FormSelect>
          </div>
        </div>

        {/* 5. Case Manager Details */}
        <FormSection
          title="5. Case Manager / Coordinator"
          badge={<FileSignature className="w-3.5 h-3.5 text-[#3D6B22]" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FormLabel>Case Manager Name</FormLabel>
            <FormInput value={caseManagerName} onChange={(e) => setCaseManagerName(e.target.value)} />
          </div>
          <div>
            <FormLabel>Case Management Agency</FormLabel>
            <FormInput value={caseManagerAgency} onChange={(e) => setCaseManagerAgency(e.target.value)} />
          </div>
          <div>
            <FormLabel>Case Manager Phone</FormLabel>
            <FormInput value={caseManagerPhone} onChange={(e) => setCaseManagerPhone(e.target.value)} />
          </div>
          <div>
            <FormLabel>Case Manager Email</FormLabel>
            <FormInput value={caseManagerEmail} onChange={(e) => setCaseManagerEmail(e.target.value)} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
