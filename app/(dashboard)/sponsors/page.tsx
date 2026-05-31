import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import StatsCard from "@/components/StatsCard";
import SponsorsContent from "./sponsors-content";

export const revalidate = 0;

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

async function getSponsors(): Promise<Sponsor[]> {
  try {
    const res = await db.execute(sql`SELECT * FROM sponsor_registrations ORDER BY created_at DESC`);
    return res.rows as Sponsor[];
  } catch (err) {
    console.error("Error fetching sponsors:", err);
    return [];
  }
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors();
  const platinumCount = sponsors.filter((s) => s.sponsorship_tier?.toLowerCase() === "platinum").length;
  const goldCount = sponsors.filter((s) => s.sponsorship_tier?.toLowerCase() === "gold").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-oswald font-bold text-biro-blue-dark mb-2">Sponsors</h1>
        <p className="text-gray-600">Manage and view all registered sponsors.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Sponsors"
          value={sponsors.length}
          iconName="Gem"
          color="text-purple-600"
        />
        <StatsCard
          title="Platinum Tier"
          value={platinumCount}
          iconName="Gem"
          color="text-slate-600"
        />
        <StatsCard
          title="Gold Tier"
          value={goldCount}
          iconName="Gem"
          color="text-yellow-600"
        />
      </div>

      {/* Search */}
      <SponsorsContent sponsors={sponsors} />
    </div>
  );
}
