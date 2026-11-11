import { expect, test } from '@playwright/test';

test('Material You and dark mode toggle independently', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const root = page.locator('html');
  const dark = page.getByRole('switch', { name: 'Dark Mode', exact: true });
  const material = page.getByRole('switch', { name: 'Material You', exact: true });
  await expect(dark).not.toBeChecked();
  await expect(material).toBeChecked();
  await dark.click();
  await expect(root).toHaveClass(/ion-palette-dark/);
  await material.click();
  await expect(material).not.toBeChecked();
  await expect(dark).toBeChecked();
  await expect(root).toHaveClass(/ion-palette-dark/);
  await dark.click();
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await expect(material).not.toBeChecked();
  await material.click();
  await expect(material).toBeChecked();
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).not.toHaveClass(/ion-palette-dark/);
});
