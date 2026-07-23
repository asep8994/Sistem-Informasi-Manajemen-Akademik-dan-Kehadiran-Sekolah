'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppData, School, User } from '../types';
import { getRawAppData, saveRawAppData } from './state';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ConfirmState {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'danger' | 'warning' | 'info';
}

interface AppContextType {
    appData: AppData | null;
    updateAppData: (newData: AppData) => void;
    currentSchool: School | null;
    currentUser: User | null;
    activePage: string;
    setActivePage: (page: string) => void;
    showToast: (message: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    handleLogout: () => void;
    switchSchool: (schoolId: string | null) => void;
    login: (user: User, schoolId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);
    const [appData, setAppDataState] = useState<AppData | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
    const [activePage, setActivePage] = useState('dashboard');
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [confirm, setConfirm] = useState<ConfirmState>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        setIsMounted(true);
        // Load initial app data
        const data = getRawAppData();
        setAppDataState(data);
    }, []);

    // Session auth check & state sync on mount & pathname changes
    useEffect(() => {
        if (!isMounted) return;

        const rawUser = sessionStorage.getItem('currentUser');
        const schoolId = sessionStorage.getItem('currentSchoolId');

        if (rawUser) {
            try {
                const userObj = JSON.parse(rawUser) as User;
                if (!currentUser || currentUser.id !== userObj.id) {
                    setCurrentUser(userObj);
                    if (userObj.role === 'superadmin') {
                        setActivePage('superadmin');
                    }
                }
                if (schoolId && schoolId !== currentSchoolId) {
                    setCurrentSchoolId(schoolId);
                }
                if (pathname === '/login') {
                    router.push('/');
                }
            } catch (e) {
                console.error(e);
                sessionStorage.clear();
                setCurrentUser(null);
                setCurrentSchoolId(null);
                if (pathname !== '/login' && pathname !== '/landing') {
                    router.push('/login');
                }
            }
        } else {
            if (currentUser) {
                setCurrentUser(null);
            }
            if (pathname !== '/login' && pathname !== '/landing') {
                router.push('/login');
            }
        }
    }, [isMounted, pathname, router]);

    const currentSchool = appData?.schools.find((s) => s.id === currentSchoolId) || null;

    // Dynamic tab favicon & title handler
    useEffect(() => {
        if (!isMounted) return;

        const defaultFavicon = '/logo_terpusat.png';
        const schoolLogo = currentSchool?.logo || defaultFavicon;

        const links = document.querySelectorAll("link[rel*='icon']");
        if (links.length > 0) {
            links.forEach((link) => {
                (link as HTMLLinkElement).href = schoolLogo;
            });
        } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = schoolLogo;
            document.head.appendChild(newLink);
        }

        // Dynamic tab title update matching current school logo / school name
        if (currentSchool) {
            document.title = `SIMAK PRO - ${currentSchool.name}`;
        } else {
            document.title = "SIMAK PRO - Sistem Informasi Manajemen Akademik dan Kedisiplinan";
        }
    }, [currentSchool?.logo, currentSchool?.name, isMounted]);

    const updateAppData = (newData: AppData) => {
        saveRawAppData(newData);
        setAppDataState(newData);
    };

    const showToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirm({
            show: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirm((prev) => ({ ...prev, show: false }));
            },
        });
    };

    const login = (user: User, schoolId: string | null) => {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        if (schoolId) {
            sessionStorage.setItem('currentSchoolId', schoolId);
            setCurrentSchoolId(schoolId);
        } else {
            sessionStorage.removeItem('currentSchoolId');
            setCurrentSchoolId(null);
        }
        setCurrentUser(user);
        if (user.role === 'superadmin') {
            setActivePage('superadmin');
        } else {
            setActivePage('dashboard');
        }
    };

    const handleLogout = () => {
        showConfirm('Keluar Sistem', 'Apakah Anda yakin ingin keluar dari sistem absensi?', () => {
            sessionStorage.clear();
            setCurrentUser(null);
            setCurrentSchoolId(null);
            router.push('/login');
        });
    };

    const switchSchool = (schoolId: string | null) => {
        if (schoolId) {
            sessionStorage.setItem('currentSchoolId', schoolId);
            setCurrentSchoolId(schoolId);
        } else {
            sessionStorage.removeItem('currentSchoolId');
            setCurrentSchoolId(null);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <AppContext.Provider
            value={{
                appData,
                updateAppData,
                currentSchool,
                currentUser,
                activePage,
                setActivePage,
                showToast,
                showConfirm,
                handleLogout,
                switchSchool,
                login,
            }}
        >
            {children}

            {/* Custom Premium Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 rounded-xl bg-white p-4 shadow-xl border min-w-[280px] max-w-[400px] animate-in slide-in-from-top duration-300`}
                        style={{
                            borderColor: 
                                toast.type === 'success' ? '#e2f0d9' : 
                                toast.type === 'danger' ? '#fadbd8' : 
                                toast.type === 'warning' ? '#fdebd0' : '#d1f2eb'
                        }}
                    >
                        <div className="shrink-0">
                            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                            {toast.type === 'danger' && <AlertCircle className="h-5 w-5 text-rose-600" />}
                            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                            {toast.type === 'info' && <Info className="h-5 w-5 text-cyan-600" />}
                        </div>
                        <div className="flex-1 text-xs font-semibold text-slate-700">
                            {toast.message}
                        </div>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            className="shrink-0 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Custom Premium Confirmation Dialog Modal */}
            {confirm.show && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="flex items-center gap-2 text-amber-500 mb-3">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="text-sm font-bold text-slate-800">{confirm.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            {confirm.message}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setConfirm((prev) => ({ ...prev, show: false }))}
                                className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs px-4 py-2 transition-all active:scale-[0.98]"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirm.onConfirm}
                                className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 transition-all shadow-sm active:scale-[0.98]"
                            >
                                Ya, Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
