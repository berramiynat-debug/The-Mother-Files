export const plays = [
  { title: 'An introduction', line: 'Kids, I spent the whole walk rehearsing how to say ‘hi.’ By the time we reached the booth, I was going to need one of you to go first.', choices: [
    { label: 'Ask about their favorite place in New York.', text: 'Lily is listening from across the booth. She gives it a quiet thumbs-up.', heart: 2, flair: 0 },
    { label: 'Announce that Ted is the mayor of the booth.', text: 'Barney asks whether this makes him deputy mayor. The evening now needs an election.', heart: 0, flair: 2 },
  ] },
  { title: 'The empty seat', line: 'There was exactly one chair free. Marshall was saving it for a friend. The person standing next to us had a notebook and an excellent claim based on being there.', choices: [
    { label: 'Find another chair for the stranger.', text: 'Marshall slides over. Everyone fits, although no one can reach the salt.', heart: 2, flair: 0 },
    { label: 'Launch a contest for the chair.', text: 'Robin produces a coin and becomes the referee without consulting anyone.', heart: 0, flair: 2 },
  ] },
  { title: 'The receipt', line: 'The bartender found three orders for fries on our tab. Somebody had ordered a second round of fries to apologize for ordering the first.', choices: [
    { label: 'Split the fries with the next table.', text: 'The neighboring table upgrades your rating from “loud” to “occasionally generous.”', heart: 2, flair: 0 },
    { label: 'Declare a ceremonial fry tasting.', text: 'Barney supplies tasting notes. They are all “potato,” with different emphasis.', heart: 1, flair: 2 },
  ] },
  { title: 'A borrowed story', line: 'Somebody asked why I carried a folded street map. I could answer in two minutes or two hours, so I’m letting you choose where to start.', choices: [
    { label: 'Tell the part he already shared with you.', text: 'Ted finishes the story himself, including a surprisingly moving bit about a bus stop.', heart: 2, flair: 0 },
    { label: 'Invent a lost subway station beneath the pub.', text: 'Robin pulls out her phone and starts checking city records. Commit to the bit.', heart: 0, flair: 3 },
  ] },
  { title: 'The walk home', line: 'By closing time it was pouring. We had one umbrella and five radically different ideas about how wide it was.', choices: [
    { label: 'Walk everyone to their corner, one at a time.', text: 'You get home last. For once, no one minds the long version of the story.', heart: 3, flair: 0 },
    { label: 'Organize a sprint from awning to awning.', text: 'The last sprint ends at a corner diner. It might have been the plan all along.', heart: 0, flair: 2 },
  ] },
];
export function playEnding({ heart, flair }) {
  if (heart >= 8) return ['The regular', 'By closing time, the booth has made room for somebody new.'];
  if (flair >= 8) return ['The headline', 'Robin comes away with a story, a soggy napkin, and absolutely no way to fact-check the evening.'];
  return ['The accomplice', 'The evening goes slightly sideways. Your friends decide to put it on the calendar anyway.'];
}
