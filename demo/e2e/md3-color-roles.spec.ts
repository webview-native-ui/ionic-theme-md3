import { expect, test, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Sample actual rendered colors, including CSS color-mix(), rather than custom-property text.
const colors = (locator: Locator) =>
  locator.evaluate((element) => {
    const native = element.shadowRoot?.querySelector('[part~="native"]') ?? element;
    const style = getComputedStyle(native);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    const sample = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3);
    };
    return { background: sample(style.backgroundColor), foreground: sample(style.color) };
  });

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: Ionic-only palette, optional pairs, explicit colors and opt-out`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/color-palette');
    await expect(page.getByTestId('palette-tonal')).toBeVisible();
    await expect(page.getByTestId('palette-tonal')).toHaveClass(/hydrated/);
    const ids = [
      'filled',
      'tonal',
      'elevated',
      'card',
      'card-filled',
      'card-outlined',
      'fab',
      'chip-selected',
      'danger',
      'disabled',
      'toolbar-action',
    ];
    const before = Object.fromEntries(await Promise.all(ids.map(async (id) => [id, await colors(page.getByTestId(`palette-${id}`))])));
    expect(before['toolbar-action'].foreground).toEqual(before['filled'].foreground);
    expect(before['tonal'].background).not.toEqual(before['filled'].background);
    expect(before['card-filled'].background).not.toEqual(before['card-outlined'].background);
    expect(before['card'].background).not.toEqual(before['elevated'].background);

    // A local Ionic palette is sufficient, and changes propagate without a JS theme calculation.
    await page.getByTestId('palette-preview').evaluate((element) => {
      (element as HTMLElement).style.setProperty('--ion-color-secondary', '#008040');
      (element as HTMLElement).style.setProperty('--ion-background-color', '#ffffff');
      (element as HTMLElement).style.setProperty('--ion-text-color', '#000000');
    });
    await expect.poll(async () => (await colors(page.getByTestId('palette-tonal'))).background).toEqual([224, 240, 232]);
    await expect.poll(async () => (await colors(page.getByTestId('palette-tonal'))).foreground).toEqual([0, 0, 0]);
    await page.getByTestId('palette-preview').evaluate((element) => (element as HTMLElement).removeAttribute('style'));

    await page.getByTestId('toggle-roles').click();
    await expect
      .poll(async () => (await colors(page.getByTestId('palette-tonal'))).background)
      .toEqual(mode === 'light' ? [216, 226, 255] : [36, 62, 104]);
    await expect
      .poll(async () => (await colors(page.getByTestId('palette-tonal'))).foreground)
      .toEqual(mode === 'light' ? [0, 26, 65] : [216, 226, 255]);
    await expect
      .poll(async () => (await colors(page.getByTestId('palette-filled'))).foreground)
      .toEqual(mode === 'light' ? [255, 255, 255] : [0, 56, 47]);
    expect(await colors(page.getByTestId('palette-danger'))).toEqual(before['danger']);
    expect(await colors(page.getByTestId('palette-disabled'))).toEqual(before['disabled']);
    await expect
      .poll(async () => (await colors(page.getByTestId('palette-card'))).background)
      .toEqual(mode === 'light' ? [241, 244, 255] : [28, 32, 48]);
    await expect
      .poll(async () => (await colors(page.getByTestId('palette-fab'))).background)
      .toEqual(mode === 'light' ? [158, 242, 223] : [0, 80, 70]);
    await page.getByTestId('toggle-roles').click();
    for (const id of ids) await expect.poll(() => colors(page.getByTestId(`palette-${id}`))).toEqual(before[id]);
  });
}

test('the CSS theme works without application JavaScript or a Capacitor plugin', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const css = readFileSync('../dist/css/ionic-theme-md3.css', 'utf8');
    await page.setContent(`<style>${css}</style><style>
      :root { --ion-background-color: #ffffff; --ion-text-color: #000000; --ion-color-secondary: #008040; }
      ion-button { display: block; background: var(--background); color: var(--color); }
      </style><ion-button data-testid="tonal" class="md button-solid md3-tonal">Tonal</ion-button>`);
    expect(await colors(page.getByTestId('tonal'))).toEqual({ background: [224, 240, 232], foreground: [0, 0, 0] });
    // No script, generated scheme, or optional token is present in this document.
    expect(await page.locator('script').count()).toBe(0);
  } finally {
    await context.close();
  }
});

for (const mode of ['light', 'dark'] as const) {
  test(`${mode}: Android Settings surfaces, groups, back button and icon-free switches`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto('/main/index/color-palette');
    const title = page.locator('app-color-palette ion-card-title').first();
    await expect(title).toHaveClass(/hydrated/);
    await title.evaluate((element) => element.setAttribute('color', 'danger'));
    await expect(title).toHaveClass(/ion-color-danger/);
    expect((await colors(title)).foreground).toEqual((await colors(page.getByTestId('palette-danger'))).background);
    await title.evaluate((element) => {
      element.removeAttribute('color');
      (element as HTMLElement).style.setProperty('--color', '#123456');
    });
    await expect.poll(async () => (await colors(title)).foreground).toEqual([18, 52, 86]);

    const back = page.locator('app-color-palette ion-back-button');
    const backStyle = await back.evaluate((element) => {
      const style = getComputedStyle(element.shadowRoot!.querySelector('[part~="native"]')!);
      return { width: style.width, height: style.height, background: style.backgroundImage };
    });
    expect(backStyle).toMatchObject({ width: '56px', height: '56px' });
    expect(backStyle.background).toContain('20px');

    await page.goto('/main/index/item-list');
    const list = page.locator('app-item-list ion-list.list-inset').nth(1);
    await expect(list).toBeVisible();
    expect(await list.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    const group = list.locator('ion-item-group').first();
    expect(await group.evaluate((element) => getComputedStyle(element).borderRadius)).toBe('20px');
    const item = group.locator('ion-item').first();
    await expect(item).toHaveClass(/hydrated/);
    expect(await item.evaluate((element) => getComputedStyle(element).marginBottom)).toBe('2px');
    await list.evaluate((element, mode) => {
      (element as HTMLElement).style.setProperty(
        mode === 'light' ? '--md-sys-color-surface-container-lowest' : '--md-sys-color-surface-container-high',
        mode === 'light' ? '#faf8fe' : '#2a2c34',
      );
    }, mode);
    await expect.poll(async () => (await colors(item)).background).toEqual(mode === 'light' ? [250, 248, 254] : [42, 44, 52]);
    await item.evaluate((element) => element.classList.add('md3-disabled'));
    expect(await item.evaluate((element) => getComputedStyle(element).marginBottom)).toBe('0px');

    await page.goto('/main/index/toggle');
    const toggle = page.locator('app-toggle ion-toggle').first();
    await expect(toggle).toHaveClass(/hydrated/);
    const glyph = () =>
      toggle.evaluate((element) => getComputedStyle(element.shadowRoot!.querySelector('[part~="handle"]')!, '::before').maskImage);
    const offGlyph = await glyph();
    expect(offGlyph).toBe('none');
    await toggle.evaluate((element) => {
      (element as HTMLIonToggleElement).checked = true;
    });
    await expect(toggle).toHaveClass(/toggle-checked/);
    expect(await glyph()).toBe('none');
    await toggle.evaluate((element) => element.classList.add('md3-disabled'));
    expect(await glyph()).toBe('none');
  });
}

test('Ionic-only surfaces preserve local light and dark background colors', async ({ page }) => {
  await page.goto('/main/index/item-list');
  const content = page.locator('app-item-list ion-content');
  await expect(content).toHaveClass(/hydrated/);
  await content.evaluate((element) => element.removeAttribute('color'));
  const row = page.locator('app-item-list ion-item-group ion-item').first();
  for (const dark of [false, true]) {
    await content.evaluate((element, dark) => {
      const style = (element as HTMLElement).style;
      style.setProperty('--ion-background-color', dark ? '#101010' : '#ffffff');
      style.setProperty('--ion-text-color', dark ? '#ffffff' : '#000000');
    }, dark);
    // Content exposes its scroll background through --background; sample that value on a child.
    const pageColor = await content.evaluate((element) => {
      const probe = document.createElement('span');
      probe.style.background = 'var(--background)';
      element.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect.poll(async () => (await colors(row)).background).toEqual([dark ? 16 : 255, dark ? 16 : 255, dark ? 16 : 255]);
    expect(pageColor).not.toBe('rgba(0, 0, 0, 0)');
    // No generated neutral tint when optional Material roles are absent.
    await expect
      .poll(async () => {
        return content.evaluate((element) => {
          const probe = document.createElement('canvas');
          probe.width = probe.height = 1;
          const swatch = document.createElement('span');
          swatch.style.background = 'var(--background)';
          element.append(swatch);
          const ctx = probe.getContext('2d')!;
          ctx.fillStyle = getComputedStyle(swatch).backgroundColor;
          ctx.fillRect(0, 0, 1, 1);
          swatch.remove();
          return ctx.getImageData(0, 0, 1, 1).data[0];
        });
      })
      .toBe(dark ? 16 : 255);
  }
});
