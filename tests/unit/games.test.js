import { describe, expect, it } from 'vitest';
import { buildQuestions, gradeReaction, meterPosition, synopsisClue } from '../../src/features/games/logic.js';
import { beginCase, canClose, canCombine, decodeLabel, firstInvestigation, secretMemories } from '../../src/features/story/logic.js';
import { playEnding } from '../../src/data/playbook.js';

describe('games and story', () => {
  it('provides four distinct options and prevents a clue from exposing its title', () => {
    const rows = [{ answer: 'Zoo (Part 2)', options: ['A', 'B', 'C', 'A', 'Zoo (Part 2)'] }];
    const [question] = buildQuestions(rows, 10, () => 0.5);
    expect(new Set(question.options).size).toBe(4);
    expect(question.options).toContain(rows[0].answer);
    expect(synopsisClue('Zoo (Part 2) happened yesterday.', [rows[0].answer])).toBe('[redacted] happened yesterday.');
    expect(buildQuestions([{ answer: 'A', options: ['B', 'B'] }], 10)).toEqual([]);
  });
  it('scores the selected target with a bounded timing meter', () => {
    expect(meterPosition(500, 1000)).toBe(.5);
    expect(meterPosition(1200, 1000)).toBeCloseTo(.8);
    expect(gradeReaction(.5, .09)).toEqual({ hit: true, points: 100 });
    expect(gradeReaction(.02, .09)).toEqual({ hit: false, points: 0 });
  });
  it('validates a restored story and gates all four endings', () => {
    expect(beginCase({ stage: 9 })).toBe(firstInvestigation);
    const oldSave = { stage: 2, responses: ['Earlier testimony'], combined: false, ending: '' };
    expect(beginCase(oldSave)).toEqual({ ...oldSave, role: '' });
    expect(beginCase({ ...oldSave, role: 'questions' }).role).toBe('questions');
    expect(decodeLabel('09/19')).toBe(true);
    expect(decodeLabel('19/09')).toBe(false);
    expect(canCombine(secretMemories.slice(1))).toBe(false);
    expect(canCombine(secretMemories)).toBe(true);
    for (const ending of ['restored', 'published', 'sealed']) {
      expect(canClose(2, ending, true)).toBe(false);
      expect(canClose(3, ending, false)).toBe(true);
    }
    expect(canClose(3, 'secret', false)).toBe(false);
    expect(canClose(3, 'secret', true)).toBe(true);
  });
  it('supports three distinct Playbook results', () => {
    expect(playEnding({ heart: 9, flair: 0 })[0]).toBe('The regular');
    expect(playEnding({ heart: 2, flair: 9 })[0]).toBe('The headline');
    expect(playEnding({ heart: 4, flair: 5 })[0]).toBe('The accomplice');
  });
});
