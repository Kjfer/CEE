import { useCallback, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const BOT_URL = (import.meta.env.VITE_BOT_URL as string | undefined) ?? 'http://localhost:3000';

// ─── UI ────────────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex items-end gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-gray-200' : 'bg-cee-red',
        )}
      >
        {isUser
          ? <User className="h-3.5 w-3.5 text-gray-600" />
          : <Bot className="h-3.5 w-3.5 text-white" />}
      </span>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
          isUser ? 'rounded-br-sm bg-cee-red text-white' : 'rounded-bl-sm bg-gray-100 text-gray-900',
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────

export default function BotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingFirstToken, setWaitingFirstToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const toast = useToast();

  // Historial en el formato que espera /api/chat (solo role + content)
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const send = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setError(null);
    setLoading(true);
    setWaitingFirstToken(true);

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: question };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch(`${BOT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: historyRef.current, stream: true, userId: user?.id }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        toast.error(
          'Estás enviando mensajes muy rápido',
          body?.error ?? 'Espera un momento antes de volver a intentarlo.',
        );
        setMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id));
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(`Error del servidor (${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      // Parseo incremental de eventos SSE ("data: {...}\n\n")
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;

          const parsed = JSON.parse(payload) as { token?: string; error?: string };
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.token) {
            if (full === '') setWaitingFirstToken(false);
            full += parsed.token;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
            );
          }
        }
      }

      historyRef.current = [
        ...historyRef.current,
        { role: 'user', content: question },
        { role: 'assistant', content: full },
      ];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido. Intenta de nuevo.';
      setError(message);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setLoading(false);
      setWaitingFirstToken(false);
    }
  }, [input, loading]);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="mx-auto flex max-w-[800px] flex-col gap-3" style={{ height: 'calc(100vh - 3rem)' }}>
      <div className="flex shrink-0 items-center gap-3 rounded-lg bg-cee-red px-5 py-3.5 shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <MessageCircle className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">🛠️ Debug interno — Consulta de datos (SQL)</p>
          <p className="text-[10px] text-white/60">
            Herramienta de desarrollo para probar el flujo de texto→SQL de apps/bot (chatService.ts).
            No es el Asistente CEE — esta ruta no está enlazada en el menú y no debe usarse con secretarias.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg bg-white px-5 py-4 shadow-sm">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <MessageCircle className="h-8 w-8 text-cee-red/40" />
            <p>Escribe una consulta sobre cursos, ventas o leads para probar el bot.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
            {waitingFirstToken && (
              <div className="flex items-end gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cee-red">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                  escribiendo…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="shrink-0 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      <div
        className="flex shrink-0 items-center gap-3 rounded-lg bg-white px-3 py-3 shadow-sm"
        style={{ borderBottom: '3px solid #682222' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu consulta..."
          disabled={loading}
          className="h-11 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-cee-red focus:bg-white focus:outline-none focus:ring-1 focus:ring-cee-red/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={!input.trim() || loading}
          aria-label="Enviar mensaje"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cee-red text-white transition-colors hover:bg-[#4F1A1A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
