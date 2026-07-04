import type { ApiResponse, ChatMessage } from '@cee/types';
import { supabase } from '@/lib/supabase';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ─── In-memory mock store ─────────────────────────────────────────────────────

let mockHistory: ChatMessage[] = [];

// ─── Supabase row type ────────────────────────────────────────────────────────

interface ChatRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: unknown;
  feedback?: 'positive' | 'negative' | null;
  created_at: string;
}

function rowToMsg(row: ChatRow): ChatMessage {
  return {
    id:        row.id,
    role:      row.role,
    content:   row.content,
    toolCalls: row.tool_calls,
    feedback:  row.feedback ?? null,
    createdAt: row.created_at,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const chatHistoryService = {
  /** Carga los últimos 50 mensajes del usuario actual, orden cronológico. */
  async getHistory(): Promise<ApiResponse<ChatMessage[]>> {
    if (USE_MOCKS) {
      return delay({ data: [...mockHistory] });
    }
    const { data, error } = await supabase
      .from('chat_history')
      .select('id, role, content, tool_calls, feedback, created_at')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('[chatHistoryService] getHistory error:', error.message);
      throw new Error('No se pudo cargar el historial.');
    }
    return { data: (data ?? []).map((r) => rowToMsg(r as ChatRow)) };
  },

  /**
   * Guarda un mensaje en la BD. user_id se inyecta via RLS automáticamente.
   * Retorna el id generado (necesario para poder registrar feedback después).
   */
  async saveMessage(
    role: 'user' | 'assistant',
    content: string,
    toolCalls?: unknown,
  ): Promise<string | null> {
    if (USE_MOCKS) {
      const id = crypto.randomUUID();
      mockHistory.push({
        id,
        role,
        content,
        toolCalls: toolCalls ?? null,
        feedback:  null,
        createdAt: new Date().toISOString(),
      });
      return id;
    }
    const { data, error } = await supabase
      .from('chat_history')
      .insert({ role, content, tool_calls: toolCalls ?? null })
      .select('id')
      .single();

    if (error) {
      console.error('[chatHistoryService] saveMessage error:', error.message);
      return null;
    }
    return (data as { id: string }).id;
  },

  /** Registra el feedback (👍/👎) del usuario sobre una respuesta del asistente. */
  async setFeedback(id: string, feedback: 'positive' | 'negative'): Promise<void> {
    if (USE_MOCKS) {
      const msg = mockHistory.find((m) => m.id === id);
      if (msg) msg.feedback = feedback;
      return;
    }
    const { error } = await supabase.from('chat_history').update({ feedback }).eq('id', id);
    if (error) {
      console.error('[chatHistoryService] setFeedback error:', error.message);
    }
  },

  /** Elimina todo el historial del usuario actual. */
  async clearHistory(): Promise<void> {
    if (USE_MOCKS) {
      mockHistory = [];
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', user.id);

    if (error) throw new Error('No se pudo limpiar el historial.');
  },
};
