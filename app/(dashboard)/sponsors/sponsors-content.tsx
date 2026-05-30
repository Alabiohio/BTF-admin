"use client";

import { useState, useMemo } from "react";
import DataCard from "@/components/DataCard";
import SearchFilter from "@/components/SearchFilter";
import { Gem } from "lucide-react";

interface Sponsor {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  sponsorship_tier: string | null;
  interests: string | null;
  created_at: Date;
}

const tierColors: { [key: string]: string } = {
  "platinum": "bg-slate-600",
  "gold": "bg-yellow-600",
  "silver": "bg-gray-500",
  "bronze": "bg-amber-700",
};

export default function SponsorsContent({ sponsors }: { sponsors: Sponsor[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSponsors = useMemo(() => {
    return sponsors.filter((sponsor) => {
      const query = searchQuery.toLowerCase();
      return (
        sponsor.company_name.toLowerCase().includes(query) ||
        sponsor.contact_person.toLowerCase().includes(query) ||
        sponsor.email.toLowerCase().includes(query) ||
        sponsor.phone.toLowerCase().includes(query)
      );
    });
  }, [sponsors, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <SearchFilter
          onSearch={setSearchQuery}
          placeholder="Search by company, contact, email, or phone..."
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {searchQuery ? (
          <span>Found {filteredSponsors.length} result{filteredSponsors.length !== 1 ? "s" : ""}</span>
        ) : (
          <span>Showing all {sponsors.length} sponsor{sponsors.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Cards Grid */}
      {filteredSponsors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {searchQuery ? "No sponsors match your search" : "No sponsors registered yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <DataCard
              key={sponsor.id}
              badge={{
                label: sponsor.sponsorship_tier || "N/A",
                color: tierColors[(sponsor.sponsorship_tier || "").toLowerCase()] || "bg-gray-600",
              }}
              fields={[
                { label: "Date", value: new Date(sponsor.created_at).toLocaleDateString(), icon: "calendar" },
                { label: "Company", value: sponsor.company_name, icon: "company" },
                { label: "Contact Person", value: sponsor.contact_person, icon: "user" },
                { label: "Email", value: sponsor.email, icon: "email" },
                { label: "Phone", value: sponsor.phone, icon: "phone" },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
