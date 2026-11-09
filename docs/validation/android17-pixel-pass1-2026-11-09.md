# Android 17 typography and control geometry validation

Base: `8a67646` (#63). This review covers toolbar titles, grouped list headings
and rows, icon-free toggles, radio rows and range geometry. The
[component map](android17-component-map-2026-11-09.md) identifies reference screens
and components that still need their own native comparison.

## Reference and implementation boundary

Native reference: Pixel 8a, Android 17 `CP2A.260705.006`, 1080×2400, density 420,
font scale 1.0, Japanese; WebView DPR 2.625. Settings supplies the list, toolbar,
radio and range references. The icon-free checked toggle comes from SystemUI's
Internet panel, which is a different variant from Settings' icon-bearing switches.

The theme preserves Ionic palette semantics, application font and sizing overrides,
component properties and interaction APIs. Back-icon selection remains Ionic's
responsibility. Typography uses local Google Sans Flex when available, followed
by ordinary browser fallbacks. No native font, runtime font helper, device-pixel
rounding or per-device metric compensation is included. Native TextView and WebView
text can differ; this report does not claim glyph or whole-screen pixel equality.

## Geometry evidence

Native accessibility bounds and raster extents were measured separately. Raster
extents depend on antialiasing and must not be treated as touch-target dimensions.
CSS values below assume the default 16px root font size where rem units are used.

| Part | Native observation | Theme behavior |
| --- | --- | --- |
| Icon-free checked toggle | Track 137×73 physical px; thumb 53×53 | Track 52×28 CSS px; thumb 20×20 |
| Back-button circle | 105×105 physical px, approximately 40dp | Existing 40px paint area and 56px touch target retained |
| Toolbar title | 22sp text | 22px text / 28px line height; 12px start padding beside start controls |
| Section heading | Approximately 56dp layout height | 56px minimum; no extra block margin/padding around headed lists |
| Title plus supporting note | 16sp title and 14sp summary | 16/14px text, natural line height, 16px top/bottom padding |
| Group gaps | 2dp, rounded by Android to physical pixels | 2 CSS px without DPR compensation |
| Radio | Approximately 72dp row and 20dp circle | 72px grouped-row minimum; existing 20px circle retained |
| Range | 16dp track and approximately 4×44dp handle | Existing dimensions retained |

## Item height: text, padding and minimum height

The CSS-only review APK was measured on the Pixel at DPR 2.625. Ordinary one-line
inset items are 56 CSS px; non-inset Ionic items remain 48px. The minimum height is
a constraint, not an additional contribution to content height. Native/inner
wrappers have zero block padding. Supporting-note rows have 16px container padding
on each side and zero label/note margins, so padding is not counted twice.

A same-device CSS probe confirmed that using natural title line height also for
supporting-note rows removes extra height accumulated by wrapped titles:

| Demo content | Height with natural title line height | Decomposition |
| --- | --- | --- |
| One-line label only | 56px | Minimum height dominates |
| One-line title + note | 70.10px | 20.19 + 17.90 + 32px padding |
| Three-line title + note | 110.48px | 60.57 + 17.90 + 32px padding |

These are browser layout measurements on this device, not cross-device constants.
The final line-height adjustment was checked through CSS probing and browser tests;
it was not separately packaged into the measured APK.

## Verification

- The CSS-only APK's Toggle, Radio, Range and Item/List pages were captured and
  visually inspected in light/dark mode. Platform-font inspection confirmed local
  `GoogleSansFlex-Regular` renders the title without runtime initialization.
- The related browser suite covers geometry, font overrides, iOS isolation, colors,
  shared markup, RTL, tablet layout and Ionic contracts. The final item-height
  adjustment passed 14 targeted checks, including equal wrapped-title height with
  and without a note, total content-plus-padding height and non-overlapping lines.
- The remaining 29 dynamic-color unit tests passed. Theme build and lint passed
  after the item-height adjustment; production demo build, Android packaging and
  packed ESM imports passed during the CSS-only typography validation. The demo
  has a bundle-budget warning: approximately 2.25MB versus 2MB.
- Baselines are generated in CI via `/update-screenshots`. The updated Item/List
  screenshots were reviewed in light/dark and ordinary/device-color variants.
  The PR checks are the authoritative record for the final tested commit.
- Final review added 200% text-size coverage for wrapped headings; all 61 related
  browser checks passed. Unitless heading line height preserves the default
  proportions while preventing overlap at enlarged sizes. A clean-build/package
  check also verified that deleted TS helpers cannot remain in the npm output.

The native icon-free toggle reference covers the checked state only; network
settings were not changed for another state. Web tests cover other states. Tablet
and RTL checks are regression coverage, not native tablet pixel acceptance.
Other components in the map remain outside this measured subset.

## Repeat the checks

1. Install dependencies in the repository and `demo`, build the theme, then run
   `cd demo && npx playwright test e2e/android17-geometry.spec.ts e2e/android-settings-regressions.spec.ts`.
   Use an unused local server port if another checkout is running.
2. For device comparison, record build, density, font scale, locale, appearance,
   viewport and system insets. Capture native Display Settings and its accessibility
   hierarchy without changing functional settings.
3. Build/install the demo on the same device. Render the
   [same-content fixture](../../demo/e2e/fixtures/android17-settings.html) inside
   its `ion-app`, matching the displayed brightness text. Capture light and dark
   states with the same viewport, then restore the original appearance.
4. Measure layout bounds, text line boxes, padding and painted extents separately.
   Keep native reference and web results distinct; do not infer glyph equality
   from matching outer bounds.

Original native captures and temporary instrumentation were local investigation
artifacts and are not distributed. They are not reproducible screenshot baselines.
Internet-panel images may contain network information. The repository's CI-generated
web baselines and [E2E guide](../e2e-testing.md) provide the maintained regression path.
