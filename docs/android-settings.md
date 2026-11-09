---
title: Android Settings appearance
---

# Android Settings appearance

The theme uses Android Settings as a visual reference while keeping Ionic's
component APIs, named colors and application-defined styles. It does not replace
Ionic components with Android widgets. The measured reference is Pixel Settings
on Android 17; other Android manufacturers can use different designs.

## Default theme and application overrides

| Feature | Theme default | Application customization |
| --- | --- | --- |
| Toolbar, grouped lists and controls | Android-aligned dimensions | Ionic CSS variables and application CSS |
| Toggle thumb | No state icon | Ionic `enableOnOffLabels`, or the state-icon helper below |
| Font | Device-local Google Sans Flex, then Roboto / Helvetica Neue / sans-serif | Ionic `--ion-font-family` |
| Back arrow | Ionic's configured icon | Ionic's own icon configuration; no theme icon is bundled |
| Palette | Existing Ionic color intent | Device colors are a separate [dynamic colors](dynamic-colors.md) feature |

## Default font, CSS only

Import the main theme **after Ionic's core styles**, as described in the
[README](../README.md#installation). Its MD typography is included automatically;
no extra stylesheet, JavaScript initialization, class or teardown is needed.

The theme sets `--ion-default-font` on `html.md`. Ionic's `--ion-font-family`
continues to resolve that default unless the application supplies its own value:

```css
:root {
  --ion-font-family: 'My App Font', sans-serif;
}
```

The theme does not overwrite `--ion-font-family`. For a component-specific font,
use its normal `font-family` styling; a local custom property alone only affects
components that consume it. The iOS root font default is unchanged. An individual
`md3-disabled` component inherits the application's font like other Ionic
components; the class does not reset application-wide typography.

The local font alias resolves `GoogleSansFlex-Regular` only when the device/browser
makes it available. No font file is bundled or downloaded. Otherwise the browser
uses Roboto, Helvetica Neue or its generic sans-serif fallback. Uncovered scripts
use normal browser/platform fallback: no Japanese font is forced. The same CSS
runs in native WebViews and the browser demo.

The theme does not monitor DPR, round text to physical pixels, override font
metrics, or force variable-font axes. Text layout therefore follows the selected
font, browser and user settings. Native Android TextView and WebView text can
differ; matching a particular Pixel's glyph bounds is not a portability guarantee.

## Back buttons remain Ionic components

The theme does not bundle or replace the back-arrow icon. Ionic owns its default
icon, `backButtonIcon` configuration, per-button `icon` property, navigation and
accessibility. Applications can use those existing Ionic APIs directly.

The theme styles the button's spacing, 56px touch target and 40px circular paint
area. The circle is transparent unless its optional color role is supplied; see
[color system](color-system.md). Native Settings and Ionic glyphs can differ;
matching the native arrow is not a theme requirement.

## Alert focus appearance

The MD theme suppresses the browser outline around the dialog surface itself.
Ionic still moves focus into the Alert on presentation and manages Tab navigation,
focus containment and dismissal. Action buttons retain their keyboard-focus
indicators. `md3-disabled` and iOS-mode Alerts retain Ionic's default appearance.

## Toggle labels and optional state icons

The default track is 52×28px with a 20px thumb and no cross/check icons. For Ionic's
own on/off labels, use its public property:

```html
<ion-toggle enable-on-off-labels="true">Notifications</ion-toggle>
```

Framework bindings use the corresponding `enableOnOffLabels` property. Application
size overrides still use Ionic CSS variables:

```css
ion-toggle.app-toggle {
  --handle-width: 18px;
  --handle-height: 18px;
}
```

Cross/check icons are a separate variant for applications that explicitly need it:

```ts
import { applyToggleStateIcons } from '@rdlabo/ionic-theme-md3/toggle-state-icons';

const toggle = document.querySelector<HTMLElement>('ion-toggle')!;
const removeIcons = await applyToggleStateIcons(toggle);
// During teardown:
removeIcons();
```

Call after creating/connecting the toggle. The helper waits for custom-element
registration and `componentOnReady()` when available. For builds without that
method, wait for Shadow DOM rendering first. If the view is destroyed while
awaiting setup, call the returned cleanup immediately.

The helper adds one style element to the public handle Part's Shadow DOM. It does
not intercept component properties or observe the document. Ionic's own labels
win when `enableOnOffLabels` is enabled, including subsequent property changes.
`md3-disabled` and iOS mode suppress this icon enhancement. The demo does not
attach this helper automatically.

## Upgrading and verification

Review the [migration notes](migration.md#unreleased-android-settings-alignment)
for dimension changes and [grouped-list markup](using-ion-item-group.md) for
sizing. Explicit Ionic `color`, disabled state, interaction and local overrides
retain their meaning. The [measurement report](validation/android17-pixel-pass1-2026-11-09.md)
separates physical-device evidence from browser regression checks; it does not
claim complete raster equality or native tablet acceptance.
