---
title: Using ion-item-group
---

# Using `ion-item-group` in inset lists

The MD3 theme uses the same inset-list structure as `@rdlabo/ionic-theme-ios27`, allowing one template to work across Ionic modes. When an `ion-list` uses `inset="true"`, wrap its items in `ion-item-group` and keep `ion-list-header` outside the group.

The examples use framework-neutral Web Component markup. In React or Vue, use the equivalent component and property syntax.

```html
<ion-list inset="true">
  <ion-list-header><ion-label>Connections</ion-label></ion-list-header>
  <ion-item-group>
    <ion-item>...</ion-item>
    <ion-item>...</ion-item>
  </ion-item-group>
</ion-list>
```

No wrapper is required for lists that do not use `inset="true"`.

[Check list structure with ESLint](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/eslint).

## Why the wrapper is required

The shared structure keeps `ion-list-header` separate from the item surface. This matches the iOS 27 layout while allowing MD3 to style the same markup without platform-specific templates.

The theme therefore:

- makes the inset `ion-list` background transparent;
- applies the item surface to `ion-item-group`; and
- leaves `ion-list-header` outside that surface.

For two-line items and section-header groups, see [Special markup](https://docs.rdlabo.dev/projects/ionic-theme-md3/docs/special-markup).

## Sizing and overrides

MD grouped rows have a 56px minimum height, or 72px when they contain a radio
control. Two-line items use a 16px title, 14px note and 16px block padding; their
height grows with their content. Headed inset lists use a 56px section header and
2px gaps between grouped rows. Keep the header outside `ion-item-group`.

Use Ionic's public CSS variables in your application stylesheet after the theme:

```css
ion-item.app-setting {
  --min-height: 64px;
}
```

A minimum height does not clip long text. Avoid fixed row heights or positional
transforms intended to compensate for a particular device font. Ionic's ordinary
trailing note (`slot="end"`) and radio/toggle label APIs retain their meaning.
Optional [Settings typography](android-settings.md#optional-local-settings-font)
uses rounded device-pixel metrics; it is not required for this shared markup.
