import { AppData, School, User } from '../types';

export const APP_KEY = 'absensi_tunggal_sekolah_data';

export const defaultData: AppData = {
    schools: [
        {
            id: 's1',
            code: 'SMP20',
            name: 'SMP N 20 Depok',
            logo: '/Logo_20.jpeg',
            npsn: '20123456',
            contactAdmin: '081234567890',
            status: 'aktif',
            tahunAjaran: '2026/2027',
            semester: 'Ganjil',
            classes: [
                { id: 'c1', name: '7-A' },
                { id: 'c2', name: '7-B' },
                { id: 'c3', name: '8-A' }
            ],
            violationTypes: [
                { id: 'vt1', name: 'Terlambat Masuk Sekolah', points: 5 },
                { id: 'vt2', name: 'Atribut Seragam Tidak Lengkap', points: 5 },
                { id: 'vt3', name: 'Rambut Gondrong / Tidak Rapi', points: 10 },
                { id: 'vt4', name: 'Meninggalkan Kelas Tanpa Izin', points: 15 },
                { id: 'vt5', name: 'Tidak Masuk Tanpa Keterangan (Alfa)', points: 5 }
            ],
            students: [
                { id: 'u1', classId: 'c1', name: 'Aulia Putri', jk: 'P', nis: '24001', nisn: '0081234561', parentPhone: '6281234567890', parentEmail: 'parent.aulia@example.com', agama: 'Islam' },
                { id: 'u2', classId: 'c1', name: 'Raka Pratama', jk: 'L', nis: '24002', nisn: '0081234562', parentPhone: '6281234567891', parentEmail: '', agama: 'Islam' },
                { id: 'u3', classId: 'c2', name: 'Satria Ananda', jk: 'L', nis: '24003', nisn: '0081234563', parentPhone: '', parentEmail: '', agama: 'Kristen' },
                { id: 'u4', classId: 'c3', name: 'Intan Sari', jk: 'P', nis: '23001', nisn: '0071234564', parentPhone: '6281234567893', parentEmail: 'parent.intan@example.com', agama: 'Katolik' }
            ],
            absensi: {
                '2026-07-01': { 'u1': 'H', 'u2': 'H' },
                '2026-07-02': { 'u1': 'H', 'u2': 'S' },
                '2026-07-03': { 'u1': 'I', 'u2': 'H' },
                '2026-07-04': { 'u1': 'H', 'u2': 'A' }
            },
            violations: [
                { id: 'v1', studentId: 'u2', studentName: 'Raka Pratama', classId: 'c1', className: '7-A', type: 'Terlambat Masuk Sekolah', points: 5, date: '02/07/2026, 07.15.00', reporter: 'Piket' }
            ],
            absensiMapel: {},
            agendaMapel: [],
            nilaiMapel: [
                { id: 'g1', classId: 'c1', subject: 'Matematika', assessmentType: 'Tugas 1', grades: { 'u1': 85, 'u2': 75 } },
                { id: 'g2', classId: 'c1', subject: 'Matematika', assessmentType: 'UTS', grades: { 'u1': 90, 'u2': 70 } },
                { id: 'g3', classId: 'c1', subject: 'Bahasa Indonesia', assessmentType: 'Tugas 1', grades: { 'u1': 88, 'u2': 80 } },
                { id: 'g4', classId: 'c1', subject: 'Bahasa Indonesia', assessmentType: 'UTS', grades: { 'u1': 92, 'u2': 78 } },
                { id: 'g5', classId: 'c1', subject: 'IPA', assessmentType: 'UTS', grades: { 'u1': 86, 'u2': 72 } }
            ],
            nilaiMapelConfig: {},
            tujuanPembelajaran: [
                { id: 'tp1', classId: 'c1', subject: 'Matematika', code: 'TP 1', description: 'Memahami Aljabar dan Operasi Hitung Dasar' },
                { id: 'tp2', classId: 'c1', subject: 'Matematika', code: 'TP 2', description: 'Menyelesaikan Persamaan Linear Satu Variabel' },
                { id: 'tp3', classId: 'c1', subject: 'Bahasa Indonesia', code: 'TP 1', description: 'Menganalisis Ide Pokok dan Gagasan Dalam Teks Laporan' },
                { id: 'tp4', classId: 'c1', subject: 'IPA', code: 'TP 1', description: 'Memahami Pengukuran dan Klasifikasi Makhluk Hidup' }
            ],
            ketuntasanTP: {
                'c1': {
                    'Matematika': {
                        'u1': { 'tp1': 'tuntas', 'tp2': 'tuntas' },
                        'u2': { 'tp1': 'tuntas', 'tp2': 'perlu_bimbingan' }
                    },
                    'Bahasa Indonesia': {
                        'u1': { 'tp3': 'tuntas' },
                        'u2': { 'tp3': 'tuntas' }
                    },
                    'IPA': {
                        'u1': { 'tp4': 'tuntas' },
                        'u2': { 'tp4': 'perlu_bimbingan' }
                    }
                }
            },
            users: [
                { id: 'usr-admin-s1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin SMP N 20 Depok' },
                { id: 'usr-guru-s1', username: 'guru', password: 'guru123', role: 'guru_mapel', name: 'Guru SMP N 20 Depok', mapelName: 'Matematika', classes: ['c1', 'c2'] },
                { id: 'usr-walas-s1', username: 'walas', password: 'walas123', role: 'walas', classId: 'c1', name: 'Dra. Endang Rahmawati', nip: '19820514 200801 2 015' },
                { id: 'usr-bk-s1', username: 'guru_bk', password: 'bk123', role: 'guru_bk', name: 'Guru BK SMP N 20 Depok' },
                { id: 'usr-piket-s1', username: 'piket', password: 'piket123', role: 'guru_piket', name: 'Guru Piket SMP N 20 Depok' }
            ],
            notificationConfig: {
                channels: 'both',
                waTemplateKehadiran: 'Yth. Orang Tua, menginfokan bahwa {nama_siswa} tercatat {status_kehadiran} pada tanggal {tanggal}.',
                waTemplatePelanggaran: 'Yth. Orang Tua, menginfokan bahwa {nama_siswa} melakukan pelanggaran {nama_pelanggaran} ({poin_pelanggaran} Poin) pada tanggal {tanggal}.',
                emailTemplateKehadiran: 'Yth. Orang Tua,\n\nDengan ini kami informasikan bahwa siswa {nama_siswa} tercatat {status_kehadiran} pada tanggal {tanggal}.\n\nTerima kasih.',
                emailTemplatePelanggaran: 'Yth. Orang Tua,\n\nDengan ini kami informasikan bahwa siswa {nama_siswa} melakukan pelanggaran {nama_pelanggaran} dengan poin penalti {poin_pelanggaran} pada tanggal {tanggal}.\n\nTerima kasih.',
                waTemplateRekap: 'Yth. Orang Tua/Wali dari {nama_siswa} (Kelas {kelas}),\n\nBerikut rekapitulasi presensi & pelanggaran periode {periode}:\n\n📊 PRESENSI:\n{ringkasan_absensi}\n\n⚠️ PELANGGARAN:\n{rincian_pelanggaran}\nTotal Poin: {total_poin_pelanggaran} Poin\n\nTerima kasih.\n-{nama_sekolah}-',
                emailTemplateRekap: 'Yth. Orang Tua/Wali dari {nama_siswa} (Kelas {kelas}),\n\nBerikut laporan rekapitulasi presensi dan pelanggaran siswa periode {periode}:\n\n1. PRESENSI:\n{ringkasan_absensi}\n\n2. PELANGGARAN:\n{rincian_pelanggaran}\nTotal Poin: {total_poin_pelanggaran} Poin\n\nDemikian laporan ini kami sampaikan.\n\nHormat kami,\n{nama_sekolah}'
            },
            notificationLogs: []
        }
    ],
    superusers: [
        { id: 'usr-superadmin', username: 'superadmin', password: 'superadmin123', role: 'superadmin', name: 'Super Administrator' }
    ]
};

// Safe helper to check window defined
const isClient = typeof window !== 'undefined';

export function getRawAppData(): AppData {
    if (!isClient) return defaultData;
    const raw = localStorage.getItem(APP_KEY);
    if (!raw) {
        localStorage.setItem(APP_KEY, JSON.stringify(defaultData));
        return JSON.parse(JSON.stringify(defaultData));
    }
    
    try {
        const parsed = JSON.parse(raw) as AppData;
        
        // Dynamic Migration check: Ensure compatibility with old structures
        if (parsed && !parsed.schools) {
            const oldData = parsed as any;
            const migratedSchool: School = {
                id: 's1',
                code: 'SMP20',
                name: oldData.schoolName || 'SMP N 20 Depok',
                logo: oldData.schoolLogo || '/Logo_20.jpeg',
                npsn: '20123456',
                contactAdmin: '081234567890',
                status: 'aktif',
                tahunAjaran: '2026/2027',
                semester: 'Ganjil',
                classes: oldData.classes || defaultData.schools[0].classes,
                violationTypes: oldData.violationTypes || defaultData.schools[0].violationTypes,
                students: oldData.students || defaultData.schools[0].students,
                absensi: oldData.absensi || {},
                violations: oldData.violations || [],
                absensiMapel: {},
                agendaMapel: [],
                nilaiMapel: [],
                nilaiMapelConfig: {},
                users: oldData.users || defaultData.schools[0].users,
                notificationConfig: defaultData.schools[0].notificationConfig,
                notificationLogs: []
            };
            
            migratedSchool.students.forEach(s => {
                if (!s.parentPhone) s.parentPhone = '';
                if (!s.parentEmail) s.parentEmail = '';
            });

            const newData: AppData = {
                schools: [migratedSchool],
                superusers: defaultData.superusers
            };
            localStorage.setItem(APP_KEY, JSON.stringify(newData));
            return newData;
        }

        // Deep verify sub properties for all schools
        if (parsed.schools) {
            parsed.schools.forEach(s => {
                if (!s.absensiMapel) s.absensiMapel = {};
                if (!s.agendaMapel) s.agendaMapel = [];
                if (!s.nilaiMapel) s.nilaiMapel = [];
                if (!s.nilaiMapelConfig) s.nilaiMapelConfig = {};
                if (!s.tahunAjaran) s.tahunAjaran = '2026/2027';
                if (!s.semester) s.semester = 'Ganjil';
                if (!s.notificationLogs) s.notificationLogs = [];
                if (!s.violations) s.violations = [];
                if (!s.absensi) s.absensi = {};
                if (!s.notificationConfig) s.notificationConfig = { ...defaultData.schools[0].notificationConfig };
                if (!s.notificationConfig.waTemplateRekap) {
                    s.notificationConfig.waTemplateRekap = defaultData.schools[0].notificationConfig.waTemplateRekap;
                }
                if (!s.notificationConfig.emailTemplateRekap) {
                    s.notificationConfig.emailTemplateRekap = defaultData.schools[0].notificationConfig.emailTemplateRekap;
                }
                if (s.logo && !s.logo.startsWith('/') && !s.logo.startsWith('data:') && !s.logo.startsWith('http')) {
                    s.logo = '/' + s.logo;
                }
                
                s.students.forEach(stud => {
                    if (!stud.parentPhone) stud.parentPhone = '';
                    if (!stud.parentEmail) stud.parentEmail = '';
                });
            });
        }
        
        return parsed;
    } catch (e) {
        console.error('Error parsing AppData from localStorage', e);
        return defaultData;
    }
}

export function saveRawAppData(data: AppData): void {
    if (!isClient) return;
    localStorage.setItem(APP_KEY, JSON.stringify(data));
}
