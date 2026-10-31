// Live-stream gift ledger for the control panel. Bilibili reports gift and
// subscription prices in gold coins (1000 coins = 1 CNY) and Super Chat prices
// in CNY. The top-up unit shown to viewers is the battery: 1 CNY = 10 batteries,
// so 100 gold coins = 1 battery.

export const COIN_PER_BATTERY = 100;
export const BATTERY_PER_YUAN = 10;

export function roundBattery(value) {
  return Math.round(value * 100) / 100;
}

export function batteryFromCoin(coin) {
  const value = Number(coin);
  return Number.isFinite(value) && value >= 0 ? roundBattery(value / COIN_PER_BATTERY) : null;
}

export function batteryFromYuan(yuan) {
  const value = Number(yuan);
  return Number.isFinite(value) && value >= 0 ? roundBattery(value * BATTERY_PER_YUAN) : null;
}

const KIND_ORDER = {guard: 0, sc: 1, gift: 2};

function compareItems(a, b) {
  const kind = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
  if (kind) return kind;
  if (a.kind === 'guard') return a.level - b.level;
  if (a.kind === 'sc') return a.firstSeen - b.firstSeen;
  return (Number(b.battery ?? 0) - Number(a.battery ?? 0)) || (b.count - a.count);
}

function compareViewers(a, b) {
  return (b.totalBattery - a.totalBattery) || (a.firstSeen - b.firstSeen) || (a.order - b.order);
}

export class HistoryLedger {
  room = null;
  viewers = new Map();
  order = 0;
  seen = new Map();

  reset(room = null) {
    this.room = room == null ? null : String(room);
    this.viewers.clear();
    this.order = 0;
    this.seen.clear();
  }

  clear() {
    this.viewers.clear();
    this.order = 0;
    this.seen.clear();
  }

  load(snapshot) {
    this.reset(snapshot?.room ?? null);
    for (const source of snapshot?.viewers ?? []) {
      const uid = source.uid == null ? '' : String(source.uid);
      const user = source.user == null ? '' : String(source.user);
      const viewer = {
        key: uid ? `uid:${uid}` : `name:${user}`,
        uid,
        user,
        avatar: source.avatar == null ? null : String(source.avatar),
        firstSeen: Number(source.firstSeen) || 0,
        lastSeen: Number(source.firstSeen) || 0,
        order: this.order++,
        items: [],
        totalBattery: Number(source.totalBattery) || 0,
        unknownBattery: !!source.unknownBattery
      };
      for (const item of source.items ?? []) {
        if (item.kind === 'gift') {
          viewer.items.push({kind: 'gift', giftId: String(item.giftId ?? ''), name: String(item.name ?? ''), count: Number(item.count) || 0, battery: Number(item.battery) || 0, unknownBattery: !!item.unknownBattery, firstSeen: Number(item.firstSeen) || viewer.firstSeen});
        } else if (item.kind === 'guard') {
          viewer.items.push({kind: 'guard', level: item.level, purchases: Number(item.purchases) || 0, months: Number(item.months) || 0, allMonths: !!item.allMonths, unit: item.unit == null ? null : String(item.unit), battery: Number(item.battery) || 0, unknownBattery: !!item.unknownBattery, firstSeen: Number(item.firstSeen) || viewer.firstSeen});
        } else if (item.kind === 'sc') {
          viewer.items.push({kind: 'sc', id: String(item.id ?? ''), price: Number(item.price) || 0, message: String(item.message ?? ''), battery: item.battery == null ? null : Number(item.battery), unknownBattery: !!item.unknownBattery, firstSeen: Number(item.firstSeen) || viewer.firstSeen});
        }
      }
      this.viewers.set(viewer.key, viewer);
    }
  }

  updateViewer(uid, patch = {}) {
    const id = uid == null ? '' : String(uid);
    if (!id) return false;
    return this.updateViewerByKey(`uid:${id}`, patch);
  }

  updateViewerByName(name, patch = {}) {
    return this.updateViewerByKey(`name:${name == null ? '' : String(name)}`, patch);
  }

  updateViewerByKey(key, patch = {}) {
    const viewer = this.viewers.get(String(key ?? ''));
    if (!viewer) return false;
    let changed = false;
    if (patch.user && viewer.user !== String(patch.user)) {
      viewer.user = String(patch.user);
      changed = true;
    }
    if (typeof patch.avatar === 'string' && patch.avatar && viewer.avatar !== patch.avatar) {
      viewer.avatar = patch.avatar;
      changed = true;
    }
    return changed;
  }

  accept(key, now) {
    if (!key) return true;
    // Guards can arrive twice (GUARD_BUY plus a rich toast). Keep the same
    // five-minute window as the animation queue while allowing a later repeat.
    for (const [seenKey, time] of this.seen) if (now - time > 300000) this.seen.delete(seenKey);
    if (this.seen.has(key)) return false;
    this.seen.set(key, now);
    if (this.seen.size > 50000) this.seen.delete(this.seen.keys().next().value);
    return true;
  }

  viewer(uid, user, now) {
    const id = uid == null ? '' : String(uid);
    const key = id ? `uid:${id}` : `name:${user == null ? '' : String(user)}`;
    let viewer = this.viewers.get(key);
    if (!viewer) {
      viewer = {key, uid: id, user: user == null ? '' : String(user), avatar: null, firstSeen: now, lastSeen: now, order: this.order++, items: [], totalBattery: 0, unknownBattery: false};
      this.viewers.set(key, viewer);
    }
    if (user) viewer.user = String(user);
    viewer.lastSeen = now;
    return viewer;
  }

  addGift(gift, now = Date.now()) {
    if (!gift || gift.demo) return false;
    // Free/0-battery gifts are not part of the thank-you history. The live
    // "recent gifts" list and the overlay still follow their own settings.
    const battery = batteryFromCoin(gift.totalCoin);
    if (battery === 0) return false;
    if (!this.accept(`gift:${gift.id ?? ''}`, now)) return false;
    const viewer = this.viewer(gift.uid, gift.user, now);
    const giftId = gift.giftId == null ? '' : String(gift.giftId);
    let item = viewer.items.find(entry => entry.kind === 'gift' && entry.giftId === giftId);
    if (!item) {
      item = {kind: 'gift', giftId, name: '', count: 0, battery: 0, unknownBattery: false, firstSeen: now};
      viewer.items.push(item);
    }
    item.count += Number.isSafeInteger(gift.count) ? gift.count : 0;
    if (gift.name) item.name = String(gift.name);
    if (battery == null) {
      item.unknownBattery = true;
      viewer.unknownBattery = true;
    } else {
      item.battery = roundBattery(item.battery + battery);
      viewer.totalBattery = roundBattery(viewer.totalBattery + battery);
    }
    return true;
  }

  addGuard(guard, now = Date.now()) {
    if (!guard || guard.demo) return false;
    if (!this.accept(`guard:${guard.key ?? guard.id ?? ''}`, now)) return false;
    const viewer = this.viewer(guard.uid, guard.user, now);
    let item = viewer.items.find(entry => entry.kind === 'guard' && entry.level === guard.level);
    const unit = typeof guard.unit === 'string' && guard.unit ? guard.unit : null;
    const count = Number.isSafeInteger(guard.count) && guard.count > 0 ? guard.count : 0;
    const price = guard.price == null ? NaN : Number(guard.price);
    const battery = Number.isFinite(price) && price >= 0 ? batteryFromCoin(price * count) : null;
    if (!item) {
      item = {kind: 'guard', level: guard.level, purchases: 0, months: 0, allMonths: true, unit, battery: 0, unknownBattery: false, firstSeen: now};
      viewer.items.push(item);
    }
    if (item.purchases === 0) {
      item.unit = unit;
      item.allMonths = unit === '月';
      item.months = unit === '月' ? count : 0;
    } else {
      if (unit !== '月') item.allMonths = false;
      if (item.unit !== unit) item.unit = null;
      if (unit === '月') item.months += count;
    }
    item.purchases += 1;
    if (battery == null) {
      item.unknownBattery = true;
      viewer.unknownBattery = true;
    } else {
      item.battery = roundBattery(item.battery + battery);
      viewer.totalBattery = roundBattery(viewer.totalBattery + battery);
    }
    return true;
  }

  addSC(sc, now = Date.now()) {
    if (!sc || sc.demo) return false;
    if (!this.accept(`sc:${sc.id ?? ''}`, now)) return false;
    const viewer = this.viewer(sc.uid, sc.user, now);
    const price = sc.price == null ? NaN : Number(sc.price);
    const battery = Number.isFinite(price) && price >= 0 ? batteryFromYuan(price) : null;
    const item = {
      kind: 'sc',
      id: sc.id == null ? '' : String(sc.id),
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      message: String(sc.message ?? ''),
      battery,
      unknownBattery: battery == null,
      firstSeen: now
    };
    viewer.items.push(item);
    if (battery == null) viewer.unknownBattery = true;
    else viewer.totalBattery = roundBattery(viewer.totalBattery + battery);
    return true;
  }

  snapshot() {
    const viewers = [...this.viewers.values()].map(viewer => ({
      uid: viewer.uid,
      user: viewer.user,
      avatar: viewer.avatar,
      firstSeen: viewer.firstSeen,
      order: viewer.order,
      totalBattery: roundBattery(viewer.totalBattery),
      unknownBattery: viewer.unknownBattery,
      items: viewer.items.map(item => {
        if (item.kind === 'gift') return {kind: 'gift', giftId: item.giftId, name: item.name, count: item.count, battery: item.battery, unknownBattery: item.unknownBattery, firstSeen: item.firstSeen};
        if (item.kind === 'guard') return {kind: 'guard', level: item.level, purchases: item.purchases, months: item.months, allMonths: item.allMonths, unit: item.unit, battery: item.battery, unknownBattery: item.unknownBattery, firstSeen: item.firstSeen};
        return {kind: 'sc', id: item.id, price: item.price, message: item.message, battery: item.battery, unknownBattery: item.unknownBattery, firstSeen: item.firstSeen};
      }).sort(compareItems)
    })).sort(compareViewers);
    let battery = 0;
    let unknownBattery = false;
    for (const viewer of viewers) {
      battery += viewer.totalBattery;
      unknownBattery = unknownBattery || viewer.unknownBattery;
    }
    return {room: this.room, viewers, viewerCount: viewers.length, battery: roundBattery(battery), unknownBattery};
  }
}
