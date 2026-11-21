export const roles = {
  notebook: { title: 'Keep the notebook', description: 'You log the clues. Your sibling interrupts Dad at strategically useful moments.' },
  questions: { title: 'Ask the questions', description: 'You press the witnesses. Your sibling keeps notes, including the parts Dad calls “background.”' },
};

export const witnesses = {
  ted: {
    choice: 'Ask Dad about the timestamp',
    speaker: 'Dad',
    line: 'I wrote the date on the first file. At the time I thought one folder would be plenty. I own a label maker now.',
  },
  lily: {
    choice: 'Call Aunt Lily',
    speaker: 'Aunt Lily',
    line: 'Use the first date in the timeline. Your dad will start with the history of calendars if you let him.',
  },
};

export const chapters = [
  {
    title: 'The corrupted memory',
    recording: 'Kids, at 12:01 a.m. somebody edited one of my files. One name was wrong and a photograph was gone. I blamed the computer. You two asked why a computer would need a yellow umbrella.',
    notebook: 'I’ll get him to answer one question at a time. Write down the date if he ever gets to it.',
    questions: 'I’ve got 12:01 in the notebook. Ask where he keeps the first date. If he starts with college, interrupt.',
  },
  {
    title: 'The missing photograph',
    recording: 'We used to keep a spare print under our old booth at MacLaren’s. There’s a lock on the drawer. Apparently “I’ll remember the code” is something even a father should be embarrassed to say.',
    notebook: 'The note wants a month and a day. Let’s check Dad’s season timeline before I have to ask him what decade it was.',
    questions: 'I’ll hold our place in the timeline. Ask around the booth about the picture. Somebody there has a shorter version.',
  },
  {
    title: 'Conflicting identities',
    recording: 'The back of the print leads to a cast record with two different answers. Kids, I’ve told the same cab story at three different intersections. Check the credits before you take my word for it.',
    notebook: 'Put the names side by side. The nickname file can tell us what people called him. Check the credits for who played him.',
    questions: 'I’ve opened the source comparison. Ask which file is actually responsible for the cast credit.',
  },
  {
    title: 'The umbrella revelation',
    recording: 'You recognized my handwriting, didn’t you? I took the photo and umbrella out after I spotted the wrong credit. I thought I’d fix the story before you noticed. Then you two started keeping notes on me. So here’s a question I don’t already have an answer to. Who gets to hear what you found?',
    notebook: 'We’ve got enough to close the case. Save a page for the loose evidence. Dad never labels the back of anything.',
    questions: 'One last question, and this one’s for us. Who should get to hear the story next?',
  },
];
