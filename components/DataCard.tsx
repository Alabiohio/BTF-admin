"use client";

import { Mail, Phone, Globe, Briefcase, User, Calendar } from "lucide-react";

interface DataCardProps {
  fields: Array<{
    label: string;
    value: string | null | undefined;
    icon?: "email" | "phone" | "website" | "company" | "user" | "calendar" | "topic" | "skills";
  }>;
  badge?: {
    label: string;
    color: string;
  };
}

const iconMap = {
  email: Mail,
  phone: Phone,
  website: Globe,
  company: Briefcase,
  user: User,
  calendar: Calendar,
  topic: Briefcase,
  skills: User,
};

export default function DataCard({ fields, badge }: DataCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-biro-blue/30 transition-all duration-300 p-6 font-andika group overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-biro-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative">
        {badge && (
          <div className="mb-4 inline-block">
            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white ${badge.color} shadow-md`}>
              {badge.label}
            </span>
          </div>
        )}
        
        <div className="space-y-4">
          {fields.map((field, index) => {
            const IconComponent = field.icon ? iconMap[field.icon] : null;
            return (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 last:pb-0 last:border-b-0 border-b border-gray-100 group/item"
              >
                {IconComponent && (
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="w-4 h-4 text-biro-blue/60 group-hover/item:text-biro-blue transition-colors" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm text-gray-900 font-medium break-words">
                    {field.value ? (
                      field.icon === "email" ? (
                        <a
                          href={`mailto:${field.value}`}
                          className="text-biro-blue hover:underline"
                        >
                          {field.value}
                        </a>
                      ) : field.icon === "phone" ? (
                        <a
                          href={`tel:${field.value}`}
                          className="text-biro-blue hover:underline"
                        >
                          {field.value}
                        </a>
                      ) : field.icon === "website" ? (
                        <a
                          href={field.value.startsWith("http") ? field.value : `https://${field.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-biro-blue hover:underline break-all"
                        >
                          {field.value}
                        </a>
                      ) : (
                        field.value
                      )
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
