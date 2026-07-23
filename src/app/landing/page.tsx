'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    School as SchoolIcon,
    Zap,
    MessageSquare,
    BarChart3,
    ShieldAlert,
    BookOpen,
    Users,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    Send,
    FileSpreadsheet,
    Smartphone,
    UserCheck,
    Clock,
    Lock,
    HelpCircle,
    Star,
    Check,
    X,
    ExternalLink,
    Play,
    Building2,
    Award
} from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // Active Tab in Hero Demo Showcase
    const [activeHeroTab, setActiveHeroTab] = useState(0);

    // Interactive 3D Parallax Tilt state
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Interactive WA Notif Simulator State
    const [simStudentName, setSimStudentName] = useState('Budi Santoso');
    const [simClassName, setSimClassName] = useState('IX-B');
    const [simType, setSimType] = useState<'alfa' | 'sakit' | 'pelanggaran' | 'rekap'>('alfa');
    const [simViolationName, setSimViolationName] = useState('Terlambat Masuk Sekolah (Poin: 5)');
    const [simSending, setSimSending] = useState(false);

    // FAQ Accordion Active Index
    const [activeFaq, setActiveFaq] = useState<number | null>(0);

    // Role Demo Showcase State
    const [activeRole, setActiveRole] = useState(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Mouse movement parallax tilt handler
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: x * 20, y: -y * 20 });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    const heroSlides = [
        {
            id: 'wa',
            title: 'Notifikasi Otomatis WhatsApp & Email',
            desc: 'Kirim rekapitulasi kehadiran harian dan poin pelanggaran secara real-time langsung ke ponsel orang tua.',
            badge: 'Integrasi WA Gateway',
            image: '/promo_wa_notif.png',
            icon3d: '/wa_3d_icon.png',
            color: 'from-emerald-500 to-teal-400'
        },
        {
            id: 'analytics',
            title: 'Dashboard Real-Time & Rekap Laporan',
            desc: 'Pantau grafik kehadiran sekolah secara live dan unduh rekap bulanan format Excel/PDF hanya dengan 1 klik.',
            badge: 'Analitik 1-Klik',
            image: '/promo_dashboard_analytics.png',
            icon3d: '/analytics_3d_icon.png',
            color: 'from-cyan-500 to-blue-500'
        },
        {
            id: 'bk',
            title: 'Manajemen BK & Poin Kedisiplinan',
            desc: 'Pencatatan pelanggaran terstruktur dengan bobot poin otomatis, serta riwayat penanganan siswa oleh Guru BK.',
            badge: 'Sistem Kedisiplinan BK',
            image: '/promo_bk_violations.png',
            icon3d: '/bk_3d_shield.png',
            color: 'from-amber-500 to-orange-500'
        },
        {
            id: 'mapel',
            title: 'Jurnal Mengajar & Nilai Guru Mapel',
            desc: 'Fasilitas presensi jam mata pelajaran, pengisian jurnal agenda kelas, dan rekapitulasi nilai tugas siswa.',
            badge: 'Modul Guru Mapel',
            image: '/promo_mapel_agenda.png',
            icon3d: '/hero_3d_school.png',
            color: 'from-purple-500 to-indigo-500'
        }
    ];

    const rolesDemo = [
        {
            role: 'Admin Sekolah',
            icon: Building2,
            tag: 'Manajemen Terpusat',
            color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
            desc: 'Kelola data siswa, kelas, staf pengajar, konfigurasi pesan notifikasi WA/Email, serta cetak laporan resmi.',
            features: ['Manajemen Data Siswa & Guru', 'Set Up Tahun Ajaran & Semester', 'Kustomisasi Template WA & Email', 'Cetak Laporan Rekapitulasi Excel']
        },
        {
            role: 'Guru BK',
            icon: ShieldAlert,
            tag: 'Kedisiplinan & Counseling',
            color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
            desc: 'Catat pelanggaran siswa, pantau akumulasi poin kedisiplinan, serta beri sanksi atau rekomendasi pemanggilan ortua.',
            features: ['Pencatatan Poin Pelanggaran', 'Monitoring Akumulasi Poin Siswa', 'Notifikasi Peringatan Dini Ortua', 'Riwayat Bimbingan Konseling']
        },
        {
            role: 'Wali Kelas',
            icon: Users,
            tag: 'Monitoring Wali',
            color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
            desc: 'Pantau persentase kehadiran harian siswa di kelasnya, verifikasi surat izin/sakit, dan kirim rekap berkala.',
            features: ['Presensi Harian Kelas', 'Kirim Rekap WA ke Orang Tua', 'Verifikasi Surat Sakit / Izin', 'Grafik Kehadiran Per Siswa']
        },
        {
            role: 'Guru Mata Pelajaran',
            icon: BookOpen,
            tag: 'Pengajaran & Nilai',
            color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
            desc: 'Ambil absensi jam pelajaran tertentu, catat materi agenda harian kelas, serta kelola nilai evaluasi tugas.',
            features: ['Absensi Jam Mapel Spesifik', 'Jurnal Agenda Kelas', 'Input & Rekap Nilai Tugas', 'Ekspor Daftar Nilai']
        },
        {
            role: 'Guru Piket',
            icon: Clock,
            tag: 'Kedatangan & Keterlambatan',
            color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
            desc: 'Catat siswa terlambat di gerbang sekolah, berikan surat izin masuk kelas, dan update status secara otomatis.',
            features: ['Pencatatan Siswa Terlambat', 'Cetak / Kirim Izin Masuk', 'Statistik Gerbang Harian', 'Notifikasi Cepat']
        }
    ];

    const faqItems = [
        {
            q: 'Apakah SIMAK PRO memerlukan instalasi aplikasi di perangkat sekolah?',
            a: 'Tidak perlu. SIMAK PRO adalah platform berbasis web (Cloud-based). Pengguna hanya memerlukan peramban (browser) di laptop, tablet, atau smartphone tanpa perlu menginstal aplikasi tambahan.'
        },
        {
            q: 'Bagaimana mekanisme pengiriman notifikasi WhatsApp ke Orang Tua?',
            a: 'Sistem terintegrasi dengan WhatsApp Gateway terpusat. Ketika Guru/Admin menyimpan data absensi atau pelanggaran, sistem akan secara otomatis memformat pesan sesuai template sekolah dan mengirimkannya langsung ke nomor WA orang tua.'
        },
        {
            q: 'Apakah satu aplikasi ini bisa digunakan oleh banyak sekolah?',
            a: 'Ya, SIMAK PRO mendukung Multi-Tenant Multi-School. Setiap sekolah memiliki kode unik, data terpisah yang terisolasi aman, serta konfigurasi khusus masing-masing.'
        },
        {
            q: 'Bisakah data presensi dan pelanggaran diunduh dalam format Excel?',
            a: 'Sangat bisa. Terdapat fitur ekspor laporan 1-klik untuk Rekapitulasi Presensi Bulan, Laporan Poin Pelanggaran BK, dan Jurnal Agenda Kelas dalam format Microsoft Excel (.xlsx) rapi.'
        },
        {
            q: 'Bagaimana cara mendaftarkan sekolah baru di SIMAK PRO?',
            a: 'Cukup klik tombol "Daftar Sekolah Baru", isi form nama sekolah, kode unik login, NPSN, dan kontak admin. Setelah pengajuan disetujui Super Admin, akun sekolah Anda langsung aktif!'
        }
    ];

    const handleTriggerSimulate = () => {
        setSimSending(true);
        setTimeout(() => {
            setSimSending(false);
        }, 600);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
            
            {/* Background Tech Grid Pattern */}
            <div
                className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-40 z-0"
                style={{ backgroundImage: `url('/tech_grid_bg.png')` }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950 pointer-events-none z-0" />

            {/* Ambient Animated Glow Spheres */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="fixed top-96 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

            {/* Sticky Glassmorphism Header / Navbar */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    
                    {/* Logo Branding */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md p-1.5 border border-white/20 shadow-lg flex items-center justify-center">
                            <img src="/logo_terpusat.png" alt="Logo Platform" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-black tracking-tight text-white">SIMAK</span>
                                <span className="text-[10px] font-extrabold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/30">
                                    PRO
                                </span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium hidden sm:block">Sistem Informasi Manajemen Akademik dan Kedisiplinan</p>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
                        <a href="#fitur" className="hover:text-cyan-400 transition-colors">Fitur</a>
                        <a href="#simulasi" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                            <span>Simulasi WA</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        </a>
                        <a href="#peran" className="hover:text-cyan-400 transition-colors">Modul Peran</a>
                        <a href="#komparasi" className="hover:text-cyan-400 transition-colors">Keunggulan</a>
                        <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
                    </nav>

                    {/* Action CTA Buttons */}
                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/login?mode=register"
                            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all"
                        >
                            Daftar Sekolah
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                        >
                            <span>Masuk Portal</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* HERO SECTION WITH DYNAMIC INTERACTIVE 3D PARALLAX ANIMATIONS */}
            <section
                className="relative z-10 pt-8 pb-12 lg:pt-14 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 perspective-1000"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Split Hero 2-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* LEFT COLUMN: HEADLINE, SUBHEADLINE & CTAS */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        
                        {/* Hero Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-extrabold shadow-lg shadow-cyan-500/20 backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                            <span>Platform Kehadiran &amp; Kedisiplinan Terpadu</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                            Transformasi Digital Kehadiran &amp; Kedisiplinan Sekolah dengan{' '}
                            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                                Notifikasi WA Real-Time
                            </span>
                        </h1>

                        {/* Subheadline Paragraph */}
                        <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-normal leading-relaxed max-w-2xl">
                            Kelola presensi harian, jurnal mengajar guru, rekapitulasi poin kedisiplinan BK, dan kirimkan laporan otomatis langsung ke WhatsApp Orang Tua secara instant &amp; transparan.
                        </p>

                        {/* Action CTA Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                            >
                                <span>Masuk ke Portal Sekolah</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>

                            <a
                                href="#simulasi"
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-sm font-bold backdrop-blur-md transition-all"
                            >
                                <MessageSquare className="h-4 w-4 text-emerald-400" />
                                <span>Coba Simulasi WA</span>
                            </a>
                        </div>

                        {/* Micro Trust Proof Bar */}
                        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                            <div className="flex items-center gap-1.5 text-cyan-400">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span>150+ Sekolah Terdaftar</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                                <span>WA Gateway Real-Time</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                                <span>100% Paperless &amp; Cloud</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INTERACTIVE 3D ANIMATED ASSETS SHOWCASE */}
                    <div className="lg:col-span-5 relative flex justify-center items-center py-6">
                        
                        {/* Ambient Pulsing Glow Halo */}
                        <div className="absolute h-72 w-72 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 blur-3xl animate-pulse-glow pointer-events-none" />

                        {/* Orbiting Particle */}
                        <div className="absolute h-full w-full max-w-xs flex items-center justify-center pointer-events-none">
                            <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] animate-orbit" />
                        </div>

                        {/* Main 3D Smart School Hologram with Mouse Tilt */}
                        <div
                            className="relative group cursor-pointer transition-transform duration-200 ease-out z-10"
                            style={{
                                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`
                            }}
                        >
                            <img
                                src="/hero_3d_school.png"
                                alt="SIMAK PRO 3D Smart Campus"
                                className="h-56 sm:h-72 lg:h-80 object-contain animate-float-3d filter drop-shadow-[0_25px_35px_rgba(6,182,212,0.45)]"
                            />
                        </div>

                        {/* Floating Secondary 3D Badges */}
                        <div className="absolute -left-4 top-2 hidden sm:block animate-float-3d-slow z-20">
                            <div className="p-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 backdrop-blur-md flex items-center gap-2.5 transform hover:scale-110 transition-transform">
                                <img src="/wa_3d_icon.png" alt="3D WA" className="h-10 w-10 object-contain animate-float-reverse" />
                                <div className="text-[10px] pr-2 text-left">
                                    <div className="font-extrabold text-emerald-400 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                        <span>Direct Notif WA</span>
                                    </div>
                                    <div className="text-slate-300 font-medium">Kirim Instant ke Ortua</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-4 bottom-6 hidden sm:block animate-float-reverse z-20">
                            <div className="p-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 backdrop-blur-md flex items-center gap-2.5 transform hover:scale-110 transition-transform">
                                <img src="/bk_3d_shield.png" alt="3D Shield" className="h-10 w-10 object-contain animate-float-3d" />
                                <div className="text-[10px] pr-2 text-left">
                                    <div className="font-extrabold text-amber-400">Poin Kedisiplinan</div>
                                    <div className="text-slate-300 font-medium">Sistem Poin BK</div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Hero Interactive Showcase Slider */}
                <div className="mt-14 max-w-5xl mx-auto">
                    
                    {/* Tab Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {heroSlides.map((slide, idx) => (
                            <button
                                key={slide.id}
                                onClick={() => setActiveHeroTab(idx)}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                                    activeHeroTab === idx
                                        ? 'bg-slate-800/90 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                                }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${activeHeroTab === idx ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                                <span className="truncate">{slide.badge}</span>
                            </button>
                        ))}
                    </div>

                    {/* Preview Frame */}
                    <div className="relative rounded-2xl bg-slate-900/90 p-2 sm:p-3 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden group">
                        
                        {/* Device Frame Top Bar */}
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 rounded-t-xl text-xs text-slate-400 font-mono">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
                                </div>
                                <span className="text-slate-300 font-sans ml-2 text-[11px] font-semibold truncate">
                                    simak-pro.app &mdash; {heroSlides[activeHeroTab].title}
                                </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>LIVE DEMO INTERFACE</span>
                            </div>
                        </div>

                        {/* Image Showcase */}
                        <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-[#091522] rounded-b-xl">
                            <img
                                src={heroSlides[activeHeroTab].image}
                                alt={heroSlides[activeHeroTab].title}
                                className="w-full h-full object-cover object-top transform transition-all duration-700 group-hover:scale-102"
                            />
                            
                            {/* Floating 3D Animated Badge Overlay inside Showcase */}
                            <div className="absolute top-4 right-4 z-20 hidden sm:block animate-float-3d">
                                <img
                                    src={heroSlides[activeHeroTab].icon3d}
                                    alt="3D Icon"
                                    className="h-20 w-20 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transition-all duration-500 hover:rotate-12 hover:scale-125"
                                />
                            </div>

                            {/* Gradient Overlay & Text Caption */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 sm:p-6">
                                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 w-max mb-1">
                                    {heroSlides[activeHeroTab].badge}
                                </span>
                                <h3 className="text-base sm:text-xl font-bold text-white">
                                    {heroSlides[activeHeroTab].title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2">
                                    {heroSlides[activeHeroTab].desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* KEY METRICS & COUNTER SECTION */}
            <section className="relative z-10 py-10 bg-slate-900/60 border-y border-slate-800/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-cyan-400 tracking-tight">150+</div>
                        <div className="text-xs font-semibold text-slate-300 mt-1">Sekolah Terdaftar</div>
                        <div className="text-[10px] text-slate-500">SD, SMP, SMA &amp; SMK</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-emerald-400 tracking-tight">500.000+</div>
                        <div className="text-xs font-semibold text-slate-300 mt-1">Presensi Diproses</div>
                        <div className="text-[10px] text-slate-500">Tercatat secara real-time</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight">99.8%</div>
                        <div className="text-xs font-semibold text-slate-300 mt-1">Kecepatan WA Gateway</div>
                        <div className="text-[10px] text-slate-500">Notifikasi instant orang tua</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300">
                        <div className="text-2xl sm:text-4xl font-black text-indigo-400 tracking-tight">100%</div>
                        <div className="text-xs font-semibold text-slate-300 mt-1">Paperless &amp; Cloud</div>
                        <div className="text-[10px] text-slate-500">Hemat biaya rekap kertas</div>
                    </div>

                </div>
            </section>

            {/* BENTO GRID FEATURE HIGHLIGHTS WITH ANIMATED 3D ASSETS */}
            <section id="fitur" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                        Fitur Utama &amp; Unggulan
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Segala Kebutuhan Kehadiran &amp; Akademik dalam Satu Dashboard
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Dirancang khusus untuk mempermudah tugas Admin Sekolah, Guru BK, Wali Kelas, Guru Mata Pelajaran, dan Guru Piket.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    
                    {/* Box 1: Large Span (WA Notif with Animated 3D Asset) */}
                    <div className="md:col-span-2 rounded-3xl bg-slate-900/80 p-6 border border-emerald-500/30 shadow-lg hover:border-emerald-500/60 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 max-w-md">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    WhatsApp &amp; Email Gateway
                                </span>
                                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                                    Rekap Notifikasi Otomatis ke Orang Tua
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Kirimkan pesan pemberitahuan saat siswa alfa, sakit, izin, atau melanggar aturan kedisiplinan. Dilengkapi laporan rekap mingguan dan bulanan otomatis.
                                </p>
                            </div>

                            {/* Animated 3D Floating Icon WA */}
                            <img
                                src="/wa_3d_icon.png"
                                alt="3D WA Icon"
                                className="h-28 w-28 object-contain hidden sm:block animate-float-3d filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.4)]"
                            />
                        </div>

                        <div className="mt-6 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                            <div className="text-emerald-400 font-bold mb-1">📱 Template WhatsApp Otomatis:</div>
                            <div className="text-slate-400 line-clamp-2">
                                "Menginfokan Ahmad Rizky (Kelas VIII-A) tercatat ALFA pada tanggal 23/07/2026. Mohon konfirmasi ke pihak sekolah..."
                            </div>
                        </div>
                    </div>

                    {/* Box 2: BK & Violations (with Animated 3D Shield) */}
                    <div className="md:col-span-1 rounded-3xl bg-slate-900/80 p-6 border border-amber-500/30 shadow-lg hover:border-amber-500/60 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <img
                                    src="/bk_3d_shield.png"
                                    alt="3D Shield"
                                    className="h-12 w-12 object-contain animate-float-reverse filter drop-shadow-[0_8px_15px_rgba(245,158,11,0.4)]"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                                Manajemen Poin BK
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Pencatatan pelanggaran siswa terstruktur dengan sistem bobot poin otomatis dan penanganan BK.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-400">
                            <span>Bobot Poin Terintegrasi</span>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Box 3: Dashboard Analytics (with Animated 3D Analytics) */}
                    <div className="md:col-span-1 rounded-3xl bg-slate-900/80 p-6 border border-cyan-500/30 shadow-lg hover:border-cyan-500/60 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <img
                                    src="/analytics_3d_icon.png"
                                    alt="3D Analytics"
                                    className="h-12 w-12 object-contain animate-float-3d-slow filter drop-shadow-[0_8px_15px_rgba(6,182,212,0.4)]"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                                Dashboard Analitik Real-Time
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Grafik statistik persentase kehadiran harian dan bulanan per kelas secara otomatis.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400">
                            <span>Grafik Real-Time</span>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Box 4: Export Reports */}
                    <div className="md:col-span-1 rounded-3xl bg-slate-900/80 p-6 border border-teal-500/30 shadow-lg hover:border-teal-500/60 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                                Ekspor Excel 1-Klik
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Unduh rekapitulasi presensi bulanan dan laporan poin pelanggaran dalam format Excel rapi.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-400">
                            <span>Format XLSX Siap Cetak</span>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Box 5: Multi-Role Access */}
                    <div className="md:col-span-2 rounded-3xl bg-slate-900/80 p-6 border border-purple-500/30 shadow-lg hover:border-purple-500/60 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                Hak Akses Berjenjang
                            </span>
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                Hak Akses Terpisah Menurut Peran Tugas (RBAC)
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Hak akses disesuaikan untuk Admin Sekolah, Wali Kelas, Guru BK, Guru Mapel, Guru Piket, hingga Super Admin. Setiap peran memiliki tampilan yang disederhanakan sesuai tugasnya.
                            </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {['Admin', 'Guru BK', 'Wali Kelas', 'Guru Mapel', 'Guru Piket', 'Super Admin'].map((role) => (
                                <span key={role} className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300">
                                    ✓ {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Box 6: Multi-School Tenant (with Animated 3D School Hologram) */}
                    <div className="md:col-span-1 rounded-3xl bg-slate-900/80 p-6 border border-indigo-500/30 shadow-lg hover:border-indigo-500/60 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <img
                                    src="/hero_3d_school.png"
                                    alt="3D School"
                                    className="h-12 w-12 object-contain animate-float-3d filter drop-shadow-[0_8px_15px_rgba(99,102,241,0.4)]"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                                Multi-Sekolah Terpusat
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Setiap sekolah terdaftar memiliki kode login unik, logo khusus, dan terisolasi secara aman.
                            </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-400">
                            <span>Isolasi Data Terjamin</span>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>

                </div>
            </section>

            {/* INTERACTIVE WA NOTIF SIMULATOR WIDGET */}
            <section id="simulasi" className="relative z-10 py-16 bg-slate-900/50 border-y border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            Uji Coba Simulator Interaktif
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Simulasi Pengiriman Pesan WhatsApp Orang Tua
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Ketik nama siswa dan pilih jenis notifikasi untuk melihat pratinjau pesan otomatis secara real-time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
                        
                        {/* Control Panel (Left) */}
                        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-400" />
                                    <span>Pengaturan Data Simulasi:</span>
                                </h3>
                                <img src="/wa_3d_icon.png" alt="3D WA" className="h-10 w-10 object-contain animate-float-3d" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Siswa Contoh</label>
                                <input
                                    type="text"
                                    value={simStudentName}
                                    onChange={(e) => setSimStudentName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-500"
                                    placeholder="Nama Siswa"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Kelas</label>
                                <input
                                    type="text"
                                    value={simClassName}
                                    onChange={(e) => setSimClassName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-cyan-500"
                                    placeholder="Kelas"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Notifikasi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'alfa', label: '❌ Status Alfa' },
                                        { id: 'sakit', label: '🏥 Sakit / Izin' },
                                        { id: 'pelanggaran', label: '⚠️ Pelanggaran BK' },
                                        { id: 'rekap', label: '📊 Rekap Mingguan' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSimType(item.id as any)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left truncate ${
                                                simType === item.id
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {simType === 'pelanggaran' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pelanggaran &amp; Poin</label>
                                    <input
                                        type="text"
                                        value={simViolationName}
                                        onChange={(e) => setSimViolationName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-amber-500"
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleTriggerSimulate}
                                disabled={simSending}
                                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span>Simulasikan Kirim WA Instant</span>
                            </button>
                        </div>

                        {/* Simulated Phone Frame (Right) */}
                        <div className="lg:col-span-7 flex justify-center">
                            <div className="w-full max-w-sm rounded-[36px] bg-slate-900 p-3 border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                                
                                {/* Phone Header Bar */}
                                <div className="bg-[#075e54] text-white px-4 py-3 rounded-t-[28px] flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                        🏫
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold leading-tight">SIMAK PRO Gateway (SMP N 1)</div>
                                        <div className="text-[9px] text-emerald-200">Online &bull; Terverifikasi</div>
                                    </div>
                                </div>

                                {/* Chat Body */}
                                <div className="bg-[#0b141a] p-4 min-h-[280px] flex flex-col justify-end gap-3 font-sans text-xs">
                                    
                                    {/* Date Badge */}
                                    <div className="self-center bg-[#182229] text-[10px] text-slate-400 px-3 py-1 rounded-lg">
                                        HARI INI (REAL-TIME)
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`self-start max-w-[90%] bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-700/50 shadow-md relative ${simSending ? 'opacity-50 animate-pulse' : ''}`}>
                                        
                                        <div className="text-[10px] text-emerald-400 font-bold mb-1 border-b border-slate-700/60 pb-1 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Notifikasi Resmi Sekolah</span>
                                        </div>

                                        {simType === 'alfa' && (
                                            <p className="text-[11px] leading-relaxed">
                                                Yth. Orang Tua/Wali dari <span className="font-bold text-amber-300">{simStudentName}</span> (Kelas {simClassName}),
                                                <br /><br />
                                                Menginfokan bahwa siswa ybs tercatat <span className="font-bold text-rose-400">ALFA / TANPA KETERANGAN</span> pada presensi hari ini.
                                                <br /><br />
                                                Mohon segera konfirmasi ke Wali Kelas. Terima kasih.
                                            </p>
                                        )}

                                        {simType === 'sakit' && (
                                            <p className="text-[11px] leading-relaxed">
                                                Yth. Orang Tua/Wali dari <span className="font-bold text-amber-300">{simStudentName}</span> (Kelas {simClassName}),
                                                <br /><br />
                                                Terima kasih, surat konfirmasi <span className="font-bold text-cyan-300">SAKIT / IZIN</span> telah terverifikasi oleh pihak sekolah. Semoga lekas sembuh!
                                            </p>
                                        )}

                                        {simType === 'pelanggaran' && (
                                            <p className="text-[11px] leading-relaxed">
                                                Yth. Orang Tua/Wali dari <span className="font-bold text-amber-300">{simStudentName}</span> (Kelas {simClassName}),
                                                <br /><br />
                                                Pemberitahuan bahwa siswa mencatatkan pelanggaran kedisiplinan: <span className="font-bold text-amber-400">{simViolationName}</span>.
                                                <br /><br />
                                                Sistem Guru BK menginfokan total akumulasi poin saat ini: <span className="font-bold text-rose-400">15 Poin</span>.
                                            </p>
                                        )}

                                        {simType === 'rekap' && (
                                            <p className="text-[11px] leading-relaxed">
                                                Yth. Orang Tua/Wali dari <span className="font-bold text-amber-300">{simStudentName}</span> (Kelas {simClassName}),
                                                <br /><br />
                                                📊 <span className="font-bold text-cyan-300">REKAP KEHADIRAN BULAN INI:</span>
                                                <br />
                                                &bull; Hadir: 18 Hari
                                                <br />
                                                &bull; Sakit/Izin: 1 Hari
                                                <br />
                                                &bull; Alfa: 0 Hari
                                                <br />
                                                Persentase Kehadiran: <span className="font-bold text-emerald-400">94.7%</span>.
                                            </p>
                                        )}

                                        <div className="text-[9px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1">
                                            <span>07:30</span>
                                            <span className="text-emerald-400 font-bold">✓✓</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ROLE SHOWCASE MODUL */}
            <section id="peran" className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                        Multi-Role Solution
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Disesuaikan untuk Setiap Peran Pengguna
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Klik pada peran di bawah ini untuk melihat fitur utama dan tanggung jawab masing-masing akun.
                    </p>
                </div>

                {/* Role Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {rolesDemo.map((r, idx) => {
                        const Icon = r.icon;
                        return (
                            <button
                                key={r.role}
                                onClick={() => setActiveRole(idx)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                    activeRole === idx
                                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-lg'
                                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{r.role}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Active Role Content Card */}
                <div className="max-w-4xl mx-auto bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                        <div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${rolesDemo[activeRole].color}`}>
                                {rolesDemo[activeRole].tag}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                                {rolesDemo[activeRole].role}
                            </h3>
                        </div>
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                            <span>Coba Akun Demo {rolesDemo[activeRole].role}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                        {rolesDemo[activeRole].desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {rolesDemo[activeRole].features.map((feat) => (
                            <div key={feat} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs font-semibold text-slate-200">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMPARISON TABLE (Manual vs SIMAK PRO) */}
            <section id="komparasi" className="relative z-10 py-16 bg-slate-900/40 border-y border-slate-800/80">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                            Mengapa Pilih SIMAK PRO?
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Perbandingan Cara Manual vs SIMAK PRO
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                                    <th className="py-3 px-4">Fitur / Kriteria</th>
                                    <th className="py-3 px-4 text-rose-400 bg-rose-950/20 rounded-t-xl">Cara Manual (Kertas/Excel)</th>
                                    <th className="py-3 px-4 text-emerald-400 bg-emerald-950/20 rounded-t-xl">Sistem SIMAK PRO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                <tr>
                                    <td className="py-3 px-4 text-slate-200 font-bold">Notifikasi Orang Tua</td>
                                    <td className="py-3 px-4 text-slate-400 bg-rose-950/10">Lambat / Harus telpon manual satu per satu</td>
                                    <td className="py-3 px-4 text-emerald-300 bg-emerald-950/10 font-bold">Otomatis via WA Gateway instant</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-slate-200 font-bold">Rekapitulasi Laporan Bulanan</td>
                                    <td className="py-3 px-4 text-slate-400 bg-rose-950/10">Membutuhkan waktu berhari-hari</td>
                                    <td className="py-3 px-4 text-emerald-300 bg-emerald-950/10 font-bold">Selesai dalam 1-Klik (Ekspor Excel)</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-slate-200 font-bold">Pencatatan Poin Kedisiplinan BK</td>
                                    <td className="py-3 px-4 text-slate-400 bg-rose-950/10">Buku fisik sering hilang atau tercecer</td>
                                    <td className="py-3 px-4 text-emerald-300 bg-emerald-950/10 font-bold">Database terpusat dengan riwayat lengkap</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-slate-200 font-bold">Risiko Kehilangan Data</td>
                                    <td className="py-3 px-4 text-slate-400 bg-rose-950/10">Tinggi (Kertas rusak/rusak flashdisk)</td>
                                    <td className="py-3 px-4 text-emerald-300 bg-emerald-950/10 font-bold">Aman dengan Cloud Backup otomatis</td>
                                </tr>
                                <tr>
                                    <td className="py-3 px-4 text-slate-200 font-bold">Kemudahan Akses Perangkat</td>
                                    <td className="py-3 px-4 text-slate-400 bg-rose-950/10">Terbatas di ruang komputer sekolah</td>
                                    <td className="py-3 px-4 text-emerald-300 bg-emerald-950/10 font-bold">Bisa diakses dari HP, Tablet, &amp; Laptop</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                        Testimoni Sekolah
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                        Apa Kata Mereka yang Sudah Menggunakan SIMAK PRO?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:-translate-y-1.5 transition-all">
                        <div className="space-y-2">
                            <div className="flex text-amber-400 gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "Sangat membantu efisiensi kerja wali kelas dan Guru BK. Notifikasi WA otomatis membuat orang tua siswa lebih responsif terhadap kehadiran anaknya."
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-800">
                            <div className="text-xs font-bold text-white">Drs. H. Ahmad Wijaya</div>
                            <div className="text-[10px] text-slate-400">Kepala Sekolah SMP Negeri 2 Depok</div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:-translate-y-1.5 transition-all">
                        <div className="space-y-2">
                            <div className="flex text-amber-400 gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "Rekap poin pelanggaran siswa jadi transparan dan rapi. Ekspor Excel bulanan untuk laporan BK sangat cepat hanya 1 klik."
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-800">
                            <div className="text-xs font-bold text-white">Siti Nurhaliza, S.Pd</div>
                            <div className="text-[10px] text-slate-400">Guru BK SMA Merdeka</div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:-translate-y-1.5 transition-all">
                        <div className="space-y-2">
                            <div className="flex text-amber-400 gap-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "Sebagai orang tua, saya merasa tenang karena setiap pagi langsung dapat notifikasi jam berapa anak saya masuk kelas via WhatsApp."
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-800">
                            <div className="text-xs font-bold text-white">Bambang Haryanto</div>
                            <div className="text-[10px] text-slate-400">Wali Murid</div>
                        </div>
                    </div>

                </div>
            </section>

            {/* FAQ ACCORDION */}
            <section id="faq" className="relative z-10 py-16 bg-slate-900/40 border-t border-slate-800/80">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="text-center space-y-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                            Pertanyaan Umum
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Frequently Asked Questions (FAQ)
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {faqItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                                        <span>{item.q}</span>
                                    </span>
                                    {activeFaq === idx ? <ChevronUp className="h-4 w-4 text-cyan-400" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                                </button>
                                {activeFaq === idx && (
                                    <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* CTA BANNER & FOOTER WITH ANIMATED 3D ASSETS */}
            <footer className="relative z-10 bg-slate-950 border-t border-slate-800/80 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Final CTA Banner Card */}
                    <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 p-8 sm:p-12 rounded-3xl border border-cyan-500/30 text-center space-y-4 mb-16 relative overflow-hidden shadow-2xl">
                        
                        {/* Background Animated Floating 3D Icons */}
                        <img src="/hero_3d_school.png" alt="3D School" className="h-36 w-36 object-contain absolute -left-6 -bottom-6 opacity-30 pointer-events-none animate-float-3d" />
                        <img src="/wa_3d_icon.png" alt="3D WA" className="h-32 w-32 object-contain absolute -right-4 -top-4 opacity-30 pointer-events-none animate-float-reverse" />

                        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight relative z-10">
                            Siap Modernisasi Sistem Kehadiran Sekolah Anda?
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto relative z-10">
                            Daftarkan sekolah Anda sekarang juga secara gratis dan rasakan kemudahan pengelolaan presensi serta notifikasi WhatsApp otomatis.
                        </p>
                        <div className="pt-2 flex flex-wrap justify-center gap-3 relative z-10">
                            <Link
                                href="/login?mode=register"
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all"
                            >
                                Daftar Sekolah Sekarang
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition-all"
                            >
                                Masuk ke Portal Login
                            </Link>
                        </div>
                    </div>

                    {/* Footer Nav & Copyright */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <img src="/logo_terpusat.png" alt="Logo" className="h-6 w-6 object-contain" />
                            <span className="font-bold text-slate-400">SIMAK PRO &bull; Sistem Informasi Manajemen Akademik dan Kedisiplinan</span>
                        </div>
                        <div>
                            &copy; {new Date().getFullYear()} SIMAK PRO. Hak Cipta Dilindungi Undang-Undang.
                        </div>
                    </div>

                </div>
            </footer>

        </div>
    );
}
