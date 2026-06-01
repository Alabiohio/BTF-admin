"use client";
// Note: Requires 'xlsx' library to be installed
// npm install xlsx

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

export async function exportRegistrationsToExcel<T extends RegistrationRecord>(
  records: T[],
  title: string,
  fieldLabels: string[]
): Promise<void> {
  try {
    // Dynamically import xlsx to avoid issues if not installed
    const XLSX = await import('xlsx');
    
    // Create worksheet data
    const wsData: any[][] = [["Registrant", ...fieldLabels]];
    
    // Add rows
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

    wsData.push(...rows);

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}-registrations.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    // Fallback to CSV if Excel export fails
    // Import CSV export function dynamically to avoid circular dependencies
    const { exportRegistrationsToCSV } = await import('./export-csv');
    await exportRegistrationsToCSV(records, title, fieldLabels);
  }
}
