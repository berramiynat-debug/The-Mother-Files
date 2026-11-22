import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('mother-files-v1')) localStorage.setItem('mother-files-v1', JSON.stringify({ introSeen: true }));
  });
});

test('Playbook resolution, ten-round episode quiz, and keyboard reaction game', async ({ page }) => {
  await page.goto('/games?game=playbook');
  for (let index = 0; index < 5; index++) {
    await page.locator('.choice').first().click();
    await page.getByRole('button', { name: index === 4 ? 'Read your ending' : 'Continue' }).click();
  }
  await expect(page.getByRole('heading', { name: 'The regular' })).toBeVisible();
  await page.getByRole('button', { name: 'Replay the Playbook' }).click();
  await expect(page.getByText('Decision 1 / 5')).toBeVisible();
  await page.goto('/games?game=episode');
  await page.getByLabel('Season').selectOption('1');
  for (let i = 1; i <= 10; i++) {
    await expect(page.locator('.choice')).toHaveCount(4);
    await page.locator('.choice').first().click();
    await page.getByRole('button', { name: i === 10 ? 'See results' : 'Next round' }).click();
  }
  await expect(page.getByRole('heading', { name: /\/ 10 correct/ })).toBeVisible();
  await page.goto('/games?game=reaction');
  await page.getByLabel('Difficulty').selectOption('Casual');
  await page.getByRole('button', { name: 'Start meter' }).press('Space');
  await expect(page.getByRole('button', { name: 'Catch signal' })).toBeVisible();
  await page.getByRole('button', { name: 'Catch signal' }).press('Space');
  await expect(page.getByText('1 / 5 attempts')).toBeVisible();
});

test('identity game always includes the hidden alias', async ({ page }) => {
  await page.goto('/games?game=identity');
  for (let i = 0; i < 6; i++) {
    await page.locator('.choice').first().click();
    await page.getByRole('button', { name: 'Next round' }).click();
  }
  await expect(page.getByRole('heading', { name: /Swarley/ })).toBeVisible();
  await page.getByRole('button', { name: 'Barney Stinson', exact: true }).click();
  await expect(page.getByText(/coffee cup just made/)).toBeVisible();
});

test('live quote integration uses the Character API for the archive and detective game', async ({ page }) => {
  // Invented fixture lines represent network shapes only. Production uses live GET requests.
  const characters = ['Ted Mosby', 'Barney Stinson', 'Marshall Eriksen', 'Lily Aldrin', 'Robin Scherbatsky'];
  let samples = 0;
  const retiredRequests = [];
  await page.route('https://himym-api-ten.vercel.app/**', (route) => {
    retiredRequests.push(route.request().url());
    return route.abort();
  });
  await page.route('https://himym-api.vercel.app/api/quotes', (route) => {
    const index = samples++;
    return route.fulfill({ json: { quotes: 'Test-only observation ' + index + '.', author: characters[index % characters.length] } });
  });
  await page.goto('/quotes');
  await expect(page.getByRole('heading', { name: 'Under seal' })).toBeVisible();
  await page.getByRole('button', { name: 'Allow spoilers' }).click();
  await expect(page.getByText('Active provider · HIMYM Character API.', { exact: true })).toBeVisible();
  await page.getByLabel('Speaker').selectOption('Ted Mosby');
  await expect(page.getByRole('figure')).toHaveCount(1);
  await page.getByRole('button', { name: 'Recover more lines' }).click();
  await expect(page.getByRole('figure')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Search quotes' }).fill('observation 5.');
  await expect(page.getByRole('figure')).toHaveCount(1);
  await expect(page.getByRole('figure')).toContainText('Test-only observation 5.');
  await page.getByRole('link', { name: 'Play Quote Detective' }).click();
  await expect(page.getByText('Round 1 / 7')).toBeVisible();
  const prompt = await page.locator('.quiz h2').textContent();
  const index = Number(prompt.match(/observation (\d+)/)[1]);
  await page.getByRole('button', { name: characters[index % characters.length], exact: true }).click();
  await expect(page.getByText('Correct.', { exact: true })).toBeVisible();
  await page.goto('/collection');
  await expect(page.getByText(/Voice print recovered/)).toBeVisible();
  await page.goto('/sources');
  await expect(page.getByRole('heading', { name: 'HIMYM Character API', exact: true })).toBeVisible();
  expect(retiredRequests).toHaveLength(0);
});
