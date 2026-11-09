import { signal } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { enableDynamicColors, type ColorMode, type DynamicColorScheme, type DynamicColorTheme } from '../../../src/dynamic-colors';

// The demo adapter keeps browser builds independent of the installed plugin exports.
// Android needs a native build with the getter (plugin 2.1.3+); apps should use the public root exports.
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
