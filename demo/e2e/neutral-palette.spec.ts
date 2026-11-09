import { expect, test } from '@playwright/test';
import { mockDeviceColors, expectDeviceColors } from './device-colors';
import scheme from './fixtures/android17-device-colors.json';

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: white base and named neutral colors preserve their order`, async ({ page }) => {
    await mockDeviceColors(page, mode);
    await page.goto('/main/index/card');
    await expectDeviceColors(page, mode);
    const roles = scheme[mode];
    const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
    const base = rgb(mode === 'light' ? roles.surfaceContainerLowest : roles.surfaceContainerLow);
    const panel = rgb(mode === 'light' ? roles.surfaceContainerLowest : roles.surfaceContainerHigh);
    const light = mode === 'light' ? roles.surfaceContainerLow : roles.surfaceContainerHighest;
    await expect(page.locator('ion-tab-bar').first()).toHaveCSS('background-color', panel);
    await expect(page.locator('app-card ion-card:not(.ion-color)').first()).toHaveCSS('background-color', panel);
    for (const [name, value] of Object.entries({ light, medium: roles.outline, dark: roles.onSurface })) {
      await expect(page.locator(`app-card ion-card[color=${name}]`)).toHaveCSS('background-color', rgb(value));
    }
    await expect(page.locator('app-card ion-content .inner-scroll')).toHaveCSS('background-color', rgb(light));
    await page.locator('app-card ion-content').evaluate((el) => el.removeAttribute('color'));
    await expect(page.locator('app-card ion-content #background-content')).toHaveCSS('background-color', base);
    const ordered = [
      mode === 'light' ? roles.surfaceContainerLowest : roles.surfaceContainerLow,
      mode === 'light' ? roles.surfaceContainerLowest : roles.surfaceContainerHigh,
      light,
      roles.outline,
      roles.onSurface,
    ].map((hex) => {
      const c = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
      return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
    });
    expect(ordered).toEqual([...ordered].sort((a, b) => (mode === 'light' ? b - a : a - b)));
    await page.screenshot({ path: `/tmp/md3-neutral-${mode}.png` });
  });
}

for (const mode of ['light', 'dark'] as const) {
  for (const [route, selector] of [
    ['alert?type=preferred', 'ion-alert .alert-wrapper'],
    ['action-sheet?type=all', 'ion-action-sheet .action-sheet-container'],
    ['select?type=popover', 'ion-popover [part~=content]'],
    ['modal?type=normal', 'ion-modal.show-modal [part~=content][role=dialog]'],
  ]) {
    test(`${mode}: ${route} preserves the default overlay surface`, async ({ page }) => {
      await mockDeviceColors(page, mode);
      await page.goto('/main/index/' + (route.startsWith('modal') ? 'modal' : route));
      if (route.startsWith('modal'))
        await page
          .locator('app-modal ion-item')
          .filter({ hasText: /^present:normal$/ })
          .click();
      await expectDeviceColors(page, mode);
      const surface = page.locator(selector).last();
      await expect(surface).toBeVisible();
      const hex = mode === 'light' ? scheme.light.surfaceContainerLowest : scheme.dark.surfaceContainerLow;
      const paint = `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
      await expect(surface).toHaveCSS('background-color', paint);
      if (route.startsWith('select')) {
        await expect(page.locator('ion-alert')).toHaveCount(0);
        await expect(page.locator('ion-popover ion-list')).toHaveCSS('background-color', paint);
        await expect(page.locator('ion-popover ion-item [part~=native]').last()).toHaveCSS('background-color', paint);
      }
    });
  }
}

test('dark device search fields remain distinct from toolbar panels', async ({ page }) => {
  await mockDeviceColors(page, 'dark');
  await page.goto('/main/index/searchbar');
  await expectDeviceColors(page, 'dark');
  const searchbars = page.locator('app-searchbar ion-toolbar:not(.ion-color) ion-searchbar');
  await expect(searchbars.first()).toBeVisible();
  const fields = searchbars.locator('.searchbar-input');
  await expect(fields).toHaveCount(await searchbars.count());
  const rgb = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
  for (const field of await fields.all()) {
    await expect(field).toHaveCSS('background-color', rgb(scheme.dark.surfaceContainerHighest));
    const toolbarBackground = await field.evaluate(
      (el) => getComputedStyle(el.closest('ion-toolbar')!.shadowRoot!.querySelector('.toolbar-background')!).backgroundColor,
    );
    expect(await field.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(toolbarBackground);
  }
});
