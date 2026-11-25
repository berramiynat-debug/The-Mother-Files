import { chapters, endings, roles } from '../../data/investigation.js';

export const firstInvestigation = {
  version: 2, chapter: chapters[0].id, role: 'questions', discovered: [], completed: [], ending: '',
};
export const secretMemories = ['umbrella', 'photo', 'envelope', 'string', 'horn'];

export const hasKeepsakes = (unlocked) => secretMemories.every((id) => unlocked.includes(id));
const sameOrder = (values, expected) => Array.isArray(values) && values.length === expected.length &&
  expected.every((id, index) => id === values[index]);

export function archiveLegacyCase(state) {
  const old = state.story;
  if (!old || old.version === firstInvestigation.version || !Number.isInteger(old.stage) || !Array.isArray(old.responses)) return state;
  return { ...state, story: null, legacyStory: old };
}

export function beginCase(value, unlocked = []) {
  if (value?.version !== firstInvestigation.version) return firstInvestigation;
  const read = Array.isArray(value.discovered) ? value.discovered : [];
  const solved = Array.isArray(value.completed) ? value.completed : [];
  const completed = [];
  for (const { deduction } of chapters) {
    if (solved[completed.length] !== deduction.id || !deduction.sources.every((id) => read.includes(id))) break;
    completed.push(deduction.id);
  }
  const requested = chapters.findIndex(({ id }) => id === value.chapter);
  const index = Math.min(chapters.length - 1, completed.length, Math.max(0, completed.length - 1, requested));
  const chapter = chapters[index];
  const discovered = chapters.slice(0, index + 1).flatMap(({ discover }) => discover).filter((id) => read.includes(id));
  const role = typeof value.role === 'string' && Object.hasOwn(roles, value.role) ? value.role : firstInvestigation.role;
  const validEnding = completed.length === chapters.length && typeof value.ending === 'string' &&
    Object.hasOwn(endings, value.ending) && (value.ending !== 'secret' || hasKeepsakes(unlocked));
  return { version: firstInvestigation.version, chapter: chapter.id, role, discovered, completed, ending: validEnding ? value.ending : '' };
}

export function assessDeduction(progress, answer) {
  const chapter = chapters.find(({ id }) => id === progress.chapter);
  const { deduction } = chapter;
  if (!deduction.sources.every((id) => progress.discovered.includes(id))) return 'Inspect the relevant records before submitting.';
  if (answer.choice !== deduction.correct) return deduction.wrong;
  if (!Array.isArray(answer.citations) || answer.citations.length !== deduction.sources.length ||
    !deduction.sources.every((id) => answer.citations.includes(id))) {
    return 'Cite the records that establish each part of your conclusion.';
  }
  if (chapter.order && !sameOrder(answer.order, chapter.order)) return 'Compare the three timestamps and put the earliest event first.';
  return '';
}

export function transitionCase(saved, action, unlocked = []) {
  const progress = beginCase(saved, unlocked);
  if (action.type === 'restart') return { ...firstInvestigation, role: progress.role };
  if (action.type === 'role' && typeof action.role === 'string' && Object.hasOwn(roles, action.role)) {
    return { ...progress, role: action.role };
  }
  if (action.chapter !== progress.chapter) return saved;
  if (action.type === 'reopen' && progress.ending) return { ...progress, ending: '' };
  if (progress.ending) return saved;
  const index = chapters.findIndex(({ id }) => id === progress.chapter);
  const { discover, deduction } = chapters[index];
  const solved = progress.completed.includes(deduction.id);

  if (action.type === 'inspect' && discover.includes(action.id) && !progress.discovered.includes(action.id)) {
    return { ...progress, discovered: [...progress.discovered, action.id] };
  }
  if (action.type === 'deduce' && !solved && !assessDeduction(progress, action)) {
    return { ...progress, completed: [...progress.completed, deduction.id] };
  }
  if (action.type === 'advance' && solved && chapters[index + 1]) {
    return { ...progress, chapter: chapters[index + 1].id };
  }
  if (action.type === 'close' && solved && index === chapters.length - 1 && typeof action.ending === 'string' &&
    Object.hasOwn(endings, action.ending) && (action.ending !== 'secret' || hasKeepsakes(unlocked))) {
    return { ...progress, ending: action.ending };
  }
  return saved;
}
