'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/AppContext';
import { 
    Send, 
    Filter, 
    Calendar, 
    Search, 
    MessageSquare, 
    Mail, 
    CheckCircle2, 
    AlertTriangle, 
    History, 
    User, 
    Users, 
    CheckSquare, 
    RefreshCw, 
    FileText, 
    Eye, 
    X,
    Bell,
    PhoneCall,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { Student, NotificationLog } from '../types';

export default function NotifikasiOrtuaView() {
    const { currentSchool, currentUser, appData, updateAppData, showToast, showConfirm } = useApp();

    const isAuthorized = currentUser && ['admin', 'guru_bk', 'superadmin'].includes(currentUser.role);

    const updateSchoolProperty = (updatedProps: Partial<any>) => {
        if (!appData || !currentSchool) return;
        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, ...updatedProps };
            }
            return sch;
        });
        updateAppData({ ...appData, schools: updatedSchools });
    };

    // Active sub tab: 'send' (Panel Kirim) or 'history' (Histori Log)
    const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

    // Filters
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [datePreset, setDatePreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
    
    // Custom date range (default to current month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
    const [endDate, setEndDate] = useState<string>(todayStr);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<'all' | 'has_issues' | 'clean'>('all');

    // Preview / Single Send Modal State
    const [previewModalStudent, setPreviewModalStudent] = useState<Student | null>(null);
    const [channelType, setChannelType] = useState<'wa' | 'email'>('wa');
    const [customPhone, setCustomPhone] = useState<string>('');
    const [customEmail, setCustomEmail] = useState<string>('');
    const [customMessage, setCustomMessage] = useState<string>('');

    // Batch send progress / modal
    const [isBatchSending, setIsBatchSending] = useState(false);

    // Helper: Compute Date Range Strings
    const effectiveDateRange = useMemo(() => {
        const curr = new Date();
        if (datePreset === 'today') {
            const dateStr = curr.toISOString().split('T')[0];
            return { start: dateStr, end: dateStr, label: `Hari Ini (${curr.toLocaleDateString('id-ID')})` };
        } else if (datePreset === 'week') {
            const past7 = new Date(curr);
            past7.setDate(curr.getDate() - 7);
            const startStr = past7.toISOString().split('T')[0];
            const endStr = curr.toISOString().split('T')[0];
            return { start: startStr, end: endStr, label: `7 Hari Terakhir (${past7.toLocaleDateString('id-ID')} - ${curr.toLocaleDateString('id-ID')})` };
        } else if (datePreset === 'month') {
            const startStr = firstDayOfMonth;
            const endStr = todayStr;
            return { start: startStr, end: endStr, label: `Bulan Ini (${curr.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})` };
        } else {
            return { start: startDate, end: endDate, label: `Periode (${startDate} s.d. ${endDate})` };
        }
    }, [datePreset, startDate, endDate, firstDayOfMonth, todayStr]);

    if (!currentSchool || !currentUser || !isAuthorized) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Akses Terbatas</h3>
                <p className="text-sm text-slate-500 mt-1">Anda tidak memiliki hak akses untuk membuka Panel Notifikasi Orang Tua.</p>
            </div>
        );
    }

    const classesList = currentSchool.classes || [];
    const studentsList = currentSchool.students || [];

    // Helper: Calculate attendance & violations for a student in date range
    const getStudentRecap = (studentId: string) => {
        let hadir = 0, sakit = 0, izin = 0, alfa = 0;
        const absensiObj = currentSchool.absensi || {};

        // Iterate dates in absensi
        Object.keys(absensiObj).forEach(dateKey => {
            if (dateKey >= effectiveDateRange.start && dateKey <= effectiveDateRange.end) {
                const status = absensiObj[dateKey]?.[studentId];
                if (status === 'H') hadir++;
                else if (status === 'S') sakit++;
                else if (status === 'I') izin++;
                else if (status === 'A') alfa++;
            }
        });

        // Filter violations in date range
        const violations = (currentSchool.violations || []).filter(v => {
            if (v.studentId !== studentId) return false;
            // Parse violation date (Format "DD/MM/YYYY" or "YYYY-MM-DD" or similar)
            let dateStr = v.date;
            if (v.date.includes(',')) dateStr = v.date.split(',')[0].trim();
            if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            return dateStr >= effectiveDateRange.start && dateStr <= effectiveDateRange.end;
        });

        const totalViolationPoints = violations.reduce((sum, v) => sum + (v.points || 0), 0);

        return {
            hadir,
            sakit,
            izin,
            alfa,
            violations,
            totalViolationPoints,
            hasIssues: alfa > 0 || violations.length > 0
        };
    };

    // Compiled message generator for preview
    const generateMessage = (student: Student, channel: 'wa' | 'email', recap: ReturnType<typeof getStudentRecap>) => {
        const studentClass = classesList.find(c => c.id === student.classId)?.name || '-';
        const config = currentSchool.notificationConfig;

        const defaultWaTpl = config?.waTemplateRekap || 
            `Yth. Orang Tua/Wali dari {nama_siswa} (Kelas {kelas}),\n\nBerikut rekapitulasi presensi & pelanggaran periode {periode}:\n\n📊 PRESENSI:\n{ringkasan_absensi}\n\n⚠️ PELANGGARAN:\n{rincian_pelanggaran}\nTotal Poin: {total_poin_pelanggaran} Poin\n\nTerima kasih.\n-{nama_sekolah}-`;
        
        const defaultEmailTpl = config?.emailTemplateRekap || 
            `Yth. Orang Tua/Wali dari {nama_siswa} (Kelas {kelas}),\n\nBerikut laporan rekapitulasi presensi dan pelanggaran siswa periode {periode}:\n\n1. PRESENSI:\n{ringkasan_absensi}\n\n2. PELANGGARAN:\n{rincian_pelanggaran}\nTotal Poin: {total_poin_pelanggaran} Poin\n\nDemikian laporan ini kami sampaikan.\n\nHormat kami,\n{nama_sekolah}`;

        const template = channel === 'wa' ? defaultWaTpl : defaultEmailTpl;

        const ringkasanAbsensi = `- Hadir: ${recap.hadir} hari\n- Sakit: ${recap.sakit} hari\n- Izin: ${recap.izin} hari\n- Alfa: ${recap.alfa} hari`;

        let rincianPelanggaran = '- Tidak ada catatan pelanggaran';
        if (recap.violations.length > 0) {
            rincianPelanggaran = recap.violations.map((v, i) => 
                `${i + 1}. ${v.type} (${v.points} Poin) - Tgl: ${v.date}`
            ).join('\n');
        }

        return template
            .replace(/{nama_siswa}/g, student.name)
            .replace(/{kelas}/g, studentClass)
            .replace(/{nis}/g, student.nis || '-')
            .replace(/{periode}/g, effectiveDateRange.label)
            .replace(/{ringkasan_absensi}/g, ringkasanAbsensi)
            .replace(/{rincian_pelanggaran}/g, rincianPelanggaran)
            .replace(/{total_poin_pelanggaran}/g, recap.totalViolationPoints.toString())
            .replace(/{nama_sekolah}/g, currentSchool.name);
    };

    // Filter students list
    const filteredStudents = useMemo(() => {
        return studentsList.filter(student => {
            // Class filter
            if (selectedClass !== 'all' && student.classId !== selectedClass) return false;
            
            // Search query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = student.name.toLowerCase().includes(q);
                const matchNis = (student.nis || '').includes(q);
                if (!matchName && !matchNis) return false;
            }

            // Category filter
            if (filterCategory !== 'all') {
                const recap = getStudentRecap(student.id);
                if (filterCategory === 'has_issues' && !recap.hasIssues) return false;
                if (filterCategory === 'clean' && recap.hasIssues) return false;
            }

            return true;
        });
    }, [studentsList, selectedClass, searchQuery, filterCategory, effectiveDateRange]);

    // Open Preview Modal
    const handleOpenPreview = (student: Student, defaultChannel: 'wa' | 'email' = 'wa') => {
        const recap = getStudentRecap(student.id);
        const compiled = generateMessage(student, defaultChannel, recap);

        setPreviewModalStudent(student);
        setChannelType(defaultChannel);
        setCustomPhone(student.parentPhone || '');
        setCustomEmail(student.parentEmail || '');
        setCustomMessage(compiled);
    };

    // Handle Send Single Notification
    const handleConfirmSendSingle = (mode: 'wa' | 'email' | 'log_only') => {
        if (!previewModalStudent) return;

        const recipient = mode === 'wa' ? customPhone : (mode === 'email' ? customEmail : (customPhone || customEmail || 'Ortu Siswa'));
        
        if (mode === 'wa' && !customPhone.trim()) {
            showToast('Nomor WhatsApp orang tua belum diisi!', 'warning');
            return;
        }
        if (mode === 'email' && !customEmail.trim()) {
            showToast('Alamat email orang tua belum diisi!', 'warning');
            return;
        }

        // Add to notification logs
        const newLog: NotificationLog = {
            id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            studentId: previewModalStudent.id,
            studentName: previewModalStudent.name,
            date: effectiveDateRange.label,
            type: 'rekap',
            details: customMessage,
            recipient: recipient,
            status: 'terkirim',
            timestamp: new Date().toLocaleString('id-ID')
        };

        const currentLogs = currentSchool.notificationLogs || [];
        updateSchoolProperty({
            notificationLogs: [newLog, ...currentLogs]
        });

        // Trigger action
        if (mode === 'wa') {
            let cleanPhone = customPhone.replace(/[^0-9]/g, '');
            if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
            const encodedText = encodeURIComponent(customMessage);
            window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');
            showToast(`Membuka WhatsApp untuk ${previewModalStudent.name}... Log pengiriman berhasil dicatat.`, 'success');
        } else if (mode === 'email') {
            const subject = encodeURIComponent(`Rekapitulasi Presensi & Pelanggaran - ${previewModalStudent.name}`);
            const body = encodeURIComponent(customMessage);
            window.open(`mailto:${customEmail}?subject=${subject}&body=${body}`, '_blank');
            showToast(`Membuka Email client untuk ${previewModalStudent.name}... Log pengiriman berhasil dicatat.`, 'success');
        } else {
            showToast(`Log notifikasi rekap untuk ${previewModalStudent.name} berhasil dicatat!`, 'success');
        }

        setPreviewModalStudent(null);
    };

    // Handle Batch Log Send for Filtered Students
    const handleBatchSendRecap = () => {
        if (filteredStudents.length === 0) {
            showToast('Tidak ada siswa yang terpilih untuk dikirimkan rekap.', 'warning');
            return;
        }

        showConfirm(
            `Kirim & Catat Rekap Massal (${filteredStudents.length} Siswa)`,
            `Apakah Anda yakin ingin memproses dan mencatat log pengiriman rekapitulasi untuk ${filteredStudents.length} siswa terpilih dalam periode ${effectiveDateRange.label}?`,
            () => {
                setIsBatchSending(true);

                const newLogs: NotificationLog[] = [];
                const nowTimestamp = new Date().toLocaleString('id-ID');

                filteredStudents.forEach(student => {
                    const recap = getStudentRecap(student.id);
                    const msg = generateMessage(student, 'wa', recap);
                    const recipient = student.parentPhone || student.parentEmail || 'Nomor Belum Ada';

                    newLogs.push({
                        id: 'log-batch-' + Date.now() + '-' + student.id,
                        studentId: student.id,
                        studentName: student.name,
                        date: effectiveDateRange.label,
                        type: 'rekap',
                        details: msg,
                        recipient: recipient,
                        status: (student.parentPhone || student.parentEmail) ? 'terkirim' : 'gagal',
                        timestamp: nowTimestamp
                    });
                });

                const currentLogs = currentSchool.notificationLogs || [];
                updateSchoolProperty({
                    notificationLogs: [...newLogs, ...currentLogs]
                });

                setIsBatchSending(false);
                showToast(`Berhasil memproses rekap massal untuk ${filteredStudents.length} siswa! Log berhasil diperbarui.`, 'success');
            }
        );
    };

    // Filtered logs for History Tab
    const historyLogs = useMemo(() => {
        const logs = currentSchool.notificationLogs || [];
        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }, [currentSchool.notificationLogs]);

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0b2f4d] via-[#154670] to-[#102a43] rounded-2xl p-6 text-white shadow-lg border border-slate-700/40 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                    <Bell className="h-56 w-56 text-cyan-200" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold mb-2">
                            <Send className="h-3.5 w-3.5" />
                            <span>Panel Khusus Admin & Guru BK</span>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            Notifikasi Rekap Orang Tua
                        </h1>
                        <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
                            Kirimkan laporan terpadu presensi (hadir, sakit, izin, alfa) & rincian pelanggaran siswa langsung ke WhatsApp atau Email Orang Tua/Wali murid.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                            onClick={() => setActiveTab('send')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                activeTab === 'send'
                                    ? 'bg-white text-[#0b2f4d] shadow-md scale-[1.02]'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Send className="h-4 w-4" />
                            <span>Panel Kirim Rekap</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                activeTab === 'history'
                                    ? 'bg-white text-[#0b2f4d] shadow-md scale-[1.02]'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <History className="h-4 w-4" />
                            <span>Riwayat Log ({historyLogs.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB 1: PANEL KIRIM REKAP */}
            {activeTab === 'send' && (
                <div className="space-y-6">
                    {/* Control Filter Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Filter className="h-4 w-4 text-cyan-600" />
                            <h3 className="text-sm font-bold text-slate-800">Filter & Parameter Rekapitulasi</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Filter Class */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Pilih Kelas
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                >
                                    <option value="all">Semua Kelas ({classesList.length})</option>
                                    {classesList.map(c => (
                                        <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Preset Date Range */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Rentang Waktu Rekap
                                </label>
                                <select
                                    value={datePreset}
                                    onChange={(e) => setDatePreset(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                >
                                    <option value="today">Hari Ini</option>
                                    <option value="week">7 Hari Terakhir</option>
                                    <option value="month">Bulan Ini (Default)</option>
                                    <option value="custom">Rentang Tanggal Kustom</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Status Catatan Siswa
                                </label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                >
                                    <option value="all">Semua Siswa</option>
                                    <option value="has_issues">⚠️ Perlu Perhatian (Ada Alfa / Pelanggaran)</option>
                                    <option value="clean">✅ Nihil Catatan (Presensi Baik)</option>
                                </select>
                            </div>

                            {/* Search Query */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Cari Nama / NIS
                                </label>
                                <div className="relative">
                                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari siswa..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Date Inputs if 'custom' */}
                        {datePreset === 'custom' && (
                            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary info & Batch send button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-cyan-600 shrink-0" />
                                <span>Periode Aktif: <strong className="text-slate-900">{effectiveDateRange.label}</strong> &bull; Terpilih: <strong className="text-cyan-700">{filteredStudents.length} Siswa</strong></span>
                            </div>

                            <button
                                onClick={handleBatchSendRecap}
                                disabled={isBatchSending || filteredStudents.length === 0}
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                <CheckSquare className="h-4 w-4" />
                                <span>Proses Rekap Massal ({filteredStudents.length})</span>
                            </button>
                        </div>
                    </div>

                    {/* Students Recap Table / Cards */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Users className="h-4 w-4 text-cyan-600" />
                                <span>Daftar Siswa & Rekapitulasi Terpadu</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-semibold">Total {filteredStudents.length} Siswa</span>
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                                <Search className="h-10 w-10 mx-auto opacity-30" />
                                <p className="text-sm font-medium">Tidak ada data siswa yang cocok dengan filter di atas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="py-3 px-4">Siswa / Kelas</th>
                                            <th className="py-3 px-4">Presensi Periode Ini</th>
                                            <th className="py-3 px-4">Pelanggaran Periode Ini</th>
                                            <th className="py-3 px-4">Kontak Orang Tua</th>
                                            <th className="py-3 px-4 text-center">Aksi Pengiriman</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredStudents.map(student => {
                                            const studentClass = classesList.find(c => c.id === student.classId)?.name || '-';
                                            const recap = getStudentRecap(student.id);

                                            return (
                                                <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                                                    {/* Student Info */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-900">{student.name}</div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">Kelas {studentClass}</span>
                                                            <span>NIS: {student.nis || '-'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Absensi Summary */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                                                                H: {recap.hadir}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px]">
                                                                S: {recap.sakit}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                                                                I: {recap.izin}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                                                                recap.alfa > 0 
                                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' 
                                                                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                                                            }`}>
                                                                A: {recap.alfa}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Pelanggaran Summary */}
                                                    <td className="py-3.5 px-4">
                                                        {recap.violations.length === 0 ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                <span>Nihil (0 Poin)</span>
                                                            </span>
                                                        ) : (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                                                                    <AlertTriangle className="h-3 w-3 text-rose-600" />
                                                                    <span>{recap.violations.length} Pelanggaran ({recap.totalViolationPoints} Poin)</span>
                                                                </span>
                                                                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1 truncate max-w-xs" title={recap.violations.map(v => v.type).join(', ')}>
                                                                    {recap.violations.map(v => v.type).join(', ')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Parent Contact */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="space-y-0.5 text-[11px]">
                                                            <div className="flex items-center gap-1 text-slate-700 font-semibold">
                                                                <MessageSquare className="h-3 w-3 text-emerald-600" />
                                                                <span>{student.parentPhone || <span className="text-slate-400 italic font-normal">Belum diisi</span>}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-slate-500">
                                                                <Mail className="h-3 w-3 text-cyan-600" />
                                                                <span>{student.parentEmail || <span className="text-slate-400 italic font-normal">Belum diisi</span>}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenPreview(student, 'wa')}
                                                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
                                                                title="Pratinjau & Kirim via WhatsApp"
                                                            >
                                                                <MessageSquare className="h-3.5 w-3.5" />
                                                                <span>Kirim WA</span>
                                                            </button>

                                                            <button
                                                                onClick={() => handleOpenPreview(student, 'email')}
                                                                className="inline-flex items-center gap-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
                                                                title="Pratinjau & Kirim via Email"
                                                            >
                                                                <Mail className="h-3.5 w-3.5" />
                                                                <span>Email</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: RIWAYAT LOG NOTIFIKASI */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-cyan-600" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Riwayat Pengiriman Notifikasi Rekap</h3>
                                <p className="text-xs text-slate-500">Seluruh histori pengiriman notifikasi rekap kepada orang tua siswa.</p>
                            </div>
                        </div>

                        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                            Total {historyLogs.length} Log
                        </span>
                    </div>

                    {historyLogs.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 space-y-2">
                            <FileText className="h-10 w-10 mx-auto opacity-30" />
                            <p className="text-sm font-medium">Belum ada riwayat pengiriman notifikasi rekap.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">Waktu Log</th>
                                        <th className="py-3 px-4">Nama Siswa</th>
                                        <th className="py-3 px-4">Tipe / Periode</th>
                                        <th className="py-3 px-4">Tujuan / Kontak</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4">Detail Pesan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {historyLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                {log.timestamp}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {log.studentName}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                                    log.type === 'rekap' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {log.type}
                                                </span>
                                                <div className="text-[10px] text-slate-500 mt-0.5">{log.date}</div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-700">
                                                {log.recipient}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                                    log.status === 'terkirim'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}>
                                                    {log.status === 'terkirim' ? 'Terkirim / Dicatat' : 'Gagal'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-[11px] text-slate-600 line-clamp-2 max-w-sm" title={log.details}>
                                                    {log.details}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* PREVIEW & SEND MODAL */}
            {previewModalStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-cyan-600" />
                                <h3 className="font-bold text-slate-800 text-base">
                                    Pratinjau Pesan Rekapitulasi
                                </h3>
                            </div>
                            <button
                                onClick={() => setPreviewModalStudent(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Student Summary */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                                <p className="font-bold text-slate-900">{previewModalStudent.name}</p>
                                <p className="text-slate-500 font-medium">NIS: {previewModalStudent.nis || '-'} &bull; Periode: {effectiveDateRange.label}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setChannelType('wa')}
                                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                        channelType === 'wa' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    Format WA
                                </button>
                                <button
                                    onClick={() => setChannelType('email')}
                                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                        channelType === 'email' ? 'bg-cyan-700 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    Format Email
                                </button>
                            </div>
                        </div>

                        {/* Contacts Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Nomor WhatsApp Orang Tua
                                </label>
                                <input
                                    type="text"
                                    value={customPhone}
                                    onChange={(e) => setCustomPhone(e.target.value)}
                                    placeholder="Contoh: 6281234567890"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Email Orang Tua
                                </label>
                                <input
                                    type="email"
                                    value={customEmail}
                                    onChange={(e) => setCustomEmail(e.target.value)}
                                    placeholder="Contoh: parent@example.com"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Editable Text Area */}
                        <div className="flex-1 min-h-[160px] flex flex-col">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                Pratinjau Isi Pesan (Dapat Disesuaikan):
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                rows={8}
                                className="w-full flex-1 bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => handleConfirmSendSingle('log_only')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Catat Log Saja
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleConfirmSendSingle('email')}
                                    className="inline-flex items-center gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                    <Mail className="h-4 w-4" />
                                    <span>Kirim via Email</span>
                                </button>
                                <button
                                    onClick={() => handleConfirmSendSingle('wa')}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Kirim via WA</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
