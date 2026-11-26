import { characterArtifacts, episodeArtifacts } from './wikiArtifacts.js';

export const memories = [
  ['horn', 'The blue French horn', 'The street outside the archive has its own soundtrack.'],
  ['umbrella', 'Yellow umbrella', 'The underside holds a luggage tag stamped “Lost & Found.”'],
  ['swarley', 'Swarley protocol', 'The coffee was right. The name was gloriously wrong.'],
  ['sparkles', 'The mall transmission', 'A disco signal interrupted the dossier.'],
  ['telephone', 'Have you met Ted?', 'The best introductions start with a genuine question.'],
  ['suit', 'Suit up', 'One sharply dressed archive file.'],
  ['bro', 'The booth code', 'Rule one: reserve the corner booth for whoever needs it most.'],
  ['duck', 'Duck or rabbit?', 'Same lines, two readings. Good evidence can do that.'],
  ['date', 'The first page', 'The archive starts on September 19, 2005.'],
  ['string', 'The red thread', 'Follow the loose end. Someone meant for you to find it.'],
  ['case3355', 'Case File 3355', 'You opened the technical annex.'],
  ['playbook', 'The playbook', 'You survived five conspicuously complicated decisions.'],
  ['narrator', 'Recovered voice', 'You recognized who was talking.'],
  ['episode', 'Screening room', 'You matched at least seven fragments to the right episode.'],
  ['reaction', 'Perfect timing', 'You caught the signal inside the target zone.'],
  ['photo', 'Corner booth photograph', 'An old print from the corner booth at MacLaren’s.'],
  ['envelope', 'The wax seal', 'Barney marked the envelope “For the Mosby kids.”'],
  ['secret', 'One last seat', 'You saved a seat for Dad. This time, you two got to tell the story.'],
  ...Array.from(characterArtifacts.values(), ({ id, title, description }) => [id, title, description]),
  ...Array.from(episodeArtifacts.values(), ({ id, title, description }) => [id, title, description]),
].map(([id, title, description]) => ({ id, title, description }));
