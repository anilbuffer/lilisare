"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  FormSection,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormButtonPrimary,
  FormButtonCancel,
} from "@/components/ui/FormControls";
import {
  AdminIntakeReferralItem,
  ReferralPriority,
  ReferralStatus,
  getAdminReferralById,
  getAdminReferralsFromStorage,
  saveAdminReferralsToStorage,
} from "@/lib/intake-referrals/adminIntakeReferralsData";
import { LILISARE_SERVICES } from "@/lib/services";
import { toast } from "sonner";

interface AdminIntakeReferralEditViewProps {
  referralId: string;
}

export function AdminIntakeReferralEditView({
  referralId,
}: AdminIntakeReferralEditViewProps) {
  const router = useRouter();
  const [referral, setReferral] = useState<AdminIntakeReferralItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState(70);
  const [gender, setGender] = useState("Female");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const [referralSource, setReferralSource] = useState("");
  const [referralSourceContact, setReferralSourceContact] = useState("");
  const [assignedCoordinator, setAssignedCoordinator] = useState("");
  const [priority, setPriority] = useState<ReferralPriority>("Standard");
  const [status, setStatus] = useState<ReferralStatus>("New Referral");

  const [program, setProgram] = useState("");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [requestedServicesText, setRequestedServicesText] = useState("");
  const [triageNotes, setTriageNotes] = useState("");

  const [payerName, setPayerName] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(true);
  const [targetStartDate, setTargetStartDate] = useState("");
  const [estimatedHoursPerWeek, setEstimatedHoursPerWeek] = useState(25);

  useEffect(() => {
    setIsMounted(true);
    const found = getAdminReferralById(referralId);
    if (found) {
      setReferral(found);
      setPatientName(found.patientName);
      setAge(found.age);
      setGender(found.gender);
      setPhone(found.phone);
      setEmail(found.email);
      setAddress(found.address);
      setCity(found.city);
      setZip(found.zip);

      setReferralSource(found.referralSource);
      setReferralSourceContact(found.referralSourceContact || "");
      setAssignedCoordinator(found.assignedCoordinator);
      setPriority(found.priority);
      setStatus(found.status);

      setProgram(found.program);
      setPrimaryDiagnosis(found.primaryDiagnosis);
      setRequestedServicesText(found.requestedServices.join(", "));
      setTriageNotes(found.triageNotes);

      setPayerName(found.payerName);
      setInsuranceVerified(found.insuranceVerified);
      setTargetStartDate(found.targetStartDate);
      setEstimatedHoursPerWeek(found.estimatedHoursPerWeek);
    }
  }, [referralId]);

  if (!isMounted) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Referral Editor...</p>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Referral Record Not Found</h2>
        <Link
          href="/admin/intake-referrals"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Referrals Directory</span>
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      toast.error("Client legal name is required.");
      return;
    }

    const services = requestedServicesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: AdminIntakeReferralItem = {
      ...referral,
      patientName: patientName.trim(),
      age: Number(age) || referral.age,
      gender,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      zip: zip.trim(),
      referralSource: referralSource.trim(),
      referralSourceContact: referralSourceContact.trim() || undefined,
      assignedCoordinator: assignedCoordinator.trim(),
      priority,
      status,
      program,
      primaryDiagnosis: primaryDiagnosis.trim(),
      requestedServices: services.length > 0 ? services : referral.requestedServices,
      triageNotes: triageNotes.trim(),
      payerName: payerName.trim(),
      insuranceVerified,
      targetStartDate: targetStartDate.trim(),
      estimatedHoursPerWeek: Number(estimatedHoursPerWeek) || 0,
    };

    const all = getAdminReferralsFromStorage();
    const index = all.findIndex(
      (r) => r.id.toLowerCase() === referral.id.toLowerCase()
    );
    if (index !== -1) {
      all[index] = updated;
      saveAdminReferralsToStorage(all);
    } else {
      saveAdminReferralsToStorage([updated, ...all]);
    }

    toast.success(`Referral ${updated.id} (${updated.patientName}) updated successfully!`);
    router.push(`/admin/intake-referrals/${referral.id}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <Link
            href={`/admin/intake-referrals/${referral.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Referral Profile ({referral.id})</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Referral: {referral.patientName}
          </h1>
          <p className="text-xs text-slate-500">
            Update client demographics, referral source, clinical triage directives, and payer details.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E3F1D9] text-[#1E5622] px-3 py-1.5 rounded-full border border-[#1E5622]/20 self-start sm:self-auto">
          {referral.id} • {referral.status}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="1. Client Demographics & Residence"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel required>Client Full Name</FormLabel>
              <FormInput
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Age</FormLabel>
              <FormInput
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Gender</FormLabel>
              <FormSelect value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Primary Telephone</FormLabel>
              <FormInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Email Address</FormLabel>
              <FormInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div>
              <FormLabel>ZIP Code</FormLabel>
              <FormInput
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="2. Referral Source & Pipeline Stage"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>Pipeline Status</FormLabel>
              <FormSelect
                value={status}
                onChange={(e) => setStatus(e.target.value as ReferralStatus)}
              >
                <option value="New Referral">New Referral</option>
                <option value="Clinical Assessment">Clinical Assessment</option>
                <option value="Documents & Auth">Documents & Auth</option>
                <option value="Ready for Staffing">Ready for Staffing</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Archived">Archived</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel>Priority Tier</FormLabel>
              <FormSelect
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReferralPriority)}
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Standard">Standard</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel>Assigned Coordinator</FormLabel>
              <FormInput
                type="text"
                value={assignedCoordinator}
                onChange={(e) => setAssignedCoordinator(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Referral Source</FormLabel>
              <FormInput
                type="text"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Referral Contact Person</FormLabel>
              <FormInput
                type="text"
                value={referralSourceContact}
                onChange={(e) => setReferralSourceContact(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="3. Clinical Diagnosis & Triage Directives"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Primary Clinical Diagnosis</FormLabel>
              <FormInput
                type="text"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Requested Services (comma-separated)</FormLabel>
              <FormInput
                type="text"
                value={requestedServicesText}
                onChange={(e) => setRequestedServicesText(e.target.value)}
              />
            </div>
          </div>

          <div>
            <FormLabel>Triage & Assessment Notes</FormLabel>
            <FormTextarea
              rows={3}
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="4. Benefit Program & Payer Readiness"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Care Program</FormLabel>
              <FormSelect value={program} onChange={(e) => setProgram(e.target.value)}>
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
              <FormLabel>Primary Payer</FormLabel>
              <FormInput
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <FormLabel>Target Start Date</FormLabel>
              <FormInput
                type="text"
                value={targetStartDate}
                onChange={(e) => setTargetStartDate(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Estimated Hours / Week</FormLabel>
              <FormInput
                type="number"
                min={0}
                max={168}
                value={estimatedHoursPerWeek}
                onChange={(e) => setEstimatedHoursPerWeek(Number(e.target.value))}
              />
            </div>
            <div className="pb-2.5">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={insuranceVerified}
                  onChange={(e) => setInsuranceVerified(e.target.checked)}
                  className="rounded border-slate-300 text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span>Payer Eligibility Verified</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <FormButtonCancel
            onClick={() => router.push(`/admin/intake-referrals/${referral.id}`)}
          >
            Cancel
          </FormButtonCancel>
          <FormButtonPrimary type="submit">
            <Save className="w-4 h-4" />
            <span>Save Referral Changes</span>
          </FormButtonPrimary>
        </div>
      </form>
    </div>
  );
}
