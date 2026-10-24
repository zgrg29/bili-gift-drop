import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crowd,footprint,collisionPairs,region} from '../src/shared/crowd.mjs';
import {defaults,config} from '../src/shared/rules.mjs';
import {Catalog} from '../src/server/catalog.mjs';
const gift={giftId:1,count:1000,coinType:'gold',unitCoin:1000};
function simulation(cfg=defaults){const crowd=new Crowd(),objects=[];return {crowd,objects,tick(now){for(let i=objects.length-1;i>=0;i--)if(objects[i].expires<=now)objects.splice(i,1);return crowd.update(objects,cfg,now,(g,r,box,time)=>objects.push({r,x:box.x+r,y:box.y+r,born:time,expires:time+cfg.lifetime*1000}));}};}
test('1000 gifts: bounded spawn rate, original quantity retained, no stale rain',()=>{
 const s=simulation();s.crowd.enqueue(gift,defaults,0);let peak=0;
 for(let now=0;now<=5000;now+=10){const stats=s.tick(now);peak=Math.max(peak,stats.count);assert.ok(stats.count<=Math.floor(now*12/1000));}
 assert.ok(peak>0&&peak<=18);assert.equal(gift.count,1000);assert.equal(s.crowd.queue.length,0);
 const count=s.objects.length;s.tick(6000);assert.equal(s.objects.length,count);
});
test('sustained storm: pending, count, area and expiry remain bounded',()=>{
 const cfg={...defaults,maxObjects:20,maxCoverage:1};const s=simulation(cfg);let faded=false;
 for(let now=0;now<60000;now+=20){for(let id=0;id<100;id++)s.crowd.enqueue({...gift,giftId:id,unitCoin:100000},cfg,now);const stats=s.tick(now);assert.ok(s.crowd.queue.length<=32);assert.ok(stats.pending<=1280);assert.ok(stats.count<=20);assert.ok(stats.coverage<=1+1e-8);faded ||=s.objects.some(o=>o.expires-o.born<cfg.lifetime*1000);}
 assert.ok(faded);s.crowd.clear();s.objects.length=0;assert.equal(s.tick(61000).pending,0);
});
test('settings shrink applies limits; language preserves active gifts and pending work',()=>{
 const cfg={...defaults};const s=simulation(cfg);s.crowd.enqueue(gift,cfg,0);for(let n=0;n<=1000;n+=20)s.tick(n);
 const before=s.objects.map(o=>o.expires);Object.assign(cfg,config({language:'ja'},cfg));s.tick(1000);assert.deepEqual(s.objects.map(o=>o.expires),before);assert.ok(s.crowd.queue.length);
 Object.assign(cfg,config({regionX:90,regionY:90,regionWidth:100,regionHeight:100,maxCoverage:1},cfg));s.tick(1000);assert.ok(s.objects.reduce((sum,o)=>sum+footprint(o),0)<=region(cfg).w*region(cfg).h*.01);
});
test('minimum price discards pending effects and tiny region can still display a gift',()=>{
 const cfg={...defaults};const s=simulation(cfg);s.crowd.enqueue(gift,cfg,0);cfg.minGiftPrice=2;s.tick(100);assert.equal(s.objects.length,0);assert.equal(s.crowd.queue.length,0);
 const tiny={...defaults,regionWidth:10,regionHeight:10,maxCoverage:1};const t=simulation(tiny);t.crowd.enqueue(gift,tiny,0);t.tick(100);assert.equal(t.objects.length,1);
});
test('spatial grid finds all overlapping pairs once, with fewer checks for spread objects',()=>{
 let seed=7;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 const objects=Array.from({length:200},()=>({x:random()*1920,y:random()*1080,r:20+random()*45}));const pairs=collisionPairs(objects),keys=new Set(pairs.map(p=>p.join(':')));assert.equal(keys.size,pairs.length);assert.ok(pairs.length<200*199/2/4);
 for(let i=0;i<objects.length;i++)for(let j=i+1;j<objects.length;j++)if(Math.hypot(objects[i].x-objects[j].x,objects[i].y-objects[j].y)<objects[i].r+objects[j].r)assert.ok(keys.has(`${i}:${j}`));
});
test('new gift directory refresh shares in-flight work; failure backs off then retries',async()=>{
 const catalog=new Catalog();let calls=0;
 catalog.refresh=async()=>{calls++;catalog.attempted=Date.now();catalog.pending=Promise.resolve().then(()=>catalog.gifts.set(999,{image:'new'}));try{await catalog.pending;}finally{catalog.pending=null;}};
 const results=await Promise.all(Array.from({length:20},()=>catalog.lookup(999,1)));assert.equal(calls,1);assert.ok(results.every(g=>g.image==='new'));
 catalog.refresh=async()=>{calls++;catalog.attempted=Date.now();throw Error('offline');};catalog.attempted=0;await catalog.lookup(1000,1);await catalog.lookup(1000,1);assert.equal(calls,2);catalog.attempted=0;await catalog.lookup(1000,1);assert.equal(calls,3);
});
