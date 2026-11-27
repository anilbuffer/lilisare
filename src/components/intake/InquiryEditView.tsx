"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Save } from "lucide-react";
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
  InquiryRecord,
  InquiryStage,
  ReferralSourceType,
  ContactMethod,
} from "@/types/intake";
import { getInquiryById } from "@/lib/intake/mockIntakeData";
import {
  getIntakeInquiriesFromStorage,
  saveIntakeInquiriesToStorage,
  syncInquiryStageToAdmin,
  syncInquiryToAdminReferral,
  normalizePipelineStage,
} from "@/lib/intake/intakeSync";
import { LILISARE_SERVICES } from "@/lib/services";
import { toast } from "sonner";

interface InquiryEditViewProps {
  inquiryId: string;
  baseBackPath?: string;
}

export function InquiryEditView({
  inquiryId,
  baseBackPath = "/intake/pipeline",
}: InquiryEditViewProps) {
  const router = useRouter();
  const cleanBase = baseBackPath.replace(/\/$/, "");

  const [inquiry, setInquiry] = useState<InquiryRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [familyName, setFamilyName] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>("Phone");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [branch, setBranch] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientAge, setClientAge] = useState(70);
  const [clientGender, setClientGender] = useState("Female");
  const [mobilityNotes, setMobilityNotes] = useState("");

  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelationship, setCaregiverRelationship] = useState("");

  const [stage, setStage] = useState<InquiryStage>("New Referral");
  const [urgency, setUrgency] = useState<InquiryRecord["urgency"]>("Normal");
  const [source, setSource] = useState<ReferralSourceType>("Website");
  const [organization, setOrganization] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [programInterest, setProgramInterest] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [targetStartDate, setTargetStartDate] = useState("");
  const [supportRequirements, setSupportRequirements] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const all = getIntakeInquiriesFromStorage();
    const found =
      all.find((i) => i.id.toLowerCase() === inquiryId.toLowerCase()) ||
      getInquiryById(inquiryId) ||
      null;

    if (found) {
      setInquiry(found);
      setFamilyName(found.familyName);
      setPrimaryContact(found.familyInfo.primaryContact);
      setRelationship(found.familyInfo.relationship);
      setPhone(found.familyInfo.phone);
      setEmail(found.familyInfo.email);
      setPreferredContactMethod(found.familyInfo.preferredContactMethod);

      setAddress(found.familyInfo.householdLocation.address);
      setCity(found.familyInfo.householdLocation.city);
      setStateCode(found.familyInfo.householdLocation.state);
      setZip(found.familyInfo.householdLocation.zip);
      setBranch(found.branch);

      setClientName(found.familyInfo.clientInfo.name);
      setClientAge(found.familyInfo.clientInfo.age);
      setClientGender(found.familyInfo.clientInfo.gender || "Female");
      setMobilityNotes(found.familyInfo.clientInfo.mobilityNotes || "");

      setCaregiverName(found.familyInfo.potentialCaregiver?.name || "");
      setCaregiverRelationship(found.familyInfo.potentialCaregiver?.relationship || "");

      setStage(normalizePipelineStage(found.stage));
      setUrgency(found.urgency);
      setSource(found.source);
      setOrganization(found.referralInfo.organization);
      setCoordinatorName(found.referralInfo.assignedCoordinator.name);
      setProgramInterest(found.careRequirements.programInterest);
      setHoursPerWeek(found.careRequirements.hoursPerWeek);
      setTargetStartDate(found.careRequirements.targetStartDate || "Immediate");
      setSupportRequirements(found.careRequirements.supportRequirements);
    }
  }, [inquiryId]);

  if (!isMounted) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <div className="w-6 h-6 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading Inquiry Editor...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 text-center text-slate-500">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Inquiry Record Not Found</h2>
        <Link
          href={cleanBase}
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#3D6B22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pipeline & Inquiries</span>
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryContact.trim() || !clientName.trim()) {
      toast.error("Primary contact and loved one name are required.");
      return;
    }

    const updated: InquiryRecord = {
      ...inquiry,
      familyName: familyName.trim(),
      stage,
      urgency,
      source,
      branch: branch.trim(),
      familyInfo: {
        ...inquiry.familyInfo,
        primaryContact: primaryContact.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
        email: email.trim(),
        preferredContactMethod,
        householdLocation: {
          ...inquiry.familyInfo.householdLocation,
          address: address.trim(),
          city: city.trim(),
          state: stateCode.trim(),
          zip: zip.trim(),
          branch: branch.trim(),
        },
        clientInfo: {
          ...inquiry.familyInfo.clientInfo,
          name: clientName.trim(),
          age: Number(clientAge) || inquiry.familyInfo.clientInfo.age,
          gender: clientGender,
          mobilityNotes: mobilityNotes.trim(),
        },
        potentialCaregiver: caregiverName.trim()
          ? {
            ...inquiry.familyInfo.potentialCaregiver,
            name: caregiverName.trim(),
            relationship: caregiverRelationship.trim() || "Family Caregiver",
          }
          : undefined,
      },
      referralInfo: {
        ...inquiry.referralInfo,
        source,
        organization: organization.trim(),
        assignedCoordinator: {
          ...inquiry.referralInfo.assignedCoordinator,
          name: coordinatorName.trim(),
        },
      },
      careRequirements: {
        ...inquiry.careRequirements,
        programInterest,
        hoursPerWeek: Number(hoursPerWeek) || 0,
        targetStartDate: targetStartDate.trim(),
        supportRequirements: supportRequirements.trim(),
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "note",
          author: coordinatorName.trim() || "Intake Coordinator",
          timestamp: "Just now",
          title: "Inquiry Profile Edited",
          details: `Updated family, client, caregiver, and care requirement details.`,
        },
        ...inquiry.timeline,
      ],
    };

    const all = getIntakeInquiriesFromStorage();
    const index = all.findIndex(
      (i) => i.id.toLowerCase() === inquiry.id.toLowerCase()
    );
    if (index !== -1) {
      all[index] = updated;
      saveIntakeInquiriesToStorage(all);
    } else {
      saveIntakeInquiriesToStorage([updated, ...all]);
    }
    syncInquiryToAdminReferral(updated);

    toast.success(`Inquiry ${updated.id} updated successfully!`);
    router.push(`${cleanBase}/${inquiry.id}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-2">
          <Link
            href={`${cleanBase}/${inquiry.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inquiry Profile ({inquiry.id})</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Inquiry: {inquiry.familyName}
          </h1>
          <p className="text-xs text-slate-500">
            Update family contact details, loved one profile, caregiver intent, and program requirements.
          </p>
        </div>

        <span className="text-xs font-bold bg-[#E3F1D9] text-[#1E5622] px-3 py-1.5 rounded-full border border-[#1E5622]/20 self-start sm:self-auto">
          {inquiry.id} • {inquiry.stage}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="1. Family Contact & Household Location"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel required>Family Unit Name</FormLabel>
              <FormInput
                type="text"
                required
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel required>Primary Contact</FormLabel>
              <FormInput
                type="text"
                required
                value={primaryContact}
                onChange={(e) => setPrimaryContact(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Relationship</FormLabel>
              <FormInput
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>Phone Number</FormLabel>
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
            <div>
              <FormLabel>Preferred Contact Method</FormLabel>
              <FormSelect
                value={preferredContactMethod}
                onChange={(e) =>
                  setPreferredContactMethod(e.target.value as ContactMethod)
                }
              >
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="In-Person">In-Person</option>
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
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
              <FormLabel>State / ZIP</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <FormInput
                  type="text"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                />
                <FormInput
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
            </div>
            <div>
              <FormLabel>Branch</FormLabel>
              <FormInput
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="2. Loved One & Caregiver Intent"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel required>Care Recipient Name</FormLabel>
              <FormInput
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Age</FormLabel>
              <FormInput
                type="number"
                value={clientAge}
                onChange={(e) => setClientAge(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Gender</FormLabel>
              <FormSelect
                value={clientGender}
                onChange={(e) => setClientGender(e.target.value)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </FormSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Proposed Family Caregiver</FormLabel>
              <FormInput
                type="text"
                placeholder="Optional if agency caregiver will be matched"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
              />
            </div>
            <div>
              <FormLabel>Caregiver Relationship</FormLabel>
              <FormInput
                type="text"
                value={caregiverRelationship}
                onChange={(e) => setCaregiverRelationship(e.target.value)}
              />
            </div>
          </div>

          <div>
            <FormLabel>Mobility & Clinical Notes</FormLabel>
            <FormTextarea
              rows={2}
              value={mobilityNotes}
              onChange={(e) => setMobilityNotes(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <FormSection
            title="3. Referral Source & Care Requirements"
            badge={<span className="w-2 h-2 rounded-full bg-[#3D6B22]" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>Pipeline Stage</FormLabel>
              <FormSelect
                value={stage}
                onChange={(e) => setStage(e.target.value as InquiryStage)}
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
              <FormLabel>Urgency</FormLabel>
              <FormSelect
                value={urgency}
                onChange={(e) =>
                  setUrgency(e.target.value as InquiryRecord["urgency"])
                }
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Immediate">Immediate</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel>Assigned Coordinator</FormLabel>
              <FormInput
                type="text"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormLabel>Referral Source</FormLabel>
              <FormSelect
                value={source}
                onChange={(e) => setSource(e.target.value as ReferralSourceType)}
              >
                <option value="Website">Website</option>
                <option value="Phone">Phone</option>
                <option value="Referral">Referral</option>
                <option value="Case Manager">Case Manager</option>
                <option value="Hospital Discharge">Hospital Discharge</option>
                <option value="Physician">Physician</option>
                <option value="Community Partner">Community Partner</option>
                <option value="Word of Mouth">Word of Mouth</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel>Referring Organization</FormLabel>
              <FormInput
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <FormLabel>Program Interest</FormLabel>
              <FormSelect
                value={programInterest}
                onChange={(e) => setProgramInterest(e.target.value)}
              >
                {!LILISARE_SERVICES.some((s) => s.name === programInterest) && (
                  <option value={programInterest}>{programInterest}</option>
                )}
                {LILISARE_SERVICES.map((svc) => (
                  <option key={svc.id} value={svc.name}>
                    {svc.name}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <FormLabel>Requested Hours / Week</FormLabel>
              <FormInput
                type="number"
                min={0}
                max={168}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              />
            </div>
            <div>
              <FormLabel>Target Start Date</FormLabel>
              <FormInput
                type="text"
                value={targetStartDate}
                onChange={(e) => setTargetStartDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <FormLabel>Support Requirements Summary</FormLabel>
            <FormTextarea
              rows={3}
              value={supportRequirements}
              onChange={(e) => setSupportRequirements(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <FormButtonCancel
            onClick={() => router.push(`${cleanBase}/${inquiry.id}`)}
          >
            Cancel
          </FormButtonCancel>
          <FormButtonPrimary type="submit">
            <Save className="w-4 h-4" />
            <span>Save Inquiry Changes</span>
          </FormButtonPrimary>
        </div>
      </form>
    </div>
  );
}
