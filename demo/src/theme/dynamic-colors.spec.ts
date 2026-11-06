import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  enableDynamicColors,
  materialToIonicColors,
  materialToMd3Colors,
  type DynamicColorScheme,
  type DynamicColorTheme,
} from '../../../src/dynamic-colors';
import fixtures from './ionic-color-fixtures.json';

const light = { primary: '#6750a4', secondary: '#625b71', tertiary: '#7d5260', error: '#b3261e', surface: '#fffbfe', onSurface: '#1c1b1f' };
const dark = { primary: '#d0bcff', secondary: '#ccc2dc', tertiary: '#efb8c8', error: '#f2b8b5', surface: '#1c1b1f', onSurface: '#e6e1e5' };
const available = (systemDark = false): DynamicColorScheme => ({ available: true, systemDark, light, dark });
let theme: DynamicColorTheme | undefined;
afterEach(async () => {
  await theme?.destroy();
  theme = undefined;
  document.documentElement.removeAttribute('style');
  document.documentElement.className = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Ionic Docs reference fixtures (019986b8)', () => {
  // Generated with the original Color class, not this implementation.
  for (const fixture of fixtures) {
    it(`matches official color and both stepped generators for ${fixture.value}`, () => {
      const result = materialToIonicColors({ ...light, primary: fixture.value, surface: fixture.value, onSurface: '#123456' });
      expect(result['--ion-color-primary']).toBe(fixture.value);
      expect(result['--ion-color-primary-rgb']).toBe(fixture.rgb);
      expect(result['--ion-color-primary-contrast']).toBe(fixture.contrast);
      expect(result['--ion-color-primary-contrast-rgb']).toBe(fixture.contrastRgb);
      expect(result['--ion-color-primary-shade']).toBe(fixture.shade);
      expect(result['--ion-color-primary-tint']).toBe(fixture.tint);
      fixture.backgroundSteps.forEach((value, i) => {
        expect(result[`--ion-background-color-step-${(i + 1) * 50}`]).toBe(value);
        expect(result[`--ion-color-step-${(i + 1) * 50}`]).toBe(value);
        expect(result[`--ion-text-color-step-${(i + 1) * 50}`]).toBe(fixture.textSteps[i]);
      });
      expect(result['--ion-color-danger']).toBe(light.error);
      expect(result['--ion-color-success']).toBeUndefined();
      expect(result['--ion-color-warning']).toBeUndefined();
    });
  }
  it('rejects malformed native colors', () => {
    expect(() => materialToIonicColors({ ...light, primary: 'red' })).toThrow(TypeError);
  });
});

describe('dynamic theme lifecycle', () => {
  it('switches cached light/dark schemes without native calls and follows system only in system mode', async () => {
    let snapshot = available();
    const getScheme = vi.fn(async () => snapshot);
    theme = await enableDynamicColors({ getScheme });
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ion-color-primary')).toBe(light.primary);
    theme.setMode('dark');
    expect(root.classList.contains('ion-palette-dark')).toBe(true);
    expect(root.style.colorScheme).toBe('dark');
    expect(root.style.getPropertyValue('--ion-color-primary')).toBe(dark.primary);
    theme.setMode('light');
    snapshot = available(true);
    await theme.refresh();
    expect(root.classList.contains('ion-palette-dark')).toBe(false);
    theme.setMode('system');
    expect(root.classList.contains('ion-palette-dark')).toBe(true);
    expect(getScheme).toHaveBeenCalledTimes(2);
  });
  it('coalesces bridge reads, skips unchanged CSS writes, and updates wallpaper colors', async () => {
    let snapshot = available();
    const getScheme = vi.fn(async () => snapshot);
    theme = await enableDynamicColors({ getScheme });
    const write = vi.spyOn(document.documentElement.style, 'setProperty');
    await Promise.all([theme.refresh(), theme.refresh()]);
    expect(getScheme).toHaveBeenCalledTimes(2);
    expect(write).not.toHaveBeenCalled();
    snapshot = { ...available(), available: true, systemDark: false, light: { ...light, primary: '#112233' }, dark };
    await theme.refresh();
    expect(document.documentElement.style.getPropertyValue('--ion-color-primary')).toBe('#112233');
  });
  it('restores original inline values, priorities and dark class; removes subscriptions', async () => {
    const root = document.documentElement;
    root.style.setProperty('--ion-color-primary', '#abcdef');
    // jsdom drops priorities on custom properties; verify priority restoration on color-scheme.
    root.style.setProperty('color-scheme', 'light dark', 'important');
    root.classList.add('ion-palette-dark');
    const remove = vi.fn(async () => {});
    theme = await enableDynamicColors({ getScheme: async () => available(), listen: async () => ({ remove }) });
    await theme.destroy();
    await theme.destroy();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#abcdef');
    expect(root.style.getPropertyPriority('color-scheme')).toBe('important');
    expect(root.style.getPropertyValue('color-scheme')).toBe('light dark');
    expect(root.style.getPropertyValue('--ion-text-color')).toBe('');
    expect(root.classList.contains('ion-palette-dark')).toBe(true);
  });
  it('keeps standard palettes on unsupported platforms and restores them if support disappears', async () => {
    let snapshot: DynamicColorScheme = available();
    theme = await enableDynamicColors({ getScheme: async () => snapshot });
    snapshot = { available: false, systemDark: true };
    await theme.refresh();
    expect(document.documentElement.style.getPropertyValue('--ion-color-primary')).toBe('');
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
  });
  it('preserves last working palette on refresh failure and rejects malformed schemes atomically', async () => {
    const getScheme = vi.fn(async () => available());
    theme = await enableDynamicColors({ getScheme });
    getScheme.mockRejectedValueOnce(new Error('bridge failed'));
    await expect(theme.refresh()).rejects.toThrow('bridge failed');
    getScheme.mockResolvedValueOnce({ available: true, systemDark: false, light, dark: { ...dark, primary: 'invalid' } });
    await expect(theme.refresh()).rejects.toThrow(TypeError);
    theme.setMode('dark');
    expect(document.documentElement.style.getPropertyValue('--ion-color-primary')).toBe(dark.primary);
  });
  it('does not reapply after destroy while a native read is in flight', async () => {
    const getScheme = vi.fn(async () => available());
    theme = await enableDynamicColors({ getScheme });
    let finish!: (value: DynamicColorScheme) => void;
    getScheme.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const pending = theme.refresh();
    await Promise.resolve();
    await theme.destroy();
    finish(available(true));
    await pending;
    expect(document.documentElement.style.length).toBe(0);
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);
  });
  it('refreshes on native changes and document resume, then unsubscribes', async () => {
    let notify!: () => void;
    const getScheme = vi.fn(async () => available());
    theme = await enableDynamicColors({
      getScheme,
      listen: async (listener) => {
        notify = listener;
        return { remove: async () => {} };
      },
    });
    notify();
    await theme.refresh();
    document.dispatchEvent(new Event('resume'));
    await theme.refresh();
    expect(getScheme).toHaveBeenCalledTimes(3);
    await theme.destroy();
    document.dispatchEvent(new Event('resume'));
    expect(getScheme).toHaveBeenCalledTimes(3);
  });
  it('releases ownership after initialization fails', async () => {
    await expect(
      enableDynamicColors({
        getScheme: async () => {
          throw new Error('failed');
        },
      }),
    ).rejects.toThrow('failed');
    theme = await enableDynamicColors({ getScheme: async () => available() });
    await expect(enableDynamicColors({ getScheme: async () => available() })).rejects.toThrow('already enabled');
  });
  it('rereads after native invalidation during an in-flight snapshot', async () => {
    let notify!: () => void;
    const getScheme = vi.fn(async () => available());
    theme = await enableDynamicColors({
      getScheme,
      listen: async (listener) => {
        notify = listener;
        return { remove: async () => {} };
      },
    });
    let finish!: (value: DynamicColorScheme) => void;
    getScheme.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const pending = theme.refresh();
    await Promise.resolve();
    getScheme.mockResolvedValueOnce(available(true));
    notify();
    finish(available(false));
    await pending;
    await theme.refresh();
    expect(getScheme).toHaveBeenCalledTimes(3);
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
  });
  it('handles browser appearance events and removes its media listener', async () => {
    const events = new EventTarget();
    const media = {
      matches: false,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: vi.fn(events.removeEventListener.bind(events)),
    };
    vi.stubGlobal('matchMedia', () => media);
    const getScheme = vi.fn(async () => ({ available: false as const, systemDark: media.matches }));
    theme = await enableDynamicColors({ getScheme });
    theme.setMode('light');
    media.matches = true;
    const event = new Event('change');
    Object.defineProperty(event, 'matches', { value: true });
    events.dispatchEvent(event);
    await theme.refresh();
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);
    theme.setMode('system');
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
    await theme.destroy();
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
  it('accepts partial optional roles without inventing missing tokens', () => {
    expect(materialToMd3Colors({ secondaryContainer: '#aabbcc', onSecondaryContainer: '#112233' })).toEqual({
      '--md-sys-color-secondary-container': '#aabbcc',
      '--md-sys-color-on-secondary-container': '#112233',
    });
    expect(() => materialToMd3Colors({ outline: 'invalid' })).toThrow(TypeError);
  });
  it('uses native role pairs while keeping the Ionic generator output intact', async () => {
    theme = await enableDynamicColors({
      getScheme: async () => ({
        available: true,
        systemDark: false,
        light: { ...light, onPrimary: '#ffffee', primaryContainer: '#aabbcc', onPrimaryContainer: '#112233' },
        dark,
      }),
    });
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--md-sys-color-on-primary')).toBe('#ffffee');
    expect(style.getPropertyValue('--ion-color-primary-contrast')).toBe('#ffffff');
    expect(style.getPropertyValue('--md-sys-color-primary-container')).toBe('#aabbcc');
    theme.setMode('dark');
    expect(style.getPropertyValue('--md-sys-color-primary-container')).toBe('');
  });
  it('restores user overrides when optional roles disappear on refresh', async () => {
    const root = document.documentElement;
    root.style.setProperty('--md-sys-color-outline', '#abcdef');
    let snapshot: DynamicColorScheme = {
      available: true,
      systemDark: false,
      light: { ...light, outline: '#112233', secondaryContainer: '#aabbcc' },
      dark,
    };
    theme = await enableDynamicColors({ getScheme: async () => snapshot });
    expect(root.style.getPropertyValue('--md-sys-color-outline')).toBe('#112233');
    snapshot = available();
    await theme.refresh();
    expect(root.style.getPropertyValue('--md-sys-color-outline')).toBe('#abcdef');
    expect(root.style.getPropertyValue('--md-sys-color-secondary-container')).toBe('');
    root.style.setProperty('--md-sys-color-outline', '#fedcba');
    await theme.destroy();
    expect(root.style.getPropertyValue('--md-sys-color-outline')).toBe('#fedcba');
  });
});
