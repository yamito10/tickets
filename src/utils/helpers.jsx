import React from 'react';
import { Clock, PhoneOff, Phone } from 'lucide-react';

export function getPriorityStyle(p) {
    switch(p) {
        case 'Crítica': return 'bg-red-100 text-red-800 border-red-200';
        case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default: return 'bg-green-100 text-green-800 border-green-200';
    }
}

export function getStatusStyle(s) {
    switch(s) {
        case 'Resuelto': return 'text-green-600 bg-green-50';
        case 'Escalado L2': return 'text-purple-600 bg-purple-50';
        case 'Esperando Cliente': return 'text-orange-600 bg-orange-50';
        case 'Nuevo': return 'text-blue-600 bg-blue-50';
        default: return 'text-gray-600 bg-gray-50';
    }
}

export function isOutsideBusinessHours(start, end) {
    if (!start || !end) return false;
    const now = new Date();
    const currentStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    if (start <= end) {
        return currentStr < start || currentStr > end;
    } else {
        // Rango cruza la medianoche (ej. 22:00 a 06:00)
        return currentStr < start && currentStr > end;
    }
}

export function FormatSchedule({ start, end }) {
    if (!start || !end) return <span className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> Sin horario asignado</span>;
    
    const outside = isOutsideBusinessHours(start, end);
    if (outside) {
        return <div className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1" title="Fuera de horario de atención"><PhoneOff className="w-3 h-3" /> {start} a {end} (No marcar)</div>;
    } else {
        return <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1" title="Dentro de horario"><Phone className="w-3 h-3" /> {start} a {end}</div>;
    }
}

export function generateId(ticketsData) {
    const lastIdStr = ticketsData && ticketsData.length > 0 
        ? ticketsData.map(t => parseInt((t.id || 'INC-1000').split('-')[1] || 0)).reduce((a, b) => Math.max(a, b), 1000)
        : 1000;
    return `INC-${lastIdStr + 1}`;
}
