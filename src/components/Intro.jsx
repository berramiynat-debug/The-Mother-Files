import { useEffect, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';
import { Modal } from './UI.jsx';

const frames = [
  ['Kids, it’s 2030.', 'I put the story in an archive. Barney immediately gave it a case number.', 2400],
  ['Nine seasons indexed.', 'I said I’d keep it short. I didn’t say compared to what.', 2400],
  ['Legen—', 'Wait for it…', 1700],
  [<>Legen<em>dary!</em></>, '', 1200],
  ['A page has gone missing.', 'Barney says The Fifth Alibi never happened. Marshall has a signed record of the page.', 2700],
  ['Your turn, kids.', 'Open Barney’s envelope and use the records to check my story, one detail at a time.'],
];

const sceneNames = ['Living room', 'Archive scan', 'The pause', 'Legendary', 'The missing page', 'Your turn'];
const lastStep = frames.length - 1;

export default function Intro() {
  const { finishIntro, state, set, chime } = useArchive();
  const [step, setStep] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches ? lastStep : 0);
  const [autoplay, setAutoplay] = useState(true);
  const [title, description, duration = 2600] = frames[step];
  const playing = autoplay && step < lastStep;
  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => setStep(step + 1), duration);
    return () => clearTimeout(timer);
  }, [step, duration, playing]);

  function togglePlayback() {
    if (step === lastStep) setStep(0);
    setAutoplay(!playing);
  }

  function jumpTo(index) {
    setAutoplay(false);
    setStep(index);
  }
  return <Modal title="The Memory Glitch" className="intro" onClose={finishIntro}>
    <div className="intro-inner">
      <img className="intro-playbook" src="/playbook.svg" alt="" width="70" height="70" />
      <p className="eyebrow">Dad’s archive · Living room, 2030</p>
      <div aria-live="polite" aria-atomic="true">
        <div key={step} className="intro-frame"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      </div>
      <div className="intro-player" role="group" aria-label="Opening scenes">
        <button className="icon-button" onClick={togglePlayback} aria-label={playing ? 'Pause intro' : step === lastStep ? 'Replay intro from the beginning' : 'Resume intro'}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <div className="intro-timeline">
          {sceneNames.map((name, index) => <button key={name} className="intro-tick" data-complete={index < step}
            aria-current={step === index ? 'step' : undefined} aria-label={'Scene ' + (index + 1) + ': ' + name} title={name} onClick={() => jumpTo(index)}><span /></button>)}
        </div>
        <span className="intro-position" aria-hidden="true">{step + 1}/{frames.length}</span>
      </div>
      <div className="intro-controls">
        <button className="icon-button" aria-label={state.sound ? 'Mute sound' : 'Enable sound'} onClick={() => { set('sound', !state.sound); chime(!state.sound); }}>{state.sound ? <Volume2 /> : <VolumeX />}</button>
        <button className="button secondary" onClick={finishIntro}>{step === lastStep ? 'Enter the archive' : 'Skip intro'}</button>
        <Link className="button primary" to="/story" onClick={finishIntro}>Play the mystery</Link>
      </div>
    </div>
  </Modal>;
}
