'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Award, Plus, X, Trash, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { TujuanPembelajaran } from '../types';

const DEFAULT_ASSESSMENTS = ['Tugas 1', 'Tugas 2', 'Tugas 3', 'Ulangan Harian 1', 'Ulangan Harian 2', 'UTS', 'UAS'];

export default function MapelNilaiView() {
    const { currentSchool, currentUser, appData, updateAppData, showToast, showConfirm } = useApp();

    const [activeTab, setActiveTab] = useState<'nilai' | 'tp'>('nilai');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [localGrades, setLocalGrades] = useState<{ [studentId: string]: string }>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAssessmentName, setNewAssessmentName] = useState('');

    // TP Modal & State
    const [showAddTpModal, setShowAddTpModal] = useState(false);
    const [newTpCode, setNewTpCode] = useState('TP 1');
    const [newTpDesc, setNewTpDesc] = useState('');

    const userAny = currentUser as any;
    const mapelName = currentUser?.mapelName || userAny?.subjectName || 'Matematika';
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

    // Get TPs for this class & mapel
    const currentTps = (currentSchool.tujuanPembelajaran || []).filter(
        tp => tp.classId === selectedClassId && tp.subject === mapelName
    );

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
            `Apakah Anda yakin ingin menghapus jenis penilaian "${selectedType}" beserta seluruh nilai siswa terkait?`,
            () => {
                const updatedConfig = { ...(currentSchool.nilaiMapelConfig || {}) };
                if (updatedConfig[selectedClassId]?.[mapelName]) {
                    updatedConfig[selectedClassId][mapelName] = updatedConfig[selectedClassId][mapelName].filter(t => t !== selectedType);
                }

                const updatedNilai = (currentSchool.nilaiMapel || []).filter(
                    n => !(n.classId === selectedClassId && n.subject === mapelName && n.assessmentType === selectedType)
                );

                const updatedSchools = appData.schools.map(sch => {
                    if (sch.id === currentSchool.id) {
                        return { ...sch, nilaiMapelConfig: updatedConfig, nilaiMapel: updatedNilai };
                    }
                    return sch;
                });

                updateAppData({ ...appData, schools: updatedSchools });
                const remaining = updatedConfig[selectedClassId]?.[mapelName] || DEFAULT_ASSESSMENTS;
                setSelectedType(remaining[0] || '');
                showToast(`Penilaian '${selectedType}' berhasil dihapus!`, 'success');
            }
        );
    };

    // TP Handlers
    const handleAddTp = () => {
        const desc = newTpDesc.trim();
        if (!desc) {
            showToast('Deskripsi Tujuan Pembelajaran tidak boleh kosong!', 'warning');
            return;
        }

        const newTp: TujuanPembelajaran = {
            id: `tp-${Date.now()}`,
            classId: selectedClassId,
            subject: mapelName,
            code: newTpCode.trim() || `TP ${currentTps.length + 1}`,
            description: desc
        };

        const existingTps = currentSchool.tujuanPembelajaran || [];
        const updatedTps = [...existingTps, newTp];

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, tujuanPembelajaran: updatedTps };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        setShowAddTpModal(false);
        setNewTpDesc('');
        setNewTpCode(`TP ${currentTps.length + 2}`);
        showToast('Tujuan Pembelajaran berhasil ditambahkan!', 'success');
    };

    const handleDeleteTp = (tpId: string) => {
        showConfirm(
            'Hapus Tujuan Pembelajaran',
            'Apakah Anda yakin ingin menghapus TP ini?',
            () => {
                const updatedTps = (currentSchool.tujuanPembelajaran || []).filter(tp => tp.id !== tpId);
                const updatedSchools = appData.schools.map(sch => {
                    if (sch.id === currentSchool.id) {
                        return { ...sch, tujuanPembelajaran: updatedTps };
                    }
                    return sch;
                });

                updateAppData({ ...appData, schools: updatedSchools });
                showToast('Tujuan Pembelajaran berhasil dihapus.', 'info');
            }
        );
    };

    const handleToggleKetuntasan = (studentId: string, tpId: string) => {
        const currentKetuntasan = currentSchool.ketuntasanTP || {};
        const classObj = currentKetuntasan[selectedClassId] || {};
        const subjectObj = classObj[mapelName] || {};
        const studentObj = subjectObj[studentId] || {};

        const currentStatus = studentObj[tpId];
        let nextStatus: 'tuntas' | 'perlu_bimbingan' = 'tuntas';
        if (currentStatus === 'tuntas') nextStatus = 'perlu_bimbingan';

        const updatedKetuntasan = {
            ...currentKetuntasan,
            [selectedClassId]: {
                ...classObj,
                [mapelName]: {
                    ...subjectObj,
                    [studentId]: {
                        ...studentObj,
                        [tpId]: nextStatus
                    }
                }
            }
        };

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, ketuntasanTP: updatedKetuntasan };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
    };

    return (
        <div className="space-y-6">
            {/* Header & Sub-Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Manajemen Nilai & TP ({mapelName})</h2>
                    <p className="text-xs text-slate-500">Kelola nilai asesmen dan Tujuan Pembelajaran (TP) untuk Rapor Tengah Semester.</p>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button
                        onClick={() => setActiveTab('nilai')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'nilai'
                                ? 'bg-white text-cyan-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        1. Input Nilai Asesmen
                    </button>
                    <button
                        onClick={() => setActiveTab('tp')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeTab === 'tp'
                                ? 'bg-white text-cyan-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Target className="h-3.5 w-3.5" />
                        2. Tujuan Pembelajaran (TP Rapor)
                    </button>
                </div>
            </div>

            {/* TAB 1: INPUT NILAI ASESMEN */}
            {activeTab === 'nilai' && (
                <>
                    {/* Controls Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">Kelas:</span>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                >
                                    {assignedClasses.map(c => (
                                        <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">Penilaian:</span>
                                <div className="flex items-center gap-1">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 min-w-[140px]"
                                    >
                                        {assessmentList.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 p-1.5 transition-all border border-cyan-200"
                                        title="Tambah Penilaian Baru"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    {selectedType && (
                                        <button
                                            onClick={handleDeleteAssessment}
                                            className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 transition-all"
                                            title="Hapus Penilaian Terpilih"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 px-4 transition-all shadow-sm">
                            <Award className="h-4 w-4" />
                            <span>Simpan Nilai</span>
                        </button>
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
                </>
            )}

            {/* TAB 2: TUJUAN PEMBELAJARAN (TP) */}
            {activeTab === 'tp' && (
                <div className="space-y-6">
                    {/* Controls Bar for TP */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-500">Pilih Kelas:</span>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                            >
                                {assignedClasses.map(c => (
                                    <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                setNewTpCode(`TP ${currentTps.length + 1}`);
                                setShowAddTpModal(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Tujuan Pembelajaran (TP)</span>
                        </button>
                    </div>

                    {/* List of TPs for this Mapel */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Daftar Tujuan Pembelajaran ({mapelName}) - Kelas {assignedClasses.find(c => c.id === selectedClassId)?.name}
                        </h3>

                        {currentTps.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                                Belum ada Tujuan Pembelajaran (TP) yang ditambahkan untuk mapel ini. Klik tombol "Tambah TP" di atas.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {currentTps.map(tp => (
                                    <div key={tp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                                        <div>
                                            <span className="inline-block bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                                                {tp.code}
                                            </span>
                                            <p className="text-xs text-slate-800 font-medium">{tp.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTp(tp.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Hapus TP"
                                        >
                                            <Trash className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Table Ketuntasan TP per Siswa */}
                    {currentTps.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                                <h3 className="text-xs font-bold text-slate-700 uppercase">
                                    Penilaian Ketuntasan TP Per Siswa (Untuk Deskripsi Rapor)
                                </h3>
                                <p className="text-[11px] text-slate-500">Klik status untuk mengubah status ketuntasan siswa pada masing-masing TP.</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-white">
                                            <th className="py-3 px-4 w-12 text-center">No</th>
                                            <th className="py-3 px-4">Nama Siswa</th>
                                            {currentTps.map(tp => (
                                                <th key={tp.id} className="py-3 px-4 text-center min-w-[140px]">
                                                    {tp.code}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                        {students.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                                <td className="py-3.5 px-4 font-bold text-slate-800">{student.name}</td>

                                                {currentTps.map(tp => {
                                                    const ketuntasan = currentSchool.ketuntasanTP?.[selectedClassId]?.[mapelName]?.[student.id]?.[tp.id] || 'tuntas';
                                                    const isTuntas = ketuntasan === 'tuntas';
                                                    return (
                                                        <td key={tp.id} className="py-3.5 px-4 text-center">
                                                            <button
                                                                onClick={() => handleToggleKetuntasan(student.id, tp.id)}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                                                                    isTuntas
                                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                                }`}
                                                            >
                                                                {isTuntas ? (
                                                                    <>
                                                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                                        Tuntas
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                                                        Perlu Bimbingan
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Assessment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Plus className="h-5 w-5 text-cyan-600" />
                                Tambah Penilaian Baru
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Contoh: Tugas 4 atau UH 3"
                            value={newAssessmentName}
                            onChange={(e) => setNewAssessmentName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddModal(false)} className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2">Batal</button>
                            <button onClick={handleAddAssessment} className="rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs px-4 py-2 shadow-sm">Tambah</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add TP Modal */}
            {showAddTpModal && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Target className="h-5 w-5 text-emerald-600" />
                                Tambah Tujuan Pembelajaran (TP)
                            </h3>
                            <button onClick={() => setShowAddTpModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Kode TP</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: TP 1"
                                    value={newTpCode}
                                    onChange={(e) => setNewTpCode(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi Capaian / TP</label>
                                <textarea
                                    rows={3}
                                    placeholder="Contoh: Memahami konsep persamaan kuadrat dan kaitannya dengan grafik fungsi."
                                    value={newTpDesc}
                                    onChange={(e) => setNewTpDesc(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddTpModal(false)} className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2">Batal</button>
                            <button onClick={handleAddTp} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 shadow-sm">Simpan TP</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
