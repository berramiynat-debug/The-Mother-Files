export const characterArtifacts = new Map([
  ['Ted Mosby', {
    id: 'red-boots', icon: 'boots', label: 'Inspect the red boots', title: 'The red cowboy boots',
    source: 'S03E19 · Everything Must Go',
    description: 'Ted insists he can pull off the bright red cowboy boots. The booth has yet to reach a unanimous verdict.',
    action: { label: 'Check the soles', note: 'Filed under “formal wear” in Ted’s handwriting.' },
  }],
  ['Marshall Eriksen', {
    id: 'burger-wrapper', icon: 'burger', label: 'Unwrap the burger', title: 'The burger with the green door',
    source: 'S04E02 · The Best Burger in New York',
    description: 'Marshall spent years looking for his first New York burger. His directions start with a green door and a red neon sign.',
  }],
  ['Lily Aldrin', {
    id: 'aldrin-baseball', icon: 'baseball', label: 'Inspect the signed baseball', title: 'Aldrin Justice',
    source: 'S02E06 · Aldrin Justice',
    description: 'Lily confiscates her boss’s signed baseball. Her kindergarten rules come with her to the office.',
  }],
  ['Robin Scherbatsky', {
    id: 'hoser-hut', icon: 'snow', label: 'Flip the coaster', title: 'A Hoser Hut coaster',
    source: 'S04E11 · Little Minnesota',
    description: 'The Canadian bar helps Robin feel a little less homesick. The karaoke queue is a different matter.',
    action: { label: 'Read the back', note: 'Karaoke request for Robin Sparkles. Submitted by Marshall.' },
  }],
  ['Barney Stinson', {
    id: 'ducky-tie', icon: 'tie', label: 'Inspect the ducky tie', title: 'The ducky tie',
    source: 'S07E03 · Ducky Tie',
    description: 'A bet with Marshall and Lily puts Barney’s dress code in the hands of several tiny yellow ducks.',
    action: { label: 'Check the dress code', note: 'Barney has requested an exemption. Marshall stamped it “denied.”' },
  }],
]);

export const episodeArtifacts = new Map([
  ['S01E10', {
    id: 'pineapple', icon: 'pineapple', label: 'Inspect the pineapple', title: 'Pineapple incident',
    description: 'Ted wakes up to a pineapple on his nightstand. Even after the gang pieces together the night, the fruit is still unexplained.',
  }],
  ['S01E11', {
    id: 'get-psyched', icon: 'disc', label: 'Open the CD case', title: 'The Get Psyched Mix',
    description: 'Barney brings his own soundtrack to the New Year’s Eve limo ride. On this mix, every track is supposed to keep the energy up.',
  }],
  ['S01E15', {
    id: 'game-night-tape', icon: 'video', label: 'Check the old videotape', title: 'Barney before the suits',
    description: 'Lily produces an old tape and the gang gets a glimpse of a Barney they barely recognize. Look for the long hair and the guitar.',
  }],
  ['S02E17', {
    id: 'fiero-cassette', icon: 'cassette', label: 'Check the cassette deck', title: 'The Fiero’s stuck cassette',
    description: 'Marshall’s car has one permanently installed track. The Proclaimers’ “I’m Gonna Be (500 Miles)” is stuck on repeat.',
    action: { label: 'Try to eject it', note: 'The eject button clicks. The cassette stays put.' },
  }],
  ['S03E08', {
    id: 'shattered-glass', icon: 'glass', label: 'Inspect the hairline crack', title: 'The sound of shattered glass',
    description: 'Once the gang points out a friend’s irritating habit, everyone starts to notice it. The sound of breaking glass marks the moment.',
  }],
  ['S03E09', {
    id: 'slap-countdown', icon: 'timer', label: 'Check the countdown', title: 'The Slapsgiving countdown',
    description: 'Marshall sets up a countdown for the slap bet. Barney spends Thanksgiving with one eye on the clock.',
    action: { label: 'Read the timer', note: '00:00:01. Barney would like to renegotiate.' },
  }],
  ['S06E10', {
    id: 'blitz-seat', icon: 'chair', label: 'Inspect the empty seat', title: 'The seat of the Blitz',
    description: 'The Blitz always seems to leave right before the best part. On this Thanksgiving, that bad timing becomes contagious.',
    action: { label: 'Get up for a second', note: 'You’re back! Everyone at the table is already laughing.' },
  }],
]);
