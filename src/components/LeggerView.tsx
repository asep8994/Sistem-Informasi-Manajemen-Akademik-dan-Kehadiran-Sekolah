'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Download, Printer, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const DEFAULT_SUBJECTS = [
    'PAI',
    'PPKn',
    'B. Indo',
    'MTK',
    'IPA',
    'IPS',
    'B. Ing',
    'PJOK',
    'Seni',
    'Informatika'
];

export default function LeggerView() {
    const { currentSchool, currentUser, showToast } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
    const isWalas = currentUser?.role === 'walas';
    const isAuthorized = isAdmin || isWalas;

    const availableClasses = currentSchool?.classes || [];

    useEffect(() => {
        if (!currentSchool) return;
        if (isWalas && currentUser?.classId) {
            setSelectedClassId(currentUser.classId);
        } else if (availableClasses.length > 0) {
            setSelectedClassId(availableClasses[0].id);
        }
    }, [currentSchool, currentUser]);

    if (!isAuthorized) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-100 max-w-xl mx-auto my-12">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
                <p className="text-gray-600 text-sm mb-4">
                    Halaman Legger Nilai Kelas hanya dapat diakses oleh <strong>Admin Sekolah</strong> dan <strong>Wali Kelas</strong>.
                </p>
            </div>
        );
    }

    if (!currentSchool) return null;

    const currentClass = availableClasses.find(c => c.id === selectedClassId);
    const students = (currentSchool.students || []).filter(s => s.classId === selectedClassId);
    students.sort((a, b) => a.name.localeCompare(b.name));

    // Get subjects list
    const existingSubjects = (currentSchool.nilaiMapel || [])
        .filter(n => n.classId === selectedClassId)
        .map(n => n.subject);
    const allSubjects = Array.from(new Set([...DEFAULT_SUBJECTS, ...existingSubjects]));

    // Compute student stats
    const studentStats = students.map(student => {
        let totalScore = 0;
        let mapelCount = 0;
        const mapelScores: { [subject: string]: number | null } = {};

        allSubjects.forEach(subj => {
            const entries = (currentSchool.nilaiMapel || []).filter(
                n => n.classId === selectedClassId && n.subject === subj
            );

            let sum = 0;
            let cnt = 0;
            entries.forEach(entry => {
                const val = entry.grades?.[student.id];
                if (typeof val === 'number' && !isNaN(val)) {
                    sum += val;
                    cnt++;
                }
            });

            if (cnt > 0) {
                const avg = Math.round(sum / cnt);
                mapelScores[subj] = avg;
                totalScore += avg;
                mapelCount++;
            } else {
                mapelScores[subj] = null;
            }
        });

        const rataRata = mapelCount > 0 ? Number((totalScore / mapelCount).toFixed(1)) : 0;

        // Absensi
        let countS = 0, countI = 0, countA = 0;
        if (currentSchool.absensi) {
            Object.values(currentSchool.absensi).forEach(dateObj => {
                const st = dateObj[student.id];
                if (st === 'S') countS++;
                else if (st === 'I') countI++;
                else if (st === 'A') countA++;
            });
        }

        // Violations
        const violPoints = (currentSchool.violations || [])
            .filter(v => v.studentId === student.id)
            .reduce((sum, v) => sum + (v.points || 0), 0);

        return {
            student,
            mapelScores,
            totalScore,
            rataRata,
            countS,
            countI,
            countA,
            violPoints,
            rank: 0
        };
    });

    // Rank computation
    const sortedStats = [...studentStats].sort((a, b) => b.rataRata - a.rataRata);
    sortedStats.forEach((item, index) => {
        item.rank = index + 1;
    });

    // Export to Excel
    const handleExportExcel = () => {
        if (!currentClass) return;

        const excelData = studentStats.map((item, idx) => {
            const row: any = {
                'No': idx + 1,
                'NIS': item.student.nis || '-',
                'NISN': item.student.nisn || '-',
                'Nama Siswa': item.student.name,
                'JK': item.student.jk
            };

            allSubjects.forEach(subj => {
                const sc = item.mapelScores[subj];
                row[subj] = sc !== null ? sc : '-';
            });

            row['Total Nilai'] = item.totalScore;
            row['Rata-Rata'] = item.rataRata;
            row['Peringkat'] = item.rank;
            row['Sakit (S)'] = item.countS;
            row['Izin (I)'] = item.countI;
            row['Alfa (A)'] = item.countA;
            row['Poin Pelanggaran'] = item.violPoints;

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Legger Kelas ${currentClass.name}`);

        const filename = `Legger_Nilai_Kelas_${currentClass.name}_${currentSchool.name.replace(/\s+/g, '_')}.xlsx`;
        XLSX.writeFile(workbook, filename);
        showToast(`Berhasil mengekspor Legger Kelas ${currentClass.name}!`, 'success');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Control Bar (Hidden on Print) */}
            <div className="print:hidden bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pilih Kelas Legger</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            disabled={isWalas && !!currentUser?.classId}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                        >
                            {availableClasses.map(c => (
                                <option key={c.id} value={c.id}>Kelas {c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
                    >
                        <FileSpreadsheet size={16} />
                        Ekspor Excel (.xlsx)
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-[#0f4c81] hover:bg-navy-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
                    >
                        <Printer size={16} />
                        Cetak Legger
                    </button>
                </div>
            </div>

            {/* Legger Sheet Container */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 text-gray-800">
                <style>{`
                    @media print {
                        body { background: white !important; font-size: 9pt; color: black !important; }
                        .print\\:hidden { display: none !important; }
                        @page { size: A4 landscape; margin: 10mm; }
                    }
                `}</style>

                {/* Kop Legger */}
                <div className="border-b-2 border-gray-800 pb-3 mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold uppercase tracking-wider text-navy-900">
                            LEGGER REKAPITULASI NILAI TENGAH SEMESTER (PTS / STS)
                        </h1>
                        <p className="text-xs text-gray-600 font-medium">
                            {currentSchool.name} | Kelas: <strong className="text-gray-900">{currentClass?.name}</strong> | Tahun Ajaran: {currentSchool.tahunAjaran || '2026/2027'} ({currentSchool.semester || 'Ganjil'})
                        </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        Total Siswa: <strong>{students.length} Siswa</strong>
                    </div>
                </div>

                {/* Table Legger Matrix */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 text-center font-bold">
                                <th className="border border-gray-300 px-2 py-2 w-8" rowSpan={2}>No</th>
                                <th className="border border-gray-300 px-2 py-2 w-16" rowSpan={2}>NIS</th>
                                <th className="border border-gray-300 px-3 py-2 text-left" rowSpan={2}>Nama Siswa</th>
                                <th className="border border-gray-300 px-1 py-2 w-8" rowSpan={2}>JK</th>
                                <th className="border border-gray-300 px-2 py-1" colSpan={allSubjects.length}>
                                    NILAI MATEMATIKA / MATA PELAJARAN (PTS)
                                </th>
                                <th className="border border-gray-300 px-2 py-2 w-16" rowSpan={2}>Total</th>
                                <th className="border border-gray-300 px-2 py-2 w-16 bg-navy-50 text-navy-900" rowSpan={2}>Rata-Rata</th>
                                <th className="border border-gray-300 px-2 py-2 w-12 bg-amber-50 text-amber-900" rowSpan={2}>Rank</th>
                                <th className="border border-gray-300 px-2 py-1" colSpan={3}>ABSENSI</th>
                                <th className="border border-gray-300 px-2 py-2 w-16 bg-red-50 text-red-900" rowSpan={2}>Poin Pelanggaran</th>
                            </tr>
                            <tr className="bg-gray-50 text-gray-700 text-center text-[11px]">
                                {allSubjects.map((subj, idx) => (
                                    <th key={idx} className="border border-gray-300 px-1 py-1 font-semibold min-w-[45px]">
                                        {subj}
                                    </th>
                                ))}
                                <th className="border border-gray-300 px-1 py-1 w-7 text-blue-700 font-bold">S</th>
                                <th className="border border-gray-300 px-1 py-1 w-7 text-amber-700 font-bold">I</th>
                                <th className="border border-gray-300 px-1 py-1 w-7 text-red-700 font-bold">A</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentStats.length === 0 ? (
                                <tr>
                                    <td colSpan={allSubjects.length + 10} className="text-center py-6 text-gray-400">
                                        Belum ada siswa terdaftar di kelas ini.
                                    </td>
                                </tr>
                            ) : (
                                studentStats.map((item, idx) => (
                                    <tr key={item.student.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="border border-gray-300 px-2 py-1.5 text-center font-medium">{idx + 1}</td>
                                        <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-600">{item.student.nis || '-'}</td>
                                        <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-900 whitespace-nowrap">{item.student.name}</td>
                                        <td className="border border-gray-300 px-1 py-1.5 text-center text-gray-500 font-medium">{item.student.jk}</td>

                                        {allSubjects.map((subj, sIdx) => {
                                            const sc = item.mapelScores[subj];
                                            return (
                                                <td key={sIdx} className="border border-gray-300 px-1 py-1.5 text-center">
                                                    {sc !== null ? (
                                                        <span className={sc < 70 ? 'text-red-600 font-bold' : 'text-gray-800'}>{sc}</span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        <td className="border border-gray-300 px-2 py-1.5 text-center font-bold text-gray-800">{item.totalScore}</td>
                                        <td className="border border-gray-300 px-2 py-1.5 text-center font-bold bg-navy-50/50 text-navy-900">{item.rataRata}</td>
                                        <td className="border border-gray-300 px-2 py-1.5 text-center font-bold bg-amber-50/50 text-amber-800">
                                            #{item.rank}
                                        </td>
                                        <td className="border border-gray-300 px-1 py-1.5 text-center font-medium text-blue-700">{item.countS}</td>
                                        <td className="border border-gray-300 px-1 py-1.5 text-center font-medium text-amber-700">{item.countI}</td>
                                        <td className="border border-gray-300 px-1 py-1.5 text-center font-medium text-red-700">{item.countA}</td>
                                        <td className="border border-gray-300 px-2 py-1.5 text-center font-bold bg-red-50/50 text-red-700">
                                            {item.violPoints}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Signature for Print */}
                <div className="pt-8 hidden print:grid grid-cols-2 text-center text-xs gap-8">
                    <div></div>
                    <div>
                        <p className="text-gray-600">Depok, {currentSchool.raporConfig?.tanggalRapor || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-semibold text-gray-800 mb-12">Wali Kelas {currentClass?.name}</p>
                        <p className="font-bold text-gray-900 underline">
                            {currentSchool.users.find(u => u.role === 'walas' && u.classId === selectedClassId)?.name || (currentUser?.role === 'walas' ? currentUser.name : `Wali Kelas ${currentClass?.name}`)}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-0.5">
                            NIP. {currentSchool.users.find(u => u.role === 'walas' && u.classId === selectedClassId)?.nip || (currentUser?.role === 'walas' ? currentUser.nip : undefined) || '....................................'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
