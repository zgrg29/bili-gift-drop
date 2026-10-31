import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {LoginStore,parseCookieString} from '../src/server/login.mjs';

test('cookie parsing accepts SESSDATA-only and full cookie strings', () => {
  assert.deepEqual(parseCookieString('SESSDATA=abc'), {SESSDATA: 'abc'});
  assert.deepEqual(parseCookieString('SESSDATA=abc; bili_jct=def; DedeUserID=123; sid=xyz; ignored=1'), {SESSDATA: 'abc', bili_jct: 'def', DedeUserID: '123', sid: 'xyz'});
  assert.deepEqual(parseCookieString('Cookie: SESSDATA=abc; DedeUserID=9'), {SESSDATA: 'abc', DedeUserID: '9'});
  assert.deepEqual(parseCookieString('  '), {});
});

test('QR login stores verified profile without exposing cookies, persists and logs out', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'bili-login-test-'));
  const file = path.join(dir, 'login.json');
  const calls = [];
  try {
    const store = new LoginStore({
      file,
      cacheImage: async url => url.includes('avatar') ? '/cache/avatar' : null,
      fetchImpl: async (url, options) => {
        calls.push({url, options});
        if (url.includes('qrcode/generate')) return {ok: true, json: async () => ({code: 0, data: {url: 'https://passport.bilibili.com/h5-app/passport/login/scan?qrcode_key=key123', qrcode_key: 'key123'}})};
        if (url.includes('qrcode/poll')) return {
          ok: true,
          headers: {getSetCookie: () => ['SESSDATA=sess; Path=/; HttpOnly', 'bili_jct=csrf; Path=/']},
          json: async () => ({data: {code: 0, url: 'https://passport.biligame.com/crossDomain?DedeUserID=123&DedeUserID__ckMd5=abc&gourl=x'}})
        };
        if (url.includes('web-interface/nav')) {
          assert.match(options.headers.Cookie, /SESSDATA=sess/);
          return {ok: true, json: async () => ({data: {isLogin: true, mid: 123, uname: '测试主播', face: 'https://i0.hdslb.com/avatar.jpg'}})};
        }
        throw Error('unexpected ' + url);
      }
    });
    const qr = await store.startQR(true);
    assert.equal(qr.key, 'key123');
    assert.ok(qr.url.includes('qrcode_key=key123'));
    const pending = await store.pollQR('key123');
    assert.equal(pending.status, 'success');
    const status = store.status();
    assert.equal(status.loggedIn, true);
    assert.equal(status.uid, '123');
    assert.equal(status.user, '测试主播');
    assert.equal(status.avatar, '/cache/avatar');
    assert.equal(status.remembered, true);
    assert.equal(Object.hasOwn(status, 'cookies'), false, 'status never exposes cookies');
    assert.match(store.auth().cookie, /SESSDATA=sess/);
    assert.match(store.auth().cookie, /bili_jct=csrf/);
    assert.equal(store.auth().uid, '123');
    const saved = JSON.parse(await readFile(file, 'utf8'));
    assert.equal(saved.cookies.SESSDATA, 'sess');
    assert.equal(saved.user, '测试主播');
    const loaded = new LoginStore({file});
    await loaded.load();
    assert.equal(loaded.status().loggedIn, true);
    assert.equal(loaded.status().uid, '123');
    const out = await loaded.logout();
    assert.equal(out.loggedIn, false);
    await assert.rejects(readFile(file, 'utf8'));
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});

test('invalid login credentials are rejected and QR states map correctly', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'bili-login-test-'));
  const file = path.join(dir, 'login.json');
  try {
    let pollCode = 86101;
    const store = new LoginStore({
      file,
      fetchImpl: async url => {
        if (url.includes('qrcode/generate')) return {ok: true, json: async () => ({code: 0, data: {url: 'https://example.test/qr', qrcode_key: 'k'}})};
        if (url.includes('qrcode/poll')) return {ok: true, headers: {getSetCookie: () => []}, json: async () => ({data: {code: pollCode, url: ''}})};
        if (url.includes('web-interface/nav')) return {ok: true, json: async () => ({data: {isLogin: false}})};
        throw Error('unexpected');
      }
    });
    await store.startQR(false);
    assert.equal((await store.pollQR('k')).status, 'waiting');
    pollCode = 86090;
    assert.equal((await store.pollQR('k')).status, 'scanned');
    pollCode = 86038;
    assert.equal((await store.pollQR('k')).status, 'expired');
    await assert.rejects(store.setCookies({SESSDATA: 'invalid'}), /auth/);
    assert.equal(store.status().loggedIn, false);
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});
