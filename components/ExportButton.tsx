"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
}

export default function ExportButton({ onExport, label = "Export" }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  
  const handleClick = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-biro-blue text-white rounded-lg hover:bg-biro-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileDown className="w-4 h-4" />
      {exporting ? "Exporting..." : label}
    </button>
  );
}