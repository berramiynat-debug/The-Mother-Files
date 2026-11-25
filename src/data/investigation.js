export const caseTitle = 'The Play That Never Happened';
export const casePremise = 'Kids, a page called The Fifth Alibi is missing from your uncle Barney’s Playbook. He says the play never happened. Marshall has a signed document, and I may have remembered the first round wrong.';
export const roles = { questions: 'Ask the questions', notebook: 'Keep the notebook' };

export const witnesses = {
  marshall: 'Marshall Eriksen', barney: 'Barney Stinson', robin: 'Robin Scherbatsky',
  lily: 'Lily Aldrin', ted: 'Ted Mosby', bar: 'MacLaren’s records',
};

export const claims = {
  five: 'Marshall counted five separate witnesses.',
  firstRound: 'Ted remembers being there when Robin opened the tab.',
  author: 'Ted assumed Barney wrote the entire entry.',
  never: 'Barney says the play never happened.',
};

export const exhibits = {
  custody: {
    title: 'Marshall’s custody sheet', action: 'Open Barney’s envelope', witness: 'marshall',
    text: '21:20 · Custody sheet for The Fifth Alibi. Five signatures: Marshall Eriksen, Lily Aldrin, Robin Scherbatsky, Barney Stinson, Lorenzo von Matterhorn.',
  },
  aliases: {
    title: 'Barney’s signed correction', witness: 'barney',
    text: '“For the record: I signed my name and the Lorenzo von Matterhorn line. Lorenzo is one of my aliases. Swarley was an unrelated coffee incident.” · Signed, Barney Stinson.',
  },
  reservation: {
    title: 'Corner booth reservation', witness: 'bar',
    text: '21:00 · Table reserved for four. Staff noted that another chair could be added. This slip records the booking.',
  },
  receipt: {
    title: 'Robin’s opening receipt', witness: 'robin',
    text: '21:10 · Opening tab. Four drinks, assigned to Robin, Lily, Marshall and Barney. Robin kept the itemized copy.',
  },
  ledger: {
    title: 'Countersigned coat ledger', witness: 'robin',
    text: '21:40 · Ted arrived and handed Robin his coat. The arrival was marked at check-in and initialed by T.M. and R.S.',
  },
  draft: {
    title: 'The bar’s filing slip', witness: 'bar',
    text: 'The Fifth Alibi · Barney Stinson draft. Status on filing: unused. The custody signatures logged receipt of the page.',
  },
  note: {
    title: 'Lily’s private annotation', witness: 'lily',
    text: '21:45 · “I, Lily Aldrin, added the last line when Ted finally sat down after a rough night: Save a place for the friend who needs somewhere to land. Barney, please take this page out of circulation. The talk that followed was private.” · Signed L.A. on her retained carbon copy.',
  },
  withdrawal: {
    title: 'Signed withdrawal slip', witness: 'marshall',
    text: '22:05 · Entry withdrawn by Barney at Lily’s request for privacy. Lily placed the page in her sealed sleeve beneath the booth. No performance of the play took place. Signed by Barney Stinson and countersigned by Marshall Eriksen.',
  },
};

export const chapters = [
  {
    id: 'signatures', title: 'The custody sheet', goal: 'Inspect the signed records and check how many people signed for the page.',
    recording: 'Kids, Marshall counted five signatures. Barney said he could vouch for two of them personally. At the time, I thought that was reassuring.',
    claim: 'five', discover: ['custody', 'aliases', 'reservation'],
    deduction: {
      id: 'headcount', prompt: 'How many distinct people signed the custody sheet?',
      choices: { four: 'Four people signed.', five: 'Five people signed.', three: 'Three people signed.' },
      correct: 'four', sources: ['custody', 'aliases'],
      wrong: 'Count the people named on the sheet after applying the signed correction.',
      confirmed: 'The sheet has five signatures from four people. Barney signed twice, once as Lorenzo.',
    },
  },
  {
    id: 'timeline', title: 'The first round', goal: 'Compare Dad’s account with Robin’s records and reconstruct the order of events.',
    recording: 'I could picture my coat on the hook and Robin opening the tab. I even remembered the hook. There are two separate memories in that sentence, kids.',
    claim: 'firstRound', discover: ['receipt', 'ledger'], compare: ['reservation'],
    timeline: { arrival: 'Ted checks his coat', opening: 'Robin opens the tab', filing: 'Marshall files the custody sheet' },
    order: ['opening', 'filing', 'arrival'],
    deduction: {
      id: 'arrival', prompt: 'What can you establish about Ted’s arrival?',
      choices: { present: 'Ted was present when the tab opened.', later: 'Ted arrived after the tab opened.', unknown: 'The time of Ted’s arrival is unknown.' },
      correct: 'later', sources: ['receipt', 'custody', 'ledger'],
      wrong: 'A drinks tab records who ordered. To establish Ted’s arrival, check the separately signed entry.',
      confirmed: 'Robin opened the tab at 21:10. Marshall filed the sheet at 21:20. Ted’s countersigned arrival was at 21:40.',
    },
  },
  {
    id: 'annotation', title: 'A line in the margin', goal: 'Compare the draft record with the private annotation and identify who changed the page.',
    recording: 'I used to tell this part as if every word on a Playbook page had to come from Barney. Aunt Lily asked me to read the last line out loud.',
    claim: 'author', discover: ['draft', 'note'], compare: ['custody'],
    deduction: {
      id: 'authorship', prompt: 'Who wrote the last line?',
      choices: { barney: 'Barney wrote both the draft and its last line.', lily: 'Lily added the last line to Barney’s draft.', ted: 'Ted wrote the last line when he arrived.' },
      correct: 'lily', sources: ['draft', 'note'],
      wrong: 'Read the filing credit and the signed annotation as records of different contributions.',
      confirmed: 'The filing slip credits Barney’s unused draft. Lily’s signed carbon copy records the line she added and her request for privacy.',
    },
  },
  {
    id: 'verdict', title: 'What never happened', goal: 'Compare the unused draft and the withdrawal record before deciding where the page belongs.',
    recording: 'I heard “the play never happened” and told you there was no page. I’d turned a perfectly good sentence into the wrong story.',
    claim: 'never', discover: ['withdrawal'], compare: ['ledger'],
    deduction: {
      id: 'withdrawal', prompt: 'What do the records establish about the page?',
      choices: { invented: 'There was never a page.', performed: 'The play was performed and its record erased.', private: 'The page existed. It was withdrawn for privacy, and the play was never performed.' },
      correct: 'private', sources: ['draft', 'note', 'withdrawal'],
      wrong: 'Look for three separate facts: the draft’s existence, Lily’s request, and the play’s status on the signed withdrawal.',
      confirmed: 'The Fifth Alibi existed as a draft and was never performed. Lily made its last line about leaving space for a friend. Barney withdrew the page to protect their privacy. Lily brings you the sealed sleeve from the booth.',
    },
  },
];

export const endings = {
  restored: { choice: 'File the corrected case', title: 'The archive restored', text: 'Kids, you filed the draft and credited Aunt Lily, then sealed the private line. Barney drafted a footnote and asked if he could sign it twice.' },
  published: { choice: 'Share a redacted account', title: 'The city reads it first', text: 'Robin published how you corrected the record and left the private evening out. By breakfast, Barney had written two letters to the editor. One came from Lorenzo.' },
  sealed: { choice: 'Keep the page at the booth', title: 'A private table', text: 'Lily put the page in a sleeve under the booth. When I reached for the recorder, you handed me a coaster and asked me to sit down.' },
  secret: { choice: 'Save one last seat', title: 'One last seat', text: 'The keepsakes brought everybody back to the booth. Barney pulled up a chair without a speech. Then I sat down, and you two told the story.' },
};

export const caseExhibits = {
  umbrella: { clue: 'Look at the umbrella on the rainy street.', route: '/', link: 'Go to the rainy street' },
  photo: { clue: 'Check the corner booth for the old photograph.', route: '/pub', link: 'Visit the booth' },
  envelope: { clue: 'Look for the wax seal at the pub.', route: '/pub', link: 'Visit MacLaren’s' },
  string: { clue: 'Try the loose thread on the evidence board.', route: '/evidence', link: 'Open the evidence board' },
  horn: { clue: 'Look for the blue musical note below the home archive.', route: '/', link: 'Find the blue note' },
};
