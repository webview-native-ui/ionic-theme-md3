---
title: Theme configuration
---

# Theme configuration

The [setup guide](setup.md) uses the combined MD3 CSS preset and `md3ThemeConfig()`.
The individual stylesheets and animation exports support custom composition.

## Load individual stylesheets

Place these imports after Ionic's core CSS and your chosen Ionic dark palette:

```css
@import '@rdlabo/ionic-theme-md3/dist/css/default-variables.css';
@import '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

These two files form `preset/default.css`. Use either the preset or the individual
imports. Put application CSS overrides after the theme.

Ionic owns dark-palette selection. Choose `dark.system.css`, `dark.class.css` or
`dark.always.css` from `@ionic/core/css/palettes/` according to your app's appearance
policy. [Dynamic Colors](dynamic-colors.md) manages `ion-palette-dark` and uses
`dark.class.css`.

## Configure animations directly

Use the MD3 transition for Ionic's Material Design mode in your existing initializer:

```ts
import { isPlatform } from '@ionic/core';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

const ionicConfig = {
  navAnimation: isPlatform('ios') ? undefined : mdTransitionAnimation,
};
```

Pass this object to Angular's `provideIonicAngular(ionicConfig)`, React's
`setupIonicReact(ionicConfig)` or Vue's `app.use(IonicVue, ionicConfig)`. Angular
imports `provideIonicAngular` from `@ionic/angular` in Ionic 9 and from
`@ionic/angular/standalone` in Ionic 8. React imports `setupIonicReact` from
`@ionic/react`, and Vue imports `IonicVue` from `@ionic/vue`.

[Combined theme configuration](#use-md3-and-ios-27-together) shows platform-based
transitions when both themes are installed.

## Preserve existing mode selection with the helper

`md3ThemeConfig()` defaults to Material Design mode. Pass an explicit mode to
retain an application's existing iOS-versus-Material-Design selection:

```ts
import { isPlatform } from '@ionic/core';
import { md3ThemeConfig } from '@rdlabo/ionic-theme-md3';

const ionicConfig = md3ThemeConfig({
  mode: isPlatform('ios') ? 'ios' : 'md',
});
```

Existing options take precedence over helper defaults. A custom `navAnimation`
passed to the helper is retained, including an explicit `undefined` value when the
app wants Ionic's default transition. An explicit `mode: 'ios'` selects Ionic's iOS
animation defaults. See [migration](migration.md#optional-adopt-the-setup-wrappers)
for a before-and-after example.

## Use MD3 and iOS 27 together

Install the iOS 27 theme to style both Ionic modes from the same application.

The current releases of both themes require `@ionic/core` 8.8.1 or later. Upgrade Ionic before using this setup if your application is on 8.8.0 or earlier.

```bash
npm install @rdlabo/ionic-theme-ios27
```

When your global stylesheet uses Sass, initialize the themes in this order:

```scss
@use '@rdlabo/ionic-theme-ios27/src/styles/default-variables.scss' as ios27-vars;
@use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27.scss';
@use '@rdlabo/ionic-theme-ios27/src/styles/ionic-theme-ios27-dark-class.scss';
@use '@rdlabo/ionic-theme-ios27/src/styles/md-remove-ios-class-effect.scss';
@use '@rdlabo/ionic-theme-md3/dist/css/default-variables.css' as md3-vars;
@use '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
```

The example uses Ionic's class-based dark mode. Your global stylesheet must also load Ionic's matching dark palette, such as `@ionic/angular/css/palettes/dark.class.css` for Angular. When using `dark-system` or `dark-always`, select the same variant for both Ionic's palette and the iOS 27 theme. See Ionic's [Dark Mode documentation](https://ionicframework.com/docs/theming/dark-mode). The explicit `ios27-vars` and `md3-vars` namespaces prevent the two variable modules from using the same default namespace.

Configure both transition implementations when both themes are installed:

```ts
import { isPlatform } from '@ionic/core';
import { iosTransitionAnimation, popoverEnterAnimation, popoverLeaveAnimation } from '@rdlabo/ionic-theme-ios27';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

const ios = isPlatform('ios');
const ionicConfig = {
  ...existingIonicConfig,
  navAnimation: ios ? iosTransitionAnimation : mdTransitionAnimation,
  popoverEnter: ios ? popoverEnterAnimation : undefined,
  popoverLeave: ios ? popoverLeaveAnimation : undefined,
};
```

Pass this object to your existing framework initializer using the imports described
in [Configure animations directly](#configure-animations-directly).
