'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { CalendarDays, Plus, Download } from 'lucide-react';

export default function MapelAgendaView() {
    const { currentSchool, currentUser, appData, updateAppData, showToast } = useApp();

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');

    const userAny = currentUser as any;
    const mapelName = currentUser?.mapelName || userAny?.subjectName || 'Mata Pelajaran';
    const assignedIds = (Array.isArray(currentUser?.classes) && currentUser.classes.length > 0)
        ? currentUser.classes
        : (Array.isArray(userAny?.assignedClassIds) && userAny.assignedClassIds.length > 0)
        ? userAny.assignedClassIds
        : [];
    let assignedClasses = currentSchool?.classes.filter(c => assignedIds.includes(c.id)) || [];
    if (assignedClasses.length === 0 && currentSchool?.classes) {
        assignedClasses = currentSchool.classes;
    }

    useEffect(() => {
        if (assignedClasses.length > 0) setSelectedClassId(assignedClasses[0].id);
        setSelectedDate(new Date().toISOString().slice(0, 10));
    }, [currentSchool, currentUser]);

    if (!currentSchool || !currentUser || !appData) return null;

    const myAgendas = (currentSchool.agendaMapel || [])
        .filter(a => (a as any).username === currentUser.username)
        .sort((a, b) => b.id.localeCompare(a.id));

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId || !selectedDate || !topic.trim()) {
            showToast('Lengkapi form agenda dengan benar!', 'warning');
            return;
        }

        const newAgenda = {
            id: `agenda-${Date.now()}`,
            username: currentUser.username,
            date: selectedDate,
            classId: selectedClassId,
            subject: mapelName,
            materi: topic.trim(),
            catatan: notes.trim(),
            // Legacy compatibility fields
            topic: topic.trim(),
            notes: notes.trim()
        };

        const updatedAgendas = [...(currentSchool.agendaMapel || []), newAgenda];

        const updatedSchools = appData.schools.map(sch => {
            if (sch.id === currentSchool.id) {
                return { ...sch, agendaMapel: updatedAgendas };
            }
            return sch;
        });

        updateAppData({ ...appData, schools: updatedSchools });
        setTopic('');
        setNotes('');
        showToast('Agenda mengajar berhasil disimpan!', 'success');
    };

    const handleExportPDF = async () => {
        showToast('Menyiapkan dokumen PDF...', 'info');
        
        let container: HTMLDivElement | null = null;
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const tableSrc = document.getElementById('pdf-agenda-print-area');

            if (!tableSrc) {
                showToast('Gagal memuat area riwayat agenda.', 'danger');
                return;
            }

            container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '800px';
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '28px';
            container.style.boxSizing = 'border-box';

            const headerDiv = document.createElement('div');
            headerDiv.style.marginBottom = '20px';
            headerDiv.style.borderBottom = '2px solid #0b2f4d';
            headerDiv.style.paddingBottom = '12px';
            headerDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="height: 50px; width: 50px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; padding: 2px; background-color: #f8fafc;">
                        <img src="${currentSchool.logo || '/logo_terpusat.png'}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 15px; font-weight: bold; color: #1e293b; font-family: sans-serif;">AGENDA MENGAJAR GURU</h2>
                        <h3 style="margin: 3px 0 0 0; font-size: 12px; font-weight: bold; color: #0b2f4d; font-family: sans-serif;">${currentSchool.name}</h3>
                        <p style="margin: 4px 0 0 0; font-size: 9px; color: #64748b; font-weight: 600; font-family: sans-serif;">
                            Nama Guru: <b>${currentUser.name}</b> &bull; Mapel: <b>${mapelName}</b> &bull; TA: <b>${currentSchool.tahunAjaran} (${currentSchool.semester})</b>
                        </p>
                    </div>
                </div>
            `;
            container.appendChild(headerDiv);

            const tableClone = tableSrc.cloneNode(true) as HTMLElement;
            tableClone.style.border = '1px solid #e2e8f0';
            tableClone.style.boxShadow = 'none';
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
            const imgWidth = 210;
            const pageHeight = 297;
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

            pdf.save(`Agenda_Mengajar_${currentUser.name.replace(/\s+/g, '_')}.pdf`);
            showToast('Agenda berhasil diekspor ke PDF!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Gagal mengekspor agenda ke PDF.', 'danger');
        } finally {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Form Pencatatan Agenda */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div>
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-cyan-600" />
                        <span>Catat Agenda Mengajar</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dokumentasikan topik materi, catatan pelajaran, dan kelas yang diampu.</p>
                </div>

                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Kelas</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        >
                            {assignedClasses.map(c => (
                                <option key={c.id} value={c.id}>Kelas {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal</label>
                        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Mata Pelajaran</label>
                        <input type="text" value={mapelName} readOnly
                            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-1.5 px-3 text-xs font-semibold text-slate-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Topik / Materi</label>
                        <input type="text" placeholder="Contoh: Persamaan Kuadrat" value={topic} onChange={(e) => setTopic(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Catatan Tambahan</label>
                        <textarea rows={2} placeholder="Catatan opsional..." value={notes} onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 focus:bg-white"
                        />
                    </div>

                    <div className="flex items-end">
                        <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2.5 transition-all shadow-sm active:scale-[0.98]">
                            <Plus className="h-4 w-4" />
                            <span>Simpan Agenda</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-600">Riwayat Agenda Mengajar Saya</h4>
                    {myAgendas.length > 0 && (
                        <button
                            onClick={handleExportPDF}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-1.5 px-3 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                        >
                            <Download className="h-3.5 w-3.5 text-cyan-600" />
                            <span>Ekspor PDF</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" id="pdf-agenda-print-area">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Tanggal</th>
                                <th className="py-3 px-4">Kelas</th>
                                <th className="py-3 px-4">Mapel</th>
                                <th className="py-3 px-4">Materi / Topik</th>
                                <th className="py-3 px-4">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                            {myAgendas.map((agenda, index) => {
                                const kelas = currentSchool.classes.find(c => c.id === agenda.classId);
                                return (
                                    <tr key={agenda.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                                        <td className="py-3 px-4 text-slate-500 font-medium">{agenda.date}</td>
                                        <td className="py-3 px-4 font-bold text-slate-800">{kelas ? kelas.name : '—'}</td>
                                        <td className="py-3 px-4"><span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-600">{agenda.subject || mapelName}</span></td>
                                        <td className="py-3 px-4 text-slate-700">{agenda.materi || (agenda as any).topic || '—'}</td>
                                        <td className="py-3 px-4 text-slate-400">{agenda.catatan || (agenda as any).notes || '—'}</td>
                                    </tr>
                                );
                            })}
                            {myAgendas.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-slate-400 py-8">Belum ada agenda mengajar yang dicatat.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
