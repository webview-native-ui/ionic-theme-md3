import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const match = workflow.match(/const isPublished = \(spec, archive\) => \{([\s\S]*?)\n          \};/);
assert(match, 'Expected the release workflow to define isPublished');
const archive = Buffer.from('immutable npm candidate archive');
const integrity = 'sha512-' + createHash('sha512').update(archive).digest('base64');
const publishCode = workflow.slice(
  workflow.indexOf('const isPublished ='),
  workflow.indexOf('\n          JS', workflow.indexOf('const isPublished =')),
);

const checkPublished = (published) => {
  const isPublished = new Function('spawnSync', 'assert', 'createHash', 'readFileSync', `return (spec, archive) => {${match[1]}\n};`)(
    (command, args) => {
      assert.equal(command, 'npm');
      assert.equal(args[0], 'view');
      return { status: 0, stdout: JSON.stringify(published) };
    },
    assert,
    createHash,
    () => archive,
  );
  return isPublished('@rdlabo/ionic-theme-md3@1.0.0-beta.test', 'candidate.tgz');
};

test('existing npm versions accept matching scalar and singleton-array integrity responses', () => {
  assert.equal(checkPublished(integrity), true);
  assert.equal(checkPublished([integrity]), true);
});

test('existing npm versions reject mismatched, empty, or ambiguous integrity responses', () => {
  for (const published of ['sha512-other', ['sha512-other'], [], [integrity, integrity], [integrity, 'sha512-other'], null, {}]) {
    assert.throws(() => checkPublished(published), { code: 'ERR_ASSERTION' });
  }
});

const runWorkflow = (spawnSync, setTimeout) => {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  const run = new AsyncFunction(
    'spawnSync',
    'assert',
    'createHash',
    'readFileSync',
    'archives',
    'EXPECTED_VERSION',
    'DIST_TAG',
    'console',
    'process',
    'setTimeout',
    publishCode,
  );
  return run(
    spawnSync,
    assert,
    createHash,
    () => archive,
    new Map([['@rdlabo/ionic-theme-md3', 'candidate.tgz']]),
    '1.0.0-beta.test',
    'beta',
    { log() {} },
    { stdout: { write() {} }, stderr: { write() {} } },
    setTimeout,
  );
};

test('the workflow skips npm publish for matching scalar and singleton-array responses', async () => {
  for (const published of [integrity, [integrity]]) {
    const commands = [];
    await runWorkflow((command, args) => {
      commands.push(args[0]);
      assert.equal(command, 'npm');
      assert.equal(args[0], 'view', 'A matching published archive must skip npm publish');
      return { status: 0, stdout: JSON.stringify(published) };
    });
    assert.deepEqual(commands, ['view']);
  }
});

const notVisible = { status: 1, stdout: JSON.stringify({ error: { code: 'E404' } }), stderr: '' };

const simulateConflict = async (resolveView, code = 'E409') => {
  let views = 0;
  let publishes = 0;
  const delays = [];
  const result = runWorkflow(
    (command, args) => {
      assert.equal(command, 'npm');
      if (args[0] === 'view') return resolveView(++views);
      assert.equal(args[0], 'publish');
      publishes++;
      return { status: 1, stdout: JSON.stringify({ error: { code } }), stderr: '' };
    },
    (resolve, delay) => {
      delays.push(delay);
      resolve();
    },
  );
  return { result, delays, views: () => views, publishes: () => publishes };
};

test('E409 checks beyond the old reflection window and accepts a matching array without republishing', async () => {
  const run = await simulateConflict((view) => (view <= 7 ? notVisible : { status: 0, stdout: JSON.stringify([integrity]) }));
  await run.result;
  assert.equal(run.publishes(), 1);
  assert.equal(run.views(), 8);
  assert.deepEqual(run.delays, [2000, 4000, 8000, 16000, 30000, 60000]);
});

test('E409 stops after a bounded five-minute reflection budget', async () => {
  const run = await simulateConflict(() => notVisible);
  await assert.rejects(run.result, /no matching public version became visible/);
  assert.equal(run.publishes(), 1);
  assert.equal(run.views(), 11);
  assert.equal(
    run.delays.reduce((sum, delay) => sum + delay, 0),
    300000,
  );
});

test('other publish errors receive no extended reflection polling', async () => {
  const run = await simulateConflict(() => notVisible, 'E403');
  await assert.rejects(run.result, /no matching public version became visible/);
  assert.equal(run.publishes(), 1);
  assert.equal(run.views(), 2);
  assert.deepEqual(run.delays, []);
});

test('E409 fails immediately when a reflected version has a different integrity', async () => {
  const run = await simulateConflict((view) => (view === 1 ? notVisible : { status: 0, stdout: JSON.stringify(['sha512-other']) }));
  await assert.rejects(run.result, /already exists with different contents/);
  assert.equal(run.publishes(), 1);
  assert.equal(run.views(), 2);
  assert.deepEqual(run.delays, []);
});
