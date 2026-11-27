import { expect, test } from '@playwright/test';

const inspect = (page, name) => page.getByRole('button', { name, exact: true }).click();
const cite = (page, name) => page.getByRole('checkbox', { name, exact: true }).check();
const choose = (page, name) => page.getByRole('radio', { name, exact: true }).check();
const check = (page) => page.getByRole('button', { name: 'Check deduction' }).click();

async function firstChapter(page) {
  await inspect(page, 'Open Barney’s envelope');
  await inspect(page, 'Inspect Barney’s signed correction');
  await cite(page, 'Cite Marshall’s custody sheet');
  await cite(page, 'Cite Barney’s signed correction');
  await choose(page, 'Four people signed.');
  await check(page);
  await expect(page.getByText(/five signatures from four people/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue to the first round' }).click();
}

test('a first-time player can complete the case and recover every ending without Groq', async ({ page }) => {
  await page.route('**/api/hints', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('dialog').getByRole('link', { name: 'Play the mystery' }).click();
  await choose(page, 'Five people signed.');
  await check(page);
  await expect(page.getByText('Inspect the relevant records before submitting.')).toBeVisible();
  await firstChapter(page);
  await expect(page.locator('.case-scene-anchor')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'The first round' })).toBeVisible();
  await inspect(page, 'Inspect Robin’s opening receipt');
  await inspect(page, 'Inspect Countersigned coat ledger');
  await cite(page, 'Cite Robin’s opening receipt');
  await cite(page, 'Cite Countersigned coat ledger');
  await cite(page, 'Cite Marshall’s custody sheet');
  await page.getByLabel('First', { exact: true }).selectOption('filing');
  await page.getByLabel('Second', { exact: true }).selectOption('opening');
  await page.getByLabel('Third', { exact: true }).selectOption('arrival');
  await choose(page, 'Ted arrived after the tab opened.');
  await check(page);
  await expect(page.getByText(/put the earliest event first/)).toBeVisible();
  await page.getByLabel('First', { exact: true }).selectOption('opening');
  await page.getByLabel('Second', { exact: true }).selectOption('filing');
  await check(page);
  await expect(page.getByText(/countersigned arrival was at 21:40/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue to a line in the margin' }).click();
  await inspect(page, 'Inspect The bar’s filing slip');
  await inspect(page, 'Inspect Lily’s private annotation');
  await expect(page.getByText('Optional reference · Marshall Eriksen', { exact: true })).toBeVisible();
  await cite(page, 'Cite Marshall’s custody sheet');
  await cite(page, 'Cite The bar’s filing slip');
  await choose(page, 'Lily added the last line to Barney’s draft.');
  await check(page);
  await expect(page.getByText(/Cite the records that establish/)).toBeVisible();
  await cite(page, 'Cite Lily’s private annotation');
  await check(page);
  await page.getByRole('button', { name: 'Continue to what never happened' }).click();
  await inspect(page, 'Inspect Signed withdrawal slip');
  await cite(page, 'Cite The bar’s filing slip');
  await cite(page, 'Cite Lily’s private annotation');
  await cite(page, 'Cite Signed withdrawal slip');
  await choose(page, 'The page existed. It was withdrawn for privacy, and the play was never performed.');
  await check(page);
  await expect(page.getByText(/The Fifth Alibi existed as a draft/)).toBeVisible();

  for (const [option, ending] of [
    ['File the corrected case', 'The archive restored'],
    ['Share a redacted account', 'The city reads it first'],
    ['Keep the page at the booth', 'A private table'],
  ]) {
    await page.getByRole('button', { name: option }).click();
    await expect(page.getByRole('heading', { name: ending })).toBeVisible();
    await page.getByRole('button', { name: 'Try another ending' }).click();
  }
  await page.getByText('Extra ending · 1/5 keepsakes').click();
  await expect(page.getByRole('button', { name: 'Save one last seat' })).toBeDisabled();
  await page.getByRole('link', { name: 'Go to the rainy street' }).click();
  await inspect(page, 'Inspect the yellow umbrella');
  await expect(page.getByText('Memory recovered · Yellow umbrella', { exact: true })).toBeVisible();
  await inspect(page, 'Inspect the blue French horn');
  await expect(page.getByText('Memory recovered · The blue French horn', { exact: true })).toBeVisible();
  await page.goto('/pub');
  await inspect(page, 'Inspect the booth photograph');
  await expect(page.getByRole('button', { name: 'Booth photograph recovered' })).toBeDisabled();
  await page.goto('/evidence');
  await inspect(page, 'Pull the loose thread');
  await expect(page.getByText('Memory recovered · The red thread', { exact: true })).toBeVisible();
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Pin to thread' }).first().click();
  await inspect(page, 'Connect the records');
  await expect(page.getByText(/connection is saved/)).toBeVisible();
  await page.getByRole('link', { name: 'Return to the case' }).click();
  await page.getByText('Extra ending · 5/5 keepsakes').click();
  await inspect(page, 'Save one last seat');
  await expect(page.getByRole('heading', { name: 'One last seat' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'One last seat' })).toBeVisible();
  await page.goto('/collection');
  await inspect(page, 'Next page');
  await inspect(page, 'Next page');
  await expect(page.getByRole('heading', { name: 'One last seat' })).toBeVisible();
  await inspect(page, 'Reset local progress');
  await inspect(page, 'Clear archive data');
  await expect(page.getByRole('progressbar', { name: 'Memory collection completion' })).toHaveAttribute('value', '0');
});

test('pub activities and the sibling role remain usable and restorable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pub');
  await inspect(page, 'Enter the archive');
  const phone = page.locator('.scene-spot[aria-label="Telephone"]');
  await phone.press('Enter');
  await expect(phone).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('1/7 objects inspected')).toBeVisible();
  await inspect(page, 'Ask about the sketch');
  await expect(page.getByText(/map of the neighborhood/)).toBeVisible();
  await page.locator('.scene-spot[aria-label="Sealed envelope"]').click();
  await expect(page.getByText(/For the Mosby kids/)).toBeVisible();
  await page.locator('.scene-spot[aria-label="Suitcase"]').click();
  await expect(page.getByRole('link', { name: 'Open the Playbook' })).toBeVisible();
  await expect(page.getByText('3/7 objects inspected')).toBeVisible();
  await page.reload();
  await expect(page.getByText('3/7 objects inspected')).toBeVisible();
  await page.goto('/story');
  await page.getByText('How to play', { exact: true }).click();
  await page.getByLabel('Your role').selectOption('notebook');
  await inspect(page, 'Need a hint?');
  await inspect(page, 'What should I do next?');
  await expect(page.getByText(/Mark what each record establishes/)).toBeVisible();
  await page.keyboard.press('Escape');
  await inspect(page, 'Open Barney’s envelope');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Cite Marshall’s custody sheet' })).toBeVisible();
  await page.getByText('How to play', { exact: true }).click();
  await expect(page.getByLabel('Your role')).toHaveValue('notebook');
});

test('return to investigation stays visible and restores the saved chapter', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await inspect(page, 'Enter the archive');
  const returnLink = page.getByRole('link', { name: 'Back to investigation' });
  await expect(returnLink).toHaveCount(0);
  await page.getByRole('link', { name: 'Play the mystery' }).click();
  const envelope = page.getByRole('button', { name: 'Open Barney’s envelope' });
  await expect(envelope).toBeVisible();
  await expect(returnLink).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(returnLink).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(() => page.locator('.investigation-return').evaluate((bar) => Math.round(bar.getBoundingClientRect().top))).toBe(0);
  await returnLink.click();
  await firstChapter(page);
  await page.goto('/episodes');
  await expect(returnLink).toBeVisible();
  await page.reload();
  await returnLink.press('Enter');
  await expect(page.getByRole('heading', { name: 'The first round' })).toBeVisible();
  await expect(returnLink).toHaveCount(0);
});

test('legacy saves preserve each archive field and require an explicit case start', async ({ page }) => {
  const original = { stage: 3, responses: ['swarley', 'photo'], ending: 'restored' };
  await page.addInitScript((story) => localStorage.setItem('mother-files-v1', JSON.stringify({
    introSeen: true, story, favorites: ['episode:12285'], aliases: ['Swarley'], unlocked: ['photo'], spoilers: true,
  })), original);
  await page.goto('/story');
  await expect(page.getByText(/umbrella case save is archived/)).toBeVisible();
  await inspect(page, 'Start the Playbook case');
  await expect(page.getByRole('button', { name: 'Open Barney’s envelope' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('mother-files-v1')))).toMatchObject({
    legacyStory: original, story: { version: 2, chapter: 'signatures', completed: [] },
    favorites: ['episode:12285'], aliases: ['Swarley'], unlocked: ['photo'], spoilers: true,
  });
});
