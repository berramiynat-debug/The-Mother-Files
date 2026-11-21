import { ProviderError, request } from '../http.js';
import { quote, normalizeList } from '../normalizers/records.js';
import { himymCharacterService } from './himymCharacterService.js';

const source = 'HIMYM Quotes API';
const root = 'https://himym-api-ten.vercel.app/himym';
let sampled = [];
let pending;

export const himymQuotesService = {
  async page(page = 1) {
    const data = await request(root + '/quotes?page=' + page + '&limit=25', source, { retries: 0, timeout: 3300 });
    const records = normalizeList(data?.quotes, (row) => quote(row, source), source);
    return { records, next: data.pagination?.hasNext === true };
  },
  async sample() {
    if (pending) return pending;
    pending = (async () => {
      async function collect(count) {
        const results = await Promise.allSettled(Array.from({ length: count }, himymCharacterService.randomQuote));
        const records = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []);
        sampled = [...new Map([...sampled, ...records].map((row) => [row.id, row])).values()].slice(-36);
      }
      await collect(5);
      if (sampled.length < 5) await collect(3);
      if (!sampled.length) throw new ProviderError('HIMYM Character API', 'No short source quotes were recovered. Try again.');
      return sampled;
    })();
    try { return await pending; } finally { pending = undefined; }
  },
  async recover() {
    try {
      const first = await himymQuotesService.page();
      if (first.records.length) return { ...first, source };
    } catch {
      // The separate quote archive is optional. Continue with validated samples.
    }
    return { records: await himymQuotesService.sample(), next: false, source: 'HIMYM Character API' };
  },
};
