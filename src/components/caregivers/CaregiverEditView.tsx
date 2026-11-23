"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  HeartHandshake,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { CaregiverRecord, CaregiverType, CaregiverStatus } from "@/types/caregiver";
import { getCaregiversFromStorage, saveCaregiversToStorage, INITIAL_CAREGIVERS } from "@/lib/caregivers/mockData";
import { toast } from "sonner";

interface CaregiverEditViewProps {
  caregiverId: string;
  baseBackPath?: string;
}

export function CaregiverEditView({
  caregiverId,
  baseBackPath = "/caregivers",
}: CaregiverEditViewProps) {
  const router = useRouter();
  const [caregiver, setCaregiver] = useState<CaregiverRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<CaregiverType>("Family Caregiver");
  const [status, setStatus] = useState<CaregiverStatus>("Active");
  const [branch, setBranch] = useState("Mountain Lane");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRel, setEmergencyRel] = useState("");
  const [capacityHours, setCapacityHours] = useState(40);
  const [classification, setClassification] = useState<"W-2" | "1099" | "Family Paid Exempt">("W-2");

  useEffect(() => {
    setIsMounted(true);
    const all = getCaregiversFromStorage();
    let found = all.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase());
    if (!found) {
      found = INITIAL_CAREGIVERS.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase()) || INITIAL_CAREGIVERS[0];
    }
    if (found) {
      setCaregiver(found);
      setName(found.name);
      setPreferredName(found.personalInfo.preferredName || "");
      setPhone(found.personalInfo.phone);
      setEmail(found.personalInfo.email);
      setType(found.type);
      setStatus(found.status);
      setBranch(found.branch);
      setStreet(found.personalInfo.address.street);
      setCity(found.personalInfo.address.city);
      setState(found.personalInfo.address.state);
      setZip(found.personalInfo.address.zip);
      setEmergencyName(found.personalInfo.emergencyContact.name);
      setEmergencyPhone(found.personalInfo.emergencyContact.phone);
      setEmergencyRel(found.personalInfo.emergencyContact.relationship);
      setCapacityHours(found.availabilityAssignments.weeklyCapacityHours);
      setClassification(found.employmentClassification);
    }
  }, [caregiverId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caregiver) return;

    const all = getCaregiversFromStorage();
    const updated: CaregiverRecord = {
      ...caregiver,
      name,
      type,
      status,
      branch,
      employmentClassification: classification,
      personalInfo: {
        ...caregiver.personalInfo,
        preferredName,
        phone,
        email,
        address: {
          street,
          city,
          state,
          zip,
        },
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel,
        },
      },
      relationship: {
        ...caregiver.relationship,
        caregiverType: type,
      },
      availabilityAssignments: {
        ...caregiver.availabilityAssignments,
        weeklyCapacityHours: capacityHours,
      },
      activityHistory: {
        recentUpdates: [
          {
            id: `act-edit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            relativeTime: "Just now",
            title: "Profile edited",
            description: `Caregiver record updated by Agency Admin`,
            actor: "Agency Administrator",
            type: "profile",
          },
          ...caregiver.activityHistory.recentUpdates,
        ],
      },
    };

    const index = all.findIndex((c) => c.id.toLowerCase() === caregiver.id.toLowerCase());
    if (index >= 0) {
      all[index] = updated;
    } else {
      all.push(updated);
    }

    saveCaregiversToStorage(all);
    toast.success(`Caregiver ${updated.id} (${updated.name}) saved successfully`);
    router.push(`${baseBackPath}/${updated.id}`);
  };

  if (!isMounted || !caregiver) {
    return (
      <div className="w-full max-w-5xl mx-auto py-16 text-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#3D6B22] border-t-transparent animate-spin mx-auto mb-2" />
        <p className="font-semibold text-xs text-slate-600">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href={`${baseBackPath}/${caregiver.id}`}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#3D6B22] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-slate-800">{caregiver.id}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium">Edit Profile</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="relative bg-white rounded-xl lg:rounded-2xl border border-slate-200/90 shadow-[0_6px_32px_rgba(0,0,0,0.06)] p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Caregiver Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update personal information, relationship classification, and operational capacity
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Section: Basic Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Identity & Classification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Caregiver Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CaregiverType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                >
                  <option value="Family Caregiver">Family Caregiver</option>
                  <option value="Live-In Caregiver">Live-In Caregiver</option>
                  <option value="Family Friend">Family Friend</option>
                  <option value="Attendant Caregiver">Attendant Caregiver</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CaregiverStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                >
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Pending">Pending</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Agency Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                >
                  <option value="Mountain Lane">Mountain Lane</option>
                  <option value="North Metro">North Metro</option>
                  <option value="Valley View">Valley View</option>
                  <option value="Westside">Westside</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Employment Classification</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                >
                  <option value="W-2">W-2 Employed</option>
                  <option value="1099">1099 Contractor</option>
                  <option value="Family Paid Exempt">Family Paid Exempt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Contact & Address */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Contact & Residence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
            </div>
          </div>

          {/* Section: Emergency Contact & Work Capacity */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Emergency Contact & Capacity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/3 text-xs">
              <label className="block text-slate-600 font-medium mb-1">Weekly Capacity (Hours)</label>
              <input
                type="number"
                min="1"
                max="80"
                value={capacityHours}
                onChange={(e) => setCapacityHours(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#3D6B22]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href={`${baseBackPath}/${caregiver.id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#3D6B22] hover:bg-[#2d5019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Caregiver</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
