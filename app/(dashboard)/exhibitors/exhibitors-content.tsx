"use client";

import { useState, useMemo } from "react";
import DataCard from "@/components/DataCard";
import SearchFilter from "@/components/SearchFilter";
import ExportButton from "@/components/ExportButton";
import { Building2 } from "lucide-react";
import { exportRegistrationsToPDF } from "@/lib/export-pdf";

interface Exhibitor {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string | null;
  description: string | null;
  created_at: Date;
}

export default function ExhibitorsContent({ exhibitors }: { exhibitors: Exhibitor[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExhibitors = useMemo(() => {
    return exhibitors.filter((exhibitor) => {
      const query = searchQuery.toLowerCase();
      return (
        exhibitor.name.toLowerCase().includes(query) ||
        exhibitor.company.toLowerCase().includes(query) ||
        exhibitor.email.toLowerCase().includes(query) ||
        exhibitor.phone.toLowerCase().includes(query)
      );
    });
  }, [exhibitors, searchQuery]);

  const handleExport = () => {
    exportRegistrationsToPDF(
      filteredExhibitors,
      "Exhibitors",
      ["Date", "Company", "Description", "Contact Name", "Email", "Phone", "Website"]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <SearchFilter
              onSearch={setSearchQuery}
              placeholder="Search by name, company, email, or phone..."
            />
          </div>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <div className="text-sm text-gray-600">
        {searchQuery ? (
          <span>Found {filteredExhibitors.length} result{filteredExhibitors.length !== 1 ? "s" : ""}</span>
        ) : (
          <span>Showing all {exhibitors.length} exhibitor{exhibitors.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {filteredExhibitors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {searchQuery ? "No exhibitors match your search" : "No exhibitors registered yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitors.map((exhibitor) => (
            <DataCard
              key={exhibitor.id}
              fields={[
                { label: "Date", value: new Date(exhibitor.created_at).toLocaleDateString(), icon: "calendar" },
                { label: "Company", value: exhibitor.company, icon: "company" },
                { label: "Description", value: exhibitor.description, icon: "topic" },
                { label: "Contact Name", value: exhibitor.name, icon: "user" },
                { label: "Email", value: exhibitor.email, icon: "email" },
                { label: "Phone", value: exhibitor.phone, icon: "phone" },
                { label: "Website", value: exhibitor.website, icon: "website" },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
