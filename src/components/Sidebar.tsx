'use client';

import React from 'react';
import { useApp } from '../lib/AppContext';
import { 
    LayoutDashboard, 
    CalendarCheck, 
    AlertOctagon, 
    FileSpreadsheet, 
    Users, 
    ShieldAlert, 
    UserCog, 
    Settings, 
    BookOpen, 
    CalendarDays, 
    Award, 
    ShieldAlert as ShieldIcon,
    LogOut,
    User as UserIcon,
    Send
} from 'lucide-react';

export default function Sidebar() {
    const { 
        currentSchool, 
        currentUser, 
        activePage, 
        setActivePage, 
        handleLogout,
        switchSchool
    } = useApp();

    if (!currentUser) return null;

    const schoolName = currentSchool ? currentSchool.name : 'Sistem Terpusat';
    const schoolLogo = currentSchool ? currentSchool.logo : '/logo_terpusat.png';
    const activeYearStr = currentSchool ? `TA: ${currentSchool.tahunAjaran} (${currentSchool.semester})` : '';

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    const isSuperAdmin = currentUser.role === 'superadmin';
    const isPiket = currentUser.role === 'guru_piket';
    const isBK = currentUser.role === 'guru_bk';
    const isWalas = currentUser.role === 'walas';
    const isMapel = currentUser.role === 'guru_mapel';

    // Helper to render navigation link
    const NavLink = ({ 
        page, 
        label, 
        icon: Icon 
    }: { 
        page: string; 
        label: string; 
        icon: React.ComponentType<{ className?: string }> 
    }) => {
        const isActive = activePage === page;
        return (
            <li>
                <button
                    onClick={() => setActivePage(page)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 text-left relative overflow-hidden cursor-pointer ${
                        isActive 
                            ? 'bg-gradient-to-r from-cyan-500/25 via-cyan-400/15 to-white/10 text-white border-l-4 border-cyan-400 shadow-md shadow-cyan-500/10 backdrop-blur-md' 
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-cyan-300 scale-110' : 'text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                    {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
                    )}
                </button>
            </li>
        );
    };

    return (
        <aside className="w-64 bg-gradient-to-b from-[#0b2f4d] to-[#102a43] text-slate-300 flex flex-col min-h-screen border-r border-slate-700/30 shrink-0 print:hidden">
            {/* Header / Branding */}
            <div className="p-4 flex items-center gap-3 border-b border-slate-700/50">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white p-1 flex items-center justify-center shadow-inner overflow-hidden">
                    <img 
                        src={schoolLogo} 
                        alt="Logo Sekolah" 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo_terpusat.png';
                        }}
                    />
                </div>
                <div className="overflow-hidden">
                    <h1 className="text-sm font-bold text-white truncate" title={schoolName}>
                        {schoolName}
                    </h1>
                    {activeYearStr && (
                        <p className="text-[10px] text-amber-400 font-semibold mt-0.5">{activeYearStr}</p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-cyan-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Sistem Aktif</span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1.5">
                    {/* Super Admin Nav */}
                    {isSuperAdmin && (
                        <li>
                            <button
                                onClick={() => {
                                    switchSchool(null);
                                    setActivePage('superadmin');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 text-left cursor-pointer ${
                                    activePage === 'superadmin' 
                                        ? 'bg-white text-[#0b2f4d] shadow-lg scale-[1.02]' 
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <ShieldIcon className={`h-4 w-4 shrink-0 ${activePage === 'superadmin' ? 'text-[#0b2f4d]' : 'text-slate-400'}`} />
                                <span className="truncate">Panel Super Admin</span>
                            </button>
                        </li>
                    )}

                    {/* Standard User Nav / Impersonated School Nav */}
                    {(currentSchool !== null) && (
                        <>
                            {isSuperAdmin && (
                                <div className="pt-3 pb-1 border-t border-slate-700/30 mt-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2">Menu Sekolah</p>
                                </div>
                            )}
                            <NavLink page="dashboard" label="Dashboard Utama" icon={LayoutDashboard} />
                            
                            {/* Attendance entry for general roles */}
                            {['admin', 'guru_bk', 'guru_piket', 'walas', 'superadmin'].includes(currentUser.role) && (
                                <NavLink page="absensi" label="Pengisian Absensi" icon={CalendarCheck} />
                            )}

                            {/* Violations logging for admin & BK */}
                            {['admin', 'guru_bk', 'superadmin'].includes(currentUser.role) && (
                                <NavLink page="pelanggaran" label="Catat Pelanggaran" icon={AlertOctagon} />
                            )}

                            {/* Reports view */}
                            {['admin', 'guru_bk', 'walas', 'guru_mapel', 'superadmin'].includes(currentUser.role) && (
                                <NavLink page="laporan" label="Rekapitulasi Data" icon={FileSpreadsheet} />
                            )}

                            {/* Parent Notification Panel for Admin & Guru BK */}
                            {['admin', 'guru_bk', 'superadmin'].includes(currentUser.role) && (
                                <NavLink page="notifikasi-ortua" label="Notifikasi Orang Tua" icon={Send} />
                            )}

                            {/* Admin-only menus */}
                            {isAdmin && (
                                <>
                                    <div className="pt-3 pb-1">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2">Manajemen Admin</p>
                                    </div>
                                    <NavLink page="admin-siswa" label="Kelas & Siswa" icon={Users} />
                                    <NavLink page="admin-pelanggaran" label="Referensi Sanksi" icon={ShieldAlert} />
                                    <NavLink page="admin-staf" label="Akun Guru & Staf" icon={UserCog} />
                                    <NavLink page="admin-notifikasi" label="Konfigurasi Sekolah" icon={Settings} />
                                </>
                            )}

                            {/* Guru Mapel menus */}
                            {isMapel && (
                                <>
                                    <div className="pt-3 pb-1">
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2">Menu Guru Mapel</p>
                                    </div>
                                    <NavLink page="mapel-absensi" label="Absen Mapel" icon={BookOpen} />
                                    <NavLink page="mapel-agenda" label="Agenda Mengajar" icon={CalendarDays} />
                                    <NavLink page="mapel-nilai" label="Input Nilai Siswa" icon={Award} />
                                </>
                            )}
                        </>
                    )}
                </ul>
            </nav>

            {/* User Profile Info Footer */}
            <div className="p-4 border-t border-slate-700/50 mt-auto">
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="h-8 w-8 rounded-full bg-cyan-800 text-cyan-200 border border-cyan-700/50 shadow-inner flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                        {currentUser.name.slice(0, 2)}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
                            {currentUser.role === 'admin' ? 'Administrator' : 
                             currentUser.role === 'walas' ? 'Wali Kelas' : 
                             currentUser.role === 'guru_bk' ? 'Guru BK' : 
                             currentUser.role === 'guru_piket' ? 'Guru Piket' : 
                             currentUser.role === 'guru_mapel' ? 'Guru Mapel' : 'Super Admin'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="shrink-0 text-slate-400 hover:text-red-400 transition-colors p-1"
                        title="Log Out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
