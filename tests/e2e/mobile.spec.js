import { expect, test } from '@playwright/test';

test('responsive navigation, intro dismissal, and zero horizontal overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveTitle(/Legendiary!/);
  await expect(page.getByRole('heading', { name: /Legen\s*diary\s*!/ })).toBeVisible();
  await expect(page.locator('h1 em')).toHaveText('diary');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  const menu = page.getByRole('button', { name: 'Open menu' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Characters' }).click();
  await expect(page.getByRole('heading', { name: 'Character dossiers.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ted Mosby' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  await page.goto('/story');
  await expect(page.getByRole('button', { name: 'Open Barney’s envelope' })).toBeInViewport({ ratio: 1 });
  await page.goto('/pub');
  await expect(page.locator('.pub-scene')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
});

test('notebook keeps evidence available and fits narrow screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('mother-files-v1', JSON.stringify({ introSeen: true })));
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/story');
  const launcher = page.getByRole('button', { name: 'Need a hint?' });
  await launcher.press('Enter');
  const panel = page.getByRole('region', { name: 'The Mosby Margins' });
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: 'Open Barney’s envelope' }).click();
  await expect(page.getByRole('checkbox', { name: 'Cite Marshall’s custody sheet' })).toBeVisible();
  await page.getByRole('button', { name: 'Minimize notebook' }).click();
  await expect(launcher).toBeFocused();
});

test('the memory book swipes one page at a time on a narrow touch screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('mother-files-v1', JSON.stringify({ introSeen: true, unlocked: ['sparkles'] })));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/collection');
  const book = page.getByRole('region', { name: 'Memory book' });
  const spread = book.locator('.book-spread');
  const folios = book.locator('.book-page-count');
  await expect(folios).toHaveText('Page 1 of 10');
  await expect(book.getByRole('heading', { name: 'The mall transmission' })).toHaveCount(0);
  await expect(page.locator('.umbrella-opening')).toBeHidden();
  await spread.scrollIntoViewIfNeeded();
  const bounds = await spread.boundingBox();
  const y = bounds.y + bounds.height / 2;
  const x = bounds.x + bounds.width * .88;
  const touch = await page.context().newCDPSession(page);
  await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - bounds.width * step / 12, y }] });
  }
  await expect(spread.locator('.book-leaf')).toHaveAttribute('data-phase', 'dragging');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(folios).toHaveText('Page 2 of 10');
  await expect(book.getByRole('heading', { name: 'The mall transmission' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.setViewportSize({ width: 900, height: 740 });
  await expect(folios).toHaveText('Pages 1–2 of 10');
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(folios).toHaveText('Page 2 of 10');
  await book.getByRole('button', { name: 'Previous page' }).click();
  await expect(folios).toHaveText('Page 1 of 10');
});
