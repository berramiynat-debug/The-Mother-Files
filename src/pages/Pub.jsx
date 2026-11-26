import { useState } from 'react';
import { BookOpen, Briefcase, Coffee, Mail, Music, NotebookPen, Phone, Sofa } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, SpoilerToggle } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { himymCharacterService } from '../services/providers/himymCharacterService.js';
import { maclarensService } from '../services/providers/maclarensService.js';
import { quoteIsSafe } from '../services/normalizers/records.js';

const objects = [
  ['telephone', 'Telephone', Phone, 8, 28], ['jukebox', 'Jukebox', Music, 23, 47], ['notebook', 'Bartender’s notebook', NotebookPen, 35, 71],
  ['coaster', 'Coaster', Coffee, 52, 72], ['booth', 'Corner booth', Sofa, 72, 55], ['envelope', 'Sealed envelope', Mail, 89, 59],
  ['suitcase', 'Suitcase', Briefcase, 88, 83],
];

function Telephone() {
  const [message, setMessage] = useState('');
  const { unlock, chime } = useArchive();
  const speak = (line) => { setMessage(line); unlock('telephone'); chime(); };
  return <><p>Dad’s old recording starts with a phone call. He’s across the street, overthinking how to introduce himself to the person sketching by the window. What advice do you give him?</p>
    <div className="choice-grid"><button className="choice" onClick={() => speak('Dad asks about the sketch. Twenty minutes later, they’re making a map of the neighborhood. Your sibling points out that this is still technically him introducing himself.')}>Ask about the sketch</button>
      <button className="choice" onClick={() => speak('Dad announces a booth design contest. The stranger hands him a pencil and tells him to enter. Dad spends the next half hour specifying the seat depth.')}>Pitch a booth design contest</button></div>
    {message && <p className="note" aria-live="polite">{message}</p>}</>;
}

function Jukebox() {
  const { chime, state, set } = useArchive();
  const [result, setResult] = useState({ loading: false });
  const play = async () => {
    setResult({ loading: true });
    chime();
    try {
      const row = await himymCharacterService.randomQuote();
      setResult({ loading: false, row });
    } catch { setResult({ loading: false, error: true }); }
  };
  const { row } = result;
  return <><p>I saved a few voices in the jukebox. Pick a track for a chime and a short line from the community archive.</p>
    <div className="button-row"><button className="button primary" disabled={result.loading} onClick={play}>{result.loading ? 'Tuning…' : 'Play a random track'}</button>
      <button className="button secondary" aria-pressed={state.sound} onClick={() => { set('sound', !state.sound); chime(!state.sound); }}>{state.sound ? 'Mute jukebox' : 'Enable chime'}</button>
      <SpoilerToggle />
    </div>
    {row && <p className="note" aria-live="polite">{quoteIsSafe(row, state.spoilers)
      ? <>“{row.line}” — {row.author} · {row.source}</>
      : 'This track is sealed in spoiler-safe mode.'}</p>}
    {result.error && <p className="note" role="status">The jukebox could not recover a line. Choose another track.</p>}</>;
}

function Coaster() {
  const [choice, setChoice] = useState('');
  const [index, setIndex] = useState(0);
  const note = maclarensService.pick('joke', index);
  return <><p className="note">{note.text}</p><p className="credit">{note.source}</p>
    <button className="button secondary" onClick={() => setIndex(index + 1)}>Turn the coaster</button>
    <h3>Table trivia</h3><p>Which year is stamped on the first archive file?</p>
    <div className="chip-row">{['2004', '2005', '2006'].map((year) => <button className="tag" aria-pressed={choice === year} key={year} onClick={() => setChoice(year)}>{year}</button>)}</div>
    {choice && <p role="status">{choice === '2005' ? 'Correct. The pilot aired on September 19, 2005.' : 'Try the date pinned to the first season on the timeline.'}</p>}</>;
}

function Notebook() {
  const { unlock } = useArchive();
  const [index, setIndex] = useState(0);
  const note = maclarensService.pick('fact', index);
  return <><p className="note">{note.text}</p><p className="credit">{note.source}</p>
    <div className="button-row"><button className="button secondary" onClick={() => setIndex(index + 1)}>Next notebook entry</button>
      <button className="button secondary" onClick={() => unlock('bro')}>Read the folded rulebook</button>
      <Link className="button secondary" to="/collection"><BookOpen size={16} /> Read recovered memories</Link></div></>;
}

function Booth() {
  const [message, setMessage] = useState('');
  const { state, unlock } = useArchive();
  return <><p>Aunt Lily saved the corner table. Your sibling has already checked the seat cushions. You get to ask the questions.</p>
    <div className="choice-grid"><button className="choice" onClick={() => setMessage('Aunt Lily: “Start with the signed records. Your dad can remember every drink and still get the order wrong.”')}>Ask about The Fifth Alibi</button>
      <button className="choice" onClick={() => setMessage('Aunt Lily: “The umbrella had a lost-and-found tag. Check the street outside the archive. He spent three paragraphs describing the rain.”')}>Ask about the umbrella</button></div>
    {message && <p className="note" aria-live="polite">{message}</p>}
    <button className="button secondary" disabled={state.unlocked.includes('photo')} onClick={() => unlock('photo')}>
      {state.unlocked.includes('photo') ? 'Booth photograph recovered' : 'Inspect the booth photograph'}
    </button></>;
}

export default function Pub() {
  const { unlock, set, state, notice } = useArchive();
  const [object, setObject] = useState('booth');
  const active = objects.find(([id]) => id === object);
  const envelope = state.unlocked.includes('envelope');
  const inspected = objects.filter(([id]) => state.pubObjects.includes(id)).length;
  const onSelect = (id) => {
    setObject(id);
    if (!state.pubObjects.includes(id)) set('pubObjects', (seen) => [...new Set([...seen, id])]);
    if (id === 'envelope') unlock('envelope');
  };
  const Screen = { telephone: Telephone, jukebox: Jukebox, coaster: Coaster, notebook: Notebook, booth: Booth }[object];
  return <section className="wrap page pub-page">
    <PageHeading eyebrow="MacLaren’s · Original interactive fiction" title="After dark." description="Kids, this was our booth. I saved a little of the place in the archive. Try the phone, the notebook, or anything your aunt Lily would tell you to put back." />
    <div className="pub-explorer">
      <div>
        <div className="pub-scene" role="group" aria-label="Objects in MacLaren’s">
          <img src="/pub.webp" alt="A warmly lit neighborhood pub with a wall telephone, jukebox, and corner booth" />
          <div className="pub-spotlight" aria-hidden="true" style={{ '--pub-x': active[3] + '%', '--pub-y': active[4] + '%' }} />
          {objects.map(([id, title, Icon, x, y]) => <button className="scene-spot" key={id} aria-label={title} aria-pressed={object === id}
            data-inspected={state.pubObjects.includes(id)} style={{ left: x + '%', top: y + '%' }} onClick={() => onSelect(id)}><Icon size={18} aria-hidden="true" /></button>)}
        </div>
        <div className="pub-inspector-bar">
          <p role="status"><strong key={object}>{active[1]}</strong><span>{inspected}/{objects.length} objects inspected</span></p>
          <a className="text-link" href="#pub-inspector">View details</a>
          {notice && <p className="pub-found" role="status">{notice}</p>}
        </div>
        <div className="chip-row pub-tools">{objects.map(([id, title, Icon]) => <button key={id} className="tag" aria-pressed={object === id} onClick={() => onSelect(id)}><Icon size={15} /> {title}</button>)}</div>
      </div>
      <section className="panel pub-inspector" key={object} id="pub-inspector" tabIndex={-1}><p className="eyebrow">Behind the bar</p><h2>{active[1]}</h2>
        {Screen && <Screen />}
        {object === 'envelope' && <><p className="note">The seal breaks cleanly. Barney marked the envelope “For the Mosby kids.” The file inside refers to a missing Playbook page called The Fifth Alibi.</p><Link to="/story" className="button secondary">Return to the investigation</Link></>}
        {object === 'suitcase' && <><p>{envelope ? 'Inside is Barney’s decision game, full of complicated alternatives to a perfectly normal evening.' : 'The suitcase is wedged beneath the seat. Look for the matching seal on the table.'}</p>
          {envelope && <Link to="/games?game=playbook" className="button primary">Open the Playbook</Link>}</>}
      </section>
    </div>
  </section>;
}
