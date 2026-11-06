/** The six native roles needed to generate Ionic's standard color tokens. */
export interface MaterialColorScheme {
  primary: string;
  secondary: string;
  tertiary: string;
  error: string;
  surface: string;
  onSurface: string;
}
export type DynamicColorScheme =
  | { available: false; systemDark: boolean }
  | { available: true; systemDark: boolean; light: MaterialColorScheme; dark: MaterialColorScheme };
export type ColorMode = 'system' | 'light' | 'dark';
export type IonicColorVariables = Record<string, string>;

type RGB = [number, number, number];
const rgb = (value: string): RGB => {
  if (!/^#[\da-f]{6}$/i.test(value)) throw new TypeError(`Expected #RRGGBB, received ${value}`);
  return [1, 3, 5].map((start) => Number.parseInt(value.slice(start, start + 2), 16)) as RGB;
};
const hex = (value: RGB): string => `#${value.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
const mix = (base: RGB, other: RGB, weight: number): RGB =>
  base.map((channel, i) => Math.round(weight * other[i] + (1 - weight) * channel)) as RGB;
const luminance = (value: RGB): number => {
  const channels = value.map((channel) => {
    const v = channel / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

/** Matches Ionic Docs generateColor and generateSteppedColors (see THIRD_PARTY_NOTICES.md). */
export const materialToIonicColors = (scheme: MaterialColorScheme): IonicColorVariables => {
  const variables: IonicColorVariables = {};
  for (const [name, value] of Object.entries({
    primary: scheme.primary,
    secondary: scheme.secondary,
    tertiary: scheme.tertiary,
    danger: scheme.error,
  })) {
    const base = rgb(value);
    const light = luminance(base);
    const contrast: RGB = (light + 0.05) / 0.05 >= 1.05 / (light + 0.05) ? [0, 0, 0] : [255, 255, 255];
    const prefix = `--ion-color-${name}`;
    variables[prefix] = hex(base);
    variables[`${prefix}-rgb`] = base.join(',');
    variables[`${prefix}-contrast`] = hex(contrast);
    variables[`${prefix}-contrast-rgb`] = contrast.join(',');
    variables[`${prefix}-shade`] = hex(mix(base, [0, 0, 0], 0.12));
    variables[`${prefix}-tint`] = hex(mix(base, [255, 255, 255], 0.1));
  }
  const background = rgb(scheme.surface);
  const text = rgb(scheme.onSurface);
  variables['--ion-background-color'] = hex(background);
  variables['--ion-background-color-rgb'] = background.join(',');
  variables['--ion-text-color'] = hex(text);
  variables['--ion-text-color-rgb'] = text.join(',');
  for (let step = 50; step < 1000; step += 50) {
    const backgroundStep = hex(mix(background, text, step / 1000));
    variables[`--ion-background-color-step-${step}`] = backgroundStep;
    variables[`--ion-text-color-step-${step}`] = hex(mix(text, background, step / 1000));
    variables[`--ion-color-step-${step}`] = backgroundStep;
  }
  return variables;
};

export interface DynamicColorThemeOptions {
  getScheme: () => Promise<DynamicColorScheme>;
  /** Pass capacitor-plugin's addDynamicColorListener to observe native changes. */
  listen?: (listener: () => void) => Promise<{ remove(): Promise<void> }>;
  mode?: ColorMode;
  document?: Document;
  /** Automatic refresh failures preserve the last successfully applied palette. */
  onError?: (error: unknown) => void;
}
export interface DynamicColorTheme {
  setMode(mode: ColorMode): void;
  refresh(): Promise<void>;
  destroy(): Promise<void>;
}
const owners = new WeakSet<Document>();

/** Owns the root dark class and generated inline properties until destroy(). Import dark.class.css. */
export const enableDynamicColors = async (options: DynamicColorThemeOptions): Promise<DynamicColorTheme> => {
  const doc = options.document ?? document;
  if (owners.has(doc)) throw new Error('Dynamic colors already enabled for this document');
  owners.add(doc);
  const root = doc.documentElement;
  const originalDark = root.classList.contains('ion-palette-dark');
  const originals = new Map<string, [string, string]>();
  const applied = new Map<string, string>();
  const media = doc.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  let mode: ColorMode = options.mode ?? 'system';
  let scheme: DynamicColorScheme = { available: false, systemDark: media?.matches ?? false };
  let fingerprint = '';
  const cache = new Map<'light' | 'dark', IonicColorVariables>();
  let disposed = false;
  let pending: Promise<void> | undefined;
  let invalidatedDuringRead = false;
  let subscription: { remove(): Promise<void> } | undefined;
  const write = (name: string, value: string) => {
    if (applied.get(name) === value) return;
    if (!originals.has(name)) originals.set(name, [root.style.getPropertyValue(name), root.style.getPropertyPriority(name)]);
    root.style.setProperty(name, value);
    applied.set(name, value);
  };
  const restoreColors = () => {
    for (const name of applied.keys()) {
      if (name === 'color-scheme') continue;
      const [value, priority] = originals.get(name)!;
      if (value) root.style.setProperty(name, value, priority);
      else root.style.removeProperty(name);
      applied.delete(name);
    }
  };
  const apply = () => {
    if (disposed) return;
    const dark = mode === 'dark' || (mode === 'system' && scheme.systemDark);
    root.classList.toggle('ion-palette-dark', dark);
    write('color-scheme', dark ? 'dark' : 'light');
    if (!scheme.available) {
      restoreColors();
      return;
    }
    const key = dark ? 'dark' : 'light';
    let variables = cache.get(key);
    if (!variables) {
      variables = materialToIonicColors(scheme[key]);
      cache.set(key, variables);
    }
    // Synchronous writes; no computed-style or layout reads between updates.
    for (const [name, value] of Object.entries(variables)) write(name, value);
  };
  const refresh = (): Promise<void> => {
    if (disposed) return Promise.resolve();
    if (pending) return pending;
    pending = Promise.resolve()
      .then(options.getScheme)
      .then((next) => {
        if (disposed) return;
        // Validate both modes before replacing the last working palette.
        const nextFingerprint = next.available ? JSON.stringify([next.light, next.dark]) : '';
        if (nextFingerprint !== fingerprint) {
          const light = next.available ? materialToIonicColors(next.light) : undefined;
          const dark = next.available ? materialToIonicColors(next.dark) : undefined;
          cache.clear();
          if (light && dark) {
            cache.set('light', light);
            cache.set('dark', dark);
          }
          fingerprint = nextFingerprint;
        }
        scheme = next;
        apply();
      })
      .finally(() => {
        pending = undefined;
        if (invalidatedDuringRead && !disposed) {
          invalidatedDuringRead = false;
          automaticRefresh();
        }
      });
    return pending;
  };
  const automaticRefresh = () => {
    // A configuration change may arrive after the in-flight native snapshot was read.
    if (pending) {
      invalidatedDuringRead = true;
      return;
    }
    void refresh().catch(options.onError ?? console.error);
  };
  const visibility = () => {
    if (doc.visibilityState === 'visible') automaticRefresh();
  };
  const mediaChange = (event: MediaQueryListEvent) => {
    scheme = { ...scheme, systemDark: event.matches };
    apply();
    automaticRefresh();
  };
  const destroy = async () => {
    if (disposed) return;
    disposed = true;
    doc.removeEventListener('visibilitychange', visibility);
    doc.removeEventListener('resume', automaticRefresh);
    media?.removeEventListener('change', mediaChange);
    for (const [name, [value, priority]] of originals) {
      if (value) root.style.setProperty(name, value, priority);
      else root.style.removeProperty(name);
    }
    root.classList.toggle('ion-palette-dark', originalDark);
    owners.delete(doc);
    await subscription?.remove();
  };
  try {
    subscription = await options.listen?.(automaticRefresh);
    doc.addEventListener('visibilitychange', visibility);
    doc.addEventListener('resume', automaticRefresh);
    media?.addEventListener('change', mediaChange);
    await refresh();
    return {
      setMode(next) {
        mode = next;
        apply();
      },
      refresh,
      destroy,
    };
  } catch (error) {
    await destroy();
    throw error;
  }
};
