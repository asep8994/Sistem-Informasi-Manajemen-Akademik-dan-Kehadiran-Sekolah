'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Clock, Menu, Calendar, BookOpen, AlertCircle, Users, Settings } from 'lucide-react';

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const { currentSchool, currentUser, activePage, switchSchool, setActivePage } = useApp();
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
            setTimeStr(`${date}, ${time} WIB`);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!currentUser) return null;

    const schoolName = currentSchool ? currentSchool.name : 'Sistem Terpusat';
    const schoolYear = currentSchool ? `TA: ${currentSchool.tahunAjaran} (${currentSchool.semester})` : '';

    // Map page IDs to human-readable titles
    const getPageTitle = (page: string) => {
        switch (page) {
            case 'dashboard':
                if (currentUser.role === 'guru_piket') return 'Dashboard Guru Piket';
                if (currentUser.role === 'guru_mapel') return 'Dashboard Guru Mapel';
                if (currentUser.role === 'walas') return 'Dashboard Wali Kelas';
                if (currentUser.role === 'guru_bk') return 'Dashboard Guru BK';
                return 'Dashboard Utama';
            case 'absensi':
                return 'Pengisian Absensi Harian';
            case 'pelanggaran':
                return 'Pencatatan Pelanggaran Siswa';
            case 'laporan':
                return 'Rekapitulasi Laporan';
            case 'notifikasi-ortua':
                return 'Notifikasi Rekap Orang Tua';
            case 'admin-siswa':
                return 'Manajemen Kelas & Siswa';
            case 'admin-pelanggaran':
                return 'Referensi Jenis Pelanggaran';
            case 'admin-staf':
                return 'Kelola Akun Guru & Staf';
            case 'admin-notifikasi':
                return 'Konfigurasi & Pengaturan Sekolah';
            case 'mapel-absensi':
                return 'Presensi Mata Pelajaran';
            case 'mapel-agenda':
                return 'Agenda Mengajar Guru';
            case 'mapel-nilai':
                return 'Evaluasi Nilai Siswa';
            case 'superadmin':
                return 'Panel Super Admin';
            default:
                return 'SIMAK PRO';
        }
    };

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 print:hidden">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">
                        {getPageTitle(activePage)}
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium hidden sm:block">
                        {schoolName} &bull; SIMAK PRO (Sistem Informasi Manajemen Akademik &amp; Kehadiran Terpadu)
                    </p>
                </div>
            </div>

            {/* Time / Period Display */}
            <div className="flex items-center gap-2">
                {currentUser.role === 'superadmin' && currentSchool && (
                    <button
                        onClick={() => {
                            switchSchool(null);
                            setActivePage('superadmin');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-3 py-1.5 transition-all shadow-md cursor-pointer mr-2 border border-rose-500/20 active:scale-[0.98]"
                    >
                        Keluar Akses Sekolah
                    </button>
                )}

                {schoolYear && (
                    <span className="hidden md:inline-flex items-center rounded-lg bg-cyan-50 border border-cyan-100 px-2 py-1 text-[10px] font-semibold text-cyan-800 shadow-sm">
                        {schoolYear}
                    </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-cyan-600" />
                    <span>{timeStr || 'Memuat...'}</span>
                </span>
            </div>
        </header>
    );
}
