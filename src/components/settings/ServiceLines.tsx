"use client";

import { useState } from "react";
import { Stethoscope, Plus, Edit2, Trash2, CheckCircle2, Search, Filter, Layers, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LILISARE_SERVICES, LILISARE_SERVICE_CATEGORIES, LiliSareServiceItem } from "@/lib/services";

export function ServiceLines() {
  const [serviceLines, setServiceLines] = useState<LiliSareServiceItem[]>(LILISARE_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAdding, setIsAdding] = useState(false);

  const filteredServices = serviceLines.filter((svc) => {
    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || svc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleToggleStatus = (id: string) => {
    setServiceLines((prev) =>
      prev.map((svc) =>
        svc.id === id ? { ...svc, status: svc.status === "Active" ? "Inactive" : "Active" } : svc
      )
    );
  };

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      const newSvc: LiliSareServiceItem = {
        id: `svc-${Date.now()}`,
        order: serviceLines.length + 1,
        name: "New Service Line",
        shortName: "New Service",
        code: `SVC-${Math.floor(100 + Math.random() * 900)}`,
        category: "Other",
        description: "Custom service line or waiver support program.",
        defaultBillRate: "$35.00",
        defaultPayRate: "$22.00",
        unitType: "Hourly",
        status: "Active",
        colorScheme: {
          bg: "bg-slate-100",
          text: "text-slate-800",
          border: "border-slate-200",
          dot: "bg-slate-500",
        },
      };
      setServiceLines([newSvc, ...serviceLines]);
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">LiliSare Services & Rate Lines</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
              {serviceLines.length} Services Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure billable service lines, Colorado Medicaid HCBS waiver programs, HCPCS procedure codes, and default pay/bill rates.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="inline-flex items-center gap-2 bg-[#3D6B22] hover:bg-[#345C1D] disabled:opacity-70 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#3D6B22]/20 transition-all cursor-pointer"
        >
          {isAdding ? <CheckCircle2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isAdding ? "Adding..." : "Add Service Line"}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service name, HCPCS code, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Categories ({serviceLines.length})</option>
              {LILISARE_SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <Card noPadding className="overflow-hidden border border-slate-200 rounded-2xl shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-6 py-3.5">Service Line & Description</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Unit Type</th>
                <th className="px-5 py-3.5 text-right">Default Bill Rate</th>
                <th className="px-5 py-3.5 text-right">Default Pay Rate</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No services found matching your search.
                  </td>
                </tr>
              ) : (
                filteredServices.map((svc, index) => (
                  <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5 font-mono text-slate-400 font-medium">
                      {svc.order || index + 1}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#3D6B22]/10 group-hover:text-[#3D6B22] transition-colors">
                          <Stethoscope className="w-4 h-4 text-slate-500 group-hover:text-[#3D6B22]" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{svc.name}</div>
                          <div className="text-[11px] text-slate-500 max-w-sm line-clamp-1 mt-0.5">
                            {svc.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {svc.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${svc.colorScheme.bg} ${svc.colorScheme.text} ${svc.colorScheme.border}`}
                      >
                        {svc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                      {svc.unitType}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-900 font-bold whitespace-nowrap">
                      {svc.defaultBillRate}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-800 font-semibold whitespace-nowrap">
                      {svc.defaultPayRate}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(svc.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${svc.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${svc.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                        ></span>
                        {svc.status}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-slate-400 hover:text-[#3D6B22] hover:bg-[#3D6B22]/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setServiceLines(serviceLines.filter((s) => s.id !== svc.id))}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
