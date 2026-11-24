"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Home,
  HeartHandshake,
  Clock,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import { ClientRecord } from "@/types/client";

interface ClientsTableProps {
  clients: ClientRecord[];
  selectedClientId: string | null;
  onSelectClient: (client: ClientRecord) => void;
}

export function ClientsTable({
  clients,
  selectedClientId,
  onSelectClient,
}: ClientsTableProps) {
  const pathname = usePathname();

  const getClientDetailPath = (id: string) => {
    if (pathname.startsWith("/scheduler")) return `/scheduler/clients/${id}`;
    if (pathname.startsWith("/hr")) return `/hr/clients/${id}`;
    if (pathname.startsWith("/field-supervisor")) return `/field-supervisor/clients/${id}`;
    if (pathname.startsWith("/intake")) return `/intake/clients/${id}`;
    if (pathname.startsWith("/admin")) return `/admin/clients/${id}`;
    return `/clients/${id}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#E3F1D9] text-[#1E5622] border-[#1E5622]/20";
      case "Onboarding":
        return "bg-[#FEF3C7] text-[#9A5B00] border-[#9A5B00]/20";
      case "On Hold":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "Discharged":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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

  return (
    <div className="relative bg-white rounded-xl lg:rounded-2xl border border-[#D5DFDA] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Household</th>
              <th className="py-3.5 px-4">Care Type</th>
              <th className="py-3.5 px-4">Assigned Caregiver</th>
              <th className="py-3.5 px-4">Readiness</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Updated</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No matching clients found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try adjusting your search query or filters.
                  </p>
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const isSelected = selectedClientId === client.id;
                const hasAttention = client.attentionItems && client.attentionItems.length > 0;

                return (
                  <tr
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className={`group cursor-pointer transition-colors ${isSelected
                      ? "bg-[#F2F8EE] border-l-4 border-l-[#3D6B22]"
                      : "hover:bg-slate-50/80"
                      }`}
                  >
                    {/* Client Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {client.avatarUrl ? (
                            <img
                              src={client.avatarUrl}
                              alt={client.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 bg-slate-200">
                              {client.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-[#3D6B22] transition-colors">
                            <span>{client.name}</span>
                            {hasAttention && (
                              <span
                                title="Needs Attention"
                                className="inline-flex items-center text-amber-600"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    </td>

                    {/* Connected Household */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs truncate max-w-[170px]">
                          {client.household.name}
                        </span>

                      </div>
                    </td>

                    {/* Care Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getCareTypeBadge(
                          client.careType
                        )}`}
                      >
                        {client.careType}
                      </span>
                    </td>

                    {/* Assigned Caregiver */}
                    <td className="py-3.5 px-4">
                      {client.assignedCareTeam.primaryCaregiver ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">
                            {client.assignedCareTeam.primaryCaregiver.name}
                          </span>

                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Readiness Indicators */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
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
                            : client.readiness.authorization === "Expiring"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                            }`}
                        />
                        <span className="text-[11px]  font-bold text-slate-600 ml-1">
                          {client.readiness.overallScore ?? 85}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          client.status
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    {/* Last Activity / Updated */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {client.updatedAtRelative}
                    </td>

                    {/* Quick Action */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectClient(client)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Quick View
                        </button>
                        <Link
                          href={getClientDetailPath(client.id)}
                          className="p-1 text-slate-400 hover:text-[#3D6B22] transition-colors rounded-lg hover:bg-[#F2F8EE]"
                          title="Full Profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
