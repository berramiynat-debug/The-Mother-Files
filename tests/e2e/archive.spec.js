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

test('an episode detail survives a list outage and accepts only episodes from this show', async ({ page }) => {
  const endpoint = 'https://api.tvmaze.com/episodes/';
  await page.route('https://api.tvmaze.com/shows/171/episodes', (route) => route.fulfill({ status: 503, json: {} }));
  await page.route(endpoint + '12285?embed=show', (route) => route.fulfill({
    json: { id: 12285, name: 'Pilot', season: 1, number: 1, _embedded: { show: { id: 171 } } },
  }));
  await page.route(endpoint + '1?embed=show', (route) => route.fulfill({
    json: { id: 1, name: 'An unrelated episode', season: 1, number: 1, _embedded: { show: { id: 1 } } },
  }));
  await page.route(endpoint + '999999999?embed=show', (route) => route.fulfill({ status: 404, json: {} }));

  await page.goto('/episodes/12285');
  await expect(page.getByRole('heading', { name: 'Pilot' })).toBeVisible();
  await expect(page).toHaveTitle('Pilot | Legendiary!');
  await page.goto('/episodes/1');
  await expect(page.getByRole('heading', { name: 'Episode not found' })).toBeVisible();
  await expect(page.getByText('An unrelated episode')).toHaveCount(0);
  await page.goto('/episodes/999999999');
  await expect(page.getByRole('heading', { name: 'Episode not found' })).toBeVisible();
});

test('keyboard navigation focuses the new page and updates the browser title', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Episodes' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Episode archive.' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page).toHaveTitle('Episode archive | Legendiary!');
  await page.goBack();
  await expect(page).toHaveTitle('Legendiary! | A HIMYM Fan Archive');
  await expect(page.getByRole('main')).toBeFocused();
});

test('independent tabs preserve concurrent archive updates and reflect a deliberate reset', async ({ page, context }) => {
  await page.goto('/');
  const other = await context.newPage();
  await other.goto('/');
  await Promise.all([
    page.getByRole('button', { name: 'Inspect the yellow umbrella' }).click(),
    other.getByRole('button', { name: 'Inspect the blue French horn' }).click(),
  ]);
  await page.goto('/collection');
  await other.goto('/collection');
  for (const tab of [page, other]) {
    await expect(tab.getByRole('heading', { name: 'Yellow umbrella' })).toBeVisible();
    await expect(tab.getByRole('heading', { name: 'The blue French horn' })).toBeVisible();
  }
  await other.getByRole('button', { name: 'Reset local progress' }).click();
  await other.getByRole('button', { name: 'Clear archive data' }).click();
  await expect(page.getByText('0 / 19')).toBeVisible();
});

test('homepage statistics distinguish loading, unavailable, returned zero and resolved data', async ({ page }) => {
  const base = 'https://api.tvmaze.com/shows/171';
  let release;
  const waiting = new Promise((resolve) => { release = resolve; });
  let shows = 0;
  await page.route(base, (route) => {
    shows++;
    return route.fulfill({ json: { id: 171, name: 'How I Met Your Mother', premiered: '2005-09-19', url: 'https://www.tvmaze.com/shows/171/how-i-met-your-mother' } });
  });
  await page.route(base + '/seasons', async (route) => {
    await waiting;
    await route.fulfill({ json: [{ id: 1, number: 1 }] });
  });
  await page.route(base + '/cast', (route) => route.fulfill({ json: [] }));
  await page.route(base + '/episodes', (route) => route.fulfill({ status: 503, json: {} }));
  await page.goto('/');
  const stat = (label) => page.locator('.stat-grid > div').filter({ hasText: label }).locator('strong');
  await expect(stat('Seasons')).toHaveText('Loading…');
  release();
  await expect(stat('Seasons')).toHaveText('1');
  await expect(stat('Episodes')).toHaveText('Unavailable');
  await expect(stat('Listed characters')).toHaveText('0');
  await expect(stat('Series premiere')).toHaveText('2005');
  await expect(page.getByRole('link', { name: 'Series record on TVmaze' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Random episode' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Play the mystery' })).toBeEnabled();
  expect(shows).toBe(1);

  await page.unroute(base + '/episodes');
  const pilot = { id: 12285, name: 'Pilot', season: 1, number: 1, airdate: '2005-09-19' };
  await page.route(base + '/episodes', (route) => route.fulfill({ json: [pilot] }));
  await page.route('https://api.tvmaze.com/episodes/12285?embed=show', (route) =>
    route.fulfill({ json: { ...pilot, _embedded: { show: { id: 171 } } } }));
  await page.reload();
  await page.getByRole('button', { name: 'Random episode' }).click();
  await expect(page).toHaveURL(/\/episodes\/12285$/);
  await expect(page.getByRole('heading', { name: 'Pilot' })).toBeVisible();
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

test('the Jukebox applies the current spoiler setting to the selected track', async ({ page }) => {
  const response = Promise.withResolvers();
  await page.route('https://himym-api.vercel.app/api/quotes', async (route) => {
    await response.promise;
    await route.fulfill({ json: { quotes: 'Test-only unclassified track.', author: 'Ted Mosby' } });
  });
  await page.goto('/pub');
  await page.getByRole('group', { name: 'Objects in MacLaren’s' }).getByRole('button', { name: 'Jukebox' }).click();
  const jukebox = page.locator('#pub-inspector');
  try {
    await jukebox.getByRole('button', { name: 'Spoilers off' }).click();
    await jukebox.getByRole('button', { name: 'Play a random track' }).click();
    await jukebox.getByRole('button', { name: 'Spoilers on' }).click();
  } finally {
    response.resolve();
  }
  await expect(jukebox.getByText('This track is sealed in spoiler-safe mode.')).toBeVisible();
  const quote = jukebox.getByText(/Test-only unclassified track/);
  await expect(quote).toHaveCount(0);
  await jukebox.getByRole('button', { name: 'Spoilers off' }).click();
  await expect(quote).toBeVisible();
  await page.goto('/episodes');
  await expect(page.getByRole('main').getByRole('button', { name: 'Spoilers on' })).toBeVisible();
});

test('live character aliases, canon conflict, and Case File 3355', async ({ page }) => {
  await page.goto('/characters/46417');
  await page.getByRole('button', { name: 'Swarley', exact: true }).click();
  await expect(page.getByText('Swarley protocol unlocked.')).toBeVisible();
  await page.getByRole('button', { name: 'Suit up' }).click();
  await page.goto('/sources');
  await expect(page.locator('.source').filter({ has: page.getByRole('heading', { name: 'GroqCloud' }) }))
    .toContainText('Optional · on demand');
  await expect(page.getByRole('row', { name: /Marshall Eriksen Jason Segel Conflict/ })).toBeVisible();
  await page.getByPlaceholder('File number').fill('3355');
  await page.getByRole('button', { name: 'Open file' }).click();
  await expect(page.getByRole('heading', { name: 'Case File 3355' })).toBeVisible();
  await page.goto('/collection');
  await expect(page.getByRole('heading', { name: 'The technical annex' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Case File 3355', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Swarley protocol' })).toBeVisible();
});
