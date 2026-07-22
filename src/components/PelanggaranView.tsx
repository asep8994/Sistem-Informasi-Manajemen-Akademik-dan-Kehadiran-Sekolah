'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { AlertOctagon, Plus, Pencil, Trash, AlertTriangle, ShieldAlert, X, Smile, Search } from 'lucide-react';
import { Student, ViolationRecord } from '../types';

export default function PelanggaranView() {
    const { 
        currentSchool, 
        currentUser, 
        appData, 
        updateAppData, 
        showToast, 
        showConfirm 
    } = useApp();

    // Filter state
    const [selectedClassId, setSelectedClassId] = useState('');
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    
    // Add Form state
    const [formStudentId, setFormStudentId] = useState('');
    const [formType, setFormType] = useState('');
    const [formPoints, setFormPoints] = useState(0);
    const [formDate, setFormDate] = useState('');

    // Edit Modal state
    const [editRecord, setEditRecord] = useState<ViolationRecord | null>(null);
    const [editType, setEditType] = useState('');
    const [editPoints, setEditPoints] = useState<string | number>(0);
    const [editDate, setEditDate] = useState('');

    useEffect(() => {
        if (!currentSchool) return;

        // Set default filter class ONLY if not already set or invalid
        setSelectedClassId(prev => {
            const isValid = currentSchool.classes.some(c => c.id === prev);
            if (prev && isValid) return prev;
            return currentSchool.classes.length > 0 ? currentSchool.classes[0].id : '';
        });

        // Set default form date ONLY if not already set
        setFormDate(prev => prev || new Date().toISOString().slice(0, 10));
    }, [currentSchool]);

    // Handle student list for Form based on filtered class
    useEffect(() => {
        if (!currentSchool || !selectedClassId) return;

        const classStudents = currentSchool.students.filter(s => s.classId === selectedClassId);
        classStudents.sort((a, b) => a.name.localeCompare(b.name));

        if (classStudents.length > 0) {
            setFormStudentId(classStudents[0].id);
        } else {
            setFormStudentId('');
        }
    }, [selectedClassId, currentSchool]);

    // Update point automatically based on selected type in form
    useEffect(() => {
        if (!currentSchool || !formType) return;

        const typeObj = currentSchool.violationTypes.find(vt => vt.name === formType);
        if (typeObj) {
            setFormPoints(typeObj.points);
        }
    }, [formType, currentSchool]);

    // Set first violation type as default in form
    useEffect(() => {
        if (currentSchool && currentSchool.violationTypes.length > 0) {
            const sortedTypes = [...currentSchool.violationTypes].sort((a, b) => a.name.localeCompare(b.name));
            setFormType(sortedTypes[0].name);
            setFormPoints(sortedTypes[0].points);
        }
    }, [currentSchool]);

    if (!currentSchool || !currentUser) return null;

    const isAuthorized = ['admin', 'guru_bk', 'superadmin'].includes(currentUser.role);
    if (!isAuthorized) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                <p className="text-red-500 font-bold text-sm">Akses Ditolak</p>
                <p className="text-slate-500 text-xs mt-1">Anda tidak memiliki hak akses untuk halaman pencatatan pelanggaran.</p>
            </div>
        );
    }

    const studentsInClass = currentSchool.students.filter(s => s.classId === selectedClassId);
    
    const records = (currentSchool.violations || [])
        .filter(v => studentsInClass.some(s => s.id === v.studentId))
        .sort((a, b) => b.date.localeCompare(a.date));

    // Cumulative calculations
    const totals = records.reduce((acc: { [key: string]: number }, item) => {
        acc[item.studentId] = (acc[item.studentId] || 0) + item.points;
        return acc;
    }, {});

    const sortedSummary = Object.entries(totals)
        .map(([id, pts]) => ({
            id,
            points: pts,
            name: currentSchool.students.find(s => s.id === id)?.name || 'Siswa'
        }))
        .sort((a, b) => b.points - a.points);

    const handleAddViolation = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthorized) {
            showToast('Hanya Administrator dan Guru BK yang dapat mencatat sanksi pelanggaran!', 'danger');
            return;
        }

        if (!formStudentId || !formType || formPoints <= 0 || !formDate) {
            showToast('Lengkapi kolom input dengan data valid!', 'warning');
            return;
        }

        const student = currentSchool.students.find(s => s.id === formStudentId);
        if (!student) return;

        if (!appData) return;

        const updatedViolations = [...(currentSchool.violations || [])];
        const existingIdx = updatedViolations.findIndex(
            v => v.studentId === formStudentId && v.type === formType && v.date === formDate
        );

        if (existingIdx !== -1) {
            updatedViolations[existingIdx] = {
                ...updatedViolations[existingIdx],
                points: updatedViolations[existingIdx].points + formPoints
            };
            showToast(`Poin pelanggaran '${formType}' berhasil ditambahkan ke log berjalan.`, 'success');
        } else {
            const classObj = currentSchool.classes.find(c => c.id === selectedClassId);
            updatedViolations.push({
                id: `v${Date.now()}`,
                studentId: formStudentId,
                studentName: student.name,
                classId: selectedClassId,
                className: classObj ? classObj.name : 'Kelas',
                type: formType,
                points: formPoints,
                date: formDate,
                reporter: currentUser.name
            });
            showToast('Kunci & catat sanksi pelanggaran sukses!', 'success');
        }

        // Notification Log logic
        const hasPhone = student.parentPhone && student.parentPhone.trim().length > 0;
        const hasEmail = student.parentEmail && student.parentEmail.trim().length > 0;
        const channel = currentSchool.notificationConfig.channels;
        
        let statusDelivery: 'success' | 'failed' = 'failed';
        let recipient = 'Tidak ada kontak';

        if (channel === 'wa' && hasPhone) {
            statusDelivery = 'success';
            recipient = student.parentPhone!;
        } else if (channel === 'email' && hasEmail) {
            statusDelivery = 'success';
            recipient = student.parentEmail!;
        } else if (channel === 'both') {
            if (hasPhone || hasEmail) {
                statusDelivery = 'success';
                recipient = hasPhone ? student.parentPhone! : student.parentEmail!;
            }
        }

        const logs = [...(currentSchool.notificationLogs || [])];
        logs.push({
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            studentId: student.id,
            studentName: student.name,
            date: formDate,
            type: 'pelanggaran',
            details: `Sanksi: ${formType} (${formPoints} Poin)`,
            status: statusDelivery === 'success' ? 'terkirim' : 'gagal',
            recipient: recipient,
            timestamp: new Date().toLocaleString('id-ID')
        });

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return {
                    ...sch,
                    violations: updatedViolations,
                    notificationLogs: logs
                };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });

        setTimeout(() => {
            if (statusDelivery === 'success') {
                showToast(`Notifikasi pelanggaran terkirim ke orang tua (${recipient}).`, 'info');
            } else {
                showToast(`Gagal mengirim notifikasi: nomor WA / email orang tua belum diatur.`, 'warning');
            }
        }, 1000);
    };

    const handleDelete = (id: string) => {
        if (!isAuthorized) {
            showToast('Hanya Administrator dan Guru BK yang dapat menghapus sanksi pelanggaran!', 'danger');
            return;
        }

        showConfirm('Hapus Log Pelanggaran', 'Apakah Anda yakin ingin menghapus catatan pelanggaran ini dari log?', () => {
            if (!appData) return;

            const updatedViolations = (currentSchool.violations || []).filter(v => v.id !== id);
            const updatedSchools = appData.schools.map(sch => {
                if (sch.id === currentSchool.id) {
                    return {
                        ...sch,
                        violations: updatedViolations
                    };
                }
                return sch;
            });

            updateAppData({ ...appData, schools: updatedSchools });
            showToast('Catatan pelanggaran telah dihapus.', 'info');
        });
    };

    const handleOpenEdit = (record: ViolationRecord) => {
        if (!isAuthorized) {
            showToast('Hanya Administrator dan Guru BK yang dapat mengedit sanksi pelanggaran!', 'danger');
            return;
        }
        setEditRecord(record);
        setEditType(record.type);
        setEditPoints(record.points);
        setEditDate(record.date);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRecord || !appData) return;

        const pointsNum = Number(editPoints);
        if (!editType || isNaN(pointsNum) || pointsNum < 0 || !editDate) {
            showToast('Masukkan data poin pelanggaran dengan benar!', 'warning');
            return;
        }

        const updatedViolations = (currentSchool.violations || []).map(v => {
            if (v.id === editRecord.id) {
                return {
                    ...v,
                    type: editType,
                    points: pointsNum,
                    date: editDate
                };
            }
            return v;
        });

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return {
                    ...sch,
                    violations: updatedViolations
                };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        setEditRecord(null);
        showToast('Catatan log sanksi berhasil diperbarui!', 'success');
    };

    return (
        <div className="space-y-6">
            {/* Filter & Entry Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Pencatatan (P0: Authorization filter in view) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <AlertOctagon className="h-4 w-4 text-rose-600" />
                            <span>Form Catat Pelanggaran Siswa</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Catat kejadian pelanggaran tata tertib dan sanksi poin.</p>
                    </div>

                    <form onSubmit={handleAddViolation} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Filter Kelas</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            >
                                {currentSchool.classes.map(c => (
                                    <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Siswa</label>
                            <select
                                value={formStudentId}
                                onChange={(e) => setFormStudentId(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            >
                                {studentsInClass.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                                {studentsInClass.length === 0 && (
                                    <option value="">Tidak ada siswa di kelas ini</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Pelanggaran</label>
                            <select
                                value={formType}
                                onChange={(e) => setFormType(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            >
                                {[...currentSchool.violationTypes]
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(vt => (
                                        <option key={vt.id} value={vt.name}>
                                            {vt.name} (-{vt.points} Poin)
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot Poin Penalti</label>
                                <input
                                    type="number"
                                    value={formPoints}
                                    onChange={(e) => setFormPoints(Number(e.target.value))}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-100 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Kejadian</label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!isAuthorized || studentsInClass.length === 0}
                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs py-2 px-4 transition-all shadow-md active:scale-[0.99] mt-4"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Kunci &amp; Catat Pelanggaran</span>
                        </button>
                    </form>
                </div>

                {/* Ringkasan Poin / Cumulative Warnings */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-3">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        <span>Ringkasan Akumulasi Poin Sanksi Kelas</span>
                    </h4>

                    <div className="flex-1 overflow-y-auto max-h-[280px] divide-y divide-slate-100 pr-1">
                        {sortedSummary.map((sum) => (
                            <div key={sum.id} className="flex justify-between items-center py-2 text-xs">
                                <span className="font-semibold text-slate-700">{sum.name}</span>
                                <span className="inline-flex rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 font-bold text-red-600">
                                    {sum.points} Poin
                                </span>
                            </div>
                        ))}

                        {sortedSummary.length === 0 && (
                            <div className="text-center text-slate-400 py-12 text-xs flex flex-col items-center justify-center h-full">
                                <Smile className="h-8 w-8 text-emerald-500 mb-2" />
                                <span>Semua siswa bersih dari sanksi pelanggaran.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* History logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-600">Log Kejadian Pelanggaran Kelas</h4>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Siswa</th>
                                <th className="py-3 px-4">Kelas</th>
                                <th className="py-3 px-4">Tanggal</th>
                                <th className="py-3 px-4">Jenis Pelanggaran</th>
                                <th className="py-3 px-4 text-center w-24">Poin</th>
                                <th className="py-3 px-4 text-center w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {records.map((rec, index) => (
                                <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                    <td className="py-3 px-4 font-bold text-slate-800">{rec.studentName}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 font-semibold text-slate-600 text-[10px]">
                                            {rec.className}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-500">{rec.date}</td>
                                    <td className="py-3 px-4 text-slate-600">{rec.type}</td>
                                    <td className="py-3 px-4 text-center font-bold text-red-600">{rec.points}</td>
                                    <td className="py-2 px-4 text-center">
                                        <div className="flex gap-1 justify-center">
                                            <button
                                                onClick={() => handleOpenEdit(rec)}
                                                className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                title="Edit Log"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rec.id)}
                                                className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                title="Hapus Log"
                                            >
                                                <Trash className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-slate-400 py-8">
                                        Belum ada sanksi pelanggaran dicatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Violation Modal */}
            {editRecord && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <span>Edit Log Pelanggaran</span>
                            </h3>
                            <button
                                onClick={() => setEditRecord(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Siswa</label>
                                <input
                                    type="text"
                                    value={editRecord.studentName}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-100 py-1.5 px-3 text-xs font-semibold text-slate-500 outline-none"
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Pelanggaran</label>
                                <select
                                    value={editType}
                                    onChange={(e) => {
                                        setEditType(e.target.value);
                                        const typeObj = currentSchool.violationTypes.find(vt => vt.name === e.target.value);
                                        if (typeObj) setEditPoints(typeObj.points);
                                    }}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                >
                                    {currentSchool.violationTypes.map(vt => (
                                        <option key={vt.id} value={vt.name}>{vt.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Poin Penalti</label>
                                    <input
                                        type="number"
                                        value={editPoints}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') setEditPoints('');
                                            else {
                                                const parsed = parseInt(val, 10);
                                                setEditPoints(isNaN(parsed) ? '' : parsed);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditRecord(null)}
                                    className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2 transition-all active:scale-[0.98]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-cyan-750 hover:bg-cyan-850 bg-cyan-700 text-white font-semibold text-xs px-4 py-2 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
