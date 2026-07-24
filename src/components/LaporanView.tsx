'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { FileSpreadsheet, Printer, ShieldAlert, Award, BookOpen, AlertCircle, CheckCircle2, Settings, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
];

export default function LaporanView() {
    const { currentSchool, currentUser, showToast } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [startMonth, setStartMonth] = useState('07');
    const [endMonth, setEndMonth] = useState('07');
    const [filterMode, setFilterMode] = useState<'bulan' | 'tengah-semester' | 'semester'>('bulan');

    // Guru Mapel state
    const [mapelTab, setMapelTab] = useState<'absensi' | 'nilai'>('absensi');
    const [weightTugas, setWeightTugas] = useState<string | number>(20);
    const [weightUh, setWeightUh] = useState<string | number>(30);
    const [weightUts, setWeightUts] = useState<string | number>(20);
    const [weightUas, setWeightUas] = useState<string | number>(30);
    const [weightSaved, setWeightSaved] = useState(false);

    // KKM Ketercapaian threshold
    const [kkmScore, setKkmScore] = useState<string | number>(75);

    useEffect(() => {
        if (typeof window !== 'undefined' && selectedClassId && currentUser) {
            const mapel = currentUser.mapelName || 'Mata Pelajaran';
            const saved = localStorage.getItem(`kkm_${currentUser.username}_${selectedClassId}_${mapel}`);
            setKkmScore(saved ? Number(saved) : 75);

            // Load saved weight config
            const weightKey = `bobot_${currentUser.username}_${selectedClassId}_${mapel}`;
            const savedWeights = localStorage.getItem(weightKey);
            if (savedWeights) {
                try {
                    const parsed = JSON.parse(savedWeights);
                    setWeightTugas(parsed.tugas ?? 20);
                    setWeightUh(parsed.uh ?? 30);
                    setWeightUts(parsed.uts ?? 20);
                    setWeightUas(parsed.uas ?? 30);
                } catch { /* ignore parse error */ }
            } else {
                setWeightTugas(20);
                setWeightUh(30);
                setWeightUts(20);
                setWeightUas(30);
            }
            setWeightSaved(false);
        }
    }, [selectedClassId, currentUser]);

    const handleKkmChange = (val: string) => {
        if (val === '') {
            setKkmScore('');
            return;
        }
        const parsed = parseInt(val, 10);
        const score = isNaN(parsed) ? '' : Math.max(0, Math.min(100, parsed));
        setKkmScore(score);
        if (typeof window !== 'undefined' && currentUser && score !== '') {
            const mapel = currentUser.mapelName || 'Mata Pelajaran';
            localStorage.setItem(`kkm_${currentUser.username}_${selectedClassId}_${mapel}`, String(score));
        }
    };

    useEffect(() => {
        if (!currentSchool || !currentUser) return;
        const classes = currentUser.role === 'walas'
            ? currentSchool.classes.filter(c => c.id === currentUser.classId)
            : currentSchool.classes;

        setSelectedClassId(prev => {
            const isValid = classes.some(c => c.id === prev);
            if (prev && isValid) return prev;
            return classes.length > 0 ? classes[0].id : '';
        });

        const curMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        setStartMonth(prev => prev || curMonth);
        setEndMonth(prev => prev || curMonth);
    }, [currentSchool, currentUser]);

    if (!currentSchool || !currentUser) return null;

    const isAuthorized = ['admin', 'guru_bk', 'walas', 'guru_mapel', 'superadmin'].includes(currentUser.role);
    if (!isAuthorized) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                <p className="text-red-500 font-bold text-sm">Akses Ditolak</p>
                <p className="text-slate-500 text-xs mt-1">Anda tidak memiliki hak akses untuk halaman rekapitulasi data.</p>
            </div>
        );
    }

    const isMapelRole = currentUser.role === 'guru_mapel';
    const mapelName = currentUser.mapelName || 'Mata Pelajaran';

    // Classes assigned to current user
    const classes = currentUser.role === 'walas'
        ? currentSchool.classes.filter(c => c.id === currentUser.classId)
        : isMapelRole
        ? currentSchool.classes.filter(c => (currentUser.classes || []).includes(c.id))
        : currentSchool.classes;

    const activeClassName = currentSchool.classes.find(c => c.id === selectedClassId)?.name || 'Kelas';

    // Helper: Is Date in selected period range
    const isDateInPeriod = (dateStr: string, mode: typeof filterMode, sMonth: string, eMonth: string) => {
        if (!dateStr) return false;
        
        let month = 0;
        const cleanDate = dateStr.split(',')[0].trim();
        
        // Extract all digit sequences from the clean date string
        const numbers = cleanDate.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            const val0 = parseInt(numbers[0], 10);
            const val1 = parseInt(numbers[1], 10);
            
            // Case 1: Year is first (YYYY-MM-DD or YYYY/MM/DD)
            if (numbers[0].length === 4) {
                month = val1;
            } 
            // Case 2: Year is last (DD/MM/YYYY or MM/DD/YYYY)
            else if (numbers[2] && numbers[2].length === 4) {
                const val2 = parseInt(numbers[2], 10);
                if (val0 > 12) {
                    month = val1; // val0 is day, val1 is month
                } else if (val1 > 12) {
                    month = val0; // val1 is day, val0 is month
                } else {
                    // Ambiguous (both <= 12), default to Indonesian format (DD/MM/YYYY)
                    month = val1;
                }
            } else {
                // If it's something like "MM-DD" or similar, fallback
                month = val0;
            }
        }

        // Native Date parser fallback
        if (isNaN(month) || month === 0) {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                if (dateStr.includes('T') || dateStr.length === 10) {
                    month = d.getUTCMonth() + 1;
                } else {
                    month = d.getMonth() + 1;
                }
            }
        }

        if (isNaN(month) || month === 0) return false;

        const start = parseInt(sMonth, 10);
        const end = parseInt(eMonth, 10);

        if (mode === 'bulan') {
            return month >= start && month <= end;
        } else if (mode === 'tengah-semester') {
            const isGenap = [1, 2, 3, 4, 5, 6].includes(start);
            return isGenap ? [1, 2, 3].includes(month) : [7, 8, 9].includes(month);
        } else if (mode === 'semester') {
            const isGenap = [1, 2, 3, 4, 5, 6].includes(start);
            return isGenap ? [1, 2, 3, 4, 5, 6].includes(month) : [7, 8, 9, 10, 11, 12].includes(month);
        }
        return false;
    };

    const currentStudents = currentSchool.students.filter(s => s.classId === selectedClassId);
    currentStudents.sort((a, b) => a.name.localeCompare(b.name));

    // Weight validation
    const totalWeight = Number(weightTugas) + Number(weightUh) + Number(weightUts) + Number(weightUas);
    const isWeightValid = totalWeight === 100;

    // ----------------------------------------------------
    // EXPORTS: CLASS REPORT (EXCEL)
    // ----------------------------------------------------
    const exportAbsensiBulanExcel = () => {
        const txtMonthStart = MONTHS.find(m => m.value === startMonth)?.label || '';
        const txtMonthEnd = MONTHS.find(m => m.value === endMonth)?.label || '';

        const rows: any[][] = [
            [`REKAPITULASI PRESENSI KELAS ${activeClassName.toUpperCase()} (${txtMonthStart.toUpperCase()} S/D ${txtMonthEnd.toUpperCase()})`],
            ['No', 'Nama Siswa', 'JK', 'NIS', 'NISN', 'Hadir', 'Sakit', 'Izin', 'Alfa']
        ];

        currentStudents.forEach((student, idx) => {
            const attendanceItems = Object.entries(currentSchool.absensi)
                .filter(([date]) => isDateInPeriod(date, filterMode, startMonth, endMonth))
                .map(([, dayData]) => dayData[student.id])
                .filter(Boolean);

            const counts = attendanceItems.reduce((acc, status) => ({
                ...acc,
                [status]: (acc[status] || 0) + 1
            }), { H: 0, S: 0, I: 0, A: 0 });

            rows.push([idx + 1, student.name, student.jk, student.nis || '-', student.nisn || '-', counts.H, counts.S, counts.I, counts.A]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Presensi');
        XLSX.writeFile(wb, `Rekap_Absensi_${activeClassName}_${startMonth}.xlsx`);
        showToast('Laporan Excel Absensi berhasil diunduh.', 'success');
    };

    const exportPelanggaranBulanExcel = () => {
        const txtMonthStart = MONTHS.find(m => m.value === startMonth)?.label || '';
        const txtMonthEnd = MONTHS.find(m => m.value === endMonth)?.label || '';

        const rows: any[][] = [
            [`REKAPITULASI PELANGGARAN KELAS ${activeClassName.toUpperCase()} (${txtMonthStart.toUpperCase()} S/D ${txtMonthEnd.toUpperCase()})`],
            ['No', 'Nama Siswa', 'JK', 'Tanggal', 'Jenis Pelanggaran', 'Poin Penalti']
        ];

        let idx = 1;
        currentStudents.forEach(student => {
            const periodViolations = (currentSchool.violations || []).filter(
                v => v.studentId === student.id && isDateInPeriod(v.date, filterMode, startMonth, endMonth)
            );
            periodViolations.forEach(v => {
                rows.push([idx++, student.name, student.jk, v.date, v.type, v.points]);
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pelanggaran');
        XLSX.writeFile(wb, `Rekap_Pelanggaran_${activeClassName}_${startMonth}.xlsx`);
        showToast('Laporan Excel Pelanggaran berhasil diunduh.', 'success');
    };

    const exportLaporanExcelCombined = () => {
        const txtMonthStart = MONTHS.find(m => m.value === startMonth)?.label || '';
        const txtMonthEnd = MONTHS.find(m => m.value === endMonth)?.label || '';

        const rows: any[][] = [
            [`REKAPITULASI ABSENSI DAN PELANGGARAN KELAS ${activeClassName.toUpperCase()} (${txtMonthStart.toUpperCase()} S/D ${txtMonthEnd.toUpperCase()})`],
            ['No', 'Nama Siswa', 'JK', 'Hadir', 'Sakit', 'Izin', 'Alfa', 'Jenis Pelanggaran', 'Total Poin']
        ];

        currentStudents.forEach((student, idx) => {
            const attendanceItems = Object.entries(currentSchool.absensi)
                .filter(([date]) => isDateInPeriod(date, filterMode, startMonth, endMonth))
                .map(([, dayData]) => dayData[student.id])
                .filter(Boolean);

            const counts = attendanceItems.reduce((acc, status) => ({
                ...acc,
                [status]: (acc[status] || 0) + 1
            }), { H: 0, S: 0, I: 0, A: 0 });

            const periodViolations = (currentSchool.violations || []).filter(
                v => v.studentId === student.id && isDateInPeriod(v.date, filterMode, startMonth, endMonth)
            );
            const points = periodViolations.reduce((sum, item) => sum + item.points, 0);
            const violationCounts: { [type: string]: number } = {};
            periodViolations.forEach(v => {
                violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
            });
            const violationTypes = Object.entries(violationCounts)
                .map(([type, count]) => count > 1 ? `${type} (${count}x)` : type)
                .join(', ') || '-';

            rows.push([idx + 1, student.name, student.jk, counts.H, counts.S, counts.I, counts.A, violationTypes, points]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi');
        XLSX.writeFile(wb, `Laporan_Rekap_${activeClassName}.xlsx`);
        showToast('Laporan Excel Gabungan berhasil diunduh.', 'success');
    };

    // ----------------------------------------------------
    // EXPORTS: GURU MAPEL REPORT (EXCEL)
    // ----------------------------------------------------
    const exportRekapAbsenMapelExcel = () => {
        const txtMonthStart = MONTHS.find(m => m.value === startMonth)?.label || '';
        const txtMonthEnd = MONTHS.find(m => m.value === endMonth)?.label || '';
        const periodStr = startMonth === endMonth ? txtMonthStart : `${txtMonthStart} - ${txtMonthEnd}`;
        
        const rows: any[][] = [
            [`REKAP ABSENSI MATA PELAJARAN: ${mapelName.toUpperCase()}`],
            [`Kelas: ${activeClassName} | Periode: ${periodStr} | TA: ${currentSchool.tahunAjaran} (${currentSchool.semester})`],
            ['No', 'Nama Siswa', 'JK', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alfa (A)', 'Persentase Kehadiran']
        ];

        const absData = currentSchool.absensiMapel || {};

        currentStudents.forEach((student, idx) => {
            let H = 0, S = 0, I = 0, A = 0;
            let totalPertemuan = 0;

            Object.keys(absData).forEach(dateStr => {
                if (isDateInPeriod(dateStr, 'bulan', startMonth, endMonth)) {
                    const status = absData[dateStr]?.[selectedClassId]?.[mapelName]?.[student.id];
                    if (status) {
                        totalPertemuan++;
                        if (status === 'H') H++;
                        if (status === 'S') S++;
                        if (status === 'I') I++;
                        if (status === 'A') A++;
                    }
                }
            });

            const percent = totalPertemuan > 0 ? Math.round((H / totalPertemuan) * 100) : 100;
            rows.push([idx + 1, student.name, student.jk, H, S, I, A, `${percent}%`]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absen Mapel');
        XLSX.writeFile(wb, `Rekap_Absen_Mapel_${mapelName}_${activeClassName}_${startMonth === endMonth ? startMonth : startMonth + '_ke_' + endMonth}.xlsx`);
        showToast('Rekap Absen Mapel berhasil diekspor ke Excel.', 'success');
    };

    const exportRekapNilaiMapelExcel = () => {
        if (!isWeightValid) {
            showToast('Atur bobot nilai dengan valid (100%) terlebih dahulu!', 'warning');
            return;
        }

        const wt = Number(weightTugas) || 0;
        const wh = Number(weightUh) || 0;
        const wuts = Number(weightUts) || 0;
        const wuas = Number(weightUas) || 0;

        const defaultAssessments = ['Tugas 1', 'Tugas 2', 'Tugas 3', 'Ulangan Harian 1', 'Ulangan Harian 2', 'UTS', 'UAS'];
        const list = currentSchool.nilaiMapelConfig?.[selectedClassId]?.[mapelName] || defaultAssessments;

        const tugasList = list.filter(name => name.toLowerCase().startsWith('tugas') || name.toLowerCase().startsWith('kuis'));
        const uhList = list.filter(name => name.toLowerCase().startsWith('ulangan harian') || name.toLowerCase().startsWith('uh'));
        const utsList = list.filter(name => name.toLowerCase().startsWith('uts'));
        const uasList = list.filter(name => name.toLowerCase().startsWith('uas'));

        const headerRow = ['No', 'Nama Siswa', 'JK'];
        tugasList.forEach(t => headerRow.push(t));
        headerRow.push('Rata-rata Tugas');
        uhList.forEach(u => headerRow.push(u));
        headerRow.push('Rata-rata UH');
        utsList.forEach(ut => headerRow.push(ut));
        uasList.forEach(ua => headerRow.push(ua));
        headerRow.push('Nilai Akhir');
        headerRow.push('Ketercapaian');

        const rows: any[][] = [
            [`REKAP NILAI MATA PELAJARAN: ${mapelName.toUpperCase()}`],
            [`Kelas: ${activeClassName} | Bobot - Tugas: ${wt}%, UH: ${wh}%, UTS: ${wuts}%, UAS: ${wuas}% | KKM Ketercapaian: ${kkmScore}`],
            headerRow
        ];

        const gradesDb = currentSchool.nilaiMapel || [];

        currentStudents.forEach((student, idx) => {
            const studentRow: any[] = [idx + 1, student.name, student.jk];

            const getScore = (assessmentName: string) => {
                const record = gradesDb.find(n => n.classId === selectedClassId && n.subject === mapelName && n.assessmentType === assessmentName);
                if (record?.grades?.[student.id] !== undefined) {
                    return Number(record.grades[student.id]);
                }
                return null;
            };

            // Tugas
            let sumTugas = 0, countTugas = 0;
            tugasList.forEach(t => {
                const sc = getScore(t);
                if (sc !== null) {
                    sumTugas += sc;
                    countTugas++;
                    studentRow.push(sc);
                } else {
                    studentRow.push('-');
                }
            });
            const avgTugas = countTugas > 0 ? Math.round(sumTugas / countTugas) : 0;
            studentRow.push(avgTugas);

            // UH
            let sumUh = 0, countUh = 0;
            uhList.forEach(uh => {
                const sc = getScore(uh);
                if (sc !== null) {
                    sumUh += sc;
                    countUh++;
                    studentRow.push(sc);
                } else {
                    studentRow.push('-');
                }
            });
            const avgUh = countUh > 0 ? Math.round(sumUh / countUh) : 0;
            studentRow.push(avgUh);

            // UTS
            let sumUts = 0, countUts = 0;
            utsList.forEach(uts => {
                const sc = getScore(uts);
                if (sc !== null) {
                    sumUts += sc;
                    countUts++;
                    studentRow.push(sc);
                } else {
                    studentRow.push('-');
                }
            });
            const avgUts = countUts > 0 ? Math.round(sumUts / countUts) : 0;

            // UAS
            let sumUas = 0, countUas = 0;
            uasList.forEach(uas => {
                const sc = getScore(uas);
                if (sc !== null) {
                    sumUas += sc;
                    countUas++;
                    studentRow.push(sc);
                } else {
                    studentRow.push('-');
                }
            });
            const avgUas = countUas > 0 ? Math.round(sumUas / countUas) : 0;

            const finalScore = Math.round(
                (avgTugas * wt / 100) + 
                (avgUh * wh / 100) + 
                (avgUts * wuts / 100) + 
                (avgUas * wuas / 100)
            );
            studentRow.push(finalScore);

            const ketercapaian = finalScore >= (Number(kkmScore) || 0) ? 'T' : 'R';
            studentRow.push(ketercapaian);

            rows.push(studentRow);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilas Mapel');
        XLSX.writeFile(wb, `Rekap_Nilai_Mapel_${mapelName}_${activeClassName}.xlsx`);
        showToast('Rekap Nilai Mapel berhasil diekspor ke Excel.', 'success');
    };

    const handleExportPDF = async () => {
        showToast('Menyiapkan dokumen PDF...', 'info');
        
        let container: HTMLDivElement | null = null;
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const headerSrc = document.getElementById('pdf-header-document');
            const tableSrc = document.getElementById('pdf-print-area');

            if (!headerSrc || !tableSrc) {
                showToast('Gagal memuat area laporan.', 'danger');
                return;
            }

            // Create temporary container
            container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '800px'; // fixed width for rendering
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '24px';
            container.style.boxSizing = 'border-box';

            const headerClone = headerSrc.cloneNode(true) as HTMLElement;
            headerClone.classList.remove('hidden', 'print:block');
            headerClone.style.display = 'block';

            const tableClone = tableSrc.cloneNode(true) as HTMLElement;
            tableClone.classList.remove('print:border-none', 'print:shadow-none');
            tableClone.style.border = '1px solid #e2e8f0';
            tableClone.style.boxShadow = 'none';

            container.appendChild(headerClone);
            container.appendChild(tableClone);
            document.body.appendChild(container);

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const monthLabel = MONTHS.find(m => m.value === startMonth)?.label || 'Bulan';
            pdf.save(`Laporan_Absensi_Kelas_${activeClassName}_${monthLabel}.pdf`);
            showToast('Laporan berhasil diekspor ke PDF!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Gagal mengekspor laporan ke PDF.', 'danger');
        } finally {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERING: REKAP GURU MATA PELAJARAN
    // ----------------------------------------------------
    if (isMapelRole) {
        const absData = currentSchool.absensiMapel || {};
        const gradesDb = currentSchool.nilaiMapel || [];

        const defaultAssessments = ['Tugas 1', 'Tugas 2', 'Tugas 3', 'Ulangan Harian 1', 'Ulangan Harian 2', 'UTS', 'UAS'];
        const list = currentSchool.nilaiMapelConfig?.[selectedClassId]?.[mapelName] || defaultAssessments;

        const tugasList = list.filter(name => name.toLowerCase().startsWith('tugas') || name.toLowerCase().startsWith('kuis'));
        const uhList = list.filter(name => name.toLowerCase().startsWith('ulangan harian') || name.toLowerCase().startsWith('uh'));
        const utsList = list.filter(name => name.toLowerCase().startsWith('uts'));
        const uasList = list.filter(name => name.toLowerCase().startsWith('uas'));

        return (
            <div className="space-y-6 print:space-y-4 print:p-0">
                {/* Control Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Kelas</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            >
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                ))}
                            </select>
                        </div>

                        {mapelTab === 'absensi' && (
                            <>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulan Awal</label>
                                    <select
                                        value={startMonth}
                                        onChange={(e) => setStartMonth(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulan Akhir</label>
                                    <select
                                        value={endMonth}
                                        onChange={(e) => setEndMonth(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    >
                                        {MONTHS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={mapelTab === 'absensi' ? exportRekapAbsenMapelExcel : exportRekapNilaiMapelExcel}
                            disabled={mapelTab === 'nilai' && !isWeightValid}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 text-white font-bold text-xs py-2 px-4 transition-all shadow-sm active:scale-[0.98]"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Ekspor Excel</span>
                        </button>
                    </div>
                </div>

                {/* Subject Tab Selection */}
                <div className="flex border-b border-slate-200 print:hidden">
                    <button
                        onClick={() => setMapelTab('absensi')}
                        className={`py-3 px-6 text-xs font-bold transition-all border-b-2 ${mapelTab === 'absensi' ? 'border-[#0f4c81] text-[#0f4c81]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <BookOpen className="h-4 w-4 inline-block mr-1.5 mt-[-2px]" />
                        Rekap Absensi Mapel
                    </button>
                    <button
                        onClick={() => setMapelTab('nilai')}
                        className={`py-3 px-6 text-xs font-bold transition-all border-b-2 ${mapelTab === 'nilai' ? 'border-[#0f4c81] text-[#0f4c81]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Award className="h-4 w-4 inline-block mr-1.5 mt-[-2px]" />
                        Rekap Nilai Mapel
                    </button>
                </div>

                {/* TAB 1: REKAP ABSENSI MAPEL */}
                {mapelTab === 'absensi' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                        <th className="py-3 px-4 w-12 text-center">No</th>
                                        <th className="py-3 px-4">Nama Siswa</th>
                                        <th className="py-3 px-4 text-center w-20">JK</th>
                                        <th className="py-3 px-4 text-center text-emerald-600 w-24">Hadir</th>
                                        <th className="py-3 px-4 text-center text-amber-500 w-24">Sakit</th>
                                        <th className="py-3 px-4 text-center text-cyan-600 w-24">Izin</th>
                                        <th className="py-3 px-4 text-center text-rose-500 w-24">Alfa</th>
                                        <th className="py-3 px-4 text-center w-36">Rasio Kehadiran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                    {currentStudents.map((student, idx) => {
                                        let H = 0, S = 0, I = 0, A = 0;
                                        let totalPertemuan = 0;

                                        Object.keys(absData).forEach(dateStr => {
                                            if (isDateInPeriod(dateStr, 'bulan', startMonth, endMonth)) {
                                                const status = absData[dateStr]?.[selectedClassId]?.[mapelName]?.[student.id];
                                                if (status) {
                                                    totalPertemuan++;
                                                    if (status === 'H') H++;
                                                    if (status === 'S') S++;
                                                    if (status === 'I') I++;
                                                    if (status === 'A') A++;
                                                }
                                            }
                                        });

                                        const percent = totalPertemuan > 0 ? Math.round((H / totalPertemuan) * 100) : 100;
                                        const badgeColor = percent >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : percent >= 60 ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-rose-50 text-rose-500 border border-rose-100';

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-slate-400 text-center">{idx + 1}</td>
                                                <td className="py-3 px-4 font-bold text-slate-800">{student.name}</td>
                                                <td className="py-3 px-4 text-center font-bold text-slate-500">{student.jk}</td>
                                                <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{H || '—'}</td>
                                                <td className="py-3 px-4 text-center text-amber-500 font-medium">{S || '—'}</td>
                                                <td className="py-3 px-4 text-center text-cyan-600 font-medium">{I || '—'}</td>
                                                <td className="py-3 px-4 text-center text-rose-500 font-semibold">{A || '—'}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                                                        {percent}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {currentStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center text-slate-400 py-8">
                                                Belum ada data siswa di kelas ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: REKAP NILAI MAPEL */}
                {mapelTab === 'nilai' && (
                    <div className="space-y-6">
                        {/* Weight Configurations card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 print:hidden">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Settings className="h-4 w-4 text-cyan-600" />
                                    <span>Konfigurasi Bobot Kategori Nilai</span>
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Tentukan pembobotan penilaian evaluasi siswa untuk mata pelajaran ini (Total harus 100%).</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot Tugas (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weightTugas}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') setWeightTugas('');
                                            else {
                                                const parsed = parseInt(val, 10);
                                                setWeightTugas(isNaN(parsed) ? '' : parsed);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot UH (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weightUh}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') setWeightUh('');
                                            else {
                                                const parsed = parseInt(val, 10);
                                                setWeightUh(isNaN(parsed) ? '' : parsed);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot UTS (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weightUts}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') setWeightUts('');
                                            else {
                                                const parsed = parseInt(val, 10);
                                                setWeightUts(isNaN(parsed) ? '' : parsed);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot UAS (%)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weightUas}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') setWeightUas('');
                                            else {
                                                const parsed = parseInt(val, 10);
                                                setWeightUas(isNaN(parsed) ? '' : parsed);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-bold text-cyan-600 mb-1">KKM Ketercapaian</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={kkmScore}
                                        onChange={(e) => handleKkmChange(e.target.value)}
                                        className="w-full rounded-lg border border-cyan-200 bg-cyan-50/30 py-1.5 px-3 text-xs font-bold text-cyan-800 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Save button & Verification info bar */}
                            <div className="pt-2 space-y-3">
                                <button
                                    type="button"
                                    disabled={!isWeightValid}
                                    onClick={() => {
                                        if (!isWeightValid) {
                                            showToast('Total bobot harus tepat 100% sebelum menyimpan!', 'warning');
                                            return;
                                        }
                                        if (typeof window !== 'undefined' && currentUser && selectedClassId) {
                                            const mapel = currentUser.mapelName || 'Mata Pelajaran';
                                            const weightKey = `bobot_${currentUser.username}_${selectedClassId}_${mapel}`;
                                            localStorage.setItem(weightKey, JSON.stringify({
                                                tugas: Number(weightTugas),
                                                uh: Number(weightUh),
                                                uts: Number(weightUts),
                                                uas: Number(weightUas)
                                            }));
                                            setWeightSaved(true);
                                            showToast('Konfigurasi bobot nilai berhasil disimpan!', 'success');
                                        }
                                    }}
                                    className="w-full rounded-lg bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                                >
                                    Simpan Perubahan Bobot
                                </button>

                                {isWeightValid ? (
                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-600">
                                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                                        <span>Persentase bobot valid (Akumulasi: {totalWeight}%). {weightSaved ? 'Perubahan tersimpan.' : 'Klik tombol di atas untuk menyimpan.'}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-600">
                                        <AlertCircle className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                                        <span>Akumulasi bobot tidak valid ({totalWeight}%). Jumlah persentase bobot tugas, UH, UTS, dan UAS harus tepat 100%!</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grades Grid Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                            <th className="py-3 px-4 w-12 text-center">No</th>
                                            <th className="py-3 px-4">Nama Siswa</th>
                                            <th className="py-3 px-4 text-center w-16">JK</th>
                                            {tugasList.map(t => (
                                                <th key={t} className="py-3 px-3 text-center text-slate-500 font-semibold">{t}</th>
                                            ))}
                                            <th className="py-3 px-3 text-center text-cyan-700 bg-cyan-50/50 font-bold">Rerata Tugas</th>
                                            {uhList.map(u => (
                                                <th key={u} className="py-3 px-3 text-center text-slate-500 font-semibold">{u}</th>
                                            ))}
                                            <th className="py-3 px-3 text-center text-amber-600 bg-amber-50/50 font-bold">Rerata UH</th>
                                            {utsList.map(ut => (
                                                <th key={ut} className="py-3 px-3 text-center text-slate-500 font-semibold">{ut}</th>
                                            ))}
                                            {uasList.map(ua => (
                                                <th key={ua} className="py-3 px-3 text-center text-slate-500 font-semibold">{ua}</th>
                                            ))}
                                            <th className="py-3 px-4 text-center text-white bg-emerald-600 font-bold">Nilai Akhir</th>
                                            <th className="py-3 px-4 text-center text-white bg-cyan-700 font-bold">Ketercapaian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                        {currentStudents.map((student, idx) => {
                                            const getScore = (assessmentName: string) => {
                                                const record = gradesDb.find(n => n.classId === selectedClassId && n.subject === mapelName && n.assessmentType === assessmentName);
                                                if (record?.grades?.[student.id] !== undefined) {
                                                    return Number(record.grades[student.id]);
                                                }
                                                return null;
                                            };

                                            // Calc averages
                                            let sumTugas = 0, countTugas = 0;
                                            const cellsTugas = tugasList.map(t => {
                                                const sc = getScore(t);
                                                if (sc !== null) {
                                                    sumTugas += sc;
                                                    countTugas++;
                                                    return <td key={t} className="py-3 px-3 text-center font-medium">{sc}</td>;
                                                }
                                                return <td key={t} className="py-3 px-3 text-center text-slate-300">—</td>;
                                            });
                                            const avgTugas = countTugas > 0 ? Math.round(sumTugas / countTugas) : 0;

                                            let sumUh = 0, countUh = 0;
                                            const cellsUh = uhList.map(u => {
                                                const sc = getScore(u);
                                                if (sc !== null) {
                                                    sumUh += sc;
                                                    countUh++;
                                                    return <td key={u} className="py-3 px-3 text-center font-medium">{sc}</td>;
                                                }
                                                return <td key={u} className="py-3 px-3 text-center text-slate-300">—</td>;
                                            });
                                            const avgUh = countUh > 0 ? Math.round(sumUh / countUh) : 0;

                                            let sumUts = 0, countUts = 0;
                                            const cellsUts = utsList.map(ut => {
                                                const sc = getScore(ut);
                                                if (sc !== null) {
                                                    sumUts += sc;
                                                    countUts++;
                                                    return <td key={ut} className="py-3 px-3 text-center font-medium">{sc}</td>;
                                                }
                                                return <td key={ut} className="py-3 px-3 text-center text-slate-300">—</td>;
                                            });
                                            const avgUts = countUts > 0 ? Math.round(sumUts / countUts) : 0;

                                            let sumUas = 0, countUas = 0;
                                            const cellsUas = uasList.map(ua => {
                                                const sc = getScore(ua);
                                                if (sc !== null) {
                                                    sumUas += sc;
                                                    countUas++;
                                                    return <td key={ua} className="py-3 px-3 text-center font-medium">{sc}</td>;
                                                }
                                                return <td key={ua} className="py-3 px-3 text-center text-slate-300">—</td>;
                                            });
                                            const avgUas = countUas > 0 ? Math.round(sumUas / countUas) : 0;

                                            const finalScore = Math.round(
                                                (avgTugas * Number(weightTugas) / 100) +
                                                (avgUh * Number(weightUh) / 100) +
                                                (avgUts * Number(weightUts) / 100) +
                                                (avgUas * Number(weightUas) / 100)
                                            );

                                            return (
                                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-slate-400 text-center">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-bold text-slate-800">{student.name}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-slate-500">{student.jk}</td>
                                                    {cellsTugas}
                                                    <td className="py-3 px-3 text-center font-bold text-cyan-700 bg-cyan-50/30">{avgTugas || '0'}</td>
                                                    {cellsUh}
                                                    <td className="py-3 px-3 text-center font-bold text-amber-600 bg-amber-50/30">{avgUh || '0'}</td>
                                                    {cellsUts}
                                                    {cellsUas}
                                                    <td className="py-3 px-4 text-center font-bold text-white bg-emerald-600">{finalScore || '0'}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`inline-flex rounded px-2.5 py-0.5 text-[10px] font-extrabold ${
                                                            finalScore >= (Number(kkmScore) || 0)
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`} title={finalScore >= (Number(kkmScore) || 0) ? 'Tuntas / Tercapai (T)' : 'Remedial / Perlu Ditingkatkan (R)'}>
                                                            {finalScore >= (Number(kkmScore) || 0) ? 'T' : 'R'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {currentStudents.length === 0 && (
                                            <tr>
                                                <td colSpan={6 + tugasList.length + uhList.length + utsList.length + uasList.length} className="text-center text-slate-400 py-8">
                                                    Belum ada data siswa di kelas ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ----------------------------------------------------
    // RENDERING: GENERAL ROLE (ADMIN, BK, WALAS)
    // ----------------------------------------------------
    return (
        <div className="space-y-6 print:p-0">
            {/* Controls panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3 flex-wrap">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipe Rekap</label>
                        <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value as any)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        >
                            <option value="bulan">Bulanan</option>
                            <option value="tengah-semester">Tengah Semester</option>
                            <option value="semester">Semester Akhir</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilih Kelas</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>Kelas {c.name}</option>
                            ))}
                        </select>
                    </div>

                    {filterMode === 'bulan' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulan Awal</label>
                                <select
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                >
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bulan Akhir</label>
                                <select
                                    value={endMonth}
                                    onChange={(e) => setEndMonth(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                >
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={exportAbsensiBulanExcel}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3 transition-all shadow-sm active:scale-[0.98]"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        <span>Ekspor Absensi (XLSX)</span>
                    </button>
                    <button
                        onClick={exportPelanggaranBulanExcel}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3 transition-all shadow-sm active:scale-[0.98]"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-rose-600" />
                        <span>Ekspor Pelanggaran (XLSX)</span>
                    </button>
                    <button
                        onClick={exportLaporanExcelCombined}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 transition-all shadow-sm active:scale-[0.98]"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Gabungan (XLSX)</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 px-3 transition-all shadow-sm active:scale-[0.98]"
                    >
                        <Download className="h-4 w-4 text-white" />
                        <span>Unduh PDF</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0b2f4d] hover:bg-[#102a43] text-white font-bold text-xs py-2 px-3 transition-all shadow-sm active:scale-[0.98]"
                    >
                        <Printer className="h-4 w-4 text-cyan-400" />
                        <span>Cetak Laporan</span>
                    </button>
                </div>
            </div>

            {/* Print Header Document Area */}
            <div id="pdf-header-document" className="hidden print:block bg-white p-4 border-b-2 border-slate-900 mb-6">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 shrink-0 bg-slate-50 p-1 flex items-center justify-center border rounded">
                        <img src={currentSchool.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 text-center">
                        <h2 className="text-sm font-bold uppercase tracking-wide leading-snug">
                            LAPORAN ABSENSI &amp; TATA TERTIB KELAS {activeClassName.toUpperCase()}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                            {currentSchool.name.toUpperCase()} &bull; NPSN: {currentSchool.npsn}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                            Periode Laporan: {MONTHS.find(m => m.value === startMonth)?.label || ''} s/d {MONTHS.find(m => m.value === endMonth)?.label || ''} {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>

            {/* General Report Table Card */}
            <div id="pdf-print-area" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 print:bg-slate-100">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Siswa</th>
                                <th className="py-3 px-4 text-center w-20">JK</th>
                                <th className="py-3 px-4 text-center text-emerald-600 w-20">Hadir</th>
                                <th className="py-3 px-4 text-center text-amber-500 w-20">Sakit</th>
                                <th className="py-3 px-4 text-center text-cyan-600 w-20">Izin</th>
                                <th className="py-3 px-4 text-center text-rose-500 w-20">Alfa</th>
                                <th className="py-3 px-4">Catatan Kejadian Sanksi</th>
                                <th className="py-3 px-4 text-center w-24">Poin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {currentStudents.map((student, idx) => {
                                const attendanceItems = Object.entries(currentSchool.absensi)
                                    .filter(([date]) => isDateInPeriod(date, filterMode, startMonth, endMonth))
                                    .map(([, dayData]) => dayData[student.id])
                                    .filter(Boolean);

                                const counts = attendanceItems.reduce((acc, status) => ({
                                    ...acc,
                                    [status]: (acc[status] || 0) + 1
                                }), { H: 0, S: 0, I: 0, A: 0 });

                                const periodViolations = (currentSchool.violations || []).filter(
                                    v => v.studentId === student.id && isDateInPeriod(v.date, filterMode, startMonth, endMonth)
                                );
                                const points = periodViolations.reduce((sum, item) => sum + item.points, 0);

                                const violationCounts: { [type: string]: number } = {};
                                periodViolations.forEach(v => {
                                    violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
                                });

                                const violationTypes = Object.entries(violationCounts)
                                    .map(([type, count]) => count > 1 ? `${type} (${count}x)` : type)
                                    .join(', ') || '—';

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-400 text-center">{idx + 1}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-800">{student.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">NIS: {student.nis} | NISN: {student.nisn}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-slate-500">{student.jk}</td>
                                        <td className="py-3 px-4 text-center text-emerald-600 font-semibold">{counts.H}</td>
                                        <td className="py-3 px-4 text-center text-amber-500 font-medium">{counts.S}</td>
                                        <td className="py-3 px-4 text-center text-cyan-600 font-medium">{counts.I}</td>
                                        <td className="py-3 px-4 text-center text-rose-500 font-semibold">{counts.A}</td>
                                        <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{violationTypes}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${points > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                                                {points} Poin
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {currentStudents.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-center text-slate-400 py-8">
                                        Tidak ada data siswa aktif.
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
