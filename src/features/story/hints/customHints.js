import { chapters, exhibits } from '../../../data/investigation.js';
import { guidedHint, questionLanguage, reviewedHintRecords } from './hintContext.js';

const turkishTitles = {
  custody: 'Marshall’ın imza tutanağı',
  aliases: 'Barney’nin imzalı açıklaması',
  reservation: 'masa rezervasyon fişi',
  receipt: 'Robin’in açılış fişi',
  ledger: 'imzalı vestiyer kaydı',
  draft: 'barın dosya fişi',
  note: 'Lily’nin özel notu',
  withdrawal: 'imzalı geri çekme belgesi',
};
const formatters = { en: new Intl.ListFormat('en'), tr: new Intl.ListFormat('tr') };
const titles = (records, language) => formatters[language].format(
  records.map((id) => language === 'tr' ? turkishTitles[id] : exhibits[id].title),
);
const localize = (lines, language) => lines[language === 'tr' ? 1 : 0];

const factualReplies = [
  ['custody',
    /\b(?:kac imza|imza sayisi|how many signatures|number of signatures)\b/,
    ['There are five signatures on Marshall’s custody sheet.', 'Marshall’ın imza tutanağında beş imza var.']],
  ['custody',
    /\b(?:hangi isimler|tutanakta kimlerin adi|names (?:listed|on the sheet)|whose names)\b/,
    ['The custody sheet lists Marshall, Lily, Robin, Barney and Lorenzo von Matterhorn.', 'Tutanakta Marshall, Lily, Robin, Barney ve Lorenzo von Matterhorn adları var.']],
  ['custody',
    /\b(?:tutanak(?:ta|taki)? saat|marshall ne zaman|sayfa ne zaman kayda|when did marshall file|time on the (?:custody )?sheet)\b/,
    ['Marshall’s custody sheet is stamped 21:20.', 'Marshall’ın tutanağında saat 21:20 yazıyor.']],
  ['aliases',
    /\b(?:lorenzo|barney nin (?:aciklamasi|duzeltmesi)|barney s (?:correction|statement))\b/,
    ['Barney’s signed correction says he wrote both his own name and the Lorenzo von Matterhorn signature.', 'Barney imzalı açıklamasında hem kendi adını hem Lorenzo von Matterhorn adını yazdığını söylüyor.']],
  ['reservation',
    /\b(?:rezervasyon|reservation|how many seats)\b/,
    ['The booth was booked for four at 21:00. That records the reservation.', '21:00’de dört kişilik masa ayrılmış. Fiş yalnızca rezervasyonu kayda geçiriyor.']],
  ['receipt',
    /\b(?:hesap ne zaman|ilk (?:siparis|icecekler) ne zaman|when (?:did robin open|was the (?:tab|first round)))\b/,
    ['Robin’s receipt puts the opening tab at 21:10.', 'Robin’in açılış fişinde hesabın 21:10’da açıldığı yazıyor.']],
  ['receipt',
    /\b(?:kac icecek|icecekler kim|kimin adina|how many drinks|who (?:ordered|were the drinks for))\b/,
    ['Robin’s receipt lists four drinks for Robin, Lily, Marshall and Barney.', 'Robin’in fişinde Robin, Lily, Marshall ve Barney için dört içecek yazıyor.']],
  ['ledger',
    /\b(?:ted (?:ne zaman|saat kacta)|ted in gelis|vestiyer kaydi|when did ted arrive|coat ledger)\b/,
    ['Robin’s coat ledger records Ted arriving at 21:40. Both Ted and Robin initialed the entry.', 'Robin’in vestiyer kaydı Ted’in 21:40’ta geldiğini gösteriyor. Kayıtta ikisinin de parafı var.']],
  ['draft',
    /\b(?:taslagi kim|dosya fisi|who wrote the (?:original )?draft|filing slip)\b/,
    ['The bar’s filing slip credits Barney with the draft of The Fifth Alibi and marks it as unused.', 'Barın dosya fişi The Fifth Alibi taslağını Barney’ye atfediyor ve planın uygulanmadığını belirtiyor.']],
  ['note',
    /\b(?:son satir|lily ne yazdi|last line|what did lily write)\b/,
    ['Lily’s signed note says she added the last line about saving a seat for a friend who needed one.', 'Lily imzalı notunda son satırı kendisinin eklediğini söylüyor. Satır, yanında birine ihtiyaç duyan bir arkadaşa yer ayırmakla ilgili.']],
  ['note',
    /\b(?:lily neden|ozel konusma|why did lily|privacy request)\b/,
    ['Lily’s note asks Barney to take the page out of circulation because the conversation that followed was private.', 'Lily, o geceki konuşma özel olduğu için Barney’den sayfayı dolaşımdan çekmesini istiyor.']],
  ['withdrawal',
    /\b(?:sayfa (?:nerede|nereye|ne zaman geri)|where (?:did lily put|is the page)|when was the page withdrawn)\b/,
    ['The withdrawal slip is signed at 22:05. It says Lily placed the page in a sealed sleeve under the booth.', 'Geri çekme belgesi 22:05’te imzalanmış. Belgeye göre Lily sayfayı masanın altında mühürlü bir kılıfa koymuş.']],
  ['withdrawal',
    /\b(?:geri cekme belgesi|plan uygulandi mi|was the play performed|withdrawal slip)\b/,
    ['The signed withdrawal slip says Barney withdrew the page at Lily’s request and the play never took place.', 'İmzalı geri çekme belgesinde Barney’nin sayfayı Lily’nin isteğiyle geri çektiği ve planın hiç uygulanmadığı yazıyor.']],
];

export function fallbackQuestionReply(state, question) {
  const language = questionLanguage(question);
  const normalized = question.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '').replace(/ı/g, 'i')
    .replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();
  const fact = factualReplies.find(([, pattern]) => pattern.test(normalized));
  if (fact) {
    const [record, , lines] = fact;
    if (reviewedHintRecords(state).includes(record)) return localize(lines, language);
    return localize(
      ['I can’t confirm that detail from the records you’ve read. Check the relevant record and ask me again.',
        'Bu ayrıntıyı şu ana kadar okuduğun belgelerden doğrulayamıyorum. İlgili belgeyi inceleyip tekrar sorabilirsin.'], language);
  }

  const intents = [
    ['cite', /\b(?:cite|citations?|isaretle\w*)\b/],
    ['reason', /\b(?:karsilastir\w*|yanlis\w*|kac kisi|how many (?:distinct )?(?:people|signers)|compare|reason|incorrect|wrong)\b/],
    ['evidence', /\b(?:hangi (?:kanit|belge|kayit)\w*|neye bak\w*|which (?:evidence|record|document|clue)\w*)\b/],
    ['next', /\b(?:ne yap\w*|sirada ne|sonraki adim|what (?:should i do|now)|where do i start|what s next)\b/],
  ];
  const topic = intents.find(([, pattern]) => pattern.test(normalized))?.[0] ?? 'small';
  if (topic === 'small' || topic === 'reason') return guidedHint(state, topic, language);

  const chapter = chapters.find(({ id }) => id === state.chapter);
  const required = chapter.deduction.sources;
  const missing = required.filter((id) => !state.evidence.includes(id));
  if (topic === 'evidence') {
    const records = titles(missing.length ? missing : required, language);
    return localize(
      [missing.length ? `Check ${records} for the missing evidence.` : `Review ${records} together.`,
        missing.length ? `Bu çıkarım için henüz bakman gerekenler arasında ${records} var.` : `Bu çıkarım için ${records} birlikte değerlendirilmeli.`], language);
  }
  if (topic === 'cite') {
    const records = titles(required, language);
    return localize(
      [`Use the Cite boxes for ${records}. Open each record first.`,
        `Şu belgelerin Cite kutularını işaretle. ${records}. Kutunun görünmesi için önce ilgili belgeyi aç.`], language);
  }

  if (state.completed.includes(chapter.deduction.id)) return guidedHint(state, 'next', language);
  if (missing.length) {
    if (missing[0] === 'custody') return localize(
      ['Start by opening Barney’s envelope. It holds Marshall’s custody sheet.', 'Önce Barney’nin zarfını aç. Marshall’ın imza tutanağı orada.'], language);
    const record = titles([missing[0]], language);
    return localize(
      [`Open ${record}, then check what it adds to the claim Dad made.`, `Sıradaki adım ${record}. Belgeyi açıp babamın anlattığıyla karşılaştır.`], language);
  }
  if (chapter.timeline) return localize(
    ['You’ve read the records. Put the three events in timestamp order, then submit your conclusion with the supporting records.',
      'Belgeleri okudun. Üç olayı saat sırasına koy, sonra cevabını destekleyen belgelerle birlikte gönder.'], language);
  return guidedHint(state, 'next', language);
}
