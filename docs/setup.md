---
title: Set up the MD3 theme
---

# Set up the MD3 theme

Use an existing Ionic Angular, React or Vue app with Ionic `>=8.8.0 <10`.

## Install the theme

```sh
npm install @rdlabo/ionic-theme-md3
```

## Load the preset

Add one import to your global stylesheet after Ionic's base CSS and your selected
Ionic dark palette:

```css
@import '@rdlabo/ionic-theme-md3/preset/default.css';
```

This preset combines the default variables and MD3 component styles. When adopting
it in an existing app, replace the individual MD3 stylesheet imports. Keep your
chosen Ionic dark-palette import, such as
`@ionic/core/css/palettes/dark.system.css`, and put application overrides after the
preset. MD3 has one preset for all appearance modes. For
[Dynamic Colors](dynamic-colors.md), select Ionic's `dark.class.css` palette.

## Configure Ionic

Spread `md3ThemeConfig` into the options passed to the Ionic initializer your app already calls, before
rendering components. Choose the example for your framework.

### Angular

```ts
import { provideIonicAngular } from '@ionic/angular'; // Ionic 9
// Ionic 8: import { provideIonicAngular } from '@ionic/angular/standalone';
import { md3ThemeConfig } from '@rdlabo/ionic-theme-md3';

provideIonicAngular({
  ...md3ThemeConfig,
  // animated: false,
});
```

### React

```ts
import { setupIonicReact } from '@ionic/react';
import { md3ThemeConfig } from '@rdlabo/ionic-theme-md3';

setupIonicReact({
  ...md3ThemeConfig,
  // animated: false,
});
```

### Vue

```ts
import { IonicVue } from '@ionic/vue';
import { md3ThemeConfig } from '@rdlabo/ionic-theme-md3';

app.use(IonicVue, {
  ...md3ThemeConfig,
  // animated: false,
});
```

The configuration sets `mode: 'md'` and the MD3 page transition. Add application
options after the spread to override these defaults. For platform-dependent
appearance, select the configuration matching the mode as shown in
[configuration](configuration.md#preserve-existing-mode-selection).
The exported object supports imports during server rendering.

## Preview a screen

Start your app's usual development server. Open a page containing this markup,
using your framework's component syntax:

```html
<ion-list inset="true">
  <ion-item-group>
    <ion-item><ion-label>Notifications</ion-label></ion-item>
    <ion-item><ion-label>Appearance</ion-label></ion-item>
  </ion-item-group>
</ion-list>
```

Check the grouped list, navigate between pages, and switch the device appearance
using your chosen Ionic dark-palette policy. See [list structure](using-ion-item-group.md)
for the expected grouped markup and [configuration](configuration.md) for individual
stylesheets, animations and existing platform-based mode selection.
