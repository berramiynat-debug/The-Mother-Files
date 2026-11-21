import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Umbrella } from 'lucide-react';
import { useArchive } from '../context/archiveContext.js';
import { Modal } from './UI.jsx';

const frames = [
  ['Kids, it’s 2030.', 'I put the whole story in an archive. Yes, all of it.', 2900],
  ['Nine seasons indexed.', 'I said I’d keep it short. I didn’t say compared to what.', 3000],
  ['Legen—', 'Wait for it…', 1700],
  [<>Legen<em>dary!</em></>, '', 1200],
  ['Two things are missing.', 'The booth photo. The yellow umbrella. And somebody changed a name in my files.', 3500],
  ['Your turn, kids.', 'The booth photo and yellow umbrella are missing. Can you and your sibling find them?'],
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
        <button className="button primary" onClick={finishIntro}>{step === lastStep ? 'Enter the archive' : 'Skip intro'}</button>
      </div>
    </div>
  </Modal>;
}
