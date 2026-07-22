import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMAK PRO - Sistem Informasi Manajemen Akademik & Kehadiran Terpadu",
  description: "Platform Manajemen Presensi, Rekapitulasi Notifikasi WA Orang Tua, Pencatatan Poin Pelanggaran BK, dan Evaluasi Nilai Terpadu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
