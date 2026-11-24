"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Shield,
  Star,
  Users,
  Award,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Hash,
  Sparkles,
} from "lucide-react";
import { AdminCaregiverProfile } from "@/lib/caregivers/adminCaregiversData";

interface CaregiverProfileTabProps {
  profile: AdminCaregiverProfile;
}

export function CaregiverProfileTab({ profile }: CaregiverProfileTabProps) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Top Executive Profile Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F2E4] border border-[#3D6B22]/20 text-[#1E5622] font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {profile.name}
                </h2>
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                  ID: #{profile.numericId || profile.id}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {profile.status}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Ext. Status: {profile.extStatus || "Active"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {profile.role} • {profile.gender && profile.gender !== "—" ? `${profile.gender} • ` : ""}
                {profile.age ? `${profile.age} yrs • ` : ""}
                {profile.branch} Branch
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <div className="px-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center min-w-[85px] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rating
              </span>
              <span className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {profile.rating || 4.9}
              </span>
            </div>
            <div className="px-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center min-w-[85px] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Compliance
              </span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                {profile.complianceRate || 100}%
              </span>
            </div>
            <div className="px-4 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center min-w-[85px] shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Points
              </span>
              <span className="text-sm font-bold text-[#1E5622] mt-0.5 block">
                {profile.pointsBalance || 420} pts
              </span>
            </div>
          </div>
        </div>

        {/* 02. Personal & Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5 text-xs">
          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-[#3D6B22] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">Phone Numbers</p>
              <p className="font-semibold text-slate-800 font-mono mt-0.5 truncate">
                {profile.mobilePhone || profile.phone} <span className="text-slate-400 font-normal">(m)</span>
              </p>
              {profile.homePhone && (
                <p className="text-[11px] text-slate-600 font-mono mt-0.5 truncate">
                  {profile.homePhone} <span className="text-slate-400 font-normal">(h)</span>
                </p>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">Email Address</p>
              <p className="font-semibold text-slate-800 mt-0.5 truncate max-w-[190px]">
                {profile.email}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Verified Email</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100/60 text-amber-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">Residential Location</p>
              <p className="font-semibold text-slate-800 mt-0.5 leading-snug line-clamp-2">
                {profile.location || profile.address}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">Tenure & Hire Date</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {profile.hireDate}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">{profile.tenure}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 03. Two Column Operational Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Employment & Clinical Profile */}
        <div className="lg:col-span-8 space-y-5">
          {/* Employment & Supervision Details */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-[#3D6B22]" />
                <span>Agency & Employment Specification</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {profile.employmentType || "W-2 Employee"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Caregiver ID</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block font-mono">
                  #{profile.numericId || profile.id}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Demographics</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {profile.age ? `${profile.age} yrs` : "—"} • {profile.gender || "—"}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Registry Status</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                  {profile.extStatus || "Active"}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Classification</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {profile.classes && profile.classes.length > 0
                    ? profile.classes.join(", ")
                    : profile.role}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Care Coordinator / Admin</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {profile.administrator || "Mackenzie Bertelsman"}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Primary Branch</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {profile.branch || "Brentwood Hub"}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Base Pay Rate</span>
                <span className="text-sm font-bold text-[#1E5622] mt-0.5 block">
                  {profile.payRate || "$28.50/hr"}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Overtime Rate (1.5x)</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {profile.overtimeRate || "$42.75/hr"}
                </span>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Direct Deposit</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                  {profile.directDepositStatus || "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Skills & Certifications */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3D6B22]" />
              <span>Skills & Clinical Competencies</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3D6B22]" />
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  ADL Support, Personal Care, Vital Signs Monitoring, Medication Assistance
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">Primary License</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {profile.licenseName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  #{profile.licenseNumber} • Expires {profile.licenseExpires}
                </span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-400 block">CPR / Basic Life Support</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {profile.cprStatus || "Valid"} (AHA Certified)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Renewal Due: {profile.cprExpires || "Dec 2027"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Assigned Clients & Quick Contacts */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Assigned Clients */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#3D6B22]" />
                <span>Assigned Clients</span>
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {profile.assignedPatientsList?.length || 0} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {profile.assignedPatientsList && profile.assignedPatientsList.length > 0 ? (
                profile.assignedPatientsList.map((client) => {
                  const clientInitials = client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <Link
                      key={client.id}
                      href={`/admin/clients/${client.id}`}
                      className="block p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#3D6B22] font-bold text-[11px] flex items-center justify-center shrink-0">
                            {clientInitials}
                          </div>
                          <span className="text-xs font-bold text-slate-900 group-hover:text-[#1E5622] truncate">
                            {client.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shrink-0">
                          {client.schedule}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 truncate pl-9.5">
                        {client.address}
                      </p>
                    </Link>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No clients currently assigned to this caregiver.
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact Quick Card */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Primary Emergency Contact</span>
            </h3>
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 mt-2">
              <p className="text-xs font-bold text-slate-900">
                {profile.emergencyContact}
              </p>
              {profile.secondaryEmergencyContact && (
                <p className="text-xs text-slate-600 mt-1.5 pt-1.5 border-t border-rose-100">
                  <span className="font-semibold text-slate-700">Secondary: </span>
                  {profile.secondaryEmergencyContact}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
