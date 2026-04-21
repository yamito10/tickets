import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function generateExcelReport(filteredTickets) {
    const rows = filteredTickets.map(t => {
        const dateCreated = new Date(t.createdAt).toLocaleString();
        const timeAssigned = t.assignedTime || 'No registrada';
        const dateResolved = t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : 'Pendiente';
        
        let notasBitacora = 'Sin notas registradas';
        if (t.comments && t.comments.length > 0) {
            const lastComment = t.comments[t.comments.length - 1];
            notasBitacora = `[${new Date(lastComment.date).toLocaleDateString()}] ${lastComment.text}`;
        }

        return [
            t.folio || t.id,
            t.account || 'N/A',
            t.customerCompany || 'N/A',
            t.title,
            t.description,
            t.status,
            t.priority,
            t.l2Assignee || 'Ninguno',
            t.customerName,
            dateCreated,
            timeAssigned,
            dateResolved,
            t.finalSolution || 'N/A',
            notasBitacora
        ];
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Filtrado');

    worksheet.addTable({
        name: 'TablaTickets',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: [
            { name: 'Ticket / Folio' }, { name: 'Cuenta' }, { name: 'Razón Social' }, { name: 'Reporte (Título)' },
            { name: 'Falla Detectada' }, { name: 'Estatus' }, { name: 'Prioridad' },
            { name: 'Nivel 2 Asignado' }, { name: 'Contacto Principal' }, { name: 'Fecha de Creación' },
            { name: 'Hora de Asignación' }, { name: 'Fecha/Hora Resuelto' }, { name: 'Solución Final' }, { name: 'Notas (Última Bitácora)' }
        ],
        rows: rows
    });

    const colWidths = [15, 15, 30, 40, 60, 15, 12, 20, 25, 22, 18, 22, 50, 60];
    worksheet.columns.forEach((column, i) => {
        column.width = colWidths[i];
        column.alignment = { vertical: 'top', wrapText: true };
    });

    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
    
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Tickets_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function copyToClipboardTSV(filteredTickets) {
    const headers = [
        'Ticket / Folio', 'Cuenta', 'Razón Social', 'Reporte (Título)', 'Falla Detectada',
        'Estatus', 'Prioridad', 'Nivel 2 Asignado', 'Contacto Principal',
        'Fecha de Creación', 'Hora de Asignación', 'Fecha/Hora Resuelto', 'Solución Final', 'Notas (Última Bitácora)'
    ];

    const tsvRows = [headers.join('\t')];

    filteredTickets.forEach(t => {
        const dateCreated = new Date(t.createdAt).toLocaleString();
        const timeAssigned = t.assignedTime || 'No registrada';
        const dateResolved = t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : 'Pendiente';
        
        let notasBitacora = 'Sin notas registradas';
        if (t.comments && t.comments.length > 0) {
            const lastComment = t.comments[t.comments.length - 1];
            notasBitacora = `[${new Date(lastComment.date).toLocaleDateString()}] ${lastComment.text}`;
        }

        const clean = (str) => String(str || '').replace(/\t/g, ' ').replace(/\n/g, ' | ');

        const row = [
            clean(t.folio || t.id),
            clean(t.account || 'N/A'),
            clean(t.customerCompany || 'N/A'),
            clean(t.title),
            clean(t.description),
            clean(t.status),
            clean(t.priority),
            clean(t.l2Assignee || 'Ninguno'),
            clean(t.customerName),
            clean(dateCreated),
            clean(timeAssigned),
            clean(dateResolved),
            clean(t.finalSolution || 'N/A'),
            clean(notasBitacora)
        ];

        tsvRows.push(row.join('\t'));
    });

    const tsvString = tsvRows.join('\n');

    const textArea = document.createElement("textarea");
    textArea.value = tsvString;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}
