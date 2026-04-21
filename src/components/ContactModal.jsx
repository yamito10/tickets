import React, { useState, useEffect } from 'react';
import { PhoneCall, X, Copy } from 'lucide-react';

export default function ContactModal({ isVisible, onClose, ticketData, showToast }) {
    const [status, setStatus] = useState('NO EXITOSA');
    const [contact, setContact] = useState('');
    const [phone, setPhone] = useState('');
    const [agreement, setAgreement] = useState('N/A');
    const [solution, setSolution] = useState('');
    const [nextCall, setNextCall] = useState('N/A');

    useEffect(() => {
        if (isVisible && ticketData) {
            setContact(ticketData.customerName || '');
            setPhone(ticketData.customerPhone || '');
            setSolution('');
            setStatus('NO EXITOSA');
            setAgreement('N/A');
            setNextCall('N/A');
        }
    }, [isVisible, ticketData]);

    if (!isVisible) return null;

    const handleGenerate = () => {
        const template = `• Status de Llamada: ${status}\n• Contacto: ${contact}, Teléfono celular : ${phone}\n\n• Acuerdo: ${agreement}\n\n• Solución: ${solution}\n\n• Hora y Fecha de próxima llamada: ${nextCall}`;

        const textArea = document.createElement("textarea");
        textArea.value = template;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Plantilla copiada al portapapeles');
            onClose();
        } catch (err) {
            showToast('Error al copiar', true);
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><PhoneCall className="w-5 h-5 text-blue-500" /> Registro de Llamada</h3>
                    <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status de Llamada</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="EXITOSA">EXITOSA</option>
                            <option value="NO EXITOSA">NO EXITOSA</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Contacto</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={contact} onChange={(e) => setContact(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono celular</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Acuerdo</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={agreement} onChange={(e) => setAgreement(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Solución / Comentarios</label>
                        <textarea rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Me intento comunicar con cliente..." value={solution} onChange={(e) => setSolution(e.target.value)}></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Hora y Fecha de próxima llamada</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={nextCall} onChange={(e) => setNextCall(e.target.value)} />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 items-center">
                    <button onClick={handleGenerate} type="button" className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Generar
                    </button>
                </div>
            </div>
        </div>
    );
}
