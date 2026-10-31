// Public profile lookup for display names and avatars. This never uses the
// viewer's or streamer's login cookies; failures fall back to the event name.
export class Profiles {
  pending = new Map();
  results = new Map();

  constructor(catalog) {
    this.catalog = catalog;
  }

  normalize(value) {
    return typeof value === 'string' ? value.replace(/^http:/, 'https:').replace(/^\/\//, 'https://') : null;
  }

  async resolve(uid, face) {
    const id = String(uid ?? '');
    if (!/^[1-9]\d{0,19}$/.test(id)) return {name: null, avatar: await this.catalog.cacheImage(this.normalize(face)).catch(() => null)};
    const known = this.results.get(id);
    if (known && known.until > Date.now()) {
      if (!known.profile.avatar && face) {
        const direct = await this.catalog.cacheImage(this.normalize(face)).catch(() => null);
        if (direct) known.profile = {...known.profile, avatar: direct};
      }
      return known.profile;
    }
    if (this.pending.has(id)) return this.pending.get(id);
    if (this.pending.size >= 8) return {name: null, avatar: await this.catalog.cacheImage(this.normalize(face)).catch(() => null)};
    const task = (async () => {
      let name = null;
      let avatar = await this.catalog.cacheImage(this.normalize(face)).catch(() => null);
      for (const url of [`https://api.live.bilibili.com/live_user/v1/Master/info?uid=${id}`, `https://api.bilibili.com/x/web-interface/card?mid=${id}`]) {
        try {
          const response = await fetch(url, {
            headers: {'User-Agent': 'Mozilla/5.0', Referer: 'https://live.bilibili.com/'},
            redirect: 'error',
            signal: AbortSignal.timeout(4000)
          });
          if (!response.ok) continue;
          const json = await response.json();
          if (json.code !== 0) continue;
          const info = json.data?.info;
          const card = json.data?.card;
          const resolvedName = info?.uname ?? card?.name ?? null;
          if (resolvedName) name = String(resolvedName);
          const resolvedFace = info?.face ?? card?.face ?? null;
          if (!avatar && resolvedFace) avatar = await this.catalog.cacheImage(this.normalize(resolvedFace)).catch(() => null);
          if (name && avatar) break;
        } catch {}
      }
      return {name, avatar};
    })().then(profile => {
      this.results.delete(id);
      this.results.set(id, {profile, until: Date.now() + (profile.name ? 3600000 : 30000)});
      if (this.results.size > 512) this.results.delete(this.results.keys().next().value);
      return profile;
    }).finally(() => this.pending.delete(id));
    this.pending.set(id, task);
    return task;
  }
}
