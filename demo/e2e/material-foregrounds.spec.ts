import { expect, test } from '@playwright/test';
import { mockDeviceColors, gotoDevicePage, expectDeviceColors, expectDeviceColorPairs } from './device-colors';
import scheme from './fixtures/android17-device-colors.json';

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: explicit Ionic colors render native foreground pairs`, async ({ page }, testInfo) => {
    await mockDeviceColors(page, mode);
    await page.setViewportSize({ width: 800, height: 1000 });
    await gotoDevicePage(page, '/main/index/color-palette', mode);
    await expectDeviceColors(page, mode);
    await expectDeviceColorPairs(page, mode);
    await page.evaluate(() => {
      const section = document.createElement('section');
      section.id = 'native-foreground-pairs';
      section.style.cssText = 'position:fixed;inset:80px 20px auto;z-index:10000;padding:20px;background:var(--ion-background-color)';
      for (const color of ['primary', 'secondary', 'tertiary', 'danger']) {
        const row = document.createElement('div');
        for (const tag of ['ion-button', 'ion-card']) {
          const el = document.createElement(tag);
          el.setAttribute('color', color);
          el.textContent = `${tag}: ${color}`;
          row.append(el);
        }
        section.append(row);
      }
      document.body.append(section);
    });
    const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`;
    for (const [name, base, on] of [
      ['primary', 'primary', 'onPrimary'],
      ['secondary', 'secondary', 'onSecondary'],
      ['tertiary', 'tertiary', 'onTertiary'],
      ['danger', 'error', 'onError'],
    ] as const) {
      for (const tag of ['ion-button', 'ion-card']) {
        const el = page.locator(`#native-foreground-pairs ${tag}[color=${name}]`);
        await expect(el).toHaveClass(/hydrated/);
        await expect
          .poll(() =>
            el.evaluate((el) => {
              const style = getComputedStyle(el.shadowRoot?.querySelector('[part=native]') ?? el);
              return { background: style.backgroundColor, foreground: style.color };
            }),
          )
          .toEqual({ background: rgb(scheme[mode][base]), foreground: rgb(scheme[mode][on]) });
      }
    }
    await page.locator('#native-foreground-pairs').screenshot({ path: testInfo.outputPath(`foreground-pairs-${mode}.png`) });
  });
}
