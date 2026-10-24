import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync,brotliCompressSync} from 'node:zlib';
import {defaults,config,normalizeGift,effect,Deduplicator} from '../src/shared/rules.mjs';
import {resources} from '../src/shared/i18n/index.mjs';
import {packet,decode} from '../src/server/protocol.mjs';
import {expandGiftV2} from '../src/server/gift-v2.mjs';
import {sign} from '../src/server/wbi.mjs';
const data={giftId:1,giftName:'原名',uname:'名前',uid:5,num:3,price:100,total_coin:300,coin_type:'gold',tid:'transaction-1'};
test('gift units, original names, free gifts and bounded effects',()=>{const g=normalizeGift({cmd:'SEND_GIFT',data});assert.equal(g.totalCoin,300);assert.equal(g.name,'原名');assert.equal(g.user,'名前');assert.equal(g.count,3);assert.equal(effect({...g,count:10000},defaults).count,40);assert.equal(effect({...g,coinType:'silver'},{...defaults,includeFree:false}).count,0);assert.equal(normalizeGift({cmd:'COMBO_SEND',data}),null);assert.equal(normalizeGift({cmd:'SEND_GIFT',data:{...data,num:-1}}),null);});
test('duplicate transaction rejected and expires',()=>{const d=new Deduplicator();assert.equal(d.accept('a',0),true);assert.equal(d.accept('a',100),false);assert.equal(d.accept('a',300001),true);});
test('minimum unit price is inclusive, not multiplied by quantity, and treats free gifts as zero',()=>{
  const gift=normalizeGift({cmd:'SEND_GIFT',data});
  const cfg={...defaults,minGiftPrice:1};
  assert.equal(effect({...gift,unitCoin:999,count:100,totalCoin:99900},cfg).count,0);
  assert.equal(effect({...gift,unitCoin:1000},cfg).count,3);
  assert.equal(effect({...gift,unitCoin:1001},cfg).count,3);
  assert.equal(effect({...gift,coinType:'silver',unitCoin:10000},cfg).count,0);
  assert.equal(effect({...gift,coinType:'silver'},defaults).count,3);
  assert.equal(effect(gift,{...defaults,minGiftPrice:.1}).count,3);
  assert.equal(config({minGiftPrice:-1}).minGiftPrice,0);
  assert.equal(config({minGiftPrice:Infinity}).minGiftPrice,0);
  assert.equal(config({minGiftPrice:.12345}).minGiftPrice,.123);
  assert.equal(config({language:'ja'},{...cfg}).minGiftPrice,1);
});
test('configuration limits and language-only changes preserve settings',()=>{assert.equal(config({maxObjects:999}).maxObjects,200);assert.equal(config({language:'ja'},{...defaults,room:'123'}).room,'123');assert.equal(config({language:'fr'}).language,defaults.language);});
test('three languages have identical keys and interpolation parameters',()=>{const base=resources.en;for(const r of Object.values(resources)){assert.deepEqual(Object.keys(r).sort(),Object.keys(base).sort());for(const key of Object.keys(base))assert.deepEqual(r[key].match(/\{\w+\}/g),base[key].match(/\{\w+\}/g));}});
test('plain, combined, deflate and brotli websocket frames',()=>{const p=packet(5,{cmd:'SEND_GIFT',data});assert.equal(decode(Buffer.concat([p,p])).length,2);for(const [version,compress]of [[2,deflateSync],[3,brotliCompressSync]]){const h=packet(5,'').subarray(0,16),b=compress(p);h.writeUInt32BE(16+b.length);h.writeUInt16BE(version,6);assert.deepEqual(decode(Buffer.concat([h,b]))[0].data.data,data);}assert.throws(()=>decode(Buffer.from([1,2])));});
function v(n){let value=BigInt(n),out=[];do{const b=Number(value&127n);value>>=7n;out.push(b|(value?128:0));}while(value);return Buffer.from(out);}
function n(field,value){return Buffer.concat([v(field*8),v(value)]);}
function s(field,value){const b=Buffer.isBuffer(value)?value:Buffer.from(value);return Buffer.concat([v(field*8+2),v(b.length),b]);}
test('V2 protobuf batches map to the same gift model and retain image',()=>{const gift=Buffer.concat([n(1,1),s(2,'原名'),n(3,3),n(5,100),n(7,300),s(8,'gold'),s(9,'transaction-1'),s(35,s(1,'https://i0.hdslb.com/test.png'))]);const pb=Buffer.concat([n(1,5),s(2,'名前'),s(10,gift),s(10,gift)]).toString('base64');const messages=expandGiftV2({data:{pb}});assert.equal(messages.length,2);const result=normalizeGift(messages[0]);assert.equal(result.totalCoin,300);assert.equal(result.image,'https://i0.hdslb.com/test.png');assert.equal(result.id,'transaction-1');assert.throws(()=>expandGiftV2({data:{pb:Buffer.from([0]).toString('base64')}}));});
test('WBI signature reference vector',()=>{const q=sign({foo:'114',bar:'514',zab:1919810},'7cd084941338484aae1ad9425b84077c','4932caff0ff746eab6f01bf08b70ac45',1702204169);assert.equal(q,'bar=514&foo=114&wts=1702204169&zab=1919810&w_rid=8f6f2b5b3d485fe1886cec6a0be8c5d4');});


test('gift size scales linearly by total amount, caps and treats free gifts as minimum',()=>{
  const gift=normalizeGift({cmd:'SEND_GIFT',data});
  const cfg={...defaults,minGiftScale:50,maxGiftScale:150,maxGiftScaleAmount:100};
  for(const [total,size] of [[0,40],[25000,60],[50000,80],[100000,120],[200000,120]])
    assert.equal(effect({...gift,totalCoin:total},cfg).size,size);
  assert.equal(effect({...gift,coinType:'silver',totalCoin:200000},cfg).size,40);
  assert.equal(effect({...gift,unitCoin:1000,count:50,totalCoin:50000},cfg).size,80);
  assert.equal(effect(gift,{...cfg,minGiftScale:100,maxGiftScale:100}).size,80);
  assert.equal(effect({...gift,totalCoin:1},{...cfg,maxGiftScaleAmount:.001}).size,120);
});

test('size settings migrate, validate and survive language changes and JSON storage',()=>{
  const migrated=config({gravity:1000});
  assert.equal(migrated.minGiftScale,50);assert.equal(migrated.maxGiftScale,150);assert.equal(migrated.maxGiftScaleAmount,100);
  const saved=config({minGiftScale:75,maxGiftScale:200,maxGiftScaleAmount:25});
  assert.deepEqual(config(JSON.parse(JSON.stringify(saved))),saved);
  assert.deepEqual(config({language:'ja'},saved),{...saved,language:'ja'});
  assert.equal(config({minGiftScale:200,maxGiftScale:50}).maxGiftScale,200);
  assert.equal(config({minGiftScale:-5}).minGiftScale,10);
  assert.equal(config({maxGiftScale:999}).maxGiftScale,400);
  assert.equal(config({maxGiftScaleAmount:0}).maxGiftScaleAmount,.001);
  assert.equal(config({maxGiftScaleAmount:Infinity}).maxGiftScaleAmount,100);
});
