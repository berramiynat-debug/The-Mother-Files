import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, PageHeading, SearchField, SpoilerLock, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { himymCharacterService } from '../services/providers/himymCharacterService.js';

export default function Quotes() {
  const { state } = useArchive();
  const resource = useResource('quotes', himymCharacterService.sampleQuotes);
  const [search, setSearch] = useState('');
  const [speaker, setSpeaker] = useState('');
  const quotes = resource.data ?? [];
  const speakers = [...new Set(quotes.map((row) => row.author))].sort();
  const records = quotes.filter((row) => (!speaker || row.author === speaker)
    && (row.line + ' ' + row.author).toLowerCase().includes(search.trim().toLowerCase()));

  return <section className="wrap page">
    <PageHeading eyebrow="Audio transcript archive" title="Recovered lines." description="I remember most of the punch lines. Use the transcript to check who actually said them.">
      <Link className="button secondary" to="/games?game=narrator">Play Quote Detective</Link>
    </PageHeading>
    <Status resource={resource}>
      {!state.spoilers ? <SpoilerLock>The Character API serves random quotations without episode dates. Allow spoilers to browse those unclassified lines.</SpoilerLock> : <>
        <div className="filter-bar"><SearchField label="Search quotes" value={search} onChange={setSearch} placeholder="Search recovered lines…" />
          <label><span className="sr-only">Speaker</span><select value={speaker} onChange={(event) => setSpeaker(event.target.value)}><option value="">All speakers</option>
            {speakers.map((author) => <option key={author}>{author}</option>)}</select></label>
        </div>
        <p className="credit">Active provider · HIMYM Character API.</p>
        {records.length ? <div className="quote-grid grid md:grid-cols-2 gap-4">{records.map((row) => <figure className="panel" key={row.id}><blockquote>“{row.line}”</blockquote><figcaption>{row.author} · {row.source}</figcaption></figure>)}</div>
          : <Empty title="No lines match these filters"><button className="button secondary" onClick={() => { setSearch(''); setSpeaker(''); }}>Clear filters</button></Empty>}
        <div className="button-row load-more">
          <button className="button secondary" onClick={resource.retry}>Recover more lines</button>
        </div>
      </>}
    </Status>
  </section>;
}
