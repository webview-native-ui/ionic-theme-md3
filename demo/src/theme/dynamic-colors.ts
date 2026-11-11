import { signal } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { enableDynamicColors, type DynamicColorScheme, type DynamicColorTheme } from '../../../src/dynamic-colors';

// The demo adapter keeps browser builds independent of the installed plugin exports.
// Android needs a native build with the getter (plugin 2.1.3+); apps should use the public root exports.
const native = registerPlugin<{
  getDynamicColorScheme(): Promise<DynamicColorScheme>;
  addListener(name: 'dynamicColorSchemeChange', listener: () => void): Promise<{ remove(): Promise<void> }>;
}>('NativeUI');
let theme: DynamicColorTheme | undefined;
export const demoThemeSettings = signal({ materialYou: true, darkMode: false });
let materialYou = demoThemeSettings().materialYou;
export const startDynamicColors = async (): Promise<void> => {
  theme = await enableDynamicColors({
    mode: demoThemeSettings().darkMode ? 'dark' : 'light',
    getScheme: async () => {
      if (!materialYou) {
        return { available: false, systemDark: matchMedia('(prefers-color-scheme: dark)').matches };
      }
      const scheme =
        Capacitor.getPlatform() === 'android'
          ? await native.getDynamicColorScheme()
          : { available: false as const, systemDark: matchMedia('(prefers-color-scheme: dark)').matches };
      return materialYou ? scheme : { available: false, systemDark: scheme.systemDark };
    },
    listen: (listener) =>
      Capacitor.getPlatform() === 'android'
        ? native.addListener('dynamicColorSchemeChange', listener)
        : Promise.resolve({ remove: async () => {} }),
  });
};
/** Apply form settings to the imperative theme API. Only palette changes need a native refresh. */
export const applyDemoThemeSettings = async (settings: { materialYou: boolean; darkMode: boolean }): Promise<void> => {
  theme?.setMode(settings.darkMode ? 'dark' : 'light');
  if (materialYou !== settings.materialYou) {
    materialYou = settings.materialYou;
    await theme?.refresh();
  }
};
