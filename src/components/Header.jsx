import React from 'react';
import { Search, Plus, Menu } from 'lucide-react';

export default function Header({ currentView, searchTerm, setSearchTerm, openNewTicket, onMenuToggle }) {
    let title = 'Resumen de Actividad';
    if (currentView === 'tickets') title = 'Gestión de Tickets';
    if (currentView === 'notas') title = 'Tablero de Notas';

    return (
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onMenuToggle}
                    className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-800 hidden sm:block">{title}</h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
                <div className="relative flex-1 max-w-xs md:max-w-none md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-full md:w-64 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={openNewTicket}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shrink-0"
                >
                    <Plus className="w-4 h-4" /> <span className="hidden md:inline">Nuevo Reporte</span>
                </button>
            </div>
        </header>
    );
}
