"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  Search,
  User,
  Calendar,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { AdminCaregiverProfile, CaregiverNoteItem } from "@/lib/caregivers/adminCaregiversData";
import { toast } from "sonner";

interface CaregiverNoteListTabProps {
  profile: AdminCaregiverProfile;
}

const DEFAULT_NOTES: CaregiverNoteItem[] = [
  {
    id: "NOTE-1",
    date: "Nov 20, 2026",
    author: "Mackenzie Bertelsman",
    role: "Care Manager",
    category: "Clinical",
    content:
      "Client family noted caregiver was extremely gentle and professional during morning routine. Punctual and documented all ADLs accurately.",
  },
  {
    id: "NOTE-2",
    date: "Nov 12, 2026",
    author: "Sydney Garsee",
    role: "Director of Nursing",
    category: "Clinical",
    content:
      "Completed in-person supervisory visit. Observed safe Hoyer lift transfer techniques and infection control hand hygiene compliance.",
  },
  {
    id: "NOTE-3",
    date: "Oct 28, 2026",
    author: "HR Department",
    role: "HR Specialist",
    category: "HR",
    content:
      "Submitted updated BLS CPR renewal card ahead of expiration. Verified on state registry and updated HR record.",
  },
  {
    id: "NOTE-4",
    date: "Oct 14, 2026",
    author: "Dispatch Desk",
    role: "Scheduler",
    category: "Scheduling",
    content:
      "Caregiver notified agency 48 hours in advance for Friday afternoon coverage swap. Backup aide assigned smoothly.",
  },
];

export function CaregiverNoteListTab({ profile }: CaregiverNoteListTabProps) {
  const [notes, setNotes] = useState<CaregiverNoteItem[]>(
    profile.notes && profile.notes.length > 0 ? profile.notes : DEFAULT_NOTES
  );
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"General" | "Scheduling" | "Clinical" | "HR">(
    "General"
  );
  const [activeCategory, setActiveCategory] = useState("All");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      toast.error("Please enter note text");
      return;
    }

    const created: CaregiverNoteItem = {
      id: `NOTE-${Date.now()}`,
      date: "Today",
      author: "Agency Admin",
      role: "Operations Supervisor",
      category: newCategory,
      content: newContent.trim(),
    };

    setNotes((prev) => [created, ...prev]);
    setNewContent("");
    toast.success("Note added to caregiver record.");
  };

  const filtered = notes.filter(
    (n) => activeCategory === "All" || n.category === activeCategory
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 01. Note Composer Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D6B22]/10 text-[#3D6B22] border border-[#3D6B22]/20 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Administrative & Supervisory Note Feed
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Internal logs for scheduling adjustments, supervisory reviews, and caregiver feedback
            </p>
          </div>
        </div>

        <form onSubmit={handleAddNote} className="space-y-3.5 pt-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            placeholder="Type an internal note regarding performance, shift adjustments, or supervisory observations..."
            className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] transition-all"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["General", "Clinical", "Scheduling", "HR"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${newCategory === cat
                      ? "bg-[#3D6B22] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Note</span>
            </button>
          </div>
        </form>
      </div>

      {/* 02. Filter Category Pills */}
      <div className="flex items-center gap-2">
        {["All", "Clinical", "Scheduling", "HR", "General"].map((cat) => {
          const count =
            cat === "All"
              ? notes.length
              : notes.filter((n) => n.category === cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isActive
                ? "bg-[#3D6B22] text-white shadow-sm shadow-[#3D6B22]/20"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 03. Note Feed List */}
      <div className="space-y-3.5">
        {filtered.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-xl lg:rounded-2xl p-5 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#3D6B22] font-bold text-xs flex items-center justify-center shrink-0">
                  {note.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{note.author}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{note.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {note.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{note.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium pl-10.5">
              {note.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
