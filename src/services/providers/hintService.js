import { postJson, ProviderError } from '../http.js';

export async function askNotebook(context, question, signal) {
  const reply = await postJson('/api/hints', 'The Mosby Margins', { ...context, question }, { signal, timeout: 6000 });
  if (!['ai', 'guided'].includes(reply?.source) || typeof reply.text !== 'string' || !reply.text.trim() || reply.text.length > 360) {
    throw new ProviderError('The Mosby Margins', 'Unreadable reply.');
  }
  return reply;
}
