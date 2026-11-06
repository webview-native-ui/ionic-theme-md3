import { expect, test } from '@playwright/test';

test('system/light/dark appearance follows device only in system mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const root = page.locator('html');
  await expect(root).toHaveClass(/ion-palette-dark/);
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(root).toHaveClass(/ion-palette-dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(root).toHaveClass(/ion-palette-dark/);
  await page.getByRole('button', { name: 'System', exact: true }).click();
  await expect(root).not.toHaveClass(/ion-palette-dark/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(root).toHaveClass(/ion-palette-dark/);
});
