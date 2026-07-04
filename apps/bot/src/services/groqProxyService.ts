import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// Proxy delgado: reenvía tal cual la llamada de chat-completions (con tools/
// tool_choice de SecretariaChat.tsx) a Groq. La ejecución de las tools sigue
// pasando 100% en el navegador (coursesService, salesRecordsService, etc.) —
// este endpoint solo evita que VITE_GROQ_API_KEY se exponga en el cliente.
// No reimplementa nada de chatService.ts a propósito: ese flujo resuelve un
// problema distinto (texto -> SQL de solo lectura) que no cubre las acciones
// de escritura (crear curso, registrar inscripción, emitir certificado) ni
// la consulta de alumnos que sí usa SecretariaChat.tsx.

export type ChatCompletionProxyRequest = Parameters<typeof groq.chat.completions.create>[0];

export async function forwardChatCompletion(payload: ChatCompletionProxyRequest) {
  return groq.chat.completions.create(payload);
}
