import { db } from "@/lib/db";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import StatsCard from "@/components/StatsCard";
import { Mic, Building2, Gem, Users } from "lucide-react";
import { sql } from "drizzle-orm";

export const revalidate = 0;

interface RecentActivity {
  type: string;
  name: string;
  created_at: string;
}

type CountRow = {
  count: string | number | bigint;
};

function getCount(rows: unknown[]): number {
  const [row] = rows as CountRow[];
  return Number(row?.count ?? 0);
}

async function getRecentActivity(): Promise<RecentActivity[]> {
  try {
    const res = await db.execute(sql`
      SELECT 'speaker' as type, name, created_at FROM speaker_registrations
      UNION ALL
      SELECT 'exhibitor' as type, name, created_at FROM exhibitor_registrations
      UNION ALL
      SELECT 'sponsor' as type, company_name as name, created_at FROM sponsor_registrations
      UNION ALL
      SELECT 'volunteer' as type, name, created_at FROM volunteer_registrations
      ORDER BY created_at DESC
      LIMIT 5
    `);
    return res.rows as unknown as RecentActivity[];
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    return [];
  }
}

export default async function DashboardOverview() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/auth/sign-in");
  }

  let counts = {
    speakers: 0,
    exhibitors: 0,
    sponsors: 0,
    volunteers: 0,
  };

  let recentActivity: RecentActivity[] = [];

  try {
    const [speakersRes, exhibitorsRes, sponsorsRes, volunteersRes] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) FROM speaker_registrations`),
      db.execute(sql`SELECT COUNT(*) FROM exhibitor_registrations`),
      db.execute(sql`SELECT COUNT(*) FROM sponsor_registrations`),
      db.execute(sql`SELECT COUNT(*) FROM volunteer_registrations`),
    ]);
    recentActivity = await getRecentActivity();

    counts = {
      speakers: getCount(speakersRes.rows),
      exhibitors: getCount(exhibitorsRes.rows),
      sponsors: getCount(sponsorsRes.rows),
      volunteers: getCount(volunteersRes.rows),
    };
  } catch (err) {
    console.error("Error fetching counts:", err);
  }

  const totalRegistrations = counts.speakers + counts.exhibitors + counts.sponsors + counts.volunteers;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-andika">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-4xl font-oswald font-bold text-biro-blue-dark mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of all event registrations and recent activity.</p>
      </div>

      {/* Stats Cards - 2 cols mobile, 5 cols lg+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Participants"
          value={totalRegistrations}
          iconName="Users"
          color="text-biro-blue"
        />
        <StatsCard
          title="Speakers"
          value={counts.speakers}
          iconName="Mic"
          color="text-blue-600"
        />
        <StatsCard
          title="Exhibitors"
          value={counts.exhibitors}
          iconName="Building2"
          color="text-green-600"
        />
        <StatsCard
          title="Sponsors"
          value={counts.sponsors}
          iconName="Gem"
          color="text-purple-600"
        />
        <StatsCard
          title="Volunteers"
          value={counts.volunteers}
          iconName="Heart"
          color="text-pink-600"
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-oswald font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Speakers", href: "/speakers", icon: Mic, color: "bg-biro-blue" },
            { title: "Exhibitors", href: "/exhibitors", icon: Building2, color: "bg-biro-blue-dark" },
            { title: "Sponsors", href: "/sponsors", icon: Gem, color: "bg-purple-600" },
            { title: "Volunteers", href: "/volunteers", icon: Users, color: "bg-green-600" },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link href={link.href} key={link.title}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${link.color} text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">{link.title}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-oswald font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {recentActivity.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((activity, index) => (
                <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-gray-500 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
