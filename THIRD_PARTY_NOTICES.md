The RGB mixing, shade/tint, contrast selection, and stepped-color algorithms in
`src/dynamic-colors.ts` are adapted from Ionic Docs (Ionic Team), Apache-2.0. Copyright 2016 Drifty Co.:

- https://github.com/ionic-team/ionic-docs/blob/019986b8ef86f7ad235ceefa34e3ac40e617b0ba/src/components/page/theming/_utils/color.ts
- https://github.com/ionic-team/ionic-docs/blob/019986b8ef86f7ad235ceefa34e3ac40e617b0ba/src/components/page/theming/_utils/index.tsx

Changes: hex-only inputs, tuple RGB representation, role-to-token mapping, and
runtime application/caching. The original RGB/HSL parsing and UI are omitted.
The license is reproduced in `docs/licenses/ionic-docs-Apache-2.0.txt`.

`settingsBackIcon` in `src/settings-icons.ts` uses the Material Symbols
`arrow_back` outlined 24px vector, Google, Apache-2.0:

- https://github.com/google/material-design-icons/blob/master/symbols/web/arrow_back/materialsymbolsoutlined/arrow_back_24px.svg

Changes: removed fixed width/height attributes for Ionic's icon sizing.
The license is reproduced in `docs/licenses/material-design-icons-Apache-2.0.txt`.
