"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Heart,
  ShieldCheck,
  Calendar,
  Clock,
  Search,
  Plus,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Check,
  Kanban,
  List,
  FilterX,
  FileCheck2,
  Archive,
  Inbox,
  Filter,
} from "lucide-react";
import {
  MOCK_HOUSEHOLDS,
  Household,
  getHouseholdsFromStorage,
  saveHouseholdsToStorage,
} from "@/lib/households/mockData";
import { subscribeToIntakeSync } from "@/lib/intake/intakeSync";
import { toast } from "sonner";
import HouseholdsPage from "@/app/households/page";

export default function IntakeHouseholdsPage() {
  return <HouseholdsPage initialViewMode="list" baseDetailsPath="/intake/households" />;
}
