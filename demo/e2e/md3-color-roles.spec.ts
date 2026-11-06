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
    expect(before['card'].background).toEqual(before['elevated'].background);
    expect(before['tonal'].foreground).toEqual(before['card'].foreground);

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
