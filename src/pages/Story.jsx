import { useState } from 'react';
import { Fingerprint, FolderOpen, LockKeyhole, Mic, NotebookPen, Umbrella } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, Status } from '../components/UI.jsx';
import { useArchive } from '../context/archiveContext.js';
import { useResource } from '../hooks/useResource.js';
import { himymArchiveService } from '../services/providers/himymArchiveService.js';
import { beginCase, canClose, canCombine, conclusions, decodeLabel, firstInvestigation, secretMemories } from '../features/story/logic.js';
import { chapters, roles, witnesses } from '../data/investigation.js';
import { memories } from '../data/memories.js';

function Dialogue({ speaker, children, recording = false }) {
  return <figure className={'case-dialogue ' + (recording ? 'case-recording' : '')}>
    <figcaption>{recording ? <Mic size={15} aria-hidden="true" /> : <NotebookPen size={15} aria-hidden="true" />} {speaker}</figcaption>
    <blockquote>{children}</blockquote>
  </figure>;
}

function RolePicker({ onSelect }) {
  return <fieldset className="role-picker">
    <legend>You and your sibling are on the couch. Who does what?</legend>
    <div className="choice-grid">
      {Object.entries(roles).map(([id, role]) => <button key={id} className="choice role-choice" onClick={() => onSelect(id)}>
        <strong>{role.title}</strong><span>{role.description}</span>
      </button>)}
    </div>
  </fieldset>;
}

function Corrupted({ progress, respond, advance }) {
  const response = typeof progress.responses[0] === 'string' ? progress.responses[0] : '';
  const testimony = Object.hasOwn(witnesses, response) ? witnesses[response] : { speaker: 'Earlier testimony', line: response };
  return <>
    {response ? <Dialogue speaker={testimony.speaker}>{testimony.line}</Dialogue> : <div className="choice-grid">
      {Object.entries(witnesses).map(([id, witness]) => <button key={id} className="choice" onClick={() => respond(0, id)}>{witness.choice}</button>)}
    </div>}
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
    <p>A note beneath the lock reads <em>Month and day. Start where the story starts.</em></p>
    <div className="button-row"><Link className="button secondary" to="/seasons">Inspect the timeline</Link><Link className="button secondary" to="/pub">Visit MacLaren’s</Link></div>
    <form className="decode-form" onSubmit={(event) => {
      event.preventDefault();
      if (decodeLabel(value)) { unlock('photo'); setFeedback('The drawer opens. Your sibling holds up a print of the corner booth. The handwriting on the back looks familiar.'); }
      else setFeedback('Two clicks, no luck. Your sibling taps the note: month, then day.');
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
    <Link className="text-link" to="/sources">Inspect the source comparison</Link>
    <Status resource={inspection}>
      <p className="note">{conflict ? conflict.name + ' has conflicting metadata. Which attribution goes in your notebook?' : 'Which provider should you cite for the cast attribution?'}</p>
      {!response && <div className="choice-grid">
        <button className="choice" onClick={() => { setInvalid(false); respond(2, 'verified'); }}>
          TVmaze {conflict ? '· ' + conflict.actor : 'cast credits'}
        </button><button className="choice" onClick={() => setInvalid(true)}>Community alias provider</button>
      </div>}
      {invalid && <p role="status">Your sibling points to the cast credits. The alias file keeps track of nicknames.</p>}
    </Status>
    {response && <Dialogue speaker="Robin">You checked the credits. Good. That signature on the back look familiar? Try asking him about it before he starts another flashback.</Dialogue>}
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
  const respond = (index, answer) => {
    const responses = [...progress.responses];
    responses[index] = answer;
    update({ responses });
  };
  const ending = conclusions[progress.ending];
  const chapter = chapters[progress.stage];
  const siblingNote = progress.role && chapter[progress.role];
  return <section className="wrap page story-page">
    <PageHeading eyebrow="Ted’s living room · 2030" title="The missing umbrella." description="Dad handed you and your sibling the archive. One picture is missing and his story has a hole in it. For once, he’s letting you ask the questions." />
    <div className="story-layout">
      <aside className="case-sidebar" aria-label="Family case notes">
        <p className="eyebrow">Your case notes</p>
        <ol className="chapter-list" aria-label="Investigation progress">{chapters.map(({ title }, index) => <li key={title} aria-current={progress.stage === index && !ending ? 'step' : undefined}>
          {index > progress.stage ? <LockKeyhole size={17} /> : <FolderOpen size={17} />} <span>{title}</span></li>)}</ol>
        {progress.role && <p className="case-role">Your role · {roles[progress.role].title}</p>}
      </aside>
      <div className="panel story-panel">
        {ending ? <div className="game-result"><Umbrella size={35} /><p className="eyebrow">Case closed</p><h2>{ending[0]}</h2>
          <Dialogue speaker="Dad’s last recording" recording>{ending[1]}</Dialogue>
          <div className="button-row"><button className="button secondary" onClick={() => update({ ending: '' })}>Try another ending</button>
            <button className="button secondary" onClick={() => set('story', firstInvestigation)}>Restart investigation</button></div>
        </div> : <>
          <p className="eyebrow"><Fingerprint size={17} /> Stage {progress.stage + 1} of {chapters.length}</p><h2>{chapter.title}</h2>
          <Dialogue speaker="Dad’s recording" recording>{chapter.recording}</Dialogue>
          {siblingNote ? <Dialogue speaker="Your sibling">{siblingNote}</Dialogue> : <RolePicker onSelect={(role) => update({ role })} />}
          {progress.stage === 0 && (progress.role || progress.responses[0]) && <Corrupted progress={progress} respond={respond} advance={advance} />}
          {progress.stage === 1 && <Photograph advance={advance} />}
          {progress.stage === 2 && <Identities progress={progress} respond={respond} advance={advance} />}
          {progress.stage === 3 && <Revelation progress={progress} update={update} />}
        </>}
      </div>
    </div>
  </section>;
}
