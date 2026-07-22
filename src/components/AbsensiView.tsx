'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { ClipboardCheck, CheckCircle2, AlertTriangle, AlertCircle, Info, Calendar, Search } from 'lucide-react';
import { Student } from '../types';

export default function AbsensiView() {
    const { 
        currentSchool, 
        currentUser, 
        appData, 
        updateAppData, 
        showToast, 
        showConfirm 
    } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [classesToRender, setClassesToRender] = useState<any[]>([]);

    useEffect(() => {
        if (!currentSchool || !currentUser) return;

        // Filter classes for Walas
        const classes = currentUser.role === 'walas'
            ? currentSchool.classes.filter(c => c.id === currentUser.classId)
            : currentSchool.classes;

        setClassesToRender(classes);

        // Check if there are pref values from Piket Dashboard
        const prefClass = sessionStorage.getItem('absensi_pref_class');
        const prefDate = sessionStorage.getItem('absensi_pref_date');

        if (prefDate) {
            setSelectedDate(prefDate);
            sessionStorage.removeItem('absensi_pref_date');
        } else {
            setSelectedDate(prev => prev || new Date().toISOString().slice(0, 10));
        }

        if (prefClass) {
            setSelectedClassId(prefClass);
            sessionStorage.removeItem('absensi_pref_class');
        } else {
            setSelectedClassId(prev => {
                const isValid = classes.some(c => c.id === prev);
                if (prev && isValid) return prev;
                return classes.length > 0 ? classes[0].id : '';
            });
        }
    }, [currentSchool, currentUser]);

    if (!currentSchool || !currentUser) return null;

    const students = currentSchool.students.filter(s => s.classId === selectedClassId);
    students.sort((a, b) => a.name.localeCompare(b.name));

    const filteredStudents = students.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q);
    });

    const dateData = currentSchool.absensi[selectedDate] || {};
    const getUpdatedNotificationLogs = (date: string, affectedStudents: Student[], updatedAbsensi: any) => {
        let countSuccess = 0;
        let countFailed = 0;
        const logs = [...(currentSchool.notificationLogs || [])];

        affectedStudents.forEach(s => {
            const status = updatedAbsensi[date]?.[s.id];
            if (['S', 'I', 'A'].includes(status)) {
                const hasPhone = s.parentPhone && s.parentPhone.trim().length > 0;
                const hasEmail = s.parentEmail && s.parentEmail.trim().length > 0;
                const channel = currentSchool.notificationConfig.channels;
                
                let statusDelivery = 'failed';
                let recipient = 'Tidak ada kontak';

                if (channel === 'wa' && hasPhone) {
                    statusDelivery = 'success';
                    recipient = s.parentPhone!;
                } else if (channel === 'email' && hasEmail) {
                    statusDelivery = 'success';
                    recipient = s.parentEmail!;
                } else if (channel === 'both') {
                    if (hasPhone || hasEmail) {
                        statusDelivery = 'success';
                        recipient = hasPhone ? s.parentPhone! : s.parentEmail!;
                    }
                }

                if (statusDelivery === 'success') {
                    countSuccess++;
                } else {
                    countFailed++;
                }

                const labelStatus = status === 'S' ? 'Sakit' : status === 'I' ? 'Izin' : 'Alfa';
                
                logs.push({
                    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    studentId: s.id,
                    studentName: s.name,
                    date: date,
                    type: 'kehadiran',
                    details: `Status: ${labelStatus}`,
                    status: statusDelivery === 'success' ? 'terkirim' : 'gagal',
                    recipient: recipient,
                    timestamp: new Date().toLocaleString('id-ID')
                });
            }
        });

        if (countSuccess > 0 || countFailed > 0) {
            setTimeout(() => {
                showToast(
                    `Pengiriman Notifikasi Orang Tua: ${countSuccess} terkirim, ${countFailed} gagal.`, 
                    countFailed > 0 ? 'warning' : 'info'
                );
            }, 1000);
        }

        return logs;
    };

    const handleSetAbsensi = (studentId: string, status: 'H' | 'S' | 'I' | 'A') => {
        if (!appData) return;

        const updatedAbsensi = { ...currentSchool.absensi };
        if (!updatedAbsensi[selectedDate]) {
            updatedAbsensi[selectedDate] = {};
        }

        updatedAbsensi[selectedDate][studentId] = status;

        const student = currentSchool.students.find(s => s.id === studentId);
        let logs = currentSchool.notificationLogs || [];
        
        if (student && ['S', 'I', 'A'].includes(status) && ['admin', 'guru_bk'].includes(currentUser.role)) {
            logs = getUpdatedNotificationLogs(selectedDate, [student], updatedAbsensi);
        }

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return {
                    ...sch,
                    absensi: updatedAbsensi,
                    notificationLogs: logs
                };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        showToast('Presensi siswa berhasil diperbarui!', 'success');
    };
    const handleSaveMassal = () => {
        if (!selectedClassId || !selectedDate) {
            showToast('Pilih kelas dan tanggal terlebih dahulu.', 'warning');
            return;
        }

        if (students.length === 0) {
            showToast('Tidak ada siswa di kelas ini.', 'warning');
            return;
        }

        const alreadyFilled = students.some(s => !!dateData[s.id]);

        const performSave = () => {
            if (!appData) return;

            const updatedAbsensi = { ...currentSchool.absensi };
            if (!updatedAbsensi[selectedDate]) {
                updatedAbsensi[selectedDate] = {};
            }

            students.forEach(s => {
                updatedAbsensi[selectedDate][s.id] = 'H';
            });

            const updatedSchools = appData.schools.map(sch => {
                if (sch.id === currentSchool.id) {
                    return {
                        ...sch,
                        absensi: updatedAbsensi
                    };
                }
                return sch;
            });

            updateAppData({ ...appData, schools: updatedSchools });
            showToast('Presensi massal (Hadir) berhasil disimpan!', 'success');
        };

        if (alreadyFilled) {
            showConfirm(
                'Override Presensi Massal', 
                'Terdapat data presensi yang sudah terisi pada tanggal ini. Apakah Anda yakin ingin menimpa data presensi massal menjadi Hadir untuk seluruh siswa?', 
                performSave
            );
        } else {
            performSave();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Control Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Kelas</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        >
                            {classesToRender.map(c => (
                                <option key={c.id} value={c.id}>Kelas {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Tanggal</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cari Siswa</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau NIS..."
                                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white w-48 sm:w-60"
                            />
                            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSaveMassal}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 px-4 transition-all shadow-sm active:scale-[0.98]"
                >
                    <ClipboardCheck className="h-4 w-4" />
                    <span>Set Semua Hadir</span>
                </button>
            </div>

            {/* Attendance Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Siswa</th>
                                <th className="py-3 px-4 text-center w-24">JK</th>
                                <th className="py-3 px-4 text-center w-36">Status</th>
                                <th className="py-3 px-4 text-center w-80">Aksi Presensi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {filteredStudents.map((student, index) => {
                                const status = dateData[student.id]; // H, S, I, A or undefined
                                const hasRecord = !!status;

                                const statusIndicator = hasRecord ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Sudah Diisi
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
                                        <Info className="h-3 w-3" />
                                        Belum Diisi
                                    </span>
                                );

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-slate-400 text-center">{index + 1}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800">{student.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">NIS: {student.nis} | NISN: {student.nisn}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">{student.jk}</td>
                                        <td className="py-3.5 px-4 text-center">{statusIndicator}</td>
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
                                                        <button
                                                            key={code}
                                                            onClick={() => handleSetAbsening(student.id, code)}
                                                            className={`flex-1 font-bold text-[10px] py-1 px-3.5 rounded-lg transition-all active:scale-[0.97] max-w-[70px] ${btnClass}`}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-slate-400 py-8">
                                        {searchQuery ? 'Tidak ada siswa yang cocok dengan kata kunci pencarian.' : 'Belum ada data siswa di kelas ini.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Wrapper to fix naming reference
    function handleSetAbsening(studentId: string, status: 'H' | 'S' | 'I' | 'A') {
        handleSetAbsensi(studentId, status);
    }
}
