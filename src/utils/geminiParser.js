import { GEMINI_API_KEY } from './config';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
  const apiKey = GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('API Key de Gemini no configurada');
  }

  console.log('[Gemini Parser] Iniciando petición con modelo gemini-2.0-flash...');
  console.log('[Gemini Parser] API Key (primeros 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('[Gemini Parser] Texto a analizar:', rawText.substring(0, 100) + '...');

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: `Analiza el siguiente texto y extrae la información:\n\n${rawText}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    }
  };

  let response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
  } catch (networkError) {
    console.error('[Gemini Parser] Error de red:', networkError);
    throw new Error('Error de red al conectar con Gemini. Verifica tu conexión a internet.');
  }

  console.log('[Gemini Parser] Status de respuesta:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Gemini Parser] Error de API:', errorData);
    throw new Error(`Error de Gemini API: ${response.status} - ${errorData?.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  console.log('[Gemini Parser] Respuesta completa de Gemini:', JSON.stringify(data, null, 2));
  
  const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textContent) {
    console.error('[Gemini Parser] No hay contenido de texto en la respuesta:', data);
    throw new Error('No se recibió respuesta de Gemini');
  }

  console.log('[Gemini Parser] Texto de respuesta:', textContent);

  // Limpiar la respuesta: remover posibles backticks o texto extra
  let cleanJson = textContent.trim();
  
  // Si viene envuelto en ```json ... ``` lo limpiamos
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleanJson);
    console.log('[Gemini Parser] JSON parseado exitosamente:', parsed);
    return parsed;
  } catch (e) {
    console.error('[Gemini Parser] Error parseando JSON:', cleanJson);
    console.error('[Gemini Parser] Error detalle:', e.message);
    throw new Error('La IA no pudo procesar el texto correctamente. Intenta con un formato más claro.');
  }
}
