'use client';

import React from 'react';
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
    Eye
} from 'lucide-react';

export default function SuperAdminView() {
    const { appData, updateAppData, showToast, showConfirm, switchSchool, setActivePage } = useApp();

    if (!appData) return null;

    const schools = appData.schools;
    const pendingCount = schools.filter(s => s.status === 'menunggu').length;
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
            color: 'bg-cyan-50 text-cyan-700 border-cyan-100',
            description: `Sekolah terdaftar. Status: ${s.status}`
        });

        if (s.absensi) {
            Object.keys(s.absensi).forEach(date => {
                events.push({
                    timestamp: new Date(date).getTime() || Date.now(),
                    timeLabel: date,
                    school: s.name,
                    category: 'Presensi',
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
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
                    color: 'bg-rose-50 text-rose-700 border-rose-100',
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

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Sekolah', value: schools.length, icon: ShieldCheck, color: 'bg-cyan-50 text-cyan-700' },
                    { title: 'Total Siswa', value: totalSiswa, icon: Users, color: 'bg-emerald-50 text-emerald-700' },
                    { title: 'Log Notifikasi', value: totalLogs, icon: Bell, color: 'bg-amber-50 text-amber-700' },
                    { title: 'Sisa Kuota API', value: `${sisaKuota.toLocaleString('id-ID')} Msg`, icon: Gauge, color: 'bg-violet-50 text-violet-700' }
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all">
                            <div>
                                <span className="text-[10px] font-semibold text-slate-400">{card.title}</span>
                                <h3 className="text-sm font-bold text-slate-800 mt-1">{card.value}</h3>
                            </div>
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${card.color}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Kuota bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600">Kuota API Gateway</span>
                    <span className="text-[10px] font-semibold text-slate-400">{totalLogs} / 10.000 Pesan Terkirim</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${progressPct > 80 ? 'bg-rose-500' : progressPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Schools Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-600">Daftar Sekolah Terdaftar</h4>
                    {pendingCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                            {pendingCount} Menunggu Persetujuan
                        </span>
                    )}
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
                                <th className="py-3 px-4 text-center w-48">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {schools.map((school, index) => {
                                let badge: React.ReactNode;
                                let actions: React.ReactNode;

                                if (school.status === 'aktif') {
                                    badge = <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600"><CheckCircle2 className="h-3 w-3" />Aktif</span>;
                                    actions = (
                                        <div className="flex gap-1 justify-center">
                                            <button onClick={() => handleAccessSchool(school.id)} className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] py-1 px-2.5 shadow-sm transition-all cursor-pointer">
                                                <Eye className="h-3.5 w-3.5" />Akses
                                            </button>
                                            <button onClick={() => handleDeactivate(school.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold text-[10px] py-1 px-2.5 transition-all cursor-pointer">
                                                <Ban className="h-3 w-3" />Nonaktifkan
                                            </button>
                                        </div>
                                    );
                                } else if (school.status === 'menunggu') {
                                    badge = <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-600">Menunggu</span>;
                                    actions = (
                                        <div className="flex gap-1 justify-center">
                                            <button onClick={() => handleApprove(school.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1 px-2.5 shadow-sm transition-all">
                                                <CheckCircle2 className="h-3 w-3" />Setuju
                                            </button>
                                            <button onClick={() => handleReject(school.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] py-1 px-2.5 shadow-sm transition-all">
                                                <XCircle className="h-3 w-3" />Tolak
                                            </button>
                                        </div>
                                    );
                                } else {
                                    badge = <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600"><XCircle className="h-3 w-3" />Nonaktif</span>;
                                    actions = (
                                        <div className="flex gap-1 justify-center">
                                            <button onClick={() => handleActivate(school.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 font-bold text-[10px] py-1 px-2 transition-all">
                                                <Power className="h-3 w-3" />Aktifkan
                                            </button>
                                            <button onClick={() => handleDelete(school.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold text-[10px] py-1 px-2 transition-all">
                                                <Trash className="h-3 w-3" />Hapus
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 shrink-0 rounded-lg bg-slate-50 border border-slate-100 p-0.5 flex items-center justify-center overflow-hidden">
                                                    <img src={school.logo} alt="" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo_terpusat.png'; }} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{school.name}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold">KODE: {school.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{school.npsn || '—'}</td>
                                        <td className="py-3 px-4 text-slate-500 text-[10px]">{school.contactAdmin || '—'}</td>
                                        <td className="py-3 px-4 text-center">{badge}</td>
                                        <td className="py-2 px-4 text-center">{actions}</td>
                                    </tr>
                                );
                            })}
                            {schools.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-slate-400 py-8">Belum ada sekolah terdaftar di sistem.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-cyan-600" />
                        <span>Log Aktivitas Global (10 Terbaru)</span>
                    </h4>
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
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {displayEvents.map((ev, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-4 text-slate-400 text-[10px] whitespace-nowrap font-medium">{ev.timeLabel}</td>
                                    <td className="py-3 px-4 font-bold text-slate-800">{ev.school}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${ev.color}`}>{ev.category}</span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-500">{ev.description}</td>
                                </tr>
                            ))}
                            {displayEvents.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-slate-400 py-8">Belum ada log aktivitas global.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
