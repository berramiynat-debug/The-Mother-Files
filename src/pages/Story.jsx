import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Check, CircleHelp, FolderOpen, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';
import { casePremise, caseTitle, chapters, endings, exhibits, roles } from '../data/investigation.js';
import { beginCase, firstInvestigation, transitionCase } from '../features/story/logic.js';
import { CaseCompleted, CaseFinale, CaseScene } from '../features/story/CaseScenes.jsx';
import '../features/story/story.css';

const HintNotebook = lazy(() => import('../features/story/hints/HintNotebook.jsx'));

export default function Story() {
  const { state, set, chime } = useArchive();
  const sceneHeading = useRef(null);
  const [restartCount, setRestartCount] = useState(0);
  const [incorrectChapter, setIncorrectChapter] = useState('');
  const awaitingStart = Boolean(state.legacyStory && state.story == null);
  useEffect(() => {
    if (state.story == null && !awaitingStart) {
      set('story', (current, archive) => archive.legacyStory ? current : current ?? firstInvestigation);
    }
  }, [set, state.story, awaitingStart]);

  const progress = beginCase(state.story, state.unlocked);
  const index = chapters.findIndex(({ id }) => id === progress.chapter);
  const chapter = chapters[index];
  const ending = endings[progress.ending];
  const solved = progress.completed.includes(chapter.deduction.id);
  const sceneKey = chapter.id + ':' + restartCount;
  const focusScene = () => requestAnimationFrame(() => sceneHeading.current?.focus());

  async function dispatch(action, focus = false, reward) {
    const changed = await set('story', (current, archive) =>
      transitionCase(current, { ...action, chapter: chapter.id }, archive.unlocked), { reward });
    if (changed && (action.type === 'deduce' || action.type === 'close')) chime();
    if (changed && focus) focusScene();
    return changed;
  }

  function restart() {
    setRestartCount((count) => count + 1);
    setIncorrectChapter('');
    if (awaitingStart) {
      set('story', (current, archive) => current ?? beginCase({ ...firstInvestigation, role: archive.legacyStory?.role }))
        .then(focusScene);
      return;
    }
    dispatch({ type: 'restart' }, true);
  }

  async function inspect(id) {
    const reward = { custody: 'envelope', aliases: 'swarley' }[id];
    if (await dispatch({ type: 'inspect', id }, false, reward)) {
      requestAnimationFrame(() => document.getElementById('case-record-' + id)?.focus({ preventScroll: true }));
    }
  }

  function closeCase(id) {
    dispatch({ type: 'close', ending: id }, true, id === 'secret' ? 'secret' : undefined);
  }

  return <section className="wrap page story-page">
    <header className={'case-header ' + (index >= 1 ? 'case-header-pub' : '')}>
      <p className="eyebrow">Ted’s living room · 2030</p>
      <h1>{caseTitle}<span>.</span></h1>
      <p>{casePremise}</p>
    </header>
    <div className="story-layout">
      <section className="panel story-panel" aria-label={ending ? 'Case result' : 'Current scene'}>
        <div className="case-scene-anchor" tabIndex={-1} ref={sceneHeading}>
          {ending ? <CaseCompleted ending={ending} onChooseAgain={() => dispatch({ type: 'reopen' }, true)} onRestart={restart} /> : <>
            <p className="eyebrow">Chapter {index + 1} of {chapters.length}</p>
            <h2>{chapter.title}</h2>
            {!awaitingStart && <p className="case-goal">{chapter.goal}</p>}
          </>}
        </div>
        {awaitingStart ? <>
          <p className="note">Your umbrella case save is archived on this device. Start a fresh case to investigate The Fifth Alibi. Your memories, favorites, and settings are still here.</p>
          <button className="button primary" onClick={restart}>Start the Playbook case</button>
        </> : !ending && <>
          <Suspense fallback={null}>
            <HintNotebook key={sceneKey + ':' + solved} progress={progress} spoilers={state.spoilers} incorrect={incorrectChapter === chapter.id} />
          </Suspense>
          <CaseScene key={sceneKey} chapter={chapter} progress={progress} inspect={inspect} dispatch={dispatch}
            onIncorrect={(incorrect) => setIncorrectChapter(incorrect ? chapter.id : '')} />
          {solved && (index === chapters.length - 1 ? <CaseFinale unlocked={state.unlocked} close={closeCase} /> :
            <button className="button primary" onClick={() => dispatch({ type: 'advance' }, true)}>Continue to {chapters[index + 1].title.toLowerCase()}</button>)}
        </>}
      </section>
      <aside className="case-sidebar" aria-label="Family case notes">
        <p className="eyebrow">Case notes</p>
        <ol className="chapter-list" aria-label="Investigation progress">
          {chapters.map(({ id, title, deduction }) => {
            const complete = progress.completed.includes(deduction.id);
            const Icon = complete ? Check : chapter.id === id ? FolderOpen : LockKeyhole;
            return <li key={id} aria-current={chapter.id === id && !ending ? 'step' : undefined}>
              <Icon size={17} aria-hidden="true" /><span>{title}</span>{complete && <span className="sr-only">Completed</span>}
            </li>;
          })}
        </ol>
        {progress.discovered.length > 0 && <details className="case-help">
          <summary>Reviewed records ({progress.discovered.length})</summary>
          <ul className="case-record-index">{progress.discovered.map((id) => <li key={id}>
            <details><summary>{exhibits[id].title}</summary><p>{exhibits[id].text}</p></details>
          </li>)}</ul>
        </details>}
        <details className="case-help">
          <summary><CircleHelp size={16} aria-hidden="true" /> How to play</summary>
          <p>Inspect the records, cite the ones that support your answer, and check your deduction. Your sibling’s notebook offers hints. This device saves which records you’ve read and deductions you’ve completed.</p>
          {!awaitingStart && <label className="field-label">Your role <select value={progress.role} onChange={(event) => dispatch({ type: 'role', role: event.target.value })}>
            {Object.entries(roles).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select></label>}
          {!ending && progress.discovered.length > 0 && <button className="button secondary case-restart" onClick={restart}>Restart investigation</button>}
          <p><Link className="text-link" to="/episodes">Browse the archive</Link></p>
        </details>
      </aside>
    </div>
  </section>;
}
