const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_PROMPT = `Eres un asistente experto en soporte técnico de un ISP (Proveedor de Servicios de Internet). 
Tu trabajo es extraer información estructurada de cualquier texto que te proporcionen (plantillas, correos, mensajes de WhatsApp, texto libre, etc.).

Debes extraer los siguientes campos y devolver ÚNICAMENTE un JSON válido, sin ningún texto adicional, sin markdown, sin backticks:

{
  "cuenta": "número de cuenta del cliente",
  "razonSocial": "nombre de la empresa o razón social del cliente",
  "titulo": "descripción breve de la falla o problema reportado",
  "descripcion": "descripción completa y detallada del problema",
  "contacto": "nombre de la persona de contacto",
  "telefono": "número de teléfono o celular del contacto",
  "email": "correo electrónico del contacto",
  "horarioInicio": "hora de inicio del horario de atención en formato HH:MM (24hrs)",
  "horarioFin": "hora de fin del horario de atención en formato HH:MM (24hrs)",
  "prioridad": "Crítica, Alta, Media o Baja según la gravedad del problema",
  "nota": "cualquier nota adicional o información relevante encontrada"
}

Reglas importantes:
- Si un campo no se encuentra en el texto, usa cadena vacía "".
- Para el horario, si dice "24 horas" o "24x7", usa horarioInicio: "00:00" y horarioFin: "23:59".
- Para la prioridad, analiza el contexto: si es una caída total de servicio = "Crítica", si afecta a muchos usuarios = "Alta", problemas intermitentes = "Media", consultas = "Baja".
- El título debe ser conciso (máx 80 caracteres), la descripción puede ser más extensa.
- Los teléfonos deben incluir solo números y el formato original.
- RESPONDE ÚNICAMENTE CON EL JSON, nada más.`;

export async function parseWithGemini(rawText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('API Key de Gemini no configurada');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Analiza el siguiente texto y extrae la información:\n\n${rawText}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error de Gemini API: ${response.status} - ${errorData?.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textContent) {
    throw new Error('No se recibió respuesta de Gemini');
  }

  // Limpiar la respuesta: remover posibles backticks o texto extra
  let cleanJson = textContent.trim();
  
  // Si viene envuelto en ```json ... ``` lo limpiamos
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleanJson);
    return parsed;
  } catch (e) {
    console.error('Error parsing Gemini response:', cleanJson);
    throw new Error('La IA no pudo procesar el texto correctamente. Intenta con un formato más claro.');
  }
}
