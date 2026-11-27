"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileCheck,
  Search,
  ChevronDown,
  HelpCircle,
  MinusCircle,
  ArrowUpDown,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormLabel, FormSelect } from "@/components/ui/FormControls";
import {
  AuthorizedServiceLine,
  BillingAuthorization,
  BillingPayer,
} from "@/types/client";
import {
  AVAILABLE_BILLING_SERVICES,
  CatalogServiceOption,
  computeAuthLineStatus,
} from "./billingDefaults";

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auth: BillingAuthorization) => void;
  initialAuth: BillingAuthorization | null;
  authType: "Per-Service Time" | "Shared Time";
  payers: BillingPayer[];
}

export function AuthorizationModal({
  isOpen,
  onClose,
  onSave,
  initialAuth,
  authType,
  payers,
}: AuthorizationModalProps) {
  const [payerId, setPayerId] = useState("");
  const [authNumber, setAuthNumber] = useState("");
  const [icd10Codes, setIcd10Codes] = useState<[string, string, string, string]>([
    "",
    "",
    "",
    "",
  ]);
  const [services, setServices] = useState<AuthorizedServiceLine[]>([]);
  const [serviceFilter, setServiceFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialAuth) {
      setPayerId(initialAuth.payerId);
      setAuthNumber(initialAuth.authNumber);
      setIcd10Codes([...initialAuth.icd10Codes] as [string, string, string, string]);
      setServices(initialAuth.services.map((s) => ({ ...s, modifiers: [...s.modifiers] as [string, string, string, string] })));
    } else {
      setPayerId("");
      setAuthNumber("");
      setIcd10Codes(["", "", "", ""]);
      setServices([]);
    }
    setServiceFilter("");
    setCatalogSearch("");
    setIsAddServiceOpen(false);
  }, [isOpen, initialAuth]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAddServiceOpen(false);
      }
    };
    if (isAddServiceOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddServiceOpen]);

  const selectedPayer = payers.find((p) => p.id === payerId);
  const canSave = Boolean(payerId && authNumber.trim());

  const handleAddServiceFromCatalog = (opt: CatalogServiceOption) => {
    const today = new Date().toISOString().slice(0, 10);
    const sixMonths = new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);
    const newLine: AuthorizedServiceLine = {
      id: `SVC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: opt.code,
      description: opt.description,
      modifiers: ["", "", "", ""],
      units: opt.defaultType === "mTU" ? "mTU" : "mTU",
      maxTimeAllowed: 100,
      period: "Week",
      startDate: today,
      endDate: sixMonths,
      status: computeAuthLineStatus(today, sixMonths),
    };
    setServices((prev) => [...prev, newLine]);
    setIsAddServiceOpen(false);
    setCatalogSearch("");
  };

  const handleUpdateService = (
    id: string,
    patch: Partial<AuthorizedServiceLine>
  ) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = { ...s, ...patch };
        next.status = computeAuthLineStatus(next.startDate, next.endDate);
        return next;
      })
    );
  };

  const handleUpdateModifier = (id: string, idx: number, value: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const mods = [...s.modifiers] as [string, string, string, string];
        mods[idx] = value;
        return { ...s, modifiers: mods };
      })
    );
  };

  const handleRemoveService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!canSave) return;
    const saved: BillingAuthorization = {
      id: initialAuth?.id || `AUTH-${Date.now()}`,
      authNumber: authNumber.trim(),
      authType: initialAuth?.authType || authType,
      payerId,
      payerName: selectedPayer?.name || initialAuth?.payerName || "",
      icd10Codes,
      services,
    };
    onSave(saved);
  };

  const filteredServices = services
    .filter((s) => {
      if (!serviceFilter.trim()) return true;
      const q = serviceFilter.toLowerCase();
      return (
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.period.toLowerCase().includes(q) ||
        s.units.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortAsc ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)
    );

  const filteredCatalog = AVAILABLE_BILLING_SERVICES.filter((item) => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  const effectiveType = initialAuth?.authType || authType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={authNumber.trim() ? authNumber.trim() : "New Authorization"}
      description={
        <span className="inline-flex items-center gap-1.5">
          <span>{effectiveType} Authorization</span>
          <span
            title="Configure payer authorization number, ICD-10 diagnosis codes, and authorized service time limits."
            className="text-slate-400 hover:text-slate-600 cursor-help"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </span>
        </span>
      }
      icon={<FileCheck className="w-5 h-5" />}
      maxWidth="6xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${canSave
                ? "text-white bg-[#3D6B22] hover:bg-[#345C1D] shadow-md shadow-[#3D6B22]/20 active:scale-95 cursor-pointer"
                : "text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
              }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Save Authorization</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Top Fields: Payer & Authorization # */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <FormLabel required>Payer</FormLabel>
            <FormSelect
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
            >
              <option value="">Select Payer...</option>
              {payers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === "Inactive" ? "(Inactive)" : ""}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormLabel required>Authorization #</FormLabel>
            <FormInput
              value={authNumber}
              onChange={(e) => setAuthNumber(e.target.value)}
              placeholder="e.g. 123456789"
            />
          </div>
        </div>

        {/* ICD-10 Codes (4 slots) */}
        <div>
          <FormLabel>ICD-10 Codes</FormLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {([0, 1, 2, 3] as const).map((idx) => (
              <FormInput
                key={idx}
                value={icd10Codes[idx]}
                onChange={(e) => {
                  const next = [...icd10Codes] as [string, string, string, string];
                  next[idx] = e.target.value;
                  setIcd10Codes(next);
                }}
                placeholder={idx === 0 ? "e.g. R69" : `Code ${idx + 1}`}
                className="text-center"
              />
            ))}
          </div>
        </div>

        {/* Authorized Services Section */}
        <div className="rounded-xl border border-slate-200 overflow-visible">
          {/* Header Bar */}
          <div className="bg-[#3D6B22] text-white px-4 py-3 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-sm sm:text-base font-bold tracking-tight">
                Authorized Services{" "}
                <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-white/20">
                  {services.length}
                </span>
              </h4>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  placeholder="Search any field..."
                  className="pl-8 pr-3 py-1.5 bg-white text-slate-800 placeholder:text-slate-400 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-white/40 w-48 sm:w-56"
                />
              </div>
            </div>

            {/* ADD SERVICE Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsAddServiceOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-[#3D6B22] hover:bg-slate-50 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>ADD SERVICE</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isAddServiceOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden text-slate-800">
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Type to search..."
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3D6B22]"
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                    {filteredCatalog.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-400 text-center">
                        No matching services
                      </div>
                    ) : (
                      filteredCatalog.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleAddServiceFromCatalog(item)}
                          className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#3D6B22]/5 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span className="font-medium text-slate-800">
                            {item.name} (${item.defaultRate.toFixed(2)})
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-b-xl">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-[#3D6B22]/90 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => setSortAsc((prev) => !prev)}
                      className="inline-flex items-center gap-1 hover:opacity-80 cursor-pointer"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      <span>CODE</span>
                    </button>
                  </th>
                  <th className="py-2.5 px-3">DESCRIPTION</th>
                  <th className="py-2.5 px-3">PROCEDURE CODE MODIFIER(S)</th>
                  <th className="py-2.5 px-3">UNITS</th>
                  <th className="py-2.5 px-3">MAX TIME ALLOWED</th>
                  <th className="py-2.5 px-3">PERIOD</th>
                  <th className="py-2.5 px-3">START</th>
                  <th className="py-2.5 px-3">END</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-sm text-slate-400 font-medium"
                    >
                      Add Authorized Service
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {line.code}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 min-w-[140px]">
                        {line.description}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {([0, 1, 2, 3] as const).map((idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={line.modifiers[idx]}
                              onChange={(e) =>
                                handleUpdateModifier(line.id, idx, e.target.value)
                              }
                              placeholder={`Mod ${idx + 1}`}
                              className="w-12 px-1.5 py-1 text-[11px] text-center bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={line.units}
                          onChange={(e) =>
                            handleUpdateService(line.id, {
                              units: e.target.value as AuthorizedServiceLine["units"],
                            })
                          }
                          className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                        >
                          <option value="mTU">mTU</option>
                          <option value="Hours">Hours</option>
                          <option value="Units">Units</option>
                          <option value="Visits">Visits</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={line.maxTimeAllowed}
                            onChange={(e) =>
                              handleUpdateService(line.id, {
                                maxTimeAllowed: Number(e.target.value),
                              })
                            }
                            className="w-20 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                          />
                          <span className="text-[11px] font-medium text-slate-400">
                            {line.units}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={line.period}
                          onChange={(e) =>
                            handleUpdateService(line.id, {
                              period: e.target.value as AuthorizedServiceLine["period"],
                            })
                          }
                          className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                        >
                          <option value="Day">Day</option>
                          <option value="Week">Week</option>
                          <option value="2-week">2-week</option>
                          <option value="Month">Month</option>
                          <option value="Auth Period">Auth Period</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="date"
                          value={line.startDate}
                          onChange={(e) =>
                            handleUpdateService(line.id, {
                              startDate: e.target.value,
                            })
                          }
                          className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="date"
                          value={line.endDate}
                          onChange={(e) =>
                            handleUpdateService(line.id, {
                              endDate: e.target.value,
                            })
                          }
                          className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#3D6B22]"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveService(line.id)}
                          title="Remove service"
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
