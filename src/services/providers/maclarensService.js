const jokes = [
  'I told an architect to draw the shortest route to the booth. He came back with a mezzanine.',
  'The jukebox takes two kinds of payment: quarters and promises to stop singing.',
  'A detective walks into a bar. The bartender asks for a tip. The detective opens a notebook.',
];
const notebook = [
  'The bartender dries the corner booth first. Its window is usually the first to catch the rain.',
  'One of the keys behind the bar opens a drawer labeled “tomorrow.” No one has worked out which tomorrow.',
  'If an envelope arrives after midnight, check whether it is dated yesterday.',
];
export const maclarensService = {
  pick(kind, index) {
    const items = kind === 'joke' ? jokes : notebook;
    return { text: items[index % items.length], source: 'Original pub fiction' };
  },
};
