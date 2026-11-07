import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: searchbar retains its neutral background and accepts an optional surface`, async ({ page }) => {
    await page.addInitScript(() => ((window as unknown as { IONIC_E2E_TESTING: boolean }).IONIC_E2E_TESTING = true));
    await page.goto('/main/index/searchbar', { waitUntil: 'networkidle' });
    if (mode === 'dark') await page.locator('html').evaluate((element) => element.classList.add('ion-palette-dark'));
    // Check the real page, including toolbar and inherited color="light" contexts.
    const searches = page.locator('app-searchbar ion-searchbar');
    await expect(searches).toHaveCount(9);
    for (const search of await searches.all()) {
      await expect(search).toHaveClass(/hydrated/);
      const input = search.locator('.searchbar-input');
      const neutral = await search.evaluate((element) => {
        const style = getComputedStyle(element);
        const rgb = style.getPropertyValue('--ion-color-contrast-rgb') || style.getPropertyValue('--ion-text-color-rgb') || '0, 0, 0';
        return `rgba(${rgb.replace(/\s+/g, ' ').trim()}, 0.08)`;
      });
      await expect(input).toHaveCSS('background-color', neutral);
      await search.evaluate((element) => (element as HTMLElement).style.setProperty('--md-sys-color-surface-container-high', '#abcdee'));
      await expect(input).toHaveCSS('background-color', 'rgb(171, 205, 238)');
      await search.evaluate((element) => (element as HTMLElement).style.removeProperty('--md-sys-color-surface-container-high'));
      await expect(input).toHaveCSS('background-color', neutral);
      await search.evaluate((element) => (element as HTMLElement).style.setProperty('--background', '#123456'));
      await expect(input).toHaveCSS('background-color', 'rgb(18, 52, 86)');
    }
  });
}
