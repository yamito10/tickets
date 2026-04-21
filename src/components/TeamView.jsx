import React, { useState, useMemo } from 'react';
import { Users, Ticket, CheckCircle2, AlertCircle, Clock, ChevronRight, ChevronLeft, BarChart2, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getPriorityStyle, getStatusStyle } from '../utils/helpers';

const STATUS_COLORS = {
    'Nuevo': '#3b82f6',
    'En Progreso': '#6366f1',
    'Escalado L2': '#a855f7',
    'Esperando Cliente': '#f97316',
    'Resuelto': '#22c55e'
};

const AVATAR_COLORS = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-red-500',
    'from-indigo-500 to-violet-500',
    'from-sky-500 to-blue-500',
];

function UserAvatar({ email, size = 'md' }) {
    const initials = email ? email.split('@')[0].slice(0, 2).toUpperCase() : '??';
    const colorIndex = email ? email.charCodeAt(0) % AVATAR_COLORS.length : 0;
    const sizeClass = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';

    return (
        <div className={`${sizeClass} rounded-xl bg-gradient-to-br ${AVATAR_COLORS[colorIndex]} flex items-center justify-center text-white font-bold shadow-lg shrink-0`}>
            {initials}
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                <p className="font-semibold">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.fill || p.color }}>{p.name}: {p.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export default function TeamView({ allTickets, allUsers, currentUserId }) {
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Agrupar tickets por usuario
    const userStats = useMemo(() => {
        const grouped = {};

        allTickets.forEach(t => {
            const uid = t.userId;
            if (!grouped[uid]) {
                grouped[uid] = { userId: uid, tickets: [], total: 0, active: 0, resolved: 0, critical: 0, escalated: 0 };
            }
            grouped[uid].tickets.push(t);
            grouped[uid].total++;
            if (t.status === 'Resuelto') grouped[uid].resolved++;
            else grouped[uid].active++;
            if ((t.priority === 'Crítica' || t.priority === 'Alta') && t.status !== 'Resuelto') grouped[uid].critical++;
            if (t.status === 'Escalado L2') grouped[uid].escalated++;
        });

        // Enriquecer con datos de perfil
        return Object.values(grouped).map(stat => {
            const userProfile = allUsers.find(u => u.uid === stat.userId);
            return {
                ...stat,
                email: userProfile?.email || 'Usuario desconocido',
                displayName: userProfile?.displayName || 'Sin nombre',
                lastLogin: userProfile?.lastLogin || null,
                resolutionRate: stat.total > 0 ? Math.round((stat.resolved / stat.total) * 100) : 0
            };
        }).sort((a, b) => b.active - a.active);
    }, [allTickets, allUsers]);

    const selectedUser = selectedUserId ? userStats.find(u => u.userId === selectedUserId) : null;

    // Datos para gráfica del usuario seleccionado
    const selectedUserStatusData = useMemo(() => {
        if (!selectedUser) return [];
        const counts = {};
        selectedUser.tickets.forEach(t => {
            counts[t.status] = (counts[t.status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name, value, color: STATUS_COLORS[name] || '#94a3b8'
        }));
    }, [selectedUser]);

    const selectedUserWeeklyData = useMemo(() => {
        if (!selectedUser) return [];
        const days = [];
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const created = selectedUser.tickets.filter(t => {
                const d = new Date(t.createdAt);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === dateStr;
            }).length;
            days.push({ name: dayNames[date.getDay()], Tickets: created });
        }
        return days;
    }, [selectedUser]);

    // Vista de detalle de un usuario
    if (selectedUser) {
        return (
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedUserId(null)} className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <UserAvatar email={selectedUser.email} size="lg" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{selectedUser.displayName}</h2>
                        <p className="text-sm text-slate-500">{selectedUser.email}</p>
                        {selectedUser.lastLogin && (
                            <p className="text-xs text-slate-400 mt-0.5">Última conexión: {new Date(selectedUser.lastLogin).toLocaleString()}</p>
                        )}
                    </div>
                    {selectedUser.userId === currentUserId && (
                        <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Tú</span>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-2xl font-bold text-slate-800">{selectedUser.total}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Total</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-2xl font-bold text-blue-600">{selectedUser.active}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Activos</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-2xl font-bold text-emerald-600">{selectedUser.resolved}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Resueltos</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-2xl font-bold text-red-600">{selectedUser.critical}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Críticos</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                        <p className="text-2xl font-bold text-emerald-600">{selectedUser.resolutionRate}%</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Resolución</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Tickets creados (últimos 7 días)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={selectedUserWeeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="Tickets" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Por estatus</h3>
                        {selectedUserStatusData.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Sin datos</div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={140}>
                                    <PieChart>
                                        <Pie data={selectedUserStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                                            {selectedUserStatusData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1.5 mt-2">
                                    {selectedUserStatusData.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
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

                {/* Ticket List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">Todos los tickets de {selectedUser.displayName}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Ticket</th>
                                    <th className="px-6 py-3 font-medium">Reporte</th>
                                    <th className="px-6 py-3 font-medium">Estado</th>
                                    <th className="px-6 py-3 font-medium">Prioridad</th>
                                    <th className="px-6 py-3 font-medium">Razón Social</th>
                                    <th className="px-6 py-3 font-medium">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedUser.tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-semibold text-blue-600 text-xs">{t.folio || t.id}</td>
                                        <td className="px-6 py-3 max-w-[200px] truncate text-slate-800">{t.title}</td>
                                        <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(t.status)}`}>{t.status}</span></td>
                                        <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityStyle(t.priority)}`}>{t.priority}</span></td>
                                        <td className="px-6 py-3 text-slate-600 text-xs">{t.customerCompany || '-'}</td>
                                        <td className="px-6 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Vista principal: lista de usuarios
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Observabilidad del Equipo</h2>
                    <p className="text-sm text-slate-500">{userStats.length} usuario{userStats.length !== 1 ? 's' : ''} activo{userStats.length !== 1 ? 's' : ''} &bull; {allTickets.length} tickets totales</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-bold text-slate-800">{allTickets.length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Total Global</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-bold text-blue-600">{allTickets.filter(t => t.status !== 'Resuelto').length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Activos Global</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-bold text-emerald-600">{allTickets.filter(t => t.status === 'Resuelto').length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Resueltos Global</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p className="text-3xl font-bold text-red-600">{allTickets.filter(t => (t.priority === 'Crítica' || t.priority === 'Alta') && t.status !== 'Resuelto').length}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Críticos Global</p>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-700">Miembros del equipo</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {userStats.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-400 text-sm">No hay usuarios con tickets registrados.</div>
                    ) : (
                        userStats.map(u => (
                            <div 
                                key={u.userId} 
                                onClick={() => setSelectedUserId(u.userId)} 
                                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-all group"
                            >
                                <UserAvatar email={u.email} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-800 truncate">{u.displayName}</p>
                                        {u.userId === currentUserId && (
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Tú</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                </div>

                                <div className="hidden md:flex items-center gap-6 text-center">
                                    <div title="Activos">
                                        <p className="text-lg font-bold text-blue-600">{u.active}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Activos</p>
                                    </div>
                                    <div title="Resueltos">
                                        <p className="text-lg font-bold text-emerald-600">{u.resolved}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Resueltos</p>
                                    </div>
                                    <div title="Críticos">
                                        <p className="text-lg font-bold text-red-500">{u.critical}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Críticos</p>
                                    </div>
                                    <div title="Tasa de resolución">
                                        <p className="text-lg font-bold text-slate-700">{u.resolutionRate}%</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Resolución</p>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
