import type { VercelRequest, VercelResponse } from '@vercel/node';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

// Map en memoria del proceso: userId -> timestamps de requests dentro de la ventana.
// Ported tal cual desde apps/bot/src/middleware/rateLimiter.ts. LIMITACIÓN
// conocida en serverless: cada invocación puede caer en una instancia fría
// distinta, así que este conteo no persiste de forma confiable entre requests
// (ver reporte de migración / docs/IMPLEMENTATIONS.md).
const hits = new Map<string, number[]>();

function clientKey(req: VercelRequest): string {
  const userId = (req.body?.userId as string | undefined)?.trim();
  if (userId) return userId;

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]?.trim();
  return ip || 'anonymous';
}

/** Devuelve `true` si la request puede continuar; si devuelve `false`, ya escribió la respuesta 429. */
export function chatRateLimiter(req: VercelRequest, res: VercelResponse): boolean {
  const key = clientKey(req);
  const now = Date.now();

  const recentHits = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recentHits.length >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: 'Estás enviando mensajes muy rápido, espera un momento.' });
    return false;
  }

  recentHits.push(now);
  hits.set(key, recentHits);
  return true;
}
