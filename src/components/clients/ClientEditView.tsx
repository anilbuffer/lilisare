"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Home,
  HeartHandshake,
  FileText,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  getClientById,
  getClientsFromStorage,
  saveClientsToStorage,
  getClientDiagnosis,
  getClientRiskLevel,
} from "@/lib/clients/mockData";
import { MOCK_HOUSEHOLDS } from "@/lib/households/mockData";
import { ClientRecord, CareArrangementType, ClientStatus, ClientRiskLevel, OnHoldReason } from "@/types/client";
import { LILISARE_SERVICES } from "@/lib/services";
import { toast } from "sonner";
import { usePortalPermissions } from "@/lib/rbac/usePortalPermissions";

interface ClientEditViewProps {
  clientId: string;
  baseBackPath?: string;
}

export function ClientEditView({ clientId, baseBackPath = "/clients" }: ClientEditViewProps) {
  const router = useRouter();
  const perms = usePortalPermissions();
  const [client, setClient] = useState<ClientRecord | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [status, setStatus] = useState<ClientStatus>("Active");
  const [onHoldReason, setOnHoldReason] = useState<OnHoldReason>("Hospital");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [riskLevel, setRiskLevel] = useState<ClientRiskLevel>("Low Risk");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [careType, setCareType] = useState<CareArrangementType>("Family Care");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactRel, setContactRel] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Care Plan
  const [program, setProgram] = useState("");
  const [authorizedHours, setAuthorizedHours] = useState(40);
  const [frequency, setFrequency] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Caregiver
  const [primaryCaregiverName, setPrimaryCaregiverName] = useState("");
  const [primaryCaregiverRel, setPrimaryCaregiverRel] = useState("");
  const [primaryCaregiverPhone, setPrimaryCaregiverPhone] = useState("");

  // Authorization
  const [authNumber, setAuthNumber] = useState("");
  const [authExpiry, setAuthExpiry] = useState("");
  const [payerName, setPayerName] = useState("");

  useEffect(() => {
    const found = getClientById(clientId);
    if (found) {
      setClient(found);
      setName(found.name);
      setPreferredName(found.preferredName || "");
      setDob(found.dob);
      setGender(found.gender);
      setPrimaryLanguage(found.primaryLanguage);
      setStatus(found.status);
      setOnHoldReason(found.onHoldReason || "Hospital");
      setExpectedReturnDate(found.expectedReturnDate || "");
      setRiskLevel(getClientRiskLevel(found));
      setPrimaryDiagnosis(getClientDiagnosis(found));
      setCareType(found.careType);

      setContactName(found.primaryContact.name);
      setContactRel(found.primaryContact.relationship);
      setContactPhone(found.primaryContact.phone);
      setContactEmail(found.primaryContact.email);

      setProgram(found.carePlan.program);
      setAuthorizedHours(found.carePlan.authorizedWeeklyHours);
      setFrequency(found.carePlan.frequency);
      setSpecialInstructions(found.carePlan.specialInstructions);

      if (found.assignedCareTeam.primaryCaregiver) {
        setPrimaryCaregiverName(found.assignedCareTeam.primaryCaregiver.name);
        setPrimaryCaregiverRel(found.assignedCareTeam.primaryCaregiver.relationship);
        setPrimaryCaregiverPhone(found.assignedCareTeam.primaryCaregiver.phone);
      }

      setAuthNumber(found.authorization.authNumber);
      setAuthExpiry(found.authorization.expiryDate);
      setPayerName(found.authorization.payer);
    }
  }, [clientId]);

  if (!client) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Client Record Not Found</h2>
        <Link
          href={baseBackPath}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients Workspace
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const safeStatus: ClientStatus =
      !perms.clients.canDischarge && status === "Discharged"
        ? client.status
        : status;

    const updated: ClientRecord = {
      ...client,
      name,
      preferredName,
      dob,
      gender,
      primaryLanguage,
      status: safeStatus,
      onHoldReason: safeStatus === "On Hold" ? onHoldReason : undefined,
      expectedReturnDate: safeStatus === "On Hold" ? expectedReturnDate || undefined : undefined,
      riskLevel,
      primaryDiagnosis: primaryDiagnosis.trim() || client.primaryDiagnosis,
      careType,
      primaryContact: {
        ...client.primaryContact,
        name: contactName,
        relationship: contactRel,
        phone: contactPhone,
        email: contactEmail,
      },
      carePlan: {
        ...client.carePlan,
        program,
        authorizedWeeklyHours: Number(authorizedHours),
        frequency,
        specialInstructions,
      },
      assignedCareTeam: {
        ...client.assignedCareTeam,
        primaryCaregiver: primaryCaregiverName
          ? {
            id: client.assignedCareTeam.primaryCaregiver?.id || "CG-NEW",
            name: primaryCaregiverName,
            relationship: primaryCaregiverRel,
            classification: client.assignedCareTeam.primaryCaregiver?.classification || "W-2",
            status: client.assignedCareTeam.primaryCaregiver?.status || "Active",
            phone: primaryCaregiverPhone || contactPhone,
            email: client.assignedCareTeam.primaryCaregiver?.email || contactEmail,
          }
          : null,
      },
      authorization: perms.clients.canEditAuthorization
        ? {
          ...client.authorization,
          authNumber,
          expiryDate: authExpiry,
          payer: payerName,
        }
        : client.authorization,
      updatedAtRelative: "Just now",
      activity: [
        {
          id: `ACT-${Date.now()}`,
          timestamp: "Just now",
          type: "note",
          author: "Agency Admin",
          authorRole: "Operational Administrator",
          title: "Client Profile Updated",
          details: "Administrative changes made to demographics, care plan, and care team assignments.",
        },
        ...client.activity,
      ],
    };

    const all = getClientsFromStorage();
    const index = all.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      all[index] = updated;
      saveClientsToStorage(all);
    }

    toast.success(`Client ${updated.name} updated successfully!`);
    router.push(`${baseBackPath}/${client.id}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href={`${baseBackPath}/${client.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#3D6B22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Client Profile ({client.id})
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Client Record: {client.name}
          </h1>
          <p className="text-xs text-slate-500">
            Dedicated administrative record update page (full workspace view).
          </p>
        </div>

        <span className="text-xs  font-bold bg-[#E3F1D9] text-[#1E5622] px-3 py-1 rounded-full border border-[#1E5622]/20 self-start sm:self-auto">
          {client.id} • {client.household.name}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Demographics & Status */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Client Demographics & Status
            </h2>
            <span className="text-xs text-slate-400 ">RECORD CORE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Name</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Service Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              >
                <option value="Active">Active (Receiving Care)</option>
                <option value="On Hold">On Hold</option>
                {perms.clients.canDischarge && (
                  <option value="Discharged">Discharged (Formally Ended)</option>
                )}
              </select>
            </div>

            {status === "On Hold" && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">On Hold Reason</label>
                  <select
                    value={onHoldReason}
                    onChange={(e) => setOnHoldReason(e.target.value as OnHoldReason)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Authorization pending">Authorization pending</option>
                    <option value="Payment issue">Payment issue</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as ClientRiskLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              >
                <option value="Low Risk">Low Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Primary Diagnosis</label>
              <input
                type="text"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="e.g. Congestive Heart Failure, Mobility Support"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Primary Language</label>
              <input
                type="text"
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Primary Family Contact */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Primary Family Contact & Guardian
            </h2>
            <span className="text-xs text-slate-400 ">GUARDIANSHIP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Relationship</label>
              <input
                type="text"
                value={contactRel}
                onChange={(e) => setContactRel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Care Arrangement, Program & Hours */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Care Arrangement & Program Services
            </h2>
            <span className="text-xs text-slate-400 ">CARE SCOPE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Care Arrangement</label>
              <select
                value={careType}
                onChange={(e) => setCareType(e.target.value as CareArrangementType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              >
                <option value="Family Care">Family Care</option>
                <option value="Live-In Care">Live-In Care</option>
                <option value="Family Friend Care">Family Friend Care</option>
                <option value="Attendant Care">Attendant Care</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Care Program / Service Line</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 cursor-pointer"
              >
                {program && !LILISARE_SERVICES.some((s) => s.name === program) && (
                  <option value={program}>{program} (Current)</option>
                )}
                {LILISARE_SERVICES.map((svc) => (
                  <option key={svc.id} value={svc.name}>
                    {svc.order}. {svc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Authorized Weekly Hours
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={authorizedHours}
                onChange={(e) => setAuthorizedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Service Schedule / Frequency
              </label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Special Care Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Assigned Primary Caregiver */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Assigned Primary Caregiver
            </h2>
            <span className="text-xs text-slate-400 ">STAFFING</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Caregiver Name</label>
              <input
                type="text"
                value={primaryCaregiverName}
                onChange={(e) => setPrimaryCaregiverName(e.target.value)}
                placeholder="Leave blank if unassigned"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Relationship</label>
              <input
                type="text"
                value={primaryCaregiverRel}
                onChange={(e) => setPrimaryCaregiverRel(e.target.value)}
                placeholder="e.g. Mother (Paid W-2 Caregiver)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Caregiver Phone</label>
              <input
                type="tel"
                value={primaryCaregiverPhone}
                onChange={(e) => setPrimaryCaregiverPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </Card>

        {/* Section 5: Authorization Information */}
        <Card className="p-6 border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Service Authorization & Payer
            </h2>
            <span className="text-xs text-slate-400">
              {perms.clients.canEditAuthorization ? "AUTHORIZATION" : "READ-ONLY (ADMIN APPROVAL)"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Authorization #</label>
              <input
                type="text"
                value={authNumber}
                disabled={!perms.clients.canEditAuthorization}
                onChange={(e) => setAuthNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payer Organization</label>
              <input
                type="text"
                value={payerName}
                disabled={!perms.clients.canEditAuthorization}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expiration Date</label>
              <input
                type="date"
                value={authExpiry}
                disabled={!perms.clients.canEditAuthorization}
                onChange={(e) => setAuthExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Action Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href={`${baseBackPath}/${client.id}`}
            className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel Changes
          </Link>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3D6B22] hover:bg-[#345C1D] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(61,107,34,0.25)] cursor-pointer"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save & Update Client Record</span>
          </button>
        </div>
      </form>
    </div>
  );
}
