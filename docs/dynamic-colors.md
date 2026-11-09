# Android dynamic colors

Dynamic colors are opt-in. Android 12+ supplies light and dark Material color
schemes; this package converts their roles using the Ionic Docs color generator
algorithms. Older Android, iOS, and Web use the existing Ionic palette and component color defaults.
See [color system](color-system.md): Ionic palettes alone are sufficient; native
Material roles only refine optional CSS tokens.

Import the experimental `getDynamicColorScheme` and `addDynamicColorListener`
APIs from the `@rdlabo/capacitor-native-ui` root entrypoint. No activation of Native
UI projection is needed. The theme conversion helper remains available from
`@rdlabo/ionic-theme-md3/dynamic-colors`.

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
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
palette. Automatic refresh failures reach `onError`; an explicit `theme.refresh()` rejects for the caller to handle.
Initialization errors reject and clean up.
There may be one controller per document. Call `destroy()` on application teardown.

## Mapping

| Material role                                                                     | Ionic token               |
| --------------------------------------------------------------------------------- | ------------------------- |
| primary / secondary / tertiary                                                    | corresponding named color |
| error                                                                             | danger                    |
| surfaceContainerLowest in light / surfaceContainerLow in dark (surface fallback)  | background color          |
| surfaceContainerLow in light / surfaceContainerHighest in dark (surface fallback) | light                     |
| outline (surface/onSurface midpoint fallback)                                     | medium                    |
| onSurface                                                                         | dark                      |
| onSurface                                                                         | text color                |

The native bridge supplies the supported Material color roles for both modes;
the original six fields remain the compatibility inputs and additional roles are
optional in the TypeScript contract. Named colors generate base, RGB, contrast,
contrast RGB, shade and tint. Primary, secondary, tertiary and danger use the
supplied `onPrimary`, `onSecondary`, `onTertiary` and `onError` roles for contrast
and contrast RGB. Missing roles fall back individually to Ionic's black/white
contrast-ratio comparison. Shade/tint generation and the light/medium/dark palettes
retain the Ionic calculation. MD3 components also use the supplied `on*` role when present. Background and text generate separate step-50 through step-950 tokens;
legacy `--ion-color-step-*` aliases are also supplied. Success and warning retain their existing Ionic values. Light, medium, and dark follow the device neutral palette; their RGB, contrast, shade and tint values are generated together. The light base uses surfaceContainerLowest (white), while the dark base uses surfaceContainerLow. Older six-role schemes fall back to surface for background/light and a surface/onSurface midpoint for medium.

Default light surfaces remain white: Content, Menu, Toolbar, TabBar, Card, lists/items and Modal/Popover/Alert/ActionSheet. In dark mode, pages and overlay shells use surfaceContainerLow, while Toolbar, TabBar, Card and lists/items use surfaceContainerHigh. The named light palette uses surfaceContainerHighest in dark mode, preserving the order of page, panel and light-colored surfaces instead of flattening them all to black. These roles resolve at each component so local overrides continue to work. Without optional roles, existing Ionic background variables remain the fallback.

Explicit Material variants (filled/outlined cards and tonal/elevated buttons), search fields, loading indicators and inverse Toast surfaces retain their dedicated roles. Explicit color attributes and md3-disabled continue to take precedence over default component paint.

The supplied native roles also become optional `--md-sys-color-*` tokens used by
MD3 components. Missing optional roles return to local/user overrides or the
Ionic-derived CSS fallback, including when switching modes or refreshing.
An explicit `color="light"`, for example, keeps the Ionic light role while following its generated device-neutral palette.

For conversion without DOM changes, use `materialToIonicColors(scheme)` for
Ionic variables and `materialToMd3Colors(partialRoles)` for optional MD3 tokens.
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

Historical integration measurement (not full-theme acceptance; see [Android 16 review evidence](validation/android16-2026-11-07.md)). Verified on an Android 15 (API 35) emulator: both native schemes match the applied
Ionic tokens; system appearance follows Android; explicit light/dark modes remain
fixed across OS changes. Browser E2E covers the same appearance policy. Unit tests
cover changed palettes, resume/configuration notifications, in-flight invalidation,
unchanged-update suppression, errors, and teardown.

In that historical integration measurement, the expanded 46-role API was verified
on the Android emulator: every native role matched its `--md-sys-color-*` value. Ionic 8 and 9 browser tests cover Ionic-only
fallbacks, optional overrides, explicit color palettes, and per-component opt-outs;
a separate test disables application JavaScript. The
[2026-11-07 screenshot-update CI](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42332891975)
verified 141 tests on each of Ionic 8 and 9, including 84 light/dark screenshots.
See [Ionic color inheritance review](validation/ionic-color-inheritance-2026-11-07.md)
for the latest color-policy correction and its browser-only verification scope.

A local WebView measurement of the expanded API (30 sequential native reads,
1,000 warmed conversion iterations) gave approximately 9 ms median / 21 ms p90
for acquisition and approximately 0.6 ms to convert both schemes into Ionic and
MD3 variables. These are debug-emulator observations, not device-wide performance
guarantees; conversion excludes CSS rendering. Ordinary Ionic-only theming uses
CSS directly and does not execute the conversion or call the bridge.

Physical-device wallpaper replacement remains unverified. A shell-driven preset
change on this emulator restarted the WebView without changing the native color
values, so it could not establish end-to-end wallpaper-change behavior. Test
settings were removed and the original palette was confirmed restored.
