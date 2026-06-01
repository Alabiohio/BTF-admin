"use client";

import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Table,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ExportType = "PDF" | "CSV" | "EXCEL";

export interface ExportOption {
  type: ExportType;
  label: string;
  description: string;
  onExport: () => Promise<void>;
}

interface ExportButtonProps {
  options: ExportOption[];
  disabled?: boolean;
}

const iconMap = {
  PDF: FileText,
  CSV: Table,
  EXCEL: FileSpreadsheet,
};

export default function ExportButton({ options, disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState<ExportType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleExport = async (option: ExportOption) => {
    setIsOpen(false);
    setExportingType(option.type);
    try {
      await option.onExport();
    } finally {
      setExportingType(null);
    }
  };

  const isExporting = exportingType !== null;
  const isDisabled = disabled || isExporting || options.length === 0;

  return (
    <div ref={menuRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={isDisabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-biro-blue px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-biro-blue-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <Download className="h-4 w-4" />
        <span>{isExporting ? `Exporting ${exportingType}...` : "Download"}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-full min-w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg sm:w-72"
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Export format
            </p>
          </div>

          <div className="p-1">
            {options.map((option) => {
              const Icon = iconMap[option.type];

              return (
                <button
                  key={option.type}
                  type="button"
                  role="menuitem"
                  onClick={() => handleExport(option)}
                  className="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-biro-blue/10 text-biro-blue">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
