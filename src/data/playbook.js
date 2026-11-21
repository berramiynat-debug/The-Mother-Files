export const plays = [
  { title: 'An introduction', line: 'Ted rehearses a greeting on the walk over. When you arrive, he asks if you can go first.', choices: [
    { label: 'Ask about their favorite place in New York.', text: 'Lily is listening from across the booth. She gives it a quiet thumbs-up.', heart: 2, flair: 0 },
    { label: 'Announce that Ted is the mayor of the booth.', text: 'Barney asks whether this makes him deputy mayor. The evening now needs an election.', heart: 0, flair: 2 },
  ] },
  { title: 'The empty seat', line: 'One chair is free. Marshall says he’s saving it for a friend. A stranger is standing with a notebook.', choices: [
    { label: 'Find another chair for the stranger.', text: 'Marshall slides over. Everyone fits, although no one can reach the salt.', heart: 2, flair: 0 },
    { label: 'Launch a contest for the chair.', text: 'Robin produces a coin and becomes the referee without consulting anyone.', heart: 0, flair: 2 },
  ] },
  { title: 'The receipt', line: 'The bartender discovers three orders for fries. Only one person remembers ordering any.', choices: [
    { label: 'Split the fries with the next table.', text: 'The neighboring table upgrades your rating from “loud” to “occasionally generous.”', heart: 2, flair: 0 },
    { label: 'Declare a ceremonial fry tasting.', text: 'Barney supplies tasting notes. They are all “potato,” with different emphasis.', heart: 1, flair: 2 },
  ] },
  { title: 'A borrowed story', line: 'A listener asks why Ted keeps carrying a folded street map. Ted leaves the answer up to you.', choices: [
    { label: 'Tell the part he already shared with you.', text: 'Ted finishes the story himself, including a surprisingly moving bit about a bus stop.', heart: 2, flair: 0 },
    { label: 'Invent a lost subway station beneath the pub.', text: 'Robin pulls out her phone and starts checking city records. Commit to the bit.', heart: 0, flair: 3 },
  ] },
  { title: 'The walk home', line: 'The rain has doubled. You have one umbrella and more friends than it can hold.', choices: [
    { label: 'Walk everyone to their corner, one at a time.', text: 'You get home last. For once, no one minds the long version of the story.', heart: 3, flair: 0 },
    { label: 'Organize a sprint from awning to awning.', text: 'The last sprint ends at a corner diner. It might have been the plan all along.', heart: 0, flair: 2 },
  ] },
];
export function playEnding({ heart, flair }) {
  if (heart >= 8) return ['The regular', 'By closing time, the booth has made room for somebody new.'];
  if (flair >= 8) return ['The headline', 'Robin comes away with a story, a soggy napkin, and absolutely no way to fact-check the evening.'];
  return ['The accomplice', 'The evening goes slightly sideways. Your friends decide to put it on the calendar anyway.'];
}
