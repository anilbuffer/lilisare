"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Search, MapPin, UserCircle, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClientRecord } from "@/types/client";
import {
  getClientsFromStorage,
  getClientDiagnosis,
  getClientRiskLevel,
} from "@/lib/clients/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";

export default function FieldClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setClients(getClientsFromStorage());
    return subscribeToIntakeSync(() => {
      setClients(getClientsFromStorage());
    });
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        getClientDiagnosis(c).toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        getClientRiskLevel(c).toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Roster</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enrolled clients synced across clinical and field operations.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients, diagnosis, status..."
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] w-full sm:w-72"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const diagnosis = getClientDiagnosis(client);
          const risk = getClientRiskLevel(client);
          return (
            <Card
              key={client.id}
              className="p-4 shadow-sm border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/field-supervisor/clients/${client.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <UserCircle className="w-10 h-10 text-slate-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{client.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {client.household.city}, {client.household.state}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${client.status === "Active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : client.status === "On Hold"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{diagnosis}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    Caregiver: {client.assignedCareTeam.primaryCaregiver?.name || "Unassigned"}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${risk === "High Risk"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : risk === "Medium Risk"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                  >
                    {risk}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
