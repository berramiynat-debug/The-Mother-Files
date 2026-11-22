import { useState } from 'react';
import { Check, Coffee, FileText, Mail, NotebookPen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArchive } from '../../context/archiveContext.js';
import { caseExhibits, pilotAirDate } from '../../data/investigation.js';
import { memories } from '../../data/memories.js';
import { useResource } from '../../hooks/useResource.js';
import { tvmazeService } from '../../services/providers/tvmazeService.js';
import { canClose, canCombine, decodeLabel, secretMemories } from './logic.js';

const fetchPilot = () => tvmazeService.episode(12285);
const formatDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const coffeeNames = [
  ['Robin Sparkles', 'That’s Robin’s stage name. The cup is addressed to someone else.'],
  ['Swarley', ''],
  ['The Blitz', 'The cup starts with SWAR. The other nickname won’t fit.'],
];

export function BarneyNote({ label = 'Barney’s note', children }) {
  return <figure className="barney-note">
    <figcaption><Mail size={16} aria-hidden="true" /> {label}</figcaption>
    <blockquote>{children}</blockquote>
  </figure>;
}

function Found({ children }) {
  return <p className="case-found"><Check size={19} aria-hidden="true" /> {children}</p>;
}

export function CoffeeCup({ progress, openLetter, answer, advance }) {
  const [feedback, setFeedback] = useState('');
  if (progress.responses[0]) return <>
    <Found>The cup points to Barney.</Found>
    <BarneyNote label="Barney’s recorded message">Fine. That name is mine. I was at our booth when the umbrella went missing. Check the drawer. I left the code with Lily because she’s the only one who reads footnotes.</BarneyNote>
    <div className="button-row"><button className="button primary" onClick={advance}>Go to the MacLaren’s drawer</button><Link className="text-link" to="/episodes/12313">The Swarley episode</Link></div>
  </>;

  if (!progress.opened) return <div className="case-envelope paper">
    <div><p className="eyebrow"><Mail size={17} aria-hidden="true" /> From Barney Stinson</p>
      <p className="envelope-message">For the Mosby kids.<br />Open before your father starts the flashback.</p></div>
    <button className="button primary" onClick={openLetter}>Open Barney’s envelope</button>
  </div>;

  return <>
    <div className="case-ticket paper">
      <Coffee size={22} aria-hidden="true" />
      <div><p className="eyebrow">Coffee order · Smudged label</p><p className="coffee-mark">SWARL_Y</p></div>
    </div>
    <BarneyNote>That cup is also a legal document. I checked with Marshall. He said to stop calling him.</BarneyNote>
    <fieldset className="case-choices">
      <legend>Which name belongs on the cup?</legend>
      <div className="choice-grid">
        {coffeeNames.map(([name, message]) => <button key={name} className="choice" onClick={() => message ? setFeedback(message) : answer('swarley')}>{name}</button>)}
      </div>
    </fieldset>
    {feedback && <p className="case-feedback" role="status">{feedback}</p>}
  </>;
}

export function MacLarensDrawer({ progress, solved, advance }) {
  const { state, unlock } = useArchive();
  const [evidence, setEvidence] = useState('');
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const pilot = useResource(evidence === 'pilot' ? 'case-pilot' : null, fetchPilot);
  const apiDate = pilot.data?.date ?? '';
  const liveDate = /^\d{4}-\d{2}-\d{2}$/.test(apiDate) && Number.isFinite(Date.parse(apiDate));
  const airDate = liveDate ? apiDate : pilotAirDate;
  const photo = progress.responses[1] === 'photo' || (progress.opened === undefined && state.unlocked.includes('photo'));

  if (photo) return <>
    <Found>Drawer opened. You found the photograph.</Found>
    <p>The photo has a fresh sign-out slip clipped to it. Two witnesses signed it. Their handwriting looks suspiciously similar.</p>
    <button className="button primary" onClick={advance}>Read the witness slip</button>
  </>;

  function decode(event) {
    event.preventDefault();
    if (decodeLabel(value, airDate)) { unlock('photo'); solved(); }
    else setFeedback('The drawer stays shut. Use the Pilot’s month and day, in that order.');
  }

  return <>
    <div className="case-evidence-actions">
      <button className="button secondary" aria-pressed={evidence === 'pilot'} onClick={() => setEvidence('pilot')}><FileText size={17} aria-hidden="true" /> Read the Pilot card</button>
      <button className="button secondary" aria-pressed={evidence === 'pineapple'} onClick={() => { setEvidence('pineapple'); unlock('pineapple'); }}>Inspect the pineapple</button>
    </div>
    {evidence === 'pilot' && <div className="case-ticket paper" aria-live="polite">
      <FileText size={22} aria-hidden="true" />
      <div><p className="eyebrow">Pilot · Season 1, Episode 1</p>
        <strong>{formatDate.format(new Date(airDate + 'T00:00:00Z'))}</strong>
        <p>{liveDate ? 'Original air date · TVmaze' : 'Date from Lily’s case copy'} · <Link to="/episodes/12285">Open the episode record</Link></p></div>
    </div>}
    {evidence === 'pineapple' && <p className="case-feedback" role="status">A note from Lily: “I have no idea how this got back in here. For the lock, try the Pilot card.”</p>}
    <form className="decode-form case-lock" onSubmit={decode}>
      <label className="field-label">Drawer code <input type="text" value={value} onChange={(event) => setValue(event.target.value)} placeholder="MMDD" maxLength={5} inputMode="numeric" autoComplete="off" required /></label>
      <button className="button primary" type="submit">Unlock drawer</button>
      <p>Enter the month and day as four digits. March 7 would be 0307.</p>
    </form>
    {feedback && <p className="case-feedback" role="status">{feedback}</p>}
    <BarneyNote label="Barney’s note under the booth">For the record, I object to the pineapple being called as a witness. It was present at a completely different incident.</BarneyNote>
  </>;
}

export function WitnessSlip({ progress, answer, advance }) {
  const [inspected, setInspected] = useState(false);
  const [feedback, setFeedback] = useState('');
  if (progress.responses[2]) return <>
    <Found>Both signatures belong to Barney.</Found>
    <BarneyNote label="Barney, after being shown the evidence">I offered to produce an independent witness. I did not specify independent from whom. Fine, the slip was my doing. The umbrella? Ask your dad.</BarneyNote>
    <button className="button primary" onClick={advance}>Ask Dad about the umbrella</button>
  </>;

  return <>
    <div className="case-ticket paper">
      <FileText size={22} aria-hidden="true" />
      <div><p className="eyebrow">Umbrella sign-out slip · Witnesses</p><p className="case-signatures"><span>Swarley</span><span>Lorenzo von Matterhorn</span></p></div>
    </div>
    <button className="button secondary" aria-expanded={inspected} onClick={() => setInspected(!inspected)}><NotebookPen size={17} aria-hidden="true" /> {inspected ? 'Hide the alias notes' : 'Compare their aliases'}</button>
    {inspected && <p className="case-feedback">Swarley is the name from Barney’s cup. Lorenzo von Matterhorn is a character Barney invented for the Playbook. <Link className="text-link" to="/characters/46417">Barney’s dossier</Link> · <Link className="text-link" to="/episodes/12380">The Playbook episode</Link></p>}
    <fieldset className="case-choices">
      <legend>Who actually signed the slip?</legend>
      <div className="choice-grid">
        <button className="choice" onClick={() => setFeedback('Read the names again. Both have a connection to Barney.')}>Two people signed it</button>
        <button className="choice" onClick={() => answer('barney')}>Both names are Barney</button>
      </div>
    </fieldset>
    {feedback && <p className="case-feedback" role="status">{feedback}</p>}
  </>;
}

const decisions = [
  ['restored', 'Restore the files to the archive', 'Keep the photo with a note about who remembered what.'],
  ['published', 'Publish the witnesses’ versions', 'Ask Robin to invite New York to add its memories.'],
  ['sealed', 'Leave the photograph with the booth', 'Keep this version for the people who were there.'],
];

export function Finale({ progress, update }) {
  const { state, unlock, chime } = useArchive();
  const found = canCombine(state.unlocked);
  const count = secretMemories.filter((id) => state.unlocked.includes(id)).length;
  function close(ending) {
    if (!canClose(progress.stage, ending, progress.combined)) return;
    update({ ending });
    if (ending === 'secret') unlock('secret');
    chime();
  }

  return <>
    <BarneyNote label="Barney’s closing argument">As the only witness who appeared twice, I believe I should get two votes. Your aunt Lily has submitted a counterargument consisting entirely of a look.</BarneyNote>
    <div className="case-decisions">
      {decisions.map(([id, label, consequence]) => <button className="choice role-choice" key={id} onClick={() => close(id)}><strong>{label}</strong><span>{consequence}</span></button>)}
    </div>
    <details className="case-help case-inventory" open={found || undefined}>
      <summary>Secret ending · {count}/{secretMemories.length} keepsakes</summary>
      <ul>{secretMemories.map((id) => {
        const owned = state.unlocked.includes(id);
        const exhibit = caseExhibits[id];
        return <li key={id}><strong>{memories.find((row) => row.id === id)?.title}</strong>
          {owned ? <span>Found</span> : <span>{exhibit.clue} {exhibit.route && <Link className="text-link" to={exhibit.route}>{exhibit.link}</Link>}</span>}</li>;
      })}</ul>
      {progress.combined ? <button className="button primary" onClick={() => close('secret')}>Read the reverse of the photograph</button>
        : <button className="button secondary" disabled={!found} onClick={() => update({ combined: true })}>Combine evidence</button>}
    </details>
  </>;
}

export function CaseCompleted({ ending, onChooseAgain, onRestart }) {
  return <div className="game-result">
    <p className="eyebrow"><ShieldCheck size={17} aria-hidden="true" /> Case closed</p>
    <h2>{ending[0]}</h2>
    <figure className="case-dialogue case-recording"><figcaption>Dad’s last recording</figcaption><blockquote>{ending[1]}</blockquote></figure>
    <div className="button-row">
      <button className="button primary" onClick={onChooseAgain}>Try another ending</button>
      <button className="button secondary" onClick={onRestart}>Restart investigation</button>
    </div>
  </div>;
}
