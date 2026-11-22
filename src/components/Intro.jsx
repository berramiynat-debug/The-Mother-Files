import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Umbrella } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useArchive } from '../context/archiveContext.js';
import { Modal } from './UI.jsx';

const frames = [
  ['Kids, it’s 2030.', 'I put the story in an archive. Barney immediately gave it a case number.', 2400],
  ['Nine seasons indexed.', 'I said I’d keep it short. I didn’t say compared to what.', 2400],
  ['Legen—', 'Wait for it…', 1700],
  [<>Legen<em>dary!</em></>, '', 1200],
  ['Two things are missing.', 'The booth photo and my yellow umbrella. Barney’s brought an envelope.', 2700],
  ['Your turn, kids.', 'Open Barney’s envelope, solve four chapters, and decide who gets to hear the story.'],
];

const lastStep = frames.length - 1;

export default function Intro() {
  const { finishIntro, state, set, chime } = useArchive();
  const [step, setStep] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches ? lastStep : 0);
  const [title, description, duration = 2600] = frames[step];
  useEffect(() => {
    if (step === lastStep) return undefined;
    const timer = setTimeout(() => setStep(step + 1), duration);
    return () => clearTimeout(timer);
  }, [step, duration]);
  return <Modal title="The Memory Glitch" className="intro" onClose={finishIntro}>
    <div className="intro-inner">
      <Umbrella className="intro-umbrella" size={70} strokeWidth={1.1} />
      <p className="eyebrow">Dad’s archive · Living room, 2030</p>
      <div aria-live="polite" aria-atomic="true">
        <div key={step} className="intro-frame"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      </div>
      <div className="intro-controls">
        <button className="icon-button" aria-label={state.sound ? 'Mute sound' : 'Enable sound'} onClick={() => { set('sound', !state.sound); chime(!state.sound); }}>{state.sound ? <Volume2 /> : <VolumeX />}</button>
        <button className="button secondary" onClick={finishIntro}>{step === lastStep ? 'Enter the archive' : 'Skip intro'}</button>
        <Link className="button primary" to="/story" onClick={finishIntro}>Play the mystery</Link>
      </div>
    </div>
  </Modal>;
}
