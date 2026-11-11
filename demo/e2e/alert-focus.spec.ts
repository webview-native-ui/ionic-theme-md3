import { expect, test } from '@playwright/test';

for (const appearance of ['light', 'dark'] as const) {
  test(`${appearance}: dialog autofocus has no surface ring and keyboard actions remain visible`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: appearance });
    await page.setViewportSize({ width: 411, height: 891 });
    await page.goto('/main/index/alert?type=preferred');
    await page.locator('html').evaluate((root, appearance) => {
      root.classList.toggle('ion-palette-dark', appearance === 'dark');
      root.style.colorScheme = appearance;
    }, appearance);
    await expect(page.locator('html')).toHaveCSS('color-scheme', appearance);
    await expect
      .poll(() => page.locator('html').evaluate((root) => root.classList.contains('ion-palette-dark')))
      .toBe(appearance === 'dark');
    const alert = page.locator('ion-alert');
    const wrapper = alert.locator('.alert-wrapper');
    await expect(wrapper).toBeFocused();
    await expect(wrapper).toHaveCSS('outline-style', 'none');
    await page.screenshot({ path: testInfo.outputPath(`alert-autofocus-${appearance}.png`) });

    await page.keyboard.press('Tab');
    await expect(alert.getByRole('button', { name: 'Details', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    const preferred = alert.getByRole('button', { name: 'Continue', exact: true });
    await expect(preferred).toBeFocused();
    await expect(preferred).toHaveClass(/ion-focused/);
    await expect(preferred).toHaveCSS('box-shadow', /inset/);
    await page.screenshot({ path: testInfo.outputPath(`alert-keyboard-${appearance}.png`) });
    await page.keyboard.press('Tab');
    await expect(alert.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(alert.getByRole('button', { name: 'Details', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(alert).toHaveCount(0);
  });
}

for (const variant of ['opt-out', 'ios'] as const) {
  test(`${variant}: the theme does not suppress the dialog outline`, async ({ page }) => {
    await page.goto('/main/index/alert');
    await page.evaluate(async (variant) => {
      const alert = document.createElement('ion-alert');
      alert.mode = variant === 'ios' ? 'ios' : 'md';
      if (variant === 'opt-out') alert.classList.add('md3-disabled');
      alert.header = 'Focus test';
      alert.buttons = ['Cancel', 'OK'];
      document.body.append(alert);
      await alert.present();
    }, variant);
    const wrapper = page.locator('ion-alert .alert-wrapper');
    await expect(wrapper).toBeFocused();
    await expect(wrapper).not.toHaveCSS('outline-style', 'none');
  });
}
