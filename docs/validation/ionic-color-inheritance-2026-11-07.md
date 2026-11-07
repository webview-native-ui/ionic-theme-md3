# Ionic color inheritance correction — 2026-11-07

This supersedes the generated Ionic-only surface-color policy in the earlier
Android 17 tablet review. Earlier native captures remain historical evidence;
this change was verified in Chromium with Ionic 9, not re-captured on Android.

## Behavior

- Ordinary card, toolbar, content/menu, item, tab bar, chip, FAB and overlay
  backgrounds retain Ionic fallback colors when their Material roles are absent.
- Existing card/item/toolbar/tab-bar variables remain in their fallback chains.
  Optional Material roles explicitly refine those colors. Explicit Ionic `color`
  selections remain protected; normal application classes can override component
  `--background` without needing a stronger theme selector.
- Derived container colors remain available for explicitly requested variants.
- Material menu/page surface roles are now consistent. Alert stacking and tablet
  sizing are unchanged: three actions stack; two can remain inline.
- Input success and filled/focused color states remain controlled by Ionic.

## Verification

- Built CSS/TypeScript, formatting and packed ESM import checks passed.
- Dynamic-color unit tests: 26 passed.
- Non-screenshot browser E2E: 57 passed, including tablet sizing/IME, explicit
  colors, opt-outs, mixed modes and overlay operations.
- New tests compare eight ordinary components against their Ionic opt-out
  counterparts, using local background/text/primary colors. Inset-item and
  outline-chip variants are also covered; outline paint and border use computed
  rendered colors rather than unused custom-property values. They also check
  partial Material role injection, role removal, a dedicated card background,
  and normal application CSS class overrides on card and inset item (with and
  without an optional surface role).
- Both light/dark, at 411×891 and 1280×800 CSS pixels. These are browser viewport
  checks, not claims about Android hardware or OEM coverage.
- Snapshot baselines are regenerated through the PR `/update-screenshots` CI.

## Browser captures, optional roles absent

[Light phone](ionic-color-inheritance-2026-11-07/light-411.png) ·
[Dark phone](ionic-color-inheritance-2026-11-07/dark-411.png) ·
[Light tablet](ionic-color-inheritance-2026-11-07/light-1280.png) ·
[Dark tablet](ionic-color-inheritance-2026-11-07/dark-1280.png)

Captures show the visible Ionic content viewport. Scrollable content below it is
covered by the interaction and color assertions, not by these four images.
