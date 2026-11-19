"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContactMethod, ReferralSourceType } from "@/types/intake";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  User,
  Users,
  Building2,
  Heart,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface NewReferralFullPageProps {
  backHref?: string;
  onSuccessRedirectHref?: string;
}

export function NewReferralFullPage({
  backHref = "/intake/pipeline",
  onSuccessRedirectHref = "/intake/pipeline",
}: NewReferralFullPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Form State - Step 1: Family & Contact Details
  const [primaryContact, setPrimaryContact] = useState("");
  const [contactRelationship, setContactRelationship] = useState("Daughter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>("Phone");
  const [bestTimeToCall, setBestTimeToCall] = useState("Mornings (9am - 12pm)");

  // Form State - Step 2: Client & Household Details
  const [clientName, setClientName] = useState("");
  const [clientAge, setClientAge] = useState<string>("75");
  const [clientGender, setClientGender] = useState("Female");
  const [householdAddress, setHouseholdAddress] = useState("");
  const [householdCity, setHouseholdCity] = useState("Atlanta");
  const [householdZip, setHouseholdZip] = useState("30305");
  const [branch, setBranch] = useState("North Metro Branch");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelationship, setCaregiverRelationship] = useState("");

  // Form State - Step 3: Referral & Care Requirements
  const [referralSource, setReferralSource] = useState<ReferralSourceType>("Website");
  const [organization, setOrganization] = useState("");
  const [caseManagerName, setCaseManagerName] = useState("");
  const [caseManagerAgency, setCaseManagerAgency] = useState("");
  const [programInterest, setProgramInterest] = useState("Medicaid Waiver (CCSP / SOURCE)");
  const [careTypes, setCareTypes] = useState<string[]>([
    "Personal Care & Hygiene",
    "Meal Preparation",
  ]);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(20);
  const [supportNotes, setSupportNotes] = useState("");

  // Form State - Step 4: Assignment & Submission
  const [assignedCoordinator, setAssignedCoordinator] = useState("Sarah Jenkins");
  const [urgency, setUrgency] = useState<"Normal" | "Urgent">("Normal");

  const handleToggleCareType = (type: string) => {
    if (careTypes.includes(type)) {
      setCareTypes(careTypes.filter((t) => t !== type));
    } else {
      setCareTypes([...careTypes, type]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!primaryContact.trim()) {
        toast.error("Please enter the primary contact name");
        return;
      }
      if (!phone.trim() && !email.trim()) {
        toast.error("Please enter a phone number or email");
        return;
      }
    } else if (step === 2) {
      if (!clientName.trim()) {
        toast.error("Please enter the person needing care (Client name)");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomId = `INQ-${Math.floor(1043 + Math.random() * 50)}`;

    toast.success(`Referral ${randomId} successfully created!`);
    router.push(onSuccessRedirectHref);
  };

  const steps = [
    { num: 1, title: "Family & Contact", icon: User },
    { num: 2, title: "Client & Household", icon: Users },
    { num: 3, title: "Care & Referral", icon: Heart },
    { num: 4, title: "Review & Submit", icon: FileCheck },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-14 animate-in fade-in duration-200">
      {/* Back Button */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pipeline & Inquiries</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200">
            New Intake
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            New Family Referral
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          4-step guided intake: capture family inquiry, care requirements, and assign coordinator
        </p>

        {/* Step Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const isDone = s.num < step;
              const isCurrent = s.num === step;

              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-[#3D6B22] text-white"
                        : isCurrent
                        ? "bg-[#3D6B22] text-white ring-4 ring-[#3D6B22]/15 shadow-xs"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-semibold truncate max-w-full ${
                      isCurrent ? "text-[#3D6B22]" : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* STEP 1: Family & Contact Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900">
                1. Family & Contact Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Who is the primary person contacting LiliSare on behalf of the family?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Primary Contact Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Miller-Jenkins"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Relationship to Client
                </label>
                <select
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Legal Guardian / POA">Legal Guardian / POA</option>
                  <option value="Self">Self (Client)</option>
                  <option value="Case Manager">Case Manager</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(404) 555-0182"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="sarah.jenkins@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Phone", "Email", "SMS"] as ContactMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredContactMethod(method)}
                      className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        preferredContactMethod === method
                          ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Best Time to Reach
                </label>
                <select
                  value={bestTimeToCall}
                  onChange={(e) => setBestTimeToCall(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                >
                  <option value="Mornings (9am - 12pm)">Mornings (9am - 12pm)</option>
                  <option value="Afternoons (1pm - 4pm)">Afternoons (1pm - 4pm)</option>
                  <option value="Evenings (5pm - 8pm)">Evenings (5pm - 8pm)</option>
                  <option value="Anytime">Anytime during business hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Client & Household Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900">
                2. Client & Household Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Who is the individual receiving care, and where will services be delivered?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Client Full Name (Care Recipient) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Miller"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="115"
                  value={clientAge}
                  onChange={(e) => setClientAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Household Street Address
                </label>
                <input
                  type="text"
                  placeholder="1428 Peachtree Hills Cir NE"
                  value={householdAddress}
                  onChange={(e) => setHouseholdAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Atlanta"
                  value={householdCity}
                  onChange={(e) => setHouseholdCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="30305"
                  value={householdZip}
                  onChange={(e) => setHouseholdZip(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Branch Assignment
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
                >
                  <option value="North Metro Branch">North Metro Branch</option>
                  <option value="South County Branch">South County Branch</option>
                </select>
              </div>

              <div className="sm:col-span-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">
                  Potential In-Home Caregiver (Optional)
                </span>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Does a family member intend to provide care under the Structured Family Caregiving (SFC) model?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Caregiver Name (e.g. Clara Jenkins)"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Granddaughter)"
                    value={caregiverRelationship}
                    onChange={(e) => setCaregiverRelationship(e.target.value)}
                    className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Referral & Care Requirements */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900">
                3. Referral & Care Requirements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                How did they find LiliSare, and what support services are required?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Referral Source
                </label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value as ReferralSourceType)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                >
                  <option value="Website">Website / Online Form</option>
                  <option value="Phone">Phone Inquiry</option>
                  <option value="Referral">Community / Senior Center</option>
                  <option value="Case Manager">Case Manager / Area Agency</option>
                  <option value="Hospital Discharge">Hospital Discharge</option>
                  <option value="Physician">Physician / Clinic</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Referring Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emory Hospital, Fulton County Office of Aging"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Case Manager (if known)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Janice Campbell, LCSW"
                  value={caseManagerName}
                  onChange={(e) => setCaseManagerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Payer / Program Interest
                </label>
                <select
                  value={programInterest}
                  onChange={(e) => setProgramInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                >
                  <option value="Medicaid Waiver (CCSP / SOURCE)">Medicaid Waiver (CCSP / SOURCE)</option>
                  <option value="Structured Family Caregiving (SFC)">Structured Family Caregiving (SFC)</option>
                  <option value="Private Pay">Private Pay</option>
                  <option value="VA Community Care Network (CCN)">VA Community Care Network (CCN)</option>
                  <option value="Long-Term Care Insurance">Long-Term Care Insurance</option>
                  <option value="Georgia GAPP (Pediatric)">Georgia GAPP (Pediatric)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-800 block mb-1.5">
                  Requested Care Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Personal Care & Hygiene",
                    "Mobility Standby & Transfers",
                    "Meal Preparation",
                    "Medication Reminders",
                    "Companionship & Respite",
                    "RN Health Oversight",
                  ].map((ct) => {
                    const isSelected = careTypes.includes(ct);
                    return (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => handleToggleCareType(ct)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-2xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {ct}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Requested Hours / Week
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10) || 20)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Care Requirements & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe specific mobility issues, medical conditions, or family scheduling preferences..."
                  value={supportNotes}
                  onChange={(e) => setSupportNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900">
                4. Review & Assign Intake Coordinator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify the inquiry details before creating the active pipeline record.
              </p>
            </div>

            {/* Summary Preview */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Contact:</span>
                  <strong className="text-slate-900">{primaryContact || "N/A"}</strong> ({contactRelationship})
                  <span className="block text-[11px] text-slate-400">{phone} · {email}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Client Needing Care:</span>
                  <strong className="text-slate-900">{clientName || "N/A"}</strong> (Age {clientAge})
                  <span className="block text-[11px] text-slate-400">{householdCity}, GA</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Referral Source:</span>
                  <strong className="text-slate-900">{referralSource}</strong>
                  {organization && <span className="block text-[11px] text-slate-400">{organization}</span>}
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Program & Hours:</span>
                  <strong className="text-slate-900">{programInterest}</strong>
                  <span className="block text-[11px] text-slate-400">{hoursPerWeek} hrs / week</span>
                </div>
              </div>

              {caregiverName && (
                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500 block text-[11px]">Potential Family Caregiver:</span>
                  <span className="font-semibold text-slate-900">{caregiverName} ({caregiverRelationship})</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Assign Coordinator *
                </label>
                <select
                  value={assignedCoordinator}
                  onChange={(e) => setAssignedCoordinator(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Senior Intake Lead)</option>
                  <option value="Elena Rostova">Elena Rostova (Intake Coordinator)</option>
                  <option value="Marcus Vance">Marcus Vance (Intake Specialist)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Priority Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as "Normal" | "Urgent")}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900"
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="Urgent">Urgent Priority (Hospital discharge / immediate)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href={backHref}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </Link>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#2C5217] rounded-xl shadow-sm shadow-[#3D6B22]/20 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Create Inquiry Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
