# Android dynamic colors

Dynamic colors are opt-in. Android 12+ supplies light and dark Material color
schemes; this package converts their roles using the Ionic Docs color generator
algorithms. Older Android, iOS, and Web retain the application's standard palette.

Use a capacitor-plugin build exposing `getDynamicColorScheme` and
`addDynamicColorListener` (these APIs are introduced alongside this feature).
The `dynamic-colors` entrypoints avoid importing Native UI projection or Ionic
transitions. No activation of Native UI projection is needed.

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui/dynamic-colors';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// These switches use the cached palettes without a native call.
theme.setMode('dark');
theme.setMode('light');
theme.setMode('system');

await theme.refresh(); // Optional explicit wallpaper/palette refresh.
await theme.destroy(); // Unsubscribe and restore original root properties/class.
```

Import `@ionic/core/css/palettes/dark.class.css` (or the Ionic Angular equivalent)
in your global stylesheet. Do not also import `dark.system.css` or
`dark.always.css`: this controller owns the `ion-palette-dark` class on
`document.documentElement` and the root `color-scheme` property. Keep global
palette overrides on that root; variables on body or individual components
can shadow inherited root values.

- `system` (default): follows the device's appearance.
- `light`: stays light even when the device switches to dark.
- `dark`: stays dark even when the device switches to light.

Native resume/configuration events, document resume/visibility, and browser
appearance changes trigger refresh. Concurrent requests share a bridge read.
Both schemes are fetched together; unchanged palettes skip conversion and
unchanged properties skip CSS writes. Refresh errors preserve the last working
palette and reach `onError`; initialization errors reject and clean up.
There may be one controller per document. Call `destroy()` on application teardown.

## Mapping

| Material role                  | Ionic token               |
| ------------------------------ | ------------------------- |
| primary / secondary / tertiary | corresponding named color |
| error                          | danger                    |
| surface                        | background color          |
| onSurface                      | text color                |

Named colors generate base, RGB, contrast, contrast RGB, shade and tint. Contrast
uses Ionic's black/white contrast-ratio comparison, rather than Material's `on*`
roles. Background and text generate separate step-50 through step-950 tokens;
legacy `--ion-color-step-*` aliases are also supplied. Success, warning, light,
medium, dark, and component-specific surface tokens retain their existing values.
An explicit `color="light"`, for example, continues using that Ionic palette.

For conversion without DOM changes, use `materialToIonicColors(scheme)`.
Inputs are opaque `#RRGGBB` strings. No runtime color-library dependency is used.
Algorithm attribution and the upstream license are in `THIRD_PARTY_NOTICES.md`.

## Demo and checks

The demo includes System / Light / Dark controls and imports `dark.class.css`.
Browser builds use the published plugin dependency and a small typed bridge
adapter, so they do not depend on unreleased JavaScript exports. To verify Android
before the companion plugin release, build the sibling capacitor-plugin checkout,
install that local build in the demo, run Capacitor sync, and build Android.
Applications using the published plugin need a release containing the new APIs.

Run `npm run test:dynamic-colors` after installing the demo's dependencies.
Reference fixtures were generated using the unmodified Ionic Docs `Color` class
at commit `019986b8ef86f7ad235ceefa34e3ac40e617b0ba`.

## Validation notes

Verified on an Android 15 (API 35) emulator: both native schemes match the applied
Ionic tokens; system appearance follows Android; explicit light/dark modes remain
fixed across OS changes. Browser E2E covers the same appearance policy. Unit tests
cover changed palettes, resume/configuration notifications, in-flight invalidation,
unchanged-update suppression, errors, and teardown.

A local WebView measurement (30 sequential native reads, 1,000 warmed conversion
iterations) gave a native-read median of approximately 2.3 ms, p90 of 6.2 ms, and
approximately 0.09 ms to convert both schemes. These are emulator observations,
not device-wide performance guarantees; conversion timing excludes CSS rendering.

Physical-device wallpaper replacement remains unverified. A shell-driven preset
change on this emulator restarted the WebView without changing the native color
values, so it could not establish end-to-end wallpaper-change behavior. Test
settings were removed and the original palette was confirmed restored.
