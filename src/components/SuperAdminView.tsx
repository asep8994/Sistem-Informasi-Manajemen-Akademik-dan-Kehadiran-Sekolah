'use client';

import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { 
    ShieldCheck, 
    Users, 
    Bell, 
    Gauge, 
    CheckCircle2, 
    XCircle, 
    Ban, 
    Trash, 
    Power,
    Activity,
    Eye,
    Search,
    Building2,
    Server,
    Radio,
    Clock
} from 'lucide-react';

export default function SuperAdminView() {
    const { appData, updateAppData, showToast, showConfirm, switchSchool, setActivePage } = useApp();
    const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'menunggu' | 'nonaktif'>('semua');
    const [searchQuery, setSearchQuery] = useState('');

    if (!appData) return null;

    const schools = appData.schools;
    const pendingSchools = schools.filter(s => s.status === 'menunggu');
    const pendingCount = pendingSchools.length;
    const activeCount = schools.filter(s => s.status === 'aktif').length;
    const totalSiswa = schools.reduce((sum, s) => sum + (s.students?.length || 0), 0);
    const totalLogs = schools.reduce((sum, s) => sum + (s.notificationLogs?.length || 0), 0);
    const sisaKuota = Math.max(10000 - totalLogs, 0);
    const progressPct = Math.min((totalLogs / 10000) * 100, 100);

    // Global activity events
    const events: { timestamp: number; timeLabel: string; school: string; category: string; color: string; description: string }[] = [];

    schools.forEach(s => {
        let ts = Date.now();
        if (s.id.startsWith('s') && s.id.length > 2) {
            ts = parseInt(s.id.substring(1));
        } else if (s.id === 's1') {
            ts = Date.now() - 3600000 * 24 * 5;
        }
        events.push({
            timestamp: ts,
            timeLabel: new Date(ts).toLocaleString('id-ID'),
            school: s.name,
            category: 'Registrasi',
            color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            description: `Sekolah terdaftar. Status: ${s.status}`
        });

        if (s.absensi) {
            Object.keys(s.absensi).forEach(date => {
                events.push({
                    timestamp: new Date(date).getTime() || Date.now(),
                    timeLabel: date,
                    school: s.name,
                    category: 'Presensi',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    description: 'Pengisian daftar presensi harian kelas.'
                });
            });
        }

        if (s.violations) {
            s.violations.forEach(v => {
                events.push({
                    timestamp: new Date(v.date).getTime() || Date.now(),
                    timeLabel: v.date,
                    school: s.name,
                    category: 'Pelanggaran',
                    color: 'bg-rose-50 text-rose-700 border-rose-200',
                    description: `Sanksi: ${v.type} (${v.points} Poin)`
                });
            });
        }
    });

    events.sort((a, b) => b.timestamp - a.timestamp);
    const displayEvents = events.slice(0, 10);

    const handleApprove = (schoolId: string) => {
        const updated = appData.schools.map(s => s.id === schoolId ? { ...s, status: 'aktif' as const } : s);
        updateAppData({ ...appData, schools: updated });
        showToast('Sekolah disetujui untuk masuk sistem!', 'success');
    };

    const handleReject = (schoolId: string) => {
        showConfirm('Tolak Pendaftaran', 'Apakah Anda yakin ingin menolak dan menghapus pendaftaran sekolah ini?', () => {
            const updated = appData.schools.filter(s => s.id !== schoolId);
            updateAppData({ ...appData, schools: updated });
            showToast('Pendaftaran sekolah telah ditolak.', 'info');
        });
    };

    const handleDeactivate = (schoolId: string) => {
        const updated = appData.schools.map(s => s.id === schoolId ? { ...s, status: 'nonaktif' as const } : s);
        updateAppData({ ...appData, schools: updated });
        showToast('Sekolah berhasil dinonaktifkan.', 'warning');
    };

    const handleActivate = (schoolId: string) => {
        const updated = appData.schools.map(s => s.id === schoolId ? { ...s, status: 'aktif' as const } : s);
        updateAppData({ ...appData, schools: updated });
        showToast('Sekolah berhasil diaktifkan kembali.', 'success');
    };

    const handleDelete = (schoolId: string) => {
        showConfirm('Hapus Sekolah Permanen', 'Apakah Anda yakin ingin menghapus data sekolah ini beserta seluruh data transaksi secara permanen?', () => {
            const updated = appData.schools.filter(s => s.id !== schoolId);
            updateAppData({ ...appData, schools: updated });
            showToast('Sekolah telah dihapus permanen dari sistem.', 'info');
        });
    };

    const handleAccessSchool = (schoolId: string) => {
        switchSchool(schoolId);
        setActivePage('dashboard');
        showToast('Berhasil mengakses dashboard sekolah', 'success');
    };

    // Filtered schools logic
    const filteredSchools = schools.filter(s => {
        const matchesStatus = filterStatus === 'semua' || s.status === filterStatus;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (s.npsn && s.npsn.includes(searchQuery));
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            
            {/* Super Admin Executive Command Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-[#032338] to-slate-900 rounded-2xl border border-cyan-500/40 p-6 shadow-2xl text-white relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                            <ShieldCheck className="h-4 w-4 text-cyan-400 animate-pulse" />
                            <span>Central Control Panel &bull; Super Admin Level</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Pusat Kendali Pengelolaan Terpusat
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                            Kelola pendaftaran sekolah terdaftar, pantau kuota API gateway, aktivasi akun tenant, serta log aktivitas sistem secara real-time.
                        </p>
                    </div>

                    {/* Server Health Status Badge */}
                    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3 backdrop-blur-md shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <Radio className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="text-xs">
                            <div className="font-bold text-white flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                                <span>System Operational</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">DB Cloud &bull; 99.99% Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* High-Impact Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Sekolah', value: `${schools.length} Sekolah`, sub: `${activeCount} Aktif · ${pendingCount} Menunggu`, icon: Building2, gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-200 text-cyan-700' },
                    { title: 'Total Siswa Terpusat', value: `${totalSiswa.toLocaleString('id-ID')} Siswa`, sub: 'Akumulasi Seluruh Sekolah', icon: Users, gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700' },
                    { title: 'Log Transaksi WA', value: `${totalLogs.toLocaleString('id-ID')} Log`, sub: 'Total Notifikasi Terkirim', icon: Bell, gradient: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700' },
                    { title: 'Sisa Kuota API Gateway', value: `${sisaKuota.toLocaleString('id-ID')} Pesan`, sub: `Tergunakan: ${progressPct.toFixed(1)}%`, icon: Gauge, gradient: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-700' }
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className={`bg-gradient-to-br ${card.gradient} bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                                <div className="h-7 w-7 rounded-lg bg-white/80 p-1.5 shadow-sm border border-slate-100 flex items-center justify-center">
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5 block">{card.sub}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* API Gateway Progress Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Server className="h-4 w-4 text-cyan-600" />
                        <span>Kapasitas API Gateway Notifikasi WA/Email Global</span>
                    </span>
                    <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px]">
                        {totalLogs.toLocaleString('id-ID')} / 10.000 Pesan ({progressPct.toFixed(1)}%)
                    </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${
                            progressPct > 80 ? 'bg-gradient-to-r from-amber-500 to-rose-600' : progressPct > 50 ? 'bg-gradient-to-r from-cyan-500 to-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Pending Requests Section (If Any) */}
            {pendingSchools.length > 0 && (
                <div className="bg-amber-50/80 rounded-2xl border border-amber-300 p-5 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                            <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                            <span>Pendaftaran Sekolah Menunggu Persetujuan ({pendingSchools.length})</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full border border-amber-300">
                            Action Required
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pendingSchools.map(sch => (
                            <div key={sch.id} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 border p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                            <img src={sch.logo} alt="" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo_terpusat.png'; }} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-xs text-slate-800 truncate">{sch.name}</h5>
                                            <span className="text-[9px] font-mono text-slate-400">Kode: {sch.code} &bull; NPSN: {sch.npsn || '-'}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Kontak: {sch.contactAdmin || '-'}</p>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => handleApprove(sch.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Setujui
                                    </button>
                                    <button
                                        onClick={() => handleReject(sch.id)}
                                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] py-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                    >
                                        <XCircle className="h-3 w-3" />
                                        Tolak
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Schools Management Table with Filter & Search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-cyan-600" />
                            <span>Daftar Sekolah Terdaftar ({filteredSchools.length})</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kelola status aktif/nonaktif dan akses portal sekolah.</p>
                    </div>

                    {/* Filter Tabs & Search Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nama / NPSN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-cyan-500 w-44"
                            />
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="flex items-center bg-slate-200/60 p-0.5 rounded-xl text-[10px] font-bold">
                            {(['semua', 'aktif', 'menunggu', 'nonaktif'] as const).map(st => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                                        filterStatus === st 
                                            ? 'bg-white text-slate-800 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {st === 'semua' ? 'Semua' : st}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Sekolah</th>
                                <th className="py-3 px-4">NPSN</th>
                                <th className="py-3 px-4">Kontak Admin</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center w-52">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            {filteredSchools.map((school, index) => {
                                let badge: React.ReactNode;
                                let actions: React.ReactNode;

                                if (school.status === 'aktif') {
                                    badge = <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3 text-emerald-600" />Aktif</span>;
                                    actions = (
                                        <div className="flex gap-1.5 justify-center">
                                            <button onClick={() => handleAccessSchool(school.id)} className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] py-1.5 px-3 shadow-sm transition-all cursor-pointer active:scale-95">
                                                <Eye className="h-3.5 w-3.5" />Akses
                                            </button>
                                            <button onClick={() => handleDeactivate(school.id)} className="inline-flex items-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] py-1.5 px-2.5 transition-all cursor-pointer active:scale-95">
                                                <Ban className="h-3 w-3" />Nonaktifkan
                                            </button>
                                        </div>
                                    );
                                } else if (school.status === 'menunggu') {
                                    badge = <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">Menunggu</span>;
                                    actions = (
                                        <div className="flex gap-1.5 justify-center">
                                            <button onClick={() => handleApprove(school.id)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-3 shadow-sm transition-all cursor-pointer active:scale-95">
                                                <CheckCircle2 className="h-3 w-3" />Setuju
                                            </button>
                                            <button onClick={() => handleReject(school.id)} className="inline-flex items-center gap-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] py-1.5 px-3 shadow-sm transition-all cursor-pointer active:scale-95">
                                                <XCircle className="h-3 w-3" />Tolak
                                            </button>
                                        </div>
                                    );
                                } else {
                                    badge = <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700"><XCircle className="h-3 w-3" />Nonaktif</span>;
                                    actions = (
                                        <div className="flex gap-1.5 justify-center">
                                            <button onClick={() => handleActivate(school.id)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px] py-1.5 px-2.5 transition-all cursor-pointer active:scale-95">
                                                <Power className="h-3 w-3" />Aktifkan
                                            </button>
                                            <button onClick={() => handleDelete(school.id)} className="inline-flex items-center gap-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px] py-1.5 px-2.5 transition-all cursor-pointer active:scale-95">
                                                <Trash className="h-3 w-3" />Hapus
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4 text-center text-slate-400 font-bold">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 shrink-0 rounded-xl bg-slate-100 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                                                    <img src={school.logo} alt="" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo_terpusat.png'; }} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{school.name}</div>
                                                    <div className="text-[9px] text-slate-400 font-mono font-bold">KODE: {school.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 font-semibold">{school.npsn || '—'}</td>
                                        <td className="py-3 px-4 text-slate-600 text-[11px] font-semibold">{school.contactAdmin || '—'}</td>
                                        <td className="py-3 px-4 text-center">{badge}</td>
                                        <td className="py-2.5 px-4 text-center">{actions}</td>
                                    </tr>
                                );
                            })}
                            {filteredSchools.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-slate-400 py-10 text-xs font-semibold">
                                        Tidak ada sekolah yang cocok dengan filter / pencarian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Real-Time Activity Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                        <span>Log Aktivitas Global Terpusat (10 Terbaru)</span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        • System Stream
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4">Sekolah</th>
                                <th className="py-3 px-4">Kategori</th>
                                <th className="py-3 px-4">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                            {displayEvents.map((ev, i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4 text-slate-400 text-[10px] whitespace-nowrap font-mono">{ev.timeLabel}</td>
                                    <td className="py-3 px-4 font-bold text-slate-800">{ev.school}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${ev.color}`}>{ev.category}</span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">{ev.description}</td>
                                </tr>
                            ))}
                            {displayEvents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-slate-400 py-10 text-xs font-semibold">Belum ada log aktivitas global.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
