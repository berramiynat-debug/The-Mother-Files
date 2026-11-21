export function shuffle(rows, random = Math.random) {
  const items = [...rows];
  for (let index = items.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

export function seededRandom(seed) {
  let state = Math.floor(seed * 2 ** 32);
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

export function buildQuestions(rows, size, random = Math.random) {
  return shuffle(rows, random).filter((row) => {
    return new Set(row.options.filter((option) => option && option !== row.answer)).size >= 3;
  }).slice(0, size).map((row) => {
    const distractors = [...new Set(row.options.filter((item) => item && item !== row.answer))];
    return { ...row, options: shuffle([row.answer, ...shuffle(distractors, random).slice(0, 3)], random) };
  });
}

export const fold = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export function synopsisClue(summary, names) {
  let clue = summary;
  for (const name of names) {
    if (!name) continue;
    const safe = name.replace(/[.*+?^\x24{}()|[\]\\]/g, '\\$&');
    clue = clue.replace(new RegExp(safe, 'gi'), '[redacted]');
  }
  return clue;
}

export const reactionSettings = {
  Casual: { speed: 1700, target: .13 },
  Classic: { speed: 1180, target: .09 },
  Legendary: { speed: 760, target: .055 },
};
export const meterPosition = (elapsed, speed) => 1 - Math.abs((elapsed / speed) % 2 - 1);
export const gradeReaction = (position, target, center = .5) => {
  const distance = Math.abs(center - position);
  return { hit: distance <= target, points: Math.max(0, Math.round(100 - distance * 240)) };
};
