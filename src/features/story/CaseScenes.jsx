import { useState } from 'react';
import { Check, FileText, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { caseExhibits, claims, endings, exhibits, witnesses } from '../../data/investigation.js';
import { memories } from '../../data/memories.js';
import { assessDeduction, hasKeepsakes, secretMemories } from './logic.js';

const timelinePositions = ['First', 'Second', 'Third'];

function WitnessRecording({ chapter }) {
  return <figure className="case-dialogue case-recording">
    <figcaption><Mic size={15} aria-hidden="true" /> Dad’s recording</figcaption>
    <blockquote>{chapter.recording}</blockquote>
    <p><strong>Claim to check</strong><br />{claims[chapter.claim]}</p>
  </figure>;
}

function EvidenceRecords({ chapter, progress, citations, setCitations, inspect }) {
  const available = [...new Set([...chapter.discover, ...chapter.deduction.sources,
    ...(chapter.compare ?? []).filter((id) => progress.discovered.includes(id))])];
  return <fieldset className="case-choices">
    <legend>Evidence to examine and cite</legend>
    <div className="case-records">
      {available.map((id) => {
        const exhibit = exhibits[id];
        const read = progress.discovered.includes(id);
        return <article key={id} className={'case-record' + (read ? ' case-record-read' : '')}>
          <h3 tabIndex={-1} id={'case-record-' + id}><FileText size={17} aria-hidden="true" /> {exhibit.title}</h3>
          {read ? <>
            {chapter.discover.includes(id) ? <p>{exhibit.text}</p> :
              <details><summary>Review record</summary><p>{exhibit.text}</p></details>}
            <label className="case-citation"><input type="checkbox" checked={citations.includes(id)}
              onChange={(event) => setCitations(event.target.checked ? [...citations, id] : citations.filter((value) => value !== id))} />
              Cite {exhibit.title}</label>
          </> : <button className={'button ' + (exhibit.action ? 'primary' : 'secondary')}
            aria-label={exhibit.action ?? 'Inspect ' + exhibit.title} onClick={() => inspect(id)}>
            {exhibit.action ?? 'Inspect record'}
          </button>}
          {read && <p className="credit">{chapter.deduction.sources.includes(id) ? 'Case record' : 'Optional reference'} · {witnesses[exhibit.witness]}</p>}
        </article>;
      })}
    </div>
  </fieldset>;
}

export function CaseScene({ chapter, progress, inspect, dispatch, onIncorrect }) {
  const [citations, setCitations] = useState([]);
  const [choice, setChoice] = useState('');
  const [order, setOrder] = useState([]);
  const [feedback, setFeedback] = useState('');
  const { deduction } = chapter;
  const solved = progress.completed.includes(deduction.id);

  function check(event) {
    event.preventDefault();
    const answer = { type: 'deduce', choice, citations, order };
    const message = assessDeduction(progress, answer);
    setFeedback(message);
    onIncorrect(Boolean(message));
    if (!message) dispatch(answer, true);
  }

  if (solved) return <p className="case-found" role="status"><Check size={19} aria-hidden="true" /> {deduction.confirmed}</p>;
  return <>
    <EvidenceRecords chapter={chapter} progress={progress} citations={citations} setCitations={setCitations} inspect={inspect} />
    <WitnessRecording chapter={chapter} />
    <form onSubmit={check}>
      {chapter.timeline && <fieldset className="case-choices">
        <legend>Put the events in order</legend>
        <div className="case-timeline">
          {timelinePositions.map((position, index) => <div key={position} className="field-label">
            <label htmlFor={'timeline-position-' + index}>{position}</label>
            <select required id={'timeline-position-' + index} value={order[index] ?? ''} onChange={(event) => {
              const value = event.target.value;
              setOrder((previous) => timelinePositions.map((_, slot) => slot === index ? value : previous[slot] ?? ''));
            }}>
              <option value="">Choose an event</option>
              {Object.entries(chapter.timeline).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>)}
        </div>
      </fieldset>}
      <fieldset className="case-choices">
        <legend>{deduction.prompt}</legend>
        <div className="case-answers">
          {Object.entries(deduction.choices).map(([id, label]) => <label key={id} className="choice">
            <input type="radio" required name="case-answer" value={id} checked={choice === id} onChange={() => setChoice(id)} /> {label}
          </label>)}
        </div>
      </fieldset>
      <button className="button primary" type="submit">Check deduction</button>
      <div role="status">{feedback && <p className="case-feedback">{feedback}</p>}</div>
    </form>
  </>;
}

export function CaseFinale({ unlocked, close }) {
  const eligible = hasKeepsakes(unlocked);
  const count = secretMemories.filter((id) => unlocked.includes(id)).length;
  return <>
    <h3>Where does the page belong?</h3>
    <div className="case-decisions">
      {Object.entries(endings).filter(([id]) => id !== 'secret').map(([id, ending]) =>
        <button key={id} className="choice" onClick={() => close(id)}>{ending.choice}</button>)}
    </div>
    <details className="case-help case-inventory">
      <summary>Extra ending · {count}/{secretMemories.length} keepsakes</summary>
      <ul>{secretMemories.map((id) => <li key={id}>
        <strong>{memories.find((memory) => memory.id === id).title}</strong>
        {unlocked.includes(id) ? <span>Recovered</span> : <span>{caseExhibits[id].clue} <Link className="text-link" to={caseExhibits[id].route}>{caseExhibits[id].link}</Link></span>}
      </li>)}</ul>
      <button className="button primary" disabled={!eligible} onClick={() => close('secret')}>{endings.secret.choice}</button>
    </details>
  </>;
}

export function CaseCompleted({ ending, onChooseAgain, onRestart }) {
  return <>
    <p className="eyebrow case-closed-stamp">Case closed</p>
    <h2>{ending.title}</h2><p>{ending.text}</p>
    <div className="button-row">
      <button className="button primary" onClick={onChooseAgain}>Try another ending</button>
      <button className="button secondary" onClick={onRestart}>Restart investigation</button>
      <Link className="text-link" to="/collection">Open memory collection</Link>
    </div>
  </>;
}
