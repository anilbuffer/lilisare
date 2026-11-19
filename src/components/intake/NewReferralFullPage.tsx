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
  ChevronDown,
  User,
  Users,
  Building2,
  Heart,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface NewReferralFullPageProps {
  backHref?: string;
  onSuccessRedirectHref?: string;
}

export function NewReferralFullPage({
  backHref = "/intake/pipeline/",
  onSuccessRedirectHref = "/intake/pipeline/",
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        toast.error("Please enter the primary family contact name");
        return;
      }
      if (!phone.trim() && !email.trim()) {
        toast.error("Please enter a phone number or email");
        return;
      }
    } else if (step === 2) {
      if (!clientName.trim()) {
        toast.error("Please enter the loved one needing care (Client Name)");
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
    setIsSubmitting(true);
    const randomId = `INQ-${Math.floor(1043 + Math.random() * 50)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Referral ${randomId} successfully recorded! Redirecting to pipeline...`);
      router.push(onSuccessRedirectHref);
    }, 600);
  };

  const steps = [
    { num: 1, title: "Family & Contact", icon: User },
    { num: 2, title: "Client & Household", icon: Users },
    { num: 3, title: "Care & Referral", icon: Heart },
    { num: 4, title: "Review & Submit", icon: FileCheck },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16 animate-in fade-in duration-200">
      {/* Back Button with subtle shadow */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Intake Pipeline</span>
        </Link>
      </div>

      {/* Header Banner - Matching Patients Card Style */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-[0_6px_32px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E5622] border border-emerald-200/80">
                New Intake Entry
              </span>
              <span className="text-xs text-slate-400">Step {step} of 4</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              New Family Referral
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Capture family contact, loved one demographics, care requirements, and assign an intake coordinator.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#3D6B22]/10 border border-[#3D6B22]/20 flex items-center justify-center shrink-0 self-start sm:self-center shadow-[0_4px_16px_rgba(61,107,34,0.12)]">
            <Sparkles className="w-6 h-6 text-[#3D6B22]" />
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const isDone = s.num < step;
              const isCurrent = s.num === step;

              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone
                        ? "bg-[#3D6B22] text-white shadow-sm"
                        : isCurrent
                          ? "bg-[#3D6B22] text-white ring-4 ring-[#3D6B22]/20 shadow-[0_4px_16px_rgba(61,107,34,0.25)]"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs mt-2 font-semibold truncate max-w-full ${isCurrent ? "text-[#3D6B22]" : "text-slate-500"
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

      {/* Main Guided Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-[0_6px_32px_rgba(0,0,0,0.06)] space-y-6">
        {/* STEP 1: Family & Contact Details */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                1. Family & Primary Contact Details
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Who is reaching out on behalf of the family to inquire about care services?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Primary Contact Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Miller-Jenkins"
                    value={primaryContact}
                    onChange={(e) => setPrimaryContact(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Relationship to Loved One
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <select
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
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
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="(404) 555-0182"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="sarah.jenkins@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Phone", "Email", "SMS"] as ContactMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredContactMethod(method)}
                      className={`py-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${preferredContactMethod === method
                          ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Best Time to Reach
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <select
                    value={bestTimeToCall}
                    onChange={(e) => setBestTimeToCall(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Mornings (9am - 12pm)">Mornings (9am - 12pm)</option>
                    <option value="Afternoons (1pm - 4pm)">Afternoons (1pm - 4pm)</option>
                    <option value="Evenings (5pm - 8pm)">Evenings (5pm - 8pm)</option>
                    <option value="Anytime">Anytime during business hours</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Client & Household Details */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                2. Loved One & Household Details
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Identify the individual receiving care and their primary residential address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 pt-1">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Loved One Full Name (Care Recipient) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Miller"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Age
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={clientAge}
                    onChange={(e) => setClientAge(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Household Street Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="1428 Peachtree Hills Cir NE"
                    value={householdAddress}
                    onChange={(e) => setHouseholdAddress(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Atlanta"
                  value={householdCity}
                  onChange={(e) => setHouseholdCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="30305"
                  value={householdZip}
                  onChange={(e) => setHouseholdZip(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Branch Assignment
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="North Metro Branch">North Metro Branch</option>
                    <option value="South County Branch">South County Branch</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* SFC Potential Family Caregiver */}
              <div className="sm:col-span-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-[#3D6B22]" />
                  <span className="text-xs font-bold text-slate-900">
                    Potential Family Caregiver (SFC Model - Optional)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Does a family member or friend plan to provide care under the Structured Family Caregiving model?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Caregiver Name (e.g. Clara Jenkins)"
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Granddaughter)"
                      value={caregiverRelationship}
                      onChange={(e) => setCaregiverRelationship(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Referral & Care Requirements */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                3. Referral Source & Care Requirements
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                How did this family find LiliSare, and what support programs or hours are requested?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Referral Source
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <select
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value as ReferralSourceType)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Website">Website / Online Form</option>
                    <option value="Phone">Phone Inquiry</option>
                    <option value="Referral">Community / Senior Center</option>
                    <option value="Case Manager">Case Manager / Area Agency</option>
                    <option value="Hospital Discharge">Hospital Discharge</option>
                    <option value="Physician">Physician / Clinic</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Referring Organization
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Emory Hospital, Fulton Aging Dept"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Case Manager (if applicable)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Janice Campbell, LCSW"
                    value={caseManagerName}
                    onChange={(e) => setCaseManagerName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Payer / Program Interest
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <select
                    value={programInterest}
                    onChange={(e) => setProgramInterest(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Medicaid Waiver (CCSP / SOURCE)">Medicaid Waiver (CCSP / SOURCE)</option>
                    <option value="Structured Family Caregiving (SFC)">Structured Family Caregiving (SFC)</option>
                    <option value="Private Pay">Private Pay</option>
                    <option value="VA Community Care Network (CCN)">VA Community Care Network (CCN)</option>
                    <option value="Long-Term Care Insurance">Long-Term Care Insurance</option>
                    <option value="Georgia GAPP (Pediatric)">Georgia GAPP (Pediatric)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-[13px] font-medium text-slate-700">
                  Requested Care Services
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isSelected
                            ? "bg-[#3D6B22] text-white border-[#3D6B22] shadow-[0_2px_8px_rgba(61,107,34,0.25)]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                      >
                        {ct}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Requested Hours / Week
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10) || 20)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Care Requirements & Intake Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe specific mobility issues, medical diagnosis, preferred caregiver traits, or family schedule notes..."
                  value={supportNotes}
                  onChange={(e) => setSupportNotes(e.target.value)}
                  className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                4. Review & Assign Intake Coordinator
                <div className="h-px bg-slate-100 flex-1"></div>
              </h4>
              <p className="text-xs text-slate-500">
                Confirm the inquiry information and assign a coordinator for immediate family outreach.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Primary Family Contact
                  </span>
                  <strong className="text-slate-900 text-sm">{primaryContact || "N/A"}</strong>
                  <span className="text-slate-600 block">Relationship: {contactRelationship}</span>
                  <span className="text-slate-500 block">{phone} · {email || "No email"}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Loved One (Care Recipient)
                  </span>
                  <strong className="text-slate-900 text-sm">{clientName || "N/A"}</strong>
                  <span className="text-slate-600 block">Age {clientAge} · {clientGender}</span>
                  <span className="text-slate-500 block">{householdCity}, GA · {branch}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Referral & Organization
                  </span>
                  <strong className="text-slate-900 text-sm">{referralSource}</strong>
                  <span className="text-slate-600 block">{organization || "Direct Self-Inquiry"}</span>
                  {caseManagerName && (
                    <span className="text-slate-500 block">CM: {caseManagerName}</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Program & Schedule
                  </span>
                  <strong className="text-slate-900 text-sm">{programInterest}</strong>
                  <span className="text-slate-600 block">{hoursPerWeek} hrs/week requested</span>
                  <span className="text-slate-500 block">{careTypes.join(", ")}</span>
                </div>
              </div>

              {caregiverName && (
                <div className="pt-3 border-t border-slate-200 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Structured Family Caregiving Candidate
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">{caregiverName}</span>
                  <span className="text-slate-500 ml-2">({caregiverRelationship})</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Assign Intake Coordinator <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <select
                    value={assignedCoordinator}
                    onChange={(e) => setAssignedCoordinator(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins (Senior Intake Lead)</option>
                    <option value="Elena Rostova">Elena Rostova (Intake Coordinator)</option>
                    <option value="Marcus Vance">Marcus Vance (Intake Specialist)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">
                  Priority Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as "Normal" | "Urgent")}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="Urgent">Urgent Priority (Hospital discharge / emergency)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <Link
              href={backHref}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </Link>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl transition-all shadow-[0_6px_24px_rgba(61,107,34,0.25)] cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-[0_6px_24px_rgba(61,107,34,0.25)] transition-all cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Referral...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Referral Record</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}