import { GEMINI_API_KEY } from './config';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Eres un gerente experto en operaciones técnicas y soporte técnico para un ISP.
Se te proporcionará una lista de tickets de soporte en formato JSON.
Tu objetivo es analizar estos datos y generar un **Reporte Ejecutivo Avanzado** en formato HTML puro (sin etiquetas <html>, <head> o <body>, solo el contenido interior para inyectar en un div).

El reporte debe incluir:
1. **Resumen Ejecutivo**: Una visión rápida de la salud del soporte (volumen, tasa de resolución, etc).
2. **Análisis de Tendencias**: Identifica qué tipos de problemas son más comunes y qué clientes están teniendo más afectaciones.
3. **Métricas Clave**: Destaca los tiempos de resolución (si es posible deducirlo), distribución de prioridades y cuellos de botella (ej. tickets esperando cliente o escalados).
4. **Recomendaciones de Mejora**: Qué acciones debería tomar el equipo basándose en estos datos para mejorar el servicio.

Usa etiquetas HTML como <h2>, <h3>, <p>, <ul>, <li>, <strong>, y tablas (<table>, <tr>, <td>) si lo ves conveniente para darle un formato muy profesional, limpio y estético.
NO uses estilos en línea complejos, asume que el contenedor padre le dará un estilo limpio (puedes usar clases de Tailwind como 'text-xl font-bold mb-4', 'text-gray-700', 'bg-gray-50 p-4 rounded-lg' si quieres, pero prefiere HTML semántico).

NO incluyas bloques de código en tu respuesta, devuelve directamente el HTML. No uses backticks de markdown.`;


export async function generateAiReport(tickets) {
  const apiKey = GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('API Key de Gemini no configurada');
  }

  // Simplificar los tickets para no saturar el token limit
  const simplifiedTickets = tickets.map(t => ({
    folio: t.folio,
    titulo: t.title,
    estatus: t.status,
    prioridad: t.priority,
    cliente: t.customerCompany || t.customerName,
    creado: t.createdAt,
    resuelto: t.resolvedAt,
    asignadoL2: t.l2Assignee,
    comentarios: t.comments?.length || 0
  }));

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Aquí tienes los datos de los tickets:\n\n${JSON.stringify(simplifiedTickets)}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Error de Gemini API: ${response.status} - ${errorData?.error?.message || 'Error desconocido'}`);
  }

  const data = await response.json();
  const htmlContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!htmlContent) {
    throw new Error('No se recibió respuesta de Gemini');
  }

  // Limpiar markdown si Gemini lo agregó accidentalmente
  let cleanHtml = htmlContent.trim();
  if (cleanHtml.startsWith('```html')) {
    cleanHtml = cleanHtml.replace(/^```html\s*/, '').replace(/\s*```$/, '');
  } else if (cleanHtml.startsWith('```')) {
    cleanHtml = cleanHtml.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return cleanHtml;
}
