import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { md3ThemeConfig, mdTransitionAnimation } from '../dist/index.js';

test('MD3 configuration supports defaults and application overrides during SSR', () => {
  assert.equal(md3ThemeConfig().mode, 'md');
  assert.equal(md3ThemeConfig().navAnimation, mdTransitionAnimation);
  assert.equal(md3ThemeConfig({ mode: undefined }).mode, 'md');
  assert.deepEqual(md3ThemeConfig({ mode: 'ios' }), { mode: 'ios' });
  const customAnimation = () => {};
  const existing = Object.freeze({ mode: 'md', navAnimation: customAnimation, animated: false });
  assert.deepEqual(md3ThemeConfig(existing), existing);
  assert.equal(md3ThemeConfig({ navAnimation: undefined }).navAnimation, undefined);
});

test('the single MD3 preset is ordered, exported and packed without stale variants', async () => {
  const cache = await mkdtemp(join(tmpdir(), 'md3-preset-pack-'));
  try {
    await writeFile(new URL('../dist/preset/stale.css', import.meta.url), 'stale');
    execFileSync(process.execPath, ['scripts/build-presets.mjs'], { cwd: new URL('../', import.meta.url) });
    assert.deepEqual(await readdir(new URL('../dist/preset/', import.meta.url)), ['default.css']);
    const [packed] = JSON.parse(
      execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json', '--cache', cache], {
        cwd: new URL('../', import.meta.url),
        encoding: 'utf8',
      }),
    );
    assert.deepEqual(
      packed.files.map(({ path }) => path).filter((path) => path.startsWith('dist/preset/')),
      ['dist/preset/default.css'],
    );
    const url = import.meta.resolve('@rdlabo/ionic-theme-md3/preset/default.css');
    const css = await readFile(new URL(url), 'utf8');
    const expected = await Promise.all(
      ['default-variables', 'ionic-theme-md3'].map((name) => readFile(new URL(`../dist/css/${name}.css`, import.meta.url), 'utf8')),
    );
    assert.equal(css, `${expected.join('\n')}\n`);
    assert(!css.includes('@import'));
    assert(!css.includes('sourceMappingURL='));
    for (const mode of ['system', 'class', 'always']) {
      assert.throws(() => import.meta.resolve(`@rdlabo/ionic-theme-md3/preset/${mode}.css`), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
    }
  } finally {
    await rm(cache, { recursive: true, force: true });
  }
});
