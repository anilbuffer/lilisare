"use client";

import React, { useState } from "react";
import { Phone, Heart, User, MapPin, Edit3, Save, ShieldAlert, CheckCircle2 } from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverEmergencyContactTabProps {
  profile: AdminCaregiverProfile;
}

export function CaregiverEmergencyContactTab({
  profile,
}: CaregiverEmergencyContactTabProps) {
  const [primaryName, setPrimaryName] = useState(
    profile.emergencyContact?.split("(")[0]?.trim() || "James Carter"
  );
  const [primaryRelationship, setPrimaryRelationship] = useState(
    profile.emergencyContactRelationship || "Spouse"
  );
  const [primaryPhone, setPrimaryPhone] = useState(
    profile.emergencyContactPhone || "(555) 234-9988"
  );

  const [secondaryName, setSecondaryName] = useState(
    profile.secondaryEmergencyContact?.split("(")[0]?.trim() || "Mary Carter"
  );
  const [secondaryRelationship, setSecondaryRelationship] = useState("Mother");
  const [secondaryPhone, setSecondaryPhone] = useState("(555) 234-1122");

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Caregiver emergency contacts saved successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 fill-rose-50" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Emergency Contact Information
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified contacts in the event of an in-field medical incident or urgent emergency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Contacts</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-400" />
              <span>Edit Contacts</span>
            </button>
          )}
        </div>
      </div>

      {/* 02. Emergency Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Primary Contact Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Primary Emergency Contact</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              First Priority
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Relationship</label>
                <input
                  type="text"
                  value={primaryRelationship}
                  onChange={(e) => setPrimaryRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Contact Name:</span>
                <span className="font-bold text-slate-900 text-sm">{primaryName}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Relationship:</span>
                <span className="font-semibold text-slate-800">{primaryRelationship}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Telephone:</span>
                <span className="font-bold text-[#1E5622]  text-sm">{primaryPhone}</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <a
              href={`tel:${primaryPhone}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Emergency Contact</span>
            </a>
          </div>
        </div>

        {/* Secondary Contact Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Secondary Emergency Contact</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Backup
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Relationship</label>
                <input
                  type="text"
                  value={secondaryRelationship}
                  onChange={(e) => setSecondaryRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold  focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Contact Name:</span>
                <span className="font-bold text-slate-900 text-sm">{secondaryName}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Relationship:</span>
                <span className="font-semibold text-slate-800">{secondaryRelationship}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Telephone:</span>
                <span className="font-bold text-slate-900  text-sm">{secondaryPhone}</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <a
              href={`tel:${secondaryPhone}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Call Backup Contact</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
