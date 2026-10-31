import {readFile, writeFile, mkdir, rm, rename, chmod} from 'node:fs/promises';
import path from 'node:path';
import {runtimeRoot} from './paths.mjs';

const COOKIE_NAMES = new Set(['SESSDATA', 'bili_jct', 'DedeUserID', 'DedeUserID__ckMd5', 'sid', 'buvid3', 'buvid4', 'b_nut']);
const LOGIN_URL = 'https://passport.bilibili.com/x/passport-login/web/qrcode/generate';
const POLL_URL = 'https://passport.bilibili.com/x/passport-login/web/qrcode/poll';
const NAV_URL = 'https://api.bilibili.com/x/web-interface/nav';
const UA = 'Mozilla/5.0';

function headerCookie(name, value) {
  return `${name}=${value}`;
}

export function parseCookieString(input) {
  const text = String(input ?? '').replace(/^Cookie:\s*/i, '').trim();
  if (!text) return {};
  const out = {};
  if (!text.includes('=')) {
    out.SESSDATA = text;
    return out;
  }
  for (const part of text.split(/;\s*/)) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!value || !(COOKIE_NAMES.has(name) || name.startsWith('DedeUserID'))) continue;
    out[name] = value;
  }
  return out;
}

function parseSetCookies(headers) {
  const out = {};
  const list = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];
  for (const line of list) {
    const pair = String(line).split(';')[0];
    const index = pair.indexOf('=');
    if (index <= 0) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (COOKIE_NAMES.has(name) || name.startsWith('DedeUserID')) out[name] = value;
  }
  return out;
}

function parseLoginUrl(value) {
  const out = {};
  try {
    const url = new URL(String(value));
    for (const name of COOKIE_NAMES) {
      const item = url.searchParams.get(name);
      if (item) out[name] = item;
    }
  } catch {}
  return out;
}

function cookieHeader(cookies) {
  return Object.entries(cookies ?? {})
    .filter(([name, value]) => value && (COOKIE_NAMES.has(name) || name.startsWith('DedeUserID')))
    .map(([name, value]) => headerCookie(name, value))
    .join('; ');
}

export class LoginStore {
  state = {cookies: {}, uid: '', user: '', avatar: null, loggedIn: false, verifiedAt: 0, remembered: false};
  qrRemember = false;

  constructor({file = path.join(runtimeRoot, 'data/login.json'), fetchImpl = fetch, cacheImage = null} = {}) {
    this.file = file;
    this.fetchImpl = fetchImpl;
    this.cacheImage = cacheImage;
  }

  status() {
    return {
      loggedIn: !!this.state.loggedIn,
      uid: String(this.state.uid ?? ''),
      user: String(this.state.user ?? ''),
      avatar: this.state.avatar ?? null,
      verifiedAt: Number(this.state.verifiedAt) || 0,
      remembered: !!this.state.remembered
    };
  }

  auth() {
    return {cookie: cookieHeader(this.state.cookies), uid: String(this.state.uid ?? ''), buvid3: String(this.state.cookies.buvid3 ?? '')};
  }

  cookieHeader() {
    return cookieHeader(this.state.cookies);
  }

  async load() {
    try {
      const saved = JSON.parse(await readFile(this.file, 'utf8'));
      if (saved && typeof saved === 'object' && saved.cookies) {
        this.state = {
          cookies: saved.cookies,
          uid: String(saved.uid ?? ''),
          user: String(saved.user ?? ''),
          avatar: saved.avatar ?? null,
          loggedIn: !!saved.loggedIn,
          verifiedAt: Number(saved.verifiedAt) || 0,
          remembered: !!saved.remembered
        };
      }
    } catch {}
    return this.status();
  }

  async persist(remember) {
    if (!remember) {
      await rm(this.file, {force: true}).catch(() => {});
      this.state.remembered = false;
      return;
    }
    await mkdir(path.dirname(this.file), {recursive: true});
    const temp = `${this.file}.tmp`;
    await writeFile(temp, JSON.stringify({...this.state, remembered: true}), {mode: 0o600});
    await rename(temp, this.file);
    await chmod(this.file, 0o600).catch(() => {});
    this.state.remembered = true;
  }

  async verify(cookies = this.state.cookies) {
    const header = cookieHeader(cookies);
    if (!header) throw Error('auth');
    const response = await this.fetchImpl(NAV_URL, {
      headers: {'User-Agent': UA, Referer: 'https://www.bilibili.com/', Cookie: header},
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw Error('failed');
    const json = await response.json();
    if (!json?.data?.isLogin) throw Error('auth');
    let avatar = json.data.face ?? null;
    if (avatar && this.cacheImage) avatar = await this.cacheImage(avatar).catch(() => null) ?? avatar;
    return {uid: String(json.data.mid ?? ''), user: String(json.data.uname ?? ''), avatar};
  }

  async setCookies(cookies, {remember = false} = {}) {
    const next = {...cookies};
    if (!next.SESSDATA) throw Error('auth');
    const profile = await this.verify(next);
    this.state = {
      cookies: next,
      uid: profile.uid,
      user: profile.user,
      avatar: profile.avatar,
      loggedIn: true,
      verifiedAt: Date.now(),
      remembered: false
    };
    await this.persist(!!remember);
    return this.status();
  }

  async startQR(remember = false) {
    const response = await this.fetchImpl(LOGIN_URL, {headers: {'User-Agent': UA, Referer: 'https://www.bilibili.com/'}, signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw Error('failed');
    const json = await response.json();
    if (json?.code !== 0 || !json.data?.url || !json.data?.qrcode_key) throw Error('failed');
    this.qrRemember = !!remember;
    return {url: String(json.data.url), key: String(json.data.qrcode_key)};
  }

  async pollQR(key) {
    const response = await this.fetchImpl(`${POLL_URL}?qrcode_key=${encodeURIComponent(String(key ?? ''))}`, {
      headers: {'User-Agent': UA, Referer: 'https://www.bilibili.com/'},
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw Error('failed');
    const setCookies = parseSetCookies(response.headers);
    const json = await response.json();
    const code = Number(json?.data?.code);
    if (code === 0) {
      const cookies = {...parseLoginUrl(json.data?.url), ...setCookies};
      if (!cookies.SESSDATA) throw Error('auth');
      const status = await this.setCookies(cookies, {remember: this.qrRemember});
      this.qrRemember = false;
      return {status: 'success', login: status};
    }
    if (code === 86090) return {status: 'scanned'};
    if (code === 86038) return {status: 'expired'};
    return {status: 'waiting'};
  }

  async logout() {
    this.state = {cookies: {}, uid: '', user: '', avatar: null, loggedIn: false, verifiedAt: 0, remembered: false};
    this.qrRemember = false;
    await rm(this.file, {force: true}).catch(() => {});
    return this.status();
  }
}
