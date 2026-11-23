import React from "react";
import { cn } from "./Card";
import { ChevronDown } from "lucide-react";

export function FormSection({
  title,
  description,
  badge,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1 mb-4", className)}>
      <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
        {badge}
        <span>{title}</span>
        <div className="h-px bg-slate-100 flex-1"></div>
      </h4>
      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}

export function FormLabel({
  children,
  required,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-[13px] font-medium text-slate-700 block mb-1.5", className)}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type = "text", ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
FormInput.displayName = "FormInput";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full pr-8 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all text-slate-700 appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed",
            icon ? "pl-10" : "pl-3.5",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);
FormSelect.displayName = "FormSelect";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D6B22]/20 focus:border-[#3D6B22] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export function FormButtonPrimary({
  children,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#3D6B22] hover:bg-[#345C1D] rounded-xl shadow-md shadow-[#3D6B22]/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const cancelBackBtnClass =
  "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-[0_6px_32px_rgba(0,0,0,0.06)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export function FormButtonSecondary({
  children,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(cancelBackBtnClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function FormButtonCancel({
  children = "Cancel",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(cancelBackBtnClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function FormButtonBack({
  children = "Back",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-[0_6px_32px_rgba(0,0,0,0.06)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
