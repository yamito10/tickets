const templateText = `Cuenta: 0200567898
RS: AUTOMOVILES S.A DE C.V
Falla: INTERMITENCIA EN SERVICIO DE DATOS
Horario: 7 am a 8 pm L-V
Telefono: 8118956780`;

const parsed = {};
const lines = templateText.split('\n');

let descLines = [];
let isDesc = false;

lines.forEach(line => {
    if (isDesc) {
        descLines.push(line);
        return;
    }

    const cuentaMatch = line.match(/(?:cuenta)[\s:]+(.*)/i);
    if (cuentaMatch) {
        parsed.cuenta = cuentaMatch[1].trim();
        return;
    }

    const rsMatch = line.match(/(?:raz[oó]n social|cliente)[\s:]+(.*)/i);
    if (rsMatch) {
        parsed.razonSocial = rsMatch[1].trim();
        return;
    }

    const titleMatch = line.match(/(?:t[ií]tulo|asunto)[\s:]+(.*)/i);
    if (titleMatch) {
        parsed.titulo = titleMatch[1].trim();
        return;
    }

    const contactMatch = line.match(/(?:contacto|nombre)[\s:]+(.*)/i);
    if (contactMatch) {
        parsed.contacto = contactMatch[1].trim();
        return;
    }

    const phoneMatch = line.match(/(?:tel[eé]fono)[\s:]+(.*)/i);
    if (phoneMatch) {
        parsed.telefono = phoneMatch[1].trim();
        return;
    }

    const emailMatch = line.match(/(?:email|correo)[\s:]+(.*)/i);
    if (emailMatch) {
        parsed.email = emailMatch[1].trim();
        return;
    }

    const timeMatch = line.match(/(?:horario)[\s:]+(.*)/i);
    if (timeMatch) {
        const horario = timeMatch[1].trim();
        const hm = horario.match(/(\d{1,2}[:.]\d{2})\s*a\s*(\d{1,2}[:.]\d{2})/i);
        if (hm) {
            parsed.horarioInicio = hm[1].replace('.', ':');
            parsed.horarioFin = hm[2].replace('.', ':');
        }
        return;
    }

    const prioMatch = line.match(/(?:prioridad)[\s:]+(.*)/i);
    if (prioMatch) {
        const p = prioMatch[1].trim().toLowerCase();
        if (p.includes('baja')) parsed.prioridad = 'Baja';
        if (p.includes('media')) parsed.prioridad = 'Media';
        if (p.includes('alta')) parsed.prioridad = 'Alta';
        if (p.includes('critica') || p.includes('crítica')) parsed.prioridad = 'Crítica';
        return;
    }

    const descMatch = line.match(/(?:descripci[oó]n)[\s:]*(.*)/i);
    if (descMatch) {
        isDesc = true;
        if (descMatch[1].trim()) {
            descLines.push(descMatch[1].trim());
        }
        return;
    }
});

if (descLines.length > 0) {
    parsed.descripcion = descLines.join('\n').trim();
}

console.log(JSON.stringify(parsed, null, 2));
