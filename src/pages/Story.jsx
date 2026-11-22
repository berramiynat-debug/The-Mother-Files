import { useRef } from 'react';
import { Check, CircleHelp, FolderOpen, LockKeyhole, Mic, NotebookPen } from 'lucide-react';
import { useArchive } from '../context/archiveContext.js';
import { chapters, roles } from '../data/investigation.js';
import { beginCase, conclusions, firstInvestigation } from '../features/story/logic.js';
import { CaseCompleted, CoffeeCup, Finale, MacLarensDrawer, WitnessSlip } from '../features/story/CaseScenes.jsx';

export default function Story() {
  const { state, set, unlock, chime } = useArchive();
  const sceneHeading = useRef(null);
  const progress = beginCase(state.story);
  const chapter = chapters[progress.stage];
  const role = progress.role || 'questions';
  const ending = conclusions[progress.ending];
  const recording = <figure className="case-dialogue case-recording"><figcaption><Mic size={15} aria-hidden="true" /> Dad’s recording</figcaption><blockquote>{chapter.recording}</blockquote></figure>;

  const update = (changes) => set('story', (current) => ({ ...beginCase(current), ...changes }));
  const focusScene = () => requestAnimationFrame(() => sceneHeading.current?.focus());
  const restart = () => { set('story', firstInvestigation); focusScene(); };
  const advance = () => { update({ stage: Math.min(progress.stage + 1, chapters.length - 1) }); focusScene(); };
  const respond = (index, answer) => {
    set('story', (current) => {
      const saved = beginCase(current);
      const responses = [...saved.responses];
      responses[index] = answer;
      return { ...saved, responses };
    });
    chime();
    focusScene();
  };

  return <section className="wrap page story-page">
    <header className={'case-header ' + (progress.stage >= 1 ? 'case-header-pub' : '')}>
      <p className="eyebrow">Ted’s living room · 2030</p>
      <h1>The missing umbrella<span>.</span></h1>
      <p>Dad’s umbrella and a photo are gone. You and your sibling have one lead. Uncle Barney’s envelope.</p>
    </header>
    <div className="story-layout">
      <section className="panel story-panel" aria-label={ending ? 'Case result' : 'Current scene'}>
        <div className="case-scene-anchor" tabIndex={-1} ref={sceneHeading}>
          {ending ? <CaseCompleted ending={ending} onChooseAgain={() => { update({ ending: '' }); focusScene(); }}
            onRestart={restart} /> : <>
            <p className="eyebrow">Chapter {progress.stage + 1} of {chapters.length}</p>
            <h2>{chapter.title}</h2>
            <p className="case-goal">{chapter.goal}</p>
          </>}
        </div>
        {!ending && <>
          {progress.stage === 3 && recording}
          {progress.stage === 0 && <CoffeeCup progress={progress} openLetter={() => { update({ opened: true }); unlock('envelope'); focusScene(); }}
            answer={(choice) => { respond(0, choice); unlock('swarley'); }} advance={advance} />}
          {progress.stage === 1 && <MacLarensDrawer progress={progress} solved={() => respond(1, 'photo')} advance={advance} />}
          {progress.stage === 2 && <WitnessSlip progress={progress} answer={(choice) => respond(2, choice)} advance={advance} />}
          {progress.stage === 3 && <Finale progress={progress} update={(changes) => { update(changes); focusScene(); }} />}
          {progress.stage < 3 && recording}
          <details className="case-help">
            <summary><NotebookPen size={16} aria-hidden="true" /> Ask your sibling for a hint</summary>
            <p>{chapter[role]}</p>
          </details>
        </>}
      </section>
      <aside className="case-sidebar" aria-label="Family case notes">
        <p className="eyebrow">Case notes</p>
        <ol className="chapter-list" aria-label="Investigation progress">
          {chapters.map(({ title }, index) => {
            const completed = index < progress.stage || Boolean(ending);
            const Icon = completed ? Check : index === progress.stage ? FolderOpen : LockKeyhole;
            return <li key={title} aria-current={progress.stage === index && !ending ? 'step' : undefined}>
              <Icon size={17} aria-hidden="true" /><span>{title}</span>{completed && <span className="sr-only">Completed</span>}
            </li>;
          })}
        </ol>
        <details className="case-help">
          <summary><CircleHelp size={16} aria-hidden="true" /> How to play</summary>
          <p>Read the chapter’s task, inspect the evidence, and solve the clue to move on. Your sibling can help. The whole main case can be played here, and your progress is saved on this device.</p>
          <label className="field-label">Your role <select value={role} onChange={(event) => update({ role: event.target.value })}>
            {Object.entries(roles).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select></label>
          {!ending && (progress.stage > 0 || progress.opened || progress.responses[0]) && <button className="button secondary case-restart" onClick={restart}>Restart investigation</button>}
        </details>
      </aside>
    </div>
  </section>;
}
