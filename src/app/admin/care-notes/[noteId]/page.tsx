import React, { Suspense } from "react";
import { CareNoteDetailWorkspace } from "@/components/admin/care-notes/CareNoteDetailWorkspace";
import { INITIAL_CARE_NOTES } from "@/lib/admin/careNotesStore";

interface PageProps {
  params: Promise<{
    noteId: string;
  }>;
}

export const metadata = {
  title: "Care Note Inspection & Review | LiliSphere Admin",
  description: "Comprehensive care documentation review, version audit, and quality sign-off.",
};

export function generateStaticParams() {
  return INITIAL_CARE_NOTES.map((note) => ({
    noteId: note.id,
  }));
}

export default async function AdminCareNoteDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-7xl mx-auto py-16 text-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#3e6b2b] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="font-semibold text-xs text-slate-600">Loading Care Note Details...</p>
        </div>
      }
    >
      <CareNoteDetailWorkspace noteId={resolvedParams.noteId} />
    </Suspense>
  );
}
