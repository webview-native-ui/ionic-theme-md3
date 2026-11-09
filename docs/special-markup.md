---
title: Special markup
---

# Special markup

Most Ionic markup works without changes. Shared markup carries the same meaning in
`@rdlabo/ionic-theme-ios27` and this theme; its appearance follows the active platform.
Android Settings is the MD3 visual reference. Shared markup does not request an iOS
Glass appearance on Android.

## Submit buttons

Use `type="submit"` for a real form submission. If submitting through a form is not
possible, `type="button" class="button-submit"` identifies the equivalent action;
the class only describes appearance and does not submit, validate, or install a handler.
For a filled primary action, use Ionic's public `fill="solid"`. MD3 already renders
solid buttons using the palette's base/contrast pair, so these two forms share the
same Android appearance without an additional effect or JavaScript helper.

```html preview
<ion-button type="submit" fill="solid" color="primary">Submit</ion-button>
<ion-button type="button" class="button-submit" fill="solid" color="primary">Continue</ion-button>
```

Explicit Ionic colors, disabled state, and `fill="clear"` / `fill="outline"` keep their
normal meaning. The class does not force a different fill.

## Preferred overlay actions

For alerts and action sheets, use `role: 'preferred'` for the recommended action,
matching the iOS 27 theme's convention. Appearance follows the overlay's purpose:
an Alert uses a filled primary/on-primary action, while an Action Sheet keeps the
same full-width row geometry as its other choices and emphasizes its text/icon
with primary color and medium weight. The Action Sheet's Cancel group is separated
from the choices by spacing and a divider. Colors derive from the Ionic palette
unless optional Material roles are supplied. Ordinary/default actions remain text
actions; `confirm` alone does not request emphasis. Cancellation, selection, and
destructive roles remain separate from recommendation.

```ts
buttons: [
  { text: 'Cancel', role: 'cancel' },
  { text: 'Continue', role: 'preferred' },
];
```

This custom Ionic role does not select or invoke an action automatically. The
button's handler runs normally and dismissal reports `preferred`; handle that
role explicitly if the application inspects dismissal results. `cancel` retains
Ionic cancellation behavior. Do not replace `cancel`, `selected`, or `destructive`
with `preferred` just to change their color.

## Two-line inset list items

Place an unslotted `ion-label` immediately alongside an unslotted `ion-note` to render a two-line item. Wrap inset items in `ion-item-group` and keep `ion-list-header` outside the group. Use `slot="end"` on `ion-note` when you want the standard trailing-note layout instead.

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item>
      <ion-label>Network &amp; internet</ion-label>
      <ion-note>Mobile, Wi-Fi, hotspot</ion-note>
    </ion-item>
  </ion-item-group>
</ion-list>
```

## Square buttons

Add `.button-square` when a button should use more squared corners. It works with text buttons and icon-only buttons.

```html preview
<ion-button class="button-square" fill="solid">Continue</ion-button>
<ion-button class="button-square" fill="solid">
  <ion-icon name="add" slot="icon-only"></ion-icon>
</ion-button>
```

## Inset-list section headers

Add `.item-group-header` to an `ion-item-group` to create the centered icon, title, and description used at the top of the component demo pages.

This is an introductory group. Place regular list items in a separate `ion-item-group` that follows it.

```html preview
<ion-list inset="true">
  <ion-item-group class="item-group-header">
    <ion-item>
      <ion-label>
        <ion-icon name="list" style="background: var(--ion-color-primary)"></ion-icon>
        <h2>Lists</h2>
        <ion-text>Inset-list examples</ion-text>
      </ion-label>
    </ion-item>
  </ion-item-group>
  <ion-item-group>
    <ion-item><ion-label>First item</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

## Android Settings controls

The standard toggle is icon-free. Ionic's `enableOnOffLabels` remains available
when the application explicitly requests labels:

```html preview
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-toggle justify="space-between">Notifications</ion-toggle></ion-item>
    <ion-item>
      <ion-toggle justify="space-between" enable-on-off-labels="true">Notifications with on/off labels</ion-toggle>
    </ion-item>
  </ion-item-group>
</ion-list>
```

The theme uses a 52×28px track and 20px thumb. Grouped rows have a 56px minimum
height, or 72px for radio rows; long content can grow. Use Ionic's public CSS
variables for application sizing, and keep the [shared list structure](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/using-ion-item-group).

The main theme supplies a CSS-only MD font default using local Google Sans Flex
when available and standard fallbacks otherwise. An application's
`--ion-font-family` takes priority. Back icons are managed by Ionic; the theme does
not bundle a replacement. See [Android Settings appearance](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/android-settings)
for font defaults, fallbacks and application overrides.
Review the [migration guide](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/migration)
when updating applications with custom dimensions. These options preserve Ionic's
palette intent and explicit component properties.

## Platform-specific extensions

The shared structure above works without platform-specific templates. iOS-only
`segment-style-glass`, `searchbar-classic`, floating iPad sheets, and iOS tab-bar
positioning are not Android appearance requirements. MD3 retains Ionic's segment,
searchbar, modal, and tab-bar behavior. `.button-square` is an optional MD3 shape
extension, not a required shared markup convention.

## Opting out

Add `.md3-disabled` to an individual Ionic component when it must retain Ionic's standard Material styling.

```html preview
<ion-button fill="solid">MD3 theme</ion-button> <ion-button class="md3-disabled" fill="solid">Standard Ionic</ion-button>
```
