import { expect, test } from '@playwright/test';

test('unsupported Material You is disabled while dark mode remains usable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const root = page.locator('html');
  const dark = page.getByRole('switch', { name: 'Dark Mode', exact: true });
  const material = page.getByRole('switch', { name: /^Material You/ });
  await expect(dark).not.toBeChecked();
  await expect(material).not.toBeChecked();
  await expect(material).toBeDisabled();
  await dark.click();
  await expect(root).toHaveClass(/ion-palette-dark/);
  await expect(material).not.toBeChecked();
  await expect(dark).toBeChecked();
  await expect(root).toHaveClass(/ion-palette-dark/);
  await dark.click();
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await expect(material).not.toBeChecked();
  await expect(material).toBeDisabled();
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).not.toHaveClass(/ion-palette-dark/);
});
