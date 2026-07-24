'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { ClipboardCheck, CheckCircle2, Info, BookOpen } from 'lucide-react';

export default function MapelAbsensiView() {
    const { currentSchool, currentUser, appData, updateAppData, showToast } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [localAbsensi, setLocalAbsensi] = useState<{ [studentId: string]: 'H' | 'S' | 'I' | 'A' }>({});

    const userAny = currentUser as any;
    const mapelName = currentUser?.mapelName || userAny?.subjectName || 'Mata Pelajaran';
    const assignedIds = (Array.isArray(currentUser?.classes) && currentUser.classes.length > 0)
        ? currentUser.classes
        : (Array.isArray(userAny?.assignedClassIds) && userAny.assignedClassIds.length > 0)
        ? userAny.assignedClassIds
        : [];
    let assignedClasses = currentSchool?.classes.filter(c => assignedIds.includes(c.id)) || [];
    if (assignedClasses.length === 0 && currentSchool?.classes) {
        assignedClasses = currentSchool.classes;
    }

    useEffect(() => {
        if (!currentSchool || !currentUser) return;

        const prefClass = sessionStorage.getItem('mapel_pref_class');
        if (prefClass && assignedIds.includes(prefClass)) {
            setSelectedClassId(prefClass);
            sessionStorage.removeItem('mapel_pref_class');
        } else {
            setSelectedClassId(prev => {
                const isValid = assignedClasses.some(c => c.id === prev);
                if (prev && isValid) return prev;
                return assignedClasses.length > 0 ? assignedClasses[0].id : '';
            });
        }

        setSelectedDate(prev => prev || new Date().toISOString().slice(0, 10));
    }, [currentSchool, currentUser]);

    // Load saved attendance data into local state
    useEffect(() => {
        if (!currentSchool || !selectedClassId || !selectedDate) return;
        const dateData = currentSchool.absensiMapel?.[selectedDate]?.[selectedClassId]?.[mapelName] || {};
        setLocalAbsensi({ ...dateData });
    }, [selectedClassId, selectedDate, currentSchool, mapelName]);

    if (!currentSchool || !currentUser) return null;

    const getReligionFromSubject = (subject: string): string | null => {
        if (!subject) return null;
        const lower = subject.toLowerCase();
        if (lower.includes('islam')) return 'Islam';
        if (lower.includes('kristen') || lower.includes('protestan')) return 'Kristen';
        if (lower.includes('katolik')) return 'Katolik';
        if (lower.includes('hindu')) return 'Hindu';
        if (lower.includes('buddha')) return 'Buddha';
        if (lower.includes('khonghucu')) return 'Khonghucu';
        return null;
    };

    const targetReligion = getReligionFromSubject(mapelName);
    let students = currentSchool.students.filter(s => s.classId === selectedClassId);
    if (targetReligion) {
        students = students.filter(s => (s.agama || 'Islam').toLowerCase() === targetReligion.toLowerCase());
    }
    students.sort((a, b) => a.name.localeCompare(b.name));

    const handleSetLocal = (studentId: string, code: 'H' | 'S' | 'I' | 'A') => {
        setLocalAbsensi(prev => ({ ...prev, [studentId]: code }));
    };

    const handleMassalHadir = () => {
        const updated: { [studentId: string]: 'H' | 'S' | 'I' | 'A' } = { ...localAbsensi };
        students.forEach(s => {
            if (!updated[s.id]) {
                updated[s.id] = 'H';
            }
        });
        setLocalAbsensi(updated);
        showToast('Siswa yang belum diisi otomatis diset Hadir. Silakan klik Simpan!', 'info');
    };

    const handleSave = () => {
        if (!appData || !selectedClassId || !selectedDate) {
            showToast('Pilih kelas dan tanggal terlebih dahulu!', 'warning');
            return;
        }

        const updatedAbsensiMapel = { ...(currentSchool.absensiMapel || {}) };
        if (!updatedAbsensiMapel[selectedDate]) updatedAbsensiMapel[selectedDate] = {};
        if (!updatedAbsensiMapel[selectedDate][selectedClassId]) updatedAbsensiMapel[selectedDate][selectedClassId] = {};
        updatedAbsensiMapel[selectedDate][selectedClassId][mapelName] = { ...localAbsensi };

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, absensiMapel: updatedAbsensiMapel };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        showToast('Presensi mata pelajaran berhasil disimpan!', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Kelas</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        >
                            {assignedClasses.map(c => (
                                <option key={c.id} value={c.id}>Kelas {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
                        <input
                            type="text"
                            value={mapelName}
                            readOnly
                            className="rounded-lg border border-slate-200 bg-slate-100 py-1.5 px-3 text-xs font-semibold text-slate-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleMassalHadir} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3 transition-all active:scale-[0.98]">
                        <ClipboardCheck className="h-4 w-4 text-cyan-600" />
                        <span>Set Semua Hadir</span>
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 px-4 transition-all shadow-sm active:scale-[0.98]">
                        <BookOpen className="h-4 w-4" />
                        <span>Simpan Absensi</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Siswa</th>
                                <th className="py-3 px-4 text-center w-20">JK</th>
                                <th className="py-3 px-4 text-center w-36">Status</th>
                                <th className="py-3 px-4 text-center w-80">Aksi Presensi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {students.map((student, index) => {
                                const status = localAbsensi[student.id];
                                const hasRecord = !!status;

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800">{student.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">NIS: {student.nis} | NISN: {student.nisn}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">{student.jk}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            {hasRecord ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                                                    <CheckCircle2 className="h-3 w-3" />Sudah Absen
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
                                                    <Info className="h-3 w-3" />Belum Diisi
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex gap-1 justify-center">
                                                {(['H', 'S', 'I', 'A'] as const).map(code => {
                                                    const active = status === code;
                                                    let btnClass = 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200';
                                                    if (active) {
                                                        if (code === 'H') btnClass = 'bg-[#0f4c81] text-white shadow-sm border border-[#0f4c81]';
                                                        if (code === 'S') btnClass = 'bg-amber-500 text-white shadow-sm border border-amber-500';
                                                        if (code === 'I') btnClass = 'bg-cyan-600 text-white shadow-sm border border-cyan-600';
                                                        if (code === 'A') btnClass = 'bg-red-600 text-white shadow-sm border border-red-600';
                                                    }
                                                    const label = code === 'H' ? 'Hadir' : code === 'S' ? 'Sakit' : code === 'I' ? 'Izin' : 'Alfa';
                                                    return (
                                                        <button key={code} onClick={() => handleSetLocal(student.id, code)} className={`flex-1 font-bold text-[10px] py-1 px-3.5 rounded-lg transition-all active:scale-[0.97] max-w-[70px] ${btnClass}`}>
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && (
                                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Tidak ada data siswa di kelas ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
