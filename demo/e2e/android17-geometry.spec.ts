import { expect, test } from '@playwright/test';
import { mockDeviceColors, expectDeviceColors } from './device-colors';
import { arrowBackSharp } from 'ionicons/icons';

test('CSS font default respects Ionic application overrides and iOS mode', async ({ page }) => {
  await page.goto('/main/index/item-list');
  const title = page.locator('app-item-list > ion-header ion-title');
  await expect(title).toHaveCSS('font-family', '"MD3 Settings", Roboto, "Helvetica Neue", sans-serif');
  await page.addStyleTag({ content: ':root { --ion-font-family: monospace; }' });
  await expect(title).toHaveCSS('font-family', 'monospace');
  await title.evaluate((element) => (element as HTMLElement).style.setProperty('font-family', 'serif'));
  await expect(title).toHaveCSS('font-family', 'serif');
  await page.evaluate(() => {
    document.documentElement.classList.replace('md', 'ios');
  });
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).getPropertyValue('--ion-default-font'))).not.toContain(
    'MD3 Settings',
  );
});

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: measured Android control geometry and Ionic overrides`, async ({ page }, testInfo) => {
    await mockDeviceColors(page, mode);
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto('/main/index/toggle');
    await expectDeviceColors(page, mode);
    const toggle = page.locator('app-toggle ion-toggle').nth(2);
    const track = toggle.locator('[part~="track"]');
    const handle = toggle.locator('[part~="handle"]');
    await expect(track).toHaveCSS('width', '52px');
    await expect(track).toHaveCSS('height', '28px');
    await expect(handle).toHaveCSS('width', '20px');
    await expect(handle).toHaveCSS('height', '20px');
    await expect(handle.locator('ion-icon')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`toggle-${mode}.png`), fullPage: true });
    await toggle.evaluate((element) => (element as HTMLElement).style.setProperty('--handle-width', '18px'));
    await expect(handle).toHaveCSS('width', '18px');
    await toggle.evaluate((element) => element.classList.add('md3-disabled'));
    await expect(track).not.toHaveCSS('height', '28px');

    await page.goto('/main/index/item-list');
    const title = page.locator('app-item-list > ion-header ion-title');
    await expect(title).toHaveCSS('font-size', '22px');
    await expect(title).toHaveCSS('padding-inline-start', '12px');
    const back = page.locator('app-item-list > ion-header ion-back-button');
    await expect(back.locator('ion-icon')).toHaveJSProperty('icon', arrowBackSharp);
    await expect(back.locator('ion-icon svg')).toBeVisible();
    await back.evaluate((element) => ((element as HTMLIonBackButtonElement).icon = 'close'));
    await expect(back.locator('ion-icon')).toHaveJSProperty('icon', 'close');
    const list = page
      .locator('app-item-list ion-list')
      .filter({ has: page.locator('ion-list-header') })
      .first();
    await expect(list).toHaveCSS('padding-top', '0px');
    await expect(list.locator('ion-list-header')).toHaveCSS('min-height', '56px');
    const item = list.locator('ion-item').first();
    await expect(item).toHaveCSS('height', '56px');
    await item.evaluate((element) => (element as HTMLElement).style.setProperty('--min-height', '80px'));
    await expect(item).toHaveCSS('height', '80px');

    await page.goto('/main/index/radio');
    const radio = page.locator('app-radio ion-radio').first();
    await expect(radio.locator('[part~="container"]')).toHaveCSS('width', '20px');
    await expect(radio.locator('..')).toHaveCSS('height', '72px');

    await page.goto('/main/index/range');
    const range = page.locator('app-range ion-range').first();
    await expect(range.locator('[part~="bar"]')).toHaveCSS('height', '16px');
    await expect(range.locator('[part~="knob"]').first()).toHaveCSS('width', '4px');
    await expect(range.locator('[part~="knob"]').first()).toHaveCSS('height', '44px');
  });
}
