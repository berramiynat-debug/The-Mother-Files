export const firstInvestigation = { stage: 0, responses: [], combined: false, ending: '' };
export const secretMemories = ['umbrella', 'photo', 'envelope', 'string', 'horn'];

export const conclusions = {
  restored: ['The archive restored', 'Ted leaves the photograph where it belongs. The file keeps the rain, the awkward silence, and everything in between.'],
  published: ['The city reads it first', 'Robin publishes the archive. By breakfast, strangers are sending in the corners of New York that they remember differently.'],
  sealed: ['A private table', 'Lily closes the file. Some nights make more sense when they belong to the people who were there.'],
  secret: ['One last seat', 'The combined evidence reveals a line written on the reverse of the photograph. “There’s room for one more.” When you look up, the booth light is still on.'],
};
export function beginCase(value) {
  if (!value || !Number.isInteger(value.stage) || value.stage < 0 || value.stage > 3 || !Array.isArray(value.responses) ||
    typeof value.combined !== 'boolean' || (value.ending && !Object.hasOwn(conclusions, value.ending))) return firstInvestigation;
  return value;
}
export const decodeLabel = (value) => value.replace(/\D/g, '') === '0919';
export const canCombine = (unlocked) => secretMemories.every((id) => unlocked.includes(id));
export const canClose = (stage, ending, combined) => stage === 3 && Object.hasOwn(conclusions, ending) && (ending !== 'secret' || combined);
