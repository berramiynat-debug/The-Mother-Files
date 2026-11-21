import { ProviderError, request } from '../http.js';
import { identity, normalizeList, quote } from '../normalizers/records.js';

const base = 'https://himym-api.vercel.app/api/';
const source = 'HIMYM Character API';
export const himymCharacterService = {
  identities: async () => normalizeList(await request(base + 'characters', source, { timeout: 4300 }), identity, source, (row) => row.name),
  randomQuote: async () => {
    const data = await request(base + 'quotes', source, { ttl: 0, retries: 0, timeout: 3900 });
    const result = quote(data, source);
    if (!result) throw new ProviderError(source, 'The random endpoint returned a blank, long or incomplete quote.');
    return result;
  },
};
