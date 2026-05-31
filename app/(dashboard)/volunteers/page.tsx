import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import StatsCard from "@/components/StatsCard";
import VolunteersContent from "./volunteers-content";

export const revalidate = 0;

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

async function getVolunteers(): Promise<Volunteer[]> {
  try {
    const res = await db.execute(sql`SELECT * FROM volunteer_registrations ORDER BY created_at DESC`);
    return res.rows as Volunteer[];
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    return [];
  }
}

export default async function VolunteersPage() {
  const volunteers = await getVolunteers();
  const withSkills = volunteers.filter((v) => v.skills).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-oswald font-bold text-biro-blue-dark mb-2">Volunteers</h1>
        <p className="text-gray-600">Manage and view all registered volunteers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Volunteers"
          value={volunteers.length}
          iconName="Users"
          color="text-green-600"
        />
        <StatsCard
          title="With Skills Listed"
          value={withSkills}
          iconName="Users"
          color="text-blue-600"
        />
        <StatsCard
          title="Contact Available"
          value={volunteers.filter((v) => v.email || v.phone).length}
          iconName="Users"
          color="text-purple-600"
        />
      </div>

      {/* Search */}
      <VolunteersContent volunteers={volunteers} />
    </div>
  );
}
