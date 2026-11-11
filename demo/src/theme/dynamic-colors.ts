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
export const demoColorMode = signal<ColorMode>('light');
export const demoMaterialYou = signal(true);
export const startDynamicColors = async (): Promise<void> => {
  theme = await enableDynamicColors({
    mode: demoColorMode(),
    getScheme: async () => {
      if (!demoMaterialYou()) {
        return { available: false, systemDark: matchMedia('(prefers-color-scheme: dark)').matches };
      }
      const scheme =
        Capacitor.getPlatform() === 'android'
          ? await native.getDynamicColorScheme()
          : { available: false as const, systemDark: matchMedia('(prefers-color-scheme: dark)').matches };
      return demoMaterialYou() ? scheme : { available: false, systemDark: scheme.systemDark };
    },
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

export const setDemoMaterialYou = async (enabled: boolean): Promise<void> => {
  demoMaterialYou.set(enabled);
  await theme?.refresh();
};
