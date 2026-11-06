# Color system

The theme works with Ionic's standard color palette alone. It does not require
JavaScript, a Capacitor plugin, or a complete Material scheme. Additional Material
color roles are optional refinements of the same component design.

## Ionic-only defaults

Import the usual Ionic styles and this theme. Define the standard Ionic named
colors (including contrast), background, and text colors as usual. Both light and
dark palettes use the same rules; there is no separate hardcoded MD3 palette.

The theme's CSS derives missing component colors at the point of use:

| Role                                               | Fallback from Ionic                               |
| -------------------------------------------------- | ------------------------------------------------- |
| primary / secondary / tertiary / error             | matching named color; error uses danger           |
| on-primary / on-secondary / on-tertiary / on-error | matching named color's contrast                   |
| surface / on-surface                               | background / text                                 |
| each accent or error container                     | 12% accent + 88% surface                          |
| each on-container                                  | on-surface                                        |
| surface-container-lowest                           | surface                                           |
| surface-container-low / container / high / highest | 4% / 6% / 8% / 12% on-surface mixed into surface  |
| surface-bright / surface-dim / surface-variant     | surface / 12% / 12% on-surface mixed into surface |
| on-surface-variant                                 | 80% on-surface + 20% surface                      |
| outline / outline-variant                          | 55% / 20% on-surface mixed into surface           |
| inverse-surface / inverse-on-surface               | text / background                                 |
| inverse-primary                                    | 55% primary + 45% surface                         |

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
| content / toolbar / ordinary list item       | surface                                                                         | on-surface                                                 |
| inset list item                              | surface-container-low                                                           | on-surface; outline-variant separator                      |
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
