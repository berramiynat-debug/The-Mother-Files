import { describe, expect, it } from 'vitest';
import { buildQuestions, gradeReaction, meterPosition, synopsisClue } from '../../src/features/games/logic.js';
import { playEnding } from '../../src/data/playbook.js';

describe('games', () => {
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
  it('supports three distinct Playbook results', () => {
    expect(playEnding({ heart: 9, flair: 0 })[0]).toBe('The regular');
    expect(playEnding({ heart: 2, flair: 9 })[0]).toBe('The headline');
    expect(playEnding({ heart: 4, flair: 5 })[0]).toBe('The accomplice');
  });
});
