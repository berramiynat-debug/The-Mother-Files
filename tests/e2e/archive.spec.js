import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    if (!localStorage.getItem('mother-files-v1')) localStorage.setItem('mother-files-v1', JSON.stringify({ introSeen: true }));
  });
});

test('canonical listings, search, pagination, navigation, production refresh, and favorites', async ({ page }) => {
  await page.goto('/episodes');
  await expect(page.getByText('208 episodes', { exact: true })).toBeVisible();
  await expect(page.locator('.episode-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Load more episodes' }).click();
  await expect(page.locator('.episode-card')).toHaveCount(24);
  await page.getByLabel('Filter by season').selectOption('1');
  await page.getByRole('searchbox', { name: 'Search episodes' }).fill('S01E01');
  await expect(page.locator('.episode-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save favorite' }).click();
  await page.getByRole('link', { name: /Pilot/ }).click();
  await expect(page.getByRole('heading', { name: 'Pilot' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove favorite' })).toBeVisible();
  await page.getByRole('link', { name: 'Season 1' }).click();
  await expect(page.getByRole('heading', { name: 'Season 1', exact: true })).toBeVisible();
  await page.goto('/characters');
  await expect(page.getByRole('heading', { name: 'Ted Mosby' })).toBeVisible();
  await expect(page.getByText('Cristin Milioti')).toHaveCount(0);
  await page.goto('/cast/31568');
  await expect(page.getByRole('heading', { name: 'Josh Radnor' })).toBeVisible();
  await page.goto('/seasons');
  await expect(page.locator('.timeline-entry')).toHaveCount(9);
});

test('TVmaze network failure, retry, loading, and empty states', async ({ page }) => {
  const match = 'https://api.tvmaze.com/shows/171/episodes';
  await page.route(match, (route) => route.abort());
  await page.goto('/episodes');
  await expect(page.getByRole('heading', { name: 'Connection interrupted' })).toBeVisible();
  await page.unroute(match);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'Pilot' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search episodes' }).fill('Zzzunmatched');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
});

test('spoiler safe default, direct URL lock, and opt-in', async ({ page }) => {
  await page.goto('/episodes/12492');
  await expect(page.getByRole('heading', { name: 'Under seal' })).toBeVisible();
  await expect(page.getByText('Last Forever (2)', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Allow spoilers' }).click();
  await expect(page.getByRole('heading', { name: 'Last Forever (2)', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Spoilers on' }).click();
  await expect(page.getByRole('heading', { name: 'Under seal' })).toBeVisible();
});

test('live character aliases, canon conflict, and Case File 3355', async ({ page }) => {
  await page.goto('/characters/46417');
  await page.getByRole('button', { name: 'Swarley', exact: true }).click();
  await expect(page.getByText('Swarley protocol unlocked.')).toBeVisible();
  await page.getByRole('button', { name: 'Suit up' }).click();
  await page.goto('/sources');
  await expect(page.getByRole('row', { name: /Marshall Eriksen Jason Segel Conflict/ })).toBeVisible();
  await page.getByPlaceholder('File number').fill('3355');
  await page.getByRole('button', { name: 'Open file' }).click();
  await expect(page.getByRole('heading', { name: 'Case File 3355' })).toBeVisible();
  await page.goto('/collection');
  await expect(page.getByRole('heading', { name: 'The technical annex' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Case File 3355', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Swarley protocol' })).toBeVisible();
});
