# Android 17 pixel alignment — measured control pass

Base: `8a67646` (#63). Scope: Toolbar/back, grouped list headings/rows,
icon-free Toggle, Radio and Range. The [component map](android17-component-map-2026-11-09.md)
records the reference screens and components outside this pass.

## Reference and method

Pixel 8a, Android 17 `CP2A.260705.006`, 1080×2400, density 420, font scale 1.0,
Japanese; WebView DPR 2.625. Native Settings is the source of truth. Internet-panel
Toggle geometry is from SystemUI, not the icon-bearing Settings variant.

Native accessibility bounds, raster crops and actual Settings TextViews were
measured separately. A temporary instrumentation probe instantiated TextViews
with Settings' own PreferenceTitle/PreferenceSummary text appearances. It found
GoogleSansFlex, title weight 500/optical size 16 and body weight 400/optical size 14.
The native 14sp text size rounds to 37 physical pixels; Japanese title/summary
layout heights are 62/55 physical pixels. A Latin `64%` summary is 50 pixels high.
These differences explained the earlier baseline error and accumulated row drift.

The final production demo was packaged and installed as the separate
`io.ionic.theme.md3.review` app. The final APK does not contain the temporary
instrumentation. Comparisons below use installed source CSS, without runtime CSS
injection. The [same-content fixture](../../demo/e2e/fixtures/android17-settings.html)
was loaded into that WebView. Its brightness text was 64% for the light reference
and 70% for the dark reference. System brightness was not changed for this test.

## Results

| Part | Native reference | Final implementation/check |
| --- | --- | --- |
| Icon-free checked Toggle | Internet panel track 137×73 physical px, thumb 53×53 | 52×28 CSS px, thumb 20×20; all 12 installed demo toggles checked |
| Back circle / hit target | Circle 105×105 physical px = 40dp | 40px paint, existing 56px target retained |
| Back arrow | Native glyph differs from Ionic | Ionic default retained; glyph matching is outside theme scope |
| Toolbar title | 22sp text | 22px / 28px, start padding 12px, tracking −0.0125em |
| First heading / group | Heading layout y≈126.10dp, group y≈158.10dp | y=126 / 158 CSS px |
| Two-line grouped rows | Title 16sp, summary 14sp, native fallback padding | 16/14px default; optional local font metrics and device-pixel rounding align TextView boxes |
| Group gaps | 2dp rounds to 5 physical px | Optional DPR-aware gap rounding; ordinary theme remains 2px |
| Toggle rows | Native Japanese title + 16dp padding each side | Default min-height 56px; optional Settings font uses intrinsic label height with 16px padding |
| Radio | Approximately 72dp row, 20dp circle | Grouped row minimum 72px; existing 20px circle retained |
| Range | 16dp track, approximately 4×44dp handle | Existing dimensions retained |

[Raw ink-bound measurements](android17-pixel-measurements-2026-11-09.json) record
native/web coordinates, masks, crops and deltas. In light and dark, all 11 sampled
text regions (toolbar, titles, toggle labels and summaries through the final row)
have bounding edges within **1 physical pixel**. Back-arrow measurements from the removed custom-icon experiment are excluded.
Matching bounding boxes is
not equality of every antialiased glyph pixel. No screenshot tolerance, device-
specific translation, or background recoloring was used to hide these differences.

## Ionic compatibility

- #63's palette semantics and white default surfaces are unchanged. Pixel Settings
  surface RGB is not imposed on ordinary Ionic components.
- `color`, local sizing variables, explicit icons, `enableOnOffLabels`, component
  opt-out and existing interaction APIs remain available.
- The default Toggle is icon-free; the public optional icon helper remains.
- Local Settings fonts are a separate optional stylesheet/helper. Default theme
  consumers retain their application font. No platform font is bundled/downloaded.
  This variant is calibrated for the Japanese Pixel font stack, not every locale/OEM.
- Back-arrow selection remains Ionic's responsibility; no replacement icon is bundled.
- Compound navigation-plus-switch rows are not forced onto plain Ionic toggle rows.

## Validation and acceptance boundary

60 browser tests passed: light/dark geometry, Ionic default back-arrow rendering,
explicit icon/size overrides, optional font lifecycle and DPR changes, palette
inheritance, overlays/Searchbar contrast, shared markup, RTL, tablet layout and
Ionic contracts. 31 unit tests passed. Theme build, production demo build, Android
packaging, lint and packed ESM import checks passed. Production demo build retains
an initial-bundle budget warning (2.25MB versus 2MB).

The final installed app's Toggle, Radio, Range and Item/List pages were captured
and visually inspected in light and dark (8 captures), in addition to the two
same-content fixtures. The icon-free native Toggle reference is checked only;
network settings were not changed to obtain another state. Disabled/on/off states
are covered in the web demo/tests, not claimed as separately measured native states.
Tablet layout/RTL tests are regression checks, not native tablet pixel acceptance.
Other components in the map still need their own native references.

## Reproducing the comparison

1. Build the theme and demo using the repository scripts. Run the demo E2E
   geometry checks with `cd demo && npx playwright test e2e/android17-geometry.spec.ts`.
2. For native comparison, use a Pixel with the build, density, font scale and
   locale recorded above. Open Display Settings, capture its image and accessibility
   hierarchy, and record the displayed brightness value without changing it.
3. Install the demo on that device and enable its optional Settings typography.
   Render `demo/e2e/fixtures/android17-settings.html` inside the demo's `ion-app`,
   matching the brightness text. Use the same viewport/system insets and appearance.
4. Compare the text-only crop rectangles in the measurement JSON. The recorded
   bounds use an RGB mask: light `max(channel) < 180`, dark `max(channel) > 110`;
   right/bottom bounds are exclusive. These are ink bounds, not per-pixel similarity.
   Exclude other controls from the crop. Keep native/web measurements separate.
5. Compare control paint independently of accessibility/touch bounds. Repeat for
   dark mode and restore the device's original appearance after capture.

The measurement JSON is retained in the repository. Original native/device
captures and the temporary TextView instrumentation were local investigation
artifacts and are not included; the raw screenshots cannot be recovered from this
report. Do not treat their absence as a reproducible screenshot baseline. Native
Internet-panel images can include network information and must not be published
without removing it. Platform font files and reference APKs are not distributed.

PR screenshot baselines are generated by `/update-screenshots` in CI and reviewed
separately. See [E2E testing](../e2e-testing.md) for the contributor workflow.
