import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { handleQuestion, handleQuestionStream, Message } from './handlers/message';
import { chatRateLimiter } from './middleware/rateLimiter';

const app = express();
app.use(express.json());

// CORS — permite que el panel admin llame a /api/chat desde localhost
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('*', (_req: Request, res: Response) => {
  res.sendStatus(204);
});

const PORT = process.env.PORT ?? 3000;

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CEE Bot' });
});

app.post('/api/chat', chatRateLimiter, (req: Request, res: Response) => {
  console.log('Body recibido:', req.body);
  const { question, history, stream } = req.body as { question?: string; history?: Message[]; stream?: boolean };

  if (!question?.trim()) {
    res.status(400).json({ error: 'El campo "question" es requerido. Recibido: ' + JSON.stringify(req.body) });
    return;
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    handleQuestionStream(question.trim(), history ?? [], (token) => {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    })
      .then(() => {
        res.write('data: [DONE]\n\n');
        res.end();
      })
      .catch((err: Error) => {
        console.error('[api/chat] Error al procesar consulta (stream):', err);
        res.write(`data: ${JSON.stringify({ error: 'Error al procesar la consulta.' })}\n\n`);
        res.end();
      });
    return;
  }

  handleQuestion(question.trim(), history ?? [])
    .then((answer) => {
      res.json({ reply: answer });
    })
    .catch((err: Error) => {
      console.error('[api/chat] Error al procesar consulta:', err);
      res.status(500).json({ error: 'Error al procesar la consulta.' });
    });
});

app.listen(PORT, () => {
  console.log(`Bot CEE corriendo en el puerto ${PORT}`);
});
