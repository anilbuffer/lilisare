"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  ShieldCheck,
  Send,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { EvvVisitRecord } from "@/types/evvVisit";
import {
  bulkConfirmAndAttest,
  bulkSubmitToAggregator,
  exportEvvVisitsCsv,
} from "@/lib/admin/evvVisitsStore";

interface EvvBulkActionBarProps {
  selectedIds: string[];
  allVisits: EvvVisitRecord[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

export function EvvBulkActionBar({
  selectedIds,
  allVisits,
  onClearSelection,
  onActionComplete,
}: EvvBulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedIds.length === 0) return null;

  const selectedVisits = allVisits.filter((v) => selectedIds.includes(v.id));

  // 1. Bulk Confirm & Attest (Action 1 from Screenshot)
  const handleBulkConfirmAndAttest = () => {
    setIsProcessing(true);
    try {
      const count = bulkConfirmAndAttest(selectedIds);
      toast.success("Bulk Confirm & Attest Completed", {
        description: `Successfully verified and attested ${count} visit(s) for state EVV compliance. Billing holds cleared.`,
      });
      onClearSelection();
      onActionComplete();
    } catch (err) {
      toast.error("Failed to complete bulk attestation");
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Submit to Aggregator (Action 2 from Screenshot)
  const handleSubmitToAggregator = () => {
    setIsProcessing(true);
    try {
      const count = bulkSubmitToAggregator(selectedIds);
      toast.success("Submitted to Aggregator", {
        description: `Dispatched ${count} visit(s) to state gateway batch transmission queue (Sandata / HHAeXchange).`,
      });
      onClearSelection();
      onActionComplete();
    } catch (err) {
      toast.error("Failed to submit to aggregator");
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Export CSV (Action 3 from Screenshot)
  const handleExportCsv = () => {
    exportEvvVisitsCsv(selectedVisits);
    toast.success("EVV Export Downloaded", {
      description: `Exported ${selectedVisits.length} selected visit records to CSV format.`,
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d1629] text-white rounded-2xl px-4 sm:px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 max-w-4xl w-[94vw] sm:w-auto animate-slide-up">
      {/* Left side: [✓] 1 visit(s) selected (Matching Screenshot) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <CheckSquare className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
          {selectedIds.length} visit(s) selected
        </span>
      </div>

      {/* Right side: Action Buttons (Matching Screenshot) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 w-full sm:w-auto justify-end">
        {/* Bulk Confirm & Attest */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleBulkConfirmAndAttest}
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#3D6B22] hover:bg-[#345C1D] text-white text-xs font-bold rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bulk Confirm & Attest</span>
        </button>

        {/* Submit to Aggregator */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleSubmitToAggregator}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>Submit to Aggregator</span>
        </button>

        {/* Export CSV */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-slate-300" />
          <span>Export CSV</span>
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 ml-1"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
