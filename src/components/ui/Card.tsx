import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, type HTMLMotionProps } from "framer-motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends HTMLMotionProps<"div"> {
  className?: string;
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, noPadding = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-white rounded-2xl border border-[#D5DFDA] shadow-[0_2px_6px_-1px_rgba(17,28,22,0.06),0_1px_2px_-1px_rgba(17,28,22,0.04)] transition-all duration-300 hover:shadow-[0_4px_12px_-1px_rgba(17,28,22,0.08)] hover:border-[#93C573]/80 relative overflow-hidden",
          !noPadding && "",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="text-sm">{action}</div>}
    </div>
  );
}
