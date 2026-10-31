import {test} from 'node:test';
import assert from 'node:assert/strict';
import {giftDisplayName} from '../src/shared/gift-names.mjs';

test('gift-name dictionary keeps the original and adds translation/reading per language', () => {
  assert.equal(giftDisplayName('辣条', 'zh-CN'), '辣条');
  assert.equal(giftDisplayName('辣条', 'ja'), '辣条（スパイシースナック / ラーティアオ）');
  assert.equal(giftDisplayName('辣条', 'en'), '辣条 (Spicy strip)');
  assert.equal(giftDisplayName('辣条', 'ja', false), '辣条');
  assert.equal(giftDisplayName('未知礼物', 'ja'), '未知礼物');
  assert.equal(giftDisplayName('', 'en'), '');
  assert.equal(giftDisplayName('粉丝团灯牌', 'ja'), '粉丝团灯牌（ファンクラブバッジ / フェンスートゥアン・トンパイ）');
});
