'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    School as SchoolIcon, 
    Eye, 
    EyeOff, 
    Loader2, 
    AlertCircle, 
    Upload, 
    CheckCircle2,
    MessageSquare,
    BarChart3,
    ShieldAlert,
    BookOpen,
    Sparkles,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Zap,
    Users,
    Check,
    Lock,
    UserCheck,
    Shield,
    Award,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { getRawAppData, saveRawAppData } from '../../lib/state';
import { useApp } from '../../lib/AppContext';
import type { AppData, School } from '../../types';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useApp();
    const [isMounted, setIsMounted] = useState(false);
    const [appData, setAppData] = useState<AppData | null>(null);

    // Form states
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic Time & Educational Greeting
    const [currentTime, setCurrentTime] = useState<string>('');
    const [greeting, setGreeting] = useState<string>('Selamat Datang');

    // Login fields
    const [schoolCode, setSchoolCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Register fields
    const [regName, setRegName] = useState('');
    const [regCode, setRegCode] = useState('');
    const [regNpsn, setRegNpsn] = useState('');
    const [regContact, setRegContact] = useState('');
    const [regLogo, setRegLogo] = useState<string | null>(null);

    // Error states
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [generalError, setGeneralError] = useState('');
    const [generalSuccess, setGeneralSuccess] = useState('');

    // Active branding (Dynamic)
    const [activeBranding, setActiveBranding] = useState({
        name: 'Sistem Terpusat',
        logo: '/logo_terpusat.png',
        matched: false
    });

    // Promotional Carousel Slides
    const promoSlides = [
        {
            icon: MessageSquare,
            title: 'Notifikasi Rekap WA & Email Orang Tua',
            desc: 'Kirimkan rekapitulasi presensi harian dan rincian poin pelanggaran siswa langsung ke WhatsApp atau Email Orang Tua.',
            tag: 'Integrasi WhatsApp Gateway',
            color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
            image: '/promo_wa_notif.png',
            icon3d: '/wa_3d_icon.png'
        },
        {
            icon: BarChart3,
            title: 'Rekapitulasi Presensi & Grafik Real-time',
            desc: 'Pantau statistik kehadiran harian per kelas, rekap bulanan, serta laporan grafik persentase kehadiran siswa secara otomatis.',
            tag: 'Laporan 1-Klik',
            color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
            image: '/promo_dashboard_analytics.png',
            icon3d: '/analytics_3d_icon.png'
        },
        {
            icon: ShieldAlert,
            title: 'Pencatatan Poin Pelanggaran & BK',
            desc: 'Manajemen tingkat kedisiplinan siswa, pencatatan poin pelanggaran oleh Guru BK, serta sistem peringatan dini siswa bermasalah.',
            tag: 'Manajemen BK Terpadu',
            color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
            image: '/promo_bk_violations.png',
            icon3d: '/bk_3d_shield.png'
        },
        {
            icon: BookOpen,
            title: 'Agenda Mengajar & Evaluasi Nilai Mapel',
            desc: 'Fasilitas khusus Guru Mata Pelajaran untuk mengisi presensi jam mapel, agenda materi kelas, dan rekapitulasi nilai tugas.',
            tag: 'Modul Guru Mapel',
            color: 'from-purple-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
            image: '/promo_mapel_agenda.png',
            icon3d: '/hero_3d_school.png'
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance promo carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [promoSlides.length]);

    useEffect(() => {
        setIsMounted(true);
        const data = getRawAppData();
        setAppData(data);

        // Auto open registration form panel if URL contains ?mode=register or ?register=true
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('mode') === 'register' || params.get('register') === 'true') {
                setIsRegister(true);
            }
        }
    }, []);

    // Live clock & educational greeting logic
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours();
            let g = 'Selamat Datang';
            if (hours >= 4 && hours < 11) g = 'Selamat Pagi, Bapak/Ibu Pendidik! 🌅';
            else if (hours >= 11 && hours < 15) g = 'Selamat Siang, Tim Akademik! ☀️';
            else if (hours >= 15 && hours < 18) g = 'Selamat Sore, Bapak/Ibu Guru! 🌆';
            else g = 'Selamat Malam, Administrator! 🌙';

            setGreeting(g);
            setCurrentTime(
                now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) + 
                ' • ' + 
                now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
            );
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Update branding dynamically when school code changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let title = "SIMAK PRO - Sistem Informasi Manajemen Akademik & Kehadiran Terpadu";
        let logo = "/logo_terpusat.png";
        let name = "Sistem Terpusat";
        let matched = false;

        if (appData && schoolCode.trim()) {
            const school = appData.schools.find(
                (s) => s.code.toLowerCase() === schoolCode.trim().toLowerCase()
            );
            if (school) {
                title = `SIMAK PRO - ${school.name}`;
                logo = school.logo || "/logo_terpusat.png";
                name = school.name;
                matched = true;
            }
        }

        setActiveBranding({
            name: name,
            logo: logo,
            matched: matched
        });

        document.title = title;

        const links = document.querySelectorAll("link[rel*='icon']");
        if (links.length > 0) {
            links.forEach((link) => {
                (link as HTMLLinkElement).href = logo;
            });
        } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = logo;
            document.head.appendChild(newLink);
        }
    }, [schoolCode, appData]);

    if (!isMounted) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0b2f4d]">
                <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            </div>
        );
    }

    // Quick Fill Demo Accounts helper
    const handleQuickFillDemo = (code: string, user: string, pass: string) => {
        setSchoolCode(code);
        setUsername(user);
        setPassword(pass);
        setErrors({});
        setGeneralError('');
        setGeneralSuccess('');
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setGeneralSuccess('');

        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        const cleanSchoolCode = schoolCode.trim();

        let hasError = false;
        const newErrors: { [key: string]: string } = {};

        if (!cleanUsername) {
            newErrors.username = 'Username tidak boleh kosong!';
            hasError = true;
        }
        if (!cleanPassword) {
            newErrors.password = 'Password tidak boleh kosong!';
            hasError = true;
        }

        const isSuperAdmin = cleanUsername === 'superadmin' && cleanPassword === 'superadmin123';

        if (!isSuperAdmin && !cleanSchoolCode) {
            newErrors.schoolCode = 'Kode sekolah harus diisi untuk wali kelas / admin!';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            if (!appData) {
                setIsLoading(false);
                setGeneralError('Gagal memuat basis data aplikasi.');
                return;
            }

            if (isSuperAdmin) {
                const superuser = appData.superusers.find((u) => u.username === 'superadmin');
                if (superuser) {
                    login(superuser, null);
                    router.push('/');
                    return;
                }
            }

            const school = appData.schools.find(
                (s) => s.code.toLowerCase() === cleanSchoolCode.toLowerCase()
            );

            if (!school) {
                setIsLoading(false);
                setErrors({ schoolCode: 'Kode sekolah tidak terdaftar!' });
                return;
            }

            if (school.status === 'menunggu') {
                setIsLoading(false);
                setGeneralError('Pendaftaran sekolah Anda masih menunggu persetujuan Super Admin.');
                return;
            }

            if (school.status === 'nonaktif') {
                setIsLoading(false);
                setGeneralError('Akun sekolah Anda dinonaktifkan. Hubungi Super Admin.');
                return;
            }

            const user = school.users.find(
                (u) => u.username === cleanUsername && u.password === cleanPassword
            );

            if (!user) {
                setIsLoading(false);
                setGeneralError('Username atau password salah!');
                return;
            }

            login(user, school.id);
            router.push('/');
        }, 600);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setRegLogo(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setGeneralSuccess('');

        const name = regName.trim();
        const code = regCode.trim();
        const npsn = regNpsn.trim();
        const contact = regContact.trim();

        let hasError = false;
        const newErrors: { [key: string]: string } = {};

        if (!name) { newErrors.regName = 'Nama sekolah tidak boleh kosong!'; hasError = true; }
        if (!code) { newErrors.regCode = 'Kode sekolah tidak boleh kosong!'; hasError = true; }
        if (!npsn) { newErrors.regNpsn = 'NPSN tidak boleh kosong!'; hasError = true; }
        if (!contact) { newErrors.regContact = 'Kontak admin tidak boleh kosong!'; hasError = true; }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        if (!appData) return;

        if (appData.schools.some((s) => s.code.toLowerCase() === code.toLowerCase())) {
            setErrors({ regCode: 'Kode sekolah sudah digunakan sekolah lain!' });
            return;
        }

        const newSchool: School = {
            id: `s${Date.now()}`,
            code: code.toUpperCase(),
            name: name,
            logo: regLogo || '/logo_terpusat.png',
            npsn: npsn,
            contactAdmin: contact,
            status: 'menunggu',
            tahunAjaran: '2026/2027',
            semester: 'Ganjil',
            classes: [],
            violationTypes: [
                { id: 'vt1', name: 'Terlambat Masuk Sekolah', points: 5 },
                { id: 'vt2', name: 'Atribut Seragam Tidak Lengkap', points: 5 },
                { id: 'vt3', name: 'Rambut Gondrong / Tidak Rapi', points: 10 }
            ],
            students: [],
            absensi: {},
            violations: [],
            absensiMapel: {},
            agendaMapel: [],
            nilaiMapel: [],
            nilaiMapelConfig: {},
            users: [
                { id: `usr-admin-${Date.now()}`, username: 'admin', password: 'admin123', role: 'admin', name: `Admin ${name}` }
            ],
            notificationConfig: {
                channels: 'both',
                waTemplateKehadiran: 'Menginfokan {nama_siswa} tercatat {status_kehadiran} tanggal {tanggal}.',
                waTemplatePelanggaran: 'Menginfokan {nama_siswa} melanggar {nama_pelanggaran} ({poin_pelanggaran} Poin) tanggal {tanggal}.',
                emailTemplateKehadiran: 'Yth. Orang Tua,\n\nDengan ini kami informasikan bahwa siswa {nama_siswa} tercatat {status_kehadiran} pada tanggal {tanggal}.\n\nTerima kasih.',
                emailTemplatePelanggaran: 'Yth. Orang Tua,\n\nDengan ini kami informasikan bahwa siswa {nama_siswa} melakukan pelanggaran {nama_pelanggaran} dengan poin penalti {poin_pelanggaran} pada tanggal {tanggal}.',
                waTemplateRekap: 'Yth. Orang Tua/Wali dari {nama_siswa} (Kelas {kelas}),\n\nBerikut rekapitulasi presensi & pelanggaran periode {periode}:\n\n📊 PRESENSI:\n{ringkasan_absensi}\n\n⚠️ PELANGGARAN:\n{rincian_pelanggaran}\nTotal Poin: {total_poin_pelanggaran} Poin\n\nTerima kasih.\n-{nama_sekolah}-',
                emailTemplateRekap: 'Yth. Orang Tua/Wali dari {nama_siswa} (Kelas {kelas}),\n\nBerikut laporan rekapitulasi presensi dan pelanggaran siswa periode {periode}:\n\n1. PRESENSI:\n{ringkasan_absensi}\n\n2. PELANGGARAN:\n{rincian_pelanggaran}\nTotal Poin: {total_poin_pelanggaran} Poin\n\nDemikian laporan ini kami sampaikan.\n\nHormat kami,\n{nama_sekolah}'
            },
            notificationLogs: []
        };

        const updatedData = {
            ...appData,
            schools: [...appData.schools, newSchool]
        };

        saveRawAppData(updatedData);
        setAppData(updatedData);

        setRegName('');
        setRegCode('');
        setRegNpsn('');
        setRegContact('');
        setRegLogo(null);

        setGeneralSuccess('Registrasi sekolah berhasil! Silakan menunggu persetujuan Super Admin.');
        setIsRegister(false);
    };

    const SlideIcon = promoSlides[currentSlide].icon;

    return (
        <div className="h-screen w-screen max-h-screen overflow-hidden relative font-sans text-slate-100 bg-slate-950">
            
            {/* Background Image Layer - School Campus Building & Tech Grid Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 pointer-events-none opacity-25"
                style={{ backgroundImage: `url('/school_building_bg.png')` }}
            />
            <div 
                className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-overlay"
                style={{ backgroundImage: `url('/tech_grid_bg.png')` }}
            />

            {/* Academic Navy & Emerald Glass Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-[#0b2f4d]/80 to-slate-950/95 backdrop-blur-[3px] pointer-events-none" />

            {/* Main Grid Layout (Fits 100vh) */}
            <div className="relative z-10 h-full w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                
                {/* LEFT HERO / PROMOTIONAL PANEL (Fits 100vh without scroll) */}
                <div className="lg:col-span-6 xl:col-span-7 h-full p-5 lg:p-8 flex flex-col justify-between border-r border-slate-800/60 overflow-hidden relative">
                    
                    {/* Top Branding Header */}
                    <div className="flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-lg flex items-center justify-center">
                                <img src="/logo_terpusat.png" alt="Logo Platform" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                                    <span>SIMAK</span>
                                    <span className="text-[10px] font-extrabold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/30 shadow-sm">
                                        PRO
                                    </span>
                                </h1>
                                <p className="text-[10px] text-slate-400 font-medium">Sistem Informasi Manajemen Akademik &amp; Kehadiran Terpadu</p>
                            </div>
                        </div>

                        <Link
                            href="/landing"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-bold text-cyan-300 transition-all shadow-sm"
                        >
                            <span>Landing Page</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Middle Promo Showcase / Slider (Compact 100vh fit) */}
                    <div className="my-auto space-y-3 py-2 relative">

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-[11px] font-bold text-cyan-300 shadow-md">
                            <Zap className="h-3 w-3 text-amber-400 animate-pulse" />
                            <span>Fitur Unggulan Smart Campus</span>
                        </div>

                        <div className="space-y-2.5 max-w-xl">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${promoSlides[currentSlide].color} backdrop-blur-md border p-2 flex items-center justify-center shadow-lg shrink-0`}>
                                    <SlideIcon className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                                    {promoSlides[currentSlide].tag}
                                </span>
                            </div>

                            <h2 className="text-lg lg:text-xl font-black text-white leading-tight tracking-tight">
                                {promoSlides[currentSlide].title}
                            </h2>

                            <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-2">
                                {promoSlides[currentSlide].desc}
                            </p>

                            {/* Exclusive Neon Glassmorphism UI Mockup Device Frame */}
                            <div className="relative rounded-2xl bg-slate-950/90 p-1.5 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)] overflow-hidden group">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-rose-500/80"></span>
                                        <span className="h-2 w-2 rounded-full bg-amber-500/80"></span>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500/80"></span>
                                        <span className="ml-2 truncate text-slate-300 font-sans">simak-pro.app/modul-demo</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-semibold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                        <span>LIVE DEMO UI</span>
                                    </div>
                                </div>
                                <div className="relative h-40 sm:h-48 w-full overflow-hidden rounded-b-xl bg-[#091522]">
                                    <img
                                        src={promoSlides[currentSlide].image}
                                        alt={promoSlides[currentSlide].title}
                                        className="w-full h-full object-cover object-top rounded-b-xl transform transition-all duration-700 group-hover:scale-105 filter drop-shadow-md"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        </div>

                        {/* Slider Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <div className="flex items-center gap-1.5">
                                {promoSlides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                            currentSlide === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                                        }`}
                                        title={`Slide ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? promoSlides.length - 1 : prev - 1))}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Floating Feature Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/60 shrink-0">
                        <div className="p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                            <div className="text-cyan-400 font-bold text-[11px] flex items-center gap-1 mb-0.5">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>Presensi WA</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight truncate">Direct Notif Ortua</p>
                        </div>

                        <div className="p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                            <div className="text-cyan-400 font-bold text-[11px] flex items-center gap-1 mb-0.5">
                                <ShieldAlert className="h-3 w-3 text-amber-400" />
                                <span>BK &amp; Poin</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight truncate">Rekap Kedisiplinan</p>
                        </div>

                        <div className="p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                            <div className="text-cyan-400 font-bold text-[11px] flex items-center gap-1 mb-0.5">
                                <Award className="h-3 w-3 text-indigo-400" />
                                <span>Nilai Mapel</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight truncate">Agenda &amp; Evaluasi</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT FORM PANEL (Fits 100vh without scroll) */}
                <div className="lg:col-span-6 xl:col-span-5 h-full p-6 lg:p-8 flex flex-col justify-center items-center bg-slate-950/80 backdrop-blur-xl border-l border-slate-800/80 overflow-y-auto">
                    
                    <div className="w-full max-w-sm space-y-3.5 my-auto">
                        
                        {/* Dynamic Educational Greeting Banner */}
                        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-[#0b2f4d] p-3 border border-cyan-500/30 text-center shadow-lg">
                            <div className="text-[11px] font-bold text-cyan-300 flex items-center justify-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                                <span>{greeting}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3 text-emerald-400" />
                                <span>{currentTime}</span>
                            </div>
                        </div>

                        {/* Dynamic School Branding Header */}
                        <div className="text-center space-y-1.5">
                            <div className="relative inline-block">
                                <div className={`w-14 h-14 mx-auto rounded-2xl p-2 flex items-center justify-center transition-all duration-300 shadow-xl overflow-hidden ${
                                    activeBranding.matched 
                                        ? 'bg-white ring-4 ring-cyan-500/30 scale-105' 
                                        : 'bg-slate-800 border border-slate-700'
                                }`}>
                                    <img 
                                        src={activeBranding.logo} 
                                        alt="Logo Sekolah" 
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/logo_terpusat.png';
                                        }}
                                    />
                                </div>
                                {activeBranding.matched && (
                                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md" title="Sekolah Terverifikasi">
                                        <Check className="h-3 w-3 stroke-[3]" />
                                    </span>
                                )}
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                                    {!isRegister ? activeBranding.name : 'Registrasi Sekolah Baru'}
                                </h2>
                                <p className="text-[10px] text-slate-400">
                                    {!isRegister ? 'Masuk ke portal akun sekolah Anda' : 'Lengkapi data untuk mengajukan pendaftaran sekolah'}
                                </p>
                            </div>
                        </div>

                        {/* Error / Success Alerts */}
                        {generalError && (
                            <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 p-2.5 text-xs text-rose-300 border border-rose-500/20">
                                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                                <span>{generalError}</span>
                            </div>
                        )}

                        {generalSuccess && (
                            <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-300 border border-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                                <span>{generalSuccess}</span>
                            </div>
                        )}

                        {!isRegister ? (
                            /* LOGIN FORM */
                            <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                                
                                {/* School Code Input */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Kode Sekolah
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <SchoolIcon className="h-4 w-4 text-cyan-400" />
                                        </span>
                                        <input
                                            type="text"
                                            value={schoolCode}
                                            onChange={(e) => setSchoolCode(e.target.value)}
                                            className={`w-full rounded-xl border bg-slate-900/90 py-2 pl-9 pr-3 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
                                                errors.schoolCode ? 'border-rose-500' : 'border-slate-700'
                                            }`}
                                            placeholder="Contoh: SMP20 (Kosongkan jika Super Admin)"
                                        />
                                    </div>
                                    {errors.schoolCode && (
                                        <p className="text-[10px] text-rose-400 mt-0.5 pl-1">{errors.schoolCode}</p>
                                    )}
                                </div>

                                {/* Username Input */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <UserCheck className="h-4 w-4 text-emerald-400" />
                                        </span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={`w-full rounded-xl border bg-slate-900/90 py-2 pl-9 pr-3 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
                                                errors.username ? 'border-rose-500' : 'border-slate-700'
                                            }`}
                                            placeholder="Masukkan username akun Anda"
                                        />
                                    </div>
                                    {errors.username && (
                                        <p className="text-[10px] text-rose-400 mt-0.5 pl-1">{errors.username}</p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <Lock className="h-4 w-4 text-amber-400" />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full rounded-xl border bg-slate-900/90 py-2 pl-9 pr-9 text-xs font-semibold text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
                                                errors.password ? 'border-rose-500' : 'border-slate-700'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[10px] text-rose-400 mt-0.5 pl-1">{errors.password}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-1"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                            <span>Memverifikasi Akun...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Masuk ke Portal Sistem</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </>
                                    )}
                                </button>

                                {/* Quick Fill Demo Accounts Showcase */}
                                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-bold text-slate-300 flex items-center gap-1">
                                            <Sparkles className="h-3 w-3 text-amber-400" />
                                            Akses Cepat Demo Peran:
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFillDemo('SMP20', 'admin', 'admin123')}
                                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-[10px] border border-cyan-500/30 transition-all text-left truncate"
                                            title="Admin SMP20"
                                        >
                                            🛡️ Admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFillDemo('SMP20', 'guru_bk', 'bk123')}
                                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-[10px] border border-amber-500/30 transition-all text-left truncate"
                                            title="Guru BK"
                                        >
                                            🧠 Guru BK
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFillDemo('SMP20', 'walas', 'walas123')}
                                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 transition-all text-left truncate"
                                            title="Wali Kelas"
                                        >
                                            👨‍🏫 Walas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFillDemo('SMP20', 'guru', 'guru123')}
                                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold text-[10px] border border-indigo-500/30 transition-all text-left truncate"
                                            title="Guru Mapel"
                                        >
                                            📖 Mapel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFillDemo('SMP20', 'piket', 'piket123')}
                                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold text-[10px] border border-rose-500/30 transition-all text-left truncate"
                                            title="Guru Piket"
                                        >
                                            📋 Piket
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFillDemo('', 'superadmin', 'superadmin123')}
                                            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-[10px] border border-amber-500/40 transition-all text-left truncate"
                                            title="Super Admin"
                                        >
                                            👑 Super
                                        </button>
                                    </div>
                                </div>

                                {/* Security Trust Badge Footer */}
                                <div className="pt-2 text-center text-[9px] text-slate-400 flex items-center justify-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                                    <span>Enkripsi SSL 256-Bit &bull; Data Terisolasi Aman</span>
                                </div>

                                {/* Register toggle link */}
                                <div className="text-center pt-0.5 text-[11px]">
                                    <span className="text-slate-400">Sekolah Anda belum terdaftar? </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegister(true);
                                            setErrors({});
                                            setGeneralError('');
                                            setGeneralSuccess('');
                                        }}
                                        className="text-cyan-400 font-bold hover:underline"
                                    >
                                        Daftar Sekarang
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* REGISTER FORM */
                            <form onSubmit={handleRegisterSubmit} className="space-y-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Nama Lengkap Sekolah</label>
                                    <input
                                        type="text"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className={`w-full rounded-xl border bg-slate-900/90 py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none ${
                                            errors.regName ? 'border-rose-500' : 'border-slate-700'
                                        }`}
                                        placeholder="Misal: SMP Negeri 2 Depok"
                                    />
                                    {errors.regName && <p className="text-[10px] text-rose-400 mt-0.5">{errors.regName}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Kode Sekolah (Kode Login)</label>
                                    <input
                                        type="text"
                                        value={regCode}
                                        onChange={(e) => setRegCode(e.target.value)}
                                        className={`w-full rounded-xl border bg-slate-900/90 py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none ${
                                            errors.regCode ? 'border-rose-500' : 'border-slate-700'
                                        }`}
                                        placeholder="Misal: SMP2"
                                    />
                                    {errors.regCode && <p className="text-[10px] text-rose-400 mt-0.5">{errors.regCode}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">NPSN Sekolah</label>
                                    <input
                                        type="text"
                                        value={regNpsn}
                                        onChange={(e) => setRegNpsn(e.target.value)}
                                        className={`w-full rounded-xl border bg-slate-900/90 py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none ${
                                            errors.regNpsn ? 'border-rose-500' : 'border-slate-700'
                                        }`}
                                        placeholder="Misal: 20123456"
                                    />
                                    {errors.regNpsn && <p className="text-[10px] text-rose-400 mt-0.5">{errors.regNpsn}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">No. HP / WA Admin</label>
                                    <input
                                        type="text"
                                        value={regContact}
                                        onChange={(e) => setRegContact(e.target.value)}
                                        className={`w-full rounded-xl border bg-slate-900/90 py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none ${
                                            errors.regContact ? 'border-rose-500' : 'border-slate-700'
                                        }`}
                                        placeholder="Misal: 081234567890"
                                    />
                                    {errors.regContact && <p className="text-[10px] text-rose-400 mt-0.5">{errors.regContact}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Logo Sekolah (Opsional)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                            id="reg-logo-upload"
                                        />
                                        <label
                                            htmlFor="reg-logo-upload"
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer"
                                        >
                                            <Upload className="h-3.5 w-3.5 text-cyan-400" />
                                            <span>{regLogo ? 'Logo Terpilih' : 'Unggah Logo PNG/JPG'}</span>
                                        </label>
                                        {regLogo && (
                                            <div className="h-8 w-8 rounded-lg bg-white p-1 overflow-hidden shrink-0">
                                                <img src={regLogo} alt="Preview" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md mt-1 cursor-pointer"
                                >
                                    Kirim Pendaftaran Sekolah
                                </button>

                                <div className="text-center pt-1 text-[11px]">
                                    <span className="text-slate-400">Sudah memiliki akun? </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegister(false);
                                            setErrors({});
                                            setGeneralError('');
                                            setGeneralSuccess('');
                                        }}
                                        className="text-cyan-400 font-bold hover:underline"
                                    >
                                        Kembali ke Login
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
