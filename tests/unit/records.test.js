import { describe, expect, it } from 'vitest';
import { castMember, compareIdentities, episode, identity, imageUrl, normalizeList, plainText, protectEpisode, quote, quoteIsSafe } from '../../src/services/normalizers/records.js';

describe('provider normalization', () => {
  it('renders external summaries as plain text and handles named and numeric entities', () => {
    expect(plainText('<p>Friday &amp; Saturday &#x2602; &#8212; <b>late.</b></p>')).toBe('Friday & Saturday ☂ — late.');
    expect(imageUrl('javascript:alert(1)')).toBe('');
    expect(imageUrl('https://static.tvmaze.com.example.com/image.jpg')).toBe('');
  });
  it('rejects malformed records and duplicates', () => {
    const pilot = { id: 12285, name: 'Pilot', season: 1, number: 1, summary: '<p>New York.</p>' };
    expect(normalizeList([null, pilot, pilot, { ...pilot, id: '42' }], episode, 'TVmaze')).toHaveLength(1);
    expect(() => normalizeList([null], episode, 'TVmaze')).toThrow('no valid records');
    expect(() => normalizeList({ error: 'bad shape' }, episode, 'TVmaze')).toThrow('list');
  });
  it('retains the canonical actor and flags an incorrect actor field', () => {
    const canonical = castMember({ character: { id: 1, name: 'Marshall Eriksen' }, person: { id: 2, name: 'Jason Segel' } });
    const community = identity({ name: 'Marshall Eriksen', actor: 'Male', nickNames: [' Big Fudge ', 'Big Fudge', null], occupation: 'Lawyer' });
    expect(community.aliases).toEqual(['Big Fudge']);
    expect(community.occupations).toEqual(['Lawyer']);
    expect(compareIdentities([canonical], [community])).toEqual([{ id: 1, name: 'Marshall Eriksen', actor: 'Jason Segel', status: 'Conflict' }]);
  });
  it('validates community quote shape and seals episodes and unclassified lines', () => {
    expect(quote({}, 'Community')).toBeNull();
    expect(quote({ quotes: 'a'.repeat(106), author: 'Ted' }, 'Community')).toBeNull();
    const row = { id: 4, name: 'Sensitive', season: 9, number: 24, image: 'original', summary: 'Details', url: 'original' };
    expect(protectEpisode(row, false)).toMatchObject({ name: 'Sealed episode', image: '', summary: '', url: '', sealed: true });
    expect(protectEpisode(row, true)).toBe(row);
    const line = quote({ quotes: 'One second.', author: 'Ted' }, 'Community');
    expect(quoteIsSafe(line, false)).toBe(false);
    expect(quoteIsSafe(line, true)).toBe(true);
  });
});
