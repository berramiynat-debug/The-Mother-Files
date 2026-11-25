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
