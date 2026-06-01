"use client";

import { useState, useMemo } from "react";
import DataCard from "@/components/DataCard";
import SearchFilter from "@/components/SearchFilter";
import ExportButton from "@/components/ExportButton";
import { Users } from "lucide-react";
import { exportRegistrationsToPDF } from "@/lib/export-pdf";

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string | null;
  availability: string | null;
  motivation: string | null;
  created_at: Date;
}

export default function VolunteersContent({ volunteers }: { volunteers: Volunteer[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const query = searchQuery.toLowerCase();
      return (
        volunteer.name.toLowerCase().includes(query) ||
        volunteer.email.toLowerCase().includes(query) ||
        volunteer.phone.toLowerCase().includes(query) ||
        (volunteer.skills?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [volunteers, searchQuery]);

  const handleExport = () => {
    exportRegistrationsToPDF(
      filteredVolunteers,
      "Volunteers",
      ["Date", "Name", "Skills", "Availability", "Email", "Phone"]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <SearchFilter
              onSearch={setSearchQuery}
              placeholder="Search by name, email, phone, or skills..."
            />
          </div>
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      <div className="text-sm text-gray-600">
        {searchQuery ? (
          <span>Found {filteredVolunteers.length} result{filteredVolunteers.length !== 1 ? "s" : ""}</span>
        ) : (
          <span>Showing all {volunteers.length} volunteer{volunteers.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {filteredVolunteers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {searchQuery ? "No volunteers match your search" : "No volunteers registered yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer) => (
            <DataCard
              key={volunteer.id}
              fields={[
                { label: "Date", value: new Date(volunteer.created_at).toLocaleDateString(), icon: "calendar" },
                { label: "Name", value: volunteer.name, icon: "user" },
                { label: "Skills", value: volunteer.skills, icon: "skills" },
                { label: "Availability", value: volunteer.availability },
                { label: "Email", value: volunteer.email, icon: "email" },
                { label: "Phone", value: volunteer.phone, icon: "phone" },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
