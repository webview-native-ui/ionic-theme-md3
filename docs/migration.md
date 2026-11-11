---
title: Migration
---

# Migration

Review every section newer than the version currently installed, in ascending order. For example, when upgrading from 1.x to 9.0.0, complete the 2.0.0 migration steps before reviewing 9.0.0.

Versioned sections list changes that require application code or configuration updates. The setup simplification below is optional.

## Optional: simplify the setup

The theme stylesheet and `md3ThemeConfig` provide a shorter setup. Existing individual
stylesheet paths and animation exports remain supported. Applications can adopt
the theme stylesheet and configuration object independently.

### Replace the theme stylesheet imports

```diff
 @import '@ionic/core/css/palettes/dark.system.css';
- @import '@rdlabo/ionic-theme-md3/dist/css/default-variables.css';
- @import '@rdlabo/ionic-theme-md3/dist/css/ionic-theme-md3.css';
+ @import '@rdlabo/ionic-theme-md3/styles/theme.css';
```

Keep the Ionic dark palette your application already selects. The example uses
system appearance; class-controlled and always-dark applications keep their
corresponding palette. Keep Ionic's base styles before these imports and
application overrides after them. MD3 provides one theme stylesheet shared by these modes.

### Replace animation wiring

For an app already using Material Design mode, replace the manual setup as follows.

```diff
- import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';
+ import { md3ThemeConfig } from '@rdlabo/ionic-theme-md3';

- const ionicConfig = {
-   mode: 'md' as const,
-   navAnimation: mdTransitionAnimation,
- };
+ const ionicConfig = {
+   ...md3ThemeConfig,
+   // animated: false,
+ };
```

Pass the object to your existing framework initializer. The theme configuration
sets `mode: 'md'` and the matching MD3 transition. For an application that chooses
its appearance by platform, choose the configuration for the selected mode:

```ts
import { isPlatform } from '@ionic/core';
import { md3ThemeConfig } from '@rdlabo/ionic-theme-md3';

const ionicConfig = {
  ...(isPlatform('ios') ? { mode: 'ios' as const } : md3ThemeConfig),
  // animated: false,
};
```

The application owns mode selection. Retain an existing explicit mode by selecting
the matching theme configuration. Put application settings after the spread so
custom animations take precedence, including an explicit
`navAnimation: undefined` for Ionic's default transition. See [setup](setup.md)
for framework imports and [configuration](configuration.md) for individual APIs
and combined-theme selection. Dynamic Colors continues to use Ionic's
[class-based palette](dynamic-colors.md).

## Migrating to 9.2.0: Android Settings alignment

No template migration is required. Review application CSS that compensates for
previous theme dimensions before adopting this update:

| Component                   | Previous theme                                | Updated theme                               |
| --------------------------- | --------------------------------------------- | ------------------------------------------- |
| Standard toggle             | 52×32px track, 24px thumb                     | 52×28px track, 20px thumb                   |
| Regular toolbar title       | 20px; 4px start padding beside start controls | 22px / 28px line; 12px start padding        |
| Two-line inset item title   | 18.4px, weight 500                            | 16px, weight 400; note 14px                 |
| Grouped item minimum height | 48px                                          | 56px; rows containing radio controls 72px   |
| Headed inset lists          | Additional list margin/padding                | 56px heading; no extra block margin/padding |

These are theme defaults, not fixed content heights. Wrapping and application
sizing overrides remain available. See [list sizing](using-ion-item-group.md#sizing-and-overrides)
and [Android Settings appearance](android-settings.md) for examples.

The demo no longer attaches cross/check icons automatically. Applications that
explicitly call `applyToggleStateIcons` keep that behavior; remove the call and run
its cleanup if an icon-free toggle is desired. Ionic's `enableOnOffLabels` remains
supported.

The main theme now includes its MD font default in CSS. Load it after Ionic core
styles. Existing `--ion-font-family` overrides retain priority; when no application
font is set, the browser uses local Google Sans Flex if available, then the normal
fallback stack. No TypeScript font helper or extra stylesheet is required. Check
text wrapping on supported devices and locales; fonts are not bundled.

Back icons remain managed by Ionic. Named colors, Material You mapping and
per-button icon overrides retain their meaning.

## Migrating to 9.0.0

Version 9 aligns the theme's major version with Ionic Framework 9. It does not introduce additional breaking changes beyond those documented in the earlier migration sections.

Both Ionic 8 and Ionic 9 remain supported. Version 9 requires `@ionic/core >=8.8.0 <10`.

## Migrating to 2.0.0

### Rename `.header-item-group` to `.item-group-header`

The class for an `ion-item-group` used as a section header has been renamed for consistency with the element it modifies. Replace every occurrence of `.header-item-group` in application templates and styles.

```diff
- <ion-item-group class="header-item-group">
+ <ion-item-group class="item-group-header">
    ...
  </ion-item-group>
```

The old class is no longer styled by the theme. This rename applies to markup shared with `@rdlabo/ionic-theme-ios26` as well.
