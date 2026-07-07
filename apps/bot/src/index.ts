// Servidor de desarrollo local únicamente — no se despliega en producción.
// Estos mismos endpoints viven ahora como Vercel Serverless Functions en
// apps/admin/api/ (desplegadas junto con el resto del panel admin). Este
// servidor Express se conserva como fallback para quien prefiera correr un
// proceso local en vez de `vercel dev`.
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { handleQuestion, handleQuestionStream, Message } from './handlers/message';
import { chatRateLimiter } from './middleware/rateLimiter';
import {
  getDashboardSummary,
  DashboardSummaryKpis,
  DashboardSummaryCategoryPoint,
} from './services/dashboardSummaryService';
import { forwardChatCompletion, ChatCompletionProxyRequest } from './services/groqProxyService';

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

app.post('/api/dashboard-summary', (req: Request, res: Response) => {
  const { from, to, kpis, coursesByCategory } = req.body as {
    from?: string;
    to?: string;
    kpis?: DashboardSummaryKpis;
    coursesByCategory?: DashboardSummaryCategoryPoint[];
  };

  if (!from || !to || !kpis) {
    res.status(400).json({ error: 'Los campos "from", "to" y "kpis" son requeridos.' });
    return;
  }

  getDashboardSummary({ from, to, kpis, coursesByCategory: coursesByCategory ?? [] })
    .then((summary) => {
      res.json({ summary });
    })
    .catch((err: Error) => {
      console.error('[api/dashboard-summary] Error al generar el resumen:', err);
      res.status(500).json({ error: 'No se pudo generar el resumen.' });
    });
});

app.post('/api/chat-completions', chatRateLimiter, (req: Request, res: Response) => {
  const { userId: _userId, ...groqPayload } = req.body as ChatCompletionProxyRequest & { userId?: string };

  if (!groqPayload.model || !groqPayload.messages) {
    res.status(400).json({ error: 'Los campos "model" y "messages" son requeridos.' });
    return;
  }

  forwardChatCompletion(groqPayload)
    .then((completion) => {
      res.json(completion);
    })
    .catch((err: Error) => {
      console.error('[api/chat-completions] Error al reenviar a Groq:', err);
      res.status(500).json({ error: 'Error al procesar la solicitud.' });
    });
});

app.listen(PORT, () => {
  console.log(`Bot CEE corriendo en el puerto ${PORT}`);
});
