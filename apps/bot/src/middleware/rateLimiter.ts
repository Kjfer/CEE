import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

// Map en memoria del proceso: userId -> timestamps de requests dentro de la ventana.
// Simple y suficiente para el volumen de tráfico esperado (personal del CEE).
const hits = new Map<string, number[]>();

export function chatRateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = (req.body?.userId as string | undefined)?.trim() || req.ip || 'anonymous';
  const now = Date.now();

  const recentHits = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recentHits.length >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: 'Estás enviando mensajes muy rápido, espera un momento.' });
    return;
  }

  recentHits.push(now);
  hits.set(key, recentHits);
  next();
}
