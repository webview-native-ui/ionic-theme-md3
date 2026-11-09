import { expect, test } from '@playwright/test';
import { mockDeviceColors, expectDeviceColors } from './device-colors';
import scheme from './fixtures/android17-device-colors.json';

for (const mode of ['light', 'dark'] as const) {
  for (const device of [false, true]) {
    test(`${mode} ${device ? 'device' : 'Ionic'}: select menu owns its surface and respects overrides`, async ({ page }) => {
      if (device) await mockDeviceColors(page, mode);
      else await page.emulateMedia({ colorScheme: mode });
      await page.goto('/main/index/select');
      if (device) await expectDeviceColors(page, mode);
      const normalItem = page.locator('app-select ion-item').first();
      const normalPaint = await normalItem.locator('[part~=native]').evaluate((el) => getComputedStyle(el).backgroundColor);
      await page.locator('app-select .select-popover').click();
      const popover = page.locator('ion-popover:not(.overlay-hidden)');
      await expect(popover).toBeVisible();
      await expect(page.locator('ion-alert')).toHaveCount(0);
      const list = popover.locator('ion-list');
      const item = list.locator('ion-item').last();
      const native = item.locator('[part~=native]');
      const surface = popover.locator('[part~=content]');
      const background = await surface.evaluate((el) => getComputedStyle(el).backgroundColor);
      if (device) {
        const hex = mode === 'light' ? scheme.light.surfaceContainerLowest : scheme.dark.surfaceContainerLow;
        expect(background).toBe(`rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`);
      }
      await expect(list).toHaveCSS('background-color', background);
      await expect(native).toHaveCSS('background-color', background);
      await expect(normalItem.locator('[part~=native]')).toHaveCSS('background-color', normalPaint);

      await popover.evaluate((el) => (el as HTMLElement).style.setProperty('--background', '#123456'));
      await expect(list).toHaveCSS('background-color', 'rgb(18, 52, 86)');
      await expect(native).toHaveCSS('background-color', 'rgb(18, 52, 86)');
      await item.evaluate((el) => el.setAttribute('color', 'danger'));
      const danger = await item.evaluate((el) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--ion-color-danger)';
        el.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      await expect(native).toHaveCSS('background-color', danger);
      await item.evaluate((el) => {
        el.removeAttribute('color');
        (el as HTMLElement).style.setProperty('--background', '#654321');
      });
      await expect(native).toHaveCSS('background-color', 'rgb(101, 67, 33)');
      await item.evaluate((el) => {
        (el as HTMLElement).style.removeProperty('--background');
        el.classList.add('md3-disabled');
      });
      await expect(native).not.toHaveCSS('background-color', 'rgb(18, 52, 86)');
      await item.evaluate((el) => el.classList.remove('md3-disabled'));
      await popover.evaluate((el) => el.classList.add('md3-disabled'));
      await expect(native).not.toHaveCSS('background-color', 'rgb(18, 52, 86)');
    });
  }
}

test('the popover demo deep link opens a popover, not an alert', async ({ page }) => {
  await page.goto('/main/index/select?type=popover');
  await expect(page.locator('ion-popover:not(.overlay-hidden)')).toBeVisible();
  await expect(page.locator('ion-alert')).toHaveCount(0);
});
