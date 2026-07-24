'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { Download, FileText, ShieldAlert, Users, Loader2, Printer } from 'lucide-react';
import { Student } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const DEFAULT_SUBJECTS = [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila (PPKn)',
    'Bahasa Indonesia',
    'Matematika',
    'Ilmu Pengetahuan Alam (IPA)',
    'Ilmu Pengetahuan Sosial (IPS)',
    'Bahasa Inggris',
    'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    'Seni dan Budaya',
    'Informatika'
];

export default function RaporView() {
    const { currentSchool, currentUser, showToast } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [isBulkViewMode, setIsBulkViewMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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

    const students = currentSchool?.students.filter(s => s.classId === selectedClassId) || [];
    students.sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        if (students.length > 0 && !students.some(s => s.id === selectedStudentId)) {
            setSelectedStudentId(students[0].id);
        }
    }, [selectedClassId, students]);

    if (!isAuthorized) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-100 max-w-xl mx-auto my-12">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
                <p className="text-gray-600 text-sm mb-4">
                    Halaman Rapor Tengah Semester hanya dapat diakses oleh <strong>Admin Sekolah</strong> dan <strong>Wali Kelas</strong>.
                </p>
            </div>
        );
    }

    if (!currentSchool) return null;

    const currentClass = availableClasses.find(c => c.id === selectedClassId);

    // Walas Account for selected class
    const classWalasUser = currentSchool.users.find(u => u.role === 'walas' && u.classId === selectedClassId);
    const walasName = classWalasUser?.name || (isWalas ? currentUser.name : `Wali Kelas ${currentClass?.name}`);
    const walasNip = classWalasUser?.nip || (isWalas ? currentUser.nip : undefined);

    // Paper Settings
    const raporConfig = currentSchool.raporConfig;
    const reportDate = raporConfig?.tanggalRapor || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const paperSizeOption = raporConfig?.paperSize || 'A4';
    const paperMarginOption = raporConfig?.paperMargin || 'normal';

    let pageSizeCss = 'A4 portrait';
    let pdfFormat: [number, number] = [210, 297]; // A4 in mm
    if (paperSizeOption === 'F4') {
        pageSizeCss = '215mm 330mm';
        pdfFormat = [215, 330];
    } else if (paperSizeOption === 'Letter') {
        pageSizeCss = 'letter portrait';
        pdfFormat = [216, 279];
    }

    let marginCss = '15mm';
    if (paperMarginOption === 'compact') marginCss = '10mm';
    else if (paperMarginOption === 'wide') marginCss = '20mm';

    // Subjects list
    const configuredSubjects = raporConfig?.mapelList;
    const existingSubjectsInGrades = (currentSchool.nilaiMapel || [])
        .filter(n => n.classId === selectedClassId)
        .map(n => n.subject);
    const allSubjects = configuredSubjects && configuredSubjects.length > 0
        ? configuredSubjects
        : Array.from(new Set([...DEFAULT_SUBJECTS, ...existingSubjectsInGrades]));

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    // Single Student PDF Export Function
    const handleExportSinglePdf = async () => {
        if (!selectedStudent) return;
        setIsExporting(true);
        showToast(`Membuat file PDF Rapor ${selectedStudent.name}...`, 'info');

        try {
            const cardEl = document.getElementById(`rapor-card-${selectedStudent.id}`);
            if (!cardEl) {
                showToast('Elemen rapor tidak ditemukan.', 'warning');
                setIsExporting(false);
                return;
            }

            const canvas = await html2canvas(cardEl, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: pdfFormat
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const cleanName = selectedStudent.name.replace(/\s+/g, '_');
            const className = currentClass?.name || 'Kelas';

            pdf.save(`Rapor_PTS_${cleanName}_Kelas_${className}.pdf`);
            showToast(`Rapor PDF ${selectedStudent.name} berhasil diunduh!`, 'success');
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses ekspor PDF.', 'danger');
        } finally {
            setIsExporting(false);
        }
    };

    // Bulk Class PDF Export Function
    const handleExportBulkPdf = async () => {
        if (!students || students.length === 0) return;
        setIsExporting(true);
        setIsBulkViewMode(true);
        showToast(`Memproses ekspor PDF ${students.length} siswa 1 kelas... Mohon tunggu.`, 'info');

        // Allow DOM to update if needed
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: pdfFormat
            });

            for (let i = 0; i < students.length; i++) {
                const st = students[i];
                const cardEl = document.getElementById(`rapor-card-${st.id}`);
                if (!cardEl) continue;

                const canvas = await html2canvas(cardEl, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (i > 0) {
                    pdf.addPage(pdfFormat, 'portrait');
                }

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            const className = currentClass?.name || 'Kelas';
            const schoolNameClean = currentSchool.name.replace(/\s+/g, '_');
            pdf.save(`Rapor_PTS_Kelas_${className}_${schoolNameClean}.pdf`);
            showToast(`Berhasil mengunduh Rapor PDF Seluruh Kelas ${className}!`, 'success');
        } catch (err) {
            console.error(err);
            showToast('Gagal memproses ekspor PDF seluruh kelas.', 'danger');
        } finally {
            setIsExporting(false);
        }
    };

    const handleBrowserPrint = () => {
        window.print();
    };

    // Helper to render a single student's Rapor page card
    const renderRaporCard = (student: Student) => {
        // Attendance totals
        let countH = 0, countS = 0, countI = 0, countA = 0;
        if (currentSchool.absensi) {
            Object.values(currentSchool.absensi).forEach(dateObj => {
                const st = dateObj[student.id];
                if (st === 'H') countH++;
                else if (st === 'S') countS++;
                else if (st === 'I') countI++;
                else if (st === 'A') countA++;
            });
        }

        // Violations
        const studentViolations = (currentSchool.violations || []).filter(v => v.studentId === student.id);
        const totalViolationPoints = studentViolations.reduce((sum, v) => sum + (v.points || 0), 0);

        let kedisiplinanPredikat = 'Sangat Baik';
        let kedisiplinanBadge = 'bg-emerald-100 text-emerald-800';
        if (totalViolationPoints > 30) {
            kedisiplinanPredikat = 'Perlu Pembinaan Khusus';
            kedisiplinanBadge = 'bg-red-100 text-red-800';
        } else if (totalViolationPoints > 15) {
            kedisiplinanPredikat = 'Cukup (Peringatan)';
            kedisiplinanBadge = 'bg-amber-100 text-amber-800';
        } else if (totalViolationPoints > 0) {
            kedisiplinanPredikat = 'Baik';
            kedisiplinanBadge = 'bg-blue-100 text-blue-800';
        }

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

        const studentAgama = student.agama || 'Islam';
        const filteredSubjects = allSubjects.filter(subject => {
            const subjRel = getReligionFromSubject(subject);
            if (!subjRel) return true;
            return subjRel.toLowerCase() === studentAgama.toLowerCase();
        });

        // Subject Grades & TP — Calculate Nilai Akhir (weighted across assessment categories)
        const subjectReportData = filteredSubjects.map(subject => {
            const entries = (currentSchool.nilaiMapel || []).filter(
                n => n.classId === selectedClassId && n.subject === subject
            );

            // Categorize entries
            const tugasScores: number[] = [];
            const uhScores: number[] = [];
            const utsScores: number[] = [];
            const uasScores: number[] = [];
            const allScores: number[] = [];

            entries.forEach(entry => {
                const val = entry.grades?.[student.id];
                if (typeof val === 'number' && !isNaN(val)) {
                    allScores.push(val);
                    const typeLower = (entry.assessmentType || '').toLowerCase();
                    if (typeLower.startsWith('tugas') || typeLower.startsWith('kuis')) {
                        tugasScores.push(val);
                    } else if (typeLower.startsWith('ulangan harian') || typeLower.startsWith('uh')) {
                        uhScores.push(val);
                    } else if (typeLower.startsWith('uts') || typeLower.startsWith('pts')) {
                        utsScores.push(val);
                    } else if (typeLower.startsWith('uas') || typeLower.startsWith('pas') || typeLower.startsWith('pat')) {
                        uasScores.push(val);
                    } else {
                        tugasScores.push(val);
                    }
                }
            });

            let finalScore: number | null = null;

            if (allScores.length > 0) {
                let wTugas = 20, wUh = 30, wUts = 20, wUas = 30;
                if (typeof window !== 'undefined') {
                    const savedWeights = localStorage.getItem(`bobot_admin_${selectedClassId}_${subject}`) ||
                                         localStorage.getItem(`bobot_guru_${selectedClassId}_${subject}`);
                    if (savedWeights) {
                        try {
                            const parsed = JSON.parse(savedWeights);
                            wTugas = parsed.tugas ?? 20;
                            wUh = parsed.uh ?? 30;
                            wUts = parsed.uts ?? 20;
                            wUas = parsed.uas ?? 30;
                        } catch {}
                    }
                }

                const avgTugas = tugasScores.length > 0 ? tugasScores.reduce((a, b) => a + b, 0) / tugasScores.length : null;
                const avgUh = uhScores.length > 0 ? uhScores.reduce((a, b) => a + b, 0) / uhScores.length : null;
                const avgUts = utsScores.length > 0 ? utsScores.reduce((a, b) => a + b, 0) / utsScores.length : null;
                const avgUas = uasScores.length > 0 ? uasScores.reduce((a, b) => a + b, 0) / uasScores.length : null;

                let totalWeightUsed = 0;
                let weightedSum = 0;

                if (avgTugas !== null) { weightedSum += avgTugas * wTugas; totalWeightUsed += wTugas; }
                if (avgUh !== null) { weightedSum += avgUh * wUh; totalWeightUsed += wUh; }
                if (avgUts !== null) { weightedSum += avgUts * wUts; totalWeightUsed += wUts; }
                if (avgUas !== null) { weightedSum += avgUas * wUas; totalWeightUsed += wUas; }

                if (totalWeightUsed > 0) {
                    finalScore = Math.round(weightedSum / totalWeightUsed);
                } else {
                    finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
                }
            }

            const rawSubjectTps = (currentSchool.tujuanPembelajaran || []).filter(
                tp => tp.subject.toLowerCase() === subject.toLowerCase()
            );
            const tps: typeof rawSubjectTps = [];
            const seenDescsRapor = new Set<string>();
            for (const tp of rawSubjectTps) {
                const key = tp.description.trim().toLowerCase();
                if (!seenDescsRapor.has(key)) {
                    seenDescsRapor.add(key);
                    tps.push(tp);
                }
            }
            const ketuntasan = currentSchool.ketuntasanTP?.[selectedClassId]?.[subject]?.[student.id] || {};

            let deskripsi = '';
            if (tps.length > 0) {
                const tuntasList: string[] = [];
                const perluBimbinganList: string[] = [];

                tps.forEach(tp => {
                    let status = ketuntasan[tp.id];
                    if (!status && finalScore !== null) {
                        status = finalScore >= 75 ? 'tuntas' : 'perlu_bimbingan';
                    }

                    if (status === 'tuntas') {
                        tuntasList.push(tp.description);
                    } else if (status === 'perlu_bimbingan') {
                        perluBimbinganList.push(tp.description);
                    }
                });

                const parts: string[] = [];
                if (tuntasList.length > 0) {
                    parts.push(`Mencapai kompetensi dengan sangat baik dalam hal ${tuntasList.join(', ')}.`);
                }
                if (perluBimbinganList.length > 0) {
                    parts.push(`Perlu peningkatan dalam hal ${perluBimbinganList.join(', ')}.`);
                }

                deskripsi = parts.join(' ');
            }

            if (!deskripsi && finalScore !== null) {
                // Fallback: TP exists but guru hasn't set T/R status yet — use TP descriptions
                if (tps.length > 0) {
                    const allTpDescs = tps.map(tp => tp.description).filter(Boolean);
                    if (allTpDescs.length > 0) {
                        if (finalScore >= 75) {
                            deskripsi = `Mencapai kompetensi dengan sangat baik dalam hal ${allTpDescs.join(', ')}.`;
                        } else {
                            deskripsi = `Perlu peningkatan dalam hal ${allTpDescs.join(', ')}.`;
                        }
                    } else {
                        deskripsi = finalScore >= 75
                            ? 'Mencapai kompetensi dengan sangat baik.'
                            : 'Perlu peningkatan dalam pembelajaran.';
                    }
                } else {
                    // No TPs at all for this subject
                    deskripsi = finalScore >= 75
                        ? 'Mencapai kompetensi dengan sangat baik.'
                        : 'Perlu peningkatan dalam pembelajaran.';
                }
            } else if (!deskripsi) {
                deskripsi = 'Belum ada data penilaian.';
            }

            return {
                subject,
                finalScore,
                deskripsi
            };
        });

        return (
            <div
                key={student.id}
                id={`rapor-card-${student.id}`}
                className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 text-gray-800 bg-white"
            >
                <div className="space-y-6">
                    {/* Kop Sekolah (5 Baris: 3 Baris BOLD, 2 Baris REGULAR) */}
                    <div className="border-b-2 border-gray-800 pb-3 text-center relative flex flex-col items-center justify-center min-h-[120px]">
                        {(raporConfig?.raporLogo || currentSchool.logo) && (
                            <img
                                src={raporConfig?.raporLogo || currentSchool.logo}
                                alt="Logo Sekolah"
                                className="w-28 h-28 object-contain mb-2 md:absolute md:left-2 md:top-1 md:mb-0"
                            />
                        )}
                        <div className="space-y-0.5 leading-tight">
                            {/* Baris 1: BOLD (Tebal & Paling Utama) */}
                            <p className="text-lg md:text-xl font-black uppercase text-gray-800 tracking-wide">
                                {raporConfig?.kopLine1 !== undefined ? raporConfig.kopLine1 : 'PEMERINTAH KOTA DEPOK'}
                            </p>
                            {/* Baris 2: BOLD */}
                            <p className="text-lg md:text-xl font-black uppercase text-gray-900 tracking-wide">
                                {raporConfig?.kopLine2 !== undefined ? raporConfig.kopLine2 : 'DINAS PENDIDIKAN'}
                            </p>
                            {/* Baris 3: BOLD */}
                            <h1 className="text-lg md:text-xl font-black uppercase text-navy-900 tracking-wide">
                                {raporConfig?.kopLine3 !== undefined ? raporConfig.kopLine3 : `SMP NEGERI 20 DEPOK`}
                            </h1>
                            {/* Baris 4: REGULAR */}
                            <p className="text-xs md:text-sm font-normal text-gray-600">
                                {raporConfig?.kopLine4 !== undefined ? raporConfig.kopLine4 : 'Jl. Raya Sawangan No. 20, Pancoran Mas, Kota Depok, Jawa Barat 16436'}
                            </p>
                            {/* Baris 5: REGULAR */}
                            <p className="text-xs md:text-sm font-normal text-gray-600">
                                {raporConfig?.kopLine5 !== undefined ? raporConfig.kopLine5 : 'Website: smpn20depok.sch.id | Email: info@smpn20depok.sch.id'}
                            </p>
                        </div>
                    </div>

                    {/* Judul Laporan Hasil Belajar (Lebih besar dari Identitas Siswa) */}
                    <div className="text-center pt-1 pb-1">
                        <h2 className="text-base md:text-lg font-extrabold uppercase text-navy-900 tracking-wider">
                            {raporConfig?.kopJudul || 'LAPORAN HASIL BELAJAR TENGAH SEMESTER (PTS / STS)'}
                        </h2>
                    </div>

                    {/* Identitas Siswa (Nama Sekolah di Paling Awal, Hapus Jenis Kelamin, Bold Semua & Titik Dua Sejajar) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-xs md:text-sm font-bold text-gray-900">
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-[110px_12px_1fr] items-center">
                                <span className="font-bold text-gray-900">Nama Sekolah</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">{currentSchool.name}</span>
                            </div>
                            <div className="grid grid-cols-[110px_12px_1fr] items-center">
                                <span className="font-bold text-gray-900">Nama Siswa</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">{student.name}</span>
                            </div>
                            <div className="grid grid-cols-[110px_12px_1fr] items-center">
                                <span className="font-bold text-gray-900">NIS / NISN</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">{student.nis || '-'} / {student.nisn || '-'}</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-[110px_12px_1fr] items-center">
                                <span className="font-bold text-gray-900">Kelas</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">{currentClass?.name}</span>
                            </div>
                            <div className="grid grid-cols-[110px_12px_1fr] items-center">
                                <span className="font-bold text-gray-900">Semester</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">{currentSchool.semester || 'Ganjil'}</span>
                            </div>
                            <div className="grid grid-cols-[110px_12px_1fr] items-center">
                                <span className="font-bold text-gray-900">Tahun Ajaran</span>
                                <span className="font-bold text-gray-900">:</span>
                                <span className="font-bold text-gray-900">{currentSchool.tahunAjaran || '2026/2027'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Capaian Hasil Belajar */}
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">A. CAPAIAN HASIL BELAJAR MATA PELAJARAN</h2>
                        <table className="w-full text-xs border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-gray-800">
                                    <th className="border border-gray-300 px-3 py-2 w-10 text-center">No</th>
                                    <th className="border border-gray-300 px-3 py-2 text-left">Mata Pelajaran</th>
                                    <th className="border border-gray-300 px-2 py-2 w-24 text-center">Nilai Akhir</th>
                                    <th className="border border-gray-300 px-3 py-2 text-left">Capaian & Ketuntasan Tujuan Pembelajaran (TP)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectReportData.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="border border-gray-300 px-3 py-2 text-center font-medium">{idx + 1}</td>
                                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-900">{row.subject}</td>
                                        <td className="border border-gray-300 px-2 py-2 text-center font-bold text-navy-800 text-sm">
                                            {row.finalScore !== null ? row.finalScore : '-'}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-gray-700 leading-relaxed">
                                            {row.deskripsi}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Grid Rekap Presensi & Kedisiplinan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* B. Rekap Presensi */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">B. REKAPITULASI PRESENSI</h2>
                            <table className="w-full text-xs border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-800">
                                        <th className="border border-gray-300 px-3 py-2 text-left">Keterangan Kehadiran</th>
                                        <th className="border border-gray-300 px-3 py-2 w-24 text-center">Jumlah Hari</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-300 px-3 py-1.5">Sakit (S)</td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{countS} hari</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-3 py-1.5">Izin (I)</td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{countI} hari</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 px-3 py-1.5">Tanpa Keterangan (Alfa / A)</td>
                                        <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{countA} hari</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* C. Rekap Kedisiplinan (1 Tabel Tunggal Tanpa Predikat) */}
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">C. KEDISIPLINAN & KETERTIBAN</h2>
                            <table className="w-full text-xs border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-800">
                                        <th className="border border-gray-300 px-2 py-1.5 w-8 text-center">No</th>
                                        <th className="border border-gray-300 px-2 py-1.5 w-24 text-center">Tanggal</th>
                                        <th className="border border-gray-300 px-2 py-1.5 text-left">Catatan Pelanggaran</th>
                                        <th className="border border-gray-300 px-2 py-1.5 w-20 text-center">Poin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentViolations.length > 0 ? (
                                        studentViolations.map((v, idx) => (
                                            <tr key={v.id || idx}>
                                                <td className="border border-gray-300 px-2 py-1 text-center font-medium">{idx + 1}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-gray-600">{v.date}</td>
                                                <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-800">{(v as any).violationName || v.type}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-center font-bold text-red-600">+{v.points}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border border-gray-300 px-3 py-2 text-center text-emerald-700 font-medium italic">
                                                Tidak ada catatan pelanggaran (Bersih / Disiplin)
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold">
                                        <td colSpan={3} className="border border-gray-300 px-3 py-2 text-center text-gray-800">
                                            Total Poin Pelanggaran
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-center text-red-600 font-extrabold text-sm">
                                            {totalViolationPoints} Poin
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Lembar Tanda Tangan (Garis TTD Presisi & Lurus 3 Kolom) */}
                    <div className="pt-8 grid grid-cols-3 text-center text-xs gap-4 leading-normal">
                        {/* 1. Orang Tua / Wali Siswa (LEFT) */}
                        <div className="flex flex-col justify-between h-[160px]">
                            <div>
                                <p className="text-gray-600">Mengetahui,</p>
                                <p className="font-semibold text-gray-800">Orang Tua / Wali Siswa</p>
                            </div>
                            <div className="flex-1 flex items-center justify-center" />
                            <div>
                                <p className="font-bold text-gray-900 underline">( ............................................ )</p>
                                <p className="text-[10px] opacity-0 select-none">NIP. -</p>
                            </div>
                        </div>

                        {/* 2. Kepala Sekolah (CENTER) */}
                        <div className="flex flex-col justify-between h-[160px]">
                            <div>
                                <p className="text-gray-600">Mengetahui,</p>
                                <p className="font-semibold text-gray-800">Kepala Sekolah</p>
                            </div>
                            <div className="flex-1 flex items-center justify-center py-1">
                                {raporConfig?.kepalaSekolahTte ? (
                                    <img
                                        src={raporConfig.kepalaSekolahTte}
                                        alt="TTE Kepala Sekolah"
                                        className="max-h-16 object-contain"
                                    />
                                ) : null}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 underline">
                                    {raporConfig?.kepalaSekolahName || `Kepala Sekolah ${currentSchool.name}`}
                                </p>
                                <p className="text-[10px] text-gray-600">
                                    {raporConfig?.kepalaSekolahNip ? `NIP. ${raporConfig.kepalaSekolahNip}` : 'NIP. ....................................'}
                                </p>
                            </div>
                        </div>

                        {/* 3. Wali Kelas (RIGHT) */}
                        <div className="flex flex-col justify-between h-[160px]">
                            <div>
                                <p className="text-gray-600">Depok, {reportDate}</p>
                                <p className="font-semibold text-gray-800">Wali Kelas</p>
                            </div>
                            <div className="flex-1 flex items-center justify-center py-1" />
                            <div>
                                <p className="font-bold text-gray-900 underline">
                                    {walasName}
                                </p>
                                <p className="text-[10px] text-gray-600">
                                    NIP. {walasNip || '....................................'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Print Styles */}
            <style>{`
                @media print {
                    body { background: white !important; font-size: 11pt; color: black !important; }
                    .print\\:hidden { display: none !important; }
                    @page { size: ${pageSizeCss}; margin: ${marginCss}; }
                    .page-break-after-always { page-break-after: always; break-after: page; }
                }
            `}</style>

            {/* Control Bar (Hidden on Print) */}
            <div className="print:hidden bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pilih Kelas</label>
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

                    {!isBulkViewMode && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Pilih Siswa</label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-navy-500 min-w-[220px]"
                            >
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.nis || 'No NIS'})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Mode Toggle */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Mode Tampilan</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setIsBulkViewMode(false)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isBulkViewMode ? 'bg-white text-navy-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Single Siswa
                            </button>
                            <button
                                onClick={() => setIsBulkViewMode(true)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isBulkViewMode ? 'bg-white text-navy-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Seluruh Kelas ({students.length})
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dynamic Single Export PDF Button based on active view mode */}
                    <button
                        onClick={isBulkViewMode ? handleExportBulkPdf : handleExportSinglePdf}
                        disabled={isExporting || (isBulkViewMode ? students.length === 0 : !selectedStudent)}
                        className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer ${isBulkViewMode
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#0f4c81] hover:bg-navy-700 text-white'
                            }`}
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>
                            {isBulkViewMode
                                ? `Ekspor PDF Seluruh Kelas (${students.length} Siswa)`
                                : `Ekspor PDF Rapor (${selectedStudent?.name || 'Siswa'})`}
                        </span>
                    </button>
                </div>
            </div>

            {/* Rapor Content View */}
            {isBulkViewMode ? (
                /* BULK VIEW MODE: Renders all students sequentially */
                <div className="space-y-8">
                    <div className="print:hidden bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center justify-between">
                        <div>
                            <strong>Tampilan Seluruh Siswa Kelas {currentClass?.name} ({students.length} Siswa)</strong>
                            <p className="mt-0.5">Setiap lembar rapor bersih dan terisolasi tanpa elemen antarmuka aplikasi.</p>
                        </div>
                        <button
                            onClick={handleExportBulkPdf}
                            disabled={isExporting}
                            className="bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            Ekspor PDF Seluruh Kelas
                        </button>
                    </div>

                    {students.map((st) => renderRaporCard(st))}
                </div>
            ) : (
                /* SINGLE STUDENT VIEW MODE */
                selectedStudent ? (
                    renderRaporCard(selectedStudent)
                ) : (
                    <div className="bg-white p-12 rounded-xl text-center text-gray-400 border border-gray-200">
                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Pilih siswa untuk menampilkan Rapor Tengah Semester.</p>
                    </div>
                )
            )}
        </div>
    );
}
