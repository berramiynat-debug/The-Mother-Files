import { expect, test } from '@playwright/test';

test('responsive navigation, intro dismissal, and zero horizontal overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveTitle(/The Pineapple Files/);
  await expect(page.getByRole('heading', { name: /The Pineapple\s*Files/ })).toBeVisible();
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
