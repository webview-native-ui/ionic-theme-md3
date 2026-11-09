# Color system

The theme works with Ionic's standard color palette alone. It does not require
JavaScript, a Capacitor plugin, or a complete Material scheme. Additional Material
color roles are optional refinements of the same component design.

## Ionic-only defaults

Import the usual Ionic styles and this theme. Define the standard Ionic named
colors (including contrast), background, and text colors as usual. Both light and
dark palettes use the same rules; there is no separate hardcoded MD3 palette.

Ordinary components retain Ionic's existing color intent. Content and menu use
`--ion-background-color`; toolbar, card, item, and tab bar retain their dedicated
Ionic background/text variables and their normal fallback chains. No neutral
surface tint is generated for ordinary cards, pages, lists, or overlays.
Explicit `color` attributes and component `--background` / `--color` overrides
remain available. Optional Material roles explicitly refine the underlying Ionic palette.
Component `--background` / `--color` overrides remain the final application control.

Supplying an optional Material role refines only its consumers. Unspecified roles
fall back to the component's Ionic colors; supplying one role does not turn on an
entire generated neutral palette. Light and dark mode use the same mechanism.

Explicit variants (`.md3-tonal`, `.md3-elevated`, `.md3-filled`,
`.md3-outlined`, `.md3-selected`) intentionally request additional color treatments.
Their missing container/outline colors can be derived from the Ionic palette using
CSS color mixing. This derivation belongs to those requested variants, rather than
changing every uncolored component. Accent controls retain Ionic primary/contrast
when optional Material accent/container pairs are absent.

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
It supports the roles defined in `utils/_colors.scss` and fails the Sass build
on unknown roles. Its generated container fallbacks are intended for explicitly
requested variants; ordinary components retain their own Ionic fallback chains. For plain CSS custom components, use the same `var(--md-sys-color-..., ...)`
pattern with an Ionic fallback.

## Component assignments

The table lists optional Material role consumers. If a role is absent, the
component retains the Ionic fallback described above.

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
| content / menu / toolbar                            | surface-container                                                               | on-surface                                                 |
| ordinary list item                           | surface                                                                         | on-surface                                                 |
| inset list item                              | surface-bright                                                                  | on-surface; transparent 2px gap                            |
| navigation bar                               | surface-container                                                               | on-surface-variant; secondary-container selected indicator |
| segment                                      | inherited surface                                                               | primary selected; on-surface-variant unselected            |
| search field                                 | surface-container-high                                                          | on-surface; on-surface-variant icon; Ionic placeholder behavior            |
| switch, checkbox, radio, progress, slider    | neutral surface or secondary-container when off/inactive; primary when selected | matching on-primary, outline, or on-surface-variant        |
| text input                                   | Ionic fill-state background                                        | on-surface; primary focus; error invalid state             |
| modal / popover                              | surface-container-low                                                           | Ionic text; nested components resolve their own roles       |
| action sheet                                 | surface-container-low                                                           | on-surface action buttons; on-surface-variant title         |
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

Android 17 Settings is the visual reference; Material guidelines supply supporting
information. When supplied, `surface-container` refines page/menu backgrounds and
`surface-bright` refines inset rows. Without those roles, Ionic backgrounds remain
unchanged. Groups retain 20px outer corners and 2px gaps. The assignments above
name optional roles; they do not imply generated surface colors for omitted roles.

Icon-only toolbar back buttons retain a 56px touch target and geometry for a 40px circle.
That circle is transparent by default; supplying `--md-sys-color-surface-container-highest`
paints it. An explicitly colored toolbar retains a transparent back-button background
and Ionic's contrast foreground. Set `--md3-back-background` on the back button to
customize its paint.
Icon-free switches use a 52×28px track and a 20px thumb, measured from the Pixel
Android 17 Internet panel. CSS-only installation retains Ionic's normal
thumb and its `enableOnOffLabels` API. The standard toggle and demo use an icon-free thumb.
Component `md3-disabled` and explicit Ionic colors remain available.

Typography, optional back-arrow configuration and switch state icons are documented
in [Android Settings appearance](android-settings.md). They do not change the
palette or require device colors.

The theme's colors and geometry work without optional JavaScript helpers or a Capacitor plugin.
For a range on an arbitrary HTML surface, set `--md3-range-gap-color` to that surface
color; standard Ionic containers supply their background automatically.

For measured tablet dialog sizing, corners, keyboard behavior, and the historical
native reference captures, see [Android 17 tablet review](validation/android17-tablet-2026-11-07.md).
For the subsequent Ionic-default color correction and its browser verification, see
[Ionic color inheritance review](validation/ionic-color-inheritance-2026-11-07.md).

## Tablet Alert sizing

Wide tablet Alerts follow the measured Android 17 Settings proportions: 85% in
portrait and 65% in landscape. Android tablet typing keeps that width when the
IME resizes the viewport. Phone-sized windows retain Ionic's content-sized layout.

Use the public sizing properties to customize a dialog. For a controller-created
Alert, set `cssClass: 'app-alert'` and place a component-qualified rule in the
application's global stylesheet after the theme:

```css
ion-alert.app-alert {
  --width: 400px;
  --max-width: min(400px, calc(100vw - 32px));
}
```

Inline style bindings work as well. The ordinary CSS minimum/maximum constraints
still apply, and `md3-disabled` restores Ionic's own sizing defaults.
