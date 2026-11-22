export const roles = { questions: 'Ask the questions', notebook: 'Keep the notebook' };
export const pilotAirDate = '2005-09-19';

export const chapters = [
  {
    title: 'The coffee cup',
    goal: 'Open Barney’s envelope and work out whose name is on the cup.',
    recording: 'Kids, I was six minutes into the short version when Barney dropped off an envelope marked “Emergency.” He’d underlined it twice. In his defense, something really was missing this time.',
    notebook: 'I’ll interrogate Dad about the envelope. You check what Barney actually wrote.',
    questions: 'I’ve got the envelope in our notes. Dad can explain his filing system after we open it.',
  },
  {
    title: 'The MacLaren’s drawer',
    goal: 'Find the Pilot air date and enter its month and day in the lock.',
    recording: 'We kept a spare photograph under the booth. Barney insisted the drawer needed a lock. Lily insisted the lock couldn’t use his birthday, his suit size, or a four-digit number he considered handsome.',
    notebook: 'Write down the month and day, with a zero if either part needs it.',
    questions: 'I’ll keep the drawer open. Read the Pilot card for the date. The pineapple can wait.',
  },
  {
    title: 'Two very familiar witnesses',
    goal: 'Compare the two names on the slip and decide how many people signed it.',
    recording: 'The print came with a sign-out slip and two witnesses. Barney asked me to stress that both of them were extremely credible. He had also bought both of them the same tie.',
    notebook: 'Compare the two signatures with the alias notes before you count them.',
    questions: 'I’ve copied the signatures. Ask whether either of those people has ever stood in the same room as Barney.',
  },
  {
    title: 'Who gets to hear it?',
    goal: 'Decide where Dad’s story goes. Gather the remaining keepsakes to unlock a fourth choice.',
    recording: 'Barney rewrote the sign-out slip. The umbrella was with me. I’d put it aside because I kept trying to tell one perfect version of that night. You two read the actual notes, and you listened when the stories didn’t match. Where do you think it belongs?',
    notebook: 'We can file it, share it, or put it back under the booth. Check the keepsakes before we close the notebook.',
    questions: 'For once, Dad asked us a question he hasn’t already answered. I say we make him wait for it.',
  },
];

export const caseExhibits = {
  umbrella: { clue: 'Look at the umbrella on the rainy street.', route: '/', link: 'Go to the rainy street' },
  photo: { clue: 'The print was inside the booth drawer.' },
  envelope: { clue: 'Look for the wax seal at the booth.', route: '/pub', link: 'Visit MacLaren’s' },
  string: { clue: 'Try the loose thread on the evidence board.', route: '/evidence', link: 'Open the evidence board' },
  horn: { clue: 'Look for the blue musical note below the home archive.', route: '/', link: 'Find the blue note' },
};
