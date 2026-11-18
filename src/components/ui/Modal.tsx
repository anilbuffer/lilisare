import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
  icon,
  headerAction,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#111C16]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          {/* Backdrop (click to close handled in outer div if needed, but standard is to close on icon or escape) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, type: "spring", bounce: 0, damping: 20 }}
            className={cn(
              "relative w-full bg-white rounded-[20px] shadow-[0_24px_64px_rgba(17,28,22,0.14)] border border-[#D5DFDA] flex flex-col max-h-[90vh] overflow-hidden",
              maxWidthClasses[maxWidth]
            )}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#D5DFDA] p-3 sm:p-4 shrink-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <h3 className="font-semibold text-text-primary text-base tracking-tight">{title}</h3>
                  {description && (
                    <div className="text-[12px] text-text-secondary font-medium mt-0.5">{description}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {headerAction}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#F7F9F8] text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 bg-white">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-3 sm:p-4 border-t border-[#D5DFDA] shrink-0 bg-[#F7F9F8] rounded-b-[20px] z-10">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted || typeof document === 'undefined') return null;

  const { createPortal } = require("react-dom");
  return createPortal(modalContent, document.body);
}
