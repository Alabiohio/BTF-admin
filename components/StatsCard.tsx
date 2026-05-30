"use client";

import * as Icons from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  iconName: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  iconName,
  color,
  trend,
}: StatsCardProps) {
  const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className: string }>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 font-andika">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}/10`}>
          {Icon ? <Icon className={`w-6 h-6 ${color}`} /> : null}
        </div>
        {trend && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-oswald font-bold text-gray-900">{value}</p>
    </div>
  );
}
