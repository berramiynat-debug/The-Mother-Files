import { expect, test } from '@playwright/test';

test('pub, pinned evidence, all investigation endings and persistence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the archive' }).click();
  await page.getByRole('button', { name: 'Inspect the yellow umbrella' }).click();
  await page.getByRole('button', { name: 'Inspect the blue French horn' }).click();
  await page.goto('/pub');
  await page.locator('.scene-spot[aria-label="Telephone"]').click();
  await page.getByRole('button', { name: 'Ask about the sketch' }).click();
  await expect(page.getByText(/map of the neighborhood/)).toBeVisible();
  await page.locator('.scene-spot[aria-label="Sealed envelope"]').click();
  await expect(page.getByText(/seal breaks cleanly/)).toBeVisible();
  await page.locator('.scene-spot[aria-label="Suitcase"]').click();
  await expect(page.getByRole('link', { name: 'Open the Playbook' })).toBeVisible();
  await page.goto('/evidence');
  await page.getByRole('button', { name: 'Pull the loose thread' }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Pin to thread' }).first().click();
  await page.getByRole('button', { name: 'Connect the records' }).click();
  await expect(page.getByText(/connection is saved/)).toBeVisible();
  await page.getByRole('link', { name: 'Return to the case' }).click();
  await page.getByRole('button', { name: /Keep the notebook/ }).click();
  await expect(page.getByText(/answer one question at a time/)).toBeVisible();
  await page.getByRole('button', { name: 'Ask Dad about the timestamp' }).click();
  await page.getByRole('button', { name: 'Follow the timestamp' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'The missing photograph' })).toBeVisible();
  await expect(page.getByText('Your role · Keep the notebook')).toBeVisible();
  await page.getByLabel('Drawer code').fill('0919');
  await page.getByRole('button', { name: 'Decode' }).click();
  await page.getByRole('button', { name: 'Investigate the signature' }).click();
  await page.getByRole('button', { name: /^TVmaze/ }).click();
  await page.getByRole('button', { name: 'Open the lost & found' }).click();
  for (const [option, ending] of [
    ['Restore the files to the archive', 'The archive restored'],
    ['Publish the witnesses’ versions', 'The city reads it first'],
    ['Leave the photograph with the booth', 'A private table'],
  ]) {
    await page.getByRole('button', { name: option }).click();
    await expect(page.getByRole('heading', { name: ending })).toBeVisible();
    await page.getByRole('button', { name: 'Try another ending' }).click();
  }
  await page.getByRole('button', { name: 'Combine evidence' }).click();
  await page.getByRole('button', { name: 'Read the reverse of the photograph' }).click();
  await expect(page.getByRole('heading', { name: 'One last seat' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'One last seat' })).toBeVisible();
  await page.goto('/collection');
  await expect(page.getByRole('heading', { name: 'One last seat' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset local progress' }).click();
  await page.getByRole('button', { name: 'Clear archive data' }).click();
  await expect(page.getByText('0 / 19')).toBeVisible();
});

test('the questioning sibling hears different notes and keeps their choice after reload', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/story');
  await page.getByRole('button', { name: 'Enter the archive' }).click();
  await page.getByRole('button', { name: /Ask the questions/ }).click();
  await expect(page.getByText(/I’ve got 12:01 in the notebook/)).toBeVisible();
  await page.getByRole('button', { name: 'Call Aunt Lily' }).click();
  await expect(page.getByText(/history of calendars/)).toBeVisible();
  await page.reload();
  await expect(page.getByText('Your role · Ask the questions')).toBeVisible();
  await expect(page.getByText(/history of calendars/)).toBeVisible();
  await page.getByRole('button', { name: 'Follow the timestamp' }).click();
  await expect(page.getByText(/I’ll hold our place in the timeline/)).toBeVisible();
});
