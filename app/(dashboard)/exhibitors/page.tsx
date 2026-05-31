import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import StatsCard from "@/components/StatsCard";
import ExhibitorsContent from "./exhibitors-content";

export const revalidate = 0;

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

async function getExhibitors(): Promise<Exhibitor[]> {
  try {
    const res = await db.execute(sql`SELECT * FROM exhibitor_registrations ORDER BY created_at DESC`);
    return res.rows as unknown as Exhibitor[];
  } catch (err) {
    console.error("Error fetching exhibitors:", err);
    return [];
  }
}

export default async function ExhibitorsPage() {
  const exhibitors = await getExhibitors();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-oswald font-bold text-biro-blue-dark mb-2">Exhibitors</h1>
        <p className="text-gray-600">Manage and view all registered exhibitors for the event.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Exhibitors"
          value={exhibitors.length}
          iconName="Building2"
          color="text-blue-600"
        />
        <StatsCard
          title="With Website"
          value={exhibitors.filter((e) => e.website).length}
          iconName="Building2"
          color="text-green-600"
        />
        <StatsCard
          title="Contact Available"
          value={exhibitors.filter((e) => e.email || e.phone).length}
          iconName="Building2"
          color="text-purple-600"
        />
      </div>

      {/* Search */}
      <ExhibitorsContent exhibitors={exhibitors} />
    </div>
  );
}
