import { describe, expect, it } from 'vitest';
import { chapters, endings } from '../../src/data/investigation.js';
import { archiveLegacyCase, assessDeduction, beginCase, firstInvestigation, secretMemories, transitionCase } from '../../src/features/story/logic.js';

function update(progress, action, unlocked) {
  return transitionCase(progress, { chapter: progress.chapter, ...action }, unlocked);
}

function inspect(progress, ids) {
  return ids.reduce((current, id) => update(current, { type: 'inspect', id }), progress);
}

function solve(progress, chapter) {
  const { deduction, order } = chapter;
  return update(inspect(progress, chapter.discover), { type: 'deduce', choice: deduction.correct, citations: deduction.sources, order });
}

describe('Playbook case rules', () => {
  it('requires inspected records, a valid claim, and the full set of supporting citations', () => {
    const answer = { type: 'deduce', choice: 'four', citations: ['custody', 'aliases'] };
    const first = firstInvestigation;
    expect(update(first, answer)).toBe(first);
    expect(update(first, { type: 'advance' })).toBe(first);
    expect(update(first, { type: 'inspect', id: 'note' })).toBe(first);
    const read = inspect(first, ['custody', 'aliases', 'reservation']);
    expect(update(read, { type: 'inspect', id: 'custody' })).toBe(read);
    expect(assessDeduction(read, { ...answer, choice: 'five' })).toMatch(/Count the people/);
    expect(assessDeduction(read, { ...answer, citations: ['custody', 'reservation'] })).toContain('Cite Barney’s signed correction');
    const solved = update(read, answer);
    expect(solved.completed).toEqual(['headcount']);
    expect(update(solved, answer)).toBe(solved);
    const next = update(solved, { type: 'advance' });
    expect(update(next, { type: 'advance', chapter: 'signatures' })).toBe(next);
  });

  it('requires an independently recorded arrival and a correct chronology', () => {
    const progress = update(solve(firstInvestigation, chapters[0]), { type: 'advance' });
    const read = inspect(progress, ['receipt', 'ledger']);
    const answer = { type: 'deduce', choice: 'later', citations: ['receipt', 'custody', 'ledger'] };
    expect(assessDeduction(read, { ...answer, order: ['filing', 'opening', 'arrival'] })).toMatch(/timestamps/);
    expect(assessDeduction(read, { ...answer, citations: ['custody', 'receipt'], order: ['opening', 'filing', 'arrival'] })).toMatch(/Cite/);
    expect(update(read, { ...answer, order: ['opening', 'filing', 'arrival'] }).completed).toEqual(['headcount', 'arrival']);
  });

  it('allows a reviewed comparison record alongside the required authorship citations', () => {
    const timeline = update(solve(firstInvestigation, chapters[0]), { type: 'advance' });
    const annotation = update(solve(timeline, chapters[1]), { type: 'advance' });
    const read = inspect(annotation, ['draft', 'note']);
    const answer = { type: 'deduce', choice: 'lily', citations: ['draft', 'note', 'custody'] };
    expect(assessDeduction(read, { ...answer, citations: ['note'] })).toBe(
      'Tick “Cite The bar’s filing slip”, then select Check deduction.',
    );
    for (const citations of [[...answer.citations, 'reservation'], [...answer.citations, 'note']]) {
      expect(assessDeduction(read, { ...answer, citations })).toMatch(/Select the supporting records/);
    }
    const solved = update(read, answer);
    expect(solved.completed).toEqual(['headcount', 'arrival', 'authorship']);
    expect(update(solved, { type: 'advance' }).chapter).toBe('verdict');
  });

  it('checks the final deduction and keepsakes, preserves choices on reload, and clears only case progress on restart', () => {
    let progress = firstInvestigation;
    for (const chapter of chapters) {
      for (const ending of Object.keys(endings)) expect(update(progress, { type: 'close', ending }, secretMemories)).toBe(progress);
      progress = solve(progress, chapter);
      progress = update(progress, { type: 'advance' });
    }
    expect(progress.completed).toEqual(chapters.map(({ deduction }) => deduction.id));
    expect(update(progress, { type: 'close', ending: 'secret' }, secretMemories.slice(1))).toBe(progress);
    for (const ending of Object.keys(endings)) {
      const closed = update(progress, { type: 'close', ending }, secretMemories);
      expect(beginCase(JSON.parse(JSON.stringify(closed)), secretMemories).ending).toBe(ending);
      expect(update(closed, { type: 'reopen' }, secretMemories)).toEqual(progress);
    }
    const withRole = update(progress, { type: 'role', role: 'notebook' });
    expect(update(withRole, { type: 'restart' })).toEqual({ ...firstInvestigation, role: 'notebook' });
  });

  it('archives the legacy case verbatim and sanitizes malformed or impossible progress', () => {
    const old = { stage: 3, responses: ['swarley', 'photo', 'barney'], ending: 'restored', role: 'notebook' };
    const saved = { story: old, unlocked: ['photo'], favorites: [1], aliases: ['Lorenzo'], sound: true };
    expect(archiveLegacyCase(saved)).toEqual({ ...saved, story: null, legacyStory: old });
    expect(beginCase(old)).toEqual(firstInvestigation);
    expect(beginCase({ ...firstInvestigation, role: {}, chapter: 'verdict', completed: ['arrival'], discovered: ['withdrawal'], ending: 'secret' })).toEqual(firstInvestigation);
    expect(beginCase({ ...firstInvestigation, chapter: 'timeline', completed: ['headcount'], discovered: ['custody', 'custody', 'aliases', 'withdrawal'] }).discovered).toEqual(['custody', 'aliases']);
  });
});
