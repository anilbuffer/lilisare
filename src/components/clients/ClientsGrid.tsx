"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Home,
  HeartHandshake,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ClientRecord } from "@/types/client";
import { getClientDiagnosis, getClientRiskLevel } from "@/lib/clients/mockData";

interface ClientsGridProps {
  clients: ClientRecord[];
  selectedClientId: string | null;
  onSelectClient: (client: ClientRecord) => void;
}

export function ClientsGrid({
  clients,
  selectedClientId,
  onSelectClient,
}: ClientsGridProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "On Hold":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Discharged":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Risk":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Medium Risk":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low Risk":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getCareTypeBadge = (careType: string) => {
    switch (careType) {
      case "Family Care":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Live-In Care":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Family Friend Care":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Attendant Care":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (clients.length === 0) {
    return (
      <div className="relative bg-white rounded-xl lg:rounded-2xl border border-[#D5DFDA] p-12 text-center text-slate-500">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-700">No matching clients found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => {
        const isSelected = selectedClientId === client.id;
        const hasAttention = client.attentionItems && client.attentionItems.length > 0;

        return (
          <Card
            key={client.id}
            onClick={() => onSelectClient(client)}
            className={`p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${isSelected
              ? "border-[#3D6B22] ring-2 ring-[#3D6B22]/20 bg-[#F2F8EE]/30"
              : "border-[#D5DFDA] bg-white hover:border-[#93C573] hover:shadow-md"
              }`}
          >
            <div>
              {/* Card Header: Client Info & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {client.avatarUrl ? (
                      <img
                        src={client.avatarUrl}
                        alt={client.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-sm text-slate-600 bg-slate-200">
                        {client.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-[#3D6B22]">
                      <span className="text-base">{client.name}</span>
                      {hasAttention && (
                        <span title="Needs Attention" className="text-amber-600">
                          <ShieldAlert className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs  text-slate-500">
                      {client.id} • Age {client.age}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                    client.status
                  )}`}
                >
                  {client.status}
                </span>
              </div>

              {/* Badges strip: Risk Level & Household */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBadge(
                    getClientRiskLevel(client)
                  )}`}
                >
                  {getClientRiskLevel(client)}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                  <Home className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[130px]">{client.household.name}</span>
                </div>
              </div>

              {/* Diagnosis snippet */}
              <div className="mt-2.5 text-xs">
                <span className="text-[11px] text-slate-400">Diagnosis: </span>
                <span className="font-semibold text-slate-800 line-clamp-1">
                  {getClientDiagnosis(client)}
                </span>
              </div>

              {/* Care Team & Hours snippet */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Primary Caregiver:</span>
                  {client.assignedCareTeam.primaryCaregiver ? (
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {client.assignedCareTeam.primaryCaregiver.name}
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600 text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Unassigned
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[11px]">Authorized Hours:</span>
                  <span className="font-bold text-slate-800">
                    {client.carePlan.authorizedWeeklyHours} hrs/wk
                  </span>
                </div>

                {/* Readiness mini bar */}
                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span className="text-slate-400 text-[11px]">Readiness:</span>
                  <div className="flex items-center gap-1">
                    <span
                      title={`Profile: ${client.readiness.clientProfile}`}
                      className={`w-2 h-2 rounded-full ${client.readiness.clientProfile === "Complete"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                        }`}
                    />
                    <span
                      title={`Care: ${client.readiness.careArrangement}`}
                      className={`w-2 h-2 rounded-full ${client.readiness.careArrangement === "Complete"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                        }`}
                    />
                    <span
                      title={`Docs: ${client.readiness.documents}`}
                      className={`w-2 h-2 rounded-full ${client.readiness.documents === "Verified"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                        }`}
                    />
                    <span
                      title={`Auth: ${client.readiness.authorization}`}
                      className={`w-2 h-2 rounded-full ${client.readiness.authorization === "Verified"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                        }`}
                    />
                    <span className="text-[10px]  font-bold text-slate-700 ml-1">
                      {client.readiness.overallScore ?? 85}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div
              className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[11px] text-slate-400">{client.updatedAtRelative}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectClient(client)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Quick View
                </button>

                <Link
                  href={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3D6B22] hover:text-[#2C5217]"
                >
                  Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
