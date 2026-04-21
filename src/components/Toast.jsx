import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, isError, isVisible }) {
    return (
        <div className={`fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 z-50 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div>
                {isError ? <AlertCircle className="text-red-400 w-5 h-5" /> : <CheckCircle2 className="text-green-400 w-5 h-5" />}
            </div>
            <span className="text-sm">{message}</span>
        </div>
    );
}
