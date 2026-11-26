import { postJson, ProviderError } from '../http.js';
import { hintReplyLimit } from '../../features/story/hints/hintContext.js';

export async function askNotebook(context, question, history, signal) {
  const reply = await postJson('/api/hints', 'The Mosby Margins', { ...context, question, history }, { signal, timeout: 8500 });
  if (!['ai', 'guided'].includes(reply?.source) || typeof reply.text !== 'string' || !reply.text.trim() || reply.text.length > hintReplyLimit ||
    (reply.records !== undefined && (!Array.isArray(reply.records) || reply.records.some((title) => typeof title !== 'string')))) {
    throw new ProviderError('The Mosby Margins', 'Unreadable reply.');
  }
  return reply;
}
