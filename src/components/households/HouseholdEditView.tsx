"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import {
  Household,
  getHouseholdById,
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
  MOCK_HOUSEHOLDS,
} from "@/lib/households/mockData";
import { LILISARE_SERVICES } from "@/lib/services";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";
import { toast } from "sonner";

interface HouseholdEditViewProps {
  householdId: string;
  baseBackPath?: string;
}

export function HouseholdEditView({
  householdId,
  baseBackPath = "/admin/households",
}: HouseholdEditViewProps) {
  const router = useRouter();
  const perms = usePortalPermissions();
  const cleanBase = baseBackPath.replace(/\/$/, "");

  const [household, setHousehold] = useState<Household | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [program, setProgram] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientRelationship, setClientRelationship] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelationship, setCaregiverRelationship] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [caregiverEmail, setCaregiverEmail] = useState("");

  const [authorizedHours, setAuthorizedHours] = useState(40);
  const [scheduledHours, setScheduledHours] = useState(40);
  const [authStatus, setAuthStatus] = useState<Household["authStatus"]>("Approved");
  const [authExpiry, setAuthExpiry] = useState("");

  const [caseManagerName, setCaseManagerName] = useState("");
  const [caseManagerAgency, setCaseManagerAgency] = useState("");
  const [caseManagerPhone, setCaseManagerPhone] = useState("");
  const [caseManagerEmail, setCaseManagerEmail] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const found =
      getHouseholdById(householdId) ||
      MOCK_HOUSEHOLDS.find(
        (h) =>
          h.id.toLowerCase() === householdId.toLowerCase() ||
          h.code.toLowerCase() === householdId.toLowerCase()
      ) ||
      null;

    if (found) {
      setHousehold(found);
      setName(found.name);
      setAddress(found.address);
      setCity(found.city);
      setStateCode(found.state);
      setZip(found.zip);
      setPhone(found.phone);
      setProgram(found.program);

      setClientName(found.client.name);
      setClientRelationship(found.client.relationship);
      setClientPhone(found.client.phone);
      setClientEmail(found.client.email);

      setCaregiverName(found.primaryCaregiver.name);
      setCaregiverRelationship(found.primaryCaregiver.relationship);
      setCaregiverPhone(found.primaryCaregiver.phone);
      setCaregiverEmail(found.primaryCaregiver.email);

      setAuthorizedHours(found.authorizedHoursPerWeek);
      setScheduledHours(found.scheduledHoursPerWeek);
      setAuthStatus(found.authStatus);
      setAuthExpiry(found.authExpiry);

      setCaseManagerName(found.caseManager.name);
      setCaseManagerAgency(found.caseManager.agency);
      setCaseManagerPhone(found.caseManager.phone);
      setCaseManagerEmail(found.caseManager.email);
    }
  }, [householdId]);

  if (!isMounted) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Household Editor...</p>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
        <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Household Record Not Found</h2>
        <Link
          href={cleanBase}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Households Directory</span>
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Household name is required.");
      return;
    }

    const safeAuthStatus = perms.households.canApproveAuthorization
      ? authStatus
      : household.authStatus;

    const updated: Household = {
      ...household,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: stateCode.trim(),
      zip: zip.trim(),
      phone: phone.trim(),
      program,
      authorizedHoursPerWeek: Number(authorizedHours) || 0,
      scheduledHoursPerWeek: Number(scheduledHours) || 0,
      authStatus: safeAuthStatus,
      authExpiry,
      client: {
        ...household.client,
        name: clientName.trim(),
        relationship: clientRelationship.trim(),
        phone: clientPhone.trim(),
        email: clientEmail.trim(),
      },
      primaryCaregiver: {
        ...household.primaryCaregiver,
        name: caregiverName.trim(),
        relationship: caregiverRelationship.trim(),
        phone: caregiverPhone.trim(),
        email: caregiverEmail.trim(),
      },
      caseManager: {
        name: caseManagerName.trim(),
        agency: caseManagerAgency.trim(),
        phone: caseManagerPhone.trim(),
        email: caseManagerEmail.trim(),
      },
    };

    const all = getHouseholdsFromStorage();
    const index = all.findIndex(
      (h) => h.id.toLowerCase() === household.id.toLowerCase()
    );
    if (index !== -1) {
      all[index] = updated;
      saveHouseholdsToStorage(all);
    } else {
      saveHouseholdsToStorage([updated, ...all]);
    }

    toast.success(`Household ${updated.name} updated successfully!`);
    router.push(`${cleanBase}/${household.id}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <Link
            href={`${cleanBase}/${household.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Household Profile ({household.code})</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Household: {household.name}
          </h1>
          <p className="text-xs text-slate-500">
            Update family residence, linked client & caregiver pairing, service authorization, and case manager details.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E3F1D9] text-[#1E5622] px-3 py-1.5 rounded-full border border-[#1E5622]/20 self-start sm:self-auto">
          {household.code} • {household.authStatus}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Residence & Primary Contact */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection title="1. Household Residence & Contact" badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel required>Household Name</FormLabel>
              <FormInput
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Primary Telephone</FormLabel>
              <FormInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <FormLabel>Street Address</FormLabel>
              <FormInput
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>City</FormLabel>
              <FormInput
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FormLabel>State</FormLabel>
                <FormInput
                  type="text"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                />
              </div>
              <div>
                <FormLabel>ZIP</FormLabel>
                <FormInput
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Connected Client & Caregiver Pairing */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection title="2. Connected Client & Primary Caregiver" badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel required>Care Recipient (Client)</FormLabel>
              <FormInput
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Client Relationship / Age Note</FormLabel>
              <FormInput
                type="text"
                value={clientRelationship}
                onChange={(e) => setClientRelationship(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Client Phone</FormLabel>
              <FormInput
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Client Email</FormLabel>
              <FormInput
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel required>Designated Primary Caregiver</FormLabel>
              <FormInput
                type="text"
                required
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Caregiver Relationship / Role</FormLabel>
              <FormInput
                type="text"
                value={caregiverRelationship}
                onChange={(e) => setCaregiverRelationship(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Caregiver Phone</FormLabel>
              <FormInput
                type="tel"
                value={caregiverPhone}
                onChange={(e) => setCaregiverPhone(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Caregiver Email</FormLabel>
              <FormInput
                type="email"
                value={caregiverEmail}
                onChange={(e) => setCaregiverEmail(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Program & Service Authorization */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection title="3. Service Program & Authorization Parameters" badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Care Program</FormLabel>
              <FormSelect
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              >
                {!LILISARE_SERVICES.some((s) => s.name === program) && (
                  <option value={program}>{program}</option>
                )}
                {LILISARE_SERVICES.map((svc) => (
                  <option key={svc.id} value={svc.name}>
                    {svc.name}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <FormLabel>Authorization Status</FormLabel>
              <FormSelect
                value={authStatus}
                disabled={!perms.households.canApproveAuthorization}
                onChange={(e) =>
                  setAuthStatus(e.target.value as Household["authStatus"])
                }
              >
                <option value="Approved">Approved</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>Authorized Hours / Week</FormLabel>
              <FormInput
                type="number"
                min={0}
                max={168}
                value={authorizedHours}
                onChange={(e) => setAuthorizedHours(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Scheduled Hours / Week</FormLabel>
              <FormInput
                type="number"
                min={0}
                max={168}
                value={scheduledHours}
                onChange={(e) => setScheduledHours(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Authorization Expiry Date</FormLabel>
              <FormInput
                type="date"
                value={authExpiry}
                onChange={(e) => setAuthExpiry(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Case Manager & Agency */}
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection title="4. Assigned Case Manager & State Agency" badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Case Manager Name</FormLabel>
              <FormInput
                type="text"
                value={caseManagerName}
                onChange={(e) => setCaseManagerName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>State / Waiver Agency</FormLabel>
              <FormInput
                type="text"
                value={caseManagerAgency}
                onChange={(e) => setCaseManagerAgency(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Case Manager Telephone</FormLabel>
              <FormInput
                type="tel"
                value={caseManagerPhone}
                onChange={(e) => setCaseManagerPhone(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Case Manager Email</FormLabel>
              <FormInput
                type="email"
                value={caseManagerEmail}
                onChange={(e) => setCaseManagerEmail(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <FormButtonCancel onClick={() => router.push(`${cleanBase}/${household.id}`)}>
            Cancel
          </FormButtonCancel>
          <FormButtonPrimary type="submit">
            <Save className="w-4 h-4" />
            <span>Save Household Changes</span>
          </FormButtonPrimary>
        </div>
      </form>
    </div>
  );
}
