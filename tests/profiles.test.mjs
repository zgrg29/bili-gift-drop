import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Profiles} from '../src/server/profiles.mjs';

function catalog() {
  return {
    async cacheImage(url) {
      if (url?.includes('avatar')) return '/cache/avatar';
      return null;
    }
  };
}

test('profile lookup returns the public nickname and cached avatar without login', async () => {
  const original = globalThis.fetch;
  let calls = [];
  try {
    globalThis.fetch = async url => {
      calls.push(url);
      if (url.includes('Master/info')) return {ok: true, json: async () => ({code: 0, data: {info: {uname: '完整昵称', face: 'https://i0.hdslb.com/avatar.jpg'}}})};
      throw Error('should not call fallback');
    };
    const profiles = new Profiles(catalog());
    const first = await profiles.resolve('9', null);
    assert.deepEqual(first, {name: '完整昵称', avatar: '/cache/avatar'});
    const second = await profiles.resolve('9', null);
    assert.deepEqual(second, first);
    assert.equal(calls.length, 1, 'successful profile is cached');
  } finally {
    globalThis.fetch = original;
  }
});

test('profile lookup uses an event avatar when the public profile fails and backs off', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls += 1;
      throw Error('unavailable');
    };
    const profiles = new Profiles(catalog());
    const profile = await profiles.resolve('10', 'https://i0.hdslb.com/avatar.jpg');
    assert.deepEqual(profile, {name: null, avatar: '/cache/avatar'});
    const again = await profiles.resolve('10', 'https://i0.hdslb.com/avatar.jpg');
    assert.deepEqual(again, profile);
    assert.equal(calls, 2, 'failure is retried no more than the two profile endpoints');
    assert.deepEqual(await profiles.resolve('bad', 'https://i0.hdslb.com/avatar.jpg'), {name: null, avatar: '/cache/avatar'});
    assert.equal(calls, 2, 'invalid UID never reaches the network');
  } finally {
    globalThis.fetch = original;
  }
});

test('concurrent lookups for one UID share a single request', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  try {
    globalThis.fetch = async () => {
      calls += 1;
      await gate;
      return {ok: true, json: async () => ({code: 0, data: {info: {uname: '并发昵称', face: 'https://i0.hdslb.com/avatar.jpg'}}})};
    };
    const profiles = new Profiles(catalog());
    const a = profiles.resolve('11', null);
    const b = profiles.resolve('11', null);
    release();
    const [first, second] = await Promise.all([a, b]);
    assert.deepEqual(first, {name: '并发昵称', avatar: '/cache/avatar'});
    assert.deepEqual(second, first);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
