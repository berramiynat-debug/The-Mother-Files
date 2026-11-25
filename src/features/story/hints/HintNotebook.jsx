import { useEffect, useId, useRef, useState } from 'react';
import { Minus } from 'lucide-react';
import { chapters } from '../../../data/investigation.js';
import { questionLimit } from './hintContext.js';
import { useHintAssistant } from './useHintAssistant.js';

const prompts = {
  next: 'What should I do next?',
  small: 'Can you give me a small hint?',
  evidence: 'Which evidence should I examine?',
  reason: 'Why is my deduction incorrect?',
};

export default function HintNotebook({ progress, spoilers, incorrect }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const launcher = useRef(null);
  const minimize = useRef(null);
  const history = useRef(null);
  const panelId = useId();
  const headingId = useId();
  const { turns, pending, retry, level, quick, more, ask, cancel } = useHintAssistant(progress, spoilers);
  const solved = chapters.some(({ id, deduction }) => id === progress.chapter && progress.completed.includes(deduction.id));

  useEffect(() => { if (open) minimize.current?.focus(); }, [open]);
  useEffect(() => {
    if (history.current) history.current.scrollTop = history.current.scrollHeight;
  }, [turns, open]);

  function close() {
    cancel();
    setOpen(false);
    launcher.current?.focus();
  }

  return <div className="hint-dock" onKeyDown={(event) => {
    if (open && event.key === 'Escape') { event.stopPropagation(); close(); }
  }}>
    <button className="hint-launcher" ref={launcher} aria-expanded={open} aria-controls={panelId} onClick={() => open ? close() : setOpen(true)}>
      <img src="/playbook.svg" alt="" width="27" height="27" /> Need a hint?
    </button>
    <div id={panelId} hidden={!open}>
      {open && <section className="hint-notebook" aria-labelledby={headingId}>
        <header>
          <div><h3 id={headingId}>The Mosby Margins</h3><p>Every good story needs a second opinion.</p></div>
          <button type="button" ref={minimize} className="hint-minimize" onClick={close} aria-label="Minimize notebook"><Minus size={19} /></button>
        </header>
        <div className="hint-prompts" role="group" aria-label="Guided hints">
          {Object.entries(prompts).map(([topic, label]) => <button type="button" key={topic}
            disabled={topic === 'reason' && !incorrect} onClick={() => quick(topic, label, topic === 'small' ? 1 : level)}>{label}</button>)}
          {!solved && level < 3 && <button type="button" onClick={more}>{level === 1 ? 'Give me a stronger hint' : 'Give me the strongest hint'}</button>}
        </div>
        <div className="hint-history" ref={history} role="log" aria-label="Notebook conversation">
          {turns.map((turn) => <div key={turn.id} className="hint-turn">
            <p className="hint-question">{turn.question}</p>
            <p>{turn.text}</p>
            <p className="hint-source">{turn.note || (turn.source === 'ai' ? 'AI-selected hint' : 'Guided hint')}</p>
          </div>)}
        </div>
        <p id={panelId + '-privacy'} className="hint-source">Custom questions go to Groq, an external AI provider. Guided hints work offline.</p>
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!question.trim() || pending) return;
          ask(question);
          setQuestion('');
        }}>
          <label htmlFor={panelId + '-question'}>Ask your sibling</label>
          <div className="hint-input">
            <input id={panelId + '-question'} value={question} onChange={(event) => setQuestion(event.target.value)}
              aria-describedby={panelId + '-privacy'} maxLength={questionLimit} autoComplete="off" />
            <button className="button primary" type="submit" disabled={pending || !question.trim()}>Send</button>
          </div>
        </form>
        {pending && <p role="status" className="hint-source">Checking the margins…</p>}
        {retry && !pending && <button type="button" className="hint-retry" onClick={() => ask(retry)}>Retry AI hint</button>}
      </section>}
    </div>
  </div>;
}
