import React from 'react';
import { Ticket, AlertCircle, Clock, CheckCircle2, MoreVertical } from 'lucide-react';
import { getPriorityStyle, FormatSchedule } from '../utils/helpers';

export default function Dashboard({ tickets, onFilterStatus, onOpenTicket }) {
    const totals = tickets.length;
    const resolved = tickets.filter(t => t.status === 'Resuelto').length;
    const active = totals - resolved;
    const escalated = tickets.filter(t => t.status === 'Escalado L2').length;
    const waiting = tickets.filter(t => t.status === 'Esperando Cliente').length;

    const criticals = tickets.filter(t => (t.priority === 'Crítica' || t.priority === 'Alta') && t.status !== 'Resuelto');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => onFilterStatus('Activos')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all">
                    <div className="p-4 rounded-lg text-white shadow-inner bg-blue-500"><Ticket /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Total Activos</p><p className="text-2xl font-bold text-slate-800">{active}</p></div>
                </div>
                <div onClick={() => onFilterStatus('Escalado L2')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all">
                    <div className="p-4 rounded-lg text-white shadow-inner bg-purple-500"><AlertCircle /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Escalados L2</p><p className="text-2xl font-bold text-slate-800">{escalated}</p></div>
                </div>
                <div onClick={() => onFilterStatus('Esperando Cliente')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all">
                    <div className="p-4 rounded-lg text-white shadow-inner bg-orange-500"><Clock /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Esperando Cliente</p><p className="text-2xl font-bold text-slate-800">{waiting}</p></div>
                </div>
                <div onClick={() => onFilterStatus('Resuelto')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all">
                    <div className="p-4 rounded-lg text-white shadow-inner bg-green-500"><CheckCircle2 /></div>
                    <div><p className="text-sm text-slate-500 font-medium">Resueltos</p><p className="text-2xl font-bold text-slate-800">{resolved}</p></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Tickets Críticos / Alta Prioridad</h3>
                <div className="space-y-3">
                    {criticals.length === 0 ? (
                        <p className="text-slate-500 text-sm">No hay tickets críticos pendientes. ¡Buen trabajo!</p>
                    ) : (
                        criticals.map(t => (
                            <div key={t.id} onClick={() => onOpenTicket(t.id)} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getPriorityStyle(t.priority)}`}>
                                        {t.priority}
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-800 truncate w-64">{t.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Creado: {new Date(t.createdAt).toLocaleDateString()} &bull; Estado: {t.status} {t.assignedTime ? `&bull; Asignado: ${t.assignedTime}` : ''}
                                        </p>
                                        <FormatSchedule start={t.customerStartTime} end={t.customerEndTime} />
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-blue-600"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
