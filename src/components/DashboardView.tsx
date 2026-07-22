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
    Award
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
            // Store target class/date in sessionStorage to prefill Absensi form
            sessionStorage.setItem('absensi_pref_class', classId);
            sessionStorage.setItem('absensi_pref_date', todayStr);
            setActivePage('absensi');
        };

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Dashboard Guru Piket</h3>
                            <p className="text-xs text-slate-400 mt-1">Monitoring status pengisian presensi harian seluruh kelas.</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 self-start">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span>{todayLabel}</span>
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <ClipboardCheck className="h-4 w-4 text-cyan-600" />
                            <span>Status Pengisian Presensi Harian Kelas</span>
                        </h4>
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
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
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

                                    let statusBadge = null;
                                    if (totalSiswa === 0) {
                                        statusBadge = <span className="inline-flex rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-400">Kosong</span>;
                                    } else if (markedCount === 0) {
                                        statusBadge = <span className="inline-flex rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-600">Belum Absen</span>;
                                    } else if (markedCount < totalSiswa) {
                                        statusBadge = <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Belum Lengkap</span>;
                                    } else {
                                        statusBadge = <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Lengkap</span>;
                                    }

                                    return (
                                        <tr key={kelas.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-slate-400 text-center">{index + 1}</td>
                                            <td className="py-3 px-4 font-bold text-slate-800">{kelas.name}</td>
                                            <td className="py-3 px-4 text-slate-500">{totalSiswa} Siswa</td>
                                            <td className="py-3 px-4">{statusBadge}</td>
                                            <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{H || '—'}</td>
                                            <td className="py-3 px-4 text-center text-amber-500 font-medium">{S || '—'}</td>
                                            <td className="py-3 px-4 text-center text-cyan-600 font-medium">{I || '—'}</td>
                                            <td className="py-3 px-4 text-center text-rose-500 font-semibold">{A || '—'}</td>
                                            <td className="py-2 px-4 text-center">
                                                <button
                                                    onClick={() => piketGoToAbsen(kelas.id)}
                                                    className="w-full flex items-center justify-center gap-1 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] py-1.5 px-3 transition-all active:scale-[0.98] shadow-sm"
                                                >
                                                    <ClipboardCheck className="h-3 w-3" />
                                                    <span>Isi Absen</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {currentSchool.classes.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center text-slate-400 py-6">
                                            Belum ada data kelas terdaftar. Hubungi Admin.
                                        </td>
                                    </tr>
                                )}
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
        const assignedIds = currentUser.classes || [];
        const assignedClasses = currentSchool.classes.filter(c => assignedIds.includes(c.id));
        const mapelName = currentUser.mapelName || 'Mata Pelajaran';

        const allAgendas = currentSchool.agendaMapel || [];
        // Filters agenda logs created by current teacher username
        const myAgendas = allAgendas
            .filter(a => (a as any).username === currentUser.username)
            .sort((a, b) => b.id.localeCompare(a.id));

        const mapelGoToPage = (pageId: string, classId: string) => {
            sessionStorage.setItem('mapel_pref_class', classId);
            setActivePage(pageId);
        };

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800">Dashboard Guru Mata Pelajaran</h3>
                    <p className="text-xs text-slate-400 mt-1">Manajemen agenda mengajar, absensi mapel, dan nilai siswa.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Kelas Ajar Column */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4 text-cyan-600" />
                                <span>Agenda Mengajar &amp; Kelas Anda</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Daftar kelas yang diampu pada Tahun Ajaran dan Semester aktif.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {assignedClasses.map(kelas => {
                                const classStudents = currentSchool.students.filter(s => s.classId === kelas.id);
                                return (
                                    <div key={kelas.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition-all">
                                        <div>
                                            <h5 className="font-bold text-sm text-slate-800">Kelas {kelas.name}</h5>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                <GraduationCap className="h-3.5 w-3.5 text-cyan-600" />
                                                <span>{mapelName}</span>
                                            </p>
                                            <span className="inline-flex rounded-full bg-slate-200/70 border border-slate-300 px-2 py-0.5 text-[9px] font-semibold text-slate-600 mt-3">
                                                {classStudents.length} Siswa
                                            </span>
                                        </div>
                                        <div className="mt-4 flex flex-col gap-1.5">
                                            <button
                                                onClick={() => mapelGoToPage('mapel-absensi', kelas.id)}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] py-1.5 transition-all shadow-sm active:scale-[0.98]"
                                            >
                                                <ClipboardCheck className="h-3 w-3" />
                                                Absen Mapel
                                            </button>
                                            <button
                                                onClick={() => mapelGoToPage('mapel-nilai', kelas.id)}
                                                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 transition-all shadow-sm active:scale-[0.98]"
                                            >
                                                <Award className="h-3 w-3" />
                                                Input Nilai
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {assignedClasses.length === 0 && (
                                <div className="col-span-2 text-center text-slate-400 py-8 text-xs">
                                    Anda belum ditugaskan di kelas manapun. Hubungi Admin.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agenda History Column */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                                <History className="h-4 w-4 text-cyan-600" />
                                <span>Agenda Mengajar Terakhir</span>
                            </h4>
                        </div>

                        <div className="flex-1 divide-y divide-slate-100 mt-3">
                            {myAgendas.slice(0, 4).map(agenda => {
                                const kelas = currentSchool.classes.find(c => c.id === agenda.classId);
                                return (
                                    <div key={agenda.id} className="py-2.5 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <strong className="text-slate-800 text-xs">Kelas {kelas ? kelas.name : ''}</strong>
                                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {agenda.date}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 truncate">
                                            <span className="font-semibold text-slate-400">Materi:</span> {agenda.materi}
                                        </p>
                                        <p className="text-[9px] text-slate-400 truncate">
                                            <span className="font-semibold text-slate-400">Catatan:</span> {agenda.catatan || '—'}
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
    // ROLE: GENERAL (ADMIN, BK, WALI KELAS)
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

    // Recharts Data Configuration
    const chartData = [
        { name: 'Hadir', value: avgHadir, color: '#10b981' },
        { name: 'Sakit', value: avgSakit, color: '#f59e0b' },
        { name: 'Izin', value: avgIzin, color: '#06b6d4' },
        { name: 'Alfa', value: avgAlfa, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Fallback if data is completely empty
    const displayChartData = chartData.length > 0 ? chartData : [{ name: 'Hadir', value: 100, color: '#10b981' }];

    // Violators calculations
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

    // Stats cards configs
    const cards = [
        { title: 'Siswa', value: studentsToCalculate.length, icon: Users, colorClass: 'bg-primary bg-opacity-10 text-[#0b2f4d]' },
        { title: 'Hadir', value: `${avgHadir}%`, icon: Smile, colorClass: 'bg-emerald-50 text-emerald-600' },
        { title: 'Sakit', value: `${avgSakit}%`, icon: CalendarRange, colorClass: 'bg-amber-50 text-amber-500' },
        { title: 'Izin', value: `${avgIzin}%`, icon: CalendarRange, colorClass: 'bg-cyan-50 text-cyan-600' },
        { title: 'Alfa', value: `${avgAlfa}%`, icon: AlertTriangle, colorClass: 'bg-rose-50 text-rose-500' },
        { title: 'Pelanggaran', value: `${totalPenalti} Poin`, icon: TrendingUp, colorClass: 'bg-red-50 text-red-600' },
    ];

    let headerTitle = 'Dashboard Ringkasan';
    if (currentUser.role === 'walas') {
        const kelas = currentSchool.classes.find(c => c.id === currentUser.classId);
        headerTitle = `Dashboard Wali Kelas ${kelas ? kelas.name : ''}`;
    } else if (currentUser.role === 'guru_bk') {
        headerTitle = 'Dashboard Bimbingan Konseling (BK)';
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800">{headerTitle}</h3>
                <p className="text-xs text-slate-400 mt-1">Pemantauan real-time status kehadiran dan kedisiplinan siswa.</p>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div>
                                <span className="text-[10px] font-semibold text-slate-400">{card.title}</span>
                                <h3 className="text-sm font-bold text-slate-800 mt-1">{card.value}</h3>
                            </div>
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${card.colorClass}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Attendance Analytics & Violations section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recharts Analytics Column */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-4">
                        <TrendingUp className="h-4 w-4 text-cyan-600" />
                        <span>Analisis Kehadiran Siswa</span>
                    </h4>

                    {isMounted ? (
                        <div className="h-44 w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={displayChartData}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {displayChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Persentase']}
                                        contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            {/* Inner absolute statistics text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
                                <span className="text-lg font-bold text-slate-800">{avgHadir}%</span>
                                <span className="text-[9px] font-semibold text-slate-400">Hadir</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-44 flex items-center justify-center">
                            <span className="text-xs text-slate-400">Memuat grafik...</span>
                        </div>
                    )}

                    {/* Chart Legend */}
                    <div className="grid grid-cols-4 gap-1 text-center pt-2">
                        <div className="text-[9px] font-semibold text-slate-500">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#10b981] mr-1"></span>
                            Hadir ({avgHadir}%)
                        </div>
                        <div className="text-[9px] font-semibold text-slate-500">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b] mr-1"></span>
                            Sakit ({avgSakit}%)
                        </div>
                        <div className="text-[9px] font-semibold text-slate-500">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#06b6d4] mr-1"></span>
                            Izin ({avgIzin}%)
                        </div>
                        <div className="text-[9px] font-semibold text-slate-500">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#ef4444] mr-1"></span>
                            Alfa ({avgAlfa}%)
                        </div>
                    </div>
                </div>

                {/* Top Violators Column */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-4">
                        <AlertTriangle className="h-4 w-4 text-cyan-600" />
                        <span>Siswa dengan Poin Pelanggaran Tertinggi</span>
                    </h4>

                    <div className="flex-1 space-y-4">
                        {sortedSiswa.slice(0, 4).map((siswa, idx) => (
                            <div key={siswa.id} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-700">{idx + 1}. {siswa.name}</span>
                                    <span className="inline-flex rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                        {siswa.points} Poin
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-rose-600 rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(siswa.points * 2, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}

                        {sortedSiswa.length === 0 && (
                            <div className="text-center text-slate-400 py-10 text-xs flex flex-col items-center justify-center h-full">
                                <Smile className="h-8 w-8 text-emerald-500 mb-2" />
                                <span>Belum ada catatan penalti ketertiban.</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
