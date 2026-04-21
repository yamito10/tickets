import React, { useRef } from 'react';
import { LayoutDashboard, Ticket, StickyNote, BarChart2, FileBarChart, Database, Download, Upload, Wifi, WifiOff } from 'lucide-react';

function UserAvatar({ email }) {
    const initials = email 
        ? email.split('@')[0].slice(0, 2).toUpperCase() 
        : '??';
    
    const colors = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-amber-500',
        'from-rose-500 to-red-500',
    ];
    const colorIndex = email ? email.charCodeAt(0) % colors.length : 0;

    return (
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 shrink-0`}>
            {initials}
        </div>
    );
}

export default function Sidebar({ currentView, setCurrentView, openExportModal, exportBackup, importBackup, onLogout, user, ticketCounts }) {
    const fileInputRef = useRef(null);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            importBackup(file);
        }
        e.target.value = '';
    };

    const activeCount = ticketCounts?.active || 0;
    const criticalCount = ticketCounts?.critical || 0;

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10 hidden md:flex">
            {/* Logo */}
            <div className="p-5 flex items-center gap-3 text-white border-b border-slate-800">
                <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight leading-none">AFIS PRO</h1>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wider mt-0.5">GESTIÓN DE TICKETS</p>
                </div>
            </div>

            {/* User Profile */}
            {user && (
                <div className="px-4 py-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <UserAvatar email={user.email} />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-200 truncate">{user.email?.split('@')[0]}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 ml-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></div>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">En línea</span>
                    </div>
                </div>
            )}
            
            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Menú Principal</p>
                <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-blue-600/20 text-blue-400 font-medium shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                    <LayoutDashboard className="w-5 h-5" /> 
                    <span className="flex-1 text-left">Dashboard</span>
                </button>
                <button 
                    onClick={() => setCurrentView('tickets')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${currentView === 'tickets' ? 'bg-blue-600/20 text-blue-400 font-medium shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                    <Ticket className="w-5 h-5" /> 
                    <span className="flex-1 text-left">Mis Tickets</span>
                    {activeCount > 0 && (
                        <span className="bg-blue-500/20 text-blue-400 text-[11px] font-bold px-2 py-0.5 rounded-full">{activeCount}</span>
                    )}
                </button>
                <button 
                    onClick={() => setCurrentView('notas')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${currentView === 'notas' ? 'bg-blue-600/20 text-blue-400 font-medium shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}
                >
                    <StickyNote className="w-5 h-5" /> 
                    <span className="flex-1 text-left">Notas</span>
                </button>

                {criticalCount > 0 && (
                    <div className="mt-4 mx-1 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[11px] font-bold text-red-400">{criticalCount} ticket{criticalCount > 1 ? 's' : ''} crítico{criticalCount > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}
            </nav>

            {/* Reports & Data */}
            <div className="p-4 border-t border-slate-800 text-sm">
                <p className="px-1 mb-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Herramientas</p>
                <button 
                    onClick={openExportModal}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs transition-colors mb-3 shadow-sm font-medium"
                >
                    <FileBarChart className="w-4 h-4" /> Generar Reporte
                </button>

                <div className="flex gap-2">
                    <button 
                        onClick={exportBackup}
                        className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" /> Exportar
                    </button>
                    <label className="flex items-center justify-center gap-1.5 flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" /> Importar
                        <input 
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImport}
                        />
                    </label>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/50">
                    <button 
                        onClick={onLogout}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </aside>
    );
}
