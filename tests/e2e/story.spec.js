import { expect, test } from '@playwright/test';

test('a first-time player can solve the main case and unlock all endings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('dialog').getByRole('link', { name: 'Play the mystery' }).click();
  await page.getByRole('button', { name: 'Open Barney’s envelope' }).click();
  await page.getByRole('button', { name: 'Robin Sparkles', exact: true }).click();
  await expect(page.getByText(/That’s Robin’s stage name/)).toBeVisible();
  await page.getByRole('button', { name: 'Swarley', exact: true }).click();
  await expect(page.getByText('The cup points to Barney.')).toBeVisible();
  await page.getByRole('button', { name: 'Go to the MacLaren’s drawer' }).click();
  await expect(page.locator('.case-scene-anchor')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'The MacLaren’s drawer' })).toBeVisible();
  await page.getByRole('button', { name: 'Inspect the pineapple' }).click();
  await expect(page.getByText(/For the lock, try the Pilot card/)).toBeVisible();
  await page.getByRole('button', { name: 'Read the Pilot card' }).click();
  await expect(page.getByText('September 19, 2005', { exact: true })).toBeVisible();
  await page.getByLabel('Drawer code').fill('1919');
  await expect(page.locator('.case-dial')).toHaveText(['1', '9', '1', '9']);
  await page.getByRole('button', { name: 'Unlock drawer' }).click();
  await expect(page.getByText(/The drawer stays shut/)).toBeVisible();
  await expect(page.getByLabel('Drawer code')).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Drawer code').fill('0919');
  await page.getByRole('button', { name: 'Unlock drawer' }).click();
  await expect(page.getByText(/You found the photograph/)).toBeVisible();
  await expect(page.locator('.case-recovered-photo')).toBeVisible();
  await page.getByRole('button', { name: 'Read the witness slip' }).click();
  await page.getByRole('button', { name: 'Compare their aliases' }).click();
  await expect(page.getByRole('link', { name: 'The Playbook episode' })).toBeVisible();
  await page.getByRole('button', { name: 'Two people signed it' }).click();
  await expect(page.getByText(/Both have a connection to Barney/)).toBeVisible();
  await page.getByRole('button', { name: 'Both names are Barney' }).click();
  await page.getByRole('button', { name: 'Ask Dad about the umbrella' }).click();

  for (const [option, ending] of [
    ['Restore the files to the archive', 'The archive restored'],
    ['Publish the witnesses’ versions', 'The city reads it first'],
    ['Leave the photograph with the booth', 'A private table'],
  ]) {
    await page.getByRole('button', { name: new RegExp(option) }).click();
    await expect(page.getByRole('heading', { name: ending })).toBeVisible();
    await page.getByRole('button', { name: 'Try another ending' }).click();
  }
  await page.getByText(/Secret ending · 2\/5 keepsakes/).click();
  await expect(page.getByRole('button', { name: 'Combine evidence' })).toBeDisabled();
  await page.getByRole('link', { name: 'Go to the rainy street' }).click();
  await page.getByRole('button', { name: 'Inspect the yellow umbrella' }).click();
  await page.getByRole('button', { name: 'Inspect the blue French horn' }).click();
  await page.goto('/evidence');
  await page.getByRole('button', { name: 'Pull the loose thread' }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Pin to thread' }).first().click();
  await page.getByRole('button', { name: 'Connect the records' }).click();
  await expect(page.getByText(/connection is saved/)).toBeVisible();
  await page.getByRole('link', { name: 'Return to the case' }).click();
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

test('the pub activities and alternate sibling hint remain playable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pub');
  await page.getByRole('button', { name: 'Enter the archive' }).click();
  const phone = page.locator('.scene-spot[aria-label="Telephone"]');
  await phone.press('Enter');
  await expect(phone).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('1/7 objects inspected')).toBeVisible();
  await page.getByRole('button', { name: 'Ask about the sketch' }).click();
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
  await page.getByText('Ask your sibling for a hint', { exact: true }).click();
  await expect(page.getByText(/I’ll interrogate Dad/)).toBeVisible();
  await page.getByRole('button', { name: 'Open Barney’s envelope' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Swarley', exact: true })).toBeVisible();
  await page.getByText('How to play', { exact: true }).click();
  await expect(page.getByLabel('Your role')).toHaveValue('notebook');
});

test('the return link stays usable outside the investigation and resumes the saved chapter', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter the archive' }).click();
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
  await expect(envelope).toBeVisible();
  await envelope.click();
  await page.getByRole('button', { name: 'Swarley', exact: true }).click();
  await page.getByRole('button', { name: 'Go to the MacLaren’s drawer' }).click();

  await page.goto('/episodes');
  await expect(returnLink).toBeVisible();
  await page.reload();
  await returnLink.press('Enter');
  await expect(page.getByRole('heading', { name: 'The MacLaren’s drawer' })).toBeVisible();
  await expect(returnLink).toHaveCount(0);
});
