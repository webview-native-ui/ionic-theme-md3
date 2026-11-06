import { signal } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { enableDynamicColors, type ColorMode, type DynamicColorScheme, type DynamicColorTheme } from '../../../src/dynamic-colors';

// Keep browser builds compatible with published plugins while the native API is released.
// Android requires the companion capacitor-plugin PR; use its local build to test it.
const native = registerPlugin<{
  getDynamicColorScheme(): Promise<DynamicColorScheme>;
  addListener(name: 'dynamicColorSchemeChange', listener: () => void): Promise<{ remove(): Promise<void> }>;
}>('NativeUI');
let theme: DynamicColorTheme | undefined;
export const demoColorMode = signal<ColorMode>('system');
export const startDynamicColors = async (): Promise<void> => {
  theme = await enableDynamicColors({
    mode: 'system',
    getScheme: () =>
      Capacitor.getPlatform() === 'android'
        ? native.getDynamicColorScheme()
        : Promise.resolve({ available: false, systemDark: matchMedia('(prefers-color-scheme: dark)').matches }),
    listen: (listener) =>
      Capacitor.getPlatform() === 'android'
        ? native.addListener('dynamicColorSchemeChange', listener)
        : Promise.resolve({ remove: async () => {} }),
  });
};
export const setDemoColorMode = (mode: ColorMode): void => {
  demoColorMode.set(mode);
  theme?.setMode(mode);
};
