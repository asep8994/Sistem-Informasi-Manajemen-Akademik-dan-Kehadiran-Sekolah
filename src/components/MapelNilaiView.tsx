'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Award, Plus, X, Trash } from 'lucide-react';

const DEFAULT_ASSESSMENTS = ['Tugas 1', 'Tugas 2', 'Tugas 3', 'Ulangan Harian 1', 'Ulangan Harian 2', 'UTS', 'UAS'];

export default function MapelNilaiView() {
    const { currentSchool, currentUser, appData, updateAppData, showToast, showConfirm } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [localGrades, setLocalGrades] = useState<{ [studentId: string]: string }>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAssessmentName, setNewAssessmentName] = useState('');

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
        } else if (assignedClasses.length > 0) {
            setSelectedClassId(assignedClasses[0].id);
        }
    }, [currentSchool, currentUser]);

    // Get assessment types list for the selected class/subject
    const getAssessmentList = (): string[] => {
        if (!currentSchool || !selectedClassId) return DEFAULT_ASSESSMENTS;
        const config = currentSchool.nilaiMapelConfig || {};
        return config[selectedClassId]?.[mapelName] || DEFAULT_ASSESSMENTS;
    };

    const assessmentList = getAssessmentList();

    // Set default assessment type
    useEffect(() => {
        if (assessmentList.length > 0 && !selectedType) {
            setSelectedType(assessmentList[0]);
        }
    }, [assessmentList]);

    // Load grades when selection changes
    useEffect(() => {
        if (!currentSchool || !selectedClassId || !selectedType) return;
        const gradesDb = currentSchool.nilaiMapel || [];
        const record = gradesDb.find(n => n.classId === selectedClassId && n.subject === mapelName && n.assessmentType === selectedType);
        const saved = record?.grades || {};
        const mapped: { [key: string]: string } = {};
        Object.entries(saved).forEach(([k, v]) => { mapped[k] = String(v); });
        setLocalGrades(mapped);
    }, [selectedClassId, selectedType, currentSchool, mapelName]);

    if (!currentSchool || !currentUser || !appData) return null;

    const students = currentSchool.students.filter(s => s.classId === selectedClassId);
    students.sort((a, b) => a.name.localeCompare(b.name));

    const handleGradeChange = (studentId: string, value: string) => {
        if (value === '') {
            setLocalGrades(prev => ({ ...prev, [studentId]: '' }));
            return;
        }
        const parsed = parseInt(value, 10);
        const cleaned = isNaN(parsed) ? '' : String(parsed);
        setLocalGrades(prev => ({ ...prev, [studentId]: cleaned }));
    };

    const handleSave = () => {
        if (!selectedClassId || !selectedType) {
            showToast('Pilih kelas dan jenis asesmen terlebih dahulu!', 'warning');
            return;
        }

        const grades: { [key: string]: number } = {};
        Object.entries(localGrades).forEach(([id, val]) => {
            const v = val.trim();
            if (v !== '') {
                grades[id] = Math.max(0, Math.min(100, Number(v)));
            }
        });

        const updatedNilai = [...(currentSchool.nilaiMapel || [])];
        const existingIdx = updatedNilai.findIndex(n => n.classId === selectedClassId && n.subject === mapelName && n.assessmentType === selectedType);

        if (existingIdx !== -1) {
            updatedNilai[existingIdx] = { ...updatedNilai[existingIdx], grades };
        } else {
            updatedNilai.push({
                id: `nilai-${Date.now()}`,
                classId: selectedClassId,
                subject: mapelName,
                assessmentType: selectedType,
                grades
            });
        }

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, nilaiMapel: updatedNilai };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        showToast(`Daftar nilai '${selectedType}' berhasil disimpan!`, 'success');
    };

    const handleAddAssessment = () => {
        const name = newAssessmentName.trim();
        if (!name) {
            showToast('Nama penilaian tidak boleh kosong!', 'warning');
            return;
        }

        const cleanName = name.toLowerCase();
        const isValid = cleanName.startsWith('tugas') || cleanName.startsWith('ulangan harian') || cleanName.startsWith('uh') || cleanName.startsWith('uts') || cleanName.startsWith('uas') || cleanName.startsWith('kuis');

        if (!isValid) {
            showToast('Nama harus diawali Tugas, Ulangan Harian/UH, UTS, UAS, atau Kuis!', 'warning');
            return;
        }

        let formattedName = name;
        if (cleanName.startsWith('tugas')) formattedName = 'Tugas ' + name.slice(5).trim();
        else if (cleanName.startsWith('ulangan harian')) formattedName = 'Ulangan Harian ' + name.slice(14).trim();
        else if (cleanName.startsWith('uh')) formattedName = 'Ulangan Harian ' + name.slice(2).trim();
        else if (cleanName.startsWith('uts')) formattedName = 'UTS ' + name.slice(3).trim();
        else if (cleanName.startsWith('uas')) formattedName = 'UAS ' + name.slice(3).trim();
        formattedName = formattedName.replace(/\s+/g, ' ').trim();

        if (assessmentList.includes(formattedName)) {
            showToast('Nama penilaian sudah ada!', 'warning');
            return;
        }

        const updatedConfig = { ...(currentSchool.nilaiMapelConfig || {}) };
        if (!updatedConfig[selectedClassId]) updatedConfig[selectedClassId] = {};
        const existing = updatedConfig[selectedClassId][mapelName] || [...DEFAULT_ASSESSMENTS];
        existing.push(formattedName);
        updatedConfig[selectedClassId][mapelName] = existing;

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, nilaiMapelConfig: updatedConfig };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        setSelectedType(formattedName);
        setShowAddModal(false);
        setNewAssessmentName('');
        showToast(`Penilaian '${formattedName}' berhasil ditambahkan!`, 'success');
    };

    const handleDeleteAssessment = () => {
        if (!selectedClassId || !selectedType) {
            showToast('Pilih jenis penilaian yang ingin dihapus!', 'warning');
            return;
        }

        showConfirm(
            'Hapus Jenis Penilaian',
            `Apakah Anda yakin ingin menghapus jenis penilaian "${selectedType}" beserta seluruh nilai siswa terkait? Tindakan ini tidak dapat dibatalkan.`,
            () => {
                const config = currentSchool.nilaiMapelConfig || {};
                const currentList = config[selectedClassId]?.[mapelName] || [...DEFAULT_ASSESSMENTS];
                const updatedList = currentList.filter(name => name !== selectedType);

                const updatedConfig = { ...config };
                if (!updatedConfig[selectedClassId]) updatedConfig[selectedClassId] = {};
                updatedConfig[selectedClassId][mapelName] = updatedList;

                const updatedGrades = (currentSchool.nilaiMapel || [])
                    .filter(n => !(n.classId === selectedClassId && n.subject === mapelName && n.assessmentType === selectedType));

                const updatedSchools = appData.schools.map(sch => {
                    if (sch.id === currentSchool.id) {
                        return {
                            ...sch,
                            nilaiMapelConfig: updatedConfig,
                            nilaiMapel: updatedGrades
                        };
                    }
                    return sch;
                });

                updateAppData({ ...appData, schools: updatedSchools });
                
                const nextType = updatedList.length > 0 ? updatedList[0] : '';
                setSelectedType(nextType);
                
                showToast(`Jenis penilaian "${selectedType}" berhasil dihapus.`, 'info');
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Kelas</label>
                        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        >
                            {assignedClasses.map(c => (
                                <option key={c.id} value={c.id}>Kelas {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mata Pelajaran</label>
                        <input type="text" value={mapelName} readOnly
                            className="rounded-lg border border-slate-200 bg-slate-100 py-1.5 px-3 text-xs font-semibold text-slate-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jenis Penilaian</label>
                        <div className="flex gap-1.5">
                            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            >
                                {assessmentList.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <button 
                                onClick={() => setShowAddModal(true)} 
                                className="rounded-lg border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-all cursor-pointer flex items-center justify-center p-2 shadow-sm" 
                                title="Tambah Penilaian Baru"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            {selectedType && (
                                <button 
                                    onClick={handleDeleteAssessment} 
                                    className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer flex items-center justify-center p-2 shadow-sm" 
                                    title="Hapus Penilaian Terpilih"
                                >
                                    <Trash className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 px-4 transition-all shadow-sm active:scale-[0.98]">
                        <Award className="h-4 w-4" />
                        <span>Simpan Nilai</span>
                    </button>
                </div>
            </div>

            {/* Grades Input Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Siswa</th>
                                <th className="py-3 px-4 text-center w-20">JK</th>
                                <th className="py-3 px-4 text-center w-32">Nilai (0-100)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {students.map((student, index) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                    <td className="py-3.5 px-4">
                                        <div className="font-bold text-slate-800">{student.name}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">NIS: {student.nis} | NISN: {student.nisn}</div>
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">{student.jk}</td>
                                    <td className="py-3.5 px-4 text-center">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="0-100"
                                            value={localGrades[student.id] || ''}
                                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                            className="w-20 mx-auto rounded-lg border border-slate-200 bg-slate-50 py-1 px-2 text-center text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                        />
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-slate-400 py-8">Tidak ada data siswa di kelas ini.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Assessment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Plus className="h-5 w-5 text-cyan-600" />
                                Tambah Penilaian Baru
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                            Masukkan nama penilaian baru. Nama harus diawali dengan <strong>Tugas</strong>, <strong>Ulangan Harian</strong> (UH), <strong>UTS</strong>, atau <strong>UAS</strong>.
                        </p>
                        <input
                            type="text"
                            placeholder="Contoh: Tugas 4 atau UH 3"
                            value={newAssessmentName}
                            onChange={(e) => setNewAssessmentName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddModal(false)} className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2">Batal</button>
                            <button onClick={handleAddAssessment} className="rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs px-4 py-2 shadow-sm">Tambah</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
