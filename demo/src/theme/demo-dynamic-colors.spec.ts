import { beforeEach, expect, it, vi } from 'vitest';

const palette = {
  primary: '#6750a4',
  secondary: '#625b71',
  tertiary: '#7d5260',
  error: '#b3261e',
  surface: '#fffbfe',
  onSurface: '#1c1b1f',
};
const native = vi.hoisted(() => ({ getPlatform: vi.fn(), getScheme: vi.fn(), addListener: vi.fn() }));
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: native.getPlatform },
  registerPlugin: () => ({ getDynamicColorScheme: native.getScheme, addListener: native.addListener }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  native.getPlatform.mockReturnValue('android');
  native.getScheme.mockResolvedValue({ available: true, systemDark: false, light: palette, dark: { ...palette, primary: '#d0bcff' } });
  native.addListener.mockResolvedValue({ remove: async () => {} });
  document.documentElement.removeAttribute('style');
  document.documentElement.className = '';
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});

it('restores standard colors without changing dark mode, then reapplies the selected palette', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const { startDynamicColors, applyDemoThemeSettings } = await import('./dynamic-colors');
  const root = document.documentElement;
  root.style.setProperty('--ion-color-primary', '#123456');
  await startDynamicColors();
  expect((await import('./dynamic-colors')).demoMaterialYouAvailable()).toBe(true);
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#6750a4');
  await applyDemoThemeSettings({ materialYou: true, darkMode: true });
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#d0bcff');
  await applyDemoThemeSettings({ materialYou: false, darkMode: true });
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#123456');
  expect(root.style.getPropertyValue('--md-sys-color-primary')).toBe('');
  expect(root.classList.contains('ion-palette-dark')).toBe(true);
  await applyDemoThemeSettings({ materialYou: true, darkMode: true });
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#d0bcff');
  await applyDemoThemeSettings({ materialYou: true, darkMode: false });
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#6750a4');
  vi.unstubAllGlobals();
});

it.each(['web', 'ios', 'unsupported-android', 'missing-native-api'])(
  'disables Material You and keeps dark mode working on %s',
  async (environment) => {
    if (environment === 'web' || environment === 'ios') native.getPlatform.mockReturnValue(environment);
    if (environment === 'unsupported-android') native.getScheme.mockResolvedValue({ available: false, systemDark: false });
    if (environment === 'missing-native-api') {
      native.getScheme.mockRejectedValue(new Error('UNIMPLEMENTED'));
      native.addListener.mockRejectedValue(new Error('UNIMPLEMENTED'));
    }
    const { startDynamicColors, applyDemoThemeSettings, demoMaterialYouAvailable, demoThemeSettings } = await import('./dynamic-colors');
    await startDynamicColors();
    expect(demoMaterialYouAvailable()).toBe(false);
    expect(demoThemeSettings().materialYou).toBe(false);
    await applyDemoThemeSettings({ materialYou: false, darkMode: true });
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
    if (environment === 'web' || environment === 'ios') expect(native.getScheme).not.toHaveBeenCalled();
  },
);
