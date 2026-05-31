import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import StatsCard from "@/components/StatsCard";
import SpeakersContent from "./speakers-content";

// Disable caching to always show latest registrations
export const revalidate = 0;

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

async function getSpeakers(): Promise<Speaker[]> {
  try {
    const res = await db.execute(sql`SELECT * FROM speaker_registrations ORDER BY created_at DESC`);
    return res.rows as Speaker[];
  } catch (err) {
    console.error("Error fetching speakers:", err);
    return [];
  }
}

export default async function SpeakersPage() {
  const speakers = await getSpeakers();
  const speakerCount = speakers.filter((s) => s.application_type === "speaker").length;
  const suggestedCount = speakers.filter((s) => s.application_type === "suggested").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-oswald font-bold text-biro-blue-dark mb-2">Speakers</h1>
        <p className="text-gray-600">Manage and view all registered speakers and suggestions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Speakers"
          value={speakers.length}
          iconName="Mic"
          color="text-blue-600"
        />
        <StatsCard
          title="Direct Speakers"
          value={speakerCount}
          iconName="Mic"
          color="text-blue-600"
        />
        <StatsCard
          title="Suggested Speakers"
          value={suggestedCount}
          iconName="Mic"
          color="text-amber-600"
        />
      </div>

      {/* Search */}
      <SpeakersContent speakers={speakers} />
    </div>
  );
}
