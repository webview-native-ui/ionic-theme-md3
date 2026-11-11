import { expect, it, vi } from 'vitest';

const palette = {
  primary: '#6750a4',
  secondary: '#625b71',
  tertiary: '#7d5260',
  error: '#b3261e',
  surface: '#fffbfe',
  onSurface: '#1c1b1f',
};
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => 'android' },
  registerPlugin: () => ({
    getDynamicColorScheme: async () => ({ available: true, systemDark: false, light: palette, dark: { ...palette, primary: '#d0bcff' } }),
    addListener: async () => ({ remove: async () => {} }),
  }),
}));

it('restores standard colors without changing dark mode, then reapplies the selected palette', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  const { startDynamicColors, setDemoColorMode, setDemoMaterialYou } = await import('./dynamic-colors');
  const root = document.documentElement;
  root.style.setProperty('--ion-color-primary', '#123456');
  await startDynamicColors();
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#6750a4');
  setDemoColorMode('dark');
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#d0bcff');
  await setDemoMaterialYou(false);
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#123456');
  expect(root.style.getPropertyValue('--md-sys-color-primary')).toBe('');
  expect(root.classList.contains('ion-palette-dark')).toBe(true);
  await setDemoMaterialYou(true);
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#d0bcff');
  setDemoColorMode('light');
  expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#6750a4');
  vi.unstubAllGlobals();
});
