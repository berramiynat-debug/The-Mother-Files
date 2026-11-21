import { chapters, roles } from '../../data/investigation.js';

export const firstInvestigation = { stage: 0, role: '', responses: [], combined: false, ending: '' };
export const secretMemories = ['umbrella', 'photo', 'envelope', 'string', 'horn'];

export const conclusions = {
  restored: ['The archive restored', 'Kids, you put the photograph back with a note about who remembered what. I kept the rain and the awkward silence. Your sibling made me take my name off the fact-checking column.'],
  published: ['The city reads it first', 'You asked Robin to put both versions out there. By breakfast, strangers were writing in with their own memories of the street. I started drafting replies. You two set me a word limit.'],
  sealed: ['A private table', 'At your request, Lily tucked the photograph back under the booth. I told the rest of the story in our living room. Halfway through, your sibling brought out the popcorn we’d all forgotten to eat.'],
  secret: ['One last seat', 'You turned the photograph over. The little note said, “There’s room for one more.” I asked if you wanted to hear the story behind it. You slid a chair toward me, and this time I asked you two to tell it.'],
};

export function beginCase(value) {
  if (!value || !Number.isInteger(value.stage) || value.stage < 0 || value.stage >= chapters.length || !Array.isArray(value.responses) ||
    typeof value.combined !== 'boolean' || (value.ending && !Object.hasOwn(conclusions, value.ending))) return firstInvestigation;
  return typeof value.role === 'string' && Object.hasOwn(roles, value.role) ? value : { ...value, role: '' };
}

export const decodeLabel = (value) => value.replace(/\D/g, '') === '0919';
export const canCombine = (unlocked) => secretMemories.every((id) => unlocked.includes(id));
export const canClose = (stage, ending, combined) => stage === chapters.length - 1 && Object.hasOwn(conclusions, ending) && (ending !== 'secret' || combined);
