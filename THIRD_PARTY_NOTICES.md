The RGB mixing, shade/tint, contrast selection, and stepped-color algorithms in
`src/dynamic-colors.ts` are adapted from Ionic Docs (Ionic Team), Apache-2.0. Copyright 2016 Drifty Co.:

- https://github.com/ionic-team/ionic-docs/blob/019986b8ef86f7ad235ceefa34e3ac40e617b0ba/src/components/page/theming/_utils/color.ts
- https://github.com/ionic-team/ionic-docs/blob/019986b8ef86f7ad235ceefa34e3ac40e617b0ba/src/components/page/theming/_utils/index.tsx

Changes: hex-only inputs, tuple RGB representation, role-to-token mapping, and
runtime application/caching. The original RGB/HSL parsing and UI are omitted.
The license is reproduced in `docs/licenses/ionic-docs-Apache-2.0.txt`.
