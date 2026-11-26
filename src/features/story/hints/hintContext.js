import { chapters, claims, exhibits } from '../../../data/investigation.js';
import { beginCase, firstInvestigation } from '../logic.js';

export const questionLimit = 400;
export const hintReplyLimit = 800;
export const hintHistoryLimit = 3;

const chapterHints = {
  signatures: [
    ['Start with the sheet and see what it actually records.', 'Önce tutanağa bak ve neyin kayda geçtiğini gör.'],
    ['Count signers and signatures separately. A written name might not represent a new person.', 'İmzaları ve imza atan kişileri ayrı ayrı say. Her yazılı ad farklı bir kişiye ait olmayabilir.'],
    ['Match the names in Barney’s correction to the lines on the custody sheet, then count the remaining people.', 'Barney’nin düzeltmesindeki adları tutanaktaki imzalarla eşleştir, sonra kişileri say.'],
  ],
  timeline: [
    ['Find the timestamp on each record. I’d start with Robin’s copies.', 'Her kayıttaki saati bul. Ben Robin’in kopyalarından başlardım.'],
    ['The tab and the coat check record different events. Use both to test Dad’s memory.', 'Hesap fişi ve vestiyer kaydı farklı olayları gösteriyor. Babamın anısını sınamak için ikisini de kullan.'],
    ['Line up the timestamp on the opening receipt, the custody sheet, and the coat ledger before you select a claim.', 'Bir iddiayı seçmeden önce hesap fişi, tutanak ve vestiyer kaydındaki saatleri sırala.'],
  ],
  annotation: [
    ['Read the writing credit and the annotation side by side.', 'Yazar kaydıyla kenar notunu yan yana oku.'],
    ['Ask which document describes the draft and which describes a later revision.', 'Hangi belgenin taslağı, hangisinin sonraki değişikliği anlattığına bak.'],
    ['Look for a signature that explicitly claims the last line. Cite it together with the original filing credit.', 'Son satırı kimin yazdığını açıkça söyleyen imzalı kaydı bul. İlk yazar kaydıyla birlikte işaretle.'],
  ],
  verdict: [
    ['Check exactly what the signed withdrawal says happened to the page.', 'İmzalı geri çekme belgesinde sayfaya ne olduğuna bak.'],
    ['Separate three questions: did the page exist, did the play happen, and why was the page withdrawn?', 'Üç soruyu ayır: Sayfa var mıydı, oyun oynandı mı, sayfa neden geri çekildi?'],
    ['Use the filing slip for the draft, the private annotation for the request, and the signed withdrawal for the outcome.', 'Taslak için dosya fişini, talep için özel notu, sonuç için imzalı geri çekme belgesini kullan.'],
  ],
};

const generic = {
  inspect: ['I’d read the remaining records before making the call.', 'Karar vermeden önce kalan belgeleri okurdum.'],
  evidence: ['Reopen the records beside the deduction and compare what each can establish.', 'Çıkarımın yanındaki belgeleri yeniden aç ve her birinin neyi kanıtladığına bak.'],
  next: ['Choose the claim the records support, cite the relevant records, then check your deduction.', 'Belgelerin desteklediği iddiayı seç, ilgili belgeleri işaretle ve çıkarımını kontrol et.'],
  solved: ['We’ve checked this deduction. Use the next action in the case file.', 'Bu çıkarımı kontrol ettik. Dosyada gösterilen bir sonraki adımı kullan.'],
  unrelated: ['I’m keeping these margins for the case. Ask me about a record or what to do next.', 'Bu defteri soruşturma için tutuyorum. Bir belgeyi veya sıradaki adımı sorabilirsin.'],
};

export function hintRequestState(progress, spoilers, level) {
  return { chapter: progress.chapter, evidence: progress.discovered, completed: progress.completed, spoilers, level };
}

const hasText = (value, limit) => typeof value === 'string' && value.length <= limit && Boolean(value.trim());

function validateHistory(history = []) {
  if (!Array.isArray(history) || history.length > hintHistoryLimit || history.some((turn) =>
    !turn || typeof turn !== 'object' || Object.keys(turn).length !== 2 ||
    !hasText(turn.question, questionLimit) || !hasText(turn.text, hintReplyLimit))) return null;
  return history.filter(({ question, text }) => [question, text].every((value) =>
    !containsCredential(value) && !isInstructionOverride(value)))
    .map(({ question, text }) => ({ question: question.trim(), text: text.trim() }));
}

export function validateHintRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
    Object.keys(body).some((key) => !['chapter', 'evidence', 'completed', 'spoilers', 'level', 'question', 'history'].includes(key)) ||
    typeof body.chapter !== 'string' || !chapters.some(({ id }) => id === body.chapter) ||
    !Array.isArray(body.evidence) || body.evidence.length > Object.keys(exhibits).length ||
    !Array.isArray(body.completed) || body.completed.length > chapters.length ||
    typeof body.spoilers !== 'boolean' || ![1, 2, 3].includes(body.level) ||
    !hasText(body.question, questionLimit)) return null;
  const progress = beginCase({ version: firstInvestigation.version, chapter: body.chapter, discovered: body.evidence, completed: body.completed });
  if (progress.chapter !== body.chapter || progress.discovered.length !== body.evidence.length ||
    progress.completed.length !== body.completed.length) return null;
  const history = validateHistory(body.history);
  if (!history) return null;
  return { ...hintRequestState(progress, body.spoilers, body.level), question: body.question.trim(), history };
}

export function reviewedHintRecords(state) {
  const chapter = chapters.find(({ id }) => id === state.chapter);
  const available = new Set([...chapter.discover, ...chapter.deduction.sources, ...(chapter.compare ?? [])]);
  return state.evidence.filter((id) => available.has(id));
}

export function buildHintContext(state) {
  const chapter = chapters.find(({ id }) => id === state.chapter);
  const solved = state.completed.includes(chapter.deduction.id);
  const unopened = chapter.discover.filter((id) => !state.evidence.includes(id));
  return {
    chapter: chapter.id, objective: chapter.goal, solved,
    evidence: reviewedHintRecords(state).map((id) => ({ id, title: exhibits[id].title, text: exhibits[id].text })),
    completed: chapters.filter(({ deduction }) => state.completed.includes(deduction.id)).map(({ deduction }) => deduction.confirmed),
    interactions: solved ? ['Use the next action in the case file'] :
      ['Cite reviewed records', 'Check a deduction', ...unopened.map((id) => exhibits[id].action || 'Inspect ' + exhibits[id].title),
        ...(chapter.timeline ? ['Order recorded events'] : [])],
    witness: claims[chapter.claim], level: Math.min(state.level, availableHintLevel(state)),
    source: 'Original fictional case. Television episodes are outside this notebook.',
  };
}

export function availableHintLevel(state) {
  const chapter = chapters.find(({ id }) => id === state.chapter);
  return chapter.deduction.sources.every((id) => state.evidence.includes(id)) ? 3 : 1;
}

export function guidedHint(state, topic, language = 'en', role = 'questions') {
  const chapter = chapters.find(({ id }) => id === state.chapter);
  const solved = state.completed.includes(chapter.deduction.id);
  const missing = availableHintLevel(state) === 1;
  let line = chapterHints[state.chapter][missing ? 0 : state.level - 1];
  if (topic === 'off-topic') line = generic.unrelated;
  else if (solved) line = generic.solved;
  else if (topic === 'next') {
    line = missing ? generic.inspect : generic.next;
    if (missing && role === 'notebook') line = ['I’ll ask Dad to wait. Mark what each record establishes in your notebook.',
      'Ben babamdan beklemesini isterim. Her belgenin neyi kanıtladığını defterine yaz.'];
  }
  else if (topic === 'evidence') line = missing ? chapterHints[state.chapter][0] : generic.evidence;
  else if (topic === 'reason') line = missing || state.level === 1 ? chapterHints[state.chapter][1] : line;
  return line[language === 'tr' ? 1 : 0];
}

export function questionLanguage(text) {
  return /[çğıöşü]|\b(?:ne|nasil|hangi|neden|kac|kim|ipucu|bir|kanit|sonra|yardim|imza)\b/iu.test(text) ? 'tr' : 'en';
}

export function isInstructionOverride(text) {
  const normalized = text.normalize('NFKC');
  return /\b(?:system prompt|developer message|jailbreak|ignore.{0,45}(?:instructions|previous|rules)|api[_ -]?key|secret ending|future (?:chapter|solution))\b|(?:talimatları yok say|sistem istemi|gizli son)/iu.test(normalized);
}

export function containsCredential(text) {
  return /\b(?:gsk_|sk-|gh[pousr]_|github_pat_)[a-z0-9_-]{20,}\b|\bbearer\s+[a-z0-9_.-]{20,}/iu.test(text);
}
