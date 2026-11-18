"use client";

import { useState } from "react";

import { Building2, Save, HeartHandshake, Compass, Eye, Heart } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AgencyProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Agency Profile</h3>
        <p className="text-xs text-text-secondary mt-1">Manage core agency details, identifiers, and primary contact information.</p>
      </div>

      <form className="space-y-4 max-w-full">
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand-teal" />
            </div>
            <h4 className="font-semibold text-slate-800">Basic Information</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Agency Legal Name</label>
              <input type="text" defaultValue="LiliSare LLC" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Doing Business As (DBA)</label>
              <input type="text" defaultValue="LiliSare" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">National Provider Identifier (NPI)</label>
              <input type="text" defaultValue="1234567890" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm font-mono transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tax ID / EIN</label>
              <input type="password" defaultValue="12-3456789" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm font-mono transition-colors" />
            </div>
          </div>
        </Card>

        {/* Brand & Organization Identity */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Brand Identity & Philosophy</h4>
                <p className="text-xs text-slate-500">Official brand identity, community purpose, and core statements.</p>
              </div>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center">
              <img src="/main-logo.svg" alt="LiliSare Logo" className="h-8 w-auto object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Brand Tagline</label>
              <input
                type="text"
                defaultValue="Live-In Caregivers, Family Caregivers, and Family Friends"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Who We Are</label>
              <textarea
                rows={4}
                defaultValue="LiliSare was founded by two mothers of children with special needs who understand both the challenges and rewards of caregiving. We created this company to share our experience, knowledge, and support with others navigating similar journeys.&#10;&#10;You’re why we do what we do. At LiliSare, we lead with the heart, understanding the love, strength, and dedication it takes to care for someone close to you—whether you're a family member or a family friend providing care. We’re here for you. Our team offers compassion, guidance, and real connection—treating you like family every step of the way."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-brand-teal" /> Mission Statement
                </label>
                <textarea
                  rows={4}
                  defaultValue="At LiliSare, our mission is to care for the whole family—both the loved one receiving care and the caregiver giving it. We share what we've learned, navigate services alongside you, and offer the knowledge, guidance, and support that help your family thrive together."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" /> Vision Statement
                </label>
                <textarea
                  rows={4}
                  defaultValue="We envision a world where no one in a caregiving family is overlooked—where the person receiving care is seen and valued, and the caregiver is supported, never depleted, and never alone. We treat your family like our own: lifting one another through compassion, connection, and community."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors leading-relaxed"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <h4 className="font-semibold text-slate-800">Primary Location</h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Street Address</label>
              <input type="text" defaultValue="100 Healthcare Blvd, Suite 200" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">City</label>
                <input type="text" defaultValue="Seattle" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">State</label>
                <input type="text" defaultValue="WA" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ZIP Code</label>
                <input type="text" defaultValue="98101" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-sm transition-colors" />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className="inline-flex items-center gap-2 bg-brand-teal hover:bg-teal-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
