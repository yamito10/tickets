import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, X, Copy, Download, Sparkles, Loader2 } from 'lucide-react';
import { generateExcelReport, copyToClipboardTSV } from '../utils/excelExport';
import { generateAiReport } from '../utils/aiReport';
import AiReportModal from './AiReportModal';

export default function ExportModal({ isVisible, onClose, tickets, showToast }) {
    const [startVal, setStartVal] = useState('');
    const [endVal, setEndVal] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [clientFilter, setClientFilter] = useState('');
    
    // Estados para el reporte de IA
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [aiHtml, setAiHtml] = useState(null);

    useEffect(() => {
        if (isVisible) {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartVal(firstDay.toISOString().split('T')[0]);
            setEndVal(today.toISOString().split('T')[0]);
            setStatusFilter('Todos');
            setClientFilter('');
        }
    }, [isVisible]);

    if (!isVisible) return null;

    const getFilteredTickets = () => {
        if (!startVal || !endVal) {
            showToast('Por favor selecciona las fechas', true);
            return null;
        }
        const startDate = new Date(startVal + 'T00:00:00');
        const endDate = new Date(endVal + 'T23:59:59');

        let filtered = tickets.filter(t => {
            const tDate = new Date(t.createdAt);
            const matchDate = tDate >= startDate && tDate <= endDate;
            const matchStatus = statusFilter === 'Todos' || t.status === statusFilter;
            const matchClient = !clientFilter || 
                                (t.customerCompany && t.customerCompany.toLowerCase().includes(clientFilter.toLowerCase())) || 
                                (t.customerName && t.customerName.toLowerCase().includes(clientFilter.toLowerCase()));
            
            return matchDate && matchStatus && matchClient;
        });
        
        if (filtered.length === 0) {
            showToast('No hay tickets que coincidan con estos filtros', true);
            return null;
        }
        return filtered;
    };

    const handleExportExcel = async (e) => {
        e.preventDefault();
        if (tickets.length === 0) {
            showToast('No hay tickets en la base de datos', true);
            return;
        }
        const filtered = getFilteredTickets();
        if (!filtered) return;

        await generateExcelReport(filtered);
        showToast(`Reporte generado con ${filtered.length} tickets`);
        onClose();
    };

    const handleCopyTSV = () => {
        if (tickets.length === 0) {
            showToast('No hay tickets en la base de datos', true);
            return;
        }
        const filtered = getFilteredTickets();
        if (!filtered) return;

        const success = copyToClipboardTSV(filtered);
        if (success) {
            showToast(`Copiados ${filtered.length} tickets al portapapeles`);
            onClose();
        } else {
            showToast('Error al copiar datos', true);
        }
    };

    const handleGenerateAi = async () => {
        if (tickets.length === 0) {
            showToast('No hay tickets en la base de datos', true);
            return;
        }
        const filtered = getFilteredTickets();
        if (!filtered) return;

        setIsGeneratingAi(true);
        try {
            const html = await generateAiReport(filtered);
            setAiHtml(html);
            showToast('✨ Reporte Inteligente generado con éxito');
        } catch (error) {
            console.error('Error con IA:', error);
            showToast(error.message || 'Error al generar reporte con IA', true);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Configurar Reporte</h3>
                    <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form id="export-form" onSubmit={handleExportExcel} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Inicio</label>
                            <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={startVal} onChange={(e) => setStartVal(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Fin</label>
                            <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={endVal} onChange={(e) => setEndVal(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Estatus del Ticket</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="Todos">Todos</option>
                            <option value="Nuevo">Nuevo</option>
                            <option value="En Progreso">En Progreso</option>
                            <option value="Escalado L2">Escalado L2</option>
                            <option value="Esperando Cliente">Esperando Cliente</option>
                            <option value="Resuelto">Resuelto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente / Razón Social (Opcional)</label>
                        <input type="text" placeholder="Filtrar por nombre o empresa..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} />
                    </div>
                </form>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-end gap-3">
                    <button onClick={onClose} type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors mr-auto" disabled={isGeneratingAi}>Cancelar</button>
                    
                    <button onClick={handleGenerateAi} disabled={isGeneratingAi} type="button" className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Reporte Inteligente IA
                    </button>
                    
                    <button onClick={handleCopyTSV} disabled={isGeneratingAi} type="button" className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Copiar Datos
                    </button>
                    
                    <button type="submit" form="export-form" disabled={isGeneratingAi} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center gap-2">
                        <Download className="w-4 h-4" /> Excel
                    </button>
                </div>
            </div>

            <AiReportModal 
                isVisible={!!aiHtml} 
                onClose={() => setAiHtml(null)} 
                htmlContent={aiHtml} 
            />
        </div>
    );
}
