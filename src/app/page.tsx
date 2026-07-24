'use client';

import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardView from '../components/DashboardView';
import AbsensiView from '../components/AbsensiView';
import PelanggaranView from '../components/PelanggaranView';
import LaporanView from '../components/LaporanView';
import AdminView from '../components/AdminView';
import SuperAdminView from '../components/SuperAdminView';
import MapelAbsensiView from '../components/MapelAbsensiView';
import MapelAgendaView from '../components/MapelAgendaView';
import MapelNilaiView from '../components/MapelNilaiView';
import NotifikasiOrtuaView from '../components/NotifikasiOrtuaView';
import RaporView from '../components/RaporView';
import LeggerView from '../components/LeggerView';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
    const { currentUser, activePage } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Loading or not authenticated yet – AppContext will redirect to /login
    if (!currentUser) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0b2f4d]">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            </div>
        );
    }

    const renderActivePage = () => {
        switch (activePage) {
            case 'dashboard':
                return <DashboardView />;
            case 'absensi':
                return <AbsensiView />;
            case 'pelanggaran':
                return <PelanggaranView />;
            case 'laporan':
                return <LaporanView />;
            case 'rapor':
                return <RaporView />;
            case 'legger':
                return <LeggerView />;
            case 'notifikasi-ortua':
                return <NotifikasiOrtuaView />;
            case 'admin-siswa':
            case 'admin-pelanggaran':
            case 'admin-staf':
            case 'admin-notifikasi':
                return <AdminView />;
            case 'superadmin':
                return <SuperAdminView />;
            case 'mapel-absensi':
                return <MapelAbsensiView />;
            case 'mapel-agenda':
                return <MapelAgendaView />;
            case 'mapel-nilai':
                return <MapelNilaiView />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            {/* Sidebar (desktop: always visible, mobile: overlay) */}
            <div className={`
                fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:z-auto
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar />
            </div>

            {/* Backdrop for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-6 print:p-0">
                    {renderActivePage()}
                </main>
            </div>
        </div>
    );
}
