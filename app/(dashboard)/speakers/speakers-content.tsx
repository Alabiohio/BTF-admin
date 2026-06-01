"use client";

import { useState, useMemo } from "react";
import DataCard from "@/components/DataCard";
import SearchFilter from "@/components/SearchFilter";
import ExportButton from "@/components/ExportButton";
import { Mic } from "lucide-react";
import { exportRegistrationsToPDF } from "@/lib/export-pdf";
import { exportRegistrationsToCSV } from "@/lib/export-csv";
import { exportRegistrationsToExcel } from "@/lib/export-excel";

interface Speaker {
  id: number;
  application_type: string;
  name: string;
  email: string;
  phone: string;
  speaker_name: string | null;
  topic: string;
  why_speak: string;
  created_at: Date;
}

const typeColors: { [key: string]: string } = {
  "speaker": "bg-blue-600",
  "suggested": "bg-amber-600",
};

export default function SpeakersContent({ speakers }: { speakers: Speaker[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpeakers = useMemo(() => {
    return speakers.filter((speaker) => {
      const query = searchQuery.toLowerCase();
      return (
        speaker.name.toLowerCase().includes(query) ||
        speaker.email.toLowerCase().includes(query) ||
        speaker.topic.toLowerCase().includes(query) ||
        speaker.phone.toLowerCase().includes(query)
      );
    });
  }, [speakers, searchQuery]);

  const handleExportPDF = async () => {
    await exportRegistrationsToPDF(
      filteredSpeakers,
      "Speakers",
      ["Date", "Name", "Email", "Phone", "Topic", "Application Type"]
    );
  };

  const handleExportCSV = async () => {
    await exportRegistrationsToCSV(
      filteredSpeakers,
      "Speakers",
      ["Date", "Name", "Email", "Phone", "Topic", "Application Type"]
    );
  };

  const handleExportExcel = async () => {
    await exportRegistrationsToExcel(
      filteredSpeakers,
      "Speakers",
      ["Date", "Name", "Email", "Phone", "Topic", "Application Type"]
    );
  };

  const exportOptions = [
    {
      type: "PDF" as const,
      label: "PDF",
      description: "Print-ready report with table layout",
      onExport: handleExportPDF,
    },
    {
      type: "CSV" as const,
      label: "CSV",
      description: "Lightweight file for imports and sharing",
      onExport: handleExportCSV,
    },
    {
      type: "EXCEL" as const,
      label: "Excel",
      description: "Spreadsheet format for analysis",
      onExport: handleExportExcel,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <SearchFilter
              onSearch={setSearchQuery}
              placeholder="Search by name, email, phone, or topic..."
            />
          </div>
        </div>
        <ExportButton options={exportOptions} disabled={filteredSpeakers.length === 0} />
      </div>

      <div className="text-sm text-gray-600">
        {searchQuery ? (
          <span>Found {filteredSpeakers.length} result{filteredSpeakers.length !== 1 ? "s" : ""}</span>
        ) : (
          <span>Showing all {speakers.length} speaker{speakers.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {filteredSpeakers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {searchQuery ? "No speakers match your search" : "No speakers registered yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpeakers.map((speaker) => (
            <DataCard
              key={speaker.id}
              badge={{
                label: speaker.application_type.charAt(0).toUpperCase() + speaker.application_type.slice(1),
                color: typeColors[speaker.application_type.toLowerCase()] || "bg-gray-600",
              }}
              fields={[
                { label: "Date", value: new Date(speaker.created_at).toLocaleDateString(), icon: "calendar" },
                { label: "Topic", value: speaker.topic, icon: "topic" },
                { label: "Name", value: speaker.name, icon: "user" },
                { label: "Email", value: speaker.email, icon: "email" },
                { label: "Phone", value: speaker.phone, icon: "phone" },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
