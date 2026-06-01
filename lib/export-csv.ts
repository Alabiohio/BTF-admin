"use client";

interface RegistrationRecord {
  id: number;
  created_at: Date;
  name?: string;
  email?: string;
  phone?: string;
  topic?: string;
  company?: string;
  company_name?: string;
  contact_person?: string;
  website?: string | null;
  description?: string | null;
  interests?: string | null;
  skills?: string | null;
  availability?: string | null;
  application_type?: string;
  sponsorship_tier?: string | null;
}

export async function exportRegistrationsToCSV<T extends RegistrationRecord>(
  records: T[],
  title: string,
  fieldLabels: string[]
): Promise<void> {
  // Create CSV header
  const header = ["Registrant", ...fieldLabels];
  
  // Create CSV rows
  const rows = [...records]
    .sort((a, b) => a.id - b.id)
    .map((record) => {
      const rowData: (string | number)[] = [`#${record.id}`];
      const fieldMappings: Record<string, string | undefined> = {
        "Date": new Date(record.created_at).toLocaleDateString(),
        "Name": record.name,
        "Email": record.email,
        "Phone": record.phone,
        "Topic": record.topic,
        "Company": record.company || record.company_name,
        "Contact Name": record.name,
        "Contact Person": record.contact_person,
        "Website": record.website || undefined,
        "Description": record.description || undefined,
        "Interests": record.interests || undefined,
        "Skills": record.skills || undefined,
        "Availability": record.availability || undefined,
        "Application Type": record.application_type || undefined,
        "Sponsorship Tier": record.sponsorship_tier || undefined,
      };

      fieldLabels.forEach((label) => {
        rowData.push(fieldMappings[label] || "-");
      });

      return rowData;
    });

  // Combine header and rows
  const csvData = [header, ...rows];

  // Convert to CSV string
  const csvString = csvData
    .map(row => 
      row.map(field => {
        const fieldStr = String(field);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return `"${fieldStr.replace(/"/g, '""')}"`;
        }
        return fieldStr;
      })
      .join(',')
    )
    .join('\n');

  // Create Blob and download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-registrations.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
