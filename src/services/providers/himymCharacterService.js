import { ProviderError, request } from '../http.js';
import { identity, normalizeList, quote } from '../normalizers/records.js';

const base = 'https://himym-api.vercel.app/api/';
const source = 'HIMYM Character API';
let sampled = [];
let pending;

async function randomQuote() {
  const data = await request(base + 'quotes', source, { ttl: 0, retries: 0, timeout: 3900 });
  const result = quote(data, source);
  if (!result) throw new ProviderError(source, 'The random endpoint returned a blank, long or incomplete quote.');
  return result;
}

async function collectQuotes(count) {
  const results = await Promise.allSettled(Array.from({ length: count }, randomQuote));
  const records = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
  sampled = [...new Map([...sampled, ...records].map((row) => [row.id, row])).values()].slice(-36);
}

export const himymCharacterService = {
  identities: async () => normalizeList(await request(base + 'characters', source, { timeout: 4300 }), identity, source, (row) => row.name),
  randomQuote,
  async sampleQuotes() {
    if (pending) return pending;
    pending = (async () => {
      await collectQuotes(5);
      if (sampled.length < 5) await collectQuotes(3);
      if (!sampled.length) throw new ProviderError(source, 'No short source quotes were recovered. Try again.');
      return sampled;
    })();
    try { return await pending; } finally { pending = undefined; }
  },
};
