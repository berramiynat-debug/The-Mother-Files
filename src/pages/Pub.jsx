import { useState } from 'react';
import { BookOpen, Briefcase, Coffee, Mail, Music, NotebookPen, Phone, Sofa } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/UI.jsx';
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
  return <><p>Ted has called the pub from across the street. He needs a way to introduce himself to the person sketching by the window.</p>
    <div className="choice-grid"><button className="choice" onClick={() => speak('Ted asks what they’re drawing. Twenty minutes later, they’re both making a map of the neighborhood.')}>Ask about the sketch</button>
      <button className="choice" onClick={() => speak('Ted offers to judge a booth design contest. The stranger hands him a pencil and tells him to enter.')}>Pitch a booth design contest</button></div>
    {message && <p className="note" aria-live="polite">{message}</p>}</>;
}

function Jukebox() {
  const { chime, state, set } = useArchive();
  const [result, setResult] = useState({ text: '', loading: false });
  const play = async () => {
    setResult({ loading: true, text: '' });
    chime();
    try {
      const row = await himymCharacterService.randomQuote();
      setResult({ loading: false, text: quoteIsSafe(row, state.spoilers) ? '“' + row.line + '” — ' + row.author + ' · ' + row.source : 'This track has no episode date and is sealed in spoiler-safe mode.' });
    } catch { setResult({ loading: false, text: 'The jukebox could not recover a line. Choose another track.' }); }
  };
  return <><p>Play an original chime and sample a short line from the community archive.</p>
    <div className="button-row"><button className="button primary" disabled={result.loading} onClick={play}>{result.loading ? 'Tuning…' : 'Play a random track'}</button>
      <button className="button secondary" aria-pressed={state.sound} onClick={() => { set('sound', !state.sound); chime(!state.sound); }}>{state.sound ? 'Mute jukebox' : 'Enable chime'}</button></div>
    {result.text && <p className="note" aria-live="polite">{result.text}</p>}</>;
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
  return <><p>Lily saved the corner table. She’s been waiting to see which object you’d ask about first.</p>
    <div className="choice-grid"><button className="choice" onClick={() => setMessage('Lily: “The photo went into a drawer. Try the date on the oldest season file.”')}>Ask about the photograph</button>
      <button className="choice" onClick={() => setMessage('Lily: “The umbrella had a lost-and-found tag. Check the street outside the archive.”')}>Ask about the umbrella</button></div>
    {message && <p className="note" aria-live="polite">{message}</p>}</>;
}

export default function Pub() {
  const { unlock, state } = useArchive();
  const [object, setObject] = useState('booth');
  const active = objects.find(([id]) => id === object);
  const envelope = state.unlocked.includes('envelope');
  const onSelect = (id) => {
    setObject(id);
    if (id === 'envelope') unlock('envelope');
  };
  const Screen = { telephone: Telephone, jukebox: Jukebox, coaster: Coaster, notebook: Notebook, booth: Booth }[object];
  return <section className="wrap page pub-page">
    <PageHeading eyebrow="MacLaren’s · Original interactive fiction" title="After dark." description="The bar is still open. Pick an object to see what the last patrons left behind." />
    <div className="pub-scene">
      <img src="/pub.webp" alt="A warmly lit neighborhood pub with a wall telephone, jukebox, and corner booth" />
      {objects.map(([id, title, Icon, x, y]) => <button className="scene-spot" key={id} aria-label={title} aria-pressed={object === id}
        style={{ left: x + '%', top: y + '%' }} onClick={() => onSelect(id)}><Icon size={18} /></button>)}
    </div>
    <div className="chip-row pub-tools">{objects.map(([id, title, Icon]) => <button key={id} className="tag" aria-pressed={object === id} onClick={() => onSelect(id)}><Icon size={15} /> {title}</button>)}</div>
    <section className="panel"><p className="eyebrow">Behind the bar</p><h2>{active[1]}</h2>
      {Screen && <Screen key={object} />}
      {object === 'envelope' && <><p className="note">The seal breaks cleanly. The note inside says to look under the booth for a locked drawer.</p><Link to="/story" className="button secondary">Return to the investigation</Link></>}
      {object === 'suitcase' && <><p>{envelope ? 'Inside, you find a notebook full of complicated alternatives to a perfectly normal evening.' : 'The suitcase is wedged beneath the seat. Look for the matching seal on the table.'}</p>
        {envelope && <Link to="/games?game=playbook" className="button primary">Open the Playbook</Link>}</>}
    </section>
  </section>;
}
