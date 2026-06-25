import 'dotenv/config';
import express, { Request, Response } from 'express';
import { handleMessage } from './handlers/message';

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT ?? 3000;

if (!VERIFY_TOKEN) {
  console.error('VERIFY_TOKEN no está definido en las variables de entorno.');
  process.exit(1);
}

// Verificación del webhook de Meta (desafío GET)
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado por Meta.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recepción de mensajes (POST)
app.post('/webhook', (req: Request, res: Response) => {
  // Responder 200 inmediatamente para que Meta no reintente
  res.sendStatus(200);

  const body = req.body as WhatsAppWebhookBody;

  if (body.object !== 'whatsapp_business_account') return;

  const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
  if (!messages?.length) return;

  const message = messages[0];

  // Solo procesar mensajes de texto por ahora
  if (message.type !== 'text' || !message.text?.body) return;

  const from = message.from;
  const text = message.text.body;

  console.log(`Mensaje recibido de ${from}: "${text}"`);

  handleMessage(from, text).catch((err) => {
    console.error(`Error al procesar mensaje de ${from}:`, err);
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CEE Bot' });
});

app.listen(PORT, () => {
  console.log(`Bot CEE corriendo en el puerto ${PORT}`);
});

// ---------- Tipos del payload de Meta ----------

interface WhatsAppTextMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text';
  text: { body: string };
}

interface WhatsAppWebhookBody {
  object: string;
  entry?: {
    changes?: {
      value?: {
        messages?: WhatsAppTextMessage[];
      };
    }[];
  }[];
}
