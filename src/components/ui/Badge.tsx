import React from "react";
import { cn } from "./Card";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default" | "neutral" | "brand" | "coral" | "sage";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[#E3F1D9] text-[#1E5622] border border-[#1E5622]/15",
  warning: "bg-[#FEF3C7] text-[#9A5B00] border border-[#9A5B00]/15",
  error: "bg-[#FEE2E2] text-[#B91C1C] border border-[#B91C1C]/15",
  info: "bg-[#E0F2F5] text-[#0F5E6E] border border-[#0F5E6E]/15",
  default: "bg-[#F7F9F8] text-[#4A5D52] border border-[#D5DFDA]",
  neutral: "bg-[#F7F9F8] text-[#4A5D52] border border-[#D5DFDA]",
  brand: "bg-[#E3F1D9] text-[#3D6B22] border border-[#3D6B22]/20 font-medium",
  coral: "bg-[#FF6E61]/15 text-[#D93829] border border-[#FF6E61]/30 font-medium",
  sage: "bg-[#E3F1D9] text-[#1E5622] border border-[#93C573]/30 font-medium",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
