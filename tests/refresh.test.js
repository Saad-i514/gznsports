import test from 'node:test';
import assert from 'node:assert/strict';
import { coalesceRefresh } from '../src/lib/refresh-loop.js';

test('refresh bursts are serialized into one trailing request', async () => {
  let calls = 0;
  let finish;
  let active = 0;
  const refresh = coalesceRefresh(async () => {
    assert.equal(++active, 1);
    calls++;
    if (calls === 1) await new Promise(resolve => { finish = resolve; });
    active--;
  });
  const first = refresh();
  refresh(); refresh(); refresh();
  assert.equal(calls, 1);
  finish();
  await first;
  assert.equal(calls, 2);
  await refresh();
  assert.equal(calls, 3);
});

test('a failed refresh does not lock future refreshes', async () => {
  let calls = 0;
  const refresh = coalesceRefresh(async () => { if (++calls === 1) throw Error('offline'); });
  await assert.rejects(refresh(), /offline/);
  await refresh();
  assert.equal(calls, 2);
});
