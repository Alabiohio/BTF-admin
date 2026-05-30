import type { Metadata } from "next";
import { Andika, Righteous, Oswald, Geologica } from "next/font/google";
import "./globals.css";

const andika = Andika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-andika-google",
  display: "swap",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-righteous-google",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald-google",
  display: "swap",
});

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-geologica-google",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Dashboard | Benin Tech Fest",
  description: "Admin dashboard for Benin Tech Fest registrations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${andika.variable} ${righteous.variable} ${oswald.variable} ${geologica.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
