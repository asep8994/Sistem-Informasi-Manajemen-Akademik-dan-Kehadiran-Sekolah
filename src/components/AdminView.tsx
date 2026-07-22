'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import * as XLSX from 'xlsx';
import { 
    Users, 
    Plus, 
    Pencil, 
    Trash, 
    Upload, 
    CheckCircle2, 
    AlertTriangle, 
    ShieldAlert, 
    UserPlus, 
    Lock,
    Settings,
    FileText,
    History,
    RefreshCw,
    X,
    Building,
    Check,
    AlertCircle,
    Download,
    Search,
    FileSpreadsheet
} from 'lucide-react';
import { School, Student, User, ViolationType, NotificationLog } from '../types';

export default function AdminView() {
    const { 
        currentSchool, 
        currentUser, 
        appData, 
        updateAppData, 
        activePage, 
        showToast, 
        showConfirm 
    } = useApp();

    const [isMounted, setIsMounted] = useState(false);

    // Common modal controls
    const [editClassModal, setEditClassModal] = useState<{ id: string; name: string } | null>(null);
    const [editStudentModal, setEditStudentModal] = useState<Student | null>(null);
    const [editRuleModal, setEditRuleModal] = useState<ViolationType | null>(null);

    // Sub-tab 1: Kelas & Siswa states
    const [newClassName, setNewClassName] = useState('');
    const [newStudentClassId, setNewStudentClassId] = useState('');
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentJk, setNewStudentJk] = useState<'L' | 'P'>('L');
    const [newStudentNis, setNewStudentNis] = useState('');
    const [newStudentNisn, setNewStudentNisn] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    
    // Mass import & Live Search states
    const [massClassId, setMassClassId] = useState('');
    const [massText, setMassText] = useState('');
    const [massParsedRows, setMassParsedRows] = useState<any[]>([]);
    const [massErrors, setMassErrors] = useState<string[]>([]);
    const [adminStudentSearch, setAdminStudentSearch] = useState('');

    const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

                const rows: string[] = [];
                data.forEach((row: any, idx: number) => {
                    if (idx === 0 && typeof row[0] === 'string' && (row[0].toLowerCase().includes('nama') || row[0].toLowerCase().includes('siswa'))) {
                        return; // Skip header
                    }
                    if (row && row.length > 0 && row[0]) {
                        const name = String(row[0] || '').trim();
                        const jk = String(row[1] || '').trim();
                        const nis = String(row[2] || '').trim();
                        const nisn = String(row[3] || '').trim();
                        const phone = String(row[4] || '').trim();
                        const email = String(row[5] || '').trim();

                        if (name) {
                            rows.push(`${name}\t${jk}\t${nis}\t${nisn}\t${phone}\t${email}`);
                        }
                    }
                });

                if (rows.length === 0) {
                    showToast('File Excel tidak berisi data siswa valid!', 'warning');
                    return;
                }

                setMassText(rows.join('\n'));
                showToast(`Berhasil membaca ${rows.length} baris data siswa dari file Excel!`, 'success');
            } catch (err) {
                console.error(err);
                showToast('Gagal membaca file Excel. Pastikan format file benar.', 'danger');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const sampleData = [
            ['Nama Siswa', 'JK (L/P)', 'NIS', 'NISN', 'No HP Ortua (WA)', 'Email Ortua'],
            ['Ahmad Fauzi', 'L', '2026001', '0081234567', '081234567890', 'fauzi.parent@gmail.com'],
            ['Siti Nurhaliza', 'P', '2026002', '0081234568', '081298765432', 'siti.parent@gmail.com'],
            ['Budi Santoso', 'L', '2026003', '0081234569', '085712345678', 'budi.parent@gmail.com']
        ];

        const ws = XLSX.utils.aoa_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
        XLSX.writeFile(wb, 'Template_Import_Siswa_SIMAK_PRO.xlsx');
        showToast('Template Excel berhasil diunduh!', 'success');
    };

    // Sub-tab 2: Referensi Sanksi states
    const [newRuleName, setNewRuleName] = useState('');
    const [newRulePoints, setNewRulePoints] = useState<string | number>(5);

    // Sub-tab 3: Akun Guru & Staf states
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffUser, setNewStaffUser] = useState('');
    const [newStaffPass, setNewStaffPass] = useState('');
    const [newStaffRole, setNewStaffRole] = useState<'walas' | 'guru_bk' | 'guru_piket' | 'guru_mapel' | 'admin'>('guru_piket');
    const [newStaffWalasClassId, setNewStaffWalasClassId] = useState('');
    const [newStaffMapelName, setNewStaffMapelName] = useState('');
    const [newStaffMapelClasses, setNewStaffMapelClasses] = useState<string[]>([]);

    // Sub-tab 4: Konfigurasi states
    const [schoolName, setSchoolName] = useState('');
    const [schoolNpsn, setSchoolNpsn] = useState('');
    const [schoolTahun, setSchoolTahun] = useState('');
    const [schoolSemester, setSchoolSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
    const [schoolLogo, setSchoolLogo] = useState('');

    // New states for year-specific data
    const [newYearTA, setNewYearTA] = useState('');
    const [newYearSemester, setNewYearSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');

    const [notifChannel, setNotifChannel] = useState<'wa' | 'email' | 'both'>('both');
    const [waPresensiTpl, setWaPresensiTpl] = useState('');
    const [waSanksiTpl, setWaSanksiTpl] = useState('');
    const [emailPresensiTpl, setEmailPresensiTpl] = useState('');
    const [emailSanksiTpl, setEmailSanksiTpl] = useState('');
    const [waRekapTpl, setWaRekapTpl] = useState('');
    const [emailRekapTpl, setEmailRekapTpl] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Set configuration values from active school on mount/change
    useEffect(() => {
        if (!currentSchool) return;
        setSchoolName(currentSchool.name);
        setSchoolNpsn(currentSchool.npsn);
        setSchoolTahun(currentSchool.tahunAjaran);
        setSchoolSemester(currentSchool.semester as any);
        setSchoolLogo(currentSchool.logo);

        setNotifChannel(currentSchool.notificationConfig.channels);
        setWaPresensiTpl(currentSchool.notificationConfig.waTemplateKehadiran);
        setWaSanksiTpl(currentSchool.notificationConfig.waTemplatePelanggaran);
        setEmailPresensiTpl(currentSchool.notificationConfig.emailTemplateKehadiran);
        setEmailSanksiTpl(currentSchool.notificationConfig.emailTemplatePelanggaran);
        setWaRekapTpl(currentSchool.notificationConfig.waTemplateRekap || '');
        setEmailRekapTpl(currentSchool.notificationConfig.emailTemplateRekap || '');

        if (currentSchool.classes.length > 0) {
            setNewStudentClassId(currentSchool.classes[0].id);
            setMassClassId(currentSchool.classes[0].id);
            setNewStaffWalasClassId(currentSchool.classes[0].id);
        }
    }, [currentSchool]);

    // Live preview parsing effect for mass text imports
    useEffect(() => {
        if (!massText.trim()) {
            setMassParsedRows([]);
            setMassErrors([]);
            return;
        }

        const lines = massText.split('\n');
        const rows: any[] = [];
        const errors: string[] = [];

        lines.forEach((line, idx) => {
            if (!line.trim()) return;
            const cols = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
            const name = cols[0] ? cols[0].trim() : '';
            let jk = cols[1] ? cols[1].trim().toUpperCase() : '';
            const nis = cols[2] ? cols[2].trim() : '-';
            const nisn = cols[3] ? cols[3].trim() : '-';
            const phone = cols[4] ? cols[4].trim() : '';
            const email = cols[5] ? cols[5].trim() : '';

            let rowError = '';
            if (!name) rowError += 'Nama Kosong. ';
            if (jk !== 'L' && jk !== 'P' && jk !== 'PEREMPUAN' && jk !== 'LAKI-LAKI') {
                rowError += 'JK harus L/P. ';
            }

            if (rowError) {
                errors.push(`Baris ${idx + 1}: ${rowError}`);
            }

            rows.push({
                index: idx + 1,
                name,
                jk: jk === 'PEREMPUAN' || jk === 'P' ? 'P' : 'L',
                nis,
                nisn,
                phone,
                email,
                error: rowError
            });
        });

        setMassParsedRows(rows);
        setMassErrors(errors);
    }, [massText]);

    if (!currentUser || !currentSchool || !appData) return null;

    const updateSchoolProperty = (updatedProps: Partial<School>) => {
        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, ...updatedProps };
            }
            return sch;
        });
        updateAppData({ ...appData, schools: updatedSchools });
    };

    // ----------------------------------------------------
    // CLASS & STUDENT ACTIONS
    // ----------------------------------------------------
    const handleAddClass = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newClassName.trim();
        if (!name) return;

        if (currentSchool.classes.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            showToast('Nama kelas sudah ada!', 'warning');
            return;
        }

        const newClass = { id: `c-${Date.now()}`, name };
        updateSchoolProperty({
            classes: [...currentSchool.classes, newClass]
        });

        setNewClassName('');
        showToast(`Kelas ${name} berhasil ditambahkan!`, 'success');
    };

    const handleDeleteClass = (classId: string, name: string) => {
        showConfirm('Hapus Kelas', `Menghapus Kelas "${name}" akan menghapus permanen seluruh data siswa dan sanksi yang terkait di kelas ini. Lanjutkan?`, () => {
            const classStudents = currentSchool.students.filter(s => s.classId === classId);
            const studentIds = classStudents.map(s => s.id);

            const updatedClasses = currentSchool.classes.filter(c => c.id !== classId);
            const updatedStudents = currentSchool.students.filter(s => s.classId !== classId);
            const updatedViolations = (currentSchool.violations || []).filter(v => !studentIds.includes(v.studentId));

            const cleanAbsensi = { ...currentSchool.absensi };
            Object.keys(cleanAbsensi).forEach(date => {
                studentIds.forEach(id => {
                    delete cleanAbsensi[date][id];
                });
            });

            updateSchoolProperty({
                classes: updatedClasses,
                students: updatedStudents,
                violations: updatedViolations,
                absensi: cleanAbsensi
            });

            showToast(`Kelas ${name} telah dihapus.`, 'info');
        });
    };

    const handleEditClassSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editClassModal) return;

        const updatedClasses = currentSchool.classes.map(c => {
            if (c.id === editClassModal.id) {
                return { ...c, name: editClassModal.name.trim() };
            }
            return c;
        });

        updateSchoolProperty({ classes: updatedClasses });
        setEditClassModal(null);
        showToast('Nama kelas berhasil diperbarui!', 'success');
    };

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newStudentName.trim();
        if (!name || !newStudentClassId) {
            showToast('Nama dan kelas harus diisi!', 'warning');
            return;
        }

        const phone = newStudentPhone.trim();
        const email = newStudentEmail.trim();

        // Simple validation checks
        if (phone && !phone.match(/^(0|62)\d{8,13}$/)) {
            showToast('Nomor HP Orang Tua tidak valid (Gunakan 08xx atau 628xx)!', 'warning');
            return;
        }
        if (email && !email.includes('@')) {
            showToast('Alamat email Orang Tua tidak valid!', 'warning');
            return;
        }

        const newStudent: Student = {
            id: `u-${Date.now()}`,
            classId: newStudentClassId,
            name,
            jk: newStudentJk,
            nis: newStudentNis.trim() || '-',
            nisn: newStudentNisn.trim() || '-',
            parentPhone: phone,
            parentEmail: email
        };

        updateSchoolProperty({
            students: [...currentSchool.students, newStudent]
        });

        setNewStudentName('');
        setNewStudentNis('');
        setNewStudentNisn('');
        setNewStudentPhone('');
        setNewStudentEmail('');
        showToast(`Siswa "${name}" berhasil didaftarkan!`, 'success');
    };

    const handleDeleteStudent = (studentId: string, name: string) => {
        showConfirm('Hapus Siswa', `Hapus siswa "${name}"? Log presensi dan sanksi siswa ini akan dihapus permanen.`, () => {
            const updatedStudents = currentSchool.students.filter(s => s.id !== studentId);
            const updatedViolations = (currentSchool.violations || []).filter(v => v.studentId !== studentId);

            const cleanAbsensi = { ...currentSchool.absensi };
            Object.keys(cleanAbsensi).forEach(date => {
                delete cleanAbsensi[date][studentId];
            });

            updateSchoolProperty({
                students: updatedStudents,
                violations: updatedViolations,
                absensi: cleanAbsensi
            });

            showToast(`Siswa "${name}" telah dihapus.`, 'info');
        });
    };

    const handleEditStudentSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editStudentModal) return;

        const updatedStudents = currentSchool.students.map(s => {
            if (s.id === editStudentModal.id) {
                return editStudentModal;
            }
            return s;
        });

        updateSchoolProperty({ students: updatedStudents });
        setEditStudentModal(null);
        showToast('Data siswa berhasil diperbarui!', 'success');
    };

    const handleMassImport = () => {
        if (!massClassId || !massText.trim()) return;

        if (massErrors.length > 0) {
            showToast('Impor gagal. Perbaiki baris data yang merah terlebih dahulu!', 'danger');
            return;
        }

        const newStudents: Student[] = [];
        massParsedRows.forEach((row, idx) => {
            newStudents.push({
                id: `u-${Date.now()}-${idx}`,
                classId: massClassId,
                name: row.name,
                jk: row.jk,
                nis: row.nis,
                nisn: row.nisn,
                parentPhone: row.phone,
                parentEmail: row.email
            });
        });

        updateSchoolProperty({
            students: [...currentSchool.students, ...newStudents]
        });

        setMassText('');
        showToast(`Berhasil mengimpor ${newStudents.length} data siswa!`, 'success');
    };

    // ----------------------------------------------------
    // REFERENSI SANKSI ACTIONS
    // ----------------------------------------------------
    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newRuleName.trim();
        const pointsNum = Number(newRulePoints);

        if (!name || isNaN(pointsNum) || pointsNum <= 0) {
            showToast('Lengkapi nama dan poin pelanggaran dengan benar!', 'warning');
            return;
        }
 
        if (currentSchool.violationTypes.some(v => v.name.toLowerCase() === name.toLowerCase())) {
            showToast('Jenis pelanggaran sudah terdaftar!', 'warning');
            return;
        }
 
        const newRule = {
            id: `vt-${Date.now()}`,
            name,
            points: pointsNum
        };
 
        updateSchoolProperty({
            violationTypes: [...currentSchool.violationTypes, newRule]
        });
 
        setNewRuleName('');
        setNewRulePoints(5);
        showToast(`Pelanggaran "${name}" berhasil ditambahkan!`, 'success');
    };

    const handleDeleteRule = (id: string, name: string) => {
        showConfirm('Hapus Referensi Sanksi', `Apakah Anda yakin ingin menghapus referensi sanksi "${name}"?`, () => {
            const updated = currentSchool.violationTypes.filter(v => v.id !== id);
            updateSchoolProperty({ violationTypes: updated });
            showToast(`Referensi "${name}" dihapus.`, 'info');
        });
    };

    const handleEditRuleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRuleModal) return;

        const pointsNum = Number(editRuleModal.points);
        if (isNaN(pointsNum) || pointsNum <= 0) {
            showToast('Poin sanksi harus berupa angka lebih besar dari 0!', 'warning');
            return;
        }
 
        const updated = currentSchool.violationTypes.map(v => {
            if (v.id === editRuleModal.id) {
                return { ...editRuleModal, points: pointsNum };
            }
            return v;
        });
 
        updateSchoolProperty({ violationTypes: updated });
        setEditRuleModal(null);
        showToast('Referensi sanksi berhasil diperbarui!', 'success');
    };

    // ----------------------------------------------------
    // STAFF ACCOUNTS ACTIONS
    // ----------------------------------------------------
    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newStaffName.trim();
        const username = newStaffUser.trim().toLowerCase();
        const password = newStaffPass.trim();

        if (!name || !username || !password) {
            showToast('Lengkapi data staf!', 'warning');
            return;
        }

        // Check if username is used in school or superusers
        const usedInSchool = currentSchool.users.some(u => u.username === username);
        const usedInSuper = appData.superusers.some(u => u.username === username);

        if (usedInSchool || usedInSuper) {
            showToast('Username sudah terpakai!', 'warning');
            return;
        }

        const newUser: User = {
            id: `usr-${Date.now()}`,
            username,
            password,
            role: newStaffRole,
            name
        };

        if (newStaffRole === 'walas') {
            newUser.classId = newStaffWalasClassId;
        } else if (newStaffRole === 'guru_mapel') {
            newUser.mapelName = newStaffMapelName.trim() || 'Mata Pelajaran';
            newUser.classes = newStaffMapelClasses;
        }

        updateSchoolProperty({
            users: [...currentSchool.users, newUser]
        });

        setNewStaffName('');
        setNewStaffUser('');
        setNewStaffPass('');
        setNewStaffMapelName('');
        setNewStaffMapelClasses([]);
        showToast(`Akun Staf "${name}" berhasil dibuat!`, 'success');
    };

    const handleDeleteStaff = (id: string, name: string) => {
        showConfirm('Hapus Akun Staf', `Apakah Anda yakin ingin menghapus akun staf "${name}"?`, () => {
            const updated = currentSchool.users.filter(u => u.id !== id);
            updateSchoolProperty({ users: updated });
            showToast(`Akun staf "${name}" telah dihapus.`, 'info');
        });
    };

    // Toggle selected class for Guru Mapel accounts form
    const toggleMapelClassSelection = (classId: string) => {
        if (newStaffMapelClasses.includes(classId)) {
            setNewStaffMapelClasses(newStaffMapelClasses.filter(id => id !== classId));
        } else {
            setNewStaffMapelClasses([...newStaffMapelClasses, classId]);
        }
    };

    // ----------------------------------------------------
    // GENERAL CONFIGURATION ACTIONS
    // ----------------------------------------------------
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSchoolLogo(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveGeneralConfig = (e: React.FormEvent) => {
        e.preventDefault();
        updateSchoolProperty({
            name: schoolName.trim(),
            npsn: schoolNpsn.trim(),
            logo: schoolLogo
        });
        showToast('Profil sekolah berhasil diperbarui!', 'success');
    };

    const handleSwitchYear = (selectedKey: string) => {
        if (!currentSchool || !appData) return;
        const currentKey = `${currentSchool.tahunAjaran}-${currentSchool.semester}`;
        if (selectedKey === currentKey) return;

        const parts = selectedKey.split('-');
        const targetTA = parts[0];
        const targetSem = parts[1] as 'Ganjil' | 'Genap';

        showConfirm(
            'Ganti Tahun Ajaran Aktif',
            `Apakah Anda yakin ingin berganti ke Tahun Ajaran & Semester "${targetTA} (Semester ${targetSem})"? Data aktif saat ini akan diarsipkan secara otomatis.`,
            () => {
                const dataKeys = [
                    'classes',
                    'students',
                    'absensi',
                    'violations',
                    'absensiMapel',
                    'agendaMapel',
                    'nilaiMapel',
                    'nilaiMapelConfig'
                ];

                const historyData = currentSchool.historyData || {};
                historyData[currentKey] = {};
                dataKeys.forEach(key => {
                    historyData[currentKey][key] = JSON.parse(JSON.stringify((currentSchool as any)[key] || (key.endsWith('Config') || key === 'absensi' || key === 'absensiMapel' ? {} : [])));
                });

                let loadedData: any = {};
                if (historyData[selectedKey]) {
                    dataKeys.forEach(key => {
                        loadedData[key] = JSON.parse(JSON.stringify(historyData[selectedKey][key]));
                    });
                } else {
                    loadedData = {
                        classes: [],
                        students: [],
                        absensi: {},
                        violations: [],
                        absensiMapel: {},
                        agendaMapel: [],
                        nilaiMapel: [],
                        nilaiMapelConfig: {}
                    };
                }

                // Update the appData
                const updatedSchools = appData.schools.map(sch => {
                    if (sch.id === currentSchool.id) {
                        return {
                            ...sch,
                            tahunAjaran: targetTA,
                            semester: targetSem,
                            historyData,
                            ...loadedData
                        };
                    }
                    return sch;
                });

                updateAppData({ ...appData, schools: updatedSchools });
                showToast(`Berhasil berpindah ke Tahun Ajaran ${targetTA} (${targetSem})`, 'success');
            }
        );
    };

    const handleCreateNewYear = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSchool || !appData) return;
        const newTA = newYearTA.trim();
        const newSem = newYearSemester;

        if (!newTA) {
            showToast('Tahun Ajaran baru tidak boleh kosong!', 'warning');
            return;
        }

        if (!/^\d{4}\/\d{4}$/.test(newTA)) {
            showToast('Format Tahun Ajaran harus YYYY/YYYY (contoh: 2026/2027)!', 'warning');
            return;
        }

        const newKey = `${newTA}-${newSem}`;
        const currentKey = `${currentSchool.tahunAjaran}-${currentSchool.semester}`;

        if (newKey === currentKey || (currentSchool.historyData && currentSchool.historyData[newKey])) {
            showToast('Tahun Ajaran & Semester tersebut sudah ada!', 'warning');
            return;
        }

        showConfirm(
            'Buat Tahun Ajaran Baru',
            `Apakah Anda yakin ingin membuat dan mengaktifkan Tahun Ajaran & Semester "${newTA} (Semester ${newSem})"? Data aktif saat ini akan diarsipkan, dan Anda akan memulai lembaran baru dengan data kosong.`,
            () => {
                const dataKeys = [
                    'classes',
                    'students',
                    'absensi',
                    'violations',
                    'absensiMapel',
                    'agendaMapel',
                    'nilaiMapel',
                    'nilaiMapelConfig'
                ];

                const historyData = currentSchool.historyData || {};
                historyData[currentKey] = {};
                dataKeys.forEach(key => {
                    historyData[currentKey][key] = JSON.parse(JSON.stringify((currentSchool as any)[key] || (key.endsWith('Config') || key === 'absensi' || key === 'absensiMapel' ? {} : [])));
                });

                // Initialize empty active properties
                const freshData = {
                    classes: [],
                    students: [],
                    absensi: {},
                    violations: [],
                    absensiMapel: {},
                    agendaMapel: [],
                    nilaiMapel: [],
                    nilaiMapelConfig: {}
                };

                // Save to historyData as well
                historyData[newKey] = {};
                dataKeys.forEach(key => {
                    historyData[newKey][key] = JSON.parse(JSON.stringify((freshData as any)[key]));
                });

                const updatedSchools = appData.schools.map(sch => {
                    if (sch.id === currentSchool.id) {
                        return {
                            ...sch,
                            tahunAjaran: newTA,
                            semester: newSem,
                            historyData,
                            ...freshData
                        };
                    }
                    return sch;
                });

                updateAppData({ ...appData, schools: updatedSchools });
                setNewYearTA('');
                showToast(`Tahun Ajaran Baru ${newTA} (${newSem}) berhasil diaktifkan!`, 'success');
            }
        );
    };

    const handleSaveNotificationConfig = (e: React.FormEvent) => {
        e.preventDefault();
        updateSchoolProperty({
            notificationConfig: {
                channels: notifChannel,
                waTemplateKehadiran: waPresensiTpl,
                waTemplatePelanggaran: waSanksiTpl,
                emailTemplateKehadiran: emailPresensiTpl,
                emailTemplatePelanggaran: emailSanksiTpl,
                waTemplateRekap: waRekapTpl,
                emailTemplateRekap: emailRekapTpl
            }
        });
        showToast('Template & pengaturan notifikasi berhasil diperbarui!', 'success');
    };

    // FE-26: Resend failed notifications
    const handleResendLog = (logId: string) => {
        const logIdx = currentSchool.notificationLogs.findIndex(l => l.id === logId);
        if (logIdx === -1) return;

        const log = currentSchool.notificationLogs[logIdx];
        const student = currentSchool.students.find(s => s.id === log.studentId);

        if (!student) {
            showToast('Data siswa terkait log ini sudah dihapus.', 'danger');
            return;
        }

        const phone = student.parentPhone || '';
        const email = student.parentEmail || '';

        let resendSuccess = false;
        let newRecipient = 'Tidak ada kontak';

        if (notifChannel === 'wa' && phone.trim()) {
            resendSuccess = true;
            newRecipient = phone;
        } else if (notifChannel === 'email' && email.trim()) {
            resendSuccess = true;
            newRecipient = email;
        } else if (notifChannel === 'both') {
            if (phone.trim() || email.trim()) {
                resendSuccess = true;
                newRecipient = phone.trim() ? phone : email;
            }
        }

        const updatedLogs = [...currentSchool.notificationLogs];
        if (resendSuccess) {
            updatedLogs[logIdx] = {
                ...log,
                status: 'terkirim',
                recipient: newRecipient,
                timestamp: new Date().toLocaleString('id-ID')
            };
            showToast('Notifikasi berhasil dikirim ulang!', 'success');
        } else {
            showToast('Gagal mengirim ulang: Atur nomor WA / email orang tua terlebih dahulu.', 'warning');
        }

        updateSchoolProperty({ notificationLogs: updatedLogs });
    };

    // ----------------------------------------------------
    // RENDER DETERMINATION
    // ----------------------------------------------------

    // SUB-TAB: KELAS & SISWA
    if (activePage === 'admin-siswa') {
        const sortedClasses = [...currentSchool.classes].sort((a, b) => a.name.localeCompare(b.name));
        const sortedStudents = [...currentSchool.students].sort((a, b) => a.name.localeCompare(b.name));

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Panel management Kelas */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Building className="h-4.5 w-4.5 text-cyan-600" />
                                <span>Manajemen Kelas</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Tambah dan hapus kelas yang terdaftar.</p>
                        </div>

                        <form onSubmit={handleAddClass} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Misal: 7-A"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-1.5 px-3 transition-all active:scale-[0.98]"
                            >
                                Tambah
                            </button>
                        </form>

                        <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                            {sortedClasses.map(c => {
                                const classStudCount = currentSchool.students.filter(s => s.classId === c.id).length;
                                return (
                                    <div key={c.id} className="flex justify-between items-center p-3 text-xs">
                                        <div>
                                            <span className="font-bold text-slate-800">Kelas {c.name}</span>
                                            <span className="text-[10px] text-slate-400 ml-2">({classStudCount} Siswa)</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => setEditClassModal({ id: c.id, name: c.name })}
                                                className="text-amber-500 hover:text-amber-600"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClass(c.id, c.name)}
                                                className="text-rose-500 hover:text-rose-600"
                                            >
                                                <Trash className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {sortedClasses.length === 0 && (
                                <div className="text-center text-slate-400 py-6">Belum ada kelas terdaftar</div>
                            )}
                        </div>
                    </div>

                    {/* Single Student register form */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <UserPlus className="h-4.5 w-4.5 text-cyan-600" />
                                <span>Pendaftaran Siswa Baru</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Daftarkan satu siswa ke kelas tertentu.</p>
                        </div>

                        <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Nama Siswa"
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Kelas</label>
                                <select
                                    value={newStudentClassId}
                                    onChange={(e) => setNewStudentClassId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                >
                                    {sortedClasses.map(c => (
                                        <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                    ))}
                                    {sortedClasses.length === 0 && (
                                        <option value="">Buat kelas terlebih dahulu</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-1">Jenis Kelamin (JK)</label>
                                <div className="flex gap-4 pt-1 text-xs font-semibold">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="new_student_jk"
                                            checked={newStudentJk === 'L'}
                                            onChange={() => setNewStudentJk('L')}
                                            className="accent-[#0f4c81] h-4 w-4 cursor-pointer"
                                        />
                                        <span className="text-slate-800 font-bold">Laki-Laki (L)</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="new_student_jk"
                                            checked={newStudentJk === 'P'}
                                            onChange={() => setNewStudentJk('P')}
                                            className="accent-[#0f4c81] h-4 w-4 cursor-pointer"
                                        />
                                        <span className="text-slate-800 font-bold">Perempuan (P)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">NIS</label>
                                    <input
                                        type="text"
                                        placeholder="NIS"
                                        value={newStudentNis}
                                        onChange={(e) => setNewStudentNis(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">NISN</label>
                                    <input
                                        type="text"
                                        placeholder="NISN"
                                        value={newStudentNisn}
                                        onChange={(e) => setNewStudentNisn(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">No. HP Orang Tua (WA)</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 081234567890"
                                    value={newStudentPhone}
                                    onChange={(e) => setNewStudentPhone(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Email Orang Tua</label>
                                <input
                                    type="email"
                                    placeholder="Contoh: ortu@example.com"
                                    value={newStudentEmail}
                                    onChange={(e) => setNewStudentEmail(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sortedClasses.length === 0}
                                className="w-full md:col-span-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-350 text-white font-bold text-xs py-2 transition-all active:scale-[0.98] mt-2 shadow-sm"
                            >
                                Daftarkan Siswa
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bulk student mass import tool */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Upload className="h-4.5 w-4.5 text-cyan-600" />
                                <span>Impor Data Siswa Massal (.xlsx / CSV)</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Unggah file Excel `.xlsx` atau tempel teks: <code>Nama, JK (L/P), NIS, NISN, No. HP, Email</code></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-bold text-xs px-3 py-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]">
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                <span>Upload Excel (.xlsx)</span>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleExcelFileUpload}
                                    className="hidden"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                            >
                                <Download className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Unduh Template</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Pilih Kelas Impor</label>
                                <select
                                    value={massClassId}
                                    onChange={(e) => setMassClassId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                >
                                    {sortedClasses.map(c => (
                                        <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Data Teks / Pratinjau Baris Siswa</label>
                                <textarea
                                    rows={5}
                                    placeholder="Andi Pratama,L,24001,0081234561,08123456789,andi@mail.com&#10;Budi Santoso,L,24002,0081234562,,budi@mail.com"
                                    value={massText}
                                    onChange={(e) => setMassText(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 focus:bg-white font-mono"
                                ></textarea>
                            </div>

                            <button
                                onClick={handleMassImport}
                                disabled={!massText.trim() || massErrors.length > 0}
                                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs py-2 transition-all active:scale-[0.98] shadow-sm"
                            >
                                Kirim &amp; Impor Siswa
                            </button>
                        </div>

                        {/* Real-time Parser Preview */}
                        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Pratinjau Hasil Impor</span>

                            <div className="flex-grow overflow-y-auto max-h-[220px] mt-3 border border-slate-200 rounded-lg bg-white">
                                <table className="w-full text-left border-collapse text-[10px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-100 font-bold text-slate-500">
                                            <th className="py-2 px-2 w-10 text-center">No</th>
                                            <th className="py-2 px-2">Nama</th>
                                            <th className="py-2 px-2 text-center w-10">JK</th>
                                            <th className="py-2 px-2">NIS</th>
                                            <th className="py-2 px-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-600">
                                        {massParsedRows.map(row => (
                                            <tr key={row.index} className={row.error ? 'bg-red-50' : ''}>
                                                <td className="py-2 px-2 text-center text-slate-400 font-semibold">{row.index}</td>
                                                <td className="py-2 px-2 font-bold">{row.name || '—'}</td>
                                                <td className="py-2 px-2 text-center font-bold">{row.jk}</td>
                                                <td className="py-2 px-2">{row.nis}</td>
                                                <td className="py-2 px-2">
                                                    {row.error ? (
                                                        <span className="text-red-600 font-semibold">{row.error}</span>
                                                    ) : (
                                                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                                            <Check className="h-3 w-3" /> Ready
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {massParsedRows.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center text-slate-400 py-6">
                                                    Ketik/tempel data teks siswa di kolom kiri untuk memunculkan pratinjau hasil impor.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {massText.trim() && (
                                <div className="mt-3">
                                    {massErrors.length > 0 ? (
                                        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-[10px] text-red-600 border border-red-100">
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                            <div>
                                                <h6 className="font-bold mb-1">Ditemukan {massErrors.length} kesalahan format parser:</h6>
                                                <ul className="list-disc pl-4 space-y-0.5">
                                                    {massErrors.slice(0, 4).map((e, i) => <li key={i}>{e}</li>)}
                                                    {massErrors.length > 4 && <li>...dan {massErrors.length - 4} kesalahan lainnya</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-[10px] text-emerald-600 border border-emerald-100">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                            <span>Format data terverifikasi aman. Siap diimpor!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Registered Students Grouped by Class */}
                <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-2 flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-xs font-bold text-slate-750 uppercase tracking-wider">Daftar Siswa Per Kelas</h4>
                        <div className="relative">
                            <input
                                type="text"
                                value={adminStudentSearch}
                                onChange={(e) => setAdminStudentSearch(e.target.value)}
                                placeholder="Cari nama / NIS siswa..."
                                className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 shadow-sm w-56 sm:w-72"
                            />
                            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>

                    {sortedClasses.map((cls) => {
                        const classStudents = sortedStudents
                            .filter(s => s.classId === cls.id)
                            .filter(s => {
                                if (!adminStudentSearch.trim()) return true;
                                const q = adminStudentSearch.toLowerCase().trim();
                                return s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q) || s.nisn.toLowerCase().includes(q);
                            });

                        if (adminStudentSearch.trim() && classStudents.length === 0) return null;
                        return (
                            <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4.5 w-4.5 text-cyan-600" />
                                        <span className="text-xs font-bold text-slate-800">Kelas {cls.name}</span>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-cyan-50 border border-cyan-155 px-2 py-0.5 text-[9px] font-bold text-cyan-700">
                                        {classStudents.length} Siswa
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                                <th className="py-2.5 px-4 w-12 text-center">No</th>
                                                <th className="py-2.5 px-4">Nama Siswa</th>
                                                <th className="py-2.5 px-4 text-center w-20">JK</th>
                                                <th className="py-2.5 px-4">NIS / NISN</th>
                                                <th className="py-2.5 px-4">Kontak Orang Tua</th>
                                                <th className="py-2.5 px-4 text-center w-28">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                            {classStudents.map((stud, idx) => (
                                                <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-bold text-slate-800">{stud.name}</td>
                                                    <td className="py-3 px-4 text-center font-bold text-slate-500">{stud.jk}</td>
                                                    <td className="py-3 px-4 text-slate-500 font-medium">{stud.nis} / {stud.nisn}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-[10px] leading-relaxed">
                                                            {stud.parentPhone && <p className="text-slate-700">WA: {stud.parentPhone}</p>}
                                                            {stud.parentEmail && <p className="text-slate-500">Email: {stud.parentEmail}</p>}
                                                            {!stud.parentPhone && !stud.parentEmail && <span className="text-slate-350">—</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            <button
                                                                onClick={() => setEditStudentModal(stud)}
                                                                className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStudent(stud.id, stud.name)}
                                                                className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                            >
                                                                <Trash className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {classStudents.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center text-slate-400 py-6">
                                                        Belum ada siswa terdaftar di kelas ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    {/* Students without assigned class */}
                    {sortedStudents.filter(s => !currentSchool.classes.some(c => c.id === s.classId)).length > 0 && (
                        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-amber-100 bg-amber-100/20 flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-800">Siswa Tanpa Kelas</span>
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                                    {sortedStudents.filter(s => !currentSchool.classes.some(c => c.id === s.classId)).length} Siswa
                                </span>
                            </div>

                            <div className="overflow-x-auto bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                            <th className="py-2.5 px-4 w-12 text-center">No</th>
                                            <th className="py-2.5 px-4">Nama Siswa</th>
                                            <th className="py-2.5 px-4 text-center w-20">JK</th>
                                            <th className="py-2.5 px-4">NIS / NISN</th>
                                            <th className="py-2.5 px-4">Kontak Orang Tua</th>
                                            <th className="py-2.5 px-4 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                        {sortedStudents.filter(s => !currentSchool.classes.some(c => c.id === s.classId)).map((stud, idx) => (
                                            <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                                                <td className="py-3 px-4 font-bold text-slate-800">{stud.name}</td>
                                                <td className="py-3 px-4 text-center font-bold text-slate-500">{stud.jk}</td>
                                                <td className="py-3 px-4 text-slate-500 font-medium">{stud.nis} / {stud.nisn}</td>
                                                <td className="py-3 px-4">
                                                    <div className="text-[10px] leading-relaxed">
                                                        {stud.parentPhone && <p className="text-slate-700">WA: {stud.parentPhone}</p>}
                                                        {stud.parentEmail && <p className="text-slate-500">Email: {stud.parentEmail}</p>}
                                                        {!stud.parentPhone && !stud.parentEmail && <span className="text-slate-350">—</span>}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-4 text-center">
                                                    <div className="flex gap-1 justify-center">
                                                        <button
                                                            onClick={() => setEditStudentModal(stud)}
                                                            className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStudent(stud.id, stud.name)}
                                                            className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                        >
                                                            <Trash className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {sortedClasses.length === 0 && sortedStudents.length === 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center text-slate-400 text-xs">
                            Belum ada data ruang kelas atau siswa terdaftar.
                        </div>
                    )}
                </div>

                {/* Edit Class Name Modal overlay */}
                {editClassModal && (
                    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                            <h3 className="text-xs font-bold text-slate-800 mb-3">Edit Nama Kelas</h3>
                            <form onSubmit={handleEditClassSave} className="space-y-3">
                                <input
                                    type="text"
                                    value={editClassModal.name}
                                    onChange={(e) => setEditClassModal({ ...editClassModal, name: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                />
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditClassModal(null)}
                                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-650 font-semibold text-[10px] px-3.5 py-1.5"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-[#0f4c81] hover:bg-[#0d4270] text-white font-bold text-[10px] px-3.5 py-1.5"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Student Modal overlay */}
                {editStudentModal && (
                    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-slate-800">Edit Data Siswa</h3>
                                <button onClick={() => setEditStudentModal(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditStudentSave} className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={editStudentModal.name}
                                        onChange={(e) => setEditStudentModal({ ...editStudentModal, name: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kelas</label>
                                    <select
                                        value={editStudentModal.classId}
                                        onChange={(e) => setEditStudentModal({ ...editStudentModal, classId: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                                    >
                                        {currentSchool.classes.map(c => (
                                            <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">NIS</label>
                                        <input
                                            type="text"
                                            value={editStudentModal.nis}
                                            onChange={(e) => setEditStudentModal({ ...editStudentModal, nis: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">NISN</label>
                                        <input
                                            type="text"
                                            value={editStudentModal.nisn}
                                            onChange={(e) => setEditStudentModal({ ...editStudentModal, nisn: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">No. HP Orang Tua (WA)</label>
                                    <input
                                        type="text"
                                        value={editStudentModal.parentPhone || ''}
                                        onChange={(e) => setEditStudentModal({ ...editStudentModal, parentPhone: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Email Orang Tua</label>
                                    <input
                                        type="email"
                                        value={editStudentModal.parentEmail || ''}
                                        onChange={(e) => setEditStudentModal({ ...editStudentModal, parentEmail: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditStudentModal(null)}
                                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-[#0f4c81] hover:bg-[#0d4270] text-white font-semibold text-xs px-4 py-2 shadow-sm"
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

    // SUB-TAB: REFERENSI SANKSI
    if (activePage === 'admin-pelanggaran') {
        const sortedRules = [...currentSchool.violationTypes].sort((a, b) => a.name.localeCompare(b.name));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Tambah Referensi */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <ShieldAlert className="h-4.5 w-4.5 text-cyan-600" />
                            <span>Tambah Referensi Sanksi</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Daftarkan jenis pelanggaran tata tertib baru beserta poin penaltinya.</p>
                    </div>

                    <form onSubmit={handleAddRule} className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama / Deskripsi Pelanggaran</label>
                            <input
                                type="text"
                                placeholder="Contoh: Menggunakan HP saat jam pelajaran"
                                value={newRuleName}
                                onChange={(e) => setNewRuleName(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Bobot Poin Penalti</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={newRulePoints}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') setNewRulePoints('');
                                    else {
                                        const parsed = parseInt(val, 10);
                                        setNewRulePoints(isNaN(parsed) ? '' : parsed);
                                    }
                                }}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 transition-all active:scale-[0.98]"
                        >
                            Daftarkan Pelanggaran
                        </button>
                    </form>
                </div>

                {/* Daftar Referensi Tabel */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-600">Daftar Referensi Jenis Pelanggaran</h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Nama Pelanggaran</th>
                                    <th className="py-3 px-4 text-center w-24">Bobot Poin</th>
                                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                {sortedRules.map((v, index) => (
                                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-800">{v.name}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                                -{v.points} Poin
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <button
                                                    onClick={() => setEditRuleModal(v)}
                                                    className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRule(v.id, v.name)}
                                                    className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {sortedRules.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-slate-400 py-8">
                                            Belum ada referensi sanksi terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Rule modal */}
                {editRuleModal && (
                    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
                            <h3 className="text-xs font-bold text-slate-800 mb-3">Edit Referensi Pelanggaran</h3>
                            <form onSubmit={handleEditRuleSave} className="space-y-3">
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nama Pelanggaran</label>
                                    <input
                                        type="text"
                                        value={editRuleModal.name}
                                        onChange={(e) => setEditRuleModal({ ...editRuleModal, name: e.target.value })}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Bobot Poin</label>
                                    <input
                                        type="number"
                                        value={editRuleModal.points}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setEditRuleModal({ ...editRuleModal, points: '' as any });
                                            } else {
                                                const parsed = parseInt(val, 10);
                                                setEditRuleModal({ ...editRuleModal, points: isNaN(parsed) ? '' as any : parsed });
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditRuleModal(null)}
                                        className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-[10px] px-3.5 py-1.5"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-[#0f4c81] hover:bg-[#0d4270] text-white font-bold text-[10px] px-3.5 py-1.5"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // SUB-TAB: AKUN GURU & STAF
    if (activePage === 'admin-staf') {
        const sortedStaff = [...currentSchool.users].sort((a, b) => a.name.localeCompare(b.name));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Pembuatan Akun */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div>
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Lock className="h-4.5 w-4.5 text-cyan-600" />
                            <span>Buat Akun Guru &amp; Staf</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Daftarkan akses kredensial login dengan hak akses tertentu.</p>
                    </div>

                    <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap Guru/Staf</label>
                            <input
                                type="text"
                                placeholder="Nama Guru"
                                value={newStaffName}
                                onChange={(e) => setNewStaffName(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Username</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newStaffUser}
                                    onChange={(e) => setNewStaffUser(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newStaffPass}
                                    onChange={(e) => setNewStaffPass(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Peran Pengguna (Role)</label>
                            <select
                                value={newStaffRole}
                                onChange={(e) => setNewStaffRole(e.target.value as any)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                            >
                                <option value="guru_bk">Guru Bimbingan Konseling (BK)</option>
                                <option value="guru_piket">Guru Piket Harian</option>
                                <option value="walas">Wali Kelas</option>
                                <option value="guru_mapel">Guru Mata Pelajaran</option>
                                <option value="admin">Administrator Sekolah</option>
                            </select>
                        </div>

                        {/* Wali Kelas Fields */}
                        {newStaffRole === 'walas' && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Pilih Wali Kelas Untuk</label>
                                <select
                                    value={newStaffWalasClassId}
                                    onChange={(e) => setNewStaffWalasClassId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                >
                                    {currentSchool.classes.map(c => (
                                        <option key={c.id} value={c.id}>Kelas {c.name}</option>
                                    ))}
                                    {currentSchool.classes.length === 0 && (
                                        <option value="">Buat kelas terlebih dahulu</option>
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Guru Mapel Fields */}
                        {newStaffRole === 'guru_mapel' && (
                            <div className="space-y-3 pt-1 border-t border-slate-100">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Mata Pelajaran</label>
                                    <input
                                        type="text"
                                        placeholder="Misal: Matematika, Bahasa Inggris"
                                        value={newStaffMapelName}
                                        onChange={(e) => setNewStaffMapelName(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Beri Hak Akses Mengajar di Kelas</label>
                                    <div className="border border-slate-200 bg-slate-50 rounded-lg p-3 max-h-[140px] overflow-y-auto space-y-1.5">
                                        {currentSchool.classes.map(c => {
                                            const checked = newStaffMapelClasses.includes(c.id);
                                            return (
                                                <label key={c.id} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleMapelClassSelection(c.id)}
                                                        className="accent-[#0f4c81]"
                                                    />
                                                    <span>Kelas {c.name}</span>
                                                </label>
                                            );
                                        })}
                                        {currentSchool.classes.length === 0 && (
                                            <span className="text-slate-400 text-[10px]">Belum ada kelas dibuat</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 transition-all active:scale-[0.98] mt-2 shadow-sm"
                        >
                            Buat Akun Staf
                        </button>
                    </form>
                </div>

                {/* Kumpulan Akun Staf */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-600">Daftar Akun Guru &amp; Staf Terdaftar</h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Nama Lengkap</th>
                                    <th className="py-3 px-4">Username</th>
                                    <th className="py-3 px-4">Hak Akses Peran</th>
                                    <th className="py-3 px-4">Cakupan Kelas</th>
                                    <th className="py-3 px-4 text-center w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                {sortedStaff.map((st, index) => {
                                    let coverage = 'Seluruh Kelas';
                                    if (st.role === 'walas') {
                                        const cl = currentSchool.classes.find(c => c.id === st.classId);
                                        coverage = cl ? `Wali Kelas ${cl.name}` : '—';
                                    } else if (st.role === 'guru_mapel') {
                                        const classesNames = currentSchool.classes
                                            .filter(c => (st.classes || []).includes(c.id))
                                            .map(c => c.name);
                                        coverage = `${st.mapelName} (${classesNames.join(', ') || 'Kosong'})`;
                                    }

                                    return (
                                        <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                            <td className="py-3 px-4 font-bold text-slate-800">{st.name}</td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">{st.username}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex rounded-full bg-cyan-50 border border-cyan-100 px-2 py-0.5 text-[9px] font-bold text-[#0f4c81]">
                                                    {st.role === 'admin' ? 'Admin' :
                                                     st.role === 'walas' ? 'Wali Kelas' :
                                                     st.role === 'guru_bk' ? 'Guru BK' :
                                                     st.role === 'guru_piket' ? 'Guru Piket' :
                                                     st.role === 'guru_mapel' ? 'Guru Mapel' : st.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 font-semibold text-[10px]">{coverage}</td>
                                            <td className="py-2 px-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteStaff(st.id, st.name)}
                                                    className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                    disabled={st.username === 'admin'} // Protect primary admin account
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // SUB-TAB: KONFIGURASI SEKOLAH
    if (activePage === 'admin-notifikasi') {
        const sortedLogs = [...(currentSchool.notificationLogs || [])].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* General Settings */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Settings className="h-4.5 w-4.5 text-cyan-600" />
                                <span>Profil Sekolah</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Atur nama dan NPSN sekolah.</p>
                        </div>

                        <form onSubmit={handleSaveGeneralConfig} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Sekolah</label>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">NPSN</label>
                                <input
                                    type="text"
                                    value={schoolNpsn}
                                    onChange={(e) => setSchoolNpsn(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Logo Sekolah</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 text-xs font-medium text-slate-600 cursor-pointer shadow-sm active:scale-[0.98] transition-all">
                                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                                        Pilih File
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {schoolLogo ? (
                                        <div className="h-8 w-8 rounded-lg border border-slate-150 bg-slate-50 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                            <img src={schoolLogo} alt="Preview" className="max-h-full max-w-full object-contain" />
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">Belum ada logo</span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 transition-all active:scale-[0.98] shadow-sm"
                            >
                                Simpan Profil Sekolah
                            </button>
                        </form>

                        <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Building className="h-4.5 w-4.5 text-cyan-600" />
                                    <span>Tahun Ajaran &amp; Semester Aktif</span>
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Ganti Tahun Ajaran aktif saat ini.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Pilih Tahun Ajaran</label>
                                <select
                                    value={`${currentSchool.tahunAjaran}-${currentSchool.semester}`}
                                    onChange={(e) => handleSwitchYear(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                >
                                    <option value={`${currentSchool.tahunAjaran}-${currentSchool.semester}`}>
                                        {currentSchool.tahunAjaran} (Semester {currentSchool.semester}) [Aktif]
                                    </option>
                                    {Object.keys(currentSchool.historyData || {}).map(key => {
                                        if (key !== `${currentSchool.tahunAjaran}-${currentSchool.semester}`) {
                                            const parts = key.split('-');
                                            return (
                                                <option key={key} value={key}>
                                                    {parts[0]} (Semester {parts[1]})
                                                </option>
                                            );
                                        }
                                        return null;
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Plus className="h-4.5 w-4.5 text-emerald-600" />
                                    <span>Buat Tahun Ajaran &amp; Semester Baru</span>
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">Mulai lembaran baru dengan data kosong.</p>
                            </div>

                            <form onSubmit={handleCreateNewYear} className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Tahun Ajaran Baru</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: 2027/2028"
                                        value={newYearTA}
                                        onChange={(e) => setNewYearTA(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Semester Baru</label>
                                    <select
                                        value={newYearSemester}
                                        onChange={(e) => setNewYearSemester(e.target.value as any)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                    >
                                        <option value="Ganjil">Semester Ganjil</option>
                                        <option value="Genap">Semester Genap</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 transition-all active:scale-[0.98] shadow-sm"
                                >
                                    Buat Tahun Ajaran
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Notification Channel & Templates */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <FileText className="h-4.5 w-4.5 text-cyan-600" />
                                <span>Saluran &amp; Template Notifikasi Orang Tua</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Konfigurasi pesan penalti / kehadiran otomatis ke Whatsapp / Email.</p>
                        </div>

                        <form onSubmit={handleSaveNotificationConfig} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">Saluran Pengiriman</label>
                                <select
                                    value={notifChannel}
                                    onChange={(e) => setNotifChannel(e.target.value as any)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500"
                                >
                                    <option value="wa">Hanya WhatsApp Gateway</option>
                                    <option value="email">Hanya Email SMTP Terintegrasi</option>
                                    <option value="both">Keduanya (WhatsApp &amp; Email)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Template WA Presensi</label>
                                    <textarea
                                        id="notif-wa-kehadiran"
                                        rows={3}
                                        value={waPresensiTpl}
                                        onChange={(e) => setWaPresensiTpl(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none focus:border-cyan-500 text-black font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Template WA Pelanggaran</label>
                                    <textarea
                                        id="notif-wa-pelanggaran"
                                        rows={3}
                                        value={waSanksiTpl}
                                        onChange={(e) => setWaSanksiTpl(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none focus:border-cyan-500 text-black font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Template Email Presensi</label>
                                    <textarea
                                        id="notif-email-kehadiran"
                                        rows={3}
                                        value={emailPresensiTpl}
                                        onChange={(e) => setEmailPresensiTpl(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none focus:border-cyan-500 text-black font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Template Email Pelanggaran</label>
                                    <textarea
                                        id="notif-email-pelanggaran"
                                        rows={3}
                                        value={emailSanksiTpl}
                                        onChange={(e) => setEmailSanksiTpl(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none focus:border-cyan-500 text-black font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-[10px] font-bold text-cyan-700 mb-1">Template WA Rekap Gabungan</label>
                                    <textarea
                                        id="notif-wa-rekap"
                                        rows={4}
                                        value={waRekapTpl}
                                        onChange={(e) => setWaRekapTpl(e.target.value)}
                                        placeholder="Gunakan tag {nama_siswa}, {kelas}, {periode}, {ringkasan_absensi}, {rincian_pelanggaran}, {total_poin_pelanggaran}, {nama_sekolah}"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none focus:border-cyan-500 text-black font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-cyan-700 mb-1">Template Email Rekap Gabungan</label>
                                    <textarea
                                        id="notif-email-rekap"
                                        rows={4}
                                        value={emailRekapTpl}
                                        onChange={(e) => setEmailRekapTpl(e.target.value)}
                                        placeholder="Gunakan tag {nama_siswa}, {kelas}, {periode}, {ringkasan_absensi}, {rincian_pelanggaran}, {total_poin_pelanggaran}, {nama_sekolah}"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none focus:border-cyan-500 text-black font-semibold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2 transition-all active:scale-[0.98] shadow-sm"
                            >
                                Simpan Template Pesan
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sent history logs / WhatsApp Gateway logs */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <History className="h-4.5 w-4.5 text-cyan-600" />
                            <span>Log Histori Pengiriman Notifikasi</span>
                        </h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                    <th className="py-3 px-4 w-12 text-center">No</th>
                                    <th className="py-3 px-4">Nama Siswa</th>
                                    <th className="py-3 px-4">Jenis</th>
                                    <th className="py-3 px-4">Detail</th>
                                    <th className="py-3 px-4">Tujuan Kontak</th>
                                    <th className="py-3 px-4 text-center w-24">Status</th>
                                    <th className="py-3 px-4">Waktu</th>
                                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                                {sortedLogs.map((log, idx) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                                        <td className="py-3 px-4 font-bold text-slate-800">{log.studentName}</td>
                                        <td className="py-3 px-4 font-semibold text-slate-500">{log.type}</td>
                                        <td className="py-3 px-4 text-slate-600">{log.details}</td>
                                        <td className="py-3 px-4 text-slate-500 font-medium">{log.recipient}</td>
                                        <td className="py-3 px-4 text-center">
                                            {log.status === 'terkirim' ? (
                                                <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                                                    Terkirim
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600">
                                                    Gagal
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-400 font-medium text-[10px]">{log.timestamp}</td>
                                        <td className="py-2 px-4 text-center">
                                            {log.status === 'gagal' && (
                                                <button
                                                    onClick={() => handleResendLog(log.id)}
                                                    className="inline-flex items-center gap-1 rounded bg-[#0f4c81] hover:bg-[#0d4270] text-white font-semibold text-[10px] py-1 px-2.5 shadow-sm"
                                                    title="Kirim Ulang Notifikasi"
                                                >
                                                    <RefreshCw className="h-3 w-3 animate-spin-hover" />
                                                    <span>Kirim Ulang</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {sortedLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center text-slate-400 py-8">
                                            Belum ada log pengiriman notifikasi tercatat.
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

    return null;
}
