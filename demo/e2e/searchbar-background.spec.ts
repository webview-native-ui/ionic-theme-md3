import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: searchbar retains its neutral background and accepts an optional surface`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/color-palette');
    const search = page.getByTestId('palette-search');
    await expect(search).toHaveClass(/hydrated/);
    await search.evaluate((element, mode) => {
      (element as HTMLElement).style.setProperty('--ion-text-color-rgb', mode === 'light' ? '0, 0, 0' : '255, 255, 255');
    }, mode);
    const input = search.locator('.searchbar-input');
    const neutral = mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    await expect(input).toHaveCSS('background-color', neutral);
    await search.evaluate((element) => (element as HTMLElement).style.setProperty('--md-sys-color-surface-container-high', '#abcdee'));
    await expect(input).toHaveCSS('background-color', 'rgb(171, 205, 238)');
    await search.evaluate((element) => (element as HTMLElement).style.removeProperty('--md-sys-color-surface-container-high'));
    await expect(input).toHaveCSS('background-color', neutral);
    await search.evaluate((element) => (element as HTMLElement).style.setProperty('--background', '#123456'));
    await expect(input).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  });
}
