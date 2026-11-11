import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const theme = await Promise.all(
  ['default-variables', 'ionic-theme-md3'].map((name) => readFile(new URL(`../dist/css/${name}.css`, import.meta.url), 'utf8')),
);
const output = new URL('../dist/styles/', import.meta.url);
await rm(new URL('../dist/preset/', import.meta.url), { recursive: true, force: true });
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(new URL('theme.css', output), `${theme.join('\n')}\n`);
