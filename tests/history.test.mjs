import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HistoryLedger, batteryFromCoin, batteryFromYuan, roundBattery} from '../src/shared/history.mjs';

const now=1800000000000;

test('battery conversion follows Bilibili units', () => {
  assert.equal(batteryFromCoin(100), 1);
  assert.equal(batteryFromCoin(198000), 1980);
  assert.equal(batteryFromCoin(198000 * 2), 3960);
  assert.equal(batteryFromYuan(30), 300);
  assert.equal(batteryFromYuan(1), 10);
  assert.equal(batteryFromCoin(-1), null);
  assert.equal(batteryFromCoin('bad'), null);
  assert.equal(batteryFromYuan(undefined), null);
  assert.equal(roundBattery(1.234), 1.23);
});

function gift(id, over = {}) {
  return {id, giftId: 100, name: '辣条', user: '观众A', uid: '1', count: 2, totalCoin: 200, ...over};
}

test('same gift from one viewer stacks, different gifts stay separate and totals include all types', () => {
  const ledger = new HistoryLedger();
  ledger.reset('123');
  assert.equal(ledger.addGift(gift('g1'), now), true);
  assert.equal(ledger.addGift(gift('g2', {count: 3, totalCoin: 300}), now + 1), true);
  assert.equal(ledger.addGift(gift('g3', {giftId: 101, name: '蛋糕', count: 1, totalCoin: 1000}), now + 2), true);
  assert.equal(ledger.addGift(gift('g4', {uid: '2', user: '观众B', count: 1, totalCoin: 100}), now + 3), true);
  assert.equal(ledger.addGift(gift('g1'), now + 4), false, 'duplicate transaction is not counted twice');
  const snapshot = ledger.snapshot();
  assert.equal(snapshot.room, '123');
  assert.equal(snapshot.viewerCount, 2);
  assert.equal(snapshot.battery, 16);
  const a = snapshot.viewers.find(viewer => viewer.uid === '1');
  assert.equal(a.totalBattery, 15);
  assert.equal(a.items.length, 2);
  const snack = a.items.find(item => item.giftId === '100');
  assert.equal(snack.count, 5);
  assert.equal(snack.battery, 5);
  const cake = a.items.find(item => item.giftId === '101');
  assert.equal(cake.count, 1);
  assert.equal(cake.battery, 10);
  assert.ok(a.items.indexOf(cake) < a.items.indexOf(snack), 'larger gift appears first');
});

test('guard purchases stack only within the same tier and keep months and battery totals', () => {
  const ledger = new HistoryLedger();
  ledger.reset('123');
  const captain = {id: 'b1', key: 'k1', uid: '1', user: '舰长观众', level: 3, count: 1, unit: '月', price: 198000};
  assert.equal(ledger.addGuard(captain, now), true);
  assert.equal(ledger.addGuard({...captain, id: 'b2', key: 'k2', count: 2}, now + 1), true);
  assert.equal(ledger.addGuard({...captain, id: 'b3', key: 'k3', level: 2, price: 1998000}, now + 2), true);
  assert.equal(ledger.addGuard({...captain, id: 'b1', key: 'k1'}, now + 3), false, 'rich-toast duplicate is ignored');
  const snapshot = ledger.snapshot();
  const viewer = snapshot.viewers[0];
  assert.equal(viewer.items.length, 2, 'captain and admiral are not merged');
  assert.equal(viewer.totalBattery, 1980 + 3960 + 19980);
  const tier3 = viewer.items.find(item => item.level === 3);
  assert.equal(tier3.purchases, 2);
  assert.equal(tier3.months, 3);
  assert.equal(tier3.allMonths, true);
  assert.equal(tier3.unit, '月');
  assert.equal(tier3.battery, 5940);
  const tier2 = viewer.items.find(item => item.level === 2);
  assert.equal(tier2.purchases, 1);
  assert.equal(tier2.battery, 19980);
  assert.ok(viewer.items.indexOf(tier2) < viewer.items.indexOf(tier3), 'higher tier appears first');
});

test('Super Chat entries stay individual, preserve the full message and convert price to batteries', () => {
  const ledger = new HistoryLedger();
  ledger.reset('123');
  const message = '第一行\n第二行 <完整留言>';
  ledger.addSC({id: 's1', uid: '1', user: 'SC观众', price: 30, message}, now);
  ledger.addSC({id: 's2', uid: '1', user: 'SC观众', price: 100, message: '第二条'}, now + 1);
  ledger.addSC({id: 's1', uid: '1', user: 'SC观众', price: 30, message}, now + 2);
  const viewer = ledger.snapshot().viewers[0];
  assert.equal(viewer.items.length, 2);
  assert.equal(viewer.items[0].message, message);
  assert.equal(viewer.items[0].battery, 300);
  assert.equal(viewer.items[1].battery, 1000);
  assert.equal(viewer.totalBattery, 1300);
});

test('free/0-battery gifts stay out of the history', () => {
  const ledger = new HistoryLedger();
  ledger.reset('123');
  const free = {id: 'f1', giftId: 100, name: '小心心', uid: '1', user: '观众A', count: 5, coinType: 'silver', unitCoin: 0, totalCoin: 0};
  assert.equal(ledger.addGift(free, now), false);
  assert.equal(ledger.snapshot().viewerCount, 0);
  ledger.addGift(gift('paid'), now + 1);
  assert.equal(ledger.addGift(free, now + 2), false);
  const viewer = ledger.snapshot().viewers[0];
  assert.equal(viewer.items.length, 1);
  assert.equal(viewer.items[0].count, 2);
  assert.equal(viewer.totalBattery, 2);
});

test('empty-UID gift viewers can receive an avatar by name key', () => {
  const ledger = new HistoryLedger();
  ledger.reset('81004');
  ledger.addGift({id: 'g1', giftId: 100, name: '粉丝团灯牌', uid: '', user: '欠***', count: 1, coinType: 'gold', unitCoin: 100, totalCoin: 100}, now);
  assert.equal(ledger.snapshot().viewers[0].avatar, null);
  assert.equal(ledger.updateViewerByKey('name:欠***', {avatar: '/cache/face'}), true);
  const viewer = ledger.snapshot().viewers[0];
  assert.equal(viewer.uid, '');
  assert.equal(viewer.user, '欠***');
  assert.equal(viewer.avatar, '/cache/face');
  assert.equal(ledger.updateViewerByName('欠***', {avatar: '/cache/face'}), false);
});

test('viewer updates replace masked names and attach avatars', () => {
  const ledger = new HistoryLedger();
  ledger.reset('123');
  ledger.addGift(gift('g1', {user: '大***'}), now);
  const before = ledger.snapshot().viewers[0];
  assert.equal(before.user, '大***');
  assert.equal(before.avatar, null);
  assert.equal(ledger.updateViewer('1', {user: '完整昵称', avatar: '/cache/avatar'}), true);
  const after = ledger.snapshot().viewers[0];
  assert.equal(after.user, '完整昵称');
  assert.equal(after.avatar, '/cache/avatar');
  assert.equal(ledger.updateViewer('1', {user: '完整昵称', avatar: '/cache/avatar'}), false);
  const reloaded = new HistoryLedger();
  reloaded.load(ledger.snapshot());
  assert.equal(reloaded.snapshot().viewers[0].avatar, '/cache/avatar');
  assert.equal(reloaded.snapshot().viewers[0].user, '完整昵称');
});

test('a snapshot reloads on the control side and continues aggregating increments', () => {
  const source = new HistoryLedger();
  source.reset('123');
  source.addGift(gift('g1'), now);
  source.addSC({id: 's1', uid: '1', user: '观众A', price: 30, message: '完整留言'}, now + 1);
  source.addGuard({id: 'b1', key: 'k1', uid: '1', user: '观众A', level: 3, count: 1, unit: '月', price: 198000}, now + 2);
  const target = new HistoryLedger();
  target.load(source.snapshot());
  const loaded = target.snapshot();
  assert.equal(loaded.viewerCount, 1);
  assert.equal(loaded.viewers[0].totalBattery, 2 + 300 + 1980);
  assert.equal(loaded.viewers[0].items.find(item => item.kind === 'sc').message, '完整留言');
  assert.equal(loaded.viewers[0].items.find(item => item.kind === 'guard').months, 1);
  target.addGift(gift('g2', {count: 1, totalCoin: 100}), now + 3);
  target.addSC({id: 's2', uid: '1', user: '观众A', price: 50, message: '第二条'}, now + 4);
  const next = target.snapshot();
  assert.equal(next.viewers[0].totalBattery, 2 + 300 + 1980 + 1 + 500);
  assert.equal(next.viewers[0].items.find(item => item.kind === 'gift').count, 3);
  assert.equal(next.viewers[0].items.filter(item => item.kind === 'sc').length, 2);
});

test('simulations are excluded, missing prices stay unknown and reset starts a new room', () => {
  const ledger = new HistoryLedger();
  ledger.reset('123');
  assert.equal(ledger.addGift(gift('demo', {demo: true}), now), false);
  assert.equal(ledger.addGuard({id: 'demo', key: 'demo', demo: true, uid: '1', user: 'A', level: 3, count: 1, price: 198000}, now), false);
  assert.equal(ledger.addSC({id: 'demo', demo: true, uid: '1', user: 'A', price: 30, message: 'x'}, now), false);
  assert.equal(ledger.snapshot().viewerCount, 0);
  ledger.addGuard({id: 'g', key: 'g', uid: '1', user: 'A', level: 3, count: 1, price: null, unit: '月'}, now);
  const unknown = ledger.snapshot();
  assert.equal(unknown.viewers[0].totalBattery, 0);
  assert.equal(unknown.viewers[0].unknownBattery, true);
  assert.equal(unknown.unknownBattery, true);
  ledger.reset('456');
  assert.equal(ledger.snapshot().viewerCount, 0);
  assert.equal(ledger.snapshot().room, '456');
});
