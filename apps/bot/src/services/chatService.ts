import Groq from 'groq-sdk';
import { supabase } from '../supabase';
import type { Message } from '../handlers/message';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// ── Step 1: SQL generation ────────────────────────────────────────────────────

const SQL_SYSTEM_PROMPT = `Eres un agente de base de datos para el CEE-FIIS (Centro de Extensión y Educación de la Facultad de Ingeniería Industrial y de Sistemas de la UNI).

Schema de tablas disponibles:
- courses(id, title, category, modality, level, price, status)
- sales(id, course_name, amount, status, created_at)
- contact_leads(id, name, email, subject, message, created_at)
- instructors(id, name, title, bio)

SIEMPRE genera un SQL query para responder la pregunta del usuario.
NUNCA digas que no tienes acceso a los datos.
SIEMPRE consulta la base de datos antes de responder.
Solo genera queries SELECT (no INSERT, UPDATE, DELETE).
Responde ÚNICAMENTE con el SQL, sin explicaciones ni texto adicional.

EJEMPLOS:
- "cuánto hemos vendido" → SELECT SUM(amount) AS total FROM sales WHERE status='completed'
- "ventas pendientes" → SELECT * FROM sales WHERE status='pending'
- "total de ingresos" → SELECT SUM(amount) AS total, COUNT(*) AS cantidad FROM sales
- "cursos disponibles" → SELECT title, price, modality, level FROM courses WHERE status='published'
- "cuántos leads" → SELECT COUNT(*) AS total FROM contact_leads
- "instructores" → SELECT name, title, bio FROM instructors
- "ventas del mes" → SELECT course_name, amount, status, created_at FROM sales WHERE created_at >= date_trunc('month', NOW())`;

// ── Step 2: Natural language response ────────────────────────────────────────

const RESPONSE_SYSTEM_PROMPT = `Eres el asistente virtual del CEE-FIIS. Tienes acceso a datos reales de la base de datos. Responde en español, de forma amigable y concisa. Usa los datos proporcionados para dar una respuesta completa y precisa. Si los datos están vacíos, dilo claramente.`;

// ── SQL extraction ────────────────────────────────────────────────────────────

function extractSQL(text: string): string | null {
  // ```sql ... ``` or ``` ... ```
  const codeBlock = text.match(/```(?:sql)?\s*(SELECT[\s\S]*?)```/i);
  if (codeBlock?.[1]) return codeBlock[1].trim();

  // Inline backtick: `SELECT ...`
  const inline = text.match(/`(SELECT[^`]+)`/i);
  if (inline?.[1]) return inline[1].trim();

  // Raw SELECT anywhere in the text
  const raw = text.match(/\b(SELECT\b[\s\S]+?)(?:;|\n\n|$)/i);
  if (raw?.[1]) return raw[1].trim().replace(/;$/, '');

  return null;
}

// ── Step 1 (compartido) — genera SQL y ejecuta la consulta ───────────────────

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

async function resolveDataContext(question: string, historyMessages: HistoryMessage[]): Promise<string> {
  const sqlResponse = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SQL_SYSTEM_PROMPT },
      ...historyMessages,
      { role: 'user', content: question },
    ],
    max_tokens: 256,
    temperature: 0.1,
  });

  const rawSQL = sqlResponse.choices[0]?.message?.content ?? '';
  const sql = extractSQL(rawSQL);

  if (sql && /^SELECT\b/i.test(sql)) {
    const { data, error } = await supabase.rpc('execute_query', { query_text: sql });

    if (error) {
      console.error('[chatService] execute_query error:', error.message, '| SQL:', sql);
      return `Error al ejecutar la consulta: ${error.message}`;
    }
    return `Resultados de la consulta:\n${JSON.stringify(data, null, 2)}`;
  }

  console.warn('[chatService] No se extrajo SQL válido del response:', rawSQL);
  return '';
}

function buildFinalMessages(question: string, historyMessages: HistoryMessage[], dataContext: string) {
  return [
    { role: 'system' as const, content: RESPONSE_SYSTEM_PROMPT },
    ...historyMessages,
    { role: 'user' as const, content: question },
    {
      role: 'assistant' as const,
      content: dataContext
        ? `He consultado la base de datos. ${dataContext}\n\nBasándome en estos datos, respondo:`
        : 'No pude obtener datos específicos.',
    },
  ];
}

// ── Main service (respuesta completa, sin streaming) ─────────────────────────

export async function chatWithData(question: string, history: Message[]): Promise<string> {
  const historyMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const dataContext = await resolveDataContext(question, historyMessages);

  const finalResponse = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: buildFinalMessages(question, historyMessages, dataContext),
    max_tokens: 512,
    temperature: 0.4,
  });

  return (
    finalResponse.choices[0]?.message?.content ??
    'Lo siento, no pude generar una respuesta en este momento.'
  );
}

// ── Variante streaming — solo el paso 2 (lenguaje natural) se streamea ───────
// El paso 1 (generación de SQL) no es visible para el usuario, así que se
// resuelve por completo antes de empezar a emitir tokens.

export async function chatWithDataStream(
  question: string,
  history: Message[],
  onToken: (token: string) => void,
): Promise<string> {
  const historyMessages = history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const dataContext = await resolveDataContext(question, historyMessages);

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: buildFinalMessages(question, historyMessages, dataContext),
    max_tokens: 512,
    temperature: 0.4,
    stream: true,
  });

  let full = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      full += delta;
      onToken(delta);
    }
  }

  return full || 'Lo siento, no pude generar una respuesta en este momento.';
}
