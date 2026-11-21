import { ProviderError } from '../http.js';

export const text = (value) => typeof value === 'string' ? value.trim() : '';
export const integer = (value) => Number.isSafeInteger(value) && value > 0 ? value : null;
export const namesMatch = (a, b) => text(a).normalize('NFKC').toLowerCase() === text(b).normalize('NFKC').toLowerCase();

export function plainText(value) {
  const content = text(value).replace(/<[^>]*>/g, ' ');
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return content.replace(/&(#x[a-f\d]+|#\d+|\w+);/gi, (raw, code) => {
    if (!code.startsWith('#')) return entities[code] ?? raw;
    const number = code[1]?.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : raw;
  }).replace(/\s+/g, ' ').trim();
}

export function imageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['static.tvmaze.com', 'image.tmdb.org'].includes(url.hostname) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
const picture = (row) => imageUrl(row?.image?.original) || imageUrl(row?.image?.medium);
export const sourceLink = (value) => /^https:\/\/(www\.)?tvmaze\.com\//i.test(text(value)) ? value : '';
const base = (row) => integer(row?.id) && text(row?.name) ? {
  id: row.id, name: text(row.name), image: picture(row), url: sourceLink(row.url), source: 'TVmaze',
} : null;

export function season(row) {
  const number = integer(row?.number);
  if (!integer(row?.id) || !number) return null;
  return { id: row.id, number, name: text(row.name) || 'Season ' + number, image: picture(row), date: text(row.premiereDate),
    summary: plainText(row.summary), count: integer(row.episodeOrder), source: 'TVmaze' };
}

export function episode(row) {
  const record = base(row);
  const seasonNumber = integer(row?.season);
  const number = integer(row?.number);
  if (!record || !seasonNumber || !number) return null;
  return { ...record, season: seasonNumber, number, date: text(row.airdate), summary: plainText(row.summary), runtime: integer(row.runtime),
    rating: typeof row.rating?.average === 'number' ? row.rating.average : null };
}

export function person(row) {
  const record = base(row);
  return record && { ...record, country: text(row.country?.name), birthday: text(row.birthday) };
}

export function castMember(row) {
  const actor = person(row?.person);
  const character = base(row?.character);
  return actor && character ? { ...character, actor } : null;
}

export function show(row) {
  const record = base(row);
  return record && { ...record, summary: plainText(row.summary), date: text(row.premiered), end: text(row.ended), network: text(row.network?.name) };
}

export function normalizeList(data, normalize, source, identify = (row) => row.id) {
  if (!Array.isArray(data)) throw new ProviderError(source, 'Expected a list of records.');
  const valid = new Map();
  for (const raw of data) {
    const row = normalize(raw);
    if (row && !valid.has(identify(row))) valid.set(identify(row), row);
  }
  if (data.length && !valid.size) throw new ProviderError(source, 'The provider returned no valid records.');
  return [...valid.values()];
}

export function identity(row) {
  const name = text(row?.name);
  if (!name || !Array.isArray(row.nickNames)) return null;
  return { name, aliases: [...new Set(row.nickNames.map(text).filter(Boolean))], actorClaim: text(row.actor),
    occupations: [row.occupation].flat().map(text).filter(Boolean), source: 'HIMYM Character API' };
}

export function compareIdentities(characters, identities) {
  return characters.map((canonical) => {
    const match = identities.find((row) => namesMatch(row.name.split(' (')[0], canonical.name));
    const status = !match ? 'Missing' : !match.actorClaim ? 'Incomplete' : namesMatch(match.actorClaim, canonical.actor.name) ? 'Verified' : 'Conflict';
    return { id: canonical.id, name: canonical.name, actor: canonical.actor.name, status };
  });
}

export function quote(row, source) {
  const line = text(row?.quote || row?.quotes);
  const author = text(row?.character?.name || row?.author);
  if (!line || line.length > 105 || !author || author.length > 60) return null;
  return { id: line.toLowerCase(), line, author, season: integer(row.episode?.season), source };
}

export const episodeCode = ({ season: s, number }) => 'S' + String(s).padStart(2, '0') + 'E' + String(number).padStart(2, '0');
export const protectedEpisode = (row) => row.season >= 9 || (row.season === 8 && row.number >= 24);
export const protectedName = (name) => /the mother|tracy|mcconnell|cristin milioti/i.test(name);
export const quoteIsSafe = (row, spoilers) => spoilers || (row.season !== null && row.season < 8 && !protectedName(row.author + ' ' + row.line));
export const protectEpisode = (row, spoilers) => {
  if (spoilers || !protectedEpisode(row)) return row;
  return { ...row, name: 'Sealed episode', image: '', summary: '', url: '', sealed: true };
};
