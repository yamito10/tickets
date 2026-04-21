import React, { useRef } from 'react';
import { LayoutDashboard, Ticket, StickyNote, BarChart2, FileBarChart, Database, Download, Upload } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, openExportModal, exportBackup, importBackup, onLogout }) {
    const fileInputRef = useRef(null);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            importBackup(file);
        }
        e.target.value = '';
    };

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10 hidden md:flex">
            <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
                <LayoutDashboard className="text-blue-400" />
                <h1 className="text-xl font-bold tracking-tight">AFIS PRO</h1>
            </div>
            
            <nav className="flex-1 py-6 px-3 space-y-1">
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </button>
                <button 
                    onClick={() => setCurrentView('tickets')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'tickets' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                    <Ticket className="w-5 h-5" /> Mis Tickets
                </button>
                <button 
                    onClick={() => setCurrentView('notas')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${currentView === 'notas' ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                    <StickyNote className="w-5 h-5" /> Notas
                </button>
            </nav>

            <div className="p-4 border-t border-slate-800 text-sm">
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <BarChart2 className="w-4 h-4" /> <span>Reportes</span>
                </div>
                <button 
                    onClick={openExportModal}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors mb-4 shadow-sm font-medium"
                >
                    <FileBarChart className="w-4 h-4" /> Generar Reporte
                </button>

                <div className="flex items-center gap-2 mb-3 text-slate-400 pt-4 border-t border-slate-800/50">
                    <Database className="w-4 h-4" /> <span>Datos (LocalStorage)</span>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={exportBackup}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors"
                    >
                        <Download className="w-4 h-4" /> Exportar Respaldo
                    </button>
                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" /> Importar Respaldo
                        <input 
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImport}
                        />
                    </label>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <button 
                        onClick={onLogout}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded text-xs font-bold transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </aside>
    );
}
