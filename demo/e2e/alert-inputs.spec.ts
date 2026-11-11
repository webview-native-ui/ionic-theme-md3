import { expect, test } from '@playwright/test';

for (const appearance of ['light', 'dark'] as const) {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`${appearance} ${direction}: checkbox geometry, colors and interaction`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 412, height: 915 });
      await page.addInitScript(() => ((window as Window & { IONIC_E2E_TESTING?: boolean }).IONIC_E2E_TESTING = true));
      await page.goto('/main/index/alert?type=checkbox');
      await page.locator('html').evaluate(
        (root, { appearance, direction }) => {
          root.classList.toggle('ion-palette-dark', appearance === 'dark');
          root.dir = direction;
        },
        { appearance, direction },
      );
      const alert = page.locator('ion-alert');
      await expect(alert).toBeVisible();
      // Deliberately separate Material roles from Ionic primary to catch fallback leaks.
      await alert.evaluate((element) => {
        element.style.setProperty('--md-sys-color-primary', '#675080');
        element.style.setProperty('--md-sys-color-on-primary', '#ffffff');
      });
      const options = alert.getByRole('checkbox');
      await expect(options).toHaveCount(4);
      const icon = options.first().locator('.alert-checkbox-icon');
      await expect(icon).toHaveCSS('width', '18px');
      await expect(icon).toHaveCSS('height', '18px');
      await expect(icon).toHaveCSS('background-color', 'rgb(103, 80, 128)');
      await expect(options.first().locator('.alert-checkbox-inner')).toHaveCSS('border-right-color', 'rgb(255, 255, 255)');
      const geometry = await options.evaluateAll((elements) =>
        elements.map((element) => {
          const icon = element.querySelector('.alert-checkbox-icon')!.getBoundingClientRect();
          const text = document.createRange();
          text.selectNodeContents(element.querySelector('.alert-checkbox-label')!);
          const label = text.getBoundingClientRect();
          const tick = element.querySelector('.alert-checkbox-inner')!.getBoundingClientRect();
          return {
            icon: { x: icon.x, y: icon.y, right: icon.right, bottom: icon.bottom },
            label: { x: label.x, right: label.right },
            tick: { x: tick.x, y: tick.y, right: tick.right, bottom: tick.bottom },
          };
        }),
      );
      for (const { icon, label } of geometry) {
        expect(direction === 'ltr' ? label.x - icon.right : icon.x - label.right).toBeGreaterThanOrEqual(0);
      }
      const { icon: box, tick } = geometry[0];
      expect(tick.x).toBeGreaterThanOrEqual(box.x + 2);
      expect(tick.y).toBeGreaterThanOrEqual(box.y + 2);
      expect(tick.right).toBeLessThanOrEqual(box.right - 2);
      expect(tick.bottom).toBeLessThanOrEqual(box.bottom - 2);
      await options.nth(1).click();
      await expect(options.nth(1)).toHaveAttribute('aria-checked', 'true');
      await expect(options.nth(3)).toBeDisabled();
      await expect(options.nth(3)).toHaveAttribute('aria-checked', 'false');
      await alert.screenshot({ path: testInfo.outputPath('checkbox.png') });
      await alert.evaluate((element) => element.classList.add('md3-disabled'));
      await expect(icon).toHaveCSS('width', '16px');
    });
  }

  for (const type of ['input', 'textarea'] as const) {
    test(`${appearance}: ${type} focus and editing`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 412, height: 915 });
      await page.addInitScript(() => ((window as Window & { IONIC_E2E_TESTING?: boolean }).IONIC_E2E_TESTING = true));
      await page.goto(`/main/index/alert?type=${type}`);
      await page
        .locator('html')
        .evaluate((root, appearance) => root.classList.toggle('ion-palette-dark', appearance === 'dark'), appearance);
      const alert = page.locator('ion-alert');
      const input = alert.locator('.alert-input');
      await expect(input).toBeVisible();
      await expect(input).toHaveCSS('font-size', '18px');
      await expect(alert.locator('.alert-input-group')).toHaveCSS('padding-top', '0px');
      await alert.evaluate((element) => element.style.setProperty('--md-sys-color-primary', '#675080'));
      await input.focus();
      await expect(input).toHaveCSS('border-bottom-color', 'rgb(103, 80, 128)');
      await expect(input).toHaveCSS('border-bottom-width', '2px');
      await expect(input).toHaveCSS('outline-style', 'none');
      await input.fill(type === 'input' ? 'New device name' : 'First line\nSecond line');
      await expect(input).toHaveValue(type === 'input' ? 'New device name' : 'First line\nSecond line');
      await alert.screenshot({ path: testInfo.outputPath(`${type}.png`) });
      await alert.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(alert).toHaveCount(0);
    });
  }
}

for (const mode of ['md', 'ios'] as const) {
  test(`${mode}: input styling respects opt-out and mode`, async ({ page }) => {
    await page.goto('/main/index/alert');
    await page.evaluate(async (mode) => {
      const alert = document.createElement('ion-alert');
      alert.mode = mode;
      if (mode === 'md') alert.classList.add('md3-disabled');
      alert.header = 'Input';
      alert.inputs = [{ type: 'text', value: 'Test' }];
      alert.buttons = ['OK'];
      document.body.append(alert);
      await alert.present();
    }, mode);
    await expect(page.locator('ion-alert .alert-input')).not.toHaveCSS('font-size', '18px');
  });
}
