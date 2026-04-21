import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function Header({ currentView, searchTerm, setSearchTerm, openNewTicket }) {
    let title = 'Resumen de Actividad';
    if (currentView === 'tickets') title = 'Gestión de Tickets';
    if (currentView === 'notas') title = 'Tablero de Notas';

    return (
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
            <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar ticket o cliente..." 
                        className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-64 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={openNewTicket}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Nuevo Reporte
                </button>
            </div>
        </header>
    );
}
