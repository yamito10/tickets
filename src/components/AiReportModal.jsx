import React, { useRef } from 'react';
import { X, Download, Printer, Sparkles } from 'lucide-react';

export default function AiReportModal({ isVisible, onClose, htmlContent }) {
    const reportRef = useRef(null);

    if (!isVisible) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte Ejecutivo AFIS PRO</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
                        h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
                        h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        h2 { font-size: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
                        th { background-color: #f8fafc; }
                        ul, ol { padding-left: 20px; }
                        li { margin-bottom: 8px; }
                        .report-header { text-align: center; margin-bottom: 40px; }
                        .report-date { color: #64748b; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="report-header">
                        <h1>Reporte Ejecutivo de Operaciones</h1>
                        <p class="report-date">Generado por AFIS PRO AI el ${new Date().toLocaleDateString()}</p>
                    </div>
                    ${htmlContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-slate-200">
                
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Reporte Analítico IA</h3>
                            <p className="text-xs text-slate-500">Generado por Gemini 2.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                            <Printer className="w-4 h-4" /> Imprimir / PDF
                        </button>
                        <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8 bg-white" ref={reportRef}>
                    <div 
                        className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4 prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-3 prose-td:p-3 prose-li:my-1"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>
            </div>
        </div>
    );
}
