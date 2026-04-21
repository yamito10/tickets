import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isVisible, onClose, onConfirm }) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">¿Eliminar elemento?</h3>
                    <p className="text-sm text-slate-500">Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esto permanentemente?</p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button onClick={onConfirm} type="button" className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm">Sí, eliminar</button>
                </div>
            </div>
        </div>
    );
}
