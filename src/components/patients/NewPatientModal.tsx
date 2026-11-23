"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { UserPlus, User, Calendar, Activity, Phone, MapPin, Building, AlertCircle, Shield, Hash } from "lucide-react";
import { VoiceDictationBanner } from "@/components/ui/VoiceDictationBanner";
import { toast } from "sonner";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [priority, setPriority] = useState("routine");
  const [insurance, setInsurance] = useState("");
  const [policyId, setPolicyId] = useState("");

  const handleVoiceDictate = () => {
    setFirstName("Arthur");
    setLastName("Reynolds");
    setDob("1948-06-15");
    setGender("male");
    setDiagnosis("Post-operative recovery & Mobility impairment");
    setPhone("(541) 555-1234");
    setAddress("742 Evergreen Terrace, Springfield, OR 97477");
    setReferralSource("hospital");
    setPriority("urgent");
    setInsurance("Oregon Health Plan (OHP Medicaid)");
    setPolicyId("MED-994821");
    toast.success("AI Voice dictation transcribed and mapped to patient intake fields!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Patient ${firstName} ${lastName} created successfully!`);
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Patient"
      description="Enter patient details to create a new intake record."
      maxWidth="2xl"
      icon={
        <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 flex items-center justify-center border border-[#3D6B22]/20 text-[#3D6B22]">
          <UserPlus className="w-5 h-5 stroke-[2.2]" />
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Patient"
            )}
          </button>
        </>
      }
    >
      <form id="new-patient-form" onSubmit={handleSubmit} className="p-1 space-y-4">
        {/* AI Voice Dictation Banner */}
        <VoiceDictationBanner
          title="AI Voice Dictation"
          subtitle="Speak naturally to auto-fill patient intake and insurance details"
          buttonLabel="Dictate Patient"
          onDictate={handleVoiceDictate}
        />

        <div className="space-y-4">
          {/* Personal Details Section */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              Personal Details
              <div className="h-px bg-slate-100 flex-1"></div>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-normal text-slate-700">First Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                    placeholder="e.g. Arthur"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Last Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                    placeholder="e.g. Reynolds"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-600"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-600"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical & Contact Section */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              Clinical & Contact Details
              <div className="h-px bg-slate-100 flex-1"></div>
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Primary Diagnosis</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Activity className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                      placeholder="e.g. Type 2 Diabetes"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Address</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all resize-none placeholder:text-slate-400"
                    placeholder="Street address, city, state, zip"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Intake Logistics & Insurance Section */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              Intake Logistics & Insurance
              <div className="h-px bg-slate-100 flex-1"></div>
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Referral Source</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-600 appearance-none"
                    >
                      <option value="">Select source...</option>
                      <option value="hospital">Hospital Discharge</option>
                      <option value="pcp">Primary Care Physician</option>
                      <option value="family">Family / Self</option>
                      <option value="agency">Home Health Agency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Intake Priority</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all text-slate-600 appearance-none"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="expedited">Expedited (Same Day)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Insurance Provider</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={insurance}
                      onChange={(e) => setInsurance(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                      placeholder="e.g. Medicare, BlueCross"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-slate-700">Member ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={policyId}
                      onChange={(e) => setPolicyId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all placeholder:text-slate-400"
                      placeholder="e.g. ABC123456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
