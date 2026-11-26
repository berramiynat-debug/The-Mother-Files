import { expect, test } from '@playwright/test';

test('the intro can pause, jump to a scene, and resume without skipping the story', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/playbook.svg', (route) => route.abort());
  await page.clock.install();
  await page.goto('/');
  const intro = page.getByRole('dialog');
  await expect(intro.locator('.intro-playbook svg')).toBeVisible();
  await intro.getByRole('button', { name: 'Pause intro' }).click();
  await intro.getByRole('button', { name: 'Scene 4: Legendary' }).click();
  await expect(intro.getByRole('heading', { name: 'Legendary!' })).toBeVisible();
  await page.clock.fastForward(3200);
  await expect(intro.getByRole('button', { name: 'Scene 4: Legendary' })).toHaveAttribute('aria-current', 'step');
  await intro.getByRole('button', { name: 'Resume intro' }).click();
  await page.clock.fastForward(1250);
  await expect(intro.getByRole('heading', { name: 'A page has gone missing.' })).toBeVisible();
  await intro.getByRole('link', { name: 'Play the mystery' }).click();
  await expect(page.getByRole('button', { name: 'Open Barney’s envelope' })).toBeVisible();
});

test('the umbrella opens on each document load for returning visitors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    localStorage.setItem('mother-files-v1', JSON.stringify({ introSeen: true }));
    document.addEventListener('animationstart', (event) => {
      if (event.animationName === 'clear-umbrella-opening') event.target.dataset.started = 'true';
    });
  });
  const opening = page.locator('.umbrella-opening');
  await page.goto('/');
  await expect(opening).toHaveAttribute('data-started', 'true');
  await expect(opening).toBeHidden();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'The Pub' }).click();
  await expect(page.getByRole('heading', { name: 'After dark.' })).toBeVisible();
  await expect(opening).toBeHidden();
  await page.reload();
  await expect(opening).toHaveAttribute('data-started', 'true');
  await expect(opening).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(opening).toHaveCSS('display', 'none');
});
