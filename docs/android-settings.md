---
title: Android Settings appearance
---

# Android Settings appearance

The theme uses Android Settings as a visual reference while keeping Ionic's
component APIs, named colors and application-defined styles. It does not replace
Ionic components with Android widgets. The measured reference is Pixel Settings
on Android 17; other Android manufacturers can use different designs.

## Default theme and optional features

| Feature | Main theme only | Optional setup |
| --- | --- | --- |
| Toolbar, grouped lists and controls | Android-aligned dimensions | Override with application CSS |
| Toggle thumb | No state icon | Ionic `enableOnOffLabels`, or the state-icon helper below |
| Font | Application's Ionic font | Separate local Settings font stylesheet and helper |
| Back arrow | Ionic's configured icon | Use Ionic's own icon configuration; no theme icon is bundled |
| Palette | Existing Ionic color intent | Device colors are a separate [dynamic colors](dynamic-colors.md) feature |

Install the main theme as described in the [README](../README.md#installation).
The options below work independently and do not require a Capacitor plugin.
The demo enables Settings typography only on Android; a desktop demo does not prove local Pixel fonts are available.

## Optional local Settings font

Import the separate stylesheet in the global stylesheet, after the theme:

```css
@import '@rdlabo/ionic-theme-md3/dist/css/settings-font.css';
```

For Sass, use `@use '@rdlabo/ionic-theme-md3/src/styles/settings-font';` instead.
Importing the stylesheet alone does not activate the font.

Call the helper in a browser after the target root exists:

```ts
import { applySettingsFont } from '@rdlabo/ionic-theme-md3/settings-font';

const restoreFont = applySettingsFont(document.documentElement);
// When the owning application/view is destroyed:
restoreFont();
```

`applySettingsFont(root?: HTMLElement): () => void` defaults to `document.documentElement`.
It adds `md3-settings-font` and sets `--md3-device-pixel` from the window DPR.
On resize it updates the value only if DPR changes; it does not measure every
frame. Cleanup removes the listener and restores the root's prior class and CSS
property, including its priority. Call once per owning root, and clean up before
applying it again. Nested/overlapping helper ownership is not supported.

Use the document root to include controller-created overlays. A container limits
where the font applies but does not include overlays mounted outside it. Module
imports are safe during SSR; invoking the helper requires a browser DOM.

For Angular, register initialization after rendering and cleanup with the owner:

```ts
import { afterNextRender, Component, DestroyRef, inject } from '@angular/core';
import { applySettingsFont } from '@rdlabo/ionic-theme-md3/settings-font';

@Component({ selector: 'app-root', template: '<ng-content />' })
export class AppComponent {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.destroyRef.onDestroy(applySettingsFont());
    });
  }
}
```

Add any application platform condition inside the callback. React/Vue applications
can call the same helper on mount and call the returned function on unmount.

### Font availability and limits

The stylesheet resolves local `GoogleSansFlex-Regular`, then Japanese
`NotoSansCJKJP-Regular`, then `--ion-font-family` (or Ionic's standard fallback).
It neither downloads nor distributes these fonts. If the device/browser does not
expose them, the application font remains the fallback; identical Pixel typography
is not guaranteed. The variant includes font metrics, weight/optical-size settings
and device-pixel rounding calibrated for the Japanese Pixel font stack. It is not
a general font recommendation for every locale/OEM. Use the ordinary Ionic font
when these assumptions do not suit the application.

This is a scoped application font choice. `md3-disabled` does not undo inherited
application typography; remove the font scope/helper to restore it. Component
geometry opt-out remains independent. Prefer the normal theme plus your existing
`--ion-font-family` when a fully custom typeface is required.

## Back buttons remain Ionic components

The theme does not bundle or replace the back-arrow icon. Ionic owns its default
icon, `backButtonIcon` configuration, per-button `icon` property, navigation and
accessibility. Applications can use those existing Ionic APIs directly.

The theme styles the button's spacing, 56px touch target and 40px circular paint
area. The circle is transparent unless its optional color role is supplied; see
[color system](color-system.md). Native Settings and Ionic glyphs can differ;
matching the native arrow is not a theme requirement.

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
