# Alert embedded controls — 2026-11-11

Reference device: Pixel 8a, Android 17,
`google/akita/akita:17/CP2A.260705.006/15641320:user/release-keys`,
1080×2400 raster, density 420 (2.625 physical px/dp).

## References and scope

- Settings → Accessibility → Magnification → Magnification shortcut:
  [unchecked checkbox crop](alert-inputs-2026-11-11/native-checkbox.png).
  The painted square is approximately 47 physical px, or 18dp. This is a
  **page control**, used for checkbox geometry only; it is not evidence for
  Alert row placement, dialog dimensions, or the selected checkmark glyph.
  No shortcut was enabled.
- Settings → About phone → Device name:
  [focused text input dialog](alert-inputs-2026-11-11/native-input.png).
  Reference for underline, input text sizing, and header/field separation.
  The edit was canceled without saving.
- Settings → Internet → an unconnected secured Wi-Fi network now uses a filled
  password field with a visibility icon, not a show-password checkbox. That
  full-page form is not used as the Alert geometry reference. No connection
  was attempted and no credentials were entered.

## Changes

The old Alert checkbox was Ionic's 16px square. Its rotated checkmark extended
outside the inner 12px area constrained by `contain: strict`. The square is now
18px and the checkmark uses a contained 6×10px border box. Its glyph remains
Ionic's checkmark; native selected-glyph equivalence is not claimed.

Alert's embedded inputs are native HTML elements and do not inherit the theme's
`ion-checkbox` / `ion-radio` styles. Their state selectors also carry Ionic scope
classes. Explicit Material primary/on-primary/on-surface role mapping now wins
against those scoped rules for checkbox and radio states. Inputs use the same
roles for text, placeholder, caret, resting underline, and focused underline.

Text and textarea inputs now use 18px text at the default root font size. A
header followed by an empty message no longer accumulates Ionic's extra 20px
input-group top padding. The focused underline remains the keyboard focus
indicator. Existing message spacing, disabled behavior, option placement,
scrolling, action layout, opt-out, and iOS mode retain their contracts.

The Alert demo now exposes `checkbox`, `radio`, `input`, and `textarea` variants,
including selected, unselected, disabled, and wrapping option labels. The shared
variant list also includes these scenes in the existing visual CI suite.

## Validation

- Theme build and formatting checks; demo production build and ESLint.
- Playwright Alert input, alignment, and focus tests: 18 cases, including light /
  dark, LTR / RTL, checked-state geometry and color, editing, disabled choices,
  opt-out, and iOS mode.
- Pixel 8a Chrome rendering of the local demo:
  [checkbox](alert-inputs-2026-11-11/device-chrome-checkbox.png),
  [input](alert-inputs-2026-11-11/device-chrome-input.png).
  These are **Chrome on the device**, not a newly installed Capacitor APK.
  The default Ionic palette is used; wallpaper RGB equivalence is not asserted.
- Native references were captured in light mode. Dark and RTL coverage is
  browser regression coverage, not native pixel-equivalence evidence. A native
  multi-choice Alert and native textarea counterpart were not found in this
  pass. Dialog width/title typography, OEM variations and font scaling remain
  outside this control-specific change.
- New visual baselines must be generated through the repository's
  `/update-screenshots` CI workflow. Local captures do not replace Linux
  baselines or establish CI success. Ionic 8 visual verification remains a CI
  responsibility.

Demo production build succeeds with existing unsupported Browserslist entries,
unused `IonText` import in SettingsPage, and initial bundle budget warnings.
