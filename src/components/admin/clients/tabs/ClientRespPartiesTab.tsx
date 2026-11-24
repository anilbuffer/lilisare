"use client";

import React, { useState } from "react";
import {
  Users,
  HeartHandshake,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Plus,
  Star,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { ClientRecord, ResponsibleParty } from "@/types/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientRespPartiesTabProps {
  client: ClientRecord;
  onUpdateClient?: (updated: ClientRecord) => void;
}

export function ClientRespPartiesTab({ client, onUpdateClient }: ClientRespPartiesTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "Mother / Legal Guardian",
    phone: "",
    email: "",
    address: client.residentialAddress?.address || "",
    isPrimaryDecisionMaker: false,
    hipaaAuthorized: true,
    isBillingContact: true,
    isEmergencyContact: true,
  });

  const parties = client.responsibleParties || [];

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast.error("Please enter contact name and phone number.");
      return;
    }

    const created: ResponsibleParty = {
      id: `RP-${Date.now()}`,
      name: newContact.name.trim(),
      relationship: newContact.relationship,
      phone: newContact.phone.trim(),
      email: newContact.email.trim() || `${newContact.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      address: newContact.address.trim(),
      isPrimaryDecisionMaker: newContact.isPrimaryDecisionMaker,
      hipaaAuthorized: newContact.hipaaAuthorized,
      isBillingContact: newContact.isBillingContact,
      isEmergencyContact: newContact.isEmergencyContact,
      notes: "Direct contact recorded via Client Workspace.",
    };

    const updatedParties = newContact.isPrimaryDecisionMaker
      ? parties.map((p) => ({ ...p, isPrimaryDecisionMaker: false })).concat(created)
      : [...parties, created];

    const updated: ClientRecord = {
      ...client,
      responsibleParties: updatedParties,
      updatedAtRelative: "Just now",
    };

    if (onUpdateClient) onUpdateClient(updated);

    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setIsAddModalOpen(false);
    setNewContact({
      name: "",
      relationship: "Mother / Legal Guardian",
      phone: "",
      email: "",
      address: client.residentialAddress?.address || "",
      isPrimaryDecisionMaker: false,
      hipaaAuthorized: true,
      isBillingContact: true,
      isEmergencyContact: true,
    });
    toast.success(`${created.name} added to authorized contacts.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Responsible Parties & Authorized Contacts
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                <ShieldCheck className="w-3 h-3 text-[#3D6B22]" /> Verified Guardians
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Legal guardians, Healthcare POAs, emergency contacts, and family advocates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {parties.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#3D6B22] border border-emerald-200 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {contact.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                      {contact.relationship}
                    </span>
                  </div>
                </div>

                {contact.isPrimaryDecisionMaker && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#3D6B22] text-white shadow-2xs">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Primary POA</span>
                  </span>
                )}
              </div>

              {/* Contact Details */}
              <div className="space-y-2.5 mt-3.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-bold text-[#3D6B22] hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-slate-700 hover:text-slate-900 truncate font-medium"
                  >
                    {contact.email}
                  </a>
                </div>

                {contact.address && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600 font-medium">{contact.address}</span>
                  </div>
                )}
              </div>

              {/* Permissions & Roles */}
              <div className="mt-4 pt-3.5 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Permissions & Authority
                </div>
                <div className="flex flex-wrap gap-2">
                  {contact.hipaaAuthorized && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#3D6B22] border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3D6B22]" /> HIPAA Authorized
                    </span>
                  )}
                  {contact.isBillingContact && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                      Billing Recipient
                    </span>
                  )}
                  {contact.isEmergencyContact && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      Emergency Contact
                    </span>
                  )}
                </div>
              </div>

              {contact.notes && (
                <div className="mt-3.5 text-xs text-slate-600 italic bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  "{contact.notes}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Responsible Party Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Responsible Party & Contact"
        icon={<UserPlus className="w-5 h-5 text-[#3D6B22]" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateContact} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="e.g. Eleanor Miller"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Relationship
              </label>
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all cursor-pointer"
              >
                <option value="Mother / Legal Guardian">Mother / Legal Guardian</option>
                <option value="Father / Legal Guardian">Father / Legal Guardian</option>
                <option value="Healthcare Power of Attorney">Healthcare Power of Attorney</option>
                <option value="Sibling / Family Advocate">Sibling / Family Advocate</option>
                <option value="Waiver Case Manager">Waiver Case Manager</option>
                <option value="Other Authorized Contact">Other Authorized Contact</option>
              </select>
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="contact@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={newContact.address}
              onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              placeholder="Full address (Street, City, State, ZIP)"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Legal Permissions & Roles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.isPrimaryDecisionMaker}
                  onChange={(e) => setNewContact({ ...newContact, isPrimaryDecisionMaker: e.target.checked })}
                  className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span className="font-semibold text-slate-800">Primary Legal POA</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.hipaaAuthorized}
                  onChange={(e) => setNewContact({ ...newContact, hipaaAuthorized: e.target.checked })}
                  className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span className="font-semibold text-slate-800">HIPAA Authorized</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.isBillingContact}
                  onChange={(e) => setNewContact({ ...newContact, isBillingContact: e.target.checked })}
                  className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span className="font-semibold text-slate-800">Billing Statements</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.isEmergencyContact}
                  onChange={(e) => setNewContact({ ...newContact, isEmergencyContact: e.target.checked })}
                  className="w-4 h-4 rounded text-[#3D6B22] focus:ring-[#3D6B22]"
                />
                <span className="font-semibold text-slate-800">Emergency Dispatch</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Contact</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
