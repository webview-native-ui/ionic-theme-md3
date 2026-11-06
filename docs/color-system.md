# Color system

The theme works with Ionic's standard color palette alone. It does not require
JavaScript, a Capacitor plugin, or a complete Material scheme. Additional Material
color roles are optional refinements of the same component design.

## Ionic-only defaults

Import the usual Ionic styles and this theme. Define the standard Ionic named
colors (including contrast), background, and text colors as usual. Both light and
dark palettes use the same rules; there is no separate hardcoded MD3 palette.

The theme's CSS derives missing component colors at the point of use:

| Role                                               | Fallback from Ionic                                    |
| -------------------------------------------------- | ------------------------------------------------------ |
| primary / secondary / tertiary / error             | matching named color; error uses danger                |
| on-primary / on-secondary / on-tertiary / on-error | matching named color's contrast                        |
| surface / on-surface                               | background / text                                      |
| each accent or error container                     | 12% accent + 88% surface                               |
| each on-container                                  | on-surface                                             |
| surface-container-lowest                           | surface                                                |
| surface-container-low / container / high / highest | 4% / 6% / 8% / 12% on-surface mixed into surface       |
| surface-dim / surface-variant                      | 12% on-surface mixed into surface                      |
| surface-bright                                     | surface with dark OKLab lightness raised by up to 0.12 |
| on-surface-variant                                 | 80% on-surface + 20% surface                           |
| outline / outline-variant                          | 55% / 20% on-surface mixed into surface                |
| inverse-surface / inverse-on-surface               | text / background                                      |
| inverse-primary                                    | 55% primary + 45% surface                              |

These are deterministic theme fallbacks, not a reconstruction of Material's HCT
tonal palette. `color-mix(in srgb, ...)` computes them in CSS, including after
local Ionic variable changes, without JavaScript color calculations. Supply a
readable Ionic background/text pair and appropriate contrast colors as usual;
custom palettes remain the application's responsibility.

Defaults are consumed locally rather than defined as root aliases. A section
that overrides `--ion-color-secondary`, for example, also changes its tonal
buttons while retaining the rest of the theme.

## Optional roles

Override only the roles you need, on the root or a local container:

```css
.my-section {
  --md-sys-color-secondary-container: #d8e2ff;
  --md-sys-color-on-secondary-container: #001a41;
}

.ion-palette-dark .my-section {
  --md-sys-color-secondary-container: #243e68;
  --md-sys-color-on-secondary-container: #d8e2ff;
}
```

Provide foreground/background role pairs together when changing a pair. Omitted
roles still follow Ionic. No separate registration or complete scheme is needed.

Material You is one optional provider of these values. See
[dynamic colors](dynamic-colors.md) for native acquisition and appearance control.
The provider preserves Material's `on*` roles for MD3 components; Ionic named
colors still use Ionic's official contrast/shade/tint calculations. The native
API also exposes optional fixed/inverse roles for custom component designs.

For your own Sass components, import `utils/colors` from the package's exported
`src/styles` path and use `color(secondary-container)` under that module's
namespace. The function emits an optional role plus the same Ionic fallback.
It supports the roles in the table above and fails the Sass build on unknown
roles. For plain CSS custom components, use the same `var(--md-sys-color-..., ...)`
pattern with an Ionic fallback.

## Component assignments

| Component / variant                          | Background                                                                      | Foreground / detail                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| filled button                                | primary                                                                         | on-primary                                                 |
| tonal button (`md3-tonal`, solid fill)       | secondary-container                                                             | on-secondary-container                                     |
| elevated button (`md3-elevated`, solid fill) | surface-container-low                                                           | primary                                                    |
| outlined / text button                       | transparent                                                                     | primary; outline border for outlined                       |
| card (default elevated)                      | surface-container-low                                                           | on-surface; on-surface-variant subtitle                    |
| filled card (`md3-filled`)                   | surface-container-highest                                                       | on-surface                                                 |
| outlined card (`md3-outlined`)               | surface                                                                         | on-surface; outline-variant border                         |
| FAB                                          | primary-container                                                               | on-primary-container                                       |
| chip / selected chip (`md3-selected`)        | surface-container-low / secondary-container                                     | on-surface-variant / on-secondary-container                |
| content / toolbar                            | surface-container                                                               | on-surface                                                 |
| ordinary list item                           | surface                                                                         | on-surface                                                 |
| inset list item                              | surface-bright                                                                  | on-surface; transparent 2px gap                            |
| navigation bar                               | surface-container                                                               | on-surface-variant; secondary-container selected indicator |
| primary segment / tab                        | inherited surface                                                               | primary selected; on-surface-variant unselected            |
| search field                                 | surface-container-high                                                          | on-surface; on-surface-variant icon/placeholder            |
| switch, checkbox, radio, progress, slider    | neutral surface or secondary-container when off/inactive; primary when selected | matching on-primary, outline, or on-surface-variant        |
| text input                                   | surface-container-highest for solid fill                                        | on-surface; primary focus; error invalid state             |
| modal / popover / action sheet               | surface-container-low                                                           | on-surface                                                 |
| alert / loading / datetime / picker          | surface-container-high                                                          | on-surface; primary actions                                |
| snackbar/toast                               | inverse-surface                                                                 | inverse-on-surface; inverse-primary actions                |

The existing Ionic `color="..."` remains an explicit palette selection. These
MD3 defaults do not replace it. `md3-disabled` opts an individual component out
of MD3 styling. Existing per-component CSS variables can still override the
chosen role through the normal cascade. Variant classes affect appearance only;
`md3-selected` does not implement selection behavior or accessibility state.

```html
<ion-button class="md3-tonal" fill="solid">Tonal action</ion-button>
<ion-card class="md3-filled">Filled card</ion-card>
<ion-button color="danger">Explicit Ionic danger palette</ion-button>
```

The demo's Color palette page compares the Ionic-only result with locally
supplied additional roles. Browser tests check both appearances, local Ionic
changes, optional-role removal, explicit colors, opt-outs, and a document with
application JavaScript disabled.

Android 16 Settings is the visual reference; Material guidelines supply supporting
information. Settings pages use `surface-container`, inset rows use `surface-bright`,
and groups have 20px outer corners with 2px page-colored gaps. The CSS-only bright
surface fallback uses relative OKLab color, preserving local Ionic background overrides
in both modes. Older WebViews without relative color support retain the base surface.
Native optional roles replace this approximation directly in either case.

Icon-only toolbar back buttons have a 40px tonal circle within a 56px touch target.
An explicitly colored toolbar uses a transparent back-button background and Ionic's
contrast foreground; override `--md3-back-background` to customize that paint.
Switch thumbs retain their 24px size. CSS-only installation retains Ionic's normal
thumb and its `enableOnOffLabels` API. Optional cross/check icons are described below.
Component `md3-disabled` and explicit Ionic colors remain available.

## Optional switch state icons

To add Android Settings cross/check icons to a toggle, install the optional helper
once for that element and remove it during component teardown:

```ts
import { applyToggleStateIcons } from '@rdlabo/ionic-theme-md3/toggle-state-icons';

const toggle = document.querySelector<HTMLElement>('ion-toggle')!;
const removeIcons = await applyToggleStateIcons(toggle);

// Call during component teardown, before releasing the element.
removeIcons();
```

Call after creating/connecting the toggle. The helper waits for Ionic's custom element
registration and, when available, `componentOnReady()`. For custom-element builds
without that method, wait for the toggle's Shadow DOM to render before calling it.
In Angular, call from `afterNextRender` and attach the returned cleanup to `DestroyRef`;
if the component was destroyed while awaiting setup, call the cleanup immediately.

The helper adds one style element to the public `handle` Part's Shadow DOM. It does
not observe the document or intercept component properties. Icons appear only while
the handle is empty: Ionic's own labels take priority when `enableOnOffLabels` is
set through either an attribute or a framework/property binding, including later
changes. `md3-disabled` and iOS mode suppress the enhancement. The demo's optional
`md3StateIcons` directive is an example wrapper, not a globally registered Ionic API.

The theme's colors and geometry work without this helper or a Capacitor plugin.
For a range on an arbitrary HTML surface, set `--md3-range-gap-color` to that surface
color; standard Ionic containers supply their background automatically.
