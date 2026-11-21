import { useState } from 'react';
import { Calendar, Clapperboard, GitBranch, Link2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, Empty, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { himymArchiveService } from '../services/providers/himymArchiveService.js';
import { episodeCode, protectEpisode } from '../services/normalizers/records.js';

export default function Evidence() {
  const result = useResource('evidence', himymArchiveService.evidence);
  const { state, set, unlock } = useArchive();
  const rows = result.data ?? [];
  const [season, setSeason] = useState(1);
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState('');
  const row = rows.find((item) => item.season.number === season);
  const choose = (key) => setSelected((previous) => previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]);
  const connected = state.connections.includes(season);

  function connect() {
    if (selected.length !== 3) return;
    set('connections', (items) => items.includes(season) ? items : [...items, season]);
    setNote(season === 1 ? 'The connection is saved. Your sibling circles the air date for the drawer code.' : 'The connection is saved. The drawer clue is in the first season’s file.');
  }

  return <section className="wrap page">
    <PageHeading eyebrow="Investigation workspace" title="The evidence board." description="Kids, pin a date, an episode, and a witness to the thread. If I start explaining why I bought the corkboard, you have my permission to keep going." />
    <Status resource={result}>
      {!row ? <Empty title="No evidence to pin" /> : <>
        <label className="field-label game-filter">Open a season file <select value={season} onChange={(event) => { setSeason(Number(event.target.value)); setSelected([]); setNote(''); }}>
          {rows.map((record) => <option value={record.season.number} key={record.season.id}>Season {record.season.number}{state.connections.includes(record.season.number) ? ' · connected' : ''}</option>)}</select></label>
        <div className={'evidence-board ' + (connected ? 'connected' : '')}>
          {[
            ['date', Calendar, row.season.date, '/seasons/' + season, 'Timeline record'],
            ['episode', Clapperboard, protectEpisode(row.episode, state.spoilers).name, '/episodes/' + row.episode.id, episodeCode(row.episode)],
            ['witness', Users, row.character.name, '/characters/' + row.character.id, 'Story witness'],
          ].map(([id, Icon, label, url, type]) => <article className="evidence-note" key={id}>
            <i /><Icon size={24} /><p className="eyebrow">{type}</p><Link to={url}><h2>{label}</h2></Link>
            <button className="button" aria-pressed={selected.includes(id)} onClick={() => choose(id)}>{selected.includes(id) ? 'Unpin' : 'Pin to thread'}</button>
          </article>)}
          <button className="thread-secret" aria-label="Pull the loose thread" title="Pull the loose thread" onClick={() => {
            unlock('string'); setNote('The tag reads “Lost & Found.” Follow the yellow umbrella back to the archive entrance.');
          }}><GitBranch size={19} /></button>
        </div>
        <div className="button-row evidence-actions"><button className="button primary" disabled={selected.length !== 3} onClick={connect}><Link2 size={18} /> Connect the records</button>
          <Link className="button secondary" to="/story">Return to the case</Link></div>
        {(note || connected) && <p className="note" role="status">{note || 'This season thread is connected.'}</p>}
        <p className="credit">Episode, date, and character records supplied by TVmaze. Witness assignments are part of the original mystery.</p>
      </>}
    </Status>
  </section>;
}
