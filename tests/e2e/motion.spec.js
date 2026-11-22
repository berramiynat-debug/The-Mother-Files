import { expect, test } from '@playwright/test';

test('the intro can pause, jump to a scene, and resume without skipping the story', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/');
  const intro = page.getByRole('dialog');
  await intro.getByRole('button', { name: 'Pause intro' }).click();
  await intro.getByRole('button', { name: 'Scene 4: Legendary' }).click();
  await expect(intro.getByRole('heading', { name: 'Legendary!' })).toBeVisible();
  await page.clock.fastForward(3200);
  await expect(intro.getByRole('button', { name: 'Scene 4: Legendary' })).toHaveAttribute('aria-current', 'step');
  await intro.getByRole('button', { name: 'Resume intro' }).click();
  await page.clock.fastForward(1250);
  await expect(intro.getByRole('heading', { name: 'Two things are missing.' })).toBeVisible();
  await intro.getByRole('link', { name: 'Play the mystery' }).click();
  await expect(page.getByRole('button', { name: 'Open Barney’s envelope' })).toBeVisible();
});
