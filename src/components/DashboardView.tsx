'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { 
    Users, 
    Smile, 
    CalendarRange, 
    AlertTriangle, 
    TrendingUp, 
    BookOpen, 
    ClipboardCheck, 
    History,
    GraduationCap,
    Clock,
    FolderCheck,
    Award,
    Zap,
    Send,
    FileSpreadsheet,
    Activity,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function DashboardView() {
    const { currentSchool, currentUser, setActivePage } = useApp();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!currentUser || !currentSchool) return null;

    // ----------------------------------------------------
    // ROLE: GURU PIKET
    // ----------------------------------------------------
    if (currentUser.role === 'guru_piket') {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayLabel = new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const dateData = currentSchool.absensi?.[todayStr] || {};

        const piketGoToAbsen = (classId: string) => {
            sessionStorage.setItem('absensi_pref_class', classId);
            sessionStorage.setItem('absensi_pref_date', todayStr);
            setActivePage('absensi');
        };

        return (
            <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-[#0b2f4d] to-slate-900 rounded-2xl border border-cyan-500/30 p-6 shadow-lg text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-2 border border-cyan-500/30">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                                <span>Modul Guru Piket Sekolah</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Dashboard Guru Piket</h3>
                            <p className="text-xs text-slate-300 mt-1">Monitoring &amp; verifikasi status pengisian presensi harian seluruh kelas.</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md self-start">
                            <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                            <span>{todayLabel}</span>
                        </span>
                    </div>
                </div>

                {/* Status Pengisian Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4 text-cyan-600" />
                            <span>Status Pengisian Presensi Harian Kelas</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Real-Time Data</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Nama Kelas</th>
                                    <th className="py-3 px-4">Total Siswa</th>
                                    <th className="py-3 px-4">Status Pengisian</th>
                                    <th className="py-3 px-4 text-center">Hadir (H)</th>
                                    <th className="py-3 px-4 text-center">Sakit (S)</th>
                                    <th className="py-3 px-4 text-center">Izin (I)</th>
                                    <th className="py-3 px-4 text-center">Alfa (A)</th>
                                    <th className="py-3 px-4 text-center w-36">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                                {currentSchool.classes.map((kelas, index) => {
                                    const classStudents = currentSchool.students.filter(s => s.classId === kelas.id);
                                    const totalSiswa = classStudents.length;

                                    let H = 0, S = 0, I = 0, A = 0, markedCount = 0;
                                    classStudents.forEach(s => {
                                        const status = dateData[s.id];
                                        if (status) {
                                            markedCount++;
                                            if (status === 'H') H++;
                                            if (status === 'S') S++;
                                            if (status === 'I') I++;
                                            if (status === 'A') A++;
                                        }
                                    });

                                    const isFilled = totalSiswa > 0 && markedCount === totalSiswa;
                                    const isPartial = markedCount > 0 && markedCount < totalSiswa;

                                    return (
                                        <tr key={kelas.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                                            <td className="py-3 px-4 font-bold text-slate-800">{kelas.name}</td>
                                            <td className="py-3 px-4 text-slate-500">{totalSiswa} Siswa</td>
                                            <td className="py-3 px-4">
                                                {isFilled ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                        Selesai ({markedCount}/{totalSiswa})
                                                    </span>
                                                ) : isPartial ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                                                        <Clock className="h-3 w-3 text-amber-600" />
                                                        Sebagian ({markedCount}/{totalSiswa})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                                                        Belum Diisi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-emerald-600">{H}</td>
                                            <td className="py-3 px-4 text-center font-bold text-amber-600">{S}</td>
                                            <td className="py-3 px-4 text-center font-bold text-cyan-600">{I}</td>
                                            <td className="py-3 px-4 text-center font-bold text-rose-600">{A}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => piketGoToAbsen(kelas.id)}
                                                    className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] px-2.5 py-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                                                >
                                                    <ClipboardCheck className="h-3 w-3" />
                                                    {isFilled ? 'Edit Presensi' : 'Isi Presensi'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------
    // ROLE: GURU MAPEL
    // ----------------------------------------------------
    if (currentUser.role === 'guru_mapel') {
        const userAny = currentUser as any;
        const assignedClasses = currentSchool.classes.filter(c => 
            Array.isArray(userAny.assignedClassIds) && userAny.assignedClassIds.includes(c.id)
        );

        const myAgendas = currentSchool.agendaMapel?.filter(a => (a as any).teacherId === currentUser.id || a.username === currentUser.username) || [];
        const mapelName = userAny.subjectName || 'Mata Pelajaran';

        const mapelGoToPage = (page: string, classId: string) => {
            sessionStorage.setItem('mapel_pref_class', classId);
            setActivePage(page);
        };

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-900 via-[#0b2f4d] to-slate-900 rounded-2xl border border-indigo-500/30 p-6 shadow-lg text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2 border border-indigo-500/30">
                                <GraduationCap className="h-3.5 w-3.5 text-indigo-300" />
                                <span>Pengajar: {mapelName}</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Dashboard Guru Mata Pelajaran</h3>
                            <p className="text-xs text-slate-300 mt-1">Kelola presensi jam mapel, jurnal mengajar agenda kelas, dan nilai siswa.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Classes Grid */}
                    <div className="lg:col-span-7 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-cyan-600" />
                            <span>Daftar Kelas Ampuan Anda</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {assignedClasses.map(kelas => {
                                const classStudents = currentSchool.students.filter(s => s.classId === kelas.id);
                                return (
                                    <div key={kelas.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="text-base font-bold text-slate-800">Kelas {kelas.name}</h5>
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                    Mapel
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <GraduationCap className="h-3.5 w-3.5 text-cyan-600" />
                                                <span>{mapelName}</span>
                                            </p>
                                            <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 mt-3">
                                                {classStudents.length} Siswa
                                            </span>
                                        </div>
                                        <div className="mt-4 flex flex-col gap-1.5">
                                            <button
                                                onClick={() => mapelGoToPage('mapel-absensi', kelas.id)}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] py-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                                            >
                                                <ClipboardCheck className="h-3.5 w-3.5" />
                                                Absen Mapel
                                            </button>
                                            <button
                                                onClick={() => mapelGoToPage('mapel-nilai', kelas.id)}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                                            >
                                                <Award className="h-3.5 w-3.5" />
                                                Input Nilai
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Agenda History Column */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-3">
                                <History className="h-4 w-4 text-cyan-600" />
                                <span>Agenda Mengajar Terakhir</span>
                            </h4>
                        </div>

                        <div className="flex-1 divide-y divide-slate-100">
                            {myAgendas.slice(0, 4).map(agenda => {
                                const kelas = currentSchool.classes.find(c => c.id === agenda.classId);
                                return (
                                    <div key={agenda.id} className="py-2.5 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <strong className="text-slate-800 text-xs font-bold">Kelas {kelas ? kelas.name : ''}</strong>
                                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {agenda.date}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 truncate">
                                            <span className="font-semibold text-slate-400">Materi:</span> {agenda.materi}
                                        </p>
                                    </div>
                                );
                            })}

                            {myAgendas.length === 0 && (
                                <div className="text-center text-slate-400 py-12 text-xs flex flex-col items-center justify-center h-full">
                                    <BookOpen className="h-8 w-8 text-slate-300 mb-2" />
                                    <span>Belum ada agenda mengajar dicatat.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------
    // ROLE: GENERAL (ADMIN, BK, WALI KELAS, SUPER ADMIN)
    // ----------------------------------------------------
    let studentsToCalculate = currentSchool.students;
    let violationsToCalculate = currentSchool.violations || [];

    if (currentUser.role === 'walas') {
        studentsToCalculate = currentSchool.students.filter(s => s.classId === currentUser.classId);
        violationsToCalculate = (currentSchool.violations || []).filter(v => studentsToCalculate.some(s => s.id === v.studentId));
    }

    let totalHadir = 0, totalSakit = 0, totalIzin = 0, totalAlfa = 0, totalHariData = 0;

    Object.entries(currentSchool.absensi).forEach(([, dayData]) => {
        studentsToCalculate.forEach(student => {
            const status = dayData[student.id];
            if (status === 'H') totalHadir++;
            if (status === 'S') totalSakit++;
            if (status === 'I') totalIzin++;
            if (status === 'A') totalAlfa++;
            if (status) totalHariData++;
        });
    });

    const avgHadir = totalHariData > 0 ? Math.round((totalHadir / totalHariData) * 100) : 100;
    const avgSakit = totalHariData > 0 ? Math.round((totalSakit / totalHariData) * 100) : 0;
    const avgIzin = totalHariData > 0 ? Math.round((totalIzin / totalHariData) * 100) : 0;
    const avgAlfa = totalHariData > 0 ? Math.round((totalAlfa / totalHariData) * 100) : 0;

    const totalPenalti = violationsToCalculate.reduce((sum, r) => sum + r.points, 0);

    const chartData = [
        { name: 'Hadir', value: avgHadir, color: '#10b981' },
        { name: 'Sakit', value: avgSakit, color: '#f59e0b' },
        { name: 'Izin', value: avgIzin, color: '#06b6d4' },
        { name: 'Alfa', value: avgAlfa, color: '#ef4444' },
    ].filter(item => item.value > 0);

    const displayChartData = chartData.length > 0 ? chartData : [{ name: 'Hadir', value: 100, color: '#10b981' }];

    const studentTotals = violationsToCalculate.reduce((acc: { [key: string]: number }, r) => {
        acc[r.studentId] = (acc[r.studentId] || 0) + r.points;
        return acc;
    }, {});

    const sortedSiswa = Object.entries(studentTotals)
        .map(([id, pts]) => ({
            id,
            points: pts,
            name: studentsToCalculate.find(s => s.id === id)?.name || 'Siswa'
        }))
        .sort((a, b) => b.points - a.points);

    // High Impact Metric Cards Configuration
    const cards = [
        { title: 'Total Siswa', value: studentsToCalculate.length, icon: Users, gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-200 text-cyan-700', trend: '+100% Aktif' },
        { title: 'Hadir (H)', value: `${avgHadir}%`, icon: Smile, gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700', trend: 'Presensi Baik' },
        { title: 'Sakit (S)', value: `${avgSakit}%`, icon: CalendarRange, gradient: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700', trend: 'Tercatat' },
        { title: 'Izin (I)', value: `${avgIzin}%`, icon: CalendarRange, gradient: 'from-cyan-500/10 to-sky-500/10 border-cyan-200 text-cyan-700', trend: 'Terverifikasi' },
        { title: 'Alfa (A)', value: `${avgAlfa}%`, icon: AlertTriangle, gradient: 'from-rose-500/10 to-red-500/10 border-rose-200 text-rose-700', trend: 'Perlu Perhatian' },
        { title: 'Total Poin BK', value: `${totalPenalti} Pts`, icon: TrendingUp, gradient: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-700', trend: 'Rekap Poin' },
    ];

    let headerTitle = 'Dashboard Ringkasan Utama';
    if (currentUser.role === 'walas') {
        const kelas = currentSchool.classes.find(c => c.id === currentUser.classId);
        headerTitle = `Dashboard Wali Kelas ${kelas ? kelas.name : ''}`;
    } else if (currentUser.role === 'guru_bk') {
        headerTitle = 'Dashboard Bimbingan Konseling (BK)';
    }

    return (
        <div className="space-y-6">
            
            {/* Top Modern Header Banner with Floating Action Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0b2f4d] to-slate-900 rounded-2xl border border-cyan-500/30 p-6 shadow-xl text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-2 border border-cyan-500/30">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                            <span>Portal Smart Campus Terpadu</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight">{headerTitle}</h3>
                        <p className="text-xs text-slate-300 mt-1">Pemantauan real-time statistik kehadiran, poin kedisiplinan BK, dan laporan otomatis.</p>
                    </div>

                    {/* Quick Action Floating Bar Widget */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                        {['admin', 'guru_bk', 'guru_piket', 'walas', 'superadmin'].includes(currentUser.role) && (
                            <button
                                onClick={() => setActivePage('absensi')}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                <span>Presensi Harian</span>
                            </button>
                        )}

                        {['admin', 'guru_bk', 'superadmin'].includes(currentUser.role) && (
                            <button
                                onClick={() => setActivePage('pelanggaran')}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Catat BK</span>
                            </button>
                        )}

                        {['admin', 'guru_bk', 'walas', 'guru_mapel', 'superadmin'].includes(currentUser.role) && (
                            <button
                                onClick={() => setActivePage('laporan')}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                <span>Ekspor Excel</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* High-Impact Metric Cards Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            className={`bg-gradient-to-br ${card.gradient} bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                                <div className="h-7 w-7 rounded-lg bg-white/80 p-1.5 shadow-sm border border-slate-100 flex items-center justify-center">
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5 block">{card.trend}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Attendance Analytics & Violations section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recharts Analytics Column */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-cyan-600" />
                        <span>Analisis Kehadiran Siswa</span>
                    </h4>

                    {isMounted ? (
                        <div className="h-48 w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={displayChartData}
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {displayChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Persentase']}
                                        contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Inner absolute statistics text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-8px]">
                                <span className="text-xl font-black text-slate-800">{avgHadir}%</span>
                                <span className="text-[10px] font-bold text-emerald-600">Kehadiran</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <span className="text-xs text-slate-400 font-semibold">Memuat grafik...</span>
                        </div>
                    )}

                    {/* Chart Legend */}
                    <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-slate-100 mt-2">
                        <div className="text-[9px] font-bold text-slate-600">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#10b981] mr-1"></span>
                            Hadir ({avgHadir}%)
                        </div>
                        <div className="text-[9px] font-bold text-slate-600">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b] mr-1"></span>
                            Sakit ({avgSakit}%)
                        </div>
                        <div className="text-[9px] font-bold text-slate-600">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#06b6d4] mr-1"></span>
                            Izin ({avgIzin}%)
                        </div>
                        <div className="text-[9px] font-bold text-slate-600">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#ef4444] mr-1"></span>
                            Alfa ({avgAlfa}%)
                        </div>
                    </div>
                </div>

                {/* Top Violators Column */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span>Siswa dengan Poin Pelanggaran BK Tertinggi</span>
                    </h4>

                    <div className="flex-1 space-y-4">
                        {sortedSiswa.slice(0, 4).map((siswa, idx) => (
                            <div key={siswa.id} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-800">{idx + 1}. {siswa.name}</span>
                                    <span className="inline-flex rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-black text-rose-600">
                                        {siswa.points} Poin
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(siswa.points * 2, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}

                        {sortedSiswa.length === 0 && (
                            <div className="text-center text-slate-400 py-12 text-xs flex flex-col items-center justify-center h-full">
                                <Smile className="h-8 w-8 text-emerald-500 mb-2" />
                                <span className="font-semibold">Belum ada catatan poin kedisiplinan BK.</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Live Activity Stream Feed Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                        <span>Feed Aktivitas Real-Time Sistem</span>
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        • Live Connected
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                            <Send className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-[11px]">Notifikasi WA Gateway</div>
                            <div className="text-[10px] text-slate-400">Pesan rekap harian terkirim ke ortua</div>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-600 flex items-center justify-center shrink-0">
                            <ClipboardCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-[11px]">Status Presensi Kelas</div>
                            <div className="text-[10px] text-slate-400">96.4% Kehadiran tercatat hari ini</div>
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-[11px]">Monitoring BK Terpadu</div>
                            <div className="text-[10px] text-slate-400">Poin kedisiplinan otomatis terhitung</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
