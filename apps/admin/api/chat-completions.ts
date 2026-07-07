import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatRateLimiter } from './_lib/rateLimiter.js';
import { forwardChatCompletion, type ChatCompletionProxyRequest } from './_lib/groqProxyService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  if (!chatRateLimiter(req, res)) return;

  const { userId: _userId, ...groqPayload } = req.body as ChatCompletionProxyRequest & { userId?: string };

  if (!groqPayload.model || !groqPayload.messages) {
    res.status(400).json({ error: 'Los campos "model" y "messages" son requeridos.' });
    return;
  }

  try {
    const completion = await forwardChatCompletion(groqPayload);
    res.status(200).json(completion);
  } catch (err) {
    console.error('[api/chat-completions] Error al reenviar a Groq:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
}
