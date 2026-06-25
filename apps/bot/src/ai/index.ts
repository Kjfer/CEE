import type { AIProvider } from './types';
import { GeminiProvider } from './gemini.provider';
import { ClaudeProvider } from './claude.provider';

export type { AIProvider };

export function createAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase().trim();

  switch (provider) {
    case 'gemini':
      return new GeminiProvider();
    case 'claude':
      return new ClaudeProvider();
    default:
      throw new Error(
        `Proveedor AI desconocido: "${provider}". Valores válidos: gemini, claude`,
      );
  }
}
