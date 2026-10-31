import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ExchangeRates} from '../src/server/exchange.mjs';

const DAY=24*60*60*1000;
const now=1800000000000;

function response(body) {
  return {ok: true, json: async () => body};
}

test('exchange uses the daily provider rate, caches it for a day and exposes its date', async () => {
  const original=globalThis.fetch;let calls=[];
  try {
    globalThis.fetch=async url=>{
      calls.push(url);
      if(url.includes('open.er-api.com'))return response({result:'success',rates:{JPY:20.5},time_last_update_unix:now/1000});
      throw Error('should not reach fallback');
    };
    const exchange=new ExchangeRates();
    const first=await exchange.get(now);
    assert.equal(first.rate,20.5);
    assert.equal(first.rateTime,now);
    assert.equal(first.source,'open.er-api.com');
    assert.equal(first.error,null);
    assert.equal(calls.length,1);
    assert.equal((await exchange.get(now+1000)).rate,20.5);
    assert.equal(calls.length,1,'same-day lookup is cached');
    const next=await exchange.get(now+DAY+1);
    assert.equal(next.rate,20.5);
    assert.equal(calls.length,2,'the next day refreshes');
  } finally {
    globalThis.fetch=original;
  }
});

test('exchange falls back across providers, coalesces concurrent lookups and keeps the last rate on failure', async () => {
  const original=globalThis.fetch;let calls=[];
  try {
    globalThis.fetch=async url=>{
      calls.push(url);
      if(calls.length===2&&url.includes('frankfurter'))return response({rates:{JPY:21.25},date:'2026-10-31'});
      throw Error('unavailable');
    };
    const exchange=new ExchangeRates();
    const [a,b]=await Promise.all([exchange.get(now),exchange.get(now)]);
    assert.equal(a.rate,21.25);
    assert.equal(b.rate,21.25);
    assert.equal(calls.length,2,'one failed primary and one fallback request, not two of each');
    assert.equal(a.source,'frankfurter.app');
    assert.equal(new Date(a.rateTime).toISOString().slice(0,10),'2026-10-31');

    const stale=await exchange.get(now+DAY+1);
    assert.equal(stale.rate,21.25,'the last known rate is retained when every provider fails');
    assert.equal(stale.error,'unavailable');
    const before=calls.length;
    const retry=await exchange.get(now+DAY+2);
    assert.equal(retry.rate,21.25);
    assert.equal(calls.length,before,'failure backs off for five minutes');
  } finally {
    globalThis.fetch=original;
  }
});
