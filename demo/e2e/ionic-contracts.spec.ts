import { expect, test } from '@playwright/test';

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: MD parents retain a child's explicit iOS mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/color-palette');
    const card = page.getByTestId('palette-mixed-mode');
    await expect(card).toHaveClass(/hydrated/);
    await card.evaluate((element) => {
      (element as HTMLElement).style.setProperty('--md-sys-color-on-surface', '#123456');
      (element as HTMLElement).style.setProperty('--md-sys-color-on-surface-variant', '#345678');
    });
    for (const [id, reference] of [
      ['ios-title', 'ios-reference'],
      ['ios-subtitle', 'ios-subtitle-reference'],
    ]) {
      const target = page.getByTestId(`palette-${id}`);
      await expect(target).toHaveClass(/ios/);
      const color = await page.getByTestId(`palette-${reference}`).evaluate((element) => getComputedStyle(element).color);
      await expect.poll(() => target.evaluate((element) => getComputedStyle(element).color)).toBe(color);
    }
  });

  test(`${mode}: tab icon opt-out retains normal Ionic inheritance`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/tabs');
    const tab = page.locator('app-tabs ion-tab-button').first();
    await expect(tab).toHaveClass(/hydrated/);
    await tab.evaluate((element) => {
      (element as HTMLIonTabButtonElement).selected = true;
      const bar = element.closest('ion-tab-bar')!;
      bar.style.setProperty('--md-sys-color-on-secondary-container', '#123456');
      bar.style.setProperty('--md-sys-color-on-surface', '#234567');
    });
    await expect(tab).toHaveClass(/tab-selected/);
    const icon = tab.locator('ion-icon');
    await expect.poll(() => icon.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(18, 52, 86)');
    await icon.evaluate((element) => element.classList.add('md3-disabled'));
    await expect
      .poll(async () => ({
        icon: await icon.evaluate((element) => getComputedStyle(element).color),
        parent: await tab.evaluate((element) => getComputedStyle(element).color),
      }))
      .toEqual({ icon: 'rgb(35, 69, 103)', parent: 'rgb(35, 69, 103)' });
    await icon.evaluate((element) => element.setAttribute('color', 'danger'));
    await expect(icon).toHaveClass(/ion-color-danger/);
    await expect.poll(() => icon.evaluate((element) => getComputedStyle(element).color)).not.toBe('rgb(35, 69, 103)');
  });
}
