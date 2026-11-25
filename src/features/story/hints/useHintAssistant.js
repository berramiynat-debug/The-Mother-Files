import { useEffect, useRef, useState } from 'react';
import { askNotebook } from '../../../services/providers/hintService.js';
import { availableHintLevel, containsCredential, guidedHint, hintRequestState, isInstructionOverride, questionLanguage, questionLimit } from './hintContext.js';

export function useHintAssistant(progress, spoilers) {
  const [turns, setTurns] = useState([]);
  const [pending, setPending] = useState(false);
  const [retry, setRetry] = useState('');
  const [level, setLevel] = useState(1);
  const sequence = useRef(0);
  const active = useRef(null);

  useEffect(() => () => active.current?.abort(), []);

  function append(question, text, source, note) {
    const id = ++sequence.current;
    setTurns((items) => [...items.slice(-5), { id, question, text, source, note }]);
  }

  function quick(topic, label, requestedLevel = level) {
    const state = hintRequestState(progress, spoilers, requestedLevel);
    append(label, guidedHint(state, topic, 'en', progress.role), 'guided');
  }

  function more() {
    const state = hintRequestState(progress, spoilers, level);
    const available = availableHintLevel(state);
    if (level >= available) {
      append('A stronger hint', 'Read the remaining records for this deduction to unlock stronger hints.', 'guided');
      return;
    }
    const next = level + 1;
    setLevel(next);
    quick('small', 'A stronger hint', next);
  }

  async function ask(text) {
    const question = text.trim();
    if (!question || question.length > questionLimit || active.current) return;
    const state = hintRequestState(progress, spoilers, level);
    const language = questionLanguage(question);
    setRetry('');
    if (containsCredential(question)) {
      append('Private text omitted', guidedHint(state, 'off-topic', language), 'guided');
      return;
    }
    if (isInstructionOverride(question)) {
      append(question, guidedHint(state, 'off-topic', language), 'guided');
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    try {
      const reply = await askNotebook(state, question, controller.signal);
      if (!controller.signal.aborted) append(question, reply.text, reply.source);
    } catch (error) {
      if (controller.signal.aborted) return;
      const note = error.status === 429 ? 'The AI notebook is busy. Here’s a guided hint.' : 'The AI notebook is unavailable. Here’s a guided hint.';
      append(question, guidedHint(state, 'small', language), 'guided', note);
      setRetry(question);
    } finally {
      if (active.current === controller && !controller.signal.aborted) {
        active.current = null;
        setPending(false);
      }
    }
  }

  function cancel() {
    if (!active.current) return;
    active.current.abort();
    active.current = null;
    setPending(false);
  }

  return { turns, pending, retry, level, quick, more, ask, cancel };
}
