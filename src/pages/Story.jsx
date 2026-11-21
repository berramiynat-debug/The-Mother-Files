import { useState } from 'react';
import { Fingerprint, FolderOpen, LockKeyhole, Umbrella } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { himymArchiveService } from '../services/providers/himymArchiveService.js';
import { beginCase, canClose, canCombine, conclusions, decodeLabel, firstInvestigation, secretMemories } from '../features/story/logic.js';
import { memories } from '../data/memories.js';

const chapters = ['The corrupted memory', 'The missing photograph', 'Conflicting identities', 'The umbrella revelation'];

function Corrupted({ progress, respond, advance }) {
  const response = progress.responses[0];
  return <>
    <p>At 12:01 a.m. someone changed a character record and erased a photograph. Ted is waiting beside the terminal.</p>
    {!response ? <div className="choice-grid">
      <button className="choice" onClick={() => respond(0, 'Ted: “Follow the date. I wrote it on the first file, back when I thought the story would be short.”')}>Ask Ted about the timestamp</button>
      <button className="choice" onClick={() => respond(0, 'Lily: “Start with the earliest air date. It’s the only label the archive hasn’t managed to lose.”')}>Ask Lily to check the archive</button>
    </div> : <p className="note">{response}</p>}
    <div className="button-row"><Link className="button secondary" to="/evidence">Check the evidence board</Link>
      <button className="button primary" disabled={!response} onClick={advance}>Follow the timestamp</button></div>
  </>;
}

function Photograph({ advance }) {
  const { state, unlock } = useArchive();
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const photo = state.unlocked.includes('photo');
  return <>
    <p>The drawer below the booth is stamped with a four-digit code. The note says to use the month and day of the first air date.</p>
    <div className="button-row"><Link className="button secondary" to="/seasons">Inspect the timeline</Link><Link className="button secondary" to="/pub">Visit MacLaren’s</Link></div>
    <form className="decode-form" onSubmit={(event) => {
      event.preventDefault();
      if (decodeLabel(value)) { unlock('photo'); setFeedback('The drawer opens. The photograph shows a familiar corner booth.'); }
      else setFeedback('The lock clicks twice and stays shut. Use month, then day.');
    }}>
      <label className="field-label">Drawer code <input type="text" value={value} onChange={(event) => setValue(event.target.value)} placeholder="MMDD" maxLength={5} inputMode="numeric" required /></label>
      <button className="button secondary" type="submit">Decode</button>
    </form>
    {feedback && <p role="status">{feedback}</p>}
    <button className="button primary" disabled={!photo} onClick={advance}>Investigate the signature</button>
  </>;
}

function Identities({ progress, respond, advance }) {
  const inspection = useResource('integrity', himymArchiveService.integrity);
  const [invalid, setInvalid] = useState(false);
  const conflict = inspection.data?.rows.find((row) => row.status === 'Conflict');
  const response = progress.responses[2];
  return <>
    <p>The back of the photo references a corrupted actor field. Robin suggests checking the original cast credits before certifying it.</p>
    <Link className="text-link" to="/sources">Inspect the source comparison</Link>
    <Status resource={inspection}>
      <p className="note">{conflict ? conflict.name + ' has conflicting metadata. Which attribution should the archive keep?' : 'Which provider owns the archive’s cast attribution?'}</p>
      {!response && <div className="choice-grid">
        <button className="choice" onClick={() => { setInvalid(false); respond(2, 'Robin: “The record is clean. Someone moved the photo to make us check the whole story.”'); }}>
          TVmaze {conflict ? '· ' + conflict.actor : 'cast credits'}
        </button><button className="choice" onClick={() => setInvalid(true)}>Community alias provider</button>
      </div>}
      {invalid && <p role="status">The alias source contributes nicknames. Check the cast credits to verify actor names.</p>}
    </Status>
    {response && <p className="note">{response}</p>}
    <button className="button primary" disabled={!response} onClick={advance}>Open the lost &amp; found</button>
  </>;
}

function Revelation({ progress, update }) {
  const { state, unlock, chime } = useArchive();
  const found = canCombine(state.unlocked);
  const close = (id) => {
    if (!canClose(progress.stage, id, progress.combined)) return;
    update({ ending: id });
    if (id === 'secret') unlock('secret');
    chime();
  };
  return <>
    <p>The archive’s keeper moved the umbrella and the photo out of the database when the cast entry changed. You get to decide what the restored archive remembers.</p>
    <div className="choice-grid"><button className="choice" onClick={() => close('restored')}>Restore the files to the archive</button>
      <button className="choice" onClick={() => close('published')}>Publish the witnesses’ versions</button>
      <button className="choice" onClick={() => close('sealed')}>Leave the photograph with the booth</button></div>
    <section className="inventory"><h3>Combine the loose evidence</h3><ul>
      {secretMemories.map((id) => <li key={id}>{state.unlocked.includes(id) ? 'Found' : 'Missing'} · {memories.find((row) => row.id === id)?.title}</li>)}
    </ul>
      {progress.combined ? <button className="button primary" onClick={() => close('secret')}>Read the reverse of the photograph</button>
        : <button className="button secondary" disabled={!found} onClick={() => update({ combined: true })}>Combine evidence</button>}
    </section>
  </>;
}

export default function Story() {
  const { state, set } = useArchive();
  const progress = beginCase(state.story);
  const update = (changes) => set('story', (current) => ({ ...beginCase(current), ...changes }));
  const advance = () => update({ stage: Math.min(progress.stage + 1, chapters.length - 1) });
  const respond = (index, text) => {
    const responses = [...progress.responses];
    responses[index] = text;
    update({ responses });
  };
  const ending = conclusions[progress.ending];
  return <section className="wrap page story-page">
    <PageHeading eyebrow="Original interactive fiction · 2030" title="The missing umbrella." description="Someone has changed Ted’s archive. Trace their steps through the files, the pub, and the city after midnight." />
    <div className="story-layout">
      <ol className="chapter-list" aria-label="Investigation progress">{chapters.map((chapter, index) => <li key={chapter} aria-current={progress.stage === index ? 'step' : undefined}>
        {index > progress.stage ? <LockKeyhole size={17} /> : <FolderOpen size={17} />} <span>{chapter}</span></li>)}</ol>
      <div className="panel story-panel">
        {ending ? <div className="game-result"><Umbrella size={35} /><p className="eyebrow">Case closed</p><h2>{ending[0]}</h2><p>{ending[1]}</p>
          <div className="button-row"><button className="button secondary" onClick={() => update({ ending: '' })}>Try another ending</button>
            <button className="button secondary" onClick={() => set('story', firstInvestigation)}>Restart investigation</button></div>
        </div> : <>
          <p className="eyebrow"><Fingerprint size={17} /> Stage {progress.stage + 1} of {chapters.length}</p><h2>{chapters[progress.stage]}</h2>
          {progress.stage === 0 && <Corrupted progress={progress} respond={respond} advance={advance} />}
          {progress.stage === 1 && <Photograph advance={advance} />}
          {progress.stage === 2 && <Identities progress={progress} respond={respond} advance={advance} />}
          {progress.stage === 3 && <Revelation progress={progress} update={update} />}
        </>}
      </div>
    </div>
  </section>;
}
