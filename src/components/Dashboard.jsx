import React, { useMemo } from 'react';
import { Ticket, AlertCircle, Clock, CheckCircle2, MoreVertical, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { getPriorityStyle, FormatSchedule } from '../utils/helpers';

const STATUS_COLORS = {
    'Nuevo': '#3b82f6',
    'En Progreso': '#6366f1',
    'Escalado L2': '#a855f7',
    'Esperando Cliente': '#f97316',
    'Resuelto': '#22c55e'
};

const PRIORITY_COLORS = {
    'Baja': '#22c55e',
    'Media': '#eab308',
    'Alta': '#f97316',
    'Crítica': '#ef4444'
};

function StatCard({ icon: Icon, label, value, color, trend, onClick }) {
    return (
        <div onClick={onClick} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className={`p-3.5 rounded-xl text-white shadow-lg ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-slate-800">{value}</p>
                    {trend !== undefined && (
                        <span className={`text-xs font-semibold flex items-center gap-0.5 mb-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                <p className="font-semibold">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard({ tickets, onFilterStatus, onOpenTicket }) {
    const totals = tickets.length;
    const resolved = tickets.filter(t => t.status === 'Resuelto').length;
    const active = totals - resolved;
    const escalated = tickets.filter(t => t.status === 'Escalado L2').length;
    const waiting = tickets.filter(t => t.status === 'Esperando Cliente').length;

    const criticals = tickets.filter(t => (t.priority === 'Crítica' || t.priority === 'Alta') && t.status !== 'Resuelto');

    // Datos para gráfica de tickets por día (últimos 7 días)
    const weeklyData = useMemo(() => {
        const days = [];
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            const created = tickets.filter(t => {
                const d = new Date(t.createdAt);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === dateStr;
            }).length;

            const resolvedCount = tickets.filter(t => {
                if (!t.resolvedAt) return false;
                const d = new Date(t.resolvedAt);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === dateStr;
            }).length;

            days.push({
                name: dayNames[date.getDay()],
                fullDate: `${date.getDate()}/${date.getMonth() + 1}`,
                Creados: created,
                Resueltos: resolvedCount
            });
        }
        return days;
    }, [tickets]);

    // Datos para gráfica de distribución por estatus
    const statusData = useMemo(() => {
        const counts = {};
        tickets.forEach(t => {
            counts[t.status] = (counts[t.status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: STATUS_COLORS[name] || '#94a3b8'
        }));
    }, [tickets]);

    // Datos para distribución por prioridad
    const priorityData = useMemo(() => {
        const priorities = ['Baja', 'Media', 'Alta', 'Crítica'];
        return priorities.map(p => ({
            name: p,
            value: tickets.filter(t => t.priority === p && t.status !== 'Resuelto').length,
            color: PRIORITY_COLORS[p]
        })).filter(p => p.value > 0);
    }, [tickets]);

    // Tasa de resolución
    const resolutionRate = totals > 0 ? Math.round((resolved / totals) * 100) : 0;

    // Actividad reciente
    const recentActivity = useMemo(() => {
        const allEvents = [];
        
        tickets.forEach(t => {
            if (t.comments) {
                t.comments.filter(c => c.isSystem).forEach(c => {
                    allEvents.push({
                        id: c.id,
                        text: c.text.replace('Registro de Sistema: ', ''),
                        date: c.date,
                        ticketFolio: t.folio || t.id,
                        ticketId: t.id
                    });
                });
            }
        });

        return allEvents
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);
    }, [tickets]);

    const renderPieLabel = ({ name, percent }) => {
        if (percent < 0.05) return null;
        return `${name} ${(percent * 100).toFixed(0)}%`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard icon={Ticket} label="Activos" value={active} color="bg-gradient-to-br from-blue-500 to-blue-600" onClick={() => onFilterStatus('Activos')} />
                <StatCard icon={AlertCircle} label="Escalados L2" value={escalated} color="bg-gradient-to-br from-purple-500 to-purple-600" onClick={() => onFilterStatus('Escalado L2')} />
                <StatCard icon={Clock} label="Esperando Cliente" value={waiting} color="bg-gradient-to-br from-orange-500 to-orange-600" onClick={() => onFilterStatus('Esperando Cliente')} />
                <StatCard icon={CheckCircle2} label="Resueltos" value={resolved} color="bg-gradient-to-br from-emerald-500 to-emerald-600" onClick={() => onFilterStatus('Resuelto')} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart - Tickets por día */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Actividad Semanal</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Tickets creados vs resueltos (últimos 7 días)</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Creados</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Resueltos</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorCreados" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorResueltos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="Creados" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCreados)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                            <Area type="monotone" dataKey="Resueltos" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResueltos)" dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Donut Chart - Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Distribución</h3>
                    <p className="text-xs text-slate-500 mb-4">Por estatus actual</p>
                    {statusData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Sin datos</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {statusData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                                            <span className="text-slate-600">{s.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Prioridad</h3>
                    <p className="text-xs text-slate-500 mb-4">Tickets activos por nivel</p>
                    {priorityData.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Sin tickets activos</div>
                    ) : (
                        <div className="space-y-3 mt-2">
                            {['Crítica', 'Alta', 'Media', 'Baja'].map(p => {
                                const count = tickets.filter(t => t.priority === p && t.status !== 'Resuelto').length;
                                const maxCount = Math.max(...['Crítica', 'Alta', 'Media', 'Baja'].map(pr => tickets.filter(t => t.priority === pr && t.status !== 'Resuelto').length), 1);
                                const pct = (count / maxCount) * 100;
                                return (
                                    <div key={p}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-slate-600">{p}</span>
                                            <span className="text-xs font-bold text-slate-800">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: PRIORITY_COLORS[p] }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-500">Tasa de resolución</p>
                                <p className="text-2xl font-bold text-slate-800">{resolutionRate}%</p>
                                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${resolutionRate}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Últimos movimientos del sistema</p>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-[320px] overflow-y-auto">
                        {recentActivity.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-10">No hay actividad registrada aún. Crea tu primer ticket para comenzar.</p>
                        ) : (
                            recentActivity.map(event => (
                                <div key={event.id} onClick={() => onOpenTicket(event.ticketId)} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-700 leading-snug">
                                            <span className="font-semibold text-blue-600 group-hover:underline">{event.ticketFolio}</span>
                                            {' — '}
                                            {event.text}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{new Date(event.date).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Critical Tickets */}
            {criticals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Tickets Críticos / Alta Prioridad
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-2">{criticals.length}</span>
                    </h3>
                    <div className="space-y-3">
                        {criticals.map(t => (
                            <div key={t.id} onClick={() => onOpenTicket(t.id)} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-red-50/50 hover:border-red-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getPriorityStyle(t.priority)}`}>
                                        {t.priority}
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-800 truncate w-64">{t.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {t.folio || t.id} &bull; {t.status} &bull; Creado: {new Date(t.createdAt).toLocaleDateString()}
                                        </p>
                                        <FormatSchedule start={t.customerStartTime} end={t.customerEndTime} />
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-blue-600"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
