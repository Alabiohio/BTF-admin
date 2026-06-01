"use client";

import { Mail, Phone, Globe, Briefcase, User, Calendar, ExternalLink } from "lucide-react";

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
  const contactFields = fields.filter(f => ["email", "phone", "website"].includes(f.icon || ""));
  const otherFields = fields.filter(f => !["email", "phone", "website"].includes(f.icon || ""));

  const renderField = (field: typeof fields[0], index: number) => {
    const IconComponent = field.icon ? iconMap[field.icon] : null;
    return (
      <div key={index} className="flex items-start gap-3">
        {IconComponent && (
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent className="w-4 h-4 text-biro-blue/60 group-hover/item:text-biro-blue transition-colors" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{field.label}</p>
          <p className="text-sm text-gray-900 font-medium break-words">
            {field.value ? (
              field.icon === "email" ? (
                <a href={`mailto:${field.value}`} className="text-biro-blue hover:underline inline-flex items-center gap-1">
                  {field.value}
                </a>
              ) : field.icon === "phone" ? (
                <a href={`tel:${field.value}`} className="text-biro-blue hover:underline">
                  {field.value}
                </a>
              ) : field.icon === "website" ? (
                <a
                  href={field.value.startsWith("http") ? field.value : `https://${field.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-biro-blue hover:underline inline-flex items-center gap-1 break-all"
                >
                  {field.value.replace(/^https?:\/\//, "")}
                  <ExternalLink className="w-3 h-3" />
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
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-biro-blue/30 transition-all duration-300 p-6 font-andika group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-biro-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative">
        {badge && (
          <div className="mb-4">
            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white ${badge.color} shadow-md uppercase tracking-wide`}>
              {badge.label}
            </span>
          </div>
        )}
        
        <div className="space-y-5">
          {otherFields.map((field, index) => renderField(field, index))}
          
          {contactFields.length > 0 && (
            <div className="pt-3 mt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {contactFields.map((field, index) => {
                  const IconComponent = field.icon ? iconMap[field.icon] : null;
                  return (
                    <div key={index} className="flex items-center gap-2 min-w-0">
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 text-biro-blue/60 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-900">
                        {field.value ? (
                          field.icon === "email" ? (
                            <a href={`mailto:${field.value}`} className="text-biro-blue hover:underline">{field.value}</a>
                          ) : field.icon === "phone" ? (
                            <a href={`tel:${field.value}`} className="text-biro-blue hover:underline">{field.value}</a>
                          ) : field.icon === "website" ? (
                            <a
                              href={field.value.startsWith("http") ? field.value : `https://${field.value}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-biro-blue hover:underline inline-flex items-center gap-1 break-all"
                            >
                              {field.value.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            field.value
                          )
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
