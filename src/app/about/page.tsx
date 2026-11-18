"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  Compass,
  Eye,
  Users,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export default function AboutPage() {
  const { currentUser } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex items-center justify-between">
          <Link
            href={
              currentUser?.role === "CLIENT" || currentUser?.role === "FAMILY"
                ? "/portal"
                : currentUser?.role === "CAREGIVER"
                ? "/caregiver"
                : "/dashboard"
            }
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-teal transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/20">
            About Our Company
          </span>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1B3414] via-[#24461B] to-[#14280E] text-white p-8 sm:p-12 border border-[#93C573]/30 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#93C573]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#FF6E61]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-white/15">
                <Heart className="w-3.5 h-3.5 text-[#FF6E61]" />
                <span>Our Heart, Heritage & Story</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                LiliSare
              </h1>
              <p className="text-lg sm:text-xl font-medium text-emerald-200/90 leading-snug">
                Live-In Caregivers, Family Caregivers, and Family Friends
              </p>
              <p className="text-sm sm:text-base text-emerald-100/75 leading-relaxed pt-2">
                At LiliSare, we believe caregiving comes in many forms. Whether you&apos;re a family member or a close friend, we’re here to support you. We value the strength of community and the deep bond between those who provide care and those who receive it. No matter your role, we’re here to guide and empower you every step of the way.
              </p>
            </div>

            <div className="shrink-0 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center">
              <img
                src="/main-logo.svg"
                alt="LiliSare Logo"
                className="w-48 sm:w-56 h-auto object-contain"
              />
              <span className="text-[11px] font-medium text-emerald-200/80 mt-3">
                Official Brand & Care Mark
              </span>
            </div>
          </div>
        </div>

        {/* Who We Are Story */}
        <Card className="p-6 sm:p-8 space-y-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 bg-[#FF6E61]/10 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#FF6E61]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Who We Are ( LiliSare )</h2>
              <p className="text-xs text-slate-500">Founded by mothers, driven by compassion, dedicated to community</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700 leading-relaxed text-sm sm:text-base">
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-3">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-teal" />
                Our Founding Story
              </h3>
              <p>
                LiliSare was founded by two mothers of children with special needs who understand both the challenges and rewards of caregiving. We created this company to share our experience, knowledge, and support with others navigating similar journeys.
              </p>
            </div>

            <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-3">
              <h3 className="font-semibold text-emerald-950 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Leading With The Heart
              </h3>
              <p>
                You’re why we do what we do. At LiliSare, we lead with the heart, understanding the love, strength, and dedication it takes to care for someone close to you—whether you&apos;re a family member or a family friend providing care. We’re here for you. Our team offers compassion, guidance, and real connection—treating you like family every step of the way.
              </p>
            </div>
          </div>
        </Card>

        {/* Mission and Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <Card className="p-6 sm:p-8 space-y-4 border border-teal-100 bg-gradient-to-br from-white to-teal-50/30 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                <Compass className="w-6 h-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mission Statement</h3>
                <p className="text-xs text-slate-500">Caring for the whole family</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              At LiliSare, our mission is to care for the whole family—both the loved one receiving care and the caregiver giving it. We share what we&apos;ve learned, navigate services alongside you, and offer the knowledge, guidance, and support that help your family thrive together.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal">
                <CheckCircle2 className="w-4 h-4" />
                <span>Empowering caregivers & loved ones in tandem</span>
              </div>
            </div>
          </Card>

          {/* Vision Card */}
          <Card className="p-6 sm:p-8 space-y-4 border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vision Statement</h3>
                <p className="text-xs text-slate-500">A world where no one is overlooked</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              We envision a world where no one in a caregiving family is overlooked—where the person receiving care is seen and valued, and the caregiver is supported, never depleted, and never alone. We treat your family like our own: lifting one another through compassion, connection, and community.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Lifting families through compassion & community</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Pillars / Values Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-brand-teal" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Live-In & Family Caregivers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Specialized support designed specifically for live-in situations, family members, and close friends stepping up to provide daily care.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Family Friends Community</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Caregiving extends beyond biological ties. We honor and equip close friends who share the bond of caregiving.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FF6E61]" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Supported, Never Depleted</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Providing respite, coaching, service navigation, and clinical backup so caregivers thrive and never feel alone.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
