import React, { useState, useEffect } from 'react';
import { Copy, X, Wand2, Calendar, CheckCircle2, User, PlusCircle, Trash2, Users, FileText, Maximize2, Minimize2, Send, PhoneCall, Edit3 } from 'lucide-react';
import { getPriorityStyle, generateId } from '../utils/helpers';

export default function TicketModal({ isVisible, onClose, ticketData, onSave, onDelete, onOpenContact, showToast }) {
    const isNew = !ticketData;
    const [isEditable, setIsEditable] = useState(isNew);
    const [isBitacoraExpanded, setIsBitacoraExpanded] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [folio, setFolio] = useState('');
    const [account, setAccount] = useState('');
    const [status, setStatus] = useState('Nuevo');
    const [priority, setPriority] = useState('Media');
    const [assignedTime, setAssignedTime] = useState('');
    const [description, setDescription] = useState('');
    const [finalSolution, setFinalSolution] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [showC2, setShowC2] = useState(false);
    const [customerName2, setCustomerName2] = useState('');
    const [customerPhone2, setCustomerPhone2] = useState('');
    const [customerEmail2, setCustomerEmail2] = useState('');
    const [customerStartTime, setCustomerStartTime] = useState('');
    const [customerEndTime, setCustomerEndTime] = useState('');
    const [l2Assignee, setL2Assignee] = useState('');
    const [comments, setComments] = useState([]);
    const [templateText, setTemplateText] = useState('');
    const [newComment, setNewComment] = useState('');


    useEffect(() => {
        if (isVisible) {
            setIsBitacoraExpanded(false);
            if (!isNew && ticketData) {
                setTitle(ticketData.title || '');
                setFolio(ticketData.folio || '');
                setAccount(ticketData.account || '');
                setStatus(ticketData.status || 'Nuevo');
                setPriority(ticketData.priority || 'Media');
                setAssignedTime(ticketData.assignedTime || '');
                setDescription(ticketData.description || '');
                setFinalSolution(ticketData.finalSolution || '');
                setCustomerCompany(ticketData.customerCompany || '');
                setCustomerName(ticketData.customerName || '');
                setCustomerPhone(ticketData.customerPhone || '');
                setCustomerEmail(ticketData.customerEmail || '');
                setCustomerName2(ticketData.customerName2 || '');
                setCustomerPhone2(ticketData.customerPhone2 || '');
                setCustomerEmail2(ticketData.customerEmail2 || '');
                setShowC2(!!ticketData.customerName2);
                setCustomerStartTime(ticketData.customerStartTime || '');
                setCustomerEndTime(ticketData.customerEndTime || '');
                setL2Assignee(ticketData.l2Assignee || '');
                setComments(ticketData.comments || []);
                setIsEditable(false);
                setTemplateText('');
            } else {
                setTitle('');
                setFolio('');
                setAccount('');
                setStatus('Nuevo');
                setPriority('Media');
                setAssignedTime('');
                setDescription('');
                setFinalSolution('');
                setCustomerCompany('');
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                setCustomerName2('');
                setCustomerPhone2('');
                setCustomerEmail2('');
                setShowC2(false);
                setCustomerStartTime('');
                setCustomerEndTime('');
                setL2Assignee('');
                setComments([]);
                setIsEditable(true);
                setTemplateText('');
            }
            setNewComment('');
        }
    }, [isVisible, ticketData, isNew]);

    if (!isVisible) return null;



    const handleProcessRegex = () => {
        if (!templateText.trim()) {
            showToast('Por favor pega un texto válido primero', true);
            return;
        }
        
        const parsed = {};
        const rawText = templateText.trim();
        const lines = rawText.split('\n');
        
        // Campos técnicos adicionales para la descripción
        const techFields = [];
        // Campos de falla para la descripción
        const fallaFields = [];

        // Helper: convierte horario con formato diverso a HH:MM
        const parseHorario = (val) => {
            // "24 / 7" o "24/7" o "24x7" o "24 horas"
            if (/24\s*[\/x]\s*7/i.test(val) || /24\s*horas/i.test(val)) {
                return { inicio: '00:00', fin: '23:59' };
            }
            // "L a D de 9 a 21" o similar con números
            const simpleRange = val.match(/(\d{1,2})\s*a\s*(\d{1,2})/i);
            if (simpleRange) {
                const s = parseInt(simpleRange[1]);
                const e = parseInt(simpleRange[2]);
                return { 
                    inicio: `${String(s).padStart(2, '0')}:00`, 
                    fin: `${String(e).padStart(2, '0')}:00` 
                };
            }
            // HH:MM a HH:MM
            const hm = val.match(/(\d{1,2}[:.]\d{2})\s*a\s*(\d{1,2}[:.]\d{2})/i);
            if (hm) {
                return { inicio: hm[1].replace('.', ':'), fin: hm[2].replace('.', ':') };
            }
            // AM/PM
            const ampm = val.match(/(\d{1,2})\s*(am|pm)\s*a\s*(\d{1,2})\s*(am|pm)/i);
            if (ampm) {
                let startH = parseInt(ampm[1]);
                let endH = parseInt(ampm[3]);
                if (ampm[2].toLowerCase() === 'pm' && startH !== 12) startH += 12;
                if (ampm[2].toLowerCase() === 'am' && startH === 12) startH = 0;
                if (ampm[4].toLowerCase() === 'pm' && endH !== 12) endH += 12;
                if (ampm[4].toLowerCase() === 'am' && endH === 12) endH = 0;
                return { 
                    inicio: `${String(startH).padStart(2, '0')}:00`, 
                    fin: `${String(endH).padStart(2, '0')}:00` 
                };
            }
            return null;
        };

        lines.forEach(line => {
            // Limpiar la línea: quitar comas al final y espacios extra
            const cleanLine = line.replace(/,\s*$/, '').trim();
            if (!cleanLine) return;

            // Separar por el primer ":" para obtener clave y valor
            const colonIdx = cleanLine.indexOf(':');
            if (colonIdx === -1) return;

            const rawKey = cleanLine.substring(0, colonIdx).trim().toLowerCase();
            const val = cleanLine.substring(colonIdx + 1).trim();
            
            // Si el valor está vacío, N/A o "--", ignorar
            const isEmptyVal = !val || val === 'N/A' || val === 'n/a' || val === '--' || val === '-';

            // ===== CUENTA =====
            if (/^cuenta/.test(rawKey) || /^cta/.test(rawKey)) {
                if (!isEmptyVal) parsed.cuenta = val;
                return;
            }

            // ===== RAZÓN SOCIAL =====
            if (/raz[oó]n\s*social/.test(rawKey) || /^titular/.test(rawKey) || /^rs\b/.test(rawKey) || /^cliente\b/.test(rawKey) || /^empresa\b/.test(rawKey)) {
                if (!isEmptyVal) parsed.razonSocial = val;
                return;
            }

            // ===== TÍTULO / FALLA =====
            if (/t[ií]tulo/.test(rawKey) || /^asunto/.test(rawKey) || /^reporte/.test(rawKey)) {
                if (!isEmptyVal) parsed.titulo = val;
                return;
            }

            // ===== ¿QUÉ FALLA PRESENTA? =====
            if (/qu[eé]\s*falla\s*presenta/.test(rawKey) || /falla\s*presenta/.test(rawKey)) {
                if (!isEmptyVal) {
                    parsed.titulo = val;
                    fallaFields.push(`Falla: ${val}`);
                }
                return;
            }

            // ===== CAMPOS DE DIAGNÓSTICO DE FALLA =====
            if (/d[oó]nde\s*se\s*ubica/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Ubicación falla: ${val}`);
                return;
            }
            if (/qu[eé]\s*percibi[oó]/.test(rawKey) || /qu[eé]\s*percibe/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Percepción: ${val}`);
                return;
            }
            if (/cu[aá]nto\s*tiempo/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Duración falla: ${val}`);
                return;
            }
            if (/falla\s*(?:es\s*)?recurrente/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Recurrente: ${val}`);
                return;
            }
            if (/falla\s*(?:fue|es)\s*total/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Falla total: ${val}`);
                return;
            }
            if (/falla\s*(?:fue|es)\s*parcial/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Falla parcial: ${val}`);
                return;
            }
            if (/p[aá]ginas\s*en\s*espec[ií]fico/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Páginas afectadas: ${val}`);
                return;
            }
            if (/wifi\s*o\s*ethernet/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Tipo conexión: ${val}`);
                return;
            }
            if (/falla\s*persiste\s*aislando/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Aislando red: ${val}`);
                return;
            }
            if (/cu[aá]ndo\s*la\s*present[oó]/.test(rawKey) || /desde\s*cuando/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Desde cuándo: ${val}`);
                return;
            }
            if (/descartar\s*falla\s*f[ií]sica/.test(rawKey)) {
                if (!isEmptyVal) fallaFields.push(`Falla física: ${val}`);
                return;
            }

            // ===== CONTACTO / NOMBRE =====
            if (/nombre\s*de\s*qui[eé]n\s*se\s*comunica/.test(rawKey) || /contacto\s*para\s*seguimiento/.test(rawKey)) {
                if (!isEmptyVal && !parsed.contacto) parsed.contacto = val;
                return;
            }
            if (/^contacto/.test(rawKey) || /^nombre/.test(rawKey)) {
                if (!isEmptyVal && !parsed.contacto) parsed.contacto = val;
                return;
            }

            // ===== TELÉFONO =====
            if (/tel[eé]fono\s*celular/.test(rawKey) || /tel[eé]fono\s*m[oó]vil/.test(rawKey) || /celular/.test(rawKey)) {
                if (!isEmptyVal) parsed.telefono = val;
                return;
            }
            if (/tel[eé]fono\s*fijo/.test(rawKey)) {
                // Solo si no tenemos teléfono principal
                if (!isEmptyVal && !parsed.telefono) parsed.telefono = val;
                return;
            }
            if (/^tel[eé]fono/.test(rawKey)) {
                if (!isEmptyVal && !parsed.telefono) parsed.telefono = val;
                return;
            }

            // ===== EMAIL =====
            if (/email/.test(rawKey) || /correo/.test(rawKey) || /e-mail/.test(rawKey)) {
                if (!isEmptyVal) parsed.email = val;
                return;
            }

            // ===== HORARIO DE ATENCIÓN EN SITIO (prioritario) =====
            if (/horario\s*de\s*atenci[oó]n\s*en\s*sitio/.test(rawKey) || /horario\s*atenci[oó]n\s*sitio/.test(rawKey)) {
                const h = parseHorario(val);
                if (h) {
                    parsed.horarioInicio = h.inicio;
                    parsed.horarioFin = h.fin;
                }
                return;
            }
            // Horario vía telefónica (secundario, solo si no hay horario sitio)
            if (/horario\s*de\s*atenci[oó]n\s*v[ií]a/.test(rawKey) || /horario\s*telef[oó]nica/.test(rawKey)) {
                if (!parsed.horarioInicio) {
                    const h = parseHorario(val);
                    if (h) {
                        parsed.horarioInicio = h.inicio;
                        parsed.horarioFin = h.fin;
                    }
                }
                return;
            }
            // Horario genérico
            if (/^horario/.test(rawKey)) {
                if (!parsed.horarioInicio) {
                    const h = parseHorario(val);
                    if (h) {
                        parsed.horarioInicio = h.inicio;
                        parsed.horarioFin = h.fin;
                    }
                }
                return;
            }

            // ===== PRIORIDAD =====
            if (/prioridad/.test(rawKey)) {
                const p = val.toLowerCase();
                if (p.includes('baja')) parsed.prioridad = 'Baja';
                else if (p.includes('media')) parsed.prioridad = 'Media';
                else if (p.includes('alta')) parsed.prioridad = 'Alta';
                else if (p.includes('critica') || p.includes('crítica')) parsed.prioridad = 'Crítica';
                return;
            }

            // ===== NOTA =====
            if (/^nota\b/.test(rawKey)) {
                if (!isEmptyVal) parsed.nota = val;
                return;
            }

            // ===== CAMPOS TÉCNICOS (para la descripción) =====
            if (/segmento/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Segmento: ${val}`);
                return;
            }
            if (/direcci[oó]n\s*de\s*instalaci[oó]n/.test(rawKey) || /direcci[oó]n/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Dirección: ${val}`);
                return;
            }
            if (/plan\s*contratado/.test(rawKey) || /plan/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Plan: ${val}`);
                return;
            }
            if (/modelo\s*de\s*la\s*ont/.test(rawKey) || /modelo\s*ont/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`ONT: ${val}`);
                return;
            }
            if (/^s\/n/.test(rawKey) || /^serial/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`S/N: ${val}`);
                return;
            }
            if (/^olt\b/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`OLT: ${val}`);
                return;
            }
            if (/posici[oó]n\s*de\s*la\s*ont/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Posición ONT: ${val}`);
                return;
            }
            if (/vlan/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`VLAN: ${val}`);
                return;
            }
            if (/estado\s*de\s*los\s*leds/.test(rawKey) || /leds/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`LEDs: ${val}`);
                return;
            }
            if (/modo\s*ont/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Modo ONT: ${val}`);
                return;
            }
            if (/valores?\s*de\s*potencia/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Potencia FO: ${val}`);
                return;
            }
            if (/topolog[ií]a/.test(rawKey) || /despu[eé]s\s*de\s*la\s*ont/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Topología post-ONT: ${val}`);
                return;
            }
            if (/ticket\s*reincidente/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Ticket reincidente: ${val}`);
                return;
            }
            if (/ip\s*fija/.test(rawKey) || /ip\s*din[aá]mica/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`IP: ${val}`);
                return;
            }
            if (/ip.*fijas/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`IPs fijas: ${val}`);
                return;
            }
            if (/saldo\s*actual/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Saldo: ${val}`);
                return;
            }
            if (/fecha\s*l[ií]mite\s*de\s*pago/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Fecha pago: ${val}`);
                return;
            }
            if (/fecha\s*de\s*corte/.test(rawKey)) {
                if (!isEmptyVal) techFields.push(`Fecha corte: ${val}`);
                return;
            }
        });

        // Construir la descripción con todos los campos recopilados
        let descParts = [];
        if (fallaFields.length > 0) {
            descParts.push('── DIAGNÓSTICO DE FALLA ──');
            descParts.push(...fallaFields);
        }
        if (techFields.length > 0) {
            descParts.push('');
            descParts.push('── DATOS TÉCNICOS ──');
            descParts.push(...techFields);
        }
        if (descParts.length > 0) {
            parsed.descripcion = descParts.join('\n');
        }

        // Si no se encontró prioridad, intentar inferir por contexto
        if (!parsed.prioridad) {
            const fullText = rawText.toLowerCase();
            if (fullText.includes('sin servicio') || fullText.includes('sin navegación') || fullText.includes('falla total') || fullText.includes('caída total')) {
                parsed.prioridad = 'Crítica';
            } else if (fullText.includes('lento') || fullText.includes('intermitencia')) {
                parsed.prioridad = 'Media';
            }
        }

        // Log para depuración
        console.log('[Regex Parser] Campos extraídos:', parsed);

        const fieldsFound = Object.keys(parsed).filter(k => parsed[k]).length;
        applyParsedData(parsed, `✅ Texto procesado (Sin IA) — ${fieldsFound} campos extraídos`);
    };

    const applyParsedData = (parsed, successMessage) => {
        if (parsed.cuenta) setAccount(parsed.cuenta);
        if (parsed.razonSocial) setCustomerCompany(parsed.razonSocial);
        if (parsed.titulo) setTitle(parsed.titulo);
        if (parsed.contacto) setCustomerName(parsed.contacto);
        if (parsed.telefono) setCustomerPhone(parsed.telefono);
        if (parsed.email) setCustomerEmail(parsed.email);
        if (parsed.horarioInicio) setCustomerStartTime(parsed.horarioInicio);
        if (parsed.horarioFin) setCustomerEndTime(parsed.horarioFin);
        if (parsed.prioridad) setPriority(parsed.prioridad);

        let descripcionCompleta = '';
        if (parsed.descripcion) descripcionCompleta += parsed.descripcion;
        if (parsed.nota) descripcionCompleta += `\n\nNOTA ADICIONAL:\n${parsed.nota}`;
        if (descripcionCompleta) setDescription(descripcionCompleta.trim());

        showToast(successMessage);
    };

    const handleCopySummary = () => {
        const companyText = customerCompany ? `\n*Razón Social:* ${customerCompany}` : '';
        const accountText = account ? `\n*Cuenta:* ${account}` : '';
        const emailText = customerEmail ? `\n*Correo:* ${customerEmail}` : '';
        
        let contact2Text = '';
        if (customerName2) {
            const phone2 = customerPhone2 ? ` / ${customerPhone2}` : '';
            const email2 = customerEmail2 ? ` / ${customerEmail2}` : '';
            contact2Text = `\n*Contacto Alterno:* ${customerName2}${phone2}${email2}`;
        }

        const scheduleText = (customerStartTime && customerEndTime) ? `\n*Horario:* ${customerStartTime} a ${customerEndTime}` : '';
        const assignedTimeText = assignedTime ? `\n*Hora Asignación:* ${assignedTime}` : '';
        const summary = `*Ticket:* ${folio}${accountText}\n*Asunto:* ${title}\n*Prioridad:* ${priority}\n*Estatus:* ${status}${assignedTimeText}${companyText}\n*Contacto Principal:* ${customerName}${emailText}${contact2Text}${scheduleText}\n*L2 Asignado:* ${l2Assignee || 'Ninguno'}\n*Última actualización:* ${comments.length > 0 ? comments[comments.length-1].text : 'Sin comentarios'}`;
        
        const textArea = document.createElement("textarea");
        textArea.value = summary;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Resumen copiado al portapapeles');
        } catch (err) {
            showToast('Error al copiar', true);
        }
        document.body.removeChild(textArea);
    };

    const getTicketDataToSave = (updatedComments) => {
        const tData = {
            title, folio, account, description, status, priority, assignedTime,
            finalSolution: status === 'Resuelto' ? finalSolution : '',
            customerCompany, customerName, customerPhone, customerEmail,
            customerName2: showC2 ? customerName2 : '',
            customerPhone2: showC2 ? customerPhone2 : '',
            customerEmail2: showC2 ? customerEmail2 : '',
            customerStartTime, customerEndTime, l2Assignee,
            comments: updatedComments,
            updatedAt: new Date().toISOString()
        };

        if (status === 'Resuelto') {
            tData.resolvedAt = (!isNew && ticketData && ticketData.resolvedAt) ? ticketData.resolvedAt : new Date().toISOString();
        } else {
            tData.resolvedAt = null;
        }

        return tData;
    };

    const togglePinComment = (id) => {
        const updated = comments.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c);
        setComments(updated);
        
        if (!isNew) {
            onSave(getTicketDataToSave(updated), false);
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const newC = {
            id: Date.now() + Math.random(),
            text: newComment.trim(),
            date: new Date().toISOString()
        };
        const updated = [...comments, newC];
        setComments(updated);
        setNewComment('');

        if (!isNew) {
            onSave(getTicketDataToSave(updated), false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let updatedComments = [...comments];
        
        // Si escribió algo y no le dio al botón de agregar, lo agregamos de todas formas
        if (newComment.trim()) {
            updatedComments.push({
                id: Date.now() + Math.random(),
                text: newComment.trim(),
                date: new Date().toISOString()
            });
            setNewComment('');
        }

        if (!isNew && ticketData) {
            if (ticketData.status !== status) {
                updatedComments.push({ id: Date.now() + Math.random(), text: `Registro de Sistema: El estatus cambió de '${ticketData.status}' a '${status}'.`, date: new Date().toISOString(), isSystem: true });
            }
            if (ticketData.priority !== priority) {
                updatedComments.push({ id: Date.now() + Math.random(), text: `Registro de Sistema: La prioridad cambió de '${ticketData.priority}' a '${priority}'.`, date: new Date().toISOString(), isSystem: true });
            }
            if (ticketData.l2Assignee !== l2Assignee) {
                const oldL2Text = ticketData.l2Assignee || 'Ninguno';
                const newL2Text = l2Assignee || 'Ninguno';
                updatedComments.push({ id: Date.now() + Math.random(), text: `Registro de Sistema: El escalamiento Nivel 2 cambió de '${oldL2Text}' a '${newL2Text}'.`, date: new Date().toISOString(), isSystem: true });
            }
        } else {
            updatedComments.push({ id: Date.now() + Math.random(), text: `Registro de Sistema: Ticket creado con estatus '${status}' y prioridad '${priority}'.`, date: new Date().toISOString(), isSystem: true });
        }

        onSave(getTicketDataToSave(updatedComments));
    };

    const renderComment = (c) => {
        const bgClass = c.isSystem ? 'bg-slate-100 border-slate-200 border-dashed' : (c.pinned ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200');
        const textClass = c.isSystem ? 'text-slate-500 italic text-[13px]' : 'text-slate-800 text-sm';
        const pinIconClass = c.pinned ? 'text-amber-500 fill-amber-500' : 'text-slate-300 group-hover:text-slate-500';

        return (
            <div key={c.id} className={`p-3 mb-3 rounded-lg shadow-sm border ${bgClass} relative group`}>
                {!c.isSystem && (
                    <button type="button" onClick={() => togglePinComment(c.id)} className="absolute top-3 right-3 transition-colors" title={c.pinned ? 'Desfijar nota' : 'Fijar nota'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${pinIconClass}`}><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.6V6a3 3 0 0 0-3-3h-0a3 3 0 0 0-3 3v4.6a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                    </button>
                )}
                <div className="pr-6">
                    <p className={textClass}>{c.text}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right uppercase tracking-wide">{new Date(c.date).toLocaleString()}</p>
            </div>
        );
    };

    const pinnedComments = comments.filter(c => c.pinned);
    const unpinnedComments = comments.filter(c => !c.pinned);

    const inputClass = (readOnly = false) => `w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm ${(!isEditable || readOnly) ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'}`;
    const inputClassSmall = (readOnly = false) => `w-full px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm ${(!isEditable || readOnly) ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'}`;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        {!isNew && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPriorityStyle(priority)}`}>{priority}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <button onClick={handleCopySummary} type="button" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium" title="Copiar resumen">
                                <Copy className="w-4 h-4" /> Resumen
                            </button>
                        )}
                        <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto flex flex-col md:flex-row">
                    <div className={`flex-1 p-6 border-r border-slate-100 space-y-6 overflow-y-auto transition-all duration-300 ${isBitacoraExpanded ? 'hidden' : ''}`}>
                        
                        {isNew && (
                            <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-xl">
                                <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-blue-600" /> Extraer Datos de Plantilla
                                </label>
                                <p className="text-[11px] text-slate-500 mb-2">Pega la plantilla del ticket y se extraerán automáticamente los campos: cuenta, razón social, contacto, teléfono, email, horario, falla, datos técnicos y más.</p>
                                <textarea rows="4" className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-xs text-slate-600 font-mono mb-2 bg-white/70" placeholder="Pega aquí la plantilla del ticket..." value={templateText} onChange={(e) => setTemplateText(e.target.value)}></textarea>
                                <div className="flex justify-end">
                                    <button type="button" onClick={handleProcessRegex} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm">
                                        <Wand2 className="w-3.5 h-3.5" /> Extraer Datos
                                    </button>
                                </div>
                            </div>
                        )}

                        <form id="ticket-form" onSubmit={handleSubmit} className="space-y-5">
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Título del Reporte</label>
                                    <input required type="text" className={inputClass()} placeholder="Ej. Falla de red en piso 3" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isEditable} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Ticket</label>
                                    <input required type="text" className={inputClass()} value={folio} onChange={(e) => setFolio(e.target.value)} disabled={!isEditable} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Cuenta</label>
                                    <input required type="text" className={inputClass()} placeholder="Ej. 123456" value={account} onChange={(e) => setAccount(e.target.value)} disabled={!isEditable} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Estatus</label>
                                    <select className={inputClass()} value={status} onChange={(e) => setStatus(e.target.value)} disabled={!isEditable}>
                                        <option value="Nuevo">Nuevo</option>
                                        <option value="En Progreso">En Progreso</option>
                                        <option value="Escalado L2">Escalado L2</option>
                                        <option value="Esperando Cliente">Esperando Cliente</option>
                                        <option value="Resuelto">Resuelto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Prioridad</label>
                                    <select className={inputClass()} value={priority} onChange={(e) => setPriority(e.target.value)} disabled={!isEditable}>
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Crítica">Crítica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hora Asignación</label>
                                    <input type="time" className={inputClass()} value={assignedTime} onChange={(e) => setAssignedTime(e.target.value)} disabled={!isEditable} />
                                </div>
                            </div>

                            {!isNew && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha de Creación</label>
                                        <input type="text" readOnly className="w-full px-3 py-1.5 border border-slate-200 bg-slate-100 rounded focus:outline-none text-sm text-slate-600 cursor-not-allowed" value={new Date(ticketData.createdAt).toLocaleString()} />
                                    </div>
                                    {status === 'Resuelto' && (
                                        <div>
                                            <label className="block text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Fecha de Resolución</label>
                                            <input type="text" readOnly className="w-full px-3 py-1.5 border border-emerald-200 bg-emerald-50 rounded focus:outline-none text-sm text-emerald-700 cursor-not-allowed font-medium" value={ticketData.resolvedAt ? new Date(ticketData.resolvedAt).toLocaleString() : 'Se registrará al guardar'} />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción Detallada</label>
                                <textarea required rows="3" className={`${inputClass()} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isEditable}></textarea>
                            </div>

                            {status === 'Resuelto' && (
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 mt-4 animate-fade-in">
                                    <label className="block text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Solución Final</label>
                                    <textarea required rows="2" className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-white text-sm" placeholder="Describe la solución o pasos que resolvieron este reporte..." value={finalSolution} onChange={(e) => setFinalSolution(e.target.value)} disabled={!isEditable}></textarea>
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-5">
                                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Datos del Cliente</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-slate-500 mb-1">Razón Social</label>
                                        <input required type="text" className={inputClassSmall()} placeholder="Ej. Empresa S.A. de C.V." value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} disabled={!isEditable} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Nombre de Contacto</label>
                                        <input required type="text" className={inputClassSmall()} value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={!isEditable} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Teléfono / Extensión</label>
                                        <input type="text" className={inputClassSmall()} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} disabled={!isEditable} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-slate-500 mb-1">Correo Electrónico</label>
                                        <input type="email" placeholder="ejemplo@correo.com" className={inputClassSmall()} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} disabled={!isEditable} />
                                    </div>
                                    
                                    {!showC2 && isEditable && (
                                        <div className="md:col-span-2">
                                            <button type="button" onClick={() => setShowC2(true)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 transition-colors w-fit">
                                                <PlusCircle className="w-4 h-4" /> Agregar contacto alterno
                                            </button>
                                        </div>
                                    )}

                                    {showC2 && (
                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 mt-1">
                                            <div className="md:col-span-2 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-700">Contacto Alterno</span>
                                                {isEditable && (
                                                    <button type="button" onClick={() => { setShowC2(false); setCustomerName2(''); setCustomerPhone2(''); setCustomerEmail2(''); }} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                                                        <Trash2 className="w-3 h-3" /> Quitar
                                                    </button>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Nombre de Contacto 2</label>
                                                <input type="text" className={inputClassSmall()} value={customerName2} onChange={(e) => setCustomerName2(e.target.value)} disabled={!isEditable} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Teléfono / Extensión 2</label>
                                                <input type="text" className={inputClassSmall()} value={customerPhone2} onChange={(e) => setCustomerPhone2(e.target.value)} disabled={!isEditable} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-slate-500 mb-1">Correo Electrónico 2</label>
                                                <input type="email" placeholder="ejemplo2@correo.com" className={inputClassSmall()} value={customerEmail2} onChange={(e) => setCustomerEmail2(e.target.value)} disabled={!isEditable} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="md:col-span-2 pt-3 border-t border-slate-200 mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Horario Inicio</label>
                                            <input type="time" className={inputClassSmall()} value={customerStartTime} onChange={(e) => setCustomerStartTime(e.target.value)} disabled={!isEditable} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Horario Fin</label>
                                            <input type="time" className={inputClassSmall()} value={customerEndTime} onChange={(e) => setCustomerEndTime(e.target.value)} disabled={!isEditable} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-500" /> Escalamiento a Nivel 2 (Opcional)
                                </label>
                                <select className={inputClass()} value={l2Assignee} onChange={(e) => setL2Assignee(e.target.value)} disabled={!isEditable}>
                                    <option value="">Ninguno</option>
                                    <option value="SOPORTE EN CAMPO">SOPORTE EN CAMPO</option>
                                    <option value="GPON">GPON</option>
                                    <option value="OPTIMIZACIÓN">OPTIMIZACIÓN</option>
                                    <option value="SOPORTE MW">SOPORTE MW</option>
                                </select>
                            </div>
                        </form>
                    </div>

                    <div className={`w-full ${isBitacoraExpanded ? 'flex-1' : 'md:w-80'} bg-slate-50 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 transition-all duration-300`}>
                        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Bitácora del Ticket</h3>
                            <button type="button" onClick={() => setIsBitacoraExpanded(!isBitacoraExpanded)} className="text-slate-400 hover:text-blue-600 transition-colors" title={isBitacoraExpanded ? 'Contraer vista' : 'Expandir vista'}>
                                {isBitacoraExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
                            {comments.length === 0 ? (
                                <div className="text-center text-slate-400 text-sm mt-10">No hay notas registradas.</div>
                            ) : (
                                <>
                                    {pinnedComments.length > 0 && (
                                        <div className="mb-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.6V6a3 3 0 0 0-3-3h-0a3 3 0 0 0-3 3v4.6a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg> Notas Fijadas</div>
                                            {pinnedComments.map(renderComment)}
                                        </div>
                                    )}
                                    {unpinnedComments.length > 0 && (
                                        <div className="mt-4 mb-2">
                                            {pinnedComments.length > 0 && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2"><Clock className="w-3 h-3" /> Línea de Tiempo</div>}
                                            {unpinnedComments.map(renderComment)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            <textarea placeholder="Escribe una actualización..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2 resize-none h-20 outline-none focus:ring-2 focus:ring-blue-500" value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
                            <button type="button" onClick={handleAddComment} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Agregar Nota
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 items-center">
                    {!isNew && (
                        <button type="button" onClick={() => onDelete(ticketData.id)} className="mr-auto px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                    )}
                    <button type="button" onClick={() => {onOpenContact(ticketData)}} className="px-5 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-2">
                        <PhoneCall className="w-4 h-4" /> Contacto
                    </button>
                    {!isEditable && (
                        <button type="button" onClick={() => setIsEditable(true)} className="px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Editar
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                        {isEditable ? 'Cancelar' : 'Cerrar'}
                    </button>
                    {isEditable && (
                        <button type="submit" form="ticket-form" className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">
                            Guardar Ticket
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
