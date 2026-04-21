import React, { useState } from 'react';
import { PenLine, Save, Trash2 } from 'lucide-react';

export default function NotesView({ notes, setNotes, showToast, openDeleteConfirm }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleAddNote = (e) => {
        e.preventDefault();
        const newNote = {
            id: 'nota-' + Date.now(),
            title: title,
            content: content,
            date: new Date().toISOString()
        };
        setNotes(prev => [newNote, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        setTitle('');
        setContent('');
        showToast('Nota creada correctamente');
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            <form onSubmit={handleAddNote} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3 shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1"><PenLine className="w-4 h-4 text-amber-500" /> Agregar nueva nota rápida</h3>
                <input 
                    type="text" 
                    placeholder="Título o asunto de la nota..." 
                    className="w-full font-semibold text-slate-800 border-b border-slate-200 pb-2 outline-none focus:border-amber-400 transition-colors bg-transparent" 
                    required 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea 
                    placeholder="Escribe aquí tu lluvia de ideas, datos importantes, IPs, extensiones..." 
                    className="w-full text-sm outline-none resize-none bg-amber-50/50 p-3 rounded-lg border border-transparent focus:border-amber-200 transition-colors" 
                    rows="3" 
                    required 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                    <button type="submit" className="bg-amber-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2">
                        <Save className="w-4 h-4" /> Guardar Nota
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-10 content-start flex-1">
                {notes.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">No tienes notas guardadas aún. Utiliza el formulario superior para crear una.</div>
                ) : (
                    notes.map(n => (
                        <div key={n.id} className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-sm flex flex-col gap-3 relative group hover:shadow-md transition-shadow">
                            <button onClick={() => openDeleteConfirm('note', n.id)} className="absolute top-3 right-3 text-amber-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 hover:bg-red-100 p-1.5 rounded-md" title="Eliminar nota">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <h4 className="font-bold text-amber-900 pr-8 leading-tight">{n.title}</h4>
                            <p className="text-sm text-amber-800/80 whitespace-pre-wrap flex-1 leading-relaxed">{n.content}</p>
                            <div className="text-[10px] font-semibold text-amber-500 mt-2 uppercase tracking-wider">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
