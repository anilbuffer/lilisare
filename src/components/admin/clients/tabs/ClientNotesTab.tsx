"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Pin,
  Send,
  Plus,
  User,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { ClientRecord } from "@/types/client";
import { toast } from "sonner";
import { saveClientsToStorage, getClientsFromStorage } from "@/lib/clients/mockData";

interface ClientNotesTabProps {
  client: ClientRecord;
  onUpdateClient: (updated: ClientRecord) => void;
}

export function ClientNotesTab({ client, onUpdateClient }: ClientNotesTabProps) {
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "General" | "Family Communication" | "Coordination" | "Supervisory" | "Billing"
  >("Family Communication");
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const notes = client.notes || [];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote = {
      id: `NOT-${Date.now()}`,
      timestamp: "Today, Just now",
      author: "Agency Admin",
      authorRole: "Operational Administrator",
      category: selectedCategory,
      title: newNoteTitle.trim() || `${selectedCategory} Note`,
      content: newNoteContent.trim(),
      isPinned: false,
    };

    const updated: ClientRecord = {
      ...client,
      notes: [newNote, ...(client.notes || [])],
      updatedAtRelative: "Just now",
    };

    onUpdateClient(updated);
    const all = getClientsFromStorage();
    const idx = all.findIndex((c) => c.id === client.id);
    if (idx !== -1) {
      all[idx] = updated;
      saveClientsToStorage(all);
    }

    setNewNoteTitle("");
    setNewNoteContent("");
    toast.success("Note added to client timeline.");
  };

  const filteredNotes = notes.filter(
    (n) => filterCategory === "All" || n.category === filterCategory
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Case Coordination & Administration Notes
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20">
                Staff Chronology
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Internal agency communications, family calls, case management logs, and supervisory updates
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Note Form Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#3D6B22]" />
            <span>Record New Communication / Staff Note</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Logged with your staff signature
          </span>
        </div>

        <form onSubmit={handleAddNote} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-8">
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Subject / Note Title
              </label>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="e.g. Family Phone Call regarding shift adjustment"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="text-[13px] font-medium text-slate-700 block mb-1">
                Note Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all font-medium cursor-pointer"
              >
                <option value="Family Communication">Family Communication</option>
                <option value="Coordination">Coordination</option>
                <option value="Supervisory">Supervisory</option>
                <option value="Billing">Billing</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 block mb-1">
              Note Content
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              placeholder="Enter comprehensive conversation details, decisions made, or follow-up instructions..."
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!newNoteContent.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post to Timeline</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {["All", "Family Communication", "Supervisory", "Coordination", "General"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterCategory === cat
                ? "bg-[#3D6B22] text-white shadow-2xs font-bold"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-3.5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-5 sm:p-6 rounded-xl lg:rounded-2xl border transition-all ${
              note.isPinned
                ? "bg-amber-50/30 border-amber-300 shadow-2xs"
                : "bg-white border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {note.isPinned && (
                  <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                )}
                <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {note.category}
                </span>
              </div>

              <div className="text-xs font-medium text-slate-400 shrink-0">
                {note.timestamp}
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Author: <strong className="text-slate-800">{note.author}</strong> ({note.authorRole})
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
