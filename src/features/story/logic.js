import { chapters, pilotAirDate, roles } from '../../data/investigation.js';

export const firstInvestigation = { stage: 0, role: '', opened: false, responses: [], combined: false, ending: '' };
export const secretMemories = ['umbrella', 'photo', 'envelope', 'string', 'horn'];

export const conclusions = {
  restored: ['The archive restored', 'Kids, you put the photo back and credited everybody’s version. Barney asked for a footnote. You gave him one, under the name he actually uses on a tax return.'],
  published: ['The city reads it first', 'Robin published your account with a call for other memories. By breakfast, Barney had submitted three letters to the editor. You printed one and charged him for the other two.'],
  sealed: ['A private table', 'Lily tucked the print under the booth again. Back on the couch, you asked me to tell the story without the appendix. Barney raised his hand to object. You handed him the popcorn.'],
  secret: ['One last seat', 'The keepsakes sent you back to the little note on the photo. “There’s room for one more.” Barney pulled up a chair without announcing it, which might be the most unbelievable thing I’ve told you all night. Then I asked you two to tell the story.'],
};

export function beginCase(value) {
  if (!value || !Number.isInteger(value.stage) || value.stage < 0 || value.stage >= chapters.length || !Array.isArray(value.responses) ||
    typeof value.combined !== 'boolean' || (value.ending && !Object.hasOwn(conclusions, value.ending))) return firstInvestigation;
  return typeof value.role === 'string' && Object.hasOwn(roles, value.role) ? value : { ...value, role: '' };
}

export const decodeLabel = (value, date = pilotAirDate) => value.replace(/\D/g, '') === date.slice(5).replace('-', '');
export const canCombine = (unlocked) => secretMemories.every((id) => unlocked.includes(id));
export const canClose = (stage, ending, combined) => stage === chapters.length - 1 && Object.hasOwn(conclusions, ending) && (ending !== 'secret' || combined);
