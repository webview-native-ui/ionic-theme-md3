import { expect, type Page } from '@playwright/test';
import scheme from './fixtures/android17-device-colors.json';

/** Stub only the Capacitor transport; exercise the demo's real native adapter and theme controller. */
export const mockDeviceColors = async (page: Page, mode: 'light' | 'dark') => {
  await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
  await page.addInitScript(
    ({ scheme, mode }) => {
      let snapshot = { ...scheme, systemDark: mode === 'dark' };
      let notify: (() => void) | undefined;
      let reads = 0;
      const device = {
        get reads() {
          return reads;
        },
        update(next: typeof snapshot) {
          snapshot = next;
          if (!notify) throw new Error('Dynamic-color listener was not registered');
          notify();
        },
      };
      Object.assign(window, {
        // Capacitor uses this to select its native Android implementation in a browser.
        CapacitorCustomPlatform: { name: 'android' },
        __deviceColors: device,
        Capacitor: {
          PluginHeaders: [
            {
              name: 'NativeUI',
              methods: [
                { name: 'getDynamicColorScheme', rtype: 'promise' },
                { name: 'addListener', rtype: 'callback' },
                { name: 'removeListener', rtype: 'promise' },
              ],
            },
          ],
          nativePromise: async (plugin: string, method: string) => {
            if (plugin === 'NativeUI' && method === 'getDynamicColorScheme') {
              reads++;
              return structuredClone(snapshot);
            }
            if (plugin === 'NativeUI' && method === 'removeListener') {
              notify = undefined;
              return;
            }
            throw new Error(`Unexpected native promise: ${plugin}.${method}`);
          },
          nativeCallback: (plugin: string, method: string, options: { eventName: string }, callback: () => void) => {
            if (plugin !== 'NativeUI' || method !== 'addListener' || options.eventName !== 'dynamicColorSchemeChange') {
              throw new Error(`Unexpected native callback: ${plugin}.${method}`);
            }
            notify = callback;
            return 'device-color-listener';
          },
        },
      });
    },
    { scheme, mode },
  );
};

export const expectDeviceColors = async (page: Page, mode: 'light' | 'dark') => {
  const root = page.locator('html');
  await expect
    .poll(() => root.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--ion-color-primary')))
    .toBe(scheme[mode].primary);
  await expect
    .poll(() => root.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--md-sys-color-surface-container')))
    .toBe(scheme[mode].surfaceContainer);
  if (mode === 'dark') await expect(root).toHaveClass(/ion-palette-dark/);
  else await expect(root).not.toHaveClass(/ion-palette-dark/);
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __deviceColors: { reads: number } }).__deviceColors.reads))
    .toBeGreaterThan(0);
};

/** Compare rendered paint against raw bridge roles, independent of the conversion implementation. */
export const expectDeviceColorPairs = async (page: Page, mode: 'light' | 'dark') => {
  const roles = scheme[mode];
  const pairs = [
    ['filled', roles.primary, roles.onPrimary],
    ['tonal', roles.secondaryContainer, roles.onSecondaryContainer],
    ['elevated', roles.surfaceContainerLow, roles.primary],
    ['card', mode === 'light' ? roles.surfaceContainerLowest : roles.surfaceContainerHigh, roles.onSurface],
    ['card-filled', roles.surfaceContainerHighest, roles.onSurface],
    ['card-outlined', roles.surface, roles.onSurface],
    ['fab', roles.primaryContainer, roles.onPrimaryContainer],
    ['chip-selected', roles.secondaryContainer, roles.onSecondaryContainer],
    // Explicit Ionic danger keeps Ionic's contrast choice rather than Material onError.
    ['danger', roles.error, mode === 'light' ? '#ffffff' : '#000000'],
  ];
  const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`;
  for (const [id, background, foreground] of pairs) {
    const locator = page.getByTestId(`palette-${id}`);
    await expect(locator).toHaveClass(/hydrated/);
    await expect
      .poll(() =>
        locator.evaluate((element) => {
          const native = element.shadowRoot?.querySelector('[part~=native]') ?? element;
          const style = getComputedStyle(native);
          return { background: style.backgroundColor, foreground: style.color };
        }),
      )
      .toEqual({ background: rgb(background), foreground: rgb(foreground) });
  }
  await expect(page.getByTestId('palette-search').locator('.searchbar-input')).toHaveCSS(
    'background-color',
    rgb(roles.surfaceContainerHigh),
  );
  await expect(page.getByTestId('palette-search').locator('.searchbar-input')).toHaveCSS('color', rgb(roles.onSurface));
  await expect(page.getByTestId('palette-search').locator('.searchbar-search-icon')).toHaveCSS('color', rgb(roles.onSurfaceVariant));
  await expect(page.locator('app-color-palette ion-content #background-content')).toHaveCSS(
    'background-color',
    rgb(mode === 'light' ? roles.surfaceContainerLowest : roles.surfaceContainerLow),
  );
};

export const expectDeviceToggleColors = async (page: Page, mode: 'light' | 'dark') => {
  const roles = scheme[mode];
  const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`;
  const off = page.locator('app-toggle .section-example ion-toggle').nth(0);
  const on = page.locator('app-toggle .section-example ion-toggle').nth(1);
  await expect(off).toHaveClass(/hydrated/);
  await expect(on).toHaveClass(/toggle-checked/);
  await expect(off.locator('[part=track]')).toHaveCSS('background-color', rgb(roles.surfaceContainerHighest));
  await expect(off.locator('[part=track]')).toHaveCSS('border-top-color', rgb(roles.outline));
  await expect(off.locator('[part=handle]')).toHaveCSS('background-color', rgb(roles.outline));
  await expect(on.locator('[part=track]')).toHaveCSS('background-color', rgb(roles.primary));
  await expect(on.locator('[part=handle]')).toHaveCSS('background-color', rgb(roles.onPrimary));
};

export const sendCompatibilityDeviceColors = async (page: Page, mode: 'light' | 'dark') => {
  // Simulate an older bridge sending only the six required fields after a wallpaper/configuration event.
  const compatibility = (source: typeof scheme.light) => ({
    primary: source.secondary,
    secondary: source.secondary,
    tertiary: source.tertiary,
    error: source.error,
    surface: source.surface,
    onSurface: source.onSurface,
  });
  const next = { available: true, systemDark: mode === 'dark', light: compatibility(scheme.light), dark: compatibility(scheme.dark) };
  await page.evaluate((next) => {
    (window as unknown as { __deviceColors: { update(next: unknown): void } }).__deviceColors.update(next);
  }, next);
  await expect
    .poll(() => page.locator('html').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--ion-color-primary')))
    .toBe(next[mode].primary);
  // Every omitted optional role must be removed, rather than leaving the previous device palette behind.
  await expect
    .poll(() =>
      page.locator('html').evaluate((el) => Array.from((el as HTMLElement).style).filter((name) => name.startsWith('--md-sys-color-'))),
    )
    .toHaveLength(6);
  await expect
    .poll(() => page.locator('html').evaluate((el) => (el as HTMLElement).style.getPropertyValue('--md-sys-color-surface-container')))
    .toBe('');
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __deviceColors: { reads: number } }).__deviceColors.reads))
    .toBeGreaterThan(1);
};

export const expectDeviceAlertFocusColors = async (page: Page, mode: 'light' | 'dark', preferred = false) => {
  const roles = scheme[mode];
  const rgb = (hex: string) => `rgb(${[1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`;
  const button = page.locator(`ion-alert .alert-button-role-${preferred ? 'preferred' : 'destructive'}.ion-focused`);
  await expect(button).toHaveCSS('background-color', rgb(preferred ? roles.primary : roles.error));
  await expect(button).toHaveCSS('color', rgb(preferred ? roles.onPrimary : roles.onError));
  await expect(button).toHaveCSS('box-shadow', new RegExp('inset'));
};
