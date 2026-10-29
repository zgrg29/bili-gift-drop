import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Avatars} from '../src/server/avatars.mjs';
import {normalizeGuard} from '../src/shared/guard.mjs';

test('guard keeps UID for missing-avatar lookup',()=>{
  const now=Date.now();
  const item=normalizeGuard({cmd:'GUARD_BUY',data:{uid:2,username:'viewer',guard_level:3,num:1,start_time:Math.floor(now/1000)}},now);
  assert.equal(item.uid,'2');assert.equal(item.avatar,null);
});
test('avatar lookup uses direct image, public fallback, coalesces requests and backs off failures',async()=>{
  const original=globalThis.fetch;let requests=0,release;
  const gate=new Promise(r=>{release=r;});
  const catalog={async cacheImage(url){return url==='https://i0.hdslb.com/avatar.jpg'?'/cache/avatar':null;}};
  try{
    const avatars=new Avatars(catalog);
    globalThis.fetch=async()=>{requests++;await gate;return {ok:true,json:async()=>({code:0,data:{info:{face:'http://i0.hdslb.com/avatar.jpg'}}})};};
    assert.equal(await avatars.resolve('2','http://i0.hdslb.com/avatar.jpg'),'/cache/avatar');assert.equal(requests,0);
    const a=avatars.resolve('2',null),b=avatars.resolve('2',null);release();
    assert.deepEqual(await Promise.all([a,b]),['/cache/avatar','/cache/avatar']);assert.equal(requests,1);
    assert.equal(await avatars.resolve('2',null),'/cache/avatar');assert.equal(requests,1);
    globalThis.fetch=async()=>{requests++;return {ok:true,json:async()=>requests===2?{code:-400}:{code:0,data:{card:{face:'https://i0.hdslb.com/avatar.jpg'}}}};};
    assert.equal(await avatars.resolve('3',null),'/cache/avatar');assert.equal(requests,3);
    globalThis.fetch=async()=>{requests++;throw Error('network');};
    assert.equal(await avatars.resolve('4',null),null);assert.equal(requests,5);
    assert.equal(await avatars.resolve('4',null),null);assert.equal(requests,5);
    assert.equal(await avatars.resolve('../invalid',null),null);assert.equal(requests,5);
  }finally{globalThis.fetch=original;}
});
