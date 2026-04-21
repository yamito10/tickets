import React from 'react';
import { FilterX, Clock, Calendar } from 'lucide-react';
import { getPriorityStyle, getStatusStyle, FormatSchedule } from '../utils/helpers';

export default function TicketsView({ tickets, searchTerm, advStatus, setAdvStatus, advDate, setAdvDate, advAssignedTime, setAdvAssignedTime, clearAdvancedFilters, onOpenTicket }) {
    
    let filtered = tickets;

    if (advStatus) {
        if (advStatus === 'Activos') {
            filtered = filtered.filter(t => t.status !== 'Resuelto');
        } else {
            filtered = filtered.filter(t => t.status === advStatus);
        }
    }

    if (advDate) {
        filtered = filtered.filter(t => {
            const d = new Date(t.createdAt);
            const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            return ds === advDate;
        });
    }

    if (advAssignedTime) {
        filtered = filtered.filter(t => t.assignedTime === advAssignedTime);
    }

    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(lowerSearch) || 
            t.customerName.toLowerCase().includes(lowerSearch) ||
            (t.customerCompany && t.customerCompany.toLowerCase().includes(lowerSearch)) ||
            t.id.toLowerCase().includes(lowerSearch) ||
            t.status.toLowerCase().includes(lowerSearch) ||
            (t.folio && t.folio.toLowerCase().includes(lowerSearch)) ||
            (t.account && t.account.toLowerCase().includes(lowerSearch))
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in flex flex-col h-full">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estatus</label>
                    <select 
                        value={advStatus} onChange={(e) => setAdvStatus(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none min-w-[120px] bg-white"
                    >
                        <option value="">Todos</option>
                        <option value="Activos">Activos</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="Escalado L2">Escalado L2</option>
                        <option value="Esperando Cliente">Esperando Cliente</option>
                        <option value="Resuelto">Resuelto</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Creación</label>
                    <input 
                        type="date" 
                        value={advDate} onChange={(e) => setAdvDate(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hora de Asignación</label>
                    <input 
                        type="time" 
                        value={advAssignedTime} onChange={(e) => setAdvAssignedTime(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                    />
                </div>
                <div className="flex-1 flex justify-end">
                    <button onClick={clearAdvancedFilters} className="text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <FilterX className="w-4 h-4" /> Limpiar filtros
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                        <tr>
                            <th className="px-6 py-4 font-medium">Ticket</th>
                            <th className="px-6 py-4 font-medium">Cuenta</th>
                            <th className="px-6 py-4 font-medium">Reporte</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Prioridad</th>
                            <th className="px-6 py-4 font-medium">Razón Social</th>
                            <th className="px-6 py-4 font-medium">Nivel 2</th>
                            <th className="px-6 py-4 font-medium">Fecha de creación</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-500">No se encontraron tickets.</td></tr>
                        ) : (
                            filtered.map(t => (
                                <tr key={t.id} onClick={() => onOpenTicket(t.id)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-blue-600 text-sm">{t.folio || '-'}</div>
                                        {t.assignedTime && <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1" title="Hora de Asignación"><Clock className="w-3 h-3" /> {t.assignedTime}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700 text-xs">{t.account || '-'}</td>
                                    <td className="px-6 py-4"><div className="max-w-[200px] truncate font-medium text-slate-800">{t.title}</div></td>
                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(t.status)}`}>{t.status}</span></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityStyle(t.priority)}`}>{t.priority}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-800 font-semibold">{t.customerCompany || t.customerName}</div>
                                        <FormatSchedule start={t.customerStartTime} end={t.customerEndTime} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">{t.l2Assignee || <span className="text-slate-300 italic">No asignado</span>}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        <div className="flex items-center gap-1.5" title="Fecha de creación"><Calendar className="w-3.5 h-3.5" /> {new Date(t.createdAt).toLocaleDateString()}</div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
