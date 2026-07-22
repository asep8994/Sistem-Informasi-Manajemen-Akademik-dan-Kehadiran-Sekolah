export interface AcademicClass {
    id: string;
    name: string;
}

export interface ViolationType {
    id: string;
    name: string;
    points: number;
}

export interface Student {
    id: string;
    classId: string;
    name: string;
    jk: 'L' | 'P';
    nis: string;
    nisn: string;
    parentPhone?: string;
    parentEmail?: string;
}

export interface User {
    id: string;
    username: string;
    password?: string;
    role: 'admin' | 'walas' | 'guru_bk' | 'guru_piket' | 'guru_mapel' | 'superadmin';
    name: string;
    classId?: string; // for walas / guru_mapel
    classes?: string[]; // for guru_mapel assigned classes
    mapelName?: string; // for guru_mapel subject name
}

export interface NotificationConfig {
    channels: 'wa' | 'email' | 'both';
    waTemplateKehadiran: string;
    waTemplatePelanggaran: string;
    emailTemplateKehadiran: string;
    emailTemplatePelanggaran: string;
    waTemplateRekap?: string;
    emailTemplateRekap?: string;
}

export interface NotificationLog {
    id: string;
    studentId: string;
    studentName: string;
    date: string;
    type: 'kehadiran' | 'pelanggaran' | 'rekap';
    details: string;
    recipient: string;
    status: 'terkirim' | 'gagal';
    timestamp: string;
}

export interface ViolationRecord {
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    type: string;
    points: number;
    date: string; // "DD/MM/YYYY, HH.MM.SS" or similar
    reporter: string;
}

export interface GradeEntry {
    id: string;
    classId: string;
    subject: string;
    assessmentType: string; // e.g. "Tugas 1", "UH 1", "UTS", "UAS"
    grades: {
        [studentId: string]: number; // studentId -> score
    };
}

export interface School {
    id: string;
    code: string;
    name: string;
    logo: string; // image path or base64
    npsn: string;
    contactAdmin: string;
    status: 'aktif' | 'menunggu' | 'nonaktif';
    tahunAjaran: string;
    semester: 'Ganjil' | 'Genap';
    classes: AcademicClass[];
    violationTypes: ViolationType[];
    students: Student[];
    absensi: {
        [dateStr: string]: { // "YYYY-MM-DD"
            [studentId: string]: 'H' | 'S' | 'I' | 'A';
        };
    };
    violations: ViolationRecord[];
    absensiMapel: {
        [dateStr: string]: { // "YYYY-MM-DD"
            [classId: string]: {
                [subject: string]: {
                    [studentId: string]: 'H' | 'S' | 'I' | 'A';
                };
            };
        };
    };
    agendaMapel: Array<{
        id: string;
        username: string;
        date: string;
        classId: string;
        className?: string;
        subject: string;
        materi: string;
        catatan: string;
    }>;
    nilaiMapel: GradeEntry[];
    nilaiMapelConfig?: {
        [classId: string]: {
            [subject: string]: string[]; // array of assessment names
        };
    };
    users: User[];
    notificationConfig: NotificationConfig;
    notificationLogs: NotificationLog[];
    historyData?: any;
}

export interface AppData {
    schools: School[];
    superusers: User[];
}
