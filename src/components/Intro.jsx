import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Umbrella } from 'lucide-react';
import { useArchive } from '../context/archiveContext.js';
import { Modal } from './UI.jsx';

const frames = [
  ['The year is 2030.', 'Ted Mosby’s memory archive is starting up.'],
  ['Nine seasons indexed.', 'Reconstructing the regulars, the booth, and a lifetime of questionable decisions.'],
  ['Legen—', 'Wait for it…', 1700],
  [<>Legen<em>dary!</em></>, '', 1200],
  ['Three files are missing.', 'A name has changed. A photograph is gone. The yellow umbrella never made it home.'],
  ['Someone moved them.', 'Find the missing memories before the archive writes a story of its own.'],
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
      <p className="eyebrow">Memory Archive · Startup Sequence</p>
      <div aria-live="polite" aria-atomic="true">
        <div key={step} className="intro-frame"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      </div>
      <div className="intro-controls">
        <button className="icon-button" aria-label={state.sound ? 'Mute sound' : 'Enable sound'} onClick={() => { set('sound', !state.sound); chime(!state.sound); }}>{state.sound ? <Volume2 /> : <VolumeX />}</button>
        <button className="button primary" onClick={finishIntro}>{step === lastStep ? 'Enter the archive' : 'Skip intro'}</button>
      </div>
    </div>
  </Modal>;
}
